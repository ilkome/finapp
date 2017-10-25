<template lang="pug">
.header(:class="className")
  //- Mobile header
  template(v-if="$store.state.isMobile")
    .header__in
      .header__item.fa.fa-bars(@click.prevent.stop="$store.commit('toogleLeftbar')")

      .header__item
        .header__item
          h1.header__header(@click.prevent.stop="openPopupCalendar($event)")
            .header__icon.mdi.mdi-calendar-multiple
            .header__firstDate {{ $store.state.filter.filter.date.first }}

      .header__item.fa.fa-plus(@click.prevent.stop="$store.commit('toogleTrnForm')")

    .header__in._second
      .header__menu__item._mt(
        @click.prevent="$emit('selectPrevPeriod')"
        :class="{ _disabled: selectedPeriodIndex === 0 }"
      ): .fa.fa-arrow-left

      .header__menu__item(
        :class="{ _active: $timePeriod === 'month' }",
        @click.prevent="$emit('setTimePeriod', 'month')"
      ) Month
      .header__menu__item(
        :class="{ _active: $timePeriod === 'year' }",
        @click.prevent="$emit('setTimePeriod', 'year')"
      ) Year
      .header__menu__item(
        :class="{ _active: $timePeriod === 'all' }",
        @click.prevent="$emit('setTimePeriod', 'all')"
      ) All
      //- .header__menu__item
        .fa.fa-ellipsis-v
      .header__menu__item._mt(@click.prevent="$emit('selectNextPeriod')")
        .fa.fa-arrow-right

    .header__in._second
      template(v-if="selectedCategory || getFilter.account")
        .flex
          template(v-if="getFilter.account")
            .header__menu__item._account
              div(@click.prevent="$store.commit('setFilterAccount', null)") {{ getFilter.account.name.charAt(0) }}{{ getFilter.account.name.charAt(1) }}

          template(v-if="selectedCategory")
            template(v-if="selectedCategory.parent")
              .header__menu__item
                div(@click.prevent="$emit('setFilterCategory', selectedCategory.parent.id)", :class="selectedCategory.parent.icon")
            .header__menu__item
              div(@click.prevent="$emit('setFilterCategory', null)", :class="selectedCategory.icon")
        .flex
          .header__menu__item(:class="{ _active: showedGraph }" @click.prevent="$emit('toogleShowGraph')")
            .fa.fa-bar-chart
          .header__menu__item._categories(@click.prevent="$store.commit('toogleCategoriesList')")
            .fa.fa-list-ul
          .header__menu__item._accounts(@click.prevent="$store.commit('toogleAccountList')")
            .fa.fa-credit-card

      template(v-else)
        .header__menu__item(:class="{ _active: showedGraph }" @click.prevent="$emit('toogleShowGraph')")
          .fa.fa-bar-chart
        .header__menu__item._categories(@click.prevent="$store.commit('toogleCategoriesList')")
          .fa.fa-list-ul
        .header__menu__item._accounts(@click.prevent="$store.commit('toogleAccountList')")
          .fa.fa-credit-card

  //- PC
  template(v-if="!$store.state.isMobile")
    .header__in
      //- Title
      .header__item
        h1.header__header(@click.prevent.stop="openPopupCalendar($event)")
          .header__icon.mdi.mdi-calendar-multiple
          .header__firstDate {{ $store.state.filter.filter.date.first }}
          .header__secondDate(v-if="$store.state.filter.filter.date.second !== 'Today'") {{ $store.state.filter.filter.date.second }}

      //- Periods
      .header__item
        .header__periods
          template(v-if="selectedCategory || getFilter.account")
            template(v-if="getFilter.account")
              .header__menu__item._account
                div(@click.prevent="$store.commit('setFilterAccount', null)") {{ getFilter.account.name }}

            template(v-if="selectedCategory")
              template(v-if="selectedCategory.parent")
                .header__menu__item
                  div(@click.prevent="$emit('setFilterCategory', selectedCategory.parent.id)", :class="selectedCategory.parent.icon")
              .header__menu__item._active
                div(@click.prevent="$emit('setFilterCategory', null)", :class="selectedCategory.icon")

            .header__menu__sep

          .header__menu__item._mt(
            @click.prevent="$emit('selectPrevPeriod')"
            :class="{ _disabled: selectedPeriodIndex === 0}"
          ): .fa.fa-arrow-left

          .header__menu__item(
            :class="{ _active: $timePeriod === 'isoweek' }",
            @click.prevent="$emit('setTimePeriod', 'isoweek')"
          ) Week
          .header__menu__item(
            :class="{ _active: $timePeriod === 'month' }",
            @click.prevent="$emit('setTimePeriod', 'month')"
          ) Month
          .header__menu__item(
            :class="{ _active: $timePeriod === 'year' }",
            @click.prevent="$emit('setTimePeriod', 'year')"
          ) Year
          .header__menu__item(
            :class="{ _active: $timePeriod === 'all' }",
            @click.prevent="$emit('setTimePeriod', 'all')"
          ) All
          .header__menu__item._mt(@click.prevent="$emit('selectNextPeriod')")
            .fa.fa-arrow-right

          .header__menu__sep
          .header__menu__item._withSep(:class="{ _active: showedGraph }" @click.prevent="$emit('toogleShowGraph')")
            .fa.fa-bar-chart
          .header__menu__item(:class="{ _active: showedHistory }" @click.prevent="$emit('toogleShowHistory')")
            .fa.fa-history
          .header__menu__item(@click.prevent="$store.commit('toogleTrnForm')")
            .fa.fa-plus
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    selectedPeriodIndex: {
      type: Number,
      required: true
    },
    isLastDays: {
      type: Boolean,
      required: true
    },
    showedGraph: {
      type: Boolean,
      required: true
    },
    showedHistory: {
      type: Boolean,
      required: true
    },
    selectedCategory: {
      type: Object
    }
  },

  mounted() {
    document.querySelector('body').addEventListener('click', this.$store.commit('closeFilterCalendar'))
    document.addEventListener('keyup', (event) => {
      if (event.keyCode === 27) { // escape key
        this.$store.commit('closeFilterCalendar')
      }
    })
  },

  computed: {
    ...mapGetters(['accounts', 'categories', 'getFilter']),
    className() {
      return {
        _withLeftBar: this.$store.state.leftBar.isShow
      }
    },
    $timePeriod() {
      return this.$store.state.dashboard.timePeriod
    }
  },

  methods: {
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
