
import React, { useState, useEffect } from "react";
import Sun from "../assets/icons/ThemeToggle/Sun";
import Moon from "../assets/icons/ThemeToggle/Moon";

const ThemeToggleButton: React.FC = () => {
  type Theme = "light" | "dark";

  const [theme, setTheme] = useState<Theme>(
    (localStorage.getItem("theme") as Theme) || "light"
  );

  const updateThemeOnHtmlEl = (theme: Theme) => {
    document.documentElement.setAttribute("data-theme", theme);
  };

  useEffect(() => {
    updateThemeOnHtmlEl(theme);
  }, [theme]);

  const handleThemeToggle = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    updateThemeOnHtmlEl(newTheme);
  };

  return (
    <div className={`theme-toggle ${theme}`}>
      {/* Light Mode Button */}
      <div
        className={`theme-toggle-btn ${
          theme === "light" ? "light-active" : ""
        }`}
        onClick={() => handleThemeToggle("light")}
      >
        <Sun
          color={theme === "light" ? "white" : "var(--street-text-base)"}
        />
      </div>

      {/* Dark Mode Button */}
      <div
        className={`theme-toggle-btn ${
          theme === "dark" ? "dark-active" : ""
        }`}
        onClick={() => handleThemeToggle("dark")}
      >
        <Moon
          color={theme === "dark" ? "white" : "var(--street-text-base)"}
        />
      </div>
    </div>
  );
};

export default ThemeToggleButton;