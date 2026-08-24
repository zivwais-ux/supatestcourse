const MONTHS = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
]

export function shekel(value: number): string {
  return '₪' + value.toLocaleString('en-US')
}

/** מקצר סכומים גדולים: 3,180,000 ← 3.18 מ׳ */
export function shekelShort(value: number): string {
  if (value >= 1_000_000) return '₪' + (value / 1_000_000).toFixed(2).replace(/\.?0+$/, '') + ' מ׳'
  if (value >= 1_000) return '₪' + Math.round(value / 1_000) + ' א׳'
  return '₪' + value
}

export function hebrewMonth(iso: string): string {
  const d = new Date(iso)
  return MONTHS[d.getMonth()] + ' ' + d.getFullYear()
}

export function hebrewDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`
}
