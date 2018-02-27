<template lang="pug">
.dashboard
  AppHeader(
    :trnsDate="trnsDate"
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

  .main
    template(v-if="$store.state.isMobile")
      BottomFixedLinks

    template(v-if="!$store.state.isMobile")
      //- ChartYears
      transition(name="calendarPopupAnimation")
        template(v-if="showedChartYears")
          .h-relative(v-show="showedChartYears")
            ChartYears(
              v-on:setDashboardDateMnoth="setDashboardDateMnoth"
            )

    //- mobile
    template(v-if="$store.state.isMobile")
      template(v-if="getFilter.category || getFilter.account")
        .selectedBox
          .flex
            template(v-if="getFilter.account")
              .header__link._account(@click.prevent="$store.commit('setFilterAccount', null)")
                .icon._round(:style="`background: ${getFilter.account.color}`")
                  .icon__abbr {{ getFilter.account.name.charAt(0) }}{{ getFilter.account.name.charAt(1) }}
                .moneyBlock__total.sum.ml-mm {{ formatMoney(getFilter.account.total)}}
            template(v-if="getFilter.category")
              .header__link._active(@click.prevent="setFilterCategory(null)")
                .icon(:style="`background: ${getFilter.category.color}`")
                  div(:class="getFilter.category.icon")
                .ml-mm {{ getFilter.category.name }}


    //- Chart last 6 months
    transition(name="calendarPopupAnimation")
      template(v-if="showedGraph && getPeriodStatic")
        .module._alt._mobileFixed(v-show="!showedChartYears")
          .module__in._stat
            .statChart._overflow
              .stat__toogle(
                @click.prevent="$store.commit('toogleShowGraphValues')"
                :class="{ _active: $store.state.filter.filter.showedGraphValues }"
              ): .fa.fa-sliders

              .statChart__in
                template(v-for="(period, index) in getPeriodStatic.periods")
                  .statChart__item(
                    @click.prevent="setDashboardDate(period.date)"
                    :class="{ _active: checkIsSameDate(period.date) }"
                  )
                    template(v-if="!$store.state.isMobile && !$store.state.filter.filter.showedGraphValues")
                      .tooltip
                        .tooltip__in
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

    template(v-if="!$store.state.isMobile")
      .module._alt._small(v-show="!showedChartYears")
        .module__in
          SummaryShort(
            :trns="trnsList",
            view="dashboard-full"
          )

    //- History
    template(v-if="showedHistory")
      .module._history
        .module__in
          .moneyTitle._pb History
          TrnsList(:trns="trnsListHistory.slice(0, 500)")


    .module._stat
      .module__in(
        :class="{ _mobileFixed: showedGraph && $store.state.isMobile}"
      )
        //- Mobile
        //----------------------------------------------------------------------
        template(v-if="$store.state.isMobile")
          template(v-if="expensesItemsStat.length <= 0 && incomesItemsStat.length <= 0")
            .panel
              .summaryShort__wrap
                .moneyTitle.mb-sb No trns for selected period

          template(v-else)
            transition(name="anim-router" mode="out-in")
              .panel(v-show="mobileDashboardActiveTab === 'summary'")
                .div
                  .accountWidgets
                    template(v-for="accountItem in accounts.slice(0, 6)")
                      .accountWidgetItem(
                        @click="$store.commit('setFilterAccount', accountItem)"
                        :style="{ background: accountItem.color }"
                      )
                        .accountWidgetItem__name {{ accountItem.name }}
                        .accountWidgetItem__price.sum {{ formatMoney(accountItem.total, accountItem.currency) }}

                  SummaryShort(
                    :trns="trnsList",
                    view="mobile-new"
                  )

            transition(name="anim-router" mode="out-in")
              .panel(v-show="mobileDashboardActiveTab === 'expenses'")
                .div
                  .summaryShort__wrap
                    SummaryShort(
                      :trns="trnsList",
                      view="mobile-expenses"
                    )

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
                      template(v-if="!getFilter.category && expensesItemsStat.length")
                        .statChartFix
                          .statChart2
                            .statChart__in
                              template(v-for="(period, index) in expensesItemsStat.slice(0, 8)")
                                .statChart__item2(@click.prevent="setFilterCategory(period.category)")
                                  .statChartGraph2
                                    .statChartGraph2__in(:style="{ background: period.category.color, height: getPeriodStaticHeight2(period.total, expensesItemsStat[0].total) }")
                                      .statChartGraph2__total.sum {{ period.totalK }}
                                  .icon(
                                    :style="`background: ${period.category.color}`"
                                  ): div(:class="period.category.icon")
                                    .icon__label
                                      .icon__label__in(:style="`background: ${period.category.color}`") {{ period.category.name }}

            transition(name="anim-router" mode="out-in")
              .panel(v-show="mobileDashboardActiveTab === 'incomes'")
                .summaryShort__wrap
                  SummaryShort(
                    :trns="trnsList",
                    view="mobile-incomes"
                  )

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
                    template(v-if="!getFilter.category && incomesItemsStat.length")
                      .statChartFix
                        .statChart2
                          .statChart__in
                            template(v-for="(period, index) in incomesItemsStat.slice(0, 8)")
                              .statChart__item2(@click.prevent="setFilterCategory(period.category)")
                                .statChartGraph2
                                  .statChartGraph2__in(:style="{ background: period.category.color, height: getPeriodStaticHeight2(period.total, incomesItemsStat[0].total) }")
                                    .statChartGraph2__total.sum {{ period.totalK }}
                                .icon(
                                  :style="`background: ${period.category.color}`"
                                ): div(:class="period.category.icon")

            transition(name="anim-router" mode="out-in")
              .panel(v-show="mobileDashboardActiveTab === 'history'")
                .itemStatGroup
                  TrnsList(:trns="trnsListHistory.slice(0, 100)")


        //- PC
        //----------------------------------------------------------------------
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
                              .statChart__item2.tooltip-trigger(@click.prevent="setFilterCategory(period.category)")
                                .statChartGraph2
                                  .statChartGraph2__in(:style="{ background: period.category.color, height: getPeriodStaticHeight2(period.total, expensesItemsStat[0].total) }")
                                    .statChartGraph2__total.sum {{ period.totalK }}
                                .icon(
                                  :style="`background: ${period.category.color}`"
                                )
                                  div(:class="period.category.icon")
                                  .tooltip
                                    .tooltip__in
                                      .tooltip__name-normal {{ period.name }}
                                      .tooltip__expenses {{ formatMoney(period.total) }}

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
                            template(v-for="(period, index) in incomesItemsStat.slice(0, 8)")
                              .statChart__item2.tooltip-trigger(@click.prevent="setFilterCategory(period.category)")
                                .statChartGraph2
                                  .statChartGraph2__in(:style="{ background: period.category.color, height: getPeriodStaticHeight2(period.total, incomesItemsStat[0].total) }")
                                    .statChartGraph2__total.sum {{ period.totalK }}
                                .icon(
                                  :style="`background: ${period.category.color}`"
                                )
                                  div(:class="period.category.icon")
                                  .tooltip
                                    .tooltip__in
                                      .tooltip__name-normal {{ period.name }}
                                      .tooltip__incomes {{ formatMoney(period.total) }}
            //- end: Incomes
            template(v-if="expensesItemsStat.length <= 0 && incomesItemsStat.length <= 0")
              .moneyTitle No trns for selected period
        //- end: PC
</template>

<script src="./DashboardPage.js"></script>
