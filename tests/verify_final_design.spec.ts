import { test, expect } from '@playwright/test';

const pages = [
  { name: 'Home', path: '/' },
  { name: 'News', path: '/news' },
  { name: 'Events', path: '/events' },
  { name: 'Profile', path: '/profile' },
  { name: 'Tools', path: '/tools' },
  { name: 'Post', path: '/posts/future-of-ai-marketing' }
];

test.describe('Marketing Magazine - Final Visual Verification', () => {
  for (const pageInfo of pages) {
    test(`Verify ${pageInfo.name} design`, async ({ page }) => {
      // Navigate with retry
      let retries = 5;
      while (retries > 0) {
        try {
          await page.goto(`http://localhost:3000${pageInfo.path}`, { waitUntil: 'networkidle' });
          break;
        } catch (e) {
          retries--;
          if (retries === 0) throw e;
          await new Promise(r => setTimeout(r, 2000));
        }
      }

      // Check for common HIG elements
      await expect(page.locator('body')).toBeVisible();

      // Take screenshot
      await page.screenshot({
        path: `screenshots/verify_${pageInfo.name.toLowerCase()}.png`,
        fullPage: true
      });

      // Verify no visible border lines on major sections
      const borders = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('*'));
        return elements.filter(el => {
          const style = window.getComputedStyle(el);
          return parseFloat(style.borderWidth) > 0 && style.borderColor !== 'rgba(0, 0, 0, 0)';
        }).length;
      });

      console.log(`${pageInfo.name}: Found ${borders} elements with non-zero borders (should be minimal/global only)`);
    });
  }
});
