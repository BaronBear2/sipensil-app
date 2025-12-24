'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

export default function FilterTraining({ trainings }: { trainings: { id: string, title: string }[] }) {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { replace } = useRouter()

    const handleFilter = (trainingId: string) => {
        const params = new URLSearchParams(searchParams)
        if (trainingId) {
            params.set('training_id', trainingId)
        } else {
            params.delete('training_id')
        }
        replace(`${pathname}?${params.toString()}`)
    }

    return (
        <select
            className="border rounded-lg text-sm px-3 py-2 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            onChange={(e) => handleFilter(e.target.value)}
            defaultValue={searchParams.get('training_id')?.toString()}
        >
            <option value="">Semua Pelatihan</option>
            {trainings.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
            ))}
        </select>
    )
}
