import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const port = Number.parseInt(process.argv[2] ?? "8080", 10);
const mimeTypes = new Map([
    [".html", "text/html; charset=utf-8"], [".css", "text/css; charset=utf-8"],
    [".js", "text/javascript; charset=utf-8"], [".svg", "image/svg+xml"],
    [".jpg", "image/jpeg"], [".jpeg", "image/jpeg"], [".png", "image/png"],
]);

createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    const relativePath = pathname === "/" ? "index.html" : normalize(pathname).replace(/^[/\\]+/, "");
    let target = resolve(join(root, relativePath));

    if (!target.startsWith(root + sep)) {
        response.writeHead(403).end("Forbidden");
        return;
    }
    if (existsSync(target) && statSync(target).isDirectory()) target = join(target, "index.html");
    if (!existsSync(target) || !statSync(target).isFile()) {
        response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Not found");
        return;
    }

    response.writeHead(200, {
        "Content-Type": mimeTypes.get(extname(target).toLowerCase()) ?? "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
    });
    createReadStream(target).pipe(response);
}).listen(port, "127.0.0.1", () => {
    console.log(`Sofoste Archive: http://localhost:${port}`);
});
