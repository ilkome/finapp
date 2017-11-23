<template lang="pug">
.header
  //- PC
  template(v-if="!$store.state.isMobile")
    .header__in
      .header__col._left
        .header__link._categories._extraPadding(
          @click="onClickToogleCategories"
          :class="{ _active: $store.state.categories.list }"
          v-tooltip.bottom-center="{ content: 'Show categories' }"
        ): .mdi.mdi-format-list-bulleted-type
        .header__link._extraPadding(
          :class="{ _active: showedChartYears }" @click.prevent="$emit('toogleShowsChartYears')"
          v-tooltip.bottom-center="{ content: showedChartYears ? 'Show years chart' : 'Hide years chart' }"
        ): .mdi.mdi-chart-bubble
        .header__link._extraPadding(
          :class="{ _active: showedGraph }" @click.prevent="$emit('toogleShowGraph')"
          v-tooltip.bottom-center="{ content: showedGraph ? 'Show chart' : 'Hide chart' }"
        ): .fa.fa-bar-chart
        .header__link._extraPadding(
          @click.prevent="$emit('toogleShowHistory')"
          :class="{ _active: showedHistory }"
          v-tooltip.bottom-center="{ content: showedHistory ? 'Hide hitstory' : 'Show hitstory' }"
        ): .fa.fa-history

          //- .header__link._settings(
          //-   @click="$store.commit('signOut')"
          //-   v-tooltip.bottom-center="{ content: 'Toogle sidebar icons' }"
          //- ): .mdi.mdi-exit-to-app
        //- .header__date(
        //-   v-tooltip.bottom-center="{ content: $store.state.filter.filter.date.second, classes: 'tooltip _fast' }"
        //- ) {{ $store.state.filter.filter.date.first }}


      .header__col._date
        .header__date(
          v-tooltip.bottom-center="{ content: $store.state.filter.filter.date.second, classes: 'tooltip _fast' }"
        ) {{ $store.state.filter.filter.date.first }}

      //- Dates
      .header__col
        .header__link(
          @click.prevent="$emit('selectNextPeriod')"
        ): .arrow._left

        .header__link(
          :class="{ _active: $timePeriod === 'day' }"
          @click.prevent="$emit('setTimePeriod', 'day')"
        ) Day
        .header__link(
          :class="{ _active: $timePeriod === 'week' }"
          @click.prevent="$emit('setTimePeriod', 'week')"
        ) Week
        .header__link(
          :class="{ _active: $timePeriod === 'month' }"
          @click.prevent="$emit('setTimePeriod', 'month')"
        ) Month
        .header__link(
          :class="{ _active: $timePeriod === 'year' }"
          @click.prevent="$emit('setTimePeriod', 'year')"
        ) Year
        .header__link(
          :class="{ _active: $timePeriod === 'all' }"
          @click.prevent="$emit('setTimePeriod', 'all')"
        ) All
        .header__link(
          @click.prevent="$emit('selectPrevPeriod')"
          :class="{ _disabled: selectedPeriodIndex === 0}"
        )
          .arrow._right

      //- Add Trn
      .header__col
        .header__link(
          @click.prevent="$store.commit('toogleTrnForm')"
          :class="{ _active: $store.state.trnForm.isShow }"
          v-tooltip.bottom-center="{ content: $store.state.trnForm.isShow ? 'Hide' : 'Create new transaction' }"
        ): .plus

  //- Mobile header
  template(v-if="$store.state.isMobile")
    .header__in
      .header__col
        .header__link(@click.prevent.stop="$store.commit('toogleLeftbar')")
          .fa.fa-bars
        .header__link._categories(@click="onClickToogleCategories")
          .mdi.mdi-format-list-bulleted-type
      .header__col
        .header__date {{ $store.state.filter.filter.date.first }}
      .header__col
        .header__link(@click.prevent.stop="$store.commit('toogleTrnForm')")
          .plus

    .header__in
      .header__link(
        @click.prevent="$emit('selectPrevPeriod')"
        :class="{ _disabled: selectedPeriodIndex === 0 }"
      ): .arrow._left

      .header__link(
        :class="{ _active: $timePeriod === 'day' }"
        @click.prevent="$emit('setTimePeriod', 'day')"
      ) Day
      .header__link(
        :class="{ _active: $timePeriod === 'week' }"
        @click.prevent="$emit('setTimePeriod', 'week')"
      ) Week
      .header__link(
        :class="{ _active: $timePeriod === 'month' }"
        @click.prevent="$emit('setTimePeriod', 'month')"
      ) Month
      .header__link(@click.prevent="$emit('selectNextPeriod')")
        .arrow._right

    template(v-if="getFilter.category || getFilter.account")
      .header__in._mobile
        .flex
          template(v-if="getFilter.account")
            .header__link._account(@click.prevent="$store.commit('setFilterAccount', null)")
              .icon._small._round(:style="`background: ${getFilter.account.color}`")
                .icon__abbr {{ getFilter.account.name.charAt(0) }}{{ getFilter.account.name.charAt(1) }}

          template(v-if="getFilter.category")
            .header__link._active(@click.prevent="$emit('setFilterCategory', null)")
              .icon._small(:style="`background: ${getFilter.category.color}`")
                div(:class="getFilter.category.icon")
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    selectedPeriodIndex: {
      type: Number,
      required: true
    },
    showedGraph: {
      type: Boolean,
      required: true
    },
    showedChartYears: {
      type: Boolean,
      required: true
    },
    showedHistory: {
      type: Boolean,
      required: true
    }
  },

  computed: {
    ...mapGetters(['accounts', 'categories', 'getFilter']),
    $timePeriod() {
      return this.$store.state.dashboard.timePeriod
    }
  },

  methods: {
    onClickToogleCategories() {
      this.$store.commit('toogleCategoriesList')
      this.$store.commit('toogleAccountList', 'hide')
    },
    openPopupCalendar(event) {
      const left = !this.$store.state.isMobile ? event.target.closest('.header__header').offsetLeft + 20 : 0
      const top = !this.$store.state.isMobile ? event.target.closest('.header__header').offsetTop + 47 : 47
      this.$store.commit('setFilterCalendar', {
        show: !this.$store.state.filter.filter.calendar.show,
        left,
        top
      })
    }
  }
}
</script>
