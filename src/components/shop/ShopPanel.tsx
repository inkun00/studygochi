'use client';

import Card from '@/components/ui/Card';
import { Star } from 'lucide-react';

interface ShopPanelProps {
  points: number;
}

export default function ShopPanel({ points }: ShopPanelProps) {
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
    </div>
  );
}
