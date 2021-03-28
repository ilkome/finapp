<script>
import Cleave from 'vue-cleave-component'

export default {
  components: {
    Cleave
  },

  data () {
    return {
      groupName: '',
      groupAmount: null,
      groupTrnsIds: []
    }
  },

  methods: {
    async handleCreateGroup () {
      const isFormValid = this.validateForm()
      if (isFormValid) {
        const values = {
          amount: this.groupAmount,
          currency: this.$store.state.currencies.base,
          name: this.groupName,
          trnsIds: this.groupTrnsIds
        }

        await this.$store.dispatch('groups/createGroup', values)
        this.groupName = null
        this.groupAmount = null
      }
    },

    validateForm () {
      if (!this.groupName) {
        const groupNameRef = this.$refs.groupNameRef
        this.focusInputName(groupNameRef)
        groupNameRef.classList.remove('_error')
        setTimeout(() => { groupNameRef.classList.add('_error') }, 10)
        return false
      }

      return true
    },

    focusInputName (ref) {
      ref.querySelector('.inputText__value').focus()
    },

    isSelectedTrn (trnId) {
      return this.groupTrnsIds.includes(trnId)
    },

    handleSelectTrn (trnId) {
      if (this.groupTrnsIds.includes(trnId)) {
        this.groupTrnsIds = this.groupTrnsIds.filter(item => item !== trnId)
      }
      else {
        this.groupTrnsIds.push(trnId)
      }
    }
  }
}
</script>

<template lang="pug">
.form
  .form__title {{ $t('groups.form.title') }}
  .form__group(ref="groupNameRef")
    .inputText__label {{ $t('groups.form.name') }}
    .inputText
      input.inputText__value(
        type="text"
        :placeholder="`${$t('groups.form.name')}...`"
        v-model="groupName")

  SharedButton(
    className="_new"
    :title="$t('groups.form.button')"
    @onClick="handleCreateGroup")
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables"

.form
  overflow hidden
  padding 25px 20px
  background var(--c-bg-3)
  border 1px solid var(--c-bg-4)

  &__title
    font-header-1()
    margin-bottom 30px

  &__group
    padding-bottom 30px
    &._error
      animation shake .5s linear

.inputText__value
  height 40px
  font-size 16px
  padding 0 16px
  background var(--c-bg-1)
  border 1px solid var(--c-bg-7)
  border-radius 3px

  &._number
    font-size 22px
    font-secondary()
    &::placeholder
      font-primary()
      font-size 16px

  &:focus
    border-color var(--c-bg-9)

.inputText__label
  border 0
  margin 0
  padding 0
  padding-bottom 10px
  font-size 11px

@keyframes shake
  8%, 41%
    transform translateX(-10px)
  25%, 58%
    transform translateX(10px)
  75%
    transform translateX(-5px)
  92%
    transform translateX(5px)
  0%, 100%
    transform translateX(0)
</style>
