<template lang="pug">
.header(
  :class="{ _fixed: $store.state.isMobile }"
)
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

      .header__col._date
        .header__date(
          v-tooltip.bottom-center="{ content: $store.state.filter.filter.date.second, classes: 'tooltip _fast' }"
        ) {{ $store.state.filter.filter.date.first }}

      //- Nav
      .header__col
        .header__link._wide(
          @click.prevent="$emit('selectPrevPeriod')"
          :class="{ _disabled: checkIsLastDate() }"
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
          @click.prevent="$emit('selectNextPeriod')"
        ): .arrow._right

      //- Add Trn
      .header__col
        .header__link._plus(
          @click.prevent="$store.commit('toogleTrnForm')"
          :class="{ _active: $store.state.trnForm.isShow }"
          v-tooltip.bottom-center="{ content: $store.state.trnForm.isShow ? 'Hide' : 'Create new transaction' }"
        ): .mdi.mdi-plus


  //- mobile header
  //----------------------------------------------------------------------------
  template(v-if="$store.state.isMobile")
    .header__in
      .header__col
        .header__link(@click.prevent.stop="$store.commit('toogleLeftbar')")
          .fa.fa-bars
        .header__link._categories(@click="onClickToogleCategories")
          .mdi.mdi-format-list-bulleted-type
        .header__link(
          :class="{ _active: showedGraph }" @click.prevent="$emit('toogleShowGraph')"
        ): .fa.fa-bar-chart
      .header__col
        .header__link._wide(
          @click.prevent="$emit('selectNextPeriod')"
        ): .arrow._left
        .header__date(
          @click="isShowedModalCenter = true"
        ) {{ $store.state.filter.filter.date.first }}
        .header__link._wide(
          @click.prevent="$emit('selectPrevPeriod')"
          :class="{ _disabled: checkIsLastDate() }"
        ): .arrow._right

    //- .header__in
    //-   .header__link(
    //-     :class="{ _active: $timePeriod === 'day' }"
    //-     @click.prevent="$emit('setTimePeriod', 'day')"
    //-   ) Day
    //-   .header__link(
    //-     :class="{ _active: $timePeriod === 'week' }"
    //-     @click.prevent="$emit('setTimePeriod', 'week')"
    //-   ) Week
    //-   .header__link(
    //-     :class="{ _active: $timePeriod === 'month' }"
    //-     @click.prevent="$emit('setTimePeriod', 'month')"
    //-   ) Month


    //- select period
    ModalCenter(
      :isShow="isShowedModalCenter"
      title="Select period"
      v-on:onClose="isShowedModalCenter = false"
    )
      .modalPeriods
        .header__periodItem(
          :class="{ _active: $timePeriod === 'day' }"
          @click.prevent="setTimePeriod('day')"
        ) Day
        .header__periodItem(
          :class="{ _active: $timePeriod === 'week' }"
          @click.prevent="setTimePeriod('week')"
        ) Week
        .header__periodItem(
          :class="{ _active: $timePeriod === 'month' }"
          @click.prevent="setTimePeriod('month')"
        ) Month
        .header__periodItem(
          :class="{ _active: $timePeriod === 'year' }"
          @click.prevent="setTimePeriod('year')"
        ) Year
        .header__periodItem(
          :class="{ _active: $timePeriod === 'all' }"
          @click.prevent="setTimePeriod('all')"
        ) Total
</template>

<script>
import moment from 'moment'
import { mapGetters } from 'vuex'
import formatMoney from '@/mixins/formatMoney'
import ModalCenter from '@components/modal/ModalCenter'

export default {
  mixins: [formatMoney],
  components: { ModalCenter },

  props: {
    trnsDate: {
      type: Object,
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

  data() {
    return {
      isShowedModalCenter: false
    }
  },

  computed: {
    ...mapGetters(['getFilter']),
    $timePeriod() {
      return this.$store.state.dashboard.timePeriod
    }
  },

  methods: {
    onClickToogleCategories() {
      this.$store.commit('toogleCategoriesList')
      this.$store.commit('toogleAccountList', 'hide')
    },
    checkIsLastDate() {
      return moment(this.trnsDate.start).isSame(this.$store.state.currentDate, this.$timePeriod)
    },
    setTimePeriod(period) {
      this.$emit('setTimePeriod', period)
      this.isShowedModalCenter = false
    }
  }
}
</script>
