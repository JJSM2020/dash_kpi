import { supabase } from '../lib/supabase';
import { DashboardState, MainKPI } from '../../types';
import { mockDashboardData } from '../../data';

export interface DashboardFilters {
    month?: string;
    dir?: string;
    geg?: string;
    ger?: string;
    gar?: string;
    fase?: string;
}

export const getFilterOptions = async (column: string): Promise<string[]> => {
    const { data, error } = await supabase.rpc('get_filter_options', { p_column: column });
    if (error) {
        console.error(`Error fetching options for ${column}:`, error);
        return [];
    }
    return data || [];
};

export const fetchDashboardData = async (filters: DashboardFilters = {}): Promise<DashboardState> => {
    try {
        const rpcParams = {
            p_month: filters.month || null,
            p_dir: filters.dir || null,
            p_geg: filters.geg || null,
            p_ger: filters.ger || null,
            p_gar: filters.gar || null,
            p_fase: filters.fase || null
        };

        // Buscar KPIs do banco via RPCs com filtros
        const { data: amsData, error: amsError } = await supabase.rpc('get_kpi_ams', rpcParams);
        const { data: backlogData, error: backlogError } = await supabase.rpc('get_kpi_backlog', rpcParams);
        const { data: unplannedData, error: unplannedError } = await supabase.rpc('get_kpi_unplanned_demands', rpcParams);
        const { data: planGroupData, error: planGroupError } = await supabase.rpc('get_kpi_planejamento_group', rpcParams);

        if (amsError) console.error('Error fetching AMS:', amsError);
        if (backlogError) console.error('Error fetching Backlog:', backlogError);
        if (unplannedError) console.error('Error fetching Unplanned:', unplannedError);
        if (planGroupError) console.error('Error fetching Plan Group:', planGroupError);

        const { data: aprData, error: aprError } = await supabase.rpc('get_kpi_apr', rpcParams);
        const { data: progGroupData, error: progGroupError } = await supabase.rpc('get_kpi_programacao_group', rpcParams);
        const { data: pcmData, error: pcmError } = await supabase.rpc('get_kpi_pcm', rpcParams);

        if (aprError) console.error('Error fetching APR:', aprError);
        if (progGroupError) console.error('Error fetching Prog Group:', progGroupError);
        if (pcmError) console.error('Error fetching PCM:', pcmError);

        // Valores padrão ou retornados
        const amsValues = amsData || { ams_total_value: 0, ams_calendar_value: 0, ams_counter_value: 0 };
        const backlogValue = backlogData?.backlog_value || 0;
        const unplannedValue = unplannedData?.unplanned_value || 0;
        const planGroupValue = planGroupData?.planejamento_value || 0;
        const aprValue = aprData?.apr_value || 0;
        const progGroupValue = progGroupData?.programacao_value || 0;
        const pcmValue = pcmData?.pcm_value || 0;

        // Clonar estrutura do mock para manter o layout, mas injetar valores reais
        const newState = JSON.parse(JSON.stringify(mockDashboardData)) as DashboardState;
        console.log("Mock carregado", newState);

        // formatPercent agora recebe uma razão (ex: 0.532) e retorna porcentagem (53,2%)
        const formatPercent = (val: number) => `${(val * 100).toFixed(1).replace('.', ',')}%`;
        const formatDays = (val: number) => `${val.toFixed(1).replace('.', ',')} dias`;

        // Injetar valores na árvore de KPIs
        // Procurar PCM -> Planejamento -> AMS
        const pcmKpi = newState.kpis.find(k => k.id === 'pcm');
        if (pcmKpi) {

            // Atualizar valor principal do PCM
            pcmKpi.value = formatPercent(pcmValue);
            const pcmPercent = pcmValue * 100;
            pcmKpi.status = pcmPercent >= 80 ? 'success' : (pcmPercent >= 60 ? 'warning' : 'danger');

            if (pcmKpi.subKPIs) {

                // Atualizar Programação -> Backlog
                const programacao = pcmKpi.subKPIs.find(s => s.id === 'programacao');
                if (programacao && programacao.subKPIs) {
                    // Grupo Programação
                    programacao.value = formatPercent(progGroupValue);
                    const progPercent = progGroupValue * 100;
                    programacao.status = progPercent >= 80 ? 'success' : (progPercent >= 60 ? 'warning' : 'danger');

                    const backlog = programacao.subKPIs.find(b => b.id === 'backlog');
                    if (backlog) {
                        backlog.value = formatDays(backlogValue);
                        // Lógica simples de status (dias)
                        backlog.status = backlogValue <= 15 ? 'success' : (backlogValue <= 30 ? 'warning' : 'danger');
                    }

                    // APR
                    const apr = programacao.subKPIs.find(a => a.id === 'apr');
                    if (apr) {
                        apr.value = formatPercent(aprValue);
                        const aprPercent = aprValue * 100;
                        apr.status = aprPercent >= 80 ? 'success' : (aprPercent >= 60 ? 'warning' : 'danger');
                    }
                }

                // Atualizar Planejamento -> AMS e Unplanned
                const planejamento = pcmKpi.subKPIs.find(s => s.id === 'planejamento');
                if (planejamento && planejamento.subKPIs) {

                    // Atualiza valor do Grupo Planejamento
                    planejamento.value = formatPercent(planGroupValue);
                    const planValPercent = planGroupValue * 100;
                    planejamento.status = planValPercent >= 80 ? 'success' : (planValPercent >= 60 ? 'warning' : 'danger');

                    // Atualiza AMS
                    const ams = planejamento.subKPIs.find(a => a.id === 'ams');
                    if (ams) {
                        const amsTotalPercent = amsValues.ams_total_value * 100;
                        ams.value = formatPercent(amsValues.ams_total_value);
                        // Status baseado em porcentagem (0-100)
                        ams.status = amsTotalPercent >= 80 ? 'success' : (amsTotalPercent >= 60 ? 'warning' : 'danger');

                        if (ams.subKPIs) {
                            const amsCal = ams.subKPIs.find(sub => sub.id === 'ams_calendar');
                            if (amsCal) {
                                const amsCalPercent = amsValues.ams_calendar_value * 100;
                                amsCal.value = formatPercent(amsValues.ams_calendar_value);
                                amsCal.status = amsCalPercent >= 80 ? 'success' : (amsCalPercent >= 60 ? 'warning' : 'danger');
                            }

                            const amsCont = ams.subKPIs.find(sub => sub.id === 'ams_counter');
                            if (amsCont) {
                                const amsContPercent = amsValues.ams_counter_value * 100;
                                amsCont.value = formatPercent(amsValues.ams_counter_value);
                                amsCont.status = amsContPercent >= 80 ? 'success' : (amsContPercent >= 60 ? 'warning' : 'danger');
                            }
                        }
                    }

                    // Atualiza Demandas sem Planejamento
                    const unplanned = planejamento.subKPIs.find(u => u.id === 'unplanned');
                    if (unplanned) {
                        const unplannedPercent = unplannedValue * 100;
                        unplanned.value = formatPercent(unplannedValue);
                        // Quanto menor melhor: <5% Success, <10% Warning, >10% Danger
                        unplanned.status = unplannedPercent <= 5 ? 'success' : (unplannedPercent <= 10 ? 'warning' : 'danger');
                    }
                }
            }
        }

        newState.lastUpdated = new Date().toLocaleString('pt-BR');

        return newState;

    } catch (error) {
        console.error("Falha geral ao buscar dashboard data:", error);
        return mockDashboardData;
    }
};
