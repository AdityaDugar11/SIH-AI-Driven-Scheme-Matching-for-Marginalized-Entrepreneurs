import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getDashboard, patchInterest } from "../api/client.js";
import { useTranslation } from "../hooks/useTranslation.js";
import { ArrowLeft } from "lucide-react";

// A utility to format dates nicely
function formatDate(dateString) {
  if (!dateString) return "No deadline";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function DashboardCard({ item, onInterest }) {
  const isInterested = item.interested === true;
  const isExpired = item.deadline_date && new Date(item.deadline_date) < new Date();

  // Status Badge Logic
  let StatusBadge;
  if (isInterested) {
    StatusBadge = (
      <div className="flex items-center gap-1.5 bg-secondary-fixed text-on-secondary-fixed px-space-xs py-1 rounded-full font-label-md text-label-md">
        <span className="material-symbols-outlined text-[18px]">verified</span>
        <span>Interested</span>
      </div>
    );
  } else if (isExpired) {
    StatusBadge = (
      <div className="flex items-center gap-1.5 bg-surface-container-high text-on-surface px-space-xs py-1 rounded-full font-label-md text-label-md">
        <span className="material-symbols-outlined text-on-surface-variant text-[18px]">clock</span>
        <span>Expired</span>
      </div>
    );
  } else {
    StatusBadge = (
      <div className="flex items-center gap-1.5 bg-tertiary-fixed text-on-tertiary-fixed-variant px-space-xs py-1 rounded-full font-label-md text-label-md">
        <span className="material-symbols-outlined text-[18px]">info</span>
        <span>Pending Review</span>
      </div>
    );
  }

  return (
    <article className="w-full bg-surface-container-lowest rounded-lg p-space-md shadow-sm flex flex-col space-y-space-sm mb-4">
      {/* Top Status Row */}
      <div className="flex items-center justify-between gap-2">
        {StatusBadge}
        <div className="flex items-center gap-1 bg-surface-container-high text-on-surface px-space-xs py-1 rounded-full font-label-md text-label-md">
          <span className="material-symbols-outlined text-on-surface-variant text-[18px]">percent</span>
          <span>{item.match_score}% Match</span>
        </div>
      </div>

      {/* Scheme Main Meta */}
      <div className="flex flex-col">
        <h2 className="font-headline-sm text-headline-sm text-on-surface">{item.scheme_name}</h2>
        <p className="font-body-lg-bold text-body-lg-bold text-on-surface-variant mt-1 line-clamp-2">
          {item.reason}
        </p>
      </div>

      {/* Document Readiness Checklist (static or minimal dynamic representation) */}
      <div className="flex flex-col bg-surface-container-lowest rounded-lg space-y-2 pt-1">
        <span className="font-label-lg text-label-lg text-on-surface">Details</span>
        <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low text-on-surface">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[22px]">event</span>
            <span className="font-body-lg text-body-lg">Deadline</span>
          </div>
          <span className="font-label-md text-label-md text-on-surface-variant">{formatDate(item.deadline_date)}</span>
        </div>
      </div>

      {/* Toggle Action Buttons */}
      {!isInterested && !isExpired && (
        <div className="grid grid-cols-1 gap-space-xs pt-2">
          <button
            onClick={() => onInterest(item)}
            className="h-[52px] bg-primary-container text-on-primary rounded-lg font-body-lg-bold text-body-lg-bold flex items-center justify-center gap-1.5 shadow-sm active:opacity-95"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">favorite</span>
            <span>I'm Interested</span>
          </button>
        </div>
      )}
    </article>
  );
}

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const email = searchParams.get("email");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(!!email);
  const [error, setError] = useState(null);

  const [filterScore, setFilterScore] = useState("all");

  useEffect(() => {
    if (!email) {
      return;
    }

    async function load() {
      try {
        setLoading(true);
        const result = await getDashboard(email);
        setData(result || []);
      } catch (err) {
        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [email]);

  const handleInterest = async (item) => {
    try {
      setData(prev =>
        prev.map(d => d.id === item.id ? { ...d, interested: true } : d)
      );

      await patchInterest({ id: item.id, interested: true });

      fetch("https://scheme-matcher-n8n.onrender.com/webhook/new-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: item.email,
          scheme_recommended: item.scheme_name,
          match_score: item.match_score,
          city: item.city || "Unknown",
          name: "Applicant",
          phone: "0000000000",
          income: 0,
          project_cost: 0,
          emi: 0,
          nearest_partner_id: "TBD",
          nearest_partner_name: "TBD",
          nearest_partner_email: "partner@example.com"
        })
      }).catch(err => console.warn("N8N webhook failed:", err));

    } catch (err) {
      console.error("Failed to mark interest:", err);
      setData(prev =>
        prev.map(d => d.id === item.id ? { ...d, interested: null } : d)
      );
      alert("Failed to record interest. Please try again.");
    }
  };

  if (!email) {
    return (
      <div className="bg-surface min-h-screen flex flex-col p-4">
        <button onClick={() => navigate("/")} className="text-primary font-body-lg-bold mb-6 flex items-center gap-1">
          <ArrowLeft size={20} /> {t("screen2_cta_back", "Go Back")}
        </button>
        <div className="bg-surface-container-lowest rounded-lg p-space-md text-center py-10 shadow-sm">
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">No Email Provided</h2>
          <p className="font-body-md text-on-surface-variant mb-6">Please start from the form to view your dashboard.</p>
          <button onClick={() => navigate("/")} className="h-12 px-6 bg-primary text-on-primary rounded-full font-label-lg active:opacity-95">Go to form</button>
        </div>
      </div>
    );
  }

  const filteredData = data.filter(item => {
    if (filterScore === "75") return item.match_score >= 75;
    if (filterScore === "50") return item.match_score >= 50;
    return true;
  });

  return (
    <div className="bg-surface min-h-screen selection:bg-primary-fixed selection:text-on-primary-fixed pb-safe">
      {/* Header */}
      <header className="sticky top-0 w-full z-50 bg-surface-container-lowest pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-margin-mobile flex items-center justify-between gap-space-xs">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[28px]">shield</span>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface leading-tight">Scheme Matcher</span>
            </div>
          </div>
          <button onClick={() => navigate("/")} className="h-11 px-space-sm rounded-full bg-surface-container-low flex items-center gap-1.5 text-on-surface hover:bg-surface-container transition-colors">
            <span className="font-label-md text-label-md">New Search</span>
          </button>
        </div>
      </header>

      <main className="flex flex-col flex-1 relative w-full pt-6 pb-28 px-margin-mobile bg-surface max-w-2xl mx-auto">
        <div className="flex flex-col w-full space-y-space-md">

          {/* Header Civic Card */}
          <section className="w-full bg-surface-container-lowest rounded-lg p-space-md shadow-sm">
            <div className="flex flex-col space-y-space-xs">
              <div className="flex items-center justify-between">
                <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">Your Scheme Matches</h1>
                <span className="inline-flex items-center gap-1 bg-secondary-fixed text-on-secondary-fixed px-space-xs py-0.5 rounded-full font-label-md text-label-md">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  Verified
                </span>
              </div>

              <div className="flex items-center gap-2 bg-surface-container-low p-space-xs rounded-lg text-on-surface-variant">
                <span className="material-symbols-outlined text-primary text-[20px] shrink-0">mark_email_read</span>
                <p className="font-body-md text-body-md break-all">
                  Looked up by the email you provided: <strong className="text-on-surface">{email}</strong>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <div className="flex items-center gap-1.5 bg-primary-fixed text-on-primary-fixed px-space-xs py-1 rounded-full font-label-md text-label-md">
                  <span className="material-symbols-outlined text-[16px]">fact_check</span>
                  <span>{data.length} Schemes Found</span>
                </div>
                <div className="flex items-center gap-1.5 bg-secondary-fixed text-on-secondary-fixed px-space-xs py-1 rounded-full font-label-md text-label-md">
                  <span className="material-symbols-outlined text-[16px]">forward_to_inbox</span>
                  <span>{data.filter(d => d.interested).length} Interested</span>
                </div>
              </div>
            </div>
          </section>

          {/* Filter Bar */}
          <section className="w-full bg-surface-container-lowest rounded-lg p-space-md shadow-sm">
            <div className="flex items-center justify-between mb-space-xs">
              <div className="flex items-center gap-1 text-on-surface">
                <span className="material-symbols-outlined text-[20px]">tune</span>
                <span className="font-label-lg text-label-lg">Refine Schemes</span>
              </div>
              <button
                onClick={() => { setFilterScore("all"); }}
                className="font-label-md text-label-md text-primary hover:underline"
                type="button"
              >
                Reset Filters
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-xs">
              <div className="flex flex-col bg-surface-container-low rounded-lg p-2">
                <label className="font-label-md text-label-md text-on-surface-variant mb-1" htmlFor="filter-score">Match Score</label>
                <div className="relative w-full">
                  <select
                    id="filter-score"
                    value={filterScore}
                    onChange={(e) => setFilterScore(e.target.value)}
                    className="w-full bg-surface-container-lowest text-on-surface font-body-md text-body-md h-11 px-3 pr-8 rounded-lg appearance-none"
                  >
                    <option value="all">All Match Levels</option>
                    <option value="75">75%+ Match</option>
                    <option value="50">50%+ Match</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
                </div>
              </div>

              <div className="flex flex-col bg-surface-container-low rounded-lg p-2 opacity-50">
                <label className="font-label-md text-label-md text-on-surface-variant mb-1" htmlFor="filter-type">Scheme Type</label>
                <div className="relative w-full">
                  <select disabled className="w-full bg-surface-container-lowest text-on-surface font-body-md text-body-md h-11 px-3 pr-8 rounded-lg appearance-none">
                    <option>All Types</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
                </div>
              </div>
            </div>
          </section>

          {/* List of Saved Scheme Cards */}
          <section aria-label="Scheme Card Listings" className="flex flex-col w-full">
            {loading ? (
              <div className="text-center py-12 text-on-surface-variant font-body-md">Loading your schemes...</div>
            ) : error ? (
              <div className="bg-error-container text-on-error-container p-4 rounded-lg font-body-md">
                {error}
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-12 bg-surface-container-lowest rounded-lg">
                <p className="text-on-surface-variant font-body-md mb-4">No schemes found for this filter.</p>
                <button onClick={() => navigate("/")} className="h-11 px-6 bg-primary text-on-primary rounded-full font-label-md">Find Schemes</button>
              </div>
            ) : (
              filteredData.map(item => (
                <DashboardCard key={item.id} item={item} onInterest={handleInterest} />
              ))
            )}
          </section>

          {/* Footer Civic Assistance & Re-check Section */}
          <footer className="w-full bg-surface-container-lowest rounded-lg p-space-md shadow-sm flex flex-col space-y-space-md mt-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-space-xs bg-surface-container-low rounded-lg">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">search_check</span>
                <div className="flex flex-col">
                  <span className="font-body-lg-bold text-body-lg-bold text-on-surface">Looking for a different scheme?</span>
                  <span className="font-body-md text-body-md text-on-surface-variant">Update annual income, category, or business type</span>
                </div>
              </div>
              <button
                onClick={() => navigate("/")}
                className="h-11 px-4 bg-surface-container-lowest text-primary rounded-lg font-label-md text-label-md flex items-center justify-center shrink-0 hover:bg-surface-container w-full md:w-auto"
              >
                Check eligibility
              </button>
            </div>

            <div className="flex flex-col space-y-1 bg-surface-container rounded-lg p-space-sm text-on-surface">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">headset_mic</span>
                <span className="font-label-lg text-label-lg text-on-surface">Civic Helpdesk & Application Support</span>
              </div>
              <p className="font-body-lg-bold text-body-lg-bold text-primary">Toll-free Helpline: 1800-11-2026</p>
              <p className="font-body-md text-body-md text-on-surface-variant">Operating Hours: Monday – Saturday, 9:00 AM – 6:00 PM (IST)</p>
            </div>
          </footer>

        </div>
      </main>
    </div>
  );
}
