import React, { useEffect, useRef, useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  Building2, 
  Phone, 
  Mail, 
  ShieldCheck, 
  AlertCircle, 
  Info, 
  ExternalLink,
  Clock,
  Compass,
  CheckCircle2,
  Send
} from 'lucide-react';
import { INDIAN_CITIES, fetchNearestPartners } from '../services/api';

const PARTNER_TYPE_COLORS = {
  SCA: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/40',
    text: 'text-emerald-300',
    badge: 'bg-emerald-600',
    label: 'State Channelising Agency (SCA)',
  },
  PSB: {
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/40',
    text: 'text-teal-300',
    badge: 'bg-teal-600',
    label: 'Public Sector Bank (PSB)',
  },
  RRB: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/40',
    text: 'text-amber-300',
    badge: 'bg-amber-600',
    label: 'Regional Rural Bank (RRB)',
  },
  'NBFC-MFI': {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/40',
    text: 'text-purple-300',
    badge: 'bg-purple-600',
    label: 'Microfinance Institution (NBFC-MFI)',
  },
};

export default function PartnerLocator({ 
  selectedCity, 
  onCityChange, 
  recommendedScheme, 
  isEligible 
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  const [partners, setPartners] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [routedSuccess, setRoutedSuccess] = useState(null);
  const [userLocation, setUserLocation] = useState({
    lat: 28.6139,
    lng: 77.2090,
    cityName: 'Delhi NCR',
  });

  // Find city object
  const currentCityObj = INDIAN_CITIES.find((c) => c.value === selectedCity) || INDIAN_CITIES[0];

  // Fetch partners whenever city or recommendedScheme changes
  useEffect(() => {
    let isMounted = true;

    async function loadPartners() {
      setIsLoading(true);
      try {
        const targetLat = currentCityObj.lat;
        const targetLng = currentCityObj.lng;

        setUserLocation({
          lat: targetLat,
          lng: targetLng,
          cityName: currentCityObj.name,
        });

        const data = await fetchNearestPartners({
          lat: targetLat,
          lng: targetLng,
          scheme: recommendedScheme || 'Micro Finance Scheme',
          limit: 5,
        });

        if (isMounted && data.partners) {
          setPartners(data.partners);
          if (data.partners.length > 0) {
            setSelectedPartner(data.partners[0]);
          }
        }
      } catch (err) {
        console.error('Error loading nearest partners:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadPartners();
    return () => {
      isMounted = false;
    };
  }, [selectedCity, recommendedScheme]);

  // Initialize or update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || typeof window === 'undefined') return;

    // Check if Leaflet (L) is available
    const L = window.L;
    if (!L) return;

    // Initialize map if not already created
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: false,
      }).setView([userLocation.lat, userLocation.lng], 11);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 11);
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    // Add User Location Pin (Pulse circle)
    const userMarkerIcon = L.divIcon({
      className: 'user-pin-wrapper',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 32px; height: 32px; background: rgba(16, 185, 129, 0.35); border-radius: 50%; animation: ping 2s infinite;"></div>
          <div style="width: 18px; height: 18px; background: #059669; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userMarkerIcon })
      .addTo(map)
      .bindPopup(`<strong style="color: #0f172a;">📍 Applicant Location: ${userLocation.cityName}</strong>`);
    
    markersRef.current.push(userMarker);

    // Add Partner Markers
    partners.forEach((partner, index) => {
      const typeColor = partner.type === 'SCA' ? '#059669' : (partner.type === 'PSB' ? '#0d9488' : (partner.type === 'RRB' ? '#d97706' : '#7c3aed'));
      
      const partnerIcon = L.divIcon({
        className: 'partner-pin-wrapper',
        html: `
          <div style="background: ${typeColor}; color: white; width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 11px; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); cursor: pointer;">
            #${index + 1}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const pMarker = L.marker([partner.lat, partner.lng], { icon: partnerIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: sans-serif; min-width: 180px; color: #0f172a;">
            <div style="font-size: 11px; font-weight: 800; color: ${typeColor}; text-transform: uppercase;">${partner.type} #${index + 1}</div>
            <strong style="font-size: 13px; display: block; margin-top: 2px;">${partner.name}</strong>
            <div style="font-size: 11px; color: #475569; margin: 4px 0;">${partner.branch_name || partner.address || partner.city}</div>
            <div style="font-size: 11px; font-weight: bold; color: #059669;">📍 ${partner.distance_km} km away</div>
            <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Simulated Health Score: <strong>${partner.simulated_risk_score}/100</strong></div>
          </div>
        `);

      pMarker.on('click', () => {
        setSelectedPartner(partner);
      });

      markersRef.current.push(pMarker);
    });

  }, [partners, userLocation]);

  const handleRouteApplication = (partner) => {
    setRoutedSuccess(partner.id);
    setTimeout(() => setRoutedSuccess(null), 4000);
  };

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserLocation({
            lat: latitude,
            lng: longitude,
            cityName: 'My Exact Location',
          });
          fetchNearestPartners({
            lat: latitude,
            lng: longitude,
            scheme: recommendedScheme || 'Micro Finance Scheme',
            limit: 5,
          }).then((res) => {
            if (res.partners) {
              setPartners(res.partners);
              if (res.partners.length > 0) setSelectedPartner(res.partners[0]);
            }
          });
        },
        (err) => {
          alert('Could not access device location. Using default city centers.');
        }
      );
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6 lg:p-7 shadow-xl border border-slate-800 mt-8">
      {/* Header & City Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                Nearest Channel Partners & Branch Map
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                Geo-Distance Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Locating approved SCAs, PSBs, RRBs, and NBFC-MFIs matching {recommendedScheme || 'concessional schemes'}
            </p>
          </div>
        </div>

        {/* Location Dropdown & Detect Location */}
        <div className="flex items-center space-x-2">
          <select
            value={selectedCity}
            onChange={(e) => onCityChange(e.target.value)}
            className="px-3 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
          >
            {INDIAN_CITIES.map((city) => (
              <option key={city.value} value={city.value} className="bg-slate-900 text-slate-100">
                📍 {city.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleUseMyLocation}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-semibold border border-slate-700 transition"
            title="Use browser GPS geolocation"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">My GPS</span>
          </button>
        </div>
      </div>

      {/* Simulated Data Disclosure Banner (Mandatory PRD requirement) */}
      <div className="mb-5 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs flex items-start space-x-2.5">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-slate-300 text-[11px] leading-relaxed">
          <span className="font-bold text-amber-300">Hackathon Prototype Notice:</span> Partner locations and institutional types (SCA/PSB/RRB/MFI) represent authentic lending channels. The <strong>Health/Risk Score (0–100)</strong> is simulated for demonstration; in production, it connects to NBCFDC/SCA MIS live audit feeds.
        </div>
      </div>

      {/* Main Grid: Left Map (7 cols) + Right Partner Cards (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Map Container */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-inner h-[380px] sm:h-[420px] bg-slate-950">
            <div ref={mapContainerRef} className="w-full h-full z-0" />
            
            {/* Map Legend Overlay */}
            <div className="absolute bottom-3 left-3 right-3 bg-slate-950/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-300 z-[400]">
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                <span>SCA (State Agency)</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block"></span>
                <span>PSB (Public Bank)</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                <span>RRB (Rural Bank)</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span>
                <span>NBFC-MFI</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between px-1">
            <span>Showing top {partners.length} closest branches to {userLocation.cityName}</span>
            <span>Click any marker to view contact details</span>
          </div>
        </div>

        {/* Partner Cards List */}
        <div className="lg:col-span-5 space-y-3 max-h-[460px] overflow-y-auto pr-1">
          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-28 bg-slate-900/80 rounded-xl border border-slate-800" />
              ))}
            </div>
          ) : partners.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs border border-slate-800 rounded-xl bg-slate-950/40">
              No channel partners found in this radius. Try selecting another city center.
            </div>
          ) : (
            partners.map((partner, idx) => {
              const typeStyle = PARTNER_TYPE_COLORS[partner.type] || PARTNER_TYPE_COLORS.PSB;
              const isSelected = selectedPartner?.id === partner.id;
              const isRouted = routedSuccess === partner.id;

              return (
                <div
                  key={partner.id}
                  onClick={() => setSelectedPartner(partner)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900/90 border-emerald-500/60 shadow-lg shadow-emerald-950/50'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-black px-2 py-0.5 rounded-md bg-slate-800 text-emerald-400 border border-slate-700">
                        #{idx + 1}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${typeStyle.bg} ${typeStyle.text} border ${typeStyle.border}`}>
                        {partner.type}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1 text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/40">
                      <MapPin className="w-3 h-3" />
                      <span>{partner.distance_km} km</span>
                    </div>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-white leading-snug">
                    {partner.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {partner.branch_name || partner.address}, {partner.city}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-300">
                    <div className="flex items-center space-x-1 text-slate-400">
                      <Clock className="w-3 h-3 text-teal-400" />
                      <span>~{partner.disbursement_speed_days || 12} days sanction</span>
                    </div>

                    <div className="flex items-center space-x-1" title="Simulated health & compliance score">
                      <span className="text-slate-400">Health:</span>
                      <span className="font-bold text-emerald-400">{partner.simulated_risk_score}/100</span>
                    </div>
                  </div>

                  {/* Expanded actions on active card */}
                  {isSelected && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-col sm:flex-row gap-2">
                      <a
                        href={`tel:${partner.contact_phone}`}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center justify-center space-x-1.5 border border-slate-700 transition"
                      >
                        <Phone className="w-3 h-3 text-emerald-400" />
                        <span>Call Branch</span>
                      </a>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRouteApplication(partner);
                        }}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center space-x-1.5 transition ${
                          isRouted
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-sm'
                        }`}
                      >
                        {isRouted ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Routed via n8n!</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3 h-3" />
                            <span>Route Lead</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
