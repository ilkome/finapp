<script lang="ts" setup>
import { useUserStore } from '~/components/user/useUserStore'

const props = defineProps<{
  isShowSignOut?: boolean
}>()

const userStore = useUserStore()
const { t } = useI18n()
</script>

<template>
  <div>
    <div
      v-if="userStore.currentUser"
      class="flex items-center gap-3 pb-4 text-sm"
    >
      <img
        :src="userStore.currentUser?.photoURL"
        class="size-10 rounded-full"
      >
      <div>
        <div class="font-semibold">
          {{ userStore.currentUser?.displayName }}
        </div>

        {{ userStore.currentUser?.email }}
      </div>
    </div>

    <UButton
      v-if="props.isShowSignOut"
      class="px-4"
      icon="lucide:log-out"
      @click="userStore.signOut"
    >
      {{ t('userLogout') }}
    </UButton>
  </div>
</template>
