// Runs the site's own code in a headless DOM and writes database/binder-loop-database.json.
// Usage: cd tools && npm install && node export-data.js
const { JSDOM, VirtualConsole } = require("jsdom");
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..") + path.sep;
const vc = new VirtualConsole();
vc.on("jsdomError", e => { if (!/scrollTo/.test(e.message)) console.error(e.message); });
let html = fs.readFileSync(ROOT + "index.html", "utf8").replace(/<link[^>]*>/g, "");
for (const f of ["js/app.js", "data/catalog.js", "data/sealed.js", "js/db.js", "js/boot.js"])
  html = html.replace(f.startsWith("data/") ? '<script src="js/db.js"></script>' : `<script src="${f}"></script>`,
    m => (f.startsWith("data/") ? "<script>" + fs.readFileSync(ROOT + f, "utf8") + "</script>" + m : "<script>" + fs.readFileSync(ROOT + f, "utf8") + "</script>"));
const dom = new JSDOM(html, { runScripts: "dangerously", pretendToBeVisual: true, virtualConsole: vc, url: "http://localhost/" });
setTimeout(() => {
  const data = dom.window.eval("dbExportData()");
  fs.mkdirSync(ROOT + "database", { recursive: true });
  fs.writeFileSync(ROOT + "database/binder-loop-database.json", JSON.stringify(data));
  console.log(`Wrote database/binder-loop-database.json: ${data.sets.length} sets, ${data.products.length} products, ${data.stock.length} stock lines`);
  process.exit(0);
}, 300);
