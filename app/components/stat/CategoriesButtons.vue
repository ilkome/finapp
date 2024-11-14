<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'
import type { ViewOptions } from '~/components/stat/types'
import type { DeepPartial } from '~~/utils/types'
import type { StatConfigProvider } from '~/components/stat/useStatConfig'

const props = defineProps<{
  isShowFavorites?: boolean
  isShowGrouping?: boolean
  isShowRecent?: boolean
  viewOptions: ViewOptions
}>()

const emit = defineEmits<{
  changeViewOptions: [o: DeepPartial<ViewOptions>]
}>()

const statConfig = inject('statConfig') as StatConfigProvider

const { t } = useI18n()
</script>

<template>
  <div class="flex gap-1">
    <UPopover class="group">
      <div
        :class="getStyles('item', ['link', 'bg', 'center', 'minh2', 'minw1', 'rounded'])"
        class="justify-center text-xl"
      >
        <Icon
          name="lucide:circle-ellipsis"
          size="18"
        />
      </div>

      <template #panel>
        <div class="p-1">
          <UiElement
            @click="statConfig.updateConfig('isShowEmptyCategories', !statConfig.config.value.isShowEmptyCategories)"
          >
            <SharedInputsCheckbox :value="statConfig.config.value.isShowEmptyCategories" />
            {{ t('isShowEmptyCategories') }}
          </UiElement>
        </div>

        <!-- Round -->
        <div
          v-if="props.viewOptions.catsView === 'round'"
          class="grid gap-2 px-2 pb-2"
        >
          <UiElement
            v-if="props.isShowFavorites"
            @click="emit('changeViewOptions', {
              catsRound: { isShowFavorites: !props.viewOptions.catsRound.isShowFavorites },
            })"
          >
            <SharedInputsCheckbox :value="props.viewOptions.catsRound.isShowFavorites" />
            {{ t('isShowFavorites') }}
          </UiElement>

          <UiElement
            v-if="props.isShowRecent"
            @click="emit('changeViewOptions', {
              catsRound: { isShowRecent: !props.viewOptions.catsRound.isShowRecent },
            })"
          >
            <SharedInputsCheckbox :value="props.viewOptions.catsRound.isShowRecent" />
            {{ t('isShowRecent') }}
          </UiElement>
        </div>

        <!-- List -->
        <div
          v-if="props.viewOptions.catsView === 'list'"
          class="grid gap-2 px-2 pb-2"
        >
          <div
            class="border-item-3 border-t pt-2"
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
            class="border-item-3 border-t pt-2"
          >
            <UiCheckbox
              v-if="props.viewOptions.catsView === 'list' && !props.viewOptions.catsList.isOpened"
              :checkboxValue="props.viewOptions.catsList.isItemsBg"
              :title="t('isItemsBg')"
              showCheckbox
              @onClick="emit('changeViewOptions', {
                catsList: { isItemsBg: !props.viewOptions.catsList.isItemsBg },
              })"
            />

            <!-- Lines -->
            <UiCheckbox
              :checkboxValue="props.viewOptions.catsList.isLines"
              :title="t('isLines')"
              showCheckbox
              @onClick="emit('changeViewOptions', {
                catsList: { isLines: !props.viewOptions.catsList.isLines },
              })"
            />

            <!-- Round icons -->
            <UiCheckbox
              :checkboxValue="props.viewOptions.catsList.isRoundIcon"
              :title="t('isRoundIcon')"
              showCheckbox
              @onClick="emit('changeViewOptions', {
                catsList: { isRoundIcon: !props.viewOptions.catsList.isRoundIcon },
              })"
            />
          </div>
        </div>
      </template>
    </UPopover>

    <!-- Round -->
    <template v-if="(props.viewOptions.catsView === 'round' && !props.viewOptions.catsRound.isGrouped) || (props.viewOptions.catsView === 'list' && !props.viewOptions.catsList.isGrouped)">
      <!-- Favorite -->
      <UiItem1
        v-if="props.isShowFavorites"
        @click="emit('changeViewOptions', {
          catsRound: { isShowFavorites: !props.viewOptions.catsRound.isShowFavorites },
        })"
      >
        <Icon
          :class="{ 'opacity-50': !props.viewOptions.catsRound.isShowFavorites }"
          name="material-symbols:favorite-outline-rounded"
        />
      </UiItem1>

      <!-- Recent -->
      <UiItem1
        v-if="props.isShowRecent"
        @click="emit('changeViewOptions', {
          catsRound: { isShowRecent: !props.viewOptions.catsRound.isShowRecent },
        })"
      >
        <Icon
          :class="{ 'opacity-50': !props.viewOptions.catsRound.isShowRecent }"
          name="material-symbols:history-rounded"
        />
      </UiItem1>
    </template>

    <!-- Folder -->
    <UiItem1
      v-if="props.isShowGrouping && props.viewOptions.catsView === 'list' && props.viewOptions.catsList.isGrouped"
      @click="emit('changeViewOptions', {
        catsList: { isOpened: !props.viewOptions.catsList.isOpened },
      })"
    >
      <Icon
        :name="props.viewOptions.catsList.isOpened ? 'fluent:folder-open-20-regular' : 'fluent:folder-20-regular'"
        size="24"
      />
    </UiItem1>

    <!-- Grouping -->
    <UiItem1
      v-if="props.isShowGrouping && props.viewOptions.catsView === 'list'"
      @click="emit('changeViewOptions', {
        catsList: { isGrouped: !props.viewOptions.catsList.isGrouped },
      })"
    >
      <Icon
        :name="props.viewOptions.catsList.isGrouped ? 'material-symbols-light:background-dot-large-outline-sharp' : 'material-symbols-light:background-dot-small-outline-sharp'"
        size="24"
      />
    </UiItem1>

    <!-- Round -->
    <UiItem1
      v-if="props.isShowGrouping && props.viewOptions.catsView === 'round'"
      @click="emit('changeViewOptions', {
        catsRound: { isGrouped: !props.viewOptions.catsRound.isGrouped },
      })"
    >
      <Icon
        :name="props.viewOptions.catsRound.isGrouped ? 'material-symbols-light:background-dot-large-outline-sharp' : 'material-symbols-light:background-dot-small-outline-sharp'"
        size="24"
      />
    </UiItem1>

    <UiItem1
      @click="emit('changeViewOptions', {
        catsView: viewOptions.catsView === 'list' ? 'round' : 'list',
      })"
    >
      <Icon :name="props.viewOptions.catsView === 'list' ? 'lucide:layout-grid' : 'lucide:layout-list'" />
    </UiItem1>
  </div>
</template>

<i18n lang="yaml">
en:
  isItemsBg: Items background
  isLines: Amount lines
  isRoundIcon: Rounded categories
  minimal: Minimal
  standard: Standard
  isShowEmptyCategories: Show all categories

ru:
  isItemsBg: Фон категорий
  isLines: Линии сумм
  isRoundIcon: Скуруглённые категории
  minimal: Легкий
  standard: Стандартный
  isShowEmptyCategories: Показывать все категории
</i18n>
