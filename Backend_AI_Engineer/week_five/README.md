# Week 5 - The Polite Scraper

This project is a JavaScript scraping pipeline for the Week 5 FlyRank backend assignment.

## Target Classification

The target is [Books to Scrape](https://books.toscrape.com/), a public practice sandbox linked from [ToScrape](https://toscrape.com/). ToScrape describes it as a fictional bookstore that wants to be scraped and as a safe place for beginners learning scraping.

Scope is limited to the first 3 catalogue pages only. Each page lists 20 books, so the scraper discovers 60 book URLs and visits only those 60 detail pages.

The scraper collects book title, product URL, raw price text, raw availability text, raw rating text, description, source page, fetch time, and a normalized numeric GBP price.

`https://books.toscrape.com/robots.txt` returned `404 Not Found`, so no robots file was found. A missing robots file is not permission by itself; this assignment is appropriate because ToScrape explicitly identifies Books to Scrape as a scraping sandbox.

I will not reuse this code on another site without checking its rules and terms first.
