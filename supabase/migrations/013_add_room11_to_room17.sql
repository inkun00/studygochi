-- room_type: room11~room17 추가 (새 배경)
ALTER TABLE pets DROP CONSTRAINT IF EXISTS pets_room_type_check;
ALTER TABLE pets ADD CONSTRAINT pets_room_type_check CHECK (
  room_type IN ('room1','room2','room3','room4','room5','room6','room7','room8','room9','room10','room11','room12','room13','room14','room15','room16','room17')
);
