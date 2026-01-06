import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
Handlebars.registerHelper("eq", function (a, b) {
  return a === b;
});
Handlebars.registerHelper("array", function (...args) {
  return args.slice(0, -1);
});

Handlebars.registerHelper("or", function (...args) {
  return args.slice(0, -1).some(Boolean);
});

Handlebars.registerHelper("notIn", function (value, options) {
  const list = options.hash.values || [];
  return value && !list.includes(value);
});
Handlebars.registerHelper("formatDate", function (date) {
  if (!date) return "";

  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();

  return `${dd}/${mm}/${yyyy}`;
});
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
  const wsiLogoPath = path.join(process.cwd(), "public", "assets", "Wsib.png");
  const wsibLogo = fs.readFileSync(wsiLogoPath);
  const wsiblogoBase64 = `data:image/png;base64,${wsibLogo.toString("base64")}`;

  return template({
    ...data,
    companyLogo: logoBase64,
    WsibLogo: wsiblogoBase64, // embed directly
  });
};
