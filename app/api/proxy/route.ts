import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 });
    }

    // 检查URL是否在数据库中存在
    const supabase = createClient();
    const { data: existingServer, error: dbError } = await supabase
        .from('jetbrains')
        .select('id, url')
        .eq('url', url)
        .single();

    if (dbError || !existingServer) {
        // URL不在数据库中，直接返回未找到
        return NextResponse.json({ error: 'URL not found in database' }, { status: 404 });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 设置6秒超时

    try {
        const response = await fetch(url, {
            method: 'HEAD', // 使用HEAD请求，只获取响应头，不获取响应体
            signal: controller.signal,
            redirect: "manual"
        });
        clearTimeout(timeoutId); // 请求成功后清除超时

        // 只返回连接状态，不需要响应体数据
        const proxyResponse = NextResponse.json({ 
            status: response.status,
            statusText: response.statusText,
            connected: response.ok 
        });
        proxyResponse.headers.set('Access-Control-Allow-Origin', '*'); // 设置CORS头
        proxyResponse.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS');
        proxyResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type');

        return proxyResponse;
    } catch (error) {
        clearTimeout(timeoutId);
        return NextResponse.json({ 
            error: 'Failed to connect to URL',
            connected: false 
        }, { status: 500 });
    }
}

export async function OPTIONS() {
    const res = NextResponse.json({}, { status: 200 });
    res.headers.set('Access-Control-Allow-Origin', '*');
    res.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return res;
}
