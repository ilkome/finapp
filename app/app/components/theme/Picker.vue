<script setup lang="ts">
import { BLACK_PRIMARY, capitalize, swatchPalette, useThemeOptions } from '~/components/theme/useThemeOptions'

const colorMode = useColorMode()
const { t } = useI18n()
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
  { label: 'Black', value: BLACK_PRIMARY },
  ...primaryColors.map(c => ({ label: capitalize(c), value: c })),
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

const neutralItems = computed(() => neutralColors.map(c => ({ label: capitalize(c), value: c })))
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

      <!-- Primary color -->
      <div class="flex flex-col items-start gap-1">
        <span class="text-xs text-muted">{{ t('theme.picker.primary') }}</span>
        <USelectMenu
          v-model="primarySelected"
          :items="primaryItems"
          valueKey="value"
          :searchInput="false"
        >
          <template #leading>
            <span
              v-if="primarySelected === BLACK_PRIMARY"
              class="size-5 rounded-full bg-black dark:bg-white"
            />
            <span
              v-else
              class="size-5 rounded-full bg-(--color-light) dark:bg-(--color-dark)"
              :style="{
                '--color-light': `var(--color-${primarySelected}-500)`,
                '--color-dark': `var(--color-${primarySelected}-400)`,
              }"
            />
          </template>
          <template #item-leading="{ item }">
            <span
              v-if="item.value === BLACK_PRIMARY"
              class="size-5 rounded-full bg-black dark:bg-white"
            />
            <span
              v-else
              class="size-5 rounded-full bg-(--color-light) dark:bg-(--color-dark)"
              :style="{
                '--color-light': `var(--color-${item.value}-500)`,
                '--color-dark': `var(--color-${item.value}-400)`,
              }"
            />
          </template>
        </USelectMenu>
      </div>

      <!-- Neutral color -->
      <div class="flex flex-col items-start gap-1">
        <span class="text-xs text-muted">{{ t('theme.picker.neutral') }}</span>
        <USelectMenu
          v-model="neutral"
          :items="neutralItems"
          valueKey="value"
          :searchInput="false"
        >
          <template #leading>
            <span
              class="size-5 rounded-full bg-(--color-light) dark:bg-(--color-dark)"
              :style="{
                '--color-light': `var(--color-${swatchPalette(neutral)}-500)`,
                '--color-dark': `var(--color-${swatchPalette(neutral)}-400)`,
              }"
            />
          </template>
          <template #item-leading="{ item }">
            <span
              class="size-5 rounded-full bg-(--color-light) dark:bg-(--color-dark)"
              :style="{
                '--color-light': `var(--color-${swatchPalette(item.value)}-500)`,
                '--color-dark': `var(--color-${swatchPalette(item.value)}-400)`,
              }"
            />
          </template>
        </USelectMenu>
      </div>

      <!-- Radius -->
      <div class="flex flex-col items-start gap-1">
        <span class="text-xs text-muted">{{ t('theme.picker.radius') }}</span>
        <USelectMenu
          v-model="radius"
          :items="radiusItems"
          valueKey="value"
          :searchInput="false"
        >
          <template #leading>
            <span
              class="size-5 bg-elevated"
              :style="{ borderRadius: `${radius}rem` }"
            />
          </template>
          <template #item-leading="{ item }">
            <span
              class="size-5 bg-elevated"
              :style="{ borderRadius: `${item.value}rem` }"
            />
          </template>
        </USelectMenu>
      </div>
    </div>
  </UiSettingsCard>
</template>
