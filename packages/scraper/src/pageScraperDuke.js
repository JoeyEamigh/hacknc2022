const { resolve } = require('path');

const URL = 'https://dukehub.duke.edu/psc/CSPRD01/EMPLOYEE/SA/s/WEBLIB_HCX_CM.H_COURSE_CATALOG.FieldFormula.IScript_Main/';

const scraperObject = {
    url: URL, // URL
    async scraper(browser) {

        // Output
        let outputJSON = {};

        //Make a new page in the browser
        let page = await browser.newPage();

        console.log(`Navigating to ${this.url}...`);

        // Navigate to the selected URL
        await page.goto(this.url);

        // Wait for the required DOM to be rendered
        await page.waitForNetworkIdle();

        console.log("Page loaded.")

        // Get all of the URL's for the Subject
        let subPoss = (await page.$$eval('a.cx-MuiButtonBase-root.cx-MuiButton-root.cx-MuiButton-contained.cx-MuiButton-containedPrimary', links => links.map(el => el.href)));
        let subNames = subPoss.map(el => el.split('/')[el.split('/').length - 1]); //await page.$$eval('a.cx-MuiButtonBase-root.cx-MuiButton-root.cx-MuiButton-contained.cx-MuiButton-containedPrimary', links => links.map(el => el.href));
        let subjectURL = "https://dukehub.duke.edu/psc/CSPRD01/EMPLOYEE/SA/s/WEBLIB_HCX_CM.H_COURSE_CATALOG.FieldFormula.IScript_SubjectCourses?institution=DUKEU&subject="

        let sectionURL1 = "https://dukehub.duke.edu/psc/CSPRD01/EMPLOYEE/SA/s/WEBLIB_HCX_CM.H_BROWSE_CLASSES.FieldFormula.IScript_BrowseSections?institution=DUKEU&campus=&location=&course_id="
        let sectionURL2 = "&institution=DUKEU&x_acad_career=UGRD&term=";
        let sectionURL3 = "&crse_offer_nbr=";

        for (subject of subNames) {
            console.log("Checking all of " + subject)
            subject = subject.replace("&", "%26");
            await page.goto(subjectURL + subject);
            await page.content(); //This is apparently safe

            let subjectJSON = await page.evaluate(() => {
                return JSON.parse(document.querySelector("body").innerText);
            });

            for (let j = 0; j < subjectJSON["courses"].length; j += 1) {
                process.stdout.write(".")
                courseJSON = subjectJSON["courses"][j];
                if (courseJSON["acad_career"] != "UGRD") continue;

                desc = courseJSON["descr"];
                //subject = subject;
                catNo = courseJSON["catalog_nbr"];
                equivalences = [];

                term = "";
                hours = "";

                secNo = "";
                classNo = "";
                schedule = "";
                room = "";
                instruction_type = "";
                instructor = "";


                let startYear = 2021;
                let startYearValue = 1780;
                let numYears = new Date().getFullYear() - startYear;
                for (let k = 0; k < numYears * 2 + 1; k += 1) {
                    let yearString = "" + startYearValue;
                    if (k != 0) {
                        yearString = "" + (startYearValue + 40 * ((k - 1) % 2) * Math.floor(k / 2) + 10 * ((k) % 2) * Math.floor(k / 2))
                    }
                    await page.goto(sectionURL1 + courseJSON["crse_id"] + sectionURL2 + yearString + sectionURL3 + courseJSON["crse_offer_nbr"]);
                    await page.content(); //This is apparently safe
                    let sectionJSON = await page.evaluate(() => {
                        return JSON.parse(document.querySelector("body").innerText);
                    });

                    let sections = sectionJSON["sections"];

                    let parsedClassJSON = {};
                    parsedClassJSON['sections'] = {};

                    for (let l = 0; l < sections.length; l += 1) {
                        switch (yearString) {
                            case "1780":
                                term = "2021 Fall"
                                break;
                            case "1790":
                                term = "2022 Spring"
                                break;
                            case "1820":
                                term = "2022 Fall"
                                break;
                            case "1830":
                                term = "2023 Spring"
                                break;
                            case "1860":
                                term = "2023 Fall"
                                break;
                            case "1870":
                                term = "2024 Spring"
                                break;
                            case "1900":
                                term = "2024 Fall"
                                break;
                            case "1910":
                                term = "2025 Spring"
                                break;
                            case "1940":
                                term = "2025 Fall"
                                break;
                            case "1950":
                                term = "2026 Spring"
                                break;
                            case "1980":
                                term = "2026 Fall"
                                break;
                            case "1990":
                                term = "2027 Spring"
                                break;
                        }

                        hours = ""; // Not given
                        secNo = sections[l]["class_section"];
                        classNo = sections[l]["class_nbr"];
                        if (sections[l].hasOwnProperty('meetings')) {
                            if (sections[l]['meetings'].length > 0) {
                                if (sections[l]['meetings'][0].hasOwnProperty('days')) {
                                    schedule = sections[l]["meetings"][0]["days"];
                                } else {
                                    schedule = "";
                                }
                                if (sections[l]['meetings'][0].hasOwnProperty('instructors')) {
                                    instructor = sections[l]["meetings"][0]["instructors"][0]["name"];
                                } else {
                                    instructor = "";
                                }
                            }
                        } else {
                            schedule = "";
                            instructor = "";
                        }
                        if (sections[l].hasOwnProperty('meetings')) {
                            if (sections[l]["meetings"].length > 0) {
                                room = sections[l]["meetings"][0]["facility_descr"];
                            }
                        }
                        if (sections[l].hasOwnProperty('instruction_mode')) {
                            instruction_type = sections[l]["instruction_mode"];
                        } else {
                            instruction_type = "Undisclosed";
                        }
                        let parsedSectionJSON = {};
                        parsedSectionJSON['secNo'] = secNo;
                        parsedSectionJSON['classNo'] = classNo;
                        parsedSectionJSON['schedule'] = schedule;
                        parsedSectionJSON['room'] = room;
                        parsedSectionJSON['instruction_type'] = instruction_type;
                        parsedSectionJSON['instructor'] = instructor;

                        parsedClassJSON['sections'] = {...parsedClassJSON['sections'], ...parsedSectionJSON }


                    }
                    parsedClassJSON['desc'] = desc;
                    parsedClassJSON['subject'] = subject;
                    parsedClassJSON['equivalences'] = equivalences;
                    parsedClassJSON['term'] = term;
                    parsedClassJSON['hours'] = hours;
                    outputJSON[subject + catNo] = {
                        'desc': desc,
                        'subject': subject,
                        'equivalences': equivalences,
                        'term': term,
                        'hours': hours,
                        'sections': parsedClassJSON['sections']
                    };
                }




            }

        }


        return outputJSON
    }
}

module.exports = scraperObject;