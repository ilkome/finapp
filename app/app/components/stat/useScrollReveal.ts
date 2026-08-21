import type { Ref } from 'vue'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const CHART_REVEAL_COMMIT_RATIO = 0.4

// Mobile chart reveal over the zone [page top .. header pin]:
//  - fade: the chart fades + lifts as it scrolls out through the top (GSAP scrub, both ways).
//  - snap: once the native scroll fully settles (finger up + momentum dead) inside the zone, one
//    native smooth-scroll commits to chart-shown (0) or docked (pin). This is how T-Bank's mobile
//    web stays glassy: it never writes scrollTop while the fling is live, so nothing races it.
//    Our earlier per-frame rAF tween easing scrollTop against the iOS fling was the jitter.
export function useScrollReveal(stickyNav: boolean, stickyTop: Readonly<Ref<number>>) {
  const chartTrigger = ref<HTMLElement | null>(null)
  const chartFx = ref<HTMLElement | null>(null)
  const dateFx = ref<HTMLElement | null>(null)
  const sumsFx = ref<HTMLElement | null>(null)

  if (stickyNav && import.meta.client) {
    gsap.registerPlugin(ScrollTrigger)
    const mm = gsap.matchMedia()
    onMounted(() => {
      mm.add('(max-width: 767px)', () => {
        const trigger = chartTrigger.value
        const fx = chartFx.value
        if (!trigger || !fx)
          return

        const scroller = document.scrollingElement as HTMLElement

        // document offset of the chart's bottom = where the sticky header pins.
        const pinAt = () => {
          let y = trigger.offsetHeight
          for (let n: HTMLElement | null = trigger; n; n = n.offsetParent as HTMLElement | null)
            y += n.offsetTop
          return Math.max(0, Math.round(y - stickyTop.value))
        }

        ScrollTrigger.create({
          animation: gsap.to(fx, { ease: 'none', opacity: 0, yPercent: -30 }),
          end: pinAt,
          scrub: true,
          start: 0,
        })

        // Date + sums lift faster than the scroll, then ease back to their standard position by the
        // time they pin - so they dock cleanly, not left floating high. The sums lift a little less
        // than the date, so the two read as layers.
        const liftToPin = (el: HTMLElement, lift: number) => {
          const tl = gsap.timeline()
            .to(el, { duration: 0.55, ease: 'sine.out', yPercent: -lift })
            .to(el, { duration: 0.45, ease: 'sine.inOut', yPercent: 0 })
          return ScrollTrigger.create({ animation: tl, end: pinAt, scrub: true, start: 0 })
        }
        if (dateFx.value)
          liftToPin(dateFx.value, 16)
        if (sumsFx.value)
          liftToPin(sumsFx.value, 12)

        // Native snap: fire only after the scroll goes idle (finger up + momentum dead), then let
        // the browser own the animation. `touching` blocks any snap while a finger is down; the
        // debounce fires ~100ms after the last scroll event, i.e. once the iOS fling has died.
        let touching = false
        let lastY = scroller.scrollTop
        let dir = 0
        let idle: ReturnType<typeof setTimeout> | undefined
        const settle = () => {
          if (touching)
            return
          const pin = pinAt()
          const y = scroller.scrollTop
          if (y <= 2 || y >= pin - 2)
            return // already at a rest point, or scrolled past the zone into the list
          // A small upward gesture should not unexpectedly pull the user back to the page top.
          // Reveal at least 40% of the chart to commit; otherwise restore the docked header.
          const revealProgress = Math.max(0, Math.min(1, (pin - y) / Math.max(1, trigger.offsetHeight)))
          const target = dir <= 0 && revealProgress >= CHART_REVEAL_COMMIT_RATIO ? 0 : pin
          window.scrollTo({ behavior: 'smooth', top: target })
        }
        const schedule = () => {
          const y = scroller.scrollTop
          if (y !== lastY)
            dir = y > lastY ? 1 : -1
          lastY = y
          clearTimeout(idle)
          idle = setTimeout(settle, 100)
        }
        const onTouchStart = () => {
          touching = true
          clearTimeout(idle)
        }
        const onTouchEnd = () => {
          // A still finger lifting sends no scroll event, so kick the settle here too - otherwise a
          // slow drag-and-hold would rest half-open.
          touching = false
          schedule()
        }
        window.addEventListener('scroll', schedule, { passive: true })
        window.addEventListener('touchstart', onTouchStart, { passive: true })
        window.addEventListener('touchend', onTouchEnd, { passive: true })
        const stopStickyTopWatch = watch(stickyTop, () => ScrollTrigger.refresh())

        return () => {
          clearTimeout(idle)
          stopStickyTopWatch()
          window.removeEventListener('scroll', schedule)
          window.removeEventListener('touchstart', onTouchStart)
          window.removeEventListener('touchend', onTouchEnd)
        }
      })
    })
    onUnmounted(() => mm.revert())
  }

  return {
    chartFx,
    chartTrigger,
    dateFx,
    sumsFx,
  }
}
