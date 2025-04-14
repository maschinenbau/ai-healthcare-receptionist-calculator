import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- Simple Card Components ---
// Reusable Card component for styling sections
const Card = ({ children, className }) => (
  // Using white background and subtle shadow for cards
  <div className={`bg-white shadow-md rounded-lg border border-gray-200 ${className}`}>{children}</div>
);

// Reusable CardHeader component
const CardHeader = ({ children, className }) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>{children}</div>
);

// Reusable CardTitle component
const CardTitle = ({ children, className }) => (
  // Using dark gray for titles
  <h2 className={`text-xl font-bold text-gray-800 ${className}`}>{children}</h2>
);

// Reusable CardContent component
const CardContent = ({ children, className }) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
);

// --- Print Styles Component ---
// Adds CSS rules specifically for printing (includes grayscale adjustments)
const PrintStyles = () => (
  <style type="text/css">
    {`
      @media print {
        body * { visibility: hidden; }
        #printable-area, #printable-area * { visibility: visible; }
        #printable-area { position: absolute; left: 0; top: 0; width: 100%; }
        .no-print, .no-print * { display: none !important; }
        .print-grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
        .print-p-0 { padding: 0 !important; }
        .print-shadow-none { box-shadow: none !important; }
        .print-border-none { border: none !important; }
        .recharts-legend-wrapper { position: relative !important; }
        .recharts-tooltip-wrapper { display: none !important; }
        /* Ensure backgrounds print */
        .bg-white { background-color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .bg-gray-50 { background-color: #f9fafb !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .bg-gray-100 { background-color: #f3f4f6 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        /* Ensure text colors print */
        * { color: inherit !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .text-white { color: white !important; }
        .text-gray-300 { color: #d1d5db !important; }
        .text-gray-500 { color: #6b7280 !important; }
        .text-gray-600 { color: #4b5563 !important; }
        .text-gray-700 { color: #374151 !important; }
        .text-gray-800 { color: #1f2937 !important; }
        .text-gray-900 { color: #111827 !important; }
        /* Keep highlight colors for print */
        .text-red-500 { color: #ef4444 !important; }
        .text-red-600 { color: #dc2626 !important; }
        .text-red-700 { color: #b91c1c !important; }
        .text-green-600 { color: #16a34a !important; }
        .text-green-700 { color: #15803d !important; }
        .text-green-800 { color: #166534 !important; }
      }
    `}
  </style>
);

// --- Helper Function to Safely Format Numbers ---
// Checks if a value is a valid number before calling toLocaleString
// Returns a fallback string (like '0.00' or 'N/A') if the value is invalid
const safeLocaleString = (value, options = {}, fallback = '0.00') => {
  if (typeof value === 'number' && isFinite(value)) {
    return value.toLocaleString(undefined, options);
  }
  if ((options.style === 'percent' && fallback === 'N/A') || fallback === 'N/A') {
      return 'N/A';
  }
  return fallback;
};


// --- Main Calculator Component (Named App for export) ---
function App() {
  // --- State Variables ---
  // Pricing tiers for the AI service
  const pricingTiers = {
    basic: { name: "Basic", setupFee: 745, monthlyCost: 250, perMinuteCost: 0.45, description: "Essential features for small practices" },
    professional: { name: "Professional", setupFee: 1500, monthlyCost: 500, perMinuteCost: 0.40, description: "Advanced features with priority support" },
    enterprise: { name: "Enterprise", setupFee: 5000, monthlyCost: 2500, perMinuteCost: 0.30, description: "Custom solutions starting at" }
  };

  // Industry presets now include call data benchmarks
  // These are illustrative averages and may need adjustment for specific practices.
  const industryPresets = {
    dental_clinic: { avgLeadValue: 200, conversionRate: 25, businessHourCalls: 15, afterHourCalls: 3, missedBusinessHourCalls: 2, avgCallDuration: 6, salesCallPercentage: 60 },
    chiropractor: { avgLeadValue: 150, conversionRate: 30, businessHourCalls: 10, afterHourCalls: 1, missedBusinessHourCalls: 1, avgCallDuration: 5, salesCallPercentage: 70 },
    physical_therapy: { avgLeadValue: 180, conversionRate: 28, businessHourCalls: 12, afterHourCalls: 2, missedBusinessHourCalls: 2, avgCallDuration: 7, salesCallPercentage: 50 },
    optometry_clinic: { avgLeadValue: 250, conversionRate: 35, businessHourCalls: 18, afterHourCalls: 2, missedBusinessHourCalls: 3, avgCallDuration: 6, salesCallPercentage: 65 },
    urgent_care: { avgLeadValue: 120, conversionRate: 50, businessHourCalls: 30, afterHourCalls: 10, missedBusinessHourCalls: 5, avgCallDuration: 4, salesCallPercentage: 40 },
    mental_health_practice: { avgLeadValue: 100, conversionRate: 20, businessHourCalls: 8, afterHourCalls: 4, missedBusinessHourCalls: 1, avgCallDuration: 8, salesCallPercentage: 30 },
    dermatology_clinic: { avgLeadValue: 300, conversionRate: 22, businessHourCalls: 15, afterHourCalls: 2, missedBusinessHourCalls: 2, avgCallDuration: 7, salesCallPercentage: 45 },
    podiatry_clinic: { avgLeadValue: 175, conversionRate: 27, businessHourCalls: 9, afterHourCalls: 1, missedBusinessHourCalls: 1, avgCallDuration: 6, salesCallPercentage: 55 },
    medical_spa: { avgLeadValue: 400, conversionRate: 18, businessHourCalls: 10, afterHourCalls: 3, missedBusinessHourCalls: 1, avgCallDuration: 9, salesCallPercentage: 35 },
    home_health_agency: { avgLeadValue: 500, conversionRate: 15, businessHourCalls: 5, afterHourCalls: 5, missedBusinessHourCalls: 1, avgCallDuration: 10, salesCallPercentage: 25 },
    other_healthcare: { avgLeadValue: 200, conversionRate: 20, businessHourCalls: 12, afterHourCalls: 2, missedBusinessHourCalls: 3, avgCallDuration: 8, salesCallPercentage: 47 } // Fallback
  };

  // Default industry and derive full default preset
  const defaultIndustry = "dental_clinic";
  const defaultPreset = industryPresets[defaultIndustry];

  // Initialize state using the full default preset
  const [businessHourCalls, setBusinessHourCalls] = useState(defaultPreset.businessHourCalls);
  const [afterHourCalls, setAfterHourCalls] = useState(defaultPreset.afterHourCalls);
  const [missedBusinessHourCalls, setMissedBusinessHourCalls] = useState(defaultPreset.missedBusinessHourCalls);
  const [avgCallDuration, setAvgCallDuration] = useState(defaultPreset.avgCallDuration);
  const [salesCallPercentage, setSalesCallPercentage] = useState(defaultPreset.salesCallPercentage);
  const [daysOpen, setDaysOpen] = useState("sixdays"); // Keep this manual for now
  const [avgLeadValue, setAvgLeadValue] = useState(defaultPreset.avgLeadValue);
  const [conversionRate, setConversionRate] = useState(defaultPreset.conversionRate);
  const [industry, setIndustry] = useState(defaultIndustry);
  const [humanHourlyWage, setHumanHourlyWage] = useState(18); // Staff costs remain manual inputs
  const [humanHoursPerWeek, setHumanHoursPerWeek] = useState(40);
  const [humanOverheadPercentage, setHumanOverheadPercentage] = useState(25);

  // Input validation state
  const [inputErrors, setInputErrors] = useState({
    businessHourCalls: false, afterHourCalls: false, missedBusinessHourCalls: false,
    avgCallDuration: false, salesCallPercentage: false, avgLeadValue: false,
    conversionRate: false, humanHourlyWage: false, humanHoursPerWeek: false,
    humanOverheadPercentage: false,
  });
  const [validationError, setValidationError] = useState(false); // Overall validation status

  // AI pricing state
  const [selectedTier, setSelectedTier] = useState("professional"); // Default selected AI tier
  const [aiSetupFee, setAiSetupFee] = useState(pricingTiers.professional.setupFee);
  const [aiSubscriptionCost, setAiSubscriptionCost] = useState(pricingTiers.professional.monthlyCost);
  const [aiPerMinuteCost, setAiPerMinuteCost] = useState(pricingTiers.professional.perMinuteCost);

  // Results state
  const [results, setResults] = useState({
    totalCalls: 0, missedCalls: 0, salesMissedCalls: 0, totalMinutes: 0,
    aiBaseCost: 0, aiMinuteCost: 0, aiSetupFee: 0, aiSetupFeeMonthly: 0,
    aiTotalMonthlyCost: 0, aiTotalCostWithSetup: 0, humanCost: 0,
    potentialRevenue: 0, costSavings: 0, netBenefit: 0, roi: 0,
    paybackPeriod: 0, yearlyCostSavings: 0, yearlyPotentialRevenue: 0,
    yearlyNetBenefit: 0, firstYearNetReturn: 0,
    firstYearRevenueVsAiCost: 0,
  });

  // --- Effects ---
  // Update overall validation error state when individual input errors change
  useEffect(() => {
    const hasErrors = Object.values(inputErrors).some(error => error);
    setValidationError(hasErrors);
  }, [inputErrors]);

  // Update AI costs when the selected tier changes
  useEffect(() => {
    if (pricingTiers[selectedTier]) {
      setAiSetupFee(pricingTiers[selectedTier].setupFee);
      setAiSubscriptionCost(pricingTiers[selectedTier].monthlyCost);
      setAiPerMinuteCost(pricingTiers[selectedTier].perMinuteCost);
    }
  }, [selectedTier]);

  // --- Calculation Logic ---
  // Recalculate results whenever relevant inputs change
  useEffect(() => {
    try {
      // Calculate monthly human cost
      const weeklyWageCost = humanHourlyWage * humanHoursPerWeek;
      const yearlyWageCost = weeklyWageCost * 52;
      const monthlyWageCost = yearlyWageCost / 12;
      const calculatedHumanMonthlyCost = monthlyWageCost * (1 + humanOverheadPercentage / 100);

      // Calculate monthly call volume and minutes
      const daysPerMonth = daysOpen === "weekdays" ? 22 : daysOpen === "sixdays" ? 26 : 30;
      const totalMonthlyCalls = (businessHourCalls * daysPerMonth) + (afterHourCalls * 30);
      const monthlyMissedBusinessHourCalls = missedBusinessHourCalls * daysPerMonth;
      const monthlyAfterHourCalls = afterHourCalls * 30;
      const totalMissedCalls = monthlyMissedBusinessHourCalls + monthlyAfterHourCalls;
      const totalMinutes = totalMonthlyCalls * avgCallDuration;

      // Calculate potential revenue from missed calls
      const salesMissedCalls = totalMissedCalls * (salesCallPercentage / 100);
      const valuePerCall = avgLeadValue * (conversionRate / 100);
      const potentialRevenueFromMissedCalls = salesMissedCalls * valuePerCall;

      // Calculate AI costs
      const aiBaseCost = aiSubscriptionCost;
      const aiUsageCost = totalMinutes * aiPerMinuteCost;
      const aiTotalMonthlyCost = aiBaseCost + aiUsageCost;

      // Calculate effective monthly AI cost including amortized setup fee
      const aiSetupFeeMonthly = aiSetupFee / 12;
      const aiTotalCostWithSetup = aiTotalMonthlyCost + aiSetupFeeMonthly;

      // Calculate financial impact
      const costSavings = calculatedHumanMonthlyCost - aiTotalCostWithSetup;
      const totalBenefit = costSavings + potentialRevenueFromMissedCalls;
      const roi = aiTotalCostWithSetup > 0 ? (totalBenefit / aiTotalCostWithSetup) * 100 : 0;

      // Calculate payback period
      const paybackPeriodMonths = totalBenefit > 0 ? (aiSetupFee / totalBenefit) : Infinity;

      // Calculate annual projections
      const yearlyCostSavings = (calculatedHumanMonthlyCost - aiTotalMonthlyCost) * 12;
      const yearlyPotentialRevenue = potentialRevenueFromMissedCalls * 12;
      const yearlyNetBenefit = yearlyCostSavings + yearlyPotentialRevenue;

      // Calculate first year return
      const annualOperationalGain = (calculatedHumanMonthlyCost - aiTotalMonthlyCost + potentialRevenueFromMissedCalls) * 12;
      const firstYearNetReturn_clearer = annualOperationalGain - aiSetupFee;

      // Calculate comparison of first year revenue vs total AI cost
      const totalInvestmentFirstYear = (aiTotalMonthlyCost * 12) + aiSetupFee;
      const calculatedFirstYearRevenueVsAiCost = yearlyPotentialRevenue - totalInvestmentFirstYear;

      // Update the results state
      setResults({
        totalCalls: totalMonthlyCalls, missedCalls: totalMissedCalls, salesMissedCalls: salesMissedCalls,
        totalMinutes: totalMinutes, aiBaseCost: aiBaseCost, aiMinuteCost: aiUsageCost,
        aiSetupFee: aiSetupFee, aiSetupFeeMonthly: aiSetupFeeMonthly, aiTotalMonthlyCost: aiTotalMonthlyCost,
        aiTotalCostWithSetup: aiTotalCostWithSetup, humanCost: calculatedHumanMonthlyCost,
        potentialRevenue: potentialRevenueFromMissedCalls, costSavings: costSavings, netBenefit: totalBenefit,
        roi: roi, paybackPeriod: paybackPeriodMonths, yearlyCostSavings: yearlyCostSavings,
        yearlyPotentialRevenue: yearlyPotentialRevenue, yearlyNetBenefit: yearlyNetBenefit,
        firstYearNetReturn: firstYearNetReturn_clearer,
        firstYearRevenueVsAiCost: calculatedFirstYearRevenueVsAiCost,
      });
    } catch (error) {
        console.error("Error during calculation:", error);
    }
  }, [
    // Dependency array
    businessHourCalls, afterHourCalls, missedBusinessHourCalls, avgCallDuration,
    avgLeadValue, conversionRate, salesCallPercentage, daysOpen,
    aiSubscriptionCost, aiPerMinuteCost, aiSetupFee,
    humanHourlyWage, humanHoursPerWeek, humanOverheadPercentage
  ]);

  // --- Handlers & Helpers ---
  // Handles changes to the industry dropdown, updating ALL preset fields
  const handleIndustryChange = (e) => {
    const selectedIndustry = e.target.value;
    setIndustry(selectedIndustry);

    // Get the full preset for the selected industry, or fallback to 'other'
    const preset = industryPresets[selectedIndustry] || industryPresets.other_healthcare;

    // Update all relevant state variables from the preset
    setAvgLeadValue(preset.avgLeadValue);
    setConversionRate(preset.conversionRate);
    setBusinessHourCalls(preset.businessHourCalls);
    setAfterHourCalls(preset.afterHourCalls);
    setMissedBusinessHourCalls(preset.missedBusinessHourCalls);
    setAvgCallDuration(preset.avgCallDuration);
    setSalesCallPercentage(preset.salesCallPercentage);

    // Clear potential validation errors for all fields updated by the preset
    setInputErrors(prevErrors => ({
      ...prevErrors,
      avgLeadValue: false,
      conversionRate: false,
      businessHourCalls: false,
      afterHourCalls: false,
      missedBusinessHourCalls: false,
      avgCallDuration: false,
      salesCallPercentage: false,
    }));
  };

  // Handles changes for number input fields, performing validation
  // Allows users to override preset values after selection
  const handleNumberInputChange = (setter, errorKey, value, min = 0, max = Infinity) => {
    const rawValue = value.trim();
    if (rawValue === '') {
       setInputErrors(prevErrors => ({ ...prevErrors, [errorKey]: false }));
       setter('');
       return;
    }
    const numValue = Number(rawValue);
    if (isNaN(numValue) || numValue < min || numValue > max) {
      setInputErrors(prevErrors => ({ ...prevErrors, [errorKey]: true }));
      setter(rawValue);
    } else {
      setInputErrors(prevErrors => ({ ...prevErrors, [errorKey]: false }));
      setter(numValue);
    }
  };

  // Formats the payback period from months into years and months
  const formatPaybackPeriod = (periodInMonths) => {
      if (!isFinite(periodInMonths) || periodInMonths < 0) { return "Never"; }
      if (periodInMonths === 0) { return "Immediate"; }
      const years = Math.floor(periodInMonths / 12);
      const months = Math.round(periodInMonths % 12);
      let result = "";
      if (years > 0) { result += `${years} year${years > 1 ? 's' : ''}`; }
      if (months > 0) { result += (result ? " " : "") + `${months} month${months > 1 ? 's' : ''}`; }
      return result || "Less than 1 month";
  };

  // Triggers the browser's print dialog
  const handlePrint = () => { window.print(); };

  // --- JSX Rendering ---
  // Applying grayscale theme using Tailwind classes
  return (
    <>
      <PrintStyles />
      {/* Main container - subtle gray background */}
      <div id="printable-area" className="p-4 max-w-6xl mx-auto font-sans print-p-0 bg-gray-50">
        {/* Overall Card - white background, slight border */}
        <Card className="w-full print-shadow-none print-border-none bg-white">
          {/* Header - dark gray background, white text */}
          <CardHeader className="bg-gray-800 text-white rounded-t-lg border-b-0">
            <CardTitle className="text-center text-2xl text-white">AI Receptionist ROI Calculator</CardTitle>
             <p className="text-center text-sm text-gray-300 mt-1">Compare AI vs. Human Receptionist Costs & Benefits</p>
          </CardHeader>

          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print-grid-cols-1">

              {/* Left Column: Input Sections */}
              <div className="space-y-8">
                 {/* Input Cards - white background, standard border */}
                 <Card className="border border-gray-200 print-shadow-none print-border-none">
                    <CardHeader>
                      {/* Card Title - dark gray text */}
                      <CardTitle className="text-lg font-semibold mb-3 text-gray-700">Practice Profile & Call Volume</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Input Labels - medium gray text */}
                      <div>
                        <label htmlFor="industry" className="block text-sm font-medium mb-1 text-gray-600">Industry / Practice Type</label>
                        {/* Input Fields - standard border, gray focus ring */}
                        <select
                          id="industry"
                          value={industry}
                          onChange={handleIndustryChange} // This now updates more fields
                          className="w-full p-2 border border-gray-300 rounded focus:ring-gray-500 focus:border-gray-500 transition duration-150"
                        >
                          {Object.keys(industryPresets).map(key => (
                            <option key={key} value={key}>
                              {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </option>
                          ))}
                        </select>
                        {/* Help Text - light gray text */}
                        <p className="text-xs text-gray-500 mt-1">Select practice type to load average benchmarks (you can adjust below).</p>
                      </div>
                      <div>
                        <label htmlFor="daysOpen" className="block text-sm font-medium mb-1 text-gray-600">Practice Operating Days</label>
                        <select id="daysOpen" value={daysOpen} onChange={(e) => setDaysOpen(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:ring-gray-500 focus:border-gray-500 transition duration-150">
                          <option value="weekdays">Monday-Friday (5 days/week)</option>
                          <option value="sixdays">Monday-Saturday (6 days/week)</option>
                          <option value="alldays">All Days (7 days/week)</option>
                        </select>
                      </div>
                      {/* Input fields with error styling */}
                      {/* Error border uses red, but focus remains gray */}
                      <div>
                        <label htmlFor="businessHourCalls" className="block text-sm font-medium mb-1 text-gray-600">Avg. Daily Calls (Business Hours)</label>
                        <input
                           id="businessHourCalls" type="number" min="0" value={businessHourCalls} // Reflects state (preset or user input)
                           onChange={(e) => handleNumberInputChange(setBusinessHourCalls, 'businessHourCalls', e.target.value)}
                           className={`w-full p-2 border rounded transition duration-150 ${
                            inputErrors.businessHourCalls ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-gray-500 focus:border-gray-500' // Red border on error, gray focus otherwise
                           }`} placeholder="e.g., 15" />
                        {inputErrors.businessHourCalls && (<p className="text-red-500 text-xs mt-1">Please enter a valid positive number.</p>)}
                      </div>
                      <div>
                        <label htmlFor="afterHourCalls" className="block text-sm font-medium mb-1 text-gray-600">Avg. Daily Calls (After Hours)</label>
                        <input id="afterHourCalls" type="number" min="0" value={afterHourCalls} // Reflects state
                          onChange={(e) => handleNumberInputChange(setAfterHourCalls, 'afterHourCalls', e.target.value)}
                          className={`w-full p-2 border rounded transition duration-150 ${inputErrors.afterHourCalls ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-gray-500 focus:border-gray-500'}`}
                           placeholder="e.g., 3" />
                        {inputErrors.afterHourCalls && (<p className="text-red-500 text-xs mt-1">Please enter a valid positive number.</p>)}
                      </div>
                      <div>
                        <label htmlFor="missedBusinessHourCalls" className="block text-sm font-medium mb-1 text-gray-600">Avg. Daily Missed Calls (Business Hours)</label>
                        <input id="missedBusinessHourCalls" type="number" min="0" value={missedBusinessHourCalls} // Reflects state
                          onChange={(e) => handleNumberInputChange(setMissedBusinessHourCalls, 'missedBusinessHourCalls', e.target.value)}
                          className={`w-full p-2 border rounded transition duration-150 ${inputErrors.missedBusinessHourCalls ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-gray-500 focus:border-gray-500'}`}
                           placeholder="e.g., 2" />
                        {inputErrors.missedBusinessHourCalls && (<p className="text-red-500 text-xs mt-1">Please enter a valid positive number.</p>)}
                      </div>
                      <div>
                        <label htmlFor="avgCallDuration" className="block text-sm font-medium mb-1 text-gray-600">Average Call Duration (minutes)</label>
                        <input id="avgCallDuration" type="number" min="0" step="0.5" value={avgCallDuration} // Reflects state
                          onChange={(e) => handleNumberInputChange(setAvgCallDuration, 'avgCallDuration', e.target.value)}
                          className={`w-full p-2 border rounded transition duration-150 ${inputErrors.avgCallDuration ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-gray-500 focus:border-gray-500'}`}
                           placeholder="e.g., 5.5" />
                        {inputErrors.avgCallDuration && (<p className="text-red-500 text-xs mt-1">Please enter a valid positive number.</p>)}
                      </div>
                    </CardContent>
                  </Card>

                 {/* AI Pricing Tier Selection Card */}
                 <Card className="border border-gray-200 print-shadow-none print-border-none">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold mb-3 text-gray-700">Select AI Pricing Tier</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {Object.entries(pricingTiers).map(([key, tier]) => (
                          <div
                            key={key}
                            // Grayscale highlighting for selected tier
                            className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-105 ${
                              selectedTier === key
                                ? 'border-gray-500 bg-gray-100 shadow-md ring-1 ring-gray-500' // Selected: darker border, light gray bg, ring
                                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50' // Default: lighter border, hover effects
                            } ${key === 'professional' ? 'relative' : ''}`}
                            onClick={() => setSelectedTier(key)}
                          >
                            {/* Recommended badge - grayscale */}
                            {key === 'professional' && (
                              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 no-print">
                                <span className="bg-gray-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">RECOMMENDED</span>
                              </div>
                            )}
                            {/* Tier Title - darker gray text */}
                            <div className={`text-center mb-2 ${key === 'professional' ? 'mt-3' : ''}`}>
                              <div className="text-md font-bold text-gray-700">{tier.name}</div>
                              <div className="text-xs text-gray-500">{tier.description}</div>
                            </div>
                            {/* Tier Details - standard gray text */}
                            <div className="space-y-1.5 mt-3 text-sm text-gray-700">
                              <div className="flex justify-between"><span>Setup:</span><span className="font-medium text-gray-900">${tier.setupFee.toLocaleString()}</span></div>
                              <div className="flex justify-between"><span>Monthly:</span><span className="font-medium text-gray-900">${tier.monthlyCost.toLocaleString()}</span></div>
                              <div className="flex justify-between"><span>Per Minute:</span><span className="font-medium text-gray-900">${tier.perMinuteCost.toFixed(2)}</span></div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-3 text-center">Click a tier to update the AI cost calculations.</p>
                    </CardContent>
                  </Card>

                 {/* Revenue & Staff Cost Card */}
                 <Card className="border border-gray-200 print-shadow-none print-border-none">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold mb-3 text-gray-700">Revenue & Current Staff Costs</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Inputs using grayscale focus */}
                      <div>
                        <label htmlFor="salesCallPercentage" className="block text-sm font-medium mb-1 text-gray-600">New Patient/Appointment Calls (%)</label>
                        <input id="salesCallPercentage" type="number" min="0" max="100" value={salesCallPercentage} // Reflects state
                          onChange={(e) => handleNumberInputChange(setSalesCallPercentage, 'salesCallPercentage', e.target.value, 0, 100)}
                          className={`w-full p-2 border rounded transition duration-150 ${inputErrors.salesCallPercentage ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-gray-500 focus:border-gray-500'}`}
                          placeholder="e.g., 50" />
                         <p className="text-xs text-gray-500 mt-1">What percentage of calls are potential new patients or appointments?</p>
                        {inputErrors.salesCallPercentage && (<p className="text-red-500 text-xs mt-1">Please enter a value between 0 and 100.</p>)}
                      </div>
                      <div>
                        <label htmlFor="avgLeadValue" className="block text-sm font-medium mb-1 text-gray-600">Average Value per New Patient/Customer ($)</label>
                        <input id="avgLeadValue" type="number" min="0" value={avgLeadValue} // Reflects state
                          onChange={(e) => handleNumberInputChange(setAvgLeadValue, 'avgLeadValue', e.target.value)}
                          className={`w-full p-2 border rounded transition duration-150 ${inputErrors.avgLeadValue ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-gray-500 focus:border-gray-500'}`}
                          placeholder="e.g., 250" />
                        <p className="text-xs text-gray-500 mt-1">Estimated lifetime value or initial treatment value.</p>
                        {inputErrors.avgLeadValue && (<p className="text-red-500 text-xs mt-1">Please enter a valid positive number.</p>)}
                      </div>
                      <div>
                        <label htmlFor="conversionRate" className="block text-sm font-medium mb-1 text-gray-600">Lead-to-Patient/Customer Conversion Rate (%)</label>
                        <input id="conversionRate" type="number" min="0" max="100" value={conversionRate} // Reflects state
                          onChange={(e) => handleNumberInputChange(setConversionRate, 'conversionRate', e.target.value, 0, 100)}
                          className={`w-full p-2 border rounded transition duration-150 ${inputErrors.conversionRate ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-gray-500 focus:border-gray-500'}`}
                           placeholder="e.g., 30" />
                        {inputErrors.conversionRate && (<p className="text-red-500 text-xs mt-1">Please enter a value between 0 and 100.</p>)}
                      </div>
                      {/* Human Staff Cost Section (Remains manual input) */}
                      <div className="pt-4 mt-4 border-t border-gray-200">
                        <h4 className="text-md font-semibold mb-2 text-gray-600">Current Human Receptionist Details</h4>
                        <div>
                          <label htmlFor="humanHourlyWage" className="block text-sm font-medium mb-1 text-gray-600">Average Hourly Wage ($)</label>
                          <input id="humanHourlyWage" type="number" min="0" step="0.01" value={humanHourlyWage}
                            onChange={(e) => handleNumberInputChange(setHumanHourlyWage, 'humanHourlyWage', e.target.value)}
                            className={`w-full p-2 border rounded transition duration-150 ${inputErrors.humanHourlyWage ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-gray-500 focus:border-gray-500'}`}
                            placeholder="e.g., 18.50" />
                          {inputErrors.humanHourlyWage && (<p className="text-red-500 text-xs mt-1">Please enter a valid positive number.</p>)}
                        </div>
                        <div className="mt-4">
                          <label htmlFor="humanHoursPerWeek" className="block text-sm font-medium mb-1 text-gray-600">Average Hours Worked per Week</label>
                          <input id="humanHoursPerWeek" type="number" min="0" value={humanHoursPerWeek}
                            onChange={(e) => handleNumberInputChange(setHumanHoursPerWeek, 'humanHoursPerWeek', e.target.value)}
                            className={`w-full p-2 border rounded transition duration-150 ${inputErrors.humanHoursPerWeek ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-gray-500 focus:border-gray-500'}`}
                            placeholder="e.g., 40" />
                          {inputErrors.humanHoursPerWeek && (<p className="text-red-500 text-xs mt-1">Please enter a valid positive number.</p>)}
                        </div>
                        <div className="mt-4">
                          <label htmlFor="humanOverheadPercentage" className="block text-sm font-medium mb-1 text-gray-600"> Estimated Overhead (%) </label>
                          <input id="humanOverheadPercentage" type="number" min="0" max="200" value={humanOverheadPercentage}
                            onChange={(e) => handleNumberInputChange(setHumanOverheadPercentage, 'humanOverheadPercentage', e.target.value, 0, 200)}
                            className={`w-full p-2 border rounded transition duration-150 ${inputErrors.humanOverheadPercentage ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-gray-500 focus:border-gray-500'}`}
                            placeholder="e.g., 25" />
                          <p className="text-xs text-gray-500 mt-1">Include benefits, taxes, software, office space, etc.</p>
                          {inputErrors.humanOverheadPercentage && (<p className="text-red-500 text-xs mt-1">Please enter a valid percentage (e.g., 0-200).</p>)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                 {/* Calculate Button - grayscale */}
                 <div className="mt-6 no-print">
                    <button
                      onClick={() => { if (!validationError) { const resultsSection = document.getElementById('results-section'); if (resultsSection) { resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' }); } } }}
                      disabled={validationError}
                      // Dark gray button, slightly darker on hover
                      className={`w-full font-bold py-3 px-4 rounded transition duration-200 ease-in-out text-white shadow-md hover:shadow-lg ${
                        validationError
                          ? 'bg-gray-400 cursor-not-allowed' // Disabled style remains light gray
                          : 'bg-gray-700 hover:bg-gray-800 cursor-pointer' // Enabled style is dark gray
                      }`}
                    >
                      {validationError ? 'Please Fix Errors Above' : 'Calculate ROI & View Results'}
                    </button>
                    <p className="text-xs text-center text-gray-500 mt-2">
                      {validationError ? 'Correct the highlighted fields to enable calculation.' : 'Click to see your potential savings and revenue gains.'}
                    </p>
                  </div>
              </div> {/* End Left Column */}


              {/* Right Column: Results Display */}
              <div id="results-section" className="space-y-6">
                {/* Result Cards - Use light gray background for content areas */}
                <Card className="border border-gray-200 print-shadow-none print-border-none">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-700">Monthly Call Analysis</CardTitle>
                  </CardHeader>
                  {/* Light gray background for content */}
                  <CardContent className="bg-gray-50 p-4 rounded-b-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Total Calls Handled by AI (Est.):</span>
                      <span className="font-medium text-gray-900">{safeLocaleString(results.totalCalls, { maximumFractionDigits: 0 }, '0')}</span>
                    </div>
                    <p className="text-xs text-gray-500 -mt-2 mb-2 pl-1"> (Business + After Hours)</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Currently Missed Calls (Est.):</span>
                      {/* Keep red for missed calls */}
                      <span className="font-medium text-red-600">{safeLocaleString(results.missedCalls, { maximumFractionDigits: 0 }, '0')}</span>
                    </div>
                    <p className="text-xs text-gray-500 -mt-2 mb-2 pl-1"> (Missed Business Hours + All After Hours)</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Missed New Patient Opportunities (Est.):</span>
                       {/* Keep red for missed opportunities */}
                      <span className="font-medium text-red-700">{safeLocaleString(results.salesMissedCalls, { maximumFractionDigits: 0 }, '0')}</span>
                    </div>
                    <p className="text-xs text-gray-500 -mt-2 pl-1"> (Missed Calls × New Patient Call %)</p>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 print-shadow-none print-border-none">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-700">AI Receptionist Cost ({pricingTiers[selectedTier]?.name} Tier)</CardTitle>
                  </CardHeader>
                  <CardContent className="bg-gray-50 p-4 rounded-b-lg space-y-3">
                    {/* AI Costs - standard dark gray text */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">One-time Setup Fee:</span>
                      <span className="font-medium text-gray-900">${safeLocaleString(results.aiSetupFee, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Monthly Subscription:</span>
                      <span className="font-medium text-gray-900">${safeLocaleString(results.aiBaseCost, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Est. Monthly Usage Cost:</span>
                      <span className="font-medium text-gray-900">${safeLocaleString(results.aiMinuteCost, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <p className="text-xs text-gray-500 -mt-2 mb-2 pl-1"> ({safeLocaleString(results.totalMinutes, { maximumFractionDigits: 0 }, '0')} mins × ${safeLocaleString(aiPerMinuteCost, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/min)</p>
                    <div className="flex justify-between items-center border-t border-gray-200 pt-2 mt-2">
                      <span className="text-sm font-semibold text-gray-800">Total Monthly Recurring Cost:</span>
                      {/* Keep AI total cost slightly emphasized but gray */}
                      <span className="font-semibold text-gray-800">${safeLocaleString(results.aiTotalMonthlyCost, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <p className="text-xs text-gray-500 -mt-2 mb-2 pl-1"> (Subscription + Usage)</p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-gray-700"> Effective Monthly Cost (Yr 1) </span>
                      <span className="font-medium text-gray-900">${safeLocaleString(results.aiTotalCostWithSetup, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <p className="text-xs text-gray-500 -mt-2 pl-1"> (Monthly Recurring + Setup Fee/12)</p>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 print-shadow-none print-border-none">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-700">Calculated Human Receptionist Cost</CardTitle>
                  </CardHeader>
                  <CardContent className="bg-gray-50 p-4 rounded-b-lg space-y-3">
                     {/* Human Costs - standard dark gray text */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Est. Monthly Cost (Wages + Overhead):</span>
                      <span className="font-medium text-gray-900">${safeLocaleString(results.humanCost, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <p className="text-xs text-gray-500 -mt-2 mb-2 pl-1"> Based on inputs: ${humanHourlyWage}/hr, {humanHoursPerWeek} hrs/wk, {humanOverheadPercentage}% overhead</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-700">Est. Annual Cost:</span>
                      <span className="font-medium text-gray-900">${safeLocaleString(results.humanCost * 12, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Financial Impact Card - Use subtle gray background, keep text colors */}
                <Card className="border border-gray-300 bg-gray-100 print-shadow-none print-border-none">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-800">Monthly Financial Impact (AI vs. Human)</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Direct Cost Savings (vs. Human):</span>
                      {/* Keep green/red text for savings/loss */}
                      <span className={`font-medium ${results.costSavings >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                         {results.costSavings < 0 ? '- ' : ''}${safeLocaleString(Math.abs(results.costSavings), { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                       </span>
                    </div>
                    <p className="text-xs text-gray-600 -mt-2 mb-2 pl-1"> (Calculated Human Cost - Effective Monthly AI Cost)</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Potential Added Revenue:</span>
                      {/* Keep green text for revenue */}
                      <span className="font-medium text-green-700"> + ${safeLocaleString(results.potentialRevenue, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </span>
                    </div>
                    <p className="text-xs text-gray-500 -mt-2 mb-2 pl-1"> (From capturing missed new patient calls)</p>
                    <div className="flex justify-between items-center border-t border-gray-300 pt-2 mt-2">
                      <span className="text-sm font-semibold text-gray-800">Total Monthly Benefit:</span>
                       {/* Keep green/red text for total benefit/loss */}
                      <span className={`font-semibold text-xl ${results.netBenefit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                         {results.netBenefit < 0 ? '- ' : ''}${safeLocaleString(Math.abs(results.netBenefit), { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                       </span>
                    </div>
                    <p className="text-xs text-gray-600 -mt-2 pl-1"> (Cost Savings + Added Revenue)</p>
                  </CardContent>
                </Card>

                {/* ROI Card - Use subtle gray background, keep text colors */}
                <Card className="border border-gray-300 bg-gray-100 print-shadow-none print-border-none">
                  <CardHeader className="text-center">
                    <CardTitle className="text-lg font-semibold text-gray-800">Potential Return on Investment (ROI)</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 text-center space-y-4">
                    <div>
                       {/* Keep green/red text for ROI */}
                      <div className={`text-4xl font-bold ${results.roi >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                         {safeLocaleString(results.roi, { maximumFractionDigits: 0 }, 'N/A')}%
                       </div>
                      <div className="text-sm text-gray-600">Monthly ROI</div>
                      <p className="text-xs text-gray-500 mt-1"> (Total Benefit / Effective Monthly AI Cost)</p>
                    </div>
                    <div>
                      <div className="text-md font-semibold text-gray-700">Payback Period</div>
                       {/* Keep green text for payback */}
                      <div className="text-2xl font-bold text-green-700 mt-1"> {formatPaybackPeriod(results.paybackPeriod)} </div>
                      <p className="text-xs text-gray-500 mt-1"> (Time to recoup initial setup fee via Net Benefit)</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Bar Chart Card */}
                <Card className="border border-gray-200 print-shadow-none print-border-none">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-700 mb-1">Monthly Cost & Benefit Comparison</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div style={{ width: '100%', height: 280 }}>
                      <ResponsiveContainer>
                        <BarChart data={[ { name: 'Monthly', 'Human Cost (Calculated)': results.humanCost, 'AI Cost (Est.)': results.aiTotalCostWithSetup, 'Net Benefit': results.netBenefit > 0 ? results.netBenefit : 0 } ]}
                          margin={{ top: 5, right: 5, left: 15, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
                          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#4b5563' }} /> {/* Gray ticks */}
                          <YAxis tickFormatter={(value) => `$${safeLocaleString(value)}`} tick={{ fontSize: 10, fill: '#4b5563' }} /> {/* Gray ticks */}
                          <Tooltip
                            formatter={(value, name) => [`$${safeLocaleString(value, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, name]}
                            labelFormatter={() => 'Monthly Comparison'}
                            cursor={{ fill: 'rgba(200, 200, 200, 0.3)' }} // Lighter gray cursor
                            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderColor: '#d1d5db' }} // White tooltip, gray border
                            labelStyle={{ color: '#1f2937', fontWeight: 'bold' }} // Dark gray label
                            itemStyle={{ color: '#374151' }} // Medium gray item text
                          />
                          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: '10px', color: '#4b5563' }} /> {/* Gray legend text */}
                          {/* Updated Bar Colors: Red (Human), Gray (AI), Green (Benefit) */}
                          <Bar dataKey="Human Cost (Calculated)" fill="#ef4444" name="Human Cost (Calculated)" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="AI Cost (Est.)" fill="#6b7280" name="AI Cost (Incl. Setup/12)" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Net Benefit" fill="#16a34a" name="Net Monthly Benefit" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

              </div> {/* End Right Column */}
            </div> {/* End Grid */}

            {/* --- Key Insights & Qualitative Sections - Grayscale backgrounds --- */}
            <div className="mt-8">
                <Card className="border border-gray-300 bg-gray-100 print-shadow-none print-border-none">
                   <CardHeader> <CardTitle className="text-lg font-semibold text-gray-800">Key Insights & Annual Projections</CardTitle> </CardHeader>
                   <CardContent className="p-4 space-y-4 text-sm">
                     {/* Insight boxes - white background */}
                     {results.yearlyPotentialRevenue > 0 && (
                       <div className="bg-white p-3 rounded shadow-sm border border-gray-200">
                           <p className="font-medium text-gray-800 mb-1"> Potential Annual Added Revenue: <span className="text-xs text-gray-500 font-normal ml-1">(First Year)</span> </p>
                           {/* Keep green text */}
                           <p className={`text-xl font-semibold text-green-600`}> ${safeLocaleString(results.yearlyPotentialRevenue, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </p>
                           <p className="text-xs text-gray-500 mt-1">(Est. Revenue from Captured Missed Calls x 12)</p>
                       </div>
                     )}
                      <div className="bg-white p-3 rounded shadow-sm border border-gray-200">
                         <p className="font-medium text-gray-800 mb-1">Potential Annual Benefit:</p>
                          {/* Keep green/red text */}
                          <p className={`text-xl font-semibold ${results.yearlyNetBenefit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {results.yearlyNetBenefit < 0 ? '- ' : ''}${safeLocaleString(Math.abs(results.yearlyNetBenefit), { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">(Annual Recurring Cost Savings + Annual Added Revenue)</p>
                     </div>
                     {/* Insight list - standard gray text, keep highlights */}
                     <ul className="list-disc pl-5 space-y-2 text-gray-700">
                         <li> Overall, the AI solution projects a net monthly <span className={`font-semibold ${results.netBenefit >= 0 ? 'text-green-600' : 'text-red-600'}`}> {results.netBenefit >= 0 ? ' gain ' : ' loss '} of ${safeLocaleString(Math.abs(results.netBenefit), { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </span> , combining cost savings and added revenue. </li>
                         {(results.paybackPeriod > 0 && isFinite(results.paybackPeriod)) && ( <li> The initial investment (setup fee of ${safeLocaleString(results.aiSetupFee, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}) is estimated to be paid back within <span className="font-semibold text-green-700"> {formatPaybackPeriod(results.paybackPeriod)}</span> through the net monthly benefits {results.paybackPeriod <= 12 && " (indicating a quick return)"}. </li> )}
                         {(!isFinite(results.paybackPeriod) || results.paybackPeriod < 0) && results.netBenefit <= 0 && ( <li> Based on the current inputs, the initial investment is not projected to be paid back via net benefits. </li> )}
                         {(results.paybackPeriod === 0) && results.netBenefit > 0 && isFinite(results.paybackPeriod) && ( <li> With a positive net benefit and zero setup fee, the return is effectively immediate. </li> )}
                         {results.potentialRevenue > 0 && ( <li> Capturing currently missed calls is estimated to add <span className="font-semibold text-green-600"> ${safeLocaleString(results.potentialRevenue, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> in potential revenue each month. </li> )}
                         {results.costSavings !== 0 && ( <li> Compared to the calculated human cost, the AI shows potential monthly <span className={`font-semibold ${results.costSavings >= 0 ? 'text-green-600' : 'text-red-600'}`}> {results.costSavings >= 0 ? ' savings ' : ' increased cost '} of ${safeLocaleString(Math.abs(results.costSavings), { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </span> (after factoring in the amortized setup fee). </li> )}
                         {isFinite(results.roi) && !isNaN(results.roi) && results.roi !== 0 && ( <li> This translates to a potential monthly ROI of <span className={`font-semibold ${results.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}> {safeLocaleString(results.roi, { maximumFractionDigits: 0 }, 'N/A')}% </span> , comparing the total monthly benefit to the effective AI cost (including amortized setup). </li> )}
                         <li> Comparing only the potential annual added revenue against the total first-year AI cost (including setup) results in a net <span className={`font-semibold ${results.firstYearRevenueVsAiCost >= 0 ? 'text-green-600' : 'text-red-600'}`}>{results.firstYearRevenueVsAiCost >=0 ? 'gain' : 'loss'} of ${safeLocaleString(Math.abs(results.firstYearRevenueVsAiCost), {minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> (this excludes savings from replacing staff).</li>
                     </ul>
                   </CardContent>
                </Card>
            </div>

            <div className="mt-8">
                <Card className="border border-gray-300 bg-gray-100 print-shadow-none print-border-none">
                    <CardHeader> <CardTitle className="text-lg font-semibold text-gray-800">Additional Potential Benefits (Qualitative)</CardTitle> </CardHeader>
                    <CardContent className="p-4 text-sm text-gray-700">
                        <p className="mb-3 text-gray-800">Beyond the quantifiable metrics above, consider how an AI receptionist addresses common operational challenges:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li> <span className="font-medium text-gray-900">Never Miss a Call:</span> Unlike human staff needing breaks, vacations, or sick days, the AI operates 24/7/365, ensuring every incoming call during or after hours is answered promptly, maximizing lead capture and patient support availability. </li>
                            <li> <span className="font-medium text-gray-900">Eliminate Hold Times:</span> Avoid frustrating callers with long waits or voicemail when staff are busy. The AI answers instantly, improving the patient experience and reducing hang-ups from impatient leads. </li>
                            <li> <span className="font-medium text-gray-900">Guarantee Service Consistency:</span> Eliminate variations in service quality or accuracy due to human factors. The AI delivers standardized, error-free information and follows processes exactly the same way for every call. </li>
                            <li> <span className="font-medium text-gray-900">Handle Peak Times Effortlessly:</span> Manage sudden increases in call volume without overwhelming staff or dropping calls. The AI scales instantly to meet demand, ensuring smooth operations during busy periods or marketing campaigns. </li>
                            <li> <span className="font-medium text-gray-900">Free Up Your Team:</span> Offload repetitive call handling from your skilled staff. The AI manages routine inquiries, appointment scheduling, and FAQs, allowing your team to focus on complex patient issues, follow-ups, and higher-value interactions, boosting productivity and patient care. </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {/* Print Button Section - grayscale */}
            <div className="mt-8 text-center no-print">
              {/* Dark gray button */}
              <button onClick={handlePrint} className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out shadow hover:shadow-md"> Print Results </button>
              <p className="text-xs text-gray-500 mt-2"> Use your browser's print dialog to save as PDF. </p>
            </div>

          </CardContent>
        </Card>
      </div> {/* End Printable Area */}
    </> // End Fragment
  );
}

// Export the component as default App
export default App;
