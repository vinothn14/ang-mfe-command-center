import fs from 'node:fs';
import path from 'node:path';

const manifestArgIdx = process.argv.indexOf('--manifest');
const manifestPath =
  manifestArgIdx !== -1 && process.argv[manifestArgIdx + 1]
    ? path.resolve(process.argv[manifestArgIdx + 1])
    : path.resolve('apps/shell/public/federation.manifest.prod.json');

if (!fs.existsSync(manifestPath)) {
  console.error(`Manifest not found: ${manifestPath}`);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
const entries = Object.entries(manifest);

console.log(`Checking ${entries.length} remote entrypoints from ${manifestPath}...\n`);

let failures = 0;

for (const [name, url] of entries) {
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      console.error(`FAIL [${name}] ${url} -> HTTP ${res.status}`);
      failures++;
      continue;
    }

    const json = await res.json();
    const exposedCount = Array.isArray(json.exposes) ? json.exposes.length : 0;
    console.log(`OK   [${name}] ${url} -> HTTP ${res.status} (exposes: ${exposedCount})`);
  } catch (err) {
    console.error(`FAIL [${name}] ${url} -> ${err instanceof Error ? err.message : String(err)}`);
    failures++;
  }
}

console.log(`\nSummary: ${entries.length - failures}/${entries.length} remotes reachable.`);
process.exit(failures > 0 ? 1 : 0);
