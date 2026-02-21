'use client';

import { useState } from 'react';
import PixelPet from '@/components/pet/PixelPet';
import { getCharacterSprite } from '@/lib/pet-constants';
import { isPetDead, calculateCurrentNutrition } from '@/lib/pet-utils';
import {
  FOODS, NUTRIENT_LABELS, NUTRIENT_COLORS, NUTRIENT_ICONS,
  MAX_NUTRIENT, calculateNutritionScore, getNutritionStatus,
  type NutrientKey, type FoodItem,
} from '@/lib/food-constants';
import { EXP_PER_FEED, EXP_TO_LEVEL_UP } from '@/lib/constants';
import { calculateLevel } from '@/lib/pet-utils';
import type { Pet, UserProfile } from '@/lib/types';

interface FeedScreenProps {
  pet: Pet;
  setPet: (pet: Pet) => void;
  user: UserProfile;
  setUser: (user: UserProfile) => void;
  supabase: any;
  setPetMessage: (msg: string) => void;
  onBack: () => void;
  sessionStartAt?: number | null;
}

export default function FeedScreen({ pet, setPet, user, setUser, supabase, setPetMessage, onBack, sessionStartAt }: FeedScreenProps) {
  const [feeding, setFeeding] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const dead = isPetDead(pet, sessionStartAt);
  const nutrition = calculateCurrentNutrition(pet, sessionStartAt);
  const inventory = pet.food_inventory || {};
  const nutritionStatus = getNutritionStatus(nutrition);
  const nutritionScore = calculateNutritionScore(nutrition);

  const availableFoods = FOODS.filter(f => (inventory[f.id] || 0) > 0);

  const handleFeed = async (food: FoodItem) => {
    if (feeding || dead) return;
    const qty = inventory[food.id] || 0;
    if (qty <= 0) return;

    setFeeding(true);

    const newNutrition = { ...nutrition };
    (Object.keys(food.nutrients) as NutrientKey[]).forEach(k => {
      newNutrition[k] = Math.min(MAX_NUTRIENT, newNutrition[k] + food.nutrients[k]);
    });

    const newHunger = Math.min(100, pet.hunger + food.hungerRestore);
    const newInventory = { ...inventory, [food.id]: qty - 1 };
    if (newInventory[food.id] <= 0) delete newInventory[food.id];

    const newExp = pet.experience + EXP_PER_FEED;
    const newLevel = calculateLevel(newExp);
    const updates = {
      hunger: newHunger,
      last_fed_at: new Date().toISOString(),
      nutrition: newNutrition,
      food_inventory: newInventory,
      experience: newExp,
      level: newLevel,
    };

    await supabase.from('pets').update(updates).eq('id', pet.id);
    setPet({ ...pet, ...updates });
    setPetMessage(`${food.emoji} ${food.name} 맛있다! +${EXP_PER_FEED} EXP 냠냠!`);
    setSelectedFood(null);
    setFeeding(false);
  };

  const handleRevive = async () => {
    if (!user.items.revive_potion) return;
    const newItems = { ...user.items, revive_potion: user.items.revive_potion - 1 };
    await supabase.from('profiles').update({ items: newItems }).eq('id', user.id);
    const updates = { is_dead: false, died_at: null, hunger: 50, last_fed_at: new Date().toISOString() };
    await supabase.from('pets').update(updates).eq('id', pet.id);
    setUser({ ...user, items: newItems });
    setPet({ ...pet, ...updates, died_at: undefined });
    setPetMessage('다시 살아났어요!');
  };

  const font = { fontFamily: "'Press Start 2P'" };

  return (
    <div className="w-full h-full flex flex-col animate-slide-in" style={{ background: '#fff8f0' }}>
      {/* Header */}
      <div className="w-full flex items-center gap-1 px-2 py-1">
        <button onClick={onBack} className="text-[21px] sm:text-[14px] pixel-btn px-2 py-0.5" style={{ ...font, color: 'var(--text-dark)' }}>←</button>
        <div className="flex-1 text-center py-0.5 rounded ui-panel" style={{ ...font }}>
          <span className="text-[21px] sm:text-[14px]" style={{ color: 'var(--ui-outline)' }}>식사</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-1 flex flex-col gap-[0.175rem]">
        {dead ? (
          <div className="flex flex-col items-center justify-center gap-2 py-4">
            <PixelPet isDead={true} size={56} characterSprite={getCharacterSprite(pet)} />
            <p className="text-[18px] sm:text-[12px] text-center" style={{ ...font, color: '#ff4040' }}>유령 상태!</p>
            {user.items.revive_potion > 0 ? (
              <button onClick={handleRevive} className="pixel-btn px-3 py-1.5 text-[18px] sm:text-[12px]">
                💊 부활 ({user.items.revive_potion})
              </button>
            ) : (
              <p className="text-[15px] sm:text-[10px]" style={{ ...font, color: '#a08060' }}>상점에서 포션을 구매하세요</p>
            )}
          </div>
        ) : (
          <>
            {/* Nutrition Status */}
            <div className="px-1.5 py-1 rounded-lg" style={{ background: '#fff0e0', border: '2px solid #e0c8a0' }}>
              <div className="flex justify-between items-center mb-0.5">
                <span className="text-[11px] sm:text-[7px]" style={{ ...font, color: '#805030' }}>영양</span>
                <span className="text-[12px] sm:text-[8px]" style={{
                  ...font,
                  color: nutritionStatus.status === 'good' ? '#40a040' : nutritionStatus.status === 'warning' ? '#d0a000' : '#e04040',
                }}>
                  {nutritionScore}점
                </span>
              </div>
              {(Object.keys(nutrition) as NutrientKey[]).map(k => (
                <div key={k} className="flex items-center gap-0.5 mb-0.5">
                  <span className="text-[9px] sm:text-[6px] w-14 sm:w-10 shrink-0" style={{ ...font, color: '#805030' }}>
                    {NUTRIENT_ICONS[k]}{NUTRIENT_LABELS[k]}
                  </span>
                  <div className="flex-1 h-1.5 rounded" style={{ background: '#e8dcd0', border: '1px solid #d0c0a0' }}>
                    <div className="h-full rounded" style={{
                      width: `${Math.min(100, nutrition[k])}%`,
                      background: nutrition[k] < 20 ? '#ff4040' : NUTRIENT_COLORS[k],
                      transition: 'width 0.3s',
                    }} />
                  </div>
                  <span className="text-[9px] sm:text-[6px] w-5 text-right" style={{ ...font, color: '#a08060' }}>{nutrition[k]}</span>
                </div>
              ))}
            </div>

            {/* Food Inventory */}
            <div className="p-1.5 rounded-lg" style={{ background: '#fff0e0', border: '2px solid #e0c8a0' }}>
              {availableFoods.length === 0 ? (
                <p className="text-[12px] sm:text-[8px] text-center py-2" style={{ ...font, color: '#a08060' }}>
                  음식이 없어요! 쇼핑에서 구입하세요
                </p>
              ) : (
                <div className="grid grid-cols-7 gap-0.5">
                  {availableFoods.map(food => (
                    <button
                      key={food.id}
                      onClick={() => setSelectedFood(food)}
                      className="flex flex-col items-center gap-1 p-0.5 rounded transition-all active:scale-95 min-w-0"
                      style={{
                        background: selectedFood?.id === food.id ? '#ffe0a0' : '#fffaf0',
                        border: selectedFood?.id === food.id ? '1.5px solid #d06000' : '1px solid #e0d0c0',
                      }}
                    >
                      <span className="text-[15px] sm:text-[10px] leading-none">{food.emoji}</span>
                      <span className="text-[6px] sm:text-[4px] leading-tight" style={{ ...font, color: '#d06000' }}>x{inventory[food.id]}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected food detail + feed button */}
            {selectedFood && (
              <div className="px-1.5 py-1 rounded-lg flex items-center gap-2 justify-between" style={{ background: '#ffe8c0', border: '2px solid #d0a060' }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-0">
                    <span className="text-2xl sm:text-base">{selectedFood.emoji}</span>
                    <div className="leading-tight">
                      <p className="text-[12px] sm:text-[8px]" style={{ ...font, color: '#805030' }}>{selectedFood.name}</p>
                      <p className="text-[9px] sm:text-[6px]" style={{ ...font, color: '#a08060' }}>{selectedFood.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-0.5 mt-0.5">
                    {(Object.keys(selectedFood.nutrients) as NutrientKey[])
                      .filter(k => selectedFood.nutrients[k] > 0)
                      .map(k => (
                        <span key={k} className="text-[5px] sm:text-[3px] px-0.5 py-0 rounded" style={{
                          ...font, background: NUTRIENT_COLORS[k] + '30', color: NUTRIENT_COLORS[k],
                        }}>
                          {NUTRIENT_LABELS[k]}+{selectedFood.nutrients[k]}
                        </span>
                      ))}
                  </div>
                </div>
                <button
                  onClick={() => handleFeed(selectedFood)}
                  disabled={feeding}
                  className="pixel-btn shrink-0 py-[0.2rem] px-2 text-[15px] sm:text-[10px]"
                  style={{ ...font, background: '#ffe8c0', color: '#d06000', borderColor: '#d0a060' }}
                >
                  {feeding ? '...' : '먹이기'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
