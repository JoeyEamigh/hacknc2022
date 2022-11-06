import { scraperObject as pageScraper } from './pageScraper';

export async function scrapeAll(browserInstance) {
  let browser;
  try {
    browser = await browserInstance;
    let scrapedData = await pageScraper.scraper(browser);
    await browser.close();
    console.log('BROWSER CLOSED');
    return scrapedData;
  } catch (err) {
    console.log('Could not resolve the browser instance => ', err);
  }
}
