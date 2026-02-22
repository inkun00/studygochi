const STORAGE_PREFIX = 'studygochi_play_';
const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24시간

function getStorageKey(petId: string, gameId: string): string {
  return `${STORAGE_PREFIX}${petId}_${gameId}`;
}

/** 마지막 플레이 시각 (ms) 반환. 없으면 null */
export function getLastPlayedAt(petId: string, gameId: string): number | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(getStorageKey(petId, gameId));
  if (!raw) return null;
  const ts = new Date(raw).getTime();
  return isNaN(ts) ? null : ts;
}

/** 게임 플레이 기록 저장 */
export function recordGamePlay(petId: string, gameId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getStorageKey(petId, gameId), new Date().toISOString());
}

/** 24시간 쿨다운 경과 여부. true면 플레이 가능 */
export function canPlayGame(petId: string, gameId: string): boolean {
  const last = getLastPlayedAt(petId, gameId);
  if (!last) return true;
  return Date.now() - last >= COOLDOWN_MS;
}

/** 남은 쿨다운(ms). 0이면 플레이 가능 */
export function getRemainingCooldownMs(petId: string, gameId: string): number {
  const last = getLastPlayedAt(petId, gameId);
  if (!last) return 0;
  const elapsed = Date.now() - last;
  return Math.max(0, COOLDOWN_MS - elapsed);
}

/** 남은 시간을 "X시간 Y분" 형태로 반환 */
export function formatRemainingCooldown(ms: number): string {
  if (ms <= 0) return '';
  const hours = Math.floor(ms / (60 * 60 * 1000));
  const mins = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  if (hours > 0) return `${hours}시간 ${mins}분`;
  if (mins > 0) return `${mins}분`;
  return '곧 가능';
}
