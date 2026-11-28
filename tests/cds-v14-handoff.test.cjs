// Offline protocol fixture. It sends no GitHub messages and starts no Work sessions.
const assert = require('node:assert/strict');
const { test } = require('node:test');

const sha = 'a75b7bcd41b76b563a648e04b59c80376106d74e';

function qaInbox(pendingLimit) {
  const seen = new Set();
  const revisions = new Map();
  const receipts = new Set();
  const pending = [];
  let active;
  let stopped = false;
  return {
    read(message) {
      if (message.to !== 'MIS03') return 'unaddressed';
      if (message.type === 'STOP' && message.from === 'MIS01') {
        stopped = true;
        pending.length = 0;
        return 'stopped';
      }
      if (stopped) return 'stopped';
      if (message.from !== 'MIS02' || !['HANDOFF', 'RETEST'].includes(message.type)) return 'informational';
      if (!/^[a-f0-9]{40}$/.test(message.sha) || !message.parent || !Number.isInteger(message.rev) || message.rev < 1) return 'invalid';
      const key = message.task + ':' + message.to;
      if (seen.has(message.id) || (revisions.get(key) ?? 0) >= message.rev) return 'duplicate';
      if (active && pending.length >= pendingLimit) return 'escalate-overflow';
      seen.add(message.id);
      revisions.set(key, message.rev);
      if (active) pending.push(message);
      else active = message;
      return 'accepted';
    },
    reconcileReceipt(id, postedOnGitHub) {
      if (postedOnGitHub) receipts.add(id);
      return receipts.has(id) ? 'receipt-present' : 'receipt-needed';
    },
    candidate() {
      return active && !stopped && receipts.has(active.id) ? active.sha : undefined;
    },
    finish() {
      active = pending.shift();
    }
  };
}

const work = { id: 1, parent: 10, from: 'MIS02', to: 'MIS03', type: 'HANDOFF',
  task: 'QA-PILOT-001', rev: 2, sha };

test('handoff pins an immutable SHA and requires a receipt before QA starts', () => {
  const inbox = qaInbox(1);
  assert.equal(inbox.read({ ...work, to: 'MIS01' }), 'unaddressed');
  assert.equal(inbox.read({ ...work, type: 'REVIEW' }), 'informational');
  assert.equal(inbox.read({ ...work, sha: 'develop/v1.7.0-review' }), 'invalid');
  assert.equal(inbox.read(work), 'accepted');
  assert.equal(inbox.candidate(), undefined);
  assert.equal(inbox.reconcileReceipt(work.id, false), 'receipt-needed');
  assert.equal(inbox.reconcileReceipt(work.id, true), 'receipt-present');
  // A timed-out write is reconciled before retry. The existing receipt wins.
  assert.equal(inbox.reconcileReceipt(work.id, false), 'receipt-present');
  assert.equal(inbox.candidate(), sha);
});

test('replays and older revisions are ignored, overflow is escalated and STOP takes precedence', () => {
  const inbox = qaInbox(1);
  assert.equal(inbox.read(work), 'accepted');
  assert.equal(inbox.read(work), 'duplicate');
  assert.equal(inbox.read({ ...work, id: 2 }), 'duplicate');
  assert.equal(inbox.read({ ...work, id: 3, rev: 1 }), 'duplicate');
  const next = { ...work, id: 4, rev: 3, type: 'RETEST' };
  assert.equal(inbox.read(next), 'accepted');
  assert.equal(inbox.read({ ...next, id: 5, rev: 4 }), 'escalate-overflow');
  assert.equal(inbox.reconcileReceipt(next.id, true), 'receipt-present');
  assert.equal(inbox.candidate(), undefined);
  inbox.finish();
  assert.equal(inbox.candidate(), sha);
  assert.equal(inbox.read({ from: 'MIS01', to: 'MIS03', type: 'STOP' }), 'stopped');
  assert.equal(inbox.read({ ...next, id: 6, rev: 4 }), 'stopped');
  assert.equal(inbox.candidate(), undefined);
});
