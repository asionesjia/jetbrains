import { NextRequest, NextResponse } from 'next/server';
import {createClient} from "@/utils/supabase/server";
import {getRandomUrlByAvailability} from "@/utils";

export const runtime = 'edge';

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const path = url.pathname.replace('/api/oneCopy', '');
    const search = url.search;
    console.log(path,search)

    const supabase = createClient();
    const { data: jetbrains, error } = await supabase
        .from('jetbrains')
        .select('*')
    const randomUrl = `${getRandomUrlByAvailability(jetbrains) || ''}`
    return NextResponse.redirect(randomUrl, 302)
}
