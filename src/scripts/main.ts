/**
 * Comportements de page. Tout est amélioration progressive : sans JavaScript,
 * le contenu est complet et lisible, les chiffres affichent leur valeur exacte.
 */

const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(pointer: fine)').matches;

/* --- Thème (sombre par défaut) ------------------------------------------- */
function initTheme(): void {
  const btn = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
  if (!btn) return;
  const sync = () => {
    const light = root.dataset.theme === 'light';
    const label = light ? btn.dataset.labelDark : btn.dataset.labelLight;
    btn.setAttribute('aria-label', label ?? '');
    btn.setAttribute('title', label ?? '');
    btn.setAttribute('aria-pressed', String(!light));
  };
  btn.hidden = false;
  sync();
  btn.addEventListener('click', () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    root.dataset.theme = next;
    try { localStorage.setItem('sb-theme', next); } catch { /* stockage indisponible */ }
    sync();
  });
}

/* --- Apparition au défilement -------------------------------------------- */
function initReveal(): void {
  const els = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (!els.length) return;
  if (reduced || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  els.forEach((el) => io.observe(el));
}

/* --- Halo des cartes qui suit le pointeur -------------------------------- */
function initSpotlight(): void {
  if (!finePointer || reduced) return;
  document.querySelectorAll<HTMLElement>('.card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
}

/* --- Compteurs ------------------------------------------------------------
   La valeur finale affichée est toujours le texte d'origine, exact : on
   n'anime que le trajet, jamais la destination. */
function initCounters(): void {
  const els = document.querySelectorAll<HTMLElement>('[data-count]');
  if (!els.length || reduced || !('IntersectionObserver' in window)) return;
  const run = (el: HTMLElement) => {
    const final = el.textContent ?? '';
    const target = Number(el.dataset.count);
    const dec = Number(el.dataset.decimals ?? 0);
    const lang = el.dataset.lang ?? 'fr';
    const fmt = new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'en-GB', {
      minimumFractionDigits: dec, maximumFractionDigits: dec,
    });
    const pre = el.dataset.prefix ?? '';
    const suf = el.dataset.suffix ?? '';
    const t0 = performance.now();
    const dur = 1300;
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      el.textContent = pre + fmt.format(target * eased) + suf;
      if (k < 1) requestAnimationFrame(step);
      else el.textContent = final;
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) { run(e.target as HTMLElement); io.unobserve(e.target); }
    }
  }, { threshold: 0.6 });
  els.forEach((el) => io.observe(el));
}

/* --- Toast & copie de l'adresse ------------------------------------------ */
function toast(msg: string): void {
  const el = document.querySelector<HTMLElement>('[data-toast]');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('is-on');
  window.setTimeout(() => el.classList.remove('is-on'), 2200);
}

function initCopy(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const value = btn.dataset.copy ?? '';
      try {
        await navigator.clipboard.writeText(value);
      } catch {
        const ta = Object.assign(document.createElement('textarea'), { value });
        document.body.append(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      btn.dataset.done = '';
      window.setTimeout(() => delete btn.dataset.done, 2200);
      toast(btn.dataset.msg ?? value);
    });
  });
}

/* --- Modales natives ----------------------------------------------------- */
function initDialogs(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-dialog-open]').forEach((btn) => {
    const dlg = document.getElementById(btn.dataset.dialogOpen ?? '') as HTMLDialogElement | null;
    if (!dlg) return;
    btn.addEventListener('click', () => dlg.showModal());
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
    dlg.querySelectorAll('[data-dialog-close]').forEach((c) => c.addEventListener('click', () => dlg.close()));
  });
}

/* --- Graphiques lourds, chargés à l'approche ----------------------------- */
function initLazyCharts(): void {
  const slots = [...document.querySelectorAll<HTMLElement>('.ch-slot[data-src]')];
  if (!slots.length) return;
  const load = async (slot: HTMLElement) => {
    const src = slot.dataset.src;
    if (!src) return;
    delete slot.dataset.src;
    try {
      const res = await fetch(src);
      if (!res.ok) throw new Error(String(res.status));
      // SVG statique du site, généré au build : pas de contenu tiers.
      slot.innerHTML = await res.text();
      slot.removeAttribute('role');
      slot.removeAttribute('aria-label');
      slot.removeAttribute('aria-busy');
      slot.classList.add('is-loaded');
      initCharts(slot);
    } catch {
      slot.dataset.src = src;
    }
  };
  if (!('IntersectionObserver' in window)) { slots.forEach(load); return; }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      io.unobserve(e.target);
      load(e.target as HTMLElement);
    }
  }, { rootMargin: '900px 0px' });
  slots.forEach((s) => io.observe(s));
}

/* --- Photos agrandissables ---------------------------------------------- */
function initLightbox(): void {
  const imgs = document.querySelectorAll<HTMLImageElement>('.cs .figure img');
  if (!imgs.length || !('showModal' in HTMLDialogElement.prototype)) return;
  const fr = document.documentElement.lang === 'fr';
  const dlg = document.createElement('dialog');
  dlg.className = 'lightbox';
  dlg.setAttribute('aria-label', fr ? 'Photo agrandie' : 'Enlarged photo');
  dlg.innerHTML = `<button type="button" aria-label="${fr ? 'Fermer' : 'Close'}">×</button><img alt=""><p></p>`;
  document.body.append(dlg);
  const big = dlg.querySelector('img') as HTMLImageElement;
  const cap = dlg.querySelector('p') as HTMLParagraphElement;
  dlg.querySelector('button')?.addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  imgs.forEach((img) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'zoom';
    btn.setAttribute('aria-label', `${fr ? 'Agrandir' : 'Enlarge'} : ${img.alt}`);
    img.replaceWith(btn);
    btn.append(img);
    btn.addEventListener('click', () => {
      big.src = img.currentSrc || img.src;
      big.alt = img.alt;
      // Légende reprise de la figure : contenu statique du site, pas de saisie utilisateur.
      cap.innerHTML = img.closest('figure')?.querySelector('figcaption')?.innerHTML ?? '';
      dlg.showModal();
    });
  });
}

/* --- Menu mobile : se referme dès qu'on choisit une section --------------- */
function initMenu(): void {
  const menu = document.getElementById('menu-mobile');
  if (!menu || !('hidePopover' in menu)) return;
  menu.querySelectorAll('[data-menu-close]').forEach((a) => a.addEventListener('click', () => menu.hidePopover()));
}

/* --- Section courante dans la navigation --------------------------------- */
function initActiveNav(): void {
  const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-nav] a[href^="#"]')];
  if (!links.length || !('IntersectionObserver' in window)) return;
  const byId = new Map(links.map((a) => [a.hash.slice(1), a]));
  const visible = new Set<string>();
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) visible.add(e.target.id); else visible.delete(e.target.id);
    }
    const first = [...byId.keys()].find((id) => visible.has(id));
    links.forEach((a) => a.toggleAttribute('aria-current', a.hash === `#${first}`));
  }, { rootMargin: '-35% 0px -55% 0px' });
  byId.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
}

/* --- Survol des graphiques ------------------------------------------------
   Chaque panneau porte ses métadonnées d'échelle (data-*). On lit les sommets
   du tracé déjà dessiné et on inverse l'échelle : aucune donnée dupliquée. */
function initCharts(root: ParentNode = document): void {
  const NS = 'http://www.w3.org/2000/svg';
  root.querySelectorAll<SVGGElement>('.ch-hover').forEach((g) => {
    const svg = g.ownerSVGElement;
    const host = (svg?.closest('.chart, [data-chart]') as HTMLElement | null) ?? svg?.parentElement;
    const line = g.querySelector<SVGPathElement>('path.ch-line') ?? g.querySelector<SVGPathElement>('path');
    const hit = g.querySelector<SVGRectElement>('.ch-hit');
    if (!svg || !host || !line || !hit) return;

    const d = g.dataset;
    const x0 = +d.x0!, y0 = +d.y0!, w = +d.w!, h = +d.h!;
    const t0 = +d.t0!, t1 = +d.t1!, v0 = +d.v0!, v1 = +d.v1!;
    const dec = +(d.dec ?? 1), unit = d.unit ?? '', lang = d.lang === 'en' ? 'en-GB' : 'fr-FR';
    const nums = (line.getAttribute('d') ?? '').match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
    const pts: [number, number][] = [];
    for (let i = 0; i + 1 < nums.length; i += 2) pts.push([nums[i], nums[i + 1]]);
    if (!pts.length) return;

    const short = t1 - t0 < 40 * 86400;
    const dfmt = new Intl.DateTimeFormat(lang, short
      ? { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }
      : { day: 'numeric', month: 'short', year: 'numeric' });
    const nfmt = new Intl.NumberFormat(lang, { minimumFractionDigits: dec, maximumFractionDigits: dec });

    const cross = document.createElementNS(NS, 'line');
    cross.setAttribute('class', 'ch-cross');
    cross.setAttribute('y1', String(y0));
    cross.setAttribute('y2', String(y0 + h));
    const dot = document.createElementNS(NS, 'circle');
    dot.setAttribute('class', 'ch-cursor');
    dot.setAttribute('r', '4.5');
    const tip = document.createElement('div');
    tip.className = 'ch-tip';
    tip.setAttribute('role', 'status');
    for (const el of [cross, dot]) { el.style.display = 'none'; g.insertBefore(el, hit); }
    tip.hidden = true;
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    host.append(tip);

    const nearest = (x: number): [number, number] => {
      let lo = 0, hi = pts.length - 1;
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        if (pts[mid][0] < x) lo = mid; else hi = mid;
      }
      return Math.abs(pts[lo][0] - x) <= Math.abs(pts[hi][0] - x) ? pts[lo] : pts[hi];
    };

    const move = (e: PointerEvent) => {
      const ctm = svg.getScreenCTM();
      if (!ctm) return;
      const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
      const [vx, vy] = nearest(Math.max(x0, Math.min(x0 + w, p.x)));
      const t = t0 + ((vx - x0) / w) * (t1 - t0);
      const v = v0 + ((y0 + h - vy) / h) * (v1 - v0);
      cross.setAttribute('x1', String(vx));
      cross.setAttribute('x2', String(vx));
      dot.setAttribute('cx', String(vx));
      dot.setAttribute('cy', String(vy));
      cross.style.display = dot.style.display = '';
      const s = new DOMPoint(vx, vy).matrixTransform(ctm);
      const hr = host.getBoundingClientRect();
      tip.innerHTML = `<b>${nfmt.format(v)}${unit ? ' ' + unit : ''}</b>${dfmt.format(new Date(t * 1000))}`;
      tip.hidden = false;
      const left = Math.max(60, Math.min(hr.width - 60, s.x - hr.left));
      tip.style.left = `${left}px`;
      tip.style.top = `${s.y - hr.top}px`;
    };
    const leave = () => { cross.style.display = dot.style.display = 'none'; tip.hidden = true; };
    hit.addEventListener('pointermove', move);
    hit.addEventListener('pointerdown', move);
    hit.addEventListener('pointerleave', leave);
  });
}

initTheme();
initReveal();
initSpotlight();
initCounters();
initCopy();
initDialogs();
initLightbox();
initMenu();
initActiveNav();
initCharts();
initLazyCharts();
