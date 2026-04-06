import http from "http";
import { readFile, stat } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 4177);
const STORE_ID = "1035972";
const STORE_SEARCH_BASE = "https://loja.ibob.com.br/loja/busca.php";
const SALES_WHATSAPP_NUMBER = "555499860667";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
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

function getCacheControl(ext) {
  if (ext === ".html" || ext === ".xml" || ext === ".txt") {
    return "no-cache";
  }

  if ([
    ".css",
    ".js",
    ".svg",
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".ico",
    ".pdf",
    ".mp4",
  ].includes(ext)) {
    return "public, max-age=86400";
  }

  return "no-cache";
}

function buildStoreSearchUrl(query) {
  const searchParams = new URLSearchParams({
    loja: STORE_ID,
    palavra_busca: query,
  });

  return `${STORE_SEARCH_BASE}?${searchParams.toString()}`;
}

function buildWhatsAppUrl(query) {
  const message = `Olá! Não encontrei "${query}" na loja online. Podem me ajudar a localizar esse item?`;
  return `https://wa.me/${SALES_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

async function getSearchRedirect(query) {
  const searchUrl = buildStoreSearchUrl(query);

  try {
    const response = await fetch(searchUrl, {
      headers: {
        "User-Agent": "iBob Search Redirect",
      },
    });

    const raw = Buffer.from(await response.arrayBuffer()).toString("latin1");
    const hasNoResults = /Produto n(?:ao|ão) encontrado|sem-resultados-na-busca/i.test(raw);
    return hasNoResults ? buildWhatsAppUrl(query) : searchUrl;
  } catch {
    return searchUrl;
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url || "/", `http://localhost:${PORT}`);
    const cleanPath = decodeURIComponent(requestUrl.pathname);
    if (cleanPath === "/home" || cleanPath === "/home/") {
      res.writeHead(301, { Location: "/" });
      res.end();
      return;
    }

    if (cleanPath === "/buscar" || cleanPath === "/buscar/") {
      const query = requestUrl.searchParams.get("q")?.trim() || "";
      if (!query) {
        res.writeHead(302, { Location: "/" });
        res.end();
        return;
      }

      const redirectUrl = await getSearchRedirect(query);
      res.writeHead(302, { Location: redirectUrl });
      res.end();
      return;
    }

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
      "Cache-Control": getCacheControl(ext),
    });
    res.end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Arquivo nao encontrado.");
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`iBob localhost rodando em http://localhost:${PORT}`);
});
