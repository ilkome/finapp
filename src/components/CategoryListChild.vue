<template lang="pug">
.categoryItemChild._link(:class="{_active: category.id === activeCategory.parentId}")
  .categoryItemChild__content(
    @click.stop="$emit('setCategory', category.id)",
    aria-checked="true", tabindex="0"
  )
    .categoryItemChild__icon
      .icon(:style="`background: ${category.color}`")
        .icon__pic: div(:class="category.icon")
    .categoryItemChild__name {{ category.name }}
</template>


<script>
export default {
  props: {
    category: {
      type: Object,
      required: true
    },
    children: {
      type: Boolean,
      default: false
    },
    isSearch: {
      type: Boolean
    },
    activeCategory: {
      type: Object
    }
  }
}
</script>
