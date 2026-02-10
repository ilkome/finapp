<script setup lang="ts">
import defu from 'defu'

import type { StatConfigProvider } from '~/components/stat/useStatConfig'

const { t } = useI18n()
const statConfig = inject('statConfig') as StatConfigProvider

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
        isOpened: false,
        isRoundIcon: false,
      },
    },
    title: t('stat.catButtons.minimal'),
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
    title: t('stat.catButtons.alt'),
  },

  standard: {
    props: {
      catsList: {
        isItemsBg: false,
        isLines: true,
        isRoundIcon: true,
      },
    },
    title: t('stat.catButtons.standard'),
  },
}))

const isShowMorePresets = ref(false)

function onChangeViewOptions(newViewOptions: any) {
  const c = defu(newViewOptions.catsList, statConfig.config.value.catsList)
  statConfig.updateConfig('catsList', c)
}
</script>

<template>
  <div class="">
    <!-- List -->
    <div class="border-item-4 grid gap-3 border-b pb-2 last:border-0">
      <UiTitleOption>{{ t('stat.catButtons.listItemsOptions') }}</UiTitleOption>
      <div class="flex gap-1">
        <UiItem2
          v-for="view in viewPresets"
          :key="view.title"
          @click="onChangeViewOptions(view.props)"
        >
          {{ view.title }}
        </UiItem2>

        <UiItem2
          class="!grow-0"
          @click="isShowMorePresets = !isShowMorePresets"
        >
          <Icon
            :name="isShowMorePresets ? 'lucide:chevron-up' : 'lucide:chevron-down'"
            size="18"
          />
        </UiItem2>
      </div>

      <div v-if="isShowMorePresets">
        <UiCheckbox
          :checkboxValue="statConfig.config.value.catsList.isItemsBg"
          :title="t('stat.catButtons.isItemsBg')"
          @click="statConfig.updateConfig('catsList', { isItemsBg: !statConfig.config.value.catsList.isItemsBg })"
        />

        <!-- Lines -->
        <UiCheckbox
          :checkboxValue="statConfig.config.value.catsList.isLines"
          :title="t('stat.catButtons.isLines')"
          @click="statConfig.updateConfig('catsList', { isLines: !statConfig.config.value.catsList.isLines })"
        />

        <!-- Round icons -->
        <UiCheckbox
          :checkboxValue="statConfig.config.value.catsList.isRoundIcon"
          :title="t('stat.catButtons.isRoundIcon')"
          @click="statConfig.updateConfig('catsList', { isRoundIcon: !statConfig.config.value.catsList.isRoundIcon })"
        />
      </div>
    </div>

    <!-- TODO: use StatConfig -->
    <div
      v-if="false"
      class="border-item-4 border-b pb-2 last:border-0 last:pb-0"
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

    <div
      class="border-item-4 grid gap-3 border-b pt-3 pb-2 last:border-0"
    >
      <UiTitleOption>{{ t('stat.catButtons.elements') }}</UiTitleOption>
      <div class="">
        <UiCheckbox
          :checkboxValue="statConfig.config.value.vertical.isShow"
          :title="t('stat.config.categories.vertical.title')"
          @click="statConfig.updateConfig('vertical', { isShow: !statConfig.config.value.vertical.isShow })"
        />
        <UiCheckbox
          :checkboxValue="statConfig.config.value.catsRound.isShow"
          :title="t('stat.config.categories.rounds.title')"
          @click="statConfig.updateConfig('catsRound', { isShow: !statConfig.config.value.catsRound.isShow })"
        />
        <UiCheckbox
          :checkboxValue="statConfig.config.value.catsList.isShow"
          :title="t('stat.config.categories.list.title')"
          @click="statConfig.updateConfig('catsList', { isShow: !statConfig.config.value.catsList.isShow })"
        />
      </div>
    </div>
  </div>
</template>
