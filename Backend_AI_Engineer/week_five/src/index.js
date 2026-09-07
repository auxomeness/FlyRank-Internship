const fs = require('node:fs/promises');
const path = require('node:path');

const USER_AGENT = 'FlyRankInternship-A9/1.0 (+https://github.com/auxomeness/FlyRank-Internship)';
const REQUEST_TIMEOUT_MS = 8000;
const ROOT_DIR = path.resolve(__dirname, '..');
const CACHE_DIR = path.join(ROOT_DIR, 'cache');
const FIRST_CATALOGUE_URL = 'https://books.toscrape.com/catalogue/page-1.html';

async function ensureDirectory(directoryPath) {
  await fs.mkdir(directoryPath, { recursive: true });
}

function cachePathForCataloguePage(pageNumber) {
  return path.join(CACHE_DIR, `catalogue-page-${pageNumber}.html`);
}

async function readCachedFile(filePath) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }

    throw error;
  }
}

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT
      },
      signal: controller.signal
    });

    if (response.status !== 200) {
      throw new Error(`Fetch failed with status ${response.status}`);
    }

    return response.text();
  } finally {
    clearTimeout(timeout);
  }
}

async function getCachedHtml(url, filePath) {
  await ensureDirectory(path.dirname(filePath));

  const cached = await readCachedFile(filePath);

  if (cached) {
    console.log(`CACHE HIT ${url} bytes=${Buffer.byteLength(cached)}`);
    return cached;
  }

  console.log(`FETCH ${url}`);
  const html = await fetchWithTimeout(url);
  await fs.writeFile(filePath, html);
  console.log(`SAVED ${filePath} bytes=${Buffer.byteLength(html)}`);
  return html;
}

async function main() {
  await getCachedHtml(FIRST_CATALOGUE_URL, cachePathForCataloguePage(1));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
