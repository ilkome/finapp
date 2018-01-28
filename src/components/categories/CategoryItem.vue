<template lang="pug">
div(:class="className" @click.prevent.stop="$emit('onClickContent', category)")
  //- Parent
  //------------------------------------------------
  template(v-if="category.parentId === 0")
    //- content
    .itemList__content
      .itemList__icon(@click.prevent.stop="$emit('onClickIcon', category)")
        .icon(
          :class="{ _link: view !== 'trnForm' }"
          :style="`background: ${category.color}`"
        )
          .icon__pic: div(:class="category.icon")

      .itemList__name
        div {{ category.name }}
        .itemList__name__list.fa.fa-list(v-if="category.child && category.child.length")

      template(v-if="view !== 'trnForm'")
        .itemList__actions
          .itemList__action(
            @click.prevent.stop="$emit('toogleEditCategory', category.id)"
          )
            template(v-if="editCategoryId === category.id")
              .fa.fa-times-circle
            template(v-else)
              .fa.fa-pencil-square-o

          .itemList__action(@click.prevent.stop="$emit('confirmPop', category.id)")
            .fa.fa-trash-o

    //- Confirm
    template(v-if="confirmPopCategoryId === category.id")
      slot(name="confirm")

    //- Child
    template(v-if="category.child && category.child.length")
      template(v-if="showedChildIds.indexOf(category.id) !== -1")
        .itemList__child
          slot(name="child")


  //- Child
  //------------------------------------------------
  template(v-else)
    //- content
    .itemListChild__content(@click.prevent="$emit('onClickContent', category)")
      .itemListChild__icon(@click.prevent.stop="$emit('onClickIcon', category)")
        .icon(
          :class="{ _link: view !== 'trnForm' }"
          :style="`background: ${category.color}`"
        )
          .icon__pic: div(:class="category.icon")

      .itemListChild__name {{ category.name }}

      template(v-if="view !== 'trnForm'")
        .itemListChild__actions
          .itemListChild__action(
            v-if="editCategoryId === category.id"
            @click.prevent.stop="$emit('toogleEditCategory', category.id)")
            .fa.fa-times-circle

          .itemListChild__action(
            v-if="editCategoryId !== category.id"
            @click.prevent.stop="$emit('toogleEditCategory', category.id)")
            .fa.fa-pencil-square-o

          .itemListChild__action(@click.prevent.stop="$emit('confirmPop', category.id)")
            .fa.fa-trash-o

    //- Confirm
    template(v-if="confirmPopCategoryId === category.id")
      slot(name="confirm")
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  props: {
    view: {
      type: String,
      default: 'page'
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
    ...mapGetters(['getFilter']),
    editCategoryId() {
      if (this.$store.state.categories.editCategory) {
        return this.$store.state.categories.editCategory.id
      } else {
        return false
      }
    },
    className() {
      return {
        itemList: this.category.parentId === 0,
        itemListChild: this.category.parentId !== 0,
        _editable: (this.$store.state.categories.editCategory && this.$store.state.categories.editCategory.id === this.category.id) || (this.getFilter.category && this.getFilter.category.id === this.category.id),
        _link: this.view === 'trnForm' || (this.category.child && this.category.child.length && this.editCategoryId !== this.category.id),
        _delete: this.confirmPopCategoryId === this.category.id,
        _open: this.showedChildIds.indexOf(this.category.id) !== -1
      }
    }
  }
}
</script>
