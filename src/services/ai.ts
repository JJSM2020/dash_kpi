import { supabase } from '../lib/supabase';
import { MainKPI, SubKPI } from '../../types';
import { DashboardFilters } from './dashboardService';

interface RankingItem {
    name: string;
    value: number;
}

// Helper to determine breakdown level
const getBreakdownLevel = (filters: DashboardFilters) => {
    if (filters.gar) return { groupBy: 'fase', levelName: 'Fase' };
    if (filters.ger) return { groupBy: 'gar', levelName: 'Gerência de Área' };
    if (filters.geg) return { groupBy: 'ger', levelName: 'Gerência Geral' };
    if (filters.dir) return { groupBy: 'geg', levelName: 'Diretoria Operacional' };
    return { groupBy: 'dir', levelName: 'Diretoria' };
};

interface KPIConfig {
    id: string;
    label: string;
    isHigherBetter: boolean;
    format: 'percent' | 'days';
}

const KPI_CONFIGS: KPIConfig[] = [
    { id: 'ams', label: 'AMS', isHigherBetter: true, format: 'percent' },
    { id: 'backlog', label: 'Backlog', isHigherBetter: false, format: 'days' },
    { id: 'apr', label: 'APR', isHigherBetter: true, format: 'percent' },
    { id: 'unplanned', label: 'Demandas s/ Plan.', isHigherBetter: false, format: 'percent' }
];

async function analyzeKPI(config: KPIConfig, filters: DashboardFilters) {
    const { groupBy, levelName } = getBreakdownLevel(filters);

    const rpcParams = {
        p_kpi_type: config.id,
        p_group_by: groupBy,
        p_month: filters.month || null,
        p_dir: filters.dir || null,
        p_geg: filters.geg || null,
        p_ger: filters.ger || null,
        p_gar: filters.gar || null,
        p_fase: filters.fase || null
    };

    const { data: rankingData, error } = await supabase.rpc('get_kpi_ranking', rpcParams);

    if (error || !rankingData || rankingData.length === 0) {
        return null;
    }

    const ranking = rankingData as RankingItem[];
    const sortedMath = [...ranking].sort((a, b) => b.value - a.value);

    // Stats
    const avg = ranking.reduce((acc, curr) => acc + curr.value, 0) / ranking.length;
    const maxVal = Math.max(...ranking.map(i => i.value));
    const minVal = Math.min(...ranking.map(i => i.value));
    const bestVal = config.isHigherBetter ? maxVal : minVal;
    const worstVal = config.isHigherBetter ? minVal : maxVal;

    const best = config.isHigherBetter ? sortedMath.slice(0, 5) : sortedMath.slice(-5).reverse();
    const worst = config.isHigherBetter ? sortedMath.slice(-5).reverse() : sortedMath.slice(0, 5);

    return { ranking, best, worst, avg, bestVal, worstVal, levelName, count: ranking.length };
}

// Generate a short, snappy insight for tooltip
export const getKPIInsight = async (kpiId: string, filters: DashboardFilters = {}): Promise<string> => {
    const config = KPI_CONFIGS.find(c => c.id === kpiId);
    if (!config) return "Análise não disponível para este indicador.";

    const analysis = await analyzeKPI(config, filters);
    if (!analysis) return "Dados insuficientes para análise detalhada.";

    const { best, worst, avg, levelName } = analysis;
    const fmt = (v: number) => config.format === 'days' ? `${v.toFixed(1)} dias` : `${(v * 100).toFixed(1)}%`;

    return `**Análise por ${levelName}:**\n` +
        `• Média do Grupo: **${fmt(avg)}**\n` +
        `• Destaque: **${best[0].name}** (${fmt(best[0].value)})\n` +
        `• Atenção: **${worst[0].name}** (${fmt(worst[0].value)})`;
};

export const getAIInsight = async (kpis: MainKPI[], filters: DashboardFilters = {}): Promise<string> => {
    const { levelName } = getBreakdownLevel(filters);
    let fullReport = `### 🤖 Relatório de Inteligência Artificial\n`;
    fullReport += `**Escopo de Análise:** Detalhamento por **${levelName}**.\n\n`;

    // Iterate and Analyze
    for (const config of KPI_CONFIGS) {
        const analysis = await analyzeKPI(config, filters);

        if (!analysis) continue;

        const { best, worst, avg, bestVal, worstVal } = analysis;

        // Formatting
        const fmt = (v: number) => {
            if (config.format === 'days') return `${v.toFixed(1).replace('.', ',')} dias`;
            return `${(v * 100).toFixed(1).replace('.', ',')}%`;
        };

        // Append to Report
        fullReport += `#### 📊 ${config.label}\n`;
        fullReport += `Média do Grupo: **${fmt(avg)}** | Melhor: **${fmt(bestVal)}** | Pior: **${fmt(worstVal)}**\n\n`;

        fullReport += `**🏆 Destaques (Top 5):** ${best.map(i => `${i.name} (${fmt(i.value)})`).join(', ')}\n\n`;
        fullReport += `**⚠️ Atenção (Bottom 5):** ${worst.map(i => `${i.name} (${fmt(i.value)})`).join(', ')}\n\n`;

        // Micro-insight
        const diff = Math.abs(bestVal - worstVal);
        const threshold = config.format === 'days' ? 10 : 0.2; // 10 days or 20% diff
        if (diff > threshold) {
            fullReport += `*Insight:* Alta variabilidade detectada. A unidade **${worst[0].name}** desvia significativamente da média.\n`;
        }
        fullReport += `\n---\n\n`;
    }

    // General Summary
    fullReport += `### 📝 Resumo Geral\n`;
    fullReport += `A análise indica oportunidades de padronização nas unidades listadas como "Ponto de Atenção". Recomenda-se reuniões de compartilhamento de boas práticas lideradas pelas unidades "Destaque" de cada indicador.`;

    return fullReport;
};
