import { Button } from '@/../../Modules/Core/resources/js/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/../../Modules/Core/resources/js/Components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/../../Modules/Core/resources/js/Components/ui/dialog';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import Barcode from 'react-barcode';
import { toast } from 'sonner';

interface EquipmentCode {
    id: number;
    type: string;
    value: string;
    is_primary: boolean;
    last_scanned: string | null;
    qr_url: string | null;
    barcode_value: string | null;
}

interface EquipmentCodesProps {
    equipmentId: number;
}

export function EquipmentCodes({ equipmentId }: EquipmentCodesProps) {
    const [codes, setCodes] = useState<EquipmentCode[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showQrDialog, setShowQrDialog] = useState(false);
    const [showBarcodeDialog, setShowBarcodeDialog] = useState(false);
    const [selectedCode, setSelectedCode] = useState<EquipmentCode | null>(null);

    useEffect(() => {
        fetchCodes();
    }, [equipmentId]);

    const fetchCodes = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`/api/equipment/${equipmentId}/codes`);
            setCodes(response.data.data);
        } catch (error) {
            toast.error('Failed to fetch equipment codes');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateQr = async (isPrimary = false) => {
        try {
            setIsLoading(true);
            const response = await axios.post(`/api/equipment/${equipmentId}/codes/qr`, {
                is_primary: isPrimary,
            });
            await fetchCodes();
            setSelectedCode(response.data.data);
            setShowQrDialog(true);
            toast.success('QR code generated successfully');
        } catch (error) {
            toast.error('Failed to generate QR code');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateBarcode = async (isPrimary = false) => {
        try {
            setIsLoading(true);
            const response = await axios.post(`/api/equipment/${equipmentId}/codes/barcode`, {
                is_primary: isPrimary,
            });
            await fetchCodes();
            setSelectedCode(response.data.data);
            setShowBarcodeDialog(true);
            toast.success('Barcode generated successfully');
        } catch (error) {
            toast.error('Failed to generate barcode');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSetPrimary = async (code: EquipmentCode) => {
        try {
            setIsLoading(true);
            await axios.post(`/api/equipment/codes/${code.id}/primary`);
            await fetchCodes();
            toast.success('Primary code updated successfully');
        } catch (error) {
            toast.error('Failed to update primary code');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (code: EquipmentCode) => {
        try {
            setIsLoading(true);
            await axios.delete(`/api/equipment/codes/${code.id}`);
            await fetchCodes();
            toast.success('Code deleted successfully');
        } catch (error) {
            toast.error('Failed to delete code');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Equipment Codes</CardTitle>
                <CardDescription>Manage QR codes and barcodes for this equipment.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex space-x-4">
                        <Button onClick={() => handleGenerateQr()}>Generate QR Code</Button>
                        <Button onClick={() => handleGenerateBarcode()}>Generate Barcode</Button>
                    </div>

                    <div className="space-y-4">
                        {codes.map((code) => (
                            <div key={code.id} className="space-y-2 rounded-lg border p-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-medium">
                                            {code.type === 'qr' ? 'QR Code' : 'Barcode'}
                                            {code.is_primary && <span className="ml-2 text-sm text-green-600">(Primary)</span>}
                                        </h3>
                                        {code.last_scanned && <p className="text-sm text-gray-500">Last scanned: {code.last_scanned}</p>}
                                    </div>
                                    <div className="flex space-x-2">
                                        {!code.is_primary && (
                                            <Button variant="outline" size="sm" onClick={() => handleSetPrimary(code)} disabled={isLoading}>
                                                Set as Primary
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedCode(code);
                                                if (code.type === 'qr') {
                                                    setShowQrDialog(true);
                                                } else {
                                                    setShowBarcodeDialog(true);
                                                }
                                            }}
                                        >
                                            View
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDelete(code)} disabled={isLoading}>
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>

            <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>QR Code</DialogTitle>
                        <DialogDescription>Scan this QR code to access equipment information.</DialogDescription>
                    </DialogHeader>
                    {selectedCode?.qr_url && (
                        <div className="flex flex-col items-center space-y-4">
                            <QRCodeSVG value={selectedCode.qr_url} size={200} />
                            <Button
                                variant="outline"
                                onClick={() => {
                                    navigator.clipboard.writeText(selectedCode.qr_url!);
                                    toast.success('QR code URL copied to clipboard');
                                }}
                            >
                                Copy URL
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={showBarcodeDialog} onOpenChange={setShowBarcodeDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Barcode</DialogTitle>
                        <DialogDescription>Scan this barcode to access equipment information.</DialogDescription>
                    </DialogHeader>
                    {selectedCode?.barcode_value && (
                        <div className="flex flex-col items-center space-y-4">
                            <Barcode value={selectedCode.barcode_value} />
                            <Button
                                variant="outline"
                                onClick={() => {
                                    navigator.clipboard.writeText(selectedCode.barcode_value!);
                                    toast.success('Barcode value copied to clipboard');
                                }}
                            >
                                Copy Value
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </Card>
    );
}
