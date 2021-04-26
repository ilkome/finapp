<script>
export default {
  data () {
    return {
      visibleDropdown: false
    }
  },

  computed: {
    currentLanguageName () {
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
    },

    onClickOpener () {
      this.visibleDropdown = !this.visibleDropdown
    }
  }
}
</script>

<template lang="pug">
div
  SharedContextMenu(
    :position="{ left: true, top: true }"
    :visible="visibleDropdown"
    @onClickOpener="onClickOpener"
  )

    template(slot="opener")
      SharedDropdown(
        :active="visibleDropdown"
        :title="currentLanguageName"
      )
    template(slot="content")
      SharedContextMenuItem(
        title="🇷🇺 Russian - Русский (Не полный)"
        @onClick="changeLang('ru')")
      .context-menu-sep
      SharedContextMenuItem(
        title="🇺🇸 English - Английский"
        @onClick="changeLang('en')")
</template>

<style lang="stylus" scoped>

</style>
