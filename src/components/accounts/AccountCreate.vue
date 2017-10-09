<template lang="pug">
.trnForm
  .trnForm__in
    .trnForm__form
      .trnForm__form__close(@click="$store.commit('toogleAccountCreate', 'hide')") +
      .trnForm__form__in
        template(v-if="$store.state.accounts.create")
          .trnFormToogle(
            @click.prevent.stop="$store.commit('toogleAccountCreate', 'hide')",
            :class="{_active: $store.state.accounts.create}"
          ): .trnFormToogle__icon: .trnFormToogle__icon__in +

        h4.title._mbs Create account
        .form
          .input
            input.input__field(
              v-model="values.name", type="text", placeholder="Write account name", name="name")
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

      console.log(formatedValues)
      await this.$store.dispatch('addAccount', formatedValues)
      this.$store.commit('toogleAccountCreate', 'hide')
      this.$store.commit('closeLoader')
    }
  }
}
</script>
