<template lang="pug">
div(:class="className")
  //- Parent
  //------------------------------------------------
  template(v-if="category.parentId === 0")
    //- content
    .categoryItem__content(@click.prevent="$emit('onClickContent', category)")
      .categoryItem__icon
        .icon._link(:style="`background: ${category.color}`")
          .icon__pic: div(:class="category.icon")

      .categoryItem__name
        div {{ category.name }}
        .categoryItem__name__list.fa.fa-list(v-if="category.child && category.child.length && editCategoryId !== category.id")

      .categoryItem__action(
        v-if="editCategoryId === category.id"
        @click.prevent.stop="$emit('toogleEditCategory', category.id)")
        .fa.fa-times-circle

      template(v-if="isShowEditActions && editCategoryId !== category.id")
        .categoryItem__action(
          @click.prevent.stop="$emit('toogleEditCategory', category.id)")
          .fa.fa-pencil-square-o

      .categoryItem__action(
        v-if="isShowEditActions"
        @click.prevent.stop="$emit('confirmPop', category.id)")
        .fa.fa-trash-o

    //- Confirm
    template(v-if="confirmPopCategoryId === category.id")
      slot(name="confirm")

    //- Child
    template(v-if="category.child && category.child.length")
      template(v-if="showedChildIds.indexOf(category.id) !== -1")
        .categoryItem__child
          slot(name="child")


  //- Child
  //------------------------------------------------
  template(v-else)
    //- content
    .categoryItemChild__content(@click.prevent="$emit('onClickContent', category)")
      .categoryItemChild__icon
        .icon._link(:style="`background: ${category.color}`")
          .icon__pic: div(:class="category.icon")

      .categoryItemChild__name {{ category.name }}

      .categoryItem__action(
        v-if="editCategoryId === category.id"
        @click.prevent.stop="$emit('toogleEditCategory', category.id)")
        .fa.fa-times-circle

      .categoryItem__action(
        v-if="isShowEditActions && editCategoryId !== category.id"
        @click.prevent.stop="$emit('toogleEditCategory', category.id)")
        .fa.fa-pencil-square-o

      .categoryItem__action(
        v-if="isShowEditActions"
        @click.prevent.stop="$emit('confirmPop', category.id)")
        .fa.fa-trash-o

    //- Confirm
    template(v-if="confirmPopCategoryId === category.id")
      slot(name="confirm")
</template>

<script>
export default {
  props: {
    view: {
      type: String,
      default: 'page'
    },
    isShowEditActions: {
      type: Boolean,
      default: false
    },
    category: {
      type: Object,
      required: true
    },
    confirmPopCategoryId: {
      type: [Number, Boolean, String],
      required: true
    },
    showedChildIds: {
      type: Array,
      required: true
    }
  },

  computed: {
    editCategoryId() {
      if (this.$store.state.categories.editCategory) {
        return this.$store.state.categories.editCategory.id
      } else {
        return false
      }
    },
    className() {
      return {
        categoryItem: this.category.parentId === 0,
        categoryItemChild: this.category.parentId !== 0,
        _editable: this.$store.state.categories.editCategory && this.$store.state.categories.editCategory.id === this.category.id,
        _link: this.view === 'trnForm' || (this.category.child && this.category.child.length && this.editCategoryId !== this.category.id),
        _delete: this.confirmPopCategoryId === this.category.id,
        _open: this.showedChildIds.indexOf(this.category.id) !== -1
      }
    }
  }
}
</script>
