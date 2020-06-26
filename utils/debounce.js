export default function debounce (func, interval) {
  let timeout
  return function () {
    const context = this; const args = arguments
    const later = function () {
      timeout = null
      func.apply(context, args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, interval || 300)
  }
}
