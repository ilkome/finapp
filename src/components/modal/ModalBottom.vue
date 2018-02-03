<template lang="pug">
.modalBottom(:class="{ _active: isShow }")
  .modalBottom__overlay(@click.stop="$listeners.onClose")

  transition(name="slideToBottom")
    template(v-if="isShow")
      .modalBottom__wrap
        .modalBottom__title {{ title }}
        .modalBottom__content
          slot
</template>

<script>
export default {
  props: {
    isShow: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      required: true
    }
  },

  watch: {
    isShow() {
      this.toogleBodyOverflow()
    }
  },

  mounted() {
    // this.toogleBodyOverflow()
  },

  methods: {
    toogleBodyOverflow() {
      console.log(1)
      const body = document.querySelector('body')
      if (this.isShow) {
        body.classList.add('_overflowNew')
      } else {
        body.classList.remove('_overflowNew')
      }
    }
  }
}
</script>
