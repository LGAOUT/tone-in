'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createPost(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const content = formData.get('content') as string
  const media_url = formData.get('media_url') as string
  const media_type = formData.get('media_type') as string

  if (!content && !media_url) return { error: 'Le post ne peut pas être vide' }

  const { error } = await supabase.from('posts').insert({
    author_id: user.id,
    content: content || null,
    media_url: media_url || null,
    media_type: media_type || null,
  })

  if (error) return { error: error.message }

  // Incrémente posts_count sur le profil
  await supabase.rpc('increment_posts_count', { user_id: user.id })

  revalidatePath('/feed')
  return { success: true }
}

export async function toggleLike(postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const { data: existing } = await supabase
    .from('post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    await supabase.from('post_likes').delete().eq('id', existing.id)
    await supabase.rpc('decrement_likes_count', { post_id: postId })
  } else {
    await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id })
    await supabase.rpc('increment_likes_count', { post_id: postId })
  }

  revalidatePath('/feed')
  return { success: true }
}

export async function addComment(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const post_id = formData.get('post_id') as string
  const content = formData.get('content') as string
  if (!content.trim()) return { error: 'Commentaire vide' }

  const { error } = await supabase.from('comments').insert({
    post_id,
    author_id: user.id,
    content,
  })

  if (error) return { error: error.message }

  await supabase.rpc('increment_comments_count', { post_id })

  revalidatePath('/feed')
  return { success: true }
}

export async function toggleFollow(targetUserId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const { data: existing } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', targetUserId)
    .single()

  if (existing) {
    await supabase.from('follows').delete().eq('id', existing.id)
    await supabase.rpc('decrement_follow_counts', {
      follower: user.id,
      following: targetUserId,
    })
  } else {
    await supabase.from('follows').insert({
      follower_id: user.id,
      following_id: targetUserId,
    })
    await supabase.rpc('increment_follow_counts', {
      follower: user.id,
      following: targetUserId,
    })
  }

  revalidatePath('/feed')
  return { success: true }
}