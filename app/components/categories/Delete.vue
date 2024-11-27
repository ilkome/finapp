<script setup lang="ts">
import UiToastContent from '~/components/ui/ToastContent.vue'
import type { CategoryId } from '~/components/categories/types'
import { errorEmo, random, successEmo } from '~/assets/js/emo'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const props = defineProps<{
  categoryId: CategoryId
}>()

const { t } = useI18n()
const { $toast } = useNuxtApp()
const router = useRouter()
const categoriesStore = useCategoriesStore()
const trnsStore = useTrnsStore()

const isShowDeleteConfirm = ref(false)
const trnsIds = computed(() => trnsStore.getStoreTrnsIds({
  categoriesIds: categoriesStore.getChildsIdsOrParent(props.categoryId),
}))

// TODO: translate
const deleteDescText = computed(() => {
  if (trnsIds.value && trnsIds.value.length > 0)
    return t('categories.form.delete.alertWithTrns', { trns: t('trns.plural', trnsIds.value.length) })
  return undefined
})

function onClickDelete() {
  for (const id in categoriesStore.items) {
    if (categoriesStore.items[id]?.parentId === props.categoryId) {
      $toast(UiToastContent, {
        data: {
          description: t('categories.form.delete.errorChilds'),
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

async function onDeleteConfirm() {
  const trnsIdsS = JSON.parse(JSON.stringify(trnsIds.value))
  router.push('/categories')
  await categoriesStore.deleteCategory(JSON.parse(JSON.stringify(props.categoryId), trnsIdsS))

  // Give some time to complete redirect
  setTimeout(async () => {
    $toast(UiToastContent, {
      data: {
        description: trnsIdsS?.length > 0
          ? t('categories.form.delete.okWithTrns', { length: trnsIdsS.length, trns: t('trns.plural', trnsIdsS.length) })
          : t('categories.form.delete.okWithoutTrns'),
        title: random(successEmo),
      },
      toastId: 'delete-category-with-child-success',
      type: 'success',
    })
  }, 300)
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
