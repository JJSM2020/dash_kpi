
import { DashboardState } from './types';

export const mockDashboardData: DashboardState = {
  globalHealth: 94.2,
  globalTrend: 2.4,
  lastUpdated: '26 Out, 2023 • 14:05',
  kpis: [
    {
      id: 'assets',
      label: 'Perf. de Ativos',
      icon: 'precision_manufacturing',
      value: '98.5%',
      target: '>95%',
      status: 'success',
      subKPIs: [
        {
          id: 'oee',
          label: 'OEE',
          description: 'Eficiência Global Equip.',
          value: '82%',
          status: 'success',
          offenders: [
            { name: 'Linha A4', value: '65%', status: 'danger' },
            { name: 'Misturador 02', value: '78%', status: 'warning' }
          ]
        },
        {
          id: 'availability',
          label: 'Disponibilidade',
          description: 'Horas de atividade',
          value: '91%',
          status: 'warning'
        },
        {
          id: 'mtbf',
          label: 'MTBF',
          description: 'Tempo Médio Entre Falhas',
          value: '420h',
          status: 'danger'
        }
      ]
    },
    {
      id: 'engineering',
      label: 'Engenharia',
      icon: 'engineering',
      value: '100%',
      target: '>90%',
      status: 'success',
      subKPIs: [
        { id: 'projects', label: 'Projetos', description: 'Entrega de CAPEX', value: '100%', status: 'success' }
      ]
    },
    {
      id: 'inspection',
      label: 'Inspeção',
      icon: 'search_check',
      value: '88%',
      target: '>95%',
      status: 'warning',
      subKPIs: [
        { id: 'routes', label: 'Rotas', description: 'Conformidade de Rotas', value: '88%', status: 'warning' }
      ]
    },
    {
      id: 'pcm',
      label: 'PCM',
      icon: 'calendar_clock',
      value: '96%',
      target: '>90%',
      status: 'success',
      subKPIs: [
        {
          id: 'planejamento',
          label: 'Planejamento',
          description: 'Grupo de Planejamento',
          value: '85%',
          status: 'warning',
          subKPIs: [
            {
              id: 'ams',
              label: 'AMS',
              description: 'Aderência a Manutenção Sistemática',
              value: '75%',
              status: 'warning',
              subKPIs: [
                {
                  id: 'ams_calendar',
                  label: 'AMS Calendário',
                  description: 'Aderência a Manutenção Sistemática - Calendário',
                  value: '80%',
                  status: 'warning'
                },
                {
                  id: 'ams_counter',
                  label: 'AMS Contador',
                  description: 'Aderência a Manutenção Sistemática Contador',
                  value: '70%',
                  status: 'danger'
                }
              ]
            },
            {
              id: 'unplanned',
              label: 'Demandas s/ Plan.',
              description: 'Demandas sem Planejamento',
              value: '3%',
              status: 'success'
            }
          ]
        },
        {
          id: 'programacao',
          label: 'Programação',
          description: 'Grupo de Programação',
          value: '96%',
          status: 'success',
          subKPIs: [
            { id: 'backlog', label: 'Backlog', description: 'Backlog', value: '30 dias', status: 'success' },
            { id: 'apr', label: 'APR', description: 'Aderência a Programação', value: '90%', status: 'success' }
          ]
        }
      ]
    },
    {
      id: 'execution',
      label: 'Execução',
      icon: 'build',
      value: '74%',
      target: '>90%',
      status: 'danger',
      subKPIs: [
        { id: 'emergency', label: 'Emergenciais', description: 'Ordens de Serviço', value: '74%', status: 'danger' }
      ]
    },
    {
      id: 'cost',
      label: 'Custo',
      icon: 'attach_money',
      value: '99%',
      target: '>95%',
      status: 'success',
      subKPIs: [
        { id: 'budget', label: 'Orçamento', description: 'Aderência ao Budget', value: '99%', status: 'success' }
      ]
    }
  ]
};
