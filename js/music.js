document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.album-card');
  
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, index * 50);
        
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  cards.forEach(card => observer.observe(card));
});
