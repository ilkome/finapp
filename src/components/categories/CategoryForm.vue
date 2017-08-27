<template lang="pug">
.form
  .input
    .input__label Name
    input.input__field(
      v-model="values.name", type="text", placeholder="Name", name="name")
    input.input__field._color(
      v-model="values.color", type="color", placeholder="Color", name="color")
  .input
    .input__label Icon
    input.input__field(
      v-model="values.icon", type="text", placeholder="Icon", name="icon")
  .input
    .input__label Parent category id
    input.input__field(
      v-model="values.parentId", type="text", placeholder="Parent category", name="parentId")
  .btn(@click="onSubmit") Save
</template>

<script>
export default {
  props: {
    values: {
      type: Object,
      required: true
    },
    onSubmit: {
      type: Function,
      required: true
    }
  }
}
</script>
