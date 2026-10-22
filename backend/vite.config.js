import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import { cp, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    build: {
        manifest: true,
        outDir: 'public/build',
        emptyOutDir: true,
        rollupOptions: {
            output: {
                assetFileNames: (asset) => {
                    const name = asset.names?.[0] ?? asset.name;
                    return name.endsWith('.css') ? 'css/[name].min.css' : 'icons/[name][extname]';
                },
                entryFileNames: 'js/[name].js',
            },
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                silenceDeprecations: ['import', 'color-functions', 'global-builtin'],
            },
        },
    },
    plugins: [
        laravel({
            input: ['bootstrap', 'icons', 'app', 'custom'].map(name => `resources/scss/${name}.scss`),
            refresh: ['resources/views/**'],
        }),
        {
            name: 'copy-admin-assets',
            async writeBundle() {
                const output = path.join(root, 'public/build');
                // Preserve theme media; publish only scripts used by routed FRILO views.
                for (const dir of ['fonts', 'images']) {
                    await cp(path.join(root, 'resources', dir), path.join(output, dir), { recursive: true });
                }
                await cp(path.join(root, 'resources/js/layout.js'), path.join(output, 'js/layout.js'));
                const { packagesToCopy } = JSON.parse(await readFile(path.join(root, 'package-copy-config.json'), 'utf8'));
                for (const name of packagesToCopy) {
                    const source = path.join(root, 'node_modules', name, 'dist');
                    // Missing dependencies must fail the build, never produce a partial release.
                    await stat(source);
                    await cp(source, path.join(output, 'libs', name), { recursive: true });
                }
            },
        },
    ],
});
