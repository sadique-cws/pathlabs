import { useState, useEffect } from 'react';

export type ConnectivityStatus = 'Strong' | 'Weak' | 'Offline';

export function useConnectivity() {
    const [status, setStatus] = useState<ConnectivityStatus>('Strong');

    useEffect(() => {
        const updateStatus = () => {
            if (!navigator.onLine) {
                setStatus('Offline');
                return;
            }

            // @ts-ignore - navigator.connection is not standard in all browsers
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            
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
