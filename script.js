// Scroll animations + envelope open FX + synced background scroll
document.addEventListener("DOMContentLoaded", () => {
  const fadeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
  );
  document.querySelectorAll(".fade-in-up").forEach((el) => fadeObserver.observe(el));

  setupSlideCards();
  setupSectionTitleFade();
  setupScheduleTimeline();
  setupClosingCouple();
  setupInviteEnvelope();
  setupBackgroundScroll();
  setupAlbumCarousel();
  setupMusicToggle();
});

function setupMusicToggle() {
  const btn = document.getElementById("music-btn");
  const audio = document.getElementById("invite-music");
  const shell = document.querySelector(".invite-shell");
  if (!btn || !audio) return;

  const pad = 16;
  const btnSize = 48;

  function placeBtn() {
    let bottom = pad;
    let right = pad;

    if (window.visualViewport) {
      const vv = window.visualViewport;
      // Phần bị UI trình duyệt chiếm ở đáy (home bar / thanh địa chỉ)
      const gapBottom = Math.max(0, window.innerHeight - (vv.height + vv.offsetTop));
      bottom = pad + gapBottom;
    }

    if (shell) {
      const rect = shell.getBoundingClientRect();
      right = Math.max(pad, Math.round(window.innerWidth - rect.right + pad));
      const maxRight = Math.max(pad, Math.round(window.innerWidth - rect.left - btnSize - pad));
      right = Math.min(right, maxRight);
    }

    btn.style.right = `${right}px`;
    btn.style.bottom = `${bottom}px`;
    btn.style.left = "auto";
    btn.style.top = "auto";
  }

  function schedulePlace() {
    placeBtn();
    requestAnimationFrame(placeBtn);
  }

  function syncHtmlLock() {
    document.documentElement.classList.toggle(
      "invite-locked",
      document.body.classList.contains("invite-locked")
    );
  }

  function hasMusic() {
    if (audio.currentSrc) return true;
    if (audio.getAttribute("src")) return true;
    return !!audio.querySelector("source[src]");
  }

  function setPlaying(on) {
    btn.classList.toggle("is-on", on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.setAttribute("aria-label", on ? "Tat nhac" : "Bat nhac");
    btn.title = on ? "Tắt nhạc" : "Bật nhạc";
  }

  async function toggleMusic() {
    if (!hasMusic()) {
      console.info("Chưa có link nhạc. Thêm <source src=\"...\"> vào #invite-music.");
      return;
    }

    try {
      if (audio.paused) {
        await audio.play();
        setPlaying(true);
      } else {
        audio.pause();
        setPlaying(false);
      }
    } catch (err) {
      setPlaying(false);
      console.warn("Không phát được nhạc:", err);
    }
  }

  btn.addEventListener("click", toggleMusic);
  audio.addEventListener("ended", () => setPlaying(false));
  audio.addEventListener("pause", () => {
    if (!audio.ended) setPlaying(false);
  });
  audio.addEventListener("play", () => setPlaying(true));

  window.addEventListener("resize", schedulePlace);
  window.addEventListener("orientationchange", schedulePlace);
  window.addEventListener("pageshow", schedulePlace);
  window.addEventListener("load", schedulePlace);
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", schedulePlace);
    window.visualViewport.addEventListener("scroll", schedulePlace);
  }

  const home = document.getElementById("home");
  if (home) {
    const homeMo = new MutationObserver(schedulePlace);
    homeMo.observe(home, { attributes: true, attributeFilter: ["class"] });
  }

  const bodyMo = new MutationObserver(() => {
    syncHtmlLock();
    schedulePlace();
  });
  bodyMo.observe(document.body, { attributes: true, attributeFilter: ["class"] });

  syncHtmlLock();
  schedulePlace();
  setTimeout(schedulePlace, 50);
  setTimeout(schedulePlace, 250);
  setTimeout(schedulePlace, 800);
}
function setupSectionTitleFade() {
  const titles = document.querySelectorAll(".section-title-fade");
  if (!titles.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.35, rootMargin: "0px 0px -6% 0px" }
  );

  titles.forEach((title) => observer.observe(title));
}

function setupScheduleTimeline() {
  const track = document.getElementById("schedule-track");
  const fill = document.getElementById("schedule-line-fill");
  const items = document.querySelectorAll(".schedule-item");
  if (!track || !fill) return;

  let ticking = false;

  function updateLine() {
    ticking = false;
    const rect = track.getBoundingClientRect();
    const viewH = window.innerHeight || 1;
    // Đường line bắt đầu chạy khi đầu track vào giữa màn, đầy khi đáy track gần đáy màn
    const start = viewH * 0.72;
    const end = viewH * 0.28;
    const progress = Math.min(1, Math.max(0, (start - rect.top) / (start - end + rect.height)));
    fill.style.transform = `scaleY(${progress.toFixed(4)})`;
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateLine);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  if (!items.length) return;
  const itemObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          itemObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.45, rootMargin: "0px 0px -8% 0px" }
  );
  items.forEach((item) => itemObserver.observe(item));
}

function setupClosingCouple() {
  const block = document.getElementById("closing-couple");
  if (!block) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.35, rootMargin: "0px 0px -8% 0px" }
  );
  observer.observe(block);
}function setupSlideCards() {
  const cards = document.querySelectorAll(".invite-slide-card");
  if (!cards.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );

  cards.forEach((card) => observer.observe(card));
}

function setupAlbumCarousel() {
  const items = document.querySelectorAll(".carousel-item");
  const prevBtn = document.getElementById("carousel-prev");
  const nextBtn = document.getElementById("carousel-next");
  const paginationDots = document.querySelectorAll("#carousel-pagination div");
  if (!items.length || !prevBtn || !nextBtn) return;

  let currentIndex = 2;
  const totalItems = items.length;

  function updateCarousel() {
    items.forEach((item, index) => {
      let diff = index - currentIndex;
      if (diff < -Math.floor(totalItems / 2)) diff += totalItems;
      if (diff > Math.floor(totalItems / 2)) diff -= totalItems;

      if (diff === 0) item.dataset.pos = "0";
      else if (diff === -1) item.dataset.pos = "-1";
      else if (diff === 1) item.dataset.pos = "1";
      else if (diff === -2) item.dataset.pos = "-2";
      else if (diff === 2) item.dataset.pos = "2";
      else item.dataset.pos = diff < 0 ? "hidden-left" : "hidden-right";
    });

    paginationDots.forEach((dot, index) => {
      if (index === currentIndex) {
        dot.className =
          "w-8 h-2 rounded-full bg-[#C98989] transition-all duration-300 cursor-pointer";
      } else {
        dot.className =
          "w-2 h-2 rounded-full bg-[#E8C4C4] transition-all duration-300 cursor-pointer";
      }
    });
  }

  prevBtn.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + totalItems) % totalItems;
    updateCarousel();
  });

  nextBtn.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % totalItems;
    updateCarousel();
  });

  items.forEach((item, index) => {
    item.addEventListener("click", () => {
      currentIndex = index;
      updateCarousel();
    });
  });

  paginationDots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      currentIndex = index;
      updateCarousel();
    });
  });

  const carouselContainer = document.querySelector(".carousel-perspective");
  if (carouselContainer) {
    let touchStartX = 0;
    let touchEndX = 0;

    carouselContainer.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    carouselContainer.addEventListener("touchend", (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    function handleSwipe() {
      const swipeThreshold = 50;
      if (touchEndX < touchStartX - swipeThreshold) {
        currentIndex = (currentIndex + 1) % totalItems;
        updateCarousel();
      }
      if (touchEndX > touchStartX + swipeThreshold) {
        currentIndex = (currentIndex - 1 + totalItems) % totalItems;
        updateCarousel();
      }
    }
  }

  updateCarousel();
}

function setupBackgroundScroll() {
  const track = document.getElementById("invite-bg-track");
  if (!track) return;

  const shell = track.parentElement;
  const img = track.querySelector("img");
  let ticking = false;

  // Không để browser khôi phục vị trí scroll cũ khi refresh (thiệp còn đóng)
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  function lockScrollTop() {
    if (!document.body.classList.contains("invite-locked")) return;
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }

  lockScrollTop();

  // Chiều cao khung nền cố định (tránh visualViewport — dễ hở đáy trên mobile)
  function shellHeight() {
    return (shell && shell.clientHeight) || window.innerHeight || document.documentElement.clientHeight || 1;
  }

  function maxPageScroll() {
    const doc = document.documentElement;
    const viewH = window.innerHeight || doc.clientHeight || 1;
    return Math.max(1, doc.scrollHeight - viewH);
  }

  function bgHeight() {
    const shellH = shellHeight();
    const w = track.clientWidth || (shell && shell.clientWidth) || window.innerWidth || 1;
    const naturalH = w * (1024 / 512);
    if (!img) return Math.max(shellH, naturalH);
    const painted = img.getBoundingClientRect().height || img.offsetHeight || 0;
    return Math.max(shellH, naturalH, painted);
  }

  function updateBg() {
    ticking = false;

    // Thiệp chưa mở: nền luôn ở đỉnh ảnh
    if (document.body.classList.contains("invite-locked")) {
      lockScrollTop();
      track.style.transform = "translate3d(0, 0, 0)";
      return;
    }

    const viewH = shellHeight();
    const bgH = bgHeight();
    const excess = Math.max(0, bgH - viewH);
    const maxScroll = maxPageScroll();
    const scrollY = window.scrollY || window.pageYOffset || 0;
    // Gần đáy trang thì neo cứng progress = 1 để không hở 1–2px
    const progress = scrollY >= maxScroll - 2 ? 1 : Math.min(1, Math.max(0, scrollY / maxScroll));
    const y = -progress * excess;
    track.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateBg);
  }

  function forceUpdateSoon() {
    requestUpdate();
    requestAnimationFrame(requestUpdate);
    setTimeout(requestUpdate, 50);
    setTimeout(requestUpdate, 200);
    setTimeout(requestUpdate, 600);
  }

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", forceUpdateSoon);
  window.addEventListener("orientationchange", forceUpdateSoon);
  window.addEventListener("pageshow", () => {
    lockScrollTop();
    forceUpdateSoon();
  });
  window.addEventListener("load", forceUpdateSoon);

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", forceUpdateSoon);
  }

  if (img) {
    if (img.complete) forceUpdateSoon();
    else {
      img.addEventListener("load", forceUpdateSoon, { once: true });
      if (typeof img.decode === "function") {
        img.decode().then(forceUpdateSoon).catch(() => {});
      }
    }
  } else {
    forceUpdateSoon();
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(forceUpdateSoon);
  }

  const home = document.getElementById("home");
  if (home) {
    const mo = new MutationObserver(forceUpdateSoon);
    mo.observe(home, { attributes: true, attributeFilter: ["class"] });
  }

  // Mở/khóa thiệp đổi chiều dài trang → tính lại
  const bodyObserver = new MutationObserver(forceUpdateSoon);
  bodyObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });

  if (typeof ResizeObserver !== "undefined") {
    const ro = new ResizeObserver(requestUpdate);
    ro.observe(document.documentElement);
    if (shell) ro.observe(shell);
    ro.observe(track);
    if (img) ro.observe(img);
  }
}

function setupInviteEnvelope() {
  const home = document.getElementById("home");
  const openBtn = document.getElementById("open-invite-btn");
  if (!home || !openBtn) {
    document.body.classList.remove("invite-locked");
    return;
  }

  function finishOpen() {
    home.classList.remove("is-sealed");
    home.classList.add("is-opened");
    home.classList.remove("is-opening");
    openBtn.disabled = true;
    openBtn.setAttribute("aria-label", "Thiep da mo");
    const openScene = document.getElementById("envelope-open-scene");
    if (openScene) openScene.removeAttribute("aria-hidden");
    window.dispatchEvent(new Event("resize"));
  }

  function openInvite() {
    if (home.dataset.opening === "1") return;
    home.dataset.opening = "1";

    const closedImg = document.getElementById("envelope-closed");
    if (closedImg) closedImg.classList.remove("is-active");

    home.classList.add("is-opening");
    playOpenEffects();

    setTimeout(() => {
      document.body.classList.remove("invite-locked");
      finishOpen();
    }, 1850);
  }

  // Vào trang là chuỗi mở màn tự chạy; chạm vào thiệp là mở luôn
  const INTRO_MS = 2150; // bằng độ dài chuỗi animation trong styles.css
  let introDone = false;

  function endIntro() {
    introDone = true;
    home.classList.add("is-intro-done");
  }

  function playIntro() {
    home.classList.add("is-intro");
    setTimeout(endIntro, INTRO_MS);
  }

  openBtn.addEventListener("click", () => {
    // Chạm sớm thì chốt luôn chuỗi mở màn để không mất chữ nào
    if (!introDone) endIntro();
    openInvite();
  });

  if (new URLSearchParams(window.location.search).get("open") === "1") {
    const closedImg = document.getElementById("envelope-closed");
    if (closedImg) closedImg.classList.remove("is-active");
    document.body.classList.remove("invite-locked");
    home.classList.add("is-intro");
    endIntro();
    home.dataset.opening = "1";
    finishOpen();
  } else {
    playIntro();
  }
}

function playOpenEffects() {
  const layer = document.getElementById("invite-fx");
  if (!layer) return;

  const origin = getEnvelopeOrigin();
  shootHearts(layer, origin);
  setTimeout(() => launchFireworks(layer, origin), 180);
  setTimeout(() => launchFireworks(layer, {
    x: origin.x + (Math.random() * 80 - 40),
    y: origin.y - 40 - Math.random() * 60,
  }), 520);
  setTimeout(() => launchFireworks(layer, {
    x: origin.x + (Math.random() * 100 - 50),
    y: origin.y - 20 - Math.random() * 50,
  }), 860);
}

function getEnvelopeOrigin() {
  const stage = document.getElementById("envelope-stage") || document.getElementById("open-invite-btn");
  if (!stage) {
    return { x: window.innerWidth / 2, y: window.innerHeight * 0.45 };
  }
  const rect = stage.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height * 0.42,
  };
}

function shootHearts(layer, origin) {
  const colors = ["#C98989", "#B87474", "#E8A0A0", "#D4A0A0", "#F5D0D0", "#8B4A4A"];
  const count = 28;

  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    el.className = "fx-heart";
    el.textContent = i % 5 === 0 ? "♡" : "♥";

    const angle = (-Math.PI / 2) + (Math.random() - 0.5) * Math.PI * 1.35;
    const dist = 90 + Math.random() * 160;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist - (40 + Math.random() * 80);

    el.style.setProperty("--x", `${origin.x}px`);
    el.style.setProperty("--y", `${origin.y}px`);
    el.style.setProperty("--dx", `${dx}px`);
    el.style.setProperty("--dy", `${dy}px`);
    el.style.setProperty("--rot", `${(Math.random() * 80 - 40).toFixed(1)}deg`);
    el.style.setProperty("--size", `${14 + Math.random() * 16}px`);
    el.style.setProperty("--c", colors[i % colors.length]);
    el.style.setProperty("--dur", `${1.15 + Math.random() * 0.7}s`);
    el.style.animationDelay = `${Math.random() * 0.22}s`;

    layer.appendChild(el);
    el.addEventListener("animationend", () => el.remove(), { once: true });
  }
}

function launchFireworks(layer, origin) {
  const palette = ["#FFFFFF", "#F5D0D0", "#E8C4C4", "#C98989", "#D4B896", "#FDEAEA", "#B87474"];
  const boom = document.createElement("span");
  boom.className = "fx-boom";
  boom.style.setProperty("--x", `${origin.x}px`);
  boom.style.setProperty("--y", `${origin.y}px`);
  layer.appendChild(boom);
  boom.addEventListener("animationend", () => boom.remove(), { once: true });

  const sparks = 22 + Math.floor(Math.random() * 10);
  for (let i = 0; i < sparks; i++) {
    const el = document.createElement("span");
    el.className = "fx-spark";
    const angle = (Math.PI * 2 * i) / sparks + Math.random() * 0.2;
    const dist = 50 + Math.random() * 110;
    el.style.setProperty("--x", `${origin.x}px`);
    el.style.setProperty("--y", `${origin.y}px`);
    el.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
    el.style.setProperty("--dy", `${Math.sin(angle) * dist}px`);
    el.style.setProperty("--size", `${3 + Math.random() * 5}px`);
    el.style.setProperty("--c", palette[i % palette.length]);
    el.style.setProperty("--dur", `${0.85 + Math.random() * 0.55}s`);
    el.style.animationDelay = `${Math.random() * 0.08}s`;
    layer.appendChild(el);
    el.addEventListener("animationend", () => el.remove(), { once: true });
  }
}
