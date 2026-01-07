import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

const isProduction = process.env.NODE_ENV === "production";

export const generatePdf = async (html) => {
  console.log("Chromium path:", await chromium.executablePath());
  console.log("Chromium args:", chromium.args);
  const browser = await puppeteer.launch({
    args: isProduction
      ? [...chromium.args, "--disable-gpu", "--disable-software-rasterizer"]
      : [],
    executablePath: isProduction ? await chromium.executablePath() : undefined, // local Chrome
    headless: true,
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
  });

  await browser.close();
  return pdfBuffer;
};
