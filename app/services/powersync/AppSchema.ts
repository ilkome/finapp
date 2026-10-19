import { column, Schema, Table } from '@powersync/common'

import type { ColumnKind } from './columns'

import { TABLE_COLUMNS } from './columns'

// Client-side SQLite schema built from the column map. PowerSync adds the implicit `id` text PK; booleans are
// 0/1, money, days and instants integers. The stores read whole tables, so there are no client indexes.
function toColumn(kind: ColumnKind) {
  return kind === 'real' ? column.real : kind === 'text' || kind === 'uuid' || kind === 'json' ? column.text : column.integer
}

export const AppSchema = new Schema(Object.fromEntries(
  Object.entries(TABLE_COLUMNS).map(([table, columns]) => [
    table,
    new Table(Object.fromEntries(Object.entries(columns).map(([name, kind]) => [name, toColumn(kind)]))),
  ]),
))
