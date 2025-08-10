document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('year').innerText = new Date().getFullYear();

  const loader = document.getElementById('loader');
  gsap.from('#loaderLogo', { y: -20, opacity:0, duration: 0.8, ease:'power3.out' });

  const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
  function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);

  setTimeout(() => {
    gsap.to(loader, { opacity:0, pointerEvents:'none', duration:0.6, onComplete: () => loader.style.display = 'none' });
    gsap.from('nav, header, section', { y:20, opacity:0, stagger:0.08, duration:0.6, ease:'power2.out', delay:0.05 });
  }, 900);

  const lengthInput = document.getElementById('lengthInput');
  const charsInput = document.getElementById('charsInput');
  const priceCalc = document.getElementById('priceCalc');

  function calculatePrice() {
    const length = Math.max(1, Number(lengthInput.value) || 1);
    const chars = Math.max(1, Number(charsInput.value) || 1);
    const base = 300;
    const perSec = 20;
    const perChar = 80;
    const p = Math.round(base + (length * perSec) + (chars * perChar));
    priceCalc.innerText = p + ' Robux';
    const formPrice = document.getElementById('formPrice');
    if (formPrice) formPrice.innerText = p + ' Robux';
  }

  lengthInput.addEventListener('input', calculatePrice);
  charsInput.addEventListener('input', calculatePrice);
  calculatePrice();

  const lengthForm = document.getElementById('lengthForm');
  const charsForm = document.getElementById('charsForm');
  if (lengthForm) lengthForm.addEventListener('input', calculatePrice);
  if (charsForm) charsForm.addEventListener('input', calculatePrice);

  const filters = document.querySelectorAll('.filterBtn');
  const cards = document.querySelectorAll('#grid .card');
  filters.forEach(btn => btn.addEventListener('click', () => {
    filters.forEach(x => x.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.getAttribute('data-filter');
    cards.forEach(c => {
      if (f === '*' || c.classList.contains(f)) c.style.display = '';
      else c.style.display = 'none';
    });
    gsap.from('#grid .card:visible', { y:20, opacity:0, stagger:0.06, duration:0.5 });
  }));

  gsap.registerPlugin(ScrollTrigger);
  gsap.utils.toArray('header h1, header .flex > a').forEach(el => {
    gsap.from(el, { y:30, opacity:0, duration:0.8, ease:'power3.out',
      scrollTrigger: { trigger: el, start: 'top 80%' }});
  });
  gsap.from('.card', { y:20, opacity:0, stagger:0.08, duration:0.6, ease:'power2.out', scrollTrigger:{ trigger:'#portfolio', start:'top 80%'} });

  const parallaxEls = document.querySelectorAll('.parallax');
  const visual = document.getElementById('visualCard');
  if (visual) {
    visual.addEventListener('mousemove', (e) => {
      const bounds = visual.getBoundingClientRect();
      const cx = bounds.left + bounds.width/2;
      const cy = bounds.top + bounds.height/2;
      const dx = (e.clientX - cx) / bounds.width;
      const dy = (e.clientY - cy) / bounds.height;
      parallaxEls.forEach(el => {
        const depth = parseFloat(el.dataset.depth) || 0.1;
        const moveX = -dx * depth * 30;
        const moveY = -dy * depth * 30;
        el.style.transform = `translate3d(${moveX}px, ${moveY}px, 0) rotate(${dx*4}deg)`;
      });
    });
    visual.addEventListener('mouseleave', () => parallaxEls.forEach(el => el.style.transform = ''));
  }

  cards.forEach(c => {
    c.addEventListener('click', () => {
      const src = c.querySelector('img').src;
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed'; overlay.style.inset = 0; overlay.style.background = 'rgba(2,6,23,0.85)'; overlay.style.display = 'flex';
      overlay.style.alignItems = 'center'; overlay.style.justifyContent = 'center'; overlay.style.zIndex = 9999;
      const img = document.createElement('img'); img.src = src; img.style.maxWidth='85%'; img.style.maxHeight='85%'; img.style.borderRadius='12px';
      overlay.appendChild(img);
      overlay.addEventListener('click', () => document.body.removeChild(overlay));
      document.body.appendChild(overlay);
    });
  });

  const form = document.getElementById('commissionForm');
  const msg = document.getElementById('formMsg');
  const fileInput = document.getElementById('fileInput');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.innerText = '';

    const data = new FormData(form);
    data.append('estimated', document.getElementById('formPrice').innerText);

    msg.innerText = 'Sending order...';

    try {
      const res = await fetch("/send-order", {
        method: "POST",
        body: data
      });
      if (!res.ok) throw new Error("Server error");
    } catch (err) {
      console.error(err);
      msg.innerText = 'Failed to send: ' + err.message;
      return;
    }

    msg.innerText = 'Order sent.';
    form.reset();
    calculatePrice();
  });

});
