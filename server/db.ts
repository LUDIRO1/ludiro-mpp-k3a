import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
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

export interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN';
  entity: 'ARMADA' | 'MUATAN' | 'JADWAL' | 'KRU' | 'AUTH';
  details: string;
}

export interface DatabaseSchema {
  users: User[];
  vessels: Vessel[];
  shipments: Shipment[];
  schedules: VoyageSchedule[];
  crew: CrewMember[];
  activityLogs: ActivityLog[];
}

const DB_FILE_PATH = path.resolve(process.cwd(), 'data', 'shipping_db.json');

const INITIAL_DATA: DatabaseSchema = {
  users: [
    {
      id: 'usr-1',
      username: 'admin',
      email: 'admin@javaralines.co.id',
      passwordHash: 'admin123',
      fullName: 'Capt. Hendra Wicaksono, M.Mar',
      role: 'Super Admin',
      department: 'Direktorat Operasi JAVARA LINES',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      lastLogin: new Date().toISOString()
    },
    {
      id: 'usr-2',
      username: 'armada',
      email: 'armada@javaralines.co.id',
      passwordHash: 'armada123',
      fullName: 'Ir. Dewi Sartika, M.T',
      role: 'Fleet Manager',
      department: 'Manajemen Armada & Teknis JAVARA LINES',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      lastLogin: new Date().toISOString()
    },
    {
      id: 'usr-3',
      username: 'logistik',
      email: 'logistik@javaralines.co.id',
      passwordHash: 'logistik123',
      fullName: 'Rizky Ramadhan, S.Log',
      role: 'Logistics Officer',
      department: 'Divisi Kargo & Kontainer JAVARA LINES',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      lastLogin: new Date().toISOString()
    }
  ],
  vessels: [
    {
      id: 'ves-101',
      name: 'MV Javara Perkasa IX',
      imoNumber: 'IMO 9382104',
      callSign: 'YBDA-9',
      vesselType: 'Container Ship',
      flag: 'Indonesia (ID)',
      dwt: 45000,
      teuCapacity: 3200,
      buildYear: 2018,
      status: 'Berlayar',
      currentPort: 'Selat Sunda (En-route)',
      destinationPort: 'Pelabuhan Tanjung Perak, Surabaya',
      captainName: 'Capt. Agus Supriyadi',
      speedKnots: 18.5,
      fuelLevelPercent: 78,
      estimatedArrival: '2026-09-26T14:00:00Z',
      createdAt: '2026-01-10T08:00:00Z',
      updatedAt: '2026-09-24T18:00:00Z'
    },
    {
      id: 'ves-102',
      name: 'KM Javara Bahari 02',
      imoNumber: 'IMO 9451992',
      callSign: 'POWR-2',
      vesselType: 'Container Ship',
      flag: 'Indonesia (ID)',
      dwt: 28500,
      teuCapacity: 1850,
      buildYear: 2020,
      status: 'Bersandar di Pelabuhan',
      currentPort: 'Pelabuhan Tanjung Priok, Jakarta',
      destinationPort: 'Pelabuhan Belawan, Medan',
      captainName: 'Capt. Budi Hartono',
      speedKnots: 0.0,
      fuelLevelPercent: 92,
      estimatedArrival: '2026-09-28T09:30:00Z',
      createdAt: '2026-02-15T10:00:00Z',
      updatedAt: '2026-09-24T19:30:00Z'
    },
    {
      id: 'ves-103',
      name: 'MV Javara Khatulistiwa Star',
      imoNumber: 'IMO 9218776',
      callSign: 'YCSL-8',
      vesselType: 'Bulk Carrier',
      flag: 'Indonesia (ID)',
      dwt: 63000,
      teuCapacity: 0,
      buildYear: 2016,
      status: 'Berlayar',
      currentPort: 'Laut Jawa',
      destinationPort: 'Pelabuhan Soekarno-Hatta, Makassar',
      captainName: 'Capt. Frans Situmorang',
      speedKnots: 14.2,
      fuelLevelPercent: 64,
      estimatedArrival: '2026-09-27T18:00:00Z',
      createdAt: '2026-03-01T11:00:00Z',
      updatedAt: '2026-09-24T12:15:00Z'
    },
    {
      id: 'ves-104',
      name: 'MT Javara Barito Petro II',
      imoNumber: 'IMO 9520031',
      callSign: 'PKRT-4',
      vesselType: 'Oil & Chemical Tanker',
      flag: 'Indonesia (ID)',
      dwt: 32000,
      teuCapacity: 0,
      buildYear: 2021,
      status: 'Siap Berangkat',
      currentPort: 'Pelabuhan Balikpapan',
      destinationPort: 'Pelabuhan Tanjung Priok, Jakarta',
      captainName: 'Capt. Lukman Hakim',
      speedKnots: 0.0,
      fuelLevelPercent: 98,
      estimatedArrival: '2026-09-29T16:00:00Z',
      createdAt: '2026-04-12T07:30:00Z',
      updatedAt: '2026-09-24T16:45:00Z'
    },
    {
      id: 'ves-105',
      name: 'KM Javara Express Ro-Ro',
      imoNumber: 'IMO 9199342',
      callSign: 'YBRR-1',
      vesselType: 'Ro-Ro Passenger',
      flag: 'Indonesia (ID)',
      dwt: 12000,
      teuCapacity: 350,
      buildYear: 2019,
      status: 'Bersandar di Pelabuhan',
      currentPort: 'Pelabuhan Merak, Cilegon',
      destinationPort: 'Pelabuhan Bakauheni, Lampung',
      captainName: 'Capt. Yulianto Pratama',
      speedKnots: 0.0,
      fuelLevelPercent: 85,
      estimatedArrival: '2026-09-25T06:00:00Z',
      createdAt: '2026-05-20T09:00:00Z',
      updatedAt: '2026-09-24T17:20:00Z'
    },
    {
      id: 'ves-106',
      name: 'TB Javara Braja 01 & BG 300ft',
      imoNumber: 'IMO 9641120',
      callSign: 'YCTB-7',
      vesselType: 'Tug & Barge',
      flag: 'Indonesia (ID)',
      dwt: 8500,
      teuCapacity: 0,
      buildYear: 2022,
      status: 'Pemeliharaan (Docking)',
      currentPort: 'Galangan Kapal Batam Marine',
      destinationPort: 'Pelabuhan Dumai, Riau',
      captainName: 'Capt. Ruslan Effendi',
      speedKnots: 0.0,
      fuelLevelPercent: 40,
      estimatedArrival: '2026-10-05T12:00:00Z',
      createdAt: '2026-06-05T14:00:00Z',
      updatedAt: '2026-09-23T11:00:00Z'
    }
  ],
  shipments: [
    {
      id: 'shp-201',
      trackingNumber: 'JVR-2026-8891',
      shipperName: 'PT Indofood Sukses Makmur Tbk',
      consigneeName: 'Eastern Logistics Corp Makassar',
      vesselId: 'ves-101',
      vesselName: 'MV Javara Perkasa IX',
      cargoType: 'Dry Container',
      containerCount: 45,
      weightTons: 1120,
      originPort: 'Pelabuhan Tanjung Priok, Jakarta',
      destinationPort: 'Pelabuhan Tanjung Perak, Surabaya',
      etd: '2026-09-24T10:00:00Z',
      eta: '2026-09-26T14:00:00Z',
      status: 'Dalam Pelayaran',
      paymentStatus: 'Lunas',
      costTotalIdr: 345000000,
      billOfLadingNo: 'BL-JVR-SUB-2026-0081',
      notes: 'Komoditas bahan makanan kering kemasan. Prioritas bongkar tier 1.',
      createdAt: '2026-09-22T08:30:00Z',
      updatedAt: '2026-09-24T10:15:00Z'
    },
    {
      id: 'shp-202',
      trackingNumber: 'JVR-2026-8892',
      shipperName: 'PT Charoen Pokphand Indonesia',
      consigneeName: 'CV Sumber Ternak Sejahtera Medan',
      vesselId: 'ves-102',
      vesselName: 'KM Javara Bahari 02',
      cargoType: 'Dry Container',
      containerCount: 30,
      weightTons: 750,
      originPort: 'Pelabuhan Tanjung Priok, Jakarta',
      destinationPort: 'Pelabuhan Belawan, Medan',
      etd: '2026-09-25T16:00:00Z',
      eta: '2026-09-28T09:30:00Z',
      status: 'Menunggu Muat',
      paymentStatus: 'Uang Muka (DP 50%)',
      costTotalIdr: 280000000,
      billOfLadingNo: 'BL-JVR-BLW-2026-0112',
      notes: 'Muatan pakan ternak terstandardisasi karantina pelabuhan.',
      createdAt: '2026-09-23T11:00:00Z',
      updatedAt: '2026-09-24T08:00:00Z'
    },
    {
      id: 'shp-203',
      trackingNumber: 'JVR-2026-8893',
      shipperName: 'PT Frisian Flag Cold Storage',
      consigneeName: 'PT Distributor Susu Nusantara',
      vesselId: 'ves-101',
      vesselName: 'MV Javara Perkasa IX',
      cargoType: 'Reefer (Pendingin)',
      containerCount: 16,
      weightTons: 380,
      originPort: 'Pelabuhan Tanjung Priok, Jakarta',
      destinationPort: 'Pelabuhan Tanjung Perak, Surabaya',
      etd: '2026-09-24T10:00:00Z',
      eta: '2026-09-26T14:00:00Z',
      status: 'Dalam Pelayaran',
      paymentStatus: 'Lunas',
      costTotalIdr: 195000000,
      billOfLadingNo: 'BL-JVR-SUB-2026-0082',
      notes: 'Suhu kontainer reefer wajib stabil pada -18 derajat Celsius.',
      createdAt: '2026-09-22T09:45:00Z',
      updatedAt: '2026-09-24T10:15:00Z'
    },
    {
      id: 'shp-204',
      trackingNumber: 'JVR-2026-8894',
      shipperName: 'PT Semen Indonesia Group',
      consigneeName: 'Pemerintah Provinsi Sulawesi Selatan',
      vesselId: 'ves-103',
      vesselName: 'MV Javara Khatulistiwa Star',
      cargoType: 'Curah Kering (Bulk)',
      containerCount: 0,
      weightTons: 15500,
      originPort: 'Pelabuhan Tuban, Jawa Timur',
      destinationPort: 'Pelabuhan Soekarno-Hatta, Makassar',
      etd: '2026-09-24T05:00:00Z',
      eta: '2026-09-27T18:00:00Z',
      status: 'Dalam Pelayaran',
      paymentStatus: 'Lunas',
      costTotalIdr: 890000000,
      billOfLadingNo: 'BL-JVR-MKS-2026-0034',
      notes: 'Kargo klinker & semen curah untuk pembangunan infrastruktur dermaga.',
      createdAt: '2026-09-21T14:20:00Z',
      updatedAt: '2026-09-24T06:00:00Z'
    }
  ],
  schedules: [
    {
      id: 'sch-301',
      voyageCode: 'VOY-JVR-JKT-SBY-042',
      vesselId: 'ves-101',
      vesselName: 'MV Javara Perkasa IX',
      route: 'Tanjung Priok (JKT) -> Tanjung Perak (SBY)',
      originPort: 'Pelabuhan Tanjung Priok, Jakarta',
      destinationPort: 'Pelabuhan Tanjung Perak, Surabaya',
      departureDate: '2026-09-24T10:00',
      arrivalDate: '2026-09-26T14:00',
      berthNumber: 'Dermaga JICT 2B',
      status: 'Aktif Berlayar',
      bunkerPlanTon: 320,
      notes: 'Kondisi cuaca cerah di perairan utara Jawa.',
      createdAt: '2026-09-20T10:00:00Z',
      updatedAt: '2026-09-24T10:00:00Z'
    },
    {
      id: 'sch-302',
      voyageCode: 'VOY-JVR-JKT-BLW-019',
      vesselId: 'ves-102',
      vesselName: 'KM Javara Bahari 02',
      route: 'Tanjung Priok (JKT) -> Belawan (MDN)',
      originPort: 'Pelabuhan Tanjung Priok, Jakarta',
      destinationPort: 'Pelabuhan Belawan, Medan',
      departureDate: '2026-09-25T16:00',
      arrivalDate: '2026-09-28T09:30',
      berthNumber: 'Dermaga Koja 1',
      status: 'Terjadwal',
      bunkerPlanTon: 210,
      notes: 'Proses lashing kontainer dijadwalkan mulai pukul 08:00.',
      createdAt: '2026-09-21T11:30:00Z',
      updatedAt: '2026-09-24T08:00:00Z'
    }
  ],
  crew: [
    {
      id: 'crw-401',
      fullName: 'Capt. Agus Supriyadi',
      seamanBookNo: 'B-098234-JKT',
      role: 'Nakhoda (Master)',
      vesselId: 'ves-101',
      vesselName: 'MV Javara Perkasa IX',
      certification: 'ANT I',
      nationality: 'Indonesia',
      status: 'Aktif Berlayar',
      contractEnd: '2027-04-15',
      phone: '+62 812-9844-3211',
      emergencyContact: 'Ibu Ratna (Istri) - 0813-8899-1122',
      createdAt: '2025-10-10T00:00:00Z',
      updatedAt: '2026-09-24T00:00:00Z'
    },
    {
      id: 'crw-402',
      fullName: 'Bambang Eko Santoso, S.ST.Pel',
      seamanBookNo: 'B-044192-SBY',
      role: 'Chief Officer (Mualim I)',
      vesselId: 'ves-101',
      vesselName: 'MV Javara Perkasa IX',
      certification: 'ANT II',
      nationality: 'Indonesia',
      status: 'Aktif Berlayar',
      contractEnd: '2027-02-28',
      phone: '+62 813-7721-0099',
      emergencyContact: 'H. Sudrajat (Ayah) - 0812-4455-6677',
      createdAt: '2025-11-01T00:00:00Z',
      updatedAt: '2026-09-24T00:00:00Z'
    }
  ],
  activityLogs: [
    {
      id: 'log-001',
      timestamp: '2026-09-24T18:00:00Z',
      userId: 'usr-1',
      userName: 'Capt. Hendra Wicaksono',
      action: 'UPDATE',
      entity: 'ARMADA',
      details: 'Memperbarui rute pelayaran MV Javara Perkasa IX menuju Surabaya'
    }
  ]
};

// Singleton Database Manager with Atomic JSON Persistence
class PersistentDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirectory();
    this.data = this.readFromDisk();
  }

  private ensureDirectory() {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private readFromDisk(): DatabaseSchema {
    try {
      if (!fs.existsSync(DB_FILE_PATH)) {
        this.writeToDisk(INITIAL_DATA);
        return JSON.parse(JSON.stringify(INITIAL_DATA));
      }
      const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      // Auto upgrade vessels and brand if needed
      if (parsed.vessels && parsed.vessels[0]?.name?.includes('Samudera')) {
        this.writeToDisk(INITIAL_DATA);
        return JSON.parse(JSON.stringify(INITIAL_DATA));
      }
      return parsed;
    } catch (err) {
      console.error('Failed reading database file, writing initial seed:', err);
      this.writeToDisk(INITIAL_DATA);
      return JSON.parse(JSON.stringify(INITIAL_DATA));
    }
  }

  private writeToDisk(data: DatabaseSchema) {
    this.ensureDirectory();
    const tempPath = `${DB_FILE_PATH}.tmp.${Date.now()}`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, DB_FILE_PATH);
  }

  public getSnapshot(): DatabaseSchema {
    return JSON.parse(JSON.stringify(this.data));
  }

  public logActivity(userId: string, userName: string, action: ActivityLog['action'], entity: ActivityLog['entity'], details: string) {
    const log: ActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      userId,
      userName,
      action,
      entity,
      details
    };
    this.data.activityLogs.unshift(log);
    if (this.data.activityLogs.length > 100) {
      this.data.activityLogs = this.data.activityLogs.slice(0, 100);
    }
    this.writeToDisk(this.data);
  }

  // --- VESSELS CRUD ---
  public getVessels(): Vessel[] {
    return this.data.vessels;
  }

  public getVesselById(id: string): Vessel | undefined {
    return this.data.vessels.find(v => v.id === id);
  }

  public createVessel(vesselData: Omit<Vessel, 'id' | 'createdAt' | 'updatedAt'>, user: { id: string; name: string }): Vessel {
    const newVessel: Vessel = {
      ...vesselData,
      id: `ves-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.vessels.unshift(newVessel);
    this.logActivity(user.id, user.name, 'CREATE', 'ARMADA', `Menambahkan kapal baru: ${newVessel.name} (${newVessel.imoNumber})`);
    this.writeToDisk(this.data);
    return newVessel;
  }

  public updateVessel(id: string, vesselData: Partial<Vessel>, user: { id: string; name: string }): Vessel | null {
    const index = this.data.vessels.findIndex(v => v.id === id);
    if (index === -1) return null;

    const existing = this.data.vessels[index];
    const updated: Vessel = {
      ...existing,
      ...vesselData,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString()
    };
    this.data.vessels[index] = updated;

    if (vesselData.name && vesselData.name !== existing.name) {
      this.data.shipments.forEach(s => {
        if (s.vesselId === id) s.vesselName = vesselData.name!;
      });
      this.data.schedules.forEach(sc => {
        if (sc.vesselId === id) sc.vesselName = vesselData.name!;
      });
      this.data.crew.forEach(c => {
        if (c.vesselId === id) c.vesselName = vesselData.name!;
      });
    }

    this.logActivity(user.id, user.name, 'UPDATE', 'ARMADA', `Memperbarui data kapal: ${updated.name}`);
    this.writeToDisk(this.data);
    return updated;
  }

  public deleteVessel(id: string, user: { id: string; name: string }): boolean {
    const index = this.data.vessels.findIndex(v => v.id === id);
    if (index === -1) return false;

    const vesselName = this.data.vessels[index].name;
    this.data.vessels.splice(index, 1);
    this.logActivity(user.id, user.name, 'DELETE', 'ARMADA', `Menghapus kapal dari armada: ${vesselName}`);
    this.writeToDisk(this.data);
    return true;
  }

  // --- SHIPMENTS CRUD ---
  public getShipments(): Shipment[] {
    return this.data.shipments;
  }

  public getShipmentById(id: string): Shipment | undefined {
    return this.data.shipments.find(s => s.id === id);
  }

  public createShipment(shipmentData: Omit<Shipment, 'id' | 'createdAt' | 'updatedAt' | 'trackingNumber'>, user: { id: string; name: string }): Shipment {
    const seq = Math.floor(1000 + Math.random() * 9000);
    const trackingNumber = `JVR-2026-${seq}`;
    const newShipment: Shipment = {
      ...shipmentData,
      id: `shp-${Date.now()}`,
      trackingNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.shipments.unshift(newShipment);
    this.logActivity(user.id, user.name, 'CREATE', 'MUATAN', `Mendaftarkan manifest muatan ${newShipment.trackingNumber} (${newShipment.shipperName} -> ${newShipment.consigneeName})`);
    this.writeToDisk(this.data);
    return newShipment;
  }

  public updateShipment(id: string, shipmentData: Partial<Shipment>, user: { id: string; name: string }): Shipment | null {
    const index = this.data.shipments.findIndex(s => s.id === id);
    if (index === -1) return null;

    const existing = this.data.shipments[index];
    const updated: Shipment = {
      ...existing,
      ...shipmentData,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString()
    };
    this.data.shipments[index] = updated;
    this.logActivity(user.id, user.name, 'UPDATE', 'MUATAN', `Memperbarui manifest kargo: ${updated.trackingNumber}`);
    this.writeToDisk(this.data);
    return updated;
  }

  public deleteShipment(id: string, user: { id: string; name: string }): boolean {
    const index = this.data.shipments.findIndex(s => s.id === id);
    if (index === -1) return false;

    const trackingNumber = this.data.shipments[index].trackingNumber;
    this.data.shipments.splice(index, 1);
    this.logActivity(user.id, user.name, 'DELETE', 'MUATAN', `Menghapus manifest muatan kargo: ${trackingNumber}`);
    this.writeToDisk(this.data);
    return true;
  }

  // --- SCHEDULES CRUD ---
  public getSchedules(): VoyageSchedule[] {
    return this.data.schedules;
  }

  public createSchedule(scheduleData: Omit<VoyageSchedule, 'id' | 'createdAt' | 'updatedAt'>, user: { id: string; name: string }): VoyageSchedule {
    const newSchedule: VoyageSchedule = {
      ...scheduleData,
      id: `sch-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.schedules.unshift(newSchedule);
    this.logActivity(user.id, user.name, 'CREATE', 'JADWAL', `Membuat jadwal pelayaran baru ${newSchedule.voyageCode} (${newSchedule.route})`);
    this.writeToDisk(this.data);
    return newSchedule;
  }

  public updateSchedule(id: string, scheduleData: Partial<VoyageSchedule>, user: { id: string; name: string }): VoyageSchedule | null {
    const index = this.data.schedules.findIndex(s => s.id === id);
    if (index === -1) return null;

    const existing = this.data.schedules[index];
    const updated: VoyageSchedule = {
      ...existing,
      ...scheduleData,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString()
    };
    this.data.schedules[index] = updated;
    this.logActivity(user.id, user.name, 'UPDATE', 'JADWAL', `Memperbarui jadwal pelayaran: ${updated.voyageCode}`);
    this.writeToDisk(this.data);
    return updated;
  }

  public deleteSchedule(id: string, user: { id: string; name: string }): boolean {
    const index = this.data.schedules.findIndex(s => s.id === id);
    if (index === -1) return false;

    const voyageCode = this.data.schedules[index].voyageCode;
    this.data.schedules.splice(index, 1);
    this.logActivity(user.id, user.name, 'DELETE', 'JADWAL', `Menghapus jadwal pelayaran: ${voyageCode}`);
    this.writeToDisk(this.data);
    return true;
  }

  // --- CREW CRUD ---
  public getCrew(): CrewMember[] {
    return this.data.crew;
  }

  public createCrew(crewData: Omit<CrewMember, 'id' | 'createdAt' | 'updatedAt'>, user: { id: string; name: string }): CrewMember {
    const newCrew: CrewMember = {
      ...crewData,
      id: `crw-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.crew.unshift(newCrew);
    this.logActivity(user.id, user.name, 'CREATE', 'KRU', `Mendaftarkan pelaut baru: ${newCrew.fullName} (${newCrew.role})`);
    this.writeToDisk(this.data);
    return newCrew;
  }

  public updateCrew(id: string, crewData: Partial<CrewMember>, user: { id: string; name: string }): CrewMember | null {
    const index = this.data.crew.findIndex(c => c.id === id);
    if (index === -1) return null;

    const existing = this.data.crew[index];
    const updated: CrewMember = {
      ...existing,
      ...crewData,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString()
    };
    this.data.crew[index] = updated;
    this.logActivity(user.id, user.name, 'UPDATE', 'KRU', `Memperbarui data kru pelaut: ${updated.fullName}`);
    this.writeToDisk(this.data);
    return updated;
  }

  public deleteCrew(id: string, user: { id: string; name: string }): boolean {
    const index = this.data.crew.findIndex(c => c.id === id);
    if (index === -1) return false;

    const fullName = this.data.crew[index].fullName;
    this.data.crew.splice(index, 1);
    this.logActivity(user.id, user.name, 'DELETE', 'KRU', `Menghapus anggota kru: ${fullName}`);
    this.writeToDisk(this.data);
    return true;
  }

  // --- AUTH (FLEXIBLE / BEBAS LOGIN) ---
  public authenticate(usernameOrEmail: string, passwordPlain?: string): User {
    const rawInput = (usernameOrEmail || 'Admin').trim();
    const normalized = rawInput.toLowerCase();

    // 1. Check if user already exists
    let user = this.data.users.find(
      u => u.username.toLowerCase() === normalized || u.email.toLowerCase() === normalized
    );

    if (user) {
      user.lastLogin = new Date().toISOString();
      this.logActivity(user.id, user.fullName, 'LOGIN', 'AUTH', `User ${user.fullName} berhasil masuk ke JAVARA LINES`);
      this.writeToDisk(this.data);
      return user;
    }

    // 2. If it's a new or custom username, automatically grant access without blocking!
    const cleanName = rawInput.charAt(0).toUpperCase() + rawInput.slice(1);
    const newUser: User = {
      id: `usr-${Date.now()}`,
      username: rawInput,
      email: rawInput.includes('@') ? rawInput : `${rawInput.toLowerCase()}@javaralines.co.id`,
      passwordHash: passwordPlain || '123',
      fullName: cleanName.includes(' ') ? cleanName : `${cleanName} (Operasional)`,
      role: 'Super Admin',
      department: 'Divisi Operasi & Armada JAVARA LINES',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      lastLogin: new Date().toISOString()
    };

    this.data.users.push(newUser);
    this.logActivity(newUser.id, newUser.fullName, 'LOGIN', 'AUTH', `Pengguna ${newUser.fullName} berhasil login mandiri`);
    this.writeToDisk(this.data);
    return newUser;
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public resetToDefaultSeed(): void {
    this.data = JSON.parse(JSON.stringify(INITIAL_DATA));
    this.writeToDisk(this.data);
  }
}

export const dbInstance = new PersistentDatabase();
