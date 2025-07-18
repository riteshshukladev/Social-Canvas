// hooks/usePosts.js
import { useUser } from '@clerk/clerk-expo'
import { useCallback, useState } from 'react'
import { useSupabaseContext } from '../components/SupabaseProvider'

export const usePosts = () => {
  const { supabase } = useSupabaseContext()
  const { user } = useUser()
  const [loading, setLoading] = useState(false)

  const withRetry = useCallback(async (operation, maxRetries = 2) => {
    let lastError
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error
        
        // If it's a JWT error and we haven't exceeded retries, wait and try again
        if (error.message?.includes('JWT') && i < maxRetries) {
          console.log(`JWT error, retrying... (${i + 1}/${maxRetries})`)
          await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
          continue
        }
        
        throw error
      }
    }
    
    throw lastError
  }, [])

  const createPost = useCallback(async (title, content) => {
    if (!user) return null

    setLoading(true)
    try {
      const result = await withRetry(async () => {
        const { data, error } = await supabase
          .from('posts')
          .insert([{
            title,
            content,
            user_id: user.id,
          }])
          .select()

        if (error) throw error
        return data[0]
      })

      return result
    } catch (error) {
      console.error('Error creating post:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [user, supabase, withRetry])

  const updatePost = useCallback(async (postId, updates) => {
    setLoading(true)
    try {
      const result = await withRetry(async () => {
        const { data, error } = await supabase
          .from('posts')
          .update(updates)
          .eq('id', postId)
          .select()

        if (error) throw error
        return data[0]
      })

      return result
    } catch (error) {
      console.error('Error updating post:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [supabase, withRetry])

  const deletePost = useCallback(async (postId) => {
    setLoading(true)
    try {
      await withRetry(async () => {
        const { error } = await supabase
          .from('posts')
          .delete()
          .eq('id', postId)

        if (error) throw error
      })
    } catch (error) {
      console.error('Error deleting post:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [supabase, withRetry])

  const fetchPosts = useCallback(async () => {
    try {
      const result = await withRetry(async () => {
        const { data, error } = await supabase
          .from('posts')
          .select(`
            *,
            users!posts_user_id_fkey (
              first_name,
              last_name,
              avatar_url
            )
          `)
          .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
      })

      return result
    } catch (error) {
      console.error('Error fetching posts:', error)
      throw error
    }
  }, [supabase, withRetry])

  return { 
    createPost, 
    updatePost, 
    deletePost, 
    fetchPosts,
    loading 
  }
}