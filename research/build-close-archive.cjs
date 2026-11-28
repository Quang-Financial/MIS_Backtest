const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, 'mis-round15-17.json'));
const { blob, columns, rows } = JSON.parse(source);
const gitBlob = createHash('sha1').update('blob ' + source.length + '\0').update(source).digest('hex');
assert.equal(gitBlob, '5c6ba2e0cfdbe4496c7cdf8ab5ab4ae154995d25');
assert.equal(rows.length, 1680);
const parameters = ['d', 'a', 't1', 't2', 'f1', 'f2', 'tr'];
const windows = ['base', 'skip', 'stress', 'early', 'mid', 'recent'];
assert.equal(new Set(rows.map(row => JSON.stringify(parameters.map(key => row[key])))).size, rows.length);
for (const row of rows) {
  for (const window of windows) {
    const metrics = row[window];
    assert.equal(metrics.length, columns.length);
    assert(metrics.every(metric => metric === null || Number.isFinite(metric)));
    assert.equal(metrics[7], null);
    if (metrics[2] !== null) assert(Math.abs(metrics[2] - metrics[0] / Math.abs(metrics[1])) < 1e-8);
  }
  assert.deepEqual(row.recent, [0, 0, null, null, 0, 0, 0, null]);
}

const candidates = rows.map((row, index) => ({ ...row, id: 'R15-' + String(index + 1).padStart(4, '0') }));
const write = process.argv.includes('--write');
const folder = path.join(__dirname, 'exit-grid');
if (write) fs.mkdirSync(folder, { recursive: true });
function verifyFile(name, value) {
  const file = path.join(folder, name);
  const json = JSON.stringify(value) + '\n';
  if (write) fs.writeFileSync(file, json);
  const bytes = fs.readFileSync(file);
  assert.equal(bytes.toString(), json, name);
  return { value: JSON.parse(bytes), sha256: createHash('sha256').update(bytes).digest('hex') };
}
const groups = new Map();
for (const row of candidates) {
  const key = 'DD' + row.d * 100 + '-C' + row.a * 100;
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(row);
}
const balancedFilter = row => row.base[0] >= 12 && row.base[0] <= 20 && Math.abs(row.base[1]) <= 20 && row.base[2] !== null;
const byCalmar = (a, b) => b.base[2] - a.base[2] || a.id.localeCompare(b.id);
const rank = (items, filter, sort) => {
  const eligible = items.filter(filter).sort(sort);
  return { eligible: eligible.length, top: eligible.slice(0, 10).map(row => row.id) };
};
const shards = [];
const restored = [];
for (const [key, group] of groups) {
  const name = key + '.json';
  const { value, sha256 } = verifyFile(name, group);
  restored.push(...value);
  shards.push({ path: name, sha256, count: group.length, first: group[0].id, last: group.at(-1).id,
    balanced: rank(group, balancedFilter, byCalmar) });
}
assert.deepEqual(restored.map(({ id, ...row }) => row), rows);
const robustFilter = row => balancedFilter(row) && row.skip[0] >= 12 && row.skip[2] >= 1
  && row.stress[2] >= 1 && Math.abs(row.stress[1]) <= 20;
verifyFile('manifest.json', {
  sourceBlob: gitBlob, marketBlob: blob, count: rows.length, columns, parameters, windows, shards,
  status: 'exploratory', undefinedProfitFactor: rows.length * windows.length,
  noTradeRecent: rows.length, rules: {
    balanced: 'Base CAGR 12–20% and absolute MDD <=20%; Calmar descending',
    robust: 'Balanced filter + skip CAGR >=12%, skip and stress Calmar >=1, absolute stress MDD <=20%; base Calmar descending',
    growth: 'Absolute base MDD <=20% and at least one buy; base CAGR descending',
    safety: 'Balanced filter; absolute base MDD ascending',
    tieBreak: 'Ascending source-row candidate ID on equal unrounded sort values',
  }, rankings: {
    balanced: rank(candidates, balancedFilter, byCalmar),
    robust: rank(candidates, robustFilter, byCalmar),
    growth: rank(candidates, row => Math.abs(row.base[1]) <= 20 && row.base[4] > 0,
      (a, b) => b.base[0] - a.base[0] || a.id.localeCompare(b.id)),
    safety: rank(candidates, balancedFilter, (a, b) => b.base[1] - a.base[1] || a.id.localeCompare(b.id)),
  },
});
console.log('PASS: original Git blob, 1680 unique rows, 14 shards, exact ordered readback, ranking and null metrics');
