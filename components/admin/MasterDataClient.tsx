'use client'

import React, { useState } from 'react'
import { Plus, Trash2, Tag, MapPin, CheckSquare, FileText } from 'lucide-react'
import {
    createCategoryAction, deleteCategoryAction,
    createLocationAction, deleteLocationAction,
    createRequirementAction, deleteRequirementAction,
    createNoteAction, deleteNoteAction
} from '@/actions/master'
import { SwalAlert, SwalConfirm, SwalToast } from '@/utils/swal'

// Generic list row
function ItemRow({ text, onDelete }: { text: string, onDelete: () => void }) {
    return (
        <div className="flex items-center justify-between py-2.5 px-3 border-b border-gray-50 hover:bg-gray-50/50 rounded transition">
            <span className="text-sm text-gray-700">{text}</span>
            <button onClick={onDelete} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded transition">
                <Trash2 size={15} />
            </button>
        </div>
    )
}

// Each tab defines its own config — easy to extend
type TabConfig = {
    key: string
    label: string
    icon: React.ReactNode
    color: string
    fields: { name: string, label: string, placeholder: string, type?: string }[]
    items: any[]
    itemLabel: (item: any) => string
    createAction: (fd: FormData) => Promise<any>
    deleteAction: (fd: FormData) => Promise<any>
}

export default function MasterDataClient({
    categories, locations, requirements, notes
}: {
    categories: any[]
    locations: any[]
    requirements: any[]
    notes: any[]
}) {
    const [activeTab, setActiveTab] = useState('categories')
    const [loading, setLoading] = useState(false)
    const [formValues, setFormValues] = useState<Record<string, string>>({})

    const TABS: TabConfig[] = [
        {
            key: 'categories',
            label: 'Kategori Pelatihan',
            icon: <Tag size={16} />,
            color: 'blue',
            fields: [{ name: 'name', label: 'Nama Kategori', placeholder: 'Contoh: Las, Otomotif...' }],
            items: categories,
            itemLabel: (i) => i.name,
            createAction: createCategoryAction,
            deleteAction: deleteCategoryAction,
        },
        {
            key: 'locations',
            label: 'Alamat Pelatihan',
            icon: <MapPin size={16} />,
            color: 'green',
            fields: [
                { name: 'name', label: 'Nama Tempat', placeholder: 'Contoh: UPTD BLK Kab. Bekasi' },
                { name: 'address', label: 'Alamat Lengkap (Opsional)', placeholder: 'Jalan X, Kec. Y...' }
            ],
            items: locations,
            itemLabel: (i) => `${i.name}${i.address ? ` — ${i.address}` : ''}`,
            createAction: createLocationAction,
            deleteAction: deleteLocationAction,
        },
        {
            key: 'requirements',
            label: 'Persyaratan Peserta',
            icon: <CheckSquare size={16} />,
            color: 'amber',
            fields: [{ name: 'text', label: 'Teks Persyaratan', placeholder: 'Contoh: Ber-KTP Kab. Bekasi' }],
            items: requirements,
            itemLabel: (i) => i.text,
            createAction: createRequirementAction,
            deleteAction: deleteRequirementAction,
        },
        {
            key: 'notes',
            label: 'Catatan Pelatihan',
            icon: <FileText size={16} />,
            color: 'purple',
            fields: [{ name: 'text', label: 'Teks Catatan', placeholder: 'Contoh: Bawa pakaian olahraga saat tes fisik' }],
            items: notes,
            itemLabel: (i) => i.text,
            createAction: createNoteAction,
            deleteAction: deleteNoteAction,
        },
    ]

    const activeConfig = TABS.find(t => t.key === activeTab)!

    const colorMap: Record<string, string> = {
        blue: 'border-blue-500 text-blue-700',
        green: 'border-green-500 text-green-700',
        amber: 'border-amber-500 text-amber-700',
        purple: 'border-purple-500 text-purple-700',
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        const fd = new FormData()
        activeConfig.fields.forEach(f => {
            fd.append(f.name, formValues[f.name] || '')
        })
        setLoading(true)
        const res = await activeConfig.createAction(fd)
        if (res?.error) SwalAlert.fire({ icon: 'error', title: 'Error', text: res.error })
        else {
            SwalToast.fire({ icon: 'success', title: 'Data Ditambahkan' })
            setFormValues({})
        }
        setLoading(false)
    }

    const handleDelete = async (id: string) => {
        const confirm = await SwalConfirm.fire({ title: 'Hapus data ini?', text: 'Data tidak dapat dikembalikan.' })
        if (!confirm.isConfirmed) return
        setLoading(true)
        const fd = new FormData()
        fd.append('id', id)
        const res = await activeConfig.deleteAction(fd)
        if (res?.error) SwalAlert.fire({ icon: 'error', title: 'Error', text: res.error })
        else SwalToast.fire({ icon: 'success', title: 'Data Dihapus' })
        setLoading(false)
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b overflow-x-auto">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => { setActiveTab(tab.key); setFormValues({}) }}
                        className={`flex items-center gap-2 px-5 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-all ${
                            activeTab === tab.key
                                ? `${colorMap[tab.color]} bg-gray-50/50`
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        {tab.icon}
                        {tab.label}
                        <span className="ml-1 bg-gray-100 text-gray-600 text-xs font-bold px-1.5 py-0.5 rounded-full">
                            {tab.items.length}
                        </span>
                    </button>
                ))}
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Add Form */}
                <div className="md:col-span-1">
                    <form onSubmit={handleCreate} className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4 text-sm">Tambah Data Baru</h3>
                        <div className="space-y-3 mb-4">
                            {activeConfig.fields.map(field => (
                                <div key={field.name}>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">{field.label}</label>
                                    <input
                                        type={field.type || 'text'}
                                        value={formValues[field.name] || ''}
                                        onChange={e => setFormValues(prev => ({ ...prev, [field.name]: e.target.value }))}
                                        placeholder={field.placeholder}
                                        className="w-full border p-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500"
                                        required
                                    />
                                </div>
                            ))}
                        </div>
                        <button disabled={loading} className="w-full bg-green-600 text-white font-bold py-2 rounded-lg flex justify-center items-center gap-2 hover:bg-green-700 disabled:opacity-50 transition">
                            <Plus size={16} /> Tambah
                        </button>
                    </form>
                </div>

                {/* List */}
                <div className="md:col-span-2">
                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                        <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{activeConfig.label}</span>
                            <span className="text-xs text-gray-400">{activeConfig.items.length} item</span>
                        </div>
                        <div className="divide-y divide-gray-50 max-h-[420px] overflow-y-auto">
                            {activeConfig.items.length === 0 ? (
                                <div className="py-10 text-center text-gray-400 text-sm">Belum ada data. Tambahkan melalui form di sebelah kiri.</div>
                            ) : (
                                activeConfig.items.map(item => (
                                    <ItemRow
                                        key={item.id}
                                        text={activeConfig.itemLabel(item)}
                                        onDelete={() => handleDelete(item.id)}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
