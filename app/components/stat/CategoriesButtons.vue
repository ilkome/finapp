<script setup lang="ts">
import defu from 'defu'

import type { StatConfigProvider } from '~/components/stat/useStatConfig'

const props = defineProps<{
  catsLength: number
  isShowFavorites?: boolean
  isShowGrouped?: boolean
  isShowRecent?: boolean
  openedStatus: unknown
}>()

const emit = defineEmits(['toggleOpened'])

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

  set(value: boolean) {
    statConfig.updateConfig('vertical', { isGrouped: value })
    statConfig.updateConfig('catsRound', { isGrouped: value })
    statConfig.updateConfig('catsList', { isGrouped: value })
  },

  toggle: () => {
    if (statConfig.config.value.catsView === 'list') {
      // statConfig.updateConfig('vertical', { isGrouped: !statConfig.config.value.catsList.isGrouped })
      statConfig.updateConfig('catsList', { isGrouped: !statConfig.config.value.catsList.isGrouped })
      return
    }

    if (statConfig.config.value.catsView === 'round') {
      // statConfig.updateConfig('vertical', { isGrouped: !statConfig.config.value.catsRound.isGrouped })
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
    if (statConfig.config.value.catsView === 'list')
      statConfig.updateConfig('catsList', { isShowFavorites: !statConfig.config.value.catsList.isShowFavorites })

    if (statConfig.config.value.catsView === 'round')
      statConfig.updateConfig('catsRound', { isShowFavorites: !statConfig.config.value.catsRound.isShowFavorites })
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
}))

const isShowMorePresets = ref(false)

function onChangeViewOptions(newViewOptions: any) {
  const c = defu(newViewOptions.catsList, statConfig.config.value.catsList)
  statConfig.updateConfig('catsList', c)
}

const isShow = ref(false)
</script>

<template>
  <div class="relative flex rounded-md">
    <UiItem1
      v-if="statConfig.config.value.catsView === 'list'"
      @click="emit('toggleOpened')"
    >
      <Icon
        v-if="props.openedStatus.isAllRootOpen && !props.openedStatus.isAllChildOpen"
        name="lucide:folder-open"
      />
      <Icon
        v-if="props.openedStatus.isAllRootOpen && props.openedStatus.isAllChildOpen"
        name="lucide:folder-kanban"
      />
      <Icon
        v-if="!props.openedStatus.isAllRootOpen"
        name="lucide:folder"
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

    <BottomSheetOrDropdown
      :title="t('stat.config.categories.title')"
      :isOpen="isShow"
      placement="bottom-end"
      @onOpenModal="isShow = true"
      @onCloseModal="isShow = false"
    >
      <template #trigger>
        <UiItem1>
          <Icon name="lucide:circle-ellipsis" size="20" />
        </UiItem1>
      </template>

      <template #content="{ close }">
        <div class="grid min-w-80 gap-4 px-1 pt-3 md:px-3">
          <BottomSheetClose @click="close" />
          <div class="grid gap-4 border-b border-item-3 pb-3">
            <!-- Grouping -->
            <div class="grid gap-3">
              <UiTitleOption>
                {{ t("stat.config.categories.grouping.label") }}
              </UiTitleOption>

              <UiTabs1>
                <UiTabsItem1
                  :isActive="grouping.isGrouped.value"
                  class="flex gap-1"
                  @click="grouping.set(true)"
                >
                  <Icon
                    name="lucide:network"
                    :size="16"
                  />
                  {{ t('stat.config.categories.grouping.grouped') }}
                </UiTabsItem1>

                <UiTabsItem1
                  :isActive="!grouping.isGrouped.value"
                  class="flex gap-1"
                  @click="grouping.set(false)"
                >
                  <Icon
                    name="lucide:folder-tree"
                    :size="16"
                  />
                  {{ t('stat.config.categories.grouping.ungrouped') }}
                </UiTabsItem1>
              </UiTabs1>
            </div>

            <div class="grid gap-3">
              <UiTitleOption>
                {{ t("stat.config.categories.view.label") }}
              </UiTitleOption>

              <UiTabs1>
                <UiTabsItem1
                  :isActive="statConfig.config.value.catsView === 'list'"
                  class="flex gap-1"
                  @click="statConfig.updateConfig('catsView', 'list')"
                >
                  <Icon
                    name="lucide:layout-list"
                    :size="16"
                  />
                  {{ t('stat.config.categories.view.list') }}
                </UiTabsItem1>

                <UiTabsItem1
                  :isActive="statConfig.config.value.catsView === 'round'"
                  class="flex gap-1"
                  @click="statConfig.updateConfig('catsView', 'round')"
                >
                  <Icon
                    name="lucide:layout-grid"
                    :size="16"
                  />
                  {{ t('stat.config.categories.view.round') }}
                </UiTabsItem1>
              </UiTabs1>
            </div>
          </div>

          <!-- List -->
          <div
            v-if="statConfig.config.value.catsView === 'list'"
            class="grid gap-3 border-b border-item-3 pb-2 last:border-0"
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
                <FormSwitch :value="statConfig.config.value.catsList.isItemsBg" />
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
                <FormSwitch :value="statConfig.config.value.catsList.isLines" />
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
                <FormSwitch :value="statConfig.config.value.catsList.isRoundIcon" />
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
              <FormSwitch :value="statConfig.config.value.catsList.isOpened" />
            </UiElement>
          </div>

          <!-- Vertical -->
          <div
            v-if="props.catsLength > 1"
            class="grid border-b border-item-3 pb-2 last:border-0 md:pb-0"
          >
            <UiTitleOption class="pb-2">
              {{ t('stat.config.categories.vertical.label') }}
            </UiTitleOption>

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
              <FormSwitch :value="statConfig.config.value.vertical.isShow" />
            </UiElement>

            <!-- Grouping -->
            <UiTabs1
              v-if="statConfig.config.value.vertical.isShow"
              class="mt-3"
            >
              <UiTabsItem1
                :isActive="statConfig.config.value.vertical.isGrouped"
                class="flex gap-1"
                @click="statConfig.updateConfig('vertical', { isGrouped: true })"
              >
                <Icon
                  name="lucide:network"
                  :size="16"
                />
                {{ t('stat.config.categories.grouping.grouped') }}
              </UiTabsItem1>

              <UiTabsItem1
                :isActive="!statConfig.config.value.vertical.isGrouped"
                class="flex gap-1"
                @click="statConfig.updateConfig('vertical', { isGrouped: false })"
              >
                <Icon
                  name="lucide:folder-tree"
                  :size="16"
                />
                {{ t('stat.config.categories.grouping.ungrouped') }}
              </UiTabsItem1>
            </UiTabs1>
          </div>

          <!-- TODO: use StatConfig -->
          <div
            v-if="false"
            class="border-b border-item-3 pb-2 last:border-0 last:pb-0"
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
              <FormSwitch :value="favorites.isShow.value" />
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
              <FormSwitch :value="recent.isShow.value" />
            </UiElement>
          </div>
        </div>
      </template>
    </BottomSheetOrDropdown>
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
