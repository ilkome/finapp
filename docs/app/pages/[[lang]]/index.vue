<script setup lang="ts">
import type { Collections } from '@nuxt/content'

const route = useRoute()
const { isEnabled, locale } = useDocusI18n()

const collectionName = computed(() => isEnabled.value ? `landing_${locale.value}` : 'landing')

const { data: page } = await useAsyncData(
  `landing-${locale.value}`,
  () => queryCollection(collectionName.value as keyof Collections).path(route.path).first(),
  { watch: [collectionName] },
)

if (!page.value) {
  throw createError({ fatal: true, statusCode: 404, statusMessage: 'Page not found' })
}

const title = computed(() => page.value?.seo?.title || page.value?.title)
const description = computed(() => page.value?.seo?.description || page.value?.description)

useSeo({
  description,
  ogImage: page.value?.seo?.ogImage as string | undefined,
  title,
  type: 'website',
})

if (!page.value?.seo?.ogImage) {
  defineOgImageComponent('Landing', {
    description,
    title,
  })
}
</script>

<template>
  <div>
    <ContentRenderer
      v-if="page"
      :value="page"
    />
  </div>
</template>
