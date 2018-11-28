<script>
export default {
  props: {
    title: {
      type: String,
      default: null
    },
    show: {
      type: Boolean,
      required: true
    }
  },

  data () {
    return {
      headerHeight: 0
    }
  },

  computed: {
    modalStyle () {
      if (this.$store.state.trnForm.height < this.$store.state.ui.height) {
        return {
          height: `${this.$store.state.trnForm.height - this.headerHeight}px`
        }
      } else {
        return {
          height: `${this.$store.state.ui.height - this.headerHeight}px`
        }
      }
    }
  },

  watch: {
    show: {
      handler: 'updateHeight',
      immediate: true
    }
  },

  methods: {
    afterClose () {
      if (this.$listeners.afterClose) {
        this.$listeners.afterClose()
      }
    },

    updateHeight () {
      this.$nextTick(() => {
        this.headerHeight = this.$refs.header.clientHeight
      })
    }
  }
}
</script>

<template lang="pug">
.trnFormModal
  transition(name="fadeIn" appear)
    .trnFormModal__overflow(@click="$listeners.onClose" v-show="show")

  transition(name="slide" appear v-on:after-leave="afterClose")
    .trnFormModal__wrap(v-show="show")
      //- Header
      .trnFormModal__header(
        @click="$listeners.onClose"
        ref="header"
      )
        template(v-if="$slots.header")
          slot(name="header")
        template(v-else)
          .trnFormModal__header__back: .mdi.mdi-chevron-left
          .trnFormModal__header__title(v-if="title") {{ title }}

      //- Content
      .trnFormModal__scroll(:style="modalStyle")
        slot()
</template>
