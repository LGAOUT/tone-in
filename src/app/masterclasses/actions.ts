'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createMasterclass(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const { data: mc, error } = await supabase
    .from('masterclasses')
    .insert({
      instructor_id: user.id,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      price: parseFloat(formData.get('price') as string),
      level: formData.get('level') as string,
      thumbnail_url: formData.get('thumbnail_url') as string || null,
      published: false,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/masterclasses')
  redirect(`/masterclasses/${mc.id}/edit`)
}

export async function updateMasterclass(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const id = formData.get('id') as string

  const { error } = await supabase
    .from('masterclasses')
    .update({
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      price: parseFloat(formData.get('price') as string),
      level: formData.get('level') as string,
      thumbnail_url: formData.get('thumbnail_url') as string || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath(`/masterclasses/${id}`)
  revalidatePath(`/masterclasses/${id}/edit`)
  return { success: true }
}

export async function togglePublish(id: string, published: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const { error } = await supabase
    .from('masterclasses')
    .update({ published: !published })
    .eq('id', id)
    .eq('instructor_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/masterclasses')
  revalidatePath(`/masterclasses/${id}`)
  return { success: true }
}

export async function addChapter(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const masterclass_id = formData.get('masterclass_id') as string

  const { data: existing } = await supabase
    .from('masterclass_chapters')
    .select('position')
    .eq('masterclass_id', masterclass_id)
    .order('position', { ascending: false })
    .limit(1)

  const nextPosition = (existing?.[0]?.position ?? 0) + 1

  const { error } = await supabase
    .from('masterclass_chapters')
    .insert({
      masterclass_id,
      title: formData.get('title') as string,
      description: formData.get('description') as string || null,
      video_url: formData.get('video_url') as string || null,
      duration_minutes: parseInt(formData.get('duration_minutes') as string) || 0,
      free_preview: formData.get('free_preview') === 'true',
      position: nextPosition,
    })

  if (error) return { error: error.message }

  revalidatePath(`/masterclasses/${masterclass_id}/edit`)
  return { success: true }
}

export async function deleteChapter(chapterId: string, masterclassId: string) {
  const supabase = await createClient()
  await supabase.from('masterclass_chapters').delete().eq('id', chapterId)
  revalidatePath(`/masterclasses/${masterclassId}/edit`)
  return { success: true }
}
