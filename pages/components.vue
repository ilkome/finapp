<script>
export default {
  name: 'ComponentsPage'
}
</script>

<template lang="pug">
.wrap
  .page
    .pageSection._sidebar
      .pageSection__title Sidebar
      .pageSection__content


    .pageSection._main
      .pageSection__title Main
      .pageSection__content
        .box
          .box__title {{ $t('money.averageExpenses') }}
          .box__subTitle 1

    .pageSection._modal
      .pageSection__title Modal

  ContextMenuItem(
    :title="$t('theme.change')"
    icon="mdi mdi-palette"
    @onClick="$store.dispatch('ui/changeTheme')"
  )
</template>

<style lang="stylus">
html
  --border rgba(0, 0, 0, .07)
  --shadow rgba(0, 0, 0, .05)

  &.dark-mode
    --border rgba(0, 0, 0, .7)
    --shadow rgba(0, 0, 0, .2)
</style>

<style lang="stylus" scoped>
@import "~assets/stylus/variables"


.box
  padding $m7
  background var(--c-bg-2)
  border 1px solid var(--border)
  border-radius $m5
  box-shadow 0 0px 10px 10px var(--shadow)

  &__title
    padding-bottom $m4
    color var(--c-font-5)
    font-size 12px

  &__subTitle
    // color #0e0e0e
    color var(--c-font-2)
    font-size 16px

.wrap
  height 100%

.page
  display grid
  grid-template-columns .3fr auto .3fr
  // height 100%
  padding-bottom $mb2

.pageSection
  padding $m9
  background var(--c-bg-2)

  &._sidebar
    background var(--c-bg-4)
    border-right 1px solid var(--c-bg-1)

  &._modal
    background var(--c-bg-2)

  &__title
    font-h1()
    padding-bottom $m8
</style>
