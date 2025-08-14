// /todo/install.js — постоянная кнопка "Скачать/Установить"
let deferredPrompt = null;

const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
const isStandalone =
  window.matchMedia("(display-mode: standalone)").matches ||
  window.navigator.standalone === true;

// Рисуем кнопку сразу (даже до beforeinstallprompt)
document.addEventListener("DOMContentLoaded", () => {
  if (isStandalone) return; // уже установлено — ничего не показываем
  renderButton();
  // Если пришли с ?install=1 — подсветим установку
  if (new URLSearchParams(location.search).get("install") === "1") {
    showHint(isIOS
      ? 'На iPhone: нажмите <b>Поделиться</b> → <b>На экран «Домой»</b>.'
      : 'Нажмите кнопку <b>Скачать</b> или откройте меню браузера и выберите <b>Установить приложение</b>.'
    );
  }
});

window.addEventListener("beforeinstallprompt", (e) => {
  if (isStandalone) return;
  e.preventDefault();
  deferredPrompt = e;
  enableButton();
});

window.addEventListener("appinstalled", () => {
  removeUI();
});

function renderButton() {
  if (document.getElementById("install-btn")) return;

  const btn = document.createElement("button");
  btn.id = "install-btn";
  btn.textContent = "Скачать ToDo";
  Object.assign(btn.style, {
    position: "fixed", right: "16px", bottom: "16px", zIndex: 10000,
    padding: "10px 14px", border: "none", borderRadius: "12px",
    background: "#317EFB", color: "#fff", fontWeight: 600,
    boxShadow: "0 6px 18px rgba(0,0,0,.15)", cursor: "pointer",
    opacity: "1"
  });
  btn.setAttribute("aria-live", "polite");
  btn.addEventListener("click", onInstallClick);
  document.body.appendChild(btn);

  // До прихода beforeinstallprompt оставляем кнопку активной,
  // но поведение — показать подсказку/инструкцию.
}

function enableButton() {
  const btn = document.getElementById("install-btn");
  if (!btn) return;
  btn.disabled = false;
  btn.style.opacity = "1";
}

async function onInstallClick() {
  if (deferredPrompt) {
    // Нативное окно установки (Android/Chrome и некоторые десктопы)
    const btn = document.getElementById("install-btn");
    btn.disabled = true;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome !== "accepted") btn.disabled = false;
    deferredPrompt = null;
    return;
  }

  // Фоллбек: нет beforeinstallprompt
  if (isIOS) {
    showHint('На iPhone: нажмите <b>Поделиться</b> → <b>На экран «Домой»</b>.');
  } else {
    showHint(
      'Откройте меню браузера и выберите <b>Установить приложение / Install app</b>.<br>' +
      'В Chrome (desktop) — значок <b>+</b> в адресной строке; в Android — меню <b>⋮ → Установить приложение</b>.'
    );
  }
}

function showHint(html) {
  removeHint();
  const hint = document.createElement("div");
  hint.id = "install-hint";
  hint.innerHTML = html + '<div style="margin-top:6px;opacity:.8">(нажмите, чтобы скрыть)</div>';
  Object.assign(hint.style, {
    position: "fixed", left: "50%", transform: "translateX(-50%)",
    bottom: "16px", background: "rgba(0,0,0,.85)", color: "#fff",
    padding: "10px 14px", borderRadius: "12px", zIndex: 10001,
    fontSize: "14px", maxWidth: "92%", textAlign: "center"
  });
  hint.addEventListener("click", removeHint);
  document.body.appendChild(hint);
}

function removeHint() {
  const h = document.getElementById("install-hint");
  if (h) h.remove();
}

function removeUI() {
  const b = document.getElementById("install-btn");
  if (b) b.remove();
  removeHint();
}
