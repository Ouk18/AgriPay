
import React, { useState } from 'react';
import { RainEvent, RainIntensity, RainPeriod } from '../types.ts';
import { X, CloudRain, Droplets, Clock } from 'lucide-react';

interface Props {
  date: string;
  onClose: () => void;
  onSubmit: (rain: Omit<RainEvent, 'id'>) => void;
}

const RainForm: React.FC<Props> = ({ date, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<{
    intensity: RainIntensity;
    period: RainPeriod;
  }>({
    intensity: 'MODERE',
    period: 'MATIN',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      date,
      intensity: formData.intensity,
      period: formData.period,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-950/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-xl">
              <CloudRain className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Signalement Pluie</h3>
              <p className="text-xs text-blue-200 font-medium">{new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="space-y-4">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Droplets className="w-4 h-4" /> Intensité de la pluie
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['FAIBLE', 'MODERE', 'FORTE'] as RainIntensity[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormData({ ...formData, intensity: level })}
                  className={`py-3 rounded-2xl font-black text-xs transition-all border-2 ${
                    formData.intensity === level 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20 scale-105' 
                    : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-blue-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-4 h-4" /> Période de la journée
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['MATIN', 'APRES-MIDI', 'NUIT'] as RainPeriod[]).map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => setFormData({ ...formData, period: period })}
                  className={`py-3 rounded-2xl font-black text-xs transition-all border-2 ${
                    formData.period === period 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20 scale-105' 
                    : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-blue-200'
                  }`}
                >
                  {period === 'APRES-MIDI' ? 'A-MIDI' : period}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-100 rounded-2xl transition-colors">
              Annuler
            </button>
            <button type="submit" className="flex-2 bg-blue-600 text-white py-4 px-8 rounded-2xl font-black hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 active:scale-95">
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RainForm;
