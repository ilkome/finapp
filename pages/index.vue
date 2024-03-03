<script setup lang="ts">
import { useUserStore } from '~/components/user/useUser'

const userStore = useUserStore()
const router = useRouter()

watch(() => userStore.uid, (uid) => {
  // uid
  //   ? router.replace('/dashboard')
  //   : router.replace('/login')
}, { immediate: true })
</script>
