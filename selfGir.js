const puppeteer = require("puppeteer-core");
import { users } from "./users.js";

async function typeIntoInput(page, selector, text) {
    await page.waitForSelector(selector);
    await page.click(selector, { delay: 20 });
    await page.type(selector, text, { delay: 20 });
}

async function reserveFood(user, num) {
    let refreshCount = 0;
    try {
        const browser = await puppeteer.launch({
            headless: false, // Set to false if you need to see the browser
            args: ["--window-size=1920,1080", "--disable-infobars", "--disable-extensions"],
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
        await page.goto("https://samad.app/login");
        await new Promise((resolve) => setTimeout(resolve, 6000));

        await page.click(".input-btn-edit");

        await page.waitForSelector("ul.select-none");

        await page.evaluate(() => {
            const options = Array.from(document.querySelectorAll("ul.select-none > li"));
            const gilanOption = options.find((option) => option.textContent.trim() === "دانشگاه گیلان");
            if (gilanOption) {
                gilanOption.click();
            }
        });

        console.log("uni selected");

        await typeIntoInput(page, 'input[name="username"]', user.userName);
        await typeIntoInput(page, 'input[name="password"]', user.pass);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        await page.click("button.auth-btn");
        console.log(`${user.userName} logged in`);

        try {
            await page.waitForSelector("button.app-button-nurture");
            await page.click("button.app-button-nurture");
            console.log("Entered student interface");
        } catch (e) {
            console.error(e);
        }

        await page.waitForSelector("button.app-button-glass");
        await page.click("button.app-button-glass");
        console.log("Entered old version");

        const parentSelector = ".icon";

        await page.waitForSelector(parentSelector);

        await page.evaluate(() => {
            document.getElementById("%{#iconGroup.id}_div").firstElementChild.firstElementChild.click();
            console.log("group id clicked");
        });

        await page.waitForSelector("#selectself_selfListId");
        await page.select("#selectself_selfListId", "1");
        await page.click('input[value="تایید و ادامه"]');
        console.log("self is selected");

        let optionReserved = false;
        let optionAvailable = false;

        page.on("dialog", async (dialog) => {
            await dialog.accept();
        });

        while (!optionReserved) {
            try {
                await new Promise((resolve) => setTimeout(resolve, 404));

                optionAvailable = await page.evaluate((select) => {
                    const reservationSection = document.getElementById(
                        `buyFreeFoodIconSpanuserWeekReserves.selected${select}`
                    );
                    return reservationSection !== null;
                }, num);

                if (optionAvailable) {
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

reserveFood(users.mahan, 5)