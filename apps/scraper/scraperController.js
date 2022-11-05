const browserObject = require('./browser');
const scraper = require('./pageController');

async function startScraper() {

    //Start the browser and create a browser instance
    let browserInstance = browserObject.startBrowser();

    // Pass the browser instance to the scraper controller
    let data = await scraper(browserInstance);
    return JSON.stringify(data);
}

module.exports = {
    startScraper
}