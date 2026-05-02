'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createGroup(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const { data: group, error } = await supabase
    .from('groups')
    .insert({
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      cover_url: formData.get('cover_url') as string || null,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  // Créateur devient admin automatiquement
  await supabase.from('group_members').insert({
    group_id: group.id,
    user_id: user.id,
    role: 'admin',
  })

  revalidatePath('/groups')
  redirect(`/groups/${group.id}`)
}

export async function toggleGroupMember(groupId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const { data: existing } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    await supabase.from('group_members').delete().eq('id', existing.id)
    await supabase.rpc('decrement_group_members', { gid: groupId })
  } else {
    await supabase.from('group_members').insert({
      group_id: groupId,
      user_id: user.id,
      role: 'member',
    })
    await supabase.rpc('increment_group_members', { gid: groupId })
  }

  revalidatePath(`/groups/${groupId}`)
  return { success: true }
}

export async function createGroupPost(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const group_id = formData.get('group_id') as string
  const content = formData.get('content') as string
  const media_url = formData.get('media_url') as string
  const media_type = formData.get('media_type') as string

  if (!content && !media_url) return { error: 'Post vide' }

  const { error } = await supabase.from('group_posts').insert({
    group_id,
    author_id: user.id,
    content: content || null,
    media_url: media_url || null,
    media_type: media_type || null,
  })

  if (error) return { error: error.message }

  await supabase.rpc('increment_group_posts', { gid: group_id })

  revalidatePath(`/groups/${group_id}`)
  return { success: true }
}