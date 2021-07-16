<script>
export default {
  name: 'StatNoStatActions'
}
</script>

<template lang="pug">
.startSomething
  .options__item(v-if="$store.getters['wallets/hasWallets'] && $store.getters['categories/hasCategories']")
    SharedButton._grey._center(
      :title="$t('createTrn')"
      @onClick="$store.dispatch('trnForm/openTrnForm', { action: 'create' })"
    )

  .options__item(v-if="!$store.getters['wallets/hasWallets'] && !$store.getters['categories/hasCategories']")
    .options__text {{ $t('welcome.firstRun.text') }}

    SharedButton._text-center._blue2(
      :title="$t('welcome.firstRun.btn')"
      @onClick="$router.push('/welcome')"
    )

  .options__item(v-if="$store.state.demo.hasDemo")
    .options__or
      .options__or__border
      .options__or__text {{ $t('welcome.or') }}

    .options__text {{ $t('welcome.demo.text') }}
    SharedButton._text-center._blue2(
      :title="$t('welcome.demo.btn')"
      @onClick="$store.dispatch('demo/createDemo')"
    )
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.startSomething
  display flex
  align-items center
  justify-content center
  padding 100px 0
  flex-flow column

  .options__item
    margin-bottom 40px
    padding 0 $m6

  .options__text
    padding-bottom $m8
    text-align center

  .options__or
    position relative
    display flex
    align-items center
    justify-content center
    padding $m9 0
    color var(--c-font-3)
    text-align center

    &__text
      position relative
      padding $m7
      background var(--c-bg-3)

    &__border
      position absolute
      top 50%
      left 0
      width 100%
      height 1px
      background var(--c-bg-6)
</style>
