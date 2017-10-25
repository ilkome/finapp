<template lang="pug">
.rightBar
  .rightBar__in
    .rightBar__main

      template(v-if="$store.state.accounts.show")
        .trnFormToogle(
          @click.prevent.stop="$store.commit('toogleAccountCreate', 'hide')",
          :class="{_active: $store.state.accounts.show}"
        ): .trnFormToogle__icon: .trnFormToogle__icon__in +

      .rightBar__main__in
        .sidebar__close(@click="$store.commit('toogleAccountCreate', 'hide')")
          .sidebar__close__name Create account
          .sidebar__close__icon: .fa.fa-plus

        .form
          .input
            input.input__field(
              v-model="values.name"
              v-focus.lazy="true",
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

          template(v-if="error")
            .error.mb20 {{ error }}
          .trnForm__actions__btn.mb20(@click.prevent="addAccount") Create
</template>

<script>
import { mixin } from 'vue-focus'
import { mapGetters } from 'vuex'

export default {
  mixins: [mixin],

  data() {
    return {
      values: {
        name: '',
        countTotal: 1,
        currency: 'RUB',
        order: 0
      },
      error: null
    }
  },

  computed: {
    ...mapGetters(['accounts'])
  },

  methods: {
    async addAccount() {
      this.$store.commit('showLoader')
      this.error = null

      const formatedValues = {
        name: this.values.name.trim(),
        countTotal: this.values.countTotal,
        currency: this.values.currency,
        order: this.values.order
      }

      if (!formatedValues.name) {
        this.error = 'Please write account name'
        this.$store.commit('closeLoader')
        return
      }

      const sameAccount = this.$store.state.accounts.all
        .filter(account => account.name === formatedValues.name)

      if (sameAccount.length) {
        this.error = 'Same account name is already exist!'
        this.$store.commit('closeLoader')
        return
      }

      await this.$store.dispatch('addAccount', formatedValues)
      this.$store.commit('toogleAccountCreate', 'hide')
      this.$store.commit('closeLoader')
    }
  }
}
</script>
