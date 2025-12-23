
import React, { useState, useCallback, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { MainKPI, DashboardState, SubKPI } from './types';
import { mockDashboardData } from './data';
import { getAIInsight, getKPIInsight } from './src/services/ai';
import { supabase, signOut } from './src/lib/supabase';
import Auth from './src/components/Auth';

// --- Sub-components (defined outside to avoid re-renders) ---

const StatusIndicator = ({ status }: { status: string }) => {
  const colors = {
    success: 'bg-primary shadow-[0_0_8px_rgba(56,224,123,0.6)]',
    warning: 'bg-warning shadow-[0_0_8px_rgba(255,215,0,0.5)]',
    danger: 'bg-danger shadow-[0_0_8px_rgba(255,77,77,0.5)]'
  };
  return <span className={`size-3 rounded-full ${colors[status as keyof typeof colors]}`}></span>;
};

const Header = ({ onLogout }: { onLogout: () => void }) => (
  <header className="flex-none flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-border-dark px-6 py-4 bg-white dark:bg-surface-dark/50 backdrop-blur-md z-20">
    <div className="flex items-center gap-4">
      <div className="size-8 text-primary flex items-center justify-center bg-primary/10 rounded-full">
        <span className="material-symbols-outlined text-2xl">analytics</span>
      </div>
      <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">Monitor de KPI de Manutenção</h2>
    </div>
    <div className="flex flex-1 justify-end items-center gap-6">
      <div className="hidden md:flex relative group">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
          <span className="material-symbols-outlined text-[20px]">search</span>
        </span>
        <input
          className="h-10 w-64 rounded-full bg-slate-100 dark:bg-[#2c2c2c] border-none pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary placeholder:text-slate-500 text-slate-900 dark:text-white transition-all"
          placeholder="Pesquisar indicador..."
          type="text"
        />
      </div>
      <div className="h-6 w-px bg-slate-200 dark:bg-border-dark"></div>
      <div className="flex gap-2">
        <button className="flex size-10 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-[#2c2c2c] dark:hover:bg-[#383838] transition-colors">
          <span className="material-symbols-outlined text-[20px]">settings</span>
        </button>
        <button className="flex size-10 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-[#2c2c2c] dark:hover:bg-[#383838] transition-colors relative">
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-2.5 right-2.5 size-2 bg-primary rounded-full border-2 border-surface-dark"></span>
        </button>
      </div>
      <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-border-dark group relative cursor-pointer">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold leading-none">Usuário</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Logado</p>
        </div>
        <div
          className="bg-center bg-no-repeat bg-cover rounded-full size-10 ring-2 ring-primary/20"
          style={{ backgroundImage: 'url("https://ui-avatars.com/api/?name=User&background=random")' }}
        ></div>

        {/* Dropdown de Logout */}
        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#1e1e1e] rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden hidden group-hover:block z-50">
          <button
            onClick={onLogout}
            className="w-full text-left px-4 py-3 text-sm text-danger hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Sair do Sistema
          </button>
        </div>
      </div>
    </div>
  </header>
);

import { fetchDashboardData, getFilterOptions, DashboardFilters } from './src/services/dashboardService';

const FiltersBar = ({ lastUpdated, onFilterChange }: { lastUpdated: string, onFilterChange: (filters: DashboardFilters) => void }) => {
  const [filters, setFilters] = useState<DashboardFilters>({});
  const [options, setOptions] = useState<{ [key: string]: string[] }>({
    month: [], dir: [], geg: [], ger: [], gar: [], fase: []
  });

  useEffect(() => {
    const loadOptions = async () => {
      const monthOpts = await getFilterOptions('first_day_of_month');
      const dirOpts = await getFilterOptions('dir');
      const gegOpts = await getFilterOptions('geg');
      const gerOpts = await getFilterOptions('ger');
      const garOpts = await getFilterOptions('gar');
      const faseOpts = await getFilterOptions('fase');

      // Sort months if needed, assuming ISO date strings they sort alphabetically fine
      monthOpts.sort((a, b) => b.localeCompare(a));

      setOptions({ month: monthOpts, dir: dirOpts, geg: gegOpts, ger: gerOpts, gar: garOpts, fase: faseOpts });
    };
    loadOptions();
  }, []);

  const handleChange = (key: keyof DashboardFilters, value: string) => {
    const newFilters = { ...filters, [key]: value === 'Todos' ? undefined : value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const renderSelect = (label: string, key: keyof DashboardFilters, icon: string) => (
    <label className="flex flex-col gap-1 min-w-[160px]">
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">{label}</span>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary material-symbols-outlined text-[20px]">{icon}</span>
        <select
          className="form-select w-full h-11 pl-10 pr-8 bg-white dark:bg-[#1c1c1c] border border-slate-200 dark:border-border-dark rounded-xl text-sm font-medium focus:ring-primary focus:border-primary cursor-pointer appearance-none"
          onChange={(e) => handleChange(key, e.target.value)}
          value={filters[key] || 'Todos'}
        >
          <option value="Todos">Todos</option>
          {options[key]?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 material-symbols-outlined">expand_more</span>
      </div>
    </label>
  );

  return (
    <div className="flex-none px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white/50 dark:bg-surface-dark/30 backdrop-blur-sm border-b border-slate-200 dark:border-border-dark z-10 w-full overflow-x-auto">
      <div className="flex flex-wrap gap-4 w-full md:w-auto min-w-max">
        {renderSelect('Mês', 'month', 'calendar_month')}
        {renderSelect('Diretoria', 'dir', 'domain')}
        {renderSelect('Diretoria Operacional', 'geg', 'domain')}
        {renderSelect('Gerência Geral', 'ger', 'domain')}
        {renderSelect('Gerência de Área', 'gar', 'domain')}
        {renderSelect('Fase', 'fase', 'category')}
      </div>
      <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 md:ml-auto">
        <span className="material-symbols-outlined text-primary text-sm animate-pulse">sync</span>
        <p className="text-primary text-sm font-medium whitespace-nowrap">Atualizado: {lastUpdated}</p>
      </div>
    </div>
  );
};

const SubKPIItem = ({ sub, onHover }: { sub: SubKPI, onHover: (id: string | null, e?: React.MouseEvent) => void }) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = sub.subKPIs && sub.subKPIs.length > 0;

  return (
    <div className="flex flex-col items-center w-full">
      <div
        className={`w-full bg-[#1e1e1e] border border-slate-700 p-3 rounded-lg flex items-center justify-between hover:border-slate-500 transition-colors cursor-pointer group/item relative z-10 ${hasChildren ? 'mb-0' : ''}`}
        onClick={(e) => {
          if (hasChildren) {
            e.stopPropagation();
            setExpanded(!expanded);
          }
        }}
        onMouseEnter={(e) => onHover(sub.id, e)}
        onMouseLeave={() => onHover(null)}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {hasChildren && (
            <span className={`material-symbols-outlined text-slate-400 text-sm transition-transform ${expanded ? 'rotate-90' : ''}`}>chevron_right</span>
          )}

          <div className={`size-2 rounded-full flex-shrink-0 ${sub.status === 'success' ? 'bg-primary' :
            sub.status === 'warning' ? 'bg-warning shadow-[0_0_8px_rgba(255,215,0,0.5)]' :
              'bg-danger shadow-[0_0_8px_rgba(255,77,77,0.5)]'
            }`}></div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{sub.label}</p>
            <p className="text-xs text-slate-500 truncate">{sub.description}</p>
          </div>
        </div>
        <span className={`text-sm font-bold ml-2 ${sub.status === 'danger' ? 'text-danger' :
          sub.status === 'warning' ? 'text-warning' : 'text-white'
          }`}>{sub.value}</span>

        {/* Tooltip with offenders */}
        {sub.offenders && (
          <div className="absolute left-full top-0 ml-2 w-64 bg-slate-800 border border-slate-600 rounded-xl p-4 shadow-2xl z-50 invisible group-hover/item:visible opacity-0 group-hover/item:opacity-100 transition-all pointer-events-none">
            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Principais Ofensores</p>
            <ul className="space-y-2 mb-3">
              {sub.offenders.map((off, idx) => (
                <li key={idx} className="flex justify-between text-xs">
                  <span className="text-white">{off.name}</span>
                  <span className={`font-bold ${off.status === 'danger' ? 'text-danger' :
                    off.status === 'warning' ? 'text-warning' : 'text-primary'
                    }`}>{off.value}</span>
                </li>
              ))}
            </ul>
            <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: sub.value }}></div>
            </div>
          </div>
        )}
      </div>

      {hasChildren && expanded && (
        <>
          <div className="h-6 w-px bg-slate-700 flex-shrink-0"></div>
          <div className="flex flex-nowrap justify-center gap-4 w-full relative animate-[fadeIn_0.3s_ease-out]">

            {/* Horizontal Connector Line: visible only if >1 children */}
            {sub.subKPIs!.length > 1 && (
              <div className="absolute top-[-1px] left-8 right-8 h-px bg-slate-700"></div>
            )}

            {sub.subKPIs!.map((child, index) => (
              <div key={child.id} className="flex-1 min-w-[120px] flex flex-col items-center relative">
                {/* Vertical line connector for each child up to the horizontal line */}
                <div className={`absolute top-0 w-px bg-slate-700 h-4 -mt-4 ${sub.subKPIs!.length === 1 ? 'hidden' : ''
                  }`}></div>

                <SubKPIItem sub={child} onHover={onHover} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default function App() {
  const [data, setData] = useState<DashboardState>(mockDashboardData);
  const [selectedKpiId, setSelectedKpiId] = useState<string>('assets');
  const [aiInsight, setAiInsight] = useState<string>("Carregando análise da IA...");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Hover Insight State
  const [hoverInsight, setHoverInsight] = useState<string | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number, y: number } | null>(null);
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleKpiHover = (id: string | null, e?: React.MouseEvent) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);

    if (!id || !e) {
      setHoverInsight(null);
      setHoverPosition(null);
      return;
    }

    const x = e.clientX;
    const y = e.clientY;

    // Delay to prevent flickering and excessive calls
    hoverTimeoutRef.current = setTimeout(async () => {
      setHoverPosition({ x, y });
      const insight = await getKPIInsight(id, activeFilters);
      setHoverInsight(insight);
    }, 300);
  };

  // Filter state managed here to trigger refetch
  const [activeFilters, setActiveFilters] = useState<DashboardFilters>({});

  // Load real data on mount and when filters change
  useEffect(() => {
    fetchDashboardData(activeFilters).then(realData => {
      setData(realData);
    });
  }, [activeFilters]); // Re-run when filters change

  const handleFilterChange = useCallback((newFilters: DashboardFilters) => {
    setActiveFilters(newFilters);
  }, []);

  const selectedKpi = data.kpis.find(k => k.id === selectedKpiId) || data.kpis[0];

  const fetchInsight = useCallback(async () => {
    setIsAiLoading(true);
    setAiInsight("Analisando indicadores e gerando insights...");
    try {
      const insight = await getAIInsight(data.kpis, activeFilters);
      setAiInsight(insight);
    } catch (error) {
      console.error("Erro ao gerar insight:", error);
      setAiInsight("Erro ao gerar análise. Tente novamente ou verifique a conexão.");
    } finally {
      setIsAiLoading(false);
    }
  }, [data.kpis, activeFilters]);

  /* Auth State */
  const [user, setUser] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    }).catch((err) => {
      console.error("Erro ao verificar sessão:", err);
      // Se falhar (ex: sem credenciais), assume deslogado para mostrar tela de login (que vai mostrar erro se tentar logar)
      setUser(null);
    }).finally(() => {
      setAuthChecking(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthChecking(false); // Garante que saia do loading em mudanças de estado
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchInsight();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (authChecking) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#1f2937] text-white">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">autorenew</span>
      </div>
    );
  }

  if (!user) {
    return <Auth onSuccess={() => setUser({ id: 'mock-user', email: 'admin@bussola.ai' })} />;
  }


  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background-light dark:bg-background-dark">
      <Header onLogout={() => signOut()} />
      <main className="flex-1 flex flex-col min-h-0 relative">
        <FiltersBar lastUpdated={data.lastUpdated} onFilterChange={handleFilterChange} />

        <div className="flex-1 flex overflow-hidden">
          {/* Main Content: Tree View */}
          <div className="flex-1 relative overflow-auto custom-scrollbar p-8">
            <div className="flex flex-col items-center min-w-[1200px]">

              {/* Root Node: Global Health */}
              <div className="relative z-10 mb-12">
                <div className="flex flex-col items-center justify-center p-1 w-64 h-24 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-xl border border-slate-700 ring-4 ring-slate-800/50">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Saúde Global</span>
                  <div className="flex items-end gap-2">
                    <h1 className="text-3xl font-bold text-white tracking-tight">{data.globalHealth}%</h1>
                    <span className="text-sm font-medium text-primary mb-1.5 flex items-center">
                      <span className="material-symbols-outlined text-sm mr-0.5">trending_up</span>
                      +{data.globalTrend}%
                    </span>
                  </div>
                </div>
                <div className="absolute left-1/2 top-full w-0.5 h-12 bg-slate-700 -translate-x-1/2"></div>
              </div>

              {/* KPI Row */}
              <div className="relative flex justify-center gap-6 w-full px-4">
                {/* Horizontal line connecting children */}
                <div className="absolute top-[-1rem] left-[10%] right-[10%] h-[2px] bg-slate-700"></div>

                {data.kpis.map((kpi) => (
                  <div key={kpi.id} className="flex flex-col items-center flex-1 relative group">
                    <div className="absolute top-[-1rem] h-4 w-[2px] bg-slate-700 left-1/2 -translate-x-1/2"></div>

                    <button
                      onClick={() => setSelectedKpiId(kpi.id)}
                      onMouseEnter={(e) => handleKpiHover(kpi.id, e)}
                      onMouseLeave={() => handleKpiHover(null)}
                      className={`w-full transition-all p-4 rounded-xl text-left shadow-lg relative overflow-hidden ring-1 border ${selectedKpiId === kpi.id
                        ? 'bg-slate-800 border-primary ring-primary shadow-primary/20 scale-[1.02]'
                        : 'bg-[#1c1c1c] border-slate-800 hover:border-slate-600 opacity-80 hover:opacity-100'
                        }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className={`p-2 rounded-lg ${selectedKpiId === kpi.id ? 'bg-primary/20 text-primary' : 'bg-slate-800 text-slate-400'}`}>
                          <span className="material-symbols-outlined">{kpi.icon}</span>
                        </div>
                        <StatusIndicator status={kpi.status} />
                      </div>
                      <h3 className="text-white font-bold text-lg mb-1">{kpi.label}</h3>
                      <div className="flex justify-between items-end">
                        <span className={`text-2xl font-bold ${kpi.status === 'danger' ? 'text-danger' :
                          kpi.status === 'warning' ? 'text-warning' : 'text-white'
                          }`}>{kpi.value}</span>
                        <span className="text-xs text-slate-400">Meta {kpi.target}</span>
                      </div>
                    </button>

                    {/* Show sub-indicators if this KPI is selected */}
                    {selectedKpiId === kpi.id && (
                      <div className="mt-8 w-full relative animate-[fadeIn_0.3s_ease-out]">
                        {/* Connector from Parent to Branch Line */}
                        <div className="absolute top-[-2rem] left-1/2 -translate-x-1/2 h-8 w-[2px] bg-primary/30"></div>

                        <div className="flex flex-nowrap justify-center gap-4">
                          {/* Horizontal Branch Connector */}
                          {kpi.subKPIs.length > 1 && (
                            <div className="absolute top-0 left-8 right-8 h-px bg-slate-700"></div>
                          )}

                          {kpi.subKPIs.map((sub) => (
                            <div key={sub.id} className="flex-1 min-w-[120px] flex flex-col items-center relative">
                              {/* Vertical Connector to Child */}
                              <div className={`absolute top-0 w-px bg-slate-700 h-4 -mt-0 ${kpi.subKPIs.length === 1 ? 'hidden' : ''
                                }`}></div>

                              <SubKPIItem sub={sub} onHover={handleKpiHover} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Summary */}
          <aside className="w-80 bg-white dark:bg-[#181818] border-l border-slate-200 dark:border-border-dark flex flex-col p-6 overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Resumo do Grupo</h3>
            <div className="space-y-6">
              {data.kpis.map((kpi) => (
                <div key={kpi.id}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{kpi.label}</span>
                    <span className={`text-sm font-bold ${kpi.status === 'danger' ? 'text-danger' :
                      kpi.status === 'warning' ? 'text-warning' : 'text-primary'
                      }`}>{kpi.value}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${kpi.status === 'danger' ? 'bg-danger' :
                        kpi.status === 'warning' ? 'bg-warning' : 'bg-primary'
                        }`}
                      style={{ width: kpi.value }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-8">
              <div className="bg-surface-dark rounded-2xl p-4 border border-border-dark">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-primary/20 p-2 rounded-lg text-primary">
                    <span className="material-symbols-outlined">lightbulb</span>
                  </div>
                  <p className="text-sm font-bold text-white">Insights IA</p>
                </div>
                <div className="min-h-[60px] flex items-center">
                  <p className={`text-xs leading-relaxed mb-3 transition-opacity ${isAiLoading ? 'opacity-50' : 'opacity-100'} ${aiInsight.startsWith('Erro') ? 'text-danger' : 'text-slate-400'}`}>
                    {aiInsight}
                  </p>
                </div>
                <button
                  onClick={fetchInsight}
                  disabled={isAiLoading}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isAiLoading ? (
                    <span className="material-symbols-outlined animate-spin text-sm">autorenew</span>
                  ) : null}
                  Ver Nova Análise
                </button>
              </div>
            </div>
          </aside>
        </div>

        {/* Hover Tooltip Overlay */}
        {hoverInsight && hoverPosition && (
          <div
            className="fixed z-[100] w-72 bg-slate-900/95 backdrop-blur-md border border-slate-600 text-white p-4 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] pointer-events-none animate-[fadeIn_0.2s_ease-out]"
            style={{ top: hoverPosition.y + 20, left: hoverPosition.x - 144 }} // Centered below cursor
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
              <span className="text-xs font-bold text-primary uppercase">Insight IA</span>
            </div>
            <div className="text-xs leading-relaxed text-slate-300 whitespace-pre-line">
              <ReactMarkdown>{hoverInsight}</ReactMarkdown>
            </div>
          </div>
        )}

      </main>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
