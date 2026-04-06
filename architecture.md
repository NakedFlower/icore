# iCore 통합 업무 플랫폼 아키텍처 가이드 (현행)

## 1) 운영 인프라 구성
- `Cloud DNS` + `HTTP(S) Load Balancer`: 외부 트래픽 진입점
- `Cloud CDN` + `Cloud Storage`: 정적 랜딩 페이지 배포 및 캐시
- `단일 VM(Private subnet)`: API 컨테이너 + G2B Scraper 컨테이너 동시 운영
- `VM 내부 MySQL`: 애플리케이션 메타데이터/설정 저장
- `Cloud NAT`: VM의 외부 API 접근(필요 시)
- `Cloud Scheduler`: 정기 실행 트리거
- `Cloud Run(스크래퍼 실행 엔드포인트)`: Scheduler가 호출하는 실행 진입점
- `Google Sheets API`: 수집 결과 저장
- `Gmail API`: 수집 결과 메일 발송

## 2) 스크래퍼 흐름(변경 후)
1. 관리자가 도구 화면에서 스케줄/키워드/수신자 저장
2. 백엔드가 DB(`scraper_configs`) 저장 후 Cloud Scheduler Job 생성/수정/일시정지 반영
3. Cloud Scheduler가 주기적으로 Cloud Run 엔드포인트 HTTP POST 호출
4. Cloud Run이 수집 파이프라인 실행 후 Google Sheets/Gmail API 처리

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
- Cloud Scheduler 서비스 계정에 Cloud Run Invoker 권한 부여
- API 서버 서비스 계정에 Cloud Scheduler Admin(또는 job update 권한) 부여
- 대상 Cloud Run 서비스에 OIDC 인증 허용 설정 확인
- LB 라우팅에서 `/api/*`가 VM API로 정확히 전달되는지 확인
