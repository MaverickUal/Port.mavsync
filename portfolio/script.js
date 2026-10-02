/* script.js
   Interactive features:
   1. Dark / light theme toggle (remembers choice)
   2. Hamburger menu for mobile
   3. Smooth scrolling for anchor links
   4. Typing effect in the hero
   5. Editor tabs (profile.js / photo.png)
   6. Scroll reveal animations
   7. Animated purple lines background
   8. Terminal boot loading screen (runs first)
*/

// Grab the elements we need from the page
const root = document.documentElement;
const themeButton = document.getElementById("theme-toggle");
const menuButton = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");
const typedEl = document.getElementById("typed");

// True if the visitor asked their device for less motion
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- 1. Dark / light theme ---------- */

// Apply a theme ("dark" or "light") and update the button label
function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  themeButton.textContent = "theme: " + theme;
  updateRainColors(); // keep the background effect in sync
}

// Load the saved theme, or fall back to dark
function loadTheme() {
  let saved = "dark";
  try {
    saved = localStorage.getItem("theme") || "dark";
  } catch (e) {
    // Storage may be blocked; keep the default
  }
  applyTheme(saved);
}

// Switch themes when the button is clicked
themeButton.addEventListener("click", function () {
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(next);
  try {
    localStorage.setItem("theme", next);
  } catch (e) {
    // Ignore storage errors
  }
});

/* ---------- 2. Hamburger menu ---------- */

// Show or hide the nav links on small screens
menuButton.addEventListener("click", function () {
  const isOpen = navLinks.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

// Close the menu after a link is chosen
navLinks.querySelectorAll("a").forEach(function (link) {
  link.addEventListener("click", function () {
    navLinks.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  });
});

/* ---------- 3. Smooth scroll ---------- */

// Scroll smoothly to the section an anchor link points to
document.querySelectorAll('a[href^="#"]').forEach(function (link) {
  link.addEventListener("click", function (event) {
    const target = document.querySelector(link.getAttribute("href"));
    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
    }
  });
});

/* ---------- 4. Typing effect ---------- */

// Edit these phrases to describe yourself
const phrases = ["Full Stack Developer", "Web Designer ", "App  Developer", "BULSU Student", "Information Technology Student"];
let phraseIndex = 0;
let charIndex = phrases[0].length;
let deleting = true;

// Type or delete one letter, then schedule the next step
function typeStep() {
  const current = phrases[phraseIndex];
  charIndex += deleting ? -1 : 1;
  typedEl.textContent = current.substring(0, charIndex);

  let delay = deleting ? 45 : 85;
  if (!deleting && charIndex === current.length) {
    deleting = true;      // finished typing: pause, then delete
    delay = 1800;
  } else if (deleting && charIndex === 0) {
    deleting = false;     // finished deleting: go to the next phrase
    phraseIndex = (phraseIndex + 1) % phrases.length;
    delay = 350;
  }
  setTimeout(typeStep, delay);
}

// Start typing (called once the loading screen is gone)
function startTyping() {
  if (!reducedMotion) {
    setTimeout(typeStep, 1500);
  }
}

/* ---------- 5. Editor tabs ---------- */

const tabs = document.querySelectorAll(".tab");

// Show the pane that belongs to the clicked tab and hide the others
tabs.forEach(function (tab) {
  tab.addEventListener("click", function () {
    tabs.forEach(function (t) {
      const active = t === tab;
      t.classList.toggle("active", active);
      t.setAttribute("aria-selected", String(active));
      document.getElementById(t.getAttribute("aria-controls")).hidden = !active;
    });
  });
});

/* ---------- 6. Scroll reveal ---------- */

// Fade elements in once they scroll into view
const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry, i) {
      if (entry.isIntersecting) {
        // Small stagger so cards appear one after another
        setTimeout(function () { entry.target.classList.add("visible"); }, i * 120);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealItems.forEach(function (item) { observer.observe(item); });
} else {
  // Old browsers: just show everything
  revealItems.forEach(function (item) { item.classList.add("visible"); });
}

/* ---------- 7. Animated purple lines background ---------- */

const canvas = document.getElementById("rain");
const ctx = canvas.getContext("2d");
const lineCount = 16;      // how many flowing lines to draw
let lineColor = "168, 85, 247"; // purple, replaced by --rain-rgb from style.css

// Read the current theme's line color from the CSS variable
function updateRainColors() {
  const styles = getComputedStyle(root);
  lineColor = styles.getPropertyValue("--rain-rgb").trim() || lineColor;
}

// Match the canvas size to the window (and redraw once if motion is reduced)
function resizeRain() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  updateRainColors();
  if (reducedMotion) drawLines(0);
}

// Draw one frame of wavy lines; "time" (in seconds) moves them along
function drawLines(time) {
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.lineWidth = 1.5;

  for (let i = 0; i < lineCount; i++) {
    const t = i / (lineCount - 1);          // 0 (top line) to 1 (bottom line)
    const baseY = h * (0.12 + 0.76 * t);    // spread lines down the page
    const amp = 28 + 26 * Math.sin(i * 0.9); // each line waves a different height

    ctx.beginPath();
    for (let x = 0; x <= w + 8; x += 8) {
      const y = baseY
        + Math.sin(x * 0.004 + time * 0.7 + i * 0.45) * amp
        + Math.sin(x * 0.011 - time * 0.45 + i * 0.8) * amp * 0.35;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    // Lines near the middle are brighter, the outer ones fade out
    const alpha = 0.18 + 0.5 * Math.sin(t * Math.PI);
    ctx.strokeStyle = "rgba(" + lineColor + ", " + alpha.toFixed(2) + ")";
    ctx.stroke();
  }
}

// Animation loop
function animateRain(timestamp) {
  drawLines(timestamp / 1000);
  requestAnimationFrame(animateRain);
}

window.addEventListener("resize", resizeRain);

/* ---------- 8. Terminal boot loading screen ---------- */

const loader = document.getElementById("loader");
const bootLog = document.getElementById("boot-log");
const bootBar = document.getElementById("boot-bar");

// Log lines appear when the progress reaches their "at" value
const bootLines = [
  { at: 0,  text: "> booting portfolio v1.0" },
  { at: 15, text: "> loading style.css ........ ok" },
  { at: 35, text: "> loading script.js ........ ok" },
  { at: 55, text: "> mounting ./projects ...... ok" },
  { at: 75, text: "> checking contact info .... ok" },
  { at: 92, text: "> ready. welcome." }
];
let nextLine = 0;

// Hide the loading screen and let the page scroll and animate
function finishLoading() {
  loader.classList.add("done");
  document.body.classList.remove("loading");
  startTyping();
}

// Fill the progress bar to 100%, printing log lines along the way
function runLoader() {
  // Skip the animation for visitors who prefer reduced motion
  if (reducedMotion) {
    finishLoading();
    return;
  }

  let progress = 0;
  const timer = setInterval(function () {
    // Move forward by a random amount so it feels like real loading
    progress = Math.min(100, progress + Math.random() * 8 + 3);

    // Print any log lines that are due
    while (nextLine < bootLines.length && progress >= bootLines[nextLine].at) {
      bootLog.textContent += bootLines[nextLine].text + "\n";
      nextLine++;
    }

    // Draw the text progress bar, e.g. [#########-----------] 45%
    const filled = Math.floor(progress / 5);
    bootBar.textContent = "[" + "#".repeat(filled) + "-".repeat(20 - filled) + "] " + Math.floor(progress) + "%";

    if (progress >= 100) {
      clearInterval(timer);
      setTimeout(finishLoading, 500); // short pause on 100%
    }
  }, 120);
}

// Start everything: theme, background, then the loading screen
loadTheme();
resizeRain();
if (!reducedMotion) {
  requestAnimationFrame(animateRain);
}
runLoader();