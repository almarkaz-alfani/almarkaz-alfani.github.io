(function () {
  'use strict';
  var WA_NUMBER = '966575095422';
  var doc = document.documentElement;
  doc.classList.add('js');
 
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function waLink(msg) { return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg); }
 
  /* WhatsApp links */
  $$('[data-wa]').forEach(function (a) { a.href = waLink(a.getAttribute('data-wa')); });
 
  /* Year */
  var y = $('#year'); if (y) y.textContent = new Date().getFullYear();
 
  /* Header scroll + progress + active link */
  var header = $('#header'), bar = $('#progress');
  var sections = $$('main section[id]');
  var links = $$('.nav a[href^="#"]');
  var ticking = false;
  function onScroll() {
    var st = window.pageYOffset || doc.scrollTop;
    var h = doc.scrollHeight - window.innerHeight;
    if (header) header.classList.toggle('scrolled', st > 10);
    if (bar) bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(st / h, 1) : 0) + ')';
    var cur = '';
    sections.forEach(function (s) { if (s.offsetTop - 140 <= st) cur = s.id; });
    links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + cur); });
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();
 
  /* Mobile menu */
  var burger = $('#burger'), nav = $('#nav'), scrim = $('#scrim'), bIc = $('#burger-ic');
  function setMenu(open) {
    nav.classList.toggle('open', open);
    scrim.classList.toggle('show', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
    bIc.innerHTML = '<use href="#' + (open ? 'i-x' : 'i-menu') + '"/>';
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (burger) {
    burger.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
    scrim.addEventListener('click', function () { setMenu(false); });
    $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    window.addEventListener('resize', function () { if (window.innerWidth > 960) setMenu(false); });
  }
 
  /* Reveal on scroll */
  var rev = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    rev.forEach(function (el) { io.observe(el); });
  } else {
    rev.forEach(function (el) { el.classList.add('in'); });
  }
 
  /* FAQ accordion */
  $$('.faq__q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq__item');
      var open = btn.getAttribute('aria-expanded') === 'true';
      $$('.faq__q').forEach(function (b) {
        b.setAttribute('aria-expanded', 'false');
        b.closest('.faq__item').classList.remove('open');
      });
      if (!open) { btn.setAttribute('aria-expanded', 'true'); item.classList.add('open'); }
    });
  });
 
  /* Button ripple */
  $$('.btn').forEach(function (b) {
    b.addEventListener('pointerdown', function (e) {
      var r = b.getBoundingClientRect(), s = Math.max(r.width, r.height);
      var sp = document.createElement('span');
      sp.className = 'ripple';
      sp.style.width = sp.style.height = s + 'px';
      sp.style.left = (e.clientX - r.left - s / 2) + 'px';
      sp.style.top = (e.clientY - r.top - s / 2) + 'px';
      b.appendChild(sp);
      setTimeout(function () { sp.remove(); }, 600);
    });
  });
 
  /* Card tilt (mouse devices only) */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (fine && !reduce) {
    $$('.tilt').forEach(function (c) {
      c.addEventListener('mousemove', function (e) {
        var r = c.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var yy = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = 'perspective(800px) rotateY(' + (x * 6) + 'deg) rotateX(' + (-yy * 6) + 'deg) translateY(-4px)';
      });
      c.addEventListener('mouseleave', function () { c.style.transform = ''; });
    });
  }
 
  /* Order form */
  var form = $('#order-form');
  if (form) {
    var fields = {
      name: { el: $('#f-name'), err: $('#e-name'), test: function (v) { return v.trim().length >= 2; }, msg: 'اكتب اسمك (حرفان على الأقل).' },
      phone: { el: $('#f-phone'), err: $('#e-phone'), test: function (v) {
        var d = v.replace(/[\s\-+()]/g, '').replace(/[٠-٩]/g, function (c) { return c.charCodeAt(0) - 1632; });
        return /^(05\d{8}|5\d{8}|9665\d{8}|009665\d{8})$/.test(d);
      }, msg: 'اكتب رقم جوال سعودي صحيح، مثل 05xxxxxxxx.' },
      district: { el: $('#f-district'), err: $('#e-district'), test: function (v) { return v.trim().length >= 2; }, msg: 'اكتب اسم الحي.' },
      type: { el: $('#f-type'), err: $('#e-type'), test: function (v) { return v !== ''; }, msg: 'اختر نوع الفرن.' },
      issue: { el: $('#f-issue'), err: $('#e-issue'), test: function (v) { return v.trim().length >= 5; }, msg: 'اشرح المشكلة باختصار (5 أحرف على الأقل).' }
    };
    function check(k) {
      var f = fields[k], ok = f.test(f.el.value);
      f.el.closest('.field').classList.toggle('invalid', !ok);
      f.el.setAttribute('aria-invalid', ok ? 'false' : 'true');
      f.err.textContent = ok ? '' : f.msg;
      return ok;
    }
    Object.keys(fields).forEach(function (k) {
      fields[k].el.addEventListener('blur', function () { check(k); });
      fields[k].el.addEventListener('input', function () { if (fields[k].el.closest('.field').classList.contains('invalid')) check(k); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      Object.keys(fields).forEach(function (k) { if (!check(k) && !firstBad) firstBad = fields[k].el; });
      var ok = $('#form-ok');
      if (firstBad) { firstBad.focus(); ok.textContent = ''; return; }
      var msg = 'مرحباً، أرغب في طلب صيانة فرن:\n' +
        'الاسم: ' + fields.name.el.value.trim() + '\n' +
        'الجوال: ' + fields.phone.el.value.trim() + '\n' +
        'الحي: ' + fields.district.el.value.trim() + '\n' +
        'نوع الفرن: ' + fields.type.el.value + '\n' +
        'المشكلة: ' + fields.issue.el.value.trim();
      ok.textContent = 'تم تجهيز رسالتك. اضغط إرسال داخل واتساب لإتمام الطلب.';
      window.open(waLink(msg), '_blank', 'noopener');
    });
  }
})();
 
