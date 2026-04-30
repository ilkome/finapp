<script setup lang="ts">
import { statConfigKey } from '~/components/stat/injectionKeys'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  isShowWallets?: boolean
  labelMode?: boolean
}>()

const statConfig = inject(statConfigKey)!
const { t } = useI18n()
const walletsStore = useWalletsStore()

const isOpen = ref(false)
</script>

<template>
  <BottomSheetOrDropdown
    :title="t('stat.config.menu.label')"
    :isOpen
    isShowCloseBtn
    @openModal="isOpen = true"
    @closeModal="isOpen = false"
  >
    <template #trigger>
      <UiHeaderLink
        v-if="props.labelMode"
        icon="lucide:settings-2"
      >
        {{ t('stat.config.menu.label') }}
      </UiHeaderLink>

      <UTooltip
        v-else
        :text="t('stat.config.menu.label')"
      >
        <UiActionButton :ariaLabel="t('stat.config.menu.label')">
          <Icon name="lucide:settings-2" size="20" />
        </UiActionButton>
      </UTooltip>
    </template>

    <template #content="{ close }">
      <div class="grid gap-4 px-1 py-3 md:px-3 md:!pb-2">
        <BottomSheetClose @click="close" />

        <!-- Wallets -->
        <div
          v-if="props.isShowWallets"
          class="border-accented border-b pb-3"
        >
          <UiTitleSection size="sm" class="pb-2">
            {{ t('stat.config.wallets.title') }}
          </UiTitleSection>

          <StatConfigSwitch
            configKey="wallets"
            field="isShow"
            :title="t('stat.config.wallets.label')"
          />

          <!-- Wallets: form -->
          <div
            v-if="statConfig.config.value.wallets.isShow"
            class="flex gap-4 pt-2"
          >
            <UiNumberStepper
              :modelValue="statConfig.config.value.wallets.count"
              :min="1"
              :max="walletsStore.sortedIds.length"
              @update:modelValue="value => statConfig.updateConfig('wallets', { count: value })"
            />
          </div>
        </div>

        <!-- Statistics -->
        <div
          class="border-accented border-b pb-3"
        >
          <UiTitleSection size="sm" class="pb-2">
            {{ t('statistics.title') }}
          </UiTitleSection>

          <StatConfigSwitch
            configKey="statAverage"
            field="isShow"
            :title="t('stat.config.statAverage.count.label')"
          />

          <!-- Average -->
          <div
            v-if="statConfig.config.value.statAverage.isShow"
            class="flex gap-4 pt-2"
          >
            <UiNumberStepper
              :modelValue="statConfig.config.value.statAverage.count"
              :min="1"
              @update:modelValue="value => statConfig.updateConfig('statAverage', { count: value })"
            />
          </div>
        </div>

        <slot :close="close" />
      </div>
    </template>
  </BottomSheetOrDropdown>
</template>
