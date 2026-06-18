const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");
const net = require("node:net");
const { spawn } = require("node:child_process");
const assert = require("node:assert/strict");

const rootDir = process.cwd();
const distDir = path.join(rootDir, "dist");
const outputDir = path.join(rootDir, ".portfolio-work");
const backendOrigin = new URL("http://127.0.0.1:8000");
const chromePath = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const axeSourcePath = require.resolve("axe-core/axe.min.js");

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
};

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isProxyPath(requestUrl) {
  return (
    requestUrl.startsWith("/api/") ||
    requestUrl.startsWith("/media/") ||
    requestUrl.startsWith("/static/")
  );
}

function proxyRequest(req, res) {
  const target = new URL(req.url, backendOrigin);
  const proxy = http.request(
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
      res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
      proxyRes.pipe(res);
    }
  );

  proxy.on("error", (error) => {
    res.writeHead(502, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: error.message }));
  });

  req.pipe(proxy);
}

async function serveStatic(req, res) {
  const requestUrl = new URL(req.url, "http://127.0.0.1");
  let filePath = path.normalize(decodeURIComponent(requestUrl.pathname));
  if (filePath === path.sep) filePath = "index.html";
  if (filePath.startsWith(path.sep)) filePath = filePath.slice(1);

  const resolvedPath = path.resolve(distDir, filePath);
  const targetPath = resolvedPath.startsWith(distDir)
    ? resolvedPath
    : path.join(distDir, "index.html");

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
    throw new Error("This Node.js runtime does not provide WebSocket.");
  }

  const port = await getFreePort();
  const userDataDir = path.join(os.tmpdir(), `scholarmate-e2e-${Date.now()}`);
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

async function createPageClient(chrome) {
  const response = await fetch(
    `http://127.0.0.1:${chrome.port}/json/new?${encodeURIComponent("about:blank")}`,
    { method: "PUT" }
  );
  if (!response.ok) throw new Error(`Failed to create CDP page: HTTP ${response.status}`);
  const target = await response.json();
  const client = new CdpClient(target.webSocketDebuggerUrl);
  await client.connect();
  return client;
}

async function enablePage(client) {
  await client.send("Page.enable");
  await client.send("Network.enable");
  await client.send("Runtime.enable");
  await client.send("Network.clearBrowserCache");
}

async function navigateAndCollect(client, url) {
  const failedRequests = [];
  const consoleErrors = [];
  let lastNetworkEventAt = Date.now();

  client.on("Runtime.consoleAPICalled", (params) => {
    if (params.type !== "error") return;
    consoleErrors.push(
      params.args?.map((arg) => arg.value ?? arg.description ?? "").join(" ") || ""
    );
  });
  client.on("Network.requestWillBeSent", () => {
    lastNetworkEventAt = Date.now();
  });
  client.on("Network.loadingFinished", () => {
    lastNetworkEventAt = Date.now();
  });
  client.on("Network.loadingFailed", (params) => {
    failedRequests.push({
      url: params.requestId,
      failure: params.errorText || "",
    });
    lastNetworkEventAt = Date.now();
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

async function evaluate(client, expression) {
  const { result } = await client.send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  return result.value;
}

async function getPageSnapshot(client) {
  return evaluate(
    client,
    `(() => {
      const text = document.body.innerText;
      const controlsWithoutNames = [...document.querySelectorAll("button, a, input, textarea, select")]
        .filter((element) => {
          const style = window.getComputedStyle(element);
          if (style.display === "none" || style.visibility === "hidden") return false;
          const childLabels = [...element.querySelectorAll("[aria-label]")]
            .map((child) => child.getAttribute("aria-label"))
            .join(" ");
          const label = element.getAttribute("aria-label")
            || element.getAttribute("title")
            || element.getAttribute("placeholder")
            || element.textContent
            || childLabels
            || element.value
            || "";
          return !String(label).trim();
        })
        .map((element) => element.outerHTML.slice(0, 160));
      const badBlankLinks = [...document.querySelectorAll('a[target="_blank"]')]
        .filter((anchor) => !/noopener/.test(anchor.rel || ""))
        .map((anchor) => anchor.outerHTML.slice(0, 160));
      const duplicateIds = [...document.querySelectorAll("[id]")]
        .map((element) => element.id)
        .filter((id, index, ids) => id && ids.indexOf(id) !== index);
      const imagesWithoutAlt = [...document.querySelectorAll("img")]
        .filter((image) => !image.hasAttribute("alt"))
        .map((image) => image.outerHTML.slice(0, 160));

      return {
        path: location.pathname,
        title: document.title,
        text,
        h1: [...document.querySelectorAll("h1")].map((heading) => heading.textContent.trim()),
        mainCount: document.querySelectorAll("main").length,
        focusableCount: document.querySelectorAll("button, a[href], input, textarea, select").length,
        controlsWithoutNames,
        badBlankLinks,
        duplicateIds: [...new Set(duplicateIds)],
        imagesWithoutAlt,
        hasSearchInput: Boolean(document.querySelector('input[placeholder*="검색"]')),
        loginAutocomplete: {
          username: document.querySelector('input[autocomplete="username"]')?.getAttribute("name") || null,
          password: document.querySelector('input[autocomplete="current-password"]')?.getAttribute("name") || null,
        },
      };
    })()`
  );
}

function assertA11yBasics(snapshot, routeName) {
  assert.equal(
    snapshot.controlsWithoutNames.length,
    0,
    `${routeName}: accessible names missing ${JSON.stringify(snapshot.controlsWithoutNames)}`
  );
  assert.equal(
    snapshot.badBlankLinks.length,
    0,
    `${routeName}: target=_blank links need noopener ${JSON.stringify(snapshot.badBlankLinks)}`
  );
  assert.equal(
    snapshot.duplicateIds.length,
    0,
    `${routeName}: duplicate ids found ${JSON.stringify(snapshot.duplicateIds)}`
  );
  assert.equal(
    snapshot.imagesWithoutAlt.length,
    0,
    `${routeName}: images need alt attributes ${JSON.stringify(snapshot.imagesWithoutAlt)}`
  );
  assert.ok(snapshot.mainCount >= 1, `${routeName}: main landmark is required`);
}

function summarizeAxeViolation(violation) {
  return {
    id: violation.id,
    impact: violation.impact,
    description: violation.description,
    help: violation.help,
    helpUrl: violation.helpUrl,
    nodes: violation.nodes.map((node) => ({
      target: node.target,
      html: node.html,
      failureSummary: node.failureSummary,
    })),
  };
}

async function runAxe(client, routeName, axeSource) {
  await client.send("Runtime.evaluate", {
    expression: axeSource,
    awaitPromise: false,
  });

  const violations = await evaluate(
    client,
    `window.axe.run(document, {
      resultTypes: ["violations"]
    }).then((result) => result.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      description: violation.description,
      help: violation.help,
      helpUrl: violation.helpUrl,
      nodes: violation.nodes.map((node) => ({
        target: node.target,
        html: node.html.slice(0, 300),
        failureSummary: node.failureSummary
      }))
    })))`
  );

  assert.deepEqual(
    violations.map(summarizeAxeViolation),
    [],
    `${routeName}: axe-core violations found`
  );

  return violations;
}

async function runScenario(chrome, baseUrl, scenario, axeSource) {
  const client = await createPageClient(chrome);
  try {
    await enablePage(client);
    await client.send("Emulation.setDeviceMetricsOverride", {
      width: scenario.viewport?.width ?? 1365,
      height: scenario.viewport?.height ?? 768,
      deviceScaleFactor: 1,
      mobile: Boolean(scenario.viewport?.mobile),
    });
    const runtime = await navigateAndCollect(client, `${baseUrl}${scenario.route}`);
    const snapshot = await getPageSnapshot(client);

    assert.equal(runtime.failedRequests.length, 0, `${scenario.name}: failed requests`);
    assert.equal(runtime.consoleErrors.length, 0, `${scenario.name}: console errors`);
    assertA11yBasics(snapshot, scenario.name);
    await scenario.assert(snapshot, client);
    const axeViolations = await runAxe(client, scenario.name, axeSource);

    return {
      name: scenario.name,
      route: scenario.route,
      finalPath: snapshot.path,
      status: "passed",
      focusableCount: snapshot.focusableCount,
      mainCount: snapshot.mainCount,
      axeViolationCount: axeViolations.length,
    };
  } finally {
    await client.send("Page.close").catch(() => {});
    client.close();
  }
}

async function main() {
  await fs.access(path.join(distDir, "index.html"));
  await fs.mkdir(outputDir, { recursive: true });
  const axeSource = await fs.readFile(axeSourcePath, "utf8");

  const server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  const chrome = await startChrome();

  const scenarios = [
    {
      name: "home renders core sections",
      route: "/",
      assert(snapshot) {
        assert.match(snapshot.text, /ScholarMate/);
        assert.match(snapshot.text, /커뮤니티/);
        assert.match(snapshot.text, /공지사항/);
      },
    },
    {
      name: "introduction page renders service overview",
      route: "/introduction",
      assert(snapshot) {
        assert.ok(snapshot.h1.includes("ScholarMate"));
        assert.match(snapshot.text, /AI 기반 개인 맞춤형 장학금 추천 서비스/);
        assert.match(snapshot.text, /기술 스택/);
      },
    },
    {
      name: "notice list renders searchable public page",
      route: "/notice",
      assert(snapshot) {
        assert.ok(snapshot.h1.includes("공지사항"));
        assert.equal(snapshot.hasSearchInput, true);
      },
    },
    {
      name: "protected scholarships route redirects to login",
      route: "/scholarships",
      assert(snapshot) {
        assert.equal(snapshot.path, "/login");
        assert.match(snapshot.text, /로그인/);
      },
    },
    {
      name: "login form exposes autocomplete fields",
      route: "/login",
      assert(snapshot) {
        assert.equal(snapshot.loginAutocomplete.username, "username");
        assert.equal(snapshot.loginAutocomplete.password, "password");
      },
    },
  ];

  try {
    const results = [];
    for (const scenario of scenarios) {
      results.push(await runScenario(chrome, baseUrl, scenario, axeSource));
    }

    const report = {
      measuredAt: new Date().toISOString(),
      tool: "production dist static server + local API proxy + Chrome DevTools Protocol + axe-core E2E/accessibility checks",
      backendOrigin: backendOrigin.origin,
      baseUrl,
      total: results.length,
      passed: results.filter((result) => result.status === "passed").length,
      results,
    };

    await fs.writeFile(
      path.join(outputDir, "e2e-a11y-report.json"),
      JSON.stringify(report, null, 2),
      "utf8"
    );
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await chrome.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
