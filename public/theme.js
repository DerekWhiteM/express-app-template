/*

const switcher = document.getElementById("theme-switcher");
const doc = document.documentElement;

let current_theme = localStorage.getItem("theme");

function setTheme(theme) {
  current_theme = theme;
  localStorage.setItem("theme", theme);
  return doc.setAttribute("color-scheme", theme);
}

if (current_theme) {
  current_theme === "light" ? setTheme("light") : setTheme("dark");
}

if (switcher) {
  switcher.onclick = () => {
    current_theme === "light" ? setTheme("dark") : setTheme("light");
  };
}

*/