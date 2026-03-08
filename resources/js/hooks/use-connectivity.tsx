import { useState, useEffect } from 'react';

export type ConnectivityStatus = 'Strong' | 'Weak' | 'Offline';

interface NetworkInformation extends EventTarget {
    readonly saveData: boolean;
    readonly effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
    readonly rtt: number;
}

interface NavigatorWithConnection extends Navigator {
    readonly connection?: NetworkInformation;
    readonly mozConnection?: NetworkInformation;
    readonly webkitConnection?: NetworkInformation;
}

export function useConnectivity() {
    const [status, setStatus] = useState<ConnectivityStatus>('Strong');

    useEffect(() => {
        const updateStatus = () => {
            if (!navigator.onLine) {
                setStatus('Offline');
                return;
            }

            const nav = navigator as NavigatorWithConnection;
            const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
            
            if (connection) {
                if (connection.saveData) {
                    setStatus('Weak');
                } else {
                    const rtt = connection.rtt;
                    const effectiveType = connection.effectiveType;
                    
                    if (rtt > 500 || effectiveType === '2g' || effectiveType === '3g') {
                        setStatus('Weak');
                    } else {
                        setStatus('Strong');
                    }
                }
            } else {
                setStatus('Strong');
            }
        };

        window.addEventListener('online', updateStatus);
        window.addEventListener('offline', updateStatus);
        
        // Initial check
        updateStatus();

        return () => {
            window.removeEventListener('online', updateStatus);
            window.removeEventListener('offline', updateStatus);
        };
    }, []);

    return { connectivity: status };
}
