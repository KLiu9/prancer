import { Label } from './types'

const SAMPLE_LABELS: Label[] = [
  {
    labelId: 'C01',
    title: 'Reason for Visit',
    categories: [{ title: 'Reason for Visit', type: 'Reason for Visit' }],
  },
  {
    labelId: 'C02',
    title: 'Nature of the Disease',
    categories: [{ title: 'Nature of the Disease', type: 'Nature of the Disease' }],
  },
  {
    labelId: 'C03',
    title: 'Prognosis',
    categories: [{ title: 'Prognosis', type: 'Prognosis' }],
  },
  {
    labelId: 'C04',
    title: 'Therapy and Rationale',
    categories: [{ title: 'Therapy and Rationale', type: 'Therapy and Rationale' }],
  },
  {
    labelId: 'C05',
    title: 'Action Items',
    categories: [{ title: 'Action Items', type: 'Action Items' }],
  }
]


const LABELS = SAMPLE_LABELS

export default LABELS

export const INLINE_LABELS = false
