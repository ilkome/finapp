<template>
  <a
    aria-label="ilko.me"
    class="flex-center gap-2 rounded-full interactive px-4 py-2 text-muted transition-colors hover:text-primary"
    href="https://ilko.me"
  >
    <span class="text-sm">ilko.me</span>
    <Icon
      class="animate-[heartbeat_3s_ease-in-out_infinite] text-2xl"
      name="mdi:heart"
    />
  </a>
</template>

<style>
@keyframes heartbeat {
  0% {
    transform: scale(0.75);
  }
  20% {
    transform: scale(1);
  }
  40% {
    transform: scale(0.75);
  }
  60% {
    transform: scale(1.1);
  }
  80% {
    transform: scale(0.75);
  }
  100% {
    transform: scale(0.75);
  }
}
</style>
