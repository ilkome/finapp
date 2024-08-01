<script setup lang="ts">
import { useUserStore } from '~/components/user/useUser'

const userStore = useUserStore()

watch(() => userStore.uid, (uid) => {
  if (uid) {
    useRouter().replace('/dashboard')
  }
  else {
    useRouter().replace('/login')
  }
}, { immediate: true })
</script>
