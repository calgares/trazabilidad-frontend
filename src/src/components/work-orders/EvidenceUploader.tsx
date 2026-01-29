import { useState, useEffect } from 'react';
import { useWorkOrderEvidences, type WorkOrderEvidence } from '@/hooks/use-work-order-evidences';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Loader2, Upload, Trash2, Image as ImageIcon, FileText, Maximize2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EvidenceUploaderProps {
    workOrderId: string;
    readOnly?: boolean;
}

export function EvidenceUploader({ workOrderId, readOnly = false }: EvidenceUploaderProps) {
    const { listEvidences, uploadEvidence, deleteEvidence, loading, error } = useWorkOrderEvidences();
    const [evidences, setEvidences] = useState<WorkOrderEvidence[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [comment, setComment] = useState("");
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const loadData = async () => {
        const data = await listEvidences(workOrderId);
        setEvidences(data);
    };

    useEffect(() => {
        if (workOrderId) loadData();
    }, [workOrderId]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        setUploading(true);
        try {
            await uploadEvidence(workOrderId, selectedFile, comment);
            setSelectedFile(null);
            setComment("");
            await loadData();
        } catch (e) {
            console.error(e);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (evidence: WorkOrderEvidence) => {
        if (!confirm("¿Eliminar esta evidencia permanentemente?")) return;
        try {
            await deleteEvidence(evidence);
            await loadData();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="space-y-6">
            {!readOnly && (
                <Card className="border-dashed border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium uppercase tracking-wider text-slate-500">Nueva Evidencia</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                <Input
                                    id="picture"
                                    type="file"
                                    accept="image/*,application/pdf"
                                    onChange={handleFileSelect}
                                    className="bg-white dark:bg-slate-950"
                                />
                                <p className="text-xs text-slate-500">Fotos (JPG, PNG) o Documentos (PDF)</p>
                            </div>
                            <div className="flex-1 w-full">
                                <Input
                                    placeholder="Comentario o descripción (opcional)..."
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                    className="bg-white dark:bg-slate-950"
                                />
                            </div>
                            <Button
                                onClick={handleUpload}
                                disabled={!selectedFile || uploading}
                                className="bg-indigo-600 hover:bg-indigo-700 w-full md:w-auto"
                            >
                                {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                Subir
                            </Button>
                        </div>
                        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {evidences.map((ev) => (
                    <Card key={ev.id} className="overflow-hidden group relative hover:shadow-md transition-all">
                        <div className="aspect-video bg-slate-100 dark:bg-slate-800 relative flex items-center justify-center overflow-hidden">
                            {ev.url_archivo ? (
                                <img
                                    src={ev.url_archivo}
                                    alt="Evidence"
                                    className="object-cover w-full h-full cursor-pointer hover:scale-105 transition-transform duration-300"
                                    onClick={() => setPreviewUrl(ev.url_archivo!)}
                                    onError={(e) => {
                                        // Fallback for non-images
                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=Documento';
                                        (e.target as HTMLImageElement).style.objectFit = 'contain';
                                        (e.target as HTMLImageElement).style.padding = '20px';
                                    }}
                                />
                            ) : (
                                <FileText className="h-10 w-10 text-slate-400" />
                            )}

                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                <Button size="icon" variant="secondary" className="h-6 w-6" onClick={() => setPreviewUrl(ev.url_archivo!)}>
                                    <Maximize2 className="h-3 w-3" />
                                </Button>
                                {!readOnly && (
                                    <Button size="icon" variant="destructive" className="h-6 w-6" onClick={() => handleDelete(ev)}>
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="p-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                            <p className="text-xs text-slate-500 font-mono mb-1">{new Date(ev.created_at).toLocaleDateString()}</p>
                            <p className="text-sm font-medium truncate" title={ev.comentario}>{ev.comentario || 'Sin comentario'}</p>
                            <Badge variant="outline" className="mt-1 text-[10px] h-5">{ev.tipo}</Badge>
                        </div>
                    </Card>
                ))}

                {evidences.length === 0 && !loading && (
                    <div className="col-span-full py-12 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                        <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-20" />
                        <p>No hay evidencias registradas</p>
                    </div>
                )}
            </div>

            <Dialog open={!!previewUrl} onOpenChange={(o) => !o && setPreviewUrl(null)}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-none">
                    <div className="relative w-full h-[80vh] flex items-center justify-center">
                        <img
                            src={previewUrl!}
                            alt="Preview"
                            className="max-w-full max-h-full object-contain"
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
