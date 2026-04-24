// Prisma v7 config — PostgreSQL (Cloud SQL 프로덕션 / 로컬 개발 모두 지원)
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // 로컬: .env.local의 DATABASE_URL 사용
    // 프로덕션: Cloud Run --set-secrets로 주입된 DATABASE_URL 사용
    url: process.env["DATABASE_URL"],
  },
});
