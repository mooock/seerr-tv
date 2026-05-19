/**
 * Seerr TV — webOS App
 *
 * Setup wizard only. Once URL is saved, navigates directly to Seerr.
 * All YouTube interception and overlay is handled by userScript.js
 * which webOS injects directly into the Seerr page.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'seerrTvConfig';

  var elSetup    = document.getElementById('setup');
  var elErrorMsg = document.getElementById('error-msg');
  var elBtnSave  = document.getElementById('btn-save');
  var elInputUrl = document.getElementById('input-url');

  function loadConfig() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function saveConfig(cfg) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  }

  function normaliseUrl(raw) {
    var url = raw.trim().replace(/\/$/, '');
    if (!/^https?:\/\//i.test(url)) url = 'http://' + url;
    return url;
  }

  function showSetup(prefill) {
    if (prefill) elInputUrl.value = prefill.url || '';
    elSetup.classList.add('visible');
    setTimeout(function () { elInputUrl.focus(); }, 60);
  }

  function showError(msg) {
    elErrorMsg.textContent = msg;
    elErrorMsg.classList.add('visible');
  }

  function clearError() {
    elErrorMsg.classList.remove('visible');
  }

  elBtnSave.addEventListener('click', function () {
    clearError();
    var url = elInputUrl.value.trim();
    if (!url) {
      showError('Server URL is required.');
      elInputUrl.classList.add('error');
      elInputUrl.focus();
      return;
    }
    elInputUrl.classList.remove('error');
    var cfg = { url: normaliseUrl(url) };
    saveConfig(cfg);
    window.location.href = cfg.url;
  });

  elInputUrl.addEventListener('input', function () {
    elInputUrl.classList.remove('error');
    clearError();
  });

  elInputUrl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') elBtnSave.click();
  });

  // Boot — if config exists navigate straight to Seerr
  var cfg = loadConfig();
  if (cfg && cfg.url) {
    window.location.href = cfg.url;
  } else {
    showSetup(null);
  }

}());
