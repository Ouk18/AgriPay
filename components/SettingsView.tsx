
import React, { useState } from 'react';
import { MarketSettings, UserProfile, UserRole, Employee, Entrepreneur } from '../types.ts';
import { 
  Save, Scale, Percent, ShieldCheck, UserCog, User, Trash2, Mail, ShieldAlert,
  UserPlus, Key, ChevronDown, Check, X, Shield, RefreshCw, Link as LinkIcon, Loader2, FileSpreadsheet, Download, AlertCircle, DatabaseZap
} from 'lucide-react';

interface Props {
  settings: MarketSettings;
  onUpdate: (settings: MarketSettings) => void;
  version?: string;
  profiles?: UserProfile[];
  employees?: Employee[];
  entrepreneurs?: Entrepreneur[];
  onUpdateProfile?: (p: UserProfile) => Promise<void>;
  onCreateAccount?: (username: string, pass: string, role: UserRole, entityId?: string) => Promise<void>;
  onUpdatePassword?: (userId: string, newPass: string) => Promise<void>;
  onFullExport?: () => void;
  onRefreshProfiles?: () => Promise<void>;
}

const SettingsView: React.FC<Props> = ({ 
  settings, onUpdate, version, profiles, employees = [], entrepreneurs = [], 
  onUpdateProfile, onCreateAccount, onFullExport, onRefreshProfiles
}) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [activeSubTab, setActiveSubTab] = useState<'market' | 'users' | 'backup'>(profiles ? 'users' : 'market');
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPass, setNewPass] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('EMPLOYE');
  const [newEntityId, setNewEntityId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!onRefreshProfiles) return;
    setIsRefreshing(true);
    try {
      await onRefreshProfiles();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onCreateAccount) return;
    setIsSubmitting(true);
    try {
      await onCreateAccount(newUsername, newPass, newRole, newEntityId || undefined);
      setShowAddUser(false);
      setNewUsername('');
      setNewPass('');
      setNewEntityId('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
        <div className="space-y-1">
          <h3 className="text-3xl font-black text-emerald-950 tracking-tighter leading-none">Configuration</h3>
          <p className="text-sm text-stone-500 font-medium">Réglages et gestion des accès.</p>
        </div>
        
        {profiles && (
          <div className="flex bg-stone-100 p-1.5 rounded-2xl border border-stone-200">
            <button onClick={() => setActiveSubTab('market')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'market' ? 'bg-white text-emerald-900 shadow-sm border border-stone-200' : 'text-stone-400'}`}>Marché</button>
            <button onClick={() => setActiveSubTab('users')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'users' ? 'bg-white text-emerald-900 shadow-sm border border-stone-200' : 'text-stone-400'}`}>Comptes</button>
            <button onClick={() => setActiveSubTab('backup')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'backup' ? 'bg-white text-emerald-900 shadow-sm border border-stone-200' : 'text-stone-400'}`}>Sauvegarde</button>
          </div>
        )}
      </div>

      {activeSubTab === 'market' && (
        <div className="space-y-8 animate-in slide-in-from-right">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-xl space-y-6">
              <h4 className="font-black text-emerald-700 uppercase text-xs tracking-widest flex items-center gap-2"><Scale className="w-4 h-4" /> Hévéa</h4>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-1">Prix Marché (FCFA)</label>
                  <input type="number" value={localSettings.marketPriceHevea} onChange={e => setLocalSettings({...localSettings, marketPriceHevea: Number(e.target.value)})} className="w-full px-4 py-3 bg-gray-50 rounded-2xl outline-none font-black text-emerald-700" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-1">Tarif Ouvrier (FCFA)</label>
                  <input type="number" value={localSettings.payRateHevea} onChange={e => setLocalSettings({...localSettings, payRateHevea: Number(e.target.value)})} className="w-full px-4 py-3 bg-emerald-50 rounded-2xl outline-none font-black text-emerald-900 text-2xl" />
                </div>
              </div>
            </div>
            <div className="bg-amber-950 p-8 rounded-[2.5rem] shadow-xl text-white space-y-6">
              <h4 className="font-black uppercase text-xs tracking-widest flex items-center gap-2 text-amber-500"><Percent className="w-4 h-4" /> Cacao</h4>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-amber-300/50 uppercase tracking-widest ml-1">Prix Marché (FCFA)</label>
                  <input type="number" value={localSettings.marketPriceCacao} onChange={e => setLocalSettings({...localSettings, marketPriceCacao: Number(e.target.value)})} className="w-full px-4 py-3 bg-white/10 rounded-2xl outline-none font-black text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-amber-300/50 uppercase tracking-widest ml-1">Ratio Paie ({(localSettings.cacaoPayRatio * 100).toFixed(1)}%)</label>
                  <input type="range" min="0.1" max="0.5" step="0.001" value={localSettings.cacaoPayRatio} onChange={e => setLocalSettings({...localSettings, cacaoPayRatio: Number(e.target.value)})} className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-400" />
                </div>
              </div>
            </div>
          </div>
          <button onClick={() => onUpdate(localSettings)} className="w-full py-5 bg-emerald-950 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-2xl active:scale-95 transition-all">Enregistrer Tarifs Marché</button>
        </div>
      )}

      {activeSubTab === 'users' && (
        <div className="space-y-8 animate-in slide-in-from-right duration-300">
          <div className="bg-white p-8 rounded-[3rem] border border-stone-200 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl"><UserCog className="w-6 h-6" /></div>
                <div>
                  <h4 className="font-black text-emerald-950">Sécurité et Accès</h4>
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Gestion des Comptes</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleRefresh} className={`p-4 bg-stone-100 rounded-2xl transition-all ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`}><RefreshCw className="w-4 h-4" /></button>
                <button onClick={() => setShowAddUser(!showAddUser)} className="flex items-center gap-3 px-6 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all">
                   {showAddUser ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />} {showAddUser ? 'Annuler' : 'Ajouter'}
                </button>
              </div>
            </div>

            {showAddUser && (
              <form onSubmit={handleAddUser} className="bg-stone-50 p-8 rounded-[2.5rem] border border-stone-100 space-y-4 animate-in slide-in-from-top">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl outline-none font-bold" placeholder="Nom d'utilisateur" required />
                  <input type="text" value={newPass} onChange={e => setNewPass(e.target.value)} className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl outline-none font-bold" placeholder="Mot de passe" required minLength={6} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select value={newRole} onChange={e => setNewRole(e.target.value as UserRole)} className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl outline-none font-black uppercase text-[10px]">
                    <option value="EMPLOYE">Employé</option>
                    <option value="GERANT">Gérant</option>
                    <option value="FOURNISSEUR">Fournisseur</option>
                    <option value="ADMIN">Administrateur</option>
                  </select>
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-emerald-900 text-white rounded-2xl font-black uppercase text-[10px] active:scale-95 transition-all flex items-center justify-center gap-3">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Créer Compte
                </button>
              </form>
            )}

            <div className="space-y-4">
              <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 space-y-4">
                 <div className="flex items-center gap-3 text-amber-800">
                    <ShieldAlert className="w-5 h-5" />
                    <h5 className="font-black uppercase text-[10px] tracking-widest">Important : Validation Email</h5>
                 </div>
                 <p className="text-[10px] font-bold text-amber-900/70 leading-relaxed">
                   Si vous recevez l'erreur <b>"Email is invalid"</b>, allez dans votre console Supabase : <br/>
                   <b>{"Auth > Settings > Email Auth"}</b> et décochez <b>"Confirm email"</b>.
                 </p>
              </div>

              {profiles && profiles.length > 0 ? (
                profiles.map(p => (
                  <div key={p.id} className="flex justify-between items-center p-6 bg-stone-50 rounded-[2rem] border border-stone-100 hover:bg-white transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md ${p.role === 'ADMIN' ? 'bg-rose-600' : 'bg-emerald-700'}`}>
                        {p.role === 'ADMIN' ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-black text-emerald-950 text-sm tracking-tight">{p.username}</p>
                        <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">{p.role}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-stone-300 font-black uppercase text-[10px]">Aucun compte visible. Assurez-vous d'avoir exécuté le script SQL de réparation.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'backup' && (
        <div className="space-y-8 animate-in slide-in-from-right duration-300">
           <div className="bg-emerald-950 p-12 rounded-[3.5rem] shadow-2xl text-white space-y-8 relative overflow-hidden">
             <div className="flex items-center gap-6">
                <div className="p-5 bg-white/10 rounded-[2rem] text-emerald-400 border border-white/10"><FileSpreadsheet className="w-10 h-10" /></div>
                <div><h4 className="text-2xl font-black tracking-tighter">Export Rapport</h4></div>
             </div>
             <button onClick={onFullExport} className="w-full flex items-center justify-center gap-4 py-6 bg-emerald-500 text-emerald-950 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all">
               <Download className="w-6 h-6" /> Télécharger (.CSV)
             </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default SettingsView;
