/**
 * Supabase 마이그레이션 실행 스크립트
 * 
 * 사용법:
 * 
 * 0. 필요한 패키지: npm install pg dotenv
 * 1. .env.local에 SUPABASE_DB_URL 추가
 *    - Supabase 대시보드 > Project Settings > Database > Connection string (URI) 복사
 *    - 비밀번호를 실제 DB 비밀번호로 교체
 *    예: postgresql://postgres.[프로젝트ref]:[비밀번호]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres
 * 
 * 2. 실행: node scripts/run-migrations.js
 */

const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  try {
    require('dotenv').config({ path: envPath });
  } catch {}
  // dotenv 미적용 시 수동 로드
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const m = line.match(/^(\w+)=(.*)$/);
    if (m) {
      const key = m[1];
      let val = m[2].trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

async function main() {
  let pg;
  try {
    pg = require('pg');
  } catch {
    console.error('pg 패키지가 필요합니다. npm install pg 실행 후 다시 시도하세요.');
    process.exit(1);
  }

  let clientConfig;
  const dbUrl = process.env.SUPABASE_DB_URL;
  if (dbUrl) {
    clientConfig = { connectionString: dbUrl };
  } else if (process.env.SUPABASE_DB_HOST && process.env.SUPABASE_DB_PASSWORD) {
    clientConfig = {
      host: process.env.SUPABASE_DB_HOST,
      port: parseInt(process.env.SUPABASE_DB_PORT || '5432', 10),
      user: process.env.SUPABASE_DB_USER || 'postgres',
      password: process.env.SUPABASE_DB_PASSWORD,
      database: process.env.SUPABASE_DB_NAME || 'postgres',
      ssl: { rejectUnauthorized: false },
    };
  } else {
    console.error('DB 연결 정보가 없습니다.');
    console.error('.env.local에 SUPABASE_DB_URL 또는 SUPABASE_DB_HOST+SUPABASE_DB_PASSWORD를 설정하세요.');
    process.exit(1);
  }

  const client = new pg.Client(clientConfig);
  const migrationsDir = path.join(__dirname, '../supabase/migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log(`총 ${files.length}개 마이그레이션 파일 발견\n`);

  try {
    await client.connect();
    console.log('DB 연결 완료\n');

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      console.log(`실행 중: ${file}`);
      await client.query(sql);
      console.log(`  ✓ 완료\n`);
    }

    console.log('모든 마이그레이션이 성공적으로 적용되었습니다.');
  } catch (err) {
    console.error('마이그레이션 실패:', err.message);
    console.error('\n[대안] Supabase Dashboard > SQL Editor에서 수동 실행:');
    console.error('  supabase/apply-all-migrations.sql 파일 내용을 붙여넣고 Run');
    console.error('  https://supabase.com/dashboard/project/eawrpmlbpyxwbjjlvbqo/sql/new');
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
