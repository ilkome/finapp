<template lang="pug">
.confirmPop
  .confirmPop__in
    template(v-if="avaliableForDelete(category.id).allow")
      .confirmPop__text._delete Delete category?
      .confirmPop__actionItem(@click.prevent.stop="closeConfirmPop()"): .fa.fa-ban
      .confirmPop__actionItem._delete(@click.prevent.stop="deleteCategory(category.id)"): .fa.fa-check
    template(v-else)
      .confirmPop__text._delete {{ avaliableForDelete(category.id).explain }}
      .confirmPop__actionItem(@click.prevent.stop="closeConfirmPop()"): .fa.fa-check
</template>

<script>
export default {
  props: {
    category: {
      type: Object,
      required: true
    },
    avaliableForDelete: {
      type: Function,
      required: true
    },
    deleteCategory: {
      type: Function,
      required: true
    },
    closeConfirmPop: {
      type: Function,
      required: true
    }
  }
}
</script>
