// Hand-built SVG illustrations: peonies, palace, mandap, envelope flap, icons.
(function () {
  const NS = "http://www.w3.org/2000/svg";

  // ── Peony: rings of ruffled petals with line-art veins ──
  function petal(len, wid) {
    const t = len * 0.12;
    return `M0 0 C ${-wid} ${-len * 0.25}, ${-wid * 0.95} ${-len * 0.85}, ${-wid * 0.35} ${-len}
            Q ${-wid * 0.15} ${-len - t}, 0 ${-len + t * 0.3}
            Q ${wid * 0.15} ${-len - t}, ${wid * 0.35} ${-len}
            C ${wid * 0.95} ${-len * 0.85}, ${wid} ${-len * 0.25}, 0 0 Z`;
  }
  const rings = [
    { len: 54, wid: 30, n: 9, off: 0, fill: "#f8e1de" },
    { len: 42, wid: 24, n: 8, off: 20, fill: "#f3cfcb" },
    { len: 30, wid: 18, n: 7, off: 8, fill: "#eebcb7" },
    { len: 18, wid: 12, n: 6, off: 30, fill: "#e6a7a3" },
  ];
  let p = "";
  for (const r of rings) {
    for (let i = 0; i < r.n; i++) {
      const a = r.off + (360 / r.n) * i;
      p += `<g transform="rotate(${a})"><path d="${petal(r.len, r.wid)}" fill="${r.fill}" stroke="#c9837f" stroke-width="1.1"/>
            <path d="M0 ${-r.len * 0.35} L0 ${-r.len * 0.8}" stroke="#d49a95" stroke-width=".7" fill="none"/></g>`;
    }
  }
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    p += `<circle cx="${Math.cos(a) * 5}" cy="${Math.sin(a) * 5}" r="1.6" fill="#c9837f"/>`;
  }
  document.getElementById("peony").innerHTML = p;

  // ── Floral corner cluster ──
  window.floraSVG = function () {
    return `<svg viewBox="0 0 200 200" aria-hidden="true">
      <use href="#leaf" class="leaf" x="60" y="40" width="80" height="27" transform="rotate(-35 100 50)"/>
      <use href="#leaf" class="leaf" x="90" y="110" width="80" height="27" transform="rotate(25 130 120)"/>
      <use href="#leaf" class="leaf" x="10" y="120" width="70" height="23" transform="rotate(70 45 130)"/>
      <use href="#leaf" class="leaf" x="110" y="60" width="60" height="20" transform="rotate(-5 140 70)"/>
      <use href="#peony" x="15" y="15" width="120" height="120"/>
      <use href="#peony" x="105" y="95" width="70" height="70"/>
      <use href="#peony" x="120" y="20" width="40" height="40"/>
      <circle cx="40" cy="160" r="6" fill="#efc4bf" stroke="#c9837f"/>
      <circle cx="170" cy="40" r="5" fill="#efc4bf" stroke="#c9837f"/>
    </svg>`;
  };

  // ── Envelope flap with scalloped edges ──
  window.scallopFlap = function () {
    const pts = [[300, 0], [150, 132], [0, 0]];
    const cx = 150, cy = 44, n = 5, amp = 7;
    let d = "M0 0 L300 0";
    for (let e = 0; e < 2; e++) {
      const [x1, y1] = pts[e], [x2, y2] = pts[e + 1];
      for (let i = 0; i < n; i++) {
        const ax = x1 + ((x2 - x1) * i) / n, ay = y1 + ((y2 - y1) * i) / n;
        const bx = x1 + ((x2 - x1) * (i + 1)) / n, by = y1 + ((y2 - y1) * (i + 1)) / n;
        const mx = (ax + bx) / 2, my = (ay + by) / 2;
        let nx = -(by - ay), ny = bx - ax;
        const len = Math.hypot(nx, ny);
        nx /= len; ny /= len;
        if ((mx - cx) * nx + (my - cy) * ny < 0) { nx = -nx; ny = -ny; }
        d += ` Q ${mx + nx * amp * 2} ${my + ny * amp * 2} ${bx} ${by}`;
      }
    }
    return d + " Z";
  };

  // ── Palace line-art (venue) ──
  function dome(cx, base, w, h) {
    return `<path d="M${cx - w / 2} ${base} C ${cx - w / 2} ${base - h * 0.7}, ${cx - w * 0.1} ${base - h * 0.8}, ${cx} ${base - h}
            C ${cx + w * 0.1} ${base - h * 0.8}, ${cx + w / 2} ${base - h * 0.7}, ${cx + w / 2} ${base}" class="wash"/>
            <path d="M${cx} ${base - h} V ${base - h - 10}"/><circle cx="${cx}" cy="${base - h - 11}" r="1.5"/>`;
  }
  function arches(x, y, w, h, n) {
    let s = "";
    const aw = w / n;
    for (let i = 0; i < n; i++) {
      const ax = x + i * aw + aw * 0.18, ww = aw * 0.64;
      s += `<path d="M${ax} ${y + h} V ${y + ww / 2} A ${ww / 2} ${ww / 2} 0 0 1 ${ax + ww} ${y + ww / 2} V ${y + h}"/>`;
    }
    return s;
  }
  function tree(x, y, s) {
    return `<path d="M${x} ${y} v ${-12 * s}"/>
      <path class="wash" d="M${x} ${y - 10 * s} c ${-12 * s} 0 ${-14 * s} ${-16 * s} ${-4 * s} ${-20 * s}
        c ${0} ${-10 * s} ${10 * s} ${-12 * s} ${12 * s} ${-2 * s} c ${10 * s} ${2 * s} ${8 * s} ${20 * s} ${-8 * s} ${22 * s} z"/>`;
  }
  window.palaceSVG = function () {
    let s = `<svg viewBox="0 0 320 200" aria-hidden="true"><g class="ink">`;
    // minarets
    for (const x of [36, 284]) {
      s += `<path class="wash" d="M${x - 5} 160 V 70 H ${x + 5} V 160"/><path d="M${x - 8} 70 H ${x + 8} M${x - 7} 110 H ${x + 7}"/>` + dome(x, 70, 14, 16);
    }
    // wings
    s += `<path class="wash" d="M56 160 V 104 H 112 V 160 M208 160 V 104 H 264 V 160"/>` + arches(56, 116, 56, 44, 3) + arches(208, 116, 56, 44, 3);
    s += `<path d="M54 104 H 114 M206 104 H 266"/>` + dome(70, 104, 18, 18) + dome(98, 104, 18, 18) + dome(222, 104, 18, 18) + dome(250, 104, 18, 18);
    // central block
    s += `<path class="wash" d="M112 160 V 88 H 208 V 160"/><path d="M108 88 H 212 M112 100 H 208"/>` + arches(116, 108, 88, 52, 3);
    s += dome(160, 88, 64, 46) + dome(124, 88, 16, 16) + dome(196, 88, 16, 16);
    // jharokha dots
    for (let x = 118; x < 206; x += 8) s += `<circle cx="${x}" cy="94" r=".9"/>`;
    // steps, ground, water
    s += `<path d="M100 160 H 220 M106 166 H 214 M112 172 H 208 M0 160 H 100 M220 160 H 320"/>`;
    for (let i = 0; i < 4; i++) s += `<path class="thin" d="M${20 + i * 18} ${180 + i * 5} q 20 -4 40 0 t 40 0 M${180 - i * 10} ${178 + i * 6} q 20 -4 40 0 t 40 0"/>`;
    s += tree(12, 160, 1.1) + tree(304, 160, 1.2) + tree(150 - 140, 160, 0.6);
    return s + `</g></svg>`;
  };

  // ── Mandap line-art (countdown) ──
  window.mandapSVG = function () {
    let s = `<svg viewBox="0 0 300 270" aria-hidden="true"><g class="ink">`;
    s += `<path class="wash" d="M40 92 Q 150 10 260 92 Z"/><path d="M150 30 V 14"/><circle cx="150" cy="11" r="3"/>`;
    s += `<path d="M30 92 H 270 M34 100 H 266"/>`;
    // scalloped valance
    let v = "M34 100";
    for (let x = 34; x < 266; x += 16) v += ` q 8 10 16 0`;
    s += `<path d="${v}"/>`;
    // pillars
    for (const x of [50, 250]) {
      s += `<path class="wash" d="M${x - 7} 238 V 104 H ${x + 7} V 238"/><path d="M${x - 11} 238 H ${x + 11} M${x - 11} 104 H ${x + 11}"/>`;
      for (let y = 120; y < 230; y += 22) s += `<circle cx="${x}" cy="${y}" r="2.2"/>`;
    }
    // drapes
    s += `<path class="thin" d="M58 104 C 70 160, 90 170, 110 180 C 90 190, 70 210, 60 236 M242 104 C 230 160, 210 170, 190 180 C 210 190, 230 210, 240 236"/>`;
    s += `<path class="thin" d="M66 104 C 82 150, 100 166, 112 176 M234 104 C 218 150, 200 166, 188 176"/>`;
    // garlands
    for (const [a, b, dy] of [[58, 242, 40], [74, 226, 26]]) {
      for (let t = 0; t <= 1.0001; t += 0.05) {
        const x = a + (b - a) * t, y = 106 + Math.sin(Math.PI * t) * dy;
        s += `<circle cx="${x}" cy="${y}" r="2.2" class="bloom"/>`;
      }
    }
    // lanterns
    for (const x of [105, 150, 195]) s += `<path d="M${x} 100 V 122"/><path class="wash" d="M${x - 5} 122 h10 l -2 12 h -6 z"/><path d="M${x} 134 v 5"/>`;
    // havan kund + steps
    s += `<path class="wash" d="M130 238 V 222 H 170 V 238"/><path class="flame" d="M150 220 c -8 -8 -2 -16 0 -22 c 2 6 8 12 0 22 z"/>`;
    s += `<path d="M20 238 H 280 M28 246 H 272 M36 254 H 264"/>`;
    // flower pots
    for (const x of [20, 280]) {
      s += `<path class="wash" d="M${x - 9} 238 l 3 -16 h 12 l 3 16 z"/>`;
      for (let i = 0; i < 6; i++) s += `<circle cx="${x - 10 + (i % 3) * 10}" cy="${212 - Math.floor(i / 3) * 9}" r="5" class="bloom"/>`;
    }
    return s + `</g></svg>`;
  };

  // ── Timeline icons ──
  window.ICONS = {
    haldi: `<path d="M4 12h16a8 8 0 0 1-16 0z"/><path d="M9 8c0-2 2-2 2-4M14 8c0-2 2-2 2-4"/>`,
    mehendi: `<path d="M8 21v-7l-2-3V6a1 1 0 0 1 2 0v4M8 6V4a1 1 0 0 1 2 0v6M10 4a1 1 0 0 1 2 0v6M12 5a1 1 0 0 1 2 0v7l2-2a1.4 1.4 0 0 1 2 2l-4 5v4"/>`,
    music: `<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>`,
    rings: `<circle cx="9" cy="14" r="5"/><circle cx="15" cy="14" r="5"/><path d="M7 6l2-3 2 3"/>`,
    fire: `<path d="M12 3c1 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-4 3-7 1 2 2 3 3 3 0-2 0-4 0-7z"/>`,
    garland: `<path d="M4 4c0 9 4 14 8 14s8-5 8-14"/><circle cx="5" cy="9" r="1.6"/><circle cx="8" cy="14" r="1.6"/><circle cx="12" cy="16.5" r="1.6"/><circle cx="16" cy="14" r="1.6"/><circle cx="19" cy="9" r="1.6"/><path d="M12 18v3"/>`,
    dinner: `<path d="M8 3h4l-.5 6a1.5 1.5 0 0 1-3 0zM10 11v8M7 21h6M16 3l2 0 0 7a2 2 0 0 1-2 0zM17 10v11"/>`,
  };
  window.iconSVG = (k) => `<svg viewBox="0 0 24 24">${window.ICONS[k] || window.ICONS.rings}</svg>`;
})();
