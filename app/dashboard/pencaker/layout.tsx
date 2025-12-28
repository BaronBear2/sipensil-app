import PencakerSidebar from '@/components/pencaker/PencakerSidebar'

export default function PencakerLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar on the left (fixed/sticky inside component) */}
            <PencakerSidebar />

            <main className="flex-1 w-full transition-all duration-300 pt-16 md:pt-0">
                {children}
            </main>
        </div>
    )
}
