<script setup lang="ts">
import { BLACK_PRIMARY, colorLabel, swatchPalette, useThemeOptions } from '~/components/theme/useThemeOptions'
import { useMenuLabelVisibility } from '~/composables/useMenuLabelVisibility'

const colorMode = useColorMode()
const { t } = useI18n()
const isShowMenuLabels = useMenuLabelVisibility()
const {
  blackAsPrimary,
  neutral,
  neutralColors,
  primary,
  primaryColors,
  radius,
  radiuses,
  setBlackAsPrimary,
} = useThemeOptions()

const radiusItems = radiuses.map(r => ({ label: String(r), value: r }))

const modeItems = computed(() => [
  { icon: 'i-lucide-sun', label: t('theme.light'), value: 'light' },
  { icon: 'i-lucide-moon', label: t('theme.dark'), value: 'dark' },
  { icon: 'i-lucide-monitor', label: t('theme.system'), value: 'system' },
])
const modePreference = computed({
  get() {
    return colorMode.preference
  },
  set(option) {
    colorMode.preference = option
  },
})

const primaryItems = computed(() => [
  { label: colorLabel(t, BLACK_PRIMARY), value: BLACK_PRIMARY },
  ...primaryColors.map(c => ({ label: colorLabel(t, c), value: c })),
])
const primarySelected = computed({
  get() {
    return blackAsPrimary.value ? BLACK_PRIMARY : primary.value
  },
  set(option) {
    if (option === BLACK_PRIMARY) {
      setBlackAsPrimary(true)
    }
    else {
      setBlackAsPrimary(false)
      primary.value = option
    }
  },
})

const neutralItems = computed(() => neutralColors.map(c => ({ label: colorLabel(t, c), value: c })))
</script>

<template>
  <UiSettingsCard :title="t('theme.picker.theme')">
    <UiOptionGrid v-model="modePreference" :items="modeItems">
      <template #swatch="{ value }">
        <UIcon :name="modeItems.find(m => m.value === value)!.icon" class="size-6" />
      </template>
    </UiOptionGrid>
  </UiSettingsCard>

  <UiSettingsCard :title="t('theme.picker.primary')">
    <UiOptionGrid
      v-model="primarySelected"
      :items="primaryItems"
    >
      <template #swatch="{ value }">
        <span
          v-if="value === BLACK_PRIMARY"
          class="size-6 rounded-full bg-black dark:bg-white"
        />
        <span
          v-else
          class="size-6 rounded-full bg-(--color-light) dark:bg-(--color-dark)"
          :style="{
            '--color-light': `var(--color-${value}-500)`,
            '--color-dark': `var(--color-${value}-400)`,
          }"
        />
      </template>
    </UiOptionGrid>
  </UiSettingsCard>

  <UiSettingsCard :title="t('theme.picker.neutral')">
    <UiOptionGrid
      v-model="neutral"
      :items="neutralItems"
    >
      <template #swatch="{ value }">
        <span
          class="size-6 rounded-full bg-(--color-light) dark:bg-(--color-dark)"
          :style="{
            '--color-light': `var(--color-${swatchPalette(value)}-500)`,
            '--color-dark': `var(--color-${swatchPalette(value)}-400)`,
          }"
        />
      </template>
    </UiOptionGrid>
  </UiSettingsCard>

  <UiSettingsCard :title="t('theme.picker.radius')">
    <UiOptionGrid
      v-model="radius"
      :items="radiusItems"
    >
      <template #swatch="{ value }">
        <span
          class="size-6 border-2 border-accented bg-elevated"
          :style="{ borderRadius: `${value}rem` }"
        />
      </template>
    </UiOptionGrid>
  </UiSettingsCard>

  <!-- Bottom-nav labels only exist on the phone layout. -->
  <UiSettingsCard class="md:hidden" :title="t('base.menu')">
    <UiSwitchItem
      :checkboxValue="isShowMenuLabels"
      :title="t('settings.menuLabels')"
      @toggle="isShowMenuLabels = !isShowMenuLabels"
    />
  </UiSettingsCard>
</template>
