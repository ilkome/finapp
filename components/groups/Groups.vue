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
ComponentWrap
  template(slot="headerLeft")
    div {{ $lang.groups.name }}

  template(slot="contentLeft")
    //- pre {{ groups }}
    .list
      GroupItem(
        v-for="group in groups"
        :group="group"
        :key="group.id"
      )

  template(slot="contentRight")
    GroupForm
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
