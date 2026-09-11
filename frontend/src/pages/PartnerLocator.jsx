import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, CheckCircle2, Navigation } from 'lucide-react';

// Fix for default Leaflet icon issues in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom red icon for High NPA partners
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function PartnerLocator() {
  const navigate = useNavigate();
  const [hideHighNpa, setHideHighNpa] = useState(false);

  // Mock Data: Channel Partners in India (around Delhi/UP for example)
  const partners = [
    { id: 1, name: "State Bank of India - Alambagh", type: "Bank", lat: 26.8467, lng: 80.9462, npa: 2.1, highNpa: false },
    { id: 2, name: "Grameen Microfinance NGO", type: "NGO", lat: 26.8500, lng: 80.9500, npa: 1.5, highNpa: false },
    { id: 3, name: "Punjab National Bank - Hazratganj", type: "Bank", lat: 26.8550, lng: 80.9400, npa: 8.5, highNpa: true }, // High NPA
    { id: 4, name: "Union Bank of India", type: "Bank", lat: 28.6139, lng: 77.2090, npa: 3.2, highNpa: false }, // Delhi
    { id: 5, name: "Delhi Cooperative Bank", type: "Bank", lat: 28.6200, lng: 77.2100, npa: 12.0, highNpa: true } // Delhi High NPA
  ];

  const visiblePartners = hideHighNpa ? partners.filter(p => !p.highNpa) : partners;
  const centerPosition = [26.8467, 80.9462]; // Lucknow

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Partner Locator</h1>
          </div>
          <div className="flex items-center space-x-3 bg-red-50 px-4 py-2 rounded-lg border border-red-100">
            <label className="flex items-center cursor-pointer space-x-2">
              <input 
                type="checkbox" 
                checked={hideHighNpa} 
                onChange={(e) => setHideHighNpa(e.target.checked)}
                className="form-checkbox h-4 w-4 text-red-600 rounded"
              />
              <span className="text-sm font-medium text-red-900 hidden sm:block">Filter High NPA Branches</span>
              <span className="text-sm font-medium text-red-900 sm:hidden">Filter NPA</span>
            </label>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className="w-full md:w-96 bg-white border-r border-gray-200 overflow-y-auto h-[40vh] md:h-[calc(100vh-73px)]">
          <div className="p-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Nearby Partners ({visiblePartners.length})</h2>
            <div className="space-y-4">
              {visiblePartners.map(partner => (
                <div key={partner.id} className="p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow bg-white">
                  <h3 className="font-bold text-gray-900 text-lg">{partner.name}</h3>
                  <p className="text-sm text-gray-500">{partner.type}</p>
                  
                  <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                    {partner.highNpa ? (
                      <span className="inline-flex items-center text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                        <AlertTriangle className="h-3 w-3 mr-1" /> High NPA ({partner.npa}%)
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Safe ({partner.npa}%)
                      </span>
                    )}
                    
                    <button className="text-primary bg-blue-50 p-1.5 rounded-lg hover:bg-blue-100">
                      <Navigation className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 h-[60vh] md:h-[calc(100vh-73px)] relative z-0">
          <MapContainer center={centerPosition} zoom={6} className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {visiblePartners.map(partner => (
              <Marker 
                key={partner.id} 
                position={[partner.lat, partner.lng]}
                icon={partner.highNpa ? redIcon : greenIcon}
              >
                <Popup>
                  <div className="p-1">
                    <h3 className="font-bold text-sm">{partner.name}</h3>
                    <p className="text-xs text-gray-500 mb-2">{partner.type}</p>
                    {partner.highNpa ? (
                      <p className="text-xs text-red-600 font-semibold">Warning: High NPA ({partner.npa}%)</p>
                    ) : (
                      <p className="text-xs text-green-600 font-semibold">NPA Rating: Excellent ({partner.npa}%)</p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </main>
    </div>
  );
}
