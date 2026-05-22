'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

const REVALIDATE = '/dashboard/dinas/master-data'

// Generic helper to avoid duplication
async function createItem(table: string, data: object) {
    const supabase = await createClient()
    const { error } = await supabase.from(table).insert(data)
    if (error) return { error: error.message }
    revalidatePath(REVALIDATE)
    return { success: true }
}

async function deleteItem(table: string, id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) return { error: error.message }
    revalidatePath(REVALIDATE)
    return { success: true }
}

// -- Categories --
export async function createCategoryAction(formData: FormData) {
    return createItem('master_categories', { name: formData.get('name') as string })
}

export async function deleteCategoryAction(formData: FormData) {
    return deleteItem('master_categories', formData.get('id') as string)
}

// -- Locations --
export async function createLocationAction(formData: FormData) {
    return createItem('master_locations', { 
        name: formData.get('name') as string, 
        address: formData.get('address') as string 
    })
}

export async function deleteLocationAction(formData: FormData) {
    return deleteItem('master_locations', formData.get('id') as string)
}

// -- Requirements --
export async function createRequirementAction(formData: FormData) {
    return createItem('master_requirements', { text: formData.get('text') as string })
}

export async function deleteRequirementAction(formData: FormData) {
    return deleteItem('master_requirements', formData.get('id') as string)
}

// -- Notes --
export async function createNoteAction(formData: FormData) {
    return createItem('master_notes', { text: formData.get('text') as string })
}

export async function deleteNoteAction(formData: FormData) {
    return deleteItem('master_notes', formData.get('id') as string)
}
