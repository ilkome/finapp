<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'

const props = defineProps<{
  catsView: 'list' | 'round'
  isGroupCategoriesByParent?: boolean
  isGroupCategoriesByParentRounded?: boolean
  isShowChilds?: boolean
  isShowLinesChart?: boolean
  viewOptions: unknown
}>()

const emit = defineEmits<{
  changeViewOptions: [options: unknown]
  toggleCatView: []
  toggleCats: []
  toggleChart: []
  toggleGroupByParentList: []
  toggleGroupByParentRounded: []
}>()

const isSimpleIcon = defineModel('isSimpleIcon')
</script>

<template>
  <div class="flex gap-1">
    <VDropdown
      :overflowPadding="12"
      autoBoundaryMaxSize
      placement="bottom-start"
      class="group"
    >
      <div
        :class="getStyles('item', ['link', 'bg', 'center', 'minh2', 'minw1', 'rounded'])"
        class="justify-center text-xl"
      >
        <Icon
          name="fluent:settings-20-regular"
          size="18"
        />
      </div>

      <template #popper>
        <div class="grid gap-2 px-2">
          <div class="flex justify-end border-b border-item-3 py-2">
            <!-- Folder -->
            <UiItem1
              v-if="props.catsView === 'list' && props.isGroupCategoriesByParent"
              @click="emit('toggleCats')"
            >
              <Icon
                :name="isShowChilds ? 'fluent:folder-open-20-regular' : 'fluent:folder-20-regular'"
                size="24"
              />
            </UiItem1>

            <UiItem1
              v-if="props.catsView === 'list'"
              @click="emit('toggleGroupByParentList')"
            >
              <Icon
                :name="props.isGroupCategoriesByParent ? 'material-symbols-light:background-dot-large-outline-sharp' : 'material-symbols-light:background-dot-small-outline-sharp'"
                size="24"
              />
            </UiItem1>

            <!-- Round -->
            <UiItem1
              v-if="props.catsView === 'round'"
              @click="emit('toggleGroupByParentRounded')"
            >
              <Icon
                :name="props.isGroupCategoriesByParentRounded ? 'material-symbols-light:background-dot-large-outline-sharp' : 'material-symbols-light:background-dot-small-outline-sharp'"
                size="24"
              />
            </UiItem1>

            <!-- Cat view -->
            <UiItem1 @click="emit('toggleCatView')">
              <Icon
                :name="props.catsView === 'list' ? 'fluent:apps-list-20-regular' : 'fluent:equal-circle-20-regular'"
                size="24"
              />
            </UiItem1>
          </div>

          <div>
            <UiCheckbox
              :checkboxValue="props.viewOptions.isItemsBg"
              title="Show Bg"
              showCheckbox
              @onClick="emit('changeViewOptions', { ...props.viewOptions, isItemsBg: !props.viewOptions.isItemsBg })"
            />

            <!-- Lines -->
            <UiCheckbox
              :checkboxValue="isShowLinesChart"
              title="Show Lines"
              showCheckbox
              @onClick="emit('toggleChart')"
            />

            <!-- Round icons -->
            <UiCheckbox
              :checkboxValue="isSimpleIcon"
              title="isSimpleIcon"
              showCheckbox
              @onClick="isSimpleIcon = !isSimpleIcon"
            />
          </div>
        </div>
      </template>
    </VDropdown>
  </div>
</template>
