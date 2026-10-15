// The app has its own context menus; the browser's would only cover them. Text fields keep it for copy / paste.
// Touch long-press is left alone: preventing its `contextmenu` makes Chrome Android drop the `click` of the
// first tap on the open menu (the second tap works), and reka's own handler is what opens the menu there.
export default defineNuxtPlugin(() => {
  document.addEventListener('contextmenu', (e) => {
    if ((e as PointerEvent).pointerType === 'touch')
      return
    if (!(e.target as Element | null)?.closest('input, textarea, [contenteditable="true"]'))
      e.preventDefault()
  })
})
