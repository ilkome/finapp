<script setup lang="ts">
import { saveData } from '~~/services/firebase/api'
import { generateId } from '~~/utils/generateId'
import icons from '~/assets/js/icons'
import type { CategoryForm, CategoryId, CategoryItem } from '~/components/categories/types'
import { allColors } from '~/assets/js/colors'
import { colors as colorsTailwind } from '~/components/color/colors'
import { getPreparedFormData } from '~/components/categories/getForm'
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
const isAllowChangeParent = computed(() => categoriesStore.getChildsIds(categoryId.value).length === 0)

const tabs = computed(() => [{
  id: 'data',
  name: $i18n.t('categories.form.data.label'),
}, {
  id: 'parent',
  isHidden: !categoriesStore.hasCategories,
  name: $i18n.t('categories.form.parent.label'),
}, {
  id: 'colors',
  name: $i18n.t('categories.form.colors.label'),
}, {
  id: 'icon',
  name: $i18n.t('categories.form.icon.label'),
}])

/**
 * Find category with color
 */
function findCategoryIconByColor(color) {
  return categoriesStore.categoriesRootIds.map(id => categoriesStore.items[id]).find(c => c?.color === color)?.icon
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
    if (categoriesItems[id].name === values.name && categoriesItems[id].parentId === values.parentId) {
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
    for (const childId of categoryChildIds)
      await saveData(`users/${uid}/categories/${childId}/color`, categoryValues.color)
  }

  emit('afterSave')
}
</script>

<template>
  <div>
    <div class="sticky z-20 backdrop-blur top-[60px] bg-foreground-1">
      <div class="px-2">
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
      </div>
    </div>

    <!-- Content -->
    <!-- ----------------------------------- -->
    <div class="pt-8 px-2 max-w-md">
      <!-- Data -->
      <!-- ----------------------------------- -->
      <template v-if="activeTab === 'data'">
        <div class="mb-4">
          <div class="pb-2 text-item-2 text-sm leading-none">
            {{ $t('wallets.form.name.label') }}
          </div>
          <input
            class="w-full m-0 py-3 px-4 rounded-lg text-base font-normal text-item-base bg-item-4 border border-solid border-item-5 placeholder_text-item-2 transition ease-in-out focus_text-item-1 focus_bg-item-5 focus_border-accent-4 focus_outline-none"
            :placeholder="$t('categories.form.name.placeholder')"
            :value="categoryForm.name"
            type="text"
            @input="event => emit('updateValue', 'name', event.target.value)"
          >
        </div>

        <LazyUiCheckbox
          v-if="categoriesStore.getChildsIds(categoryId).length > 0"
          :checkboxValue="isUpdateChildCategoriesColor"
          :title="$t('categories.form.childColor')"
          @onClick="isUpdateChildCategoriesColor = !isUpdateChildCategoriesColor"
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
          @onClick="categoryForm.showInQuickSelector = !categoryForm.showInQuickSelector"
        />
      </template>

      <!-- Colors -->
      <!-- --------------------------------- -->
      <template v-if="activeTab === 'colors'">
        <div class="pb-4">
          <!-- Tailwind -->
          <div class="pb-12">
            <div
              v-for="(colorsGroup, groupIdx) in colorsTailwind"
              :key="groupIdx"
              class="pb-1"
            >
              <div class="colors !grid-cols-11">
                <template v-for="(color, idx) in colorsGroup">
                  <div
                    v-if="+idx !== 50 && +idx !== 100 && +idx !== 200 && +idx !== 300 && +idx !== 950"
                    class="iconItem !size-9" :class="[{ '_active': color === categoryForm.color, 'pointer-events-none': !color }]"
                    :style="{ background: color === categoryForm.color ? color : 'transparent' }"
                    @click="emit('updateValue', 'color', color)"
                  >
                    <template v-if="findCategoryIconByColor(color)">
                      <UiIconBase
                        :name="color === categoryForm.color ? categoryForm.icon : findCategoryIconByColor(color)"
                        :color="color"
                      />
                    </template>
                    <template v-else-if="color === categoryForm.color">
                      <UiIconBase
                        :name="categoryForm.icon"
                        color="transparent"
                      />
                    </template>
                    <template v-else-if="color">
                      <div class="colorPreview" :style="{ background: color }" />
                    </template>
                  </div>
                </template>
              </div>
            </div>

            <!-- Hidden Colors -->
            <div
              v-for="(colorsGroup, groupIdx) in allColors"
              :key="groupIdx"
              class="pb-1 hidden"
            >
              <div class="colors">
                <div
                  v-for="(color, idx) in colorsGroup"
                  :key="idx"
                  class="iconItem" :class="[{ '_active': color === categoryForm.color, 'pointer-events-none': !color }]"
                  :style="{ background: color === categoryForm.color ? color : 'transparent' }"
                  @click="emit('updateValue', 'color', color)"
                >
                  <template v-if="findCategoryIconByColor(color)">
                    <UiIconBase
                      :name="color === categoryForm.color ? categoryForm.icon : findCategoryIconByColor(color)"
                      :color="color"
                    />
                  </template>
                  <template v-else-if="color === categoryForm.color">
                    <UiIconBase
                      :name="categoryForm.icon"
                      color="transparent"
                    />
                  </template>
                  <template v-else-if="color">
                    <div class="colorPreview" :style="{ background: color }" />
                  </template>
                </div>
              </div>
            </div>
          </div>

          <div class="pb-2 text-sm text-item-2">
            {{ $t('wallets.form.colors.custom') }}
          </div>
          <input
            v-model="categoryForm.color"
            class="cursor-pointer w-full h-12 p-0 border-0"
            type="color"
          >
        </div>
      </template>

      <!-- Parent -->
      <!-- --------------------------------- -->
      <template v-if="activeTab === 'parent'">
        <template v-if="!isAllowChangeParent">
          <!-- TODO: translate -->
          <div class="p-4">
            You can not change parent category because edited category has child categories.
          </div>
        </template>
        <template v-else>
          <div
            class="cursor-pointer mb-4 py-3 px-2 gap-x-3 flex-center rounded-md text-center bg-item-4 hocus_bg-item-5"
            :class="{ '!bg-item-3': categoryForm.parentId === 0 }"
            @click="emit('updateValue', 'parentId', 0)"
          >
            {{ $t('categories.form.parent.no') }}
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
          class="flex flex-wrap pb-8 gap-3"
        >
          <div
            v-for="icon in iconGroup"
            :key="icon"
            class="cursor-pointer w-10 h-10 rounded-full flex-center border-2 border-transparent" :class="[{ 'border-accent-2': icon === categoryForm.icon }]"
            :style="{ background: categoryForm.color }"
            @click="emit('updateValue', 'icon', icon)"
          >
            <div class="text-2xl text-icon-primary" :class="[icon]" />
          </div>
        </div>
      </template>

      <!-- Save -->
      <!-- --------------------------------- -->
      <div class="pt-4 pb-6 flex-center">
        <UiButtonBlue
          maxWidth
          @click="onSave"
        >
          {{ $t('base.save') }}
        </UiButtonBlue>
      </div>
    </div>
  </div>
</template>

<style lang="stylus" scoped>
@import "../app/assets/stylus/variables/*"

.colorPreview
  display flex
  align-items center
  justify-content center
  width 90%
  height 90%

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
