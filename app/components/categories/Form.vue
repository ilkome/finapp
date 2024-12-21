<script setup lang="ts">
import type { ToastOptions } from 'vue3-toastify'

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
const isAllowChangeParent = computed(() => categoriesStore.getChildsIds(props.categoryId).length === 0)

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
    class="grid h-full max-w-lg grid-rows-[1fr,auto] overflow-hidden px-3 md:h-auto lg:px-4"
  >
    <div class="grid content-start gap-6 overflow-y-auto py-4">
      <!-- Name -->
      <UiFormElement>
        <template #label>
          {{ t('categories.form.name.label') }}
        </template>

        <UiFormInput
          :placeholder="t('categories.form.name.placeholder')"
          :value="categoryForm.name"
          @updateValue="(value: string) => emit('updateValue', 'name', value)"
        />
      </UiFormElement>

      <!-- Parent -->
      <UiItem2
        v-if="isAllowChangeParent"
        @click="modals.parent = true"
      >
        <template #label>
          {{ t('categories.form.parent.label') }}
        </template>

        <template #value>
          {{ props.categoryForm.parentId === 0 ? t('categories.form.parent.no') : categoriesStore.items[props.categoryForm.parentId]?.name }}
        </template>
      </UiItem2>

      <!-- Icon -->
      <UiItem2 @click="modals.icon = true">
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
      </UiItem2>

      <!-- Color -->
      <UiItem2 @click="modals.colors = true">
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
      </UiItem2>

      <!-- Options -->
      <div>
        <UiTitle3 class="pb-2">
          {{ t('settings.options') }}
        </UiTitle3>

        <UiCheckbox
          v-if="categoriesStore.getChildsIds(props.categoryId).length > 0"
          :checkboxValue="isUpdateChildCategoriesColor"
          :title="t('categories.form.childColor')"
          @onClick="isUpdateChildCategoriesColor = !isUpdateChildCategoriesColor"
        />

        <UiCheckbox
          v-if="categoriesStore.getChildsIds(props.categoryId).length === 0"
          :checkboxValue="props.categoryForm.showInLastUsed"
          :title="t('categories.form.lastUsed')"
          @onClick="emit('updateValue', 'showInLastUsed', !props.categoryForm.showInLastUsed)"
        />
        <UiCheckbox
          v-if="categoriesStore.getChildsIds(props.categoryId).length === 0"
          :checkboxValue="props.categoryForm.showInQuickSelector"
          :title="t('categories.form.quickSelector')"
          @onClick="emit('updateValue', 'showInQuickSelector', !props.categoryForm.showInQuickSelector)"
        />
      </div>
    </div>

    <div class="flex-center">
      <UiButtonBlue
        rounded
        @click="onSave"
      >
        {{ t('base.save') }}
      </UiButtonBlue>
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
            <UiButtonBlue
              rounded
              @click="close"
            >
              {{ t('base.save') }}
            </UiButtonBlue>
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
            <UiFormElement class="pb-4 pt-2">
              <template #label>
                {{ t('categories.form.icon.desc') }}
                <a
                  href="https://icones.js.org/collection/mdi"
                  target="_blank"
                  class="text-accent-1 hover:underline"
                >Material Design Icons</a>
              </template>

              <UiFormInput
                :placeholder="t('categories.form.icon.placeholder')"
                :value="categoryForm.icon"
                @updateValue="(value: string) => emit('updateValue', 'icon', value)"
              />
            </UiFormElement>

            <div
              v-for="iconGroup in icons"
              :key="JSON.stringify(iconGroup)"
              class="flex flex-wrap gap-3 pb-8 last:placeholder:text-blue-400"
            >
              <div
                v-for="icon in iconGroup"
                :key="icon"
                :class="[{ '!border-accent-1': icon === props.categoryForm.icon }]"
                :style="{ background: props.categoryForm.color }"
                class="text-icon-primary flex-center size-10 cursor-pointer rounded-full border-2 border-transparent"
                @click="emit('updateValue', 'icon', icon)"
              >
                <Icon :name="icon" size="20" />
              </div>
            </div>
          </div>

          <div class="bottomSheetContentBottom">
            <UiButtonBlue
              rounded
              @click="close"
            >
              {{ t('base.save') }}
            </UiButtonBlue>
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
            <UiBox3
              :isActive="props.categoryForm.parentId === 0"
              @click="onParentSelect(false, close)"
            >
              {{ t('categories.form.parent.no') }}
            </UiBox3>

            <CategoriesList
              :activeItemId="props.categoryForm.parentId"
              :ids="categoriesStore.categoriesForBeParent.filter(id => id !== categoryId)"
              :slider="() => ({})"
              class="!gap-x-1"
              :categoriesItemProps="{
                class: 'group',
              }"
              @click="id => onParentSelect(id, close)"
            />
          </div>

          <div class="bottomSheetContentBottom">
            <UiButtonBlue
              rounded
              @click="close"
            >
              {{ t('base.save') }}
            </UiButtonBlue>
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
