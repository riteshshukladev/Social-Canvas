// hooks/useUserSync.js
import { useUser } from '@clerk/clerk-expo'
import { useEffect } from 'react'
import { useSupabaseContext } from '../components/SupabaseProvider'

export const useUserSync = () => {
  const { user } = useUser()
  const { supabase, isReady } = useSupabaseContext()

  useEffect(() => {
    if (user && isReady) {
      const syncUser = async () => {
        try {
          const { error } = await supabase
            .from('users')
            .upsert({
              id: user.id,
              email: user.primaryEmailAddress?.emailAddress,
              first_name: user.firstName,
              last_name: user.lastName,
              avatar_url: user.imageUrl,
              updated_at: new Date().toISOString(),
            })

          if (error) {
            console.error('Error syncing user:', error)
          }
        } catch (error) {
          console.error('Error in user sync:', error)
        }
      }

      syncUser()
    }
  }, [user, isReady, supabase])

  return { user }
}