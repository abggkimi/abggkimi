import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import MarkdownIt from "markdown-it";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const README = join(ROOT, "README.md");

const HOST = process.env.HOST ?? "0.0.0.0";
const PORT = Number(process.env.PORT ?? 3000);

const md = new MarkdownIt({ html: true, linkify: true, typographer: true });

function page(bodyHtml) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Profile README preview</title>
  <style>
    :root { color-scheme: light dark; }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      line-height: 1.6;
      background: #f6f8fa;
      color: #1f2328;
    }
    main {
      max-width: 860px;
      margin: 32px auto;
      padding: 32px;
      background: #ffffff;
      border: 1px solid #d0d7de;
      border-radius: 12px;
    }
    h1, h2 { border-bottom: 1px solid #d0d7de; padding-bottom: .3em; }
    code { background: rgba(175,184,193,.2); padding: .2em .4em; border-radius: 6px; }
    pre code { display: block; padding: 16px; overflow: auto; }
    .meta { max-width: 860px; margin: 0 auto; padding: 0 32px; color: #656d76; font-size: 14px; }
  </style>
</head>
<body>
  <p class="meta">Live preview of <code>README.md</code> &middot; reloads on each request</p>
  <main>${bodyHtml}</main>
</body>
</html>`;
}

const server = createServer(async (req, res) => {
  if (req.url === "/healthz") {
    res.writeHead(200, { "content-type": "text/plain" });
    res.end("ok");
    return;
  }
  try {
    const source = await readFile(README, "utf8");
    const rendered = md.render(source) || "<p><em>README.md is empty.</em></p>";
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(page(rendered));
  } catch (err) {
    res.writeHead(500, { "content-type": "text/plain" });
    res.end(`Failed to render README.md: ${err.message}`);
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Profile README preview running at http://${HOST}:${PORT}`);
});
