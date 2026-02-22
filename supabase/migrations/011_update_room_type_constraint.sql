-- room_type: bedroom/kitchen/classroom/shop → room1~room10으로 변경
-- 1. 기존 CHECK 제약 먼저 제거 (UPDATE가 가능하도록)
ALTER TABLE pets DROP CONSTRAINT IF EXISTS pets_room_type_check;

-- 2. 기존 데이터 마이그레이션
UPDATE pets SET room_type = 'room1' WHERE room_type = 'bedroom';
UPDATE pets SET room_type = 'room2' WHERE room_type = 'kitchen';
UPDATE pets SET room_type = 'room3' WHERE room_type = 'classroom';
UPDATE pets SET room_type = 'room4' WHERE room_type = 'shop';

-- 3. 새 제약 추가 및 기본값 설정
ALTER TABLE pets ADD CONSTRAINT pets_room_type_check CHECK (
  room_type IN ('room1','room2','room3','room4','room5','room6','room7','room8','room9','room10')
);
ALTER TABLE pets ALTER COLUMN room_type SET DEFAULT 'room1';
