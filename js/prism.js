const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const glowCanvas = document.getElementById('glowCanvas');
const glowCtx = glowCanvas.getContext('2d');

let width, height;

function resize() {
  width = canvas.width = glowCanvas.width = window.innerWidth;
  height = canvas.height = glowCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const colors = [
  '#FF0000',
  '#FF7F00',
  '#FFFF00',
  '#00FF00',
  '#0000FF',
  '#4B0082',
  '#8F00FF'
];

let time = 0;

function animate() {
  ctx.clearRect(0, 0, width, height);

  let cycleTime = performance.now() % 12000;
  const animations = document.getAnimations ? document.getAnimations() : [];
  for (const anim of animations) {
    if (anim.animationName === 'frontMorph' || anim.animationName === 'rotatePyramid' || anim.animationName === 'fadeSolid') {
      const computedTime = anim.currentTime;
      if (computedTime !== null) {
        cycleTime = computedTime % 12000;
        break;
      }
    }
  }

  const rayTime = cycleTime;
  const introProgress = rayTime / 650;
  const sweepProgressRaw = Math.max(0, (rayTime - 4000) / 1000);

  let extraBloom = 0;
  if (rayTime >= 2000 && rayTime < 2500) {
    extraBloom = ((rayTime - 2000) / 500);
  } else if (rayTime >= 2500 && rayTime < 4000) {
    extraBloom = 1;
  } else if (rayTime >= 4000 && rayTime < 4800) {
    extraBloom = 1 - (rayTime - 4000) / 800;
  }

  const r1 = document.getElementById('track-p1').getBoundingClientRect();
  const r2 = document.getElementById('track-p2').getBoundingClientRect();
  const r3 = document.getElementById('track-p3').getBoundingClientRect();

  const p1 = { x: r1.left + r1.width / 2, y: r1.top + r1.height / 2 };
  const p2 = { x: r2.left + r2.width / 2, y: r2.top + r2.height / 2 };
  const p3 = { x: r3.left + r3.width / 2, y: r3.top + r3.height / 2 };

  const hitRatio = 0.45;
  const hitX = p1.x + (p2.x - p1.x) * hitRatio;
  const hitY = p1.y + (p2.y - p1.y) * hitRatio;

  const dx = p3.x - p2.x;
  const dy = p3.y - p2.y;
  const mappedSize = Math.sqrt(dx * dx + dy * dy);

  const startX = 0;
  const startY = hitY + (mappedSize * 0.35);

  const incDirX = hitX - startX;
  const incDirY = hitY - startY;
  const fDx = p3.x - p1.x;
  const fDy = p3.y - p1.y;
  const denom = incDirX * fDy - incDirY * fDx;
  const tHit = ((p1.x - hitX) * fDy - (p1.y - hitY) * fDx) / denom;
  const exitX_top = hitX + incDirX * tHit;
  const exitY_top = hitY + incDirY * tHit;
  const exitRatioBottom = 0.55;
  const exitX_bot = p1.x + (p3.x - p1.x) * exitRatioBottom;
  const exitY_bot = p1.y + (p3.y - p1.y) * exitRatioBottom;

  const exitX = (exitX_top + exitX_bot) / 2;
  const exitY = (exitY_top + exitY_bot) / 2;

  const dist1 = Math.sqrt(Math.pow(hitX - startX, 2) + Math.pow(hitY - startY, 2));
  const dist2 = Math.sqrt(Math.pow(exitX - hitX, 2) + Math.pow(exitY - hitY, 2));
  const dist3 = Math.sqrt(Math.pow(width - exitX, 2));
  const totalDist = dist1 + dist2 + dist3;

  const t1 = dist1 / totalDist;
  const t2 = dist2 / totalDist;
  const t3 = dist3 / totalDist;

  let pOut1 = 0, pOut2 = 0, pOut3 = 0;

  if (sweepProgressRaw <= t1) {
    pOut1 = sweepProgressRaw / t1;
  } else {
    pOut1 = 1;
    if (sweepProgressRaw <= t1 + t2) {
      pOut2 = (sweepProgressRaw - t1) / t2;
    } else {
      pOut2 = 1;
      pOut3 = Math.min(1, (sweepProgressRaw - t1 - t2) / t3);
    }
  }

  const pIn1 = Math.min(1, Math.max(0, introProgress));

  if (pIn1 > pOut1) {
    const curStartX = startX + (hitX - startX) * pOut1;
    const curStartY = startY + (hitY - startY) * pOut1;
    const curEndX = startX + (hitX - startX) * pIn1;
    const curEndY = startY + (hitY - startY) * pIn1;

    ctx.beginPath();
    ctx.moveTo(curStartX, curStartY);
    ctx.lineTo(curEndX, curEndY);
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.8 + Math.sin(time) * 0.1})`;
    ctx.lineWidth = 4;
    ctx.shadowBlur = 30 + (extraBloom * 40);
    ctx.shadowColor = 'rgba(255, 255, 255, 1)';
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10 + (extraBloom * 20);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  const pIn2 = Math.min(1, Math.max(0, introProgress - 1));

  if (pIn2 > pOut2) {
    const curStartX_top = hitX + (exitX_top - hitX) * pOut2;
    const curStartY_top = hitY + (exitY_top - hitY) * pOut2;
    const curEndX_top = hitX + (exitX_top - hitX) * pIn2;
    const curEndY_top = hitY + (exitY_top - hitY) * pIn2;

    const curStartX_bot = hitX + (exitX_bot - hitX) * pOut2;
    const curStartY_bot = hitY + (exitY_bot - hitY) * pOut2;
    const curEndX_bot = hitX + (exitX_bot - hitX) * pIn2;
    const curEndY_bot = hitY + (exitY_bot - hitY) * pIn2;

    ctx.beginPath();
    ctx.moveTo(curStartX_top, curStartY_top);
    ctx.lineTo(curEndX_top, curEndY_top);
    ctx.lineTo(curEndX_bot, curEndY_bot);
    ctx.lineTo(curStartX_bot, curStartY_bot);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(hitX, hitY, exitX_bot, exitY_bot);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.4)');

    ctx.fillStyle = gradient;
    ctx.shadowBlur = 10 + (extraBloom * 40);
    ctx.shadowColor = 'rgba(255, 255, 255, 1)';
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  const pIn3 = Math.min(1, Math.max(0, introProgress - 2));

  if (pIn3 > pOut3) {
    const baseAngle = 0.02;
    const angularSpread = 0.22;

    const rayData = colors.map((color, i) => {
      const progress = i / (colors.length - 1);
      const angle = baseAngle + progress * angularSpread;
      const specificExitX = exitX_top + progress * (exitX_bot - exitX_top);
      const specificExitY = exitY_top + progress * (exitY_bot - exitY_top);
      const endX = width;
      const endY = specificExitY + Math.tan(angle) * (endX - specificExitX);
      return { color, specificExitX, specificExitY, endX, endY };
    });

    for (let i = 0; i < rayData.length - 1; i++) {
      const top = rayData[i];
      const bot = rayData[i + 1];

      const topStartX = top.specificExitX + (top.endX - top.specificExitX) * pOut3;
      const topStartY = top.specificExitY + (top.endY - top.specificExitY) * pOut3;
      const topEndX = top.specificExitX + (top.endX - top.specificExitX) * pIn3;
      const topEndY = top.specificExitY + (top.endY - top.specificExitY) * pIn3;

      const botStartX = bot.specificExitX + (bot.endX - bot.specificExitX) * pOut3;
      const botStartY = bot.specificExitY + (bot.endY - bot.specificExitY) * pOut3;
      const botEndX = bot.specificExitX + (bot.endX - bot.specificExitX) * pIn3;
      const botEndY = bot.specificExitY + (bot.endY - bot.specificExitY) * pIn3;

      ctx.beginPath();
      ctx.moveTo(topStartX, topStartY);
      ctx.lineTo(topEndX, topEndY);
      ctx.lineTo(botEndX, botEndY);
      ctx.lineTo(botStartX, botStartY);
      ctx.closePath();

      ctx.fillStyle = top.color;
      ctx.shadowBlur = 20 + extraBloom;
      ctx.shadowColor = top.color;
      ctx.globalCompositeOperation = 'screen';
      ctx.fill();
    }

    const last = rayData[rayData.length - 1];
    const lastStartX = last.specificExitX + (last.endX - last.specificExitX) * pOut3;
    const lastStartY = last.specificExitY + (last.endY - last.specificExitY) * pOut3;
    const lastEndX = last.specificExitX + (last.endX - last.specificExitX) * pIn3;
    const lastEndY = last.specificExitY + (last.endY - last.specificExitY) * pIn3;

    const extraAngle = baseAngle + angularSpread + 0.04;
    const extraExitX = exitX_bot;
    const extraExitY = exitY_bot;
    const extraEndY = extraExitY + Math.tan(extraAngle) * (width - extraExitX);

    const extraCurStartX = extraExitX + (width - extraExitX) * pOut3;
    const extraCurStartY = extraExitY + (extraEndY - extraExitY) * pOut3;
    const extraCurEndX = extraExitX + (width - extraExitX) * pIn3;
    const extraCurEndY = extraExitY + (extraEndY - extraExitY) * pIn3;

    ctx.beginPath();
    ctx.moveTo(lastStartX, lastStartY);
    ctx.lineTo(lastEndX, lastEndY);
    ctx.lineTo(extraCurEndX, extraCurEndY);
    ctx.lineTo(extraCurStartX, extraCurStartY);
    ctx.closePath();
    ctx.fillStyle = last.color;
    ctx.shadowBlur = 20 + extraBloom;
    ctx.shadowColor = last.color;
    ctx.fill();

    ctx.globalCompositeOperation = 'source-over';
    ctx.shadowBlur = 0;
  }

  if (extraBloom > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    const cx = (p1.x + p2.x + p3.x) / 3;
    const cy = (p1.y + p2.y + p3.y) / 3;
    const triSize = Math.sqrt(Math.pow(p3.x - p2.x, 2) + Math.pow(p3.y - p2.y, 2));

    const haloRadius = triSize * 2.2;
    const haloGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, haloRadius);
    haloGrad.addColorStop(0, `rgba(180, 230, 255, ${0.5 * extraBloom})`);
    haloGrad.addColorStop(0.15, `rgba(140, 210, 255, ${0.35 * extraBloom})`);
    haloGrad.addColorStop(0.35, `rgba(100, 180, 240, ${0.2 * extraBloom})`);
    haloGrad.addColorStop(0.6, `rgba(80, 150, 220, ${0.08 * extraBloom})`);
    haloGrad.addColorStop(1, 'rgba(80, 150, 220, 0)');
    ctx.fillStyle = haloGrad;
    ctx.fillRect(cx - haloRadius, cy - haloRadius, haloRadius * 2, haloRadius * 2);

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.closePath();

    const fillGrad = ctx.createLinearGradient(p1.x, p1.y, (p2.x + p3.x) / 2, (p2.y + p3.y) / 2);
    fillGrad.addColorStop(0, `rgba(180, 230, 255, ${0.6 * extraBloom})`);
    fillGrad.addColorStop(0.4, `rgba(140, 200, 245, ${0.3 * extraBloom})`);
    fillGrad.addColorStop(0.8, `rgba(100, 170, 230, ${0.12 * extraBloom})`);
    fillGrad.addColorStop(1, `rgba(80, 150, 220, ${0.05 * extraBloom})`);
    ctx.fillStyle = fillGrad;
    ctx.fill();

    for (let pass = 0; pass < 3; pass++) {
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.closePath();
      const widths = [10, 5, 2];
      const blurs = [120, 60, 25];
      const alphas = [0.4, 0.7, 1.0];
      ctx.strokeStyle = `rgba(200, 240, 255, ${alphas[pass] * extraBloom})`;
      ctx.lineWidth = widths[pass];
      ctx.shadowBlur = blurs[pass] * extraBloom;
      ctx.shadowColor = `rgba(160, 225, 255, ${extraBloom})`;
      ctx.stroke();
    }
    ctx.shadowBlur = 0;

    ctx.restore();
  }

  glowCtx.clearRect(0, 0, width, height);
  if (cycleTime >= 5200 && cycleTime <= 10400) {
    let lineAlpha;
    if (cycleTime < 5600) lineAlpha = (cycleTime - 5200) / 400;
    else if (cycleTime > 9800) lineAlpha = 1 - (cycleTime - 9800) / 600;
    else lineAlpha = 1;
    lineAlpha = Math.max(0, Math.min(1, lineAlpha));

    const sway = Math.sin(time * 0.4) * 0.05;

    glowCtx.save();
    glowCtx.globalCompositeOperation = 'screen';

    function drawGlowLine(x, y, angle, length, alpha, lineW) {
      const endX = x + Math.cos(angle) * length;
      const endY = y + Math.sin(angle) * length;
      const grad = glowCtx.createLinearGradient(x, y, endX, endY);
      grad.addColorStop(0, `rgba(160, 232, 255, ${0.9 * alpha})`);
      grad.addColorStop(0.25, `rgba(160, 232, 255, ${0.5 * alpha})`);
      grad.addColorStop(0.6, `rgba(160, 232, 255, ${0.15 * alpha})`);
      grad.addColorStop(1, 'rgba(160, 232, 255, 0)');
      glowCtx.beginPath();
      glowCtx.moveTo(x, y);
      glowCtx.lineTo(endX, endY);
      glowCtx.strokeStyle = grad;
      glowCtx.lineWidth = lineW || 2;
      glowCtx.stroke();
    }

    drawGlowLine(p1.x, p1.y, -Math.PI / 2 + sway, 120, lineAlpha, 4);
    drawGlowLine(p2.x, p2.y, Math.PI + 0.15 + sway, 100, lineAlpha * 0.7, 3);
    drawGlowLine(p3.x, p3.y, -0.15 + sway, 100, lineAlpha * 0.7, 3);

    const intGrad1 = glowCtx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
    intGrad1.addColorStop(0, `rgba(160, 232, 255, ${0.4 * lineAlpha})`);
    intGrad1.addColorStop(0.5, `rgba(160, 232, 255, ${0.2 * lineAlpha})`);
    intGrad1.addColorStop(1, `rgba(160, 232, 255, ${0.08 * lineAlpha})`);
    glowCtx.beginPath(); glowCtx.moveTo(p1.x, p1.y); glowCtx.lineTo(p2.x, p2.y);
    glowCtx.strokeStyle = intGrad1; glowCtx.lineWidth = 1.5; glowCtx.stroke();

    const intGrad2 = glowCtx.createLinearGradient(p1.x, p1.y, p3.x, p3.y);
    intGrad2.addColorStop(0, `rgba(160, 232, 255, ${0.4 * lineAlpha})`);
    intGrad2.addColorStop(0.5, `rgba(160, 232, 255, ${0.2 * lineAlpha})`);
    intGrad2.addColorStop(1, `rgba(160, 232, 255, ${0.08 * lineAlpha})`);
    glowCtx.beginPath(); glowCtx.moveTo(p1.x, p1.y); glowCtx.lineTo(p3.x, p3.y);
    glowCtx.strokeStyle = intGrad2; glowCtx.lineWidth = 1.5; glowCtx.stroke();

    glowCtx.restore();
  }

  time += 0.02;
  requestAnimationFrame(animate);
}

animate();