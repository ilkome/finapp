<template lang="pug">
.component
  //- Content
  .module._minHeight
    .module-in
      template
        //- Page date header
        .dateTitle
          //- Current date
          template(v-if="!$store.state.isMobile")
            .dateTitle__item
              h1.dateTitle__header(@click.prevent.stop="openPopupCalendar($event)")
                .dateTitle__icon.mdi.mdi-calendar-multiple
                .dateTitle__firstDate {{ $store.state.filter.filter.date.first }}
                .dateTitle__secondDate(v-if="$store.state.filter.filter.date.second !== 'Today'") {{ $store.state.filter.filter.date.second }}

            //- Days
            .dateTitle__item
              .dateTitle__periods
                .dateTitle__periods__item(
                  :class="{_active: duration === 10 && isLastDays}"
                  @click.prevent="setDuration(10)"
                ) 10 days
                .dateTitle__periods__item(
                  :class="{_active: calendarPreset === 'isoweek' && isLastDays}",
                  @click.prevent="setDates('isoweek')"
                ) Week
                .dateTitle__periods__item(
                  :class="{_active: calendarPreset === 'month' && isLastDays}",
                  @click.prevent="setDates('month')"
                ) Month
                .dateTitle__periods__item(
                  :class="{_active: calendarPreset === 'year' && isLastDays}",
                  @click.prevent="setDates('year')"
                ) Year
                .dateTitle__periods__item(
                  :class="{_active: calendarPreset === 'all' && isLastDays}",
                  @click.prevent="setDates('all')"
                ) All

          //- Calendar dropdown
          transition(name="calendarPopupAnimation")
            .calendar-dropdown(
              :style="{'left':$store.state.filter.filter.calendar.left+'px','top':$store.state.filter.filter.calendar.top+'px'}",
              v-if="$store.state.filter.filter.calendar.show")
              .calendarPeriod
                .calendarPeriod__group
                  .calendarPeriod__item(
                    :class="{_active: duration === 1 && isLastDays}"
                    @click.prevent="setDuration(1)"
                  ) Today

                .calendarPeriod__group
                  .calendarPeriod__item(
                    :class="{_active: duration === 10 && isLastDays}"
                    @click.prevent="setDuration(10)"
                  ) Last 10 days
                  .calendarPeriod__item(
                    :class="{_active: duration === 30 && isLastDays}"
                    @click.prevent="setDuration(30)"
                  ) Last 30 days
                  .calendarPeriod__item(
                    :class="{_active: duration === 365 && isLastDays}"
                    @click.prevent="setDuration(365)"
                  ) Last 365 days

                .calendarPeriod__group
                  .calendarPeriod__item(
                    :class="{_active: calendarPreset === 'isoweek' && isLastDays}",
                    @click.prevent="setDates('isoweek')"
                  ) This week
                  .calendarPeriod__item(
                    :class="{_active: calendarPreset === 'month' && isLastDays}",
                    @click.prevent="setDates('month')"
                  ) This month
                  .calendarPeriod__item(
                    :class="{_active: calendarPreset === 'year' && isLastDays}",
                    @click.prevent="setDates('year')"
                  ) This year
                  .calendarPeriod__item(
                    :class="{_active: calendarPreset === 'all' && isLastDays}",
                    @click.prevent="setDates('all')"
                  ) All

              //- Calendar
              Calendar(
                :range="$store.state.filter.filter.calendar.range",
                :zero="$store.state.filter.filter.calendar.zero",
                :value="$store.state.filter.filter.calendar.value"
                @select="selectCalendarDates"
              )

      template(v-if="$store.state.isMobile")
        SummaryShort(:trns="trnsList", view="dashboard-new")

      template(v-if="selectedCategory || getFilter.account")
        .filter
          template(v-if="selectedCategory && getFilter.account")
            .icon._link._mr(@click.prevent="clearFilter()")
              .fa.fa-times
              .icon__label Clear filter

          template(v-if="getFilter.account")
            .icon._link._mr._link(@click.prevent="setFilterAccount(null)")
              .icon__abbr {{ getFilter.account.name.charAt(0) }}{{ getFilter.account.name.charAt(1) }}
              .icon__label Clear filter {{ getFilter.account.name }}

          template(v-if="selectedCategory")
            .icon._mr._text._link(@click.prevent="setFilterCategory(null)", :style="`background: ${selectedCategory.color}`")
              div(:class="selectedCategory.icon")
              .icon__label Clear filter category
              .icon__label2 {{ selectedCategory.name }}

      //- Chart(:data="formatTrnsForChart(trnsList)")

      .gridTable._dashboard
        .gridTable__item
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

          //- Expenses
          template(v-if="expensesItemStats && expensesItemStats.length > 0 && showedTabMoney === 'expenses'")
            .itemStatGroup
              SummaryShort(:trns="trnsList", view="dashboard-expenses")

              template(v-if="selectedCategory && expensesItemStats.length === 1")
                TrnItem(
                  v-for="trn in expensesItemStats[0].trns.slice(0, 20)",
                  :trn="trn",
                  :key="trn.id"
                  v-on:onClickAccount="setFilterAccount"
                  view="small")
              template(v-else)
                ItemStat(
                  v-for="itemStat in expensesItemStats"
                  :key="itemStat.id"
                  :idsOfOpenedCategories="idsOfOpenedCategories"
                  :item="itemStat"
                  :trns="expensesItemStats"
                  type="expenses"
                  v-on:onClickItem="toogleShowTrnsInCategory"
                  v-on:onClickIcon="setFilterCategory"
                )
                  template(slot="inside")
                    template(v-if="shouldOpenCategory(itemStat.id)")
                      template(v-if="getCategoryStat(itemStat.id, 'expenses').length")
                        ItemStat(
                          v-for="itemStatChild in getCategoryStat(itemStat.id, 'expenses')"
                          :key="itemStatChild.id"
                          :idsOfOpenedCategories="idsOfOpenedCategories"
                          :item="itemStatChild"
                          :trns="getCategoryStat(itemStat.id, 'expenses')"
                          type="expenses"
                          :isChild="true"
                          v-on:onClickItem="toogleShowTrnsInCategory"
                          v-on:onClickIcon="setFilterCategory"
                        )
                          template(slot="inside")
                            template(v-if="shouldOpenCategory(itemStatChild.id)")
                              .itemStat__trns
                                TrnItem(
                                  v-for="trn in itemStatChild.trns.filter(trn => trn.type === 0).slice(0, 20)",
                                  :trn="trn",
                                  :key="trn.id"
                                  v-on:onClickAccount="setFilterAccount"
                                  view="small")

                      template(v-else)
                        .itemStat__trns
                          TrnItem(
                            v-for="trn in itemStat.trns.slice(0, 20)",
                            :trn="trn",
                            :key="trn.id"
                            v-on:onClickAccount="setFilterAccount"
                            view="small")

          //- Incomes
          template(v-if="incomesItemStats.length > 0 && showedTabMoney === 'incomes'")
            .itemStatGroup
              SummaryShort(:trns="trnsList", view="dashboard-incomes")
              ItemStat(
                v-for="itemStat in incomesItemStats"
                :key="itemStat.id"
                :idsOfOpenedCategories="idsOfOpenedCategories"
                :item="itemStat"
                :trns="incomesItemStats"
                type="incomes"
                v-on:onClickItem="toogleShowTrnsInCategory"
                v-on:onClickIcon="setFilterCategory"
              )
                template(slot="inside")
                  template(v-if="shouldOpenCategory(itemStat.id)")
                    //- Show child category
                    template(v-if="getCategoryStat(itemStat.id, 'incomes').length")
                      ItemStat(
                        v-for="itemStatChild in getCategoryStat(itemStat.id, 'incomes')"
                        :key="itemStatChild.id"
                        :idsOfOpenedCategories="idsOfOpenedCategories"
                        :item="itemStatChild"
                        :trns="getCategoryStat(itemStat.id, 'incomes')"
                        type="incomes"
                        :isChild="true"
                        v-on:onClickItem="toogleShowTrnsInCategory"
                        v-on:onClickIcon="setFilterCategory"
                      )
                        template(slot="inside")
                          template(v-if="shouldOpenCategory(itemStatChild.id)")
                            .itemStat__trns
                              TrnItem(
                                v-for="trn in itemStatChild.trns.filter(trn => trn.type === 1).slice(0, 20)",
                                :trn="trn",
                                :key="trn.id"
                                v-on:onClickAccount="setFilterAccount"
                                view="small")
                    //- Show trns
                    template(v-else)
                      .itemStat__trns
                        TrnItem(
                          v-for="trn in itemStat.trns.slice(0, 20)",
                          :trn="trn",
                          :key="trn.id",
                          v-on:onClickAccount="setFilterAccount"
                          view="small")
          template(v-if="showedTabMoney === 'history'")
            .itemStatGroup
              TrnsList(:trns="trnsListHistory.slice(0, 100)")

        template
          .gridTable__item
            template(v-if="!$store.state.isMobile")
              SummaryShort(:trns="trnsList", view="dashboard-new")

            template(v-if="!$store.state.isMobile && calendarPreset !== 'all'")
              .itemStat._link._small(
                v-for="(period, index) in previousData",
                @click.prevent="selectPeriodStat(index)",
                :class="{ _active: selectedPeriodIndex === index }")
                .itemStat__in
                  .itemStat__content
                    .itemStat__text
                      .itemStat__name {{ period.date }}
                      .itemStat__price.sum {{ formatMoney(period.incomes - period.expenses) }}
                    .itemStat__graph(@click.prevent="changeTabMoney('incomes')")
                      .itemStat__graph__in._income(:style="getPreviousDataGraphWidth(period.incomes)")
                        .itemStat__graph__in__price {{ formatMoney(period.incomes) }}
                    .itemStat__graph(@click.prevent="changeTabMoney('expenses')")
                      .itemStat__graph__in._expense(:style="getPreviousDataGraphWidth(period.expenses)")
                        .itemStat__graph__in__price {{ formatMoney(period.expenses) }}
              .btn(@click.prevent="showedPeriod++") Show more
</template>

<script src="./DashboardPage.js"></script>
