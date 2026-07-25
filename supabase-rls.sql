-- ==========================================
-- 记忆表 RLS 策略（允许 anon key 读写）
-- ==========================================

-- 启用行级安全（如果还没启用）
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

-- 允许任何人读取记忆（通过密码门保护）
DROP POLICY IF EXISTS "Anyone can read memories" ON memories;
CREATE POLICY "Anyone can read memories"
  ON memories FOR SELECT
  USING (true);

-- 允许任何人插入记忆
DROP POLICY IF EXISTS "Anyone can insert memories" ON memories;
CREATE POLICY "Anyone can insert memories"
  ON memories FOR INSERT
  WITH CHECK (true);

-- 允许任何人更新记忆
DROP POLICY IF EXISTS "Anyone can update memories" ON memories;
CREATE POLICY "Anyone can update memories"
  ON memories FOR UPDATE
  USING (true);

-- 允许任何人删除记忆
DROP POLICY IF EXISTS "Anyone can delete memories" ON memories;
CREATE POLICY "Anyone can delete memories"
  ON memories FOR DELETE
  USING (true);
