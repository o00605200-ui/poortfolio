(() => {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* Eski sodda fonlarni o'chiramiz, o'rniga yangilari ishlaydi */
  const noop = () => {};
  window.initSkillsBg = window.initProjectsBg = window.initCyberBg = window.initContactBg = noop;

  const ids = { 's-skills': 'skills-bg', 's-projects': 'projects-bg', 's-experience': 'cyber-bg', 's-contact': 'contact-bg' };
  const C = {}, G = {};
  let W = 0, H = 0;
  for (const k in ids) { C[k] = document.getElementById(ids[k]); G[k] = C[k].getContext('2d'); }

  function size() {
    const d = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight;
    for (const k in C) { C[k].width = W * d; C[k].height = H * d; G[k].setTransform(d, 0, 0, d, 0, 0); }
    buildLadder();
  }

  /* ---------- SKILLS: ladder logic (PLC rele sxemasi) ---------- */
  let rungs = [];
  function buildLadder() {
    rungs = [];
    const labs = ['I0.', 'Q0.', 'M1.', 'T', 'DB1.'];
    for (let i = 0, n = Math.ceil(H / 96); i < n; i++) {
      const els = [];
      for (let j = 0, k = 2 + (i % 2); j < k; j++)
        els.push({ x: .16 + j * .2 + Math.random() * .04, on: Math.random() > .35, lab: labs[(Math.random() * labs.length) | 0] + ((Math.random() * 8) | 0), at: Math.random() * 4000 });
      rungs.push({ y: 48 + i * 96, els, coil: .82 + Math.random() * .05, q: 'Q' + (i % 4) + '.' + (i % 8) });
    }
  }
  function skills(t) {
    const g = G['s-skills']; g.clearRect(0, 0, W, H);
    const L = W * .035, R = W * .965, off = -(t / 18);
    g.lineWidth = 2; g.font = '11px monospace'; g.textAlign = 'center';
    g.strokeStyle = 'rgba(255,214,10,.35)'; g.beginPath(); g.moveTo(L, 0); g.lineTo(L, H); g.moveTo(R, 0); g.lineTo(R, H); g.stroke();
    for (const r of rungs) {
      for (const e of r.els) if (t > e.at) { e.on = !e.on; e.at = t + 1400 + Math.random() * 3200; }
      let fl = true, px = L;
      const wire = (x1, x2, on) => {
        g.beginPath(); g.moveTo(x1, r.y); g.lineTo(x2, r.y);
        if (on) { g.strokeStyle = 'rgba(255,214,10,.8)'; g.shadowBlur = 8; g.shadowColor = '#ffd60a'; g.setLineDash([10, 14]); g.lineDashOffset = off; }
        else { g.strokeStyle = 'rgba(255,214,10,.16)'; g.setLineDash([]); g.shadowBlur = 0; }
        g.stroke(); g.setLineDash([]); g.shadowBlur = 0;
      };
      for (const e of [...r.els, { x: r.coil, coil: 1 }]) {
        const x = e.x * W; wire(px, x - 14, fl);
        if (e.coil) {
          g.beginPath(); g.arc(x, r.y, 13, 0, 7);
          if (fl) { g.fillStyle = 'rgba(255,214,10,.9)'; g.shadowBlur = 24; g.shadowColor = '#ffd60a'; g.fill(); }
          g.strokeStyle = fl ? '#fff3b0' : 'rgba(255,214,10,.4)'; g.stroke(); g.shadowBlur = 0;
          g.fillStyle = 'rgba(255,214,10,.45)'; g.fillText(r.q, x, r.y - 22);
        } else {
          g.strokeStyle = e.on ? '#ffd60a' : 'rgba(255,214,10,.4)';
          g.beginPath(); g.moveTo(x - 8, r.y - 14); g.lineTo(x - 8, r.y + 14); g.moveTo(x + 8, r.y - 14); g.lineTo(x + 8, r.y + 14); g.stroke();
          if (e.on) { g.fillStyle = 'rgba(255,214,10,.35)'; g.fillRect(x - 8, r.y - 14, 16, 28); }
          g.fillStyle = 'rgba(255,214,10,.45)'; g.fillText(e.lab, x, r.y - 22);
          if (!e.on) fl = false;
        }
        px = x + 14;
      }
      wire(px, R, fl);
    }
  }

  /* ---------- PROJECTS: blueprint, 3D karkas, o'lchov chiziqlari ---------- */
  let mx = -1, my = -1;
  addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
  const V = []; for (let i = 0; i < 8; i++) V.push([i & 1 ? 1 : -1, i & 2 ? 1 : -1, i & 4 ? 1 : -1]);
  const ED = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
  function cube(g, cx, cy, s, a, b, col) {
    const P = V.map(([x, y, z]) => {
      const x1 = x * Math.cos(a) + z * Math.sin(a), z1 = -x * Math.sin(a) + z * Math.cos(a);
      const y1 = y * Math.cos(b) - z1 * Math.sin(b), z2 = y * Math.sin(b) + z1 * Math.cos(b), k = 3.2 / (z2 + 3.6);
      return [cx + x1 * s * k, cy + y1 * s * k];
    });
    g.strokeStyle = col; g.fillStyle = col; g.lineWidth = 1.4; g.beginPath();
    for (const [i, j] of ED) { g.moveTo(...P[i]); g.lineTo(...P[j]); }
    g.stroke(); for (const [x, y] of P) g.fillRect(x - 2.5, y - 2.5, 5, 5);
  }
  function dim(g, x1, y1, x2, y2, txt, t) {
    const c = t % 7000, p = Math.min(1, c / 1800), al = c > 6200 ? 1 - (c - 6200) / 800 : 1;
    const x = x1 + (x2 - x1) * p, y = y1 + (y2 - y1) * p;
    const nx = -(y2 - y1), ny = x2 - x1, l = Math.hypot(nx, ny), ux = nx / l * 8, uy = ny / l * 8;
    g.save(); g.globalAlpha = al * .85; g.strokeStyle = g.fillStyle = '#9fe8ff'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(x1, y1); g.lineTo(x, y); g.moveTo(x1 - ux, y1 - uy); g.lineTo(x1 + ux, y1 + uy);
    if (p >= 1) { g.moveTo(x2 - ux, y2 - uy); g.lineTo(x2 + ux, y2 + uy); }
    g.stroke();
    if (p >= 1) { g.font = '12px monospace'; g.textAlign = 'center'; g.fillText(txt, (x1 + x2) / 2 + ux * 2.4, (y1 + y2) / 2 + uy * 2.4 + 4); }
    g.restore();
  }
  function projects(t) {
    const g = G['s-projects']; g.clearRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2, s = Math.min(W, H) * .2, r = s * 2.2;
    g.strokeStyle = 'rgba(160,220,255,.3)'; g.lineWidth = 1; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke();
    g.beginPath();
    for (let i = 0; i < 72; i++) {
      const a = i * Math.PI / 36 + t * .00008, l = i % 6 ? 5 : 13;
      g.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); g.lineTo(cx + Math.cos(a) * (r + l), cy + Math.sin(a) * (r + l));
    }
    g.stroke();
    cube(g, cx, cy, s, t * .0006, t * .0004, 'rgba(127,227,255,.8)');
    cube(g, cx, cy, s * .5, -t * .0009, t * .0007, 'rgba(255,214,10,.8)');
    dim(g, W * .08, H * .92, W * .08 + Math.min(W * .3, 380), H * .92, '240 mm', t);
    dim(g, W * .94, H * .18, W * .94, H * .18 + Math.min(H * .4, 300), '120 mm', t + 2500);
    if (mx >= 0) {
      g.strokeStyle = 'rgba(255,214,10,.22)'; g.beginPath(); g.moveTo(mx, 0); g.lineTo(mx, H); g.moveTo(0, my); g.lineTo(W, my); g.stroke();
      g.fillStyle = '#ffd60a'; g.font = '12px monospace'; g.textAlign = 'left'; g.fillText('X ' + (mx | 0) + '  Y ' + (my | 0), mx + 10, my - 10);
    }
  }

  /* ---------- EXPERIENCE: SCADA trendlari (harorat, bosim, vibratsiya) ---------- */
  const CH = [
    { y: .2, n: 'T-101  °C', b: 61, r: 9, u: ' °C', d: 1 },
    { y: .5, n: 'P-204  BAR', b: 6.4, r: 1.3, u: ' bar', d: 2 },
    { y: .8, n: 'V-310  mm/s', b: 2.1, r: .9, u: ' mm/s', d: 2 }
  ];
  const fx = (i, x, t) => { const k = i + 1; return (Math.sin(x * .0066 * k + t * .0012 * k) + .5 * Math.sin(x * .029 - t * .0021) + .25 * Math.sin(x * .071 + t * .004)) / 1.75; };
  let lastLive = -999;
  function experience(t) {
    const g = G['s-experience']; g.clearRect(0, 0, W, H); g.lineWidth = 1;
    for (let x = 0; x < W; x += 30) { g.strokeStyle = x % 150 ? 'rgba(255,214,10,.035)' : 'rgba(255,214,10,.08)'; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
    for (let y = 0; y < H; y += 30) { g.strokeStyle = y % 150 ? 'rgba(255,214,10,.035)' : 'rgba(255,214,10,.08)'; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    const A = H * .075;
    CH.forEach((c, i) => {
      const y0 = H * c.y;
      g.strokeStyle = 'rgba(255,90,90,.25)'; g.setLineDash([4, 6]); g.beginPath(); g.moveTo(0, y0 - A * .6); g.lineTo(W, y0 - A * .6); g.stroke(); g.setLineDash([]);
      g.strokeStyle = '#ffd60a'; g.lineWidth = 2; g.shadowBlur = 10; g.shadowColor = '#ffd60a'; g.beginPath();
      for (let x = 0; x <= W; x += 4) { const y = y0 - fx(i, x, t) * A; x ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.stroke(); g.shadowBlur = 0; g.lineWidth = 1;
      g.fillStyle = '#ff4d4d'; for (let x = 0; x <= W; x += 4) { const v = fx(i, x, t); if (v > .6) g.fillRect(x - 1, y0 - v * A - 1, 3, 3); }
      g.fillStyle = 'rgba(255,214,10,.65)'; g.font = '12px monospace'; g.textAlign = 'left'; g.fillText(c.n, 16, y0 - A - 10);
    });
    const sx = (t * .12) % W, gr = g.createLinearGradient(sx - 140, 0, sx, 0);
    gr.addColorStop(0, 'rgba(255,214,10,0)'); gr.addColorStop(1, 'rgba(255,214,10,.09)');
    g.fillStyle = gr; g.fillRect(sx - 140, 0, 140, H);
    g.strokeStyle = 'rgba(255,214,10,.35)'; g.beginPath(); g.moveTo(sx, 0); g.lineTo(sx, H); g.stroke();
    if (t - lastLive > 450) {
      lastLive = t;
      $$('.exp-tag .live').forEach((el, i) => { const c = CH[i]; el.textContent = (c.b + fx(i, W, t) * c.r).toFixed(c.d) + c.u; });
    }
  }

  /* ---------- CONTACT: RFID to'lqinlari va ma'lumot paketlari ---------- */
  const EM = [[.12, .8, '0,240,255'], [.88, .2, '255,214,10'], [.84, .84, '0,240,255']], HX = ['04:A3:9F', '7E:11:C2', 'B0:5D:48'];
  const bz = (a, b, u) => {
    const cx = (a[0] + b[0]) / 2 - (b[1] - a[1]) * .25, cy = (a[1] + b[1]) / 2 + (b[0] - a[0]) * .25, w = 1 - u;
    return [w * w * a[0] + 2 * w * u * cx + u * u * b[0], w * w * a[1] + 2 * w * u * cy + u * u * b[1]];
  };
  function contact(t) {
    const g = G['s-contact']; g.clearRect(0, 0, W, H);
    const P = EM.map(e => [e[0] * W, e[1] * H]);
    EM.forEach((e, i) => {
      const [x, y] = P[i];
      for (let k = 0; k < 5; k++) {
        const ph = (t / 2600 + k / 5 + i * .31) % 1;
        g.strokeStyle = `rgba(${e[2]},${(1 - ph) * .55})`; g.lineWidth = 1.5; g.beginPath(); g.arc(x, y, ph * Math.min(W, H) * .5, 0, 7); g.stroke();
      }
      g.fillStyle = `rgb(${e[2]})`; g.shadowBlur = 18; g.shadowColor = `rgb(${e[2]})`; g.fillRect(x - 6, y - 6, 12, 12);
      g.shadowBlur = 0; g.strokeStyle = `rgba(${e[2]},.6)`; g.strokeRect(x - 12, y - 12, 24, 24);
    });
    for (let i = 0; i < 3; i++) {
      const a = P[i], b = P[(i + 1) % 3];
      g.strokeStyle = 'rgba(0,240,255,.14)'; g.lineWidth = 1; g.setLineDash([5, 7]); g.beginPath();
      for (let u = 0; u <= 1.001; u += .04) { const [x, y] = bz(a, b, u); u ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.stroke(); g.setLineDash([]);
      const u0 = (t / 3400 + i / 3) % 1;
      for (let k = 0; k < 9; k++) {
        const u = u0 - k * .012; if (u < 0) continue;
        const [x, y] = bz(a, b, u); g.fillStyle = `rgba(255,214,10,${.8 - k * .09})`; g.beginPath(); g.arc(x, y, 3.2 - k * .25, 0, 7); g.fill();
      }
      const [hx, hy] = bz(a, b, u0); g.font = '11px monospace'; g.fillStyle = 'rgba(223,246,255,.8)'; g.textAlign = 'center'; g.fillText(HX[i], hx, hy - 12);
    }
  }

  /* ---------- Yagona animatsiya sikli (faqat faol sahna chiziladi) ---------- */
  const draw = { 's-skills': skills, 's-projects': projects, 's-experience': experience, 's-contact': contact };
  function loop(t) {
    const s = $('#site .scene.active'), f = s && draw[s.id];
    if (f) f(reduce ? 5000 : t);
    requestAnimationFrame(loop);
  }
  size(); addEventListener('resize', size); requestAnimationFrame(loop);

  /* ---------- Qo'shimcha element va yozuvlar ---------- */
  $('.skills-title').insertAdjacentHTML('afterend', '<div class="plc-st"><i></i>CPU holati: RUN</div>');
  $('.projects-grid').insertAdjacentHTML('beforebegin', '<h2 class="bp-title rv" style="--i:0">Loyihalarim</h2><p class="bp-sub rv" style="--i:1">Istalgan loyihani bosing: uning rasmi va videolari ochiladi.</p>');
  $$('.exp-tag').slice(0, 3).forEach(t => t.insertAdjacentHTML('beforeend', '<b class="live">--</b>'));
  const list = s => (s || '').split(',').map(x => x.trim()).filter(Boolean);
  $$('.pj-card').forEach(c => c.querySelector('.pj-btn').insertAdjacentHTML('beforebegin',
    `<div class="pj-media">${list(c.dataset.img).length} rasm, ${list(c.dataset.video).length} video</div>`));

  /* ---------- Modal: har bir loyiha o'z rasm va videolari bilan ---------- */
  const modal = $('#modal'), mm = $('#modal-media'), mi = $('#modal-img'), mv = $('#modal-video');
  const ph = document.createElement('div'); ph.className = 'ph'; mm.appendChild(ph);
  const th = document.createElement('div'); th.className = 'thumbs'; mm.after(th);

  function miss(src) {
    mi.style.display = mv.style.display = 'none'; ph.style.display = 'grid';
    ph.textContent = src ? 'Fayl topilmadi: ' + src + '. Uni sayt papkasiga joylang.' : 'Bu loyiha uchun hali rasm yoki video qo‘shilmagan.';
  }
  function show(it) {
    ph.style.display = 'none'; mi.style.display = mv.style.display = 'none'; mv.pause();
    [...th.children].forEach(b => b.classList.toggle('on', b._it === it));
    if (it.t === 'img') {
      mi.onerror = () => miss(it.src); mi.src = it.src;
      mi.style.cssText = it.rot
        ? `display:block;position:absolute;left:50%;top:50%;width:${mm.clientHeight}px;height:${mm.clientWidth}px;object-fit:contain;transform:translate(-50%,-50%) rotate(90deg)`
        : 'display:block;width:100%;height:100%;object-fit:contain';
    }
    else { mv.onerror = () => miss(it.src); mv.src = it.src; mv.style.display = 'block'; mv.load(); mv.play().catch(() => {}); }
  }
  document.addEventListener('click', e => {
    const card = e.target.closest('.pj-card'), vb = e.target.closest('#video-btn');
    if (!card && !vb) return;
    e.preventDefault(); e.stopImmediatePropagation();
    let items;
    if (vb) {
      $('#modal-title').textContent = 'Video Resume';
      $('#modal-desc').textContent = 'Saidov Abduqodirning video resumusi va faoliyati bilan tanishing.';
      items = [{ t: 'vid', src: 'resume.m4v', l: 'Video' }];
    } else {
      $('#modal-title').textContent = card.dataset.title;
      $('#modal-desc').textContent = card.dataset.desc;
      items = [...list(card.dataset.img).map((s, i) => ({ t: 'img', src: s, l: 'Rasm ' + (i + 1) })),
               ...list(card.dataset.video).map((s, i) => ({ t: 'vid', src: s, l: 'Video ' + (i + 1) }))];
    }
    th.innerHTML = '';
    if (items.length > 1) items.forEach(it => {
      const b = document.createElement('button'); b.textContent = it.l; b._it = it; b.onclick = () => show(it); th.appendChild(b);
    });
    modal.classList.add('active');
    items.length ? show(items[0]) : miss(null);
  }, true);
  addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('active')) closeModal(); });

  /* Sertifikatlar */
  const certs = [
    
    {   src: 'sertifikat1.jpg', rot: true },   // gorizontal qilib burilgan rasm
    'sertifikat.jpg',
  ];
  document.addEventListener('click', e => {
    if (!e.target.closest('#cert-btn')) return;
    e.preventDefault(); e.stopImmediatePropagation();
    $('#modal-title').textContent = 'Sertifikatlar';
    $('#modal-desc').textContent = 'Malaka oshirish va o‘qish davomida olingan sertifikatlarim.';
    const items = certs.map((s, i) => ({ t: 'img', src: s.src || s, rot: !!s.rot, l: 'Sertifikat ' + (i + 1) }));
    th.innerHTML = '';
    if (items.length > 1) items.forEach(it => {
      const b = document.createElement('button'); b.textContent = it.l; b._it = it; b.onclick = () => show(it); th.appendChild(b);
    });
    modal.classList.add('active');
    items.length ? show(items[0]) : miss(null);
  }, true);
})();
