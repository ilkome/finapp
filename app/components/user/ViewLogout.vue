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
      class="flex items-center gap-3 pb-4 text-sm text-2"
    >
      <img
        :src="userStore.currentUser?.photoURL"
        class="size-10 rounded-full"
      >
      <div>
        <div class="text-1">
          {{ userStore.currentUser?.displayName }}
        </div>

        {{ userStore.currentUser?.email }}
      </div>
    </div>

    <UiElement
      v-if="props.isShowSignOut"
      insideClasses="bg-item-2 min-h-[44px] max-w-lg"
      @click="userStore.signOut"
    >
      <template #leftIcon>
        <Icon name="lucide:log-out" size="20" />
      </template>
      <div>{{ t('userLogout') }}</div>
    </UiElement>
  </div>
</template>
