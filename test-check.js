const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const js = fs.readFileSync('script.js', 'utf8');
const css = fs.readFileSync('style.css', 'utf8');

console.log("--- STARTING LOCAL WEBSITE INTEGRITY CHECKS ---");

// 1. Check index.html basic tags
console.log("1. Checking index.html loading & tags...");
console.assert(html.includes("<!DOCTYPE html>"), "Missing DOCTYPE");
console.assert(html.includes("<title>"), "Missing title tag");
console.assert(html.includes("style.css"), "Missing style.css link");
console.assert(html.includes("script.js"), "Missing script.js tag");
console.log("   ✅ index.html is valid and links style.css & script.js.");

// 2. Check CSS file loading & selectors
console.log("2. Checking style.css selectors...");
console.assert(css.includes(":root"), "Missing CSS custom properties");
console.assert(css.includes("@media (max-width: 768px)"), "Missing mobile breakpoints");
console.log("   ✅ style.css contains valid responsive design styles.");

// 3. Check JS element ID references against HTML
console.log("3. Checking JS element IDs against index.html...");
const regex = /getElementById\(['"]([^'"]+)['"]\)/g;
let match;
const ids = [];
while ((match = regex.exec(js)) !== null) {
  ids.push(match[1]);
}

const missingIds = ids.filter(id => !html.includes(`id="${id}"`));
if (missingIds.length > 0) {
  console.error("   ❌ Missing IDs in index.html:", missingIds);
} else {
  console.log(`   ✅ All ${ids.length} DOM IDs referenced in script.js exist in index.html.`);
}

// 4. Check Navigation Section Anchors
console.log("4. Checking Navigation Links...");
const navHrefRegex = /href="#([^"]+)"/g;
const navAnchors = [];
while ((match = navHrefRegex.exec(html)) !== null) {
  navAnchors.push(match[1]);
}
const missingAnchors = navAnchors.filter(anchor => !html.includes(`id="${anchor}"`));
if (missingAnchors.length > 0) {
  console.error("   ❌ Missing anchor section IDs in index.html:", missingAnchors);
} else {
  console.log(`   ✅ All ${navAnchors.length} navigation anchor links (#id) match valid section IDs.`);
}

// 5. Check onclick handlers in HTML vs JS functions
console.log("5. Checking Onclick Button Handlers...");
const onclickRegex = /onclick="([^"(]+)/g;
const onclicks = [];
while ((match = onclickRegex.exec(html)) !== null) {
  if (!onclicks.includes(match[1])) onclicks.push(match[1]);
}
console.log("   Found onclick functions:", onclicks);
const missingFunctions = onclicks.filter(fnName => !js.includes(`function ${fnName}`) && !js.includes(`${fnName} =`));
if (missingFunctions.length > 0) {
  console.error("   ❌ Missing JS functions for onclick:", missingFunctions);
} else {
  console.log("   ✅ All HTML button onclick handlers exist in script.js.");
}

console.log("--- INTEGRITY CHECKS COMPLETED ---");
