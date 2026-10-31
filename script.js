'use strict';

/* Prices and areas mirror the Dropping app's pilot tariff. Change them here when the tariff changes. */
const TARIFF = {
  base: { small: 20, medium: 30, large: 45 },
  perRing: 3,
  handling: 5,
  minimum: 20,
  cancelFee: 5,
  cutoffHour: 15,
  phone: '030 000 0000',
  email: 'hello@dropping.example', // placeholder: replace with the real address
};
const SIZES = {
  small: ['Small', 'Documents, phone, jewellery box (up to about 1 kg)'],
  medium: ['Medium', 'Shoebox, groceries, clothing (up to about 5 kg)'],
  large: ['Large', 'Backpack or carton (up to about 10 kg)'],
};
const ZONES = [
  { id: 'osu', name: 'Osu', ring: 1, active: true },
  { id: 'labone', name: 'Labone', ring: 1, active: true },
  { id: 'cantonments', name: 'Cantonments', ring: 1, active: true },
  { id: 'adabraka', name: 'Adabraka', ring: 2, active: true },
  { id: 'airport', name: 'Airport Residential', ring: 2, active: true },
  { id: 'eastlegon', name: 'East Legon', ring: 3, active: true },
  { id: 'madina', name: 'Madina', ring: 4, active: true },
  { id: 'tema', name: 'Tema', ring: 6, active: false },
];

const $ = (id) => document.getElementById(id);
const money = (n) => `GH₵ ${Number.isInteger(n) ? n : n.toFixed(2)}`;
const text = (el, s) => { if (el) el.textContent = s; };

/** Same rules as the app: base price by size, plus distance by ring, plus handling, with a minimum. */
function price(fromId, toId, band, handling) {
  const a = ZONES.find((z) => z.id === fromId);
  const b = ZONES.find((z) => z.id === toId);
  if (!a || !b || !a.active || !b.active) return { error: 'We do not deliver to or from that area yet.' };
  const lines = [[`Delivery · ${SIZES[band][0]} parcel`, TARIFF.base[band]]];
  const distance = Math.abs(a.ring - b.ring) * TARIFF.perRing;
  if (distance) lines.push([`Distance · ${a.name} to ${b.name}`, distance]);
  if (handling) lines.push(['Fragile or special handling', TARIFF.handling]);
  let total = lines.reduce((s, l) => s + l[1], 0);
  if (total < TARIFF.minimum) {
    lines.push(['Minimum fee adjustment', TARIFF.minimum - total]);
    total = TARIFF.minimum;
  }
  return { lines, total };
}

/* ---------- estimator ---------- */
function initCalculator() {
  const from = $('from');
  const to = $('to');
  const active = ZONES.filter((z) => z.active);
  const opts = (sel) => active.map((z) => `<option value="${z.id}" ${z.id === sel ? 'selected' : ''}>${z.name}</option>`).join('');
  from.innerHTML = opts('osu');
  to.innerHTML = opts('eastlegon');
  $('sizes').innerHTML = Object.entries(SIZES)
    .map(([k, [label, hint]], i) => `<label class="size"><input type="radio" name="band" value="${k}" ${i === 0 ? 'checked' : ''} /><span><b>${label}</b><small>${hint}</small></span><span>from ${money(TARIFF.base[k])}</span></label>`)
    .join('');
  text($('fragile-fee'), `(+${money(TARIFF.handling)})`);

  const update = () => {
    const band = document.querySelector('input[name=band]:checked').value;
    const r = price(from.value, to.value, band, $('fragile').checked);
    const list = $('lines');
    if (r.error) {
      text($('total'), '—');
      list.innerHTML = `<li>${r.error}</li>`;
      return;
    }
    text($('total'), money(r.total));
    list.innerHTML = r.lines.map(([l, a]) => `<li><span></span><span>${money(a)}</span></li>`).join('');
    [...list.children].forEach((li, i) => text(li.firstChild, r.lines[i][0]));
  };
  $('calc').addEventListener('input', update);
  $('calc').addEventListener('submit', (e) => e.preventDefault());
  update();
}

/* ---------- coverage search ---------- */
function initCoverage() {
  const list = $('areas');
  const q = $('area-q');
  const draw = () => {
    const term = q.value.trim().toLowerCase();
    list.innerHTML = ZONES.map((z) => `<li class="${z.active ? '' : 'off'} ${term && z.name.toLowerCase().includes(term) ? 'hit' : ''}">${z.name}${z.active ? '' : ' (not yet served)'}</li>`).join('');
    if (!term) return text($('area-msg'), '');
    const m = ZONES.filter((z) => z.name.toLowerCase().includes(term));
    text($('area-msg'), !m.length ? 'We do not list that area yet. Tell us you need it and we will note it.' : m.every((z) => !z.active) ? 'We do not deliver there yet.' : 'Yes, we deliver there during the pilot.');
  };
  q.addEventListener('input', draw);
  draw();
}

/* ---------- static values from the tariff ---------- */
function fillTariff() {
  document.querySelectorAll('[data-cutoff]').forEach((e) => text(e, `${String(TARIFF.cutoffHour).padStart(2, '0')}:00`));
  document.querySelectorAll('[data-cancel-fee]').forEach((e) => text(e, money(TARIFF.cancelFee)));
  document.querySelectorAll('[data-phone]').forEach((e) => text(e, TARIFF.phone));
  const ex = price('osu', 'eastlegon', 'medium', false);
  text(document.querySelector('[data-example]'), money(ex.total));
  $('rates').innerHTML = Object.entries(SIZES).map(([k, [label, hint]]) => `<tr><th scope="row">${label}<small>${hint}</small></th><td>${money(TARIFF.base[k])}</td></tr>`).join('');
  text($('rate-note'), `Distance adds ${money(TARIFF.perRing)} for each step between areas, special handling adds ${money(TARIFF.handling)}, and the minimum is ${money(TARIFF.minimum)}.`);
  document.querySelectorAll('[data-from-price]').forEach((e) => text(e, money(Math.min(...Object.values(TARIFF.base)))));
  text($('year'), new Date().getFullYear());
}

/* ---------- mobile menu ---------- */
function initMenu() {
  const btn = $('menu-btn');
  const nav = $('nav');
  const set = (open) => {
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
  };
  btn.addEventListener('click', () => set(!nav.classList.contains('open')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) { set(false); btn.focus(); }
  });
}

/* ---------- contact form: opens the visitor's email app; nothing is stored or sent by this site ---------- */
function initContact() {
  const form = $('contact-form');
  const err = $('form-error');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const biz = $('biz').value.trim();
    const person = $('person').value.trim();
    const phone = $('phone').value.trim();
    const problems = [];
    if (!biz) problems.push('Enter your business name.');
    if (!person) problems.push('Enter the contact person.');
    if (!/^(\+?233|0)\d{9}$/.test(phone.replace(/[\s-]/g, ''))) problems.push('Enter a phone number like 024 000 0000.');
    if (!$('adult').checked) problems.push('Confirm that you are 18 or over.');
    err.hidden = problems.length === 0;
    err.textContent = problems.join(' ');
    if (problems.length) return;
    const interests = [...document.querySelectorAll('input[name=interest]:checked')].map((i) => i.value);
    const courier = $('who-courier').checked;
    const body = courier ? `Courier application\nName: ${person}\nVehicle or area notes: ${biz}\nPhone: ${phone}\n\nI would like to apply to deliver with Dropping. Please tell me how verification works.` : `Business: ${biz}\nContact person: ${person}\nPhone: ${phone}\n${interests.length ? `Also interested in: ${interests.join(', ')}\n` : ''}\nI would like to register my business with Dropping.`;
    window.location.href = `mailto:${TARIFF.email}?subject=${encodeURIComponent(courier ? 'Courier application' : 'Register my business')}&body=${encodeURIComponent(body)}`;
  });
}

/* Business or courier: relabels the first two fields. */
function initWho() {
  const apply = () => {
    const courier = $('who-courier').checked;
    text($('biz-label'), courier ? 'Vehicle (motorbike, bicycle, car or van) and areas' : 'Business name');
    text($('person-label'), courier ? 'Your full name' : 'Contact person');
    $('biz').autocomplete = courier ? 'off' : 'organization';
    document.querySelectorAll('.interests-biz').forEach((e) => { e.hidden = courier; });
  };
  document.querySelectorAll('input[name=who]').forEach((r) => r.addEventListener('change', apply));
  document.querySelectorAll('[data-who]').forEach((a) => a.addEventListener('click', () => { $(`who-${a.dataset.who}`).checked = true; apply(); }));
  apply();
}

/* "Tell us you are interested" on Rides / Cargo ticks the matching box in the contact form (the visitor can untick it). */
function initInterest() {
  document.querySelectorAll('[data-interest]').forEach((a) => a.addEventListener('click', () => {
    const box = $(`int-${a.dataset.interest}`);
    if (box) box.checked = true;
  }));
}

if (document.getElementById('calc')) {
  initCalculator();
  initCoverage();
  fillTariff();
  initMenu();
  initContact();
  initInterest();
  initWho();
}
