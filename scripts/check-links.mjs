// Checks that relative links, images, scripts and stylesheets in the HTML files
// point to files that exist, and that #fragment links match an id in the target page.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";

const root = process.cwd();
const htmlFiles = readdirSync(root).filter((file) => file.endsWith(".html"));
const attributePattern = /\s(?:href|src)\s*=\s*"([^"]*)"/g;
const errors = [];

function hasId(html, id) {
  return new RegExp(`\\sid\\s*=\\s*"${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`).test(html);
}

for (const file of htmlFiles) {
  const html = readFileSync(join(root, file), "utf8");

  for (const match of html.matchAll(attributePattern)) {
    const value = match[1].trim();

    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(value) || value === "") {
      continue;
    }

    const [pathAndQuery, fragment] = value.split("#");
    const path = decodeURIComponent(pathAndQuery.split("?")[0]);
    const target = path ? resolve(dirname(join(root, file)), path) : join(root, file);

    if (!existsSync(target)) {
      errors.push(`${file}: broken link "${value}" (file not found)`);
      continue;
    }

    if (fragment && target.endsWith(".html")) {
      if (!hasId(readFileSync(target, "utf8"), fragment)) {
        errors.push(`${file}: broken anchor "${value}" (no element with id="${fragment}")`);
      }
    }
  }
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Checked relative links in ${htmlFiles.length} HTML files: no broken links.`);
