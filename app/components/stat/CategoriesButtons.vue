<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'
import type { ViewOptions } from '~/components/stat/types'

const props = defineProps<{
  viewOptions: ViewOptions
}>()

const emit = defineEmits<{
  changeViewOptions: [o: DeepPartial<ViewOptions>]
}>()

const { t } = useI18n()
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
        <div class="grid gap-2 px-2 pb-2">
          <div
            v-if="props.viewOptions.catsView === 'list'"
            class="border-t border-item-3 pt-2"
          >
            <UiElement
              @click="emit('changeViewOptions', {
                catsList: {
                  isItemsBg: false,
                  isRoundIcon: true,
                  isLines: true,
                },
              })"
            >
              {{ t('standard') }}
            </UiElement>

            <UiElement
              @click="emit('changeViewOptions', {
                catsList: {
                  isItemsBg: false,
                  isRoundIcon: false,
                  isLines: false,
                },
              })"
            >
              {{ t('minimal') }}
            </UiElement>
          </div>

          <div
            v-if="props.viewOptions.catsView === 'list'"
            class="border-t border-item-3 pt-2"
          >
            <UiCheckbox
              v-if="props.viewOptions.catsView === 'list' && !props.viewOptions.catsList.isOpened"
              :checkboxValue="props.viewOptions.catsList.isItemsBg"
              :title="t('isItemsBg')"
              showCheckbox
              @onClick="emit('changeViewOptions', {
                catsList: {
                  isItemsBg: !props.viewOptions.catsList.isItemsBg,
                },
              })"
            />

            <!-- Lines -->
            <UiCheckbox
              :checkboxValue="props.viewOptions.catsList.isLines"
              :title="t('isLines')"
              showCheckbox
              @onClick="emit('changeViewOptions', {
                catsList: {
                  isLines: !props.viewOptions.catsList.isLines,
                },
              })"
            />

            <!-- Round icons -->
            <UiCheckbox
              :checkboxValue="props.viewOptions.catsList.isRoundIcon"
              :title="t('isRoundIcon')"
              showCheckbox
              @onClick="emit('changeViewOptions', {
                catsList: {
                  isRoundIcon: !props.viewOptions.catsList.isRoundIcon,
                },
              })"
            />
          </div>
        </div>
      </template>
    </VDropdown>
  </div>
</template>

<i18n lang="yaml">
en:
  isItemsBg: Items background
  isLines: Amount lines
  isRoundIcon: Rounded categories
  minimal: Minimal
  standard: Standard

ru:
  isItemsBg: Фон категорий
  isLines: Линии сумм
  isRoundIcon: Скуруглённые категории
  minimal: Легкий
  standard: Стандартный
</i18n>
