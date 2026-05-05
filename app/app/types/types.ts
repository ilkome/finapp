declare global {
  type HTMLInputEvent = Event & {
    target: HTMLInputElement
  }
}
