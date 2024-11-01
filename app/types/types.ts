declare module 'vue-deepunref' {
  export function deepUnref<T>(value: T): T
}

declare global {
  type HTMLInputEvent = Event & {
    target: HTMLInputElement
  }
}
