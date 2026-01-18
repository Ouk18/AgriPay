
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Scale, Wallet, Pickaxe, Loader2, LogOut, LayoutDashboard, 
  Users, Calendar as CalendarIcon, Settings as SettingsIcon, 
  RefreshCw, BookOpen, DatabaseZap, AlertCircle, Timer, AlertTriangle,
  UserCog, FileDown, FileSpreadsheet, ClipboardList
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from './lib/supabase.ts';
import { Employee, Harvest, Advance, RainEvent, MarketSettings, AppData, UserProfile, Entrepreneur, UserRole } from './types.ts';
import Dashboard from './components/Dashboard.tsx';
import EmployeeManager from './components/EmployeeManager.tsx';
import CalendarView from './components/CalendarView.tsx';
import SettingsView from './components/SettingsView.tsx';
import HarvestForm from './components/HarvestForm.tsx';
import ExpenseForm from './components/ExpenseForm.tsx';
import RainForm from './components/RainForm.tsx';
import TaskForm from './components/TaskForm.tsx';
import Auth from './components/Auth.tsx';

const APP_VERSION = "v3.2.8";

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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'employees' | 'journal' | 'settings'>('journal');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [data, setData] = useState<AppData>({
    employees: [],
    entrepreneurs: [],
    harvests: [],
    advances: [],
    workTasks: [],
    rainEvents: [],
    settings: INITIAL_SETTINGS,
    profiles: []
  });

  const [pendingDeletion, setPendingDeletion] = useState<{ table: string; id: string; label: string } | null>(null);
  const [showHarvestModal, setShowHarvestModal] = useState<{ employeeId?: string; date?: string } | boolean>(false);
  const [showTaskModal, setShowTaskModal] = useState<{ employeeId?: string; date?: string } | boolean>(false);
  const [showExpenseModal, setShowExpenseModal] = useState<{ employeeId?: string; amount?: number; date?: string; category?: any } | boolean>(false);
  const [showRainModal, setShowRainModal] = useState<{ date: string } | null>(null);

  const isAdmin = profile?.role === 'ADMIN' || (!profile && session);
  const isGerant = profile?.role === 'GERANT';
  const canManage = isAdmin || isGerant;

  const handleLogout = useCallback(async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    } catch (e) {
      window.location.reload();
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    setErrorMessage(null);
    try {
      const results = await Promise.allSettled([
        supabase.from('employees').select('*').order('name'),
        supabase.from('entrepreneurs').select('*').order('name'),
        supabase.from('harvests').select('*').order('date', { ascending: false }),
        supabase.from('advances').select('*').order('date', { ascending: false }),
        supabase.from('work_tasks').select('*').order('date', { ascending: false }),
        supabase.from('rain_events').select('*').order('date', { ascending: false }),
        supabase.from('settings').select('*').maybeSingle(),
        supabase.from('profiles').select('*')
      ]);

      const [employeesRes, entrepreneursRes, harvestsRes, advancesRes, tasksRes, rainRes, settingsRes, profilesRes] = results;

      let profilesData: UserProfile[] = [];
      if (profilesRes.status === 'fulfilled') {
        if (profilesRes.value.error) {
          console.error("Erreur Profiles:", profilesRes.value.error);
        } else {
          profilesData = (profilesRes.value.data || []).map((p: any) => ({
            id: p.id,
            username: p.username || p.email?.split('@')[0] || 'Inconnu',
            role: p.role || 'EMPLOYE',
            linked_entity_id: p.linked_entity_id
          }));
        }
      }

      setData({
        employees: (employeesRes.status === 'fulfilled' ? (employeesRes.value.data || []) : []).map((e: any) => ({
          id: e.id, name: e.name, status: e.status, crop: e.crop, color: e.color || PRESET_COLORS[0],
          iconName: e.icon_name || 'user', createdAt: new Date(e.created_at || Date.now()).getTime(),
          phone: e.phone, notes: e.notes, user_id: e.user_id
        })),
        entrepreneurs: (entrepreneursRes.status === 'fulfilled' ? (entrepreneursRes.value.data || []) : []).map((en: any) => ({
          id: en.id, name: en.name, specialty: en.specialty, phone: en.phone, color: en.color || '#0284c7', user_id: en.user_id
        })),
        harvests: (harvestsRes.status === 'fulfilled' ? (harvestsRes.value.data || []) : []).map((h: any) => ({ 
          id: h.id, employeeId: h.employee_id, date: h.date, weight: h.weight, payRate: h.pay_rate, crop: h.crop 
        })),
        advances: (advancesRes.status === 'fulfilled' ? (advancesRes.value.data || []) : []).map((a: any) => ({ 
          id: a.id, employeeId: a.employee_id, entrepreneurId: a.entrepreneur_id, 
          date: a.date, amount: a.amount, category: a.category || 'AVANCE',
          paymentMethod: a.payment_method, notes: a.notes 
        })),
        workTasks: (tasksRes.status === 'fulfilled' ? (tasksRes.value.data || []) : []).map((t: any) => ({ 
          id: t.id, employeeId: t.employee_id, date: t.date, description: t.description, amount: t.amount 
        })),
        rainEvents: rainRes.status === 'fulfilled' ? (rainRes.value.data || []) : [],
        settings: (settingsRes.status === 'fulfilled' && settingsRes.value.data) ? {
          payRateHevea: settingsRes.value.data.pay_rate_hevea, payRateCacao: settingsRes.value.data.pay_rate_cacao,
          marketPriceHevea: settingsRes.value.data.market_price_hevea, marketPriceCacao: settingsRes.value.data.market_price_cacao,
          cacaoPayRatio: settingsRes.value.data.cacao_pay_ratio
        } : INITIAL_SETTINGS,
        profiles: profilesData
      });
      setIsLoading(false);
    } catch (err) {
      setErrorMessage("Erreur système lors du chargement des données.");
      setIsLoading(false);
    }
  }, []);

  const handleCreateAccount = async (username: string, pass: string, role: UserRole, entityId?: string) => {
    try {
      // Nettoyage strict pour l'email technique
      const cleanUsername = username.toLowerCase().trim()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Supprime les accents
        .replace(/[^a-z0-9]/g, ""); // Ne garde QUE les lettres et chiffres
      
      if (cleanUsername.length < 3) throw new Error("Le nom d'utilisateur est trop court ou contient des caractères interdits.");

      // Domaine plus "standard" pour éviter les filtres de domaine invalide
      const internalEmail = `${cleanUsername}@agripay-manager.pro`;
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: internalEmail,
        password: pass,
        options: { data: { username, role, linked_entity_id: entityId } }
      });

      if (authError) {
        if (authError.message.includes("invalid")) {
          throw new Error(`Supabase rejette l'email "${internalEmail}". Désactivez la validation d'email (Confirm Email) dans votre Dashboard Supabase > Auth > Settings.`);
        }
        throw authError;
      }

      if (authData.user) {
        // Insertion forcée dans Profiles avec l'email
        const { error: profileError } = await supabase.from('profiles').insert([{
          id: authData.user.id,
          email: internalEmail,
          username: username,
          role: role,
          linked_entity_id: entityId
        }]);

        if (profileError) {
          console.warn("Échec insertion profil:", profileError.message);
        }
        
        if (entityId) {
          const table = role === 'EMPLOYE' ? 'employees' : 'entrepreneurs';
          await supabase.from(table).update({ user_id: authData.user.id }).eq('id', entityId);
        }
      }

      alert(`Compte '${username}' créé avec succès.`);
      await fetchData();
    } catch (err: any) {
      alert("Erreur lors de la création : " + err.message);
    }
  };

  const handleExportCSV = useCallback(() => {
    const { harvests, advances, workTasks, employees } = data;
    let csv = "RAPPORT COMPTABLE - AGRIPAY\n";
    csv += "--- ETAT DES SOLDES ---\nNom;Poste;Dû (F)\n";
    employees.forEach(emp => {
      const empH = harvests.filter(h => h.employeeId === emp.id).reduce((acc, h) => acc + (h.weight * h.payRate), 0);
      const empT = workTasks.filter(t => t.employeeId === emp.id).reduce((acc, t) => acc + t.amount, 0);
      const empA = advances.filter(a => a.employeeId === emp.id).reduce((acc, a) => acc + a.amount, 0);
      csv += `${emp.name};${emp.crop};${Math.round(empH + empT - empA)}\n`;
    });
    
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `EXPORT_AGRIPAY.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  }, [data]);

  useEffect(() => {
    let mounted = true;
    const initAuth = async () => {
      const { data: { session: s } } = await supabase.auth.getSession();
      if (!mounted) return;
      if (s) {
        setSession(s); 
        await fetchData();
        
        let { data: p } = await supabase.from('profiles').select('*').eq('id', s.user.id).maybeSingle();
        
        if (mounted && !p) {
          const meta = s.user.user_metadata || {};
          const { data: newP, error: repairError } = await supabase.from('profiles').upsert({
            id: s.user.id,
            email: s.user.email,
            username: meta.username || s.user.email?.split('@')[0] || 'Utilisateur',
            role: meta.role || 'EMPLOYE',
            linked_entity_id: meta.linked_entity_id
          }).select().single();
          
          if (!repairError && newP) {
            p = newP;
            await fetchData();
          }
        }

        if (mounted && p) setProfile({ id: p.id, username: p.username || 'Utilisateur', role: p.role, linked_entity_id: p.linked_entity_id });
      } else setIsLoading(false);
    };
    initAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((e, s) => {
      if (mounted) { 
        if (e === 'SIGNED_OUT') { setSession(null); setProfile(null); setIsLoading(false); } 
        else if (s) { setSession(s); fetchData(); } 
      }
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, [fetchData]);

  if (!session && !isLoading) return <Auth version={APP_VERSION} />;
  
  if (isLoading || errorMessage) return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-950 text-white p-6">
      <div className="text-center space-y-8 animate-in fade-in">
         <div className="p-10 bg-emerald-900 rounded-[3rem] shadow-2xl animate-pulse">
           <Scale className="w-16 h-16" />
         </div>
         <h1 className="text-3xl font-black">Chargement...</h1>
         {errorMessage && <p className="text-rose-400 font-bold">{errorMessage}</p>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col pb-24 md:pb-0 safe-top text-slate-900">
      <header className="h-24 bg-white/80 backdrop-blur-xl border-b border-stone-200 px-6 md:px-12 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="bg-emerald-900 p-3 rounded-[1.25rem] text-white shadow-lg transition-transform group-hover:scale-105">
              <Scale className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tighter text-emerald-950">AgriPay</span>
                <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase text-white shadow-lg ${isAdmin ? 'bg-rose-600' : 'bg-blue-600'}`}>
                  {profile?.role || 'ADMIN'}
                </span>
              </div>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{profile?.username || 'Utilisateur'}</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-1 bg-stone-100 p-1.5 rounded-2xl">
            {[
              { id: 'dashboard', label: 'Bilan', icon: LayoutDashboard },
              { id: 'employees', label: 'Équipe', icon: Users, roles: ['ADMIN', 'GERANT'] },
              { id: 'journal', label: 'Journal', icon: BookOpen },
              { id: 'settings', label: 'Options', icon: SettingsIcon, roles: ['ADMIN', 'GERANT'] }
            ].map(tab => {
              if (tab.roles && profile && !tab.roles.includes(profile.role)) return null;
              const isActive = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase transition-all ${isActive ? 'bg-white text-emerald-900 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}>
                  <tab.icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : ''}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => { setIsRefreshing(true); fetchData().then(() => setIsRefreshing(false)); }} className={`p-3 bg-stone-100 rounded-2xl active:scale-90 transition-all ${isRefreshing ? 'animate-spin text-emerald-600' : 'text-stone-400'}`}><RefreshCw className="w-5 h-5" /></button>
          <button onClick={handleLogout} className="p-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-100 transition-all active:scale-90"><LogOut className="w-5 h-5" /></button>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full">
        {activeTab === 'dashboard' && <Dashboard data={data} onExport={handleExportCSV} onNavigateToEmployee={(id) => { setSelectedEmployeeId(id); setActiveTab('employees'); }} userRole={profile?.role} />}
        
        {activeTab === 'employees' && canManage && (
          <EmployeeManager 
            employees={data.employees} entrepreneurs={data.entrepreneurs} harvests={data.harvests} advances={data.advances} workTasks={data.workTasks} 
            selectedId={selectedEmployeeId} onSelectId={setSelectedEmployeeId} 
            onAdd={async (e) => { 
              const { error } = await supabase.from('employees').insert([{
                name: e.name, crop: e.crop, phone: e.phone, notes: e.notes, status: 'ACTIF',
                color: PRESET_COLORS[data.employees.length % PRESET_COLORS.length],
                icon_name: 'user'
              }]); 
              if (error) alert("Erreur : " + error.message); else await fetchData(); 
            }} 
            onAddEntrepreneur={async (en) => { 
              const { error } = await supabase.from('entrepreneurs').insert([{
                name: en.name, specialty: en.specialty, phone: en.phone, color: PRESET_COLORS[data.entrepreneurs.length % PRESET_COLORS.length]
              }]); 
              if (error) alert("Erreur : " + error.message); else await fetchData(); 
            }}
            onUpdateEmployee={async (id, e) => {
              const { error } = await supabase.from('employees').update({ name: e.name, crop: e.crop, phone: e.phone, notes: e.notes }).eq('id', id);
              if (error) alert("Erreur : " + error.message); else await fetchData();
            }}
            onUpdateStatus={async (id, s) => { await supabase.from('employees').update({ status: s }).eq('id', id); await fetchData(); }} 
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
            employees={data.employees} entrepreneurs={data.entrepreneurs} harvests={data.harvests} advances={data.advances} workTasks={data.workTasks} rainEvents={data.rainEvents} 
            onDeleteHarvest={(id) => setPendingDeletion({table:'harvests', id, label:'cette récolte'})} 
            onDeleteAdvance={(id) => setPendingDeletion({table:'advances', id, label:'cette dépense'})} 
            onDeleteTask={(id) => setPendingDeletion({table:'work_tasks', id, label:'ce travail'})} 
            onAddRain={(date) => setShowRainModal({ date })} 
            onDeleteRain={(id) => setPendingDeletion({table:'rain_events', id, label:'cette météo'})} 
            onQuickHarvest={(date) => canManage && setShowHarvestModal({ date })}
            onQuickTask={(date) => canManage && setShowTaskModal({ date })}
            onQuickAdvance={(date) => canManage && setShowExpenseModal({ date, category: 'AVANCE' })}
            canManage={canManage}
          />
        )}

        {activeTab === 'settings' && canManage && (
          <SettingsView 
            version={APP_VERSION} settings={data.settings} 
            onUpdate={async (s) => { await supabase.from('settings').upsert({id: 1, pay_rate_hevea: s.payRateHevea, pay_rate_cacao: s.payRateCacao, market_price_hevea: s.marketPriceHevea, market_price_cacao: s.marketPriceCacao, cacao_pay_ratio: s.cacaoPayRatio}); await fetchData(); }}
            profiles={isAdmin ? data.profiles : undefined}
            employees={data.employees}
            entrepreneurs={data.entrepreneurs}
            onUpdateProfile={async (p) => { await supabase.from('profiles').update({ role: p.role, linked_entity_id: p.linked_entity_id }).eq('id', p.id); await fetchData(); }}
            onCreateAccount={handleCreateAccount}
            onFullExport={handleExportCSV}
            onRefreshProfiles={fetchData}
          />
        )}
      </main>

      {pendingDeletion && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-md animate-in fade-in">
          <div className="bg-white w-full max-sm rounded-[3rem] p-10 text-center space-y-8 shadow-2xl animate-in zoom-in-95">
            <AlertTriangle className="w-16 h-16 text-rose-600 mx-auto" />
            <div className="space-y-2">
              <h4 className="text-2xl font-black text-emerald-950 tracking-tighter">Supprimer ?</h4>
              <p className="text-stone-500 text-sm">Action irréversible.</p>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={async () => { await supabase.from(pendingDeletion.table).delete().eq('id', pendingDeletion.id); await fetchData(); setPendingDeletion(null); }} className="w-full py-5 bg-rose-600 text-white rounded-[1.75rem] font-black uppercase text-[10px]">Confirmer</button>
              <button onClick={() => setPendingDeletion(null)} className="w-full py-5 bg-stone-100 text-stone-400 rounded-[1.75rem] font-black uppercase text-[10px]">Annuler</button>
            </div>
          </div>
        </div>
      )}

      {canManage && (
        <div className="fixed bottom-28 right-6 flex flex-col gap-4 md:bottom-12 md:right-12 z-30">
          <button onClick={() => setShowHarvestModal(true)} title="Noter Récolte" className="w-16 h-16 bg-emerald-700 text-white rounded-[1.75rem] shadow-2xl flex items-center justify-center border-4 border-white hover:scale-110 active:scale-90 transition-all"><Scale className="w-7 h-7" /></button>
          <button onClick={() => setShowTaskModal(true)} title="Noter Tâche" className="w-16 h-16 bg-sky-700 text-white rounded-[1.75rem] shadow-2xl flex items-center justify-center border-4 border-white hover:scale-110 active:scale-90 transition-all"><Pickaxe className="w-7 h-7" /></button>
          <button onClick={() => setShowExpenseModal(true)} title="Noter Sortie" className="w-16 h-16 bg-amber-600 text-white rounded-[1.75rem] shadow-2xl flex items-center justify-center border-4 border-white hover:scale-110 active:scale-90 transition-all"><Wallet className="w-7 h-7" /></button>
        </div>
      )}

      {showHarvestModal && <HarvestForm employees={data.employees.filter(e => e.status === 'ACTIF')} settings={data.settings} onClose={() => setShowHarvestModal(false)} onSubmit={async (h) => { await supabase.from('harvests').insert([{employee_id: h.employeeId, weight: h.weight, pay_rate: h.payRate, date: h.date, crop: h.crop}]); await fetchData(); setShowHarvestModal(false); }} initialEmployeeId={typeof showHarvestModal === 'object' ? (showHarvestModal as any).employeeId : undefined} initialDate={typeof showHarvestModal === 'object' ? (showHarvestModal as any).date : undefined} />}
      {showTaskModal && <TaskForm employees={data.employees.filter(e => e.status === 'ACTIF')} onClose={() => setShowTaskModal(false)} onSubmit={async (t) => { await supabase.from('work_tasks').insert([{employee_id: t.employeeId, description: t.description, amount: t.amount, date: t.date}]); await fetchData(); setShowTaskModal(false); }} initialEmployeeId={typeof showTaskModal === 'object' ? (showTaskModal as any).employeeId : undefined} initialDate={typeof showTaskModal === 'object' ? (showTaskModal as any).date : undefined} />}
      {showExpenseModal && <ExpenseForm employees={data.employees} entrepreneurs={data.entrepreneurs} onClose={() => setShowExpenseModal(false)} onSubmit={async (a) => { await supabase.from('advances').insert([{employee_id: a.employeeId, entrepreneur_id: a.entrepreneurId, amount: a.amount, date: a.date, category: a.category, payment_method: a.paymentMethod, notes: a.notes}]); await fetchData(); setShowExpenseModal(false); }} initialData={typeof showExpenseModal === 'object' ? showExpenseModal : undefined} />}
      {showRainModal && <RainForm date={showRainModal.date} onClose={() => setShowRainModal(null)} onSubmit={async (r) => { await supabase.from('rain_events').insert([r]); await fetchData(); setShowRainModal(null); }} />}
      
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-stone-200 px-6 flex items-center justify-between z-40 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {[
          { id: 'dashboard', label: 'Bilan', icon: LayoutDashboard },
          { id: 'employees', label: 'Équipe', icon: Users, roles: ['ADMIN', 'GERANT'] },
          { id: 'journal', label: 'Journal', icon: BookOpen },
          { id: 'settings', label: 'Options', icon: SettingsIcon, roles: ['ADMIN', 'GERANT'] }
        ].map(tab => {
          if (tab.roles && profile && !tab.roles.includes(profile.role)) return null;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex flex-col items-center gap-1 transition-all ${isActive ? 'text-emerald-700' : 'text-stone-400'}`}>
              <tab.icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[8px] font-black uppercase tracking-widest">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default App;
