<script>
export default {
  name: 'TrnFormModalCats',

  methods: {
    afterClose () {
      this.$store.commit('trnForm/closeTrnFormModal', 'categories')
    }
  }
}
</script>

<template lang="pug">
TrnFormModal(@closed="afterClose")
  template(#default="{ close }")
    TrnFormCategories(@closeModal="close")
</template>
