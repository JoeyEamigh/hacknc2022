import { startBrowser as browserObject } from './browser';
import { scrapeAll as scraper } from './pageController';

export async function startScraper(start: number, end: number) {
  //Start the browser and create a browser instance
  let browserInstance = browserObject();

  // Pass the browser instance to the scraper controller
  let data = await scraper(browserInstance, start, end);
  return JSON.stringify(data);
}
