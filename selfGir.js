const puppeteer = require("puppeteer-core");

const users = {
    soroosh: { userName: "1400012268022", pass: "4311745214"},
    saeed: { userName: "1400010121101", pass: "?" },
    mahan: { userName: "1400012137020", pass: "0150329075" },
    aryan: { userName: "1401012137052", pass: "2581513381" },
    amirreza: { userName: "1400012137028", pass: "9119012218" },
};

async function reserveFood(user, num) {
    let refreshCount = 0;
    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ["--window-size=1920,1080"],
            defaultViewport: {
                width: 1530,
                height: 800,
            },
            executablePath:
                "C:/Program Files/Google/Chrome/Application/chrome.exe",
        });
        const page = await browser.newPage();
        const pages = await browser.pages();
        if (pages.length > 1) {
            await pages[0].close(); // Close the first blank tab
        }
        // Navigate to the food reservation site
        await page.goto("https://food.guilan.ac.ir/index.rose");
        const inputSelector = ["#username", "#password"];

        await page.evaluate(
            (selector, user) => {
                const username = document.querySelector(selector[0]);
                const pass = document.querySelector(selector[1]);

                username.value = user.userName;
                pass.value = user.pass;
            },
            inputSelector,
            user
        );

        await page.click("#login_btn_submit");
        console.log(`${user.userName} logged in`)

        const parentSelector = ".icon";

        // Wait for the icon to be present before clicking
        await page.waitForSelector(parentSelector);

        await page.evaluate(() => {
            document
                .getElementById("%{#iconGroup.id}_div")
                .firstElementChild.firstElementChild.click();
            console.log("group id clicked");
        });

        // Wait for the select dropdown to be present before interacting with it
        await page.waitForSelector("#selectself_selfListId");
        await page.select("#selectself_selfListId", "1");
        await page.click('input[value="تایید و ادامه"]');
        console.log('self is selected')
        // Continuously refresh the page until an option is available
        let optionReserved = false;
        let optionAvailable = false;

        // for handling the alert after clicking the button
        page.on("dialog", async (dialog) => {
            await dialog.accept();
        });

        while (!optionReserved) {
            // Wait for the reservation section to be present before evaluating
            try {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                // Check if an option is available
                optionAvailable = await page.evaluate((select) => {
                    const reservationSection = document.getElementById(
                        `buyFreeFoodIconSpanuserWeekReserves.selected${select}`
                    );
                    return reservationSection !== null;
                }, num);

                if (optionAvailable) {
                    // Click on the reservation section and submit
                    await page.evaluate((select) => {
                        const reservationSection = document.getElementById(
                            `buyFreeFoodIconSpanuserWeekReserves.selected${select}`
                        ).firstElementChild;
                        reservationSection.click();

                        const submit = document.getElementById("doReservBtn");
                        submit.click();
                    }, num);
                } else {
                    refreshCount++;
                    console.log(`refreshing for ${user.userName} count: ${refreshCount}`)
                    await page.reload();
                }
                // Wait for success message to be present before checking
                optionReserved = await page.evaluate((select) => {
                    const successMassage = document.getElementById(select);
                    return successMassage !== null;
                }, "successMessages");
            } catch (error) {
                console.error(error);
            }
        }
        console.log(`${user.userName} reservation was successful.`);
        page.close();
    } catch (error) {
        console.error(`An error occurred for ${user}:`, error);
    }
}
reserveFood(users.aryan, 26);
// async function reserveFood(user, num) {
//     try {
//         const browser = await puppeteer.launch({
//             headless: false,
//             args: ["--window-size=1920,1080"],
//             defaultViewport: {
//                 width: 1530,
//                 height: 800,
//             },
//             executablePath:
//                 "C:/Program Files/Google/Chrome/Application/chrome.exe",
//         });

//         const page = await browser.newPage();
//         const pages = await browser.pages();
//         if (pages.length > 1) {
//             await pages[0].close(); // Close the first blank tab
//         }

//         // Navigate to the food reservation site
//         await page.goto("https://food.guilan.ac.ir/index.rose");
//         const inputSelector = ["#username", "#password"];

//         await page.evaluate(
//             (selector, user) => {
//                 const username = document.querySelector(selector[0]);
//                 const pass = document.querySelector(selector[1]);

//                 username.value = user.userName;
//                 pass.value = user.pass;
//             },
//             inputSelector,
//             user
//         );

//         await page.click("#login_btn_submit");

//         const parentSelector = "%{#iconGroup.id}_div";

//         await page.waitForTimeout(10000);
//         console.log("time passed---------------------------------");

//         await page.evaluate(() => {
//             document
//                 .getElementById("%{#iconGroup.id}_div")
//                 .firstElementChild.firstElementChild.click();
//         });
//         await page.waitForTimeout(5000);

//         await page.select("#selectself_selfListId", "1");

//         await page.click('input[value="تایید و ادامه"]');
//         // Continuously refresh the page until an option is available
//         let optionReserved = false;
//         let optionAvailable = false;

//         //for handling the alert after clicking the button
//         page.on("dialog", async (dialog) => {
//             await dialog.accept();
//         });

//         while (!optionReserved) {
//             await page.reload();
//             await new Promise((resolve) => setTimeout(resolve, 2500));

//             // Check if an option is available
//             optionAvailable = await page.evaluate((select) => {
//                 const reservationSection = document.getElementById(
//                     `buyFreeFoodIconSpanuserWeekReserves.selected${select}`
//                 );
//                 return reservationSection !== null;
//             }, num);

//             if (optionAvailable) {
//                 await page.evaluate((select) => {
//                     const reservationSection = document.getElementById(
//                         `buyFreeFoodIconSpanuserWeekReserves.selected${select}`
//                     ).firstElementChild;
//                     reservationSection.click();

//                     const submit = document.getElementById("doReservBtn");
//                     submit.click();
//                 }, num);
//             }

//             optionReserved = await page.evaluate((select) => {
//                 const successMassage = document.getElementById(select);
//                 return successMassage !== null;
//             }, "successMessages");
//         }
//         console.log(`${user} reservation was successfull.`);
//     } catch (error) {
//         console.error("An error occurred:", error);
//     }
// }
