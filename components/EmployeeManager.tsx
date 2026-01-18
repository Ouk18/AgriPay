
import React, { useState } from 'react';
import { Employee, EmployeeStatus, CropType, Harvest, Advance, WorkTask, Entrepreneur } from '../types.ts';
import { 
  UserPlus, UserX, UserCheck, 
  X, Scale, Wallet, ReceiptText,
  User, PhoneCall, Trash2, Banknote, Pickaxe,
  PlusCircle, Truck, Briefcase, Plus, ShoppingBag, ArrowRight,
  CheckCircle2, TrendingDown, ShieldAlert
} from 'lucide-react';
import EmployeeForm from './EmployeeForm.tsx';
import EntrepreneurForm from './EntrepreneurForm.tsx';

interface Props {
  employees: Employee[];
  entrepreneurs: Entrepreneur[];
  harvests: Harvest[];
  advances: Advance[];
  workTasks: WorkTask[];
  selectedId: string | null;
  onSelectId: (id: string | null) => void;
  onAdd: (emp: any) => Promise<void>;
  onAddEntrepreneur: (en: any) => Promise<void>;
  onUpdateStatus: (id: string, status: EmployeeStatus) => void;
  onClearBalance: (employeeId: string, amount: number) => void;
  onQuickHarvest: (employeeId: string) => void;
  onQuickTask: (employeeId: string) => void;
  onDeleteEmployee: (id: string) => void;
  onDeleteEntrepreneur: (id: string) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

const EmployeeManager: React.FC<Props> = ({ 
  employees, entrepreneurs, harvests, advances, workTasks, selectedId, onSelectId, 
  onAdd, onAddEntrepreneur, onUpdateStatus, onClearBalance, onQuickHarvest, onQuickTask,
  onDeleteEmployee, onDeleteEntrepreneur, canEdit = true, canDelete = false
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'employees' | 'entrepreneurs'>('employees');
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showAddEntrepreneur, setShowAddEntrepreneur] = useState(false);
  const selectedEmployee = employees.find(e => e.id === selectedId);

  return (
    <div className="space-y-10">
      {/* SECTION HEADER ACTIONS */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-1">
            <h3 className="text-3xl md:text-5xl font-black text-emerald-950 tracking-tighter leading-none">Votre Équipe</h3>
            <div className="flex items-center gap-3">
              <p className="text-stone-500 font-bold text-sm md:text-base">Gestion des manœuvres et prestataires.</p>
              {canDelete && (
                <span className="flex items-center gap-1 px-3 py-1 bg-rose-600 text-white rounded-full text-[9px] font-black uppercase tracking-tighter animate-pulse shadow-lg shadow-rose-600/20">
                  <ShieldAlert className="w-3 h-3" /> Mode Gestionnaire Actif
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
              <button onClick={() => setShowAddEmployee(true)} className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-emerald-700 text-white px-8 py-5 rounded-[1.75rem] shadow-xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"><Plus className="w-5 h-5" /> Manœuvre</button>
              <button onClick={() => setShowAddEntrepreneur(true)} className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-sky-700 text-white px-8 py-5 rounded-[1.75rem] shadow-xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"><Plus className="w-5 h-5" /> Prestataire</button>
          </div>
        </div>
        
        {/* TAB SELECTOR */}
        <div className="flex bg-stone-100 p-1.5 rounded-[2rem] border border-stone-200 w-full md:max-w-md">
          <button onClick={() => setActiveSubTab('employees')} className={`flex-1 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'employees' ? 'bg-white text-emerald-900 shadow-sm border border-stone-200' : 'text-stone-400'}`}>Manœuvres ({employees.length})</button>
          <button onClick={() => setActiveSubTab('entrepreneurs')} className={`flex-1 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'entrepreneurs' ? 'bg-white text-emerald-900 shadow-sm border border-stone-200' : 'text-stone-400'}`}>Prestataires ({entrepreneurs.length})</button>
        </div>
      </div>

      {activeSubTab === 'employees' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map(emp => {
            const empH = harvests.filter(h => h.employeeId === emp.id).reduce((acc, h) => acc + (h.weight * h.payRate), 0);
            const empT = workTasks.filter(t => t.employeeId === emp.id).reduce((acc, t) => acc + t.amount, 0);
            const empA = advances.filter(a => a.employeeId === emp.id).reduce((acc, a) => acc + a.amount, 0);
            const empDue = Math.round(empH + empT - empA);
            const isDue = empDue > 0;
            
            return (
              <div 
                key={emp.id} 
                onClick={() => onSelectId(emp.id)} 
                className={`group bg-white p-6 rounded-[2.5rem] border-2 transition-all cursor-pointer hover:shadow-2xl hover:shadow-emerald-900/10 ${selectedId === emp.id ? 'border-emerald-600 ring-4 ring-emerald-50' : 'border-stone-100 shadow-sm'} ${emp.status !== 'ACTIF' ? 'opacity-50 grayscale' : ''}`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-[1.25rem] flex items-center justify-center text-white text-lg font-black shadow-lg shadow-emerald-900/5 transition-transform group-hover:scale-110" style={{ backgroundColor: emp.status === 'ACTIF' ? emp.color : '#64748b' }}>{emp.name.substring(0,2).toUpperCase()}</div>
                    <div>
                      <h4 className="text-lg font-black text-emerald-950 leading-tight">{emp.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full ${emp.crop === 'HEVEA' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{emp.crop}</span>
                      </div>
                    </div>
                  </div>
                  {/* BOUTON SUPPRESSION EMPLOYÉ - FORCE VISIBILITÉ */}
                  {canDelete && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDeleteEmployee(emp.id); }}
                      className="p-4 bg-rose-600 text-white rounded-2xl shadow-xl shadow-rose-600/30 hover:bg-rose-700 hover:scale-110 transition-all active:scale-90 z-20"
                      title="Supprimer définitivement"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
                
                <div className={`p-5 rounded-2xl ${isDue ? 'bg-rose-50 border border-rose-100' : 'bg-emerald-50 border border-emerald-100'} transition-all group-hover:translate-y-[-4px]`}>
                   <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <p className={`text-[9px] font-black uppercase tracking-widest ${isDue ? 'text-rose-400' : 'text-emerald-500'}`}>{isDue ? 'Dû Plantation' : 'À jour'}</p>
                        <p className={`text-xl font-black ${isDue ? 'text-rose-600' : 'text-emerald-700'}`}>{Math.abs(empDue).toLocaleString()} F</p>
                      </div>
                      <div className={`p-2 rounded-xl bg-white shadow-sm ${isDue ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {isDue ? <TrendingDown className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                      </div>
                   </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {entrepreneurs.map(en => (
            <div key={en.id} className="group bg-white p-6 rounded-[2.5rem] border border-stone-100 shadow-sm hover:shadow-2xl transition-all">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-[1.25rem] flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110" style={{ backgroundColor: en.color || '#0284c7' }}><Truck className="w-7 h-7" /></div>
                  <div>
                    <h4 className="font-black text-lg text-emerald-950 leading-tight">{en.name}</h4>
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mt-1">{en.specialty || 'Fournisseur'}</p>
                  </div>
                </div>
                {/* BOUTON SUPPRESSION PRESTATAIRE - FORCE VISIBILITÉ */}
                {canDelete && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteEntrepreneur(en.id); }} 
                    className="p-4 bg-rose-600 text-white rounded-2xl shadow-xl shadow-rose-600/30 hover:bg-rose-700 hover:scale-110 transition-all active:scale-90"
                    title="Supprimer prestataire"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddEmployee && <EmployeeForm onClose={() => setShowAddEmployee(false)} onSubmit={async (e) => { await onAdd(e); setShowAddEmployee(false); }} />}
      {showAddEntrepreneur && <EntrepreneurForm onClose={() => setShowAddEntrepreneur(false)} onSubmit={async (en) => { await onAddEntrepreneur(en); setShowAddEntrepreneur(false); }} />}

      {/* MODAL PROFIL EMPLOYÉ */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6 bg-emerald-950/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-t-[3.5rem] md:rounded-[3.5rem] shadow-[0_-20px_60px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
            <div className="p-8 md:p-12 text-white relative overflow-hidden" style={{ backgroundColor: selectedEmployee.status === 'ACTIF' ? selectedEmployee.color : '#64748b' }}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="flex justify-between items-start relative z-10">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-[1.75rem] bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-xl">
                    <User className="w-10 h-10" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-3xl md:text-4xl font-black tracking-tighter">{selectedEmployee.name}</h2>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-white/20 rounded-full">{selectedEmployee.crop}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => onSelectId(null)} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"><X className="w-6 h-6" /></button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-10 custom-scrollbar pb-10">
              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => { onQuickHarvest(selectedEmployee.id); onSelectId(null); }} className="flex flex-col items-center gap-3 py-6 bg-emerald-50 text-emerald-800 rounded-[2rem] border border-emerald-100 font-black text-[10px] uppercase tracking-widest hover:bg-emerald-100 transition-all active:scale-95">
                   <Scale className="w-8 h-8" /> Ajouter Récolte
                 </button>
                 <button onClick={() => { onQuickTask(selectedEmployee.id); onSelectId(null); }} className="flex flex-col items-center gap-3 py-6 bg-sky-50 text-sky-800 rounded-[2rem] border border-sky-100 font-black text-[10px] uppercase tracking-widest hover:bg-sky-100 transition-all active:scale-95">
                   <Pickaxe className="w-8 h-8" /> Ajouter Tâche
                 </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-stone-50 p-6 rounded-3xl border border-stone-100 space-y-1">
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Gains Totaux</p>
                  <p className="text-2xl font-black text-emerald-950">{(Math.round(harvests.filter(h => h.employeeId === selectedId).reduce((acc, h) => acc + (h.weight * h.payRate), 0) + workTasks.filter(t => t.employeeId === selectedId).reduce((acc, t) => acc + t.amount, 0))).toLocaleString()} F</p>
                </div>
                <div className="bg-emerald-900 p-6 rounded-3xl text-white space-y-1 shadow-xl shadow-emerald-900/20">
                  <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Solde dû</p>
                  <p className="text-2xl font-black">{(() => { const hVal = harvests.filter(h => h.employeeId === selectedId).reduce((acc, h) => acc + (h.weight * h.payRate), 0); const tVal = workTasks.filter(t => t.employeeId === selectedId).reduce((acc, t) => acc + t.amount, 0); const aVal = advances.filter(a => a.employeeId === selectedId).reduce((acc, a) => acc + a.amount, 0); return Math.round(hVal + tVal - aVal).toLocaleString(); })()} F</p>
                </div>
              </div>

              <button onClick={() => { const hVal = harvests.filter(h => h.employeeId === selectedId).reduce((acc, h) => acc + (h.weight * h.payRate), 0); const tVal = workTasks.filter(t => t.employeeId === selectedId).reduce((acc, t) => acc + t.amount, 0); const aVal = advances.filter(a => a.employeeId === selectedId).reduce((acc, a) => acc + a.amount, 0); const due = Math.round(hVal + tVal - aVal); if (due > 0) { onClearBalance(selectedEmployee.id, due); onSelectId(null); } }} className="w-full flex items-center justify-center gap-4 py-6 bg-emerald-950 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-emerald-950/30 active:scale-95 transition-all">
                <Banknote className="w-6 h-6" /> Solder le Compte
              </button>

              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="font-black text-xs uppercase tracking-widest text-stone-400 flex items-center gap-3"><ReceiptText className="w-5 h-5" /> Historique Recent</h4>
                </div>
                <div className="space-y-3">
                  {[...harvests, ...advances, ...workTasks].filter(i => (i as any).employeeId === selectedId).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5).map((item: any) => {
                    const isHarv = !!item.weight;
                    const isTsk = !!item.description;
                    return (
                      <div key={item.id} className="flex justify-between items-center p-5 bg-stone-50 rounded-[1.75rem] border border-stone-100 hover:bg-stone-100 transition-all group">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isHarv ? 'bg-emerald-100 text-emerald-600' : isTsk ? 'bg-sky-100 text-sky-600' : 'bg-rose-100 text-rose-600'}`}>
                            {isHarv ? <Scale className="w-4 h-4" /> : isTsk ? <Pickaxe className="w-4 h-4" /> : <Wallet className="w-4 h-4" />}
                          </div>
                          <div>
                            <span className="text-[10px] font-black text-stone-400 block mb-0.5">{new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                            <span className="font-bold text-emerald-950 text-xs">{item.weight ? `Récolte ${item.weight}kg` : item.description ? item.description : `Avance ${item.category || ''}`}</span>
                          </div>
                        </div>
                        <span className={`font-black text-sm ${item.amount && !item.description ? 'text-rose-600' : 'text-emerald-700'}`}>{item.amount ? `${(item.amount && !item.description ? '-' : '')}${item.amount.toLocaleString()} F` : `+${(item.weight * item.payRate).toLocaleString()} F`}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ZONE DE DANGER EXPLICITE DANS LE PROFIL */}
              {canDelete && (
                <div className="pt-8 mt-4 border-t border-rose-100 space-y-4">
                   <div className="flex items-center gap-3 justify-center text-rose-600">
                     <ShieldAlert className="w-5 h-5" />
                     <h5 className="text-[10px] font-black uppercase tracking-widest text-center">Zone d'administration</h5>
                   </div>
                  <button 
                    onClick={() => { onDeleteEmployee(selectedEmployee.id); onSelectId(null); }}
                    className="w-full flex items-center justify-center gap-3 py-6 bg-rose-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-rose-700 shadow-2xl shadow-rose-600/30 transition-all active:scale-95"
                  >
                    <Trash2 className="w-5 h-5" /> Supprimer ce manœuvre
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManager;
