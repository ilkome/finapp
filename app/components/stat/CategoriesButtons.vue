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
          :ariaLabel="$t('base.togglePresets')"
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
        <StatConfigSwitch configKey="catsList" field="isItemsBg" :title="t('stat.catButtons.isItemsBg')" />
        <StatConfigSwitch configKey="catsList" field="isLines" :title="t('stat.catButtons.isLines')" />
        <StatConfigSwitch configKey="catsList" field="isRoundIcon" :title="t('stat.catButtons.isRoundIcon')" />
      </div>
    </div>

    <div
      class="border-item-4 grid gap-3 border-b pt-3 pb-2 last:border-0"
    >
      <UiTitleSection size="sm">
        {{ t('stat.catButtons.elements') }}
      </UiTitleSection>
      <div>
        <StatConfigSwitch configKey="vertical" field="isShow" :title="t('stat.config.categories.vertical.title')" />
        <StatConfigSwitch configKey="catsRound" field="isShow" :title="t('stat.config.categories.rounds.title')" />
        <StatConfigSwitch configKey="catsList" field="isShow" :title="t('stat.config.categories.list.title')" />
        <StatConfigSwitch configKey="trns" field="isShow" :title="t('trns.title')" />
      </div>
    </div>
  </div>
</template>
