<script>
export default {
  name: 'LayoutIndexCategories'
}
</script>

<template lang="pug">
LayoutComponentWrap(:contentPadding="false")
  template(slot="headerLeft") {{ $t('categories.name') }}

  template(slot="content")
    CategoriesList(
      :style="{ paddingTop: '16px' }"
      @onClick="(id) => $store.dispatch('categories/showCategoryModal', id)"
    )

  template(slot="bottom")
    .flex
      .col
        SharedButton(
          :title="$t('categories.new')"
          className="_inline _small"
          @onClick="$store.dispatch('ui/setActiveTab', 'createCategory')"
        )
</template>

<style lang="stylus" scoped>
//
</style>
