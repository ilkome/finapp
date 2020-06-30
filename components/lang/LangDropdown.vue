<script>
import ContextMenu from '~/components/shared/contextMenu/ContextMenu'
import ContextMenuItem from '~/components/shared/contextMenu/ContextMenuItem'
import Dropdown from '~/components/shared/dropdown/Dropdown'

export default {
  components: {
    ContextMenu,
    ContextMenuItem,
    Dropdown
  },

  data () {
    return {
      visibleDropdown: false
    }
  },

  computed: {
    currentLanguageName () {
      switch (this.$store.state.lang.lang) {
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
      setTimeout(() => {
        this.$store.dispatch('lang/setLang', lang)
        this.$setLang(lang)
      }, 100)
    }
  }
}
</script>

<template lang="pug">
div
  ContextMenu(
    :position="{ left: true, top: true }"
    :visible="visibleDropdown"
    @onClickOpener="visibleDropdown = !visibleDropdown")
    template(slot="opener")
      Dropdown(
        :active="visibleDropdown"
        :title="currentLanguageName")
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
