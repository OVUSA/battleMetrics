"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.battleMetricsGet = void 0;
const config_js_1 = require("./config.js");
const buildHeaders = () => {
    if (!config_js_1.config.battleMetricsApiToken) {
        return {
            Accept: 'application/json',
        };
    }
    return {
        Accept: 'application/json',
        Authorization: `Bearer ${config_js_1.config.battleMetricsApiToken}`,
    };
};
const withBaseUrl = (pathOrUrl) => {
    if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
        return pathOrUrl;
    }
    return `${config_js_1.config.battleMetricsBaseUrl}${pathOrUrl}`;
};
const battleMetricsGet = async (pathOrUrl) => {
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
exports.battleMetricsGet = battleMetricsGet;
