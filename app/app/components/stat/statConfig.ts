import type { DeepPartial } from '~~/utils/types'

import defu from 'defu'

import type { MiniItemConfig } from '~/components/stat/useStatConfig'

import { ConfigSchema } from '~/components/stat/useStatConfig'

/**
 * Compute a new config by deep-merging a partial update into the current config.
 * Returns the new config, or null if the result fails Zod validation.
 */
export function applyConfigUpdate<K extends keyof MiniItemConfig>(
  current: MiniItemConfig,
  key: K,
  value: DeepPartial<MiniItemConfig[K]>,
): MiniItemConfig | null {
  const update = {
    ...current,
    [key]: defu(value, current[key]),
  }

  if (!ConfigSchema.safeParse(update).success)
    return null

  return update as MiniItemConfig
}
