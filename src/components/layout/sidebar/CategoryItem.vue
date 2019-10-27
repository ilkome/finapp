<script>
import Icon from '@/components/icon/Icon'

export default {
  components: {
    Icon
  },

  props: {
    category: {
      type: Object,
      required: true
    }
  },

  computed: {
    childCategoriesIds () {
      return this.$store.getters.getChildCategoriesIds(this.category.id)
    }
  }
}
</script>

<template lang="pug">
.category(@click="$emit('onClick')")
  .category__icon(@click.stop="$emit('onClickIcon')")
    Icon(
      :icon="category.icon"
      :medium="true"
      :background="category.color || $store.state.ui.defaultBgColor")

  .category__name {{ category.name }}

  .category__count(v-if="childCategoriesIds.length > 0") {{ childCategoriesIds.length }}
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/media"

.category
  display grid
  grid-template-columns 24px 1fr 24px
  grid-column-gap 20px
  padding 10px 20px
  align-items center

  &:hover
    @media $media-laptop
      background var(--c-bg-6)
  ~/._open &
    color var(--c-font-2)
    background var(--c-bg-3)
  ~/._active &
    color var(--c-font-2)
    background var(--c-bg-2)

  &__count
    text-align right
</style>
