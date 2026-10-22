import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import ts from 'typescript';
const source = readFileSync(new URL('../../lib/orderSubmission.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { getSubmissionKey, rememberSubmissionOrder, clearCompletedSubmission } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
function storage() {
  const entries = new Map();
  return { getItem: key => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value), removeItem: key => entries.delete(key), key: index => [...entries.keys()][index] ?? null, get length() { return entries.size; } };
}
test('reuses submission key after a lost response and reload, scoped to user and payload', () => {
  const store = storage();
  const key = getSubmissionKey(store, 1, 'payload');
  assert.equal(getSubmissionKey(store, 1, 'payload'), key);
  assert.notEqual(getSubmissionKey(store, 2, 'payload'), key);
  assert.notEqual(getSubmissionKey(store, 1, 'changed'), key);
});
test('keeps pending submissions but allows a new purchase after confirmation', () => {
  const store = storage();
  const key = getSubmissionKey(store, 1, 'payload');
  rememberSubmissionOrder(store, 1, 'payload', 12);
  clearCompletedSubmission(store, 13);
  assert.equal(getSubmissionKey(store, 1, 'payload'), key);
  clearCompletedSubmission(store, 12);
  assert.notEqual(getSubmissionKey(store, 1, 'payload'), key);
});
test('does not silently generate a replacement if durable storage fails', () => {
  assert.throws(() => getSubmissionKey({ getItem: () => null, setItem: () => { throw new Error('Storage unavailable'); } }, 1, 'payload'));
});
