// lib/canvasStore.ts - SIMPLE JWT RETRY FIX
import { rewriteSnapshotAssetsToStorage } from './assetUpload';
import { supabase } from './supabase';

/**
 * Save a TLDraw canvas snapshot for a user
 */
export async function saveCanvas(
  userId: string,
  canvasName: string,
  snapshot: any
) {
  try {
    // First, rewrite any images/assets to Supabase storage
    const updatedSnapshot = await rewriteSnapshotAssetsToStorage(
      snapshot,
      userId,
      canvasName
    );

    // Upsert canvas into the table
    const { data, error } = await supabase
      .from('canvases')
      .upsert({
        user_id: userId,
        canvas_name: canvasName,
        data: updatedSnapshot,
      }, { onConflict: 'user_id,canvas_name' })
      .select('data, version, updated_at')
      .single();

    if (error) {
      // ✅ Simple JWT retry logic
      if (error.code === 'PGRST303' || (error.message && error.message.includes('JWT'))) {
        console.log('JWT expired during save, waiting and retrying...');
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        
        // Retry once
        const retryResult = await supabase
          .from('canvases')
          .upsert({
            user_id: userId,
            canvas_name: canvasName,
            data: updatedSnapshot,
          }, { onConflict: 'user_id,canvas_name' })
          .select('data, version, updated_at')
          .single();
          
        if (retryResult.error) throw retryResult.error;
        console.log('✅ JWT retry succeeded');
        return retryResult.data;
      }
      throw error;
    }

    return data;
  } catch (err) {
    console.error('Error saving canvas:', err);
    throw err;
  }
}

/**
 * Load a TLDraw canvas snapshot for a user
 */
export async function loadCanvas(
  userId: string,
  canvasName: string
) {
  try {
    // ✅ Use maybeSingle() to avoid errors when no canvas exists
    const { data, error } = await supabase
      .from('canvases')
      .select('data')
      .eq('user_id', userId)
      .eq('canvas_name', canvasName)
      .maybeSingle(); // ✅ This prevents "0 rows" error

    if (error) {
      console.warn('Error loading canvas data', error);
      return null;
    }

    if (!data) {
      console.log(`No canvas found for user ${userId}, canvas ${canvasName} - starting fresh`);
      return null;
    }

    return data; // { data: {...snapshot...} }
  } catch (err) {
    console.error('Unexpected error loading canvas:', err);
    return null;
  }
}
