<script setup lang="ts">
const tabsPillValue = ref('two')
const tabsPillEqualValue = ref('two')
const tabsScrollValue = ref('item-3')
const tabsLinkValue = ref('two')
const tabsMdValue = ref('two')
const tabsSmValue = ref('two')
const tabsXsValue = ref('two')
const tabsLastActiveValue = ref('item-15')

const tabsScrollItems = Array.from({ length: 15 }, (_, i) => ({ label: `Item ${i + 1}`, value: `item-${i + 1}` }))
</script>

<template>
  <UiPage>
    <div class="grid grid-cols-[1fr_auto] items-start gap-8 p-3">
      <div class="grid gap-12">
        <div>
          <!-- Colors -->
          <h1 class="mb-2 border-b border-default pb-1">
            Colors
          </h1>

          <div class="grid gap-4">
            <div class="grid gap-2">
              <div class="text-sm text-muted">
                Backgrounds
              </div>
              <div class="flex flex-wrap gap-0">
                <div class="flex-center size-20 bg-default">
                  default
                </div>
                <div class="flex-center size-20 bg-muted">
                  muted
                </div>
                <div class="flex-center size-20 bg-elevated">
                  elevated
                </div>
                <div class="flex-center size-20 bg-accented">
                  accented
                </div>
                <div class="flex-center size-20 bg-inverted text-inverted">
                  inverted
                </div>
              </div>
            </div>

            <div class="grid gap-2">
              <div class="text-sm text-muted">
                Texts
              </div>
              <div class="flex flex-col gap-1 bg-default p-4">
                <span class="text-highlighted">text-highlighted</span>
                <span class="text-toned">text-toned</span>
                <span class="text-default">text-default</span>
                <span class="text-muted">text-muted</span>
                <span class="text-dimmed">text-dimmed</span>
              </div>
            </div>

            <div class="grid gap-2">
              <div class="text-sm text-muted">
                Primary
              </div>
              <div class="flex flex-wrap gap-0">
                <div class="size-20 bg-primary" />
              </div>
            </div>
          </div>
        </div>

        <!-- UiTitle -->
        <div>
          <h1 class="mb-2 border-b border-default pb-1">
            UiTitle
          </h1>

          <div class="grid gap-4">
            <UiTitleSection>
              UiTitleSection
            </UiTitleSection>

            <UiText variant="caption">
              UiText caption
            </UiText>

            <UiTitleCollapse>
              UiTitleCollapse
            </UiTitleCollapse>

            <UiTitleDropRight>
              UiTitleDropRight
            </UiTitleDropRight>

            <UiTitleModal>
              UiTitleModal
            </UiTitleModal>

            <UiTitleSection size="sm">
              UiTitleSection sm
            </UiTitleSection>
          </div>
        </div>

        <div>
          <h1 class="mb-2 border-b border-default pb-1">
            UiText
          </h1>

          <div class="grid gap-4">
            <UiText variant="meta">
              UiText meta
            </UiText>

            <UiText variant="navigation">
              UiText navigation
            </UiText>
          </div>
        </div>

        <div>
          <h1 class="mb-2 border-b border-default pb-1">
            UCollapsible
          </h1>

          <div class="grid gap-4">
            <UCollapsible defaultOpen>
              UCollapsible
              <template #content>
                UCollapsible content
              </template>
            </UCollapsible>
          </div>
        </div>

        <div>
          <h1 class="mb-2 border-b border-default pb-1">
            UiItem
          </h1>

          <div class="grid gap-4">
            <UiActionButton>
              UiActionButton
            </UiActionButton>

            <UiChipButton>
              UiChipButton
            </UiChipButton>

            <UiActionButton>
              UiActionButton
            </UiActionButton>
          </div>
        </div>

        <div>
          <h1 class="mb-2 border-b border-default pb-1">
            UiTabs
          </h1>

          <div class="grid gap-4">
            <div class="grid gap-1">
              <div class="text-sm text-muted">
                pill, 3 items (fills)
              </div>
              <UiTabs v-model="tabsPillValue" :items="[{ label: 'One', value: 'one' }, { label: 'Two', value: 'two' }, { label: 'Three', value: 'three' }]" />
            </div>

            <div class="grid gap-1">
              <div class="text-sm text-muted">
                pill, 3 items, isEqual (identical boxes)
              </div>
              <UiTabs v-model="tabsPillEqualValue" isEqual :items="[{ label: 'One', value: 'one' }, { label: 'Two', value: 'two' }, { label: 'Three', value: 'three' }]" />
            </div>

            <div class="grid gap-1">
              <div class="text-sm text-muted">
                pill, ~15 items (scrolls)
              </div>
              <UiTabs v-model="tabsScrollValue" :items="tabsScrollItems" />
            </div>

            <div class="grid gap-1">
              <div class="text-sm text-muted">
                link variant
              </div>
              <UiTabs v-model="tabsLinkValue" :items="[{ label: 'One', value: 'one' }, { label: 'Two', value: 'two' }, { label: 'Three', value: 'three' }]" variant="link" />
            </div>

            <div class="grid gap-1">
              <div class="text-sm text-muted">
                sizes: md / sm / xs
              </div>
              <UiTabs v-model="tabsMdValue" :items="[{ label: 'One', value: 'one' }, { label: 'Two', value: 'two' }, { label: 'Three', value: 'three' }]" size="md" />
              <UiTabs v-model="tabsSmValue" :items="[{ label: 'One', value: 'one' }, { label: 'Two', value: 'two' }, { label: 'Three', value: 'three' }]" size="sm" />
              <UiTabs v-model="tabsXsValue" :items="[{ label: 'One', value: 'one' }, { label: 'Two', value: 'two' }, { label: 'Three', value: 'three' }]" size="xs" />
            </div>

            <div class="grid gap-1">
              <div class="text-sm text-muted">
                initial active item is the LAST one (mount-jump regression check)
              </div>
              <UiTabs v-model="tabsLastActiveValue" :items="tabsScrollItems" />
            </div>

            <URadioGroup
              defaultValue="one"
              indicator="hidden"
              :items="[{ label: 'One', value: 'one' }, { label: 'Two', value: 'two' }]"
              orientation="horizontal"
            />
          </div>
        </div>
      </div>

      <div>
        <!-- Calendar -->
        <div>
          <h1 class="mb-2 border-b border-default pb-1">
            Calendar
          </h1>

          <div class="grid gap-4">
            <UCalendar />
            <div class="h-px bg-muted" />
            <UCalendar
              class="@container/calendar"
              :numberOfMonths="2"
              range
            />
          </div>
        </div>
      </div>
    </div>
  </UiPage>
</template>
