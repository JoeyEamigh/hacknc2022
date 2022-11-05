const scraperController = require("./scraperController");

(async() => {
    let data = await scraperController.startScraper();
    console.log(data);
})();