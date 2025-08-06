-- 创建数据库模式
CREATE SCHEMA IF NOT EXISTS public;

-- 创建 cookies 表（使用TEXT类型存储cookie字符串）
CREATE TABLE public.cookies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform TEXT NOT NULL,
    cookies TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建 jetbrains 表
CREATE TABLE public.jetbrains (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL,
    availability INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引优化查询性能
CREATE INDEX idx_jetbrains_url ON public.jetbrains(url);
CREATE INDEX idx_jetbrains_availability ON public.jetbrains(availability);
CREATE INDEX idx_jetbrains_updated_at ON public.jetbrains(updated_at);
CREATE INDEX idx_cookies_created_at ON public.cookies(created_at);
CREATE INDEX idx_cookies_platform ON public.cookies(platform);

-- 为 jetbrains 表添加 URL 唯一约束
ALTER TABLE public.jetbrains ADD CONSTRAINT unique_jetbrains_url UNIQUE (url);

-- 为 cookies 表添加平台唯一约束（每个平台只保存一条最新的cookie）
ALTER TABLE public.cookies ADD CONSTRAINT unique_cookies_platform UNIQUE (platform);

-- 启用行级安全 (RLS)
ALTER TABLE public.cookies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jetbrains ENABLE ROW LEVEL SECURITY;

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为 jetbrains 表创建触发器，自动更新 updated_at 字段
CREATE TRIGGER update_jetbrains_updated_at
    BEFORE UPDATE ON public.jetbrains
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 创建基本的 RLS 策略（根据需要调整）
CREATE POLICY "Enable read access for all users" ON public.jetbrains
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON public.jetbrains
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON public.jetbrains
    FOR UPDATE USING (true);

CREATE POLICY "Enable read access for cookies" ON public.cookies
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for cookies" ON public.cookies
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for cookies" ON public.cookies
    FOR UPDATE USING (true);
