import { describe, expect, it } from 'vitest'
import { parseStructuredInfo } from './StructuredInfoText.vue'

describe('structured tourism information', () => {
  it('separates labels, values, dates, and notices', () => {
    const result = parseStructuredInfo('주소: 부산광역시 해운대구 | 전화: 051-710-6948 | 행사기간: 20260626 ~ 20260628 | 이용시간: 12:00~20:00※ 자세한 시간은 공식 홈페이지 참조')
    expect(result).toEqual([
      { label: '주소', value: '부산광역시 해운대구' },
      { label: '전화', value: '051-710-6948' },
      { label: '행사기간', value: '2026. 06. 26. ~ 2026. 06. 28.' },
      { label: '이용시간', value: '12:00~20:00' },
      { value: '자세한 시간은 공식 홈페이지 참조', note: true },
    ])
  })
})
