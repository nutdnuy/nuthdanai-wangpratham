// Copies the page from ../quantcorner-web (source of truth) into this export project.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const source = path.resolve(root, "../quantcorner-web");
const copy = (from, to) => {
  fs.mkdirSync(path.dirname(path.join(root, to)), { recursive: true });
  fs.cpSync(path.join(source, from), path.join(root, to), { recursive: true });
};

copy("src/components/nuth", "src/components/nuth");
copy("src/app/NuthdanaiWangpratham/page.tsx", "src/app/page.tsx");
copy("src/app/NuthdanaiWangpratham/nuth.css", "src/app/nuth.css");
copy("public/nuth", "public/nuth");
copy("public/brand/quantcorner-mark-light.svg", "public/brand/quantcorner-mark-light.svg");
copy("public/brand/quantcorner-mark-dark.svg", "public/brand/quantcorner-mark-dark.svg");

// Tokens live in quantcorner-web's globals.css; keep only the `.nw` block.
const globals = fs.readFileSync(path.join(source, "src/app/globals.css"), "utf8");
const start = globals.indexOf("/* Nuthdanai Wangpratham personal page");
if (start < 0) throw new Error("Token block not found in globals.css");
fs.writeFileSync(path.join(root, "src/app/tokens.css"), globals.slice(start));

// Relative links point at quantcorner-web routes; send them to the public site instead.
const contentFile = path.join(root, "src/components/nuth/content.ts");
const content = fs.readFileSync(contentFile, "utf8").replace('learn: "/learn"', 'learn: "https://www.quant-corner.com"');
fs.writeFileSync(contentFile, content);

// Static assets need the GitHub Pages base path.
const siteFile = path.join(root, "src/components/nuth/NuthSite.tsx");
const site = fs
  .readFileSync(siteFile, "utf8")
  .replaceAll('src="/', 'src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/')
  .replace(/src=\{`\$\{process\.env\.NEXT_PUBLIC_BASE_PATH \?\? ""\}(\/[^"]+)"/g, 'src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}$1`}');
fs.writeFileSync(siteFile, site);

console.log("Synced from", source);
