import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Verify Main Feed Light Mode
        await page.goto("http://localhost:3003")
        await page.evaluate("document.documentElement.classList.remove('dark')")
        await page.wait_for_timeout(1000)
        await page.screenshot(path="verify_main_light.png", full_page=True)

        # Verify Editor Light Mode
        await page.goto("http://localhost:3003/editor")
        await page.evaluate("document.documentElement.classList.remove('dark')")
        await page.wait_for_timeout(1000)
        await page.screenshot(path="verify_editor_light.png", full_page=True)

        # Verify Profile Light Mode
        await page.goto("http://localhost:3003/profile")
        await page.evaluate("document.documentElement.classList.remove('dark')")
        await page.wait_for_timeout(1000)
        await page.screenshot(path="verify_profile_light.png", full_page=True)

        # Verify Tools Light Mode
        await page.goto("http://localhost:3003/tools")
        await page.evaluate("document.documentElement.classList.remove('dark')")
        await page.wait_for_timeout(1000)
        await page.screenshot(path="verify_tools_light.png", full_page=True)

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
