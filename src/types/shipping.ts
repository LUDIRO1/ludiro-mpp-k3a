export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'Super Admin' | 'Fleet Manager' | 'Logistics Officer';
  department: string;
  avatarUrl?: string;
  lastLogin?: string;
}

export interface Vessel {
  id: string;
  name: string;
  imoNumber: string;
  callSign: string;
  vesselType: 'Container Ship' | 'Bulk Carrier' | 'Oil & Chemical Tanker' | 'Ro-Ro Passenger' | 'Tug & Barge';
  flag: string;
  dwt: number;
  teuCapacity?: number;
  buildYear: number;
  status: 'Berlayar' | 'Bersandar di Pelabuhan' | 'Pemeliharaan (Docking)' | 'Siap Berangkat';
  currentPort: string;
  destinationPort: string;
  captainName: string;
  speedKnots: number;
  fuelLevelPercent: number;
  estimatedArrival: string;
  createdAt: string;
  updatedAt: string;
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  shipperName: string;
  consigneeName: string;
  vesselId: string;
  vesselName: string;
  cargoType: 'Dry Container' | 'Reefer (Pendingin)' | 'Curah Kering (Bulk)' | 'Cair (Liquid)' | 'Alat Berat / Project';
  containerCount: number;
  weightTons: number;
  originPort: string;
  destinationPort: string;
  etd: string;
  eta: string;
  status: 'Menunggu Muat' | 'Dalam Pelayaran' | 'Tiba di Pelabuhan' | 'Bongkar Selesai' | 'Dibatalkan';
  paymentStatus: 'Lunas' | 'Uang Muka (DP 50%)' | 'Belum Bayar';
  costTotalIdr: number;
  billOfLadingNo: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VoyageSchedule {
  id: string;
  voyageCode: string;
  vesselId: string;
  vesselName: string;
  route: string;
  originPort: string;
  destinationPort: string;
  departureDate: string;
  arrivalDate: string;
  berthNumber: string;
  status: 'Terjadwal' | 'Aktif Berlayar' | 'Selesai' | 'Tertunda Cuaca';
  bunkerPlanTon: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CrewMember {
  id: string;
  fullName: string;
  seamanBookNo: string;
  role: 'Nakhoda (Master)' | 'Chief Officer (Mualim I)' | 'Second Officer (Mualim II)' | 'Chief Engineer (KKM)' | 'Second Engineer' | 'Bosun (Kelasi)' | 'Able Seaman' | 'Oiler / Juru Minyak';
  vesselId: string;
  vesselName: string;
  certification: 'ANT I' | 'ANT II' | 'ANT III' | 'ATT I' | 'ATT II' | 'ATT III' | 'BST / STCW';
  nationality: string;
  status: 'Aktif Berlayar' | 'Siap Tugas' | 'Cuti Darat';
  contractEnd: string;
  phone: string;
  emergencyContact: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalVessels: number;
  sailingVessels: number;
  berthedVessels: number;
  maintenanceVessels: number;
  activeShipments: number;
  totalCargoWeightTons: number;
  totalTeu: number;
  totalRevenue: number;
  activeCrewCount: number;
  totalCrew: number;
  upcomingSchedules: number;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN';
  entity: 'ARMADA' | 'MUATAN' | 'JADWAL' | 'KRU' | 'AUTH';
  details: string;
}

export interface OnlineStatus {
  online: boolean;
  activeUsersCount: number;
  serverTime: string;
  serverRegion: string;
  databaseStatus: string;
}
