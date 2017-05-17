<template lang="pug">
.categoryItem__edit
  .form
    .input
      input.input__field(
        v-model.lazy="values.name",
        type="text" name="name")
    .input
      input.input__field(
        v-model.lazy="values.parentId",
        type="text" name="parentId")
    .btn(@click="submit()") Update

    pre {{ values }}
</template>

<script>
export default {
  props: {
    category: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      values: {
        ...this.category,
        name: this.category.name,
        parentId: this.category.parentId
      }
    }
  },

  methods: {
    submit() {
      this.$store.dispatch('updateCategory', this.values)
    }
  }
}
</script>
