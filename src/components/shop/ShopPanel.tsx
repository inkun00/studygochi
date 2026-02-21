'use client';

import { SHOP_ITEMS, POINT_PACKAGES } from '@/lib/constants';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { ShoppingBag, Star, Package } from 'lucide-react';

interface ShopPanelProps {
  points: number;
  items: { revive_potion: number; cheat_sheet: number };
  onBuyItem: (itemId: 'revive_potion' | 'cheat_sheet') => Promise<void>;
  onBuyPoints: (packageId: string) => void;
  isLoading: boolean;
}

export default function ShopPanel({
  points,
  items,
  onBuyItem,
  onBuyPoints,
  isLoading,
}: ShopPanelProps) {
  return (
    <div className="space-y-4 w-full">
      {/* Point Balance */}
      <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star size={20} className="text-amber-500" />
            <span className="font-bold text-gray-800">내 포인트</span>
          </div>
          <span className="text-2xl font-bold text-amber-600">
            {points.toLocaleString()}P
          </span>
        </div>
      </Card>

      {/* Items Shop */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <ShoppingBag size={20} className="text-emerald-500" />
          <h3 className="font-bold text-gray-800">아이템 상점</h3>
        </div>

        <div className="space-y-3">
          {(Object.entries(SHOP_ITEMS) as [keyof typeof SHOP_ITEMS, typeof SHOP_ITEMS[keyof typeof SHOP_ITEMS]][]).map(
            ([key, item]) => (
              <div
                key={key}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.emoji}</span>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">{item.description}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      보유: {items[key]}개
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => onBuyItem(key)}
                  disabled={points < item.price || isLoading}
                >
                  {item.price}P
                </Button>
              </div>
            )
          )}
        </div>
      </Card>

      {/* Point Packages */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Package size={20} className="text-purple-500" />
          <h3 className="font-bold text-gray-800">포인트 충전</h3>
        </div>

        <div className="space-y-2">
          {POINT_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className="flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-100"
            >
              <div>
                <p className="font-semibold text-gray-800 text-sm">
                  ⭐ {pkg.label}
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onBuyPoints(pkg.id)}
                disabled={isLoading}
              >
                ₩{pkg.price.toLocaleString()}
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
