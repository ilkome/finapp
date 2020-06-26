<script>
import Button from '~/components/shared/button/Button'

export default {
  components: {
    Button
  },

  methods: {
    changeLang (lang) {
      this.$store.dispatch('lang/setLang', lang)
      this.$setLang(lang)
    }
  }
}
</script>

<template lang="pug">
.themeSelector
  .themeSelector__item(
    :class="{ _active: $store.state.lang.lang === 'ru' }"
    @click="changeLang('ru')"
  ) {{ $lang.app.lang.ru }}

  .themeSelector__item(
    :class="{ _active: $store.state.lang.lang === 'en' }"
    @click="changeLang('en')"
  ) {{ $lang.app.lang.en }}
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
    border 1px solid rgba(63, 63, 63, 1)
    color rgba(150, 150, 150, 1)
    background rgba(10, 10, 10, 1)

    /.theme-light &
      color rgba(50, 50, 50, 1)
      background rgba(229, 229, 229, 1)
      border-color rgba(190, 190, 190, 1)

    &._active
      border-color rgba(44, 173, 34, 1)
</style>
