
import React, { useState } from "react";
import { supabase } from '../lib/supabase.ts';
import { Scale, Mail, Lock, Loader2, ArrowRight, ShieldCheck, User } from 'lucide-react';

interface Props {
  version?: string;
}

const Auth: React.FC<Props> = ({ version }) => {
  const [loading, setLoading] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Reconstitution de l'email technique interne (doit correspondre au domaine de App.tsx)
      const cleanId = identifier.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
      const internalEmail = identifier.includes('@') ? identifier : `${cleanId}@agripay-manager.pro`;
      
      const { error } = await supabase.auth.signInWithPassword({ email: internalEmail, password });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message === 'Invalid login credentials' ? 'Identifiant ou mot de passe incorrect' : 'Erreur de connexion : e-mail invalide ou bloqué par Supabase');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-950 p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-800/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl space-y-8 relative z-10 border border-white/20">
        <div className="text-center space-y-4">
          <div className="bg-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-xl">
            <Scale className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter leading-none">AgriPay Privé</h1>
            <p className="text-gray-500 font-medium text-sm flex items-center justify-center gap-2 mt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Accès Plantation
            </p>
          </div>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Identifiant</label>
            <div className="relative">
              <User className="absolute left-5 top-5 w-4 h-4 text-stone-300" />
              <input 
                type="text" value={identifier} onChange={e => setIdentifier(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold transition-all"
                placeholder="ex: gerant_paul" required 
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-5 top-5 w-4 h-4 text-stone-300" />
              <input 
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold transition-all"
                placeholder="••••••••" required 
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-[10px] font-bold text-center uppercase tracking-tight bg-red-50 py-2 rounded-xl border border-red-100">{error}</p>}

          <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-emerald-700 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Accéder à ma plantation"}
          </button>
        </form>

        <div className="pt-4 border-t border-gray-50 flex flex-col items-center gap-4 text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
            Identifiants fournis par l'administration.
          </p>
          <div className="px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
             <span className="text-[9px] font-black text-gray-400 tracking-widest uppercase">{version}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
