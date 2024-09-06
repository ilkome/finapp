<script setup lang="ts">
import { getPreparedFormData } from '~/components/wallets/getForm'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const walletsStore = useWalletsStore()

const walletId = computed(() => route.params.id)
const wallet = computed(() => walletsStore.items[walletId.value])
const walletForm = ref(getPreparedFormData(wallet.value))

const updateValue = (id, value) => (walletForm.value[id] = value)
const afterSave = () => router.push(`/wallets/${walletId.value}`)

useHead({
  title: `${t('base.edit')}: ${
    walletForm.value?.name
      ? walletForm.value?.name
      : t('wallets.form.name.label')
  }`,
})
</script>

<template>
  <UiPage
    v-if="wallet"
    class="!pb-0 grid-rows-[auto,1fr]"
  >
    <UiHeader>
      <RouterLink
        v-slot="{ href, navigate }"
        :to="`/wallets/${walletId}`"
        custom
      >
        <a class="hocus:bg-item-5 grow" :href="href" @click="navigate">
          <UiHeaderTitle>
            <div class="pb-1 text-xs font-medium text-item-2">
              {{ $t("wallets.editTitle") }}
            </div>
            <div class="flex items-center gap-3">
              <div class="text-2xl font-semibold text-item-1">
                {{ walletForm.name ? walletForm.name : $t("wallets.title") }}
              </div>
              <div
                class="flex-center rounded-lg p-1 text-2xs text-icon-primary"
                :style="{ background: walletForm.color }"
              >
                {{ walletForm.currency }}
              </div>
            </div>
          </UiHeaderTitle>
        </a>
      </RouterLink>

      <template #actions>
        <WalletsDelete :walletId="walletId" />
      </template>
    </UiHeader>

    <WalletsForm
      :walletId="walletId"
      :walletForm="walletForm"
      @afterSave="afterSave"
      @updateValue="updateValue"
    />
  </UiPage>
</template>
