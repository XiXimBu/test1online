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
  setupMusicToggle();
  setupInviteEnvelope();
  setupBackgroundScroll();
  setupAmbientFall();
  setupAlbumCarousel();
  setupLixiPreview();
});

function setupLixiPreview() {
  const zone = document.getElementById("lixi-zone");
  const pair = document.getElementById("lixi-pair");
  const boards = document.getElementById("lixi-boards");
  const copiedEl = document.getElementById("lixi-preview-copied");
  const hint = document.getElementById("lixi-hint");
  if (!zone || !pair || !boards) return;

  let copyTimer = 0;
  const boardNodes = [
    document.getElementById("lixi-board-groom"),
    document.getElementById("lixi-board-bride"),
  ].filter(Boolean);

  function isOpen() {
    return zone.classList.contains("has-preview");
  }

  function syncButtons(open) {
    pair.querySelectorAll("[data-lixi]").forEach((btn) => {
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    if (hint) {
      hint.textContent = open ? "Nhấn × để đóng" : "Nhấn bao lì xì để xem QR";
    }
  }

  function openBoth() {
    boardNodes.forEach((board) => {
      board.hidden = false;
      board.removeAttribute("hidden");
      board.setAttribute("aria-hidden", "false");
      board.classList.add("is-open");
    });
    zone.classList.add("has-preview");
    boards.classList.add("has-open");
    syncButtons(true);
  }

  function closeBoth() {
    boardNodes.forEach((board) => {
      board.classList.remove("is-open");
      board.setAttribute("aria-hidden", "true");
    });
    zone.classList.remove("has-preview");
    boards.classList.remove("has-open");
    syncButtons(false);
    window.setTimeout(() => {
      if (isOpen()) return;
      boardNodes.forEach((board) => {
        if (!board.classList.contains("is-open")) {
          board.hidden = true;
          board.setAttribute("hidden", "");
        }
      });
    }, 240);
  }

  function toggleBoth() {
    if (isOpen()) closeBoth();
    else openBoth();
  }

  pair.querySelectorAll("[data-lixi]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleBoth();
    });
  });

  boards.querySelectorAll("[data-lixi-close]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeBoth();
    });
  });

  boards.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const value = btn.getAttribute("data-copy") || "";
      if (!value || !copiedEl) return;
      try {
        await navigator.clipboard.writeText(value);
        copiedEl.textContent = "Đã sao chép số tài khoản";
        copiedEl.hidden = false;
        window.clearTimeout(copyTimer);
        copyTimer = window.setTimeout(() => {
          copiedEl.hidden = true;
        }, 1800);
      } catch (_) {
        copiedEl.textContent = "Không sao chép được — hãy giữ để copy tay";
        copiedEl.hidden = false;
      }
    });
  });

  boards.querySelectorAll(".lixi-preview-download").forEach((link) => {
    link.addEventListener("click", async (e) => {
      const href = link.getAttribute("href");
      const name = link.getAttribute("download") || "qr.png";
      if (!href) return;
      try {
        e.preventDefault();
        e.stopPropagation();
        const res = await fetch(href);
        if (!res.ok) throw new Error("fetch fail");
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } catch (_) {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener");
      }
    });
  });
}

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

  async function startMusic() {
    if (!hasMusic()) return false;
    if (!audio.paused) {
      setPlaying(true);
      return true;
    }
    try {
      await audio.play();
      setPlaying(true);
      return true;
    } catch (err) {
      setPlaying(false);
      console.warn("Không phát được nhạc:", err);
      return false;
    }
  }

  async function toggleMusic() {
    if (!hasMusic()) {
      console.info("Chưa có link nhạc. Thêm <source src=\"...\"> vào #invite-music.");
      return;
    }

    try {
      if (audio.paused) {
        await startMusic();
      } else {
        audio.pause();
        setPlaying(false);
      }
    } catch (err) {
      setPlaying(false);
      console.warn("Không phát được nhạc:", err);
    }
  }

  // Cho openInvite gọi — phải nằm trong cử chỉ chạm/click của user
  window.__inviteStartMusic = startMusic;

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

  const bgShell = track.parentElement;
  const mainShell = document.querySelector(".invite-shell");
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

  /** Khớp đúng bề ngang cột thiệp — tránh nền lệch trái/phải */
  function columnWidth() {
    if (mainShell && mainShell.clientWidth > 0) return mainShell.clientWidth;
    if (bgShell && bgShell.clientWidth > 0) return bgShell.clientWidth;
    return window.innerWidth || 1;
  }

  function syncColumnBox(el) {
    if (!el || !mainShell) return;
    const rect = mainShell.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width));
    el.style.left = `${Math.round(rect.left)}px`;
    el.style.width = `${w}px`;
    el.style.transform = "none";
    el.style.marginLeft = "0";
    el.style.right = "auto";
  }

  function syncBgShellBox() {
    syncColumnBox(bgShell);
    syncColumnBox(document.getElementById("invite-fx"));
  }

  /**
   * Luôn giữ width = cột thiệp (không phóng ngang).
   * Thiếu chiều cao thì kéo dài ảnh theo chiều dọc + object-fit cover.
   */
  function layoutBg() {
    if (!img || !bgShell) return { viewH: viewHeight(), bgH: viewHeight() };

    syncBgShellBox();

    const viewH = viewHeight();
    const colW = columnWidth();
    let drawH = colW * BG_RATIO;
    if (drawH < viewH) drawH = viewH;

    img.style.width = "100%";
    img.style.height = `${drawH}px`;
    img.style.maxWidth = "none";
    img.style.minHeight = "0";
    img.style.objectFit = "cover";
    img.style.objectPosition = "center top";
    img.style.display = "block";

    track.style.width = "100%";
    track.style.height = `${drawH}px`;
    track.style.left = "0";
    track.style.right = "0";
    track.style.marginLeft = "0";
    track.style.top = "0";

    return { viewH, bgH: drawH };
  }

  function updateBg() {
    ticking = false;

    if (document.body.classList.contains("invite-locked")) {
      lockScrollTop();
      layoutBg();
      track.style.transform = "translate3d(0, 0, 0)";
      return;
    }

    const { viewH, bgH } = layoutBg();
    const excess = Math.max(0, bgH - viewH);
    const maxScroll = maxPageScroll();
    const scrollY = Math.min(Math.max(0, pageScrollY()), maxScroll);
    const progress = maxScroll <= 1 ? 0 : Math.min(1, scrollY / maxScroll);
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
    setTimeout(requestUpdate, 500);
  }

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", forceUpdateSoon);
  window.addEventListener("orientationchange", forceUpdateSoon);
  window.addEventListener("load", forceUpdateSoon);
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", forceUpdateSoon);
    window.visualViewport.addEventListener("scroll", forceUpdateSoon);
  }

  if (img) {
    if (img.complete) forceUpdateSoon();
    else img.addEventListener("load", forceUpdateSoon, { once: true });
  }

  const unlockMo = new MutationObserver(forceUpdateSoon);
  unlockMo.observe(document.body, { attributes: true, attributeFilter: ["class"] });

  forceUpdateSoon();

  window.addEventListener("pageshow", () => {
    lockScrollTop();
    forceUpdateSoon();
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(forceUpdateSoon);
  }

  const home = document.getElementById("home");
  if (home) {
    const mo = new MutationObserver(forceUpdateSoon);
    mo.observe(home, { attributes: true, attributeFilter: ["class"] });
  }

  if (typeof ResizeObserver !== "undefined") {
    const ro = new ResizeObserver(requestUpdate);
    ro.observe(document.documentElement);
    if (mainShell) ro.observe(mainShell);
    if (bgShell) ro.observe(bgShell);
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
    // Phát nhạc ngay trong cử chỉ bấm mở thiệp (trình duyệt cho phép autoplay)
    if (typeof window.__inviteStartMusic === "function") {
      window.__inviteStartMusic();
    }
    if (typeof window.__inviteBoostFall === "function") {
      window.__inviteBoostFall();
    }
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

  const origin = getEnvelopeOrigin(layer);
  shootHearts(layer, origin, { count: 22, includeHi: true });
  // Mưa nhẹ lúc mở (ít hơn ambient thường)
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      if (typeof window.__inviteSpawnFall === "function") window.__inviteSpawnFall();
    }, 60 + i * 140);
  }
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

/** Mưa trái tim + 囍 — chỉ trong cột thẻ; khi thiệp đóng phải luôn chạy */
function setupAmbientFall() {
  const layer = document.getElementById("invite-fx");
  const stopAt = document.getElementById("wedding-info-section");
  const home = document.getElementById("home");
  const mainShell = document.querySelector(".invite-shell");
  if (!layer) return;

  const heartColors = ["#C98989", "#B87474", "#E8A0A0", "#D4A0A0", "#F5D0D0"];
  const hiColors = ["#B87474", "#C98989", "#8B4A4A"];
  let timer = 0;
  let burstTimer = 0;
  let allowed = true;

  function syncFxBox() {
    if (!mainShell) return;
    const rect = mainShell.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width));
    layer.style.left = `${Math.round(rect.left)}px`;
    layer.style.width = `${w}px`;
    layer.style.right = "auto";
    layer.style.marginLeft = "0";
    layer.style.transform = "none";
  }

  function fallDistancePx() {
    if (document.body.classList.contains("invite-locked") || isStillSealed()) {
      return Math.round(window.innerHeight * 0.78);
    }
    if (!stopAt) return Math.round(window.innerHeight * 0.62);
    const top = stopAt.getBoundingClientRect().top + window.scrollY;
    return Math.max(220, Math.min(Math.round(top * 0.92), Math.round(window.innerHeight * 0.75)));
  }

  function isStillSealed() {
    return home && home.classList.contains("is-sealed") && home.dataset.opening !== "1";
  }

  function spawnFall(forceHi) {
    if (!allowed) return;
    const el = document.createElement("span");
    const isHi = forceHi === true ? true : forceHi === false ? false : Math.random() < 0.28;
    el.className = isHi ? "fx-fall fx-fall-hi" : "fx-fall fx-fall-heart";
    if (isHi) el.textContent = "囍";
    else fillHeartMark(el);
    el.style.left = `${6 + Math.random() * 88}%`;
    el.style.setProperty("--sway", `${(Math.random() * 50 - 25).toFixed(1)}px`);
    el.style.setProperty("--fall", `${fallDistancePx()}px`);
    el.style.setProperty(
      "--size",
      isHi ? `${16 + Math.random() * 12}px` : `${13 + Math.random() * 14}px`
    );
    el.style.setProperty("--dur", `${5.2 + Math.random() * 3}s`);
    el.style.setProperty(
      "--c",
      isHi
        ? hiColors[Math.floor(Math.random() * hiColors.length)]
        : heartColors[Math.floor(Math.random() * heartColors.length)]
    );
    layer.appendChild(el);
    el.addEventListener("animationend", () => el.remove(), { once: true });
  }

  function loop() {
    if (!allowed) return;
    spawnFall();
    if (Math.random() < 0.35) spawnFall();
    if (Math.random() < 0.28) spawnFall(true);
    const gap = isStillSealed() ? 380 + Math.random() * 320 : 850 + Math.random() * 700;
    timer = window.setTimeout(loop, gap);
  }

  /** Bắn tim + 囍 quanh thiệp khi còn đóng */
  function sealedBurst() {
    if (!allowed || !isStillSealed()) return;
    syncFxBox();
    const origin = getEnvelopeOrigin(layer);
    shootHearts(layer, origin, { count: 16, includeHi: true });
  }

  function sealedBurstLoop() {
    if (!isStillSealed()) {
      burstTimer = 0;
      return;
    }
    sealedBurst();
    burstTimer = window.setTimeout(sealedBurstLoop, 1400 + Math.random() * 900);
  }

  function setAllowed(on) {
    allowed = on;
    if (!on) {
      window.clearTimeout(timer);
      timer = 0;
      layer.querySelectorAll(".fx-fall").forEach((n) => n.remove());
    } else if (!timer) {
      loop();
    }
  }

  function syncByScroll() {
    syncFxBox();
    // Thiệp đóng: section lễ cưới bị display:none → rect = 0; phải luôn cho chạy
    if (document.body.classList.contains("invite-locked") || isStillSealed()) {
      if (!allowed) setAllowed(true);
      return;
    }
    if (!stopAt) return;
    const rect = stopAt.getBoundingClientRect();
    const shouldRun = rect.top > window.innerHeight * 0.42;
    if (shouldRun !== allowed) setAllowed(shouldRun);
  }

  syncFxBox();

  // Xuất hiện sớm + nhiều hơn (~8–9 hạt seed)
  for (let i = 0; i < 9; i++) {
    setTimeout(() => spawnFall(i % 3 === 0), i * 90);
  }
  loop();

  // Burst ngay gần đầu + lặp khi còn đóng
  setTimeout(sealedBurst, 120);
  burstTimer = window.setTimeout(sealedBurstLoop, 1100);

  window.addEventListener("scroll", syncByScroll, { passive: true });
  window.addEventListener("resize", syncByScroll);
  syncByScroll();

  if (home) {
    const mo = new MutationObserver(syncByScroll);
    mo.observe(home, { attributes: true, attributeFilter: ["class", "data-opening"] });
  }
  const bodyMo = new MutationObserver(syncByScroll);
  bodyMo.observe(document.body, { attributes: true, attributeFilter: ["class"] });

  window.__inviteSpawnFall = spawnFall;
  window.__inviteBoostFall = function boostFall() {
    window.clearTimeout(burstTimer);
    burstTimer = 0;
    if (!allowed) return;
    for (let i = 0; i < 10; i++) {
      setTimeout(() => spawnFall(i % 3 === 0), i * 90);
    }
  };
}

function getEnvelopeOrigin(layer) {
  const stage = document.getElementById("envelope-stage") || document.getElementById("open-invite-btn");
  const layerRect = layer ? layer.getBoundingClientRect() : null;
  if (!stage) {
    return {
      x: layerRect ? layerRect.width / 2 : window.innerWidth / 2,
      y: layerRect ? layerRect.height * 0.45 : window.innerHeight * 0.45,
    };
  }
  const rect = stage.getBoundingClientRect();
  const ox = layerRect ? layerRect.left : 0;
  const oy = layerRect ? layerRect.top : 0;
  return {
    x: rect.left + rect.width / 2 - ox,
    y: rect.top + rect.height * 0.42 - oy,
  };
}

/** Tim SVG — tránh emoji đỏ trên iOS/Android, màu theo CSS currentColor */
function fillHeartMark(el) {
  el.innerHTML =
    '<svg class="fx-heart-mark" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    '<path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>' +
    "</svg>";
}

function shootHearts(layer, origin, opts) {
  const colors = ["#C98989", "#B87474", "#E8A0A0", "#D4A0A0", "#F5D0D0", "#8B4A4A"];
  const hiColors = ["#B87474", "#C98989", "#8B4A4A"];
  const count = (opts && opts.count) || 28;
  const includeHi = !!(opts && opts.includeHi);

  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    const isHi = includeHi && i % 4 === 0;
    el.className = isHi ? "fx-heart fx-hi-shot" : "fx-heart";
    if (isHi) el.textContent = "囍";
    else fillHeartMark(el);

    const angle = (-Math.PI / 2) + (Math.random() - 0.5) * Math.PI * 1.2;
    const dist = 70 + Math.random() * 130;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist - (30 + Math.random() * 70);

    el.style.setProperty("--x", `${origin.x}px`);
    el.style.setProperty("--y", `${origin.y}px`);
    el.style.setProperty("--dx", `${dx}px`);
    el.style.setProperty("--dy", `${dy}px`);
    el.style.setProperty("--rot", `${(Math.random() * 70 - 35).toFixed(1)}deg`);
    el.style.setProperty(
      "--size",
      isHi ? `${16 + Math.random() * 12}px` : `${14 + Math.random() * 14}px`
    );
    el.style.setProperty(
      "--c",
      isHi ? hiColors[i % hiColors.length] : colors[i % colors.length]
    );
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
