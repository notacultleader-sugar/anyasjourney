// Finds the fundraising thermometer (the CauseVox embed) on the charity's
// homepage, so the app shows exactly what the website shows. When the charity
// updates the thermometer on the site, the app picks it up with no new release.
//
// The same finder runs inside the native WebView (as injected JS) and in the
// web build (on fetched HTML), so keep it plain ES5.
export const FIND_THERMOMETER_JS = `
function __findThermometer(doc) {
  var el = doc.getElementById('thermometer');
  if (!el) {
    var nodes = doc.querySelectorAll('[class*="causevox"], [id*="causevox"], iframe[src*="causevox"], img[src*="causevox"], a[href*="causevox"]');
    if (nodes.length) el = nodes[0];
  }
  if (!el) {
    var hs = doc.querySelectorAll('h1,h2,h3,h4,h5,h6');
    for (var i = 0; i < hs.length; i++) {
      if (/fundraising\\s+goal/i.test(hs[i].textContent || '')) { el = hs[i]; break; }
    }
  }
  if (!el) return null;
  return (el.closest && el.closest('section')) || el.parentElement || el;
}
`;

// Native: runs in a WebView that has loaded the homepage. Strips the page down
// to the thermometer and reports its height.
export const ISOLATE_THERMOMETER_JS = `
(function () {
  ${FIND_THERMOMETER_JS}
  function post(m) { window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(m)); }
  function run() {
    var section = __findThermometer(document);
    if (!section) { post({ type: 'missing' }); return; }
    document.body.innerHTML = '';
    document.body.appendChild(section);
    var css = document.createElement('style');
    css.innerHTML = 'html,body{margin:0!important;padding:0!important;background:transparent!important;overflow:hidden!important}' +
      'body>*{margin:0!important;padding-top:8px!important;padding-bottom:8px!important}' +
      '#header,#footer,.back-to-top{display:none!important}';
    document.head.appendChild(css);
    window.scrollTo(0, 0);
    setTimeout(function () { post({ type: 'height', height: document.body.scrollHeight }); }, 300);
  }
  // Give the embed a moment to draw after the page loads.
  if (document.readyState === 'complete') setTimeout(run, 1200);
  else window.addEventListener('load', function () { setTimeout(run, 1200); });
})();
true;
`;
