# iCore 통합 업무 플랫폼 아키텍처 가이드

## 1) 운영 인프라 구성 매핑
- `Cloud DNS`: 랜딩 도메인 및 관리 도메인(예: `tool.icore.co.kr`) 레코드 관리
- `HTTP(S) Load Balancer`: 외부 트래픽 진입점, 백엔드(Cloud Run)와 정적 자산(Cloud Storage) 오리진 분기
- `Cloud CDN`: Cloud Storage 오리진에 캐시 적용하여 랜딩 페이지 전송 최적화
- `Cloud Storage`: 빌더가 생성한 정적 랜딩 페이지 저장 (`gs://<bucket>/landings/<topic>/<slug>/index.html`)
- `Cloud Build`: 프론트/백엔드 컨테이너 이미지 빌드 및 정적 페이지 업로드 파이프라인 수행
- `Cloud Run`: FastAPI API 서버 및 필요 시 백엔드 워커 서비스 실행
- `Cloud SQL`: 사이트 메타데이터, 사용자 권한, 스크래퍼 설정 등 영속 데이터 저장
- `Serverless VPC Access Connector`: Cloud Run에서 Private Subnet 리소스 접근
- `Private Subnet`: G2B Scraper/API Server가 위치, 외부 직접 노출 금지
- `Cloud NAT`: Private Subnet에서 외부 G2B 소스 접근 시 아웃바운드 제공
- `Certificate Manager`: 사용자 도메인 TLS 인증서 관리
- `Cloud Resource Manager`: 프로젝트/권한/서비스 계정 정책 통합 관리

## 2) 트래픽 흐름
1. 사용자 요청 → Cloud DNS → HTTPS Load Balancer
2. 랜딩 페이지 요청은 Cloud CDN + Cloud Storage 오리진으로 전달
3. 관리 도구/API 요청은 Cloud Run(FastAPI)로 전달
4. FastAPI가 스크래퍼 제어 API 호출 필요 시 VPC Connector 경유로 Private Subnet 접속
5. 비즈니스 데이터는 Cloud SQL에 저장

## 3) Cloud Run 배포 기준
- 이미지 저장소: Artifact Registry
- 서비스:
  - `icore-api` (FastAPI)
  - `icore-worker` (선택: 비동기 작업)
- 권장 설정:
  - 최소 인스턴스 0~1, 최대 인스턴스 트래픽 기준 설정
  - 동시성 40~80 (API 성격에 따라 조정)
  - 비밀값은 Secret Manager 연동
  - VPC Connector 연결 및 egress 정책 설정

## 4) Cloud Storage + CDN 배포 기준
- 버킷 생성: `icore-landing-pages`
- 퍼블릭 접근은 LB 오리진 경유 방식 권장 (직접 퍼블릭 최소화)
- 디렉토리 규칙:
  - `landings/<topic>/<slug>/index.html`
- 캐시 무효화:
  - 변경 후 `gcloud compute url-maps invalidate-cdn-cache` 수행

## 5) Cloud SQL 설계 반영
- 엔진: PostgreSQL 권장
- 주요 테이블:
  - `landing_pages`
  - `business_sites`
  - `scraper_configs`
  - `users`, `roles`
- Cloud Run에서 Cloud SQL Auth Proxy 또는 커넥터 사용

## 6) 로컬 개발/테스트
- 루트에서 실행:
  - `docker compose up --build`
- 접속:
  - Front: `http://localhost:5173`
  - Back: `http://localhost:8000`
- Swagger:
  - `http://localhost:8000/docs`

## 7) 운영 배포 시퀀스 예시
1. GitHub Actions에서 테스트/빌드 통과
2. Cloud Build가 컨테이너 이미지 푸시
3. Cloud Run 신규 리비전 배포
4. 랜딩 페이지는 Cloud Build 단계에서 Cloud Storage 업로드
5. 필요 시 CDN 캐시 무효화
