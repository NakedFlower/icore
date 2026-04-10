# API 명세 (v0.1)

## Health
- `GET /api/health`
  - 응답: `{ "status": "ok" }`

## Builder
- `GET /api/builder/templates`
  - 랜딩 템플릿 3종 목록 조회
- `POST /api/builder/deploy`
  - 요청:
    - `template_id`, `business_topic`, `business_name`, `slug`, `custom_domain?`, `content`
  - 응답:
    - `deployment_id`, `target_path`, `public_url`, `cdn_enabled`, `message`

## Site Manager
- `GET /api/sites`
  - 대주제/세부사업 사이트 목록 조회
- `POST /api/sites`
  - 사이트 등록

## Scraper
- `GET /api/scraper/config`
  - 수집기 설정 조회
  - 응답에 `scheduler_status`, `recent_runs` 포함
- `PUT /api/scraper/config`
  - 알림 시간, 수신 메일, 키워드, 활성화 상태 저장
  - 저장 직후 Cloud Scheduler 잡 생성/수정/일시정지 동기화
  - 응답에 `scheduler` 동기화 결과 포함
- `POST /api/scraper/trigger`
  - 수집기 즉시 실행 요청
  - Cloud Scheduler 연동 활성 시 `run_job` 호출
- `GET /api/scraper/runs?limit=20`
  - 최근 실행 이력 조회
  - 인증 필요(Bearer)
- `POST /api/scraper/execute`
  - 관리자 수동 점검용 API 서버 즉시 실행 엔드포인트
  - 처리 순서: 수집 -> 중복 필터 -> Google Sheet 적재 -> Apps Script 웹훅 트리거
  - 인증 필요(Bearer)
- `POST /api/scraper/internal/dedup`
  - Cloud Run 워커 전용 중복 필터링 엔드포인트
  - 인증 필요(`X-Scraper-Internal-Token`)
- `POST /api/scraper/runs`
  - Cloud Run 워커 실행 결과 저장 엔드포인트
  - 인증 필요(`X-Scraper-Internal-Token`)

## 메일 발송 대체 경로
- SendGrid 직접 발송은 제거
- Apps Script 웹훅(`APPS_SCRIPT_WEBHOOK_URL`)이 설정된 경우, 시트 저장 후 메일 발송 트리거만 수행

## 에러 처리 정책
- 입력값 검증 오류: HTTP 422
- 내부 오류: HTTP 500
- 향후 표준 에러 포맷:
  - `{ "code": "ERROR_CODE", "message": "사용자 메시지", "details": {} }`
