<script setup lang="ts">
import type { ToastOptions } from 'vue3-toastify'
import { errorEmo, random } from '~/assets/js/emo'
import icons from '~/assets/js/icons'
import { getPreparedFormData } from '~/components/categories/getForm'
import type { CategoryForm, CategoryId } from '~/components/categories/types'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import UiToastContent from '~/components/ui/ToastContent.vue'
import { useUserStore } from '~/components/user/useUserStore'
import { saveData } from '~~/services/firebase/api'
import { generateId } from '~~/utils/generateId'

const props = defineProps<{
  categoryForm: CategoryForm
  categoryId?: CategoryId
}>()

const emit = defineEmits(['updateValue', 'afterSave'])

const { $toast } = useNuxtApp()
const { t } = useI18n()
const { categoryForm, categoryId } = toRefs(props)
const userStore = useUserStore()
const categoriesStore = useCategoriesStore()

const editCategoryId = categoryId.value ?? generateId()

const activeTab = ref('data')
const isUpdateChildCategoriesColor = ref(true)
const isAllowChangeParent = computed(() => categoriesStore.getChildsIds(categoryId.value).length === 0)

const tabs = computed(() => [{
  id: 'data',
  name: t('categories.form.data.label'),
}, {
  id: 'parent',
  isHidden: !categoriesStore.hasItems,
  name: t('categories.form.parent.label'),
}, {
  id: 'colors',
  name: t('categories.form.colors.label'),
}, {
  id: 'icon',
  name: t('categories.form.icon.label'),
}])

/**
 * Select parent
 */
function onParentSelect(parentId: CategoryId) {
  emit('updateValue', 'parentId', parentId)

  // Change category color when patent category changed
  const parentCategoryColor = categoriesStore.items[parentId]?.color
  if (parentCategoryColor)
    emit('updateValue', 'color', parentCategoryColor)
}

/**
 * Validate
 */
function validate({ categoriesItems, values }) {
  if (!values.name) {
    $toast(UiToastContent, {
      data: {
        description: t('categories.form.name.error'),
        title: random(errorEmo),
      },
      toastId: 'validate',
      type: 'error',
    } as ToastOptions)

    return
  }

  // TODO: refactor
  for (const id in categoriesItems) {
    if (categoriesItems[id].name === values.name && categoriesItems[id].parentId === values.parentId) {
      if (editCategoryId) {
        if (editCategoryId !== id) {
          $toast(UiToastContent, {
            data: {
              description: t('categories.form.name.exist'),
              title: random(errorEmo),
            },
            toastId: 'validate',
            type: 'error',
          } as ToastOptions)
          return
        }
      }
      else {
        $toast(UiToastContent, {
          data: {
            description: t('categories.form.name.exist'),
            title: random(errorEmo),
          },
          toastId: 'validate',
          type: 'error',
        } as ToastOptions)
        return
      }
    }
  }

  return true
}

async function onSave() {
  const categoriesItems = categoriesStore.items

  const isFormValid = validate({ categoriesItems, values: categoryForm.value })
  if (!isFormValid)
    return

  const uid = userStore.uid
  const categoryChildIds = categoriesStore.getChildsIds(editCategoryId)
  const categoryValues = getPreparedFormData(categoryForm.value)

  // Update category
  await saveData(`users/${uid}/categories/${editCategoryId}`, categoryValues)

  // Update child categories colors
  if (isUpdateChildCategoriesColor.value && categoryChildIds) {
    for (const childId of categoryChildIds)
      await saveData(`users/${uid}/categories/${childId}/color`, categoryValues.color)
  }

  emit('afterSave')
}
</script>

<template>
  <div
    v-if="categoryForm"
    class="grid h-full max-w-lg grid-rows-[auto,1fr,auto] overflow-hidden px-2 pt-2 md:px-6"
  >
    <UiTabs>
      <UiTabsItem
        v-for="tab in tabs"
        :key="tab.id"
        :isActive="activeTab === tab.id"
        class="md_text-lg"
        @click="activeTab = tab.id"
      >
        {{ tab.name }}
      </UiTabsItem>
    </UiTabs>

    <!-- Content -->
    <div class="overflow-y-auto py-4">
      <!-- Data -->
      <template v-if="activeTab === 'data'">
        <div class="mb-4">
          <div class="text-item-2 pb-2 text-sm leading-none">
            {{ t('wallets.form.name.label') }}
          </div>
          <input
            class="text-item-base bg-item-4 border-item-5 placeholder_text-item-2 focus_text-item-1 focus_bg-item-5 focus_border-accent-4 focus_outline-none m-0 w-full rounded-lg border border-solid px-4 py-3 text-base font-normal transition ease-in-out"
            :placeholder="t('categories.form.name.placeholder')"
            :value="categoryForm.name"
            type="text"
            @input="event => emit('updateValue', 'name', event.target.value)"
          >
        </div>

        <LazyUiCheckbox
          v-if="categoriesStore.getChildsIds(categoryId).length > 0"
          :checkboxValue="isUpdateChildCategoriesColor"
          :title="t('categories.form.childColor')"
          @onClick="isUpdateChildCategoriesColor = !isUpdateChildCategoriesColor"
        />
        <LazyUiCheckbox
          v-if="categoriesStore.getChildsIds(categoryId).length === 0"
          :checkboxValue="categoryForm.showInLastUsed"
          :title="t('categories.form.lastUsed')"
          @onClick="categoryForm.showInLastUsed = !categoryForm.showInLastUsed"
        />
        <UiCheckbox
          v-if="categoriesStore.getChildsIds(categoryId).length === 0"
          :checkboxValue="categoryForm.showInQuickSelector"
          :title="t('categories.form.quickSelector')"
          @onClick="categoryForm.showInQuickSelector = !categoryForm.showInQuickSelector"
        />
      </template>

      <!-- Colors -->
      <template v-if="activeTab === 'colors'">
        <div class="pb-4">
          <div class="pb-5">
            <LazyColorPalette
              :activeColor="categoryForm.color"
              :icon="categoryForm.icon"
              isCategory
              @click="color => emit('updateValue', 'color', color)"
            />
          </div>

          <div class="text-item-2 pb-2 text-sm">
            {{ t('wallets.form.colors.custom') }}
          </div>

          <input
            v-model="categoryForm.color"
            class="h-12 w-full cursor-pointer border-0 p-0"
            type="color"
          >
        </div>
      </template>

      <!-- Parent -->
      <!-- --------------------------------- -->
      <template v-if="activeTab === 'parent'">
        <template v-if="!isAllowChangeParent">
          <!-- TODO: translate -->
          <div class="p-4 text-base">
            {{ t('noChangeParent') }}
          </div>
        </template>
        <template v-else>
          <div
            class="flex-center bg-item-4 hocus_bg-item-5 mb-4 cursor-pointer gap-x-3 rounded-md px-2 py-3 text-center"
            :class="{ '!bg-item-3': categoryForm.parentId === 0 }"
            @click="emit('updateValue', 'parentId', 0)"
          >
            {{ t('categories.form.parent.no') }}
          </div>
          <CategoriesList
            :activeItemId="categoryForm.parentId"
            :ids="categoriesStore.categoriesForBeParent.filter(id => id !== categoryId)"
            :slider="() => ({})"
            class="!gap-x-1"
            @click="onParentSelect"
          />
        </template>
      </template>

      <!-- Icon -->
      <!-- --------------------------------- -->
      <template v-if="activeTab === 'icon'">
        <div
          v-for="iconGroup in icons"
          :key="JSON.stringify(iconGroup)"
          class="flex flex-wrap gap-3 pb-8"
        >
          <div
            v-for="icon in iconGroup"
            :key="icon"
            class="flex-center size-10 cursor-pointer rounded-full border-2 border-transparent" :class="[{ 'border-accent-2': icon === categoryForm.icon }]"
            :style="{ background: categoryForm.color }"
            @click="emit('updateValue', 'icon', icon)"
          >
            <div class="text-icon-primary text-2xl" :class="[icon]" />
          </div>
        </div>
      </template>
    </div>

    <div class="flex-center">
      <UiButtonBlue
        @click="onSave"
      >
        {{ t('base.save') }}
      </UiButtonBlue>
    </div>
  </div>
</template>

<i18n lang="yaml">
en:
  noChangeParent: You can not change parent category because edited category has child categories.
ru:
  noChangeParent: Вы не можете изменить родительскую категорию, так как редактируемая категория имеет дочерние категории.
</i18n>
