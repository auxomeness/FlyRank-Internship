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

function cachePathForBookUrl(bookUrl) {
  const { pathname } = new URL(bookUrl);
  const slug = pathname
    .replace(/^\/catalogue\//, '')
    .replace(/\/index\.html$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '-');

  return path.join(CACHE_DIR, 'books', `${slug}.html`);
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

function ratingFromClasses(classNames) {
  const ratingWords = ['One', 'Two', 'Three', 'Four', 'Five'];
  return ratingWords.find((rating) => classNames.includes(rating)) || null;
}

function extractDescription($) {
  const productDescriptionHeading = $('#product_description');

  if (productDescriptionHeading.length === 0) {
    return null;
  }

  const description = productDescriptionHeading.next('p').text().trim();
  return description || null;
}

function extractRawBookRecord(html, productUrl, sourcePage, fetchedAt) {
  const $ = cheerio.load(html);
  const title = $('.product_main h1').first().text().trim();
  const priceText = $('.product_main .price_color').first().text().trim();
  const availabilityText = $('.product_main .availability').first().text().replace(/\s+/g, ' ').trim();
  const ratingText = ratingFromClasses($('.product_main .star-rating').first().attr('class') || '');
  const description = extractDescription($);

  return {
    title,
    product_url: productUrl,
    price_text: priceText,
    availability_text: availabilityText,
    rating_text: ratingText,
    description,
    source_page: sourcePage,
    fetched_at: fetchedAt
  };
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

async function extractRawRecords() {
  const result = await discoverBookUrls();
  const sourceByBookUrl = new Map();

  for (const cataloguePageUrl of result.cataloguePages) {
    const pageNumber = cataloguePageNumber(cataloguePageUrl);
    const html = await getCachedHtml(cataloguePageUrl, cachePathForCataloguePage(pageNumber));

    for (const bookUrl of extractBookLinks(html, cataloguePageUrl)) {
      sourceByBookUrl.set(bookUrl, cataloguePageUrl);
    }
  }

  const records = [];

  for (const productUrl of result.uniqueUrls) {
    const html = await getCachedHtml(productUrl, cachePathForBookUrl(productUrl));
    records.push(
      extractRawBookRecord(
        html,
        productUrl,
        sourceByBookUrl.get(productUrl),
        new Date().toISOString()
      )
    );
  }

  return {
    ...result,
    rawRecords: records
  };
}

async function main() {
  const result = await extractRawRecords();

  console.log(`catalogue_pages=${result.cataloguePages.length}`);
  console.log(`discovered=${result.discoveredUrls.length}`);
  console.log(`unique_urls=${result.uniqueUrls.length}`);
  console.log(`detail_pages=${result.rawRecords.length}`);
  console.log(JSON.stringify(result.rawRecords[0], null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
