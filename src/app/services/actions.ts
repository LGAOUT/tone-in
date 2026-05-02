'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createService(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const examplesRaw = formData.get('examples') as string
  const examples = examplesRaw
    ? examplesRaw.split(',').map(s => s.trim()).filter(Boolean)
    : []

  const { data: service, error } = await supabase
    .from('services')
    .insert({
      provider_id: user.id,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      price: parseFloat(formData.get('price') as string),
      delivery_days: parseInt(formData.get('delivery_days') as string),
      examples,
      active: true,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/marketplace')
  revalidatePath('/services/manage')
  redirect(`/marketplace/${service.id}`)
}

export async function updateService(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const id = formData.get('id') as string
  const examplesRaw = formData.get('examples') as string
  const examples = examplesRaw
    ? examplesRaw.split(',').map(s => s.trim()).filter(Boolean)
    : []

  const { error } = await supabase
    .from('services')
    .update({
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      price: parseFloat(formData.get('price') as string),
      delivery_days: parseInt(formData.get('delivery_days') as string),
      examples,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/marketplace')
  revalidatePath(`/marketplace/${id}`)
  revalidatePath('/services/manage')
  redirect(`/marketplace/${id}`)
}

export async function toggleServiceStatus(id: string, active: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const { error } = await supabase
    .from('services')
    .update({ active: !active })
    .eq('id', id)
    .eq('provider_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/services/manage')
  revalidatePath('/marketplace')
  return { success: true }
}

export async function deleteService(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id)
    .eq('provider_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/services/manage')
  revalidatePath('/marketplace')
  redirect('/services/manage')
}