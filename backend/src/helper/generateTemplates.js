import fs from "fs";
import path from "path";
import Handlebars from "handlebars";

export const buildHtmlFromTemplate = (templateName, data) => {
  const filePath = path.join(
    process.cwd(),
    "src",
    "templates",
    "pdf",
    `${templateName}.hbs`
  );

  const html = fs.readFileSync(filePath, "utf-8");

  const template = Handlebars.compile(html);

  // Read logo from backend and convert to Base64
  const logoPath = path.join(process.cwd(), "public", "assets", "SiteIcon.png");
  const logo = fs.readFileSync(logoPath);
  const logoBase64 = `data:image/png;base64,${logo.toString("base64")}`;

  return template({
    ...data,
    companyLogo: logoBase64, // embed directly
  });
};
