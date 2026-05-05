<script setup lang="ts">
const props = defineProps<{
  name: string
}>()

const activeTab = useState('app-media-viewport', () => {
  if (import.meta.client) {
    return window.innerWidth < 768 ? 'mobile' : 'desktop'
  }
  return 'desktop'
})

const { locale } = useDocusI18n()

const labels = {
  en: { desktop: 'Desktop', mobile: 'Mobile' },
  ru: { desktop: 'Компьютер', mobile: 'Телефон' },
}

const tabs = computed(() => {
  const l = labels[locale.value as keyof typeof labels] ?? labels.en
  return [
    { icon: 'i-lucide-monitor', label: l.desktop, value: 'desktop' },
    { icon: 'i-lucide-smartphone', label: l.mobile, value: 'mobile' },
  ]
})

function srcFor(viewport: string) {
  return `/images/screenshots/${props.name}-${viewport}.webp`
}

const dimensions = computed(() => {
  return activeTab.value === 'mobile'
    ? { height: 2217, width: 1290 }
    : { height: 1864, width: 2880 }
})
</script>

<template>
  <div class="app-media my-6">
    <UTabs
      v-model="activeTab"
      :items="tabs"
      variant="link"
      size="sm"
    />

    <div class="mt-3 overflow-hidden rounded-lg border border-[var(--ui-border)]">
      <ProseImg
        :key="`${activeTab}-${name}`"
        :src="srcFor(activeTab)"
        :alt="name"
        :width="dimensions.width"
        :height="dimensions.height"
        loading="lazy"
        class="w-full"
        :class="activeTab === 'mobile' ? 'max-w-[430px] mx-auto' : ''"
      />
    </div>
  </div>
</template>
