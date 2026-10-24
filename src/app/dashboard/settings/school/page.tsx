import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSchoolSetting, updateSchoolSetting } from '@/app/actions/attendance';
import { MapPin, Clock, Shield, Save } from 'lucide-react';

const prisma = new PrismaClient();

export default async function SchoolSettingPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth_token')?.value;

  if (!userId) {
    redirect('/login');
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, role: true },
  });

  if (!currentUser || !['TU', 'ADMIN'].includes(currentUser.role)) {
    redirect('/dashboard');
  }

  const isAdmin = currentUser.role === 'ADMIN';
  const setting = await getSchoolSetting();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-slate-800 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
          <span>⚙️ Pengaturan Lokasi GPS & Jam Presensi Sekolah</span>
        </h1>
        <p className="text-indigo-200 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
          Atur titik koordinat gerbang sekolah, radius maksimal presensi (default 200 meter), serta batas jam masuk dan jam pulang siswa.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <form
          action={async (formData) => {
            "use server";
            await updateSchoolSetting(formData);
          }}
          className="space-y-6"
        >
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <span>Titik Koordinat & Radius Geofence Sekolah</span>
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nama Sekolah
              </label>
              <input
                type="text"
                name="schoolName"
                defaultValue={setting.schoolName}
                required
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Latitude Koordinat Sekolah
                </label>
                <input
                  type="number"
                  step="any"
                  name="schoolLat"
                  defaultValue={setting.schoolLat}
                  required
                  readOnly={!isAdmin}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Longitude Koordinat Sekolah
                </label>
                <input
                  type="number"
                  step="any"
                  name="schoolLng"
                  defaultValue={setting.schoolLng}
                  required
                  readOnly={!isAdmin}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              {!isAdmin && (
                <p className="text-[11px] text-slate-500">
                  Hanya Admin yang dapat mengubah koordinat lokasi sekolah.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Radius Maksimal Jangkauan Presensi (Meter)
              </label>
              <input
                type="number"
                name="radiusMeters"
                defaultValue={setting.radiusMeters}
                required
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                * Siswa yang berada di luar radius ini (misal lebih dari 200 meter) akan otomatis ditolak dan tidak dapat melakukan presensi.
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Jadwal Waktu Presensi Siswa</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Presensi Pagi Dibuka
                </label>
                <input
                  type="time"
                  name="checkInStartTime"
                  defaultValue={setting.checkInStartTime}
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400">Default: 06:30 WIB</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mulai Terlambat Masuk
                </label>
                <input
                  type="time"
                  name="checkInLateTime"
                  defaultValue={setting.checkInLateTime}
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-amber-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400">Default: 07:00 WIB</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Presensi Pulang Dibuka
                </label>
                <input
                  type="time"
                  name="checkOutStartTime"
                  defaultValue={setting.checkOutStartTime}
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-emerald-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400">Default: 15:00 WIB (&lt; 15:00 bolos)</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t flex justify-end">
            <button
              type="submit"
              className="py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan Presensi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
