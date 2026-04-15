#!/bin/bash
# ── Google Cloud 초기 설정 스크립트 ────────────────────────────────────────
# 사용법: PROJECT_ID=your-project bash scripts/setup-gcloud.sh
#
# 사전 준비:
#   1. gcloud CLI 설치 및 로그인 (gcloud auth login)
#   2. PROJECT_ID 환경변수 설정
#   3. 결제 계정 활성화

set -e

PROJECT_ID="${PROJECT_ID:?PROJECT_ID 환경변수를 설정해주세요}"
REGION="asia-northeast3"
SERVICE_NAME="linkedin-content-maker"
DB_INSTANCE="linkedin-db"
DB_NAME="linkedin_app"
DB_USER="app_user"
REPO_NAME="linkedin-content-and-cardnews"

echo "🚀 Google Cloud 설정 시작: $PROJECT_ID"

# 프로젝트 설정
gcloud config set project "$PROJECT_ID"

# API 활성화
echo "📡 필요한 API 활성화 중..."
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  secretmanager.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com

# Artifact Registry 저장소 생성
echo "📦 Artifact Registry 생성 중..."
gcloud artifacts repositories create "$REPO_NAME" \
  --repository-format=docker \
  --location="$REGION" \
  --description="LinkedIn Content Maker Docker images" \
  2>/dev/null || echo "  (이미 존재)"

# Cloud SQL 인스턴스 생성
echo "🗄️  Cloud SQL PostgreSQL 인스턴스 생성 중... (5~10분 소요)"
gcloud sql instances create "$DB_INSTANCE" \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region="$REGION" \
  --storage-type=SSD \
  --storage-size=10GB \
  --backup-start-time=03:00 \
  2>/dev/null || echo "  (이미 존재)"

# DB 및 사용자 생성
echo "👤 DB 사용자 및 데이터베이스 생성 중..."
DB_PASSWORD=$(openssl rand -base64 24)
gcloud sql databases create "$DB_NAME" --instance="$DB_INSTANCE" 2>/dev/null || echo "  (DB 이미 존재)"
gcloud sql users create "$DB_USER" --instance="$DB_INSTANCE" --password="$DB_PASSWORD" 2>/dev/null || echo "  (사용자 이미 존재)"

CONNECTION_NAME=$(gcloud sql instances describe "$DB_INSTANCE" --format='value(connectionName)')
DB_URL="postgresql://${DB_USER}:${DB_PASSWORD}@/${DB_NAME}?host=/cloudsql/${CONNECTION_NAME}"

echo ""
echo "✅ Cloud SQL 연결 문자열:"
echo "  $DB_URL"

# Secret Manager에 시크릿 저장
echo "🔐 Secret Manager에 시크릿 저장 중..."
echo -n "$DB_URL" | gcloud secrets create linkedin-app-db-url \
  --replication-policy=automatic \
  --data-file=- 2>/dev/null || \
  echo -n "$DB_URL" | gcloud secrets versions add linkedin-app-db-url --data-file=-

# Anthropic API 키 입력 요청
echo ""
read -r -p "Anthropic API 키를 입력하세요 (sk-ant-...): " ANTHROPIC_KEY
echo -n "$ANTHROPIC_KEY" | gcloud secrets create linkedin-app-anthropic \
  --replication-policy=automatic \
  --data-file=- 2>/dev/null || \
  echo -n "$ANTHROPIC_KEY" | gcloud secrets versions add linkedin-app-anthropic --data-file=-

# Cloud Build 서비스 계정에 권한 부여
echo "🔑 Cloud Build 서비스 계정 권한 설정 중..."
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')
CB_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"
CLOUDRUN_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

for ROLE in roles/run.admin roles/iam.serviceAccountUser roles/secretmanager.secretAccessor roles/cloudsql.client; do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$CB_SA" --role="$ROLE" --quiet
done

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$CLOUDRUN_SA" \
  --role=roles/secretmanager.secretAccessor --quiet

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$CLOUDRUN_SA" \
  --role=roles/cloudsql.client --quiet

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 설정 완료! 다음 단계:"
echo ""
echo "1. Prisma 마이그레이션 실행 (Cloud SQL에 직접 연결 시):"
echo "   DATABASE_URL=\"$DB_URL\" npx prisma migrate deploy"
echo ""
echo "2. 첫 번째 배포:"
echo "   gcloud builds submit --config=cloudbuild.yaml"
echo ""
echo "3. Cloud Run URL 확인:"
echo "   gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)'"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
