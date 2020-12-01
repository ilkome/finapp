import debounce from '~/utils/debounce'

export const initScroll = () => {
  const doc = document.querySelector('.pageScrollerJsContent')
  if (!doc) { return }

  let curScroll
  let prevScroll = doc.scrollY || doc.scrollTop
  let curDirection = 0
  let prevDirection = 0

  /*
  step 1: user scrolls down: curDirection 2, prevDirection 0 > hide header
  step 2: user scrolls down again: curDirection 2, prevDirection 2 > already hidden, do nothing
  step 3: user scrolls up: curDirection 1, prevDirection 2 > show header
  */

  const header = document.querySelector('.pageScrollerJsHeader')
  const bottom = document.querySelector('.pageScrollerJsBottom')
  const menu = document.querySelector('.pageScrollerJsMenu')
  if (!menu || !header || !bottom) { return }

  this.isScrollInited = true
  // doc.style.paddingTop = `${header.clientHeight}px`
  // doc.style.paddingBottom = `${bottom.clientHeight + menu.clientHeight}px`

  let toggled
  const threshold = 100

  // scroll up - 1, scroll down - 2, initial - 0
  const checkScroll = function () {
    console.log(curScroll, prevScroll)
    curScroll = doc.scrollY || doc.scrollTop
    if (curScroll > prevScroll) {
      // scrolled down
      curDirection = 2
    }
    else {
      // scrolled up
      curDirection = 1
    }

    if (curDirection !== prevDirection) {
      toggled = toggleHeader()
    }

    prevScroll = curScroll
    if (toggled) {
      prevDirection = curDirection
    }
  }

  const toggleHeader = () => {
    toggled = true
    if (curDirection === 2 && curScroll > threshold) {
      // header.classList.add('_hide')
      // bottom.classList.add('_hide')
      // menu.classList.add('_hide')
    }
    else if (curDirection === 1) {
      // bottom.classList.remove('_hide')
      // header.classList.remove('_hide')
      // menu.classList.remove('_hide')
    }
    else {
      toggled = false
    }
    return toggled
  }
  doc.addEventListener('scroll', debounce(checkScroll, 100))
}
