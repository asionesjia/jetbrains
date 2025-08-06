import UserAgent from 'user-agents';

interface RandomHeaders {
    'user-agent': string;
    'accept': string;
    'accept-language': string;
    'accept-encoding': string;
    'sec-ch-ua': string;
    'sec-ch-ua-mobile': string;
    'sec-ch-ua-platform': string;
    'sec-fetch-dest': string;
    'sec-fetch-mode': string;
    'sec-fetch-site': string;
    'sec-fetch-user'?: string;
    'upgrade-insecure-requests': string;
    'cache-control'?: string;
    'pragma'?: string;
    'priority'?: string;
}

class HeaderGenerator {
    private acceptLanguages = [
        'en-US,en;q=0.9',
        'zh-CN,zh;q=0.9,en;q=0.8',
        'en-GB,en;q=0.9',
        'fr-FR,fr;q=0.9,en;q=0.8',
        'de-DE,de;q=0.9,en;q=0.8',
        'es-ES,es;q=0.9,en;q=0.8',
        'ja-JP,ja;q=0.9,en;q=0.8'
    ];

    private acceptTypes = [
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    ];

    private platforms = [
        '"macOS"',
        '"Windows"',
        '"Linux"'
    ];

    private cacheControlValues = [
        'no-cache',
        'max-age=0',
        'no-store'
    ];

    private priorities = [
        'u=0, i',
        'u=1, i',
        'u=2, i'
    ];

    /**
     * 生成随机请求头
     * @param options 自定义选项
     */
    generateHeaders(options: {
        forLogin?: boolean;
        customHeaders?: Record<string, string>;
    } = {}): Record<string, string> {
        // 生成随机User-Agent
        const userAgent = new UserAgent({ deviceCategory: 'desktop' });
        const userAgentString = userAgent.toString();

        // 提取浏览器信息用于生成sec-ch-ua
        const chromeMatch = userAgentString.match(/Chrome\/(\d+)/);
        const chromeVersion = chromeMatch ? chromeMatch[1] : '120';
        
        const headers: Record<string, string> = {
            'user-agent': userAgentString,
            'accept': this.randomChoice(this.acceptTypes),
            'accept-language': this.randomChoice(this.acceptLanguages),
            'accept-encoding': 'gzip, deflate, br',
            'sec-ch-ua': `"Not)A;Brand";v="99", "Google Chrome";v="${chromeVersion}", "Chromium";v="${chromeVersion}"`,
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': this.randomChoice(this.platforms),
            'sec-fetch-dest': options.forLogin ? 'document' : 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'same-origin',
            'upgrade-insecure-requests': '1'
        };

        // 为登录请求添加特殊头
        if (options.forLogin) {
            headers['sec-fetch-user'] = '?1';
            headers['cache-control'] = this.randomChoice(this.cacheControlValues);
            headers['pragma'] = 'no-cache';
            headers['priority'] = this.randomChoice(this.priorities);
        }

        // 添加自定义头
        if (options.customHeaders) {
            Object.assign(headers, options.customHeaders);
        }

        return headers;
    }

    /**
     * 生成用于API请求的头
     */
    generateApiHeaders(options: {
        customHeaders?: Record<string, string>;
    } = {}): Record<string, string> {
        const baseHeaders = this.generateHeaders();
        
        const apiHeaders: Record<string, string> = {
            ...baseHeaders,
            'accept': '*/*',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'x-requested-with': 'XMLHttpRequest'
        };

        // 移除不适用于API请求的头
        delete apiHeaders['sec-fetch-user'];
        delete apiHeaders['upgrade-insecure-requests'];

        if (options.customHeaders) {
            Object.assign(apiHeaders, options.customHeaders);
        }

        return apiHeaders;
    }

    /**
     * 生成用于表单提交的头
     */
    generateFormHeaders(options: {
        origin?: string;
        referer?: string;
        customHeaders?: Record<string, string>;
    } = {}): Record<string, string> {
        const baseHeaders = this.generateHeaders({ forLogin: true });
        
        const formHeaders: Record<string, string> = {
            ...baseHeaders,
            'content-type': 'application/x-www-form-urlencoded'
        };

        if (options.origin) {
            formHeaders['origin'] = options.origin;
        }

        if (options.referer) {
            formHeaders['referer'] = options.referer;
        }

        if (options.customHeaders) {
            Object.assign(formHeaders, options.customHeaders);
        }

        return formHeaders;
    }

    /**
     * 从数组中随机选择一个元素
     */
    private randomChoice<T>(array: T[]): T {
        return array[Math.floor(Math.random() * array.length)];
    }

    /**
     * 生成随机延迟（毫秒）
     */
    generateRandomDelay(min: number = 1000, max: number = 3000): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

// 创建单例实例
export const headerGenerator = new HeaderGenerator();

// 导出类型
export type { RandomHeaders };
export { HeaderGenerator };