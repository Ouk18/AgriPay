
import React, { useState } from 'react';
import { supabase } from '../lib/supabase.ts';
import { Scale, Mail, Lock, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';

interface Props {
  version?: string;
}

const Auth: React.FC<Props> = ({ version }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-950 p-4 relative overflow-hidden">
      {/* Éléments décoratifs de fond */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-800/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-900/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      
      <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl space-y-8 relative z-10 border border-white/20">
        <div className="text-center space-y-4">
          <div className="bg-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-xl">
            <Scale className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter">AgriPay Privé</h1>
            <p className="text-gray-500 font-medium text-sm flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Système d'accès restreint
            </p>
          </div>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Email</label>
            <input 
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium transition-all"
              placeholder="votre@email.com" required 
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Mot de passe</label>
            <input 
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium transition-all"
              placeholder="••••••••" required 
            />
          </div>

          {error && <p className="text-red-500 text-[10px] font-bold text-center uppercase tracking-tight bg-red-50 py-2 rounded-xl border border-red-100 animate-pulse">{error}</p>}

          <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-emerald-700 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Accéder à ma plantation"}
          </button>
        </form>

        <div className="pt-4 border-t border-gray-50 flex flex-col items-center gap-4">
          <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
            Si vous n'avez pas de compte, veuillez contacter le gérant.
          </p>
          {version && (
            <div className="px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
               <span className="text-[9px] font-black text-gray-400 tracking-widest uppercase">{version}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
