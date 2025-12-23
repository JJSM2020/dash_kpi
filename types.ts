
export type KPIStatus = 'success' | 'warning' | 'danger';

export interface SubKPI {
  id: string;
  label: string;
  description: string;
  value: string;
  status: KPIStatus;
  offenders?: Array<{ name: string; value: string; status: KPIStatus }>;
  subKPIs?: SubKPI[]; // Recursive nesting
}

export interface MainKPI {
  id: string;
  label: string;
  icon: string;
  value: string;
  target: string;
  status: KPIStatus;
  subKPIs: SubKPI[];
}

export interface DashboardState {
  globalHealth: number;
  globalTrend: number;
  kpis: MainKPI[];
  lastUpdated: string;
}
