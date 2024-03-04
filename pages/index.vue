<script setup lang="ts">
import { useUserStore } from '~/components/user/useUser'

const userStore = useUserStore()

watch(() => userStore.uid, (uid) => {
  uid
    ? useRouter().replace('/dashboard')
    : useRouter().replace('/login')
}, { immediate: true })
</script>
