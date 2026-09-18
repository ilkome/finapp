// `Header.vue` is the only story subject that reaches the router; navigation is a no-op here.
export function useRouter() {
  return { back() {}, replace() {} }
}
