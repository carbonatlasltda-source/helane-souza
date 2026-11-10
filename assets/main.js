(function () {
  'use strict';

  var ENDPOINT = 'https://script.google.com/macros/s/AKfycbz8KbJ2rbEHPS7bXQxizaDp8JOrv7wNzT36Qu6yK5_MG8Tg4BeABbbiqm_Mx2HNDCLlZg/exec';
  var REDIRECT = 'obrigado.html';
  var LOCAL = window.HS_LOCAL;
  var CALMO = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }

  function track(evento, dados) {
    (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: evento }, dados || {}));
    if (!LOCAL && window.fbq) window.fbq('trackCustom', evento, dados || {});
  }

  /* Títulos: revelação por palavra, sem alterar o texto lido por leitores de tela */
  function dividir(no, cont) {
    Array.prototype.slice.call(no.childNodes).forEach(function (filho) {
      if (filho.nodeType === 3) {
        var frag = document.createDocumentFragment();
        filho.textContent.split(/(\s+)/).forEach(function (parte) {
          if (!parte) return;
          if (/^\s+$/.test(parte)) { frag.appendChild(document.createTextNode(' ')); return; }
          var w = document.createElement('span');
          w.className = 'w';
          var dentro = document.createElement('span');
          dentro.textContent = parte;
          dentro.style.setProperty('--i', cont.n++);
          w.appendChild(dentro);
          frag.appendChild(w);
        });
        no.replaceChild(frag, filho);
      } else if (filho.nodeType === 1) {
        dividir(filho, cont);
      }
    });
  }
  $$('.dividir').forEach(function (t) { dividir(t, { n: 0 }); });

  /* Revelações ao entrar na tela */
  var alvos = $$('[data-reveal], .dividir');
  if ('IntersectionObserver' in window && !CALMO) {
    var io = new IntersectionObserver(function (itens) {
      itens.forEach(function (i) {
        if (i.isIntersecting) { i.target.classList.add('in'); io.unobserve(i.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    alvos.forEach(function (a) { io.observe(a); });
  } else {
    alvos.forEach(function (a) { a.classList.add('in'); });
  }

  /* Animações contínuas ficam paradas fora da tela */
  $$('.hero, .metodo-doc').forEach(function (el) {
    new IntersectionObserver(function (e) {
      el.classList.toggle('fora-da-tela', !e[0].isIntersecting);
    }).observe(el);
  });

  /* Método: o scroll conduz a leitura do documento */
  (function () {
    var passos = $$('.passo');
    var marcas = $$('#doc-folha .doc-marca');
    function ativar(n) {
      passos.forEach(function (p, i) {
        p.classList.toggle('ativo', i === n);
        p.classList.toggle('visto', i < n);
      });
      marcas.forEach(function (m, i) { m.classList.toggle('ativa', i === n); });
    }
    if (CALMO) { passos.forEach(function (p) { p.classList.add('ativo'); }); return; }
    var io = new IntersectionObserver(function (itens) {
      itens.forEach(function (i) {
        if (i.isIntersecting) ativar(Number(i.target.getAttribute('data-passo')));
      });
    }, { rootMargin: '-48% 0px -48% 0px' });
    passos.forEach(function (p) { io.observe(p); });
  })();

  /* Scroll: barra de leitura, trilho, CTA fixo e profundidade */
  (function () {
    var barra = $('#progresso-barra');
    var trilho = $('[data-trilho]');
    var fio = $('.trilho-fio span');
    var fixo = $('#fixo');
    var fixoLink = $('a', fixo);
    var ancora = $('#ancora-sticky');
    var form = $('#formulario');
    var marcos = [25, 50, 75, 100];
    var pendente = false;

    function atualizar() {
      pendente = false;
      var vh = window.innerHeight;
      var total = document.documentElement.scrollHeight - vh;
      var p = total > 0 ? Math.min(1, window.scrollY / total) : 0;
      barra.style.transform = 'scaleX(' + p + ')';

      if (!CALMO) {
        var r = trilho.getBoundingClientRect();
        var q = Math.max(0, Math.min(1, (vh * 0.7 - r.top) / r.height));
        fio.style.transform = 'scaleY(' + q + ')';
      }

      var mostrar = ancora.getBoundingClientRect().bottom < 0 && form.getBoundingClientRect().top > vh * 0.9;
      fixo.classList.toggle('on', mostrar);
      fixo.setAttribute('aria-hidden', String(!mostrar));
      fixoLink.tabIndex = mostrar ? 0 : -1;

      while (marcos.length && p * 100 >= marcos[0] - 0.5) {
        track('ScrollDepth', { percentual: marcos.shift() });
      }
    }
    function pedir() {
      if (!pendente) { pendente = true; requestAnimationFrame(atualizar); }
    }
    window.addEventListener('scroll', pedir, { passive: true });
    window.addEventListener('resize', pedir);
    atualizar();
  })();

  /* Contadores com os números reais do processo */
  (function () {
    var els = $$('[data-contar]');
    if (CALMO) return;
    var io = new IntersectionObserver(function (itens) {
      itens.forEach(function (i) {
        if (!i.isIntersecting) return;
        io.unobserve(i.target);
        var fim = Number(i.target.getAttribute('data-contar'));
        var ini = performance.now();
        (function quadro(t) {
          var k = Math.min(1, (t - ini) / 1100);
          i.target.textContent = Math.round(fim * (1 - Math.pow(1 - k, 3)));
          if (k < 1) requestAnimationFrame(quadro);
        })(ini);
      });
    }, { threshold: 0.4 });
    els.forEach(function (e) { io.observe(e); });
  })();

  /* CTA magnético: apenas com mouse */
  if (!CALMO && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('a.cta').forEach(function (c) {
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.08;
        var y = (e.clientY - r.top - r.height / 2) * 0.16;
        c.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      });
      c.addEventListener('pointerleave', function () { c.style.transform = ''; });
    });
  }

  $$('[data-cta]').forEach(function (c) {
    c.addEventListener('click', function () { track('CTAClick', { posicao: c.getAttribute('data-cta') }); });
  });

  /* Autosseleção: adapta os CTAs, o título do formulário e já marca o perfil */
  $$('[data-publico]').forEach(function (b) {
    b.addEventListener('click', function () {
      var p = b.getAttribute('data-publico');
      $$('[data-publico]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      $$('[data-publico-card]').forEach(function (card) {
        var igual = card.getAttribute('data-publico-card') === p;
        card.classList.toggle('escolhido', igual);
        card.classList.toggle('apagado', !igual);
      });
      $$('[data-cta-texto]').forEach(function (t) {
        t.textContent = p === 'integrador' ? 'Quero a leitura do TOI do meu cliente' : 'Quero a leitura do meu TOI';
      });
      $('#form-titulo').textContent = p === 'integrador'
        ? 'Me manda o caso do seu cliente. Leitura do TOI, sem custo.'
        : 'Análise do seu caso. Leitura do TOI, sem custo.';
      var radio = $('input[name=perfil][value="' + (p === 'integrador' ? 'Integrador' : 'Dono da usina') + '"]');
      radio.checked = true;
      radio.dispatchEvent(new Event('change', { bubbles: true }));
      track('PerfilEscolhido', { perfil: p });
    });
  });

  /* Avaliações */
  (function () {
    var demo = /[?&]demo=1\b/.test(location.search);
    var todos = demo ? window.DEPOIMENTOS_EXEMPLO : window.DEPOIMENTOS;
    if (!todos || !todos.length) return;

    var ROTULOS = { dono: 'Dono de usina', integrador: 'Integrador', parceiro: 'Parceiro' };
    var FILTROS = { dono: 'Donos de usina', integrador: 'Integradores', parceiro: 'Parceiros e entidades' };
    var secao = $('#avaliacoes');
    var caixa = $('#av-carrossel');
    var trilha = $('#av-trilha');
    var controles = $('#av-controles');
    var pontos = $('#av-pontos');
    var pausaBtn = $('#av-pausa');
    var pausado = false, usuarioPausou = false, tempo = null;

    secao.hidden = false;
    $('#aviso-demo').hidden = !demo;
    $('#av-nota').hidden = !todos.some(function (d) { return d.resultado; });

    function el(tag, cls, txt) {
      var e = document.createElement(tag);
      if (cls) e.className = cls;
      if (txt) e.textContent = txt;
      return e;
    }
    function detalhe(d) {
      return [d.cargo, d.empresa, d.cidade_uf].filter(Boolean).join(' · ');
    }
    function autor(d) {
      var a = el('div', 'av-autor');
      if (d.foto) {
        var img = el('img');
        img.src = d.foto; img.alt = ''; img.loading = 'lazy'; img.width = 48; img.height = 48;
        a.appendChild(img);
      } else {
        a.appendChild(el('span', 'av-mono', demo ? '?' : d.nome.charAt(0)));
      }
      var t = el('div');
      t.appendChild(el('b', '', d.nome));
      t.appendChild(el('span', '', detalhe(d)));
      a.appendChild(t);
      return a;
    }
    function cartao(d) {
      var c = el('article', 'av-cartao');
      c.setAttribute('role', 'group');
      c.setAttribute('aria-roledescription', 'avaliação');
      c.appendChild(el('p', 'av-tipo', ROTULOS[d.tipo] || ''));
      c.appendChild(el('blockquote', '', d.depoimento));
      if (d.resultado) c.appendChild(el('p', 'av-resultado', d.resultado));
      c.appendChild(autor(d));
      if (d.link_fonte) {
        var l = el('a', 'av-fonte', 'Ver avaliação original ↗');
        l.href = d.link_fonte; l.target = '_blank'; l.rel = 'noopener nofollow';
        c.appendChild(l);
      }
      return c;
    }

    var destaque = todos.filter(function (d) { return d.destaque; })[0];
    if (destaque) {
      var caixaD = $('#av-destaque');
      caixaD.hidden = false;
      if (destaque.video) {
        caixaD.classList.add('com-video');
        var v = el('video');
        v.src = destaque.video; v.controls = true; v.preload = 'none'; v.playsInline = true;
        if (destaque.foto) v.poster = destaque.foto;
        caixaD.appendChild(v);
      }
      var txt = el('div');
      txt.appendChild(el('blockquote', '', '“' + destaque.depoimento + '”'));
      var aut = autor(destaque);
      aut.style.marginTop = '20px';
      txt.appendChild(aut);
      caixaD.appendChild(txt);

      var lado = $('#form-depo');
      lado.hidden = false;
      lado.appendChild(el('blockquote', '', '“' + destaque.depoimento + '”'));
      lado.appendChild(el('figcaption', '', destaque.nome + (detalhe(destaque) ? ' · ' + detalhe(destaque) : '')));
    }

    var lista = todos.filter(function (d) { return d !== destaque; });
    var tipos = Object.keys(FILTROS).filter(function (t) {
      return lista.filter(function (d) { return d.tipo === t; }).length >= 2;
    });

    /* Um indicador por posição de parada, que muda conforme os cartões visíveis */
    function desenharPontos() {
      pontos.textContent = '';
      if (!caixa.dataset.carrossel || !trilha.children.length) return;
      var passo = trilha.children[0].offsetWidth + 18;
      var total = Math.round((trilha.scrollWidth - trilha.clientWidth) / passo) + 1;
      for (var i = 0; i < total; i++) pontos.appendChild(el('i'));
    }
    window.addEventListener('resize', function () { desenharPontos(); atualizarPontos(); });

    function atualizarPontos() {
      var cartoes = trilha.children;
      if (!cartoes.length) return;
      var passo = cartoes[0].offsetWidth + 18;
      var i = Math.round(trilha.scrollLeft / passo);
      Array.prototype.forEach.call(pontos.children, function (p, k) { p.classList.toggle('on', k === i); });
    }
    function mover(dir) {
      var c = trilha.children[0];
      if (!c) return;
      var passo = c.offsetWidth + 18;
      var fim = trilha.scrollWidth - trilha.clientWidth;
      var alvo = trilha.scrollLeft + dir * passo;
      if (alvo > fim + 4) alvo = 0;
      if (alvo < -4) alvo = fim;
      trilha.scrollTo({ left: alvo, behavior: CALMO ? 'auto' : 'smooth' });
    }
    function iniciar() {
      clearInterval(tempo); tempo = null;
      if (CALMO || usuarioPausou || pausado || !caixa.dataset.carrossel) return;
      tempo = setInterval(function () { mover(1); }, 6000);
    }
    function montar(tipo) {
      var itens = lista.filter(function (d) { return !tipo || d.tipo === tipo; });
      trilha.textContent = '';
      itens.forEach(function (d) { trilha.appendChild(cartao(d)); });
      trilha.scrollLeft = 0;
      var carrossel = itens.length >= 4;
      caixa.classList.toggle('grade', !carrossel);
      caixa.dataset.carrossel = carrossel ? '1' : '';
      controles.hidden = !carrossel;
      pontos.textContent = '';
      desenharPontos();
      atualizarPontos();
      iniciar();
    }

    if (tipos.length >= 2) {
      var filtros = $('#av-filtros');
      filtros.hidden = false;
      [''].concat(tipos).forEach(function (t, n) {
        var b = el('button', 'av-filtro', t ? FILTROS[t] : 'Todos');
        b.type = 'button';
        b.setAttribute('aria-pressed', String(n === 0));
        b.addEventListener('click', function () {
          $$('.av-filtro', filtros).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
          montar(t);
        });
        filtros.appendChild(b);
      });
    }

    $('#av-ant').addEventListener('click', function () { mover(-1); });
    $('#av-prox').addEventListener('click', function () { mover(1); });
    pausaBtn.addEventListener('click', function () {
      usuarioPausou = !usuarioPausou;
      pausaBtn.textContent = usuarioPausou ? 'Retomar' : 'Pausar';
      pausaBtn.setAttribute('aria-pressed', String(usuarioPausou));
      iniciar();
    });
    if (CALMO) pausaBtn.hidden = true;
    ['mouseenter', 'focusin', 'touchstart'].forEach(function (ev) {
      caixa.addEventListener(ev, function () { pausado = true; iniciar(); }, { passive: true });
    });
    ['mouseleave', 'focusout'].forEach(function (ev) {
      caixa.addEventListener(ev, function () { pausado = false; iniciar(); });
    });
    trilha.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); mover(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); mover(-1); }
    });
    var quadro = false;
    trilha.addEventListener('scroll', function () {
      if (quadro) return;
      quadro = true;
      requestAnimationFrame(function () { quadro = false; atualizarPontos(); });
    }, { passive: true });

    montar('');
  })();

  /* Formulário em etapas */
  (function () {
    var form = $('#form-toi');
    var etapas = $$('.etapa-form', form);
    var porId = {};
    etapas.forEach(function (e) { porId[e.getAttribute('data-etapa')] = e; });
    var barra = $('#form-barra');
    var txt = $('#form-etapa-txt');
    var erro = $('#form-erro');
    var acoes = $('#form-acoes');
    var voltar = $('#form-voltar');
    var avancar = $('#form-avancar');
    var enviar = $('#form-enviar');
    var CAMPOS = ['perfil', 'documento', 'valor'];
    var TEXTO_ETAPA = ['Pergunta 1 de 3', 'Pergunta 2 de 3', 'Pergunta 3 de 3', 'Último passo'];
    var atual = 0, enviando = false, iniciou = false;

    function valor(nome) {
      var r = form.querySelector('input[name=' + nome + ']:checked');
      return r ? r.value : '';
    }
    function mostrarErro(m) { erro.textContent = m; erro.hidden = !m; }

    function ir(id, focar) {
      etapas.forEach(function (e) { e.classList.remove('atual'); });
      porId[id].classList.add('atual');
      mostrarErro('');
      if (id === 'fora') {
        acoes.hidden = true;
        txt.textContent = 'Resultado';
        barra.style.width = '100%';
        if (focar) porId.fora.focus({ preventScroll: true });
        return;
      }
      atual = id;
      acoes.hidden = false;
      txt.textContent = TEXTO_ETAPA[id];
      barra.style.width = ((id + 1) / 4 * 100) + '%';
      voltar.style.visibility = id === 0 ? 'hidden' : 'visible';
      avancar.hidden = id === 3;
      enviar.hidden = id !== 3;
      avancar.disabled = id < 3 && !valor(CAMPOS[id]);
      if (focar) {
        var alvo = id === 3 ? form.querySelector('input[name=nome]') : $('legend', porId[id]);
        alvo.focus({ preventScroll: true });
        track('FormEtapa', { etapa: id + 1 });
      }
    }

    function seguir() {
      if (atual === 2 && valor('valor') === 'Abaixo de R$ 5 mil') {
        track('ForaDoCriterio');
        ir('fora', true);
        return;
      }
      if (atual < 3) ir(atual + 1, true);
    }

    form.addEventListener('change', function (e) {
      if (e.target.type !== 'radio') return;
      if (!iniciou) { iniciou = true; track('FormInicio'); }
      if (CAMPOS[atual] === e.target.name) avancar.disabled = false;
    });

    /* Avança sozinho no toque ou clique. Pelo teclado, usa o botão Continuar. */
    form.addEventListener('click', function (e) {
      var label = e.target.closest ? e.target.closest('.opcao') : null;
      if (!label || e.detail === 0) return;
      var input = $('input', label);
      if (input.name !== CAMPOS[atual]) return;
      setTimeout(seguir, 260);
    });

    avancar.addEventListener('click', seguir);
    voltar.addEventListener('click', function () { if (atual > 0) ir(atual - 1, true); });
    $('#form-corrigir').addEventListener('click', function () { ir(2, true); });

    /* Máscara do WhatsApp */
    var whats = form.querySelector('input[name=whatsapp]');
    whats.addEventListener('input', function () {
      var d = whats.value.replace(/\D/g, '').slice(0, 11);
      var v = d;
      if (d.length > 2) v = '(' + d.slice(0, 2) + ') ' + d.slice(2);
      if (d.length > 6) {
        var corte = d.length === 11 ? 7 : 6;
        v = '(' + d.slice(0, 2) + ') ' + d.slice(2, corte) + '-' + d.slice(corte);
      }
      whats.value = v;
    });

    function novoEid() {
      return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
    }
    function concluir(eid) {
      window.location.href = REDIRECT + '?eid=' + encodeURIComponent(eid);
    }

    /* Mesmo envio da página atual: mesmos campos, endpoint e redirecionamento */
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (enviando) return;
      if (atual !== 3) { seguir(); return; }

      var nome = form.nome.value.trim();
      var empresa = form.empresa.value.trim();
      var whatsapp = whats.value.trim();
      if (!nome) { mostrarErro('Preencha o seu nome.'); form.nome.focus(); return; }
      if (whatsapp.replace(/\D/g, '').length < 10) { mostrarErro('Informe um WhatsApp com DDD.'); whats.focus(); return; }

      var eid = novoEid();
      var payload = JSON.stringify({
        eid: eid,
        perfil: valor('perfil'), documento: valor('documento'), valor: valor('valor'),
        q1: valor('perfil'), q2: valor('documento'), q4: valor('valor'),
        nome: nome, empresa: empresa, whatsapp: whatsapp,
        origem: 'VSL leitura do TOI',
        pagina: location.href, referrer: document.referrer, ts: new Date().toISOString()
      });

      if (LOCAL) {
        window.__ultimoEnvio = JSON.parse(payload);
        $('#form-teste').hidden = false;
        return;
      }

      enviando = true;
      enviar.disabled = true;
      enviar.textContent = 'Enviando…';
      mostrarErro('');

      var naFila = false;
      try {
        if (navigator.sendBeacon) {
          naFila = navigator.sendBeacon(ENDPOINT, new Blob([payload], { type: 'text/plain;charset=UTF-8' }));
        }
      } catch (err) { naFila = false; }
      if (naFila) { concluir(eid); return; }

      var limite = new Promise(function (res) { setTimeout(function () { res('timeout'); }, 4000); });
      var envio = fetch(ENDPOINT, {
        method: 'POST', mode: 'no-cors', keepalive: true,
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: payload
      }).then(function (r) { return (r && (r.ok || r.status === 0)) ? 'ok' : 'fail'; })
        .catch(function () { return 'fail'; });

      Promise.race([envio, limite]).then(function (r) {
        if (r === 'fail') {
          enviando = false;
          enviar.disabled = false;
          enviar.textContent = 'Enviar meu caso →';
          mostrarErro('Não conseguimos enviar o seu caso agora. Toque em enviar novamente.');
        } else {
          concluir(eid);
        }
      });
    });

    ir(0, false);
  })();
})();
