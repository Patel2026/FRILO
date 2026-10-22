import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => readFileSync(path.join(root, file), 'utf8');
function files(dir) {
    return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
        const file = path.join(dir, entry.name);
        return entry.isDirectory() ? files(file) : [file];
    });
}

test('active admin views reference existing local build assets', () => {
    const views = [
        ...files('resources/views/admin'),
        'resources/views/auth/login.blade.php',
        ...['head-css', 'vendor-scripts', 'topbar', 'sidebar', 'footer', 'master', 'master-without-nav'].map(name => `resources/views/layouts/${name}.blade.php`),
    ];
    for (const file of views) {
        for (const [, asset] of read(file).matchAll(/(?:asset|url)\(['"](build\/[^'"?]+)['"]/g)) {
            assert.ok(existsSync(path.join(root, 'public', asset)), `${file}: missing ${asset}`);
        }
    }
});

test('only admin runtime scripts are published, without legacy demo loaders', () => {
    const scripts = files('public/build/js').map(file => path.relative('public/build/js', file));
    assert.deepEqual(scripts.sort(), ['layout.js']);
    const vendor = read('resources/views/layouts/vendor-scripts.blade.php');
    assert.doesNotMatch(vendor, /plugins\.js|lord-icon|https?:\/\//);
});

test('published libraries match the maintained dependency allowlist', () => {
    assert.deepEqual(readdirSync('public/build/libs').sort(), ['bootstrap', 'feather-icons', 'node-waves', 'simplebar']);
});

test('generated stylesheets resolve local fonts and images', () => {
    for (const file of files('public/build/css')) {
        for (const match of read(file).matchAll(/url\((?:"([^"]*)"|'([^']*)'|([^)]*))\)/g)) {
            const url = (match[1] ?? match[2] ?? match[3]).trim();
            if (/^(data:|https?:|#)/.test(url)) continue;
            const resource = decodeURIComponent(url.split(/[?#]/)[0]);
            const target = resource.startsWith('/') ? path.join(root, 'public', resource) : path.resolve(path.dirname(file), resource);
            assert.ok(existsSync(target), `${file}: missing ${url}`);
        }
    }
});
