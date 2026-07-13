const root = document.documentElement;
root.classList.add("motion-ready");
const hero = document.querySelector(".hero");
const canvas = document.getElementById("perimeter-scan");
const ctx = canvas.getContext("2d");
const sceneFrame = document.querySelector(".scene-frame");
const sceneImage = document.getElementById("scene-image");
const sceneKicker = document.getElementById("scene-kicker");
const sceneTitle = document.getElementById("scene-title");
const serviceButtons = Array.from(document.querySelectorAll(".service-pill"));
const blueprintButtons = Array.from(document.querySelectorAll(".map-node"));
const blueprintOutput = document.querySelector(".blueprint-output");
const range = document.querySelector(".security-range");
const homeSchematic = document.querySelector(".home-schematic");
const walkthroughStep = document.getElementById("walkthrough-step");
const walkthroughTitle = document.getElementById("walkthrough-title");

const walkthroughStates = [
  {
    step: "01 / Gate secured",
    title: "The perimeter closes first.",
  },
  {
    step: "02 / Access verified",
    title: "Every entry point becomes intentional.",
  },
  {
    step: "03 / Site visible",
    title: "Cameras turn movement into evidence.",
  },
  {
    step: "04 / Power protected",
    title: "Solar backup keeps the system awake.",
  },
];

let width = 0;
let height = 0;
let ratio = 1;
let pointer = { x: 0.7, y: 0.38 };
let targetPointer = { x: 0.7, y: 0.38 };
let time = 0;

function resizeCanvas() {
  ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = canvas.clientWidth;
  height = canvas.clientHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function drawPerimeter() {
  time += 0.006;
  pointer.x += (targetPointer.x - pointer.x) * 0.08;
  pointer.y += (targetPointer.y - pointer.y) * 0.08;

  ctx.clearRect(0, 0, width, height);

  const cx = width * pointer.x;
  const cy = height * pointer.y;
  const sweep = (time * Math.PI * 2) % (Math.PI * 2);

  ctx.save();
  ctx.globalAlpha = 0.34;
  ctx.strokeStyle = "rgba(29, 245, 157, 0.28)";
  ctx.lineWidth = 1;

  for (let i = 0; i < 5; i += 1) {
    const radius = 95 + i * 82 + Math.sin(time * 4 + i) * 6;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(241, 29, 47, 0.24)";
  for (let i = 0; i < 8; i += 1) {
    const angle = sweep + i * 0.72;
    const x1 = cx + Math.cos(angle) * 40;
    const y1 = cy + Math.sin(angle) * 40;
    const x2 = cx + Math.cos(angle) * Math.max(width, height);
    const y2 = cy + Math.sin(angle) * Math.max(width, height);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
  const beam = ctx.createRadialGradient(cx, cy, 0, cx, cy, 420);
  beam.addColorStop(0, "rgba(29, 245, 157, 0.12)");
  beam.addColorStop(0.4, "rgba(241, 29, 47, 0.06)");
  beam.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = beam;
  ctx.fillRect(0, 0, width, height);

  ctx.restore();
  requestAnimationFrame(drawPerimeter);
}

function setPointer(event) {
  const bounds = hero.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width;
  const y = (event.clientY - bounds.top) / bounds.height;
  targetPointer = {
    x: Math.max(0, Math.min(1, x)),
    y: Math.max(0, Math.min(1, y)),
  };
  root.style.setProperty("--x", `${targetPointer.x * 100}%`);
  root.style.setProperty("--y", `${targetPointer.y * 100}%`);
}

function updateScene(button) {
  if (button.classList.contains("is-active")) return;

  serviceButtons.forEach((item) => item.classList.remove("is-active"));
  button.classList.add("is-active");
  sceneFrame.classList.add("is-changing");

  const nextImage = button.dataset.image;
  const nextAlt = button.dataset.alt;
  const nextKicker = button.dataset.kicker;
  const nextTitle = button.dataset.title;

  window.setTimeout(() => {
    sceneImage.src = nextImage;
    sceneImage.alt = nextAlt;
    sceneKicker.textContent = nextKicker;
    sceneTitle.textContent = nextTitle;
    sceneFrame.classList.remove("is-changing");
  }, 180);
}

function handleStageTilt(event) {
  const stage = event.currentTarget;
  const bounds = stage.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width - 0.5;
  const y = (event.clientY - bounds.top) / bounds.height - 0.5;
  stage.style.setProperty("--tilt-x", `${y * -8}deg`);
  stage.style.setProperty("--tilt-y", `${x * 10}deg`);
}

window.addEventListener("resize", resizeCanvas);
hero.addEventListener("pointermove", setPointer);

document.querySelector(".security-stage").addEventListener("pointermove", handleStageTilt);

serviceButtons.forEach((button) => {
  button.addEventListener("mouseenter", () => updateScene(button));
  button.addEventListener("focus", () => updateScene(button));
  button.addEventListener("click", () => updateScene(button));
});

blueprintButtons.forEach((button) => {
  button.addEventListener("click", () => {
    blueprintButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    blueprintOutput.textContent = button.dataset.blueprint;
  });
});

if (range && homeSchematic) {
  homeSchematic.dataset.layer = range.value;
  range.addEventListener("input", () => {
    const state = walkthroughStates[Number(range.value)];
    homeSchematic.dataset.layer = range.value;
    walkthroughStep.textContent = state.step;
    walkthroughTitle.textContent = state.title;
  });
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll(".section-reveal").forEach((section) => {
  revealObserver.observe(section);
});

resizeCanvas();
drawPerimeter();
