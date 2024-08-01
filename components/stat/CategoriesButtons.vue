<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'

const props = defineProps<{
  catsView: 'list' | 'round'
  isGroupCategoriesByParent?: boolean
  isGroupCategoriesByParentRounded?: boolean
  isShowChilds?: boolean
  isShowLinesChart?: boolean
}>()

const emit = defineEmits<{
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
      v-if="props.catsView === 'list'"
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
        <div class="p-1">
          <UiCheckbox
            :checkboxValue="isShowLinesChart"
            title="Show Lines"
            showCheckbox
            @onClick="emit('toggleChart')"
          />
        </div>

        <div class="p-1">
          <UiCheckbox
            :checkboxValue="isSimpleIcon"
            title="isSimpleIcon"
            showCheckbox
            @onClick="isSimpleIcon = !isSimpleIcon"
          />
        </div>
      </template>
    </VDropdown>

    <!-- Folder -->
    <div
      v-if="props.catsView === 'list' && props.isGroupCategoriesByParent"
      :class="getStyles('item', ['link', 'bg', 'center', 'minh2', 'minw1', 'rounded'])"
      class="justify-center text-xl"
      @click="emit('toggleCats')"
    >
      <Icon
        :name="isShowChilds ? 'fluent:folder-open-20-regular' : 'fluent:folder-20-regular'"
        size="18"
      />
    </div>

    <div
      v-if="props.catsView === 'round'"
      :class="getStyles('item', ['link', 'bg', 'center', 'minh2', 'minw1', 'rounded'])"
      class="justify-center text-xl"
      @click="emit('toggleGroupByParentRounded')"
    >
      <Icon
        :name="props.isGroupCategoriesByParentRounded ? 'material-symbols-light:background-dot-large-outline-sharp' : 'material-symbols-light:background-dot-small-outline-sharp'"
        size="18"
      />
    </div>

    <div
      v-if="props.catsView === 'list'"
      :class="getStyles('item', ['link', 'bg', 'center', 'minh2', 'minw1', 'rounded'])"
      class="justify-center text-xl"
      @click="emit('toggleGroupByParentList')"
    >
      <Icon
        :name="props.isGroupCategoriesByParent ? 'material-symbols-light:background-dot-large-outline-sharp' : 'material-symbols-light:background-dot-small-outline-sharp'"
        size="18"
      />
    </div>

    <!-- Cat view -->
    <div
      :class="getStyles('item', ['link', 'bg', 'center', 'minh2', 'minw1', 'rounded'])"
      class="justify-center text-xl"
      @click="emit('toggleCatView')"
    >
      <Icon
        :name="props.catsView === 'list' ? 'fluent:apps-list-20-regular' : 'fluent:equal-circle-20-regular'"
        size="18"
      />
    </div>
  </div>
</template>
