/* ============================================================================
   main.js —— 轻量交互：阅读进度条 / 回卷钮 / 诗笺书签
   无依赖、渐进增强；动效偏好在 CSS 层降级。
   ============================================================================ */
(function () {
  "use strict";

  /* ——— 阅读进度条 ——— */
  var progress = document.querySelector(".scroll-progress");
  var ticking = false;

  function updateProgress() {
    ticking = false;
    if (!progress) return;
    var doc = document.documentElement;
    var total = doc.scrollHeight - window.innerHeight;
    var ratio = total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0;
    progress.style.width = (ratio * 100).toFixed(2) + "%";
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateProgress);
    }
  }

  /* ——— 回卷钮 ——— */
  var backBtn = document.querySelector(".back-to-top");

  function updateBackTop() {
    if (!backBtn) return;
    var show = window.scrollY > window.innerHeight * 0.6;
    backBtn.classList.toggle("is-visible", show);
    if (show) {
      backBtn.hidden = false;
    } else {
      /* 等过渡结束后再隐藏，避免闪烁 */
      setTimeout(function () {
        if (!backBtn.classList.contains("is-visible")) backBtn.hidden = true;
      }, 300);
    }
  }

  if (backBtn) {
    backBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("scroll", updateBackTop, { passive: true });
  updateProgress();
  updateBackTop();

  /* ——— 诗笺书签：本地收藏，朱文/白文互转 ——— */
  var STORE_KEY = "lyricall:bookmarks";

  function loadBookmarks() {
    try {
      return JSON.parse(window.localStorage.getItem(STORE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function saveBookmarks(map) {
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(map));
    } catch (e) {
      /* 私密模式等场景下静默失败 */
    }
  }

  function paintButton(btn, bookmarked) {
    btn.classList.toggle("is-bookmarked", bookmarked);
    btn.setAttribute("aria-pressed", bookmarked ? "true" : "false");
    var label = btn.querySelector(".bookmark-btn__text");
    if (label) label.textContent = bookmarked ? "已藏" : "藏";
  }

  var buttons = document.querySelectorAll("[data-bookmark]");
  if (buttons.length) {
    var bookmarks = loadBookmarks();

    Array.prototype.forEach.call(buttons, function (btn) {
      var permalink = btn.getAttribute("data-permalink") || "";
      if (!permalink) return;
      paintButton(btn, Boolean(bookmarks[permalink]));

      btn.addEventListener("click", function () {
        var map = loadBookmarks();
        if (map[permalink]) {
          delete map[permalink];
          paintButton(btn, false);
        } else {
          map[permalink] = {
            title: btn.getAttribute("data-title") || document.title,
            url: permalink,
            savedAt: Date.now()
          };
          paintButton(btn, true);
        }
        saveBookmarks(map);
      });
    });
  }
})();
