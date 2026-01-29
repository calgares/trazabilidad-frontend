import { useState, useCallback } from 'react';
import { supabase } from '@/services/supabase';
import { v4 as uuidv4 } from 'uuid';

export interface WorkOrderEvidence {
    id: string;
    work_order_id: string;
    tipo: 'FOTO' | 'DOCUMENTO' | 'COMENTARIO';
    url_archivo?: string;
    comentario?: string;
    created_at: string;
}

export function useWorkOrderEvidences() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const listEvidences = useCallback(async (workOrderId: string) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('work_order_evidences')
                .select('*')
                .eq('work_order_id', workOrderId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as WorkOrderEvidence[];
        } catch (err: any) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const uploadEvidence = async (
        workOrderId: string,
        file: File,
        comment?: string,
        tipo: 'FOTO' | 'DOCUMENTO' = 'FOTO'
    ) => {
        setLoading(true);
        setError(null);
        try {
            // 1. Upload file to Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${workOrderId}/${uuidv4()}.${fileExt}`;
            const filePath = fileName;

            // Ensure bucket exists or handle error (assuming bucket 'ot-evidences' exists as per prompt instructions)
            // We upload to 'ot-evidences' bucket
            const { error: uploadError } = await supabase.storage
                .from('ot-evidences')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('ot-evidences')
                .getPublicUrl(filePath);

            // 3. Save record in DB
            const { data, error: dbError } = await supabase
                .from('work_order_evidences')
                .insert({
                    work_order_id: workOrderId,
                    tipo: tipo,
                    url_archivo: publicUrl,
                    comentario: comment || file.name
                })
                .select()
                .single();

            if (dbError) throw dbError;
            return data;

        } catch (err: any) {
            console.error('Upload error:', err);
            setError(err.message || "Error al subir evidencia");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteEvidence = async (evidence: WorkOrderEvidence) => {
        setLoading(true);
        try {
            // 1. Try to delete from storage if it has a URL
            if (evidence.url_archivo) {
                // Extract path from URL. Assuming standard Supabase Storage URL structure.
                // .../storage/v1/object/public/ot-evidences/FOLDER/FILE
                const urlObj = new URL(evidence.url_archivo);
                const pathParts = urlObj.pathname.split('/ot-evidences/');
                if (pathParts.length > 1) {
                    const filePath = pathParts[1]; // decoded path
                    const { error: storageError } = await supabase.storage
                        .from('ot-evidences')
                        .remove([decodeURIComponent(filePath)]);

                    if (storageError) console.warn("Storage delete warning:", storageError);
                }
            }

            // 2. Delete from DB
            const { error } = await supabase
                .from('work_order_evidences')
                .delete()
                .eq('id', evidence.id);

            if (error) throw error;

        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const addComment = async (workOrderId: string, comment: string) => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('work_order_evidences')
                .insert({
                    work_order_id: workOrderId,
                    tipo: 'COMENTARIO',
                    comentario: comment
                });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        listEvidences,
        uploadEvidence,
        deleteEvidence,
        addComment,
        loading,
        error
    };
}
