const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height;

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
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
let introProgress = 0;

function animate() {
  ctx.clearRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;
  
  const floatY = Math.sin(time * 0.5) * 10;
  const centerY = cy + floatY;
  const size = Math.min(width, height) * 0.25; 
  const h = size * (Math.sqrt(3)/2);
  
  const p1 = { x: cx, y: centerY - h/2 }; 
  const p2 = { x: cx - size/2, y: centerY + h/2 }; 
  const p3 = { x: cx + size/2, y: centerY + h/2 }; 

  const hitRatio = 0.65; 
  const hitX = p1.x + (p2.x - p1.x) * hitRatio;
  const hitY = p1.y + (p2.y - p1.y) * hitRatio;
  
  const startX = 0;
  const startY = hitY + (size * 0.15); 

  const exitRatio = 0.65;
  const exitX = p1.x + (p3.x - p1.x) * exitRatio;
  const exitY = p1.y + (p3.y - p1.y) * exitRatio;

  if (introProgress < 3.5) {
    introProgress += 0.05; 
  }

  if (introProgress > 0) {
    const p = Math.min(1, introProgress);
    const curX = startX + (hitX - startX) * p;
    const curY = startY + (hitY - startY) * p;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(curX, curY);
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.8 + Math.sin(time) * 0.1})`;
    ctx.lineWidth = 4;
    ctx.shadowBlur = 30;
    ctx.shadowColor = 'rgba(255, 255, 255, 1)';
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  if (introProgress > 1) {
    const p = Math.min(1, introProgress - 1);
    const curX = hitX + (exitX - hitX) * p;
    const curY = hitY + (exitY - hitY) * p;

    ctx.beginPath();
    ctx.moveTo(hitX, hitY);
    ctx.lineTo(curX, curY);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 20;
    ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  if (introProgress > 2) {
    const p = Math.min(1, introProgress - 2);
    const spread = 0.12; 
    
    colors.forEach((color, i) => {
      const progress = i / (colors.length - 1); 
      const baseAngle = 0.15; 
      const angle = baseAngle + (progress - 0.5) * spread;
      
      const endX = width;
      const endY = exitY + Math.tan(angle) * (endX - exitX);

      const curEndX = exitX + (endX - exitX) * p;
      const curEndY = exitY + (endY - exitY) * p;

      ctx.beginPath();
      ctx.moveTo(exitX, exitY);
      ctx.lineTo(curEndX, curEndY);
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 8 + Math.sin(time * 2 + i) * 1; 
      
      ctx.shadowBlur = 40;
      ctx.shadowColor = color;
      ctx.globalCompositeOperation = 'screen'; 
      ctx.stroke();
      
      ctx.lineWidth = 4;
      ctx.shadowBlur = 10;
      ctx.stroke();
    });
    ctx.globalCompositeOperation = 'source-over';
  }

  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineTo(p3.x, p3.y);
  ctx.closePath();
  
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = 2;
  ctx.shadowBlur = 25;
  ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.fill();

  time += 0.02;
  requestAnimationFrame(animate);
}

animate();