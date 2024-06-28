<script setup lang="ts">
import { generateId } from '~/utils/generateId'
import icons from '~/assets/js/icons'
import type {
  CategoryForm,
  CategoryId,
  CategoryItem,
} from '~/components/categories/types'
import { allColors } from '~/assets/js/colors'
import { getPreparedFormData } from '~/components/categories/getForm'
import { saveData } from '~/services/firebase/api'
import { useUserStore } from '~/components/user/useUser'
import { useCategoriesStore } from '~/components/categories/useCategories'

const props = defineProps<{
  categoryForm: CategoryForm
  categoryId?: CategoryId
}>()

const emit = defineEmits(['updateValue', 'afterSave'])

const { categoryForm, categoryId } = toRefs(props)
const { $i18n, $notify } = useNuxtApp()
const userStore = useUserStore()
const categoriesStore = useCategoriesStore()

const editCategoryId = categoryId.value ?? generateId()

const activeTab = ref('data')
const isUpdateChildCategoriesColor = ref(true)
const isAllowChangeParent = computed(
  () => categoriesStore.getChildsIds(categoryId.value).length === 0,
)

const tabs = computed(() => [
  {
    id: 'data',
    name: $i18n.t('categories.form.data.label'),
  },
  {
    id: 'parent',
    isHidden: !categoriesStore.hasCategories,
    name: $i18n.t('categories.form.parent.label'),
  },
  {
    id: 'colors',
    name: $i18n.t('categories.form.colors.label'),
  },
  {
    id: 'icon',
    name: $i18n.t('categories.form.icon.label'),
  },
])

/**
 * Find category with color
 */
function findCategoryIconByColor(color) {
  const categoriesItems: Record<CategoryId, CategoryItem>
    = categoriesStore.items
  if (!categoriesItems)
    return

  return categoriesStore.categoriesRootIds?.find(
    id => categoriesItems[id]?.color === color,
  )?.icon
}

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
    $notify({
      text: $i18n.t('categories.form.name.error'),
      title: '😮',
    })
    return
  }

  // TODO: refactor
  for (const id in categoriesItems) {
    if (
      categoriesItems[id].name === values.name
      && categoriesItems[id].parentId === values.parentId
    ) {
      if (editCategoryId) {
        if (editCategoryId !== id) {
          $notify({
            text: $i18n.t('categories.form.name.exist'),
            title: '😮',
          })
          return
        }
      }
      else {
        $notify({
          text: $i18n.t('categories.form.name.exist'),
          title: '😮',
        })
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
    for (const childId of categoryChildIds) {
      await saveData(
        `users/${uid}/categories/${childId}/color`,
        categoryValues.color,
      )
    }
  }

  emit('afterSave')
}
</script>

<template>
  <div>
    <div class="sticky top-[60px] z-20 bg-foreground-4 px-2 backdrop-blur">
      <UiTabs>
        <UiTabsItem2
          v-for="item in locales"
          :key="item.slug"
          :isActive="item.slug === locale"
          class="md:text-lg"
          @click="changeLocale(item.slug)"
        >
          {{ $t(item.localeKey) }}
        </UiTabsItem2>
      </UiTabs>
    </div>

    <!-- Content -->
    <div class="max-w-md px-2 pt-8">
      <!-- Data -->
      <template v-if="activeTab === 'data'">
        <div class="mb-4">
          <div class="pb-2 text-sm leading-none text-item-2">
            {{ $t("wallets.form.name.label") }}
          </div>
          <input
            type="text"
            class="text-item-base m-0 w-full rounded-lg border border-solid border-item-5 bg-item-4 px-4 py-3 text-base font-normal transition ease-in-out placeholder:text-item-2 focus:border-accent-4 focus:bg-item-5 focus:text-item-1 focus:outline-none"
            :placeholder="$t('categories.form.name.placeholder')"
            :value="categoryForm.name"
            @input="(event) => emit('updateValue', 'name', event.target.value)"
          >
        </div>

        <LazyUiCheckbox
          v-if="categoriesStore.getChildsIds(categoryId).length > 0"
          :checkboxValue="isUpdateChildCategoriesColor"
          :title="$t('categories.form.childColor')"
          @onClick="
            isUpdateChildCategoriesColor = !isUpdateChildCategoriesColor
          "
        />
        <LazyUiCheckbox
          v-if="categoriesStore.getChildsIds(categoryId).length === 0"
          :checkboxValue="categoryForm.showInLastUsed"
          :title="$t('categories.form.lastUsed')"
          @onClick="categoryForm.showInLastUsed = !categoryForm.showInLastUsed"
        />
        <UiCheckbox
          v-if="categoriesStore.getChildsIds(categoryId).length === 0"
          :checkboxValue="categoryForm.showInQuickSelector"
          :title="$t('categories.form.quickSelector')"
          @onClick="
            categoryForm.showInQuickSelector = !categoryForm.showInQuickSelector
          "
        />
      </template>

      <!-- Colors -->
      <template v-if="activeTab === 'colors'">
        <div class="pb-4">
          <div
            v-for="(colorsGroup, groupIdx) in allColors"
            :key="groupIdx"
            class="pb-1"
          >
            <div class="colors">
              <div
                v-for="(color, idx) in colorsGroup"
                :key="idx"
                :class="{
                  '_active': color === categoryForm.color,
                  'pointer-events-none': !color,
                }"
                :style="{
                  background:
                    color === categoryForm.color ? color : 'transparent',
                }"
                @click="emit('updateValue', 'color', color)"
              >
                <template v-if="findCategoryIconByColor(color)">
                  <Icon3
                    :background="color"
                    :icon="
                      color === categoryForm.color
                        ? categoryForm.icon
                        : findCategoryIconByColor(color)
                    "
                    round
                  />
                </template>
                <template v-else-if="color === categoryForm.color">
                  <Icon3
                    :icon="categoryForm.icon"
                    background="transparent"
                    big
                  />
                </template>
                <template
                  v-else-if="color"
                  class="colorPreview"
                  :style="{ background: color }"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="pb-2 text-sm text-item-2">
          {{ $t("wallets.form.colors.custom") }}
        </div>
        <input
          v-model="categoryForm.color"
          class="h-12 w-full cursor-pointer border-0 p-0"
          type="color"
        >
      </template>

      <!-- Parent -->
      <template v-if="activeTab === 'parent'">
        <template v-if="!isAllowChangeParent" class="p-4">
          You can not change parent category because edited category has childs
          categories.
        </template>
        <template
          v-if="isAllowChangeParent"
          class="flex-center mb-4 cursor-pointer gap-x-3 rounded-md bg-item-4 px-2 py-3 text-center hocus:bg-item-5"
        >
          {{ $t("categories.form.parent.no") }}
        </template>
        <CategoriesList
          :activeItemId="categoryForm.parentId"
          :ids="
            categoriesStore.categoriesForBeParent.filter(
              (id) => id !== categoryId,
            )
          "
          :slider="() => ({})"
          class="!gap-x-1"
          @click="onParentSelect"
        />
      </template>

      <!-- Icon -->
      <template v-if="activeTab === 'icon'">
        <div v-for="iconGroup in icons" class="flex flex-wrap gap-3 pb-8">
          <div
            v-for="icon in iconGroup"
            :key="icon"
            class="flex-center h-10 w-10 cursor-pointer rounded-full border-2 border-transparent"
            :class="{ 'border-accent-2': icon === categoryForm.icon }"
            :style="{ background: categoryForm.color }"
            @click="emit('updateValue', 'icon', icon)"
          >
            <div class="text-2xl text-icon-primary">
              {{ icon }}
            </div>
          </div>
        </div>
      </template>

      <!-- Save -->
      <div class="flex-center pb-6 pt-4">
        <UiButtonBlue maxWidth @click="onSave">
          {{ $t("base.save") }}
        </UiButtonBlue>
      </div>
    </div>

    <!-- Other content -->
  </div>
</template>

<style lang="stylus" scoped>
@import "../assets/stylus/variables"

.colorPreview
  display flex
  align-items center
  justify-content center
  width 90%
  height 90%
  border-radius 50%

.colors
  display grid
  grid-template-columns repeat(8, minmax(auto, 1fr))
  padding-bottom 20px
  &:last-child
    padding-bottom 0

.iconItem
  display flex
  align-items center
  justify-content center
  width 40px
  height 40px
  max-width 40px
  max-height 40px
  font-size 24px
  border-radius 50%

  +media-hover()
    &:not(._empty)
      cursor pointer
      background var(--accent-4)

  &._active
    padding 0
    background var(--accent-4)
</style>
