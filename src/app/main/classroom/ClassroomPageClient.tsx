'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useStore } from '@/store/useStore';

interface Classroom { id: string; name: string; teacher_id: string; code: string; created_at: string; }

export default function ClassroomPageClient() {
  const supabase = createClient();
  const { user } = useStore();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [joinCode, setJoinCode] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isTeacher = user?.role === 'teacher';

  useEffect(() => {
    const fetch = async () => {
      if (!user) return;
      if (isTeacher) {
        const { data } = await supabase.from('classrooms').select('*').eq('teacher_id', user.id);
        if (data) setClassrooms(data);
      } else {
        const { data } = await supabase.from('classroom_members').select('classroom_id').eq('user_id', user.id);
        if (data?.length) {
          const { data: rooms } = await supabase.from('classrooms').select('*').in('id', data.map(d => d.classroom_id));
          if (rooms) setClassrooms(rooms);
        }
      }
    };
    fetch();
  }, [user, isTeacher, supabase]);

  const handleCreate = useCallback(async () => {
    if (!user || !newRoomName.trim()) return;
    setIsLoading(true);
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { data } = await supabase.from('classrooms').insert({ name: newRoomName.trim(), teacher_id: user.id, code }).select().single();
    if (data) { setClassrooms(prev => [...prev, data]); setNewRoomName(''); }
    setIsLoading(false);
  }, [user, newRoomName, supabase]);

  const handleJoin = useCallback(async () => {
    if (!user || !joinCode.trim()) return;
    setIsLoading(true);
    const { data: room } = await supabase.from('classrooms').select('*').eq('code', joinCode.trim().toUpperCase()).single();
    if (room) {
      await supabase.from('classroom_members').insert({ classroom_id: room.id, user_id: user.id });
      setClassrooms(prev => [...prev, room]); setJoinCode('');
    }
    setIsLoading(false);
  }, [user, joinCode, supabase]);

  if (!user) return null;

  return (
    <div className="flex flex-col gap-2">
      {isTeacher ? (
        <div className="flex gap-1">
          <input value={newRoomName} onChange={e => setNewRoomName(e.target.value)} placeholder="교실명"
            className="flex-1 p-1.5 rounded text-[12px]"
            style={{ fontFamily: "'Press Start 2P'", border: '2px solid #e0c8a0', background: '#fff', color: '#805030', outline: 'none' }} />
          <button onClick={handleCreate} disabled={isLoading || !newRoomName.trim()}
            className="pixel-btn px-2 py-1 text-[10px] disabled:opacity-40"
            style={{ fontFamily: "'Press Start 2P'", background: '#c0e0ff', color: '#3060a0', borderColor: '#6090c0' }}>
            만들기
          </button>
        </div>
      ) : (
        <div className="flex gap-1">
          <input value={joinCode} onChange={e => setJoinCode(e.target.value)} placeholder="초대코드" maxLength={6}
            className="flex-1 p-1.5 rounded text-[12px] uppercase text-center"
            style={{ fontFamily: "'Press Start 2P'", border: '2px solid #e0c8a0', background: '#fff', color: '#805030', outline: 'none' }} />
          <button onClick={handleJoin} disabled={isLoading || !joinCode.trim()}
            className="pixel-btn px-2 py-1 text-[10px] disabled:opacity-40"
            style={{ fontFamily: "'Press Start 2P'", background: '#c0ffc0', color: '#308030', borderColor: '#60a060' }}>
            입장
          </button>
        </div>
      )}

      {classrooms.length > 0 ? (
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {classrooms.map(room => (
            <div key={room.id} className="p-2 rounded-lg flex justify-between items-center"
              style={{ background: '#fff0e0', border: '2px solid #e0c8a0' }}>
              <div>
                <p className="text-[12px]" style={{ fontFamily: "'Press Start 2P'", color: '#805030' }}>{room.name}</p>
              </div>
              <span className="text-[12px] px-1.5 py-0.5 rounded" style={{ fontFamily: "'Press Start 2P'", background: '#e8dcd0', color: '#805030' }}>
                {room.code}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[10px] text-center py-4" style={{ fontFamily: "'Press Start 2P'", color: '#a08060' }}>
          {isTeacher ? '교실을 만들어보세요!' : '코드를 입력하세요!'}
        </p>
      )}
    </div>
  );
}
