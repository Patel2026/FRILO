import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import ts from 'typescript';

const source = readFileSync(new URL('../../lib/templatePreview.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { buildPreviewUrl, hasLivePreview } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);

test('preserves external demo file, query and fragment without FRILO parameters', () => {
  const url = 'https://demo.example.com/theme/index.html?theme=food#home';
  assert.equal(buildPreviewUrl(url, '/', { palette: 'red', font: 'serif' }), url);
});

test('resolves pages next to the demo file', () => {
  assert.equal(buildPreviewUrl('https://demo.example.com/theme/index.html', 'contact.html'), 'https://demo.example.com/theme/contact.html');
});

test('preserves local previews and their customization', () => {
  assert.equal(buildPreviewUrl('/template-previews/food/index.html', '/', { palette: 'red' }), '/template-previews/food/index.html?palette=red');
  assert.equal(buildPreviewUrl('/template-previews/food/index.html', 'contact.html'), '/template-previews/food/contact.html');
});

test('rejects unsafe and protocol-relative preview URLs', () => {
  for (const url of ['javascript:alert(1)', '//evil.example/demo', '/\\evil.example', 'https://', 'ftp://demo.example']) {
    assert.equal(hasLivePreview(url), false, url);
  }
  assert.equal(hasLivePreview('https://demo.example.com'), true);
});
