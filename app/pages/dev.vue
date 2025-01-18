<script lang="ts" setup>
</script>

<template>
  <UiPage>
    <AppThemeSwitcherTabs />

    <div class="grid grid-cols-[1fr,auto] items-start gap-8 p-3">
      <div class="grid gap-12">
        <div>
          <!-- Colors -->
          <h1 class="border-item-6 mb-2 border-b pb-1">
            Colors
          </h1>

          <div class="grid gap-4">
            <div class="grid gap-2">
              <div class="text-2 text-sm">
                Backgrounds
              </div>
              <div class="flex flex-wrap gap-0">
                <div class="bg-item-1 size-20" />
                <div class="bg-item-2 size-20" />
                <div class="bg-item-3 size-20" />
                <div class="bg-item-4 size-20" />
                <div class="bg-item-hover size-20" />
                <div class="bg-item-6 size-20" />
                <div class="bg-item-7 size-20" />
              </div>
            </div>

            <div class="grid gap-2">
              <div class="text-2 text-sm">
                Texts
              </div>
              <div class="flex flex-wrap gap-0">
                <div class="bg-1 size-20" />
                <div class="bg-3 size-20" />
                <div class="bg-2 size-20" />
                <div class="bg-4 size-20" />
              </div>
            </div>

            <div class="flex flex-wrap gap-4">
              <div class="grid gap-2">
                <div class="text-2 text-sm">
                  Accent
                </div>
                <div class="flex flex-wrap gap-0">
                  <div class="bg-accent-1 size-20" />
                </div>
              </div>

              <div class="grid gap-2">
                <div class="text-2 text-sm">
                  Alert
                </div>
                <div class="flex flex-wrap gap-0">
                  <div class="bg-alert-1 size-20" />
                </div>
              </div>

              <div class="grid gap-2">
                <div class="text-2 text-sm">
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

            <UiToggle2>
              UiToggle2
            </UiToggle2>

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

            <UiTabs3>
              UiTabs3
            </UiTabs3>
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
            <DatePicker
              :value="new Date().getTime()"
              :maxDate="new Date()"
              mode="date"
            />
            <DatePicker
              :value="{
                end: new Date().getTime() - 1000 * 60 * 60 * 24 * 4,
                start: new Date().getTime() - 1000 * 60 * 60 * 24 * 14,
              }"
              mode="range"
              :maxDate="new Date()"
              :rows="2"
            />
          </div>
        </div>
      </div>
    </div>
  </UiPage>
</template>
