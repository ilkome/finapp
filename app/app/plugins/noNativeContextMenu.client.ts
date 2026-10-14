// The app has its own context menus; the browser's would only cover them. Text fields keep it for copy / paste.
export default defineNuxtPlugin(() => {
  document.addEventListener('contextmenu', (e) => {
    if (!(e.target as Element | null)?.closest('input, textarea, [contenteditable="true"]'))
      e.preventDefault()
  })
})
