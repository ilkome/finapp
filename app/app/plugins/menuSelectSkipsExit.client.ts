// Picking a menu item that navigates deactivates its keep-alive page in the same tick, and the page's pending render
// is what removes a closing menu after its exit animation. Skipping that animation for picked items lets reka-ui's
// Presence unmount at once; dismissing by outside tap or Escape keeps it (see main.css).
export default defineNuxtPlugin(() => {
  const mark = (e: Event) => {
    const item = (e.target as Element | null)?.closest('[role^="menuitem"]')
    if (item && !item.hasAttribute('aria-haspopup'))
      item.closest('[role="menu"]')?.setAttribute('data-item-picked', '')
  }
  document.addEventListener('click', mark, { capture: true })
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ')
      mark(e)
  }, { capture: true })
})
