<script setup lang="ts">
import { generateId } from '~~/utils/generateId'

import type { CategoryForm, CategoryId } from '~/components/categories/types'

import { errorEmo, random } from '~/assets/js/emo'
import icons from '~/assets/js/icons'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import UiToastContent from '~/components/ui/ToastContent.vue'

const props = defineProps<{
  categoryForm: CategoryForm
  categoryId?: CategoryId
}>()

const emit = defineEmits(['updateValue', 'afterSave'])

const { $toast } = useNuxtApp()
const { t } = useI18n()
const categoriesStore = useCategoriesStore()

const editCategoryId = props.categoryId ?? generateId()
const isUpdateChildCategoriesColor = ref(true)
const isAllowChangeParent = computed(() =>
  categoriesStore.getChildsIds(props.categoryId).length === 0 && categoriesStore.categoriesForBeParent.length > 0,
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
    emit('updateValue', 'parentId', 0)
    close()
    return
  }

  emit('updateValue', 'parentId', parentId)
  // Change category color when patent category changed
  const parentCategoryColor = categoriesStore.items?.[parentId]?.color
  if (parentCategoryColor)
    emit('updateValue', 'color', parentCategoryColor)

  close()
}

/**
 * Validate
 */
function validate(values: CategoryForm) {
  if (!values.name) {
    $toast(UiToastContent, {
      data: {
        description: t('categories.form.name.error'),
        title: random(errorEmo),
      },
      toastId: 'validate',
      type: 'error',
    })

    return
  }

  // TODO: refactor
  for (const id in categoriesStore.items) {
    if (categoriesStore.items[id].name === values.name && categoriesStore.items[id].parentId === values.parentId) {
      if (editCategoryId) {
        if (editCategoryId !== id) {
          $toast(UiToastContent, {
            data: {
              description: t('categories.form.name.exist'),
              title: random(errorEmo),
            },
            toastId: 'validate',
            type: 'error',
          })
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
        })
        return
      }
    }
  }

  return true
}

async function onSave() {
  if (!validate(props.categoryForm))
    return

  await categoriesStore.addCategory({
    id: editCategoryId,
    isUpdateChildCategoriesColor: isUpdateChildCategoriesColor.value,
    values: { ...props.categoryForm },
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
          :value="categoryForm.name"
          @updateValue="(value: string) => emit('updateValue', 'name', value)"
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
        <UiCheckbox
          v-if="categoriesStore.getChildsIds(props.categoryId).length > 0"
          :checkboxValue="isUpdateChildCategoriesColor"
          :title="t('categories.form.childColor')"
          @click="isUpdateChildCategoriesColor = !isUpdateChildCategoriesColor"
        />

        <UiCheckbox
          v-if="categoriesStore.getChildsIds(props.categoryId).length === 0"
          :checkboxValue="props.categoryForm.showInQuickSelector"
          :title="t('categories.form.favoriteCategory')"
          @click="emit('updateValue', 'showInQuickSelector', !props.categoryForm.showInQuickSelector)"
        />
        <UiCheckbox
          v-if="categoriesStore.getChildsIds(props.categoryId).length === 0"
          :checkboxValue="props.categoryForm.showInLastUsed"
          :title="t('categories.form.recentCategory')"
          @click="emit('updateValue', 'showInLastUsed', !props.categoryForm.showInLastUsed)"
        />
      </div>
    </div>

    <div class="flex-center">
      <UiButtonAccent
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
        <BottomSheetClose @onClick="close" />
      </template>

      <template #default="{ close }">
        <div class="bottomSheetContent">
          <div>
            <UiTitleModal>{{ t('selectColor') }}</UiTitleModal>
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
              @click="color => emit('updateValue', 'color', color)"
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
        <BottomSheetClose @onClick="close" />
      </template>

      <template #default="{ close }">
        <div class="bottomSheetContent">
          <div class="grid gap-3 pb-1 pt-3">
            <UiTitleModal>{{ t("selectIcon") }}</UiTitleModal>
            <CategoriesItem
              :categoryId="props.categoryId"
              :category="categoryPlaceholder"
            />
          </div>

          <div class="scrollerBlock bottomSheetContentInside">
            <FormElement class="pb-4 pt-2">
              <template #label>
                {{ t('categories.form.icon.desc') }}
                <a
                  href="https://icones.js.org/collection/mdi"
                  target="_blank"
                  class="text-(--ui-primary) hover:underline"
                >Material Design Icons</a>
              </template>

              <FormInput
                :placeholder="t('categories.form.icon.placeholder')"
                :value="categoryForm.icon"
                @updateValue="(value: string) => emit('updateValue', 'icon', value)"
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
                :class="[{ '!border-(--ui-primary)': icon === props.categoryForm.icon }]"
                :style="{ background: props.categoryForm.color }"
                class="flex-center size-10 cursor-pointer rounded-full border-2 border-transparent text-icon-primary"
                @click="emit('updateValue', 'icon', icon)"
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
        <BottomSheetClose @onClick="close" />
      </template>

      <template #default="{ close }">
        <div class="bottomSheetContent">
          <UiTitleModal>{{ t('selectParent') }}</UiTitleModal>

          <div class="scrollerBlock bottomSheetContentInside">
            <UiItem2
              :isActive="props.categoryForm.parentId === 0"
              @click="onParentSelect(false, close)"
            >
              {{ t('categories.form.parent.no') }}
            </UiItem2>

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

<i18n lang="yaml">
en:
  selectIcon: Category icon
  selectColor: Category color
  selectParent: Parent category

ru:
  selectIcon: Иконка категории
  selectColor: Цвет категории
  selectParent: Родительская категория
</i18n>
