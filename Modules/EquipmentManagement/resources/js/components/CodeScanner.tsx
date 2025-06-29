import React, { useState, useEffect } from 'react';
import { Button } from '@/../../Modules/Core/resources/js/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/../../Modules/Core/resources/js/components/ui/card';
import { toast } from 'sonner';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';

interface Equipment {
    id: number;
    name: string;
    description: string;
    status: string;
}

interface ScanResult {
    equipment: Equipment;
    scan_time: string;
}

export function CodeScanner() {
    const [isScanning, setIsScanning] = useState(false);
    const [lastScan, setLastScan] = useState<ScanResult | null>(null);
    const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        return () => {
            if (scanner) {
                scanner.clear();
            }
        };
    }, [scanner]);

    const startScanning = () => {
        const newScanner = new Html5QrcodeScanner(
            'scanner',
            {
                fps: 10,
                qrbox: 250,
                aspectRatio: 1,
            },
            false
        );

        newScanner.render(onScanSuccess, onScanError);
        setScanner(newScanner);
        setIsScanning(true);
    };

    const stopScanning = () => {
        if (scanner) {
            scanner.clear();
            setScanner(null);
        }
        setIsScanning(false);
    };

    const onScanSuccess = async (decodedText: string) => {
        try {
            const response = await axios.post('/api/equipment/codes/scan', {
                code: decodedText,
            });

            setLastScan(response.data.data);
            toast.success('Equipment scanned successfully');
            stopScanning();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to process scan');
        }
    };

    const onScanError = (error: any) => {
        // Ignore errors during scanning
        console.log(error);
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Equipment Scanner</CardTitle>
                <CardDescription>
                    Scan QR codes or barcodes to access equipment information.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {!isScanning ? (
                        <Button onClick={startScanning} className="w-full">
                            Start Scanning
                        </Button>
                    ) : (
                        <div className="space-y-4">
                            <div id="scanner" className="w-full" />
                            <Button
                                onClick={stopScanning}
                                variant="outline"
                                className="w-full"
                            >
                                Stop Scanning
                            </Button>
                        </div>
                    )}

                    {lastScan && (
                        <div className="mt-8 p-4 border rounded-lg">
                            <h3 className="font-medium text-lg mb-2">
                                Last Scan Result
                            </h3>
                            <div className="space-y-2">
                                <p>
                                    <span className="font-medium">Equipment:</span>{' '}
                                    {lastScan.equipment.name}
                                </p>
                                <p>
                                    <span className="font-medium">Description:</span>{' '}
                                    {lastScan.equipment.description}
                                </p>
                                <p>
                                    <span className="font-medium">Status:</span>{' '}
                                    {lastScan.equipment.status}
                                </p>
                                <p>
                                    <span className="font-medium">Scan Time:</span>{' '}
                                    {lastScan.scan_time}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
} 