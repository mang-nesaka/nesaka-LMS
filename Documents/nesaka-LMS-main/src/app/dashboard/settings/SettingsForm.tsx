"use client";

import { useState } from 'react';
import { updateProfile } from '@/app/actions/settings';
import { Save, User, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function SettingsForm({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error'|'success', text: string } | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setMessage(null);
    
    const result = await updateProfile(formData);
    
    if (result?.error) {
      setMessage({ type: 'error', text: result.error });
    } else if (result?.success) {
      setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
    }
    
    setLoading(false);
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden max-w-2xl">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-lg font-bold text-slate-800">Informasi Pribadi</h3>
        <p className="text-sm text-slate-500 mt-1">Perbarui foto dan detail personal Anda di sini.</p>
      </div>

      <form action={handleSubmit} className="p-6 space-y-6">
        {message && (
          <div className={`p-4 rounded-xl flex items-center text-sm ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
            {message.type === 'error' ? <AlertCircle className="w-5 h-5 mr-2" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
            {message.text}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Peran (Role)</label>
          <div className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl cursor-not-allowed font-medium inline-block">
            {user.role}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Alamat Email</label>
          <div className="relative">
            <input
              type="email"
              disabled
              defaultValue={user.email}
              className="block w-full pl-4 pr-3 py-2 border border-slate-200 rounded-xl text-slate-500 bg-slate-50 cursor-not-allowed"
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">Email tidak dapat diubah karena merupakan ID Login Anda.</p>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">Nama Lengkap</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={user.name}
              required
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50 focus:bg-white"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <h4 className="text-sm font-bold text-slate-800 mb-4">Ubah Kata Sandi</h4>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-2">Kata Sandi Baru (Opsional)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                placeholder="Biarkan kosong jika tidak ingin diubah"
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50 focus:bg-white"
              />
            </div>
          </div>
        </div>

        <div className="pt-6 flex justify-end">
          <button 
            type="submit"
            disabled={loading}
            className="flex items-center bg-indigo-600 text-white font-semibold py-2 px-6 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-70"
          >
            <Save className="w-5 h-5 mr-2" />
            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </div>
  );
}
