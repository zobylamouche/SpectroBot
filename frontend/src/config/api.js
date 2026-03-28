const envBackendUrl = process.env.REACT_APP_BACKEND_URL;
const isBrowser = typeof window !== "undefined";
const host = isBrowser ? window.location.hostname : "localhost";
const protocol = isBrowser ? window.location.protocol : "http:";
const isRemoteHost = host !== "localhost" && host !== "127.0.0.1";
const envUsesLocalhost = typeof envBackendUrl === "string" && envBackendUrl.includes("localhost");

const BACKEND_URL = envUsesLocalhost && isRemoteHost
	? `${protocol}//${host}:8001`
	: (envBackendUrl || "http://localhost:8001");

export { BACKEND_URL };
export const API_BASE = `${BACKEND_URL}/api`;
