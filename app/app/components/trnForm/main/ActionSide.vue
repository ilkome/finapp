<script setup lang="ts">
import { useTrnFormSubmit } from '~/components/trnForm/useTrnFormSubmit'

const { t } = useI18n()
const { isMath, isSubmittable, submit } = useTrnFormSubmit()
</script>

<template>
  <button
    :aria-label="t(isMath ? 'base.apply' : 'base.save')"
    :class="cn(
      'hover:scale-1.02 flex size-full w-12 items-center justify-center rounded-sm p-1 py-4 text-center transition @xs/trnForm:w-14 @sm/trnForm:w-16',
      !isMath && isSubmittable
        ? 'bg-primary/50 text-icon-primary hover:bg-primary/80'
        : 'bg-elevated! text-highlighted hover:bg-elevated/30',
      (!isSubmittable || isMath) && 'text-muted',
    )"
    type="button"
    @click="submit"
  >
    <Icon :name="isMath ? 'lucide:equal' : 'lucide:check'" size="40" />
  </button>
</template>
