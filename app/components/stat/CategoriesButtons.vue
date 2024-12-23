<script setup lang="ts">
import defu from 'defu'

import type { StatConfigProvider } from '~/components/stat/useStatConfig'

const props = defineProps<{
  catsLength: number
  isShowFavorites?: boolean
  isShowGrouped?: boolean
  isShowRecent?: boolean
}>()

const { t } = useI18n()
const statConfig = inject('statConfig') as StatConfigProvider

const grouping = {
  isGrouped: computed(() => {
    if (statConfig.config.value.catsView === 'list')
      return statConfig.config.value.catsList.isGrouped

    if (statConfig.config.value.catsView === 'round')
      return statConfig.config.value.catsRound.isGrouped

    return false
  }),
  toggle: () => {
    if (statConfig.config.value.catsView === 'list') {
      statConfig.updateConfig('vertical', { isGrouped: !statConfig.config.value.catsList.isGrouped })
      statConfig.updateConfig('catsList', { isGrouped: !statConfig.config.value.catsList.isGrouped })
      return
    }

    if (statConfig.config.value.catsView === 'round') {
      statConfig.updateConfig('vertical', { isGrouped: !statConfig.config.value.catsRound.isGrouped })
      statConfig.updateConfig('catsRound', { isGrouped: !statConfig.config.value.catsRound.isGrouped })
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
      statConfig.updateConfig('catsList', { isShowFavorites: !statConfig.config.value.catsList.isShowFavorites,
      })
    }

    if (statConfig.config.value.catsView === 'round') {
      statConfig.updateConfig('catsRound', { isShowFavorites: !statConfig.config.value.catsRound.isShowFavorites })
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
  alt: {
    props: {
      catsList: {
        isItemsBg: true,
        isLines: false,
        isRoundIcon: false,
      },
    },
    title: t('alt'),
  },

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
  const c = defu(newViewOptions.catsList, statConfig.config.value.catsList)
  statConfig.updateConfig('catsList', c)
}
</script>

<template>
  <div class="_bg-item-9 relative flex rounded-md">
    <!-- Vertical -->
    <UiItem1
      v-if="props.catsLength > 1"
      @click="statConfig.updateConfig('vertical', { isShow: !statConfig.config.value.vertical.isShow })"
    >
      <Icon
        name="lucide:chart-no-axes-column-decreasing"
        size="18"
      />
    </UiItem1>

    <!-- Grouping -->
    <UiItem1
      v-if="props.isShowGrouped"
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
      <UiItem1
        class="group-data-[headlessui-state='open']:!border-accent-1 border border-transparent"
      >
        <Icon
          name="lucide:circle-ellipsis"
          size="18"
        />
      </UiItem1>

      <template #panel>
        <div class="relative z-10 grid min-w-64 gap-3 p-3">
          <div class="-m-1">
            <div class="border-item-3 flex justify-end gap-3 border-b pb-2">
              <UiItem1
                v-if="props.isShowGrouped"
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

          <!-- Vertical -->
          <div
            v-if="props.catsLength > 1"
            class="border-item-3 grid border-b pb-2 last:border-0 last:pb-0"
          >
            <UiElement
              class="text-sm"
              @click="statConfig.updateConfig('vertical', { isShow: !statConfig.config.value.vertical.isShow })"
            >
              <template #leftIcon>
                <Icon
                  name="lucide:chart-no-axes-column-decreasing"
                  size="18"
                />
              </template>
              <div class="grow">
                {{ t('vertical.show') }}
              </div>
              <FormCheckbox :value="statConfig.config.value.vertical.isShow" />
            </UiElement>

            <!-- Grouping -->
            <UiElement
              v-if="statConfig.config.value.vertical.isShow"
              class="text-sm"
              @click="statConfig.updateConfig('vertical', { isGrouped: !statConfig.config.value.vertical.isGrouped })"
            >
              <template #leftIcon>
                <Icon
                  :name="statConfig.config.value.vertical.isGrouped ? 'lucide:folder-tree' : 'lucide:network'"
                  size="18"
                />
              </template>
              <div class="grow">
                {{ t('vertical.grouping') }}
              </div>
              <FormCheckbox :value="statConfig.config.value.vertical.isGrouped" />
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
              <FormCheckbox :value="favorites.isShow.value" />
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
              <FormCheckbox :value="recent.isShow.value" />
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
                v-if="statConfig.config.value.catsView === 'list'"
                class="text-sm"
                @click="statConfig.updateConfig('catsList', {
                  ...statConfig.config.value.catsList,
                  isItemsBg: !statConfig.config.value.catsList.isItemsBg,
                })"
              >
                <div class="grow">
                  {{ t('isItemsBg') }}
                </div>
                <FormCheckbox :value="statConfig.config.value.catsList.isItemsBg" />
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
                <FormCheckbox :value="statConfig.config.value.catsList.isLines" />
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
                <FormCheckbox :value="statConfig.config.value.catsList.isRoundIcon" />
              </UiElement>
            </div>

            <UiElement
              v-if="statConfig.config.value.catsList.isGrouped"
              class="text-sm"
              @click="statConfig.updateConfig('catsList', { isOpened: !statConfig.config.value.catsList.isOpened })"
            >
              <div class="grow">
                {{ t('categories.list.showAsRounded') }}
              </div>
              <FormCheckbox :value="statConfig.config.value.catsList.isOpened" />
            </UiElement>
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
  vertical:
    show: Vertical categories
    grouping: Grouping
  isShowEmptyCategories: Show empty categories
  isShowFavorites: Show favorites
  isShowRecent: Show recent
  listItemsOptions: List items options
  minimal: Minimal
  standard: Standard
  alt: Alternative
  categories:
    list:
      showAsRounded: Show as rounded

ru:
  isItemsBg: Фон категорий
  isLines: Линии сумм
  isRoundIcon: Скруглённые категории
  vertical:
    show: Вертикальные категории
    grouping: Группировать
  isShowEmptyCategories: Показывать пустые категории
  isShowFavorites: Показывать избранные
  isShowRecent: Показывать последние
  listItemsOptions: Настройки списка категорий
  minimal: Легкий
  standard: Стандартный
  alt: Альтернативный
  categories:
    list:
      showAsRounded: Показать как скруглённые
</i18n>
