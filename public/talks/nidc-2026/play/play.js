// Playback mode: reads each slide's speaker notes and plays them as captions,
// one word at a time at roughly speaking pace, then moves to the next slide.
(function () {
  const WPM = 165;
  const HOLD_EMPTY = 4000;   // slides with no notes
  const GAP_PARA = 650;      // breath between paragraphs
  const GAP_SLIDE = 800;     // beat before the next slide

  let speed = 1, playing = false, timer = null;
  let paras = [], pi = 0, wi = 0;
  let durations = [], total = 0, slideStartedAt = 0, slideElapsed = 0;

  const $ = (s) => document.querySelector(s);
  const wordMs = (w) => {
    let ms = 60000 / WPM;
    if (/[.!?…:]["”’)]?$/.test(w)) ms += 220;
    else if (/[,;—–]["”’)]?$/.test(w)) ms += 90;
    return ms;
  };

  function notesFor(slide) {
    const aside = slide.querySelector('aside.notes');
    if (!aside) return [];
    const ps = aside.querySelectorAll('p');
    const blocks = ps.length ? [...ps].map((p) => p.textContent) : [aside.textContent];
    return blocks.map((t) => t.replace(/\s+/g, ' ').trim()).filter(Boolean);
  }

  function slideMs(slide) {
    const ns = notesFor(slide);
    if (!ns.length) return HOLD_EMPTY;
    let ms = GAP_SLIDE;
    ns.forEach((p) => { p.split(' ').forEach((w) => { ms += wordMs(w); }); ms += GAP_PARA; });
    return ms;
  }

  const fmt = (ms) => {
    const s = Math.round(ms / 1000);
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  };

  function build() {
    const ui = document.createElement('div');
    ui.id = 'play';
    ui.innerHTML = `
      <div id="cap" aria-live="off"><div id="cap-in"></div></div>
      <div id="bar">
        <button id="pp" type="button" aria-label="Play">Play</button>
        <button id="prev" type="button" aria-label="Previous slide">‹</button>
        <button id="next" type="button" aria-label="Next slide">›</button>
        <div id="track" role="slider" aria-label="Talk position" tabindex="0"><div class="rail"><div class="fill"></div></div></div>
        <span id="time"></span>
        <span id="count" class="wide"></span>
        <button id="spd" type="button" aria-label="Playback speed">1×</button>
        <button id="cc" type="button" aria-pressed="true" aria-label="Captions">CC</button>
        <a class="wide" href="https://swm.cc/writing/nidc-takeaway-recipes/">swm.cc ↗</a>
      </div>`;
    document.body.appendChild(ui);

    const start = document.createElement('div');
    start.id = 'start';
    start.innerHTML = `<button type="button">▶ Play the talk<small>${fmt(total)} · speaker notes as captions</small></button>`;
    document.body.appendChild(start);
    start.addEventListener('click', () => { start.remove(); play(); });

    const rail = $('#track .rail');
    let acc = 0;
    durations.forEach((d) => {
      acc += d;
      if (acc >= total) return;
      const t = document.createElement('span');
      t.className = 'tick';
      t.style.left = (acc / total * 100) + '%';
      rail.appendChild(t);
    });

    $('#pp').onclick = toggle;
    $('#prev').onclick = () => Reveal.prev();
    $('#next').onclick = () => Reveal.next();
    $('#spd').onclick = () => {
      speed = speed === 1 ? 1.25 : speed === 1.25 ? 1.5 : speed === 1.5 ? 2 : 1;
      $('#spd').textContent = speed + '×';
    };
    $('#cc').onclick = () => {
      const off = document.body.classList.toggle('cc-off');
      $('#cc').setAttribute('aria-pressed', String(!off));
      relayout();
    };
    $('#track').addEventListener('click', (e) => {
      const r = e.currentTarget.getBoundingClientRect();
      const target = (e.clientX - r.left) / r.width * total;
      let acc = 0, i = 0;
      while (i < durations.length - 1 && acc + durations[i] <= target) acc += durations[i++];
      dismissStart();
      Reveal.slide(i);
    });
  }

  const dismissStart = () => { const s = $('#start'); if (s) s.remove(); };

  function relayout() {
    requestAnimationFrame(() => Reveal.layout());
  }

  function load(slide) {
    clearTimeout(timer);
    paras = notesFor(slide);
    pi = 0; wi = 0; slideElapsed = 0; slideStartedAt = performance.now();
    $('#cap-in').innerHTML = '';
    $('#cap-in').style.transform = '';
    if (paras.length) addPara();
    const idx = Reveal.getIndices().h;
    $('#count').textContent = (idx + 1) + ' / ' + durations.length;
    tick();
    if (playing) schedule(0);
  }

  function addPara() {
    const inner = $('#cap-in');
    inner.innerHTML = '';
    inner.style.transform = '';
    const p = document.createElement('p');
    paras[pi].split(' ').forEach((w, i) => {
      if (i) p.appendChild(document.createTextNode(' '));
      const s = document.createElement('span');
      s.className = 'w';
      s.textContent = w;
      p.appendChild(s);
    });
    inner.appendChild(p);
  }

  function step() {
    if (!playing) return;
    if (!paras.length) { schedule(HOLD_EMPTY, advance); return; }
    const cur = $('#cap p');
    const words = cur.querySelectorAll('.w');
    if (wi < words.length) {
      words.forEach((w) => w.classList.remove('now'));
      words[wi].classList.add('on', 'now');
      follow(words[wi]);
      const ms = wordMs(words[wi].textContent);
      wi++;
      schedule(ms);
      return;
    }
    words.forEach((w) => w.classList.remove('now'));
    if (pi < paras.length - 1) {
      schedule(GAP_PARA, () => { pi++; wi = 0; addPara(); step(); });
    } else {
      schedule(GAP_SLIDE, advance);
    }
  }

  // keep the spoken line in view: scroll up a line at a time, never cut the top
  function follow(word) {
    const box = $('#cap').clientHeight;
    const lh = parseFloat(getComputedStyle(word.parentNode).lineHeight);
    const bottom = word.offsetTop + lh;
    const shift = bottom > box ? Math.ceil((bottom - box) / lh) * lh : 0;
    $('#cap-in').style.transform = shift ? `translateY(${-shift}px)` : '';
  }

  function schedule(ms, fn) {
    clearTimeout(timer);
    timer = setTimeout(fn || step, ms / speed);
  }

  function advance() {
    if (Reveal.isLastSlide()) { pause(); $('#pp').textContent = 'Replay'; return; }
    Reveal.next();
  }

  function play() {
    dismissStart();
    if (Reveal.isLastSlide() && $('#pp').textContent === 'Replay') { Reveal.slide(0); }
    playing = true;
    slideStartedAt = performance.now() - slideElapsed;
    $('#pp').textContent = 'Pause';
    $('#pp').setAttribute('aria-label', 'Pause');
    schedule(0);
  }

  function pause() {
    playing = false;
    clearTimeout(timer);
    slideElapsed = performance.now() - slideStartedAt;
    $('#pp').textContent = 'Play';
    $('#pp').setAttribute('aria-label', 'Play');
  }

  const toggle = () => (playing ? pause() : play());
  window.__playToggle = toggle;

  function tick() {
    const idx = Reveal.getIndices().h;
    let before = 0;
    for (let i = 0; i < idx; i++) before += durations[i];
    const within = playing ? (performance.now() - slideStartedAt) * speed : slideElapsed;
    const at = Math.min(before + Math.min(within, durations[idx] || 0), total);
    $('#track .fill').style.width = (at / total * 100) + '%';
    $('#time').textContent = fmt(at) + ' / ' + fmt(total);
  }

  Reveal.on('ready', () => {
    const slides = Reveal.getHorizontalSlides();
    durations = slides.map(slideMs);
    total = durations.reduce((a, b) => a + b, 0);
    build();
    relayout();
    load(Reveal.getCurrentSlide());
    if (Reveal.getIndices().h > 0) dismissStart();
    if (new URLSearchParams(location.search).has('play')) play();
    setInterval(() => { if (playing) tick(); }, 250);
  });
  Reveal.on('slidechanged', (e) => load(e.currentSlide));
  window.addEventListener('resize', relayout);
})();
