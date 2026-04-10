# iCore 통합 업무 플랫폼 아키텍처 가이드 (현행)

## 1) 운영 인프라 구성
- `Cloud DNS` + `HTTP(S) Load Balancer`: 외부 트래픽 진입점
- `Cloud CDN` + `Cloud Storage`: 정적 랜딩 페이지 배포 및 캐시
- `단일 VM(Private subnet)`: API 서버 컨테이너 단일 운영
- `VM 내부 MySQL`: 애플리케이션 메타데이터/설정 저장
- `Cloud NAT`: VM의 외부 API 접근(필요 시)
- `Cloud Scheduler`: 정기 실행 트리거
- `Cloud Run(스크래퍼 실행 엔드포인트)`: Scheduler가 호출하는 실행 진입점
- `Google Sheets API`: 수집 결과 저장
- `Apps Script Web App`: 시트 기반 메일 발송 트리거

## 2) 스크래퍼 흐름(변경 후)
1. 관리자가 도구 화면에서 스케줄/키워드/수신자 저장
2. 백엔드가 DB(`scraper_configs`) 저장 후 Cloud Scheduler Job 생성/수정/일시정지 반영
3. Cloud Scheduler가 주기적으로 Cloud Run `/run` 호출
4. Cloud Run 워커가 G2B 데이터 소스를 조회하여 후보 공고 생성
5. Cloud Run 워커가 API 서버 `/api/scraper/internal/dedup` 호출로 DB 기반 중복 필터링 수행
6. Cloud Run 워커가 Google Sheets 적재
7. 선택적으로 Apps Script 웹훅 호출로 메일 발송 트리거
8. Cloud Run 워커가 API 서버 `/api/scraper/runs`로 실행 결과를 기록

## 3) 관리 도구에서 제어 가능한 항목
- 활성화 여부(`enabled`)
- 실행 방식(`daily` 또는 `interval`)
- 고정 실행 시간(`notify_time`) 또는 반복 간격(`interval_minutes`)
- 수신 메일(`receiver_emails`)과 키워드(`keywords`)

## 4) Cloud Scheduler 연동 환경변수
- `CLOUD_SCHEDULER_ENABLED=true`
- `CLOUD_SCHEDULER_PROJECT_ID=<gcp-project-id>`
- `CLOUD_SCHEDULER_LOCATION=asia-northeast3`
- `CLOUD_SCHEDULER_JOB_ID=icore-g2b-scraper-job`
- `CLOUD_SCHEDULER_TIMEZONE=Asia/Seoul`
- `CLOUD_SCHEDULER_TARGET_URL=https://<cloud-run-service-url>`
- `CLOUD_SCHEDULER_INVOKER_SERVICE_ACCOUNT=<invoker-sa@project.iam.gserviceaccount.com>`

## 5) 운영 체크리스트
- Cloud Scheduler 서비스 계정에 API 호출 권한/인증 설정 확인
- API 서버 서비스 계정에 Cloud Scheduler Admin(또는 job update 권한) 부여
- LB 라우팅에서 `/api/*`가 VM API로 정확히 전달되는지 확인
- `APPS_SCRIPT_WEBHOOK_URL` 사용 시, 웹훅 접근 제어 및 요청 본문 검증 적용
- 백엔드 `GET /api/scraper/runs`로 실행 이력 모니터링
