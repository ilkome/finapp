<script setup lang="ts">
const appConfig = useAppConfig()
const site = useSiteConfig()

const { isEnabled: isAssistantEnabled } = useAssistant()
const { isEnabled, localePath, locales } = useDocusI18n()

const links = computed(() => appConfig.github && appConfig.github.url
  ? [
      {
        'aria-label': 'GitHub',
        'icon': 'i-simple-icons-github',
        'target': '_blank',
        'to': appConfig.github.url,
      },
    ]
  : [])
</script>

<template>
  <UHeader
    :ui="{ center: 'flex-1' }"
    :to="localePath('/')"
    :title="appConfig.header?.title || site.name"
  >
    <AppHeaderCenter />

    <template #title>
      <AppHeaderLogo class="h-6 w-auto shrink-0" />
    </template>

    <template #right>
      <UButton
        to="https://finapp.ilko.me"
        target="_blank"
        color="neutral"
        variant="ghost"
        size="sm"
        trailingIcon="i-lucide-arrow-up-right"
      >
        Open Finapp
      </UButton>

      <AppHeaderCTA />

      <template v-if="isAssistantEnabled">
        <AssistantChat />
      </template>

      <template v-if="isEnabled && locales.length > 1">
        <ClientOnly>
          <LanguageSelect />

          <template #fallback>
            <div class="h-8 w-8 animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-800" />
          </template>
        </ClientOnly>

        <USeparator
          orientation="vertical"
          class="h-8"
        />
      </template>

      <UContentSearchButton class="lg:hidden" />

      <ClientOnly>
        <UColorModeButton />

        <template #fallback>
          <div class="h-8 w-8 animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-800" />
        </template>
      </ClientOnly>

      <template v-if="links?.length">
        <UButton
          v-for="(link, index) of links"
          :key="index"
          v-bind="{ color: 'neutral', variant: 'ghost', ...link }"
        />
      </template>
    </template>

    <template #toggle="{ open, toggle }">
      <IconMenuToggle
        :open="open"
        class="lg:hidden"
        @click="toggle"
      />
    </template>

    <template #body>
      <AppHeaderBody />
    </template>
  </UHeader>
</template>
