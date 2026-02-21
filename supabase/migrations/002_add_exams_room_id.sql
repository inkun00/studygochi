-- exams 테이블에 room_id 컬럼 추가 (교실별 시험)
ALTER TABLE exams ADD COLUMN IF NOT EXISTS room_id uuid REFERENCES classrooms(id);
