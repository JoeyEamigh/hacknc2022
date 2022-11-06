import { scraperObject as pageScraper } from './pageScraper';
import { startBrowser as browserObject } from './browser';

export async function scrapeAll(browserInstance, start: number, end: number) {
  let browser;
  try {
    browser = await browserInstance;
    let scrapedData = await pageScraper.scraper(browser, start, end);
    await browser.close();
    console.log('BROWSER CLOSED');
    return scrapedData;
  } catch (err) {
    console.log('Could not resolve the browser instance => ', err);
  }
}

export async function getLength() {
  let browser;
  try {
    browser = await browserObject();
    let length = await pageScraper.getPossibilities(browser);
    await browser.close();
    console.log('BROWSER CLOSED');
    return length;
  } catch (err) {
    console.log('Could not resolve the browser instance => ', err);
  }
}
