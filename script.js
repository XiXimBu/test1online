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
  const items = Array.from(document.querySelectorAll(".carousel-item"));
  const prevBtn = document.getElementById("carousel-prev");
  const nextBtn = document.getElementById("carousel-next");
  const paginationDots = document.querySelectorAll("#carousel-pagination div");
  const carouselContainer = document.querySelector(".carousel-perspective");
  const albumSection = document.getElementById("album-section");
  if (!items.length || !prevBtn || !nextBtn) return;

  let currentIndex = 2;
  const totalItems = items.length;
  let isAnimating = false;
  let suppressClick = false;

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

  function goTo(index) {
    if (isAnimating) return;
    isAnimating = true;
    currentIndex = (index + totalItems) % totalItems;
    updateCarousel();
    window.setTimeout(() => {
      isAnimating = false;
    }, 480);
  }

  function next() {
    goTo(currentIndex + 1);
  }

  function prev() {
    goTo(currentIndex - 1);
  }

  prevBtn.addEventListener("click", prev);
  nextBtn.addEventListener("click", next);

  items.forEach((item, index) => {
    item.addEventListener("click", (e) => {
      if (suppressClick) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      goTo(index);
    });
  });

  paginationDots.forEach((dot, index) => {
    dot.addEventListener("click", () => goTo(index));
  });

  if (carouselContainer) {
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let axis = null; // "x" | "y" | null
    let dragging = false;

    function onTouchStart(e) {
      if (!e.touches || e.touches.length !== 1) return;
      const t = e.touches[0];
      startX = lastX = t.clientX;
      startY = t.clientY;
      axis = null;
      dragging = true;
      suppressClick = false;
      carouselContainer.classList.add("is-swiping");
    }

    function onTouchMove(e) {
      if (!dragging || !e.touches || e.touches.length !== 1) return;
      const t = e.touches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      lastX = t.clientX;

      if (!axis) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      }

      // Vuốt ngang: chặn scroll trang / kéo layout
      if (axis === "x") {
        e.preventDefault();
        suppressClick = true;
      }
    }

    function onTouchEnd() {
      if (!dragging) return;
      dragging = false;
      carouselContainer.classList.remove("is-swiping");

      if (axis === "x") {
        const dx = lastX - startX;
        const threshold = Math.min(56, Math.max(36, carouselContainer.clientWidth * 0.12));
        if (dx <= -threshold) next();
        else if (dx >= threshold) prev();
      }

      // Tránh click nhầm sau vuốt
      if (suppressClick) {
        window.setTimeout(() => {
          suppressClick = false;
        }, 280);
      }
      axis = null;
    }

    function onTouchCancel() {
      dragging = false;
      axis = null;
      carouselContainer.classList.remove("is-swiping");
      suppressClick = false;
    }

    carouselContainer.addEventListener("touchstart", onTouchStart, { passive: true });
    carouselContainer.addEventListener("touchmove", onTouchMove, { passive: false });
    carouselContainer.addEventListener("touchend", onTouchEnd, { passive: true });
    carouselContainer.addEventListener("touchcancel", onTouchCancel, { passive: true });
  }

  if (albumSection) {
    albumSection.classList.add("album-swipe-ready");
  }

  updateCarousel();
}

function setupBackgroundScroll() {
  const track = document.getElementById("invite-bg-track");
  if (!track) return;

  const shell = track.parentElement;
  const img = track.querySelector("img");
  let ticking = false;
  const BG_RATIO = 1024 / 512; // background.png

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

  // Dùng layout viewport — ổn định hơn visualViewport trên iPhone
  function viewHeight() {
    return document.documentElement.clientHeight || window.innerHeight || 1;
  }

  function pageScrollY() {
    return window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
  }

  function maxPageScroll() {
    const doc = document.documentElement;
    const body = document.body;
    const scrollH = Math.max(doc.scrollHeight, body ? body.scrollHeight : 0);
    return Math.max(1, scrollH - viewHeight());
  }

  function columnWidth() {
    return (shell && shell.clientWidth) || track.clientWidth || window.innerWidth || 1;
  }

  // Lệch nền ~18px xuống cho khớp mắt; phần hở đỉnh (nếu có) cùng màu đỉnh ảnh
  const yShift = 18;

  /**
   * Cỡ ảnh nền: giữ tỉ lệ 1:2.
   * Mobile hẹp → ảnh thấp hơn màn → phóng đều (không méo) cho cao >= viewport,
   * rồi căn giữa ngang. Desktop rộng thì chiều cao dư → cuộn dần như máy tính.
   */
  function layoutBg() {
    if (!img || !shell) return { viewH: viewHeight(), bgH: viewHeight() };

    const viewH = viewHeight();
    const colW = columnWidth();
    let drawW = colW;
    let drawH = colW * BG_RATIO;

    // Cao tối thiểu = viewport + yShift để đẩy xuống vẫn phủ đáy màn
    const minH = viewH + yShift;
    if (drawH < minH) {
      drawH = minH;
      drawW = minH / BG_RATIO;
    }

    img.style.width = `${drawW}px`;
    img.style.height = `${drawH}px`;
    img.style.maxWidth = "none";
    img.style.minHeight = "0";
    img.style.objectFit = "fill";
    img.style.display = "block";

    track.style.width = `${drawW}px`;
    track.style.height = `${drawH}px`;
    track.style.left = "50%";
    track.style.marginLeft = `${(-drawW / 2).toFixed(2)}px`;
    track.style.top = "0";

    return { viewH, bgH: drawH };
  }

  function updateBg() {
    ticking = false;

    if (document.body.classList.contains("invite-locked")) {
      lockScrollTop();
      layoutBg();
      // Giữ cùng lệch khi khóa scroll — mở thiệp không bị nhảy nền
      track.style.transform = `translate3d(0, ${yShift}px, 0)`;
      return;
    }

    const { viewH, bgH } = layoutBg();
    const excess = Math.max(0, bgH - viewH);
    const maxScroll = maxPageScroll();
    const scrollY = Math.min(Math.max(0, pageScrollY()), maxScroll);
    const progress = maxScroll <= 1 ? 0 : Math.min(1, scrollY / maxScroll);
    // Đẩy xuống lúc đầu; cuối trang về 0 để neo đúng đáy (không hở dưới)
    const y = -progress * excess + yShift * (1 - progress);
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
    setTimeout(requestUpdate, 500);
  }

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", forceUpdateSoon);
  window.addEventListener("orientationchange", () => {
    setTimeout(forceUpdateSoon, 100);
    setTimeout(forceUpdateSoon, 400);
  });
  window.addEventListener("pageshow", () => {
    lockScrollTop();
    forceUpdateSoon();
  });
  window.addEventListener("load", forceUpdateSoon);

  // Chỉ layout lại khi thanh địa chỉ iOS đổi — không dùng vv.height để tính y
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

  const bodyObserver = new MutationObserver(forceUpdateSoon);
  bodyObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });

  if (typeof ResizeObserver !== "undefined") {
    const ro = new ResizeObserver(requestUpdate);
    ro.observe(document.documentElement);
    if (shell) ro.observe(shell);
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
