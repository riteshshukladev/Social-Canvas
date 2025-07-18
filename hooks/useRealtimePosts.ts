// hooks/useRealtimePosts.js
import { useAuth } from '@clerk/clerk-expo'
import { useCallback, useEffect, useState } from 'react'
import { useSupabaseContext } from '../components/SupabaseProvider'

export const useRealtimePosts = () => {
  const { supabase, isReady } = useSupabaseContext()
  const { getToken } = useAuth()
  const [posts, setPosts] = useState([])
  const [channel, setChannel] = useState(null)

  const refreshRealtimeAuth = useCallback(async () => {
    try {
      const token = await getToken({ template: 'supabase' })
      if (token) {
        supabase.realtime.setAuth(token)
        console.log('Realtime auth refreshed')
      }
    } catch (error) {
      console.error('Error refreshing realtime auth:', error)
    }
  }, [getToken, supabase])

  const setupRealtimeSubscription = useCallback(() => {
    if (!isReady) return

    // Remove existing channel
    if (channel) {
      supabase.removeChannel(channel)
    }

    const newChannel = supabase
      .channel('posts')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'posts' 
        }, 
        (payload) => {
          console.log('New post:', payload.new)
          setPosts(prev => [payload.new, ...prev])
        }
      )
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'posts' 
        }, 
        (payload) => {
          console.log('Updated post:', payload.new)
          setPosts(prev => prev.map(post => 
            post.id === payload.new.id ? payload.new : post
          ))
        }
      )
      .on('postgres_changes', 
        { 
          event: 'DELETE', 
          schema: 'public', 
          table: 'posts' 
        }, 
        (payload) => {
          console.log('Deleted post:', payload.old)
          setPosts(prev => prev.filter(post => post.id !== payload.old.id))
        }
      )

    // Handle connection errors
    newChannel.on('system', {}, (payload) => {
      console.log('Realtime system event:', payload)
      
      // If auth error, refresh token and reconnect
      if (payload.extension === 'postgres_changes' && payload.status === 'error') {
        console.log('Realtime auth error, refreshing...')
        refreshRealtimeAuth()
        
        // Reconnect after a short delay
        setTimeout(() => {
          setupRealtimeSubscription()
        }, 2000)
      }
    })

    newChannel.subscribe((status) => {
      console.log('Realtime subscription status:', status)
    })

    setChannel(newChannel)
  }, [isReady, supabase, channel, refreshRealtimeAuth])

  useEffect(() => {
    if (!isReady) return

    // Initial fetch
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) throw error
        setPosts(data || [])
      } catch (error) {
        console.error('Error fetching posts:', error)
      }
    }

    fetchPosts()
    setupRealtimeSubscription()

    // Refresh realtime auth every 45 seconds
    const authRefreshInterval = setInterval(refreshRealtimeAuth, 45000)

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
      clearInterval(authRefreshInterval)
    }
  }, [isReady, supabase, setupRealtimeSubscription, refreshRealtimeAuth])

  return posts
}