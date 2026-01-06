import puppeteer from "puppeteer";

export const generatePdf = async (html) => {
  console.log("Puppeteer executable:", puppeteer.executablePath());
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
  });

  await browser.close();
  return pdfBuffer;
};
