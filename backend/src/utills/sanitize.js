const SENSITIVE_KEYS = [
  "password",
  "token",
  "accesstoken",
  "refreshtoken",
  "authorization",
  "cookie",
  "jwt",
  "apikey",
  "secret",
  "creditcard",
  "ssn",
];

const redact = (obj) => {
  if (!obj || typeof obj !== "object") return obj;

  const clone = Array.isArray(obj) ? [...obj] : { ...obj };

  for (const key in clone) {
    if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
      clone[key] = "[REDACTED]";
    } else if (typeof clone[key] === "object" && clone[key] !== null) {
      clone[key] = redact(clone[key]);
    }
  }

  return clone;
};

export { redact };