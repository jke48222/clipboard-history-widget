import { React } from "uebersicht";
// --- Inlined design system (self-contained; formerly theme.js) ---
// Shared design system for the widget set: color tokens, fonts, layout, the
// common card shell, drag/resize handles, a last-known-good cache, and the
// standard data-resolution helper. Imported by every widget so they stay
// visually and behaviorally consistent.
const T = {
  // Accent tints
  tintBlue: "#296BE0",
  tintPink: "#E86E87",
  tintGreen: "#59A875",
  tintOrange: "#D9946B",
  tintPurple: "#A861DE",

  // Cards
  cardLight: "rgba(255,255,255,0.74)",
  cardDark: "rgba(33,36,43,0.88)",

  // Ink (text on light)
  ink: "#1F2129",
  inkDim: "#616670",
  inkMute: "#8C919C",

  // Text on dark
  onDark: "#F7F7FA",
  onDarkDim: "#BDBFC7",
  onDarkMute: "#8F949E",

  // Walls (desktop stand-in backgrounds)
  wall1: "#F0F2F7",
  wall2: "#DBE3ED",
  wall3: "#BFC7DB",

  // GitHub ramp
  ghEmpty: "rgba(255,255,255,0.10)",
  ghGreen1: "#9CE8A8",
  ghGreen2: "#40C463",
  ghGreen3: "#30A14F",
  ghGreen4: "#216E38",

  // Scene colors
  nightSky: "#14141A",
  cosmicBase: "#0A051A",
  cosmicViolet: "#8C338C",
  cosmicMagenta: "#D9598C",
  cosmicIndigo: "#331A66",
  shaderPurple: "#402673",
  shaderTeal: "#268C8C",
  duskBase: "#4D408C",
  duskAmber: "#D9A666",
  duskPurple: "#8C4DA6",
  duskGlow: "#F28073",
  cardCream: "#F2F0E6",
  paperGrain: "#9E8052",

  archivePalette: [
    "#D98C4D", "#A64D33", "#733326", "#E0B359",
    "#8C6640", "#B88CCC", "#594D80", "#8C73BF",
    "#8CBF8C", "#4D8059", "#598CD9", "#334D8C",
  ],

  // Layout
  radius: "24px",
  captionTracking: "1.5px",
};

// Fonts. Install Instrument Serif, Geist, and Geist Mono for the intended look;
// each stack falls back to a system font if the family is missing.
const serif = "'Instrument Serif', Georgia, serif";
const sans = "'Geist', -apple-system, BlinkMacSystemFont, sans-serif";
const mono = "'Geist Mono', 'SF Mono', ui-monospace, monospace";

// Default desktop placement [x, y] per widget. Each widget calls
// card(variant, w, h, ...LAYOUT.<key>) so widgets lay out at distinct positions
// rather than stacking at the origin. These are overridden by any saved
// position from the drag handle.
const LAYOUT = {
  nowSpinning:  [380, 40],
  musicArchive: [40, 40],
  spatial:      [380, 200],
  mosaic:       [1120, 40],
  stack:        [1120, 486],
  drop:         [1120, 708],
  swap:         [380, 672],
  aiDailyPull:  [40, 368],
  apod:         [40, 576],
  atlas:        [1280, 224],
  tarot:        [1120, 224],
};

// Shared card shell. variant is "dark" or "light"; x/y set the on-desktop
// position. The common loading/empty/stale state styles are appended so every
// widget can render those states without repeating CSS.
const card = (variant, w, h, x = 0, y = 0) => `
  position: absolute;
  left: ${x}px; top: ${y}px;
  width: ${w}px;
  height: ${h}px;
  border-radius: ${T.radius};
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0,0,0,0.35);
  background: ${variant === "dark" ? T.cardDark : T.cardLight};
  backdrop-filter: blur(20px);
  color: ${variant === "dark" ? T.onDark : T.ink};
  font-family: ${sans};
  box-sizing: border-box;
  transform-origin: top left;

  /* Promote each card to its own GPU layer so a sibling widget's frequent
     refresh cannot trigger a backdrop-filter recomposite, which otherwise made
     the blur flicker on and off. */
  will-change: transform;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;

  .ws-stale { position:absolute; top:8px; right:10px; z-index:5;
              font-family:${mono}; font-size:8px; letter-spacing:1px;
              text-transform:uppercase; opacity:0.72;
              color:${variant === "dark" ? T.onDarkMute : T.inkMute}; }
  .ws-empty { position:absolute; inset:0; display:flex; align-items:center;
              justify-content:center; padding:24px; text-align:center;
              font-family:${serif}; font-style:italic; font-size:18px;
              opacity:0.6; color:${variant === "dark" ? T.onDarkDim : T.inkDim}; }
  .ws-skel  { position:absolute; inset:14px; border-radius:14px; opacity:0.18;
              animation: ws-pulse 1.6s ease-in-out infinite; }
  @keyframes ws-pulse { 0%,100% { opacity:0.10; } 50% { opacity:0.24; } }
  @media (prefers-reduced-motion: reduce) {
    .ws-skel { animation:none; opacity:0.16; }
  }

  .ws-drag  { position:absolute; top:6px; left:6px; z-index:30;
              width:18px; height:18px; border-radius:6px;
              display:flex; align-items:center; justify-content:center;
              font-size:11px; line-height:1; cursor:grab; opacity:0.42;
              transition:opacity .15s ease; user-select:none;
              -webkit-user-select:none;
              color:${variant === "dark" ? T.onDarkMute : T.inkMute};
              background:${variant === "dark"
                ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}; }
  .ws-drag:hover  { opacity:0.95; }
  .ws-drag:active { cursor:grabbing; }

  .ws-resize { position:absolute; bottom:5px; right:5px; z-index:30;
               width:16px; height:16px; border-radius:5px;
               display:flex; align-items:center; justify-content:center;
               font-size:11px; line-height:1; cursor:nwse-resize; opacity:0.42;
               transition:opacity .15s ease; user-select:none;
               -webkit-user-select:none;
               color:${variant === "dark" ? T.onDarkMute : T.inkMute};
               background:${variant === "dark"
                 ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}; }
  .ws-resize:hover { opacity:0.95; }
`;

// Small uppercase monospace caption used for metadata labels.
const caption = (color) => `
  font-family: ${mono};
  text-transform: uppercase;
  letter-spacing: ${T.captionTracking};
  color: ${color};
`;

// State helpers, returned as React elements (this is plain JS, not JSX).
const h = React.createElement;

// Loading: an accent-tinted skeleton block.
const Skel = ({ tint = T.tintBlue }) =>
  h("div", { className: "ws-skel", style: { background: tint } });

// Empty: a single quiet line of text.
const Empty = ({ text }) => h("div", { className: "ws-empty" }, text);

// Stale: a small marker showing the time of the last successful refresh.
const Stale = ({ ts }) =>
  h("div", { className: "ws-stale" }, `stale · ${clockStamp(ts)}`);

// Drag and resize support.
//
// Übersicht renders each widget into its own absolutely-positioned `.widget`
// node, all inside a shared `#uebersicht` container. The wrapper to move is the
// nearest `.widget` ancestor of a handle — not the topmost absolute element,
// which is the shared container.
//
// DragHandle updates the wrapper's left/top. ResizeHandle scales it uniformly
// via a top-left-anchored CSS transform, keeping these fixed-layout cards crisp
// instead of clipping. Both persist to localStorage, so position and size
// survive refreshes and reboots.
const posKey = (k) => `ws:pos:${k}`;
const scaleKey = (k) => `ws:scale:${k}`;
const MIN_SCALE = 0.4, MAX_SCALE = 3;

const findWrapper = (node) => node && node.closest(".widget");

// Apply any saved position and scale. Runs on every mount, since the wrapper
// may have been recreated on refresh.
const applySaved = (wrapper, key) => {
  try {
    const pos = JSON.parse(localStorage.getItem(posKey(key)) || "null");
    if (pos && typeof pos.x === "number") {
      wrapper.style.left = pos.x + "px";
      wrapper.style.top = pos.y + "px";
    }
  } catch (e) { /* storage unavailable */ }
  try {
    const scale = parseFloat(localStorage.getItem(scaleKey(key)));
    if (scale > 0) wrapper.style.transform = `scale(${scale})`;
  } catch (e) { /* storage unavailable */ }
};

const initDrag = (node, key) => {
  if (!node) return;
  const wrapper = findWrapper(node);
  if (!wrapper) return;
  applySaved(wrapper, key);

  if (node.__wsDragWired) return; // attach listeners once per node
  node.__wsDragWired = true;

  // Keep grip clicks from reaching the card's own onClick handler.
  node.addEventListener("click", (e) => e.stopPropagation());

  node.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX, startY = e.clientY;
    const cs = getComputedStyle(wrapper);
    const origX = parseFloat(wrapper.style.left || cs.left) || 0;
    const origY = parseFloat(wrapper.style.top || cs.top) || 0;
    const onMove = (ev) => {
      wrapper.style.left = origX + (ev.clientX - startX) + "px";
      wrapper.style.top = origY + (ev.clientY - startY) + "px";
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      try {
        localStorage.setItem(posKey(key), JSON.stringify({
          x: parseFloat(wrapper.style.left) || 0,
          y: parseFloat(wrapper.style.top) || 0,
        }));
      } catch (e) { /* storage unavailable */ }
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  });

  // Double-click the grip to snap back to the card's default LAYOUT slot.
  node.addEventListener("dblclick", (e) => {
    e.preventDefault();
    e.stopPropagation();
    try { localStorage.removeItem(posKey(key)); } catch (e) { /* ignore */ }
    wrapper.style.left = "";
    wrapper.style.top = "";
  });
};

const initResize = (node, key) => {
  if (!node) return;
  const wrapper = findWrapper(node);
  if (!wrapper) return;
  applySaved(wrapper, key);

  if (node.__wsResizeWired) return;
  node.__wsResizeWired = true;

  node.addEventListener("click", (e) => e.stopPropagation());

  node.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX, startY = e.clientY;
    const cs = getComputedStyle(wrapper);
    // Layout width/height are unaffected by transform, so they stay constant.
    const baseW = parseFloat(cs.width) || 1;
    const baseH = parseFloat(cs.height) || 1;
    const m = /scale\(([^)]+)\)/.exec(wrapper.style.transform || "");
    const origScale = m ? parseFloat(m[1]) || 1 : 1;
    const onMove = (ev) => {
      const delta = (ev.clientX - startX + (ev.clientY - startY)) / (baseW + baseH);
      const next = Math.max(MIN_SCALE, Math.min(MAX_SCALE, origScale + delta));
      wrapper.style.transform = `scale(${next})`;
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      const m2 = /scale\(([^)]+)\)/.exec(wrapper.style.transform || "");
      try { localStorage.setItem(scaleKey(key), String(m2 ? m2[1] : 1)); }
      catch (e) { /* storage unavailable */ }
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  });

  // Double-click the corner to restore the card's default size.
  node.addEventListener("dblclick", (e) => {
    e.preventDefault();
    e.stopPropagation();
    try { localStorage.removeItem(scaleKey(key)); } catch (e) { /* ignore */ }
    wrapper.style.transform = "";
  });
};

// Each handle takes the widget's LAYOUT key so position and scale are stored
// per widget. DragHandle renders top-left, ResizeHandle bottom-right.
const DragHandle = ({ k }) =>
  h("div", { className: "ws-drag", title: "Drag to move · double-click to reset",
             ref: (n) => initDrag(n, k) }, "☰");

const ResizeHandle = ({ k }) =>
  h("div", { className: "ws-resize", title: "Drag to resize · double-click to reset",
             ref: (n) => initResize(n, k) }, "⤡");

// Last-known-good cache, persisted in localStorage with a timestamp.
const remember = (key, data) => {
  try { localStorage.setItem(`ws:${key}`, JSON.stringify({ data, ts: Date.now() })); }
  catch (e) { /* storage unavailable; skip */ }
};

const recall = (key) => {
  try { return JSON.parse(localStorage.getItem(`ws:${key}`)); }
  catch (e) { return null; }
};

const clockStamp = (ms) =>
  new Date(ms).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

// True before the command has produced any output (the initial load tick).
const isLoading = ({ output, error }) =>
  output === undefined && !error;

// Standard data flow for command-backed widgets. parse(output) must return a
// falsy value when there is nothing usable.
//   loading -> { loading: true }            render <Skel/>
//   success -> { data }                     cached as last-known-good
//   failure -> { data, staleTs }            last-known-good + time, render <Stale/>
//   cold    -> { data, mock: true }         mock data, nothing cached yet
const resolve = (key, props, parse, mock) => {
  if (isLoading(props)) return { loading: true };
  let data = null;
  try { data = parse(props.output); } catch (e) { data = null; }
  if (data) { remember(key, data); return { data }; }
  const cached = recall(key);
  if (cached && cached.data) return { data: cached.data, staleTs: cached.ts };
  return { data: mock, mock: true };
};
// --- End inlined design system ---
// Clipboard history as a depth-faded stack, newest on top.
//
// macOS exposes only the current pasteboard to a widget, so history is built
// locally: each poll reads `pbpaste` and prepends it to a list in localStorage
// when the value changes. Clicking a row copies it back to the clipboard.
//
// Extras:
//   - Star toggles a pin; pinned entries are kept and float to the top.
//   - Secret-looking entries (API keys, tokens, JWTs) are masked but still copy
//     their real value.
//   - Clicking a kind chip filters to that kind; click the active chip to clear.
//     (A text search box is omitted because desktop widgets do not reliably
//     receive keyboard focus.)
export const command = `pbpaste`;

export const refreshFrequency = 1000 * 2;

const PAGE = 4;
const FADE = [1.0, 0.68, 0.46, 0.28];
const HKEY = "ws:stack:hist";
const PINKEY = "ws:stack:pins";
const FILTERKEY = "ws:stack:filter";
const MAXHIST = 16;

const FONTS = "clipboard-history.widget/fonts";
// The history as a thermal receipt: paper stock with a fibre grain, a dot-
// matrix face, star rules, a red PINNED stamp, a torn bottom edge, and a
// barcode. Old entries fade the way thermal print does. Click a line to copy
// it, the [KIND] tag to filter, PIN to keep it.
export const className = card("light", 300, 372, ...LAYOUT.stack) + `
  @font-face { font-family: "VT323"; src: url("${FONTS}/VT323-400.woff2") format("woff2"); }
  @font-face { font-family: "Barlow Condensed"; src: url("${FONTS}/BarlowCondensed-700.woff2") format("woff2"); font-weight: 700; }
  --ink: #2A2622; --paper: #F8F4EA; --red: #C8322B;
  padding: 16px 18px 24px; border-radius: 3px 3px 0 0; backdrop-filter: none; overflow: hidden; user-select:none; -webkit-user-select:none;
  background: linear-gradient(180deg, #FBF8F0 0%, var(--paper) 100%);
  box-shadow: 0 24px 40px rgba(0,0,0,0.45), 0 1px 0 rgba(0,0,0,0.06);
  -webkit-mask: linear-gradient(#000, #000) 0 0 / 100% calc(100% - 9px) no-repeat, conic-gradient(from 135deg at 50% 100%, #000 0 90deg, #0000 90deg) 0 100% / 12px 9px repeat-x;
  mask: linear-gradient(#000, #000) 0 0 / 100% calc(100% - 9px) no-repeat, conic-gradient(from 135deg at 50% 100%, #000 0 90deg, #0000 90deg) 0 100% / 12px 9px repeat-x;
  font-family: "VT323", "Menlo", monospace; color: var(--ink);
  .rcpt { position:absolute; inset: 16px 18px 24px; display:flex; flex-direction:column; }
  &::before { content:""; position:absolute; inset:0; pointer-events:none; opacity:0.5; mix-blend-mode: multiply; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.12'/%3E%3C/svg%3E"); }
  .ws-drag { top: 6px; left: 6px; color:#9a9184; background: rgba(0,0,0,0.04); } .ws-resize { bottom: 14px; right: 6px; color:#9a9184; background: rgba(0,0,0,0.04); }
  .logo { text-align:center; font-size: 24px; line-height: 1; letter-spacing: 3px; }
  .sub { text-align:center; font-size: 12px; letter-spacing: 1.5px; color: #7A7266; margin-top: 2px; }
  .rule { text-align:center; font-size: 13px; letter-spacing: 3px; color: #8A8276; line-height: 1.1; margin: 5px 0; white-space:nowrap; overflow:hidden; }
  .meta { display:flex; justify-content:space-between; font-size: 12px; letter-spacing: 1px; color:#5A5248; }
  .rows { flex:1; display:flex; flex-direction:column; min-height:0; }
  .ln { position:relative; padding: 5px 0 4px; cursor:pointer; border-bottom: 1px dashed rgba(42,38,34,0.18); }
  .ln:last-child { border-bottom: 0; }
  .l1 { display:flex; align-items:center; gap: 8px; font-size: 12px; letter-spacing: 1px; color:#5A5248; }
  .kind { cursor:pointer; padding: 0 2px; } .kind.active { background: var(--ink); color: var(--paper); }
  .age { margin-left:auto; }
  .txt { font-size: 15px; line-height: 1.15; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top: 1px; }
  .pin { position:absolute; right: 0; bottom: 5px; font-size: 11px; letter-spacing: 1px; color:#8A8276; cursor:pointer; padding: 0 2px; }
  .pin:hover { color: var(--ink); }
  .stamp { position:absolute; right: 34px; top: 4px; font: 700 8px/1 "Barlow Condensed", sans-serif; letter-spacing: 1.6px; color: var(--red); border: 1.5px solid var(--red); padding: 2px 4px 1px; transform: rotate(-9deg); opacity: 0.85; mix-blend-mode: multiply; }
  .pg { display:flex; justify-content:center; gap: 14px; font-size: 13px; letter-spacing: 2px; margin-top: 2px; }
  .chev { cursor:pointer; padding: 0 6px; } .chev.off { opacity: 0.25; cursor:default; }
  .bar { height: 22px; margin: 4px 18px 0; background: repeating-linear-gradient(90deg, var(--ink) 0 1px, #0000 1px 2px, var(--ink) 2px 4px, #0000 4px 5px, var(--ink) 5px 6px, #0000 6px 9px, var(--ink) 9px 11px, #0000 11px 12px, var(--ink) 12px 13px, #0000 13px 16px); opacity: 0.85; }
  .thanks { text-align:center; font-size: 12px; letter-spacing: 2px; color:#7A7266; margin-top: 4px; }
`;
// True for values that look like credentials, so they can be masked.
const isSecret = (s) =>
  /(?:^|\b)(?:sk-[A-Za-z0-9]{12,}|ghp_[A-Za-z0-9]{16,}|gho_[A-Za-z0-9]{16,}|AKIA[0-9A-Z]{16}|xox[baprs]-[A-Za-z0-9-]{10,}|eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]+\.)/.test(s) ||
  /\b(password|passwd|secret|api[_-]?key|token)\b/i.test(s) ||
  (/^[A-Za-z0-9_\-+/=.]{24,}$/.test(s) && /[a-z]/.test(s) && /[A-Z0-9]/.test(s));

// Label an entry by inspecting its content.
const classify = (s) => {
  if (isSecret(s)) return "KEY";
  if (/^https?:\/\//.test(s)) return "URL";
  if (/^#[0-9a-fA-F]{3,8}$/.test(s)) return "HEX";
  if (/\b(rgb|rgba|hsl|hsla|oklch|oklab)\s*\(/i.test(s)) return "COLOR";
  if (/^(~|\/)[^\s]+$/.test(s) || /^[a-zA-Z]:\\/.test(s)) return "PATH";
  if (/[{};=()]|=>/.test(s)) return "CODE";
  return "TEXT";
};

// Render a masked preview for secret values, keeping a small head and tail.
const maskOf = (s) => {
  if (s.length <= 8) return "•".repeat(s.length);
  return s.slice(0, 3) + "•".repeat(Math.min(12, s.length - 6)) + s.slice(-3);
};

// Compact relative age, e.g. "5s", "3m", "2h", "1d".
const ago = (ts) => {
  const s = Math.max(0, (Date.now() - ts) / 1000);
  if (s < 60) return `${Math.round(s)}s`;
  if (s < 3600) return `${Math.round(s / 60)}m`;
  if (s < 86400) return `${Math.round(s / 3600)}h`;
  return `${Math.round(s / 86400)}d`;
};

const readJSON = (k, fb) => { try { return JSON.parse(localStorage.getItem(k)) || fb; } catch (e) { return fb; } };
const writeJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

// Prepend a clip if it differs from the current head; cap the list length.
const pushClip = (clip) => {
  const a = readJSON(HKEY, []);
  if (clip && (!a[0] || a[0].content !== clip)) {
    a.unshift({ content: clip, kind: classify(clip), ts: Date.now() });
    if (a.length > MAXHIST) a.length = MAXHIST;
    writeJSON(HKEY, a);
    return a;
  }
  return a;
};

const getOff = () => { const v = +(localStorage.getItem("ws:stack:off") || 0); return isNaN(v) ? 0 : v; };
const setOff = (v) => { try { localStorage.setItem("ws:stack:off", String(v)); } catch (e) {} };
const shq = (s) => `'${String(s).replace(/'/g, "'\\''")}'`;

// Pinned values are kept by content so they survive history eviction.
const isPinned = (content) => readJSON(PINKEY, []).includes(content);
const togglePin = (content) => (e) => {
  if (e && e.stopPropagation) e.stopPropagation();
  const pins = readJSON(PINKEY, []);
  const i = pins.indexOf(content);
  if (i >= 0) pins.splice(i, 1); else pins.unshift(content);
  writeJSON(PINKEY, pins.slice(0, MAXHIST));
  run("true");
};

const getFilter = () => { try { return localStorage.getItem(FILTERKEY) || ""; } catch (e) { return ""; } };
const setFilter = (kind) => (e) => {
  if (e && e.stopPropagation) e.stopPropagation();
  try { localStorage.setItem(FILTERKEY, getFilter() === kind ? "" : kind); } catch (err) {}
  setOff(0);
  run("true");
};

// Memo of the last render: Übersicht re-runs the command every 2s, and
// re-rendering the card on every tick is what makes it flicker. We return a
// referentially-stable element when the visible content is unchanged so React
// touches no DOM. Live "age" text is intentionally left out of the signature so
// it can't reintroduce per-tick churn (it refreshes whenever the set changes).
let __cbSig = null, __cbEl = null;

const hhmm = () => { const d = new Date(); return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };
export const render = (props) => {
  if (isLoading(props)) return <Skel tint={T.tintBlue} />;
  pushClip((props.output || "").replace(/\s+/g, " ").trim());
  const pins = readJSON(PINKEY, []); const hist = readJSON(HKEY, []);
  const pinnedEntries = pins.map((content) => ({ content, kind: classify(content), ts: null, pinned: true }));
  const rest = hist.filter((e) => !pins.includes(e.content)).map((e) => ({ ...e, pinned: false }));
  let all = [...pinnedEntries, ...rest]; let sample = false;
  if (!all.length) { sample = true; const now = Date.now(); all = [
    { content: "https://github.com/jke48222/widget-suite", kind: "URL", ts: now - 40e3, pinned: false },
    { content: "#F5561E", kind: "HEX", ts: now - 6e5, pinned: false },
    { content: "~/Library/Application Support/Übersicht/widgets", kind: "PATH", ts: now - 2.4e6, pinned: false },
    { content: "sk-live-" + "x".repeat(24), kind: "KEY", ts: now - 7.2e6, pinned: false } ]; }
  const filter = getFilter();
  if (filter) all = all.filter((e) => e.kind === filter);
  const maxOff = Math.max(0, all.length - PAGE); const off = Math.min(getOff(), maxOff); const page = all.slice(off, off + PAGE);
  const step = (delta) => () => { setOff(Math.min(maxOff, Math.max(0, off + delta))); run("true"); };
  const sig = JSON.stringify({ filter, off, maxOff, sample, total: all.length, pins: pins.length, rows: page.map((e, i) => [e.kind, e.pinned, e.kind === "KEY" ? maskOf(e.content) : e.content]) });
  if (sig === __cbSig && __cbEl) return __cbEl;
  __cbSig = sig;
  return (__cbEl = (
    <div className="rcpt" aria-label={`Clipboard receipt, ${all.length} entries`}>
      <DragHandle k="stack" />
      <ResizeHandle k="stack" />
      <div className="logo">CLIPBOARD</div>
      <div className="sub">MACOS PASTEBOARD · LOCAL ONLY</div>
      <div className="rule">* * * * * * * * * * * * * * * *</div>
      <div className="meta"><span>ITEMS {String(all.length).padStart(2, "0")}</span><span>PINNED {String(pins.length).padStart(2, "0")}</span><span>{sample ? "SAMPLE" : filter ? `FILTER ${filter}` : hhmm()}</span></div>
      <div className="rule">- - - - - - - - - - - - - - - - -</div>
      <div className="rows">
        {page.length ? page.map((e, i) => (
          <div className="ln" key={i} style={{ opacity: e.pinned ? 1 : FADE[Math.min(i, FADE.length - 1)] * 0.5 + 0.5 }} onClick={() => run(`printf %s ${shq(e.content)} | pbcopy`)}>
            <div className="l1"><span className={`kind ${filter === e.kind ? "active" : ""}`} onClick={setFilter(e.kind)}>[{e.kind}]</span><span className="age">{e.ts ? ago(e.ts) : "kept"}</span></div>
            <div className="txt">{e.kind === "KEY" ? maskOf(e.content) : e.content}</div>
            {e.pinned ? <span className="stamp">Pinned</span> : null}
            <span className="pin" onClick={togglePin(e.content)}>{e.pinned ? "UNPIN" : "PIN"}</span>
          </div>
        )) : <div className="txt" style={{ textAlign: "center", padding: "18px 0", color: "#8A8276" }}>{filter ? `NO ${filter} ENTRIES` : "NOTHING COPIED YET"}</div>}
      </div>
      <div className="rule">- - - - - - - - - - - - - - - - -</div>
      {all.length > PAGE ? <div className="pg"><span className={`chev ${off <= 0 ? "off" : ""}`} onClick={off > 0 ? step(-PAGE) : undefined}>&lt;</span><span>PAGE {Math.floor(off / PAGE) + 1} OF {Math.ceil(all.length / PAGE)}</span><span className={`chev ${off >= maxOff ? "off" : ""}`} onClick={off < maxOff ? step(PAGE) : undefined}>&gt;</span></div> : null}
      <div className="bar" />
      <div className="thanks">{sample ? "COPY SOMETHING TO START THE TAPE" : "CLICK A LINE TO COPY IT AGAIN"}</div>
    </div>
  ));
};
