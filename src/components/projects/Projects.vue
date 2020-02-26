<script>
import ComponentWrap from '@/components/layout/component/Component'
import Button from '@/components/shared/button/Button'

export default {
  components: {
    Button,
    ComponentWrap
  },

  data () {
    return {
      form: {
        name: null
      }
    }
  },

  methods: {
    async handleCreateProject () {
      await this.$store.dispatch('createProject', this.form)
      this.form.name = null
      console.log('handleCreateProject')
    }
  }
}
</script>

<template lang="pug">
ComponentWrap(:contentPadding="false")
  template(slot="headerLeft") {{ $lang.projects.name }}

  template(slot="content")
    pre {{ $store.state.projects.items }}
    //- CategoriesList(
    //-   :style="{ paddingTop: '16px' }"
    //-   v-on:onClick="(id) => $store.dispatch('showCategoryModal', id)")

  template(slot="bottom")
    form(@submit.prevent="handleCreateProject")
      .inputText
          input(
            type="text"
            :placeholder="$lang.projects.form.name.placeholder"
            v-model="form.name"
          ).inputText__value
          .inputText__label {{ $lang.projects.form.name.label }}

      Button(
        className="_inline _small"
        :title="$lang.projects.create"
        v-on:onClick="handleCreateProject")
</template>

<style lang="stylus" scoped>

</style>
