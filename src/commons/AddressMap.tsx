import { useEffect, useRef, useState, useCallback } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import './AddressMap.css';

interface Location {
  lat: number;
  lng: number;
}

interface AddressMapProps {
  address: string;
  location: Location;
  onLocationChange: (location: Location) => void;
  placeholder?: string;
  disabled?: boolean;
  disableAutoGeocode?: boolean;
}

// Componente del mapa usando Google Maps
function GoogleMapComponent({
  location,
  onLocationChange,
  disabled,
  centerTrigger,
  onMapReady
}: {
  location: Location;
  onLocationChange: (location: Location) => void;
  disabled: boolean;
  centerTrigger: number;
  onMapReady: (map: google.maps.Map) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const lastCenterTrigger = useRef(0);

  useEffect(() => {
    if (!mapRef.current) return;

    // Configuración inicial del mapa
    const mapOptions: google.maps.MapOptions = {
      center: location.lat !== 0 && location.lng !== 0
        ? { lat: location.lat, lng: location.lng }
        : { lat: -33.4489, lng: -70.6693 }, // Santiago, Chile
      zoom: location.lat !== 0 && location.lng !== 0 ? 15 : 10,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
      zoomControl: true,
      gestureHandling: 'cooperative',
      mapId: 'DEMO_MAP_ID' // Requerido para AdvancedMarkerElement
    };

    const map = new google.maps.Map(mapRef.current, mapOptions);
    mapInstanceRef.current = map;
    onMapReady(map);

    // Crear marcador inicial si hay ubicación
    if (location.lat !== 0 && location.lng !== 0) {
      const marker = new google.maps.marker.AdvancedMarkerElement({
        position: { lat: location.lat, lng: location.lng },
        map: map,
        title: 'Ubicación seleccionada',
        gmpDraggable: !disabled
      });
      markerRef.current = marker;

      // Evento de arrastre del marcador
      if (!disabled) {
        marker.addListener('dragend', () => {
          const position = marker.position as google.maps.LatLng | google.maps.LatLngLiteral;
          if (position) {
            onLocationChange({
              lat: typeof position.lat === 'function' ? position.lat() : position.lat,
              lng: typeof position.lng === 'function' ? position.lng() : position.lng
            });
          }
        });
      }
    }

    // Evento de clic en el mapa
    if (!disabled) {
      map.addListener('click', (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          const newLocation = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
          };
          onLocationChange(newLocation);
        }
      });
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.map = null;
      }
    };
  }, [disabled, onLocationChange, onMapReady]);

  // Actualizar ubicación del marcador
  useEffect(() => {
    if (mapInstanceRef.current) {
      if (location.lat !== 0 && location.lng !== 0) {
        const position = { lat: location.lat, lng: location.lng };

        if (markerRef.current) {
          markerRef.current.position = position;
        } else {
          const marker = new google.maps.marker.AdvancedMarkerElement({
            position: position,
            map: mapInstanceRef.current,
            title: 'Ubicación seleccionada',
            gmpDraggable: !disabled
          });
          markerRef.current = marker;

          if (!disabled) {
            marker.addListener('dragend', () => {
              const markerPosition = marker.position as google.maps.LatLng | google.maps.LatLngLiteral;
              if (markerPosition) {
                onLocationChange({
                  lat: typeof markerPosition.lat === 'function' ? markerPosition.lat() : markerPosition.lat,
                  lng: typeof markerPosition.lng === 'function' ? markerPosition.lng() : markerPosition.lng
                });
              }
            });
          }
        }
      } else if (markerRef.current) {
        markerRef.current.map = null;
        markerRef.current = null;
      }
    }
  }, [location, disabled, onLocationChange]);

  // Centrar mapa cuando se solicite
  useEffect(() => {
    if (
      centerTrigger > lastCenterTrigger.current &&
      mapInstanceRef.current &&
      location.lat !== 0 &&
      location.lng !== 0
    ) {
      mapInstanceRef.current.panTo({ lat: location.lat, lng: location.lng });
      mapInstanceRef.current.setZoom(15);
      lastCenterTrigger.current = centerTrigger;
    }
  }, [centerTrigger, location]);

  return <div ref={mapRef} style={{ height: '300px', width: '100%' }} />;
}

// Función para geocodificar dirección usando Google Geocoding API
const geocodeAddress = async (address: string, geocoder: google.maps.Geocoder): Promise<Location | null> => {
  if (!address.trim()) return null;

  try {
    const response = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
      geocoder.geocode(
        {
          address: address,
          region: 'CL' // Bias hacia Chile
        },
        (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results) {
            resolve(results);
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        }
      );
    });

    if (response && response.length > 0) {
      const result = response[0];
      const location = result.geometry.location;
      return {
        lat: location.lat(),
        lng: location.lng()
      };
    }
    return null;
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
};

export default function AddressMap({
  address,
  location,
  onLocationChange,
  disabled = false,
  disableAutoGeocode = false
}: AddressMapProps) {
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [lastGeocodedAddress, setLastGeocodedAddress] = useState<string>('');
  const [centerTrigger, setCenterTrigger] = useState(0);
  const [isManualSelection, setIsManualSelection] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasInitialData, setHasInitialData] = useState(false);
  const [allowGeocodingAfterInit, setAllowGeocodingAfterInit] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  // Obtener ubicación actual del usuario (para fallback)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          // Ubicación obtenida pero no necesaria para mostrar
        },
        () => {
          // Error al obtener ubicación, usar Santiago como fallback
        }
      );
    }
  }, []);

  // Manejar cuando el mapa esté listo
  const handleMapReady = useCallback((map: google.maps.Map) => {
    mapInstanceRef.current = map;
    geocoderRef.current = new google.maps.Geocoder();
    setMapReady(true);
  }, []);

  // Efecto para detectar datos iniciales y marcar como inicializado
  useEffect(() => {
    const hasValidLocation = location.lat !== 0 && location.lng !== 0;
    const hasAddress = address.trim().length > 0;

    if (hasValidLocation && hasAddress && !hasInitialData) {
      setHasInitialData(true);
      setLastGeocodedAddress(address.trim());
      setIsInitialized(true);
      setIsManualSelection(false);

      // Centrar el mapa en la ubicación existente después de un pequeño delay
      setTimeout(() => {
        setCenterTrigger(prev => prev + 1);
      }, 200);
    }
  }, [location.lat, location.lng, address, hasInitialData]);

  // Geocodificar dirección solo cuando es necesario
  useEffect(() => {
    if (!mapReady || !geocoderRef.current) return;

    // No geocodificar si está deshabilitado
    if (disableAutoGeocode) {
      return;
    }

    const trimmedAddress = address.trim();

    // No geocodificar si no hay dirección
    if (!trimmedAddress) {
      return;
    }

    // No geocodificar si es la misma dirección que ya se procesó
    if (trimmedAddress === lastGeocodedAddress) {
      return;
    }

    // No geocodificar si hay una selección manual activa
    if (isManualSelection) {
      return;
    }

    // NUEVA LÓGICA: Si ya está inicializado con datos válidos, solo geocodificar si:
    // 1. El usuario ha empezado a escribir una nueva dirección (allowGeocodingAfterInit es true)
    // 2. O si la dirección actual es muy diferente a la geocodificada anteriormente
    if (isInitialized && location.lat !== 0 && location.lng !== 0 && hasInitialData) {
      // Si el usuario no ha habilitado explícitamente la geocodificación después de la inicialización
      if (!allowGeocodingAfterInit) {
        // Verificar si la dirección cambió significativamente (más de 5 caracteres de diferencia)
        const addressDifference = Math.abs(trimmedAddress.length - lastGeocodedAddress.length);
        const isDifferentAddress = !trimmedAddress.toLowerCase().includes(lastGeocodedAddress.toLowerCase().substring(0, 10)) &&
          !lastGeocodedAddress.toLowerCase().includes(trimmedAddress.toLowerCase().substring(0, 10));

        if (addressDifference < 5 && !isDifferentAddress) {
          return; // No geocodificar cambios menores
        }
      }
    }

    // Limpiar timeout anterior
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce para evitar muchas peticiones
    debounceRef.current = setTimeout(async () => {
      if (!geocoderRef.current) return;
      setIsGeocoding(true);
      setMapError(null);

      const newLocation = await geocodeAddress(trimmedAddress, geocoderRef.current);
      if (newLocation) {
        onLocationChange(newLocation);
        setLastGeocodedAddress(trimmedAddress);
        setMapError(null);
        setIsManualSelection(false);
        setIsInitialized(true);
        setAllowGeocodingAfterInit(true); // Habilitar geocodificación futura
        setCenterTrigger(prev => prev + 1);
      } else {
        setMapError('No se pudo encontrar la ubicación para esta dirección');
      }

      setIsGeocoding(false);
    }, 1000);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [mapReady, address, lastGeocodedAddress, onLocationChange, isManualSelection, disableAutoGeocode, isInitialized, location.lat, location.lng, hasInitialData, allowGeocodingAfterInit]);

  // Limpiar estados cuando se limpia la dirección
  useEffect(() => {
    if (!address.trim()) {
      setLastGeocodedAddress('');
      setMapError(null);
      setIsManualSelection(false);
      setIsInitialized(false);
      setHasInitialData(false);
      setAllowGeocodingAfterInit(false);
    }
  }, [address]);

  // Detectar cambios significativos en la dirección para permitir nueva geocodificación
  useEffect(() => {
    const trimmedAddress = address.trim();

    if (trimmedAddress && trimmedAddress !== lastGeocodedAddress) {
      // Si la dirección cambió y había una selección manual, permitir nueva geocodificación
      if (isManualSelection && !disableAutoGeocode) {
        setIsManualSelection(false);
        setIsInitialized(false);
        setHasInitialData(false);
        setAllowGeocodingAfterInit(true);
      }

      // Si la dirección cambió significativamente después de la inicialización, permitir geocodificación
      if (isInitialized && hasInitialData && !disableAutoGeocode) {
        const addressDifference = Math.abs(trimmedAddress.length - lastGeocodedAddress.length);
        const isDifferentAddress = !trimmedAddress.toLowerCase().includes(lastGeocodedAddress.toLowerCase().substring(0, 10)) &&
          !lastGeocodedAddress.toLowerCase().includes(trimmedAddress.toLowerCase().substring(0, 10));

        if (addressDifference > 10 || isDifferentAddress) {
          setAllowGeocodingAfterInit(true);
        }
      }
    }
  }, [address, lastGeocodedAddress, isManualSelection, disableAutoGeocode, isInitialized, hasInitialData]);

  const handleLocationChangeInternal = useCallback((newLocation: Location) => {
    setIsManualSelection(true);
    setIsInitialized(true);
    setAllowGeocodingAfterInit(false); // Deshabilitar geocodificación automática después de selección manual
    onLocationChange(newLocation);
    setMapError(null);
  }, [onLocationChange]);

  // Función de renderizado del mapa
  const renderMap = (status: Status) => {
    if (status === Status.LOADING) {
      return (
        <div className="map-loading">
          <div className="loading-spinner"></div>
          <p>Cargando Google Maps...</p>
        </div>
      );
    }

    if (status === Status.FAILURE) {
      return (
        <div className="map-error">
          <p>Error al cargar Google Maps. Verifique su conexión a internet y la configuración de la API.</p>
        </div>
      );
    }

    return (
      <GoogleMapComponent
        location={location}
        onLocationChange={handleLocationChangeInternal}
        disabled={disabled}
        centerTrigger={centerTrigger}
        onMapReady={handleMapReady}
      />
    );
  };

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="address-map-container">
        <div className="map-error">
          <p>Error: No se encontró la API key de Google Maps en las variables de entorno.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="address-map-container">
      <div className="map-header">
        <div className="map-status">
          {isGeocoding && (
            <span className="status-loading">
              🔍 Buscando ubicación...
            </span>
          )}
          {mapError && (
            <span className="status-error">
              ⚠️ {mapError}
            </span>
          )}
          {!isGeocoding && !mapError && location.lat !== 0 && location.lng !== 0 && (
            <span className="status-success">
              📍 Ubicación {isManualSelection ? 'seleccionada manualmente' : 'geocodificada automáticamente'}
            </span>
          )}
        </div>
        <div className="coordinates">
          {location.lat !== 0 && location.lng !== 0 && (
            <small>
              Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
            </small>
          )}
        </div>
      </div>

      <div className="map-wrapper">
        <Wrapper
          apiKey={apiKey}
          render={renderMap}
          libraries={['places', 'geometry', 'marker']}
          language="es"
          region="CL"
        />
      </div>

      <div className="map-instructions">
        <small>
          💡 {(() => {
            if (disabled) return 'Ubicación de solo lectura';
            if (disableAutoGeocode) return 'Geocodificación automática deshabilitada. Haga clic en el mapa para seleccionar la ubicación exacta.';
            if (isManualSelection) return 'Ubicación seleccionada manualmente. Modifique significativamente la dirección para reactivar la geocodificación automática.';
            if (hasInitialData && !allowGeocodingAfterInit) return 'Ubicación cargada. Modifique la dirección para buscar una nueva ubicación automáticamente.';
            return 'Escriba una dirección para buscar automáticamente, o haga clic en el mapa para seleccionar manualmente la ubicación exacta';
          })()}
        </small>
      </div>
    </div>
  );
}
