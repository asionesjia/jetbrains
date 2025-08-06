import { useState, useEffect } from 'react';

interface FetchResult {
    isFetching: boolean;
    status: boolean | null;
    error: string | null;
}

export const useTestFetching = (url: string, timeout: number): FetchResult => {
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const [status, setStatus] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!url) return;

        const controller = new AbortController();
        const signal = controller.signal;

        const fetchData = async () => {
            setIsFetching(true);
            setStatus(null);
            setError(null);

            try {
                const timeoutId = setTimeout(() => {
                    controller.abort();
                    setStatus(false);
                    setError('请求超时。')
                    setIsFetching(false)
                }, timeout);

                const response = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`, {
                    "headers": {
                        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                        "accept-language": "zh-CN,zh;q=0.9",
                        "cache-control": "no-cache",
                        "pragma": "no-cache",
                        "proxy-connection": "keep-alive",
                        "upgrade-insecure-requests": "1",
                        "cookie": "FLS-SESSION=node0kbi18nadkaid713eg7szuhi4312.node0"
                    },
                    "referrerPolicy": "strict-origin-when-cross-origin",
                    "body": null,
                    "method": "GET",
                });

                clearTimeout(timeoutId);

                if (response.status === 200 || response.status === 301 || response.status === 302 || response.status === 304 || response.status === 307) {
                    setStatus(true);
                } else {
                    setStatus(false);
                }
            } catch (error) {
                setError('An error occurred');
            } finally {
                setIsFetching(false);
            }
        };

        fetchData();

        return () => {
            controller.abort();
        };
    }, [url, timeout]);

    return { isFetching, status, error };
};
