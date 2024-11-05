<script setup lang="ts">
import type { ToastOptions } from 'vue3-toastify'
import { errorEmo, random } from '~/assets/js/emo'
import icons from '~/assets/js/icons'
import type { CategoryForm, CategoryId } from '~/components/categories/types'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import UiToastContent from '~/components/ui/ToastContent.vue'
import { generateId } from '~~/utils/generateId'

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

// const tabs = computed(() => [{
//   id: 'data',
//   name: t('categories.form.data.label'),
// }, {
//   id: 'parent',
//   isHidden: !categoriesStore.hasItems,
//   name: t('categories.form.parent.label'),
// }, {
//   id: 'colors',
//   name: t('categories.form.colors.label'),
// }, {
//   id: 'icon',
//   name: t('categories.form.icon.label'),
// }])

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
    class="grid h-full max-w-lg grid-rows-[1fr,auto] overflow-hidden px-2 pt-2 md:px-6"
  >
    <!-- Content -->
    <div class="grid content-start gap-6 overflow-y-auto py-4">
      <!-- Name -->
      <UiFormElement>
        <template #label>
          {{ t('categories.form.name.label') }}
        </template>

        <UiFormInput
          :placeholder="t('categories.form.name.placeholder')"
          :value="props.categoryForm.name ?? ''"
          @updateValue="(value: string) => emit('updateValue', 'name', value)"
        />
      </UiFormElement>

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
            class="ml-0 !w-7 !text-base leading-none"
          />
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
            class="!w-7 !text-xl leading-none"
          />
        </template>
      </UiItem2>

      <!-- Parent -->
      <UiItem2 @click="modals.parent = true">
        <template #label>
          {{ t('categories.form.parent.label') }}
        </template>

        <template #value>
          {{ props.categoryForm.parentId === 0 ? t('categories.form.parent.no') : categoriesStore.items[props.categoryForm.parentId]?.name }}
        </template>
      </UiItem2>

      <!-- Options -->
      <div>
        <UiTitle class="pb-2">
          {{ t('settings.options') }}
        </UiTitle>

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
        @click="onSave"
      >
        {{ t('base.save') }}
      </UiButtonBlue>
    </div>
  </div>

  <Teleport to="#teleports">
    <!-- Colors -->
    <BaseBottomSheet2
      v-if="modals.colors"
      isShow
      drugClassesCustom="max-w-md bg-foreground-1 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 rounded-xl"
      @closed="modals.colors = false"
    >
      <template #handler="{ close }">
        <BaseBottomSheetHandler />
        <BaseBottomSheetClose @onClick="close" />
      </template>

      <template #default="{ close }">
        <div class="bg-foreground-1 grid h-full max-h-[90vh] grid-rows-[auto,1fr,auto] overflow-hidden px-3">
          <div class="grid gap-3 py-4">
            <UiTitle>{{ t("color.label") }}</UiTitle>
            <CategoriesItem
              :categoryId="props.categoryId"
              :category="props.categoryForm"
            />
          </div>

          <div class="scrollerBlock h-full overflow-hidden overflow-y-auto">
            <div class="grid gap-6">
              <ColorPalette
                :activeColor="props.categoryForm.color"
                :isCategory="true"
                @click="color => emit('updateValue', 'color', color)"
              />

              <UiFormElement>
                <template #label>
                  {{ t('color.custom') }}
                </template>
                <input
                  :placeholder="t('color.placeholder')"
                  :value="props.categoryForm.color"
                  class="text-item-base bg-item-4 border-item-5 placeholder:text-item-2 focus:text-item-1 focus:bg-item-5 focus:border-accent-4 w-full rounded-lg border border-solid px-4 py-3 text-base font-normal transition ease-in-out focus:outline-none"
                  type="color"
                  @input="(event: HTMLInputEvent) => emit('updateValue', 'color', event.target.value)"
                >
              </UiFormElement>
            </div>
          </div>

          <div class="flex-center py-2">
            <UiButtonBlue
              maxWidth
              @click="close"
            >
              {{ t("base.save") }}
            </UiButtonBlue>
          </div>
        </div>
      </template>
    </BaseBottomSheet2>

    <!-- Parent -->
    <BaseBottomSheet2
      v-if="modals.parent"
      isShow
      drugClassesCustom="max-w-md bg-foreground-1 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 rounded-xl"
      @closed="modals.parent = false"
    >
      <template #handler="{ close }">
        <BaseBottomSheetHandler />
        <BaseBottomSheetClose @onClick="close" />
      </template>

      <template #default="{ close }">
        <div class="bg-foreground-1 grid h-full max-h-[90vh] grid-rows-[auto,1fr,auto] overflow-hidden px-3">
          <div class="grid gap-3 py-4">
            <UiTitle>{{ t('categories.form.parent.label') }}</UiTitle>
            <CategoryItem
              :categoryId="props.categoryId"
              :category="props.categoryForm"
            />
          </div>

          <div class="scrollerBlock h-full overflow-hidden overflow-y-auto">
            <template v-if="!isAllowChangeParent">
              <div class="p-4 text-base">
                {{ t('categories.form.noChangeParent') }}
              </div>
            </template>
            <template v-else>
              <div
                :class="{ '!bg-item-3': props.categoryForm.parentId === 0 }"
                class="flex-center bg-item-4 hocus_bg-item-5 mb-4 cursor-pointer gap-x-3 rounded-md px-2 py-3 text-center"
                @click="onParentSelect(false, close)"
              >
                {{ t('categories.form.parent.no') }}
              </div>
              <CategoriesList
                :activeItemId="props.categoryForm.parentId"
                :ids="categoriesStore.categoriesForBeParent.filter(id => id !== categoryId)"
                :slider="() => ({})"
                class="!gap-x-1"
                @click="id => onParentSelect(id, close)"
              />
            </template>
          </div>

          <div class="flex-center py-2">
            <UiButtonBlue
              maxWidth
              @click="close"
            >
              {{ t("base.save") }}
            </UiButtonBlue>
          </div>
        </div>
      </template>
    </BaseBottomSheet2>

    <!-- Icon -->
    <BaseBottomSheet2
      v-if="modals.icon"
      isShow
      drugClassesCustom="max-w-md bg-foreground-1 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 rounded-xl"
      @closed="modals.icon = false"
    >
      <template #handler="{ close }">
        <BaseBottomSheetHandler />
        <BaseBottomSheetClose @onClick="close" />
      </template>

      <template #default="{ close }">
        <div class="bg-foreground-1 grid h-full max-h-[90vh] grid-rows-[auto,1fr,auto] overflow-hidden px-3">
          <div class="grid gap-3 py-4">
            <UiTitle>{{ t("select") }}</UiTitle>
            <CategoriesItem
              :categoryId="props.categoryId"
              :category="props.categoryForm"
            />
          </div>

          <div class="scrollerBlock h-full overflow-hidden overflow-y-auto">
            <div
              v-for="iconGroup in icons"
              :key="JSON.stringify(iconGroup)"
              class="flex flex-wrap gap-3 pb-8"
            >
              <div
                v-for="icon in iconGroup"
                :key="icon"
                :class="[{ '!border-accent-1': icon === props.categoryForm.icon }]"
                :style="{ background: props.categoryForm.color }"
                class="flex-center size-10 cursor-pointer rounded-full border-2 border-transparent"
                @click="emit('updateValue', 'icon', icon)"
              >
                <div class="text-icon-primary text-2xl" :class="[icon]" />
              </div>
            </div>
          </div>

          <div class="flex-center py-2">
            <UiButtonBlue
              maxWidth
              @click="close"
            >
              {{ t("base.save") }}
            </UiButtonBlue>
          </div>
        </div>
      </template>
    </BaseBottomSheet2>
  </Teleport>
</template>
