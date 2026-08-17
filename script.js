// Scroll animations + envelope open FX + synced background scroll
document.addEventListener("DOMContentLoaded", () => {
  setupInviteType();
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
  setupCouplePortraits();
  setupClosingCouple();
  setupMusicToggle();
  setupInviteEnvelope();
  setupCoverGuestName();
  setupBackgroundScroll();
  setupHeroSlider();
  setupCountdown();
  setupCountIcon();
  setupCountWine();
  setupLixiPreview();
  setupRsvpForm();
  setupLoveAlbum();
  setupPhotoAlbum();
});

function getInviteParams() {
  const search = window.location.search || "";
  const hash = (window.location.hash || "").replace(/^#/, "");
  const raw = `${search}&${hash}`;
  const normalized = raw
    .replace(/^[?#&]+/, "")
    .replace(/\/+(?=(?:type|name|l2|wrap|open)=)/gi, "&")
    .replace(/\?/g, "&");
  return new URLSearchParams(normalized);
}

function getInviteType() {
  return (getInviteParams().get("type") || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9].*$/, "");
}

function isBrideInviteType(type) {
  return String(type || "").indexOf("nhagai") === 0;
}

function decodeInviteParam(value) {
  if (!value) return "";
  let text = String(value).replace(/\+/g, " ").trim();
  try {
    text = decodeURIComponent(text);
  } catch {
    return text;
  }
  return text.trim();
}

function getGuestInviteName() {
  return decodeInviteParam(getInviteParams().get("name"))
    .replace(/~/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getCoupleWeddingTitle(type) {
  return isBrideInviteType(type)
    ? "HOÀNG HẠNH & TRINH GIANG WEDDING"
    : "TRINH GIANG & HOÀNG HẠNH WEDDING";
}

function getInvitePageTitle() {
  const wedding = getCoupleWeddingTitle(getInviteType());
  const name = getGuestInviteName();
  return name ? `Kính mời ${name} | ${wedding}` : wedding;
}

function applyInvitePageMeta() {
  const type = getInviteType();
  const wedding = getCoupleWeddingTitle(type);
  const title = getInvitePageTitle();
  const origin = window.location.origin || "https://thiepcuoigianghanh.vercel.app";
  const url = `${origin}/${window.location.search || ""}`;

  document.title = title;
  const pairs = [
    ['meta[name="title"]', title],
    ['meta[itemprop="name"]', title],
    ['meta[property="og:title"]', title],
    ['meta[property="og:site_name"]', wedding],
    ['meta[property="og:image:alt"]', wedding],
    ['meta[name="twitter:title"]', title],
    ['meta[property="og:url"]', url],
  ];
  pairs.forEach(([sel, val]) => {
    document.querySelectorAll(sel).forEach((el) => el.setAttribute("content", val));
  });
  const canon = document.querySelector('link[rel="canonical"]');
  if (canon) canon.setAttribute("href", url);
}

function setupInviteType() {
  const type = getInviteType();
  document.documentElement.dataset.inviteType = type || "default";
  applyInvitePageMeta();

  if (type === "nhagai30") {
    applyBrideSideLayout();
    const timeEl = document.querySelector("[data-party-time]");
    if (timeEl) timeEl.textContent = "11:00";
    return;
  }

  if (type !== "nhagai29") return;

  applyBrideSideLayout();
  const timeEl = document.querySelector("[data-party-time]");
  if (timeEl) timeEl.textContent = "17:00";
  const weekEl = document.querySelector("[data-party-weekday]");
  if (weekEl) weekEl.textContent = "Thứ Ba";
  const dayEl = document.querySelector("[data-party-day]");
  if (dayEl) dayEl.textContent = "29";
  const lunar = document.querySelector("[data-party-lunar]");
  if (lunar) lunar.textContent = "Tức ngày 19 tháng 8 năm Bính Ngọ";
  const photo = document.querySelector("[data-photo-date]");
  if (photo) photo.textContent = "29.09";
  const intro = document.querySelector(".intro-date[data-type]");
  if (intro) intro.setAttribute("data-type", "29.09.2026");
  setCalHeart(29);
}

function applyBrideSideLayout() {
  const parents = document.querySelector(".invite-parents");
  if (parents) {
    const groomHouse = parents.querySelector('[data-house="groom"]');
    const brideHouse = parents.querySelector('[data-house="bride"]');
    if (groomHouse && brideHouse) {
      const line = parents.querySelector(".invite-parents-line");
      parents.insertBefore(brideHouse, groomHouse);
      if (line) parents.insertBefore(line, groomHouse);
      brideHouse.classList.remove("wi-from-right");
      brideHouse.classList.add("wi-from-left");
      groomHouse.classList.remove("wi-from-left");
      groomHouse.classList.add("wi-from-right");
    }
  }

  const couple = document.querySelector(".invite-couple");
  if (couple) {
    const groomName = couple.querySelector('[data-person="groom"]');
    const brideName = couple.querySelector('[data-person="bride"]');
    const and = couple.querySelector(".invite-couple-and");
    if (groomName && brideName && and) {
      couple.insertBefore(brideName, groomName);
      couple.insertBefore(and, groomName);
    }
  }

  const place = document.querySelector("[data-party-place]");
  if (place) {
    const name = place.querySelector(".invite-place-name");
    const addr = place.querySelector(".invite-place-addr");
    const map = place.querySelector(".invite-map-link");
    if (name) name.textContent = "Nhà máy A40";
    if (addr) addr.textContent = "phường Dương Nội, Hà Nội";
    if (map) map.setAttribute("href", "https://maps.app.goo.gl/7TE7hzupD4vv9g9e6");
  }

  const groomQr = document.getElementById("lixi-board-groom");
  const brideQr = document.getElementById("lixi-board-bride");
  if (groomQr) groomQr.hidden = true;
  if (brideQr) brideQr.hidden = false;

  const relation = document.getElementById("rsvp-relation");
  if (relation) relation.value = "bride";
}

function setCalHeart(dayNum) {
  const box = document.querySelector(".invite-cal-days");
  if (!box) return;
  const svg = box.querySelector(".invite-cal-heart");
  const oldHeart = box.querySelector(".is-heart");
  const target = box.querySelector(`[data-cal-day="${dayNum}"]`);
  if (!svg || !target || oldHeart === target) return;

  if (oldHeart) {
    const oldDay = oldHeart.getAttribute("data-cal-day") || "";
    const plain = document.createElement("span");
    plain.setAttribute("data-cal-day", oldDay);
    plain.textContent = oldDay;
    oldHeart.replaceWith(plain);
  }

  const wrap = document.createElement("span");
  wrap.className = "is-heart";
  wrap.setAttribute("data-cal-day", String(dayNum));
  const num = document.createElement("span");
  num.textContent = String(dayNum);
  wrap.appendChild(svg);
  wrap.appendChild(num);
  const nextTarget = box.querySelector(`[data-cal-day="${dayNum}"]`);
  if (nextTarget) nextTarget.replaceWith(wrap);
}

const RSVP_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBe7fYgRshIowUQ8phoPh0nuUXeb47ZXug",
  authDomain: "damcuoigianghanh.firebaseapp.com",
  databaseURL:
    "https://damcuoigianghanh-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "damcuoigianghanh",
  storageBucket: "damcuoigianghanh.firebasestorage.app",
  messagingSenderId: "724957835833",
  appId: "1:724957835833:web:03d54b815314609af353e8",
  measurementId: "G-MYJS9NS63L",
};

function getRsvpDatabase() {
  if (typeof firebase === "undefined") return null;
  try {
    if (!firebase.apps.length) firebase.initializeApp(RSVP_FIREBASE_CONFIG);
    return firebase.database();
  } catch (err) {
    console.warn("RSVP firebase init error:", err);
    return null;
  }
}

async function saveRsvpToFirebase(record) {
  const db = getRsvpDatabase();
  if (!db) return;

  await db.ref("rsvp").push({
    name: record.name,
    relation: record.relation,
    relationLabel: record.relation === "groom" ? "Khách chú rể" : "Khách cô dâu",
    attend: record.attend,
    attendLabel: record.attend === "yes" ? "Sẽ đến" : "Không đến",
    guests: record.guests,
    note: record.note,
    inviteType: getInviteType() || "default",
    createdAt: firebase.database.ServerValue.TIMESTAMP,
  });
}

function setupRsvpForm() {
  const form = document.getElementById("rsvp-form");
  if (!form) return;

  const countSelect = document.getElementById("guest-count");
  const guestsField = document.getElementById("rsvp-guests-field");
  const relationSelect = document.getElementById("rsvp-relation");
  const attendRadios = form.querySelectorAll('input[name="attend"]');
  const submitBtn = form.querySelector(".rsvp-submit");
  const thankYou = document.getElementById("rsvp-thankyou");
  const thankTitle = document.getElementById("rsvp-thankyou-title");
  const thankText = document.getElementById("rsvp-thankyou-text");

  function markAskDone(el, done) {
    if (!el) return;
    el.classList.toggle("is-done", !!done);
  }

  function selectedAttend() {
    const checked = form.querySelector('input[name="attend"]:checked');
    return checked ? checked.value : "";
  }

  function updateAttendUI() {
    const attend = selectedAttend();
    const showGuests = attend === "yes";
    if (guestsField) {
      guestsField.classList.toggle("is-hidden", !showGuests);
    }
    if (countSelect) {
      if (showGuests) countSelect.setAttribute("required", "required");
      else countSelect.removeAttribute("required");
    }
  }

  function updateRelationUI() {
    markAskDone(
      form.querySelector('[data-rsvp-ask="relation"]'),
      !!(relationSelect && relationSelect.value)
    );
  }

  attendRadios.forEach((radio) => {
    radio.addEventListener("change", updateAttendUI);
  });
  if (relationSelect) {
    relationSelect.addEventListener("change", updateRelationUI);
  }

  function showThankYou(attend, name) {
    if (!thankYou) return;
    const who = name ? name : "bạn";
    if (attend === "yes") {
      if (thankTitle) thankTitle.textContent = "Hẹn gặp lại!";
      if (thankText)
        thankText.textContent =
          "Cảm ơn " +
          who +
          " đã nhận lời chung vui.\nDâu rể rất mong được gặp bạn trong ngày trọng đại.";
    } else {
      if (thankTitle) thankTitle.textContent = "Cảm ơn bạn!";
      if (thankText)
        thankText.textContent =
          "Cảm ơn " +
          who +
          " đã dành thời gian phản hồi.\nDâu rể rất trân trọng tình cảm của bạn.";
    }
    form.hidden = true;
    thankYou.hidden = false;
    thankYou.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const name = String(data.get("guest-name") || "").trim().slice(0, 60);
    const relation = String(data.get("guest-relation") || "");
    const attend = String(data.get("attend") || "");
    const note = "";
    const guests =
      attend === "yes"
        ? Math.max(1, Math.min(10, Number(countSelect?.value) || 1))
        : 0;

    if (submitBtn) submitBtn.disabled = true;

    try {
      await saveRsvpToFirebase({ name, relation, attend, guests, note });
    } catch (err) {
      console.warn("RSVP save error:", err);
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }

    showThankYou(attend, name);
  });

  updateRelationUI();
  updateAttendUI();
}

function setupLixiPreview() {
  const boards = document.getElementById("lixi-boards");
  const copiedEl = document.getElementById("lixi-preview-copied");
  if (!boards) return;

  let copyTimer = 0;

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
  const dock =
    document.getElementById("utility-dock") ||
    document.getElementById("music-dock");
  if (!btn || !audio) return;

  const pad = 16;
  const btnSize = 48;
  const clearGap = 18;

  function placeBtn() {
    let bottom = pad;
    let right = pad;

    if (window.visualViewport) {
      const vv = window.visualViewport;
      const gapBottom = Math.max(0, window.innerHeight - (vv.height + vv.offsetTop));
      bottom = pad + gapBottom;
    }

    if (shell) {
      const rect = shell.getBoundingClientRect();
      right = Math.max(pad, Math.round(window.innerWidth - rect.right + pad));
      const maxRight = Math.max(pad, Math.round(window.innerWidth - rect.left - btnSize - pad));
      right = Math.min(right, maxRight);
    }

    const target = dock || btn;
    target.style.right = `${right}px`;
    target.style.bottom = `${bottom}px`;
    target.style.left = "auto";
    target.style.top = "auto";
    target.style.setProperty("--music-clearance", `${btnSize + clearGap}px`);
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

function setupCouplePortraits() {
  const block = document.getElementById("couple-portraits");
  if (!block) return;

  function reveal() {
    if (block.classList.contains("is-in")) return;
    block.classList.add("is-in");
  }

  function isNearView() {
    if (document.body.classList.contains("invite-locked")) return false;
    const rect = block.getBoundingClientRect();
    if (rect.height < 8) return false;
    const vh = window.innerHeight || document.documentElement.clientHeight;
    return rect.top < vh * 0.95 && rect.bottom > vh * 0.05;
  }

  function checkReveal() {
    if (isNearView()) reveal();
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          reveal();
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -4% 0px" }
  );
  observer.observe(block);

  // Máy thật (đặc biệt iOS): section từng display:none → IO hay bỏ lỡ
  window.__revealCouplePortraits = () => {
    requestAnimationFrame(() => {
      checkReveal();
      requestAnimationFrame(checkReveal);
      setTimeout(checkReveal, 180);
      setTimeout(checkReveal, 650);
    });
  };

  window.addEventListener("scroll", checkReveal, { passive: true });
  window.addEventListener("resize", checkReveal);
  document.fonts.ready.then(checkReveal).catch(() => {});
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
}

function setupLoveAlbum() {
  const title = document.getElementById("love-title-block");
  const block = document.getElementById("love-album");
  if (!title && !block) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.28, rootMargin: "0px 0px -6% 0px" }
  );
  if (title) observer.observe(title);
  if (block) observer.observe(block);
}

function setupPhotoAlbum() {
  const block = document.getElementById("photo-album");
  const grid = document.getElementById("photo-album-grid");
  const lightbox = document.getElementById("album-lightbox");
  const imgEl = document.getElementById("album-lightbox-img");
  const countEl = document.getElementById("album-lightbox-count");
  const closeBtn = document.getElementById("album-lightbox-close");
  const prevBtn = document.getElementById("album-lightbox-prev");
  const nextBtn = document.getElementById("album-lightbox-next");
  if (!block || !grid || !lightbox || !imgEl) return;

  const items = Array.from(grid.querySelectorAll(".photo-album-item"));
  const photos = items
    .map((btn) => {
      const img = btn.querySelector("img");
      return img
        ? { src: img.currentSrc || img.src, alt: img.alt || "Anh album" }
        : null;
    })
    .filter(Boolean);
  if (!photos.length) return;

  let index = 0;
  let touchX = 0;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2, rootMargin: "0px 0px -6% 0px" }
  );
  observer.observe(block);

  function show(i) {
    index = ((i % photos.length) + photos.length) % photos.length;
    const photo = photos[index];
    imgEl.src = photo.src;
    imgEl.alt = photo.alt;
    if (countEl) countEl.textContent = `${index + 1} / ${photos.length}`;
  }

  function open(i) {
    show(i);
    lightbox.hidden = false;
    requestAnimationFrame(() => lightbox.classList.add("is-open"));
    document.body.style.overflow = "hidden";
  }

  function close() {
    lightbox.classList.remove("is-open");
    document.body.style.overflow = "";
    window.setTimeout(() => {
      if (!lightbox.classList.contains("is-open")) lightbox.hidden = true;
    }, 280);
  }

  items.forEach((btn, i) => {
    btn.addEventListener("click", () => open(i));
  });
  closeBtn?.addEventListener("click", close);
  prevBtn?.addEventListener("click", () => show(index - 1));
  nextBtn?.addEventListener("click", () => show(index + 1));

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) close();
  });

  document.addEventListener("keydown", (e) => {
    if (lightbox.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(index - 1);
    if (e.key === "ArrowRight") show(index + 1);
  });

  lightbox.addEventListener(
    "touchstart",
    (e) => {
      touchX = e.changedTouches[0]?.clientX || 0;
    },
    { passive: true }
  );
  lightbox.addEventListener(
    "touchend",
    (e) => {
      const x = e.changedTouches[0]?.clientX || 0;
      const dx = x - touchX;
      if (Math.abs(dx) < 48) return;
      if (dx > 0) show(index - 1);
      else show(index + 1);
    },
    { passive: true }
  );
}

function setupSlideCards() {
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

function setupHeroSlider() {
  const root = document.getElementById("hero-slider");
  const home = document.getElementById("home");
  if (!root || !home) return;

  const viewport = root.querySelector(".hero-slider-viewport");
  const track = root.querySelector(".hero-slider-track");
  const nextBtn = document.getElementById("hero-slider-next");
  if (!viewport || !track) return;

  const albumSrcs = [
    "https://res.cloudinary.com/dwryahwiu/image/upload/v1786086703/1786060246585_3741576002241547934_3741576002241547934_ed1a88f9d6c9facffd0590dcd330dabb_c1a2g3.jpg",
    "https://res.cloudinary.com/dwryahwiu/image/upload/v1786086703/1786060246595_3741576002241547934_3741576002241547934_d54a69ab00a30d787e63cc8145f6ccb3_rnst5o.jpg",
  ];

  if (albumSrcs.length) {
    track.innerHTML = albumSrcs
      .map(
        (src) =>
          `<div class="hero-slide"><img src="${src}" alt="Anh cuoi" decoding="async" draggable="false"/></div>`
      )
      .join("");
  }

  const slides = Array.from(track.querySelectorAll(".hero-slide"));
  if (slides.length < 1) return;

  let index = 0;
  let timer = 0;
  let started = false;
  const AUTO_MS = 4200;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function go(to) {
    if (slides.length < 2) return;
    index = ((to % slides.length) + slides.length) % slides.length;
    track.style.transform = `translate3d(-${index * 100}%, 0, 0)`;
  }

  function next() {
    go(index + 1);
  }

  function arm() {
    window.clearInterval(timer);
    if (reduceMotion || slides.length < 2) return;
    timer = window.setInterval(next, AUTO_MS);
  }

  function start() {
    if (started) return;
    started = true;
    go(0);
    arm();
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", (e) => {
      e.preventDefault();
      next();
      arm();
    });
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      window.clearInterval(timer);
    } else if (started) {
      arm();
    }
  });

  if (home.classList.contains("is-layout-ready")) {
    start();
    return;
  }

  const obs = new MutationObserver(() => {
    if (!home.classList.contains("is-layout-ready")) return;
    start();
    obs.disconnect();
  });
  obs.observe(home, { attributes: true, attributeFilter: ["class"] });
}

function setupCountdown() {
  const dayEl = document.getElementById("count-day");
  const hourEl = document.getElementById("count-hour");
  const minEl = document.getElementById("count-min");
  const secEl = document.getElementById("count-sec");
  if (!dayEl || !hourEl || !minEl || !secEl) return;

  const type = getInviteType();
  const endAt =
    type === "nhagai30"
      ? new Date("2026-09-30T11:00:00+07:00").getTime()
      : type === "nhagai29"
        ? new Date("2026-09-29T17:00:00+07:00").getTime()
        : new Date("2026-09-30T17:00:00+07:00").getTime();

  function pad(n) {
    return String(Math.max(0, n)).padStart(2, "0");
  }

  function tick() {
    let left = Math.max(0, endAt - Date.now());
    const day = Math.floor(left / 86400000);
    left -= day * 86400000;
    const hour = Math.floor(left / 3600000);
    left -= hour * 3600000;
    const min = Math.floor(left / 60000);
    const sec = Math.floor((left % 60000) / 1000);
    dayEl.textContent = pad(day);
    hourEl.textContent = pad(hour);
    minEl.textContent = pad(min);
    secEl.textContent = pad(sec);
  }

  tick();
  window.setInterval(tick, 1000);
}

function setupCountIcon() {
  const icon = document.querySelector(".count-icon");
  const sec = document.getElementById("count-sec");
  const nums = document.getElementById("count-nums");
  const stack = document.querySelector(".count-stack");
  if (!icon || !sec || !nums || !stack) return;

  function place() {
    const fontSize = parseFloat(window.getComputedStyle(nums).fontSize) || 36;
    const iconW = Math.round(fontSize * 2.15);
    const gap = Math.max(8, Math.round(fontSize * 0.26));
    icon.style.width = `${iconW}px`;
    const stackBox = stack.getBoundingClientRect();
    const secBox = sec.getBoundingClientRect();
    const iconH = icon.getBoundingClientRect().height || iconW * (1032 / 897);
    const left = secBox.left - stackBox.left + secBox.width / 2 - iconW / 2;
    const top = secBox.top - stackBox.top - iconH - gap;
    icon.style.left = `${Math.round(left)}px`;
    icon.style.top = `${Math.round(top)}px`;
    const needPad = Math.ceil(iconH + gap + 6);
    if (parseFloat(window.getComputedStyle(stack).paddingTop) !== needPad) {
      stack.style.paddingTop = `${needPad}px`;
    }
  }

  function run() {
    place();
    window.requestAnimationFrame(place);
  }

  if (icon.complete) run();
  else icon.addEventListener("load", run, { once: true });
  window.addEventListener("resize", run);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(run);
}

function setupCountWine() {
  const wrap = document.getElementById("count-wine");
  const canvas = document.getElementById("count-wine-canvas");
  const nums = document.getElementById("count-nums");
  if (!wrap || !canvas || !nums) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const WAVE_N = 42;
  const wave = new Float32Array(WAVE_N);
  const waveV = new Float32Array(WAVE_N);
  const drops = [];
  let width = 1;
  let height = 1;
  let dpr = 1;
  let poolY = 1;
  let running = false;
  let seen = false;
  let lastT = 0;
  let spawnWait = 0;

  function sizeCanvas() {
    const box = wrap.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, box.width);
    height = Math.max(1, box.height);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    poolY = height * 0.34;
  }

  function addDrop(x, y, vx, vy, r, life) {
    if (drops.length > 90) return;
    drops.push({ x, y, vx, vy, r, life, max: life });
  }

  function hitWave(x, force) {
    const i = Math.max(1, Math.min(WAVE_N - 2, Math.round((x / width) * (WAVE_N - 1))));
    waveV[i] += force;
    waveV[i - 1] += force * 0.45;
    waveV[i + 1] += force * 0.45;
  }

  function stepWave() {
    for (let i = 1; i < WAVE_N - 1; i += 1) {
      const pull = -wave[i] * 0.011;
      const left = wave[i - 1] - wave[i];
      const right = wave[i + 1] - wave[i];
      waveV[i] = (waveV[i] + pull + (left + right) * 0.07) * 0.986;
    }
    waveV[0] = waveV[1];
    waveV[WAVE_N - 1] = waveV[WAVE_N - 2];
    for (let i = 0; i < WAVE_N; i += 1) {
      wave[i] += waveV[i];
    }
  }

  function spawnStream(dt) {
    spawnWait -= dt;
    if (spawnWait > 0) return;
    spawnWait = 0.075 + Math.random() * 0.04;
    const mid = width * 0.5;
    const side = Math.random() < 0.5 ? -1 : 1;
    const x = mid + side * (8 + Math.random() * (width * 0.28));
    addDrop(x, -2, side * (0.08 + Math.random() * 0.16), 1.2 + Math.random() * 0.5, 1.8 + Math.random() * 1, 1);
  }

  function stepDrops() {
    for (let i = drops.length - 1; i >= 0; i -= 1) {
      const d = drops[i];
      d.vy += 0.07;
      d.vx *= 0.994;
      d.x += d.vx;
      d.y += d.vy;
      d.life -= 0.012;
      const surface = poolY + wave[Math.max(0, Math.min(WAVE_N - 1, Math.round((d.x / width) * (WAVE_N - 1))))];
      if (d.y + d.r >= surface && d.vy > 0 && d.y < poolY + 28) {
        hitWave(d.x, Math.min(1.4, d.r * d.vy * 0.09));
        const n = 2 + Math.floor(Math.random() * 2);
        for (let s = 0; s < n; s += 1) {
          addDrop(
            d.x + (Math.random() - 0.5) * 8,
            surface - 2,
            (Math.random() - 0.5) * 2.8,
            -0.9 - Math.random() * 1.2,
            0.8 + Math.random() * 0.9,
            0.55
          );
        }
        drops.splice(i, 1);
        continue;
      }
      if (d.life <= 0 || d.y > height + 12 || d.x < -16 || d.x > width + 16) {
        drops.splice(i, 1);
      }
    }
  }

  function drawPool() {
    const deep = height;
    ctx.beginPath();
    ctx.moveTo(0, deep);
    ctx.lineTo(0, poolY + wave[0]);
    for (let i = 1; i < WAVE_N; i += 1) {
      const x = (i / (WAVE_N - 1)) * width;
      ctx.lineTo(x, poolY + wave[i]);
    }
    ctx.lineTo(width, deep);
    ctx.closePath();
    const fill = ctx.createLinearGradient(0, poolY - 10, 0, deep);
    fill.addColorStop(0, "rgba(214, 72, 84, 0.92)");
    fill.addColorStop(0.45, "rgba(158, 26, 50, 0.96)");
    fill.addColorStop(1, "rgba(88, 12, 24, 0.88)");
    ctx.fillStyle = fill;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, poolY + wave[0]);
    for (let i = 1; i < WAVE_N; i += 1) {
      ctx.lineTo((i / (WAVE_N - 1)) * width, poolY + wave[i]);
    }
    ctx.strokeStyle = "rgba(255, 208, 210, 0.42)";
    ctx.lineWidth = 1.35;
    ctx.stroke();
  }

  function drawGlyphs() {
    const box = canvas.getBoundingClientRect();
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#fff";
    nums.querySelectorAll("span").forEach((el) => {
      const node = el.firstChild;
      if (!node || node.nodeType !== 1 && node.nodeType !== 3) return;
      if (node.nodeType !== 3) return;
      const style = window.getComputedStyle(el);
      ctx.font = style.font || `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      ctx.textBaseline = "top";
      ctx.textAlign = "left";
      ctx.globalAlpha = el.classList.contains("count-colon") ? 0.88 : 1;
      const text = el.textContent || "";
      for (let i = 0; i < text.length; i += 1) {
        if (text[i] === " ") continue;
        const range = document.createRange();
        range.setStart(node, i);
        range.setEnd(node, i + 1);
        const r = range.getBoundingClientRect();
        ctx.fillText(text[i], r.left - box.left, r.top - box.top);
      }
    });
    ctx.restore();
  }

  function drawDrops() {
    for (let i = 0; i < drops.length; i += 1) {
      const d = drops[i];
      const stretch = Math.min(2.4, 1 + Math.abs(d.vy) * 0.16);
      const alpha = Math.max(0.18, d.life / d.max);
      ctx.save();
      ctx.translate(d.x, d.y);
      ctx.scale(1, stretch);
      const g = ctx.createRadialGradient(0, -d.r * 0.3, 0.2, 0, 0, d.r * 1.15);
      g.addColorStop(0, `rgba(210, 86, 96, ${0.9 * alpha})`);
      g.addColorStop(0.55, `rgba(158, 26, 50, ${0.82 * alpha})`);
      g.addColorStop(1, `rgba(88, 12, 24, ${0.1 * alpha})`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, d.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function frame(now) {
    if (!running) return;
    const dt = Math.min(0.033, (now - lastT) / 1000 || 0.016);
    lastT = now;
    spawnStream(dt);
    stepDrops();
    stepWave();
    ctx.clearRect(0, 0, width, height);
    drawGlyphs();
    ctx.globalCompositeOperation = "source-atop";
    drawDrops();
    drawPool();
    ctx.globalCompositeOperation = "source-over";
    window.requestAnimationFrame(frame);
  }

  function start() {
    if (running) return;
    running = true;
    lastT = performance.now();
    window.requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
  }

  sizeCanvas();
  const ro = new ResizeObserver(sizeCanvas);
  ro.observe(wrap);

  const io = new IntersectionObserver(
    (entries) => {
      const on = entries.some((e) => e.isIntersecting);
      if (on) {
        if (!seen) {
          seen = true;
          hitWave(width * 0.5, 1.6);
        }
        start();
      } else {
        stop();
      }
    },
    { threshold: 0.2 }
  );
  io.observe(wrap);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else if (seen) start();
  });
}

function setupBackgroundScroll() {
  const track = document.getElementById("invite-bg-track");
  if (!track) return;

  const bgShell = track.parentElement;
  const mainShell = document.querySelector(".invite-shell");
  const img = track.querySelector("img");
  let ticking = false;
  const BG_RATIO = 1024 / 570; // background.png (570x1024)

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

function setupCoverGuestName() {
  const el = document.getElementById("cover-guest-name");
  if (!el) return;

  const params = getInviteParams();
  const name = decodeInviteParam(params.get("name"));
  if (!name) return;

  const line2 = decodeInviteParam(params.get("l2"));
  const wrap = params.get("wrap") === "1";
  const hasTildeBreak = name.includes("~");

  el.classList.add("has-name");

  if (hasTildeBreak || line2) {
    el.classList.add("is-wrap");
    const lines = hasTildeBreak
      ? name.split("~").map((line) => line.trim()).filter(Boolean)
      : [name];
    if (line2) lines.push(line2);
    renderCoverGuestNameLines(el, lines);
    return;
  }

  if (wrap) {
    el.classList.add("is-wrap");
    el.textContent = name;
    return;
  }

  el.textContent = name;
  fitCoverGuestName(el);

  window.addEventListener("resize", () => fitCoverGuestName(el));
  if (typeof ResizeObserver !== "undefined") {
    const ro = new ResizeObserver(() => fitCoverGuestName(el));
    ro.observe(el);
    if (el.parentElement) ro.observe(el.parentElement);
  }
}

function renderCoverGuestNameLines(el, lines) {
  el.replaceChildren();
  lines.forEach((line, index) => {
    if (index > 0) el.appendChild(document.createElement("br"));
    el.appendChild(document.createTextNode(line));
  });
}

function fitCoverGuestName(el) {
  if (!el || el.classList.contains("is-wrap")) return;

  const maxSize = 54;
  const minSize = 16;
  let size = maxSize;
  el.style.fontSize = `${size}px`;

  while (size > minSize && el.scrollWidth > el.clientWidth + 1) {
    size -= 1;
    el.style.fontSize = `${size}px`;
  }
}

function setupInviteEnvelope() {
  const home = document.getElementById("home");
  const openBtn = document.getElementById("open-invite-btn");
  const gate = document.getElementById("cover-gate");
  if (!home || !openBtn) {
    document.body.classList.remove("invite-locked");
    document.documentElement.classList.remove("invite-locked");
    return;
  }

  document.body.classList.add("invite-locked");
  document.documentElement.classList.add("invite-locked");

  const OPEN_MS = 6700;

  function finishOpen() {
    home.classList.remove("is-sealed");
    home.classList.add("is-opened");
    home.classList.remove("is-opening");
    openBtn.disabled = true;
    openBtn.setAttribute("aria-label", "Thiep da mo");
    window.dispatchEvent(new Event("resize"));
  }

  function startMusicNow() {
    if (typeof window.__inviteStartMusic === "function") {
      return window.__inviteStartMusic();
    }
    return Promise.resolve(false);
  }

  function showLayouts() {
    home.classList.add("is-layout-ready");
    document.body.classList.remove("invite-locked");
    document.documentElement.classList.remove("invite-locked");
    finishOpen();
    if (typeof window.__revealCouplePortraits === "function") {
      window.__revealCouplePortraits();
    }
  }

  // Chỉ trượt hai cánh — chưa hiện layout / chưa mở khoá cuộn
  function openPanels() {
    if (home.dataset.opening === "1") return;
    home.dataset.opening = "1";
    home.classList.add("is-opening");

    setTimeout(() => {
      home.classList.remove("is-sealed");
      home.classList.add("is-opened");
      home.classList.remove("is-opening");
      openBtn.disabled = true;
      openBtn.setAttribute("aria-label", "Thiep da mo");
    }, OPEN_MS);
  }

  async function startFlowFromTap() {
    if (home.dataset.flow === "1") return;
    home.dataset.flow = "1";

    if (gate) gate.classList.add("is-done");
    startMusicNow();

    const intro = document.getElementById("cover-intro");
    if (intro) intro.classList.add("is-active");

    openPanels();
    await runCoverIntro();
    showLayouts();
  }

  if (getInviteParams().get("open") === "1") {
    if (gate) gate.classList.add("is-done");
    const intro = document.getElementById("cover-intro");
    if (intro) intro.classList.add("is-done");
    home.dataset.opening = "1";
    home.dataset.flow = "1";
    showLayouts();
    startMusicNow();
    return;
  }

  if (gate) {
    gate.addEventListener("click", startFlowFromTap);

    let startX = 0;
    let startY = 0;
    let tracking = false;

    function onSwipeStart(x, y) {
      startX = x;
      startY = y;
      tracking = true;
    }

    function onSwipeEnd(x, y) {
      if (!tracking) return;
      tracking = false;
      const dist = Math.hypot(x - startX, y - startY);
      if (dist >= 42) startFlowFromTap();
    }

    gate.addEventListener(
      "touchstart",
      (e) => {
        const t = e.changedTouches[0];
        if (t) onSwipeStart(t.clientX, t.clientY);
      },
      { passive: true }
    );
    gate.addEventListener(
      "touchend",
      (e) => {
        const t = e.changedTouches[0];
        if (t) onSwipeEnd(t.clientX, t.clientY);
      },
      { passive: true }
    );
  } else {
    document.addEventListener(
      "pointerdown",
      () => {
        startFlowFromTap();
      },
      { once: true, passive: true }
    );
  }
}

/** Intro: gõ từng dòng — trả Promise khi xong */
function runCoverIntro() {
  const intro = document.getElementById("cover-intro");
  if (!intro || intro.classList.contains("is-done")) {
    return Promise.resolve();
  }

  const lines = Array.from(intro.querySelectorAll(".intro-line[data-type]"));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function typeLine(el, text, speed) {
    return new Promise((resolve) => {
      el.textContent = "";
      el.classList.add("is-typing");
      let i = 0;
      const tick = () => {
        if (i >= text.length) {
          el.classList.remove("is-typing");
          resolve();
          return;
        }
        el.textContent += text.charAt(i);
        i += 1;
        setTimeout(tick, speed);
      };
      tick();
    });
  }

  return (async () => {
    intro.classList.add("is-active");
    const theImg = intro.querySelector(".intro-the");

    if (reduceMotion) {
      lines.forEach((el) => {
        el.textContent = el.getAttribute("data-type") || "";
      });
      if (theImg) theImg.classList.add("is-shown");
      await wait(2400);
    } else {
      await wait(600);
      for (const el of lines) {
        const text = el.getAttribute("data-type") || "";
        const speed = el.classList.contains("intro-date") ? 120 : 130;
        await typeLine(el, text, speed);
        if (el.classList.contains("intro-save") && theImg) {
          theImg.classList.add("is-shown");
          await wait(350);
        } else {
          await wait(700);
        }
      }
      await wait(3000);
    }

    intro.classList.remove("is-active");
    intro.classList.add("is-done");
  })();
}
