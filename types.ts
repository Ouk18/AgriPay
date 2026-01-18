export type CropType = 'HEVEA' | 'CACAO' | 'MANOEUVRE' | 'CONTRACTUEL' | 'GERANT';
export type EmployeeStatus = 'ACTIF' | 'DEMISSIONNE';
export type RainIntensity = 'FAIBLE' | 'MODERE' | 'FORTE';
export type RainPeriod = 'MATIN' | 'APRES-MIDI' | 'NUIT';
export type PaymentMethod = 'ESPECES' | 'VIREMENT';
export type UserRole = 'ADMIN' | 'GERANT' | 'EMPLOYE' | 'FOURNISSEUR';
export type ExpenseCategory = 'AVANCE' | 'ENGRAIS' | 'MATERIEL' | 'TRANSPORT' | 'TRAVAUX' | 'DIVERS';

export interface UserProfile {
  id: string;
  username: string; // Identifiant libre (ex: koffi_gerant)
  role: UserRole;
  linked_entity_id?: string;
}

export interface Employee {
  id: string;
  name: string;
  status: EmployeeStatus;
  crop: CropType;
  color: string;
  iconName: string;
  createdAt: number;
  phone?: string;
  notes?: string;
  user_id?: string;
}

export interface Entrepreneur {
  id: string;
  name: string;
  specialty?: string;
  phone?: string;
  color: string;
  user_id?: string;
}

export interface Harvest {
  id: string;
  employeeId: string;
  date: string;
  weight: number;
  payRate: number;
  crop: CropType;
}

export interface WorkTask {
  id: string;
  employeeId: string;
  date: string;
  description: string;
  amount: number;
}

export interface Advance {
  id: string;
  employeeId?: string;
  entrepreneurId?: string;
  date: string;
  amount: number;
  category: ExpenseCategory;
  paymentMethod?: PaymentMethod;
  notes?: string;
}

export interface RainEvent {
  id: string;
  date: string;
  intensity: RainIntensity;
  period: RainPeriod;
}

export interface MarketSettings {
  payRateHevea: number;
  payRateCacao: number;
  marketPriceHevea: number;
  marketPriceCacao: number;
  cacaoPayRatio: number;
}

export interface AppData {
  employees: Employee[];
  entrepreneurs: Entrepreneur[];
  harvests: Harvest[];
  advances: Advance[];
  workTasks: WorkTask[];
  rainEvents: RainEvent[];
  settings: MarketSettings;
  profiles: UserProfile[];
}