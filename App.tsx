
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Scale, Wallet, Plus, Pickaxe, Loader2, LogOut, User as UserIcon, ShieldAlert,
  AlertTriangle, Trash2, X, Download, HelpCircle, Smartphone, Share, DownloadCloud,
  LayoutDashboard, Users, Calendar as CalendarIcon, Settings as SettingsIcon, RefreshCw,
  WifiOff, ShoppingBag, BookOpen, PlusCircle, ShieldCheck
} from 'lucide-react';
import { supabase } from './lib/supabase.ts';
import { Employee, Harvest, Advance, RainEvent, MarketSettings, AppData, WorkTask, UserProfile, Entrepreneur } from './types.ts';
import Dashboard from './components/Dashboard.tsx';
import EmployeeManager from './components/EmployeeManager.tsx';
import CalendarView from './components/CalendarView.tsx';
import SettingsView from './components/SettingsView.tsx';
import HarvestForm from './components/HarvestForm.tsx';
import ExpenseForm from './components/ExpenseForm.tsx';
import RainForm from './components/RainForm.tsx';
import TaskForm from './components/TaskForm.tsx';
import Auth from './components/Auth.tsx';

const APP_VERSION = "v2.3.2";

const INITIAL_SETTINGS: MarketSettings = {
  payRateHevea: 75,
  payRateCacao: 0,
  marketPriceHevea: 360,
  marketPriceCacao: 2800,
  cacaoPayRatio: 0.3333,
};

const PRESET_COLORS = ['#059669', '#0284c7', '#d97706', '#dc2626', '#7c3aed', '#db2777', '#0891b2', '#4f46e5', '#ea580c', '#9333ea'];

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'employees' | 'journal' | 'settings'>('dashboard');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [data, setData] = useState<AppData>({
    employees: [],
    entrepreneurs: [],
    harvests: [],
    advances: [],
    workTasks: [],
    rainEvents: [],
    settings: INITIAL_SETTINGS
  });

  const [pendingDeletion, setPendingDeletion] = useState<{ table: string; id: string; label: string } | null>(null);
  const [showHarvestModal, setShowHarvestModal] = useState<{ employeeId?: string; date?: string } | boolean>(false);
  const [showTaskModal, setShowTaskModal] = useState<{ employeeId?: string; date?: string } | boolean>(false);
  const [showExpenseModal, setShowExpenseModal] = useState<{ employeeId?: string; amount?: number; date?: string; category?: any } | boolean>(false);
  const [showRainModal, setShowRainModal] = useState<{ date: string } | null>(null);

  const isAdmin = profile?.role === 'ADMIN';
  const isGerant = profile?.role === 'GERANT';
  const canManage = isAdmin || isGerant;

  const fetchData = useCallback(async () => {
    try {
      const [
        { data: employees },
        { data: entrepreneurs },
        { data: harvests },
        { data: advances },
        { data: workTasks },
        { data: rainEvents },
        { data: settingsData }
      ] = await Promise.all([
        supabase.from('employees').select('*').order('name'),
        supabase.from('entrepreneurs').select('*').order('name'),
        supabase.from('harvests').select('*').order('date', { ascending: false }),
        supabase.from('advances').select('*').order('date', { ascending: false }),
        supabase.from('work_tasks').select('*').order('date', { ascending: false }),
        supabase.from('rain_events').select('*').order('date', { ascending: false }),
        supabase.from('settings').select('*').maybeSingle()
      ]);

      setData({
        employees: (employees || []).map(e => ({
          id: e.id, name: e.name, status: e.status, crop: e.crop, color: e.color,
          iconName: e.icon_name || 'user', createdAt: new Date(e.created_at || Date.now()).getTime(),
          phone: e.phone, notes: e.notes, user_id: e.user_id
        })),
        entrepreneurs: (entrepreneurs || []).map(en => ({
          id: en.id, name: en.name, specialty: en.specialty, phone: en.phone, color: en.color
        })),
        harvests: (harvests || []).map(h => ({ 
          id: h.id, employeeId: h.employee_id, date: h.date, weight: h.weight, payRate: h.pay_rate, crop: h.crop 
        })),
        advances: (advances || []).map(a => ({ 
          id: a.id, employeeId: a.employee_id, entrepreneurId: a.entrepreneur_id, 
          date: a.date, amount: a.amount, category: a.category || 'AVANCE',
          paymentMethod: a.payment_method, notes: a.notes 
        })),
        workTasks: (workTasks || []).map(t => ({ 
          id: t.id, employeeId: t.employee_id, date: t.date, description: t.description, amount: t.amount 
        })),
        rainEvents: rainEvents || [],
        settings: settingsData ? {
          payRateHevea: settingsData.pay_rate_hevea, payRateCacao: settingsData.pay_rate_cacao,
          marketPriceHevea: settingsData.market_price_hevea, marketPriceCacao: settingsData.market_price_cacao,
          cacaoPayRatio: settingsData.cacao_pay_ratio
        } : INITIAL_SETTINGS
      });
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const initialize = async () => {
      const { data: { session: s } } = await supabase.auth.getSession();
      if (!mounted) return;
      if (s) {
        setSession(s);
        fetchData();
        // Fetch profile explicitly
        const { data: p } = await supabase.from('profiles').select('*').eq('id', s.user.id).maybeSingle();
        if (mounted && p) {
          setProfile(p);
        }
      } else {
        setIsLoading(false);
      }
    };
    initialize();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, s) => {
      if (!mounted) return;
      setSession(s);
      if (s) {
        fetchData();
        const { data: p } = await supabase.from('profiles').select('*').eq('id', s.user.id).maybeSingle();
        if (mounted) setProfile(p);
      } else {
        setIsLoading(false);
        setProfile(null);
      }
    });
    
    return () => { mounted = false; subscription.unsubscribe(); };
  }, [fetchData]);

  if (!session && !isLoading) return <Auth version={APP_VERSION} />;
  
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 text-emerald-950">
      <div className="flex flex-col items-center gap-6">
        <div className="bg-emerald-900 p-8 rounded-[3rem] text-white shadow-2xl animate-bounce">
          <Scale className="w-12 h-12" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-2xl font-black tracking-tighter">AgriPay</span>
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800/40">Synchronisation...</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col pb-24 md:pb-0 safe-top text-slate-900">
      <header className="h-24 bg-white/80 backdrop-blur-xl border-b border-stone-200 px-6 md:px-12 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="bg-emerald-900 p-3 rounded-[1.25rem] text-white shadow-lg group-hover:scale-105 transition-transform">
              <Scale className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tighter leading-none text-emerald-950">AgriPay</span>
                {profile?.role === 'ADMIN' && (
                  <span className="bg-rose-600 text-white px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-lg shadow-rose-600/20">
                    Admin
                  </span>
                )}
              </div>
              <span className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest">{APP_VERSION}</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-1 bg-stone-100 p-1.5 rounded-2xl">
            {[
              { id: 'dashboard', label: 'Bilan', icon: LayoutDashboard },
              { id: 'employees', label: 'Équipe', icon: Users },
              { id: 'journal', label: 'Journal', icon: BookOpen },
              { id: 'settings', label: 'Options', icon: SettingsIcon, adminOnly: true }
            ].map(tab => {
              if (tab.adminOnly && profile?.role !== 'ADMIN') return null;
              const isActive = activeTab === tab.id;
              return (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isActive ? 'bg-white text-emerald-900 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                >
                  <tab.icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : ''}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => { setIsRefreshing(true); fetchData(); }} className={`p-3 bg-stone-100 rounded-2xl transition-all active:scale-90 ${isRefreshing ? 'animate-spin text-emerald-600' : 'text-stone-400'}`} title="Actualiser"><RefreshCw className="w-5 h-5" /></button>
          <button onClick={() => { supabase.auth.signOut(); window.location.reload(); }} className="p-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-100 transition-all active:scale-90" title="Déconnexion"><LogOut className="w-5 h-5" /></button>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
        {activeTab === 'dashboard' && <Dashboard data={data} onExport={() => {}} onNavigateToEmployee={(id) => { setSelectedEmployeeId(id); setActiveTab('employees'); }} userRole={profile?.role} />}
        {activeTab === 'employees' && (
          <EmployeeManager 
            employees={data.employees} 
            entrepreneurs={data.entrepreneurs} 
            harvests={data.harvests} 
            advances={data.advances} 
            workTasks={data.workTasks} 
            selectedId={selectedEmployeeId} 
            onSelectId={setSelectedEmployeeId} 
            onAdd={async (e) => { await supabase.from('employees').insert([{...e, status: 'ACTIF', icon_name:'user', color: PRESET_COLORS[data.employees.length % PRESET_COLORS.length], user_id: session?.user?.id}]); fetchData(); }} 
            onAddEntrepreneur={async (en) => { await supabase.from('entrepreneurs').insert([{...en, color: PRESET_COLORS[data.entrepreneurs.length % PRESET_COLORS.length]}]); fetchData(); }}
            onUpdateStatus={async (id, s) => { await supabase.from('employees').update({ status: s }).eq('id', id); fetchData(); }} 
            onClearBalance={(id, amount) => setShowExpenseModal({ employeeId: id, amount, category: 'AVANCE' })} 
            onQuickHarvest={(id) => setShowHarvestModal({ employeeId: id })}
            onQuickTask={(id) => setShowTaskModal({ employeeId: id })}
            onDeleteEmployee={(id) => setPendingDeletion({table:'employees', id, label:"l'Employé"})} 
            onDeleteEntrepreneur={(id) => setPendingDeletion({table:'entrepreneurs', id, label:"le Prestataire"})} 
            canDelete={isAdmin} 
            canEdit={canManage} 
          />
        )}
        {activeTab === 'journal' && (
          <CalendarView 
            employees={data.employees} 
            entrepreneurs={data.entrepreneurs} 
            harvests={data.harvests} 
            advances={data.advances} 
            workTasks={data.workTasks} 
            rainEvents={data.rainEvents} 
            onDeleteHarvest={(id) => setPendingDeletion({table:'harvests', id, label:'cette récolte'})} 
            onDeleteAdvance={(id) => setPendingDeletion({table:'advances', id, label:'cette dépense'})} 
            onDeleteTask={(id) => setPendingDeletion({table:'work_tasks', id, label:'ce travail'})} 
            onAddRain={(date) => setShowRainModal({ date })} 
            onDeleteRain={(id) => setPendingDeletion({table:'rain_events', id, label:'cette météo'})} 
            onQuickHarvest={(date) => setShowHarvestModal({ date })}
            onQuickTask={(date) => setShowTaskModal({ date })}
            onQuickAdvance={(date) => setShowExpenseModal({ date, category: 'AVANCE' })}
          />
        )}
        {profile?.role === 'ADMIN' && activeTab === 'settings' && <SettingsView version={APP_VERSION} settings={data.settings} onUpdate={async (s) => { await supabase.from('settings').upsert({id: 1, pay_rate_hevea: s.payRateHevea, pay_rate_cacao: s.payRateCacao, market_price_hevea: s.marketPriceHevea, market_price_cacao: s.marketPriceCacao, cacao_pay_ratio: s.cacaoPayRatio}); fetchData(); }} />}
      </main>

      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-2xl border-t border-stone-200 flex items-center justify-around py-5 z-50 safe-bottom shadow-[0_-15px_40px_rgba(0,0,0,0.05)] rounded-t-[2.5rem]">
        {[
          { id: 'dashboard', label: 'Bilan', icon: LayoutDashboard },
          { id: 'employees', label: 'Équipe', icon: Users },
          { id: 'journal', label: 'Journal', icon: BookOpen },
          { id: 'settings', label: 'Options', icon: SettingsIcon, adminOnly: true }
        ].map(tab => {
          if (tab.adminOnly && profile?.role !== 'ADMIN') return null;
          const isActive = activeTab === tab.id;
          return (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)} 
              className={`flex flex-col items-center gap-1.5 transition-all ${isActive ? 'text-emerald-700 scale-110' : 'text-stone-400'}`}
            >
              <tab.icon className={`w-6 h-6 ${isActive ? 'fill-emerald-700/10' : ''}`} />
              <span className="text-[9px] font-black uppercase tracking-tighter">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {canManage && (
        <div className="fixed bottom-28 right-6 flex flex-col gap-4 md:bottom-12 md:right-12 z-30">
          <button onClick={() => setShowHarvestModal(true)} className="w-16 h-16 bg-emerald-700 text-white rounded-[1.75rem] shadow-2xl flex items-center justify-center border-4 border-white hover:scale-110 active:scale-90 transition-all" title="Nouvelle Récolte"><Scale className="w-7 h-7" /></button>
          <button onClick={() => setShowTaskModal(true)} className="w-16 h-16 bg-sky-700 text-white rounded-[1.75rem] shadow-2xl flex items-center justify-center border-4 border-white hover:scale-110 active:scale-90 transition-all" title="Nouveau Travail"><Pickaxe className="w-7 h-7" /></button>
          <button onClick={() => setShowExpenseModal(true)} className="w-16 h-16 bg-amber-600 text-white rounded-[1.75rem] shadow-2xl flex items-center justify-center border-4 border-white hover:scale-110 active:scale-90 transition-all" title="Nouveau Paiement / Avance"><Wallet className="w-7 h-7" /></button>
        </div>
      )}

      {pendingDeletion && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-emerald-950/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 text-center space-y-8 shadow-2xl animate-in zoom-in-95">
            <div className="w-24 h-24 bg-rose-50 text-rose-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner"><AlertTriangle className="w-12 h-12" /></div>
            <div className="space-y-2">
              <h4 className="text-2xl font-black text-emerald-950 tracking-tighter">Supprimer ?</h4>
              <p className="text-stone-500 text-sm font-medium">Voulez-vous vraiment retirer {pendingDeletion.label} ? Cette action est irréversible.</p>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <button onClick={async () => { await supabase.from(pendingDeletion.table).delete().eq('id', pendingDeletion.id); fetchData(); setPendingDeletion(null); }} className="w-full py-5 bg-rose-600 text-white rounded-[1.75rem] font-black uppercase tracking-widest text-[10px] shadow-xl shadow-rose-600/20 active:scale-95 transition-all">Confirmer Suppression</button>
              <button onClick={() => setPendingDeletion(null)} className="w-full py-5 bg-stone-100 text-stone-400 rounded-[1.75rem] font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all">Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
