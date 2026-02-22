'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import type { CharacterSprite } from '@/lib/types';
import { SPRITE_SHEET_MAP, SPRITE_ROW_MAP, FRAME_IDLE_FRONT_MAP, FRAME_IDLE_BACK_MAP } from '@/lib/pet-constants';

interface WalkingPetProps {
  isDead: boolean;
  characterSprite?: CharacterSprite;
  size?: number;
  floatingEmoji?: ReactNode;
  /** 터치 시 앞을 보게 할 트리거 (변경될 때마다 face front + idle) */
  faceFrontTrigger?: number;
}

const COLS = 4;
const BOUND_LEFT = 12;
const BOUND_RIGHT = 88;
const Y_MIN = 64;  // 44 + 20 (상단 20p 내려 벽 넘어감 방지)
const Y_MAX = 95;  // 하단

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function randInt(min: number, max: number) {
  return Math.floor(rand(min, max + 1));
}

export default function WalkingPet({ isDead, characterSprite = 'rabbit', size = 48, floatingEmoji, faceFrontTrigger = 0 }: WalkingPetProps) {
  const [pos, setPos] = useState({ x: 50, y: 78 });
  const [dir, setDir] = useState<'left' | 'right'>('right');
  const [frame, setFrame] = useState(0);
  const [isIdle, setIsIdle] = useState(false);
  const dirRef = useRef(dir);
  const idleUntilRef = useRef(0);
  const idleFaceRef = useRef<'front' | 'back' | 'left' | 'right'>('right');
  const idleFrameTickRef = useRef(0);
  const targetXRef = useRef<number | null>(null);
  const targetYRef = useRef<number | null>(null);
  const verticalDirRef = useRef<'up' | 'down' | null>(null);
  const lastTickNowRef = useRef(0);
  dirRef.current = dir;

  useEffect(() => {
    if (faceFrontTrigger <= 0) return;
    idleFaceRef.current = 'front';
    idleUntilRef.current = lastTickNowRef.current + 4000;
    setIsIdle(true);
  }, [faceFrontTrigger]);

  const sheet = SPRITE_SHEET_MAP[characterSprite];
  const rows = SPRITE_ROW_MAP[characterSprite];
  const frameFront = FRAME_IDLE_FRONT_MAP[characterSprite];
  const frameBack = FRAME_IDLE_BACK_MAP[characterSprite];
  const getBgPos = () => {
    if (!isIdle) {
      // 위/아래 이동 시 back(위) 또는 front(아래) 스프라이트
      const vDir = verticalDirRef.current;
      if (vDir === 'up') {
        const cell = frameBack[frame % frameBack.length];
        return { x: -cell.c * size, y: -cell.r * size };
      }
      if (vDir === 'down') {
        const cell = frameFront[frame % frameFront.length];
        return { x: -cell.c * size, y: -cell.r * size };
      }
      const r = dir === 'right' ? rows.rowRight : rows.rowLeft;
      return { x: -(frame % COLS) * size, y: -r * size };
    }
    switch (idleFaceRef.current) {
      case 'front': {
        const cell = frameFront[frame % frameFront.length];
        return { x: -cell.c * size, y: -cell.r * size };
      }
      case 'back': {
        const cell = frameBack[frame % frameBack.length];
        return { x: -cell.c * size, y: -cell.r * size };
      }
      case 'left':
      case 'right': {
        const r = idleFaceRef.current === 'right' ? rows.rowIdleRight : rows.rowIdleLeft;
        return { x: -(frame % COLS) * size, y: -r * size };
      }
    }
  };
  const { x: bgPosX, y: bgPosY } = getBgPos();
  const topOffset = rows.topOffset ?? 0;
  const bounceY = !isIdle ? (frame % 4 === 1 ? 2 : frame % 4 === 3 ? -1 : 0) : 0;

  useEffect(() => {
    const TICK = 80;
    let now = 0;

    const tid = setInterval(() => {
      now += TICK;
      lastTickNowRef.current = now;

      if (idleUntilRef.current > now) {
        setIsIdle(true);
        idleFrameTickRef.current += 1;
        if (idleFrameTickRef.current >= 5) {
          idleFrameTickRef.current = 0;
          const idleFrames = Math.max(COLS, frameFront.length, frameBack.length);
          setFrame(f => (f + 1) % idleFrames);
        }
        return;
      }

      setIsIdle(false);
      idleFrameTickRef.current = 0;

      let moveDir = dirRef.current;
      const t = targetXRef.current;
      const tY = targetYRef.current;

      if (t !== null || tY !== null) {
        setPos(p => {
          let nx = p.x;
          let ny = p.y;
          verticalDirRef.current = null;

          if (t !== null) {
            const distX = Math.abs(t - p.x);
            const stepX = rand(0.2, 0.5);
            if (distX < stepX) {
              nx = t;
              targetXRef.current = null;
            } else {
              nx = p.x + (t > p.x ? stepX : -stepX);
              moveDir = t > p.x ? 'right' : 'left';
              setDir(moveDir);
              dirRef.current = moveDir;
            }
          } else {
            const stepX = moveDir === 'right' ? rand(0.25, 0.55) : -rand(0.25, 0.55);
            nx = Math.max(BOUND_LEFT, Math.min(BOUND_RIGHT, p.x + stepX));
          }

          if (tY !== null) {
            const distY = Math.abs(tY - p.y);
            const stepY = rand(0.15, 0.4);
            if (distY < stepY) {
              ny = tY;
              targetYRef.current = null;
            } else {
              ny = p.y + (tY > p.y ? stepY : -stepY);
              verticalDirRef.current = tY > p.y ? 'down' : 'up';
            }
            ny = Math.max(Y_MIN, Math.min(Y_MAX, ny));
          } else {
            ny = p.y + rand(-0.08, 0.08);
            ny = Math.max(Y_MIN, Math.min(Y_MAX, ny));
          }

          return { x: nx, y: ny };
        });
      } else {
        if (Math.random() < 0.06) {
          targetXRef.current = rand(BOUND_LEFT + 5, BOUND_RIGHT - 5);
        }
        if (Math.random() < 0.05) {
          targetYRef.current = rand(Y_MIN + 3, Y_MAX - 3);
        }
        if (targetXRef.current === null && Math.random() < 0.1) {
          moveDir = moveDir === 'right' ? 'left' : 'right';
          setDir(moveDir);
          dirRef.current = moveDir;
        }

        const speed = rand(0.25, 0.55);
        setPos(p => {
          const step = moveDir === 'right' ? speed : -speed;
          let nx = Math.max(BOUND_LEFT, Math.min(BOUND_RIGHT, p.x + step));

          if (nx <= BOUND_LEFT) {
            setDir('right');
            dirRef.current = 'right';
          }
          if (nx >= BOUND_RIGHT) {
            setDir('left');
            dirRef.current = 'left';
          }

          let ny = p.y;
          const vy = targetYRef.current;
          if (vy !== null) {
            const stepY = rand(0.15, 0.4);
            ny = p.y + (vy > p.y ? stepY : -stepY);
            verticalDirRef.current = vy > p.y ? 'down' : 'up';
          } else if (Math.random() < 0.06) {
            ny = rand(Y_MIN, Y_MAX);
          } else {
            ny = p.y + rand(-0.15, 0.15);
          }
          ny = Math.max(Y_MIN, Math.min(Y_MAX, ny));

          return { x: nx, y: ny };
        });
      }

      if (Math.random() < 0.07) {
        idleUntilRef.current = now + randInt(3000, 8000);
        const faces: Array<'front' | 'back' | 'left' | 'right'> = ['front', 'back', 'left', 'right'];
        idleFaceRef.current = faces[Math.floor(Math.random() * faces.length)];
      }

      setFrame(f => (f + 1) % COLS);
    }, TICK);
    return () => clearInterval(tid);
  }, [characterSprite]);

  if (isDead) return null;

  return (
    <div
      className="absolute z-10 flex flex-col items-center overflow-visible"
      style={{ left: `${pos.x}%`, top: `${pos.y}%`, width: size, height: size, transform: `translate(-50%, calc(-50% + ${bounceY}px))` }}
    >
      {/* 터치 시 상태 풍선 - 캐릭터 머리 바로 위 (overflow-visible로 팝업이 잘리지 않음) */}
      {floatingEmoji && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-0.5 z-[30]" style={{ pointerEvents: 'none' }}>
          {floatingEmoji}
        </div>
      )}
      <div
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          backgroundImage: `url(${sheet})`,
          backgroundPosition: `${bgPosX}px ${bgPosY - topOffset}px`,
          backgroundSize: `${COLS * size}px ${rows.totalRows * size}px`,
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
}
