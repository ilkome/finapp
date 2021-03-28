<script>
export default {
  data () {
    return {
      isShowForm: false
    }
  },

  computed: {
    groups () {
      const formatedGroups = {}
      if (!this.$store.state.groups) { return }
      for (const id in this.$store.state.groups.items) {
        formatedGroups[id] = {
          id,
          ...this.$store.state.groups.items[id]
        }
      }

      return formatedGroups
    }
  },

  async created () {
    await this.$store.dispatch('groups/initGroups')
  }
}
</script>

<template lang="pug">
LayoutComponentWrap
  template(slot="headerLeft")
    div {{ $t('groups.name') }}

  template(slot="contentLeft")
    //- pre {{ groups }}
    .list
      GroupsGroupItem(
        v-for="group in groups"
        :group="group"
        :key="group.id"
      )

  template(slot="contentRight")
    GroupsGroupForm
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables"

.list
  display grid
  grid-template-columns repeat(auto-fill, minmax(auto, 1fr))
  grid-column-gap 12px
  grid-row-gap 12px

  +media-laptop()
    grid-column-gap 16px
    grid-row-gap 16px
</style>
