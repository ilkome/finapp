<script>
export default {
  props: {
    ids: {
      type: Array,
      required: true
    },
    limit: {
      type: Number,
      default: null
    }
  },

  computed: {
    categories () {
      const categores = {}
      let ids = this.ids

      if (!this.ids || this.ids.length <= 0) { return categores }

      if (this.limit) {
        ids = this.ids.slice(0, this.limit)
      }

      for (const categoryId of ids) {
        const category = this.$store.state.categories.items[categoryId]

        categores[categoryId] = {
          id: categoryId,
          ...category
        }
      }

      return categores
    }
  }
}
</script>

<template lang="pug">
.categories
  slot(:categories="categories")
</template>

<style lang="stylus" scoped>
//
</style>
