import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pages = ["index.html", "musique.html", "programmation.html", "loisirs.html", "gallery.html", "contact.html"];
const errors = [];

const check = (condition, message) => {
    if (!condition) errors.push(message);
};

for (const page of pages) {
    const absolute = join(root, page);
    const html = readFileSync(absolute, "utf8");
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
    const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);

    check(/^<!doctype html>/i.test(html), `${page}: doctype manquant`);
    check(/<html lang="en">/i.test(html), `${page}: English language declaration missing`);
    check(/<title>[^<]+<\/title>/i.test(html), `${page}: titre manquant`);
    check(/<meta name="description" content="[^"]+">/i.test(html), `${page}: meta description manquante`);
    check((html.match(/<h1\b/gi) ?? []).length === 1, `${page}: doit contenir un seul h1`);
    check((html.match(/aria-current="page"/g) ?? []).length === 1, `${page}: navigation active incorrecte`);
    check(duplicateIds.length === 0, `${page}: duplicate IDs (${duplicateIds.join(", ")})`);

    for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
        const reference = match[1];
        if (reference.startsWith("#")) {
            check(ids.includes(reference.slice(1)), `${page}: ancre absente ${reference}`);
            continue;
        }
        if (/^https?:\/\//i.test(reference)) {
            let url;
            try { url = new URL(reference); } catch { errors.push(`${page}: URL invalide`); continue; }
            check(url.protocol === "https:", `${page}: insecure external link`);
            check(url.hostname === "sofoste.de", `${page}: unexpected external domain ${url.hostname}`);
            continue;
        }
        const [pathAndQuery, fragment] = reference.split("#");
        const pathPart = pathAndQuery.split("?")[0];
        const target = resolve(dirname(absolute), decodeURIComponent(pathPart));
        check(target.startsWith(root), `${page}: chemin sortant ${reference}`);
        check(existsSync(target), `${page}: ressource absente ${reference}`);
        if (fragment && existsSync(target) && extname(target) === ".html") {
            const targetHtml = readFileSync(target, "utf8");
            check(new RegExp(`\\bid="${fragment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`).test(targetHtml), `${page}: ancre cible absente ${reference}`);
        }
    }

    for (const control of html.matchAll(/aria-controls="([^"]+)"/g)) {
        check(ids.includes(control[1]), `${page}: aria-controls sans cible ${control[1]}`);
    }

    check(!/(bootstrap|swiper|unpkg|google-analytics|googletagmanager)/i.test(html), `${page}: forbidden dependency or tracker`);
}

const cssPath = join(root, "assets", "css", "archive.css");
const css = readFileSync(cssPath, "utf8");
for (const match of css.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
    if (match[1].startsWith("data:")) continue;
    const target = resolve(dirname(cssPath), decodeURIComponent(match[1]));
    check(existsSync(target), `archive.css: ressource absente ${match[1]}`);
}

const secretPatterns = new Map([
    ["private key", /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/],
    ["token GitHub", /(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})/],
    ["AWS key", /(?:AKIA|ASIA)[A-Z0-9]{16}/],
    ["Google key", /AIza[0-9A-Za-z_-]{30,}/],
    ["jeton JWT", /eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/],
    ["assigned password", /(?:password|passwd|pwd)\s*[:=]\s*["']?[^\s"']{4,}/i],
    ["assigned secret", /(?:api[_-]?key|client[_-]?secret|access[_-]?token|auth[_-]?token|secret[_-]?key)\s*[:=]\s*["']?[^\s"']{6,}/i],
    ["adresse e-mail", /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/],
    ["international phone number", /(?:\+|00)[0-9]{1,3}(?:[ .()/-]*[0-9]){7,13}/],
]);

function walk(directory) {
    return readdirSync(directory).flatMap((name) => {
        if ([".git", ".idea", ".vscode"].includes(name) || ["AGENTS.md", "SECURITY_AUDIT.local.md"].includes(name)) return [];
        const path = join(directory, name);
        return statSync(path).isDirectory() ? walk(path) : [path];
    });
}

const textExtensions = new Set([".html", ".css", ".js", ".mjs", ".md", ".txt", ".svg", ".xml"]);
for (const file of walk(root).filter((path) => textExtensions.has(extname(path).toLowerCase()))) {
    const content = readFileSync(file, "utf8");
    for (const [type, pattern] of secretPatterns) {
        check(!pattern.test(content), `${relative(root, file)}: potential sensitive data (${type})`);
    }
}

if (errors.length) {
    console.error(`Validation failed (${errors.length})`);
    errors.forEach((error) => console.error(`- ${error}`));
    process.exitCode = 1;
} else {
    console.log(`Validation passed: ${pages.length} pages, local links, SEO, structural accessibility and sensitive-data audit.`);
}
