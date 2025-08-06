import { useEffect } from 'react';

export const useUpdateJetbrains = (id: string, status: boolean | null): void => {
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`/api/updateJetbrains?id=${id}&status=${status ? '1' : '0'}`, {
                    method: 'GET',
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            } catch (error) {
                console.error('Fetch error:', error);
            }
        };

        if(status !== null) {
            fetchData();
        }
    }, [id, status]);
};
