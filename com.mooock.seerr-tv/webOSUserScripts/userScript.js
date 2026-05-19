(function () {
  'use strict';

  var OVERLAY_ID = 'seerr-tv-yt-overlay';
  var trailerOpen = false;
  var lastRow = null;

  if (window.top !== window) return;

  // Track last hovered row — locked in so D-pad keeps scrolling it after cursor hides
  document.addEventListener('mouseover', function (e) {
    var el = e.target;
    while (el) {
      if (el.classList && el.classList.contains('hide-scrollbar')) {
        lastRow = el;
        return;
      }
      el = el.parentElement;
    }
  }, true);

  function extractYouTubeId(url) {
    if (!url) return null;
    var patterns = [
      /(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/,
      /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/
    ];
    for (var i = 0; i < patterns.length; i++) {
      var m = String(url).match(patterns[i]);
      if (m) return m[1];
    }
    return null;
  }

  // Arrow key / D-pad navigation
  document.addEventListener('keydown', function (e) {
    if (trailerOpen) return;
    var key = e.keyCode;

    if (key === 37 || key === 39) {
      // Left/Right — scroll last hovered row directly
      if (!lastRow) return;
      e.preventDefault();
      lastRow.scrollBy({ left: key === 39 ? 200 : -200, behavior: 'smooth' });
    } else if (key === 38 || key === 40) {
      // Up/Down — scroll page
      e.preventDefault();
      window.scrollBy({ top: key === 40 ? 300 : -300, behavior: 'smooth' });
      lastRow = null;
    }
  }, true);

  function ensureOverlay() {
    if (document.getElementById(OVERLAY_ID)) return;

    var style = document.createElement('style');
    style.textContent = [
      '#' + OVERLAY_ID + '{',
        'display:none;position:fixed;inset:0;z-index:2147483647;background:#000;',
      '}',
      '#' + OVERLAY_ID + '.open{display:block;}',
      '#seerr-tv-yt-blocker{',
        'position:absolute;inset:0;z-index:2;background:transparent;pointer-events:auto;',
      '}',
      '#seerr-tv-yt-close{',
        'position:absolute;top:20px;right:28px;z-index:3;',
        'background:rgba(0,0,0,0.6);border:1px solid rgba(255,255,255,0.2);',
        'color:rgba(255,255,255,0.7);border-radius:6px;',
        'font-size:13px;font-family:Helvetica Neue,Helvetica,Arial,sans-serif;',
        'cursor:pointer;padding:8px 14px;',
      '}'
    ].join('');
    document.head.appendChild(style);

    var overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.innerHTML = [
      '<div id="seerr-tv-yt-blocker"></div>',
      '<button id="seerr-tv-yt-close">&#x2715; Close (Back)</button>'
    ].join('');
    document.body.appendChild(overlay);

    document.getElementById('seerr-tv-yt-close').addEventListener('click', function () {
      destroyFrame();
      document.getElementById(OVERLAY_ID).classList.remove('open');
      trailerOpen = false;
      history.go(-2);
    });
  }

  function destroyFrame() {
    var f = document.getElementById('seerr-tv-yt-frame');
    if (f && f.parentNode) f.parentNode.removeChild(f);
  }

  function createFrame(videoId) {
    destroyFrame();
    var overlay = document.getElementById(OVERLAY_ID);
    var frame = document.createElement('iframe');
    frame.id = 'seerr-tv-yt-frame';
    frame.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:none;display:block;z-index:1;pointer-events:none;';
    frame.allow = 'autoplay; encrypted-media';
    frame.src = 'https://www.youtube.com/embed/' + videoId
      + '?autoplay=1&controls=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0&playsinline=1';
    overlay.insertBefore(frame, overlay.firstChild);
  }

  function openTrailer(videoId) {
    ensureOverlay();
    if (!trailerOpen) {
      history.pushState({ seerrTrailer: true }, '');
      history.pushState({ seerrTrailer: true }, '');
    }
    trailerOpen = true;
    createFrame(videoId);
    document.getElementById(OVERLAY_ID).classList.add('open');
    document.getElementById('seerr-tv-yt-close').focus();
  }

  window.addEventListener('popstate', function (e) {
    if (trailerOpen) {
      destroyFrame();
      document.getElementById(OVERLAY_ID).classList.remove('open');
      trailerOpen = false;
      history.back();
    }
  });

  // webOS magic remote scroll wheel
  document.addEventListener('wheel', function (e) {
    if (trailerOpen) return;
    e.preventDefault();
    var el = e.target;
    while (el && el !== document.body) {
      var style = window.getComputedStyle(el);
      var overflow = style.overflow + style.overflowY;
      if (/auto|scroll/.test(overflow) && el.scrollHeight > el.clientHeight) {
        el.scrollBy({ top: e.deltaY > 0 ? 300 : -300, behavior: 'smooth' });
        return;
      }
      el = el.parentElement;
    }
    window.scrollBy({ top: e.deltaY > 0 ? 300 : -300, behavior: 'smooth' });
  }, { passive: false });

  document.addEventListener('click', function (e) {
    var el = e.target;
    while (el && el.tagName !== 'A') { el = el.parentElement; }
    if (!el) return;
    var href = el.getAttribute('href') || '';
    var videoId = extractYouTubeId(href);
    if (videoId) {
      e.preventDefault();
      e.stopImmediatePropagation();
      openTrailer(videoId);
    }
  }, true);

  var origOpen = window.open;
  window.open = function (url) {
    var videoId = extractYouTubeId(url);
    if (videoId) { openTrailer(videoId); return null; }
    return origOpen.apply(this, arguments);
  };

}());
