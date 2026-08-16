const fs = require('fs');

try {
  const lh = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const audits = lh.audits;
  
  const lcp = audits['largest-contentful-paint'].displayValue;
  const tbt = audits['total-blocking-time'].displayValue;
  const cls = audits['cumulative-layout-shift'].displayValue;
  const lcpElement = audits['largest-contentful-paint-element']?.details?.items[0]?.node?.snippet || "Not found";
  
  const bytes = (audits['total-byte-weight'].numericValue / 1024).toFixed(2);
  
  console.log(`LCP: ${lcp}`);
  console.log(`LCP Element: ${lcpElement}`);
  console.log(`TBT (proxy for INP): ${tbt}`);
  console.log(`CLS: ${cls}`);
  console.log(`Total Bytes: ${bytes} KB`);
  
} catch (e) {
  console.log("Error reading lh report:", e.message);
}
