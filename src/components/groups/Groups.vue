<script>
import BudgetForm from '@/components/groups/BudgetForm'
import BudgetItem from '@/components/groups/BudgetItem'
import Button from '@/components/shared/button/Button'
import ComponentWrap from '@/components/layout/component/Component'

export default {
  components: {
    BudgetForm,
    BudgetItem,
    Button,
    ComponentWrap
  },

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
    await this.$store.dispatch('initGroups')
  }
}
</script>

<template lang="pug">
ComponentWrap
  template(slot="headerLeft")
    div {{ $lang.groups.name }}

  template(slot="contentLeft")
    .list
      BudgetItem(
        v-for="group in groups"
        :budget="group"
        :key="group.id")

  template(slot="contentRight")
    BudgetForm
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables"

.list
  display grid
  grid-template-columns repeat(auto-fill, minmax(auto, 1fr))
  grid-column-gap 12px
  grid-row-gap 12px

  +media-laptop()
    grid-column-gap 16px
    grid-row-gap 16px
</style>
