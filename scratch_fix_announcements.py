import sys

def main():
    with open('actions/announcements.ts', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update imports
    content = content.replace("import { createClient } from '@/utils/supabase/server'", "import { createClient, createAdminClient } from '@/utils/supabase/server'")

    # 2. Fix the accidentally named adminClients that are standard clients
    content = content.replace("const adminClient = await createClient()", "const adminClient = await createAdminClient()")

    # 3. generateDefaultDraftsAction updates
    content = content.replace("await supabase.from('training_announcements').insert", "await adminClient.from('training_announcements').insert")
    # Actually, we should just replace ALL supabase.from('training_announcements') and 'blk_trainings' and 'training_registrations' with adminClient.from
    # BUT wait, the auth checks use supabase.from('profiles') - we must NOT change that! 
    # Because supabase is the user's client, they CAN read their own profile, or maybe they can't but verifyAdminRole does it anyway. Wait, verifyAdminRole does the auth check!
    # Wait, the actions in announcements.ts don't use verifyAdminRole, they copy-pasted the check:
    # const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    # That is perfectly fine with `supabase` (the normal client).

    # Let's do replacements manually function by function or just globally for the specific target tables:
    tables_to_admin = [
        "from('training_announcements')",
        "from('blk_trainings')",
        "from('training_registrations')",
        "from('qa_system_time')"
    ]
    for table in tables_to_admin:
        content = content.replace(f"supabase.{table}", f"adminClient.{table}")

    # Now we need to make sure deleteAnnouncementAction HAS an adminClient
    # It didn't have one before.
    if "export async function deleteAnnouncementAction" in content:
        # insert const adminClient = await createAdminClient() after role check
        parts = content.split("export async function deleteAnnouncementAction(formData: FormData) {")
        if len(parts) == 2:
            body = parts[1]
            if "const adminClient = await createAdminClient()" not in body:
                body = body.replace("const id = formData.get('id') as string", "const id = formData.get('id') as string\n    const adminClient = await createAdminClient()")
            parts[1] = body
            content = "export async function deleteAnnouncementAction(formData: FormData) {".join(parts)

    with open('actions/announcements.ts', 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    main()
