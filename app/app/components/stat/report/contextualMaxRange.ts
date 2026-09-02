export function shouldUseContextualMaxRange(options: {
  hasCategoryFilter: boolean
  hasWalletFilter: boolean
  isShowMaxRange: boolean
}): boolean {
  return options.isShowMaxRange
    && (options.hasCategoryFilter || options.hasWalletFilter)
}
