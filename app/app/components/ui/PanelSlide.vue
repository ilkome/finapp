<script setup lang="ts">
import { AnimatePresence, Motion } from 'motion-v'

// Nested-menu panel switch: the leaving panel fades out in the direction of travel and the new
// one fades in from the opposite side. `direction` is 1 when going deeper, -1 when going back.
const props = defineProps<{
  direction: 1 | -1
  panelKey: string
}>()

const SLIDE_DISTANCE = 8
const panelVariants = {
  center: { opacity: 1, x: 0 },
  enter: (dir: 1 | -1) => ({ opacity: 0, x: dir * SLIDE_DISTANCE }),
  exit: (dir: 1 | -1) => ({ opacity: 0, x: dir * -SLIDE_DISTANCE }),
}
const panelTransition = { duration: 0.12, ease: [0.4, 0, 0.2, 1] as const }
</script>

<template>
  <div class="overflow-x-clip">
    <AnimatePresence :custom="props.direction" mode="wait" :initial="false">
      <Motion
        :key="props.panelKey"
        :custom="props.direction"
        :variants="panelVariants"
        initial="enter"
        animate="center"
        exit="exit"
        :transition="panelTransition"
      >
        <slot />
      </Motion>
    </AnimatePresence>
  </div>
</template>
