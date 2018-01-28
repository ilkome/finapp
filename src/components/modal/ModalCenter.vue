<template lang="pug">
.modalCenter(:class="{ _active: isShow }")
  .modalCenter__overlay(@click.prevent="$listeners.onClose")

  transition(name="calendarPopupAnimation")
    template(v-if="isShow")
      .modalCenter__wrap
        .modalCenter__title {{ title }}
        .modalCenter__content
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

  mounted() {
    // this.toogleBodyOverflow()
  },

  methods: {
    toogleBodyOverflow() {
      const body = document.querySelector('body')
      if (true) {
        body.classList.add('_overflow')
      } else {
        body.classList.remove('_overflow')
      }
    }
  }
}
</script>
