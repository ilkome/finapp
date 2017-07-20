<template lang="pug">
.categoryItem._link(:class="{_active: (category.id === activeCategory.childId) || (category.id === activeCategory.parentId)}")

  //- Category with childrens
  //------------------------------------------------
  template(v-if="category.children && category.children.length && !isSearch")
    .categoryItem__content(
      @click.stop="$emit('toogleCategory', category.id)",
      aria-checked="true", tabindex="0"
    )
      .categoryItem__icon(@click.stop="$emit('setCategory', category.id)")
        .icon._link(:style="`background: ${category.color}`")
          .icon__pic: div(:class="category.icon")
      .categoryItem__name {{ category.name }}
      .categoryItem__action: .fa.fa-list

  //- Empty category
  //------------------------------------------------
  template(v-else)
    .categoryItem__content(
      @click.stop="$emit('setCategory', category.id)",
      aria-checked="true", tabindex="0"
    )
      .categoryItem__icon
        .icon(:style="`background: ${category.color}`")
          .icon__pic: div(:class="category.icon")
      .categoryItem__name {{ category.name }}

  slot
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
