<template lang="pug">
.rightBar
  .sidebar__close(@click="$store.commit('toogleAccountCreate', 'hide')")
    .sidebar__close__title Create wallet
    .sidebar__close__icon: .fa.fa-plus

  .rightBar__in
    .rightBar__main

      template(v-if="$store.state.accounts.show")
        .trnFormToogle(
          @click.prevent.stop="$store.commit('toogleAccountCreate', 'hide')",
          :class="{_active: $store.state.accounts.show}"
        ): .trnFormToogle__icon: .trnFormToogle__icon__in +

      .rightBar__main__in
        .form
          .input
            input.input__field(
              v-model="values.name"
              v-focus.lazy="focus || $store.state.accounts.show",
              name="name"
              type="text"
              placeholder="Write account name"
            )
            .input__label Name
          .input
            input.input__field(
              v-model="values.countTotal", type="number", placeholder="Count in total", name="countTotal")
            .input__label Count in total
          .input
            input.input__field(
              v-model="values.currency", type="text", placeholder="Write currency", name="currency")
            .input__label currency
          .input
            input.input__field(
              v-model="values.order", type="number", placeholder="Order", name="order")
            .input__label order

          CategoryColor(v-on:setColor="setColor")
          .trnForm__actions__btn.mb20(@click.prevent="addAccount") Create
</template>

<script>
import { mapGetters } from 'vuex'
import { mixin } from 'vue-focus'
import CategoryColor from '../categories/CategoryColor.vue'

const defaultColor = '#242424'

export default {
  mixins: [mixin],
  components: { CategoryColor },

  data() {
    return {
      focus: true,
      values: {
        name: '',
        countTotal: 1,
        currency: 'RUB',
        order: 0,
        color: defaultColor
      }
    }
  },

  computed: {
    ...mapGetters(['accounts'])
  },

  methods: {
    async addAccount() {
      this.focus = false

      try {
        const formatedValues = {
          name: this.values.name.trim(),
          countTotal: this.values.countTotal ? 1 : 0,
          currency: this.values.currency ? this.values.currency : 'RUB',
          order: this.values.order ? this.values.order : 100,
          color: this.values.color ? this.values.color : defaultColor
        }

        if (!formatedValues.name) {
          this.focus = true
          this.$notify({
            group: 'foo',
            title: 'Error',
            text: 'Please write account name.',
            type: 'error'
          })
          return
        }

        const sameAccount = this.$store.state.accounts.all
          .filter(account => account.name === formatedValues.name)

        if (sameAccount.length) {
          this.$notify({
            group: 'foo',
            title: 'Error',
            text: 'Same account name is already exist.',
            type: 'error'
          })
          return
        }

        this.$store.commit('showLoader')
        await this.$store.dispatch('addAccount', formatedValues)
        this.$store.commit('toogleAccountCreate', 'hide')
      } catch (error) {
        console.log(error)
        this.$notify({
          group: 'foo',
          title: 'Error',
          text: error.message,
          type: 'error',
          duration: 10000
        })
      } finally {
        this.$store.commit('closeLoader')
      }
    },
    setColor(color) {
      this.values.color = color
    }
  }
}
</script>
