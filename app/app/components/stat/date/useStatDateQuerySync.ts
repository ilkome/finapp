import type { Ref } from 'vue'

import { toValue } from 'vue'

import type { StatDateParams, UseStatDateOptions } from '~/components/stat/date/types'

import { parseStatDateQueryParams } from './params'

/**
 * Mirrors the URL into the stored params. A `customDate` in the query is a temporary view:
 * the params from before it are kept aside and restored once the query drops it.
 */
export function useStatDateQuerySync(params: Ref<StatDateParams>, queryParams: UseStatDateOptions['queryParams']) {
  if (!queryParams)
    return

  let paramsBeforeCustomDate: StatDateParams | null = null
  watch(() => ({ ...toValue(queryParams) }), (nextQuery) => {
    if (nextQuery.customDate !== undefined) {
      // params is a reactive storage ref: structuredClone chokes on the proxy.
      paramsBeforeCustomDate ??= JSON.parse(JSON.stringify(params.value)) as StatDateParams
      params.value = parseStatDateQueryParams(nextQuery, params.value)
      return
    }

    if (paramsBeforeCustomDate) {
      params.value = paramsBeforeCustomDate
      paramsBeforeCustomDate = null
      return
    }

    params.value = parseStatDateQueryParams(nextQuery, params.value)
  }, { immediate: true })
}
