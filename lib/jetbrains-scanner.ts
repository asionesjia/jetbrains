import { createClient } from "@/utils/supabase/server";
import { scanShodan } from './scanners/shodan';
import { scanFofa } from './scanners/fofa';
import { scanCensys } from './scanners/censys';

interface LinksToJsonTypes {
    url: string;
    availability?: number;
}

function linksToJson(links: string[]): LinksToJsonTypes[] {
    const initialScore = parseInt(process.env.INITIAL_AVAILABILITY_SCORE || '100');
    return links.map(u => ({
        url: u,
        availability: initialScore  // 从环境变量读取初始可用性分数
    }));
}

function findUniqueInArray2(array1: LinksToJsonTypes[], array2: LinksToJsonTypes[]): LinksToJsonTypes[] {
    const uniqueArray2 = array2.filter((item, index, self) =>
        index === self.findIndex((t) => t.url === item.url)
    );

    const urlsInArray1 = new Set(array1.map(item => item.url));

    return uniqueArray2.filter(item => !urlsInArray1.has(item.url));
}

/**
 * 处理Shodan原始链接 - 通常已经是完整URL
 */
function processShodanLinks(rawLinks: string[]): string[] {
    return rawLinks.filter(link => {
        try {
            new URL(link);
            return true;
        } catch {
            return false;
        }
    });
}

/**
 * 处理Fofa原始链接 - 通常已经是完整URL
 */
function processFofaLinks(rawLinks: string[]): string[] {
    return rawLinks.filter(link => {
        try {
            new URL(link);
            return true;
        } catch {
            return false;
        }
    });
}

export async function scanAndSyncJetbrainsInstances(supabase: ReturnType<typeof createClient>) {
    try {
        const scanPromises = [
            scanShodan(),
            scanFofa(),
            scanCensys()  // Censys已经返回检测后的可用URLs
        ];

        const [shodanRawLinks, fofaRawLinks, censysAvailableUrls] = await Promise.all(scanPromises);

        // 处理各个平台的链接
        const shodanUrls = processShodanLinks(shodanRawLinks);
        const fofaUrls = processFofaLinks(fofaRawLinks);
        // Censys已经返回经过可用性检测的URLs

        console.log(`URLs found - Shodan: ${shodanUrls.length}, Fofa: ${fofaUrls.length}, Censys: ${censysAvailableUrls.length}`);

        // 合并所有URLs
        const allUrls = [...shodanUrls, ...fofaUrls, ...censysAvailableUrls];
        const urls = linksToJson(allUrls);
        console.log('All URLs:', allUrls)
        console.log(`Total URLs found: ${urls.length}`);

        // 获取现有数据进行去重
        const { data: existingData, error: existingError } = await supabase.from('jetbrains').select("*");
        
        if (existingError) {
            console.error('Error fetching existing data:', existingError);
            return;
        }

        const filteredData = existingData?.[0] ? findUniqueInArray2(existingData, urls) : urls;
        console.log(`New URLs to process: ${filteredData.length}`);
        
        if (filteredData.length === 0) {
            console.log('No new URLs to process');
            return;
        }

        // 直接插入到数据库，无需额外的可用性检测
        console.log('Inserting URLs to database...');
        const { data, error } = await supabase
            .from('jetbrains')
            .insert(filteredData)
            .select();
        
        if (error) {
            console.error('Error inserting data:', error);
        } else {
            console.log(`Successfully inserted ${data?.length || 0} URLs`);
        }
    } catch (error) {
        console.error('Error processing URLs:', error);
    }
}