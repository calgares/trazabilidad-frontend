import { useRef, useImperativeHandle, forwardRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import { Eraser } from 'lucide-react';

interface SignaturePadProps {
    onChange?: () => void;
}

export interface SignaturePadRef {
    clear: () => void;
    isEmpty: () => boolean;
    getTrimmedCanvas: () => HTMLCanvasElement;
    toDataURL: () => string;
}

export const SignaturePad = forwardRef<SignaturePadRef, SignaturePadProps>((props, ref) => {
    const sigCanvas = useRef<SignatureCanvas>(null);

    useImperativeHandle(ref, () => ({
        clear: () => sigCanvas.current?.clear(),
        isEmpty: () => sigCanvas.current?.isEmpty() ?? true,
        getTrimmedCanvas: () => sigCanvas.current?.getTrimmedCanvas()!,
        toDataURL: () => sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png') ?? ''
    }));

    return (
        <div className="space-y-2">
            <div className="border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-500">
                <SignatureCanvas
                    ref={sigCanvas}
                    penColor="black"
                    canvasProps={{
                        className: 'w-full h-[200px]',
                    }}
                    onEnd={props.onChange}
                />
            </div>
            <div className="flex justify-end">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => sigCanvas.current?.clear()}
                    className="text-muted-foreground hover:text-destructive"
                >
                    <Eraser className="w-4 h-4 mr-2" />
                    Limpiar firma
                </Button>
            </div>
        </div>
    );
});

SignaturePad.displayName = 'SignaturePad';
