import { headerGenerator } from '../utils/header-generator';

export async function fofaLogin(): Promise<string | null> {
    const username = process.env.FOFA_USERNAME;
    const password = process.env.FOFA_PASSWORD;

    if (!username || !password) {
        console.error('FOFA_USERNAME or FOFA_PASSWORD not set in environment variables');
        return null;
    }

    // TODO: Implement Fofa login logic
    console.log('Fofa login not implemented yet');
    return null;
}

export async function scanFofa(): Promise<string[]> {
    if (process.env.ENABLE_FOFA_SCAN !== 'true') {
        console.log('Fofa scanning disabled');
        return [];
    }

    try {
        // Get login session
        const sessionCookie = await fofaLogin();

        // 生成随机请求头
        const scanHeaders = headerGenerator.generateHeaders({
            customHeaders: sessionCookie ? {
                'cookie': sessionCookie
            } : {
                'cookie': "is_flag_login=0; befor_router=; isRedirectLang=1; is_mobile=pc; baseShowChange=false; viewOneHundredData=false; _ga_9GWBD260K9=GS1.1.1717965611.1.0.1717965611.0.0.0; _ga=GA1.1.1145448172.1717965611; Hm_lvt_4275507ba9b9ea6b942c7a3f7c66da90=1717965611; Hm_lpvt_4275507ba9b9ea6b942c7a3f7c66da90=1717965611; __fcd=SbF6rgrxn3nKV357MTinxJAQ"
            }
        });

        const response = await fetch("https://fofa.info/result?qbase64=aGVhZGVyPSJodHRwczovL2FjY291bnQuamV0YnJhaW5zLmNvbS9mbHMtYXV0aCI%3D", {
            headers: scanHeaders,
            referrerPolicy: "origin",
            body: null,
            method: "GET"
        });

        const html = await response.text();
        const cheerio = await import('cheerio');
        const $ = cheerio.load(html);
        const rawLinks = $('span.hsxa-host a').map((_, el) => $(el).attr('href')).get();
        return rawLinks.filter(Boolean);
    } catch (error) {
        console.error('Error scanning Fofa:', error);
        return [];
    }
}
