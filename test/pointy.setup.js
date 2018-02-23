// ensure pointy.js polyfill believes we support touch events
document.ontouchend = null;

// ensure pointy.js polyfill believes we do not support pointer events
navigator.pointerEnabled = false;
navigator.msPointerEnabled = false;
window.PointerEvent = null;