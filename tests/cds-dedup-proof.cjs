// Offline proof of atomic claiming. No GitHub or automation credentials are used.
const assert = require('node:assert/strict');
const { execFile, execFileSync } = require('node:child_process');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');

async function main() {
  const repo = mkdtempSync(join(tmpdir(), 'mis-cds-claim-'));
  const git = args => execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8' }).trim();
  try {
    git(['init', '-q']);
    git(['-c', 'user.name=CDS Test', '-c', 'user.email=test@example.invalid', 'commit', '-qm', 'fixture', '--allow-empty']);
    const sha = git(['rev-parse', 'HEAD']);
    const ref = 'refs/cds/claims/repo-1468502673/pr-4/comment-7168917090';
    const tryClaim = () => new Promise(resolve =>
      execFile('git', ['-C', repo, 'update-ref', ref, sha, '0'.repeat(sha.length)], error => resolve(!error)));
    const winners = await Promise.all(Array.from({ length: 8 }, tryClaim));
    assert.equal(winners.filter(Boolean).length, 1);
    assert.equal(await tryClaim(), false);
    assert.equal(git(['rev-parse', ref]), sha);
    console.log('PASS: one atomic claim across eight workers; replay rejected');
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
