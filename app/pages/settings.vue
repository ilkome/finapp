<script setup lang="ts">
import pkg from '~~/package.json'
import { useUserStore } from '~/components/user/useUser'

const { $i18n } = useNuxtApp()
const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const userStore = useUserStore()

useSeoMeta({
  title: $i18n.t('settings.title'),
})
const version = pkg.version

/**
 * Remove user date
 */
const confirmRemoveUserData = ref(false)

function removeUserData() {
  confirmRemoveUserData.value = false
  userStore.removeUserData()

  if (route.name !== 'welcome')
    router.push('/welcome')
}
</script>

<template>
  <UiPage>
    <UiHeader>
      <UiHeaderTitle2>{{ $t("settings.title") }}</UiHeaderTitle2>
    </UiHeader>

    <div
      class="grow grid gap-x-6 gap-y-1 px-3"
    >
      <div>
        <!-- Locale -->
        <div class="pb-12">
          <div class="grid gap-3">
            <UiTitle class="pb-2">
              {{ $t("settings.lang") }}
            </UiTitle>
            <AppLocaleSwitcher />
          </div>
        </div>

        <!-- Theme -->
        <div class="pb-12">
          <UiTitle class="pb-2">
            {{ $t("theme.title") }}
          </UiTitle>
          <AppThemeSwitcher isShowSystem />
        </div>

        <!-- User -->
        <div class="pb-12">
          <UiTitle class="pb-2">
            {{ t("user") }}
          </UiTitle>
          <div class="pb-4 text-item-2">
            {{ userStore.user?.email }}
          </div>
          <UiBox1
            :title="$t('userLogout')"
            icon="mdi mdi-logout"
            @click="userStore.signOut()"
          />
        </div>

        <!-- Delete -->
        <div class="pb-12">
          <UiTitle class="pb-2">
            {{ $t("settings.caution") }}
          </UiTitle>
          <div class="leading-1 pb-4 text-xs text-item-2">
            {{ $t("alerts.willDeleteEverything") }}
          </div>
          <div class="pb-4">
            <UiBox1
              @click="confirmRemoveUserData = true"
            >
              <div class="mdi mdi-delete-empty-outline" />
              <div>{{ $t('settings.deleteButton') }}</div>
            </UiBox1>
          </div>
        </div>
      </div>

      <!-- About -->
      <div class="pb-12">
        {{ t("app.about") }}
        <div class="pt-4 text-xs text-item-2">
          {{ t("app.version") }} {{ version }}
        </div>
      </div>
    </div>

    <LayoutConfirmModal
      v-if="confirmRemoveUserData"
      :description="$t('alerts.willDeleteEverything')"
      @closed="confirmRemoveUserData = false"
      @onConfirm="removeUserData"
    />
  </UiPage>
</template>

<i18n lang="yaml">
en:
  app:
    about: About
    version: 'Version'

  user: User
  currency:
    descBase: Transactions in different currencies will be converted to this currency.

ru:
  app:
    about: О приложении
    version: 'Версия'

  user: Пользователь
  currency:
    descBase: "Основная валюта, в которую будут конвертироваться транзакции в других валютах."
</i18n>
