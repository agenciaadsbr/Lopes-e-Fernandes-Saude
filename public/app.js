(function () {
  var doc = document.documentElement;
  doc.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.getElementById('ano').textContent = new Date().getFullYear();


  var bar = document.getElementById('topo');
  var floatCta = document.getElementById('float-cta');
  var contato = document.getElementById('contato');
  function onScroll() {
    var y = window.scrollY;
    bar.classList.toggle('is-scrolled', y > 12);
    var cTop = contato.getBoundingClientRect().top;
    floatCta.classList.toggle('is-on', y > 600 && cTop > window.innerHeight * 0.6);
  }


  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    menu.classList.toggle('is-open', open);
  }
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });


  var items = [].slice.call(document.querySelectorAll('.reveal'));
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); en.target.classList.remove('pre'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el, i) {
      if (el.getBoundingClientRect().top > window.innerHeight * 0.95) {
        el.classList.add('pre');
        var sib = el.parentElement ? [].indexOf.call(el.parentElement.children, el) : 0;
        el.style.transitionDelay = Math.min(sib, 6) * 60 + 'ms';
        io.observe(el);
      }
    });
  }
  requestAnimationFrame(function () { doc.classList.add('is-ready'); });


  var par = [].slice.call(document.querySelectorAll('[data-parallax]'));
  var tl = document.querySelector('.timeline');
  var tlItems = tl ? [].slice.call(tl.querySelectorAll('li')) : [];
  var ticking = false;
  function frame() {
    ticking = false;
    var vh = window.innerHeight;
    if (!reduce) {
      par.forEach(function (box) {
        var r = box.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var k = parseFloat(box.getAttribute('data-parallax')) || 0.06;
        var center = r.top + r.height / 2 - vh / 2;
        var img = box.querySelector('img');
        if (img) img.style.transform = 'translate3d(0,' + (-center * k - r.height * 0.07).toFixed(1) + 'px,0)';
      });
    }
    if (tl) {
      var tr = tl.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, (vh * 0.6 - tr.top) / tr.height));
      tl.style.setProperty('--prog', p.toFixed(3));
      tlItems.forEach(function (li) { li.classList.toggle('is-on', li.getBoundingClientRect().top < vh * 0.6); });
    }
    onScroll();
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', req);
  frame();


  var qas = [].slice.call(document.querySelectorAll('.qa'));
  qas.forEach(function (d) {
    d.addEventListener('toggle', function () { if (d.open) qas.forEach(function (o) { if (o !== d) o.open = false; }); });
  });


  var whats = document.getElementById('f-whats');
  whats.addEventListener('input', function () {
    var d = whats.value.replace(/\D/g, '').slice(0, 11);
    var out = d;
    if (d.length > 2) out = '(' + d.slice(0, 2) + ') ' + d.slice(2);
    if (d.length > 7) out = '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length - 4) + '-' + d.slice(-4);
    whats.value = out;
  });


  var form = document.getElementById('lead-form');
  var btn = document.getElementById('f-submit');
  var status = document.getElementById('f-status');
  var rules = {
    nome: { el: 'f-nome', err: 'e-nome', test: function (v) { return v.trim().length >= 3; }, msg: 'Informe seu nome.' },
    whatsapp: { el: 'f-whats', err: 'e-whats', test: function (v) { var n = v.replace(/\D/g, ''); return n.length === 10 || n.length === 11; }, msg: 'Informe um WhatsApp válido com DDD.' }
  };
  function check(key) {
    var r = rules[key], el = document.getElementById(r.el), ok = r.test(el.value);
    el.closest('.field').classList.toggle('is-invalid', !ok);
    el.setAttribute('aria-invalid', String(!ok));
    document.getElementById(r.err).textContent = ok ? '' : r.msg;
    return ok;
  }
  Object.keys(rules).forEach(function (k) {
    var el = document.getElementById(rules[k].el);
    el.addEventListener('blur', function () { if (el.value) check(k); });
    el.addEventListener('input', function () { if (el.closest('.field').classList.contains('is-invalid')) check(k); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.className = 'form__status'; status.textContent = '';
    var allOk = true, first = null;
    Object.keys(rules).forEach(function (k) { if (!check(k)) { allOk = false; if (!first) first = document.getElementById(rules[k].el); } });
    if (!allOk) { first.focus(); return; }

    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = typeof v === 'string' ? v.trim() : v; });
    data.consentimento = true;
    data.origem = location.href;
    data.utm = location.search.replace(/^\?/, '');

    btn.classList.add('is-loading'); btn.querySelector('.btn__label').textContent = 'Enviando…';
    var done = false;
    var ctrl = new AbortController(); var t = setTimeout(function () { ctrl.abort(); }, 15000);
    fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data), signal: ctrl.signal })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || !j.ok) throw new Error(j.error || 'Falha no envio'); return j; }); })
      .then(function () {
        form.reset();
        status.className = 'form__status ok';
        status.textContent = 'Recebemos suas informações. Redirecionando…';
        if (window.fbq) window.fbq('track', 'Lead');
        if (window.gtag) window.gtag('event', 'generate_lead');
        done = true;
        setTimeout(function () { window.location.href = '/redirect/'; }, 300);
      })
      .catch(function (err) {
        status.className = 'form__status err';
        status.textContent = err.name === 'AbortError'
          ? 'O envio demorou mais que o esperado. Verifique sua conexão e tente novamente.'
          : 'Não foi possível enviar agora. Confira sua conexão e tente novamente em instantes.';
      })
      .finally(function () { clearTimeout(t); if (done) return; btn.classList.remove('is-loading'); btn.querySelector('.btn__label').textContent = 'Quero falar com o escritório'; });
  });
})();
