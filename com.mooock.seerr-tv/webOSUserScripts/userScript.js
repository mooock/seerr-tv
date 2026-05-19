(function () {
  'use strict';

  var OVERLAY_ID = 'seerr-tv-yt-overlay';
  var trailerOpen = false;

  if (window.top !== window) return;

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
    overlay.tabIndex = -1;
    overlay.innerHTML = [
      '<div id="seerr-tv-yt-blocker"></div>',
      '<button id="seerr-tv-yt-close">&#x2715; Close (Back)</button>'
    ].join('');
    document.body.appendChild(overlay);

    document.getElementById('seerr-tv-yt-close').addEventListener('click', function () {
      // Close button: destroy frame, hide overlay, then consume both pushed states
      destroyFrame();
      document.getElementById(OVERLAY_ID).classList.remove('open');
      trailerOpen = false;
      // Go back twice to clean up both pushed states
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
      // Push two states — webOS intercepts first Back at system level,
      // second Back fires popstate which we handle
      history.pushState({ seerrTrailer: true }, '');
      history.pushState({ seerrTrailer: true }, '');
    }
    trailerOpen = true;
    createFrame(videoId);
    document.getElementById(OVERLAY_ID).classList.add('open');
    document.getElementById('seerr-tv-yt-close').focus();
  }

  // Back button via popstate — fires on second Back press (first is intercepted by webOS)
  // At this point one state is already consumed, we need to consume the remaining one too
  window.addEventListener('popstate', function (e) {
    if (trailerOpen) {
      destroyFrame();
      document.getElementById(OVERLAY_ID).classList.remove('open');
      trailerOpen = false;
      // Consume the remaining pushed state so next Back navigates Seerr normally
      history.back();
    }
  });

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
