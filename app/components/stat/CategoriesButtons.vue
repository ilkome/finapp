<script setup lang="ts">
import defu from 'defu'
import { getStyles } from '~/components/ui/getStyles'
import type { StatConfigProvider } from '~/components/stat/useStatConfig'

const props = defineProps<{
  catsLength: number
  isShowFavorites?: boolean
  isShowGrouping?: boolean
  isShowRecent?: boolean
}>()

const { t } = useI18n()
const statConfig = inject('statConfig') as StatConfigProvider

const grouping = {
  isGrouped: computed(() => {
    // if (statConfig.config.value.catsView === 'list')
    //   return statConfig.config.value.catsList.isGrouped

    // if (statConfig.config.value.catsView === 'round')
    //   return statConfig.config.value.catsRound.isGrouped

    return false
  }),
  toggle: () => {
    if (statConfig.config.value.catsView === 'list') {
      statConfig.updateConfig('catsList', {
        ...statConfig.config.value.catsList,
        // isGrouped: !statConfig.config.value.catsList.isGrouped,
      })
      return
    }

    if (statConfig.config.value.catsView === 'round') {
      statConfig.updateConfig('catsRound', {
        ...statConfig.config.value.catsRound,
        // isGrouped: !statConfig.config.value.catsRound.isGrouped,
      })
    }
  },
}

const favorites = computed(() => ({
  isShow: computed(() => {
    if (statConfig.config.value.catsView === 'list')
      return statConfig.config.value.catsList.isShowFavorites

    if (statConfig.config.value.catsView === 'round')
      return statConfig.config.value.catsRound.isShowFavorites

    return false
  }),
  toggle: () => {
    if (statConfig.config.value.catsView === 'list') {
      statConfig.updateConfig('catsList', {
        ...statConfig.config.value.catsList,
        isShowFavorites: !statConfig.config.value.catsList.isShowFavorites,
      })
    }

    if (statConfig.config.value.catsView === 'round') {
      statConfig.updateConfig('catsRound', {
        ...statConfig.config.value.catsRound,
        isShowFavorites: !statConfig.config.value.catsRound.isShowFavorites,
      })
    }
  },
}))

const recent = {
  isShow: computed(() => {
    if (statConfig.config.value.catsView === 'list')
      return statConfig.config.value.catsList.isShowRecent

    if (statConfig.config.value.catsView === 'round')
      return statConfig.config.value.catsRound.isShowRecent

    return false
  }),
  toggle: () => {
    if (statConfig.config.value.catsView === 'list') {
      statConfig.updateConfig('catsList', {
        ...statConfig.config.value.catsList,
        isShowRecent: !statConfig.config.value.catsList.isShowRecent,
      })
    }

    if (statConfig.config.value.catsView === 'round') {
      statConfig.updateConfig('catsRound', {
        ...statConfig.config.value.catsRound,
        isShowRecent: !statConfig.config.value.catsRound.isShowRecent,
      })
    }
  },
}

const viewPresets = computed(() => ({
  standard: {
    props: {
      catsList: {
        isItemsBg: false,
        isLines: true,
        isRoundIcon: true,
      },
    },
    title: t('standard'),
  },
  // eslint-disable-next-line perfectionist/sort-objects
  minimal: {
    props: {
      catsList: {
        isItemsBg: false,
        isLines: false,
        isRoundIcon: false,
      },
    },
    title: t('minimal'),
  },
}))

const isShowMorePresets = ref(false)

function onChangeViewOptions(newViewOptions: any) {
  statConfig.updateConfig('catsList', defu(newViewOptions, statConfig.config.value.catsList))
}
</script>

<template>
  <div class="bg-foreground-2 relative flex rounded-md">
    <!-- Folder -->
    <UiItem1
      v-if="props.isShowGrouping && statConfig.config.value.catsView === 'list' && statConfig.config.value.catsList.isGrouped"
      @click="statConfig.updateConfig('catsList', {
        ...statConfig.config.value.catsList,
        isOpened: !statConfig.config.value.catsList.isOpened,
      })"
    >
      <Icon
        :name="statConfig.config.value.catsList.isOpened ? 'fluent:folder-open-20-regular' : 'fluent:folder-20-regular'"
        size="18"
      />
    </UiItem1>

    <!-- Vertical -->
    <UiItem1
      v-if="props.catsLength > 1"
      @click="statConfig.updateConfig('isShowCategoriesVertical', !statConfig.config.value.isShowCategoriesVertical)"
    >
      <Icon
        name="lucide:chart-no-axes-column-decreasing"
        size="18"
      />
    </UiItem1>

    <!-- Grouping -->
    <UiItem1
      v-if="props.isShowGrouping && !statConfig.config.value.isCategoryPage"
      @click="grouping.toggle"
    >
      <Icon
        :name="grouping.isGrouped.value ? 'lucide:folder-tree' : 'lucide:network'"
        size="18"
      />
    </UiItem1>

    <!-- View -->
    <UiItem1
      @click="statConfig.updateConfig('catsView', statConfig.config.value.catsView === 'list' ? 'round' : 'list')"
    >
      <Icon
        :name="statConfig.config.value.catsView === 'list' ? 'lucide:layout-grid' : 'lucide:layout-list'"
        size="18"
      />
    </UiItem1>

    <UPopover
      :popper="{ placement: 'bottom-end' }"
      class="group"
    >
      <div
        :class="getStyles('item', ['link', 'bg', 'center', 'minh2', 'minw1', 'rounded'])"
        class="group-data-[headlessui-state='open']:!border-accent-1 justify-center border border-transparent text-xl"
      >
        <Icon
          name="lucide:circle-ellipsis"
          size="18"
        />
      </div>

      <template #panel>
        <div class="relative z-10 grid min-w-64 gap-3 p-3">
          <div class="-m-1">
            <div class="border-item-3 flex justify-end gap-3 border-b pb-2">
              <UiItem1
                @click="grouping.toggle"
              >
                <Icon
                  :name="grouping.isGrouped.value ? 'lucide:folder-tree' : 'lucide:network'"
                  size="18"
                />
              </UiItem1>
              <UiItem1
                @click="statConfig.updateConfig('catsView', statConfig.config.value.catsView === 'list' ? 'round' : 'list')"
              >
                <Icon :name="statConfig.config.value.catsView === 'list' ? 'lucide:layout-grid' : 'lucide:layout-list'" />
              </UiItem1>
            </div>
          </div>

          <!-- Show empty categories -->
          <div
            v-if="!statConfig.config.value.isCategoryPage"
            class="border-item-3 grid gap-3 border-b pb-2 last:border-0 last:pb-0"
          >
            <UiElement
              class="text-sm"
              @click="statConfig.updateConfig('isShowEmptyCategories', !statConfig.config.value.isShowEmptyCategories)"
            >
              <div class="grow">
                {{ t('isShowEmptyCategories') }}
              </div>
              <SharedInputsCheckbox :value="statConfig.config.value.isShowEmptyCategories" />
            </UiElement>
          </div>

          <!-- Vertical -->
          <div
            v-if="props.catsLength > 1"
            class="border-item-3 grid gap-3 border-b pb-2 last:border-0 last:pb-0"
          >
            <UiElement
              class="text-sm"
              @click="statConfig.updateConfig('isShowCategoriesVertical', !statConfig.config.value.isShowCategoriesVertical)"
            >
              <template #leftIcon>
                <Icon
                  name="lucide:chart-no-axes-column-decreasing"
                  size="18"
                />
              </template>
              <div class="grow">
                {{ t('isShowCategoriesVertical') }}
              </div>
              <SharedInputsCheckbox :value="statConfig.config.value.isShowCategoriesVertical" />
            </UiElement>
          </div>

          <!-- TODO: use StatConfig -->
          <div
            v-if="false"
            class="border-item-3 border-b pb-2 last:border-0 last:pb-0"
          >
            <!-- Favorite -->
            <UiElement
              class="text-sm"
              @click="favorites.toggle"
            >
              <template #leftIcon>
                <Icon
                  name="lucide:heart"
                  size="18"
                />
              </template>
              <div class="grow">
                {{ t('isShowFavorites') }}
              </div>
              <SharedInputsCheckbox :value="favorites.isShow.value" />
            </UiElement>

            <!-- Recent -->
            <UiElement
              class="text-sm"
              @click="recent.toggle"
            >
              <template #leftIcon>
                <Icon
                  name="lucide:history"
                  size="18"
                />
              </template>
              <div class="grow">
                {{ t('isShowRecent') }}
              </div>
              <SharedInputsCheckbox :value="recent.isShow.value" />
            </UiElement>
          </div>

          <!-- List -->
          <div
            v-if="statConfig.config.value.catsView === 'list'"
            class="grid gap-3"
          >
            <UiTitleOption>{{ t('listItemsOptions') }}</UiTitleOption>
            <div class="flex gap-1">
              <UiItem4
                v-for="view in viewPresets"
                :key="view.title"
                @click="onChangeViewOptions(view.props)"
              >
                {{ view.title }}
              </UiItem4>
              <UiItem4
                class="!grow-0"
                @click="isShowMorePresets = !isShowMorePresets"
              >
                <Icon
                  :name="isShowMorePresets ? 'lucide:chevron-up' : 'lucide:chevron-down'"
                  size="18"
                />
              </UiItem4>
            </div>

            <div v-if="isShowMorePresets">
              <UiElement
                v-if="statConfig.config.value.catsView === 'list' && !statConfig.config.value.catsList.isOpened"
                class="text-sm"
                @click="statConfig.updateConfig('catsList', {
                  ...statConfig.config.value.catsList,
                  isItemsBg: !statConfig.config.value.catsList.isItemsBg,
                })"
              >
                <div class="grow">
                  {{ t('isItemsBg') }}
                </div>
                <SharedInputsCheckbox :value="statConfig.config.value.catsList.isItemsBg" />
              </UiElement>

              <!-- Lines -->
              <UiElement
                class="text-sm"
                @click="statConfig.updateConfig('catsList', {
                  ...statConfig.config.value.catsList,
                  isLines: !statConfig.config.value.catsList.isLines,
                })"
              >
                <div class="grow">
                  {{ t('isLines') }}
                </div>
                <SharedInputsCheckbox :value="statConfig.config.value.catsList.isLines" />
              </UiElement>

              <!-- Round icons -->
              <UiElement
                class="text-sm"
                @click="statConfig.updateConfig('catsList', {
                  ...statConfig.config.value.catsList,
                  isRoundIcon: !statConfig.config.value.catsList.isRoundIcon,
                })"
              >
                <div class="grow">
                  {{ t('isRoundIcon') }}
                </div>
                <SharedInputsCheckbox :value="statConfig.config.value.catsList.isRoundIcon" />
              </UiElement>
            </div>
          </div>
        </div>
      </template>
    </UPopover>
  </div>
</template>

<i18n lang="yaml">
en:
  isItemsBg: Items background
  isLines: Amount lines
  isRoundIcon: Rounded categories
  isShowCategoriesVertical: Vertical categories
  isShowEmptyCategories: Show all categories
  isShowFavorites: Show favorites
  isShowRecent: Show recent
  listItemsOptions: List items options
  minimal: Minimal
  standard: Standard

ru:
  isItemsBg: Фон категорий
  isLines: Линии сумм
  isRoundIcon: Скуруглённые категории
  isShowCategoriesVertical: Вертикальные категории
  isShowEmptyCategories: Показывать все категории
  isShowFavorites: Показывать избранные
  isShowRecent: Показывать последние
  listItemsOptions: Настройки списка категорий
  minimal: Легкий
  standard: Стандартный
</i18n>
