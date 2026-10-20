/** One row per point: the label, then each series. Fields with a comma, quote or line break are quoted. */
export function toCsv(labels: string[], series: { data: number[], name: string }[]): string {
  const field = (value: string | number) => {
    const text = String(value)
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
  }
  const header = ['', ...series.map(item => item.name)].map(field).join(',')
  const rows = labels.map((label, index) => [label, ...series.map(item => Number.isFinite(item.data[index]) ? item.data[index]! : '')].map(field).join(','))
  return [header, ...rows].join('\n')
}

export function downloadCsv(name: string, csv: string) {
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `${name}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
