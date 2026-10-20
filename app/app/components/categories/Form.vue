<script setup lang="ts">
import { generateId } from '~~/utils/generateId'

import type { CategoryForm, CategoryId } from '~/components/categories/types'

import icons from '~/assets/js/icons'
import { candidatesCount, childCandidateGroups, filterCandidateGroups, hasDuplicateNames, isNameTaken } from '~/components/categories/children'
import { categoryFormSchema } from '~/components/categories/types'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { isReservedCategoryId } from '~/components/categories/utils'
import { showErrorToast } from '~/composables/useStoreSync'

const props = defineProps<{
  categoryForm: CategoryForm
  categoryId?: CategoryId
}>()

const emit = defineEmits<{
  afterSave: [id: CategoryId]
  update: [key: keyof CategoryForm, value: CategoryForm[keyof CategoryForm]]
}>()

const { t } = useI18n()
const categoriesStore = useCategoriesStore()

const editCategoryId = props.categoryId ?? generateId()
const isUpdateChildCategoriesColor = ref(true)
const prevChildIds = computed(() => props.categoryId ? categoriesStore.getChildrenIds(props.categoryId) : [])
const selectedChildIds = ref<CategoryId[]>([...prevChildIds.value])
const childrenTitle = computed(() => selectedChildIds.value.length > 0
  ? `${t('categories.form.selectChildren')} (${t('categories.form.children.selected', { count: selectedChildIds.value.length })})`
  : t('categories.form.selectChildren'))
let lastSyncedPrevIds = [...prevChildIds.value]

// Don't blow away user's in-progress selection when prevChildIds changes due
// to a realtime patch on another device. Reset only if user hasn't deviated.
watch(prevChildIds, (ids) => {
  const sameAsLastSeen
    = selectedChildIds.value.length === lastSyncedPrevIds.length
      && selectedChildIds.value.every(id => lastSyncedPrevIds.includes(id))
  if (sameAsLastSeen)
    selectedChildIds.value = [...ids]
  lastSyncedPrevIds = [...ids]
}, { flush: 'sync' })

const hasChildren = computed(() => selectedChildIds.value.length > 0)
const hadChildrenInitially = computed(() => prevChildIds.value.length > 0)
const isRootCategory = computed(() => props.categoryForm.parentId === 0)
const isNewCategory = computed(() => !props.categoryId)
// Reserved categories keep only name, color and icon editable.
const isReserved = isReservedCategoryId(props.categoryId)
const isAllowChangeParent = computed(() =>
  !isReserved
  && !hasChildren.value
  && categoriesStore.categoriesForBeParent.length > 0,
)
// A root can manage children only if it has no direct transactions of its own,
// otherwise adopting children would hide its trns from stats.
// New categories have no transactions yet, so they always qualify.
// A root that already has children keeps them even if it later gained own trns.
const canHaveChildren = computed(() =>
  isNewCategory.value
  || hadChildrenInitially.value
  || (!!props.categoryId && categoriesStore.categoriesForBeParent.includes(props.categoryId)),
)

const candidateGroups = computed(() => childCandidateGroups(categoriesStore.items, editCategoryId, prevChildIds.value))
const childrenSearch = ref('')
const filteredCandidateGroups = computed(() => filterCandidateGroups(candidateGroups.value, categoriesStore.items, childrenSearch.value))

const isAllowManageChildren = computed(() =>
  !isReserved
  && isRootCategory.value
  && canHaveChildren.value
  && (candidatesCount(candidateGroups.value) > 0 || prevChildIds.value.length > 0),
)

watch(() => props.categoryForm.parentId, (parentId) => {
  if (parentId !== 0 && selectedChildIds.value.length > 0)
    selectedChildIds.value = [...prevChildIds.value]
})

const modals = ref({
  children: false,
  colors: false,
  icon: false,
  parent: false,
})

const confirm = useConfirm()

const categoryPlaceholder = computed(() => ({
  ...props.categoryForm,
  name: props.categoryForm.name ? props.categoryForm.name : t('categories.form.name.label'),
}))

/**
 * Select parent
 */
function onParentSelect(parentId: CategoryId | false, close: () => void) {
  if (!parentId) {
    emit('update', 'parentId', 0)
    close()
    return
  }

  emit('update', 'parentId', parentId)
  // Change category color when parent category changed
  const parentCategoryColor = categoriesStore.items?.[parentId]?.color
  if (parentCategoryColor)
    emit('update', 'color', parentCategoryColor)

  close()
}

function toggleChildSelection(id: CategoryId) {
  const idx = selectedChildIds.value.indexOf(id)
  if (idx >= 0)
    selectedChildIds.value = selectedChildIds.value.filter(x => x !== id)
  else
    selectedChildIds.value = [...selectedChildIds.value, id]
}

async function applyChildrenSelection(close: () => void) {
  const removedCount = prevChildIds.value.filter(id => !selectedChildIds.value.includes(id)).length
  if (removedCount >= 2 && !await confirm.ask({ description: t('categories.form.children.confirmRemove', { count: removedCount }) })) {
    selectedChildIds.value = [...prevChildIds.value]
    return
  }
  close()
}

async function onSave() {
  const parsed = categoryFormSchema.safeParse(props.categoryForm)

  if (!parsed.success) {
    showErrorToast('categories.form.name.error')
    return
  }

  const isChildrenNameClash = isAllowManageChildren.value && hasDuplicateNames(categoriesStore.items, selectedChildIds.value)
  if (isNameTaken(categoriesStore.items, parsed.data.name, parsed.data.parentId, editCategoryId) || isChildrenNameClash) {
    showErrorToast('categories.form.name.exist')
    return
  }

  await categoriesStore.saveCategory({
    id: editCategoryId,
    isUpdateChildCategoriesColor: isUpdateChildCategoriesColor.value,
    nextChildIds: isAllowManageChildren.value ? [...selectedChildIds.value] : undefined,
    values: parsed.data,
  })
  // With client-generated UUIDs the id is final - no server remap.
  emit('afterSave', editCategoryId)
}
</script>

<template>
  <div
    v-if="props.categoryForm"
    class="grid h-full max-w-lg grid-rows-[1fr_auto] overflow-hidden px-3 md:h-auto lg:px-4"
  >
    <div class="grid content-start gap-6 overflow-y-auto py-4">
      <!-- Name -->
      <FormElement>
        <template #label>
          {{ t('categories.form.name.label') }}
        </template>

        <FormInput
          :placeholder="t('categories.form.name.placeholder')"
          :modelValue="categoryForm.name"
          @update:modelValue="(value: string) => emit('update', 'name', value)"
        />
      </FormElement>

      <!-- Parent -->
      <UiButtonWithRight
        v-if="isAllowChangeParent"
        @click="modals.parent = true"
      >
        <template #label>
          {{ t('categories.form.parent.label') }}
        </template>

        <template #value>
          {{ props.categoryForm.parentId === 0 ? t('categories.form.parent.no') : categoriesStore.items[props.categoryForm.parentId]?.name }}
        </template>
      </UiButtonWithRight>

      <!-- Children -->
      <UiButtonWithRight
        v-if="isAllowManageChildren"
        @click="modals.children = true"
      >
        <template #label>
          {{ t('categories.form.children.label') }}
        </template>

        <template #value>
          {{ selectedChildIds.length > 0 ? t('categories.form.children.selected', { count: selectedChildIds.length }) : t('categories.form.children.empty') }}
        </template>
      </UiButtonWithRight>

      <!-- Icon -->
      <UiButtonWithRight @click="modals.icon = true">
        <template #label>
          {{ t('categories.form.icon.label') }}
        </template>

        <template #value>
          <UiIconBase
            :color="props.categoryForm.color"
            :name="props.categoryForm.icon"
            invert
          />
        </template>
      </UiButtonWithRight>

      <!-- Color -->
      <UiButtonWithRight @click="modals.colors = true">
        <template #label>
          {{ t('color.label') }}
        </template>

        <template #value>
          <UiIconBase
            :color="props.categoryForm.color"
            :name="props.categoryForm.icon"
            invert
          />
        </template>
      </UiButtonWithRight>

      <!-- Options -->
      <div v-if="!isReserved">
        <UiSwitchItem
          v-if="hasChildren"
          :checkboxValue="isUpdateChildCategoriesColor"
          :title="t('categories.form.childColor')"
          @toggle="isUpdateChildCategoriesColor = !isUpdateChildCategoriesColor"
        />

        <UiSwitchItem
          v-if="!hasChildren"
          :checkboxValue="props.categoryForm.isInQuickSelector"
          :title="t('categories.form.favoriteCategory')"
          @toggle="emit('update', 'isInQuickSelector', !props.categoryForm.isInQuickSelector)"
        />
        <UiSwitchItem
          v-if="!hasChildren"
          :checkboxValue="props.categoryForm.isInRecent"
          :title="t('categories.form.recentCategory')"
          @toggle="emit('update', 'isInRecent', !props.categoryForm.isInRecent)"
        />
        <UiSwitchItem
          v-if="!hasChildren"
          :checkboxValue="!!props.categoryForm.isExcludedFromStats"
          :title="t('categories.form.excludeFromStats')"
          @toggle="emit('update', 'isExcludedFromStats', !props.categoryForm.isExcludedFromStats)"
        />
      </div>
    </div>

    <div class="flex items-center justify-center">
      <UiButtonAccent
        class="sm:max-w-xs"
        @click="onSave"
      >
        {{ t('base.save') }}
      </UiButtonAccent>
    </div>
  </div>

  <!-- Colors -->
  <Drawer
    v-if="modals.colors"
    :title="t('categories.form.selectColor')"
    contentClass="min-h-[50dvh]"
    @closed="modals.colors = false"
  >
    <template #header>
      <CategoriesItem
        :categoryId="editCategoryId"
        :category="categoryPlaceholder"
      />
    </template>

    <template #default="{ close }">
      <div class="drawer-body">
        <ColorPalette
          :activeColor="props.categoryForm.color"
          :icon="props.categoryForm.icon"
          isCategory
          @click="color => emit('update', 'color', color)"
        />
      </div>

      <div class="flex items-center justify-center p-2">
        <UiButtonAccent
          @click="close"
        >
          {{ t('base.apply') }}
        </UiButtonAccent>
      </div>
    </template>
  </Drawer>

  <!-- Icon -->
  <Drawer
    v-if="modals.icon"
    :title="t('categories.form.selectIcon')"
    contentClass="min-h-[50dvh]"
    @closed="modals.icon = false"
  >
    <template #header>
      <CategoriesItem
        :categoryId="editCategoryId"
        :category="categoryPlaceholder"
      />
    </template>

    <template #default="{ close }">
      <div class="drawer-body">
        <FormElement class="pt-2 pb-4">
          <template #label>
            {{ t('categories.form.icon.desc') }}
            <a
              href="https://icones.js.org/collection/mdi"
              target="_blank"
              class="text-primary hover:underline"
            >Material Design Icons</a>
          </template>

          <FormInput
            :placeholder="t('categories.form.icon.placeholder')"
            :modelValue="categoryForm.icon"
            @update:modelValue="(value: string) => emit('update', 'icon', value)"
          />
        </FormElement>

        <div
          v-for="(iconGroup, idx) in icons"
          :key="idx"
          class="flex flex-wrap gap-3 pb-8 last:placeholder:text-blue-400"
        >
          <div
            v-for="icon in iconGroup"
            :key="icon"
            :class="cn('flex size-10 items-center justify-center rounded-full border-2 border-transparent text-icon-primary',
                       icon === props.categoryForm.icon && 'border-primary',
            )"
            :style="{ background: props.categoryForm.color }"
            @click="emit('update', 'icon', icon)"
          >
            <Icon :name="icon" size="20" />
          </div>
        </div>
      </div>

      <div class="drawer-footer">
        <UiButtonAccent
          @click="close"
        >
          {{ t('base.apply') }}
        </UiButtonAccent>
      </div>
    </template>
  </Drawer>

  <!-- Children -->
  <Drawer
    v-if="modals.children"
    :title="childrenTitle"
    contentClass="min-h-[50dvh]"
    @closed="modals.children = false; childrenSearch = ''"
  >
    <template #header>
      <div class="px-3 pt-1 pb-2">
        <FormInput
          v-model="childrenSearch"
          :placeholder="t('categories.form.children.searchPlaceholder')"
        />
      </div>
    </template>

    <template #default="{ close }">
      <div class="drawer-body">
        <CategoriesFormChildrenList
          :groups="filteredCandidateGroups"
          :hasCandidates="candidatesCount(candidateGroups) > 0"
          :selectedIds="selectedChildIds"
          @toggle="toggleChildSelection"
        />
      </div>

      <div class="drawer-footer">
        <UiButtonAccent
          @click="applyChildrenSelection(close)"
        >
          {{ t('base.apply') }}
        </UiButtonAccent>
      </div>
    </template>
  </Drawer>

  <!-- Parent -->
  <Drawer
    v-if="modals.parent"
    :title="t('categories.form.selectParent')"
    contentClass="min-h-[50dvh]"
    @closed="modals.parent = false"
  >
    <template #default="{ close }">
      <div class="drawer-body">
        <UiChipButton
          :isActive="props.categoryForm.parentId === 0"
          @click="onParentSelect(false, close)"
        >
          {{ t('categories.form.parent.no') }}
        </UiChipButton>

        <CategoriesList
          :activeItemId="props.categoryForm.parentId"
          :ids="categoriesStore.categoriesForBeParent.filter(id => id !== categoryId)"
          class="gap-x-1!"
          @click="id => onParentSelect(id, close)"
        />
      </div>

      <div class="drawer-footer">
        <UiButtonAccent
          @click="close"
        >
          {{ t('base.apply') }}
        </UiButtonAccent>
      </div>
    </template>
  </Drawer>
</template>
