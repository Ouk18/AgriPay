
import React, { useState } from 'react';
import { Employee, CropType } from '../types.ts';
import { X, UserPlus, Phone, FileText, Pickaxe, Scale } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSubmit: (emp: any) => void;
  initialData?: Employee;
}

const EmployeeForm: React.FC<Props> = ({ onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    crop: initialData?.crop || 'HEVEA' as CropType,
    phone: initialData?.phone || '',
    notes: initialData?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-md">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 bg-emerald-600 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <UserPlus className="w-6 h-6" />
            <h3 className="text-xl font-black uppercase tracking-tight">
              {initialData ? 'Modifier Manœuvre' : 'Nouveau Manœuvre'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X className="w-6 h-6" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Nom Complet</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
              placeholder="Ex: Kouassi Koffi"
              required 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Culture Principale</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({...formData, crop: 'HEVEA'})}
                className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-xs uppercase border-2 transition-all ${formData.crop === 'HEVEA' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-gray-50 text-gray-400 border-gray-100'}`}
              >
                <Scale className="w-4 h-4" /> Hévéa
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, crop: 'CACAO'})}
                className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-xs uppercase border-2 transition-all ${formData.crop === 'CACAO' ? 'bg-amber-600 text-white border-amber-600' : 'bg-gray-50 text-gray-400 border-gray-100'}`}
              >
                <Pickaxe className="w-4 h-4" /> Cacao
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Téléphone (Optionnel)</label>
            <div className="relative">
              <Phone className="absolute left-4 top-4 w-5 h-5 text-gray-300" />
              <input 
                type="tel" 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                placeholder="0700000000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Notes</label>
            <textarea 
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium min-h-[80px]"
              placeholder="Informations complémentaires..."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 text-gray-400 font-black uppercase text-[10px] tracking-widest">Annuler</button>
            <button type="submit" className="flex-2 py-4 px-8 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-600/20 active:scale-95 transition-all">
              {initialData ? 'Mettre à jour' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;
