<script>
import useStat from '~/modules/stat/useStat'

export default defineComponent({
  setup() {
    const { isEmptyStat } = useStat()

    return {
      isEmptyStat,
    }
  },
})
</script>

<template lang="pug">
.my-6.px-3.text-center(v-if="isEmptyStat")
  .text-xl.text-skin-item-base {{ $t('stat.empty') }}
  .text-sm.text-skin-item-base-down {{ $t('stat.emptyDesc') }}
</template>
