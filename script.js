const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const contactForm = document.querySelector("#contactForm");
const formToast = document.querySelector("#formToast");
const pageLoader = document.querySelector("#pageLoader");
const loaderPercent = document.querySelector("#loaderPercent");
const loaderProgress = document.querySelector("#loaderProgress");
const hero = document.querySelector(".hero");
const heroDots = document.querySelector(".hero-dots");

if (pageLoader && loaderPercent && loaderProgress) {
  let progress = 0;
  const timer = window.setInterval(() => {
    progress += 1;
    loaderPercent.textContent = `${progress}%`;
    loaderProgress.style.width = `${progress}%`;

    if (progress === 100) {
      window.clearInterval(timer);
      window.setTimeout(() => {
        pageLoader.classList.add("done");
        document.body.classList.remove("is-loading");
      }, 250);
    }
  }, 20);
}

navToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  }
});

let toastTimer;

const showToast = (message, type = "success") => {
  if (!formToast) return;

  formToast.textContent = message;
  formToast.classList.toggle("error", type === "error");
  formToast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    formToast.classList.remove("show");
  }, 3600);
};

contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const requiredFields = contactForm.querySelectorAll("[required]");
  requiredFields.forEach((field) => {
    field.value = field.value.trim();
  });

  if (!contactForm.checkValidity()) {
    contactForm.reportValidity();
    return;
  }

  const submitButton = contactForm.querySelector('button[type="submit"]');
  const originalButtonText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = "Processing...";
  showToast("Processing...");

  try {
    const formData = new FormData(contactForm);
    formData.set("_replyto", formData.get("email"));

    const response = await fetch(contactForm.action, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.message || "Message failed");
    }

    contactForm.reset();
    showToast("Successfully sent.");
  } catch (error) {
    showToast(error.message || "Message could not be sent. Please try again.", "error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
  }
});

if (hero && heroDots) {
  const ctx = heroDots.getContext("2d");
  const blips = [];
  let width = 0;
  let height = 0;

  const createBlip = () => ({
    angle: Math.random() * Math.PI * 2,
    radius: Math.random() * 0.42 + 0.12,
    speed: (Math.random() * 0.00055 + 0.00025) * (Math.random() > 0.5 ? 1 : -1),
    size: Math.random() * 2 + 2,
    color: Math.random() > 0.68 ? "189, 96, 66" : "59, 115, 85",
    pulse: Math.random() * Math.PI * 2,
  });

  const resizeDots = () => {
    const rect = heroDots.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2.5);
    width = Math.round(rect.width);
    height = Math.round(rect.height);
    heroDots.width = Math.round(width * ratio);
    heroDots.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.imageSmoothingEnabled = true;

    blips.length = 0;
    const count = Math.max(18, Math.floor(width / 70));
    for (let index = 0; index < count; index += 1) {
      blips.push(createBlip());
    }
  };

  const drawDots = (time = 0) => {
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.globalCompositeOperation = "source-over";

    const cx = width * 0.72;
    const cy = height * 0.48;
    const maxRadius = Math.min(width, height) * 0.62;
    const scanAngle = time * 0.00042;

    for (let index = 1; index <= 5; index += 1) {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(89, 111, 159, ${0.06 + index * 0.01})`;
      ctx.lineWidth = 1;
      ctx.arc(cx, cy, (maxRadius / 5) * index, 0, Math.PI * 2);
      ctx.stroke();
    }

    for (let index = 0; index < 10; index += 1) {
      const angle = (Math.PI * 2 * index) / 10 + Math.sin(time * 0.00018) * 0.08;
      ctx.beginPath();
      ctx.strokeStyle = "rgba(23, 33, 28, 0.045)";
      ctx.lineWidth = 1;
      ctx.moveTo(cx + Math.cos(angle) * 36, cy + Math.sin(angle) * 36);
      ctx.lineTo(cx + Math.cos(angle) * maxRadius, cy + Math.sin(angle) * maxRadius);
      ctx.stroke();
    }

    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxRadius);
    gradient.addColorStop(0, "rgba(59, 115, 85, 0.13)");
    gradient.addColorStop(0.18, "rgba(59, 115, 85, 0.05)");
    gradient.addColorStop(1, "rgba(59, 115, 85, 0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, maxRadius, scanAngle - 0.26, scanAngle + 0.04);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = "rgba(59, 115, 85, 0.34)";
    ctx.lineWidth = 1.5;
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(scanAngle) * maxRadius, cy + Math.sin(scanAngle) * maxRadius);
    ctx.stroke();

    blips.forEach((blip) => {
      blip.angle += blip.speed;
      blip.pulse += 0.035;
      const radius = maxRadius * blip.radius;
      const x = cx + Math.cos(blip.angle) * radius;
      const y = cy + Math.sin(blip.angle) * radius;
      const alpha = 0.28 + Math.sin(blip.pulse) * 0.12;

      ctx.beginPath();
      ctx.fillStyle = `rgba(${blip.color}, ${alpha})`;
      ctx.arc(x, y, blip.size + Math.sin(blip.pulse) * 0.7, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();

    requestAnimationFrame(drawDots);
  };

  const resizeObserver = new ResizeObserver(resizeDots);
  resizeObserver.observe(hero);
  window.addEventListener("resize", resizeDots);
  if (document.fonts) {
    document.fonts.ready.then(resizeDots);
  }
  resizeDots();
  requestAnimationFrame(drawDots);
}
