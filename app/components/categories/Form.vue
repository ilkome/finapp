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
  afterSave: []
  update: [key: keyof CategoryForm, value: CategoryForm[keyof CategoryForm]]
}>()

const { t } = useI18n()
const categoriesStore = useCategoriesStore()

const editCategoryId = props.categoryId ?? generateId()
const isUpdateChildCategoriesColor = ref(true)
const childIds = computed(() => categoriesStore.getChildrenIds(props.categoryId!))
const hasChildren = computed(() => childIds.value.length > 0)
const isAllowChangeParent = computed(() =>
  !hasChildren.value && categoriesStore.categoriesForBeParent.length > 0,
)

const modals = ref({
  colors: false,
  icon: false,
  parent: false,
})

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

async function onSave() {
  const parsed = categoryFormSchema.safeParse(props.categoryForm)

  if (!parsed.success) {
    showErrorToast('categories.form.name.error')
    return
  }

  for (const id of Object.keys(categoriesStore.items)) {
    if (categoriesStore.items[id].name === parsed.data.name && categoriesStore.items[id].parentId === parsed.data.parentId && id !== editCategoryId) {
      showErrorToast('categories.form.name.exist')
      return
    }
  }

  await categoriesStore.saveCategory({
    id: editCategoryId,
    isUpdateChildCategoriesColor: isUpdateChildCategoriesColor.value,
    values: parsed.data,
  })
  emit('afterSave')
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

  <Teleport to="body">
    <!-- Colors -->
    <BottomSheet
      v-if="modals.colors"
      isShow
      drugClassesCustom="bottomSheetDrugClassesCustom"
      @closed="modals.colors = false"
    >
      <template #handler="{ close }">
        <BottomSheetHandler />
        <BottomSheetClose @click="close" />
      </template>

      <template #default="{ close }">
        <div class="bottomSheetContent">
          <div>
            <UiTitleModal>{{ t('categories.form.selectColor') }}</UiTitleModal>
            <CategoriesItem
              :categoryId="props.categoryId"
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
        </div>
      </template>
    </BottomSheet>

    <!-- Icon -->
    <BottomSheet
      v-if="modals.icon"
      isShow
      drugClassesCustom="bottomSheetDrugClassesCustom"
      @closed="modals.icon = false"
    >
      <template #handler="{ close }">
        <BottomSheetHandler />
        <BottomSheetClose @click="close" />
      </template>

      <template #default="{ close }">
        <div class="bottomSheetContent">
          <div class="grid gap-3 pt-3 pb-1">
            <UiTitleModal>{{ t('categories.form.selectIcon') }}</UiTitleModal>
            <CategoriesItem
              :categoryId="props.categoryId"
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
              v-for="iconGroup in icons"
              :key="JSON.stringify(iconGroup)"
              class="flex flex-wrap gap-3 pb-8 last:placeholder:text-blue-400"
            >
              <div
                v-for="icon in iconGroup"
                :key="icon"
                :class="cn('flex-center text-icon-primary size-10 cursor-pointer rounded-full border-2 border-transparent',
                           icon === props.categoryForm.icon && 'border-(--ui-primary)',
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
        </div>
      </template>
    </BottomSheet>

    <!-- Parent -->
    <BottomSheet
      v-if="modals.parent"
      isShow
      drugClassesCustom="bottomSheetDrugClassesCustom"
      @closed="modals.parent = false"
    >
      <template #handler="{ close }">
        <BottomSheetHandler />
        <BottomSheetClose @click="close" />
      </template>

      <template #default="{ close }">
        <div class="bottomSheetContent">
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
              :categoriesItemProps="{ class: 'group' }"
              :ids="categoriesStore.categoriesForBeParent.filter(id => id !== categoryId)"
              :slider="() => ({})"
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
        </div>
      </template>
    </BottomSheet>
  </Teleport>
</template>
