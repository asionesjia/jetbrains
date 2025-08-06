import { createClient } from "@/utils/supabase/server";

export class CookiesManager {
    private supabase: ReturnType<typeof createClient>;

    constructor() {
        this.supabase = createClient();
    }

    /**
     * 保存cookies到数据库
     * @param platform 平台名称 (shodan, fofa, censys)
     * @param cookieString cookies字符串
     */
    async saveCookies(platform: string, cookieString: string): Promise<boolean> {
        try {
            console.log(`Saving cookies for platform: ${platform}`);
            
            const { data, error } = await this.supabase
                .from('cookies')
                .upsert(
                    {
                        platform: platform,
                        cookies: cookieString
                    },
                    {
                        onConflict: 'platform'
                    }
                )
                .select();

            if (error) {
                console.error('Error saving cookies:', error);
                return false;
            }

            console.log(`Cookies saved successfully for ${platform}:`, data);
            return true;
        } catch (error) {
            console.error('Exception while saving cookies:', error);
            return false;
        }
    }

    /**
     * 从数据库获取cookies
     * @param platform 平台名称
     * @returns cookies字符串或null
     */
    async getCookies(platform: string): Promise<string | null> {
        try {
            console.log(`Getting cookies for platform: ${platform}`);
            
            const { data, error } = await this.supabase
                .from('cookies')
                .select('cookies, created_at')
                .eq('platform', platform)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    console.log(`No cookies found for platform: ${platform}`);
                    return null;
                }
                console.error('Error getting cookies:', error);
                return null;
            }

            console.log(`Cookies retrieved for ${platform}`);
            return data.cookies as string;
        } catch (error) {
            console.error('Exception while getting cookies:', error);
            return null;
        }
    }

    /**
     * 验证cookies是否有效
     * @param platform 平台名称
     * @param cookieString cookies字符串
     * @returns 是否有效
     */
    async validateCookies(platform: string, cookieString: string): Promise<boolean> {
        try {
            console.log(`Validating cookies for platform: ${platform}`);
            
            // TODO: 实现具体的cookies验证逻辑
            // 暂时直接返回true
            console.log(`Cookies validation for ${platform}: PASSED (placeholder)`);
            return true;
        } catch (error) {
            console.error('Exception while validating cookies:', error);
            return false;
        }
    }

    /**
     * 获取有效的cookies，如果不存在或无效则返回null
     * @param platform 平台名称
     * @returns 有效的cookies字符串或null
     */
    async getValidCookies(platform: string): Promise<string | null> {
        const cookies = await this.getCookies(platform);
        if (!cookies) {
            return null;
        }

        const isValid = await this.validateCookies(platform, cookies);
        if (!isValid) {
            console.log(`Cookies for ${platform} are invalid, removing from database`);
            await this.deleteCookies(platform);
            return null;
        }

        return cookies;
    }

    /**
     * 删除指定平台的cookies
     * @param platform 平台名称
     */
    async deleteCookies(platform: string): Promise<boolean> {
        try {
            console.log(`Deleting cookies for platform: ${platform}`);
            
            const { error } = await this.supabase
                .from('cookies')
                .delete()
                .eq('platform', platform);

            if (error) {
                console.error('Error deleting cookies:', error);
                return false;
            }

            console.log(`Cookies deleted successfully for ${platform}`);
            return true;
        } catch (error) {
            console.error('Exception while deleting cookies:', error);
            return false;
        }
    }
}