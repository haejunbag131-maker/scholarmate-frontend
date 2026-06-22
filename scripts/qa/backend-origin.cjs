const fs = require("node:fs");
const path = require("node:path");

function stripQuotes(value) {
  const trimmed = String(value || "").trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function loadDotEnv(rootDir = process.cwd()) {
  const envPath = path.join(rootDir, ".env");
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    if (process.env[key] != null) continue;
    process.env[key] = stripQuotes(rawValue);
  }
}

function isHttpUrl(value) {
  return /^https?:\/\//i.test(String(value || "").trim());
}

function getBackendOrigin(rootDir = process.cwd()) {
  loadDotEnv(rootDir);

  const candidates = [
    process.env.BACKEND_ORIGIN,
    process.env.VITE_API_PROXY_TARGET,
    isHttpUrl(process.env.VITE_API_BASE_URL) ? process.env.VITE_API_BASE_URL : "",
    "http://127.0.0.1:8000",
  ];
  const rawOrigin = candidates.find((value) => String(value || "").trim());
  const backendOrigin = new URL(rawOrigin);

  if (!["http:", "https:"].includes(backendOrigin.protocol)) {
    throw new Error(`BACKEND_ORIGIN must be an http(s) URL: ${rawOrigin}`);
  }

  return backendOrigin;
}

module.exports = { getBackendOrigin };
