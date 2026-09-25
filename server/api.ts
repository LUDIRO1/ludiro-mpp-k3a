import type { IncomingMessage, ServerResponse } from 'http';
import { dbInstance, User } from './db.ts';

// In-memory active session tokens mapped to user ID
const activeSessions = new Map<string, { userId: string; expiresAt: number }>();

function parseJsonBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 2 * 1024 * 1024) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, status: number, data: any) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

function getAuthenticatedUser(req: IncomingMessage): User | null {
  const authHeader = req.headers['authorization'] || '';
  if (!authHeader.startsWith('Bearer ')) {
    // Default fallback to first admin for seamless preview if token expired or initial
    return null;
  }
  const token = authHeader.replace('Bearer ', '').trim();
  const session = activeSessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    return null;
  }
  return dbInstance.getUserById(session.userId) || null;
}

export async function shippingApiMiddleware(req: IncomingMessage, res: ServerResponse, next?: () => void) {
  const url = req.url || '';

  // Only handle /api/ routes
  if (!url.startsWith('/api/')) {
    if (next) return next();
    return;
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  try {
    const cleanUrl = url.split('?')[0];

    // 1. AUTH ROUTES
    if (cleanUrl === '/api/auth/login' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const username = (body.username || 'Admin').toString().trim() || 'Admin';
      const password = (body.password || '123').toString().trim();

      const user = dbInstance.authenticate(username, password);

      const token = `token-${user.id}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      activeSessions.set(token, {
        userId: user.id,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
      });

      const { passwordHash, ...userPublic } = user;
      return sendJson(res, 200, {
        success: true,
        message: `Selamat datang di JAVARA LINES, ${user.fullName}!`,
        token,
        user: userPublic
      });
    }

    if (cleanUrl === '/api/auth/me' && req.method === 'GET') {
      const user = getAuthenticatedUser(req);
      if (!user) {
        return sendJson(res, 401, { success: false, error: 'Sesi login tidak valid atau telah berakhir.' });
      }
      const { passwordHash, ...userPublic } = user;
      return sendJson(res, 200, { success: true, user: userPublic });
    }

    if (cleanUrl === '/api/auth/logout' && req.method === 'POST') {
      const authHeader = req.headers['authorization'] || '';
      if (authHeader.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '').trim();
        activeSessions.delete(token);
      }
      return sendJson(res, 200, { success: true, message: 'Berhasil keluar dari sistem.' });
    }

    // 1.5 ONLINE REALTIME STATUS
    if (cleanUrl === '/api/online/status' && req.method === 'GET') {
      const activeCount = Math.max(1, activeSessions.size);
      return sendJson(res, 200, {
        success: true,
        online: true,
        activeUsersCount: activeCount,
        serverTime: new Date().toISOString(),
        serverRegion: 'Asia-Southeast (Cloud Run)',
        databaseStatus: 'Online Persistent Single Source of Truth'
      });
    }

    // Require Auth or default admin context for auditing
    const currentUser = getAuthenticatedUser(req) || dbInstance.getSnapshot().users[0];

    // 2. DASHBOARD STATS
    if (cleanUrl === '/api/dashboard/stats' && req.method === 'GET') {
      const vessels = dbInstance.getVessels();
      const shipments = dbInstance.getShipments();
      const schedules = dbInstance.getSchedules();
      const crew = dbInstance.getCrew();

      const totalVessels = vessels.length;
      const sailingVessels = vessels.filter(v => v.status === 'Berlayar').length;
      const berthedVessels = vessels.filter(v => v.status === 'Bersandar di Pelabuhan').length;
      const maintenanceVessels = vessels.filter(v => v.status === 'Pemeliharaan (Docking)').length;

      const activeShipments = shipments.filter(s => s.status === 'Dalam Pelayaran' || s.status === 'Menunggu Muat').length;
      const totalCargoWeightTons = shipments.reduce((sum, s) => sum + (Number(s.weightTons) || 0), 0);
      const totalTeu = shipments.reduce((sum, s) => sum + (Number(s.containerCount) || 0), 0);
      const totalRevenue = shipments.reduce((sum, s) => sum + (Number(s.costTotalIdr) || 0), 0);

      const activeCrewCount = crew.filter(c => c.status === 'Aktif Berlayar').length;

      return sendJson(res, 200, {
        success: true,
        stats: {
          totalVessels,
          sailingVessels,
          berthedVessels,
          maintenanceVessels,
          activeShipments,
          totalCargoWeightTons,
          totalTeu,
          totalRevenue,
          activeCrewCount,
          totalCrew: crew.length,
          upcomingSchedules: schedules.filter(s => s.status === 'Terjadwal' || s.status === 'Aktif Berlayar').length
        }
      });
    }

    // 3. ACTIVITY LOGS
    if (cleanUrl === '/api/activity-logs' && req.method === 'GET') {
      const logs = dbInstance.getSnapshot().activityLogs;
      return sendJson(res, 200, { success: true, logs });
    }

    // 4. DATABASE RESET
    if (cleanUrl === '/api/db/reset' && req.method === 'POST') {
      dbInstance.resetToDefaultSeed();
      return sendJson(res, 200, { success: true, message: 'Database berhasil di-reset ke data bawaan resmi Samudera Raya Lines.' });
    }

    // 5. VESSELS CRUD
    if (cleanUrl === '/api/vessels' && req.method === 'GET') {
      const vessels = dbInstance.getVessels();
      return sendJson(res, 200, { success: true, vessels });
    }

    if (cleanUrl === '/api/vessels' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const { name, imoNumber, callSign, vesselType, flag, dwt, teuCapacity, buildYear, status, currentPort, destinationPort, captainName, speedKnots, fuelLevelPercent, estimatedArrival } = body;

      // Strict Validation
      if (!name || name.trim().length < 3) {
        return sendJson(res, 400, { success: false, error: 'Nama kapal wajib diisi minimal 3 karakter.' });
      }
      if (!imoNumber || !/^IMO\s*\d{7}$/i.test(imoNumber.trim())) {
        return sendJson(res, 400, { success: false, error: 'Nomor IMO harus berformat resmi maritim internasional (contoh: IMO 9382104, 7 digit angka).' });
      }
      if (!dwt || Number(dwt) <= 0) {
        return sendJson(res, 400, { success: false, error: 'Kapasitas DWT (Deadweight Tonnage) harus berupa angka positif lebih dari 0 MT.' });
      }
      if (!currentPort || !destinationPort) {
        return sendJson(res, 400, { success: false, error: 'Pelabuhan posisi saat ini dan pelabuhan tujuan wajib ditentukan.' });
      }
      if (!captainName || captainName.trim().length < 3) {
        return sendJson(res, 400, { success: false, error: 'Nama Nakhoda / Captain wajib diisi dengan benar.' });
      }

      // Check IMO uniqueness
      const existingImo = dbInstance.getVessels().find(v => v.imoNumber.toLowerCase() === imoNumber.trim().toLowerCase());
      if (existingImo) {
        return sendJson(res, 400, { success: false, error: `Nomor IMO ${imoNumber} sudah terdaftar pada kapal ${existingImo.name}.` });
      }

      const newVessel = dbInstance.createVessel({
        name: name.trim(),
        imoNumber: imoNumber.trim().toUpperCase(),
        callSign: (callSign || 'YCSL').trim().toUpperCase(),
        vesselType: vesselType || 'Container Ship',
        flag: flag || 'Indonesia (ID)',
        dwt: Number(dwt),
        teuCapacity: Number(teuCapacity) || 0,
        buildYear: Number(buildYear) || new Date().getFullYear(),
        status: status || 'Bersandar di Pelabuhan',
        currentPort: currentPort.trim(),
        destinationPort: destinationPort.trim(),
        captainName: captainName.trim(),
        speedKnots: Number(speedKnots) || 0,
        fuelLevelPercent: Math.min(100, Math.max(0, Number(fuelLevelPercent) || 80)),
        estimatedArrival: estimatedArrival || new Date(Date.now() + 3 * 86400000).toISOString()
      }, { id: currentUser.id, name: currentUser.fullName });

      return sendJson(res, 201, { success: true, message: `Kapal ${newVessel.name} berhasil ditambahkan ke armada.`, vessel: newVessel });
    }

    if (cleanUrl.startsWith('/api/vessels/') && req.method === 'PUT') {
      const id = cleanUrl.replace('/api/vessels/', '').trim();
      const body = await parseJsonBody(req);

      if (body.imoNumber && !/^IMO\s*\d{7}$/i.test(body.imoNumber.trim())) {
        return sendJson(res, 400, { success: false, error: 'Nomor IMO harus berformat resmi (contoh: IMO 9382104).' });
      }
      if (body.dwt && Number(body.dwt) <= 0) {
        return sendJson(res, 400, { success: false, error: 'Kapasitas DWT harus lebih dari 0 MT.' });
      }

      const updated = dbInstance.updateVessel(id, body, { id: currentUser.id, name: currentUser.fullName });
      if (!updated) {
        return sendJson(res, 404, { success: false, error: 'Kapal tidak ditemukan dalam database.' });
      }

      return sendJson(res, 200, { success: true, message: `Data kapal ${updated.name} berhasil diperbarui.`, vessel: updated });
    }

    if (cleanUrl.startsWith('/api/vessels/') && req.method === 'DELETE') {
      const id = cleanUrl.replace('/api/vessels/', '').trim();
      const deleted = dbInstance.deleteVessel(id, { id: currentUser.id, name: currentUser.fullName });
      if (!deleted) {
        return sendJson(res, 404, { success: false, error: 'Kapal tidak ditemukan atau sudah dihapus.' });
      }
      return sendJson(res, 200, { success: true, message: 'Kapal berhasil dihapus dari sistem armada.' });
    }

    // 6. SHIPMENTS CRUD
    if (cleanUrl === '/api/shipments' && req.method === 'GET') {
      const shipments = dbInstance.getShipments();
      return sendJson(res, 200, { success: true, shipments });
    }

    if (cleanUrl === '/api/shipments' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const { shipperName, consigneeName, vesselId, cargoType, containerCount, weightTons, originPort, destinationPort, etd, eta, status, paymentStatus, costTotalIdr, billOfLadingNo, notes } = body;

      // Strict validations
      if (!shipperName || shipperName.trim().length < 3) {
        return sendJson(res, 400, { success: false, error: 'Nama pengirim (Shipper) wajib diisi minimal 3 karakter.' });
      }
      if (!consigneeName || consigneeName.trim().length < 3) {
        return sendJson(res, 400, { success: false, error: 'Nama penerima (Consignee) wajib diisi minimal 3 karakter.' });
      }
      if (!vesselId) {
        return sendJson(res, 400, { success: false, error: 'Silakan pilih kapal pengangkut untuk manifest muatan ini.' });
      }
      const vessel = dbInstance.getVesselById(vesselId);
      if (!vessel) {
        return sendJson(res, 400, { success: false, error: 'Kapal pengangkut yang dipilih tidak valid.' });
      }
      if (!weightTons || Number(weightTons) <= 0) {
        return sendJson(res, 400, { success: false, error: 'Berat kargo (Tonase) harus berupa angka positif lebih dari 0 ton.' });
      }
      if (!originPort || !destinationPort) {
        return sendJson(res, 400, { success: false, error: 'Pelabuhan muat (POL) dan pelabuhan bongkar (POD) wajib diisi.' });
      }

      const blNo = billOfLadingNo?.trim() || `BL-${Date.now().toString().slice(-6)}`;

      const newShipment = dbInstance.createShipment({
        shipperName: shipperName.trim(),
        consigneeName: consigneeName.trim(),
        vesselId,
        vesselName: vessel.name,
        cargoType: cargoType || 'Dry Container',
        containerCount: Number(containerCount) || 0,
        weightTons: Number(weightTons),
        originPort: originPort.trim(),
        destinationPort: destinationPort.trim(),
        etd: etd || new Date().toISOString(),
        eta: eta || new Date(Date.now() + 2 * 86400000).toISOString(),
        status: status || 'Menunggu Muat',
        paymentStatus: paymentStatus || 'Belum Bayar',
        costTotalIdr: Number(costTotalIdr) || 100000000,
        billOfLadingNo: blNo,
        notes: notes ? notes.trim() : undefined
      }, { id: currentUser.id, name: currentUser.fullName });

      return sendJson(res, 201, { success: true, message: `Manifest muatan ${newShipment.trackingNumber} berhasil dibuat.`, shipment: newShipment });
    }

    if (cleanUrl.startsWith('/api/shipments/') && req.method === 'PUT') {
      const id = cleanUrl.replace('/api/shipments/', '').trim();
      const body = await parseJsonBody(req);

      if (body.vesselId) {
        const v = dbInstance.getVesselById(body.vesselId);
        if (v) body.vesselName = v.name;
      }

      const updated = dbInstance.updateShipment(id, body, { id: currentUser.id, name: currentUser.fullName });
      if (!updated) {
        return sendJson(res, 404, { success: false, error: 'Manifest muatan tidak ditemukan dalam database.' });
      }

      return sendJson(res, 200, { success: true, message: `Data manifest ${updated.trackingNumber} berhasil diperbarui.`, shipment: updated });
    }

    if (cleanUrl.startsWith('/api/shipments/') && req.method === 'DELETE') {
      const id = cleanUrl.replace('/api/shipments/', '').trim();
      const deleted = dbInstance.deleteShipment(id, { id: currentUser.id, name: currentUser.fullName });
      if (!deleted) {
        return sendJson(res, 404, { success: false, error: 'Data manifest muatan tidak ditemukan.' });
      }
      return sendJson(res, 200, { success: true, message: 'Manifest muatan kargo berhasil dihapus.' });
    }

    // 7. SCHEDULES CRUD
    if (cleanUrl === '/api/schedules' && req.method === 'GET') {
      const schedules = dbInstance.getSchedules();
      return sendJson(res, 200, { success: true, schedules });
    }

    if (cleanUrl === '/api/schedules' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const { voyageCode, vesselId, route, originPort, destinationPort, departureDate, arrivalDate, berthNumber, status, bunkerPlanTon, notes } = body;

      if (!voyageCode || voyageCode.trim().length < 3) {
        return sendJson(res, 400, { success: false, error: 'Kode voyage pelayaran wajib diisi (contoh: VOY-JKT-SBY-09).' });
      }
      if (!vesselId) {
        return sendJson(res, 400, { success: false, error: 'Silakan tentukan armada kapal yang ditugaskan.' });
      }
      const vessel = dbInstance.getVesselById(vesselId);
      if (!vessel) {
        return sendJson(res, 400, { success: false, error: 'Armada kapal yang dipilih tidak valid.' });
      }
      if (!departureDate || !arrivalDate) {
        return sendJson(res, 400, { success: false, error: 'Jadwal tanggal keberangkatan dan perkiraan tiba wajib diisi.' });
      }

      const newSchedule = dbInstance.createSchedule({
        voyageCode: voyageCode.trim().toUpperCase(),
        vesselId,
        vesselName: vessel.name,
        route: route || `${originPort || 'Pelabuhan Asal'} -> ${destinationPort || 'Pelabuhan Tujuan'}`,
        originPort: originPort || 'Pelabuhan Tanjung Priok, Jakarta',
        destinationPort: destinationPort || 'Pelabuhan Tanjung Perak, Surabaya',
        departureDate,
        arrivalDate,
        berthNumber: berthNumber || 'Dermaga Utama',
        status: status || 'Terjadwal',
        bunkerPlanTon: Number(bunkerPlanTon) || 250,
        notes: notes ? notes.trim() : undefined
      }, { id: currentUser.id, name: currentUser.fullName });

      return sendJson(res, 201, { success: true, message: `Jadwal voyage ${newSchedule.voyageCode} berhasil diterbitkan.`, schedule: newSchedule });
    }

    if (cleanUrl.startsWith('/api/schedules/') && req.method === 'PUT') {
      const id = cleanUrl.replace('/api/schedules/', '').trim();
      const body = await parseJsonBody(req);

      if (body.vesselId) {
        const v = dbInstance.getVesselById(body.vesselId);
        if (v) body.vesselName = v.name;
      }

      const updated = dbInstance.updateSchedule(id, body, { id: currentUser.id, name: currentUser.fullName });
      if (!updated) {
        return sendJson(res, 404, { success: false, error: 'Jadwal pelayaran tidak ditemukan.' });
      }

      return sendJson(res, 200, { success: true, message: `Jadwal ${updated.voyageCode} berhasil diperbarui.`, schedule: updated });
    }

    if (cleanUrl.startsWith('/api/schedules/') && req.method === 'DELETE') {
      const id = cleanUrl.replace('/api/schedules/', '').trim();
      const deleted = dbInstance.deleteSchedule(id, { id: currentUser.id, name: currentUser.fullName });
      if (!deleted) {
        return sendJson(res, 404, { success: false, error: 'Jadwal pelayaran tidak ditemukan.' });
      }
      return sendJson(res, 200, { success: true, message: 'Jadwal pelayaran berhasil dihapus.' });
    }

    // 8. CREW CRUD
    if (cleanUrl === '/api/crew' && req.method === 'GET') {
      const crew = dbInstance.getCrew();
      return sendJson(res, 200, { success: true, crew });
    }

    if (cleanUrl === '/api/crew' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const { fullName, seamanBookNo, role, vesselId, certification, nationality, status, contractEnd, phone, emergencyContact } = body;

      if (!fullName || fullName.trim().length < 3) {
        return sendJson(res, 400, { success: false, error: 'Nama lengkap pelaut wajib diisi minimal 3 karakter.' });
      }
      if (!seamanBookNo || seamanBookNo.trim().length < 4) {
        return sendJson(res, 400, { success: false, error: 'Nomor Buku Pelaut (Seaman Book) wajib diisi.' });
      }
      if (!role) {
        return sendJson(res, 400, { success: false, error: 'Pangkat / Jabatan di kapal wajib ditentukan.' });
      }

      let vesselName = 'Belum Ditugaskan';
      if (vesselId) {
        const v = dbInstance.getVesselById(vesselId);
        if (v) vesselName = v.name;
      }

      const newCrew = dbInstance.createCrew({
        fullName: fullName.trim(),
        seamanBookNo: seamanBookNo.trim().toUpperCase(),
        role: role || 'Able Seaman',
        vesselId: vesselId || '',
        vesselName,
        certification: certification || 'BST / STCW',
        nationality: nationality || 'Indonesia',
        status: status || 'Siap Tugas',
        contractEnd: contractEnd || new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
        phone: phone || '+62 812-0000-0000',
        emergencyContact: emergencyContact || 'Keluarga'
      }, { id: currentUser.id, name: currentUser.fullName });

      return sendJson(res, 201, { success: true, message: `Pelaut ${newCrew.fullName} berhasil didaftarkan.`, crew: newCrew });
    }

    if (cleanUrl.startsWith('/api/crew/') && req.method === 'PUT') {
      const id = cleanUrl.replace('/api/crew/', '').trim();
      const body = await parseJsonBody(req);

      if (body.vesselId) {
        const v = dbInstance.getVesselById(body.vesselId);
        if (v) body.vesselName = v.name;
      }

      const updated = dbInstance.updateCrew(id, body, { id: currentUser.id, name: currentUser.fullName });
      if (!updated) {
        return sendJson(res, 404, { success: false, error: 'Data pelaut tidak ditemukan.' });
      }

      return sendJson(res, 200, { success: true, message: `Data pelaut ${updated.fullName} berhasil diperbarui.`, crew: updated });
    }

    if (cleanUrl.startsWith('/api/crew/') && req.method === 'DELETE') {
      const id = cleanUrl.replace('/api/crew/', '').trim();
      const deleted = dbInstance.deleteCrew(id, { id: currentUser.id, name: currentUser.fullName });
      if (!deleted) {
        return sendJson(res, 404, { success: false, error: 'Data pelaut tidak ditemukan.' });
      }
      return sendJson(res, 200, { success: true, message: 'Data awak kapal berhasil dihapus.' });
    }

    // Unmatched API route
    return sendJson(res, 404, { success: false, error: `Rute API ${cleanUrl} tidak ditemukan.` });
  } catch (err: any) {
    console.error('API Error:', err);
    return sendJson(res, 500, { success: false, error: err.message || 'Terjadi kesalahan pada server database.' });
  }
}
