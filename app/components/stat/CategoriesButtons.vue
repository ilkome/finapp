<script setup lang="ts">
import defu from 'defu'
import { getStyles } from '~/components/ui/getStyles'
import type { ViewOptions } from '~/components/stat/types'

const props = defineProps<{
  viewOptions: ViewOptions
}>()

const emit = defineEmits<{
  changeViewOptions: [o: ViewOptions]
}>()
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
              v-if="props.viewOptions.catsView === 'list' && viewOptions.catsList.isGrouped"
              @click="emit('changeViewOptions', defu({
                catsList: {
                  isOpened: !props.viewOptions.catsList.isOpened,
                },
              }, props.viewOptions))"
            >
              <Icon
                :name="props.viewOptions.catsList.isOpened ? 'fluent:folder-open-20-regular' : 'fluent:folder-20-regular'"
                size="24"
              />
            </UiItem1>

            <!-- List -->
            <UiItem1
              v-if="props.viewOptions.catsView === 'list'"
              @click="emit('changeViewOptions', defu({
                catsList: {
                  isGrouped: !props.viewOptions.catsList.isGrouped,
                },
              }, props.viewOptions))"
            >
              <Icon
                :name="props.viewOptions.catsList.isGrouped ? 'material-symbols-light:background-dot-large-outline-sharp' : 'material-symbols-light:background-dot-small-outline-sharp'"
                size="24"
              />
            </UiItem1>

            <!-- Round -->
            <UiItem1
              v-if="props.viewOptions.catsView === 'round'"
              @click="emit('changeViewOptions', defu({
                catsRound: {
                  isGrouped: !props.viewOptions.catsRound.isGrouped,
                },
              }, props.viewOptions))"
            >
              <Icon
                :name="props.viewOptions.catsRound.isGrouped ? 'material-symbols-light:background-dot-large-outline-sharp' : 'material-symbols-light:background-dot-small-outline-sharp'"
                size="24"
              />
            </UiItem1>

            <!-- Cat view -->
            <UiItem1
              @click="emit('changeViewOptions', defu({
                catsView: props.viewOptions.catsView === 'list' ? 'round' : 'list',
              }, props.viewOptions))"
            >
              <Icon
                :name="props.viewOptions.catsView === 'list' ? 'fluent:apps-list-20-regular' : 'fluent:equal-circle-20-regular'"
                size="24"
              />
            </UiItem1>
          </div>

          <div>
            <UiCheckbox
              v-if="props.viewOptions.catsView === 'list' && !props.viewOptions.catsList.isOpened"
              :checkboxValue="props.viewOptions.catsList.isItemsBg"
              title="Show Bg"
              showCheckbox
              @onClick="emit('changeViewOptions', defu({
                catsList: {
                  isItemsBg: !props.viewOptions.catsList.isItemsBg,
                },
              }, props.viewOptions))"
            />

            <!-- Lines -->
            <UiCheckbox
              :checkboxValue="props.viewOptions.catsList.isLines"
              title="Show Lines"
              showCheckbox
              @onClick="emit('changeViewOptions', defu({
                catsList: {
                  isLines: !props.viewOptions.catsList.isLines,
                },
              }, props.viewOptions))"
            />

            <!-- Round icons -->
            <UiCheckbox
              :checkboxValue="props.viewOptions.catsList.isRoundIcon"
              title="isRoundIcon"
              showCheckbox
              @onClick="emit('changeViewOptions', defu({
                catsList: {
                  isRoundIcon: !props.viewOptions.catsList.isRoundIcon,
                },
              }, props.viewOptions))"
            />
          </div>
        </div>
      </template>
    </VDropdown>
  </div>
</template>
