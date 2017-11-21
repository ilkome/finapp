<template lang="pug">
.dashboard
  AppHeader(
    :selectedPeriodIndex="selectedPeriodIndex"
    :showedGraph="showedGraph"
    :showedHistory="showedHistory"
    :showedChartYears="showedChartYears"
    v-on:setTimePeriod="setTimePeriod"
    v-on:selectPrevPeriod="selectPrevPeriod"
    v-on:selectNextPeriod="selectNextPeriod"
    v-on:setFilterCategory="setFilterCategory"
    v-on:setFilterAccount="setFilterAccount"
    v-on:toogleShowGraph="toogleShowGraph"
    v-on:toogleShowHistory="toogleShowHistory"
    v-on:toogleShowsChartYears="toogleShowsChartYears"
  )

  .main(:class="$store.state.leftBar.isShow && '_withLeftbar'")
    template(v-if="!$store.state.isMobile")
      .moduleLinks
        .moduleLinks__item(
          :class="{ _active: showedChartYears }"
          @click.prevent="toogleShowsChartYears"
        ): .mdi.mdi-chart-bubble
        .moduleLinks__sep
        .moduleLinks__item(
          :class="{ _active: showedGraph }"
          @click.prevent="toogleShowGraph"
        ): .fa.fa-bar-chart
        template(v-if="showedGraph")
          .moduleLinks__item(
            @click.prevent="$store.commit('toogleShowGraphValues')"
            :class="{ _active: $store.state.filter.filter.showedGraphValues }"
          ): .fa.fa-sliders
        .moduleLinks__sep
        .moduleLinks__item(
          :class="{ _active: showedHistory }"
          @click.prevent="toogleShowHistory"
        ): .fa.fa-history

      //- ChartYears
      transition(name="calendarPopupAnimation")
        .h-relative(v-show="showedChartYears")
          ChartYears(
            v-on:setDashboardDate="setDashboardDate"
          )

    //- Chart HTML
    transition(name="calendarPopupAnimation")
      template(v-if="showedGraph && getPeriodStatic && !$store.state.isMobile")
        .module._alt
          .module__in._stat
            .statChart
              .statChart__in
                template(v-for="(period, index) in getPeriodStatic.periods")
                  .statChart__item(
                    @click.prevent="selectPeriodStat(index)"
                    :class="{ _active: selectedPeriodIndex === index }"
                  )
                    template(v-if="!$store.state.isMobile && !$store.state.filter.filter.showedGraphValues")
                      .tooltip
                        .tooltip__in
                          .tooltip__name {{ period.name }}
                          .tooltip__incomes {{ formatMoney(period.incomes) }}
                          .tooltip__expenses {{ formatMoney(period.expenses) }}
                    template(v-if="$store.state.filter.filter.showedGraphValues")
                      .statChart__name._padding {{ period.name }}
                    .statChartGraph(:class="{ _bigger: $store.state.filter.filter.showedGraphValues }")
                      template(v-if="period.expenses <= 0 && period.incomes <= 0")
                        .statChartGraph__in._empty
                      template(v-else)
                        template(v-if="period.expenses > 0")
                          .statChartGraph__in._expenses(:style="getPeriodStaticHeight(period.expenses, getPeriodStatic.biggest)")
                        template(v-else)
                          .statChartGraph__in._empty
                        template(v-if="period.incomes > 0")
                          .statChartGraph__in._incomes(:style="getPeriodStaticHeight(period.incomes, getPeriodStatic.biggest)")
                        template(v-else)
                          .statChartGraph__in._empty
                    .statChart__values
                      template(v-if="$store.state.filter.filter.showedGraphValues")
                        .statChart__values__row._expenses {{ formatMoney(period.expenses) }}
                        .statChart__values__row._incomes {{ formatMoney(period.incomes) }}
                      template(v-else)
                        .statChart__name {{ period.name }}

    //- History
    template(v-if="showedHistory")
      .module._history
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
          .sliderFixWidth
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
                    :idsOfOpenedCategories="idsOfOpenedCategories"
                    v-on:toogleOpenedCategories="toogleOpenedCategories"
                    v-on:shouldOpenCategory="shouldOpenCategory"
                    v-on:getCategoryStat="getCategoryStat"
                    v-on:toogleShowTrnsInCategory="toogleShowTrnsInCategory"
                    v-on:setFilterCategory="setFilterCategory"
                  )
                    template(slot="graph2")
                      template(v-if="!getFilter.category")
                        .statChartFix
                          .statChart2
                            .statChart__in
                              template(v-for="(period, index) in expensesItemsStat.slice(0, 8)")
                                .statChart__item2(@click.prevent="setFilterCategory(period.category)")
                                  .statChartGraph2
                                    .statChartGraph2__in(:style="{ background: period.category.color, height: getPeriodStaticHeight2(period.total, expensesItemsStat[0].total) }")
                                      .statChartGraph2__total.sum {{ period.totalK }}
                                  .icon._small(
                                    :style="`background: ${period.category.color}`"
                                  ): div(:class="period.category.icon")
                                    .icon__label
                                      .icon__label__in(:style="`background: ${period.category.color}`") {{ period.category.name }}

                //- Incomes
                .swiper-slide
                  ItemStatGroup(
                    type="incomes"
                    :trnsList="trnsList"
                    :itemsStatList="incomesItemsStat"
                    :idsOfOpenedCategories="idsOfOpenedCategories"
                    v-on:toogleOpenedCategories="toogleOpenedCategories"
                    v-on:shouldOpenCategory="shouldOpenCategory"
                    v-on:getCategoryStat="getCategoryStat"
                    v-on:toogleShowTrnsInCategory="toogleShowTrnsInCategory"
                    v-on:setFilterCategory="setFilterCategory"
                  )
                    template(slot="graph2")
                      template(v-if="!getFilter.category")
                        .statChartFix
                          .statChart2
                            .statChart__in
                              template(v-for="(period, index) in incomesItemsStat.slice(0, 8)")
                                .statChart__item2(@click.prevent="setFilterCategory(period.category)")
                                  .statChartGraph2
                                    .statChartGraph2__in(:style="{ background: period.category.color, height: getPeriodStaticHeight2(period.total, incomesItemsStat[0].total) }")
                                      .statChartGraph2__total.sum {{ period.totalK }}
                                  .icon._small(
                                    :style="`background: ${period.category.color}`"
                                  ): div(:class="period.category.icon")
                                    .icon__label
                                      .icon__label__in(:style="`background: ${period.category.color}`") {{ period.category.name }}

                //- History
                .swiper-slide
                  .itemStatGroup
                    TrnsList(:trns="trnsListHistory.slice(0, 100)")
        //- end: Mobile

        //- PC
        template(v-if="!$store.state.isMobile")
          //- Selected category
          template(v-if="getFilter.category")
            .selectedCategeory(
              @click.prevent="$store.commit('setFilterCategory', null)"
            )
              .selectedCategeory__icon
                .icon._big(:style="`background: ${getFilter.category.color}`")
                  div(:class="getFilter.category.icon")
              .selectedCategeory__name {{ getFilter.category.name }}

          .gridTable._stats
            //- Expences
            template(v-if="expensesItemsStat.length")
              .gridTable__item
                ItemStatGroup(
                  type="expenses"
                  :trnsList="trnsList"
                  :itemsStatList="expensesItemsStat"
                  :idsOfOpenedCategories="idsOfOpenedCategories"
                  v-on:toogleOpenedCategories="toogleOpenedCategories"
                  v-on:onClickIcon="setFilterCategory"
                  v-on:shouldOpenCategory="shouldOpenCategory"
                  v-on:getCategoryStat="getCategoryStat"
                  v-on:toogleShowTrnsInCategory="toogleShowTrnsInCategory"
                  v-on:setFilterCategory="setFilterCategory"
                )
                  template(slot="graph2")
                    template(v-if="!getFilter.category")
                      .statChartFix
                        .statChart2
                          .statChart__in
                            template(v-for="(period, index) in expensesItemsStat.slice(0, 8)")
                              .statChart__item2(@click.prevent="setFilterCategory(period.category)")
                                .statChartGraph2
                                  .statChartGraph2__in(:style="{ background: period.category.color, height: getPeriodStaticHeight2(period.total, expensesItemsStat[0].total) }")
                                    .statChartGraph2__total.sum {{ period.totalK }}
                                .icon._small(
                                  :style="`background: ${period.category.color}`"
                                )
                                  div(:class="period.category.icon")
                                  .icon__label
                                    .icon__label__in(:style="`background: ${period.category.color}`") {{ period.category.name }}

            //- Incomes
            template(v-if="incomesItemsStat.length")
              .gridTable__item
                ItemStatGroup(
                  type="incomes"
                  :trnsList="trnsList"
                  :itemsStatList="incomesItemsStat"
                  :idsOfOpenedCategories="idsOfOpenedCategories"
                  v-on:toogleOpenedCategories="toogleOpenedCategories"
                  v-on:onClickIcon="setFilterCategory"
                  v-on:shouldOpenCategory="shouldOpenCategory"
                  v-on:getCategoryStat="getCategoryStat"
                  v-on:toogleShowTrnsInCategory="toogleShowTrnsInCategory"
                  v-on:setFilterCategory="setFilterCategory"
                )
                  template(slot="graph2")
                    template(v-if="!getFilter.category")
                      .statChartFix
                        .statChart2
                          .statChart__in
                            template(v-for="(period, index) in incomesItemsStat.slice(0, 10)")
                              .statChart__item2(@click.prevent="setFilterCategory(period.category)")
                                .statChartGraph2
                                  .statChartGraph2__in(:style="{ background: period.category.color, height: getPeriodStaticHeight2(period.total, incomesItemsStat[0].total) }")
                                    .statChartGraph2__total.sum {{ period.totalK }}
                                .icon._small(
                                  :style="`background: ${period.category.color}`"
                                )
                                  div(:class="period.category.icon")
                                  .icon__label
                                    .icon__label__in(:style="`background: ${period.category.color}`") {{ period.category.name }}
            //- end: Incomes
        //- end: PC

        template(v-if="expensesItemsStat.length <= 0 && incomesItemsStat.length <= 0")
          .moneyTitle No trns for selected period
</template>

<script src="./DashboardPage.js"></script>
