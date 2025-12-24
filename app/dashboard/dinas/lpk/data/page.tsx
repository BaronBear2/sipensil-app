import { createClient } from '@/utils/supabase/server'
import { PlusCircle, Trash2, Edit, Save, Building, Phone, MapPin, Search } from 'lucide-react'
import { createLpkAction, updateLpkAction, deleteLpkAction } from '@/actions/dinas'

export default async function DataLpksPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const supabase = await createClient()
    const params = await searchParams
    const query = params?.q || ''

    let lpks: any[] = []

    let qBuilder = supabase
        .from('profiles')
        .select(`
            *,
            profile_lpk(*)
        `)
        .eq('role', 'lpk') // Ensure role is lpk
        .order('created_at', { ascending: false })

    if (query) {
        qBuilder = qBuilder.ilike('full_name', `%${query}%`)
    }

    const { data } = await qBuilder

    if (data) {
        lpks = data.map((p: any) => ({
            ...p,
            ...(p.profile_lpk || {}),
            // Ensure fields are available at top level for convenience if needed, or just access via object
        }))
    }

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-2">
                        <Building className="text-blue-600" /> Data LPK (Lembaga Pelatihan Kerja)
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Kelola data akun LPK yang terdaftar di sistem.
                    </p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between">
                <form className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                        name="q"
                        defaultValue={query}
                        placeholder="Cari nama LPK..."
                        className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </form>

                {/* ADD LPK BUTTON - TRIGGERS MODAL OR FORM */}
                {/* For simplicity in this plan, I'll use a direct form block at the top if adding, or a "Tambah" button that scrolls to form? 
                    Actually, let's use a "Tambah" section similar to Requirements page or a distinct page.
                    Given "CRUD", let's put a "Create New" form section here for admin convenience.
                */}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* FORM TAMBAH */}
                <div className="bg-white p-6 rounded-xl shadow-sm border h-fit">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <PlusCircle size={18} className="text-blue-600" /> Tambah Akun LPK Baru
                    </h3>
                    {/* @ts-expect-error: Server Action return type mismatch */}
                    <form action={createLpkAction} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nama LPK</label>
                            <input type="text" name="name" required className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Contoh: LPK Jaya Abadi" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Login</label>
                            <input type="email" name="email" required className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="email@lpk.com" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password Default</label>
                            <input type="text" name="password" required className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Min. 6 karakter" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">No. Telepon</label>
                            <input type="text" name="phone" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0812..." />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Alamat</label>
                            <textarea name="address" rows={2} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Alamat lengkap..."></textarea>
                        </div>
                        <button className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                            Buat Akun LPK
                        </button>
                    </form>
                </div>

                {/* LIST LPK */}
                <div className="lg:col-span-2 space-y-4">
                    {lpks.map((lpk) => (
                        <div key={lpk.id} className="bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition group relative">
                            {/* @ts-expect-error: Server Action return type mismatch */}
                            <form action={updateLpkAction} className="flex flex-col gap-3">
                                <input type="hidden" name="userId" value={lpk.id} />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] text-gray-400 font-bold uppercase">Nama LPK</label>
                                        <input type="text" name="name" defaultValue={lpk.full_name} className="font-bold text-gray-800 border-b border-transparent focus:border-blue-500 hover:border-gray-200 outline-none w-full bg-transparent" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-400 font-bold uppercase">Email (Read Only)</label>
                                        <input type="text" value={lpk.email} disabled className="text-gray-500 w-full bg-transparent text-sm cursor-not-allowed" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2">
                                        <Phone size={14} className="text-gray-400" />
                                        <input type="text" name="phone" defaultValue={lpk.phone_number || lpk.phone} placeholder="No. Telp" className="text-sm text-gray-600 border-b border-transparent focus:border-blue-500 outline-none bg-transparent w-full" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin size={14} className="text-gray-400" />
                                        <input type="text" name="address" defaultValue={lpk.address} placeholder="Alamat" className="text-sm text-gray-600 border-b border-transparent focus:border-blue-500 outline-none bg-transparent w-full" />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-2 border-t mt-2">
                                    <button className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded font-bold hover:bg-blue-100 transition flex items-center gap-1">
                                        <Save size={12} /> Simpan Perubahan
                                    </button>
                                </div>
                            </form>

                            {/* DELETE BUTTON */}
                            {/* @ts-expect-error: Server Action return type mismatch */}
                            <form action={deleteLpkAction} className="absolute top-4 right-4">
                                <input type="hidden" name="userId" value={lpk.id} />
                                <button className="text-gray-300 hover:text-red-500 transition" title="Hapus Akun" onClick={(e) => !confirm('Hapus akun LPK ini? Semua data laporan akan hilang.') && e.preventDefault()}>
                                    <Trash2 size={16} />
                                </button>
                            </form>
                        </div>
                    ))}
                    {lpks.length === 0 && (
                        <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-dashed">
                            Tidak ada data LPK ditemukan.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
