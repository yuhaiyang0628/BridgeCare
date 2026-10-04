const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const htmlPath = '/Users/haiyang/WorkBuddy/2026-07-04-12-47-00/bridgecare-wireframes/wireframes.html';
const outputDir = '/Users/haiyang/WorkBuddy/2026-07-04-12-47-00/bridgecare-wireframes';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Load the wireframes HTML
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

  // Get all screen elements
  const screens = await page.$$eval('.screen', elements => {
    return elements.map(el => {
      const rect = el.getBoundingClientRect();
      return {
        id: el.id,
        name: el.dataset.name || el.id,
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height
      };
    });
  });

  console.log(`Found ${screens.length} screens to capture`);

  // Set viewport large enough to contain all screens
  await page.setViewport({ width: 1400, height: 16000 });

  // Re-load to get correct positions after viewport change
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

  // Re-evaluate positions
  const updatedScreens = await page.$$eval('.screen', elements => {
    return elements.map(el => {
      const rect = el.getBoundingClientRect();
      return {
        id: el.id,
        name: el.dataset.name || el.id,
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height
      };
    });
  });

  for (const screen of updatedScreens) {
    const filename = `${screen.name}.png`;
    const outputPath = path.join(outputDir, filename);

    console.log(`Capturing: ${screen.name} (${screen.width}x${screen.height}) at (${screen.x}, ${screen.y})`);

    // Screenshot just this screen element
    await page.screenshot({
      path: outputPath,
      clip: {
        x: screen.x,
        y: screen.y,
        width: Math.min(screen.width, 1400),
        height: screen.height
      },
      type: 'png'
    });

    console.log(`Saved: ${filename}`);
  }

  await browser.close();
  console.log(`Done! ${updatedScreens.length} PNGs saved to ${outputDir}`);
})();
