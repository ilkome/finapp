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

            <UiTextSubtitle>
              UiTextSubtitle
            </UiTextSubtitle>

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
            <UiTextMuted>
              UiTextMuted
            </UiTextMuted>

            <UiTextMuted size="sm">
              UiTextMuted sm
            </UiTextMuted>
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
            UTabs
          </h1>

          <div class="grid gap-4">
            <UTabs
              :content="false"
              :items="[{ label: 'One', value: 'one' }, { label: 'Two', value: 'two' }]"
              defaultValue="one"
            />

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
