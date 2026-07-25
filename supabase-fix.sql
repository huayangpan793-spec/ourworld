-- ==========================================
-- 重建 memories 表（使用驼峰命名，无需映射）
-- ==========================================

-- 删除旧表（会丢失数据，刷新页面后会自动从本地重新同步）
DROP TABLE IF EXISTS memories;

-- 重新建表，列名与 JavaScript Memory 接口完全一致
CREATE TABLE memories (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT DEFAULT '',
  content TEXT DEFAULT '',
  author TEXT DEFAULT '花',
  date TEXT NOT NULL,
  time TEXT,
  locationName TEXT DEFAULT '',
  city TEXT,
  country TEXT,
  latitude DOUBLE PRECISION DEFAULT 0,
  longitude DOUBLE PRECISION DEFAULT 0,
  photos TEXT[] DEFAULT '{}',
  coverPhoto TEXT DEFAULT '',
  photoCaptions TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  importance INTEGER DEFAULT 2,
  memoryType TEXT DEFAULT 'travel',
  visitedStatus TEXT DEFAULT 'visited',
  anniversary BOOLEAN DEFAULT false,
  color TEXT DEFAULT 'venus',
  music TEXT,
  voiceRecord TEXT,
  createdAt TIMESTAMPTZ DEFAULT NOW(),
  updatedAt TIMESTAMPTZ DEFAULT NOW(),
  unlockDate TEXT,
  isHidden BOOLEAN DEFAULT false
);

-- 授权
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read memories" ON memories FOR SELECT USING (true);
CREATE POLICY "Anyone can insert memories" ON memories FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update memories" ON memories FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete memories" ON memories FOR DELETE USING (true);
