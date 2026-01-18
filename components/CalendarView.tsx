
import React, { useState } from 'react';
import { Harvest, Advance, RainEvent, Employee, WorkTask, Entrepreneur } from '../types.ts';
import { 
  ChevronLeft, ChevronRight, Scale, Wallet, Trash2, 
  CloudRain, Clock, Pickaxe, Info, ShoppingBag, Truck, Plus
} from 'lucide-react';

interface Props {
  employees: Employee[];
  entrepreneurs: Entrepreneur[];
  harvests: Harvest[];
  advances: Advance[];
  workTasks: WorkTask[];
  rainEvents: RainEvent[];
  onDeleteHarvest: (id: string) => void;
  onDeleteAdvance: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onAddRain: (date: string) => void;
  onDeleteRain: (id: string) => void;
  onQuickHarvest: (date: string) => void;
  onQuickTask: (date: string) => void;
  onQuickAdvance: (date: string) => void;
}

const CalendarView: React.FC<Props> = ({ 
  employees, entrepreneurs, harvests, advances, workTasks, rainEvents, 
  onDeleteHarvest, onDeleteAdvance, onDeleteTask, onAddRain, onDeleteRain,
  onQuickHarvest, onQuickTask, onQuickAdvance
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(new Date().toISOString().split('T')[0]);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  const formatDate = (day: number) => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return d.toISOString().split('T')[0];
  };

  const dailyHarvests = harvests.filter(h => h.date === selectedDate);
  const dailyAdvances = advances.filter(a => a.date === selectedDate);
  const dailyTasks = workTasks.filter(t => t.date === selectedDate);
  const dailyRain = rainEvents.filter(r => r.date === selectedDate);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      <div className="bg-white rounded-[3rem] p-6 md:p-10 border shadow-xl shadow-gray-200/50">
        <div className="flex justify-between items-center mb-8 px-2">
          <div>
            <h3 className="text-2xl font-black text-emerald-950 capitalize tracking-tighter">
              {currentMonth.toLocaleDateString('fr-FR', { month: 'long' })}
            </h3>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">{currentMonth.getFullYear()}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-3 bg-gray-50 hover:bg-emerald-50 rounded-2xl text-gray-400 hover:text-emerald-600 transition-all active:scale-90"><ChevronLeft className="w-6 h-6" /></button>
            <button onClick={nextMonth} className="p-3 bg-gray-50 hover:bg-emerald-50 rounded-2xl text-gray-400 hover:text-emerald-600 transition-all active:scale-90"><ChevronRight className="w-6 h-6" /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 md:gap-3">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
            <div key={d} className="py-2 text-center text-[9px] font-black text-gray-300 uppercase tracking-widest">{d}</div>
          ))}
          {Array.from({ length: adjustedFirstDay }).map((_, i) => <div key={`p-${i}`} className="h-16 md:h-24 opacity-0"></div>)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = formatDate(day);
            const isToday = new Date().toISOString().split('T')[0] === dateStr;
            const isSelected = selectedDate === dateStr;
            
            const dayHarvests = harvests.filter(h => h.date === dateStr);
            const dayAdvances = advances.filter(a => a.date === dateStr);
            const dayTasks = workTasks.filter(t => t.date === dateStr);
            const hasRain = rainEvents.some(r => r.date === dateStr);

            return (
              <button 
                key={day} 
                onClick={() => setSelectedDate(dateStr)}
                className={`h-20 md:h-32 p-1.5 rounded-2xl transition-all flex flex-col items-center border-4 relative btn-haptic ${isSelected ? 'bg-emerald-50 border-emerald-600' : isToday ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'bg-white border-transparent hover:bg-gray-50'}`}
              >
                <span className={`text-sm md:text-xl font-black ${isSelected && !isToday ? 'text-emerald-700' : ''}`}>{day}</span>
                
                {/* ICONES D'ACTIVITÉ AGRANDIES POUR PC */}
                <div className="flex flex-wrap gap-0.5 md:gap-1.5 justify-center mt-auto w-full pb-1 md:pb-2 overflow-hidden px-1">
                  {hasRain && <CloudRain className={`w-2.5 h-2.5 md:w-5 md:h-5 ${isToday ? 'text-white' : 'text-blue-400'}`} />}
                  {dayHarvests.map((h, idx) => {
                    const emp = employees.find(e => e.id === h.employeeId);
                    return <Scale key={`h-${idx}`} className="w-2 h-2 md:w-4 md:h-4" style={{ color: isToday ? 'white' : emp?.color }} />;
                  })}
                  {dayTasks.map((t, idx) => {
                    const emp = employees.find(e => e.id === t.employeeId);
                    return <Pickaxe key={`t-${idx}`} className="w-2 h-2 md:w-4 md:h-4" style={{ color: isToday ? 'white' : emp?.color }} />;
                  })}
                  {dayAdvances.map((a, idx) => {
                    if (a.entrepreneurId) return <ShoppingBag key={`e-${idx}`} className={`w-2 h-2 md:w-4 md:h-4 ${isToday ? 'text-white' : 'text-blue-500'}`} />;
                    const emp = employees.find(e => e.id === a.employeeId);
                    return <Wallet key={`a-${idx}`} className="w-2 h-2 md:w-4 md:h-4" style={{ color: isToday ? 'white' : emp?.color }} />;
                  })}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white p-8 rounded-[3rem] border shadow-xl shadow-gray-200/50 space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center px-2">
            <div>
               <h4 className="font-black text-lg text-emerald-950 tracking-tighter">Activités du Jour</h4>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{selectedDate && new Date(selectedDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>
            <button onClick={() => selectedDate && onAddRain(selectedDate)} className="flex items-center gap-2 px-5 py-3 bg-blue-50 text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest btn-haptic">
              <CloudRain className="w-4 h-4" /> Pluie
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 px-2">
            <button 
              onClick={() => selectedDate && onQuickHarvest(selectedDate)}
              className="flex flex-col items-center gap-1.5 p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 btn-haptic"
            >
              <Scale className="w-5 h-5" />
              <span className="text-[9px] font-black uppercase">+ Récolte</span>
            </button>
            <button 
              onClick={() => selectedDate && onQuickTask(selectedDate)}
              className="flex flex-col items-center gap-1.5 p-4 bg-blue-50 text-blue-700 rounded-2xl border border-blue-100 btn-haptic"
            >
              <Pickaxe className="w-5 h-5" />
              <span className="text-[9px] font-black uppercase">+ Travail</span>
            </button>
            <button 
              onClick={() => selectedDate && onQuickAdvance(selectedDate)}
              className="flex flex-col items-center gap-1.5 p-4 bg-amber-50 text-amber-700 rounded-2xl border border-amber-100 btn-haptic"
            >
              <Wallet className="w-5 h-5" />
              <span className="text-[9px] font-black uppercase">+ Avance</span>
            </button>
          </div>
        </div>
        
        <div className="space-y-3">
          {[...dailyRain, ...dailyHarvests, ...dailyTasks, ...dailyAdvances].length === 0 ? (
            <div className="text-center py-12 px-6 space-y-3 opacity-30">
              <Info className="w-10 h-10 mx-auto" />
              <p className="text-xs font-black uppercase tracking-widest">Rien à signaler</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dailyRain.map(r => (
                <div key={r.id} className="flex justify-between items-center p-5 bg-blue-50 text-blue-900 rounded-[2rem] border border-blue-100">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm"><CloudRain className="w-6 h-6" /></div>
                     <div>
                       <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Météo</span>
                       <span className="font-black text-sm block">Pluie {r.intensity} ({r.period})</span>
                     </div>
                  </div>
                  <button onClick={() => onDeleteRain(r.id)} className="p-3 bg-white/50 text-red-500 rounded-2xl active:scale-75"><Trash2 className="w-5 h-5" /></button>
                </div>
              ))}
              
              {[...dailyHarvests, ...dailyTasks, ...dailyAdvances].map((item: any) => {
                const emp = employees.find(e => e.id === item.employeeId);
                const en = entrepreneurs.find(e => e.id === item.entrepreneurId);
                const isHarvest = !!item.weight;
                const isTask = !!item.description;
                const isAdvance = !isHarvest && !isTask;
                const isExternal = !!item.entrepreneurId;

                return (
                  <div key={item.id} className={`flex justify-between items-center p-5 rounded-[2rem] border ${isExternal ? 'bg-blue-50 border-blue-100' : isAdvance ? 'bg-amber-50 border-amber-100' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: isExternal ? '#2563eb' : (emp?.color || '#cbd5e1') }}>
                        {isHarvest ? <Scale className="w-6 h-6" /> : isTask ? <Pickaxe className="w-6 h-6" /> : isExternal ? <ShoppingBag className="w-6 h-6" /> : <Wallet className="w-6 h-6" />}
                      </div>
                      <div>
                        <p className="font-black text-sm text-emerald-950">{isExternal ? en?.name : emp?.name}</p>
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${isExternal ? 'text-blue-600' : isAdvance ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {isHarvest ? `${item.weight}kg ${item.crop}` : isTask ? item.description : `${item.category || 'Paiement'} ${item.paymentMethod}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className={`font-black text-sm ${isAdvance || isExternal ? 'text-red-600' : 'text-emerald-900'}`}>
                            {isAdvance || isExternal ? `-${item.amount.toLocaleString()} F` : isTask ? `${item.amount.toLocaleString()} F` : `${(item.weight * item.payRate).toLocaleString()} F`}
                        </span>
                      </div>
                      <button onClick={() => {
                          if (isHarvest) onDeleteHarvest(item.id);
                          else if (isTask) onDeleteTask(item.id);
                          else onDeleteAdvance(item.id);
                      }} className="p-3 bg-white text-gray-300 hover:text-red-500 rounded-2xl shadow-sm active:scale-75">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
