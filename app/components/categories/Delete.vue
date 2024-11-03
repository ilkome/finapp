<script setup lang="ts">
import UiToastContent from '~/components/ui/ToastContent.vue'
import type { CategoryId } from '~/components/categories/types'
import { errorEmo, random, successEmo } from '~/assets/js/emo'
import { removeData } from '~~/services/firebase/api'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useUserStore } from '~/components/user/useUserStore'

const props = defineProps<{
  categoryId: CategoryId
}>()

const { $toast } = useNuxtApp()
const isDemo = useCookie('finapp.isDemo')
const router = useRouter()
const userStore = useUserStore()
const categoriesStore = useCategoriesStore()
const trnsStore = useTrnsStore()

const { categoryId } = toRefs(props)

const trnsIds = computed(() => trnsStore.getStoreTrnsIds({
  categoriesIds: categoriesStore.getChildsIdsOrParent(categoryId.value),
}))

const isShowDeleteConfirm = ref(false)

// TODO: translate
const deleteDescText = computed(() => {
  if (trnsIds.value && trnsIds.value.length > 0)
    return `This action will delete ${trnsIds.value.length} trns in this category.`

  return undefined
})

// TODO: translate
function onClickDelete() {
  for (const id in categoriesStore.items) {
    if (categoriesStore.items[id]?.parentId === categoryId.value) {
      $toast(UiToastContent, {
        data: {
          description:
            'You can not delete category with child categories. Remove child categories first.',
          title: random(errorEmo),
        },
        toastId: 'delete-category-with-child-error',
        type: 'error',
      })

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
  const categoryDeleteId = JSON.parse(JSON.stringify(categoryId.value))

  router.push('/categories')

  // Give some time to complete redirect
  setTimeout(async () => {
    await trnsStore.deleteTrnsByIds(trnsIdsS)

    if (isDemo.value) {
      delete categoriesStore.items[categoryDeleteId]
      // TODO: delete category from demo
    }
    else {
      await removeData(`users/${uid}/categories/${categoryDeleteId}`)
    }

    $toast(UiToastContent, {
      data: {
        description: trnsIdsS?.length > 0 ? `Success delete category with ${trnsIdsS.length} transactions!` : 'Success delete category!',
        title: random(successEmo),
      },
      toastId: 'delete-category-with-child-success',
      type: 'success',
    })
  }, 100)
}
</script>

<template>
  <div>
    <UiHeaderLink @click="onClickDelete">
      <div class="mdi mdi-delete-empty-outline text-xl group-hover:text-white" />
    </UiHeaderLink>

    <LayoutConfirmModal
      v-if="isShowDeleteConfirm"
      :description="deleteDescText"
      show
      @closed="isShowDeleteConfirm = false"
      @onConfirm="onDeleteConfirm"
    />
  </div>
</template>
