const { useState, useEffect, useRef } = React;
const { MapPin, Navigation, Clock, AlertTriangle, CheckCircle2, Loader, Sparkles } = lucide;

// Components
const RouteCard = ({ route, isRecommended, isSelected, onClick }) => {
    const { name, distance, time, score, status, hazards } = route;
    
    return (
        <div 
            className={`glass-panel route-card ${isSelected ? 'selected' : ''}`}
            onClick={onClick}
        >
            {isRecommended && (
                <div className="recommended-badge">Recommended ✅</div>
            )}
            
            <div className="route-header">
                <h3 className="route-title">{name}</h3>
                <div className={`score-badge ${status}`}>
                    {score} / 100
                </div>
            </div>
            
            <div className="route-stats">
                <div className="stat-item">
                    <Navigation size={16} />
                    <span>{distance}</span>
                </div>
                <div className="stat-item">
                    <Clock size={16} />
                    <span>{time}</span>
                </div>
            </div>
            
            {hazards && hazards.length > 0 ? (
                <div className="hazards-list">
                    {hazards.map((hazard, idx) => (
                        <span key={idx} className="hazard-tag">
                            <AlertTriangle size={12} color="var(--moderate)" />
                            {hazard}
                        </span>
                    ))}
                </div>
            ) : (
                <div className="hazards-list">
                    <span className="hazard-tag" style={{ borderColor: 'rgba(16,185,129,0.3)' }}>
                        <CheckCircle2 size={12} color="var(--safe)" /> Clear Route
                    </span>
                </div>
            )}
        </div>
    );
};

// Custom CSS Map for Demo Mode
const CSSMap = ({ route }) => {
    if (!route) return null;
    return (
        <div className="map-container">
            <div className="grid-overlay"></div>
            <div className="radar"></div>
            
            <div className="glass-panel fade-in" style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 20, padding: '0.75rem 1rem', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Demo Path: </span>
                <strong style={{ color: `var(--${route.status})` }}>{route.name}</strong>
            </div>

            <div className="dummy-route-line" style={{ 
                background: `var(--${route.status})`,
                boxShadow: `0 0 20px var(--${route.status})`
            }}>
                <div className="dummy-point start"></div>
                
                {route.hazards.map((hazard, idx) => (
                    <div key={idx} className="hazard-marker" style={{ left: `${(idx + 1) * 30}%` }}>
                        {hazard.includes('🚧') ? '🚧' : hazard.includes('🌑') ? '🌑' : '⚠️'}
                    </div>
                ))}
                
                <div className="dummy-point end"></div>
            </div>
            
            <div style={{ position: 'absolute', bottom: '2rem', zIndex: 20, background: 'rgba(0,0,0,0.6)', padding: '0.5rem 1rem', borderRadius: '999px', fontSize: '0.875rem', backdropFilter: 'blur(5px)' }}>
                {route.hazards.length > 0 ? "Hazards simulated on radar." : "Path is clear."}
            </div>
        </div>
    );
};


// Map View handling both Google Maps and Demo Mode
const MapView = ({ route }) => {
    const mapRef = useRef(null);
    const googleMapRef = useRef(null);
    const directionsRendererRef = useRef(null);

    // Only initialize Google Maps if it exists and we are not forcing mock data
    useEffect(() => {
        if (!route?.isMock && !googleMapRef.current && window.google && window.google.maps && mapRef.current) {
            googleMapRef.current = new window.google.maps.Map(mapRef.current, {
                center: { lat: 28.6139, lng: 77.2090 },
                zoom: 12,
                disableDefaultUI: true,
                styles: [
                    { elementType: "geometry", stylers: [{ color: "#0f172a" }] },
                    { elementType: "labels.text.stroke", stylers: [{ color: "#0f172a" }] },
                    { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
                    { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
                    { featureType: "water", elementType: "geometry", stylers: [{ color: "#020617" }] }
                ]
            });

            directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
                map: googleMapRef.current,
                suppressMarkers: false,
            });
        }
    }, [route]);

    useEffect(() => {
        if (route && !route.isMock && route.googleRoute && directionsRendererRef.current) {
            const fakeDirectionsResult = {
                routes: [route.googleRoute],
                request: { travelMode: 'DRIVING' }
            };
            
            const colorMap = {
                'safe': '#10b981',
                'moderate': '#f59e0b',
                'danger': '#ef4444'
            };
            
            directionsRendererRef.current.setOptions({
                polylineOptions: {
                    strokeColor: colorMap[route.status],
                    strokeWeight: 6,
                    strokeOpacity: 0.9
                }
            });

            directionsRendererRef.current.setDirections(fakeDirectionsResult);
        }
    }, [route]);

    if (!route) {
        return (
            <div className="glass-panel map-view">
                <div className="map-container">
                    <p style={{ color: 'var(--text-muted)' }}>Select a route to view on map</p>
                </div>
            </div>
        );
    }

    if (route.isMock) {
        return (
            <div className="glass-panel map-view" style={{ padding: 0 }}>
                 <CSSMap route={route} />
            </div>
        );
    }

    return (
        <div className="glass-panel map-view" style={{ padding: 0 }}>
            <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: '500px', borderRadius: '20px' }} />
        </div>
    );
};

const App = () => {
    const [view, setView] = useState('home');
    const [source, setSource] = useState('');
    const [dest, setDest] = useState('');
    const [routes, setRoutes] = useState([]);
    const [selectedRouteId, setSelectedRouteId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isDemoMode, setIsDemoMode] = useState(false);

    // Initial Check for API Keys to activate demo mode warning
    useEffect(() => {
        if (!window.google || !window.google.maps) {
            setIsDemoMode(true);
        }
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (source && dest) {
            setLoading(true);
            
            // If no Google Maps API, automatically use Mock Demo Mode
            if (!window.google || !window.google.maps) {
                setTimeout(() => { // Add a slight delay for realism
                    const mockRoutes = window.SafetyLogic.getMockRoutes();
                    setRoutes(mockRoutes);
                    setSelectedRouteId(mockRoutes[0].id);
                    setIsDemoMode(true);
                    setLoading(false);
                    setView('results');
                }, 1500);
                return;
            }

            // Real Google Maps Fetch
            try {
                const directionsService = new window.google.maps.DirectionsService();
                const result = await new Promise((resolve, reject) => {
                    directionsService.route({
                        origin: source,
                        destination: dest,
                        travelMode: window.google.maps.TravelMode.DRIVING,
                        provideRouteAlternatives: true
                    }, (response, status) => {
                        if (status === 'OK') resolve(response);
                        else reject(status);
                    });
                });

                const processedPromises = result.routes.map((route, idx) => 
                    window.SafetyLogic.processGoogleRoute(route, idx)
                );
                
                const processedRoutes = await Promise.all(processedPromises);
                processedRoutes.sort((a, b) => b.score - a.score);
                
                setRoutes(processedRoutes);
                if (processedRoutes.length > 0) {
                    setSelectedRouteId(processedRoutes[0].id);
                }
                setIsDemoMode(false);
                setLoading(false);
                setView('results');

            } catch (err) {
                console.error("Routing error:", err);
                // Fallback to Demo Mode on Error
                const mockRoutes = window.SafetyLogic.getMockRoutes();
                setRoutes(mockRoutes);
                setSelectedRouteId(mockRoutes[0].id);
                setIsDemoMode(true);
                setLoading(false);
                setView('results');
            }
        }
    };

    const resetSearch = () => {
        setView('home');
        setSource('');
        setDest('');
    };

    return (
        <div className="app-container">
            <div className="bg-animation"></div>
            
            <header className="header">
                <h1>SafeRoute</h1>
                <p>Intelligent Routing with Real-time Safety Scoring</p>
                {isDemoMode && (
                    <div className="demo-badge fade-in">
                        <Sparkles size={14} /> Demo Mode Active
                    </div>
                )}
            </header>

            {view === 'home' && (
                <div className="glass-panel search-box" style={{ animation: 'slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                    <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="input-group">
                            <label>Starting Point</label>
                            <input 
                                type="text" 
                                placeholder="E.g., Connaught Place, New Delhi" 
                                value={source}
                                onChange={(e) => setSource(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label>Destination</label>
                            <input 
                                type="text" 
                                placeholder="E.g., Cyber City, Gurgaon" 
                                value={dest}
                                onChange={(e) => setDest(e.target.value)}
                                required
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="btn-primary" 
                            disabled={loading}
                            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}
                        >
                            {loading ? <Loader className="spin" size={20} /> : <Navigation size={20} />}
                            {loading ? "Analyzing Routes..." : "Find Safe Route"}
                        </button>
                    </form>
                </div>
            )}

            {view === 'results' && (
                <div className="results-layout fade-in">
                    <div className="routes-list">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2>Route Options</h2>
                            <button onClick={resetSearch} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                                New Search
                            </button>
                        </div>
                        {routes.map((route, idx) => (
                            <RouteCard 
                                key={route.id}
                                route={route}
                                isRecommended={idx === 0}
                                isSelected={selectedRouteId === route.id}
                                onClick={() => setSelectedRouteId(route.id)}
                            />
                        ))}
                    </div>
                    <div>
                        <h2 style={{ marginBottom: '1rem' }}>Live Map</h2>
                        <MapView route={routes.find(r => r.id === selectedRouteId)} />
                    </div>
                </div>
            )}
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
