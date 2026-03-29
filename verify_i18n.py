import asyncio
import os
from playwright.async_api import async_playwright

async def verify():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page = await context.new_page()

        print("Opening site...")
        await page.goto('http://localhost:3000')
        await page.wait_for_load_state('networkidle')

        # Take screenshot of English home
        await page.screenshot(path='screenshots/en_home.png')
        print("Captured en_home.png")

        # Go to admin settings and change language
        print("Navigating to admin settings...")
        await page.goto('http://localhost:3000/admin/settings')
        await page.wait_for_selector('select#site_language')

        print("Switching language to Russian...")
        await page.select_option('select#site_language', 'ru')
        await page.click('button:has-text("Save Global Configuration")')

        # Wait for success message
        await page.wait_for_selector('text=Settings updated successfully')
        await page.screenshot(path='screenshots/admin_settings_ru.png')
        print("Captured admin_settings_ru.png")

        # Go back to home
        print("Verifying Russian home...")
        await page.goto('http://localhost:3000')
        await page.wait_for_load_state('networkidle')

        # Check for Russian text (e.g., ГЛАВНАЯ in header)
        await page.wait_for_selector('text=ГЛАВНАЯ')
        await page.screenshot(path='screenshots/ru_home.png')
        print("Captured ru_home.png")

        # Verify News page
        print("Verifying Russian News page...")
        await page.click('text=НОВОСТИ')
        await page.wait_for_url('**/news')
        await page.screenshot(path='screenshots/ru_news.png')
        print("Captured ru_news.png")

        await browser.close()

if __name__ == "__main__":
    if not os.path.exists('screenshots'):
        os.makedirs('screenshots')
    asyncio.run(verify())
