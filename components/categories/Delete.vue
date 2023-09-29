<script setup lang="ts">
import { getTrnsIds } from '~/components/trns/getTrns'
import { errorEmo, random, successEmo } from '~/assets/js/emo'
import { removeData } from '~/services/firebase/api'
import type { CategoryId } from '~/components/categories/types'

const props = defineProps<{
  categoryId: CategoryId
}>()

const { $store, $notify } = useNuxtApp()
const router = useRouter()

const { categoryId } = toRefs(props)
const category = computed(() => $store.state.categories.items[categoryId.value])

const trnsItems = computed(() => $store.state.trns.items)
const trnsIds = computed(() =>
  getTrnsIds({
    categoriesIds: category.value?.childIds?.length > 0 ? category.value?.childIds : [categoryId.value],
    trnsItems: trnsItems.value,
  }))

const isShowDeleteConfirm = ref(false)

// TODO: translate
const deleteDescText = computed(() => {
  if (trnsIds.value.length > 0)
    return `It's also will delete ${trnsIds.value.length} trns in this category.`
  return null
})

// TODO: translate
function onClickDelete() {
  for (const id in $store.state.categories.items) {
    if ($store.state.categories.items[id].parentId === categoryId.value) {
      $notify({
        title: random(errorEmo),
        type: 'error',
        text: 'You can not delete category with child categories. Remove child categories first.',
      })
      return false
    }
  }

  isShowDeleteConfirm.value = true
}

// TODO: translate
async function onDeleteConfirm() {
  // Disable reactive when user has already redirected to categories page
  const uid = JSON.parse(JSON.stringify($store.state.user.user.uid))
  const trnsIdsS = JSON.parse(JSON.stringify(trnsIds.value))
  const categoryIdS = JSON.parse(JSON.stringify(categoryId.value))

  router.push('/categories')

  // Give some time to complete redirect
  setTimeout(async () => {
    await $store.dispatch('trns/deleteTrnsByIds', trnsIdsS)
    removeData(`users/${uid}/categories/${categoryIdS}`)
      .then(() => {
        $notify({
          type: 'success',
          text: trnsIdsS?.length > 0 ? `Success delete category with ${trnsIdsS.length} transactions!` : 'Success delete category!',
          title: random(successEmo),
        })
      })
  }, 100)
}
</script>

<template lang="pug">
div
  UiHeaderLink(@click="onClickDelete")
    .mdi.mdi-delete-empty-outline.group-hover_text-white.text-xl

  ModalBottomConfirm(
    :show="isShowDeleteConfirm"
    :description="deleteDescText"
    @onClose="isShowDeleteConfirm = false"
    @onConfirm="onDeleteConfirm"
  )
</template>
