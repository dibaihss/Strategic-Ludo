const http = require('node:http');
const { execFileSync, spawn } = require('node:child_process');
const httpProxy = require('http-proxy');

const publicPort = Number(process.env.PLAYWRIGHT_PUBLIC_PORT || 19006);
const expoPort = Number(process.env.PLAYWRIGHT_EXPO_PORT || 19007);
const isWindows = process.platform === 'win32';

const apiTargetUrl = new URL(
  process.env.PLAYWRIGHT_PROXY_API_TARGET ||
    process.env.EXPO_PUBLIC_LOCALHOST_API_URL ||
    'http://localhost:3000/api'
);

const wsTargetUrl = new URL(
  process.env.PLAYWRIGHT_PROXY_WS_TARGET ||
    process.env.EXPO_PUBLIC_LOCALHOST_WS_URL ||
    'http://localhost:3000'
);

const expoTarget = `http://127.0.0.1:${expoPort}`;
const apiTargetOrigin = apiTargetUrl.origin;
const wsTargetOrigin = wsTargetUrl.origin;
const apiBasePath = apiTargetUrl.pathname === '/' ? '' : apiTargetUrl.pathname.replace(/\/$/, '');
const wsBasePath = wsTargetUrl.pathname === '/' ? '' : wsTargetUrl.pathname.replace(/\/$/, '');

let expoReady = false;

const proxy = httpProxy.createProxyServer({
  changeOrigin: true,
  ws: true,
  xfwd: true,
});

const isHttpResponse = (value) => typeof value?.writeHead === 'function' && typeof value?.end === 'function';
const isSocketLike = (value) => typeof value?.destroy === 'function';

proxy.on('error', (error, req, res) => {
  const message = `Proxy error for ${req?.url || 'unknown request'}: ${error?.message || '<no message>'}`;
  console.error(message);

  if (isHttpResponse(res)) {
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
    }
    res.end(JSON.stringify({ error: 'proxy_error', message }));
    return;
  }

  if (isSocketLike(res)) {
    res.destroy();
  }
});

const rewritePath = (requestUrl, externalBasePath) => {
  const incomingUrl = new URL(requestUrl, `http://127.0.0.1:${publicPort}`);
  const nextPath = incomingUrl.pathname.replace(/^\/api/, '') || '/';
  incomingUrl.pathname = `${externalBasePath}${nextPath}` || '/';
  return incomingUrl.pathname + incomingUrl.search;
};

const getListeningPidsForPort = (port) => {
  if (!isWindows) {
    return [];
  }

  try {
    const output = execFileSync('netstat', ['-ano', '-p', 'tcp'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });

    return [...new Set(
      output
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.includes(`:${port}`) && /\bLISTENING\b/i.test(line))
        .map((line) => line.split(/\s+/).pop())
        .filter((pid) => pid && pid !== '0' && pid !== String(process.pid))
    )];
  } catch (error) {
    console.warn(`Failed to inspect listeners on port ${port}: ${error.message}`);
    return [];
  }
};

const freePortIfBusy = (port, label) => {
  const pids = getListeningPidsForPort(port);

  if (pids.length === 0) {
    return;
  }

  console.warn(`${label} port ${port} is busy. Killing PID(s): ${pids.join(', ')}`);

  for (const pid of pids) {
    try {
      execFileSync('taskkill', ['/PID', pid, '/T', '/F'], {
        stdio: 'inherit',
      });
    } catch (error) {
      console.warn(`Failed to kill PID ${pid} on port ${port}: ${error.message}`);
    }
  }
};

const isExpoReady = () =>
  new Promise((resolve) => {
    const probe = http.get(`${expoTarget}/`, (response) => {
      response.resume();
      resolve(response.statusCode >= 200 && response.statusCode < 500);
    });

    probe.on('error', () => resolve(false));
    probe.setTimeout(1000, () => {
      probe.destroy();
      resolve(false);
    });
  });

const spawnCommand = process.platform === 'win32' ? 'cmd.exe' : 'sh';
const spawnArgs = process.platform === 'win32'
  ? ['/d', '/s', '/c', `npx expo start --web --port ${expoPort}`]
  : ['-lc', `npx expo start --web --port ${expoPort}`];

freePortIfBusy(publicPort, 'Playwright proxy');
freePortIfBusy(expoPort, 'Expo web');

const expoProcess = spawn(spawnCommand, spawnArgs, {
  cwd: process.cwd(),
  stdio: 'inherit',
  env: {
    ...process.env,
    CI: process.env.CI || '1',
    EXPO_PUBLIC_E2E: 'false',
    EXPO_PUBLIC_PLAYWRIGHT_REAL_BACKEND: 'true',
    EXPO_PUBLIC_PLAYWRIGHT_API_URL: process.env.EXPO_PUBLIC_PLAYWRIGHT_API_URL || '/api',
    EXPO_PUBLIC_PLAYWRIGHT_WS_URL:
      process.env.EXPO_PUBLIC_PLAYWRIGHT_WS_URL || `http://127.0.0.1:${publicPort}`,
  },
});

const waitForExpoReady = async () => {
  while (!expoProcess.killed) {
    if (await isExpoReady()) {
      expoReady = true;
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
};

const server = http.createServer((req, res) => {
  const requestUrl = req.url || '/';

  if (requestUrl === '/__playwright_ready') {
    res.writeHead(expoReady ? 200 : 503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ready: expoReady }));
    return;
  }

  const isApiRequest = requestUrl === '/api' || requestUrl.startsWith('/api/');
  const target = isApiRequest ? apiTargetOrigin : expoTarget;

  if (!expoReady && !isApiRequest) {
    res.writeHead(503, { 'Content-Type': 'text/plain' });
    res.end('Expo web is still starting');
    return;
  }

  if (isApiRequest) {
    req.url = rewritePath(requestUrl, apiBasePath);
  }

  proxy.web(req, res, { target });
});

server.on('upgrade', (req, socket, head) => {
  const requestUrl = req.url || '/';
  const isSocketRequest = requestUrl.startsWith('/socket.io');

  if (!expoReady && !isSocketRequest) {
    socket.destroy();
    return;
  }

  if (isSocketRequest) {
    const incomingUrl = new URL(requestUrl, `http://127.0.0.1:${publicPort}`);
    incomingUrl.pathname = `${wsBasePath}${incomingUrl.pathname}`;
    req.url = incomingUrl.pathname + incomingUrl.search;
    proxy.ws(req, socket, head, { target: wsTargetOrigin });
    return;
  }

  proxy.ws(req, socket, head, { target: expoTarget });
});

const shutdown = (signal) => {
  server.close(() => {
    if (!expoProcess.killed) {
      expoProcess.kill(signal);
    }
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

expoProcess.on('exit', (code) => {
  server.close(() => process.exit(code ?? 0));
});

waitForExpoReady().catch((error) => {
  console.error(`Failed while waiting for Expo readiness: ${error.message}`);
  process.exit(1);
});

server.listen(publicPort, '127.0.0.1', () => {
  console.log(`Playwright proxy listening on http://127.0.0.1:${publicPort}`);
  console.log(`Forwarding app traffic to ${expoTarget}`);
  console.log(`Forwarding API traffic to ${apiTargetOrigin}${apiBasePath}`);
  console.log(`Forwarding WebSocket traffic to ${wsTargetOrigin}${wsBasePath}`);
});