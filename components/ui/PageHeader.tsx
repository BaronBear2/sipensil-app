import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface PageHeaderProps {
    title: React.ReactNode;
    description?: React.ReactNode;
    backLink?: string;
    actions?: React.ReactNode;
}

export default function PageHeader({ title, description, backLink, actions }: PageHeaderProps) {
    return (
        <div className="bg-white border-b sticky top-0 z-30 shadow-sm mb-6">
            <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {backLink && (
                        <Link href={backLink} className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-600 border border-gray-200 bg-white shadow-sm flex items-center justify-center">
                            <ArrowLeft size={20} />
                        </Link>
                    )}
                    <div>
                        <h1 className="text-lg md:text-xl font-bold text-gray-800 leading-tight tracking-tight">
                            {title}
                        </h1>
                        {description && (
                            <p className="text-xs md:text-sm text-gray-500 font-medium mt-0.5">
                                {description}
                            </p>
                        )}
                    </div>
                </div>
                {actions && (
                    <div className="flex items-center gap-3">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    )
}
