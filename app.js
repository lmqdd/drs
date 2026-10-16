"use strict";

/* ============================================================
   配置区 —— 后续接入内容改这里即可
   ------------------------------------------------------------
   1. 状态 API 已接入「我的世界找服网」mczfw.com：
      https://list.mczfw.com/api/{IP} → { p 在线人数, mp 最大容量,
      ping 延迟, motd, version, logo 图标 }，支持跨域，60 秒刷新。
      如需换成自己的 API，填入 STATUS_API 即可优先使用；
      兼容 mcsrvstat / {players_online, players_max} 等常见格式。
   2. ADMINS：6 位管理员，填 img 图片地址（留空显示渐变占位头像）
   3. THANKS：4 个感谢站点，img 填图片/Logo 地址，url 填跳转链接
   ============================================================ */

const CONFIG = {
  ADMIN_PANEL_URL: "http://play.simpfun.cn:26974/",

  SERVER_IP: "mcdrs.xyz",  QQ_GROUP: "885640239",
  VERSION_RANGE: "1.9 – 26.2",
  CORE_VERSION: "Paper 26.2",
  STATUS_API: "",

  REFRESH_INTERVAL_MS: 60000,

  GALLERY: [
    { img: "Resources/gallery-1.png", caption: "服务器出生点" },
    { img: "Resources/gallery-2.png", caption: "玩家基地" },
    { img: "Resources/gallery-3.png", caption: "玩家 PVP" },
  ],

  ADMINS: [
    { name: "iamXHjiaozi", role: "腐竹 · 主管理", img: "Resources/iamXHjiaozi.jpg", email: "3161898346@qq.com" },
    { name: "zhangyuhexht", role: "管理 · 插件 / 存档 / 网页", img: "Resources/zhangyuhexht.jpg", email: "zhangyuhexht@foxmail.com" },
    { name: "MFSCelebrate_", role: "管理 · 插件 / 存档 / 服务端", img: "Resources/MFSCelebrate_.jpg", email: "mfscedevelop@outlook.com" },
    { name: "Aero_plus6137", role: "管理 · 游戏内部", img: "Resources/Aero_plus6137.jpg", email: "13564469201@163.com" },
    { name: "zhangjj123", role: "管理 · 游戏内部", img: "Resources/zhangjj123.jpg", email: "3647570686@qq.com" },
    { name: "huxiangyuhu", role: "副管理 · 辅助游戏内部", img: "Resources/huxiangyuhu.jpg", email: "334509675@qq.com" },
  ],

  THANKS: [
    {
      name: "PaperMC",
      desc: "高性能服务端核心",
      img: "https://assets.papermc.io/brand/papermc_combination_mark_light.min.svg",
      url: "https://papermc.io/downloads/paper",
    },
    {
      name: "Velocity",
      desc: "现代化代理服务端",
      img: "https://assets.papermc.io/brand/velocity_combination_mark_white.min.svg",
      url: "https://papermc.io/software/velocity/",
    },
    {
      name: "Simpfun",
      desc: "云服务器支持",
      img: "https://simpfun.cn/logo.png",
      url: "https://simpfun.cn/",
    },
    {
      name: "土豆公益",
      desc: "公益社区支持",
      img: "https://tudouai.cn/nova/icon-128.png",
      url: "https://tudouai.cn/",
    },
  ],
};

/* ============================================================ */

const $ = (sel) => document.querySelector(sel);

const AVATAR_GRADIENTS = [
  ["#4285f4", "#8ab4f8"],
  ["#34a853", "#81c995"],
  ["#ea4335", "#f28b82"],
  ["#9334e6", "#c58af9"],
  ["#f29900", "#fdd663"],
  ["#12b5cb", "#78d9ec"],
];

function initStatic() {
  $("#serverIp").textContent = CONFIG.SERVER_IP;
  $("#qqNumber").textContent = CONFIG.QQ_GROUP;
  $("#serverVersion").textContent = CONFIG.CORE_VERSION;
  document.title = `MCDRS · ${CONFIG.SERVER_IP} — 无规则服务器`;
}

function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove("show"), 2000);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch {}
    ta.remove();
    return ok;
  }
}

function bindCopyActions() {
  document.querySelectorAll("[data-copy-ip]").forEach((btn) =>
    btn.addEventListener("click", async () => {
      (await copyText(CONFIG.SERVER_IP))
        ? toast(`已复制服务器 IP：${CONFIG.SERVER_IP}`)
        : toast("复制失败，请手动输入 IP");
    })
  );
  $("#copyQqBtn").addEventListener("click", async () => {
    (await copyText(CONFIG.QQ_GROUP))
      ? toast(`已复制群号：${CONFIG.QQ_GROUP}`)
      : toast("复制失败，请手动记录群号");
  });
  $("#copyEmailBtn").addEventListener("click", async () => {
    (await copyText("mcdrs33@hotmail.com"))
      ? toast("已复制邮箱：mcdrs33@hotmail.com")
      : toast("复制失败，请手动记录邮箱");
  });
}

function renderGallery() {
  const grid = $("#galleryGrid");
  grid.innerHTML = "";
  CONFIG.GALLERY.forEach((item) => {
    const card = document.createElement("figure");
    card.className = "gallery-card reveal liquid-glass--edge";
    const img = document.createElement("img");
    img.src = item.img;
    img.alt = item.caption || "服务器风采";
    img.loading = "lazy";
    card.appendChild(img);
    if (item.caption) {
      const cap = document.createElement("figcaption");
      cap.className = "gallery-card__caption";
      cap.textContent = item.caption;
      card.appendChild(cap);
    }
    grid.appendChild(card);
  });
}

function renderAdmins() {
  const grid = $("#adminGrid");
  grid.innerHTML = "";
  CONFIG.ADMINS.forEach((admin, i) => {
    const [a, b] = AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length];
    const card = document.createElement("article");
    card.className = "person-card reveal liquid-glass--edge";
    const avatar = admin.img
      ? `<img src="${admin.img}" alt="${admin.name}" loading="lazy" />`
      : admin.name.trim().charAt(0).toUpperCase();
    card.innerHTML = `
      <div class="person-card__avatar" style="--av-a:${a};--av-b:${b}">${avatar}</div>
      <h3 class="person-card__name"></h3>
      <span class="person-card__role"></span>
      ${admin.email ? `<a class="person-card__email" href="#" data-email="${admin.email}"></a>` : ""}`;
    card.querySelector(".person-card__name").textContent = admin.name;
    card.querySelector(".person-card__role").textContent = admin.role;
    if (admin.email) {
      const emailLink = card.querySelector(".person-card__email");
      emailLink.textContent = admin.email;
      emailLink.addEventListener("click", (e) => {
        e.preventDefault();
        copyText(admin.email).then((ok) => {
          toast(ok ? `已复制邮箱：${admin.email}` : "复制失败，请手动复制");
        });
      });
    }
    grid.appendChild(card);
  });
}

function renderThanks() {
  const grid = $("#thanksGrid");
  grid.innerHTML = "";
  CONFIG.THANKS.forEach((site) => {
    const card = document.createElement("a");
    card.className = "thanks-card reveal liquid-glass--edge";
    card.href = site.url || "#";
    if (site.url && site.url !== "#") {
      card.target = "_blank";
      card.rel = "noopener noreferrer";
    }
    card.innerHTML = `
      <div class="thanks-card__logo">${
        site.img
          ? `<img src="${site.img}" alt="${site.name}" loading="lazy" />`
          : `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39"/></svg>`
      }</div>
      <span class="thanks-card__name"></span>
      <span class="thanks-card__desc"></span>`;
    card.querySelector(".thanks-card__name").textContent = site.name;
    card.querySelector(".thanks-card__desc").textContent = site.desc;
    grid.appendChild(card);
  });
}

function countUp(el, target) {
  const start = Number(el.dataset.v) || 0;
  const dur = 700;
  const t0 = performance.now();
  function step(t) {
    const k = Math.min(1, (t - t0) / dur);
    const e = 1 - Math.pow(1 - k, 3);
    el.textContent = String(Math.round(start + (target - start) * e));
    if (k < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
  el.dataset.v = String(target);
}

function applyStatus({ online, playersOnline, playersMax, ping, motd, logo, version }) {
  const dot = $("#statusDot");
  const text = $("#statusText");

  dot.classList.toggle("is-online", !!online);
  dot.classList.toggle("is-offline", online === false);

  if (online === true) {
    text.textContent = "服务器在线";
  } else if (online === false) {
    text.textContent = "服务器暂时离线";
  }

  if (Number.isFinite(Number(playersMax)) && playersMax !== "") {
    countUp($("#playersMax"), Number(playersMax));
  }
  if (Number.isFinite(Number(playersOnline)) && playersOnline !== "") {
    countUp($("#playersOnline"), Number(playersOnline));
  }

  if (ping != null && ping !== "") {
    const el = $("#serverPing");
    el.textContent = `${ping} ms`;
    el.dataset.ping = String(ping);
    el.classList.toggle("is-good", Number(ping) <= 80);
    el.classList.toggle("is-far", Number(ping) > 150);
  }

  if (version && /velocity/i.test(version)) {
    const chip = $("#proxyChip");
    if (chip.hidden) {
      $("#proxyText").textContent = `${version} 前置代理 · 子服 ${CONFIG.CORE_VERSION}`;
      chip.hidden = false;
    }
  }
  if (motd) {
    const el = $("#serverMotd");
    el.textContent = motd;
    el.hidden = false;
  }
  if (logo) {
    const img = $("#serverLogo");
    if (!img.src || !img.src.startsWith("data:")) img.src = logo;
    img.hidden = false;
  }

  const on = Number(playersOnline) || 0;
  const max = Number(playersMax) || 0;
  if (max > 0) {
    const pct = Math.min(100, Math.round((on / max) * 100));
    requestAnimationFrame(() => {
      $("#playersMeter").style.setProperty("--w", `${pct}%`);
    });
  }

  const time = new Date().toLocaleTimeString("zh-CN", { hour12: false });
  $("#statusUpdated").textContent = `更新于 ${time}`;
}

function parseStatus(data) {
  if (!data || typeof data !== "object") return {};
  if ("p" in data || "mp" in data) {
    return {
      online: data.p != null,
      playersOnline: data.p,
      playersMax: data.mp,
      version: data.version,
      ping: data.ping,
      motd: data.motd,
      logo: data.logo,
    };
  }
  if (data.players && typeof data.players === "object") {
    return {
      online: data.online,
      playersOnline: data.players.online,
      playersMax: data.players.max,
      version: data.version,
    };
  }
  return {
    online: data.online ?? data.status,
    playersOnline:
      data.players_online ?? data.online_players ?? data.playerCount,
    playersMax: data.players_max ?? data.max_players ?? data.maxPlayers,
    version: data.version,
  };
}

async function fetchFrom(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function fetchStatus() {
  const ip = encodeURIComponent(CONFIG.SERVER_IP);
  const endpoints = [
    CONFIG.STATUS_API || `https://list.mczfw.com/api/${ip}`,
    `https://api.mcsrvstat.us/3/${ip}`,
  ];

  for (const endpoint of endpoints) {
    try {
      applyStatus(parseStatus(await fetchFrom(endpoint)));
      return;
    } catch (err) {
      console.warn("[MCDRS] 状态获取失败：", err);
    }
  }
  applyStatus({ online: null });
}

function initStatus() {
  fetchStatus();
  setInterval(fetchStatus, CONFIG.REFRESH_INTERVAL_MS);
}

function initNav() {
  const nav = $("#nav");
  const bar = $("#progressBar");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);
  const onProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    bar.style.width = `${(p * 100).toFixed(2)}%`;
  };
  window.addEventListener("scroll", () => { onScroll(); onProgress(); }, { passive: true });
  window.addEventListener("resize", onProgress, { passive: true });
  onScroll();
  onProgress();
}

function initRipple() {
  document.addEventListener("pointerdown", (e) => {
    const btn = e.target.closest(".btn");
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const d = Math.max(rect.width, rect.height) * 2.2;
    const s = document.createElement("span");
    s.className = "ripple";
    s.style.width = s.style.height = `${d}px`;
    s.style.left = `${e.clientX - rect.left - d / 2}px`;
    s.style.top = `${e.clientY - rect.top - d / 2}px`;
    btn.appendChild(s);
    s.addEventListener("animationend", () => s.remove(), { once: true });
  });
}

function finePointer() {
  return matchMedia("(pointer: fine)").matches;
}

/* 鼠标跟随光晕：挂在渐变画布内部，rAF 插值，跟手且丝滑 */
function initCursorGlow() {
  if (!finePointer()) return;
  const host = $(".bg-canvas") || document.body;
  const g = document.createElement("div");
  g.className = "cursor-glow";
  g.setAttribute("aria-hidden", "true");
  host.appendChild(g);

  let x = innerWidth / 2, y = innerHeight / 2;
  let tx = x, ty = y;
  let scale = 1, targetScale = 1;
  let raf = 0;

  function loop() {
    x += (tx - x) * .22;
    y += (ty - y) * .22;
    scale += (targetScale - scale) * .16;
    g.style.transform =
      `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)` +
      ` translate(-50%, -50%) scale(${scale.toFixed(3)})`;
    if (
      Math.abs(tx - x) + Math.abs(ty - y) > .25 ||
      Math.abs(targetScale - scale) > .002
    ) {
      raf = requestAnimationFrame(loop);
    } else {
      raf = 0;
    }
  }

  const wake = () => { if (!raf) raf = requestAnimationFrame(loop); };

  addEventListener("pointermove", (e) => {
    tx = e.clientX; ty = e.clientY;
    if (!g.classList.contains("on")) { x = tx; y = ty; g.classList.add("on"); }
    wake();
  }, { passive: true });

  addEventListener("pointerdown", () => { targetScale = .8; wake(); }, { passive: true });
  addEventListener("pointerup", () => { targetScale = 1; wake(); }, { passive: true });
  document.documentElement.addEventListener("pointerleave", () => g.classList.remove("on"));
}

/* ═══ 液态玻璃引擎（基于 shuding/liquid-glass） ═══ */
function initLiquidGlass() {
  const sheet = document.querySelector(".passcode__sheet");
  if (!sheet) return;

  /* ═══ 工具函数（直接取自 shuding/liquid-glass） ═══ */
  function smoothStep(a, b, t) {
    t = Math.max(0, Math.min(1, (t - a) / (b - a)));
    return t * t * (3 - 2 * t);
  }
  function roundedRectSDF(x, y, w, h, r) {
    const qx = Math.abs(x) - w + r;
    const qy = Math.abs(y) - h + r;
    return Math.min(Math.max(qx, qy), 0) +
           Math.sqrt(Math.max(qx, 0) ** 2 + Math.max(qy, 0) ** 2) - r;
  }
  function texture(x, y) { return { type: "t", x, y }; }
  function uid() { return "lg" + Math.random().toString(36).slice(2, 9); }

  /* ═══ 生成位移贴图（Canvas → dataURL） ═══ */
  function genMap(w, h, fragment) {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const ctx = c.getContext("2d");
    const img = ctx.createImageData(w, h);
    const d = img.data;
    const raw = [];
    let peak = 0;
    for (let py = 0; py < h; py++) {
      for (let px = 0; px < w; px++) {
        const uv = { x: px / w, y: py / h };
        const p = fragment(uv);
        const dx = p.x * w - px;
        const dy = p.y * h - py;
        peak = Math.max(peak, Math.abs(dx), Math.abs(dy));
        raw.push(dx, dy);
      }
    }
    peak *= 0.5;
    if (peak < 1) peak = 1;
    let i = 0;
    for (let j = 0; j < d.length; j += 4) {
      d[j]     = (raw[i++] / peak + 0.5) * 255;
      d[j + 1] = (raw[i++] / peak + 0.5) * 255;
      d[j + 2] = 0;
      d[j + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    return { url: c.toDataURL(), scale: peak };
  }

  /* ═══ 为元素创建 SVG 滤镜并应用液态玻璃 ═══ */
  function applyGlass(el, fragment) {
    const id = uid();
    const r = el.getBoundingClientRect();
    const w = Math.round(r.width);
    const h = Math.round(r.height);

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const filt = document.createElementNS("http://www.w3.org/2000/svg", "filter");
    filt.setAttribute("id", id);
    filt.setAttribute("filterUnits", "userSpaceOnUse");
    filt.setAttribute("colorInterpolationFilters", "sRGB");
    filt.setAttribute("x", "0"); filt.setAttribute("y", "0");
    filt.setAttribute("width", w); filt.setAttribute("height", h);

    const feImg = document.createElementNS("http://www.w3.org/2000/svg", "feImage");
    feImg.setAttribute("width", w); feImg.setAttribute("height", h);

    const feDm = document.createElementNS("http://www.w3.org/2000/svg", "feDisplacementMap");
    feDm.setAttribute("in", "SourceGraphic");
    feDm.setAttribute("in2", id + "_map");
    feDm.setAttribute("xChannelSelector", "R");
    feDm.setAttribute("yChannelSelector", "G");

    filt.appendChild(feImg); filt.appendChild(feDm);
    defs.appendChild(filt); svg.appendChild(defs);
    document.body.appendChild(svg);

    const { url, scale } = genMap(w, h, fragment);
    feImg.setAttributeNS("http://www.w3.org/1999/xlink", "href", url);
    feDm.setAttribute("scale", scale);

    el.style.backdropFilter = `url(#${id}) blur(0.25px) contrast(1.15) brightness(1.03) saturate(1.15)`;
    el.style.webkitBackdropFilter = el.style.backdropFilter;
  }

  /* ═══ 大框：密码面板背景 ═══ */
  applyGlass(sheet, (uv) => {
    const ix = uv.x - 0.5, iy = uv.y - 0.5;
    const d = roundedRectSDF(ix, iy, 0.45, 0.42, 0.15);
    const s = smoothStep(0.3, 0, d - 0.05);
    const m = smoothStep(0, 1, s);
    return texture(ix * m + 0.5, iy * m + 0.5);
  });

  /* ═══ 12 个液态玻璃圆圈：数字键盘 ═══ */
  document.querySelectorAll(".pc-key").forEach((btn) => {
    applyGlass(btn, (uv) => {
      const ix = uv.x - 0.5, iy = uv.y - 0.5;
      const d = Math.sqrt(ix * ix + iy * iy);
      const s = smoothStep(0.45, 0.1, d);
      const m = smoothStep(0, 1, s);
      return texture(ix * m + 0.5, iy * m + 0.5);
    });
  });
}

/* 磁吸悬浮：弹簧物理，像水滴被鼠标缓缓吸起、微微放大、带回弹归位 */
function initMagnetic() {
  if (!finePointer()) return;

  document.querySelectorAll(".person-card, .thanks-card, .gallery-card, .btn, .lightbox__img").forEach(setup);

  function setup(el) {
    if (el._mag) return;
    el._mag = true;

    const isBtn = el.classList.contains("btn");
    const isLbImg = el.classList.contains("lightbox__img");
    const cfg = isBtn
      ? { pull: .34, max: 6, lift: 2.5, scale: 1.07, pressScale: .93, rotF: .3, rotMax: 3 }
      : isLbImg
        ? { pull: .05, max: 9, lift: 0, scale: 1.014, pressScale: 1, rotF: .06, rotMax: .7 }
        : { pull: .1, max: 12, lift: 14, scale: 1.055, pressScale: .97, rotF: .3, rotMax: 3 };

    const K = .055, D = .84;
    let tx = 0, ty = 0, x = 0, y = 0, vx = 0, vy = 0;
    let ts = 1, s = 1, vs = 0;
    let hover = false, pressed = false;
    let base = null;
    let raf = 0;

    function loop() {
      vx += (tx - x) * K; vx *= D; x += vx;
      vy += (ty - y) * K; vy *= D; y += vy;
      const targetS = hover ? (pressed ? cfg.scale * cfg.pressScale : cfg.scale) : (pressed ? .97 : 1);
      vs += (targetS - s) * .04; vs *= .85; s += vs;

      const rot = Math.max(-cfg.rotMax, Math.min(cfg.rotMax, x * cfg.rotF));
      el.style.transform =
        `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)` +
        ` rotate(${rot.toFixed(2)}deg) scale(${s.toFixed(4)})`;

      const settled = !hover &&
        Math.abs(x) + Math.abs(y) + Math.abs(vx) + Math.abs(vy) < .06 &&
        Math.abs(s - 1) < .0015 && Math.abs(vs) < .0008;
      if (settled) {
        el.style.transform = "";
        el.classList.remove("mag-active");
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(loop);
    }

    const wake = () => { if (!raf) raf = requestAnimationFrame(loop); };

    el.addEventListener("pointerenter", (e) => {
      hover = true;
      pressed = e.buttons > 0;
      base = el.getBoundingClientRect();
      el.classList.add("mag-active");
      move(e);
      wake();
    });

    el.addEventListener("pointermove", (e) => {
      if (!hover || !base) return;
      move(e);
      wake();
    }, { passive: true });

    function move(e) {
      const px = e.clientX - base.left;
      const py = e.clientY - base.top;
      el.style.setProperty("--gx", `${px.toFixed(1)}px`);
      el.style.setProperty("--gy", `${py.toFixed(1)}px`);
      const cx = base.left + base.width / 2;
      const cy = base.top + base.height / 2;
      tx = clamp((e.clientX - cx) * cfg.pull, cfg.max);
      ty = clamp((e.clientY - cy) * cfg.pull, cfg.max) - (hover ? cfg.lift : 0);
    }

    el.addEventListener("pointerleave", () => {
      hover = false; pressed = false; base = null;
      tx = 0; ty = 0;
      wake();
    });

    el.addEventListener("mag-reset", () => {
      hover = false; pressed = false; base = null;
      tx = 0; ty = 0;
      wake();
    });

    el.addEventListener("pointerdown", () => { pressed = true; wake(); });
    addEventListener("pointerup", () => {
      pressed = false;
      if (hover) wake();
    }, { passive: true });
    addEventListener("scroll", () => {
      if (hover && base) {
        hover = false; base = null; tx = 0; ty = 0; wake();
      }
    }, { passive: true });
  }

  function clamp(v, max) {
    return Math.max(-max, Math.min(max, v));
  }
}

/* 固定渐变背景：滚动时仅平移渐变层，颜色随页面深度缓慢变化 */
function initBgScroll() {
  const grad = $("#bgGrad");
  if (!grad) return;

  let height = 0;
  const measure = () => { height = grad.offsetHeight; };
  measure();
  addEventListener("resize", measure, { passive: true });
  addEventListener("load", measure);

  let raf = 0;
  function update() {
    raf = 0;
    const doc = document.documentElement;
    const max = doc.scrollHeight - innerHeight;
    const p = max > 0 ? Math.min(1, scrollY / max) : 0;
    const travel = Math.max(0, height - innerHeight);
    grad.style.transform = `translate3d(0, ${(-p * travel).toFixed(1)}px, 0)`;
  }
  addEventListener("scroll", () => {
    if (!raf) raf = requestAnimationFrame(update);
  }, { passive: true });
  update();
}

function initFonts() {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Roboto+Mono:wght@400;700&family=Noto+Sans+SC:wght@400;500;700&display=swap";
  document.head.appendChild(link);
}

function initLightbox() {
  const lb = $("#lightbox");
  const img = $("#lbImg");
  const cap = $("#lbCaption");
  const grid = $("#galleryGrid");
  let idx = 0;

  function show(i) {
    idx = (i + CONFIG.GALLERY.length) % CONFIG.GALLERY.length;
    const it = CONFIG.GALLERY[idx];
    img.src = it.img;
    img.alt = it.caption || "预览图片";
    cap.textContent = it.caption || "";
  }
  function openAt(i) {
    show(i);
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function close() {
    lb.classList.remove("open");
    document.body.style.overflow = "";
    img.dispatchEvent(new Event("mag-reset"));
  }

  grid.addEventListener("click", (e) => {
    const card = e.target.closest(".gallery-card");
    if (!card) return;
    openAt([...grid.children].indexOf(card));
  });

  function close() {
    lb.classList.remove("open");
    document.body.style.overflow = "";
    img.dispatchEvent(new Event("mag-reset"));
  }

  let navLock = false;
  function navigate(dir) {
    if (navLock || !CONFIG.GALLERY.length) return;
    navLock = true;

    const outImg = img.animate(
      [
        { transform: "translateX(0px)", opacity: 1 },
        { transform: `translateX(${dir * -84}px) scale(.9)`, opacity: 0 },
      ],
      { duration: 230, easing: "cubic-bezier(.5,0,.75,.4)", fill: "forwards" }
    );
    const outCap = cap.animate(
      [
        { transform: "translateX(0)", opacity: 1 },
        { transform: `translateX(${dir * -32}px)`, opacity: 0 },
      ],
      { duration: 190, easing: "ease-in" }
    );

    outImg.onfinish = () => {
      show(idx + dir);
      outImg.cancel();
      outCap.cancel();

      const inImg = img.animate(
        [
          { transform: `translateX(${dir * 96}px) scale(.94)`, opacity: 0 },
          { transform: "translateX(0px)", opacity: 1 },
        ],
        { duration: 540, easing: "cubic-bezier(.16,1,.3,1)" }
      );
      const inCap = cap.animate(
        [
          { transform: `translateX(${dir * 36}px)`, opacity: 0 },
          { transform: "translateX(0)", opacity: 1 },
        ],
        { duration: 430, easing: "cubic-bezier(.16,1,.3,1)" }
      );
      let done = 0;
      const unlock = () => { if (++done === 2) navLock = false; };
      inImg.onfinish = () => { inImg.cancel(); unlock(); };
      inCap.onfinish = () => { inCap.cancel(); unlock(); };
    };
  }

  $("#lbClose").addEventListener("click", close);
  $("#lbPrev").addEventListener("click", () => navigate(-1));
  $("#lbNext").addEventListener("click", () => navigate(1));

  lb.addEventListener("click", (e) => {
    if (e.target === lb) close();
  });

  addEventListener("keydown", (e) => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") navigate(-1);
    else if (e.key === "ArrowRight") navigate(1);
  });
}

function clearStagger(el) {
  setTimeout(() => { el.style.animationDelay = ""; }, 1800);
}

/* 管理员模式 · iOS 风格密码验证（固定密码 114514） */
function initPasscode() {
  const PASSCODE = "114514";
  const overlay = $("#passcode");
  const dotsBox = $("#pcDots");
  const pad = $("#pcPad");
  let entry = "";
  let checking = false;

  const LETTERS = ["", "ABC", "DEF", "GHI", "JKL", "MNO", "PQRS", "TUV", "WXYZ"];
  const KEYS = [
    { k: "1" }, { k: "2", s: "ABC" }, { k: "3", s: "DEF" },
    { k: "4", s: "GHI" }, { k: "5", s: "JKL" }, { k: "6", s: "MNO" },
    { k: "7", s: "PQRS" }, { k: "8", s: "TUV" }, { k: "9", s: "WXYZ" },
    { close: true }, { k: "0" }, { del: true },
  ];

  KEYS.forEach((item) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "pc-key" + (item.ghost ? " pc-key--ghost" : "");
    if (item.k) {
      const num = document.createElement("span");
      num.className = "pc-key__num";
      num.textContent = item.k;
      b.appendChild(num);
      const letters = document.createElement("span");
      letters.className = "pc-key__letters";
      letters.textContent = item.s || "";
      b.appendChild(letters);
      b.dataset.key = item.k;
    } else if (item.del) {
      b.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24" fill="#fff"><path d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m-3 12.59L17.59 17 14 13.41 10.41 17 9 15.59 12.59 12 9 8.41 10.41 7 14 10.59 17.59 7 19 8.41 15.41 12z"/></svg>`;
      b.dataset.del = "1";
      b.setAttribute("aria-label", "删除");
    } else if (item.close) {
      b.innerHTML = `<svg viewBox="0 0 24 24" width="22" height="22" fill="#fff"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`;
      b.dataset.close = "1";
      b.setAttribute("aria-label", "关闭");
    }
    pad.appendChild(b);
  });

  function renderDots(state) {
    dotsBox.className = "passcode__dots" + (state ? ` ${state}` : "");
    dotsBox.innerHTML = "";
    for (let i = 0; i < PASSCODE.length; i++) {
      const d = document.createElement("span");
      if (i < entry.length) d.classList.add("fill");
      if (state === "ok") d.classList.add("ok");
      dotsBox.appendChild(d);
    }
  }

  function press(key) {
    if (checking || entry.length >= PASSCODE.length) return;
    entry += key;
    renderDots();
    if (entry.length === PASSCODE.length) verify();
  }

  function backspace() {
    if (checking || !entry.length) return;
    entry = entry.slice(0, -1);
    renderDots();
  }

  function verify() {
    checking = true;
    setTimeout(() => {
      if (entry === PASSCODE) {
        renderDots("ok");
        toast("验证成功，正在进入管理员页面…");
        setTimeout(() => {
          if (CONFIG.ADMIN_PANEL_URL && CONFIG.ADMIN_PANEL_URL !== "#") {
            location.href = CONFIG.ADMIN_PANEL_URL;
          } else {
            toast("尚未配置 ADMIN_PANEL_URL 跳转地址");
            close();
          }
        }, 750);
      } else {
        renderDots("error");
        setTimeout(() => {
          entry = "";
          checking = false;
          renderDots();
        }, 620);
      }
    }, 180);
  }

  function open() {
    entry = "";
    checking = false;
    renderDots();
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function close() {
    overlay.classList.remove("open");
    document.body.style.overflow = "";
    entry = "";
    checking = false;
    renderDots();
  }

  pad.addEventListener("pointerdown", (e) => {
    const btn = e.target.closest(".pc-key");
    if (!btn || btn.classList.contains("pc-key--ghost")) return;
    flash(btn);
    if (btn.dataset.del) backspace();
    else if (btn.dataset.close) close();
    else if (btn.dataset.key) press(btn.dataset.key);
  });
  function flash(btn) {
    btn.classList.add("is-pressed");
    setTimeout(() => btn.classList.remove("is-pressed"), 160);
  }

  addEventListener("keydown", (e) => {
    if (!overlay.classList.contains("open")) return;
    if (/^[0-9]$/.test(e.key)) {
      const btn = [...pad.children].find((b) => b.dataset.key === e.key);
      if (btn) flash(btn);
      press(e.key);
    } else if (e.key === "Backspace") {
      backspace();
    } else if (e.key === "Escape") {
      close();
    }
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  $("#adminBtn").addEventListener("click", open);
  renderDots();
}

function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          clearStagger(entry.target);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );
  items.forEach((el, i) => {
    if (i > 0) el.style.animationDelay = `${(i % 4) * 90}ms`;
    io.observe(el);
  });
}

initStatic();
renderGallery();
renderAdmins();
renderThanks();
bindCopyActions();
initStatus();
initNav();
initRipple();
initCursorGlow();
initLiquidGlass();
initMagnetic();
initLightbox();
initBgScroll();
initPasscode();
requestAnimationFrame(initReveal);
window.addEventListener("load", () => setTimeout(initFonts, 0));
