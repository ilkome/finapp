export default function isTouchDevice() {
  return !!(('ontouchstart' in window) || (window.DocumentTouch && document instanceof DocumentTouch))
}
