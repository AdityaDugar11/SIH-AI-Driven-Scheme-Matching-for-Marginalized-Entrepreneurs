import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useApp } from "../context/AppContext.jsx";
import { useTranslation } from "../hooks/useTranslation.js";
import { nearestPartners } from "../api/client.js";
import StepHeader from "./StepHeader.jsx";
import InfoTooltip from "./InfoTooltip.jsx";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default Leaflet marker icons not loading in React
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

export default function PartnerLocator() {
  const { state } = useApp();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Default to New Delhi if location not provided
  const centerLat = state.intake.location?.lat || 28.6139;
  const centerLng = state.intake.location?.lng || 77.2090;

  useEffect(() => {
    async function fetchPartners() {
      try {
        setLoading(true);
        const data = {
          lat: centerLat,
          lng: centerLng,
          scheme: state.recommendation.recommended_scheme,
          limit: 3,
        };
        const res = await nearestPartners(data);
        setPartners(res.partners);
        setError(null);
      } catch (err) {
        setError(err.message || t("error_generic"));
      } finally {
        setLoading(false);
      }
    }
    fetchPartners();
  }, [centerLat, centerLng, state.recommendation.recommended_scheme, t]);

  const handleSendDetails = (partner) => {
    // Simulated webhook POST
    console.log("POSTING to n8n webhook for partner:", partner.id);
    navigate("/confirmation");
  };

  return (
    <div className="animate-fade-in">
      <StepHeader currentStep={4} />

      <h1 className="text-heading mb-6">{t("screen4_title") || "Find Nearest Partner"}</h1>

      {loading ? (
        <div className="text-center py-12 text-gray-500">{t("screen4_loading") || "Finding partners near you..."}</div>
      ) : error ? (
        <div className="card text-red-600 bg-red-50 text-center">{error}</div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Map Area */}
          <div className="h-[300px] rounded-lg overflow-hidden border border-gray-300 shadow-sm relative z-0">
            <MapContainer
              center={[centerLat, centerLng]}
              zoom={12}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {partners.map((p) => (
                p.lat && p.lng && (
                  <Marker key={p.id} position={[p.lat, p.lng]}>
                    <Popup>
                      <strong>{p.name}</strong>
                      <br />
                      {p.type} • {p.distance_km} km
                    </Popup>
                  </Marker>
                )
              ))}
            </MapContainer>
          </div>

          {/* List Area */}
          <div className="flex flex-col gap-4">
            {partners.map((partner) => (
              <div key={partner.id} className="card flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{partner.name}</h3>
                    <p className="text-sm text-gray-600">
                      {partner.type} • {partner.distance_km} {t("screen4_km") || "km away"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1 text-sm bg-gray-100 px-2 py-1 rounded">
                      <span className="font-semibold text-gray-700">
                        {t("screen4_risk_score") || "Risk Score"}: {partner.risk_score}
                      </span>
                      {partner.simulated && (
                        <InfoTooltip text={t("screen4_simulated_tooltip") || "Simulated data — production version integrates with NBCFDC/SCA MIS."} />
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600">
                  {t("screen4_contact") || "Contact"}: {partner.contact_email}
                </p>

                <button
                  type="button"
                  className="btn-primary mt-2"
                  onClick={() => handleSendDetails(partner)}
                >
                  {t("screen4_cta_send") || "Send My Details to This Partner"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
