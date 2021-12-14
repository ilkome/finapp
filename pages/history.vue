<script>
import useStatPage from '~/components/stat/useStatPage'

export default {
  setup () {
    const { statPage } = useStatPage()
    return { statPage }
  },

  head () {
    return {
      title: this.$t('trns.history')
    }
  }
}
</script>

<template lang="pug">
LayoutBaseWrap(:contentPadding="false")
  template(slot="content")
    .header {{ $t('trns.history') }}

    .px-3
      .pb-4
        LazyStatFilter(v-if="statPage.filter.isShow")

      TrnsListHistory(
        :size="50"
        isShowFilter
      )
</template>

<style lang="stylus" scoped>
.header
  header-title()
</style>
