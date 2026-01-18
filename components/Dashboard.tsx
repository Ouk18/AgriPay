
import React, { useMemo } from 'react';
import { AppData, UserRole } from '../types.ts';
import { 
  TrendingUp, Scale, Wallet, PiggyBank, Package, 
  ExternalLink, User, CheckCircle2, Download, BarChart3, Calculator,
  TrendingDown, ShieldAlert, ArrowUpRight, ArrowDownRight, FileDown,
  ShoppingBag, Truck, PieChart, Activity
} from 'lucide-react';

interface Props {
  data: AppData;
  onExport: () => void;
  onNavigateToEmployee: (id: string) => void;
  userRole?: UserRole;
}

const Dashboard: React.FC<Props> = ({ data, onExport, onNavigateToEmployee, userRole }) => {
  const { harvests, advances, workTasks, settings, employees, entrepreneurs } = data;
  const isEmployee = userRole === 'EMPLOYE';
  const isGerant = userRole === 'GERANT';
  const isAdmin = userRole === 'ADMIN';
  const canExport = isAdmin || isGerant;

  const stats = useMemo(() => {
    const workerGross = Math.round(
      harvests.reduce((acc, h) => acc + (h.weight * h.payRate), 0) + 
      workTasks.reduce((acc, t) => acc + t.amount, 0)
    );
    const totalWorkerPaid = Math.round(advances.filter(a => a.employeeId).reduce((acc, a) => acc + a.amount, 0));
    const totalExternalExpenses = Math.round(advances.filter(a => !a.employeeId).reduce((acc, a) => acc + a.amount, 0));
    const grossRevenue = Math.round(harvests.reduce((acc, h) => {
      const rate = h.crop === 'HEVEA' ? settings.marketPriceHevea : settings.marketPriceCacao;
      return acc + (h.weight * rate);
    }, 0));

    return { workerGross, totalWorkerPaid, totalExternalExpenses, grossRevenue };
  }, [harvests, workTasks, advances, settings]);

  const netDueToWorkers = stats.workerGross - stats.totalWorkerPaid;
  const profit = stats.grossRevenue - stats.workerGross - stats.totalExternalExpenses;

  return (
    <div className="space-y-8 pb-10">
      {/* HEADER DASHBOARD */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl md:text-5xl font-black text-emerald-950 tracking-tighter leading-none">
            {isEmployee ? "Mon Espace" : isGerant ? "Opérations" : "Bilan Plantation"}
          </h2>
          <p className="text-stone-500 font-bold text-sm md:text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            Suivi temps réel • {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
          </p>
        </div>
        
        {canExport && (
          <button 
            onClick={onExport} 
            className="flex items-center justify-center gap-3 px-8 py-5 bg-emerald-900 text-white rounded-[1.75rem] font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-emerald-900/20 active:scale-95 transition-all"
          >
            <FileDown className="w-5 h-5" /> Exporter Rapport Mensuel
          </button>
        )}
      </div>

      {/* BENTO GRID MAIN */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* CARTE PRINCIPALE - SOLDE / PROFIT */}
        <div className={`md:col-span-8 p-8 md:p-12 rounded-[3.5rem] text-white relative overflow-hidden shadow-2xl shadow-emerald-900/10 border-4 ${
          isEmployee ? 'bg-emerald-800 border-emerald-700' : 
          isGerant ? 'bg-sky-900 border-sky-800' : 
          'bg-emerald-950 border-emerald-900'
        }`}>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10 space-y-10">
            <div className="flex justify-between items-start">
              <div className="space-y-3">
                <span className="bg-white/10 text-white/80 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                  {isEmployee ? "Solde à percevoir" : isGerant ? "Charge Salariale Totale" : "Bénéfice Net Estimé"}
                </span>
                <div className="flex items-baseline gap-3">
                  <h3 className="text-5xl md:text-8xl font-black tracking-tighter">
                    {(isEmployee ? netDueToWorkers : isGerant ? stats.workerGross : profit).toLocaleString()}
                  </h3>
                  <span className="text-xl md:text-3xl font-black opacity-30 tracking-tight">FCFA</span>
                </div>
              </div>
              <div className="p-4 bg-white/10 rounded-3xl border border-white/10">
                <PieChart className="w-10 h-10 opacity-50" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/5 p-6 rounded-3xl border border-white/5 backdrop-blur-md flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">Avances Payées</p>
                  <p className="text-2xl font-black text-emerald-400">-{stats.totalWorkerPaid.toLocaleString()} F</p>
                </div>
                <Wallet className="w-8 h-8 opacity-20" />
              </div>
              <div className="bg-white/5 p-6 rounded-3xl border border-white/5 backdrop-blur-md flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">Charges Externes</p>
                  <p className="text-2xl font-black text-sky-400">-{stats.totalExternalExpenses.toLocaleString()} F</p>
                </div>
                <Truck className="w-8 h-8 opacity-20" />
              </div>
            </div>
          </div>
        </div>

        {/* CARTE VOLUMES RECOLTE */}
        <div className="md:col-span-4 grid grid-cols-1 gap-6">
          {['HEVEA', 'CACAO'].map(crop => {
            const vol = harvests.filter(h => h.crop === crop).reduce((acc, h) => acc + h.weight, 0);
            const isHevea = crop === 'HEVEA';
            return (
              <div key={crop} className="bg-white p-8 rounded-[3rem] border border-stone-200 shadow-sm flex flex-col justify-between hover:shadow-xl transition-all">
                <div className="flex justify-between items-start">
                  <div className={`p-3 rounded-2xl ${isHevea ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {isHevea ? <Scale className="w-6 h-6" /> : <Package className="w-6 h-6" />}
                  </div>
                  <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{crop}</span>
                </div>
                <div className="space-y-1">
                  <p className="text-4xl font-black text-emerald-950 tracking-tighter">{vol.toLocaleString()} <span className="text-sm opacity-40">KG</span></p>
                  <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div className={`h-full ${isHevea ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: vol > 0 ? '75%' : '0%' }}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {!isEmployee && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LISTE RELIQUATS */}
          <div className="bg-white p-10 rounded-[3.5rem] border border-stone-200 shadow-sm space-y-8">
            <div className="flex justify-between items-center">
              <h4 className="font-black text-xs uppercase tracking-widest text-stone-400 flex items-center gap-3">
                <TrendingDown className="w-5 h-5 text-rose-500" /> Reliquats à solder
              </h4>
              <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-tighter">Action Requise</span>
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {employees.length === 0 ? (
                <div className="text-center py-12 text-stone-300 font-bold uppercase text-[10px]">Aucun ouvrier enregistré</div>
              ) : (
                employees.filter(emp => {
                  const h = harvests.filter(h => h.employeeId === emp.id).reduce((acc, h) => acc + (h.weight * h.payRate), 0);
                  const t = workTasks.filter(t => t.employeeId === emp.id).reduce((acc, t) => acc + t.amount, 0);
                  const a = advances.filter(a => a.employeeId === emp.id).reduce((acc, a) => acc + a.amount, 0);
                  return Math.round(h + t - a) > 0;
                }).map(emp => {
                  const empH = harvests.filter(h => h.employeeId === emp.id).reduce((acc, h) => acc + (h.weight * h.payRate), 0);
                  const empT = workTasks.filter(t => t.employeeId === emp.id).reduce((acc, t) => acc + t.amount, 0);
                  const empA = advances.filter(a => a.employeeId === emp.id).reduce((acc, a) => acc + a.amount, 0);
                  const due = Math.round(empH + empT - empA);
                  return (
                    <button key={emp.id} onClick={() => onNavigateToEmployee(emp.id)} className="w-full group flex justify-between items-center p-5 bg-stone-50 hover:bg-emerald-50 rounded-[2rem] transition-all active:scale-95 border border-transparent hover:border-emerald-100">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xs font-black shadow-lg" style={{ backgroundColor: emp.color }}>{emp.name.substring(0,2).toUpperCase()}</div>
                        <div className="text-left">
                          <span className="font-black text-emerald-950 block">{emp.name}</span>
                          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{emp.crop}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-black text-rose-600">{due.toLocaleString()} F</span>
                        <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-emerald-500 transition-colors" />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* LISTE PRESTATAIRES */}
          <div className="bg-emerald-950 p-10 rounded-[3.5rem] shadow-2xl text-white space-y-8">
            <div className="flex justify-between items-center">
              <h4 className="font-black text-xs uppercase tracking-widest text-emerald-500 flex items-center gap-3">
                <Truck className="w-5 h-5" /> Flux Prestataires
              </h4>
              <button className="text-[10px] font-black uppercase text-white/40 hover:text-white transition-colors">Tout voir</button>
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {advances.filter(a => a.entrepreneurId).length === 0 ? (
                <div className="text-center py-12 text-white/20 font-bold uppercase text-[10px]">Aucune charge externe</div>
              ) : (
                advances.filter(a => a.entrepreneurId).slice(0, 10).map(a => {
                  const en = entrepreneurs.find(e => e.id === a.entrepreneurId);
                  return (
                    <div key={a.id} className="flex justify-between items-center p-5 bg-white/5 rounded-[2rem] border border-white/5 hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-sky-500/20 flex items-center justify-center text-sky-400"><ShoppingBag className="w-5 h-5" /></div>
                        <div>
                          <span className="font-black text-white block text-sm">{en?.name || 'Inconnu'}</span>
                          <span className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">{a.category}</span>
                        </div>
                      </div>
                      <span className="font-black text-sky-400">-{a.amount.toLocaleString()} F</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
  </svg>
);

export default Dashboard;
