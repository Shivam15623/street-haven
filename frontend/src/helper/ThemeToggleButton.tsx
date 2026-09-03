import React, { useState, useEffect } from "react";
import Sun from "../assets/icons/ThemeToggle/Sun";
import Moon from "../assets/icons/ThemeToggle/Moon";

const ThemeToggleButton: React.FC = () => {
  type Theme = "light" | "dark";

  const [theme, setTheme] = useState<Theme>(
    (localStorage.getItem("theme") as Theme) || "light"
  );

  const [isMobile, setIsMobile] = useState(false);

  // Update <html data-theme="dark|light">
  const updateThemeOnHtmlEl = (theme: Theme) => {
    document.documentElement.setAttribute("data-theme", theme);
  };

  // Load saved theme
  useEffect(() => {
    updateThemeOnHtmlEl(theme);
  }, [theme]);

  // Detect mobile screen width
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 640); // 640px = Tailwind's "sm"
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleThemeToggle = (newTheme?: Theme) => {
    const nextTheme = newTheme || (theme === "light" ? "dark" : "light"); // for mobile toggle
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    updateThemeOnHtmlEl(nextTheme);
  };

  return (
    <>
      {isMobile ? (
        // 🌙 MOBILE: simple toggle button
        <button
          className="p-2 rounded-circle btn btn-neutral-200 d-flex flex-row align-items-center justify-content-between text-sm sm:text-md transition-colors"
          onClick={() => handleThemeToggle()}
          aria-label="Toggle theme"
        >
          {theme === "light" ? (
            <Moon color="var(--street-text-base)" />
          ) : (
            <Sun color="white" />
          )}
        </button>
      ) : (
        // 💡 DESKTOP: two-button switch UI
        <div className={`theme-toggle ${theme}`}>
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
      )}
    </>
  );
};

export default ThemeToggleButton;
