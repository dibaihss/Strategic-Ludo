# Branch protection required for deploy gating

Because deployment configuration exists in `.eas/workflows/deploy.yml`, repository branch
protection must enforce CI success before any code can reach `main`.

Configure branch protection (or rulesets) for `main` with:

1. **Require a pull request before merging**
2. **Require status checks to pass before merging**
3. Add **`CI`** as a required status check
4. **Restrict who can push** directly to `main` (optional but recommended)

With this in place, the GitHub Actions release workflow (`workflow_run` on `CI`) only sees
successful CI runs on protected `main`, and deploy cannot proceed unless CI passed.
