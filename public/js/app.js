document.addEventListener("DOMContentLoaded", () => {
  const html = document.documentElement;

  const themeButton = document.getElementById("themeToggle");

  let currentTheme = localStorage.getItem("theme");

  if (!currentTheme) {
    currentTheme = "light";
  }

  html.setAttribute("data-bs-theme", currentTheme);

  updateThemeButton(themeButton, currentTheme);

  if (themeButton) {
    themeButton.addEventListener("click", () => {
      const current = html.getAttribute("data-bs-theme");

      const newTheme = current === "dark" ? "light" : "dark";

      html.setAttribute("data-bs-theme", newTheme);

      localStorage.setItem("theme", newTheme);

      updateThemeButton(themeButton, newTheme);
    });
  }
});

function updateThemeButton(button, theme) {
  if (!button) {
    return;
  }

  if (theme === "dark") {
    button.innerHTML = "☀️";

    button.setAttribute("title", "Switch to light mode");
  } else {
    button.innerHTML = "🌙";

    button.setAttribute("title", "Switch to dark mode");
  }
}
