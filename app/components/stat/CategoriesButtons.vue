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

const grouping = {
  isGrouped: computed(() => {
    if (props.viewOptions.catsView === 'list')
      return props.viewOptions.catsList.isGrouped

    if (props.viewOptions.catsView === 'round')
      return props.viewOptions.catsRound.isGrouped

    return false
  }),
  toggle: () => {
    if (props.viewOptions.catsView === 'list') {
      emit('changeViewOptions', {
        catsList: { isGrouped: !props.viewOptions.catsList.isGrouped },
      })
      return
    }

    if (props.viewOptions.catsView === 'round') {
      emit('changeViewOptions', {
        catsRound: { isGrouped: !props.viewOptions.catsRound.isGrouped },
      })
    }
  },
}

const favorites = {
  isShow: computed(() => {
    if (!props.isShowFavorites)
      return false

    if (props.viewOptions.catsView === 'list')
      return props.viewOptions.catsList.isShowFavorites

    if (props.viewOptions.catsView === 'round')
      return props.viewOptions.catsRound.isShowFavorites

    return false
  }),
  toggle: () => {
    if (props.viewOptions.catsView === 'list') {
      emit('changeViewOptions', {
        catsList: { isShowFavorites: !props.viewOptions.catsList.isShowFavorites },
      })
    }

    if (props.viewOptions.catsView === 'round') {
      emit('changeViewOptions', {
        catsRound: { isShowFavorites: !props.viewOptions.catsRound.isShowFavorites },
      })
    }
  },
}

const recent = {
  isShow: computed(() => {
    if (!props.isShowRecent)
      return false

    if (props.viewOptions.catsView === 'list')
      return props.viewOptions.catsList.isShowRecent

    if (props.viewOptions.catsView === 'round')
      return props.viewOptions.catsRound.isShowRecent

    return false
  }),
  toggle: () => {
    if (props.viewOptions.catsView === 'list') {
      emit('changeViewOptions', {
        catsList: { isShowRecent: !props.viewOptions.catsList.isShowRecent },
      })
    }

    if (props.viewOptions.catsView === 'round') {
      emit('changeViewOptions', {
        catsRound: { isShowRecent: !props.viewOptions.catsRound.isShowRecent },
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
</script>

<template>
  <div class="bg-foreground-2 relative flex rounded-md">
    <!-- Folder -->
    <UiItem1
      v-if="props.isShowGrouping && props.viewOptions.catsView === 'list' && props.viewOptions.catsList.isGrouped"
      @click="emit('changeViewOptions', {
        catsList: { isOpened: !props.viewOptions.catsList.isOpened },
      })"
    >
      <Icon
        :name="props.viewOptions.catsList.isOpened ? 'fluent:folder-open-20-regular' : 'fluent:folder-20-regular'"
        size="18"
      />
    </UiItem1>

    <!-- Grouping -->
    <UiItem1
      v-if="props.isShowGrouping"
      @click="grouping.toggle"
    >
      <Icon
        :name="grouping.isGrouped.value ? 'lucide:folder-tree' : 'lucide:network'"
        size="18"
      />
    </UiItem1>

    <!-- View -->
    <UiItem1
      @click="emit('changeViewOptions', {
        catsView: viewOptions.catsView === 'list' ? 'round' : 'list',
      })"
    >
      <Icon
        :name="props.viewOptions.catsView === 'list' ? 'lucide:layout-grid' : 'lucide:layout-list'"
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
                v-if="props.isShowGrouping"
                @click="grouping.toggle"
              >
                <Icon
                  :name="grouping.isGrouped.value ? 'lucide:folder-tree' : 'lucide:network'"
                  size="18"
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
          </div>

          <!-- Show empty categories -->
          <div class="border-item-3 grid gap-3 border-b pb-2 last:border-0 last:pb-0">
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

          <!-- Grouping -->
          <div
            v-if="!grouping.isGrouped.value"
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
            v-if="props.viewOptions.catsView === 'list'"
            class="grid gap-3"
          >
            <UiTitleOption>{{ t('listItemsOptions') }}</UiTitleOption>
            <div class="flex gap-1">
              <UiItem4
                v-for="view in viewPresets"
                :key="view.title"
                @click="emit('changeViewOptions', view.props)"
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
                v-if="props.viewOptions.catsView === 'list' && !props.viewOptions.catsList.isOpened"
                class="text-sm"
                @click="emit('changeViewOptions', {
                  catsList: { isItemsBg: !props.viewOptions.catsList.isItemsBg },
                })"
              >
                <div class="grow">
                  {{ t('isItemsBg') }}
                </div>
                <SharedInputsCheckbox :value="props.viewOptions.catsList.isItemsBg" />
              </UiElement>

              <!-- Lines -->
              <UiElement
                class="text-sm"
                @click="emit('changeViewOptions', {
                  catsList: { isLines: !props.viewOptions.catsList.isLines },
                })"
              >
                <div class="grow">
                  {{ t('isLines') }}
                </div>
                <SharedInputsCheckbox :value="props.viewOptions.catsList.isLines" />
              </UiElement>

              <!-- Round icons -->
              <UiElement
                class="text-sm"
                @click="emit('changeViewOptions', {
                  catsList: { isRoundIcon: !props.viewOptions.catsList.isRoundIcon },
                })"
              >
                <div class="grow">
                  {{ t('isRoundIcon') }}
                </div>
                <SharedInputsCheckbox :value="props.viewOptions.catsList.isRoundIcon" />
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
  minimal: Minimal
  standard: Standard
  isShowEmptyCategories: Show all categories
  listItemsOptions: List items options
  isShowFavorites: Show favorites
  isShowRecent: Show recent

ru:
  isItemsBg: Фон категорий
  isLines: Линии сумм
  isRoundIcon: Скуруглённые категории
  minimal: Легкий
  standard: Стандартный
  isShowEmptyCategories: Показывать все категории
  listItemsOptions: Настройки списка категорий
  isShowFavorites: Показывать избранные
  isShowRecent: Показывать последние
</i18n>
