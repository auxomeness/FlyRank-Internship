# Week 5 - The Polite Scraper

This project is a JavaScript scraping pipeline for the Week 5 FlyRank backend assignment.

## Target Classification

The target is [Books to Scrape](https://books.toscrape.com/), a public practice sandbox linked from [ToScrape](https://toscrape.com/). ToScrape describes it as a fictional bookstore that wants to be scraped and as a safe place for beginners learning scraping.

Scope is limited to the first 3 catalogue pages only. Each page lists 20 books, so the scraper discovers 60 book URLs and visits only those 60 detail pages.

The scraper collects book title, product URL, raw price text, raw availability text, raw rating text, description, source page, fetch time, and a normalized numeric GBP price.

`https://books.toscrape.com/robots.txt` returned `404 Not Found`, so no robots file was found. A missing robots file is not permission by itself; this assignment is appropriate because ToScrape explicitly identifies Books to Scrape as a scraping sandbox.

I will not reuse this code on another site without checking its rules and terms first.

## Install and Run

From this folder:

```bash
npm install
npm start
```

One run writes:

- `output/books.json`
- `output/errors.json`
- `output/run-report.json`

The default run includes one deliberately broken book URL to prove one failed page does not crash the scraper. The 60 real book records still survive.

For a clean run without the deliberate failure:

```bash
node src/index.js --no-bad-url
```

## Lane and Tools

This is the JavaScript lane.

- Runtime: Node.js
- HTTP: built-in `fetch`
- HTML parsing: Cheerio
- Schema validation: Zod
- Storage: JSON files written with Node's file system APIs

## Output Record Schema

Each valid record in `output/books.json` has this shape:

```json
{
  "title": "string",
  "product_url": "https://...",
  "price_text": "£51.77",
  "price_gbp": 51.77,
  "availability_text": "In stock (22 available)",
  "rating_text": "One | Two | Three | Four | Five",
  "description": "string or null",
  "source_page": "https://...",
  "fetched_at": "ISO timestamp"
}
```

The `product_url` is the canonical identity. Records are de-duplicated by this URL, so rerunning the scraper produces 60 records, not 120.

Invalid records are written to `output/errors.json` with their URL and validation reason.

## Politeness Rules

The scraper follows these rules:

- sends an identifying user-agent: `FlyRankInternship-A9/1.0 (+https://github.com/auxomeness/FlyRank-Internship)`
- uses an 8 second timeout
- checks the HTTP status before parsing
- waits at least 650 ms after each real request
- reads from `cache/` on reruns instead of hitting the site repeatedly
- retries once for timeout or `5xx` responses only
- does not retry `404` or `403`

`cache/` is gitignored because cached HTML is generated development data.

## Sample Run Report

```json
{
  "started_at": "2026-09-07T15:03:25.217Z",
  "duration_ms": 936,
  "pages_fetched": 0,
  "cache_hits": 66,
  "valid_records": 60,
  "invalid_records": 0,
  "failed_pages": [
    {
      "url": "https://books.toscrape.com/catalogue/this-page-is-deliberately-broken-for-stage-5/index.html",
      "reason": "Fetch failed with status 404"
    }
  ]
}
```

This sample was a rerun from cache, so `pages_fetched` is `0` and `cache_hits` is high. The deliberate bad URL is reported as one failed page, while `books.json` still contains the 60 valid records.

## Browser Note

This assignment needed no browser because Books to Scrape sends the book data in the HTML response. A browser would add startup time, memory use, and JavaScript execution cost without improving the core extraction.

## Limitation

The scraper is intentionally scoped to the first 3 catalogue pages. It does not try to crawl the full 1000-book site, schedule repeated jobs, or detect changed records between runs.

## Ethics Note

Use an official API when one exists. Do not bypass logins, paywalls, rate limits, or blocks. Collect only the fields needed for the task, identify your scraper clearly, and stop if the site owner says no.
