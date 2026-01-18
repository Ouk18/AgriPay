
import React, { useState } from 'react';
import { X, Truck, Briefcase, Phone, UserPlus } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSubmit: (en: any) => void;
}

const EntrepreneurForm: React.FC<Props> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    phone: '',
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-md">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 bg-emerald-600 text-white flex justify-between items-center">
          <div className="flex items-center gap-3"><Truck className="w-6 h-6" /><h3 className="text-xl font-black uppercase">Nouveau Prestataire</h3></div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X className="w-6 h-6" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Nom de l'Entreprise / Nom</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold" placeholder="Ex: Boutique Engrais San-Pedro" required />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Domaine / Spécialité</label>
            <input type="text" value={formData.specialty} onChange={e => setFormData({...formData, specialty: e.target.value})} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold" placeholder="Ex: Fourniture Engrais, Mécanique..." />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Contact</label>
            <div className="relative"><Phone className="absolute left-4 top-4 w-5 h-5 text-gray-300" /><input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold" placeholder="0123456789" /></div>
          </div>
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 text-gray-400 font-black uppercase text-[10px]">Annuler</button>
            <button type="submit" className="flex-2 py-4 px-8 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] shadow-xl">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EntrepreneurForm;
