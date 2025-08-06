import cheerio from 'cheerio';
import axios from "axios";
import { CookiesManager } from '../utils/cookies-manager';
import { headerGenerator } from '../utils/header-generator';

interface ShodanLoginResponse {
    session: string;
    csrfToken: string;
}

/**
 * 解析Set-Cookie头部，提取所有cookies并组装成cookie字符串
 */
function parseCookiesFromHeaders(setCookieHeaders: string[]): string {
    const cookies: string[] = [];

    setCookieHeaders.forEach(cookieHeader => {
        // 提取cookie名称和值（忽略其他属性如path、domain等）
        const match = cookieHeader.match(/^([^=]+)=([^;]+)/);
        if (match) {
            const [, name, value] = match;
            cookies.push(`${name}=${value}`);
        }
    });

    return cookies.join('; ');
}

export async function shodanLogin(): Promise<string | null> {
    const username = process.env.SHODAN_USERNAME;
    const password = process.env.SHODAN_PASSWORD;


    if (!username || !password) {
        console.error('SHODAN_USERNAME or SHODAN_PASSWORD not set in environment variables');
        return null;
    }

    // 初始化cookies管理器
    const cookiesManager = new CookiesManager();

    // 首先尝试从数据库获取有效的cookies
    const existingCookies = await cookiesManager.getValidCookies('shodan');
    if (existingCookies) {
        return existingCookies;
    }


    try {
        // Step 1: Get initial session and CSRF token
        const initialHeaders = headerGenerator.generateHeaders();
        const initialResponse = await axios.get('https://account.shodan.io/login', {
            headers: initialHeaders
        });


        // Extract session from cookies
        const setCookieHeader = initialResponse.headers['set-cookie'];
        const sessionMatch = setCookieHeader?.find(cookie => cookie.includes('session='))?.match(/session=([^;]+)/);
        const session = sessionMatch?.[1];

        // Extract CSRF token from HTML
        const $ = cheerio.load(initialResponse.data);
        const csrfToken = $('input[name="csrf_token"]').attr('value');

        if (!session || !csrfToken) {
            console.error('Failed to extract session or CSRF token');
            return null;
        }

        // Step 2: Perform login with manual redirect handling
        let currentUrl = 'https://account.shodan.io/login';
        let currentSession = session;
        let redirectCount = 0;
        const maxRedirects = 5;

        const loginData = `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&grant_type=password&continue=https%3A%2F%2Fwww.shodan.io&csrf_token=${encodeURIComponent(csrfToken)}`;

        while (redirectCount < maxRedirects) {
            // 添加随机延迟，模拟人类操作
            if (redirectCount > 0) {
                const delay = headerGenerator.generateRandomDelay(500, 2000);
                await new Promise(resolve => setTimeout(resolve, delay));
            }

            try {
                // 为每次登录尝试生成新的随机请求头
                const loginHeaders = headerGenerator.generateFormHeaders({
                    origin: 'https://account.shodan.io',
                    referer: 'https://account.shodan.io/login',
                    customHeaders: {
                        'cookie': `session=${currentSession}`
                    }
                });

                const loginResponse = await axios.post(currentUrl, loginData, {
                    headers: loginHeaders,
                    maxRedirects: 0,
                    validateStatus: function (status) {
                        return status >= 200 && status < 400;
                    }
                });


                // Update session from response cookies
                const responseSetCookieHeader = loginResponse.headers['set-cookie'];
                const responseSessionMatch = responseSetCookieHeader?.find(cookie => cookie.includes('session='))?.match(/session=([^;]+)/);
                if (responseSessionMatch) {
                    currentSession = responseSessionMatch[1];
                }

                // Check if this is a redirect
                if (loginResponse.status >= 300 && loginResponse.status < 400) {
                    const locationHeader = loginResponse.headers['location'];
                    if (locationHeader) {
                        currentUrl = locationHeader.startsWith('http') ? locationHeader : `https://account.shodan.io${locationHeader}`;
                        redirectCount++;
                        continue;
                    }
                }

                // If we reach here, login was successful
                break;
            } catch (error: any) {

                if (error.response && error.response.status >= 300 && error.response.status < 400) {
                    // Handle redirect
                    const locationHeader = error.response.headers['location'];
                    if (locationHeader) {
                        currentUrl = locationHeader.startsWith('http') ? locationHeader : `https://account.shodan.io${locationHeader}`;

                        // Update session from redirect response cookies
                        const redirectSetCookieHeader = error.response.headers['set-cookie'];
                        const redirectSessionMatch = redirectSetCookieHeader?.find((cookie: string) => cookie.includes('session='))?.match(/session=([^;]+)/);
                        if (redirectSessionMatch) {
                            currentSession = redirectSessionMatch[1];
                        }

                        redirectCount++;
                        continue;
                    }
                }
                throw error;
            }
        }

        if (redirectCount >= maxRedirects) {
            console.error('Too many redirects during login');
            return null;
        }

        const finalSession = currentSession;

        // 这里应该收集整个登录过程中的所有cookies
        // 简化版本：构造包含session的cookie字符串
        // 在实际实现中，你可能需要收集初始请求和所有重定向中的cookies
        let allCookies = `session=${finalSession}`;

        // TODO: 可以在这里添加逻辑来收集其他cookies
        // 例如从初始响应和重定向响应中解析Set-Cookie头部

        // 保存成功获取的cookies到数据库
        await cookiesManager.saveCookies('shodan', allCookies);

        return allCookies;

    } catch (error) {
        console.error('Shodan login failed:', error);
        return null;
    }
}

export async function scanShodan(): Promise<string[]> {
    if (process.env.ENABLE_SHODAN_SCAN !== 'true') {
        return [];
    }

    try {
        // Get login session
        const cookies = await shodanLogin();

        // 生成随机请求头
        const scanHeaders = headerGenerator.generateHeaders({
            customHeaders: cookies ? {
                'cookie': cookies
            } : {}
        });

        const response = await fetch("https://www.shodan.io/search?query=Location%3A+https%3A%2F%2Faccount.jetbrains.com%2Ffls-auth", {
            headers: scanHeaders,
            body: null,
            method: "GET",
        });

        const html = await response.text();
        const $ = cheerio.load(html);
        const rawLinks = $('a.text-danger').map((_, el) => $(el).attr('href')).get();
        return rawLinks.filter(Boolean);
    } catch (error) {
        console.error('Error scanning Shodan:', error);
        return [];
    }
}
