<template lang="pug">
.form
  .input
    .input__label Name
    input.input__field(
      v-model="formValues.name", type="text", placeholder="Name", name="name")
    input.input__field._color(
      v-model="formValues.color", type="color", placeholder="Color", name="color")
  .input
    .input__label Icon
    input.input__field(
      v-model="formValues.icon", type="text", placeholder="Icon", name="icon")
  .input
    .input__label Parent category id
    input.input__field(
      v-model="formValues.parentId", type="text", placeholder="Parent category", name="parentId")
  .btn(@click.prevent="$emit('onSubmit', formValues)") Save
</template>

<script>
export default {
  props: {
    values: {
      type: Object
    }
  },

  data() {
    return {
      // Spread values to formValues. It's prevent values to be reacrive
      formValues: {
        ...this.values
      }
    }
  }
}
</script>
