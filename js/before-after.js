/**
 * HerRelief — Before/After Feminine Silhouette Animation
 * Canvas-drawn (no photos). Real anatomy: hair, hourglass torso, hip taper.
 * Left: woman curled on side, long hair cascading, hand clutching belly.
 * Right: woman standing tall, hair flowing, belt glowing at waist.
 * Uses requestAnimationFrame with subtle movement (breathing, hair sway, pain pulse).
 */
(function () {
  'use strict';

  const canvas = document.getElementById('before-after-silhouette');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // Logical canvas size (internal bitmap). Scales with DPR for sharpness.
  const W = 1200;
  const H = 600;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = W * DPR;
  canvas.height = H * DPR;
  ctx.scale(DPR, DPR);

  // Brand palette
  const PAL = {
    cream: '#faf9f6',
    primary: '#70585b',
    secondary: '#a43c12',
    accent: '#fe7e4f',
    pink: '#fadadd',
    pinkDeep: '#debfc2',
    muted: '#4f4445',
    painRed: '#ba1a1a',
    divider: '#d2c3c4',
    skin: '#2f2729',
    skinShadow: '#1a1618',
    hair: '#1a1416',
  };

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let startTime = null;

  // ─────────────────────────────────────────────────────────
  // BEFORE — Woman curled on her side in bed, hair falling forward, pain radiating
  // ─────────────────────────────────────────────────────────
  function drawBeforeSilhouette(cx, cy, t) {
    ctx.save();
    ctx.translate(cx, cy);

    // Subtle "writhing" micro-movement — slight rotation/tilt from pain
    const writhe = reduceMotion ? 0 : Math.sin(t * 1.4) * 0.012;
    ctx.rotate(writhe);

    // Bed / surface shadow under her (subtle)
    ctx.fillStyle = 'rgba(26, 28, 26, 0.06)';
    ctx.beginPath();
    ctx.ellipse(0, 115, 165, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── LEGS (tucked up, one in front of the other) ──
    ctx.fillStyle = PAL.skin;
    ctx.beginPath();
    // Back leg (behind)
    ctx.moveTo(55, -10);
    ctx.bezierCurveTo(120, -25, 145, 10, 130, 55);
    ctx.bezierCurveTo(115, 95, 60, 105, 20, 95);
    ctx.bezierCurveTo(30, 60, 35, 30, 55, -10);
    ctx.closePath();
    ctx.fill();
    // Front leg (on top)
    ctx.fillStyle = PAL.skinShadow;
    ctx.beginPath();
    ctx.moveTo(40, 5);
    ctx.bezierCurveTo(100, -5, 130, 25, 125, 60);
    ctx.bezierCurveTo(110, 95, 55, 105, 15, 95);
    ctx.bezierCurveTo(20, 65, 25, 35, 40, 5);
    ctx.closePath();
    ctx.fill();

    // ── HIPS (wide, feminine) ──
    ctx.fillStyle = PAL.skin;
    ctx.beginPath();
    ctx.moveTo(-20, -15);
    ctx.bezierCurveTo(25, -40, 70, -35, 90, -10);
    ctx.bezierCurveTo(85, 20, 40, 30, 0, 20);
    ctx.bezierCurveTo(-20, 15, -30, 0, -20, -15);
    ctx.closePath();
    ctx.fill();

    // ── WAIST + TORSO (narrow waist curving up) ──
    ctx.beginPath();
    ctx.moveTo(-55, -55);
    ctx.bezierCurveTo(-45, -70, -20, -80, 10, -75);
    ctx.bezierCurveTo(35, -70, 40, -45, 30, -25);
    ctx.bezierCurveTo(10, -15, -30, -15, -50, -25);
    ctx.bezierCurveTo(-58, -40, -60, -48, -55, -55);
    ctx.closePath();
    ctx.fill();

    // ── ARM clutching belly (darker, in front) ──
    ctx.fillStyle = PAL.skinShadow;
    ctx.beginPath();
    // Upper arm
    ctx.moveTo(-25, -55);
    ctx.bezierCurveTo(-15, -40, 0, -30, 20, -20);
    ctx.bezierCurveTo(15, -10, -5, -10, -25, -18);
    ctx.bezierCurveTo(-38, -30, -35, -48, -25, -55);
    ctx.closePath();
    ctx.fill();
    // Forearm crossing belly
    ctx.beginPath();
    ctx.moveTo(15, -25);
    ctx.bezierCurveTo(35, -20, 50, -10, 45, 5);
    ctx.bezierCurveTo(30, 8, 5, 0, -5, -10);
    ctx.closePath();
    ctx.fill();

    // ── NECK (short, tilted) ──
    ctx.fillStyle = PAL.skin;
    ctx.beginPath();
    ctx.moveTo(-60, -60);
    ctx.lineTo(-48, -75);
    ctx.lineTo(-38, -68);
    ctx.lineTo(-50, -50);
    ctx.closePath();
    ctx.fill();

    // ── HEAD (tilted down, cheek on pillow) ──
    ctx.beginPath();
    ctx.ellipse(-70, -80, 24, 22, -0.25, 0, Math.PI * 2);
    ctx.fill();

    // ── HAIR (long, flowing forward over face + pillow) ──
    ctx.fillStyle = PAL.hair;
    // Hair mass behind/around head
    ctx.beginPath();
    ctx.moveTo(-90, -95);
    ctx.bezierCurveTo(-110, -75, -115, -40, -105, -5);
    ctx.bezierCurveTo(-95, 5, -75, 5, -60, -5);
    ctx.bezierCurveTo(-68, -25, -75, -55, -80, -85);
    ctx.bezierCurveTo(-87, -92, -90, -95, -90, -95);
    ctx.closePath();
    ctx.fill();
    // Stray strand falling over face
    ctx.beginPath();
    ctx.moveTo(-65, -75);
    ctx.bezierCurveTo(-60, -60, -55, -40, -58, -20);
    ctx.bezierCurveTo(-62, -25, -65, -50, -68, -70);
    ctx.closePath();
    ctx.fill();

    // ── PAIN PULSES (radiating from belly) ──
    const pulseT = reduceMotion ? 0.5 : (t * 1.8) % 1;
    const painCx = 10;
    const painCy = -15;
    for (let i = 0; i < 3; i++) {
      const p = (pulseT + i * 0.33) % 1;
      const radius = 35 + p * 85;
      const alpha = (1 - p) * 0.45;
      ctx.strokeStyle = `rgba(186, 26, 26, ${alpha})`;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(painCx, painCy, radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Pain sparks (jagged, animated)
    if (!reduceMotion) {
      ctx.strokeStyle = PAL.painRed;
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      const jitter = Math.sin(t * 15) * 1.5;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + t * 0.6;
        const r1 = 55 + jitter;
        const r2 = 72 + jitter;
        ctx.beginPath();
        ctx.moveTo(painCx + Math.cos(a) * r1, painCy + Math.sin(a) * r1);
        ctx.lineTo(painCx + Math.cos(a) * r2, painCy + Math.sin(a) * r2);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  // ─────────────────────────────────────────────────────────
  // AFTER — Woman standing tall, feminine silhouette, belt glowing, hair flowing
  // ─────────────────────────────────────────────────────────
  function drawAfterSilhouette(cx, cy, t) {
    ctx.save();
    ctx.translate(cx, cy);

    // Breathing — gentle vertical scale
    const breath = reduceMotion ? 1 : 1 + Math.sin(t * 1.1) * 0.011;
    ctx.scale(1, breath);

    // Hair sway offset (small, natural movement)
    const hairSway = reduceMotion ? 0 : Math.sin(t * 0.7) * 2.5;

    // ── HAIR (drawn FIRST so body naturally overlaps it) ──
    // Single shape: cascades from top of head down to mid-torso, behind shoulders.
    // Wider at shoulders (spills out), tapered at ends.
    ctx.fillStyle = PAL.hair;
    ctx.beginPath();
    // Start top-left of head
    ctx.moveTo(-26, -168);
    // Over the crown
    ctx.bezierCurveTo(-14, -178, 14, -178, 26, -168);
    // Down right side of head, flaring out to shoulder
    ctx.bezierCurveTo(36, -145, 38, -125, 44 + hairSway, -100);
    // Long cascade down the right side, past shoulder, tapering in at the end
    ctx.bezierCurveTo(48 + hairSway, -60, 44 + hairSway, -20, 36 + hairSway, 20);
    ctx.bezierCurveTo(32 + hairSway, 35, 26 + hairSway, 40, 22, 40);
    // Cross to the other side at mid-torso (where hair ends)
    ctx.lineTo(-22, 40);
    // Long cascade up the left side
    ctx.bezierCurveTo(-26 - hairSway, 40, -32 - hairSway, 35, -36 - hairSway, 20);
    ctx.bezierCurveTo(-44 - hairSway, -20, -48 - hairSway, -60, -44 - hairSway, -100);
    // Up left side of head to start
    ctx.bezierCurveTo(-38, -125, -36, -145, -26, -168);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = PAL.skin;

    // ── LEGS (slender, subtle hip-shifted stance) ──
    // Left leg
    ctx.beginPath();
    ctx.moveTo(-28, 80);
    ctx.bezierCurveTo(-32, 130, -26, 180, -22, 228);
    // Foot
    ctx.bezierCurveTo(-20, 234, -12, 234, -8, 230);
    ctx.bezierCurveTo(-8, 180, -10, 130, -14, 80);
    ctx.closePath();
    ctx.fill();
    // Right leg
    ctx.beginPath();
    ctx.moveTo(10, 80);
    ctx.bezierCurveTo(12, 130, 14, 180, 18, 228);
    ctx.bezierCurveTo(22, 234, 32, 234, 32, 230);
    ctx.bezierCurveTo(34, 180, 32, 130, 26, 80);
    ctx.closePath();
    ctx.fill();

    // ── HIPS (wider, feminine curve) ──
    ctx.beginPath();
    ctx.moveTo(-44, 20);
    ctx.bezierCurveTo(-50, 45, -42, 70, -30, 82);
    ctx.lineTo(30, 82);
    ctx.bezierCurveTo(44, 70, 50, 45, 42, 20);
    ctx.bezierCurveTo(30, 18, -30, 18, -44, 20);
    ctx.closePath();
    ctx.fill();

    // ── WAIST + TORSO (hourglass — narrow at waist) ──
    ctx.beginPath();
    // Right side going down: shoulder → chest → waist
    ctx.moveTo(45, -100);
    ctx.bezierCurveTo(56, -70, 46, -40, 30, -10);
    ctx.bezierCurveTo(22, 5, 22, 15, 28, 22);
    ctx.lineTo(-28, 22);
    // Left side going up: waist → chest → shoulder
    ctx.bezierCurveTo(-22, 15, -22, 5, -30, -10);
    ctx.bezierCurveTo(-46, -40, -56, -70, -45, -100);
    // Shoulders curve
    ctx.bezierCurveTo(-25, -112, 25, -112, 45, -100);
    ctx.closePath();
    ctx.fill();

    // ── ARMS (at sides, slightly relaxed) ──
    // Left arm
    ctx.beginPath();
    ctx.moveTo(-50, -95);
    ctx.bezierCurveTo(-60, -60, -62, -10, -54, 35);
    ctx.bezierCurveTo(-50, 42, -44, 42, -42, 35);
    ctx.bezierCurveTo(-46, -10, -46, -60, -40, -95);
    ctx.closePath();
    ctx.fill();
    // Right arm (hand resting slightly on hip — feminine)
    ctx.beginPath();
    ctx.moveTo(50, -95);
    ctx.bezierCurveTo(60, -60, 62, -15, 50, 20);
    ctx.bezierCurveTo(42, 28, 38, 25, 36, 18);
    ctx.bezierCurveTo(42, -15, 46, -60, 40, -95);
    ctx.closePath();
    ctx.fill();

    // ── NECK ──
    ctx.beginPath();
    ctx.moveTo(-12, -110);
    ctx.bezierCurveTo(-10, -100, -10, -95, -12, -88);
    ctx.lineTo(12, -88);
    ctx.bezierCurveTo(10, -95, 10, -100, 12, -110);
    ctx.closePath();
    ctx.fill();

    // ── HEAD (oval) — drawn AFTER hair so face shape sits in front ──
    ctx.beginPath();
    ctx.ellipse(0, -140, 24, 29, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── HAIR FRINGE on forehead (in front of face, small) ──
    ctx.fillStyle = PAL.hair;
    ctx.beginPath();
    ctx.moveTo(-22, -163);
    ctx.bezierCurveTo(-16, -170, 16, -170, 22, -163);
    ctx.bezierCurveTo(20, -155, 10, -150, 0, -152);
    ctx.bezierCurveTo(-10, -150, -20, -155, -22, -163);
    ctx.closePath();
    ctx.fill();

    // ── BELT GLOW (pink radial) ──
    const glowPulse = reduceMotion ? 0.32 : 0.22 + Math.sin(t * 1.6) * 0.18;
    const glow = ctx.createRadialGradient(0, 12, 10, 0, 12, 100);
    glow.addColorStop(0, `rgba(254, 126, 79, ${glowPulse + 0.25})`);
    glow.addColorStop(0.4, `rgba(250, 218, 221, ${glowPulse * 0.7})`);
    glow.addColorStop(1, 'rgba(250, 218, 221, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 12, 100, 0, Math.PI * 2);
    ctx.fill();

    // ── BELT (strap + central unit wrapping around waist) ──
    // Strap (wider, wraps around)
    ctx.fillStyle = PAL.pink;
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(-48, -6, 96, 30, 14)
      : ctx.rect(-48, -6, 96, 30);
    ctx.fill();

    // Central heating unit (accent color, slightly protruding)
    ctx.fillStyle = PAL.accent;
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(-26, -10, 52, 38, 12)
      : ctx.rect(-26, -10, 52, 38);
    ctx.fill();

    // LED indicator
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(0, 10, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Tiny "heat" wave above belt (pulsing)
    if (!reduceMotion) {
      const waveAlpha = 0.3 + Math.sin(t * 3) * 0.2;
      ctx.strokeStyle = `rgba(164, 60, 18, ${waveAlpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-12, -18);
      ctx.bezierCurveTo(-8, -22, -4, -14, 0, -18);
      ctx.bezierCurveTo(4, -22, 8, -14, 12, -18);
      ctx.stroke();
    }

    ctx.restore();
  }

  // ─────────────────────────────────────────────────────────
  // Labels + divider + tagline
  // ─────────────────────────────────────────────────────────
  function drawLabels() {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';

    // Left label
    ctx.fillStyle = PAL.painRed;
    ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('BEFORE', W * 0.25, 48);
    ctx.fillStyle = PAL.muted;
    ctx.font = '500 14px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Day 1 cramps · curled up in pain', W * 0.25, 70);

    // Right label
    ctx.fillStyle = PAL.secondary;
    ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('AFTER', W * 0.75, 48);
    ctx.fillStyle = PAL.muted;
    ctx.font = '500 14px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('15 minutes with HerRelief · standing tall', W * 0.75, 70);

    // Divider
    ctx.strokeStyle = PAL.divider;
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(W / 2, 90);
    ctx.lineTo(W / 2, H - 40);
    ctx.stroke();
    ctx.setLineDash([]);

    // Bottom tagline
    ctx.fillStyle = PAL.primary;
    ctx.font = 'italic 400 13px "Noto Serif", serif';
    ctx.fillText('Same body. Same day. Fifteen minutes apart.', W / 2, H - 18);

    ctx.restore();
  }

  function render(t) {
    ctx.fillStyle = PAL.cream;
    ctx.fillRect(0, 0, W, H);

    // Silhouettes centered in each half
    drawBeforeSilhouette(W * 0.25, H * 0.60, t);
    drawAfterSilhouette(W * 0.75, H * 0.48, t);

    drawLabels();
  }

  function tick(now) {
    if (startTime === null) startTime = now;
    const t = (now - startTime) / 1000;
    render(t);
    if (!reduceMotion) requestAnimationFrame(tick);
  }

  if (reduceMotion) {
    render(0.5);
  } else {
    requestAnimationFrame(tick);
  }
})();
