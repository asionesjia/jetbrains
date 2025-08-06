import { NextRequest, NextResponse } from 'next/server';
import xss from 'xss';
import { createClient } from "@/utils/supabase/server";
import { scanAndSyncJetbrainsInstances } from '@/lib/jetbrains-scanner';

async function handleDeleteUrl(url: string, supabase: ReturnType<typeof createClient>) {
    const filteredUrl = xss(url);
    
    try {
        // 查找并删除指定URL的记录
        const { data, error } = await supabase
            .from("jetbrains")
            .delete()
            .eq("url", filteredUrl)
            .select();

        if (error) {
            console.error('Error deleting URL:', error);
            return { success: false, message: '删除失败', error };
        }

        if (!data || data.length === 0) {
            return { success: false, message: '未找到指定URL' };
        }

        console.log(`Successfully deleted URL: ${filteredUrl}`, data);
        return { success: true, message: '删除成功', deletedCount: data.length };
    } catch (error) {
        console.error('Exception while deleting URL:', error);
        return { success: false, message: '删除过程中发生错误', error };
    }
}

async function handleUpdateStatus(id: string, status: string, supabase: ReturnType<typeof createClient>) {
    const filteredId = xss(id);
    const filteredStatus = xss(status);

    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().replace('T', ' ').substring(0, 19);

    // 首先获取当前记录的availability值
    const { data: currentRecord, error: fetchError } = await supabase
        .from("jetbrains")
        .select("availability")
        .eq("id", Number(filteredId))
        .single();

    if (fetchError) {
        console.error('Error fetching current record:', fetchError);
        return;
    }

    // 当前availability值，如果为null则设为环境变量中的初始值
    const initialScore = parseInt(process.env.INITIAL_AVAILABILITY_SCORE || '100');
    const currentAvailability = currentRecord?.availability ?? initialScore;

    if (filteredStatus === "0") {
        // 状态为0时，availability减1
        const newAvailability = currentAvailability - 1;
        
        if (newAvailability <= 0) {
            // 如果availability降到0或以下，删除该记录
            await supabase
                .from("jetbrains")
                .delete()
                .eq("id", Number(filteredId));
            console.log(`Deleted record ${filteredId} due to availability reaching 0`);
        } else {
            // 否则更新availability
            await supabase
                .from("jetbrains")
                .update({
                    updated_at: formattedDate,
                    availability: newAvailability,
                })
                .eq("id", Number(filteredId))
                .select();
        }
    }

    if (filteredStatus === "1") {
        // 状态为1时，availability加1
        const newAvailability = currentAvailability + 1;
        
        await supabase
            .from("jetbrains")
            .update({
                updated_at: formattedDate,
                availability: newAvailability
            })
            .eq("id", Number(filteredId))
            .select();
    }
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const status = searchParams.get('status');
    const url = searchParams.get('url');
    const action = searchParams.get('action');
    const supabase = createClient();

    // 处理删除URL请求
    if (url && action === 'delete') {
        const result = await handleDeleteUrl(url, supabase);
        return NextResponse.json(result, { status: result.success ? 200 : 404 });
    }

    // 处理扫描更新请求
    if (status === 'update' && !id) {
        await scanAndSyncJetbrainsInstances(supabase);
        return NextResponse.json({ message: '数据采集任务已执行完成' });
    }

    // 处理状态更新请求
    if (id && status && (status === '0' || status === '1')) {
        await handleUpdateStatus(id, status, supabase);
        return NextResponse.json({ message: '状态更新成功', id });
    }

    // 参数错误
    return NextResponse.json({ message: '参数错误', usage: '用法: ?id=ID&status=0|1 或 ?status=update 或 ?url=URL&action=delete' }, { status: 400 });
}
