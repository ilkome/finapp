<script>
export default {
  name: 'CategoriesPage',

  head () {
    return {
      title: this.$t('categories.title')
    }
  }
}
</script>

<template lang="pug">
LayoutBaseWrap(:contentPadding="false")
  template(slot="content")
    .header {{ $t('categories.name') }}
    CategoriesList(
      :style="{ paddingTop: '0' }"
      @onClick="(id) => $store.dispatch('categories/showCategoryModal', id)"
    )

  template(slot="bottom")
    .buttons
      .button(@click="$store.dispatch('ui/setActiveTab', 'createCategory')") {{ $t('categories.new') }}
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.header
  header-title()

.buttons
  display flex
  gap $m8

.button
  button-base-1()
  margin-top $m7
</style>
