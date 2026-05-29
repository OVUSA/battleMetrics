import { config } from './config.js';
const buildHeaders = () => {
    if (!config.battleMetricsApiToken) {
        return {
            Accept: 'application/json',
        };
    }
    return {
        Accept: 'application/json',
        Authorization: `Bearer ${config.battleMetricsApiToken}`,
    };
};
const withBaseUrl = (pathOrUrl) => {
    if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
        return pathOrUrl;
    }
    return `${config.battleMetricsBaseUrl}${pathOrUrl}`;
};
export const battleMetricsGet = async (pathOrUrl) => {
    const response = await fetch(withBaseUrl(pathOrUrl), {
        method: 'GET',
        headers: buildHeaders(),
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`BattleMetrics request failed (${response.status}): ${text}`);
    }
    return (await response.json());
};
