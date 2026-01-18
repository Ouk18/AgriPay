
import React, { useState, useEffect } from "react";
import { supabase } from '../lib/supabase.ts';
import { Scale, Mail, Lock, Loader2, ArrowRight, ShieldCheck, User, CheckCircle2 } from 'lucide-react';

interface Props {
  version?: string;
}

const Auth: React.FC<Props> = ({ version }) => {
  const [loading, setLoading] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger l'identifiant sauvegardé au démarrage
  useEffect(() => {
    const savedId = localStorage.getItem('agripay_remembered_id');
    if (savedId) {
      setIdentifier(savedId);
      setRememberMe(true);
    }
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Nettoyage strict pour l'email technique interne
      const cleanId = identifier.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
      const internalEmail = identifier.includes('@') ? identifier : `${cleanId}@agripay-manager.pro`;
      
      const { error: authError } = await supabase.auth.signInWithPassword({ email: internalEmail, password });
      
      if (authError) throw authError;

      // Sauvegarder l'identifiant si "Se souvenir de moi" est coché
      if (rememberMe) {
        localStorage.setItem('agripay_remembered_id', identifier);
      } else {
        localStorage.removeItem('agripay_remembered_id');
      }

    } catch (err: any) {
      setError(err.message === 'Invalid login credentials' ? 'Identifiant ou mot de passe incorrect' : 'Erreur de connexion : identifiant introuvable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-950 p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-800/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-900/40 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
      
      <div className="bg-white w-full max-w-md rounded-[3.5rem] p-10 shadow-2xl space-y-8 relative z-10 border border-white/20 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center space-y-4">
          <div className="bg-emerald-600 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-emerald-600/30 rotate-3 transition-transform hover:rotate-0">
            <Scale className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter leading-none">AgriPay</h1>
            <p className="text-gray-500 font-bold text-sm flex items-center justify-center gap-2 mt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Gestion Plantation
            </p>
          </div>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-3">Votre Identifiant</label>
            <div className="relative group">
              <User className="absolute left-6 top-5 w-5 h-5 text-stone-300 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="text" 
                value={identifier} 
                onChange={e => setIdentifier(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:bg-white font-bold transition-all placeholder:text-stone-300"
                placeholder="ex: gerant_paul" 
                required 
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-3">Mot de passe</label>
            <div className="relative group">
              <Lock className="absolute left-6 top-5 w-5 h-5 text-stone-300 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:bg-white font-bold transition-all placeholder:text-stone-300"
                placeholder="••••••••" 
                required 
              />
            </div>
          </div>

          <div className="flex items-center justify-between px-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input 
                  type="checkbox" 
                  checked={rememberMe} 
                  onChange={e => setRememberMe(e.target.checked)}
                  className="sr-only" 
                />
                <div className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${rememberMe ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-stone-200'}`}>
                  {rememberMe && <CheckCircle2 className="w-4 h-4 text-white" />}
                </div>
              </div>
              <span className="text-[11px] font-black text-stone-500 uppercase tracking-tight">Se souvenir de moi</span>
            </label>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl animate-in shake-100">
              <p className="text-rose-600 text-[10px] font-black text-center uppercase tracking-tight leading-tight">{error}</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-emerald-600 text-white py-6 rounded-[2rem] font-black shadow-2xl shadow-emerald-600/30 hover:bg-emerald-700 hover:-translate-y-1 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:translate-y-0"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
              <>
                Accéder à ma plantation
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="pt-6 border-t border-gray-50 flex flex-col items-center gap-4 text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
            Système sécurisé AgriPay Manager
          </p>
          <div className="px-4 py-1.5 bg-gray-50 rounded-full border border-gray-100">
             <span className="text-[9px] font-black text-emerald-900/30 tracking-widest uppercase">{version}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
