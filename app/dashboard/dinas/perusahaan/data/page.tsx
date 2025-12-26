import { createClient } from '@/utils/supabase/server'
import { PlusCircle, Trash2, Edit, Save, Building, Phone, MapPin, Search } from 'lucide-react'
import { createPerusahaanAction, updatePerusahaanAction, deletePerusahaanAction } from '@/actions/dinas'

export default async function DataPerusahaanPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const supabase = await createClient()
    const params = await searchParams
    const query = params?.q || ''

    let companies: any[] = []

    let qBuilder = supabase
        .from('profiles')
        .select(`
            *,
            profile_perusahaan(*)
        `)
        .eq('role', 'perusahaan') // Ensure role is perusahaan
        .order('created_at', { ascending: false })

    if (query) {
        qBuilder = qBuilder.ilike('full_name', `%${query}%`)
    }

    const { data } = await qBuilder

    if (data) {
        companies = data.map((p: any) => ({
            ...p,
            ...(p.profile_perusahaan || {}),
        }))
    }

    return (
        <div className="font-sans min-h-screen bg-gray-50/50 pb-20">
            {/* HERO SECTION - RED THEME */}
            <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white pt-8 pb-20 px-6 md:px-12 relative overflow-hidden rounded-b-3xl shadow-lg mb-8">
                <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                    <Building size={300} />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                                <Building size={24} className="text-white" />
                            </div>
                            <span className="font-bold tracking-wider text-red-100 uppercase text-sm">Modul Perusahaan</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight text-white">
                            Data Perusahaan
                        </h1>
                        <p className="text-red-100 font-medium text-lg max-w-xl">
                            Kelola data akun perusahaan/IDUKA yang terdaftar.
                        </p>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex gap-4">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl text-center">
                            <h3 className="text-2xl font-bold text-white">{companies.length}</h3>
                            <p className="text-xs text-red-100 uppercase font-bold tracking-wider">Total Item</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toolbar - Floating Up */}
            <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20 space-y-8">
                <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-xl flex flex-col md:flex-row gap-4 items-center justify-between">
                    <form className="relative w-full md:w-96 ml-2">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            name="q"
                            defaultValue={query}
                            placeholder="Cari nama perusahaan..."
                            className="pl-10 pr-4 py-2 border-none bg-gray-50 rounded-xl w-full focus:ring-2 focus:ring-red-500 outline-none"
                        />
                    </form>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* FORM TAMBAH */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border h-fit sticky top-24">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <PlusCircle size={18} className="text-red-600" /> Tambah Akun Perusahaan
                        </h3>
                        {/* @ts-expect-error: Server Action return type mismatch with strict form action type */}
                        <form action={createPerusahaanAction} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nama Perusahaan</label>
                                <input type="text" name="name" required className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none" placeholder="PT. Sukses Mulia" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Login</label>
                                <input type="email" name="email" required className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none" placeholder="hrd@perusahaan.com" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password Default</label>
                                <input type="text" name="password" required className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none" placeholder="Min. 6 karakter" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">No. Telepon</label>
                                <input type="text" name="phone" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none" placeholder="021-..." />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Alamat</label>
                                <textarea name="address" rows={2} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none" placeholder="Alamat lengkap..."></textarea>
                            </div>
                            <button className="w-full bg-red-600 text-white font-bold py-2 rounded-lg hover:bg-red-700 transition shadow-lg shadow-red-200">
                                Buat Akun Perusahaan
                            </button>
                        </form>
                    </div>

                    {/* LIST COMPANIES */}
                    <div className="lg:col-span-2 space-y-4">
                        {companies.map((comp) => (
                            <div key={comp.id} className="bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition group relative">
                                {/* @ts-expect-error: Server Action return type mismatch */}
                                <form action={updatePerusahaanAction} className="flex flex-col gap-3">
                                    <input type="hidden" name="userId" value={comp.id} />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] text-gray-400 font-bold uppercase">Nama Perusahaan</label>
                                            <input type="text" name="name" defaultValue={comp.full_name} className="font-bold text-gray-800 border-b border-transparent focus:border-red-500 hover:border-gray-200 outline-none w-full bg-transparent" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-gray-400 font-bold uppercase">Email (Read Only)</label>
                                            <input type="text" value={comp.email} disabled className="text-gray-500 w-full bg-transparent text-sm cursor-not-allowed" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2">
                                            <Phone size={14} className="text-gray-400" />
                                            <input type="text" name="phone" defaultValue={comp.phone} placeholder="No. Telp" className="text-sm text-gray-600 border-b border-transparent focus:border-red-500 outline-none bg-transparent w-full" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin size={14} className="text-gray-400" />
                                            <input type="text" name="address" defaultValue={comp.address} placeholder="Alamat" className="text-sm text-gray-600 border-b border-transparent focus:border-red-500 outline-none bg-transparent w-full" />
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-2 pt-2 border-t mt-2">
                                        <button className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded font-bold hover:bg-red-100 transition flex items-center gap-1">
                                            <Save size={12} /> Simpan Perubahan
                                        </button>
                                    </div>
                                </form>

                                {/* DELETE BUTTON */}
                                {/* @ts-expect-error: Server Action return type mismatch */}
                                <form action={deletePerusahaanAction} className="absolute top-4 right-4">
                                    <input type="hidden" name="userId" value={comp.id} />
                                    <button className="text-gray-300 hover:text-red-500 transition" title="Hapus Akun" onClick={(e) => !confirm('Hapus akun Perusahaan ini?') && e.preventDefault()}>
                                        <Trash2 size={16} />
                                    </button>
                                </form>
                            </div>
                        ))}
                        {companies.length === 0 && (
                            <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-dashed">
                                Tidak ada data Perusahaan ditemukan.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
