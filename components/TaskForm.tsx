
import React, { useState } from 'react';
import { Employee, WorkTask } from '../types.ts';
import { X, ClipboardList, Pickaxe } from 'lucide-react';

interface Props {
  employees: Employee[];
  onClose: () => void;
  onSubmit: (task: Omit<WorkTask, 'id'>) => void;
  initialEmployeeId?: string;
  initialDate?: string;
}

const TaskForm: React.FC<Props> = ({ employees, onClose, onSubmit, initialEmployeeId, initialDate }) => {
  const [formData, setFormData] = useState({
    employeeId: initialEmployeeId || (employees.length > 0 ? employees[0].id : ''),
    description: '',
    amount: '',
    date: initialDate || new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employeeId) return;
    onSubmit({
      employeeId: formData.employeeId,
      description: formData.description,
      amount: Number(formData.amount),
      date: formData.date,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-blue-950/40 backdrop-blur-md">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-200">
        <div className="p-6 bg-blue-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-xl"><Pickaxe className="w-6 h-6" /></div>
            <h3 className="text-xl font-black uppercase">Nouveau Travail</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-6 h-6" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Employé solicité</label>
            <select 
              value={formData.employeeId}
              onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-blue-500"
              required
              disabled={!!initialEmployeeId}
            >
              <option value="">Sélectionner un ouvrier...</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.crop})</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Description du travail</label>
            <input 
              type="text" 
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Entretien parcelle 4, Nettoyage..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Montant (FCFA)</label>
              <input type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-black text-blue-700 text-lg" placeholder="0" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Date</label>
              <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-blue-500" required />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
            <p className="text-[10px] text-blue-800 leading-relaxed font-bold italic text-center uppercase tracking-tighter">Note: Ces travaux seront ajoutés au solde de l'ouvrier sans impacter les volumes de récolte.</p>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-100 rounded-2xl transition-colors uppercase text-[10px] tracking-widest">Annuler</button>
            <button type="submit" className="flex-2 bg-blue-600 text-white py-4 px-8 rounded-2xl font-black shadow-lg active:scale-95 uppercase text-[10px] tracking-widest">Valider Travail</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
