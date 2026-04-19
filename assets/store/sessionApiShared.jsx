import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

let ExpoConstants = null;
try {
  ExpoConstants = require("expo-constants");
} catch (e) {
  ExpoConstants = null;
}

const ENV_API =
  (typeof process !== "undefined" && process.env && process.env.REACT_APP_API_URL) ||
  (ExpoConstants &&
    (ExpoConstants.manifest?.extra?.REACT_APP_API_URL ||
      ExpoConstants.expoConfig?.extra?.REACT_APP_API_URL)) ||
  null;

const PRODUCTION_API_URL =
  (typeof process !== "undefined" && process.env && process.env.EXPO_PUBLIC_API_URL) ||
  "https://api-ludo-app.onrender.com/api";

const LOCALHOST_API_URL =
  process.env.EXPO_PUBLIC_LOCALHOST_API_URL ||
  "https://lowcostbackendapp-dze4chctcsevdybb.westeurope-01.azurewebsites.net/api";
const ANDROID_API_URL = "http://192.168.178.130:8080/api";

export const API_URL =
  ENV_API || (__DEV__ ? (Platform.OS === "android" ? ANDROID_API_URL : LOCALHOST_API_URL) : PRODUCTION_API_URL);

export const isE2EMode = (() => {
  const envFlag =
    (typeof process !== "undefined" && process?.env?.EXPO_PUBLIC_E2E === "true") ||
    (typeof process !== "undefined" && process?.env?.REACT_APP_E2E === "true");
  const search =
    typeof window !== "undefined" && typeof window?.location?.search === "string"
      ? window.location.search
      : "";
  const queryFlag =
    typeof window !== "undefined" && new URLSearchParams(search).get("e2e") === "1";
  return Boolean(envFlag || queryFlag);
})();

let e2eMatches = [
  {
    id: 5001,
    name: "E2E Match 5001",
    status: "waiting",
    users: [{ id: 9001, name: "E2E Host", isGuest: true }],
  },
];

export const getE2EMatches = () => e2eMatches;
export const setE2EMatches = (matches) => {
  e2eMatches = matches;
};

export const createE2EUser = () => ({
  id: 9002,
  name: "E2E Guest",
  email: "e2e.guest@example.com",
  isGuest: true,
});

export const getE2EUser = async () => {
  const stored = await AsyncStorage.getItem("user");
  if (stored) return JSON.parse(stored);
  return createE2EUser();
};

export const getAuthToken = async (getState) => {
  const stateToken = getState?.()?.auth?.token;
  if (stateToken) return stateToken;
  const storedToken = await AsyncStorage.getItem("token");
  return storedToken || null;
};

export const requireAuthToken = async (getState, rejectWithValue, actionName) => {
  const token = await getAuthToken(getState);
  if (!token) {
    if (__DEV__) {
      console.warn(`[auth] Missing token for protected request: ${actionName}`);
    }
    return { error: rejectWithValue("Authentication required") };
  }
  return { token };
};
