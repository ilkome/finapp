<!-- eslint-disable vue/v-on-event-hyphenation -->
<script setup lang="ts">
import { errorEmo, random, successEmo } from '~/assets/js/emo'
import type { CategoryId } from '~/components/categories/types'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { getTrnsIds } from '~/components/trns/getTrns'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useUserStore } from '~/components/user/useUser'
import { removeData } from '~/services/firebase/api'

const props = defineProps<{
  categoryId: CategoryId
}>()

const { $notify } = useNuxtApp()
const router = useRouter()
const userStore = useUserStore()
const categoriesStore = useCategoriesStore()
const trnsStore = useTrnsStore()

const { categoryId } = toRefs(props)
const category = computed(() => categoriesStore.items[categoryId.value])

const trnsItems = computed(() => trnsStore.items)
const trnsIds = computed(() =>
  getTrnsIds({
    categoriesIds: category.value?.childIds?.length > 0 ? category.value?.childIds : [categoryId.value],
    trnsItems: trnsItems.value,
  }))

const isShowDeleteConfirm = ref(false)

// TODO: translate
const deleteDescText = computed(() => {
  if (trnsIds.value && trnsIds.value.length > 0)
    return `It's also will delete ${trnsIds.value.length} trns in this category.`
})

// TODO: translate
function onClickDelete() {
  for (const id in categoriesStore.items) {
    if (categoriesStore.items[id].parentId === categoryId.value) {
      console.log('TODO')
      // $notify({
      //   title: random(errorEmo),
      //   type: 'error',
      //   text: 'You can not delete category with child categories. Remove child categories first.',
      // })
      return false
    }
  }

  isShowDeleteConfirm.value = true
}

// TODO: translate
async function onDeleteConfirm() {
  // Disable reactive when user has already redirected to categories page
  const uid = JSON.parse(JSON.stringify(userStore.uid))
  const trnsIdsS = JSON.parse(JSON.stringify(trnsIds.value))
  const categoryIdS = JSON.parse(JSON.stringify(categoryId.value))

  router.push('/categories')

  // Give some time to complete redirect
  setTimeout(async () => {
    await trnsStore.deleteTrnsByIds(trnsIdsS)
    removeData(`users/${uid}/categories/${categoryIdS}`)
      .then(() => {
        console.log('TODO')
        // $notify({
        //   type: 'success',
        //   text: trnsIdsS?.length > 0 ? `Success delete category with ${trnsIdsS.length} transactions!` : 'Success delete category!',
        //   title: random(successEmo),
        // })
      })
  }, 100)
}
</script>

<template>
  <div>
    <UiHeaderLink @click="onClickDelete">
      <div class="mdi mdi-delete-empty-outline group-hover_text-white text-xl" />
    </UiHeaderLink>

    <ModalBottomConfirm
      :show="isShowDeleteConfirm"
      :description="deleteDescText"
      @closed="isShowDeleteConfirm = false"
      @onConfirm="onDeleteConfirm"
    />
  </div>
</template>
