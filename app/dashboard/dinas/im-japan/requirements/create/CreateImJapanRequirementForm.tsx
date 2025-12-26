'use client'

import { createImJapanRequirementAction } from '@/actions/dinas'
import { Upload, X, FileText } from 'lucide-react'
import { useState, useRef } from 'react'

export default function CreateImJapanRequirementForm() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0])
        }
    }

    const handleRemoveFile = () => {
        setSelectedFile(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    return (
        <form action={createImJapanRequirementAction} className="space-y-6">
            {/* Title */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Judul Dokumen <span className="text-red-500">*</span></label>
                <input
                    type="text"
                    name="title"
                    required
                    placeholder="Contoh: Scan KTP Asli"
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Keterangan / Instruksi</label>
                <textarea
                    name="description"
                    rows={4}
                    placeholder="Jelaskan format yang diterima, ukuran maksimal, dll."
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                ></textarea>
            </div>

            {/* Template Upload */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Upload Template (Opsional)</label>

                {/* Hidden Real Input */}
                <input
                    type="file"
                    name="template"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                />

                {!selectedFile ? (
                    <div
                        className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition cursor-pointer relative"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="flex flex-col items-center gap-2 text-gray-400 pointer-events-none">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                                <Upload size={24} />
                            </div>
                            <span className="text-sm font-medium">Klik untuk upload file template (PDF/Doc)</span>
                        </div>
                    </div>
                ) : (
                    <div className="border border-blue-200 bg-blue-50 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="p-2 bg-white rounded-lg border border-blue-100 text-blue-600">
                                <FileText size={20} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-800 truncate">{selectedFile.name}</p>
                                <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleRemoveFile}
                            className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition"
                        >
                            <X size={20} />
                        </button>
                    </div>
                )}
            </div>

            {/* Toggles */}
            <div className="flex flex-col gap-3 bg-gray-50 p-4 rounded-lg border">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="is_required" defaultChecked className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                    <div>
                        <span className="block font-bold text-gray-700 text-sm">Wajib Diunggah (Required)</span>
                        <span className="block text-xs text-gray-500">Peserta tidak bisa lanjut jika dokumen ini kosong.</span>
                    </div>
                </label>
                <hr />
                <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="is_active" defaultChecked className="w-5 h-5 text-green-600 rounded focus:ring-green-500" />
                    <div>
                        <span className="block font-bold text-gray-700 text-sm">Status Aktif</span>
                        <span className="block text-xs text-gray-500">Non-aktifkan jika dokumen ini tidak lagi diperlukan.</span>
                    </div>
                </label>
            </div>

            {/* Submit */}
            <div className="pt-4 flex justify-end">
                <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                    Simpan Dokumen
                </button>
            </div>
        </form>
    )
}
