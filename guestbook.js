// Sổ lưu bút — luôn nổi footer + lời chúc chạy kiểu livestream
(function () {
  const firebaseConfig = {
    apiKey: "AIzaSyBe7fYgRshIowUQ8phoPh0nuUXeb47ZXug",
    authDomain: "damcuoigianghanh.firebaseapp.com",
    databaseURL: "https://damcuoigianghanh-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "damcuoigianghanh",
    storageBucket: "damcuoigianghanh.firebasestorage.app",
    messagingSenderId: "724957835833",
    appId: "1:724957835833:web:03d54b815314609af353e8",
    measurementId: "G-MYJS9NS63L",
  };

  const LONG_CHARS = 90;
  const VISIBLE_COUNT = 3;
  const SCROLL_SPEED = 0.028; // px/ms — slow continuous drift
  const GAP_PX = 7;

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function chipHtml(item) {
    const name = escapeHtml(item.name || "Khách");
    const message = escapeHtml(item.message || "");
    const isLong = String(item.message || "").length >= LONG_CHARS || String(item.message || "").includes("\n");
    return (
      `<article class="live-chip${isLong ? " is-long" : ""}" data-id="${escapeHtml(item.id)}">` +
      `<div class="live-chip-body">` +
      `<span class="live-chip-name">${name}</span>` +
      `<span class="live-chip-sep">:</span>` +
      `<span class="live-chip-text">${message}</span>` +
      `</div>` +
      (isLong
        ? `<button type="button" class="live-chip-more" aria-expanded="false">Xem thêm</button>`
        : "") +
      `</article>`
    );
  }

  function setupGuestbook() {
    if (typeof firebase === "undefined") {
      console.warn("Firebase SDK chưa tải.");
      return;
    }

    const fab = document.getElementById("book-fab");
    const heartFab = document.getElementById("heart-fab");
    const heartBurst = document.getElementById("heart-burst");
    const liveBook = document.getElementById("live-book");
    const form = document.getElementById("guestbook-form");
    const closeBtn = document.getElementById("guestbook-close");
    const nameInput = document.getElementById("guestbook-name");
    const messageInput = document.getElementById("guestbook-message");
    const sendBtn = document.getElementById("guestbook-send");
    const feed = document.getElementById("guestbook-list");
    const track = document.getElementById("guestbook-track");
    const empty = document.getElementById("guestbook-empty");
    const status = document.getElementById("guestbook-status");
    const shell = document.querySelector(".invite-shell");
    const musicDock =
      document.getElementById("utility-dock") ||
      document.getElementById("music-dock");
    if (!fab || !liveBook || !form || !nameInput || !messageInput || !sendBtn || !feed || !track) return;

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    const guestbookRef = firebase.database().ref("guestbook");

    let items = [];
    let knownIds = "";
    let scrollY = 0;
    let lastTs = 0;
    let rafId = 0;
    let closeTimer = 0;
    let reduceMotion = false;

    try {
      reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (_) {}

    function setStatus(text, isError) {
      if (!status) return;
      status.textContent = text || "";
      status.classList.toggle("is-error", !!isError);
    }

    function placeLiveBook() {
      const pad = 12;
      const musicBtn = 46;
      const clearGap = 22;
      let bottom = pad;
      let left = pad;
      let musicRoom = musicBtn + clearGap + pad;

      if (window.visualViewport) {
        const vv = window.visualViewport;
        const gapBottom = Math.max(0, window.innerHeight - (vv.height + vv.offsetTop));
        bottom = pad + gapBottom;
      }

      if (musicDock) {
        const dockRight = parseFloat(musicDock.style.right);
        if (!Number.isNaN(dockRight)) {
          musicRoom = Math.max(musicRoom, Math.round(dockRight + musicBtn + clearGap));
        }
      }

      if (shell) {
        const rect = shell.getBoundingClientRect();
        left = Math.max(pad, Math.round(rect.left + pad));
      }

      const end = Math.min(
        shell ? Math.round(shell.getBoundingClientRect().right - clearGap) : window.innerWidth - pad,
        Math.round(window.innerWidth - musicRoom)
      );
      const maxW = liveBook.classList.contains("is-writing") ? 320 : 280;
      const width = Math.max(180, Math.min(maxW, end - left));

      liveBook.style.left = `${left}px`;
      liveBook.style.bottom = `${bottom}px`;
      liveBook.style.width = `${width}px`;
      liveBook.style.right = "auto";
      liveBook.style.top = "auto";
    }

    function autoGrowField(el, minH) {
      el.style.height = "auto";
      const floor = minH || 36;
      const next = Math.max(floor, el.scrollHeight);
      el.style.height = `${next}px`;
    }

    function syncComposerHeight() {
      autoGrowField(nameInput, 36);
      autoGrowField(messageInput, 44);
    }

    function throwHearts() {
      if (!heartBurst) return;
      const colors = ["#9E1A32", "#C45B6D", "#B99A68", "#E08A9A", "#9E1A32"];
      for (let i = 0; i < 8; i += 1) {
        const el = document.createElement("span");
        el.className = "heart-float";
        el.style.setProperty("--dx", `${Math.round((Math.random() - 0.5) * 56)}px`);
        el.style.setProperty("--delay", `${(Math.random() * 0.22).toFixed(2)}s`);
        el.style.setProperty("--scale", `${(0.85 + Math.random() * 0.7).toFixed(2)}`);
        el.style.setProperty("--spin", `${Math.round((Math.random() - 0.5) * 40)}deg`);
        el.style.color = colors[i % colors.length];
        el.innerHTML =
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';
        heartBurst.appendChild(el);
        window.setTimeout(() => el.remove(), 1700);
      }
      if (heartFab) {
        heartFab.classList.add("is-pop");
        window.setTimeout(() => heartFab.classList.remove("is-pop"), 180);
      }
    }

    function openComposer() {
      window.clearTimeout(closeTimer);
      form.hidden = false;
      form.setAttribute("aria-hidden", "false");
      liveBook.classList.add("is-writing");
      fab.setAttribute("aria-expanded", "true");
      // force paint closed styles before opening transition
      void form.offsetWidth;
      form.classList.add("is-open");
      syncComposerHeight();
      placeLiveBook();
      window.setTimeout(() => nameInput.focus(), 180);
    }

    function closeComposer() {
      form.classList.remove("is-open");
      form.setAttribute("aria-hidden", "true");
      fab.setAttribute("aria-expanded", "false");
      liveBook.classList.remove("is-writing");
      setStatus("");
      placeLiveBook();
      closeTimer = window.setTimeout(() => {
        if (!form.classList.contains("is-open")) form.hidden = true;
      }, 280);
    }

    function bindChipMore(root) {
      (root || track).querySelectorAll(".live-chip-more").forEach((btn) => {
        if (btn.dataset.bound) return;
        btn.dataset.bound = "1";
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const chip = btn.closest(".live-chip");
          if (!chip) return;
          const open = chip.classList.toggle("is-expanded");
          btn.setAttribute("aria-expanded", open ? "true" : "false");
          btn.textContent = open ? "Thu gọn" : "Xem thêm";
        });
      });
    }

    function applyTrackTransform() {
      track.style.transform = `translate3d(0, ${-scrollY}px, 0)`;
    }

    function recycleIfNeeded() {
      const chips = track.querySelectorAll(".live-chip");
      if (chips.length < 2) return;
      let guard = 0;
      while (guard < 8) {
        const first = track.querySelector(".live-chip");
        if (!first) break;
        const step = first.offsetHeight + GAP_PX;
        if (step <= 0 || scrollY < step) break;
        scrollY -= step;
        track.appendChild(first);
        guard += 1;
      }
      applyTrackTransform();
    }

    function tick(ts) {
      if (!lastTs) lastTs = ts;
      const dt = Math.min(40, ts - lastTs);
      lastTs = ts;

      if (!reduceMotion && items.length > 1) {
        // Ease slightly when user expanded a long message (pause drift a bit)
        const expanded = track.querySelector(".live-chip.is-expanded");
        const speed = expanded ? SCROLL_SPEED * 0.25 : SCROLL_SPEED;
        scrollY += speed * dt;
        recycleIfNeeded();
        applyTrackTransform();
      }

      rafId = requestAnimationFrame(tick);
    }

    function startDrift() {
      if (rafId) cancelAnimationFrame(rafId);
      lastTs = 0;
      rafId = requestAnimationFrame(tick);
    }

    function renderTrack(nextItems) {
      const keepScroll = scrollY;
      track.querySelectorAll(".live-chip").forEach((el) => el.remove());

      if (!nextItems.length) {
        if (empty) {
          empty.hidden = false;
          if (!track.contains(empty)) track.prepend(empty);
        }
        scrollY = 0;
        applyTrackTransform();
        return;
      }

      if (empty) empty.hidden = true;

      // Keep a looping track, but viewport only shows ~3 comments
      let seed = nextItems.slice();
      const minLoop = Math.max(VISIBLE_COUNT + 1, 4);
      while (seed.length > 0 && seed.length < minLoop) {
        seed = seed.concat(nextItems);
      }
      track.insertAdjacentHTML("beforeend", seed.map(chipHtml).join(""));
      bindChipMore(track);

      // Soft continue — avoid hard snap to 0
      scrollY = Math.min(keepScroll, 24);
      applyTrackTransform();
      recycleIfNeeded();
    }

    function setItems(nextItems) {
      const nextKey = nextItems.map((x) => x.id).join(",");
      const changed = nextKey !== knownIds;
      items = nextItems;
      if (!changed && items.length) return;
      knownIds = nextKey;
      renderTrack(items);
      startDrift();
    }

    fab.addEventListener("click", () => {
      if (liveBook.classList.contains("is-writing")) closeComposer();
      else openComposer();
    });

    closeBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeComposer();
    });

    heartFab?.addEventListener("click", (e) => {
      e.stopPropagation();
      throwHearts();
    });

    nameInput.addEventListener("input", syncComposerHeight);
    messageInput.addEventListener("input", syncComposerHeight);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && liveBook.classList.contains("is-writing")) {
        closeComposer();
      }
    });

    document.addEventListener("pointerdown", (e) => {
      if (!liveBook.classList.contains("is-writing")) return;
      if (liveBook.contains(e.target)) return;
      closeComposer();
    });

    // Enable reading long chips
    feed.style.pointerEvents = "auto";
    track.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        scrollY += e.deltaY * 0.35;
        if (scrollY < 0) scrollY = 0;
        recycleIfNeeded();
        applyTrackTransform();
      },
      { passive: false }
    );

    placeLiveBook();
    window.addEventListener("resize", placeLiveBook);
    window.addEventListener("scroll", placeLiveBook, { passive: true });
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", placeLiveBook);
      window.visualViewport.addEventListener("scroll", placeLiveBook);
    }
    // Re-place after music dock positions itself
    window.setTimeout(placeLiveBook, 50);
    window.setTimeout(placeLiveBook, 300);

    guestbookRef
      .orderByChild("createdAt")
      .limitToLast(80)
      .on(
        "value",
        (snap) => {
          const next = [];
          snap.forEach((child) => {
            const val = child.val() || {};
            next.push({
              id: child.key,
              name: val.name || "Khách",
              message: val.message || "",
              createdAt: val.createdAt || 0,
            });
          });
          setItems(next);
        },
        (err) => {
          console.warn("Guestbook listen error:", err);
          setStatus("Không đọc được sổ lưu bút.", true);
        }
      );

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = nameInput.value.trim().slice(0, 80);
      const message = messageInput.value.trim().slice(0, 300);
      if (!name || !message) {
        setStatus("Nhập tên và lời chúc nhé.", true);
        return;
      }

      sendBtn.disabled = true;
      setStatus("Đang gửi...");

      try {
        await guestbookRef.push({
          name,
          message,
          createdAt: firebase.database.ServerValue.TIMESTAMP,
        });
        nameInput.value = "";
        messageInput.value = "";
        syncComposerHeight();
        setStatus("Đã gửi!");
        window.setTimeout(() => {
          setStatus("");
          closeComposer();
        }, 900);
      } catch (err) {
        console.warn("Guestbook send error:", err);
        setStatus("Gửi thất bại. Thử lại sau.", true);
      } finally {
        sendBtn.disabled = false;
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupGuestbook);
  } else {
    setupGuestbook();
  }
})();
