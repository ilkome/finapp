<script setup lang="ts">
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { chartViewOptions } from '~/components/stat/useStatConfig'
import type { StatConfigProvider } from '~/components/stat/useStatConfig'

const props = defineProps<{
  isShowWallets?: boolean
}>()

const { t } = useI18n()
const walletsStore = useWalletsStore()
const statConfig = inject('statConfig') as StatConfigProvider
</script>

<template>
  <UPopover
    :popper="{ placement: 'bottom-end' }"
    class="ml-auto"
  >
    <UiItem3>
      <Icon name="lucide:settings-2" size="20" />
    </UiItem3>

    <template #panel="{ close }">
      <div class="grid gap-6 p-3">
        <BottomSheetClose @click="close" />

        <!-- Chart show -->
        <div class="popover-el">
          <UiTitleOption class="pb-2">
            {{ t("stat.config.chartShow.title") }}
          </UiTitleOption>
          <UiCheckbox
            :checkboxValue="statConfig.config.value.chartShow"
            :title="t('stat.config.chartShow.label')"
            @onClick="statConfig.updateConfig('chartShow', !statConfig.config.value.chartShow)"
          />
        </div>

        <!-- Chart view -->
        <div
          v-if="statConfig.config.value.chartShow"
          class="popover-el hidden md:block"
        >
          <UiTitleOption class="pb-2">
            {{ t("stat.config.chartView.label") }}
          </UiTitleOption>

          <UiTabs1>
            <UiTabsItem1
              v-for="view in chartViewOptions"
              :key="view"
              :isActive="statConfig.config.value.chartView === view"
              @click="statConfig.updateConfig('chartView', view)"
            >
              {{ t(`stat.config.chartView.${view}`) }}
            </UiTabsItem1>
          </UiTabs1>
        </div>

        <!-- Showed wallets -->
        <div v-if="props.isShowWallets" class="popover-el">
          <UiTitleOption class="pb-2">
            {{ t("stat.config.showedWallets.label") }}
          </UiTitleOption>

          <div class="flex gap-4">
            <UiFormInput
              :placeholder="t('stat.config.showedWallets.placeholder')"
              :value="statConfig.config.value.showedWallets"
              :max="walletsStore.sortedIds.length"
              class="max-w-20"
              type="number"
              min="0"
              @updateValue="value => statConfig.updateConfig('showedWallets', +value)"
            />

            <div class="flex gap-1">
              <UiBox1
                class="!flex gap-2"
                @click="statConfig.updateConfig('showedWallets', statConfig.config.value.showedWallets - 1)"
              >
                <div>-</div>
              </UiBox1>
              <UiBox1
                class="!flex gap-2"
                @click="statConfig.updateConfig('showedWallets', statConfig.config.value.showedWallets + 1)"
              >
                <div>+</div>
              </UiBox1>
            </div>
          </div>
        </div>

        <div>
          <slot />
        </div>
      </div>
    </template>
  </UPopover>
</template>
