<script setup lang="ts">
import { generateId } from '~/utils/generateId'
import icons from '~/assets/js/icons'
import type { CategoryForm, CategoryId, CategoryItem } from '~/components/categories/types'
import { allColors } from '~/assets/js/colors'
import { getPreparedFormData } from '~/components/categories/getForm'
import { saveData } from '~/services/firebase/api'

const props = defineProps<{
  categoryId?: CategoryId
  categoryForm: CategoryForm
}>()

const emit = defineEmits(['updateValue', 'afterSave'])

const { categoryId, categoryForm } = toRefs(props)
const { $store, $notify, nuxt2Context: { i18n } } = useNuxtApp()
const editCategoryId = categoryId.value ?? generateId()

const activeTab = ref('data')
const isUpdateChildCategoriesColor = ref(true)
const isAllowChangeParent = computed(() =>
  $store.getters['categories/getChildCategoriesIds'](categoryId.value).length === 0)

const tabs = computed(() => [{
  id: 'data',
  name: i18n.t('categories.form.data.label'),
}, {
  id: 'parent',
  name: i18n.t('categories.form.parent.label'),
  isHidden: !$store.getters['categories/hasCategories'],
}, {
  id: 'colors',
  name: i18n.t('categories.form.colors.label'),
}, {
  id: 'icon',
  name: i18n.t('categories.form.icon.label'),
}])

/**
 * Find category with color
 */
function findCategoryIconByColor(color) {
  const categoriesItems: Record<CategoryId, CategoryItem> = $store.state.categories.items
  if (!categoriesItems)
    return

  return $store.getters['categories/categoriesRootIds']
    ?.find(id => categoriesItems[id]?.color === color)
    ?.icon
}

/**
 * Select parent
 */
function onParentSelect(parentId: CategoryId) {
  emit('updateValue', 'parentId', parentId)

  // Change category color when patent category changed
  const parentCategoryColor = $store.state.categories.items[parentId]?.color
  if (parentCategoryColor)
    emit('updateValue', 'color', parentCategoryColor)
}

/**
 * Validate
 */
function validate({ values, categoriesItems }) {
  if (!values.name) {
    $notify({
      title: '😮',
      text: i18n.t('categories.form.name.error'),
    })
    return
  }

  // TODO: refactor
  for (const id in categoriesItems) {
    if (categoriesItems[id].name === values.name && categoriesItems[id].parentId === values.parentId) {
      if (editCategoryId) {
        if (editCategoryId !== id) {
          $notify({
            title: '😮',
            text: i18n.t('categories.form.name.exist'),
          })
          return
        }
      }
      else {
        $notify({
          title: '😮',
          text: i18n.t('categories.form.name.exist'),
        })
        return
      }
    }
  }

  return true
}

async function onSave() {
  const categoriesItems = $store.state.categories.items

  const isFormValid = validate({ values: categoryForm.value, categoriesItems })
  if (!isFormValid)
    return

  const uid = $store.state.user.user.uid
  const categoryChildIds = $store.getters['categories/getChildCategoriesIds'](editCategoryId)
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

<template lang="pug">
div
  .sticky.z-20.backdrop-blur.firefoxBackdropFix(
    class="top-[60px] bg-white/70 dark_bg-dark3/70"
  )
    .px-2
      UiTabs
        UiTabsItem.md_text-lg(
          v-for="tab in tabs"
          v-if="!tab.isHidden"
          :key="tab.id"
          :isActive="activeTab === tab.id"
          @click="activeTab = tab.id"
        ) {{ tab.name }}

  //- Content
  //-----------------------------------
  .pt-8.px-2.max-w-md
    //- Data
    //-----------------------------------
    template(v-if="activeTab === 'data'")
      .mb-4
        .pb-2.text-item-base-down.text-sm.leading-none {{ $t('wallets.form.name.label') }}
        input.w-full.m-0.py-3.px-4.rounded-lg.text-base.font-normal.text-item-base.bg-item-main-bg.border.border-solid.border-item-main-hover.placeholder_text-item-base-down.transition.ease-in-out.focus_text-item-base-up.focus_bg-item-main-hover.focus_border-blue3.focus_outline-none(
          :placeholder="$t('categories.form.name.placeholder')"
          :value="categoryForm.name"
          type="text"
          @input="event => emit('updateValue', 'name', event.target.value)"
        )

      LazySharedContextMenuItem(
        v-if="$store.getters['categories/getChildCategoriesIds'](categoryId).length > 0 "
        :checkboxValue="isUpdateChildCategoriesColor"
        :title="$t('categories.form.childColor')"
        showCheckbox
        @onClick="isUpdateChildCategoriesColor = !isUpdateChildCategoriesColor"
      )
      LazySharedContextMenuItem(
        v-if="$store.getters['categories/getChildCategoriesIds'](categoryId).length === 0"
        :checkboxValue="categoryForm.showInLastUsed"
        :title="$t('categories.form.lastUsed')"
        showCheckbox
        @onClick="categoryForm.showInLastUsed = !categoryForm.showInLastUsed"
      )
      SharedContextMenuItem(
        v-if="$store.getters['categories/getChildCategoriesIds'](categoryId).length === 0"
        :checkboxValue="categoryForm.showInQuickSelector"
        :title="$t('categories.form.quickSelector')"
        showCheckbox
        @onClick="categoryForm.showInQuickSelector = !categoryForm.showInQuickSelector"
      )

    //- Colors
    //---------------------------------
    template(v-if="activeTab === 'colors'")
      .pb-4
        .pb-1(
          v-for="(colorsGroup, groupIdx) in allColors"
          :key="groupIdx"
        )
          .colors
            .iconItem(
              v-for="(color, idx) in colorsGroup"
              :key="idx"
              :class="{ _active: color === categoryForm.color, 'pointer-events-none': !color }"
              :style="{ background: color === categoryForm.color ? color : 'transparent' }"
              @click="emit('updateValue', 'color', color)"
            )
              template(v-if="findCategoryIconByColor(color)")
                Icon(
                  :icon="color === categoryForm.color ? categoryForm.icon : findCategoryIconByColor(color)"
                  :background="color"
                  round
                )
              template(v-else-if="color === categoryForm.color")
                Icon(
                  :icon="categoryForm.icon"
                  background="transparent"
                  big
                )
              template(v-else-if="color")
                .colorPreview(:style="{ background: color }")

      .pb-2.text-sm.text-item-base-down {{ $t('wallets.form.colors.custom') }}
      input.cursor-pointer.w-full.h-12.p-0.border-0(v-model="categoryForm.color" type="color")

    //- Parent
    //---------------------------------
    template(v-if="activeTab === 'parent'")
      template(v-if="!isAllowChangeParent")
        //- TODO: translate
        .p-4 You can not change parent category because edited category has childs categories.

      template(v-if="isAllowChangeParent")
        .cursor-pointer.mb-4.py-3.px-2.gap-x-3.flex-center.rounded-md.text-center.bg-item-main-bg.hocus_bg-item-main-hover(
          :class="{ '!cursor-default !bg-item-main-active': categoryForm.parentId === 0 }"
          @click="emit('updateValue', 'parentId', 0)"
        ) {{ $t('categories.form.parent.no') }}

        CategoriesList(
          :activeItemId="categoryForm.parentId"
          :ids="$store.getters['categories/categoriesForBeParent'].filter(id => id !== categoryId)"
          :slider="() => ({})"
          class="!gap-x-1"
          @click="onParentSelect"
        )

    //- Icon
    //---------------------------------
    template(v-if="activeTab === 'icon'")
      .flex.flex-wrap.pb-8.gap-3(v-for="iconGroup in icons")
        .cursor-pointer.w-10.h-10.rounded-full.flex-center.border-2.border-transparent(
          v-for="icon in iconGroup"
          :key="icon"
          :class="{ 'border-accent-2': icon === categoryForm.icon }"
          :style="{ background: categoryForm.color }"
          @click="emit('updateValue', 'icon', icon)"
        )
          .text-2xl.text-icon-base(:class="icon")

    //- Save
    //---------------------------------
    .pt-4.pb-6.flex-center
      UiButtonBlue(
        maxWidth
        @click="onSave"
      ) {{ $t('base.save') }}
</template>

<style lang="stylus" scoped>
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
  padding-bottom $m8
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
      background var(--c-item-bd-hover)

  &._active
    padding 0
    background var(--c-item-bd-hover)
</style>
