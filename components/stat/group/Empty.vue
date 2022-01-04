<script>
import { computed, toRefs, defineComponent } from '#app'
import useStatPage from '~/components/stat/useStatPage'

export default defineComponent({
  props: {
    typeText: { type: String, required: true }
  },

  setup (props) {
    const { typeText } = toRefs(props)
    const { statPage } = useStatPage()

    const isShow = computed(() => statPage.current[typeText.value]?.categoriesIds?.length === 0)

    return {
      isShow
    }
  }
})
</script>

<template lang="pug">
.pb-3.text-sm.font5(v-if="isShow") {{ $t('stat.empty') }}
</template>

<style lang="stylus" scoped>
//
</style>
