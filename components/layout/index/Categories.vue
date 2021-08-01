<script>
export default {
  name: 'LayoutIndexCategories'
}
</script>

<template lang="pug">
LayoutComponentWrap(:contentPadding="false")
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
  padding 60px 0
  font-h1()
  font-size 22px
  font-weight 600
  text-align center

  +media-laptop()
    font-size 28px

.buttons
  display flex
  gap $m8

.button
  button-base-1()
  margin-top $m7
</style>
