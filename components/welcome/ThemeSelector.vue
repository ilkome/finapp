<script>
import Button from '~/components/shared/button/Button'

export default {
  components: {
    Button
  }
}
</script>

<template lang="pug">
.themeSelector
  .themeSelector__item._dark(
    :class="{ _active: $store.state.ui.theme === 'dark' }"
    @click="$store.dispatch('ui/changeTheme', 'dark')"
  )
    .themeSelector__icon
      template(v-if="$store.state.ui.theme === 'dark'")
        .mdi.mdi-lightbulb-on
      template(v-else)
        .mdi.mdi-lightbulb-outline
    .themeSelector__title {{ $lang.app.theme.dark }}

  .themeSelector__item._light(
    :class="{ _active: $store.state.ui.theme === 'light' }"
    @click="$store.dispatch('ui/changeTheme', 'light')"
  )
    .themeSelector__icon
      template(v-if="$store.state.ui.theme === 'light'")
        .mdi.mdi-lightbulb-on
      template(v-else)
        .mdi.mdi-lightbulb-outline
    .themeSelector__title {{ $lang.app.theme.light }}
</template>

<style lang="stylus" scoped>
.themeSelector
  position relative
  display grid
  grid-template-columns 1fr 1fr
  grid-column-gap 40px
  padding-bottom 40px

  &__item
    flex-grow 1
    cursor pointer
    padding 25px 30px
    text-align center
    border-radius 3px
    border 1px solid transparent

    &._dark
      color rgba(150, 150, 150, 1)
      background rgba(10, 10, 10, 1)
      border-color rgba(63, 63, 63, 1)

    &._light
      color rgba(50, 50, 50, 1)
      background rgba(229, 229, 229, 1)
      border-color rgba(190, 190, 190, 1)

    &._active
      border-color rgba(44, 173, 34, 1)

  &__icon
    padding-bottom 20px
    font-size 32px
    opacity .5

    .themeSelector__item._active &
      opacity 1
      color rgba(44, 173, 34, 1)
</style>
