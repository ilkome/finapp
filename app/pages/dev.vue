<template>
  <UiPage>
    <div class="grid grid-cols-[1fr_auto] items-start gap-8 p-3">
      <div class="grid gap-12">
        <div>
          <!-- Colors -->
          <h1 class="border-default mb-2 border-b pb-1">
            Colors
          </h1>

          <div class="grid gap-4">
            <div class="grid gap-2">
              <div class="text-muted text-sm">
                Backgrounds
              </div>
              <div class="flex flex-wrap gap-0">
                <div class="flex-center bg-default size-20">
                  default
                </div>
                <div class="flex-center bg-muted size-20">
                  muted
                </div>
                <div class="flex-center bg-elevated size-20">
                  elevated
                </div>
                <div class="flex-center bg-accented size-20">
                  accented
                </div>
                <div class="flex-center bg-inverted text-inverted size-20">
                  inverted
                </div>
              </div>
            </div>

            <div class="grid gap-2">
              <div class="text-muted text-sm">
                Texts
              </div>
              <div class="bg-default flex flex-col gap-1 p-4">
                <span class="text-highlighted">text-highlighted</span>
                <span class="text-toned">text-toned</span>
                <span class="text-default">text-default</span>
                <span class="text-muted">text-muted</span>
                <span class="text-dimmed">text-dimmed</span>
              </div>
            </div>

            <div class="grid gap-2">
              <div class="text-muted text-sm">
                Primary
              </div>
              <div class="flex flex-wrap gap-0">
                <div class="bg-primary size-20" />
              </div>
            </div>
          </div>
        </div>

        <!-- UiTitle -->
        <div>
          <h1 class="border-default mb-2 border-b pb-1">
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
          <h1 class="border-default mb-2 border-b pb-1">
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
          <h1 class="border-default mb-2 border-b pb-1">
            UiToggle
          </h1>

          <div class="grid gap-4">
            <UiToggle>
              UiToggle
            </UiToggle>

            <UiToggleWithStorage>
              UiToggleWithStorage
            </UiToggleWithStorage>

            <UiToggleControlled isShown>
              UiToggleControlled
            </UiToggleControlled>
          </div>
        </div>

        <div>
          <h1 class="border-default mb-2 border-b pb-1">
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
          <h1 class="border-default mb-2 border-b pb-1">
            UiTabs
          </h1>

          <div class="grid gap-4">
            <UiTabsBar>
              UiTabsBar
            </UiTabsBar>

            <UiTabsScroll>
              UiTabsScroll
            </UiTabsScroll>
          </div>
        </div>

        <div>
          <h1 class="border-default mb-2 border-b pb-1">
            UiTabsItem
          </h1>

          <div class="grid grid-cols-2 gap-2">
            <div class="grid gap-4">
              <UiTabsItemFill>
                UiTabsItemFill
              </UiTabsItemFill>

              <UiTabsItemPill>
                UiTabsItemPill
              </UiTabsItemPill>

              <UiTabsItemPill variant="outline">
                UiTabsItemPill outline
              </UiTabsItemPill>
            </div>

            <div class="grid gap-4">
              <UiTabsItemFill isActive>
                UiTabsItemFill
              </UiTabsItemFill>

              <UiTabsItemPill isActive>
                UiTabsItemPill
              </UiTabsItemPill>

              <UiTabsItemPill
                variant="outline"
                isActive
              >
                UiTabsItemPill outline
              </UiTabsItemPill>
            </div>
          </div>
        </div>
      </div>

      <div>
        <!-- Calendar -->
        <div>
          <h1 class="border-default mb-2 border-b pb-1">
            Calendar
          </h1>

          <div class="grid gap-4">
            <UCalendar />
            <div class="bg-muted h-px" />
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
