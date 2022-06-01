<script setup lang="ts">
import { allColors } from '~/assets/js/colors'
import { saveData } from '~/services/firebase/api'
import generateId from '~/utils/id'
import icons from '~/assets/js/icons'
import type { CategoryID } from '~/components/categories/types'

const props = defineProps<{
  categoryId?: CategoryID
  categoryForm: {
    color: string
    icon: string
    name: string
    order: number
    parentId: string | 0
    showInLastUsed: boolean
    showInQuickSelector: boolean
    showStat: boolean
  }
}>()

const emit = defineEmits(['updateValue', 'afterSave'])

const { categoryId, categoryForm } = toRefs(props)
const { $store, $notify, nuxt2Context: { i18n } } = useNuxtApp()
const editCategoryId = categoryId.value ?? generateId()

const activeTab = ref('data')
const isUpdateChildCategoriesColor = ref(true)

const isAllowChangeParent = computed(() => {
  const childs = getChildCategoriesIds(categoryId.value)
  return !childs
})

/**
 * Find category with color
 *
 * @param color
 */
function findCategoryWithThisColor(color) {
  const categoriesItems = $store.state.categories.items
  if (!categoriesItems)
    return false

  const categoryIdWithThisColor = $store.getters['categories/categoriesRootIds']
    ?.find(id => categoriesItems[id]?.color === color)

  if (categoryIdWithThisColor)
    return categoriesItems[categoryIdWithThisColor]?.icon
}

/**
 * Get child categories ids
 */
function getChildCategoriesIds(categoryId: CategoryID) {
  // TODO: always return array
  if (!categoryId)
    return false

  const category = $store.state.categories.items[categoryId]
  const categoriesItems = $store.state.categories.items
  const ids = []

  if (category?.parentId === 0) {
    // TODO: filter
    for (const id in categoriesItems) {
      if (categoriesItems[id].parentId === categoryId)
        ids.push(id)
    }
  }

  if (ids.length === 0)
    return false

  return ids
}

/**
 * Select parent
 * @param parentId
 */
function onParentSelect(parentId) {
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
    return false
  }

  for (const id in categoriesItems) {
    if (categoriesItems[id].name === values.name && categoriesItems[id].parentId === values.parentId) {
      if (editCategoryId) {
        if (editCategoryId !== id) {
          $notify({
            title: '😮',
            text: i18n.t('categories.form.name.exist'),
          })
          return false
        }
      }
      else {
        $notify({
          title: '😮',
          text: i18n.t('categories.form.name.exist'),
        })
        return false
      }
    }
  }

  return true
}

function prepareForm({ values, categoryChildIds }) {
  return {
    color: values.color,
    icon: values.icon,
    name: values.name,
    order: values.order,
    parentId: values.parentId,
    showInLastUsed: categoryChildIds ? false : values.showInLastUsed,
    showInQuickSelector: categoryChildIds ? false : values.showInQuickSelector,
    showStat: categoryChildIds ? false : values.showStat,
  }
}

async function onSave() {
  const categoriesItems = $store.state.categories.items

  const isFormValid = validate({ values: categoryForm.value, categoriesItems })
  if (!isFormValid)
    return

  const uid = $store.state.user.user.uid
  const categoryChildIds = getChildCategoriesIds(editCategoryId)
  const categoryValues = prepareForm({ values: categoryForm.value, categoryChildIds })

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
  .pb-8.px-2
    UiTabs
      UiTabsItem(
        :isActive="activeTab === 'data'"
        @click="activeTab = 'data'"
      ) {{ $t('categories.form.data.label') }}

      UiTabsItem(
        v-if="$store.getters['categories/hasCategories']"
        :isActive="activeTab === 'parent'"
        @click="activeTab = 'parent'"
      ) {{ $t('categories.form.parent.label') }}

      UiTabsItem(
        :isActive="activeTab === 'colors'"
        @click="activeTab = 'colors'"
      ) {{ $t('categories.form.colors.label') }}

      UiTabsItem(
        :isActive="activeTab === 'icon'"
        @click="activeTab = 'icon'"
      ) {{ $t('categories.form.icon.label') }}

  //- Content
  //-----------------------------------
  .px-2.max-w-md
    //- Data
    //-----------------------------------
    template(v-if="activeTab === 'data'")
      .mb-4
        .pb-2.text-skin-item-base-down.text-sm.leading-none {{ $t('wallets.form.name.label') }}
        input.w-full.m-0.py-3.px-4.rounded-lg.text-base.font-normal.text-skin-item-base.bg-skin-item-main-bg.border.border-solid.border-skin-item-main-hover.placeholder_text-skin-item-base-down.transition.ease-in-out.focus_text-skin-item-base-up.focus_bg-skin-item-main-hover.focus_border-blue3.focus_outline-none(
          :placeholder="$t('categories.form.name.placeholder')"
          :value="categoryForm.name"
          type="text"
          @input="event => emit('updateValue', 'name', event.target.value)"
        )

      LazySharedContextMenuItem(
        v-if="getChildCategoriesIds(categoryId)"
        :checkboxValue="isUpdateChildCategoriesColor"
        :title="$t('categories.form.childColor')"
        showCheckbox
        @onClick="isUpdateChildCategoriesColor = !isUpdateChildCategoriesColor"
      )
      LazySharedContextMenuItem(
        v-if="!getChildCategoriesIds(categoryId)"
        :checkboxValue="categoryForm.showInLastUsed"
        :title="$t('categories.form.lastUsed')"
        showCheckbox
        @onClick="categoryForm.showInLastUsed = !categoryForm.showInLastUsed"
      )
      SharedContextMenuItem(
        v-if="!getChildCategoriesIds(categoryId)"
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
              template(v-if="findCategoryWithThisColor(color)")
                Icon(
                  :icon="color === categoryForm.color ? categoryForm.icon : findCategoryWithThisColor(color)"
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

      .pb-2.text-sm.text-skin-item-base-down {{ $t('wallets.form.colors.custom') }}
      input.cursor-pointer.w-full.h-12.p-0.border-0(v-model="categoryForm.color" type="color")

    //- Parent
    //---------------------------------
    template(v-if="activeTab === 'parent'")
      template(v-if="!isAllowChangeParent")
        //- TODO: translate
        .p-4 You can not change parent category because edited category has childs categories.

      template(v-if="isAllowChangeParent")
        .cursor-pointer.mb-4.py-3.px-2.gap-x-3.flex-center.rounded-md.text-center.bg-skin-item-main-bg.hocus_bg-skin-item-main-hover(
          :class="{ '!cursor-default !bg-skin-item-main-active': categoryForm.parentId === 0 }"
          @click="emit('updateValue', 'parentId', 0)"
        ) {{ $t('categories.form.parent.no') }}

        CategoriesList(
          :activeItemId="categoryForm.parentId"
          :ids="$store.getters['categories/categoriesForBeParent'].filter(id => id !== categoryId)"
          :slider="() => ({})"
          class="!gap-x-1"
          @onClick="onParentSelect"
        )

    //- Icon
    //---------------------------------
    template(v-if="activeTab === 'icon'")
      .flex.flex-wrap.pb-8.gap-3(v-for="iconGroup in icons")
        .cursor-pointer.w-10.h-10.rounded-full.flex-center.border-2.border-transparent(
          v-for="icon in iconGroup"
          :key="icon"
          :class="{ 'border-skin-accent-base': icon === categoryForm.icon }"
          :style="{ background: categoryForm.color }"
          @click="emit('updateValue', 'icon', icon)"
        )
          .text-2xl.text-skin-icon-base(:class="icon")

    //- Save
    //---------------------------------
    .pt-4.pb-6
      SharedButton(
        :class="['_text-center _blue2 _ml-big', { _inline: $store.state.ui.pc }]"
        :title="$t('wallets.form.save')"
        @onClick="onSave"
      )
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
