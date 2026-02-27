<script setup lang="ts">
import type { DeepPartial } from '~~/utils/types'

import defu from 'defu'

import type { MiniItemConfig } from '~/components/stat/useStatConfig'

import { statConfigKey } from '~/components/stat/injectionKeys'

const { t } = useI18n()
const statConfig = inject(statConfigKey)!

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

function onChangeViewOptions(newViewOptions: Pick<DeepPartial<MiniItemConfig>, 'catsList'>) {
  const c = defu(newViewOptions.catsList, statConfig.config.value.catsList)
  statConfig.updateConfig('catsList', c)
}
</script>

<template>
  <div>
    <!-- List -->
    <div class="border-item-4 grid gap-3 border-b pb-2 last:border-0">
      <UiTitleSection size="sm">
        {{ t('stat.catButtons.listItemsOptions') }}
      </UiTitleSection>
      <div class="flex gap-1">
        <UiChipButton
          v-for="view in viewPresets"
          :key="view.title"
          @click="onChangeViewOptions(view.props)"
        >
          {{ view.title }}
        </UiChipButton>

        <UiChipButton
          class="!grow-0"
          @click="isShowMorePresets = !isShowMorePresets"
        >
          <Icon
            :name="isShowMorePresets ? 'lucide:chevron-up' : 'lucide:chevron-down'"
            size="18"
          />
        </UiChipButton>
      </div>

      <div v-if="isShowMorePresets">
        <UiSwitchItem
          :checkboxValue="statConfig.config.value.catsList.isItemsBg"
          :title="t('stat.catButtons.isItemsBg')"
          @click="statConfig.updateConfig('catsList', { isItemsBg: !statConfig.config.value.catsList.isItemsBg })"
        />

        <!-- Lines -->
        <UiSwitchItem
          :checkboxValue="statConfig.config.value.catsList.isLines"
          :title="t('stat.catButtons.isLines')"
          @click="statConfig.updateConfig('catsList', { isLines: !statConfig.config.value.catsList.isLines })"
        />

        <!-- Round icons -->
        <UiSwitchItem
          :checkboxValue="statConfig.config.value.catsList.isRoundIcon"
          :title="t('stat.catButtons.isRoundIcon')"
          @click="statConfig.updateConfig('catsList', { isRoundIcon: !statConfig.config.value.catsList.isRoundIcon })"
        />
      </div>
    </div>

    <div
      class="border-item-4 grid gap-3 border-b pt-3 pb-2 last:border-0"
    >
      <UiTitleSection size="sm">
        {{ t('stat.catButtons.elements') }}
      </UiTitleSection>
      <div>
        <UiSwitchItem
          :checkboxValue="statConfig.config.value.vertical.isShow"
          :title="t('stat.config.categories.vertical.title')"
          @click="statConfig.updateConfig('vertical', { isShow: !statConfig.config.value.vertical.isShow })"
        />
        <UiSwitchItem
          :checkboxValue="statConfig.config.value.catsRound.isShow"
          :title="t('stat.config.categories.rounds.title')"
          @click="statConfig.updateConfig('catsRound', { isShow: !statConfig.config.value.catsRound.isShow })"
        />
        <UiSwitchItem
          :checkboxValue="statConfig.config.value.catsList.isShow"
          :title="t('stat.config.categories.list.title')"
          @click="statConfig.updateConfig('catsList', { isShow: !statConfig.config.value.catsList.isShow })"
        />
      </div>
    </div>
  </div>
</template>
