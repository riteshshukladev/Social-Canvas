// lib/assetUpload.ts
import { decode as atob } from 'base-64';
import { supabase } from './supabase';

// Convert base64 string to Uint8Array
function base64ToUint8Array(b64: string) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

// Rewrite snapshot assets (images) to Supabase storage
export async function rewriteSnapshotAssetsToStorage(snapshot: any, userId: string, canvasName: string) {
  if (!snapshot?.store) return snapshot;

  const assets = snapshot.store.assets ?? {};
  const entries = Object.values(assets);

  for (const a of entries) {
    const src: string | undefined = a?.props?.src;

    if (a?.typeName === 'asset' && a?.type === 'image' && src?.startsWith('data:')) {
      try {
        const [header, b64] = src.split(',');
        const mimeType = header.match(/data:(.*?);base64/)?.[1] || 'image/png';
        const ext = mimeType.split('/')[1] || 'png';
        const bytes = base64ToUint8Array(b64);
        const blob = new Blob([bytes], { type: mimeType });
        const path = `${userId}/${encodeURIComponent(canvasName)}/${a.id}.${ext}`;

        const { error } = await supabase.storage
          .from('tldraw-assets') // your bucket name
          .upload(path, blob, { upsert: true, contentType: mimeType });

        if (error) {
          console.warn('Image upload failed for asset', a.id, error);
          continue;
        }

        const { data: publicUrlData } = supabase.storage
          .from('tldraw-assets')
          .getPublicUrl(path);

        if (publicUrlData?.publicUrl) {
          a.props.src = publicUrlData.publicUrl;
        }
      } catch (error) {
        console.warn('Error rewriting image asset', a.id, error);
      }
    }
  }

  return snapshot;
}
