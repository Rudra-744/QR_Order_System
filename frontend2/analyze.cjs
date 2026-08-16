const fs = require('fs');

const data = JSON.parse(fs.readFileSync('./stats.json', 'utf8'));

const modules = [];

function traverse(node, path = '') {
  const currentPath = path ? `${path}/${node.name}` : node.name;
  
  if (node.children) {
    node.children.forEach(child => traverse(child, currentPath));
  } else if (node.uid) {
    const part = data.nodeParts[node.uid];
    if (part) {
      modules.push({
        name: currentPath,
        size: part.renderedLength,
        gzipSize: part.gzipLength,
        brotliSize: part.brotliLength
      });
    }
  }
}

traverse(data.tree);

modules.sort((a, b) => b.size - a.size);

console.log("Top 25 largest dependencies in the bundle:");
console.log("-------------------------------------------");
modules.slice(0, 25).forEach((m, i) => {
  const size = (m.size / 1024).toFixed(2) + " KB";
  const gzip = ((m.gzipSize || 0) / 1024).toFixed(2) + " KB";
  console.log(`${i + 1}. ${size} (gzip: ${gzip}) - ${m.name}`);
});

// Group by high-level dependencies
const deps = {};
modules.forEach(m => {
  let pkg = 'app-code';
  if (m.name.includes('node_modules')) {
    const parts = m.name.split('node_modules/');
    const after = parts[parts.length - 1];
    if (after.startsWith('@')) {
      pkg = after.split('/').slice(0, 2).join('/');
    } else {
      pkg = after.split('/')[0];
    }
  }
  
  if (!deps[pkg]) deps[pkg] = { size: 0, gzipSize: 0 };
  deps[pkg].size += m.size;
  deps[pkg].gzipSize += m.gzipSize || 0;
});

console.log("\nTop package dependencies:");
console.log("-------------------------------------------");
Object.entries(deps)
  .sort((a, b) => b[1].size - a[1].size)
  .slice(0, 15)
  .forEach(([pkg, sizes], i) => {
    const size = (sizes.size / 1024).toFixed(2) + " KB";
    const gzip = ((sizes.gzipSize || 0) / 1024).toFixed(2) + " KB";
    console.log(`${i + 1}. ${size} (gzip: ${gzip}) - ${pkg}`);
  });
