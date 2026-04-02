import http from "http";
import { readFile, stat } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 4177);

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

function resolvePath(urlPath) {
  const cleanPath = decodeURIComponent((urlPath || "/").split("?")[0]);
  const requested = cleanPath === "/" ? "/index.html" : cleanPath;
  const absolute = path.resolve(__dirname, `.${requested}`);
  if (!absolute.startsWith(__dirname)) return null;
  return absolute;
}

const server = http.createServer(async (req, res) => {
  try {
    const targetPath = resolvePath(req.url || "/");
    if (!targetPath) {
      res.writeHead(403);
      res.end("Acesso negado.");
      return;
    }

    const fileStat = await stat(targetPath);
    const finalPath = fileStat.isDirectory() ? path.join(targetPath, "index.html") : targetPath;
    const ext = path.extname(finalPath).toLowerCase();
    const body = await readFile(finalPath);

    res.writeHead(200, {
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Arquivo nao encontrado.");
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`iBob localhost rodando em http://localhost:${PORT}`);
});
