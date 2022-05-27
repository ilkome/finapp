export default function isTouchDevice() {
  // eslint-disable-next-line no-undef
  return !!(('ontouchstart' in window) || (window.DocumentTouch && document instanceof DocumentTouch))
}
