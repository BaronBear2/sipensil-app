
import { createClient } from '@/utils/supabase/client'

export async function uploadFile(
    file: File,
    bucket: 'avatars' | 'documents' | 'im_japan_documents',
    path_prefix: string
): Promise<{ url: string | null; error: string | null }> {
    const supabase = createClient()

    // Sanitize filename: remove spaces, special chars, add timestamp
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filePath = `${path_prefix}/${timestamp}_${sanitizedName}`

    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false // Don't overwrite, unique names
        })

    if (error) {
        console.error('Upload error:', error)
        return { url: null, error: error.message }
    }

    // Get Public URL
    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

    return { url: publicUrl, error: null }
}
