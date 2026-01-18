
import React, { useState, useEffect } from 'react';
import { Employee, Advance, PaymentMethod } from '../types.ts';
import { X, Wallet, CreditCard, Banknote, FileText } from 'lucide-react';

interface Props {
  employees: Employee[];
  onClose: () => void;
  onSubmit: (advance: Omit<Advance, 'id'>) => void;
  initialData?: { employeeId?: string; amount?: number };
}

const AdvanceForm: React.FC<Props> = ({ employees, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    employeeId: initialData?.employeeId || employees[0]?.id || '',
    amount: initialData?.amount?.toString() || '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'ESPECES' as PaymentMethod,
    notes: '',
  });

  // Synchroniser si les initialData changent (pour le cas du bouton "Solder")
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        employeeId: initialData.employeeId || prev.employeeId,
        amount: initialData.amount?.toString() || prev.amount
      }));
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employeeId) return;

    // Fixed: Added mandatory category property
    onSubmit({
      employeeId: formData.employeeId,
      amount: Number(formData.amount),
      date: formData.date,
      category: 'AVANCE',
      paymentMethod: formData.paymentMethod,
      notes: formData.notes,
    });
  };

  const isPreFilled = !!initialData?.amount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
        <div className={`p-6 text-white flex justify-between items-center ${isPreFilled ? 'bg-red-700' : 'bg-amber-900'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isPreFilled ? 'bg-red-500' : 'bg-amber-500'}`}>
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{isPreFilled ? 'Solde de Compte' : 'Nouvelle Avance'}</h3>
              {isPreFilled && <p className="text-xs text-red-200 uppercase font-black tracking-widest">Règlement final du dû</p>}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Employé bénéficiaire</label>
            <select 
              value={formData.employeeId}
              onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
              className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 outline-none font-black transition-all ${isPreFilled ? 'focus:ring-red-500' : 'focus:ring-amber-500'}`}
              required
              disabled={isPreFilled} // On verrouille si c'est un solde pré-rempli
            >
              {employees.length === 0 && <option value="">Aucun employé actif</option>}
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.name} ({e.crop})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Montant (FCFA)</label>
              <input 
                type="number" 
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 outline-none font-black text-2xl transition-all ${isPreFilled ? 'focus:ring-red-500 text-red-700' : 'focus:ring-amber-500 text-amber-700'}`}
                placeholder="0"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Date</label>
              <input 
                type="date" 
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 outline-none font-medium ${isPreFilled ? 'focus:ring-red-500' : 'focus:ring-amber-500'}`}
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-bold text-gray-700">Mode de Paiement</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, paymentMethod: 'ESPECES' })}
                className={`flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm border-2 transition-all ${formData.paymentMethod === 'ESPECES' ? 'bg-amber-600 text-white border-amber-600 shadow-md' : 'bg-gray-50 text-gray-500 border-gray-100'}`}
              >
                <Banknote className="w-4 h-4" /> Espèces
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, paymentMethod: 'VIREMENT' })}
                className={`flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm border-2 transition-all ${formData.paymentMethod === 'VIREMENT' ? 'bg-amber-600 text-white border-amber-600 shadow-md' : 'bg-gray-50 text-gray-500 border-gray-100'}`}
              >
                <CreditCard className="w-4 h-4" /> Virement / Mobile
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Note / Raison de l'avance
            </label>
            <textarea
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 min-h-[80px]"
              placeholder="Ex: Avance pour frais médicaux, Scolarité, Solde fin de mois..."
            />
          </div>

          <div className={`p-5 rounded-2xl border ${isPreFilled ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}>
            <p className={`text-xs font-bold leading-relaxed ${isPreFilled ? 'text-red-800' : 'text-amber-800'}`}>
              {isPreFilled 
                ? "Attention: Ce montant correspond au solde total dû à l'employé. Une fois confirmé, son compte sera à zéro."
                : "Note: Cette avance sera déduite automatiquement du solde final à payer."}
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-100 rounded-2xl transition-colors">
              Annuler
            </button>
            <button 
              type="submit" 
              className={`flex-2 text-white py-4 px-8 rounded-2xl font-black transition-all shadow-lg active:scale-95 uppercase tracking-tighter ${isPreFilled ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20' : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'}`}
            >
              {isPreFilled ? 'Confirmer le Solde' : 'Valider Versement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdvanceForm;
