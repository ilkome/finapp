<script setup lang="ts">
import { generateId } from '~~/utils/generateId'

import type { CategoryForm, CategoryId } from '~/components/categories/types'

import icons from '~/assets/js/icons'
import { categoryFormSchema } from '~/components/categories/types'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
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
const isAllowChangeParent = computed(() =>
  !hasChildren.value && categoriesStore.categoriesForBeParent.length > 0,
)
// A root can manage children only if it has no direct transactions of its own,
// otherwise adopting children would hide its trns from stats.
// New categories have no transactions yet, so they always qualify.
// Existing root with own children also qualifies (legacy safety valve).
const canHaveChildren = computed(() =>
  isNewCategory.value
  || hadChildrenInitially.value
  || (!!props.categoryId && categoriesStore.categoriesForBeParent.includes(props.categoryId)),
)

const rootsWithOwnChildren = computed<Set<CategoryId>>(() => {
  const items = categoriesStore.items
  const out = new Set<CategoryId>()
  for (const cid of Object.keys(items)) {
    const pid = items[cid]?.parentId
    if (pid && pid !== 0 && typeof pid === 'string')
      out.add(pid)
  }
  return out
})

const childrenCandidateIds = computed<CategoryId[]>(() => {
  const items = categoriesStore.items
  const roots = rootsWithOwnChildren.value
  const result: CategoryId[] = []
  for (const id of Object.keys(items)) {
    if (id === 'adjustment' || id === 'transfer' || id === editCategoryId)
      continue
    const cat = items[id]
    if (!cat)
      continue
    // Currently our child → include so it appears and can be removed
    if (cat.parentId === editCategoryId) {
      result.push(id)
      continue
    }
    // Root category: adoptable only if it has no own children
    if (cat.parentId === 0) {
      if (!roots.has(id))
        result.push(id)
      continue
    }
    // Child of another root: can be reparented
    result.push(id)
  }
  return result
})

type CandidateGroup = 'current' | 'fromOther' | 'freeRoot'

const candidateGroups = computed<Record<CandidateGroup, CategoryId[]>>(() => {
  const items = categoriesStore.items
  const groups: Record<CandidateGroup, CategoryId[]> = { current: [], freeRoot: [], fromOther: [] }
  for (const id of childrenCandidateIds.value) {
    const cat = items[id]
    if (!cat)
      continue
    if (prevChildIds.value.includes(id))
      groups.current.push(id)
    else if (cat.parentId === 0)
      groups.freeRoot.push(id)
    else
      groups.fromOther.push(id)
  }
  const byName = (a: CategoryId, b: CategoryId) =>
    (items[a]?.name ?? '').localeCompare(items[b]?.name ?? '')
  groups.current.sort(byName)
  groups.freeRoot.sort(byName)
  groups.fromOther.sort(byName)
  return groups
})

const childrenSearch = ref('')

const filteredCandidateGroups = computed(() => {
  const q = childrenSearch.value.trim().toLowerCase()
  if (!q)
    return candidateGroups.value
  const items = categoriesStore.items
  const match = (id: CategoryId) => {
    const cat = items[id]
    if (!cat)
      return false
    const parentName = typeof cat.parentId === 'string' ? items[cat.parentId]?.name ?? '' : ''
    return cat.name.toLowerCase().includes(q) || parentName.toLowerCase().includes(q)
  }
  const g = candidateGroups.value
  return {
    current: g.current.filter(match),
    freeRoot: g.freeRoot.filter(match),
    fromOther: g.fromOther.filter(match),
  }
})

function getParentName(id: CategoryId): string {
  const cat = categoriesStore.items[id]
  if (!cat || cat.parentId === 0 || typeof cat.parentId !== 'string')
    return ''
  return categoriesStore.items[cat.parentId]?.name ?? ''
}

const isAllowManageChildren = computed(() =>
  isRootCategory.value
  && canHaveChildren.value
  && (childrenCandidateIds.value.length > 0 || prevChildIds.value.length > 0),
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

const childrenConfirm = ref<{ closeModal: () => void, count: number } | null>(null)

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

function applyChildrenSelection(close: () => void) {
  const removedCount = prevChildIds.value.filter(id => !selectedChildIds.value.includes(id)).length
  if (removedCount >= 2) {
    childrenConfirm.value = { closeModal: close, count: removedCount }
    return
  }
  close()
}

const childrenConfirmResolved = ref(false)

function onChildrenConfirm() {
  childrenConfirmResolved.value = true
  childrenConfirm.value?.closeModal()
  childrenConfirm.value = null
}

function onChildrenConfirmClosed() {
  if (!childrenConfirmResolved.value) {
    // User dismissed without confirming — revert selection back
    selectedChildIds.value = [...prevChildIds.value]
  }
  childrenConfirmResolved.value = false
  childrenConfirm.value = null
}

async function onSave() {
  const parsed = categoryFormSchema.safeParse(props.categoryForm)

  if (!parsed.success) {
    showErrorToast('categories.form.name.error')
    return
  }

  for (const id of Object.keys(categoriesStore.items)) {
    const cat = categoriesStore.items[id]
    if (cat && cat.name === parsed.data.name && cat.parentId === parsed.data.parentId && id !== editCategoryId) {
      showErrorToast('categories.form.name.exist')
      return
    }
  }

  // Validate uniqueness of names within the new children set
  if (isAllowManageChildren.value) {
    const finalChildren = selectedChildIds.value
    const names = new Map<string, string>()
    for (const cid of finalChildren) {
      const cat = categoriesStore.items[cid]
      if (!cat)
        continue
      if (names.has(cat.name)) {
        showErrorToast('categories.form.name.exist')
        return
      }
      names.set(cat.name, cid)
    }
  }

  const result = await categoriesStore.saveCategory({
    id: editCategoryId,
    isUpdateChildCategoriesColor: isUpdateChildCategoriesColor.value,
    nextChildIds: isAllowManageChildren.value ? [...selectedChildIds.value] : undefined,
    values: parsed.data,
  })
  emit('afterSave', result?.convexId ?? editCategoryId)
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
      <div>
        <UiSwitchItem
          v-if="hasChildren"
          :checkboxValue="isUpdateChildCategoriesColor"
          :title="t('categories.form.childColor')"
          @click="isUpdateChildCategoriesColor = !isUpdateChildCategoriesColor"
        />

        <UiSwitchItem
          v-if="!hasChildren"
          :checkboxValue="props.categoryForm.showInQuickSelector"
          :title="t('categories.form.favoriteCategory')"
          @click="emit('update', 'showInQuickSelector', !props.categoryForm.showInQuickSelector)"
        />
        <UiSwitchItem
          v-if="!hasChildren"
          :checkboxValue="props.categoryForm.showInLastUsed"
          :title="t('categories.form.recentCategory')"
          @click="emit('update', 'showInLastUsed', !props.categoryForm.showInLastUsed)"
        />
      </div>
    </div>

    <div class="flex-center">
      <UiButtonAccent
        class="sm:max-w-xs"
        rounded
        @click="onSave"
      >
        {{ t('base.save') }}
      </UiButtonAccent>
    </div>
  </div>

  <!-- Colors -->
  <BottomSheetModal
    v-if="modals.colors"
    @closed="modals.colors = false"
  >
    <template #default="{ close }">
      <div>
        <UiTitleModal>{{ t('categories.form.selectColor') }}</UiTitleModal>
        <CategoriesItem
          :categoryId="editCategoryId"
          :category="categoryPlaceholder"
        />
      </div>

      <div class="scrollerBlock bottomSheetContentInside">
        <ColorPalette
          :activeColor="props.categoryForm.color"
          :icon="props.categoryForm.icon"
          isCategory
          @click="color => emit('update', 'color', color)"
        />
      </div>

      <div class="flex-center p-2">
        <UiButtonAccent
          rounded
          @click="close"
        >
          {{ t('base.apply') }}
        </UiButtonAccent>
      </div>
    </template>
  </BottomSheetModal>

  <!-- Icon -->
  <BottomSheetModal
    v-if="modals.icon"
    @closed="modals.icon = false"
  >
    <template #default="{ close }">
      <div class="grid gap-3 pt-3 pb-1">
        <UiTitleModal>{{ t('categories.form.selectIcon') }}</UiTitleModal>
        <CategoriesItem
          :categoryId="editCategoryId"
          :category="categoryPlaceholder"
        />
      </div>

      <div class="scrollerBlock bottomSheetContentInside">
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
            :class="cn('flex-center text-icon-primary size-10 cursor-pointer rounded-full border-2 border-transparent',
                       icon === props.categoryForm.icon && 'border-primary',
            )"
            :style="{ background: props.categoryForm.color }"
            @click="emit('update', 'icon', icon)"
          >
            <Icon :name="icon" size="20" />
          </div>
        </div>
      </div>

      <div class="bottomSheetContentBottom">
        <UiButtonAccent
          rounded
          @click="close"
        >
          {{ t('base.apply') }}
        </UiButtonAccent>
      </div>
    </template>
  </BottomSheetModal>

  <!-- Children -->
  <BottomSheetModal
    v-if="modals.children"
    @closed="modals.children = false; childrenSearch = ''"
  >
    <template #default="{ close }">
      <UiTitleModal>
        {{ t('categories.form.selectChildren') }}
        <span v-if="selectedChildIds.length > 0" class="text-muted ml-2 text-sm font-normal">
          {{ t('categories.form.children.selected', { count: selectedChildIds.length }) }}
        </span>
      </UiTitleModal>

      <div class="px-3 pt-1 pb-2">
        <FormInput
          v-model="childrenSearch"
          :placeholder="t('categories.form.children.searchPlaceholder')"
        />
      </div>

      <div class="scrollerBlock bottomSheetContentInside">
        <div
          v-if="childrenCandidateIds.length === 0"
          class="text-muted p-4 text-center"
        >
          {{ t('categories.form.children.noCandidates') }}
        </div>

        <template v-else>
          <template
            v-for="group in (['current', 'freeRoot', 'fromOther'] as const)"
            :key="group"
          >
            <div
              v-if="filteredCandidateGroups[group].length > 0"
              class="pb-2"
            >
              <div class="text-muted px-3 pt-2 pb-1 text-xs tracking-wide uppercase">
                {{ t(`categories.form.children.group.${group}`) }}
              </div>

              <button
                v-for="id in filteredCandidateGroups[group]"
                :key="id"
                type="button"
                :aria-pressed="selectedChildIds.includes(id)"
                :class="cn('flex w-full items-center gap-3 px-3 py-2 text-left transition hover:bg-muted', selectedChildIds.includes(id) && 'bg-muted')"
                @click="toggleChildSelection(id)"
              >
                <div :class="cn('flex size-5 shrink-0 items-center justify-center rounded border transition', selectedChildIds.includes(id) ? 'border-primary bg-primary' : 'border-default')">
                  <Icon
                    v-if="selectedChildIds.includes(id)"
                    name="mdi:check"
                    size="14"
                    class="text-icon-primary"
                  />
                </div>
                <UiIconBase
                  :color="categoriesStore.items[id]?.color"
                  :name="categoriesStore.items[id]?.icon ?? ''"
                  invert
                />
                <div class="min-w-0 flex-1">
                  <div class="truncate">
                    {{ categoriesStore.items[id]?.name }}
                  </div>
                  <div
                    v-if="group === 'fromOther'"
                    class="text-muted truncate text-xs"
                  >
                    {{ t('categories.form.children.currentlyIn', { parent: getParentName(id) }) }}
                  </div>
                </div>
              </button>
            </div>
          </template>

          <div
            v-if="
              filteredCandidateGroups.current.length === 0
                && filteredCandidateGroups.freeRoot.length === 0
                && filteredCandidateGroups.fromOther.length === 0
            "
            class="text-muted p-4 text-center"
          >
            {{ t('categories.form.children.noMatches') }}
          </div>
        </template>
      </div>

      <div class="bottomSheetContentBottom">
        <UiButtonAccent
          rounded
          @click="applyChildrenSelection(close)"
        >
          {{ t('base.apply') }}
        </UiButtonAccent>
      </div>
    </template>
  </BottomSheetModal>

  <LayoutConfirmModal
    v-if="childrenConfirm"
    :description="t('categories.form.children.confirmRemove', { count: childrenConfirm.count })"
    @closed="onChildrenConfirmClosed"
    @confirm="onChildrenConfirm"
  />

  <!-- Parent -->
  <BottomSheetModal
    v-if="modals.parent"
    @closed="modals.parent = false"
  >
    <template #default="{ close }">
      <UiTitleModal>{{ t('categories.form.selectParent') }}</UiTitleModal>

      <div class="scrollerBlock bottomSheetContentInside">
        <UiChipButton
          :isActive="props.categoryForm.parentId === 0"
          @click="onParentSelect(false, close)"
        >
          {{ t('categories.form.parent.no') }}
        </UiChipButton>

        <CategoriesList
          :activeItemId="props.categoryForm.parentId"
          :ids="categoriesStore.categoriesForBeParent.filter(id => id !== categoryId)"
          class="!gap-x-1"
          @click="id => onParentSelect(id, close)"
        />
      </div>

      <div class="bottomSheetContentBottom">
        <UiButtonAccent
          rounded
          @click="close"
        >
          {{ t('base.apply') }}
        </UiButtonAccent>
      </div>
    </template>
  </BottomSheetModal>
</template>
