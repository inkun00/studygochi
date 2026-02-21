'use client';

import { ReactNode } from 'react';

interface EggDeviceProps {
  children: ReactNode;
  title?: string;
  onButton1?: () => void;
  onButton2?: () => void;
  onButton3?: () => void;
}

export default function EggDevice({
  children,
  title = 'STUDYGOTCHI',
  onButton1,
  onButton2,
  onButton3,
}: EggDeviceProps) {
  return (
    <div
      className="h-dvh min-h-dvh w-full flex items-center justify-center overflow-hidden p-0 sm:p-1 box-border"
      style={{ background: 'linear-gradient(135deg, #ffd8e8 0%, #e8d8ff 50%, #d8f0ff 100%)' }}
    >
      {/* 게임기 콘솔 - 스마트폰: 화면 꽉 채움 / 데스크톱: 여유 있게 */}
      <div
        className="relative flex flex-col items-center justify-center shrink-0 egg-console"
        style={{
          backgroundImage: 'url(/sprites/ui/console_gameboy.png)',
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated',
        }}
      >
        {/* 화면 영역 - 5px 왼쪽 이동 */}
        <div
          className="absolute overflow-hidden"
          style={{
            top: 'calc(15% - 2px)',
            left: 'calc(10% - 10px)',
            width: 'calc(79% + 5px)',
            height: 'calc(55% + 13px)',
            background: '#fff8f0',
            borderRadius: '4px',
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.12)',
            border: '2px solid #e8a0b0',
          }}
        >
          {children}
        </div>

        {/* 하단 버튼 - 모바일: 2배 크기+10px 위 / 데스크톱: 기본 */}
        <div className="absolute left-0 right-0 flex justify-center items-center gap-4 sm:gap-2 bottom-[72px] sm:bottom-[62px]" style={{ marginLeft: '-20px' }}>
          <button
            data-testid="egg-btn-1"
            onClick={onButton1}
            className="transition-transform active:scale-95 bg-transparent border-none cursor-pointer w-14 h-14 sm:w-7 sm:h-7"
            style={{
              backgroundImage: 'url(/sprites/ui/Buttons/Button%203/1.PNG)',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              imageRendering: 'pixelated',
            }}
            onMouseDown={(e) => { e.currentTarget.style.backgroundImage = 'url(/sprites/ui/Buttons/Button%203/2.PNG)'; }}
            onMouseUp={(e) => { e.currentTarget.style.backgroundImage = 'url(/sprites/ui/Buttons/Button%203/1.PNG)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundImage = 'url(/sprites/ui/Buttons/Button%203/1.PNG)'; }}
            onTouchStart={(e) => { e.currentTarget.style.backgroundImage = 'url(/sprites/ui/Buttons/Button%203/2.PNG)'; }}
            onTouchEnd={(e) => { e.currentTarget.style.backgroundImage = 'url(/sprites/ui/Buttons/Button%203/1.PNG)'; }}
          />
          <button
            data-testid="egg-btn-2"
            onClick={onButton2}
            className="transition-transform active:scale-95 bg-transparent border-none cursor-pointer w-16 h-16 sm:w-8 sm:h-8"
            style={{
              backgroundImage: 'url(/sprites/ui/Buttons/Button%202/1.PNG)',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              imageRendering: 'pixelated',
            }}
            onMouseDown={(e) => { e.currentTarget.style.backgroundImage = 'url(/sprites/ui/Buttons/Button%202/2.PNG)'; }}
            onMouseUp={(e) => { e.currentTarget.style.backgroundImage = 'url(/sprites/ui/Buttons/Button%202/1.PNG)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundImage = 'url(/sprites/ui/Buttons/Button%202/1.PNG)'; }}
            onTouchStart={(e) => { e.currentTarget.style.backgroundImage = 'url(/sprites/ui/Buttons/Button%202/2.PNG)'; }}
            onTouchEnd={(e) => { e.currentTarget.style.backgroundImage = 'url(/sprites/ui/Buttons/Button%202/1.PNG)'; }}
          />
          <button
            data-testid="egg-btn-3"
            onClick={onButton3}
            className="transition-transform active:scale-95 bg-transparent border-none cursor-pointer w-14 h-14 sm:w-7 sm:h-7"
            style={{
              backgroundImage: 'url(/sprites/ui/Buttons/Button%203/1.PNG)',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              imageRendering: 'pixelated',
            }}
            onMouseDown={(e) => { e.currentTarget.style.backgroundImage = 'url(/sprites/ui/Buttons/Button%203/2.PNG)'; }}
            onMouseUp={(e) => { e.currentTarget.style.backgroundImage = 'url(/sprites/ui/Buttons/Button%203/1.PNG)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundImage = 'url(/sprites/ui/Buttons/Button%203/1.PNG)'; }}
            onTouchStart={(e) => { e.currentTarget.style.backgroundImage = 'url(/sprites/ui/Buttons/Button%203/2.PNG)'; }}
            onTouchEnd={(e) => { e.currentTarget.style.backgroundImage = 'url(/sprites/ui/Buttons/Button%203/1.PNG)'; }}
          />
        </div>
      </div>
    </div>
  );
}
