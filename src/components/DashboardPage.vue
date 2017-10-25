<template lang="pug">
.main(:class="$store.state.leftBar.isShow && '_withLeftBar'")

  AppHeader(
    :selectedPeriodIndex="selectedPeriodIndex"
    :isLastDays="isLastDays"
    :showedGraph="showedGraph"
    :showedHistory="showedHistory"
    :selectedCategory="selectedCategory"
    v-on:setTimePeriod="setTimePeriod"
    v-on:selectPrevPeriod="selectPrevPeriod"
    v-on:selectNextPeriod="selectNextPeriod"
    v-on:setFilterCategory="setFilterCategory"
    v-on:setFilterAccount="setFilterAccount"
    v-on:toogleShowGraph="toogleShowGraph"
    v-on:toogleShowHistory="toogleShowHistory"
  )

  //- Calendar dropdown
  transition(name="calendarPopupAnimation")
    template(v-if="$store.state.filter.filter.calendar.show")
      .calendar-dropdown(
        :style="{'left':$store.state.filter.filter.calendar.left+'px','top':$store.state.filter.filter.calendar.top+'px'}"
      )
        Calendar(
          :range="$store.state.filter.filter.calendar.range",
          :zero="$store.state.filter.filter.calendar.zero",
          :value="$store.state.filter.filter.calendar.value"
          @select="selectCalendarDates"
        )

  //- Chart
  transition(name="calendarPopupAnimation")
    template(v-if="showedGraph")
      Chart(
        :data="formatTrnsForChart"
        v-on:selectPeriodStat="selectPeriodStat"
      )

  //- History
  template(v-if="showedHistory")
    .module._alt
      .module__in
        .moneyTitle._pb History
        TrnsList(:trns="trnsListHistory.slice(0, 500)")

  .module._stat
    .module__in
      //- Mobile
      template(v-if="$store.state.isMobile")
        SummaryShort(
          :trns="trnsList",
          view="mobile"
          v-on:changeTabMoney="changeTabMoney"
        )

        .gridTable._dashboard
          .gridTable__item.sliderFixWidth
            .switch
              .switch__item
                a._expenses(
                  @click="changeTabMoney('expenses')",
                  :class="{_active: showedTabMoney === 'expenses'}") Expenses
              .switch__item
                a._incomes(
                  @click="changeTabMoney('incomes')",
                  :class="{_active: showedTabMoney === 'incomes'}") Incomes
              .switch__item
                a._history(
                  @click="changeTabMoney('history')",
                  :class="{_active: showedTabMoney === 'history'}") History

            .slider
              Slider(
                :activeTab="showedTabMoney"
                :idsOfOpenedCategories="idsOfOpenedCategories"
                v-on:onChangeSlide="changeTabMoney"
              )
                //- Expenses
                .swiper-slide
                  ItemStatGroup(
                    type="expenses"
                    :trnsList="trnsList"
                    :itemsStatList="expensesItemsStat"
                    :selectedCategory="selectedCategory"
                    :idsOfOpenedCategories="idsOfOpenedCategories"
                    v-on:toogleOpenedCategories="toogleOpenedCategories"
                    v-on:shouldOpenCategory="shouldOpenCategory"
                    v-on:getCategoryStat="getCategoryStat"
                    v-on:toogleShowTrnsInCategory="toogleShowTrnsInCategory"
                    v-on:setFilterCategory="setFilterCategory"
                  )
                //- Incomes
                .swiper-slide
                  ItemStatGroup(
                    type="incomes"
                    :trnsList="trnsList"
                    :itemsStatList="incomesItemsStat"
                    :selectedCategory="selectedCategory"
                    :idsOfOpenedCategories="idsOfOpenedCategories"
                    v-on:toogleOpenedCategories="toogleOpenedCategories"
                    v-on:shouldOpenCategory="shouldOpenCategory"
                    v-on:getCategoryStat="getCategoryStat"
                    v-on:toogleShowTrnsInCategory="toogleShowTrnsInCategory"
                    v-on:setFilterCategory="setFilterCategory"
                  )

                //- History
                .swiper-slide
                  .itemStatGroup
                    TrnsList(:trns="trnsListHistory.slice(0, 100)")

          //- Summary
          template(v-if="!$store.state.isMobile")
            .gridTable__item
              SummaryShort(
                :trns="trnsList",
                view="dashboard-new",
                v-on:changeTabMoney="changeTabMoney"
              )
      //- end: Mobile

      //- PC
      template(v-if="!$store.state.isMobile")
        .gridTable._stats
          //- Expences
          template(v-if="expensesItemsStat.length")
            .gridTable__item
              ItemStatGroup(
                type="expenses"
                :trnsList="trnsList"
                :itemsStatList="expensesItemsStat"
                :selectedCategory="selectedCategory"
                :idsOfOpenedCategories="idsOfOpenedCategories"
                v-on:toogleOpenedCategories="toogleOpenedCategories"
                v-on:onClickIcon="setFilterCategory"
                v-on:shouldOpenCategory="shouldOpenCategory"
                v-on:getCategoryStat="getCategoryStat"
                v-on:toogleShowTrnsInCategory="toogleShowTrnsInCategory"
                v-on:setFilterCategory="setFilterCategory"
              )

          //- Incomes
          template(v-if="incomesItemsStat.length")
            .gridTable__item
              ItemStatGroup(
                type="incomes"
                :trnsList="trnsList"
                :itemsStatList="incomesItemsStat"
                :selectedCategory="selectedCategory"
                :idsOfOpenedCategories="idsOfOpenedCategories"
                v-on:toogleOpenedCategories="toogleOpenedCategories"
                v-on:onClickIcon="setFilterCategory"
                v-on:shouldOpenCategory="shouldOpenCategory"
                v-on:getCategoryStat="getCategoryStat"
                v-on:toogleShowTrnsInCategory="toogleShowTrnsInCategory"
                v-on:setFilterCategory="setFilterCategory"
              )
      //- end: PC

      template(v-if="expensesItemsStat.length <= 0 && incomesItemsStat.length <= 0")
        .moneyTitle No trns for selected period
</template>

<script src="./DashboardPage.js"></script>
