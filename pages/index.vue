<script>
export default {
  fetch({ store, redirect }) {
    store.state.user?.user
      ? redirect('/dashboard')
      : redirect('/login')
  },
}
</script>
