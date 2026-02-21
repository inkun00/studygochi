-- 펫 테이블에 MBTI 성격 필드 추가
ALTER TABLE pets ADD COLUMN IF NOT EXISTS mbti text DEFAULT 'ENFP';
