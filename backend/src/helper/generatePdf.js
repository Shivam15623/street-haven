import puppeteer from "puppeteer";
const CHROME_PATH = process.env.PUPPETEER_EXECUTABLE_PATH;
export const generatePdf = async (html) => {
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: CHROME_PATH,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--single-process",
    ],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
  });

  await page.close();
  await browser.close();

  return pdfBuffer;
};
