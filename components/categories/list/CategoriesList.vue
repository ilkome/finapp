<script>
export default {
}
</script>

<template lang="pug">
CategoriesView(
  :ids="$store.getters['categories/categoriesRootIds']"
  v-on="$listeners"
)
</template>
