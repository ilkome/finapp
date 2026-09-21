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
const selectedModeItem = computed(() =>
  modeItems.value.find(m => m.value === modePreference.value),
)

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
  <UiSettingsCard :title="t('theme.title')">
    <div class="grid gap-3">
      <!-- Theme mode -->
      <div class="flex flex-col items-start gap-1">
        <span class="text-xs text-muted">{{ t('theme.picker.theme') }}</span>
        <USelectMenu
          v-model="modePreference"
          :items="modeItems"
          valueKey="value"
          :searchInput="false"
        >
          <template #leading>
            <UIcon :name="selectedModeItem?.icon" class="size-5" />
          </template>
          <template #item-leading="{ item }">
            <UIcon :name="item.icon" class="size-5" />
          </template>
        </USelectMenu>
      </div>

      <ThemeOptionSheet
        v-model="primarySelected"
        :label="t('theme.picker.primary')"
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
      </ThemeOptionSheet>

      <ThemeOptionSheet
        v-model="neutral"
        :label="t('theme.picker.neutral')"
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
      </ThemeOptionSheet>

      <ThemeOptionSheet
        v-model="radius"
        :label="t('theme.picker.radius')"
        :items="radiusItems"
      >
        <template #swatch="{ value }">
          <span
            class="size-6 border-2 border-accented bg-elevated"
            :style="{ borderRadius: `${value}rem` }"
          />
        </template>
      </ThemeOptionSheet>

      <UiSwitchItem
        :checkboxValue="isShowMenuLabels"
        :title="t('settings.menuLabels')"
        class="border-t border-default pt-3 md:hidden"
        @click="isShowMenuLabels = !isShowMenuLabels"
      />
    </div>
  </UiSettingsCard>
</template>
