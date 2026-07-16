import { expect, test } from '@playwright/test'

const board = { boardId: 1, name: '해운대 해수욕장', nameEn: 'Haeundae Beach', category: '관광지', categoryEn: 'Attraction', description: '주소: 부산광역시 동구 영초길197번길 9 | 우편번호: 48808', descriptionEn: 'Address: Busan | Postal code: 48808', image: '', recentPostCount: 1, lastActivityAt: null, recentExcerpt: '현지 팁' }
const attraction = { contentId: 'haeundae', name: '해운대 해수욕장', nameEn: 'Haeundae Beach', category: '해수욕장', categoryEn: 'Beach', summary: '부산 대표 해변', summaryEn: 'Busan’s signature beach', description: '넓은 백사장과 야경', descriptionEn: 'A wide beach with night views', image: '', address: '부산 해운대구', addressEn: 'Haeundae-gu, Busan', boardId: 1 }
const festival = { contentId: 'fest', name: '부산바다축제', nameEn: 'Busan Sea Festival', status: 'UPCOMING', place: '해운대', placeEn: 'Haeundae', period: '2026.08', periodEn: 'Aug 2026', image: '', summary: '여름 축제', summaryEn: 'Summer festival', boardId: 1 }
const post = { postId: 1, boardId: 1, title: '해운대 현지 팁', titleKr: '해운대 현지 팁', titleEn: 'Haeundae Local Tips', author: 'abcd', content: '산책하기 좋은 시간은 저녁입니다.', contentKr: '산책하기 좋은 시간은 저녁입니다.', contentEn: 'Evening is the best time for a walk.', viewCount: 12, likeCount: 2, commentCount: 0, createdAt: '2026-07-15T10:00:00Z', updatedAt: null, tags: [{ tagId: 9, name: '후기', nameEn: 'Review', category: 'REVIEW' }], media: [] }

async function openMobileMoreIfNeeded(page: import('@playwright/test').Page, controlLabel: string) {
  const control = page.locator(`button[aria-label="${controlLabel}"]:visible`)
  if (!await control.isVisible()) await page.getByRole('button', { name: '더보기' }).click()
  return page.locator(`button[aria-label="${controlLabel}"]:visible`)
}

test.beforeEach(async ({ page }) => {
  let liked = false
  let comments: any[] = []
  await page.route('**/health', route => route.fulfill({ json: { status: 'healthy' } }))
  await page.route('**/api/v1/**', async route => {
    const request = route.request()
    const path = new URL(request.url()).pathname
    const method = request.method()
    if (path === '/api/v1/boards' && method === 'GET') return route.fulfill({ json: { items: [board], total: 1, page: 1, size: 12 } })
    if (path === '/api/v1/boards/1') return route.fulfill({ json: board })
    if (path === '/api/v1/tags' && method === 'GET') return route.fulfill({ json: { items: [{ tagId: 9, name: '후기', nameEn: 'Review', category: 'REVIEW' }], total: 1, page: 1, size: 100 } })
    if (path === '/api/v1/tourism/attractions') return route.fulfill({ json: { items: [attraction], total: 1, page: 1, size: 12 } })
    if (path === '/api/v1/tourism/festivals') return route.fulfill({ json: { items: [festival], total: 1, page: 1, size: 12 } })
    if (path === '/api/v1/tourism/attractions/haeundae') return route.fulfill({ json: attraction })
    if (path === '/api/v1/tourism/festivals/fest') return route.fulfill({ json: festival })
    if (path === '/api/v1/posts/popular') return route.fulfill({ json: { items: [post], total: 1, page: 1, size: 5 } })
    if (path === '/api/v1/boards/1/posts' && method === 'GET') return route.fulfill({ json: { items: [post], total: 1, page: 1, size: 10 } })
    if (path === '/api/v1/posts/1' && method === 'GET') return route.fulfill({ json: { ...post, likeCount: liked ? 3 : 2, commentCount: comments.length } })
    if (path === '/api/v1/posts/1' && method === 'DELETE') return route.fulfill({ status: 204 })
    if (path === '/api/v1/posts/1/likes/me') return route.fulfill({ json: { liked, likeCount: liked ? 3 : 2 } })
    if (path === '/api/v1/posts/1/likes') {
      liked = method === 'POST'
      return route.fulfill({ json: { liked, likeCount: liked ? 3 : 2 } })
    }
    if (path === '/api/v1/posts/1/comments' && method === 'GET') return route.fulfill({ json: { items: comments, total: comments.length, page: 1, size: 100 } })
    if (path === '/api/v1/posts/1/comments' && method === 'POST') {
      const body = request.postDataJSON()
      const created = { commentId: 1, postId: 1, parentId: body.parentId, author: 'ef12', content: body.content, createdAt: '2026-07-15T11:00:00Z', updatedAt: null, children: [] }
      comments = [...comments, created]
      return route.fulfill({ status: 201, json: created })
    }
    if (path === '/api/v1/search' && method === 'GET') return route.fulfill({ json: { items: [{ resultType: 'BOARD', resultId: 1, boardId: 1, title: '해운대 해수욕장', description: '부산 대표 해변', image: '', category: '관광지' }, { resultType: 'POST', resultId: 1, boardId: 1, title: '해운대 현지 팁', description: '산책하기 좋은 시간', image: '', category: '후기' }], total: 2, page: 1, size: 20 } })
    if (path === '/api/v1/chat') return route.fulfill({ json: { answer: '해운대 야간 산책을 추천해요.', language: 'ko', references: [] } })
    return route.fulfill({ status: 404, json: { message: '테스트에 준비되지 않은 API' } })
  })
})

test('browses paged boards and opens a post', async ({ page }) => {
  await page.goto('/boards')
  await expect(page.getByRole('heading', { name: '장소별 커뮤니티' })).toBeVisible()
  await expect(page.getByText('주소: 부산광역시 동구 영초길197번길 9 · 우편번호: 48808')).toBeVisible()
  await page.getByRole('link', { name: /해운대 해수욕장/ }).click()
  await expect(page.getByRole('heading', { name: '해운대 해수욕장' })).toBeVisible()
  await page.getByRole('link', { name: /해운대 현지 팁/ }).click()
  await expect(page.getByRole('heading', { name: '해운대 현지 팁' })).toBeVisible()
})

test('likes a post and creates a password-protected comment', async ({ page }) => {
  await page.goto('/boards/1/posts/1')
  await page.getByRole('button', { name: /추천 2/ }).click()
  await expect(page.getByRole('button', { name: /추천 3/ })).toBeVisible()
  await page.getByPlaceholder('댓글을 입력하세요').fill('좋은 정보 감사합니다')
  await page.getByPlaceholder('비밀번호 4자 이상').first().fill('5678')
  await page.getByRole('button', { name: '댓글 등록' }).click()
  await expect(page.getByText('좋은 정보 감사합니다')).toBeVisible()
})

test('returns to the board after deleting a post', async ({ page }) => {
  await page.goto('/boards/1/posts/1')
  await page.getByRole('button', { name: '삭제', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await dialog.locator('input[type="password"]').fill('5678')
  await dialog.getByRole('button', { name: '다음' }).click()
  await dialog.getByRole('button', { name: '삭제', exact: true }).click()
  await expect(page).toHaveURL(/\/boards\/1\/posts$/)
  await expect(page.getByText('게시글을 찾을 수 없습니다')).toHaveCount(0)
})

test('searches boards and posts with the integrated API', async ({ page }) => {
  await page.goto('/search')
  await page.getByPlaceholder('장소, 축제, 게시글 검색').fill('해운대')
  const requestPromise = page.waitForRequest(request => new URL(request.url()).pathname === '/api/v1/search')
  await page.getByRole('button', { name: '검색' }).click()
  const request = await requestPromise
  expect(new URL(request.url()).searchParams.get('q')).toBe('해운대')
  await expect(page.getByText('검색 결과 2개')).toBeVisible()
  await expect(page.getByText('장소 게시판')).toBeVisible()
  await expect(page.getByText('게시글', { exact: true })).toBeVisible()
})

test('loads popular posts on the home page', async ({ page }) => {
  const popularRequest = page.waitForRequest(request => new URL(request.url()).pathname === '/api/v1/posts/popular')
  await page.goto('/')
  await popularRequest
  await expect(page.getByRole('heading', { name: '해운대 현지 팁' })).toBeVisible()
})

test('switches popular posts to English', async ({ page }) => {
  await page.goto('/')
  await (await openMobileMoreIfNeeded(page, '언어 전환')).click()
  await expect(page.getByRole('heading', { name: 'Popular posts' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Haeundae Local Tips' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '인기 게시글' })).toHaveCount(0)
  const viewport = page.viewportSize()
  if (viewport && viewport.width <= 560) {
    await expect(page.getByPlaceholder('Search Busan')).toBeVisible()
    const columns = await page.locator('.grid-cards').first().evaluate(element => getComputedStyle(element).gridTemplateColumns)
    expect(columns.trim().split(/\s+/)).toHaveLength(1)
  }
  const widths = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }))
  expect(widths.content).toBeLessThanOrEqual(widths.viewport)
})

test('shows the new representative hero image', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('img[src="/brand/hero-busan-v2.png"]')).toBeVisible()
})

test('keeps the mobile home action in the bottom navigation without a top overlap', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Mobile layout only')
  await page.goto('/attractions')
  await expect(page.locator('.page-home-wrap')).toBeHidden()
  await expect(page.getByRole('navigation', { name: '주요 메뉴' }).getByRole('link', { name: '홈', exact: true })).toBeVisible()
})

test('offers PWA installation from the mobile more menu', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Mobile layout only')
  await page.goto('/')
  await page.evaluate(() => {
    const event = new Event('beforeinstallprompt', { cancelable: true })
    Object.assign(event, {
      prompt: async () => { (window as any).__pwaPrompted = true },
      userChoice: Promise.resolve({ outcome: 'dismissed', platform: 'web' }),
    })
    window.dispatchEvent(event)
  })
  await page.getByRole('button', { name: '더보기' }).click()
  await page.getByRole('button', { name: '앱으로 설치' }).click()
  await expect.poll(() => page.evaluate(() => Boolean((window as any).__pwaPrompted))).toBe(true)
})

test('switches the interface and localized content to English', async ({ page }) => {
  await page.goto('/attractions')
  await (await openMobileMoreIfNeeded(page, '언어 전환')).click()
  await expect(page.getByRole('heading', { name: 'Busan attractions' })).toBeVisible()
  await expect(page.getByText('Haeundae Beach')).toBeVisible()
  await expect(page.getByPlaceholder('Search by name on this page')).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
})

test('switches post creation and comment controls to English', async ({ page }) => {
  await page.goto('/boards/1/posts/new')
  await (await openMobileMoreIfNeeded(page, '언어 전환')).click()
  await expect(page.getByRole('heading', { name: 'New post' })).toBeVisible()
  await expect(page.getByLabel('Title')).toBeVisible()
  await expect(page.getByLabel('Content')).toBeVisible()
  await expect(page.getByText('프론트엔드에는 저장되지 않습니다')).toHaveCount(0)

  await page.goto('/boards/1/posts/1')
  await expect(page.getByRole('heading', { name: 'Haeundae Local Tips' })).toBeVisible()
  await expect(page.getByText('Evening is the best time for a walk.')).toBeVisible()
  await expect(page.getByRole('button', { name: /Edit/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /Delete/ }).first()).toBeVisible()
  await expect(page.getByText('Views 12')).toBeVisible()
  await expect(page.getByRole('button', { name: /Likes 2/ })).toBeVisible()
  await expect(page.getByPlaceholder('Write a comment')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Post comment' })).toBeVisible()
})

test('switches translated comments and replies to English', async ({ page }) => {
  await page.route('**/api/v1/posts/1/comments*', route => route.fulfill({
    json: {
      items: [{
        commentId: 7,
        postId: 1,
        parentId: null,
        author: 'ef12',
        content: '부산 정말 좋아요',
        contentKr: '부산 정말 좋아요',
        contentEn: 'I really like Busan',
        createdAt: '2026-07-16T10:00:00Z',
        updatedAt: null,
        children: [{
          commentId: 8,
          postId: 1,
          parentId: 7,
          author: 'ab34',
          content: '저도요',
          contentKr: '저도요',
          contentEn: 'Me too',
          createdAt: '2026-07-16T10:05:00Z',
          updatedAt: null,
          children: [],
        }],
      }],
      total: 2,
      page: 1,
      size: 100,
    },
  }))
  await page.goto('/boards/1/posts/1')
  await (await openMobileMoreIfNeeded(page, '언어 전환')).click()
  await expect(page.getByText('I really like Busan')).toBeVisible()
  await expect(page.getByText('Me too')).toBeVisible()
  await expect(page.getByText('부산 정말 좋아요')).toHaveCount(0)
})

test('shows the empty post list message in English', async ({ page }) => {
  await page.route('**/api/v1/boards/1/posts*', route => route.fulfill({ json: { items: [], total: 0, page: 1, size: 10 } }))
  await page.goto('/boards/1/posts')
  await (await openMobileMoreIfNeeded(page, '언어 전환')).click()
  await expect(page.getByRole('heading', { name: 'No posts yet' })).toBeVisible()
})

test('sends chatbot session headers and renders the answer', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: '부산 관광 챗봇 열기' }).click()
  await page.getByPlaceholder('부산 여행에 관해 물어보세요').fill('해운대 추천해줘')
  const requestPromise = page.waitForRequest(request => new URL(request.url()).pathname === '/api/v1/chat')
  await page.getByRole('button', { name: '전송' }).click()
  const request = await requestPromise
  expect(request.headers()['x-client-id']).toBeTruthy()
  expect(request.headers()['x-session-id']).toMatch(/^[0-9a-f-]{36}$/i)
  await expect(page.getByText('해운대 야간 산책을 추천해요.')).toBeVisible()
  await page.getByRole('button', { name: '챗봇 접기' }).click()
  await expect(page.getByRole('button', { name: '부산 관광 챗봇 열기' })).toBeVisible()
  await page.getByRole('button', { name: '부산 관광 챗봇 열기' }).click()
  await expect(page.getByText('해운대 야간 산책을 추천해요.')).toBeVisible()
})

test('uses the generated image when tourism images are missing', async ({ page }) => {
  await page.goto('/attractions')
  await expect(page.locator('img[src="/images/busan-placeholder.png"]').first()).toBeVisible()
})

test('updates search placeholder colors with the theme', async ({ page }) => {
  await page.goto('/')
  const input = page.getByPlaceholder('장소, 축제, 게시글 검색')
  const before = await input.evaluate(element => getComputedStyle(element, '::placeholder').color)
  await (await openMobileMoreIfNeeded(page, '화면 테마 전환')).click()
  const after = await input.evaluate(element => getComputedStyle(element, '::placeholder').color)
  expect(after).not.toBe(before)
})

test('places the home button above the detail breadcrumb', async ({ page }) => {
  await page.goto('/festivals/fest')
  const home = await page.getByRole('link', { name: '홈', exact: true }).first().boundingBox()
  const breadcrumb = await page.locator('nav').first().boundingBox()
  expect(home).not.toBeNull()
  expect(breadcrumb).not.toBeNull()
  expect(home!.y).toBeLessThan(breadcrumb!.y)
})

test('shows tourism 503 with retry and no mock fallback', async ({ page }) => {
  await page.route(/\/api\/v1\/tourism\/attractions(?:\?.*)?$/, route => route.fulfill({ status: 503, json: { message: '관광 데이터 원본을 찾을 수 없습니다.' } }))
  await page.goto('/attractions')
  await expect(page.getByRole('heading', { name: '정보를 불러오지 못했습니다' })).toBeVisible()
  await expect(page.getByRole('button', { name: '다시 시도' })).toBeVisible()
})
