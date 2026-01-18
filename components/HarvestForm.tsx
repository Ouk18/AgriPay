
import React, { useState, useEffect } from 'react';
import { Employee, Harvest, MarketSettings } from '../types.ts';
import { X, Scale, Calculator } from 'lucide-react';

interface Props {
  employees: Employee[];
  settings: MarketSettings;
  onClose: () => void;
  onSubmit: (harvest: Omit<Harvest, 'id'>) => void;
  initialEmployeeId?: string;
  initialDate?: string;
}

const HarvestForm: React.FC<Props> = ({ employees, settings, onClose, onSubmit, initialEmployeeId, initialDate }) => {
  const [formData, setFormData] = useState({
    employeeId: initialEmployeeId || (employees.length > 0 ? employees[0].id : ''),
    weight: '',
    date: initialDate || new Date().toISOString().split('T')[0],
    payRate: '',
  });

  const selectedEmployee = employees.find(e => e.id === formData.employeeId);
  
  const getProposedRate = () => {
    if (!selectedEmployee) return 0;
    if (selectedEmployee.crop === 'HEVEA') {
      return settings.payRateHevea;
    } else {
      return Math.round(settings.marketPriceCacao * settings.cacaoPayRatio);
    }
  };

  useEffect(() => {
    if (selectedEmployee) {
      setFormData(prev => ({ ...prev, payRate: getProposedRate().toString() }));
    }
  }, [formData.employeeId, settings, selectedEmployee]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    onSubmit({
      employeeId: formData.employeeId,
      weight: Number(formData.weight),
      date: formData.date,
      payRate: formData.payRate === '' ? getProposedRate() : Number(formData.payRate),
      crop: selectedEmployee.crop
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-md">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 bg-emerald-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-emerald-800 rounded-xl"><Scale className="w-6 h-6" /></div>
             <h3 className="text-xl font-black uppercase">Nouvelle Récolte</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X className="w-6 h-6" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Employé</label>
            <select 
              value={formData.employeeId}
              onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-emerald-500"
              required
              disabled={!!initialEmployeeId}
            >
              <option value="">Sélectionner un ouvrier...</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.crop})</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Poids (kg)</label>
              <input type="number" step="0.1" value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-black text-xl text-emerald-900" placeholder="0.0" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Tarif (F/kg)</label>
              <input type="number" value={formData.payRate} onChange={e => setFormData({ ...formData, payRate: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-black text-xl text-emerald-700" required />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Date de récolte</label>
            <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl font-bold outline-none" required />
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 text-gray-400 font-black uppercase text-[10px] tracking-widest">Annuler</button>
            <button type="submit" className="flex-2 bg-emerald-600 text-white py-4 px-8 rounded-2xl font-black shadow-xl uppercase tracking-widest text-[10px]">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HarvestForm;
