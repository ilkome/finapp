<script>
import CategoriesView from '@/components/categories/list/CategoriesView'
export default {
  components: {
    CategoriesView
  }
}
</script>

<template lang="pug">
CategoriesView(
  :ids="$store.getters.categoriesRootIds"
  v-on="$listeners"
)
</template>
