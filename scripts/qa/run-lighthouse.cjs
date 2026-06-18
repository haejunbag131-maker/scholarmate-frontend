const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");
const net = require("node:net");
const { spawn } = require("node:child_process");

const rootDir = process.cwd();
const distDir = path.join(rootDir, "dist");
const outputDir = path.join(rootDir, ".portfolio-work");
const backendOrigin = new URL("http://127.0.0.1:8000");
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
  const port = await getFreePort();
  const userDataDir = path.join(os.tmpdir(), `scholarmate-lighthouse-${Date.now()}`);
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

function score(category) {
  return Math.round((category?.score ?? 0) * 100);
}

function metric(audit) {
  return audit?.numericValue ?? null;
}

function summarize(lhr) {
  return {
    url: lhr.finalDisplayedUrl,
    scores: {
      performance: score(lhr.categories.performance),
      accessibility: score(lhr.categories.accessibility),
      bestPractices: score(lhr.categories["best-practices"]),
      seo: score(lhr.categories.seo),
    },
    metrics: {
      fcpMs: metric(lhr.audits["first-contentful-paint"]),
      lcpMs: metric(lhr.audits["largest-contentful-paint"]),
      cls: metric(lhr.audits["cumulative-layout-shift"]),
      tbtMs: metric(lhr.audits["total-blocking-time"]),
      speedIndexMs: metric(lhr.audits["speed-index"]),
    },
    failedAudits: Object.values(lhr.audits)
      .filter((audit) => audit.score !== null && audit.score !== 1)
      .filter((audit) => audit.scoreDisplayMode !== "notApplicable")
      .map((audit) => ({
        id: audit.id,
        title: audit.title,
        score: audit.score,
      })),
  };
}

async function runLighthouse(lighthouse, chrome, baseUrl, target) {
  const result = await lighthouse(`${baseUrl}${target.route}`, {
    port: chrome.port,
    output: "json",
    logLevel: "error",
    onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
    throttlingMethod: "provided",
    formFactor: target.formFactor,
    screenEmulation: target.screenEmulation,
  });

  const summary = {
    name: target.name,
    route: target.route,
    formFactor: target.formFactor,
    ...summarize(result.lhr),
  };

  return {
    summary,
    report: JSON.parse(result.report),
  };
}

async function main() {
  await fs.access(path.join(distDir, "index.html"));
  await fs.mkdir(outputDir, { recursive: true });

  const { default: lighthouse } = await import("lighthouse");
  const server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  const chrome = await startChrome();

  const targets = [
    {
      name: "home desktop",
      route: "/",
      formFactor: "desktop",
      screenEmulation: {
        mobile: false,
        width: 1365,
        height: 768,
        deviceScaleFactor: 1,
        disabled: false,
      },
    },
    {
      name: "home mobile",
      route: "/",
      formFactor: "mobile",
      screenEmulation: {
        mobile: true,
        width: 390,
        height: 844,
        deviceScaleFactor: 2,
        disabled: false,
      },
    },
  ];

  try {
    const runs = [];
    const reports = {};
    for (const target of targets) {
      const { summary, report } = await runLighthouse(lighthouse, chrome, baseUrl, target);
      runs.push(summary);
      reports[target.name] = report;
    }

    const output = {
      measuredAt: new Date().toISOString(),
      tool: "Lighthouse production dist audit with local API proxy",
      backendOrigin: backendOrigin.origin,
      baseUrl,
      runs,
    };

    await fs.writeFile(
      path.join(outputDir, "lighthouse-summary.json"),
      JSON.stringify(output, null, 2),
      "utf8"
    );
    await fs.writeFile(
      path.join(outputDir, "lighthouse-report.json"),
      JSON.stringify(reports, null, 2),
      "utf8"
    );

    console.log(JSON.stringify(output, null, 2));
  } finally {
    await chrome.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
