import { useState, useCallback } from 'react';

interface GeolocationState {
    latitude: number | null;
    longitude: number | null;
    error: string | null;
    loading: boolean;
}

export function useGeolocation() {
    const [location, setLocation] = useState<GeolocationState>({
        latitude: null,
        longitude: null,
        error: null,
        loading: false,
    });

    const getCurrentLocation = useCallback((): Promise<{ lat: number, lon: number } | null> => {
        setLocation(prev => ({ ...prev, loading: true, error: null }));

        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                const errorMsg = "Geolocalización no soportada por el navegador.";
                setLocation({ latitude: null, longitude: null, error: errorMsg, loading: false });
                resolve(null);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocation({
                        latitude,
                        longitude,
                        error: null,
                        loading: false
                    });
                    resolve({ lat: latitude, lon: longitude });
                },
                (error) => {
                    let errorMsg = "Error desconocido al obtener ubicación.";
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMsg = "Permiso de ubicación denegado.";
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMsg = "Información de ubicación no disponible.";
                            break;
                        case error.TIMEOUT:
                            errorMsg = "Tiempo de espera agotado al obtener ubicación.";
                            break;
                    }
                    setLocation({ latitude: null, longitude: null, error: errorMsg, loading: false });
                    console.warn("Geolocation warning:", errorMsg);
                    resolve(null); // Resolve null so flow continues without blocking
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        });
    }, []);

    return { location, getCurrentLocation };
}
