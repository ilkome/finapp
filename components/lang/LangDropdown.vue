<script>
export default {
  data () {
    return {
      visibleDropdown: false
    }
  },

  computed: {
    currentLanguageName () {
      console.log(this.$i18n.locale)

      switch (this.$i18n.locale) {
        case 'ru':
          return '🇷🇺 Russian - Русский'
        default:
          return '🇺🇸 English - Английский'
      }
    }
  },

  methods: {
    changeLang (lang) {
      this.visibleDropdown = false
      this.$store.dispatch('lang/setLang', lang)
    }
  }
}
</script>

<template lang="pug">
div
  ContextMenu(
    :position="{ left: true, top: true }"
    :visible="visibleDropdown"
    @onClickOpener="visibleDropdown = !visibleDropdown"
  )

    template(slot="opener")
      Dropdown(
        :active="visibleDropdown"
        :title="currentLanguageName"
      )
    template(slot="content")
      ContextMenuItem(
        title="🇷🇺 Russian - Русский (Не полный)"
        @onClick="changeLang('ru')")
      .context-menu-sep
      ContextMenuItem(
        title="🇺🇸 English - Английский"
        @onClick="changeLang('en')")
</template>

<style lang="stylus" scoped>

</style>
