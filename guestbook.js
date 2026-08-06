// Sổ lưu bút realtime — Firebase Realtime Database
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

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatTime(ts) {
    if (!ts) return "";
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${pad(d.getDate())}/${d.getMonth() + 1}/${d.getFullYear()}`;
  }

  function cardHtml(item) {
    return (
      `<div class="guestbook-card p-4 rounded-lg border" data-id="${escapeHtml(item.id)}">` +
      `<div class="flex justify-between items-start mb-3 gap-3">` +
      `<h4 class="font-headline-md text-base text-primary">${escapeHtml(item.name)}</h4>` +
      `<span class="font-serif text-[10px] text-secondary shrink-0">${escapeHtml(formatTime(item.createdAt))}</span>` +
      `</div>` +
      `<p class="font-serif text-sm text-secondary leading-relaxed whitespace-pre-wrap">${escapeHtml(item.message)}</p>` +
      `</div>`
    );
  }

  function setupGuestbook() {
    if (typeof firebase === "undefined") {
      console.warn("Firebase SDK chưa tải.");
      return;
    }

    const form = document.getElementById("guestbook-form");
    const nameInput = document.getElementById("guestbook-name");
    const messageInput = document.getElementById("guestbook-message");
    const sendBtn = document.getElementById("guestbook-send");
    const list = document.getElementById("guestbook-list");
    const empty = document.getElementById("guestbook-empty");
    const status = document.getElementById("guestbook-status");
    if (!form || !nameInput || !messageInput || !sendBtn || !list) return;

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    const db = firebase.database();
    const guestbookRef = db.ref("guestbook");

    function setStatus(text, isError) {
      if (!status) return;
      status.textContent = text || "";
      status.style.color = isError ? "#B87474" : "";
    }

    function render(items) {
      const cards = list.querySelectorAll(".guestbook-card");
      cards.forEach((el) => el.remove());

      if (!items.length) {
        if (empty) empty.hidden = false;
        return;
      }
      if (empty) empty.hidden = true;

      const html = items.map(cardHtml).join("");
      list.insertAdjacentHTML("beforeend", html);
    }

    guestbookRef
      .orderByChild("createdAt")
      .limitToLast(100)
      .on(
        "value",
        (snap) => {
          const items = [];
          snap.forEach((child) => {
            const val = child.val() || {};
            items.push({
              id: child.key,
              name: val.name || "Khách",
              message: val.message || "",
              createdAt: val.createdAt || 0,
            });
          });
          items.reverse();
          render(items);
        },
        (err) => {
          console.warn("Guestbook listen error:", err);
          setStatus("Không đọc được sổ lưu bút. Kiểm tra Rules Firebase.", true);
        }
      );

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = nameInput.value.trim().slice(0, 50);
      const message = messageInput.value.trim().slice(0, 500);
      if (!name || !message) {
        setStatus("Vui lòng nhập tên và lời chúc.", true);
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
        setStatus("Đã gửi lời chúc — cảm ơn bạn!");
        setTimeout(() => setStatus(""), 2500);
      } catch (err) {
        console.warn("Guestbook send error:", err);
        setStatus("Gửi thất bại. Kiểm tra Rules Firebase (cho phép write).", true);
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
