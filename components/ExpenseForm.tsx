
import React, { useState, useEffect } from 'react';
import { Employee, Advance, PaymentMethod, Entrepreneur, ExpenseCategory } from '../types.ts';
import { X, Wallet, CreditCard, Banknote, FileText, ShoppingBag, Truck, User, Info, Pickaxe, Briefcase } from 'lucide-react';

interface Props {
  employees: Employee[];
  entrepreneurs: Entrepreneur[];
  onClose: () => void;
  onSubmit: (expense: Omit<Advance, 'id'>) => void;
  initialData?: { employeeId?: string; amount?: number; date?: string };
}

const CATEGORIES: { value: ExpenseCategory; label: string; icon: any; color: string }[] = [
  { value: 'AVANCE', label: 'Avance Salaire', icon: Wallet, color: 'text-emerald-600' },
  { value: 'ENGRAIS', label: 'Engrais / Produits', icon: ShoppingBag, color: 'text-blue-600' },
  { value: 'MATERIEL', label: 'Matériel', icon: Pickaxe, color: 'text-amber-600' },
  { value: 'TRANSPORT', label: 'Transport', icon: Truck, color: 'text-purple-600' },
  { value: 'TRAVAUX', label: 'Travaux Exceptionnels', icon: Briefcase, color: 'text-red-600' },
  { value: 'DIVERS', label: 'Divers', icon: Info, color: 'text-gray-600' }
];

const ExpenseForm: React.FC<Props> = ({ employees, entrepreneurs, onClose, onSubmit, initialData }) => {
  const [beneficiaryType, setBeneficiaryType] = useState<'EMPLOYE' | 'PRESTATAIRE'>(initialData?.employeeId ? 'EMPLOYE' : 'EMPLOYE');
  const [formData, setFormData] = useState({
    employeeId: initialData?.employeeId || '',
    entrepreneurId: '',
    amount: initialData?.amount?.toString() || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    category: (initialData?.amount ? 'AVANCE' : 'AVANCE') as ExpenseCategory, // Par défaut AVANCE pour les employés
    paymentMethod: 'ESPECES' as PaymentMethod,
    notes: initialData?.amount ? 'Règlement final du solde' : '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      employeeId: beneficiaryType === 'EMPLOYE' ? formData.employeeId : undefined,
      entrepreneurId: beneficiaryType === 'PRESTATAIRE' ? formData.entrepreneurId : undefined,
      amount: Number(formData.amount),
      date: formData.date,
      category: formData.category,
      paymentMethod: formData.paymentMethod,
      notes: formData.notes,
    });
  };

  const isSettleMode = !!initialData?.amount;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-200">
        <div className={`p-6 text-white flex justify-between items-center ${isSettleMode ? 'bg-red-700' : 'bg-amber-900'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isSettleMode ? 'bg-red-500' : 'bg-amber-500'}`}><ShoppingBag className="w-6 h-6" /></div>
            <div>
              <h3 className="text-xl font-black">{isSettleMode ? 'Règlement Solde' : 'Nouvelle Opération'}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Sortie de caisse</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X className="w-6 h-6" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          
          {!isSettleMode && (
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Type de Bénéficiaire</label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setBeneficiaryType('EMPLOYE')} className={`flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-[10px] uppercase border-2 transition-all ${beneficiaryType === 'EMPLOYE' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-gray-50 text-gray-400'}`}><User className="w-4 h-4" /> Employé</button>
                <button type="button" onClick={() => setBeneficiaryType('PRESTATAIRE')} className={`flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-[10px] uppercase border-2 transition-all ${beneficiaryType === 'PRESTATAIRE' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-gray-50 text-gray-400'}`}><Truck className="w-4 h-4" /> Prestataire</button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Choisir le Bénéficiaire</label>
            <select 
              value={beneficiaryType === 'EMPLOYE' ? formData.employeeId : formData.entrepreneurId}
              onChange={e => setFormData({ ...formData, [beneficiaryType === 'EMPLOYE' ? 'employeeId' : 'entrepreneurId']: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-amber-500"
              required
              disabled={isSettleMode}
            >
              <option value="">Sélectionner...</option>
              {beneficiaryType === 'EMPLOYE' 
                ? employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.crop})</option>)
                : entrepreneurs.map(en => <option key={en.id} value={en.id}>{en.name} - {en.specialty || 'Fournisseur'}</option>)
              }
            </select>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Catégorie de dépense</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat.value })}
                  className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all ${formData.category === cat.value ? 'bg-gray-900 text-white border-gray-900 shadow-lg' : 'bg-gray-50 text-gray-400 border-gray-100'}`}
                >
                  <cat.icon className={`w-4 h-4 ${formData.category === cat.value ? 'text-white' : cat.color}`} />
                  <span className="text-[8px] font-black uppercase text-center">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Montant (FCFA)</label>
              <input type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-black text-2xl text-emerald-900 outline-none focus:ring-2 focus:ring-amber-500" placeholder="0" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Date</label>
              <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-amber-500" required />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Mode de Règlement</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setFormData({ ...formData, paymentMethod: 'ESPECES' })} className={`flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-[10px] uppercase border-2 transition-all ${formData.paymentMethod === 'ESPECES' ? 'bg-gray-900 text-white border-gray-900 shadow-md' : 'bg-gray-50 text-gray-400'}`}><Banknote className="w-4 h-4" /> Espèces</button>
              <button type="button" onClick={() => setFormData({ ...formData, paymentMethod: 'VIREMENT' })} className={`flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-[10px] uppercase border-2 transition-all ${formData.paymentMethod === 'VIREMENT' ? 'bg-gray-900 text-white border-gray-900 shadow-md' : 'bg-gray-50 text-gray-400'}`}><CreditCard className="w-4 h-4" /> Mobile Money</button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Note / Détails</label>
            <textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none min-h-[80px] font-medium focus:ring-2 focus:ring-amber-500" placeholder="Détails sur l'avance ou l'achat..." />
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 text-gray-400 font-black uppercase text-[10px] tracking-widest">Annuler</button>
            <button type="submit" className="flex-2 bg-amber-600 text-white py-4 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95">Valider</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;
