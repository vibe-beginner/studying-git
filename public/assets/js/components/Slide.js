(function () {
  'use strict';

  function main() {
    enableSlideEngine();
  }

  const pageProps = (props) => {
    const target = document.documentElement;
    const genKey = (key) => `data-${key}`;
    if (typeof props === 'string') return target.getAttribute(genKey(props));
    Object.entries(props).forEach(([key, value]) => {
      key = genKey(key);
      if (value == null) {
        target.removeAttribute(key);
      } else {
        target.setAttribute(key, value);
      }
    });
  };
  const queryParams = {
    get(key, type) {
      if (type != null) type = type.toLowerCase();
      const value = url.searchParams.get(key);
      if (type === 'bool' || type === 'boolean') {
        return value != null && !['false', 'off', 'no', '0'].includes(value);
      }
      if (type === 'int') {
        return value | 0;
      }
      return value;
    },
    set(key, value) {
      if (queryParams.isDefaultValue(key, value)) {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, value);
      }
    },
    isDefaultValue(key, value) {
      if (key === 'slide' && value === 1) return true;
      if (key === 'theme' && value === themes[0]) return true;
      return false;
    },
  };

  const url = new URL(location.href);
  const themes = ['default', 'dark'];
  document.addEventListener('DOMContentLoaded', main);

  function enableSlideEngine() {
    const commandTarget = window;
    const deck = document.getElementById('deck');
    const slides = Array.from(deck.querySelectorAll('.slide'));
    let chapterCount = 0;
    const chapters = slides.reduce((acc, s, i) => {
      if (i === 0 || s.classList.contains('chapter')) {
        acc[chapterCount++] = i;
      }
      return acc;
    }, Object.fromEntries(Array.from({ length: 10 }, (_, i) => [i, slides.length - 1])));
    const actionList = document.querySelectorAll('[data-action]');
    const progress = document.getElementById('progress');
    const pagenumCurrentList = document.querySelectorAll('.pagenum-current');
    const pagenumTotalList = document.querySelectorAll('.pagenum-total');
    const tocEl = document.getElementById('toc');

    // Set actions event
    actionList.forEach((elem) => {
      const action = elem.getAttribute('data-action');
      if (action === 'slide-prev') {
        elem.addEventListener('click', () => {
          prev();
        });
      }
      if (action === 'slide-next') {
        elem.addEventListener('click', () => {
          next();
        });
      }
      if (action === 'change-theme') {
        elem.addEventListener('click', () => {
          changeTheme();
        });
      }
    });

    // Startup slide via searchParams "slide" and "theme"
    const argIdx = queryParams.get('slide', 'int');
    let idx = Math.max(0, Math.min(slides.length - 1, argIdx - 1));
    pageProps({ theme: queryParams.get('theme') });

    // Build TOC automatically from data-title
    function buildTOC() {
      if (!tocEl) return;
      const tocSlide = tocEl.closest('.slide');
      let isAfterTocSlide = false;
      const liList = [];
      slides.forEach((s, i) => {
        if (s === tocSlide) {
          isAfterTocSlide = true;
          return;
        }
        if (!isAfterTocSlide) return;
        const title = s.dataset.title || `Slide ${i + 1}`;
        const li = document.createElement('li');
        const a = document.createElement('a');
        const slideNum = i + 1;
        const tocNum = liList.length + 1;
        queryParams.set('slide', slideNum);
        a.href = url.href;
        a.textContent = title;
        a.addEventListener('click', (e) => {
          e.preventDefault();
          go(i);
        });
        li.appendChild(a);
        liList.push(li);
      });
      tocEl.replaceChildren(...liList);
    }
    buildTOC();

    pagenumTotalList.forEach((elem) => {
      elem.textContent = slides.length;
    });
    function render() {
      slides.forEach((s, i) =>
        s.setAttribute('aria-hidden', i === idx ? 'false' : 'true'),
      );
      const currentPage = idx + 1;
      const totalPage = slides.length;
      if (totalPage >= 2) {
        const pct = ((currentPage - 1) / (totalPage - 1)) * 100;
        progress.style.width = pct + '%';
      }
      pagenumCurrentList.forEach((elem) => {
        elem.textContent = currentPage;
      });
    }

    function go(n) {
      idx = Math.max(0, Math.min(slides.length - 1, n));
      render();

      // Update the page URL
      queryParams.set('slide', idx + 1);
      const newUrl = url.href;
      window.history.replaceState({}, '', newUrl);
    }
    function next() {
      go(idx + 1);
    }
    function prev() {
      go(idx - 1);
    }

    // Keyboard controls
    commandTarget.addEventListener('keydown', (e) => {
      if (['ArrowRight', 'PageDown'].includes(e.key)) {
        e.preventDefault();
        next();
      }
      if (['ArrowLeft', 'PageUp'].includes(e.key)) {
        e.preventDefault();
        prev();
      }
      if (e.key === 'Home') {
        e.preventDefault();
        go(0);
      }
      if (e.key === 'End') {
        e.preventDefault();
        go(slides.length - 1);
      }
      if (/^[0-9]$/.test(e.key)) {
        // chapter jump
        const chapIdx = chapters[e.key];
        if (chapIdx != null) {
          go(chapIdx);
        }
      }
    });

    // Touch swipe
    let tx = 0;
    let ty = 0;
    commandTarget.addEventListener(
      'touchstart',
      (e) => {
        const t = e.changedTouches[0];
        tx = t.clientX;
        ty = t.clientY;
      },
      { passive: true },
    );
    commandTarget.addEventListener(
      'touchend',
      (e) => {
        const t = e.changedTouches[0];
        const dx = t.clientX - tx,
          dy = t.clientY - ty;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
          dx < 0 ? next() : prev();
        }
      },
      { passive: true },
    );

    // Always show the entire slide
    const slideWidth = 800;
    const slideHeight = 450;
    deck.style.setProperty('--slide-w', slideWidth);
    deck.style.setProperty('--slide-h', slideHeight);
    function fitSlideToWindow() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const scale = Math.min(vw / slideWidth, vh / slideHeight);
      deck.style.height = (vh / scale | 0) + 'px';
      deck.style.zoom = scale;
    }
    if (!queryParams.get('nofit', 'bool')) {
      fitSlideToWindow();
      window.addEventListener('resize', fitSlideToWindow);
    }

    // Change the theme dynamically by "T" key
    let themeIdx = Math.max(0, themes.indexOf(pageProps('theme')));
    function changeTheme() {
      themeIdx = (themeIdx + 1) % themes.length;
      const theme = themes[themeIdx];
      pageProps({ theme });
      queryParams.set('theme', theme);
      const newUrl = url.href;
      history.replaceState({}, '', newUrl);
    }
    window.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 't') changeTheme();
    });

    // Initialize
    window.addEventListener('load', () => {
      render();
    });
  }
})();
