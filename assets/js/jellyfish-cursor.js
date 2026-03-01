(function () {
  if (window.matchMedia("(hover: none)").matches) return;

  const SVG_NS = "http://www.w3.org/2000/svg";

  // SVG coordinate constants
  const CX = 30;        // center x of bell
  const TIP_Y = 8;      // topmost point of bell (where cursor tip sits)
  const BELL_BOT_Y = 52; // bottom of bell / top of tentacles

  const TENTACLES = [
    { x: 12, len: 55 },
    { x: 18, len: 72 },
    { x: 24, len: 60 },
    { x: 30, len: 80 },
    { x: 36, len: 62 },
    { x: 42, len: 70 },
    { x: 48, len: 56 },
  ];

  // ── Build SVG ──────────────────────────────────────────────────────────────

  function attr(el, props) {
    Object.entries(props).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
  }
  function el(tag, props) {
    return attr(document.createElementNS(SVG_NS, tag), props);
  }

  function buildSVG() {
    const svg = el("svg", {
      viewBox: "0 0 60 140",
      width: "60",
      height: "140",
      style: "overflow:visible;display:block",
    });

    // Tentacles — paths updated each frame in JS
    const tentacleGroup = el("g", { id: "jf-tentacles" });
    TENTACLES.forEach((_, i) =>
      tentacleGroup.appendChild(el("path", {
        id: `jft-${i}`,
        stroke: "rgba(255,145,40,0.65)",
        "stroke-width": "2",
        fill: "none",
        "stroke-linecap": "round",
      }))
    );
    svg.appendChild(tentacleGroup);

    // Bell body — dome: top ~(30,8), sides widen to ~y=40, closes at bottom ~y=52
    const bellGroup = el("g", { id: "jf-bell" });

    bellGroup.appendChild(el("path", {
      d: `M 8 38 C 8 ${TIP_Y} 52 ${TIP_Y} 52 38 C 52 50 44 ${BELL_BOT_Y} 30 ${BELL_BOT_Y} C 16 ${BELL_BOT_Y} 8 50 8 38 Z`,
      fill: "rgba(255,110,20,0.84)",
      stroke: "rgba(255,165,65,0.88)",
      "stroke-width": "1.5",
    }));

    // Inner dome highlight
    bellGroup.appendChild(el("ellipse", {
      cx: "21", cy: "26", rx: "13", ry: "10",
      fill: "rgba(255,225,145,0.28)",
    }));

    // Subtle radial ribs inside bell
    [
      `M 30 ${BELL_BOT_Y} Q 18 38 12 18`,
      `M 30 ${BELL_BOT_Y} Q 30 36 30 ${TIP_Y + 2}`,
      `M 30 ${BELL_BOT_Y} Q 42 38 48 18`,
    ].forEach(d =>
      bellGroup.appendChild(el("path", {
        d,
        stroke: "rgba(255,180,80,0.18)",
        "stroke-width": "1",
        fill: "none",
      }))
    );

    // Frilly / scalloped skirt at bottom of bell
    bellGroup.appendChild(el("path", {
      d: `M 8 40 Q 13 52 18 45 Q 21 54 25 46 Q 28 55 30 47 Q 32 55 35 46 Q 39 54 42 45 Q 47 52 52 40`,
      fill: "rgba(255,148,48,0.52)",
      stroke: "rgba(255,165,62,0.65)",
      "stroke-width": "1.2",
    }));

    // Eyes
    bellGroup.appendChild(el("circle", { cx: "22", cy: "35", r: "3",   fill: "rgba(75,30,5,0.92)" }));
    bellGroup.appendChild(el("circle", { cx: "38", cy: "35", r: "3",   fill: "rgba(75,30,5,0.92)" }));
    // Eye shines
    bellGroup.appendChild(el("circle", { cx: "23.6", cy: "33.2", r: "1", fill: "white" }));
    bellGroup.appendChild(el("circle", { cx: "39.6", cy: "33.2", r: "1", fill: "white" }));
    // Smile
    bellGroup.appendChild(el("path", {
      d: "M 22 41 Q 30 48 38 41",
      stroke: "rgba(75,30,5,0.92)",
      "stroke-width": "1.8",
      fill: "none",
      "stroke-linecap": "round",
    }));

    svg.appendChild(bellGroup);
    return svg;
  }

  // ── Styles ─────────────────────────────────────────────────────────────────

  const style = document.createElement("style");
  style.textContent = `
    * { cursor: none !important; }

    #jellyfish-cursor {
      position: fixed;
      pointer-events: none;
      z-index: 99999;
      filter: drop-shadow(0 0 8px rgba(255, 110, 20, 0.5));
    }

    @keyframes bellPulse {
      0%, 100% { transform: scaleY(1);    }
      50%       { transform: scaleY(0.88); }
    }
    #jf-bell {
      transform-box: fill-box;
      transform-origin: center bottom;
      animation: bellPulse 1.5s ease-in-out infinite;
    }
  `;
  document.head.appendChild(style);

  // ── Mount ──────────────────────────────────────────────────────────────────

  const cursor = document.createElement("div");
  cursor.id = "jellyfish-cursor";
  const svg = buildSVG();
  cursor.appendChild(svg);
  document.body.appendChild(cursor);

  // ── Animation loop ─────────────────────────────────────────────────────────

  let mouseX = 0, mouseY = 0;
  let curX = 0, curY = 0;
  let targetAngle = 0;   // degrees; 0 = pointing up
  let currentAngle = 0;

  document.addEventListener("mousemove", e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function lerpAngle(a, b, t) {
    // Shortest-path lerp across ±180°
    let d = ((b - a + 540) % 360) - 180;
    return a + d * t;
  }

  const tentacleEls = Array.from({ length: TENTACLES.length }, (_, i) =>
    svg.getElementById(`jft-${i}`)
  );

  function animateTentacles(t) {
    TENTACLES.forEach(({ x, len }, i) => {
      const phase = i * 0.55;
      const freq  = 1.1 + i * 0.08;
      const amp   = 7;
      const y0    = BELL_BOT_Y;
      const y3    = y0 + len;
      const y1    = y0 + len * 0.38;
      const y2    = y0 + len * 0.72;
      const w1    = Math.sin(t * freq * Math.PI * 2 + phase) * amp;
      const w2    = Math.sin(t * freq * Math.PI * 2 + phase + Math.PI * 0.7) * amp;
      tentacleEls[i].setAttribute("d",
        `M ${x} ${y0} Q ${x + w1} ${y1} ${x} ${(y0 + y1) / 2 + 4} Q ${x + w2} ${y2} ${x} ${y3}`
      );
    });
  }

  function tick(timestamp) {
    const t = timestamp / 1000;

    // Smooth-follow cursor with slight lag
    const dx = mouseX - curX;
    const dy = mouseY - curY;
    curX += dx * 0.15;
    curY += dy * 0.15;

    // Orient toward direction of travel
    const speed = Math.sqrt(dx * dx + dy * dy);
    if (speed > 0.3) {
      // atan2(dy,dx) → angle from +x; +90° rotates reference so 0° = upward
      targetAngle = Math.atan2(dy, dx) * 180 / Math.PI + 90;
    }
    currentAngle = lerpAngle(currentAngle, targetAngle, 0.1);

    // Place element so bell tip (CX, TIP_Y) sits exactly on cursor
    cursor.style.left            = `${curX - CX}px`;
    cursor.style.top             = `${curY - TIP_Y}px`;
    cursor.style.transformOrigin = `${CX}px ${TIP_Y}px`;
    cursor.style.transform       = `rotate(${currentAngle}deg)`;

    animateTentacles(t);
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();
