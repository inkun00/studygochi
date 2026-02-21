-- 사용자가 본인 study_logs 삭제 허용
CREATE POLICY "Users can delete own study_logs" ON study_logs
  FOR DELETE USING (auth.uid() = user_id);
