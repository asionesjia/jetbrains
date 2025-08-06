import { NextRequest, NextResponse } from 'next/server';
import {createClient} from "@/utils/supabase/server";
import {getRandomUrlByAvailability} from "@/utils";
export async function GET(req: NextRequest, { params }: { params: { slug: string[] } }) {
    const { slug } = params;
    const url = new URL(req.url);
    const path = slug.join('/');
    const search = url.search;
    console.log(path,search)

    const supabase = createClient();
    const { data: jetbrains, error } = await supabase
        .from('jetbrains')
        .select('*')
    const randomUrl = `${getRandomUrlByAvailability(jetbrains) || ''}/${path}${search}`
    const pingReq = await fetch(randomUrl, {
        headers: {
            "Accept-Encoding": "gzip",
            "User-Agent": "Java/17.0.9",
            "Accept": "text/html, image/gif, image/jpeg, *; q=.2, */*; q=.2",
            "Connection": "keep-alive"
        }
    })
    const pingRes = await pingReq.text()
    return new NextResponse(pingRes, {
        headers: pingReq.headers
    })
}
