import { NextRequest, NextResponse } from 'next/server';
import { createClient } from "@/utils/supabase/server";
import { scanAndSyncJetbrainsInstances } from '@/lib/jetbrains-scanner';

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const supabase = createClient();
        await scanAndSyncJetbrainsInstances(supabase);
        
        return NextResponse.json({ 
            message: 'JetBrains instances scan completed successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Cron job failed:', error);
        return NextResponse.json({ 
            error: 'Scan failed',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}