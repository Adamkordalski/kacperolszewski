/* Bootstrap Google tag (gtag.js) — wydzielony z index.html, żeby CSP mogła
   działać bez 'unsafe-inline' w script-src. Kolejność wobec async
   gtag.js nie ma znaczenia: gtag() tylko dopisuje do kolejki dataLayer. */
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', 'G-6W3L96HBC0');
