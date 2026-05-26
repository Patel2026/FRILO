import fs from 'node:fs/promises';
import path from 'node:path';

const PAGE_LABELS = {
  index: 'Accueil',
  about: 'A propos',
  services: 'Services',
  portfolio: 'Realisations',
  pricing: 'Tarifs',
  contact: 'Contact',
};

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(targetPath) {
  await fs.mkdir(targetPath, { recursive: true });
}

async function removeDir(targetPath) {
  await fs.rm(targetPath, { recursive: true, force: true });
}

function isForbiddenName(name) {
  const normalized = name.trim().toLowerCase();

  return normalized === '' || normalized === '.ds_store' || normalized.startsWith('.') || normalized.startsWith('maquette');
}

function getPageLabel(fileName) {
  const baseName = path.basename(fileName, path.extname(fileName));
  return PAGE_LABELS[baseName] ?? baseName.replace(/[-_]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function sortPages(fileNames) {
  const orderedKeys = Object.keys(PAGE_LABELS);

  return [...fileNames].sort((left, right) => {
    const leftBase = path.basename(left, path.extname(left));
    const rightBase = path.basename(right, path.extname(right));
    const leftIndex = orderedKeys.indexOf(leftBase);
    const rightIndex = orderedKeys.indexOf(rightBase);

    if (leftIndex !== -1 || rightIndex !== -1) {
      return (leftIndex === -1 ? 999 : leftIndex) - (rightIndex === -1 ? 999 : rightIndex);
    }

    return left.localeCompare(right);
  });
}

async function copyDirectory(sourceDir, destinationDir) {
  await ensureDir(destinationDir);
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    if (isForbiddenName(entry.name)) {
      continue;
    }

    const sourcePath = path.join(sourceDir, entry.name);
    const destinationPath = path.join(destinationDir, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, destinationPath);
      continue;
    }

    await fs.copyFile(sourcePath, destinationPath);
  }
}

async function collectManifestEntry(sourceDir, folder) {
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });
  const htmlFiles = entries
    .filter((entry) => entry.isFile() && path.extname(entry.name).toLowerCase() === '.html')
    .map((entry) => entry.name);
  const orderedHtmlFiles = sortPages(htmlFiles);

  return {
    folder,
    preview_url: `/template-previews/${folder}/`,
    pages: orderedHtmlFiles.map((fileName) => ({
      label: getPageLabel(fileName),
      path: fileName,
    })),
  };
}

async function main() {
  const cwd = process.cwd();
  const sourceCandidates = [
    path.resolve(cwd, '../template'),
    path.resolve(cwd, 'template-source'),
  ];
  const sourceRoot = (await Promise.all(sourceCandidates.map(async (candidate) => (await pathExists(candidate)) ? candidate : null)))
    .find(Boolean);

  if (!sourceRoot) {
    console.log('[template-previews] Aucun dossier source trouve, prechargement ignore.');
    return;
  }

  const destinationRoot = path.resolve(cwd, 'public/template-previews');
  await removeDir(destinationRoot);
  await ensureDir(destinationRoot);

  const entries = await fs.readdir(sourceRoot, { withFileTypes: true });
  const manifest = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || isForbiddenName(entry.name)) {
      continue;
    }

    const sourceDir = path.join(sourceRoot, entry.name);
    const destinationDir = path.join(destinationRoot, entry.name);
    await copyDirectory(sourceDir, destinationDir);
    manifest.push(await collectManifestEntry(sourceDir, entry.name));
  }

  await fs.writeFile(
    path.join(destinationRoot, 'manifest.json'),
    JSON.stringify({ generated_at: new Date().toISOString(), templates: manifest }, null, 2),
    'utf8'
  );

  console.log(`[template-previews] ${manifest.length} template(s) precharges dans ${destinationRoot}.`);
}

await main();
