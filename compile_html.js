const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

function optimizeAndCompile(filename) {
    const srcPath = path.join(__dirname, 'src', filename);
    const destPath = path.join(__dirname, filename);
    if (!fs.existsSync(srcPath)) {
        console.warn(`File src/${filename} does not exist, skipping.`);
        return;
    }
    
    let html = fs.readFileSync(srcPath, 'utf8');

    // Step 1: Inject window.USE_BACKEND_PROXY optimization
    console.log(`Optimizing backend proxy calls in ${filename}...`);
    
    // Inject global variable initialization
    html = html.replace(
        'let USE_GOOGLE_MAPS = true; // Will auto-disable if Google auth fails',
        'window.USE_BACKEND_PROXY = true;\nlet USE_GOOGLE_MAPS = true; // Will auto-disable if Google auth fails'
    );

    // Optimize reverse geocoding
    const oldRevGeocode = `                let address = null;
                try {
                    const response = await fetch(\`/api/reverse-geocode?lat=\${lat}&lng=\${lng}\`);
                    const data = await response.json();
                    if (response.ok && data.status === 'OK' && data.results && data.results.length > 0) {
                        address = data.results[0].formatted_address;
                    } else {
                        throw new Error("Proxy reverse geocode failed");
                    }
                } catch (err) {
                    console.warn("Secure Reverse Geocoding failed, falling back to client-side Geocoder:", err);
                    if (window.google && window.google.maps) {
                        address = await new Promise((resolve) => {
                            const geocoder = new google.maps.Geocoder();
                            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                                if (status === 'OK' && results && results.length > 0) {
                                    resolve(results[0].formatted_address);
                                } else {
                                    resolve(null);
                                }
                            });
                        });
                    }
                }`;

    const newRevGeocode = `                let address = null;
                const useClientSideReverseGeocoding = async () => {
                    if (window.google && window.google.maps) {
                        return await new Promise((resolve) => {
                            const geocoder = new google.maps.Geocoder();
                            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                                if (status === 'OK' && results && results.length > 0) {
                                    resolve(results[0].formatted_address);
                                } else {
                                    resolve(null);
                                }
                            });
                        });
                    }
                    return null;
                };

                if (!window.USE_BACKEND_PROXY) {
                    address = await useClientSideReverseGeocoding();
                } else {
                    try {
                        const response = await fetch(\`/api/reverse-geocode?lat=\${lat}&lng=\${lng}\`);
                        const data = await response.json();
                        if (response.ok && data.status === 'OK' && data.results && data.results.length > 0) {
                            address = data.results[0].formatted_address;
                        } else {
                            throw new Error("Proxy reverse geocode failed");
                        }
                    } catch (err) {
                        console.warn("Secure Reverse Geocoding failed, falling back to client-side Geocoder:", err);
                        address = await useClientSideReverseGeocoding();
                    }
                }`;
    html = html.replace(oldRevGeocode, newRevGeocode);

    // Optimize route drawing fallback
    const oldRouteDrawing = `                (async () => {
                    let path = null;
                    try {
                        const wps = stc ? [stc] : [];
                        const routeResp = await fetch('/api/routes', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                origin: { lat: sc[0], lng: sc[1] },
                                destination: { lat: ec[0], lng: ec[1] },
                                waypoints: wps,
                                travelMode: travelMode
                            })
                        });
                        const routeData = await routeResp.json();
                        if (routeResp.ok && routeData.routes && routeData.routes.length > 0) {
                            path = decodePolyline(routeData.routes[0].polyline.encodedPolyline).map(p => [p.lat, p.lng]);
                        } else {
                            throw new Error("Proxy routing failed");
                        }
                    } catch (err) {
                        console.warn("Map fallback secure routing failed, trying client-side DirectionsService:", err);
                        if (window.google && window.google.maps) {
                            path = await new Promise((resolve) => {
                                const ds = new google.maps.DirectionsService();
                                const request = {
                                    origin: new google.maps.LatLng(sc[0], sc[1]),
                                    destination: new google.maps.LatLng(ec[0], ec[1]),
                                    travelMode: google.maps.TravelMode[travelMode.toUpperCase()] || google.maps.TravelMode.DRIVING
                                };
                                if (stc) {
                                    request.waypoints = [{
                                        location: new google.maps.LatLng(stc[0], stc[1]),
                                        stopover: true
                                    }];
                                }
                                ds.route(request, (result, status) => {
                                    if (status === 'OK' && result && result.routes && result.routes.length > 0) {
                                        resolve(result.routes[0].overview_path.map(p => [p.lat(), p.lng()]));
                                    } else {
                                        resolve(null);
                                    }
                                });
                            });
                        }
                    }`;

    const newRouteDrawing = `                (async () => {
                    let path = null;
                    const useClientSideRouting = async () => {
                        if (window.google && window.google.maps) {
                            return await new Promise((resolve) => {
                                const ds = new google.maps.DirectionsService();
                                const request = {
                                    origin: new google.maps.LatLng(sc[0], sc[1]),
                                    destination: new google.maps.LatLng(ec[0], ec[1]),
                                    travelMode: google.maps.TravelMode[travelMode.toUpperCase()] || google.maps.TravelMode.DRIVING
                                };
                                if (stc) {
                                    request.waypoints = [{
                                        location: new google.maps.LatLng(stc[0], stc[1]),
                                        stopover: true
                                    }];
                                }
                                ds.route(request, (result, status) => {
                                    if (status === 'OK' && result && result.routes && result.routes.length > 0) {
                                        resolve(result.routes[0].overview_path.map(p => [p.lat(), p.lng()]));
                                    } else {
                                        resolve(null);
                                    }
                                });
                            });
                        }
                        return null;
                    };

                    if (!window.USE_BACKEND_PROXY) {
                        path = await useClientSideRouting();
                    } else {
                        try {
                            const wps = stc ? [stc] : [];
                            const routeResp = await fetch('/api/routes', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    origin: { lat: sc[0], lng: sc[1] },
                                    destination: { lat: ec[0], lng: ec[1] },
                                    waypoints: wps,
                                    travelMode: travelMode
                                })
                            });
                            const routeData = await routeResp.json();
                            if (routeResp.ok && routeData.routes && routeData.routes.length > 0) {
                                path = decodePolyline(routeData.routes[0].polyline.encodedPolyline).map(p => [p.lat, p.lng]);
                            } else {
                                throw new Error("Proxy routing failed");
                            }
                        } catch (err) {
                            console.warn("Map fallback secure routing failed, trying client-side DirectionsService:", err);
                            path = await useClientSideRouting();
                        }
                    }`;
    html = html.replace(oldRouteDrawing, newRouteDrawing);

    // Optimize geocoder address
    const oldGeocode = `    try {
        const response = await fetch(\`/api/geocode?address=\${encodeURIComponent(query)}\`);
        const data = await response.json();
        if (data.status === 'OK' && data.results && data.results.length > 0) {
            const loc = data.results[0].geometry.location;
            return {
                lat: loc.lat,
                lng: loc.lng,
                name: data.results[0].formatted_address.split(',')[0]
            };
        } else {
            throw new Error("Proxy geocoding failed");
        }
    } catch (e) {
        console.warn("Secure Geocoding failed, falling back to client-side Geocoder:", e);
        if (window.google && window.google.maps) {
            return new Promise((resolve) => {
                try {
                    const geocoder = new google.maps.Geocoder();
                    geocoder.geocode({ address: query }, (results, status) => {
                        if (status === 'OK' && results && results.length > 0) {
                            const loc = results[0].geometry.location;
                            resolve({
                                lat: loc.lat(),
                                lng: loc.lng(),
                                name: results[0].formatted_address.split(',')[0]
                            });
                        } else {
                            resolve(null);
                        }
                    });
                } catch (err) {
                    console.error("Client-side geocoder error:", err);
                    resolve(null);
                }
            });
        }
    }`;

    const newGeocode = `    const useClientSideGeocoding = () => {
        if (window.google && window.google.maps) {
            return new Promise((resolve) => {
                try {
                    const geocoder = new google.maps.Geocoder();
                    geocoder.geocode({ address: query }, (results, status) => {
                        if (status === 'OK' && results && results.length > 0) {
                            const loc = results[0].geometry.location;
                            resolve({
                                lat: loc.lat(),
                                lng: loc.lng(),
                                name: results[0].formatted_address.split(',')[0]
                            });
                        } else {
                            resolve(null);
                        }
                    });
                } catch (err) {
                    console.error("Client-side geocoder error:", err);
                    resolve(null);
                }
            });
        }
        return null;
    };

    if (!window.USE_BACKEND_PROXY) {
        return await useClientSideGeocoding();
    }

    try {
        const response = await fetch(\`/api/geocode?address=\${encodeURIComponent(query)}\`);
        const data = await response.json();
        if (data.status === 'OK' && data.results && data.results.length > 0) {
            const loc = data.results[0].geometry.location;
            return {
                lat: loc.lat,
                lng: loc.lng,
                name: data.results[0].formatted_address.split(',')[0]
            };
        } else {
            throw new Error("Proxy geocoding failed");
        }
    } catch (e) {
        console.warn("Secure Geocoding failed, falling back to client-side Geocoder:", e);
        return await useClientSideGeocoding();
    }`;
    html = html.replace(oldGeocode, newGeocode);

    // Optimize directions service
    const oldDirections = `            let googleRoutes = [];
            try {
                const wps = stopGeocode ? [{ lat: stopGeocode.lat, lng: stopGeocode.lng }] : [];
                const routeResp = await fetch('/api/routes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        origin: { lat: startGeocode.lat, lng: startGeocode.lng },
                        destination: { lat: endGeocode.lat, lng: endGeocode.lng },
                        waypoints: wps,
                        travelMode: travelMode
                    })
                });
                const routeData = await routeResp.json();
                if (routeResp.ok && routeData.routes && routeData.routes.length > 0) {
                    googleRoutes = routeData.routes.map((gRoute, idx) => {
                        let totalDist = gRoute.distanceMeters;
                        let totalTime = parseInt(gRoute.duration.replace('s', ''), 10);
                        const path = decodePolyline(gRoute.polyline.encodedPolyline);
                        
                        return {
                            summary: gRoute.summary || \`Route \${idx + 1}\`,
                            distanceKm: totalDist / 1000,
                            timeMins: Math.round(totalTime / 60),
                            coords: path.map(p => [p.lat, p.lng])
                        };
                    });
                } else {
                    throw new Error("Proxy directions failed");
                }
            } catch (err) {
                console.warn("Secure directions proxy request failed, falling back to client-side DirectionsService:", err);
                if (window.google && window.google.maps) {
                    try {
                        googleRoutes = await new Promise((resolve) => {
                            const ds = new google.maps.DirectionsService();
                            const request = {
                                origin: new google.maps.LatLng(startGeocode.lat, startGeocode.lng),
                                destination: new google.maps.LatLng(endGeocode.lat, endGeocode.lng),
                                travelMode: google.maps.TravelMode[travelMode.toUpperCase()] || google.maps.TravelMode.DRIVING,
                                provideRouteAlternatives: true
                            };
                            if (stopGeocode) {
                                request.waypoints = [{
                                    location: new google.maps.LatLng(stopGeocode.lat, stopGeocode.lng),
                                    stopover: true
                                }];
                            }
                            ds.route(request, (result, status) => {
                                if (status === 'OK' && result && result.routes && result.routes.length > 0) {
                                    const routesMapped = result.routes.map((gRoute, idx) => {
                                        const path = gRoute.overview_path.map(p => [p.lat(), p.lng()]);
                                        let totalDist = 0;
                                        let totalTime = 0;
                                        gRoute.legs.forEach(leg => {
                                            totalDist += leg.distance.value;
                                            totalTime += leg.duration.value;
                                        });

                                        return {
                                            summary: gRoute.summary || \`Route \${idx + 1}\`,
                                            distanceKm: totalDist / 1000,
                                            timeMins: Math.round(totalTime / 60),
                                            coords: path
                                        };
                                    });
                                    resolve(routesMapped);
                                } else {
                                    resolve([]);
                                }
                            });
                        });
                    } catch (dsErr) {
                        console.error("Client-side DirectionsService failed:", dsErr);
                    }
                }
            }`;

    const newDirections = `            let googleRoutes = [];
            const useClientSideDirections = async () => {
                if (window.google && window.google.maps) {
                    try {
                        return await new Promise((resolve) => {
                            const ds = new google.maps.DirectionsService();
                            const request = {
                                origin: new google.maps.LatLng(startGeocode.lat, startGeocode.lng),
                                destination: new google.maps.LatLng(endGeocode.lat, endGeocode.lng),
                                travelMode: google.maps.TravelMode[travelMode.toUpperCase()] || google.maps.TravelMode.DRIVING,
                                provideRouteAlternatives: true
                            };
                            if (stopGeocode) {
                                request.waypoints = [{
                                    location: new google.maps.LatLng(stopGeocode.lat, stopGeocode.lng),
                                    stopover: true
                                }];
                            }
                            ds.route(request, (result, status) => {
                                if (status === 'OK' && result && result.routes && result.routes.length > 0) {
                                    const routesMapped = result.routes.map((gRoute, idx) => {
                                        const path = gRoute.overview_path.map(p => [p.lat(), p.lng()]);
                                        let totalDist = 0;
                                        let totalTime = 0;
                                        gRoute.legs.forEach(leg => {
                                            totalDist += leg.distance.value;
                                            totalTime += leg.duration.value;
                                        });

                                        return {
                                            summary: gRoute.summary || \`Route \${idx + 1}\`,
                                            distanceKm: totalDist / 1000,
                                            timeMins: Math.round(totalTime / 60),
                                            coords: path
                                        };
                                    });
                                    resolve(routesMapped);
                                } else {
                                    resolve([]);
                                }
                            });
                        });
                    } catch (dsErr) {
                        console.error("Client-side DirectionsService failed:", dsErr);
                    }
                }
                return [];
            };

            if (!window.USE_BACKEND_PROXY) {
                googleRoutes = await useClientSideDirections();
            } else {
                try {
                    const wps = stopGeocode ? [{ lat: stopGeocode.lat, lng: stopGeocode.lng }] : [];
                    const routeResp = await fetch('/api/routes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            origin: { lat: startGeocode.lat, lng: startGeocode.lng },
                            destination: { lat: endGeocode.lat, lng: endGeocode.lng },
                            waypoints: wps,
                            travelMode: travelMode
                        })
                    });
                    const routeData = await routeResp.json();
                    if (routeResp.ok && routeData.routes && routeData.routes.length > 0) {
                        googleRoutes = routeData.routes.map((gRoute, idx) => {
                            let totalDist = gRoute.distanceMeters;
                            let totalTime = parseInt(gRoute.duration.replace('s', ''), 10);
                            const path = decodePolyline(gRoute.polyline.encodedPolyline);
                            
                            return {
                                summary: gRoute.summary || \`Route \${idx + 1}\`,
                                distanceKm: totalDist / 1000,
                                timeMins: Math.round(totalTime / 60),
                                coords: path.map(p => [p.lat, p.lng])
                            };
                        });
                    } else {
                        throw new Error("Proxy directions failed");
                    }
                } catch (err) {
                    console.warn("Secure directions proxy request failed, falling back to client-side DirectionsService:", err);
                    googleRoutes = await useClientSideDirections();
                }
            }`;
    html = html.replace(oldDirections, newDirections);

    // Optimize config fetching
    const oldConfig = `    try {
        const res = await fetch('/api/config');
        const config = await res.json();
        mapsKey = config.googleMapsApiKey;
        geminiKey = config.geminiApiKey;
    } catch (error) {`;

    const newConfig = `    try {
        const res = await fetch('/api/config');
        const config = await res.json();
        mapsKey = config.googleMapsApiKey;
        geminiKey = config.geminiApiKey;
        window.USE_BACKEND_PROXY = true;
    } catch (error) {
        window.USE_BACKEND_PROXY = false;`;
    html = html.replace(oldConfig, newConfig);

    // Step 2: Extract JSX content
    const babelStart = '<script type="text/babel">';
    const babelEnd = '</script>';

    const startIndex = html.indexOf(babelStart);
    if (startIndex === -1) {
        console.log(`No <script type="text/babel"> found in ${filename}, skipping compilation.`);
        fs.writeFileSync(destPath, html, 'utf8');
        return;
    }

    const endIndex = html.indexOf(babelEnd, startIndex);
    if (endIndex === -1) {
        console.error(`No closing </script> for Babel script found in ${filename}`);
        return;
    }

    const jsxCode = html.substring(startIndex + babelStart.length, endIndex);

    console.log(`Compiling JSX in ${filename} using Babel (Classic mode)...`);
    const result = babel.transformSync(jsxCode, {
        presets: [
            ['@babel/preset-react', { runtime: 'classic' }]
        ],
        compact: true,
        minified: false
    });

    const compiledJs = result.code;

    // Replace the Babel script block with the compiled JS block
    const newScriptTag = `<script>\n${compiledJs}\n`;
    html = html.substring(0, startIndex) + newScriptTag + html.substring(endIndex);

    // Replace React development URLs with production minified ones
    html = html.replace('react@18/umd/react.development.js', 'react@18/umd/react.production.min.js');
    html = html.replace('react-dom@18/umd/react-dom.development.js', 'react-dom@18/umd/react-dom.production.min.js');

    // Remove the unneeded Babel standalone compiler script
    html = html.replace('<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>\n', '');
    html = html.replace('<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>', '');

    fs.writeFileSync(destPath, html, 'utf8');
    console.log(`Successfully compiled ${filename} to production-ready precompiled HTML!`);
}

optimizeAndCompile('index.html');
optimizeAndCompile('map.html');
