import { headerGenerator } from '../utils/header-generator';
import axios from 'axios';

interface DataItem {
    path: string | undefined;
    port: string;
}

/**
 * 从Censys原始链接中提取URL信息
 */
function extractUrlFromCensysLink(url: string | undefined): DataItem | null {
    if (!url) return null;
    try {
        const urlObj = new URL(url);
        const pathSegments = urlObj.pathname.split('/');
        const path = pathSegments.pop();
        const port = urlObj.hash || '';
        return { path, port };
    } catch (error) {
        console.error('Invalid URL:', error);
        return null;
    }
}

/**
 * 检测Censys URL的可用性（检查是否重定向到JetBrains）
 */
async function checkCensysUrlAvailability(url: string): Promise<boolean> {
    try {
        const response = await axios.head(url, { 
            maxRedirects: 0, 
            timeout: 5000,
            validateStatus: function (status) {
                return status >= 200 && status < 400;
            }
        });
        
        // 检查是否有重定向到JetBrains
        return response.status === 302 || response.status === 301;
    } catch (error: any) {
        // 检查错误响应中的重定向
        if (error.response && (error.response.status === 302 || error.response.status === 301)) {
            return true;
        }
        
        console.error(`Error checking ${url}:`, error.message);
        return false;
    }
}

/**
 * 过滤并格式化Censys URLs，同时检测可用性
 */
async function filterAndFormatCensysURLs(data: DataItem[]): Promise<string[]> {
    const allowedPorts = ['80', '443', '8080', '8081'];
    const protocolMap: { [key: string]: string } = {
        '80': 'http',
        '443': 'https',
        '8080': 'http',
        '8081': 'http'
    };

    // 先过滤并格式化URLs
    const formattedUrls = data
        .filter((item: DataItem) => {
            const portMatch = item.port.match(/^#(\d+)-/);
            if (portMatch) {
                const port = portMatch[1] || '';
                return allowedPorts.includes(port);
            }
            return false;
        })
        .map((item: DataItem) => {
            const portMatch = item.port.match(/^#(\d+)-/);
            const port = portMatch?.[1] || '';
            const protocol = protocolMap[port];
            return `${protocol}://${item.path}:${port}`;
        });

    // 并发检测所有URL的可用性
    console.log(`Checking availability for ${formattedUrls.length} Censys URLs...`);
    const availabilityChecks = formattedUrls.map(async url => {
        const isAvailable = await checkCensysUrlAvailability(url);
        return { url, isAvailable };
    });

    const results = await Promise.all(availabilityChecks);
    const availableUrls = results.filter(result => result.isAvailable).map(result => result.url);
    
    console.log(`Found ${availableUrls.length} available URLs out of ${formattedUrls.length} Censys URLs`);
    return availableUrls;
}

export async function censysLogin(): Promise<string | null> {
    const username = process.env.CENSYS_USERNAME;
    const password = process.env.CENSYS_PASSWORD;

    if (!username || !password) {
        console.error('CENSYS_USERNAME or CENSYS_PASSWORD not set in environment variables');
        return null;
    }

    // TODO: Implement Censys login logic
    console.log('Censys login not implemented yet');
    return null;
}

export async function scanCensys(): Promise<string[]> {
    if (process.env.ENABLE_CENSYS_SCAN !== 'true') {
        console.log('Censys scanning disabled');
        return [];
    }

    try {
        // Get login session
        const sessionCookie = await censysLogin();

        // 生成随机请求头
        const scanHeaders = headerGenerator.generateApiHeaders({
            customHeaders: sessionCookie ? {
                'cookie': sessionCookie
            } : {}
        });

        // 添加Censys特定的头
        Object.assign(scanHeaders, {
            "Referer": "https://search.censys.io/search?resource=hosts&sort=RELEVANCE&per_page=100&virtual_hosts=EXCLUDE&q=services.http.response.headers.location%3A+account.jetbrains.com%2Ffls-auth",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        });

        const response = await fetch("https://search.censys.io/_search?resource=hosts&sort=RELEVANCE&per_page=100&virtual_hosts=EXCLUDE&q=services.http.response.headers.location%3A+account.jetbrains.com%2Ffls-auth", {
            headers: scanHeaders,
            body: null,
            method: "GET"
        });

        const html = await response.text();
        const cheerio = await import('cheerio');
        const $ = cheerio.load(html);

        // 获取原始链接并处理为标准URL格式，同时检测可用性
        const rawLinks = $('div.service.SearchResult__metadata-value a').map((_, el) => $(el).attr('href')).get();
        const extractedData = rawLinks
            .map(link => extractUrlFromCensysLink(link))
            .filter(Boolean) as DataItem[];
        
        const availableUrls = await filterAndFormatCensysURLs(extractedData);
        console.log('censys_available_urls', JSON.stringify(availableUrls));
        return availableUrls;
    } catch (error) {
        console.error('Error scanning Censys:', error);
        return [];
    }
}
