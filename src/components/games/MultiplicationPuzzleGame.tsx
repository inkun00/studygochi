'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Pet } from '@/lib/types';

const ROWS = 10;
const COLS = 10;
const GAME_TIME_SEC = 5 * 60;

const DIGIT_COLORS: Record<number, string> = {
  0: '#e8d5e0',
  1: '#b8d4e8',
  2: '#c8e8c0',
  3: '#ffe8b0',
  4: '#e8c8b0',
  5: '#d0c8f0',
  6: '#e0e8c8',
  7: '#f0c8d8',
  8: '#c8e8e8',
  9: '#e8e0c8',
};
const EXPLOSION_DURATION_MS = 450;
const FALL_DELAY_MS = 280;
const FALL_DURATION_MS = 350;
const COMBO_WINDOW_MS = 3000; // 3초 안에 폭파하면 콤보
const BASE_SCORE_PER_CELL = 10;

/** 콤보 보너스 점수 (콤보 2 = 20, 3 = 45, 4 = 80, ...) */
function getComboBonus(combo: number): number {
  if (combo <= 1) return 0;
  return combo * (combo - 1) * 5;
}

function randomDigit(): number {
  return Math.floor(Math.random() * 10);
}

function isValidMultiplication(digits: number[]): boolean {
  if (digits.length < 3) return false;
  const str = digits.join('');
  for (let i = 1; i < str.length - 1; i++) {
    for (let j = i + 1; j < str.length; j++) {
      const a = parseInt(str.slice(0, i), 10);
      const b = parseInt(str.slice(i, j), 10);
      const c = parseInt(str.slice(j), 10);
      if (a * b === c) return true;
    }
  }
  return false;
}

type FallInfo = { fromRow: number }; // 블록이 떨어진 출발 행

function applyGravity(grid: number[][]): { grid: number[][]; fallMap: Map<string, FallInfo> } {
  const next = grid.map((row) => [...row]);
  const fallMap = new Map<string, FallInfo>();

  for (let c = 0; c < COLS; c++) {
    const blocksWithRow: { val: number; row: number }[] = [];
    for (let r = ROWS - 1; r >= 0; r--) {
      if (next[r][c] >= 0) blocksWithRow.push({ val: next[r][c], row: r });
    }
    const newBlocks = Math.max(0, ROWS - blocksWithRow.length);
    for (let i = 0; i < newBlocks; i++) blocksWithRow.push({ val: randomDigit(), row: -1 - i });
    for (let r = ROWS - 1; r >= 0; r--) {
      const idx = ROWS - 1 - r;
      const { val, row: fromRow } = blocksWithRow[idx];
      next[r][c] = val;
      if (fromRow >= 0 && fromRow !== r) {
        fallMap.set(`${r}-${c}`, { fromRow });
      } else if (fromRow < 0) {
        fallMap.set(`${r}-${c}`, { fromRow: fromRow });
      }
    }
  }
  return { grid: next, fallMap };
}

interface MultiplicationPuzzleGameProps {
  pet: Pet;
  onBack: () => void;
  onGameEnd: (score: number) => void;
}

function getExplodingVal(r: number, c: number, exploding: { r: number; c: number; val: number }[]): number | null {
  const e = exploding.find((x) => x.r === r && x.c === c);
  return e ? e.val : null;
}

export default function MultiplicationPuzzleGame({ pet, onBack, onGameEnd }: MultiplicationPuzzleGameProps) {
  const [grid, setGrid] = useState<number[][]>(() =>
    Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => randomDigit()))
  );
  const [selected, setSelected] = useState<{ r: number; c: number }[]>([]);
  const [explodingCells, setExplodingCells] = useState<{ r: number; c: number; val: number }[]>([]);
  const [fallMap, setFallMap] = useState<Map<string, { fromRow: number }>>(new Map());
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME_SEC);
  const [isEnded, setIsEnded] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [comboMessage, setComboMessage] = useState<{ combo: number; bonus: number } | null>(null);
  const draggingRef = useRef(false);
  const lastExplodeTimeRef = useRef(0);
  const comboCountRef = useRef(0);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEnded) return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setIsEnded(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isEnded]);

  useEffect(() => {
    if (isEnded) onGameEnd(score);
  }, [isEnded, score, onGameEnd]);

  const getNeighbors = useCallback((r: number, c: number) => {
    const n: { r: number; c: number }[] = [];
    for (const [dr, dc] of [
      [-1, 0], [1, 0], [0, -1], [0, 1],
      [-1, -1], [-1, 1], [1, -1], [1, 1],
    ]) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) n.push({ r: nr, c: nc });
    }
    return n;
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, r: number, c: number) => {
      if (isEnded || isBusy || grid[r][c] < 0) return;
      draggingRef.current = true;
      setSelected([{ r, c }]);
      gridRef.current?.setPointerCapture?.(e.pointerId);
    },
    [isEnded, isBusy, grid]
  );

  const addCellToSelection = useCallback(
    (r: number, c: number) => {
      if (!draggingRef.current || isBusy || grid[r][c] < 0) return;
      setSelected((prev) => {
        const last = prev[prev.length - 1];
        if (!last) return [{ r, c }];
        const neighbors = getNeighbors(last.r, last.c);
        const isAdjacent = neighbors.some((n) => n.r === r && n.c === c);
        if (!isAdjacent) return prev;
        const already = prev.some((p) => p.r === r && p.c === c);
        if (already) return prev;
        return [...prev, { r, c }];
      });
    },
    [grid, getNeighbors, isBusy]
  );

  const handlePointerEnter = addCellToSelection;

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingRef.current) return;
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const data = el?.getAttribute('data-cell');
      if (data) {
        const [r, c] = data.split('-').map(Number);
        if (!isNaN(r) && !isNaN(c)) addCellToSelection(r, c);
      }
    },
    [addCellToSelection]
  );

  const handlePointerUp = useCallback((e?: React.PointerEvent) => {
    draggingRef.current = false;
    if (e?.pointerId != null) gridRef.current?.releasePointerCapture?.(e.pointerId);
    if (selected.length < 3 || isBusy) {
      setSelected([]);
      return;
    }
    const digits = selected.map((s) => grid[s.r][s.c]).filter((v) => v >= 0);
    if (!isValidMultiplication(digits)) {
      setSelected([]);
      return;
    }
    const toExplode = selected.map((s) => ({ r: s.r, c: s.c, val: grid[s.r][s.c] }));

    const now = Date.now();
    const isCombo = now - lastExplodeTimeRef.current <= COMBO_WINDOW_MS;
    const combo = isCombo ? comboCountRef.current + 1 : 1;
    comboCountRef.current = combo;
    lastExplodeTimeRef.current = now;

    const baseScore = digits.length * BASE_SCORE_PER_CELL;
    const bonusScore = getComboBonus(combo);
    const totalScore = baseScore + bonusScore;

    setExplodingCells(toExplode);
    setScore((s) => s + totalScore);
    setSelected([]);
    setIsBusy(true);

    if (combo > 1) {
      setComboMessage({ combo, bonus: bonusScore });
      setTimeout(() => setComboMessage(null), 1500);
    }

    setTimeout(() => {
      setGrid((g) => {
        const next = g.map((row) => row.map((v) => v));
        for (const { r, c } of toExplode) {
          next[r][c] = -1;
        }
        return next;
      });
      setExplodingCells([]);
    }, EXPLOSION_DURATION_MS);

    setTimeout(() => {
      setGrid((g) => {
        const { grid: next, fallMap: newFallMap } = applyGravity(g);
        setFallMap(newFallMap);
        setTimeout(() => setFallMap(new Map()), FALL_DURATION_MS);
        return next;
      });
      setIsBusy(false);
    }, EXPLOSION_DURATION_MS + FALL_DELAY_MS);
  }, [selected, grid, isBusy]);

  useEffect(() => {
    const up = (ev: PointerEvent) => {
      handlePointerUp(ev as unknown as React.PointerEvent);
    };
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [handlePointerUp]);

  const isSelected = (r: number, c: number) => selected.some((s) => s.r === r && s.c === c);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full h-full flex flex-col animate-slide-in" style={{ background: '#e8e0d8' }}>
      <div className="flex items-center justify-between p-2 shrink-0" style={{ background: '#d0c8c0' }}>
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="text-[12px] p-1"
            style={{ fontFamily: "'Press Start 2P'", color: '#805030' }}
          >
            ←
          </button>
          <button
            onClick={() => setShowHowToPlay(true)}
            className="text-[8px] px-2 py-1 rounded shrink-0"
            style={{ fontFamily: "'Press Start 2P'", background: '#c0a0ff', color: '#fff' }}
          >
            게임 방법
          </button>
        </div>
        <div className="flex gap-4">
          <span className="text-[10px]" style={{ fontFamily: "'Press Start 2P'", color: '#2a2035' }}>
            점수: {score}
          </span>
          <span className="text-[10px]" style={{ fontFamily: "'Press Start 2P'", color: isEnded ? '#c03030' : '#2a2035' }}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>
      {comboMessage && (
        <div
          className="absolute left-1/2 top-1/3 -translate-x-1/2 z-10 animate-combo-pop"
          style={{ fontFamily: "'Press Start 2P'" }}
        >
          <p className="text-[14px] text-center" style={{ color: '#ffd000', textShadow: '0 0 8px #ff8040' }}>
            {comboMessage.combo} COMBO!
          </p>
          <p className="text-[10px] text-center mt-1" style={{ color: '#40ff40' }}>
            +{comboMessage.bonus} 보너스
          </p>
        </div>
      )}
      <div className="flex-1 flex items-center justify-center p-2 overflow-hidden">
        <div
          ref={gridRef}
          onPointerMove={handlePointerMove}
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            gridTemplateRows: `repeat(${ROWS}, 1fr)`,
            aspectRatio: `${COLS}/${ROWS}`,
            maxWidth: 'min(92vw, 92vmin)',
            maxHeight: '100%',
            width: 'min(92vw, 92vmin)',
            transform: 'translateY(-5px)',
            touchAction: 'none',
          }}
        >
          {grid.map((row, r) =>
            row.map((val, c) => {
              const explodeVal = getExplodingVal(r, c, explodingCells);
              const exploding = explodeVal !== null;
              const fallInfo = fallMap.get(`${r}-${c}`);
              const showBlock = val >= 0 || exploding;
              const displayVal = exploding ? explodeVal : val;
              const digitColor = displayVal >= 0 ? DIGIT_COLORS[displayVal] ?? '#f0e8e0' : '#f0e8e0';
              const borderColor = exploding ? '#ff6020' : isSelected(r, c) ? '#d0a030' : `${digitColor}88`;
              const bg = !showBlock ? '#c0b8b0' : exploding ? '#ff8040' : isSelected(r, c) ? '#ffd050' : digitColor;
              const fallFrom = fallInfo ? (fallInfo.fromRow < 0 ? -8 : fallInfo.fromRow - r) : 0;
              return (
                <div
                  key={`${r}-${c}`}
                  data-cell={`${r}-${c}`}
                  onPointerDown={(e) => handlePointerDown(e, r, c)}
                  onPointerEnter={() => handlePointerEnter(r, c)}
                  className={`flex items-center justify-center select-none touch-none ${exploding ? 'block-explode' : ''} ${fallInfo ? 'block-fall' : ''}`}
                  style={{
                    background: bg,
                    border: `2px solid ${borderColor}`,
                    borderRadius: 0,
                    ['--fall-from' as string]: fallInfo ? `${fallFrom * 100}%` : undefined,
                    fontSize: 'clamp(12px, 4vw, 20px)',
                    fontFamily: "'Press Start 2P'",
                    color: showBlock ? '#2a2035' : 'transparent',
                    boxShadow: exploding ? '0 0 12px #ff8040' : undefined,
                  }}
                >
                  {showBlock && displayVal >= 0 ? displayVal : ''}
                </div>
              );
            })
          )}
        </div>
      </div>
      {showHowToPlay && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center p-4 z-20"
          style={{ background: 'rgba(0,0,0,0.65)' }}
          onClick={() => setShowHowToPlay(false)}
        >
          <div
            className="max-w-sm w-full p-4 rounded-lg"
            style={{ background: '#fff8f0', border: '3px solid #c0a0ff', fontFamily: "'Press Start 2P'" }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[12px] font-bold mb-3" style={{ color: '#2a2035' }}>
              게임 방법
            </p>
            <div className="text-[8px] space-y-2 mb-4" style={{ color: '#805030', lineHeight: 1.6 }}>
              <p>• 숫자를 하나씩 터치해 선택</p>
              <p>• 가로, 세로, 대각선으로 숫자를 드래그해서 3개 이상 연속 선택된 숫자들이 곱셈식이 되면 폭파</p>
              <p>• 폭파된 수만큼 점수 획득 (5분 제한)</p>
            </div>
            <button
              onClick={() => setShowHowToPlay(false)}
              className="w-full py-2 rounded text-[10px]"
              style={{ background: '#c0a0ff', color: '#fff' }}
            >
              확인
            </button>
          </div>
        </div>
      )}
      {isEnded && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)' }}
        >
          <p className="text-[14px] mb-2" style={{ fontFamily: "'Press Start 2P'", color: '#fff' }}>
            게임 종료!
          </p>
          <p className="text-[12px] mb-4" style={{ fontFamily: "'Press Start 2P'", color: '#ffe080' }}>
            최종 점수: {score}
          </p>
          <button
            onClick={onBack}
            className="px-4 py-2 rounded"
            style={{ fontFamily: "'Press Start 2P'", background: '#4080ff', color: '#fff' }}
          >
            확인
          </button>
        </div>
      )}
    </div>
  );
}
