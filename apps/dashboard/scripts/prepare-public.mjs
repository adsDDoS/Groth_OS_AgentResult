import { cp, mkdir, rm } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const publicDir = new URL("public/", root);

await rm(publicDir, { recursive: true, force: true });
await mkdir(publicDir, { recursive: true });

for (const path of ["index.html", "app.js", "styles.css", "modules", "styles"]) {
  await cp(new URL(path, root), new URL(path, publicDir), { recursive: true });
}

console.log("public output prepared");
