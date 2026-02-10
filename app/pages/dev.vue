<script lang="ts" setup>
</script>

<template>
  <UiPage>
    <div class="grid grid-cols-[1fr_auto] items-start gap-8 p-3">
      <div class="grid gap-12">
        <div>
          <!-- Colors -->
          <h1 class="border-item-6 mb-2 border-b pb-1">
            Colors
          </h1>

          <div class="grid gap-4">
            <div class="grid gap-2">
              <div class="text-muted text-sm">
                Backgrounds
              </div>
              <div class="flex flex-wrap gap-0">
                <div class="flex-center size-20 bg-[var(--item-1)]">
                  1
                </div>
                <div class="flex-center bg-item-2 size-20">
                  2
                </div>
                <div class="flex-center bg-item-3 size-20">
                  3
                </div>
                <div class="flex-center bg-item-4 size-20">
                  4
                </div>
                <div class="flex-center size-20 bg-[var(--item-5)]">
                  5
                </div>
                <div class="flex-center bg-item-6 size-20">
                  6
                </div>
                <div class="flex-center bg-item-7 size-20">
                  7
                </div>
              </div>
            </div>

            <div class="grid gap-2">
              <div class="text-muted text-sm">
                Texts
              </div>
              <div class="flex flex-wrap gap-0">
                <div class="flex-center bg-1 text-icon-primary size-20">
                  1
                </div>
                <div class="flex-center bg-3 size-20">
                  3
                </div>
                <div class="flex-center bg-2 size-20">
                  2
                </div>
                <div class="flex-center bg-4 size-20">
                  4
                </div>
              </div>
            </div>

            <div class="flex flex-wrap gap-4">
              <div class="grid gap-2">
                <div class="text-muted text-sm">
                  Accent
                </div>
                <div class="flex flex-wrap gap-0">
                  <div class="size-20 bg-(--ui-primary)" />
                </div>
              </div>

              <div class="grid gap-2">
                <div class="text-muted text-sm">
                  Icon primary
                </div>
                <div class="flex flex-wrap gap-0">
                  <div class="flex-center bg-icon-primary size-20">
                    1
                  </div>
                </div>
              </div>

              <div class="grid gap-2">
                <div class="text-muted text-sm">
                  Alert
                </div>
                <div class="flex flex-wrap gap-0">
                  <div class="bg-alert-1 size-20" />
                </div>
              </div>

              <div class="grid gap-2">
                <div class="text-muted text-sm">
                  Money
                </div>
                <div class="flex flex-wrap gap-0">
                  <div class="bg-income-1 size-20" />
                  <div class="bg-income-2 size-20" />
                  <div class="bg-expense-1 size-20" />
                  <div class="bg-expense-2 size-20" />
                </div>
              </div>
            </div>

            <div>
              <h1 class="border-item-6 mb-2 border-b pb-1">
                Chart
              </h1>

              <div class="flex flex-wrap">
                <div class="size-20 bg-[var(--chart-line)]" />
                <div class="size-20 bg-[var(--chart-splitLine)]" />
                <div class="size-20 bg-[var(--chart-label)]" />
                <div class="size-20 bg-[var(--chart-tooltip)]" />
              </div>
            </div>
          </div>
        </div>

        <!-- UiTitle -->
        <div>
          <h1 class="border-item-6 mb-2 border-b pb-1">
            UiTitle
          </h1>

          <div class="grid gap-4">
            <UiTitle3>
              UiTitle3
            </UiTitle3>

            <UiTitle6>
              UiTitle6
            </UiTitle6>

            <UiTitle8>
              UiTitle8
            </UiTitle8>

            <UiTitleDropRight>
              UiTitleDropRight
            </UiTitleDropRight>

            <UiTitleModal>
              UiTitleModal
            </UiTitleModal>

            <UiTitleOption>
              UiTitleOption
            </UiTitleOption>
          </div>
        </div>

        <div>
          <h1 class="border-item-6 mb-2 border-b pb-1">
            UiText
          </h1>

          <div class="grid gap-4">
            <UiTextSm1>
              UiTextSm1
            </UiTextSm1>

            <UiTextSm2>
              UiTextSm2
            </UiTextSm2>
          </div>
        </div>

        <div>
          <h1 class="border-item-6 mb-2 border-b pb-1">
            UiToggle
          </h1>

          <div class="grid gap-4">
            <UiToggle>
              UiToggle
            </UiToggle>

            <UiToggleWithStorage>
              UiToggleWithStorage
            </UiToggleWithStorage>

            <UiToggle3 isShown>
              UiToggle3
            </UiToggle3>

            <UiToggleAction isShown>
              UiToggleAction
            </UiToggleAction>
          </div>
        </div>

        <div>
          <h1 class="border-item-6 mb-2 border-b pb-1">
            UiItem
          </h1>

          <div class="grid gap-4">
            <UiItem1>
              UiItem1
            </UiItem1>

            <UiItem2>
              UiItem2
            </UiItem2>

            <UiItem3>
              UiItem3
            </UiItem3>
          </div>
        </div>

        <div>
          <h1 class="border-item-6 mb-2 border-b pb-1">
            UiTabs
          </h1>

          <div class="grid gap-4">
            <UiTabs1>
              UiTabs1
            </UiTabs1>

            <UiTabs2>
              UiTabs2
            </UiTabs2>
          </div>
        </div>

        <div>
          <h1 class="border-item-6 mb-2 border-b pb-1">
            UiTabsItem
          </h1>

          <div class="grid grid-cols-2 gap-2">
            <div class="grid gap-4">
              <UiTabsItem1>
                UiTabsItem1
              </UiTabsItem1>

              <UiTabsItem3>
                UiTabsItem3
              </UiTabsItem3>

              <UiTabsItem4>
                UiTabsItem4
              </UiTabsItem4>
            </div>

            <div class="grid gap-4">
              <UiTabsItem1 isActive>
                UiTabsItem1
              </UiTabsItem1>

              <UiTabsItem3 isActive>
                UiTabsItem3
              </UiTabsItem3>

              <UiTabsItem4 isActive>
                UiTabsItem4
              </UiTabsItem4>
            </div>
          </div>
        </div>
      </div>

      <div>
        <!-- Calendar -->
        <div>
          <h1 class="border-item-6 mb-2 border-b pb-1">
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
