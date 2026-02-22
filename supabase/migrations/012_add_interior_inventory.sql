-- 인테리어 인벤토리 (보유한 소품 수) 및 배치된 소품
ALTER TABLE pets ADD COLUMN IF NOT EXISTS interior_inventory jsonb NOT NULL DEFAULT '{}';
ALTER TABLE pets ADD COLUMN IF NOT EXISTS placed_interior jsonb NOT NULL DEFAULT '[]';
