/* ================= MEROBASE TOAST UTILITY ================= */

const TYPES = {
  success: { bg:"#16A34A", icon:"✓" },
  error:   { bg:"#DC2626", icon:"✗" },
  info:    { bg:"#2563EB", icon:"ℹ" },
};

let toastQueue = [];
let toastContainer = null;

const getContainer = () => {
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "merobase-toast-container";
    toastContainer.style.cssText = `
      position: fixed;
      bottom: 32px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 99999;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      pointer-events: none;
    `;
    document.body.appendChild(toastContainer);

    const style = document.createElement("style");
    style.textContent = `
      @keyframes merobaseIn {
        from { opacity:0; transform:translateY(10px) scale(0.97); }
        to   { opacity:1; transform:translateY(0)    scale(1); }
      }
      @keyframes merobaseOut {
        from { opacity:1; transform:translateY(0)    scale(1); }
        to   { opacity:0; transform:translateY(10px) scale(0.97); }
      }
      .merobase-toast { animation: merobaseIn 0.25s ease forwards; }
      .merobase-toast.out { animation: merobaseOut 0.25s ease forwards; }
    `;
    document.head.appendChild(style);
  }
  return toastContainer;
};

export const toast = (message, type = "success", duration = 3000) => {
  const container = getContainer();
  const t = TYPES[type] || TYPES.info;

  const el = document.createElement("div");
  el.className = "merobase-toast";
  el.style.cssText = `
    background: ${t.bg};
    color: white;
    padding: 12px 20px;
    border-radius: 12px;
    font-size: 14px;
    font-family: sans-serif;
    font-weight: 500;
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    display: flex;
    align-items: center;
    gap: 10px;
    pointer-events: all;
    white-space: nowrap;
    max-width: 400px;
  `;

  el.innerHTML = `
    <span style="font-size:16px;font-weight:700">${t.icon}</span>
    <span>${message}</span>
  `;

  container.appendChild(el);

  const remove = () => {
    el.classList.add("out");
    setTimeout(() => el.remove(), 250);
  };

  setTimeout(remove, duration);
  el.addEventListener("click", remove);

  return remove;
};

export const toastSuccess = (msg) => toast(msg, "success");
export const toastError   = (msg) => toast(msg, "error");
export const toastInfo    = (msg) => toast(msg, "info");