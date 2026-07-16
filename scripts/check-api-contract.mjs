const base=(process.env.VITE_API_BASE_URL||'https://ssafy-first-team.onrender.com').replace(/\/$/,'')
const response=await fetch(`${base}/openapi.json`,{cache:'no-store'})
if(!response.ok)throw new Error(`OpenAPI 문서를 불러오지 못했습니다: ${response.status}`)
const spec=await response.json(),schemas=spec.components?.schemas||{},paths=spec.paths||{}
const assert=(condition,message)=>{if(!condition)throw new Error(`API 계약 불일치: ${message}`)}
const responseRef=path=>paths[path]?.get?.responses?.['200']?.content?.['application/json']?.schema?.$ref
const parameters=path=>(paths[path]?.get?.parameters||[]).map(p=>p.name)

assert(spec.info?.version==='1.1.1','문서 버전이 1.1.1이 아닙니다.')
assert(responseRef('/api/v1/boards')==='#/components/schemas/BoardPageResponse','게시판 목록이 BoardPageResponse가 아닙니다.')
assert(parameters('/api/v1/boards').join(',')==='page,size','게시판 페이지 파라미터가 변경됐습니다.')
assert(responseRef('/api/v1/tags')==='#/components/schemas/TagPageResponse','태그 목록이 TagPageResponse가 아닙니다.')
assert(responseRef('/api/v1/posts/popular')==='#/components/schemas/PostPageResponse','인기글 API 응답이 PostPageResponse가 아닙니다.')
assert(parameters('/api/v1/posts/popular').join(',')==='page,size','인기글 페이지 파라미터가 변경됐습니다.')
assert((paths['/api/v1/search']?.get?.parameters||[]).some(p=>p.name==='q'&&p.required),'검색 필수 파라미터 q가 없습니다.')
assert(JSON.stringify(schemas.SearchItem?.properties?.resultType?.enum)==='["BOARD","POST"]','검색 결과 유형이 변경됐습니다.')
for(const name of ['BoardResponse','AttractionResponse','FestivalResponse']) assert('boardId' in (schemas[name]?.properties||{}),`${name}에 boardId가 없습니다.`)
for(const field of ['nameEn','categoryEn','descriptionEn']) assert(field in (schemas.BoardResponse?.properties||{}),`BoardResponse에 ${field}이 없습니다.`)
for(const field of ['nameEn','categoryEn','summaryEn','descriptionEn','addressEn']) assert(field in (schemas.AttractionResponse?.properties||{}),`AttractionResponse에 ${field}이 없습니다.`)
for(const field of ['nameEn','placeEn','periodEn','summaryEn']) assert(field in (schemas.FestivalResponse?.properties||{}),`FestivalResponse에 ${field}이 없습니다.`)
for(const field of ['titleKr','titleEn','contentKr','contentEn']) assert(field in (schemas.PostResponse?.properties||{}),`PostResponse에 ${field}이 없습니다.`)
for(const field of ['contentKr','contentEn']) assert(field in (schemas.CommentResponse?.properties||{}),`CommentResponse에 ${field}이 없습니다.`)

assert(responseRef('/api/v1/tourism/attractions')==='#/components/schemas/AttractionPageResponse','관광지 목록 응답이 AttractionPageResponse가 아닙니다.')
assert(responseRef('/api/v1/tourism/festivals')==='#/components/schemas/FestivalPageResponse','축제 목록 응답이 FestivalPageResponse가 아닙니다.')
assert(parameters('/api/v1/tourism/attractions').join(',')==='page,size','관광지 페이지 파라미터가 변경되었습니다.')
assert(parameters('/api/v1/tourism/festivals').join(',')==='page,size','축제 페이지 파라미터가 변경되었습니다.')
assert(responseRef('/api/v1/posts/{post_id}/comments')==='#/components/schemas/CommentPageResponse','댓글 목록 응답이 CommentPageResponse가 아닙니다.')

const chatHeaders=(paths['/api/v1/chat']?.post?.parameters||[]).filter(parameter=>parameter.in==='header')
assert(chatHeaders.some(parameter=>parameter.name==='X-Client-Id'&&parameter.required),'챗봇 X-Client-Id 필수 헤더가 변경되었습니다.')
assert(chatHeaders.some(parameter=>parameter.name==='X-Session-Id'&&parameter.required),'챗봇 X-Session-Id 필수 헤더가 변경되었습니다.')
assert(paths['/api/v1/chat']?.post?.requestBody?.content?.['application/json']?.schema?.$ref==='#/components/schemas/ChatRequest','챗봇 요청 스키마가 변경되었습니다.')

const boards=await (await fetch(`${base}/api/v1/boards?page=1&size=100`,{cache:'no-store'})).json()
assert(Array.isArray(boards.items),'실제 게시판 응답에 items 배열이 없습니다.')
assert(boards.items.every(item=>Number.isSafeInteger(item.boardId)),'안전하지 않은 게시판 ID가 반환됐습니다.')
console.log('Swagger v1.1.1 재배포 계약 확인 완료')
