<script lang="ts" setup>
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'

const categoriesStore = useCategoriesStore()
</script>

<template>
  <UiPage>
    <AppThemeSwitcherTabs />

    <div class="grid grid-cols-[1fr,auto] items-start gap-8 p-3">
      <div class="grid gap-12">
        <div>
          <!-- Colors -->
          <h1 class="mb-2 border-b border-item-6 pb-1">
            Colors
          </h1>

          <div class="grid gap-4">
            <div class="grid gap-2">
              <div class="text-sm text-2">
                Backgrounds
              </div>
              <div class="flex flex-wrap gap-0">
                <div class="size-20 bg-item-2" />
                <div class="size-20 bg-item-7" />
                <div class="size-20 bg-item-6" />
                <div class="size-20 bg-item-hover" />
                <div class="size-20 bg-item-3" />
                <div class="size-20 bg-item-4" />
                <div class="size-20 bg-item-9" />
                <div class="size-20 bg-item-5" />
              </div>
            </div>

            <div class="grid gap-2">
              <div class="text-sm text-2">
                Texts
              </div>
              <div class="flex flex-wrap gap-0">
                <div class="size-20 bg-1" />
                <div class="size-20 bg-3" />
                <div class="size-20 bg-2" />
                <div class="size-20 bg-4" />
                <div class="size-20 bg-5" />
              </div>
            </div>

            <div class="flex flex-wrap gap-4">
              <div class="grid gap-2">
                <div class="text-sm text-2">
                  Accent
                </div>
                <div class="flex flex-wrap gap-0">
                  <div class="size-20 bg-accent-1" />
                </div>
              </div>

              <div class="grid gap-2">
                <div class="text-sm text-2">
                  Alert
                </div>
                <div class="flex flex-wrap gap-0">
                  <div class="size-20 bg-alert-1" />
                </div>
              </div>

              <div class="grid gap-2">
                <div class="text-sm text-2">
                  Money
                </div>
                <div class="flex flex-wrap gap-0">
                  <div class="size-20 bg-income-1" />
                  <div class="size-20 bg-expense-1" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- UiTitle -->
        <div>
          <h1 class="mb-2 border-b border-item-6 pb-1">
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
          <h1 class="mb-2 border-b border-item-6 pb-1">
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
          <h1 class="mb-2 border-b border-item-6 pb-1">
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
          <h1 class="mb-2 border-b border-item-6 pb-1">
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
          <h1 class="mb-2 border-b border-item-6 pb-1">
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
          <h1 class="mb-2 border-b border-item-6 pb-1">
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
          <h1 class="mb-2 border-b border-item-6 pb-1">
            Calendar
          </h1>

          <div class="grid gap-4">
            <DatePicker
              :value="new Date().getTime()"
              mode="date"
            />
            <DatePicker
              :value="{
                end: new Date().getTime(),
                start: new Date().getTime() - 1000 * 60 * 60 * 24 * 14,
              }"
              mode="range"
              :rows="2"
            />
          </div>
        </div>

        <div>
          <h1 class="mb-2 border-b border-item-6 pb-1">
            StatCategoriesLine
          </h1>

          <!-- <StatCategoriesLine
            isShowParent
            :item="{
              id: categoriesStore.items[Object.keys(categoriesStore.items)[0]].id,
              name: 'test',
              trnsIds: [],
              value: 1,
            }"
            :biggestCatNumber="{ income: 1, expense: 1 }"
            :lineWidth="1"
            class="grow"
          /> -->
        </div>
      </div>
    </div>
  </UiPage>
</template>
