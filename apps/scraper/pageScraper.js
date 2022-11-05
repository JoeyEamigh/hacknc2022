const { resolve } = require('path');

const URL = 'https://reports.unc.edu/class-search/';

const scraperObject = {
    url: URL, // URL
    async scraper(browser) {

        // Output
        var outputJSON = {};

        //Make a new page in the browser
        let page = await browser.newPage();

        console.log(`Navigating to ${this.url}...`);

        // Navigate to the selected URL
        await page.goto(this.url);

        // Wait for the required DOM to be rendered
        await page.waitForSelector('main');

        // Get all of the options for term
        let termPossibilities = await page.$$eval('#term\-listbox li', links => links.map(el => el.textContent));

        // Get all of the options for subject
        let coursePossibilities = await page.$$eval('#subject\-listbox li', links => links.map(el => el.textContent));

        async function scrapeUNC() {

            // Get JSON data from term and subject
            let getData = (term, course) => new Promise(async(resolve, reject) => {
                //JSON Object
                let dataObj = {};

                // Clear the page
                await page.goto(URL);

                // Input the subject name
                const inputCourse = await page.$('input[name=subject]');
                await inputCourse.click({ clickCount: 3 })
                await inputCourse.type(course);

                // Input the term name
                const inputTerm = await page.$('input[name=term]');
                await inputTerm.click({ clickCount: 3 })
                await inputTerm.type(term);

                // Click submit
                await page.click('button[name=filter\-submit]');
                await page.waitForSelector('main')

                // If text shows up in the center ("No results found.") then skip this search
                let shouldContinue = await page.$$('h1.text\-center.text\-muted');
                if (shouldContinue.length > 0) {
                    resolve(dataObj)
                }

                // Wait for the table to show up
                await page.waitForSelector('#results\-table');

                // Figure out how big the table is
                let numFields = (await page.$$('thead > tr > th')).length;

                // Get the rows of the table
                let rows = await page.$$('#results-table > tbody > tr');

                // Define variables
                desc = "";
                subject = "";
                catNo = -1;
                equivalences = [];
                termVal = "";
                hours = -1.0;
                sections = {}
                secNo = "";
                classNo = -1;
                schedule = "";
                room = "";
                instruction_type = "";
                instructor = "";

                // JSON objects for the sections and classes
                var classObj = {};
                var secObj = {};

                // First run through is different
                var firstTime = true;

                // Loop over every row
                for (row of rows) {

                    // Get the columns of each row
                    let columns = await row.$$eval('td', links => links.map(el => el.textContent));
                    if (columns == null) {
                        columns = [];
                    }

                    // Used to map JSON variables to their values
                    var index = 0;

                    if (!firstTime) { // If this isn't the first time...

                        /*  Some of the rows of the table have fewer columns than the others
                         *   This is because some columns span multiple rows
                         *   We can tell which column is missing based on how many columns we find
                         */

                        if (columns.length < numFields) {
                            if (columns.length < numFields - 1) { // No Subject and no Catalog Number
                                // Set the course description
                                desc = columns[0];
                                // Fix section JSON object 
                                secObj[secNo] = {
                                    "classNo": classNo,
                                    "schedule": schedule,
                                    "room": room,
                                    "instruction_type": instruction_type,
                                    "instructor": instructor
                                };

                            } else { // No Subject but yes CatNo

                                // Fix section JSON object
                                secObj[secNo] = {
                                    "classNo": classNo,
                                    "schedule": schedule,
                                    "room": room,
                                    "instruction_type": instruction_type,
                                    "instructor": instructor
                                };

                                // Fix the class JSON object
                                classObj[course + catNo] = {
                                    "desc": desc,
                                    "subject": subject,
                                    "catNo": catNo,
                                    "equivalences": equivalences,
                                    "term": termVal,
                                    "hours": hours,
                                    "sections": {...secObj }
                                };

                                secObj = {};
                                equivalences = [];
                                index += 1;
                                catNo = columns[0];
                            }
                        } else { // Yes Everything

                            // Fix the section JSON object
                            secObj[secNo] = {
                                "classNo": classNo,
                                "schedule": schedule,
                                "room": room,
                                "instruction_type": instruction_type,
                                "instructor": instructor
                            };

                            // Fix the class JSON object
                            classObj[course + catNo] = {
                                "desc": desc,
                                "subject": subject,
                                "catNo": catNo,
                                "equivalences": equivalences,
                                "term": termVal,
                                "hours": hours,
                                "sections": {...secObj }
                            };

                            equivalences = [];
                            secObj = {};
                            subject = columns[0].textContent;
                            catNo = columns[1].textContent;
                            index += 2;
                        }
                    }

                    // First runthrough, special case
                    if (firstTime) {
                        subject = columns[0];
                        catNo = columns[1];

                        index = 2;
                        firstTime = false;
                    }

                    // Assign values to variables
                    equivalences.push(columns[index]);
                    index += 1;
                    secNo = columns[index];
                    index += 1;
                    classNo = columns[index];
                    index += 1;
                    desc = columns[index];
                    index += 1;
                    termVal = columns[index];
                    index += 1;
                    hours = columns[index];
                    index += 1;
                    //dates = columns[index];   //UNUSED
                    index += 1;
                    schedule = columns[index];
                    index += 1;
                    room = columns[index];
                    index += 1;
                    instruction_type = columns[index];
                    index += 1;
                    instructor = columns[index];
                    index += 1;


                }

                // Fix Section and Class JSON objects for the last time
                secObj[secNo] = {
                    "classNo": classNo,
                    "schedule": schedule,
                    "room": room,
                    "instruction_type": instruction_type,
                    "instructor": instructor
                };
                classObj[course + catNo] = {
                    "desc": desc,
                    "subject": subject,
                    "catNo": catNo,
                    "equivalences": equivalences,
                    "term": termVal,
                    "hours": hours,
                    "sections": {...secObj }
                };

                // Return
                secObj = {};
                dataObj = classObj;
                resolve(dataObj);
            });


            let courses = []; // JSON Object for all classes

            // Iterate through all terms
            for (term of termPossibilities) {
                // Iterate through all subjects
                for (course of coursePossibilities.slice(0, 1)) {
                    console.log("Term, course: " + term + ", " + course)

                    // Receive data
                    let newData = await getData(term, course)

                    // If there's no data, skip
                    if (newData == {}) continue;

                    // Append data
                    courses = [...courses, newData]
                }
            }

            // Return
            return courses
                // Write data
                // await fs.writeFile("./data/something.json", JSON.stringify(courses));
        }

        //Return 
        let data = await scrapeUNC();
        await page.close();
        console.log("PAGE CLOSED")
        return data;

    }
}

module.exports = scraperObject;