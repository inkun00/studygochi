'use client';

import { useState } from 'react';
import {
  FOODS, NUTRIENT_LABELS, NUTRIENT_COLORS,
  type NutrientKey, type FoodItem,
} from '@/lib/food-constants';
import type { Pet } from '@/lib/types';

interface GroceryScreenProps {
  pet: Pet;
  setPet: (pet: Pet) => void;
  supabase: any;
  setPetMessage: (msg: string) => void;
  onBack: () => void;
}

type FoodCategory = 'all' | 'staple' | 'protein' | 'snack' | 'fruit' | 'dairy';

const CATEGORY_LABELS: Record<FoodCategory, string> = {
  all: '전체',
  staple: '주식',
  protein: '단백질',
  snack: '간식',
  fruit: '과일',
  dairy: '유제품',
};

export default function GroceryScreen({ pet, setPet, supabase, setPetMessage, onBack }: GroceryScreenProps) {
  const [buying, setBuying] = useState(false);
  const [category, setCategory] = useState<FoodCategory>('all');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [buyQty, setBuyQty] = useState(1);
  const points = pet.points || 0;
  const inventory = pet.food_inventory || {};

  const filteredFoods = category === 'all' ? FOODS : FOODS.filter(f => f.category === category);

  const handleBuy = async (food: FoodItem, qty: number) => {
    const totalCost = food.price * qty;
    if (points < totalCost || buying) return;

    setBuying(true);
    const newInventory = { ...inventory, [food.id]: (inventory[food.id] || 0) + qty };
    const newPoints = points - totalCost;

    await supabase.from('pets').update({
      food_inventory: newInventory,
      points: newPoints,
    }).eq('id', pet.id);

    setPet({ ...pet, food_inventory: newInventory, points: newPoints });
    setPetMessage(`${food.emoji} ${food.name} ${qty}개 구매!`);
    setSelectedFood(null);
    setBuyQty(1);
    setBuying(false);
  };

  const font = { fontFamily: "'Press Start 2P'" };

  return (
    <div className="w-full h-full flex flex-col animate-slide-in" style={{ background: '#fff8f0' }}>
      {/* Header */}
      <div className="w-full flex items-center gap-1 p-2">
        <button onClick={onBack} className="text-[14px] pixel-btn px-2 py-1" style={{ ...font, color: 'var(--text-dark)' }}>←</button>
        <div className="flex-1 text-center py-1 rounded ui-panel" style={{ ...font }}>
          <span className="text-[14px]" style={{ color: 'var(--ui-outline)' }}>쇼핑</span>
        </div>
      </div>

      {/* Points display */}
      <div className="flex justify-between items-center px-3 py-1 ui-panel">
        <span className="text-[9px]" style={{ ...font, color: 'var(--ui-outline)' }}>보유 포인트</span>
        <span className="text-[11px]" style={{ ...font, color: 'var(--text-orange)' }}>⭐ {points}P</span>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 px-2 py-1.5 overflow-x-auto">
        {(Object.keys(CATEGORY_LABELS) as FoodCategory[]).map(cat => (
          <button
            key={cat}
            onClick={() => { setCategory(cat); setSelectedFood(null); }}
            className="shrink-0 px-2 py-1 rounded-full text-[7px]"
            style={{
              ...font,
              background: category === cat ? '#d06000' : '#fff0e0',
              color: category === cat ? '#fff' : '#a08060',
              border: '1px solid #e0c8a0',
            }}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {/* Food list */}
        <div className="grid grid-cols-3 gap-1.5">
          {filteredFoods.map(food => {
            const owned = inventory[food.id] || 0;
            const canAfford = points >= food.price;
            return (
              <button
                key={food.id}
                onClick={() => { setSelectedFood(food); setBuyQty(1); }}
                className="flex flex-col items-center p-1.5 rounded-lg transition-all active:scale-95"
                style={{
                  background: selectedFood?.id === food.id ? '#ffe0a0' : '#fffaf0',
                  border: selectedFood?.id === food.id ? '2px solid #d06000' : '1px solid #e0d0c0',
                  opacity: canAfford ? 1 : 0.5,
                }}
              >
                <span className="text-xl">{food.emoji}</span>
                <span className="text-[7px]" style={{ ...font, color: '#805030' }}>{food.name}</span>
                <span className="text-[6px]" style={{ ...font, color: '#d06000' }}>⭐{food.price}P</span>
                {owned > 0 && (
                  <span className="text-[6px]" style={{ ...font, color: '#a08060' }}>보유:{owned}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected food detail */}
        {selectedFood && (
          <div className="p-2 rounded-lg" style={{ background: '#e8ffe8', border: '2px solid #80c080' }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{selectedFood.emoji}</span>
              <div>
                <p className="text-[9px]" style={{ ...font, color: '#306030' }}>{selectedFood.name}</p>
                <p className="text-[7px]" style={{ ...font, color: '#609060' }}>{selectedFood.description}</p>
              </div>
            </div>

            {/* Nutrient preview */}
            <div className="flex flex-wrap gap-1 mb-2">
              {(Object.keys(selectedFood.nutrients) as NutrientKey[])
                .filter(k => selectedFood.nutrients[k] > 0)
                .map(k => (
                  <span key={k} className="text-[6px] px-1 py-0.5 rounded" style={{
                    ...font, background: NUTRIENT_COLORS[k] + '30', color: NUTRIENT_COLORS[k],
                  }}>
                    {NUTRIENT_LABELS[k]}+{selectedFood.nutrients[k]}
                  </span>
                ))}
              <span className="text-[6px] px-1 py-0.5 rounded" style={{
                ...font, background: '#ff808030', color: '#d06000',
              }}>
                포만감+{selectedFood.hungerRestore}
              </span>
            </div>

            {/* Quantity selector */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <button
                onClick={() => setBuyQty(Math.max(1, buyQty - 1))}
                className="w-6 h-6 rounded text-[12px] flex items-center justify-center"
                style={{ ...font, background: '#fff', border: '1px solid #c0c0c0', color: '#805030' }}
              >-</button>
              <span className="text-[11px]" style={{ ...font, color: '#805030' }}>{buyQty}개</span>
              <button
                onClick={() => setBuyQty(Math.min(10, buyQty + 1))}
                className="w-6 h-6 rounded text-[12px] flex items-center justify-center"
                style={{ ...font, background: '#fff', border: '1px solid #c0c0c0', color: '#805030' }}
              >+</button>
            </div>

            {/* Buy button */}
            <button
              onClick={() => handleBuy(selectedFood, buyQty)}
              disabled={buying || points < selectedFood.price * buyQty}
              className="pixel-btn w-full py-1.5 text-[11px] disabled:opacity-40"
              style={{ ...font, background: '#c0f0c0', color: '#306030', borderColor: '#80c080' }}
            >
              {buying ? '...' : `⭐${selectedFood.price * buyQty}P 구매`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
