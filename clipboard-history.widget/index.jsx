import { React, run } from "uebersicht";
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
              font-size:11px; line-height:1; cursor:grab; opacity:0.22;
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
               font-size:11px; line-height:1; cursor:nwse-resize; opacity:0.22;
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

export const className = card("dark", 360, 200, ...LAYOUT.stack) + `
  padding: 14px 16px; display:flex; flex-direction:column;
  .rows  { flex:1; display:flex; flex-direction:column; justify-content:flex-end; gap:2px; padding-top:16px; }
  .row   { display:flex; gap:8px; margin-bottom:7px; align-items:flex-start; }
  .mark  { width:1.5px; flex:0 0 1.5px; border-radius:1px; margin-top:2px; }
  .meta  { min-width:0; flex:1; cursor:pointer; }
  .head  { display:flex; gap:6px; align-items:baseline; }
  .kind  { ${caption(T.onDarkDim)} font-size:8px; cursor:pointer; }
  .kind.active { color:${T.tintBlue}; }
  .age   { ${caption("rgba(143,148,158,0.6)")} font-size:8px; }
  .body  { font-family:${serif}; font-style:italic; font-size:13px; color:${T.onDark};
           white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:1px; }
  .star  { flex:0 0 auto; font-size:11px; line-height:1.4; cursor:pointer;
           color:${T.onDarkMute}; user-select:none; }
  .star.on { color:${T.tintOrange}; }
  .pager { display:flex; align-items:center; justify-content:space-between;
           margin-top:auto; ${caption(T.onDarkMute)} font-size:8px; }
  .chev  { min-width:44px; min-height:22px; display:flex; align-items:center;
           justify-content:center; cursor:pointer; user-select:none; font-size:13px; }
  .chev.off { opacity:0.25; cursor:default; }
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

export const render = (props) => {
  if (isLoading(props)) return <Skel tint={T.tintBlue} />;

  pushClip((props.output || "").replace(/\s+/g, " ").trim());

  // Pinned entries (resolved to their kind) first, then unpinned history.
  const pins = readJSON(PINKEY, []);
  const hist = readJSON(HKEY, []);
  const pinnedEntries = pins.map((content) => ({ content, kind: classify(content), ts: null, pinned: true }));
  const rest = hist.filter((e) => !pins.includes(e.content)).map((e) => ({ ...e, pinned: false }));
  let all = [...pinnedEntries, ...rest];

  const filter = getFilter();
  if (filter) all = all.filter((e) => e.kind === filter);
  if (!all.length) return <Empty text={filter ? `No ${filter} entries` : "Nothing copied yet"} />;

  const maxOff = Math.max(0, all.length - PAGE);
  const off = Math.min(getOff(), maxOff);
  const page = all.slice(off, off + PAGE);
  const step = (delta) => () => { setOff(Math.min(maxOff, Math.max(0, off + delta))); run("true"); };

  return (
    <div aria-label={`Clipboard stack, ${all.length} entries`}>
      <DragHandle k="stack" />
      <ResizeHandle k="stack" />
      <div className="rows">
        {page.map((e, i) => (
          <div className="row" key={i} style={{ opacity: e.pinned ? 1 : FADE[i] }}>
            <div className="mark" style={{ background: e.pinned ? T.tintOrange : (off === 0 && i === 0 ? T.tintBlue : "transparent") }} />
            <div className="meta" onClick={() => run(`printf %s ${shq(e.content)} | pbcopy`)}>
              <div className="head">
                <span className={`kind ${filter === e.kind ? "active" : ""}`} onClick={setFilter(e.kind)}>{e.kind}</span>
                <span className="age">{e.ts ? ago(e.ts) : "pinned"}</span>
              </div>
              <div className="body">{e.kind === "KEY" ? maskOf(e.content) : e.content}</div>
            </div>
            <span className={`star ${e.pinned ? "on" : ""}`} title="Pin" onClick={togglePin(e.content)}>
              {e.pinned ? "★" : "☆"}
            </span>
          </div>
        ))}
      </div>
      {all.length > PAGE && (
        <div className="pager">
          <span className={`chev ${off <= 0 ? "off" : ""}`} onClick={off > 0 ? step(-PAGE) : undefined}>&#x2039;</span>
          <span>{Math.floor(off / PAGE) + 1} / {Math.ceil(all.length / PAGE)}</span>
          <span className={`chev ${off >= maxOff ? "off" : ""}`} onClick={off < maxOff ? step(PAGE) : undefined}>&#x203A;</span>
        </div>
      )}
    </div>
  );
};
