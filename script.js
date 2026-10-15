const root = document.documentElement;
const themeButton = document.getElementById("theme-toggle");
const menuButton = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");
const typedEl = document.getElementById("typed");


const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;




function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  themeButton.textContent = "theme: " + theme;
  updateRainColors(); // keep the background effect in sync
}


function loadTheme() {
  let saved = "dark";
  try {
    saved = localStorage.getItem("theme") || "dark";
  } catch (e) {
    // Storage may be blocked; keep the default
  }
  applyTheme(saved);
}


themeButton.addEventListener("click", function () {
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(next);
  try {
    localStorage.setItem("theme", next);
  } catch (e) {
  
  }
});




menuButton.addEventListener("click", function () {
  const isOpen = navLinks.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});


navLinks.querySelectorAll("a").forEach(function (link) {
  link.addEventListener("click", function () {
    navLinks.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  });
});




document.querySelectorAll('a[href^="#"]').forEach(function (link) {
  link.addEventListener("click", function (event) {
    const target = document.querySelector(link.getAttribute("href"));
    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
    }
  });
});


const phrases = ["Full Stack Developer", "Web Designer ", "App  Developer", "BULSU Student", "Information Technology Student"];
let phraseIndex = 0;
let charIndex = phrases[0].length;
let deleting = true;


function typeStep() {
  const current = phrases[phraseIndex];
  charIndex += deleting ? -1 : 1;
  typedEl.textContent = current.substring(0, charIndex);

  let delay = deleting ? 45 : 85;
  if (!deleting && charIndex === current.length) {
    deleting = true;    
    delay = 1800;
  } else if (deleting && charIndex === 0) {
    deleting = false;    
    phraseIndex = (phraseIndex + 1) % phrases.length;
    delay = 350;
  }
  setTimeout(typeStep, delay);
}


function startTyping() {
  if (!reducedMotion) {
    setTimeout(typeStep, 1500);
  }
}



const tabs = document.querySelectorAll(".tab");


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




const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry, i) {
      if (entry.isIntersecting) {
        
        setTimeout(function () { entry.target.classList.add("visible"); }, i * 120);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealItems.forEach(function (item) { observer.observe(item); });
} else {

  revealItems.forEach(function (item) { item.classList.add("visible"); });
}



const canvas = document.getElementById("rain");
const ctx = canvas.getContext("2d");
const lineCount = 16;      
let lineColor = "168, 85, 247"; 


function updateRainColors() {
  const styles = getComputedStyle(root);
  lineColor = styles.getPropertyValue("--rain-rgb").trim() || lineColor;
}


function resizeRain() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  updateRainColors();
  if (reducedMotion) drawLines(0);
}


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
    
    const alpha = 0.18 + 0.5 * Math.sin(t * Math.PI);
    ctx.strokeStyle = "rgba(" + lineColor + ", " + alpha.toFixed(2) + ")";
    ctx.stroke();
  }
}


function animateRain(timestamp) {
  drawLines(timestamp / 1000);
  requestAnimationFrame(animateRain);
}

window.addEventListener("resize", resizeRain);



const loader = document.getElementById("loader");
const bootLog = document.getElementById("boot-log");
const bootBar = document.getElementById("boot-bar");


const bootLines = [
  { at: 0,  text: "> booting portfolio v1.0" },
  { at: 15, text: "> loading style.css ........ ok" },
  { at: 35, text: "> loading script.js ........ ok" },
  { at: 55, text: "> mounting ./projects ...... ok" },
  { at: 75, text: "> checking contact info .... ok" },
  { at: 92, text: "> ready. welcome." }
];
let nextLine = 0;


function finishLoading() {
  loader.classList.add("done");
  document.body.classList.remove("loading");
  startTyping();
}


function runLoader() {

  if (reducedMotion) {
    finishLoading();
    return;
  }

  let progress = 0;
  const timer = setInterval(function () {

    progress = Math.min(100, progress + Math.random() * 8 + 3);

 
    while (nextLine < bootLines.length && progress >= bootLines[nextLine].at) {
      bootLog.textContent += bootLines[nextLine].text + "\n";
      nextLine++;
    }

  
    const filled = Math.floor(progress / 5);
    bootBar.textContent = "[" + "#".repeat(filled) + "-".repeat(20 - filled) + "] " + Math.floor(progress) + "%";

    if (progress >= 100) {
      clearInterval(timer);
      setTimeout(finishLoading, 500); // short pause on 100%
    }
  }, 120);
}


loadTheme();
resizeRain();
if (!reducedMotion) {
  requestAnimationFrame(animateRain);
}
runLoader();