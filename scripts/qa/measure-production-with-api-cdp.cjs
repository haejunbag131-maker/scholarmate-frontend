const http = require("node:http");
const https = require("node:https");
const fs = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");
const net = require("node:net");
const { spawn } = require("node:child_process");
const { getBackendOrigin } = require("./backend-origin.cjs");

const rootDir = process.cwd();
const distDir = path.join(rootDir, "dist");
const outputDir = path.join(rootDir, ".portfolio-work");
const backendOrigin = getBackendOrigin(rootDir);
const chromePath = "C:/Program Files/Google/Chrome/Application/chrome.exe";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
};

function optionalPublicFallback(requestUrl, method = "GET") {
  if (method !== "GET") return null;

  const url = new URL(requestUrl, "http://127.0.0.1");
  if (url.pathname === "/api/community/posts/" || url.pathname === "/api/notices/") {
    return { results: [] };
  }

  return null;
}

function sendJson(res, statusCode, body, headers = {}) {
  res.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    ...headers,
  });
  res.end(JSON.stringify(body));
}

function isProxyPath(requestUrl) {
  return (
    requestUrl.startsWith("/api/") ||
    requestUrl.startsWith("/media/") ||
    requestUrl.startsWith("/static/")
  );
}

function proxyRequest(req, res) {
  const fallback = optionalPublicFallback(req.url || "", req.method);
  const target = new URL(req.url, backendOrigin);
  const transport = target.protocol === "https:" ? https : http;
  let responded = false;

  const sendFallback = () => {
    if (!fallback || responded) return false;
    responded = true;
    sendJson(res, 200, fallback, { "x-scholarmate-api-fallback": "1" });
    return true;
  };

  const proxy = transport.request(
    {
      hostname: target.hostname,
      port: target.port,
      path: `${target.pathname}${target.search}`,
      method: req.method,
      headers: {
        ...req.headers,
        host: backendOrigin.host,
      },
    },
    (proxyRes) => {
      if ((proxyRes.statusCode || 502) >= 500 && sendFallback()) {
        proxyRes.resume();
        return;
      }

      responded = true;
      res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
      proxyRes.pipe(res);
    }
  );

  proxy.on("error", (error) => {
    if (responded) return;
    if (sendFallback()) return;
    responded = true;
    sendJson(res, 502, { error: error.message });
  });

  proxy.setTimeout(5000, () => {
    proxy.destroy(new Error("Proxy request timed out"));
  });

  req.pipe(proxy);
}

async function serveStatic(req, res) {
  const requestUrl = new URL(req.url, "http://127.0.0.1");
  let filePath = path.normalize(decodeURIComponent(requestUrl.pathname));
  if (filePath === path.sep) filePath = "index.html";
  if (filePath.startsWith(path.sep)) filePath = filePath.slice(1);

  const resolvedPath = path.resolve(distDir, filePath);
  const isInsideDist = resolvedPath.startsWith(distDir);
  const targetPath = isInsideDist ? resolvedPath : path.join(distDir, "index.html");

  try {
    const stat = await fs.stat(targetPath);
    const finalPath = stat.isDirectory() ? path.join(targetPath, "index.html") : targetPath;
    const body = await fs.readFile(finalPath);
    const ext = path.extname(finalPath).toLowerCase();
    res.writeHead(200, {
      "content-type": mimeTypes[ext] || "application/octet-stream",
      "cache-control": "no-store",
    });
    res.end(body);
  } catch {
    const fallback = await fs.readFile(path.join(distDir, "index.html"));
    res.writeHead(200, {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    });
    res.end(fallback);
  }
}

function createServer() {
  return http.createServer((req, res) => {
    if (isProxyPath(req.url || "")) {
      proxyRequest(req, res);
      return;
    }

    serveStatic(req, res).catch((error) => {
      res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
      res.end(error.stack || error.message);
    });
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function median(values) {
  const nums = values.filter(Number.isFinite).sort((a, b) => a - b);
  return nums.length ? nums[Math.floor(nums.length / 2)] : null;
}

async function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, "127.0.0.1", () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
    server.on("error", reject);
  });
}

async function waitForJson(url, timeoutMs = 15000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
    } catch {
      // Chrome may still be starting.
    }
    await delay(100);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function startChrome() {
  if (typeof WebSocket === "undefined") {
    throw new Error("This Node.js runtime does not provide a WebSocket implementation.");
  }

  const port = await getFreePort();
  const userDataDir = path.join(os.tmpdir(), `scholarmate-cdp-${Date.now()}`);
  await fs.mkdir(userDataDir, { recursive: true });

  const chrome = spawn(
    chromePath,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${userDataDir}`,
      "about:blank",
    ],
    { stdio: ["ignore", "ignore", "pipe"] }
  );

  chrome.stderr.on("data", () => {});
  await waitForJson(`http://127.0.0.1:${port}/json/version`);

  return {
    port,
    async close() {
      chrome.kill("SIGTERM");
      await delay(300);
      await fs.rm(userDataDir, { recursive: true, force: true }).catch(() => {});
    },
  };
}

class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    this.ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) reject(new Error(message.error.message));
        else resolve(message.result || {});
        return;
      }

      const handlers = this.listeners.get(message.method) || [];
      for (const handler of handlers) handler(message.params || {});
    });

    await new Promise((resolve, reject) => {
      this.ws.addEventListener("open", resolve, { once: true });
      this.ws.addEventListener("error", reject, { once: true });
    });
  }

  on(eventName, handler) {
    const handlers = this.listeners.get(eventName) || [];
    handlers.push(handler);
    this.listeners.set(eventName, handlers);
  }

  send(method, params = {}) {
    const id = this.nextId;
    this.nextId += 1;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
    });
  }

  close() {
    this.ws?.close();
  }
}

async function createPageClient(chrome, url = "about:blank") {
  const response = await fetch(
    `http://127.0.0.1:${chrome.port}/json/new?${encodeURIComponent(url)}`,
    { method: "PUT" }
  );
  if (!response.ok) {
    throw new Error(`Failed to create CDP page: HTTP ${response.status}`);
  }
  const target = await response.json();
  const client = new CdpClient(target.webSocketDebuggerUrl);
  await client.connect();
  return client;
}

async function waitForNetworkIdle(client, url) {
  const requests = new Map();
  const failedRequests = [];
  const consoleErrors = [];
  let lastNetworkEventAt = Date.now();

  client.on("Runtime.consoleAPICalled", (params) => {
    if (params.type !== "error") return;
    consoleErrors.push(
      params.args?.map((arg) => arg.value ?? arg.description ?? "").join(" ") || ""
    );
  });
  client.on("Network.requestWillBeSent", (params) => {
    requests.set(params.requestId, params.request?.url || "");
    lastNetworkEventAt = Date.now();
  });
  client.on("Network.loadingFinished", () => {
    lastNetworkEventAt = Date.now();
  });
  client.on("Network.loadingFailed", (params) => {
    const requestUrl = requests.get(params.requestId) || "";
    failedRequests.push({
      url: requestUrl,
      failure: params.errorText || "",
    });
    lastNetworkEventAt = Date.now();
  });

  await client.send("Page.enable");
  await client.send("Network.enable");
  await client.send("Runtime.enable");
  await client.send("Network.clearBrowserCache");
  await client.send("Page.addScriptToEvaluateOnNewDocument", {
    source: `
      window.__webVitals = { lcp: null, cls: 0, clsEntries: [], longTasks: [] };
      const selectorFor = (node) => {
        if (!node || node.nodeType !== Node.ELEMENT_NODE) return "";
        const element = node;
        const tag = element.tagName.toLowerCase();
        const id = element.id ? "#" + element.id : "";
        const classes = [...element.classList].slice(0, 4).map((name) => "." + name).join("");
        const text = (element.textContent || "").replace(/\\s+/g, " ").trim().slice(0, 60);
        return tag + id + classes + (text ? " :: " + text : "");
      };
      const rectFor = (rect) => rect ? ({
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        left: rect.left,
      }) : null;
      try {
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          window.__webVitals.lcp = lastEntry?.startTime ?? null;
        }).observe({ type: "largest-contentful-paint", buffered: true });
      } catch {}
      try {
        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!entry.hadRecentInput) {
              window.__webVitals.cls += entry.value;
              window.__webVitals.clsEntries.push({
                value: entry.value,
                startTime: entry.startTime,
                sources: (entry.sources || []).map((source) => ({
                  node: selectorFor(source.node),
                  previousRect: rectFor(source.previousRect),
                  currentRect: rectFor(source.currentRect),
                })),
              });
            }
          }
        }).observe({ type: "layout-shift", buffered: true });
      } catch {}
      try {
        new PerformanceObserver((entryList) => {
          window.__webVitals.longTasks.push(
            ...entryList.getEntries().map((entry) => entry.duration)
          );
        }).observe({ type: "longtask", buffered: true });
      } catch {}
    `,
  });

  const loadPromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`Navigation timeout: ${url}`)), 45000);
    client.on("Page.loadEventFired", () => {
      clearTimeout(timeout);
      resolve();
    });
  });

  await client.send("Page.navigate", { url });
  await loadPromise;

  const waitStartedAt = Date.now();
  while (Date.now() - waitStartedAt < 5000) {
    if (Date.now() - lastNetworkEventAt >= 1000) break;
    await delay(100);
  }

  return { failedRequests, consoleErrors };
}

async function evaluateMetrics(client) {
  const expression = `(() => {
    const navigation = performance.getEntriesByType("navigation")[0];
    const resources = performance.getEntriesByType("resource").map((entry) => ({
      name: entry.name,
      initiatorType: entry.initiatorType,
      transferSize: entry.transferSize || 0,
      encodedBodySize: entry.encodedBodySize || 0,
      decodedBodySize: entry.decodedBodySize || 0,
      duration: entry.duration || 0,
      startTime: entry.startTime || 0,
      responseEnd: entry.responseEnd || 0,
    }));
    const paints = Object.fromEntries(
      performance.getEntriesByType("paint").map((entry) => [entry.name, entry.startTime])
    );
    const apiResources = resources.filter((resource) => resource.name.includes("/api/"));
    const longTasks = window.__webVitals?.longTasks || [];

    return {
      domContentLoaded: navigation.domContentLoadedEventEnd,
      loadEventEnd: navigation.loadEventEnd,
      firstPaint: paints["first-paint"] ?? null,
      firstContentfulPaint: paints["first-contentful-paint"] ?? null,
      largestContentfulPaint: window.__webVitals?.lcp ?? null,
      cumulativeLayoutShift: window.__webVitals?.cls ?? null,
      cumulativeLayoutShiftEntries: window.__webVitals?.clsEntries ?? [],
      totalBlockingTimeApprox: longTasks.reduce(
        (sum, duration) => sum + Math.max(0, duration - 50),
        0
      ),
      resourceCount: resources.length,
      apiRequestCount: apiResources.length,
      apiDurationTotal: apiResources.reduce((sum, resource) => sum + resource.duration, 0),
      apiDurationMax: apiResources.reduce((max, resource) => Math.max(max, resource.duration), 0),
      totalEncodedBodySize: resources.reduce((sum, resource) => sum + resource.encodedBodySize, 0),
      jsEncodedBodySize: resources
        .filter((resource) => resource.name.includes("/assets/") && resource.name.endsWith(".js"))
        .reduce((sum, resource) => sum + resource.encodedBodySize, 0),
      cssEncodedBodySize: resources
        .filter((resource) => resource.name.includes("/assets/") && resource.name.endsWith(".css"))
        .reduce((sum, resource) => sum + resource.encodedBodySize, 0),
      imageEncodedBodySize: resources
        .filter((resource) => /\\.(png|jpe?g|webp|gif|svg)(\\?|$)/i.test(resource.name))
        .reduce((sum, resource) => sum + resource.encodedBodySize, 0),
      apiResources: apiResources.map((resource) => ({
        path: new URL(resource.name).pathname,
        duration: Math.round(resource.duration),
        encodedBodySize: resource.encodedBodySize,
      })),
      largestResources: resources
        .slice()
        .sort((a, b) => b.encodedBodySize - a.encodedBodySize)
        .slice(0, 12)
        .map((resource) => ({
          path: new URL(resource.name).pathname,
          initiatorType: resource.initiatorType,
          encodedBodySize: resource.encodedBodySize,
          duration: Math.round(resource.duration),
        })),
    };
  })()`;
  const { result } = await client.send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  return result.value;
}

async function measurePage(chrome, baseUrl, route, viewport) {
  const runs = [];
  for (let index = 0; index < 5; index += 1) {
    const client = await createPageClient(chrome);
    try {
      await client.send("Emulation.setDeviceMetricsOverride", {
        width: viewport.width,
        height: viewport.height,
        deviceScaleFactor: 1,
        mobile: viewport.width < 640,
      });
      const { failedRequests, consoleErrors } = await waitForNetworkIdle(
        client,
        `${baseUrl}${route}`
      );
      const metrics = await evaluateMetrics(client);
      runs.push({
        run: index + 1,
        ...metrics,
        failedRequestCount: failedRequests.length,
        failedRequests: failedRequests.slice(0, 20),
        consoleErrorCount: consoleErrors.length,
        consoleErrors: consoleErrors.slice(0, 20),
      });
    } finally {
      await client.send("Page.close").catch(() => {});
      client.close();
    }
  }

  const keys = [
    "domContentLoaded",
    "loadEventEnd",
    "firstPaint",
    "firstContentfulPaint",
    "largestContentfulPaint",
    "cumulativeLayoutShift",
    "totalBlockingTimeApprox",
    "resourceCount",
    "apiRequestCount",
    "apiDurationTotal",
    "apiDurationMax",
    "totalEncodedBodySize",
    "jsEncodedBodySize",
    "cssEncodedBodySize",
    "imageEncodedBodySize",
    "failedRequestCount",
    "consoleErrorCount",
  ];

  return {
    route,
    viewport,
    samples: runs.length,
    summary: Object.fromEntries(keys.map((key) => [key, median(runs.map((run) => run[key]))])),
    runs,
  };
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true });
  const server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  const chrome = await startChrome();

  try {
    const desktopViewport = { width: 1365, height: 768 };
    const mobileViewport = { width: 390, height: 844 };
    const results = {
      measuredAt: new Date().toISOString(),
      tool: "production dist static server + local API proxy + Chrome DevTools Protocol + Chrome Performance APIs",
      backendOrigin: backendOrigin.origin,
      baseUrl,
      pages: [
        await measurePage(chrome, baseUrl, "/", desktopViewport),
        await measurePage(chrome, baseUrl, "/", mobileViewport),
        await measurePage(chrome, baseUrl, "/notice", desktopViewport),
        await measurePage(chrome, baseUrl, "/introduction", desktopViewport),
      ],
    };
    const summary = results.pages.map((page) => ({
      route: page.route,
      viewport: `${page.viewport.width}x${page.viewport.height}`,
      summary: page.summary,
    }));

    await fs.writeFile(
      path.join(outputDir, "performance-live-api.json"),
      JSON.stringify(results, null, 2),
      "utf8"
    );
    await fs.writeFile(
      path.join(outputDir, "performance-live-summary.json"),
      JSON.stringify(summary, null, 2),
      "utf8"
    );
    console.log(JSON.stringify(summary, null, 2));
  } finally {
    await chrome.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
