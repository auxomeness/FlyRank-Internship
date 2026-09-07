const fs = require('node:fs/promises');
const path = require('node:path');
const cheerio = require('cheerio');

const USER_AGENT = 'FlyRankInternship-A9/1.0 (+https://github.com/auxomeness/FlyRank-Internship)';
const REQUEST_TIMEOUT_MS = 8000;
const ROOT_DIR = path.resolve(__dirname, '..');
const CACHE_DIR = path.join(ROOT_DIR, 'cache');
const FIRST_CATALOGUE_URL = 'https://books.toscrape.com/catalogue/page-1.html';
const REAL_REQUEST_DELAY_MS = 650;

async function ensureDirectory(directoryPath) {
  await fs.mkdir(directoryPath, { recursive: true });
}

function cachePathForCataloguePage(pageNumber) {
  return path.join(CACHE_DIR, `catalogue-page-${pageNumber}.html`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
  await sleep(REAL_REQUEST_DELAY_MS);
  await fs.writeFile(filePath, html);
  console.log(`SAVED ${filePath} bytes=${Buffer.byteLength(html)}`);
  return html;
}

function extractBookLinks(html, pageUrl) {
  const $ = cheerio.load(html);

  return $('article.product_pod h3 a')
    .toArray()
    .map((element) => new URL($(element).attr('href'), pageUrl).toString());
}

function extractNextPageUrl(html, pageUrl) {
  const $ = cheerio.load(html);
  const href = $('li.next a').attr('href');

  return href ? new URL(href, pageUrl).toString() : null;
}

function cataloguePageNumber(url) {
  const match = url.match(/page-(\d+)\.html$/);
  return match ? Number(match[1]) : 1;
}

async function discoverBookUrls(maxCataloguePages = 3) {
  const cataloguePages = [];
  const discoveredUrls = [];
  let nextUrl = FIRST_CATALOGUE_URL;

  while (nextUrl && cataloguePages.length < maxCataloguePages) {
    const pageNumber = cataloguePageNumber(nextUrl);
    const html = await getCachedHtml(nextUrl, cachePathForCataloguePage(pageNumber));
    cataloguePages.push(nextUrl);
    discoveredUrls.push(...extractBookLinks(html, nextUrl));
    nextUrl = extractNextPageUrl(html, nextUrl);
  }

  const uniqueUrls = [...new Set(discoveredUrls)];

  return {
    cataloguePages,
    discoveredUrls,
    uniqueUrls
  };
}

async function main() {
  const result = await discoverBookUrls();

  console.log(`catalogue_pages=${result.cataloguePages.length}`);
  console.log(`discovered=${result.discoveredUrls.length}`);
  console.log(`unique_urls=${result.uniqueUrls.length}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
