const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let width, height;
let particles = [];

const particleCount = 80;
const connectionDistance = 150;
const mouseDistance = 200;

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Mouse tracking
let mouse = { x: null, y: null };
window.addEventListener('mousemove', (e) => {
  mouse.x = e.x;
  mouse.y = e.y;
});
window.addEventListener('mouseleave', () => {
  mouse.x = null;
  mouse.y = null;
});

class Particle {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.baseVx = (Math.random() - 0.5) * 0.5;
    this.baseVy = (Math.random() - 0.5) * 0.5;
    this.pushX = 0;
    this.pushY = 0;
    
    this.size = Math.random() * 2 + 1;
    this.color = `rgba(205, 214, 244, ${Math.random() * 0.5 + 0.2})`; // Catppuccin
  }

  update() {
    // Mouse interaction
    if (mouse.x != null) {
      let dx = mouse.x - this.x;
      let dy = mouse.y - this.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < mouseDistance) {
        const forceDirectionX = dx / distance;
        const forceDirectionY = dy / distance;
        const force = (mouseDistance - distance) / mouseDistance;
        
        const pushForce = 0.4; 
        this.pushX -= forceDirectionX * force * pushForce;
        this.pushY -= forceDirectionY * force * pushForce;
      }
    }

    this.pushX *= 0.92;
    this.pushY *= 0.92;

    this.x += this.baseVx + this.pushX;
    this.y += this.baseVy + this.pushY;

    if (this.x < 0 || this.x > width) {
        this.baseVx *= -1;
        this.pushX *= -1;
    }
    if (this.y < 0 || this.y > height) {
        this.baseVy *= -1;
        this.pushY *= -1;
    }
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function init() {
  particles = [];
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
}

function animate() {
  ctx.clearRect(0, 0, width, height);
  
  // Draw connections
  for (let a = 0; a < particles.length; a++) {
    for (let b = a; b < particles.length; b++) {
      let dx = particles[a].x - particles[b].x;
      let dy = particles[a].y - particles[b].y;
      let distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < connectionDistance) {
        let opacity = 1 - (distance / connectionDistance);
        ctx.strokeStyle = `rgba(137, 180, 250, ${opacity * 0.2})`; // Catppuccin Blue
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(particles[a].x, particles[a].y);
        ctx.lineTo(particles[b].x, particles[b].y);
        ctx.stroke();
      }
    }
  }

  // Update and draw particles
  particles.forEach(particle => {
    particle.update();
    particle.draw();
  });

  requestAnimationFrame(animate);
}

init();
animate();