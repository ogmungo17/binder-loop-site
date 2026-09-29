// Writes the marketplace's own card list (the CARDS object in js/app.js) to a JSON file so build_catalog.py can link them.
const { JSDOM, VirtualConsole } = require("jsdom"); const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..") + path.sep;
let html = fs.readFileSync(ROOT + "index.html", "utf8").replace(/<link[^>]*>/g, "").replace(/<script src="[^"]*"><\/script>/g, "");
html = html.replace("</body>", () => "<script>" + fs.readFileSync(ROOT + "js/app.js", "utf8") + "</script></body>");
const dom = new JSDOM(html, { runScripts: "dangerously", pretendToBeVisual: true, virtualConsole: new VirtualConsole(), url: "http://localhost/" });
setTimeout(() => {
  const out = dom.window.eval(`Object.keys(CARDS).map(k=>({k, n:CARDS[k].n, s:CARDS[k].s, dex:CARDS[k].dex||0, set:CARDS[k].set||"", rar:CARDS[k].rar||"", v:CARDS[k].v}))`);
  fs.writeFileSync(process.argv[2] || "legacy_cards.json", JSON.stringify(out)); console.log("legacy cards:", out.length); process.exit(0);
}, 300);
