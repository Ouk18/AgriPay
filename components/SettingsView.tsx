
import React, { useState } from 'react';
import { MarketSettings } from '../types.ts';
import { Save, TrendingUp, DollarSign, Info, Percent, Scale, Github, ShieldCheck } from 'lucide-react';

interface Props {
  settings: MarketSettings;
  onUpdate: (settings: MarketSettings) => void;
  version?: string;
}

const SettingsView: React.FC<Props> = ({ settings, onUpdate, version }) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(localSettings);
    alert("Paramètres enregistrés avec succès !");
  };

  const cacaoPercent = Math.round(localSettings.cacaoPayRatio * 1000) / 10;

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="mb-8">
        <h3 className="text-2xl font-black text-gray-900 mb-2">Configuration de l'Exploitation</h3>
        <p className="text-sm text-gray-500">Gérez vos prix de vente et les tarifs de paie par culture.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* TARIFS HÉVÉA */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <Scale className="w-5 h-5" />
              </div>
              <h4 className="font-black text-gray-900 uppercase text-sm tracking-tight">Hévéa (Tarif Fixe)</h4>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Prix Marché (Vente FCFA/kg)</label>
                <input 
                  type="number" 
                  value={localSettings.marketPriceHevea}
                  onChange={e => setLocalSettings({...localSettings, marketPriceHevea: Number(e.target.value)})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-black text-emerald-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Paie Ouvrier (Tarif Fixe FCFA/kg)</label>
                <input 
                  type="number" 
                  value={localSettings.payRateHevea}
                  onChange={e => setLocalSettings({...localSettings, payRateHevea: Number(e.target.value)})}
                  className="w-full px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-black text-emerald-900 text-2xl"
                />
                <p className="text-[10px] text-emerald-600 font-bold italic">Standard conseillé : 75 FCFA</p>
              </div>
            </div>
          </div>

          {/* TARIFS CACAO */}
          <div className="bg-amber-900 p-8 rounded-[2.5rem] shadow-xl text-white space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-500 rounded-xl text-white">
                <Percent className="w-5 h-5" />
              </div>
              <h4 className="font-black uppercase text-sm tracking-tight">Cacao (Règle du Partage)</h4>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-amber-200 uppercase tracking-widest">Prix Marché (Vente FCFA/kg)</label>
                <input 
                  type="number" 
                  value={localSettings.marketPriceCacao}
                  onChange={e => setLocalSettings({...localSettings, marketPriceCacao: Number(e.target.value)})}
                  className="w-full px-4 py-3 bg-amber-800/50 border border-amber-700 rounded-2xl focus:ring-2 focus:ring-amber-400 outline-none font-black text-white"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-end mb-1">
                  <label className="text-xs font-bold text-amber-200 uppercase tracking-widest">Part Ouvrier (Ratio)</label>
                  <span className="text-xl font-black text-white">{cacaoPercent}%</span>
                </div>
                <input 
                  type="range" 
                  min="0.1" 
                  max="0.5" 
                  step="0.001"
                  value={localSettings.cacaoPayRatio}
                  onChange={e => setLocalSettings({...localSettings, cacaoPayRatio: Number(e.target.value)})}
                  className="w-full h-2 bg-amber-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
                <div className="flex justify-between text-[10px] font-black text-amber-500 uppercase tracking-tighter">
                  <button type="button" onClick={() => setLocalSettings({...localSettings, cacaoPayRatio: 0.25})}>1/4 (25%)</button>
                  <button type="button" onClick={() => setLocalSettings({...localSettings, cacaoPayRatio: 0.3333})}>1/3 (33.3%)</button>
                  <button type="button" onClick={() => setLocalSettings({...localSettings, cacaoPayRatio: 0.5})}>1/2 (50%)</button>
                </div>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                <p className="text-[10px] text-amber-200 font-bold uppercase tracking-widest">Tarif généré :</p>
                <p className="text-xl font-black text-amber-400">{Math.round(localSettings.marketPriceCacao * localSettings.cacaoPayRatio)} FCFA/kg</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            className="flex items-center gap-3 px-10 py-5 bg-gray-900 text-white rounded-[2rem] font-black hover:bg-black transition-all shadow-xl active:scale-95 uppercase tracking-widest text-xs"
          >
            <Save className="w-5 h-5" />
            Mettre à jour les tarifs
          </button>
        </div>
      </form>

      {/* FOOTER INFOS / VERSION */}
      <div className="pt-12 mt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm">
             <ShieldCheck className="w-6 h-6" />
           </div>
           <div>
             <p className="text-sm font-black text-gray-900">AgriPay Management System</p>
             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Propulsé par Vercel & Supabase</p>
           </div>
        </div>
        <div className="flex flex-col items-center md:items-end">
           <div className="px-4 py-2 bg-gray-50 rounded-2xl border border-gray-100">
             <span className="text-xs font-black text-gray-500 uppercase tracking-widest">{version || 'v1.0.0'}</span>
           </div>
           <p className="text-[9px] text-gray-300 font-bold mt-2 uppercase">© 2024 - Tous droits réservés</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
