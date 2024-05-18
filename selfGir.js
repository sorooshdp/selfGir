const puppeteer = require("puppeteer-core");

const users = {
    soroosh: { userName: "1400012268022", pass: "4311745214" },
    saeed: { userName: "1400010121101", pass: "2700326970" },
    mahan: { userName: "1400012137020", pass: "0150329075" },
    aryan: { userName: "1401012137052", pass: "2581513381" },
    amirreza: { userName: "1400012137028", pass: "9119012218" },
    sina: { userName:"1402121320020", pass:"6660590978"},
};

async function typeIntoInput(page, selector, text) {
    await page.waitForSelector(selector);
    await page.click(selector, { delay: 100 });
    await page.type(selector, text, { delay: 100 });
}

async function reserveFood(user, num) {
    let refreshCount = 0;

    try {
        const browser = await puppeteer.launch({
            headless: false,
            args: ["--window-size=1920,1080"],
            defaultViewport: {
                width: 1530,
                height: 800,
            },
            executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
        });

        const page = await browser.newPage();
        const pages = await browser.pages();
        if (pages.length > 1) {
            await pages[0].close();
        }

        // Navigate to the food reservation site
        await page.goto("https://samad.app/login");
        await new Promise((resolve) => setTimeout(resolve, 3000));

        await page.click(".input-btn-edit");

        // Wait for the list to appear
        await page.waitForSelector("ul.select-none");

        // Find the element with the text "دانشگاه گیلان" and click it
        await page.evaluate(() => {
            const options = Array.from(document.querySelectorAll("ul.select-none > li"));
            const gilanOption = options.find((option) => option.textContent.trim() === "دانشگاه گیلان");
            if (gilanOption) {
                gilanOption.click();
            }
        });

        console.log("uni selected");

        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Fill in the username and password fields
        await typeIntoInput(page, 'input[name="username"]', user.userName);
        await typeIntoInput(page, 'input[name="password"]', user.pass);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        await page.click("button.auth-btn");
        console.log(`${user.userName} logged in`);

        // await page.waitForSelector("button.app-button-nurture");
        // await page.click("button.app-button-nurture");
        // console.log("Entered student interface");

        await page.waitForSelector("button.app-button-glass");
        await page.click("button.app-button-glass");
        console.log("Entered old version");

        const parentSelector = ".icon";

        // Wait for the icon to be present before clicking
        await page.waitForSelector(parentSelector);

        await page.evaluate(() => {
            document.getElementById("%{#iconGroup.id}_div").firstElementChild.firstElementChild.click();
            console.log("group id clicked");
        });

        // Wait for the select dropdown to be present before interacting with it
        await page.waitForSelector("#selectself_selfListId");
        await page.select("#selectself_selfListId", "1");
        await page.click('input[value="تایید و ادامه"]');
        console.log("self is selected");
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
                await new Promise((resolve) => setTimeout(resolve, 2000));
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
                    console.log(`refreshing for ${user.userName} count: ${refreshCount}`);
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

reserveFood(users.sina, 3);
