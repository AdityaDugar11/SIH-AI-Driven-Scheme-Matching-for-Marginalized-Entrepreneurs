import { useState, useRef, useEffect } from "react";

export default function InfoTooltip({ text }) {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef(null);

  // Close tooltip if clicked outside (useful for mobile)
  useEffect(() => {
    function handleClickOutside(event) {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block" ref={tooltipRef}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold hover:bg-yellow-200 transition-colors cursor-pointer"
        aria-label="More info"
        style={{ color: "var(--color-warning-dark)", backgroundColor: "var(--color-warning-light)" }}
      >
        ⓘ
      </button>
      {isOpen && (
        <div className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 text-sm bg-white border border-gray-200 rounded shadow-lg">
          {text}
          {/* Caret */}
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-200"></div>
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-white"></div>
        </div>
      )}
    </div>
  );
}
