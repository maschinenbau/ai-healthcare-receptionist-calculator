import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- Simple Card Components ---
const Card = ({ children, className }) => (
  <div className={`bg-white shadow rounded-lg ${className}`}>{children}</div>
);

const CardHeader = ({ children, className }) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className }) => (
  <h2 className={`text-xl font-bold ${className}`}>{children}</h2>
);

const CardContent = ({ children, className }) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
);

// --- Print Styles Component ---
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
        .bg-white { background-color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .bg-gray-50 { background-color: #f9fafb !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .bg-\\[\\#eaf6da\\] { background-color: #eaf6da !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .bg-green-50 { background-color: #ecfdf5 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .bg-indigo-50 { background-color: #eef2ff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .bg-purple-50 { background-color: #faf5ff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        * { color: inherit !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        /* Add specific text colors needed for print */
        .text-white { color: white !important; }
        .text-gray-300 { color: #d1d5db !important; }
        .text-gray-500 { color: #6b7280 !important; }
        .text-gray-600 { color: #4b5563 !important; }
        .text-gray-700 { color: #374151 !important; }
        .text-gray-800 { color: #1f2937 !important; }
        .text-gray-900 { color: #111827 !important; }
        .text-red-500 { color: #ef4444 !important; }
        .text-red-600 { color: #dc2626 !important; }
        .text-red-700 { color: #b91c1c !important; }
        .text-green-600 { color: #16a34a !important; }
        .text-green-700 { color: #15803d !important; }
        .text-green-800 { color: #166534 !important; }
        .text-\\[\\#5a8228\\] { color: #5a8228 !important; } /* Escaped class */
        .text-indigo-800 { color: #3730a3 !important; }
        .text-purple-800 { color: #6b21a8 !important; }
      }
    `}
  </style>
);

// --- Helper Function to Safely Format Numbers ---
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
  const pricingTiers = {
    basic: { name: "Basic", setupFee: 745, monthlyCost: 250, perMinuteCost: 0.45, description: "Essential features for small businesses" },
    professional: { name: "Professional", setupFee: 1500, monthlyCost: 500, perMinuteCost: 0.40, description: "Advanced features with priority support" },
    enterprise: { name: "Enterprise", setupFee: 5000, monthlyCost: 2500, perMinuteCost: 0.30, description: "Custom solutions starting at" }
  };
  const [businessHourCalls, setBusinessHourCalls] = useState(12);
  const [afterHourCalls, setAfterHourCalls] = useState(2);
  const [missedBusinessHourCalls, setMissedBusinessHourCalls] = useState(3);
  const [avgCallDuration, setAvgCallDuration] = useState(8);
  const [salesCallPercentage, setSalesCallPercentage] = useState(47);
  const [daysOpen, setDaysOpen] = useState("sixdays");
  const [avgLeadValue, setAvgLeadValue] = useState(250);
  const [conversionRate, setConversionRate] = useState(12);
  const [industry, setIndustry] = useState("plumbing");
  const [humanHourlyWage, setHumanHourlyWage] = useState(18);
  const [humanHoursPerWeek, setHumanHoursPerWeek] = useState(40);
  const [humanOverheadPercentage, setHumanOverheadPercentage] = useState(25);
  const [inputErrors, setInputErrors] = useState({
    businessHourCalls: false, afterHourCalls: false, missedBusinessHourCalls: false,
    avgCallDuration: false, salesCallPercentage: false, avgLeadValue: false,
    conversionRate: false, humanHourlyWage: false, humanHoursPerWeek: false,
    humanOverheadPercentage: false,
  });
  const [validationError, setValidationError] = useState(false);
  const [selectedTier, setSelectedTier] = useState("professional");
  const [aiSetupFee, setAiSetupFee] = useState(pricingTiers.professional.setupFee);
  const [aiSubscriptionCost, setAiSubscriptionCost] = useState(pricingTiers.professional.monthlyCost);
  const [aiPerMinuteCost, setAiPerMinuteCost] = useState(pricingTiers.professional.perMinuteCost);
  const industryPresets = {
    plumbing: { avgLeadValue: 300, conversionRate: 13 }, hvac: { avgLeadValue: 450, conversionRate: 11 },
    electrician: { avgLeadValue: 350, conversionRate: 12 }, landscaping: { avgLeadValue: 120, conversionRate: 15 },
    cleaning: { avgLeadValue: 100, conversionRate: 18 }, roofing: { avgLeadValue: 500, conversionRate: 9 },
    painting: { avgLeadValue: 250, conversionRate: 14 }, carpentry: { avgLeadValue: 300, conversionRate: 13 },
    flooring: { avgLeadValue: 400, conversionRate: 12 }, pest_control: { avgLeadValue: 150, conversionRate: 16 },
    other: { avgLeadValue: 250, conversionRate: 12 }
  };
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
  useEffect(() => {
    const hasErrors = Object.values(inputErrors).some(error => error);
    setValidationError(hasErrors);
  }, [inputErrors]);

  useEffect(() => {
    if (pricingTiers[selectedTier]) {
      setAiSetupFee(pricingTiers[selectedTier].setupFee);
      setAiSubscriptionCost(pricingTiers[selectedTier].monthlyCost);
      setAiPerMinuteCost(pricingTiers[selectedTier].perMinuteCost);
    }
  }, [selectedTier]);

  // --- Calculation Logic ---
  useEffect(() => {
    try {
      const weeklyWageCost = humanHourlyWage * humanHoursPerWeek;
      const yearlyWageCost = weeklyWageCost * 52;
      const monthlyWageCost = yearlyWageCost / 12;
      const calculatedHumanMonthlyCost = monthlyWageCost * (1 + humanOverheadPercentage / 100);

      const daysPerMonth = daysOpen === "weekdays" ? 22 : daysOpen === "sixdays" ? 26 : 30;
      const totalMonthlyCalls = (businessHourCalls * daysPerMonth) + (afterHourCalls * 30);
      const monthlyMissedBusinessHourCalls = missedBusinessHourCalls * daysPerMonth;
      const monthlyAfterHourCalls = afterHourCalls * 30;
      const totalMissedCalls = monthlyMissedBusinessHourCalls + monthlyAfterHourCalls;
      const totalMinutes = totalMonthlyCalls * avgCallDuration;

      const salesMissedCalls = totalMissedCalls * (salesCallPercentage / 100);
      const valuePerCall = avgLeadValue * (conversionRate / 100);
      const potentialRevenueFromMissedCalls = salesMissedCalls * valuePerCall;

      const aiBaseCost = aiSubscriptionCost;
      const aiUsageCost = totalMinutes * aiPerMinuteCost;
      const aiTotalMonthlyCost = aiBaseCost + aiUsageCost;

      const aiSetupFeeMonthly = aiSetupFee / 12;
      const aiTotalCostWithSetup = aiTotalMonthlyCost + aiSetupFeeMonthly;

      const costSavings = calculatedHumanMonthlyCost - aiTotalCostWithSetup;
      const totalBenefit = costSavings + potentialRevenueFromMissedCalls;
      const roi = aiTotalCostWithSetup > 0 ? (totalBenefit / aiTotalCostWithSetup) * 100 : 0;

      const paybackPeriodMonths = totalBenefit > 0 ? (aiSetupFee / totalBenefit) : 0;

      const yearlyCostSavings = (calculatedHumanMonthlyCost - aiTotalMonthlyCost) * 12;
      const yearlyPotentialRevenue = potentialRevenueFromMissedCalls * 12;
      const yearlyNetBenefit = yearlyCostSavings + yearlyPotentialRevenue;

      const annualOperationalGain = (calculatedHumanMonthlyCost - aiTotalMonthlyCost + potentialRevenueFromMissedCalls) * 12;
      const firstYearNetReturn_clearer = annualOperationalGain - aiSetupFee;

      const totalInvestmentFirstYear = (aiTotalMonthlyCost * 12) + aiSetupFee;
      const calculatedFirstYearRevenueVsAiCost = yearlyPotentialRevenue - totalInvestmentFirstYear;

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
    businessHourCalls, afterHourCalls, missedBusinessHourCalls, avgCallDuration,
    avgLeadValue, conversionRate, salesCallPercentage, daysOpen,
    aiSubscriptionCost, aiPerMinuteCost, aiSetupFee,
    humanHourlyWage, humanHoursPerWeek, humanOverheadPercentage
  ]);

  // --- Handlers & Helpers ---
  const handleIndustryChange = (e) => {
    const selectedIndustry = e.target.value;
    setIndustry(selectedIndustry);
    const preset = industryPresets[selectedIndustry] || industryPresets.other;
    setAvgLeadValue(preset.avgLeadValue);
    setConversionRate(preset.conversionRate);
  };

  const handleNumberInputChange = (setter, errorKey, value, min = 0, max = Infinity) => {
    const numValue = Number(value);
    if (isNaN(numValue) || numValue < min || numValue > max) {
      setInputErrors(prevErrors => ({ ...prevErrors, [errorKey]: true }));
      setter(value); // Keep the invalid value in the input
    } else {
      setInputErrors(prevErrors => ({ ...prevErrors, [errorKey]: false }));
      setter(numValue);
    }
  };

  const formatPaybackPeriod = (periodInMonths) => {
      if (periodInMonths === 0) {
          return "Immediate";
      }
      if (periodInMonths === Infinity) {
          return "Never";
      }
      const years = Math.floor(periodInMonths / 12);
      const months = Math.floor(periodInMonths % 12);

      let result = "";
      if (years > 0) {
          result += `${years} year${years > 1 ? 's' : ''}`;
      }
      if (months > 0) {
          result += (result ? " " : "") + `${months} month${months > 1 ? 's' : ''}`;
      }
      return result || "Less than 1 month";
  };

  const handlePrint = () => { window.print(); };

  // --- JSX Rendering ---
  return (
    <>
      <PrintStyles />
      <div id="printable-area" className="p-4 max-w-6xl mx-auto font-sans print-p-0">
        <Card className="w-full print-shadow-none print-border-none">
          <CardHeader className="bg-black text-white rounded-t-lg">
            <CardTitle className="text-center text-2xl">AI Receptionist ROI Calculator</CardTitle>
             <p className="text-center text-sm text-gray-300 mt-1">Compare AI vs. Human Receptionist Costs & Benefits</p>
          </CardHeader>

          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print-grid-cols-1">

              {/* Left Column: Inputs */}
              <div className="space-y-8">
                 {/* Business Profile Card */}
                 <Card className="border border-gray-200 print-shadow-none print-border-none">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold mb-3 text-gray-700">Business Profile & Call Volume</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label htmlFor="industry" className="block text-sm font-medium mb-1 text-gray-600">Industry</label>
                        <select id="industry" value={industry} onChange={handleIndustryChange} className="w-full p-2 border border-gray-300 rounded focus:ring-[#8cc63f] focus:border-[#8cc63f] transition duration-150">
                          {Object.keys(industryPresets).map(key => (
                            <option key={key} value={key}>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Select industry for typical Lead Value & Conversion Rate presets.</p>
                      </div>
                      <div>
                        <label htmlFor="daysOpen" className="block text-sm font-medium mb-1 text-gray-600">Business Operating Days</label>
                        <select id="daysOpen" value={daysOpen} onChange={(e) => setDaysOpen(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:ring-[#8cc63f] focus:border-[#8cc63f] transition duration-150">
                          <option value="weekdays">Monday-Friday (5 days/week)</option>
                          <option value="sixdays">Monday-Saturday (6 days/week)</option>
                          <option value="alldays">All Days (7 days/week)</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="businessHourCalls" className="block text-sm font-medium mb-1 text-gray-600">Avg. Daily Calls (Business Hours)</label>
                        <input id="businessHourCalls" type="number" min="0" value={businessHourCalls} onChange={(e) => handleNumberInputChange(setBusinessHourCalls, 'businessHourCalls', e.target.value)} className={`w-full p-2 border rounded transition duration-150 ${inputErrors.businessHourCalls ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[#8cc63f] focus:border-[#8cc63f]'}`}/>
                        {inputErrors.businessHourCalls && (<p className="text-red-500 text-xs mt-1">Please enter a valid positive number.</p>)}
                      </div>
                      <div>
                        <label htmlFor="afterHourCalls" className="block text-sm font-medium mb-1 text-gray-600">Avg. Daily Calls (After Hours)</label>
                        <input id="afterHourCalls" type="number" min="0" value={afterHourCalls} onChange={(e) => handleNumberInputChange(setAfterHourCalls, 'afterHourCalls', e.target.value)} className={`w-full p-2 border rounded transition duration-150 ${inputErrors.afterHourCalls ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[#8cc63f] focus:border-[#8cc63f]'}`}/>
                        {inputErrors.afterHourCalls && (<p className="text-red-500 text-xs mt-1">Please enter a valid positive number.</p>)}
                      </div>
                      <div>
                        <label htmlFor="missedBusinessHourCalls" className="block text-sm font-medium mb-1 text-gray-600">Avg. Daily Missed Calls (Business Hours)</label>
                        <input id="missedBusinessHourCalls" type="number" min="0" value={missedBusinessHourCalls} onChange={(e) => handleNumberInputChange(setMissedBusinessHourCalls, 'missedBusinessHourCalls', e.target.value)} className={`w-full p-2 border rounded transition duration-150 ${inputErrors.missedBusinessHourCalls ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[#8cc63f] focus:border-[#8cc63f]'}`}/>
                        {inputErrors.missedBusinessHourCalls && (<p className="text-red-500 text-xs mt-1">Please enter a valid positive number.</p>)}
                      </div>
                      <div>
                        <label htmlFor="avgCallDuration" className="block text-sm font-medium mb-1 text-gray-600">Average Call Duration (minutes)</label>
                        <input id="avgCallDuration" type="number" min="0" step="0.5" value={avgCallDuration} onChange={(e) => handleNumberInputChange(setAvgCallDuration, 'avgCallDuration', e.target.value)} className={`w-full p-2 border rounded transition duration-150 ${inputErrors.avgCallDuration ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[#8cc63f] focus:border-[#8cc63f]'}`}/>
                        {inputErrors.avgCallDuration && (<p className="text-red-500 text-xs mt-1">Please enter a valid positive number.</p>)}
                      </div>
                    </CardContent>
                  </Card>
                 {/* AI Pricing Tier Card */}
                 <Card className="border border-gray-200 print-shadow-none print-border-none">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold mb-3 text-gray-700">Select AI Pricing Tier</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {Object.entries(pricingTiers).map(([key, tier]) => (
                          <div key={key} className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-105 ${
                              selectedTier === key
                                ? 'border-[#8cc63f] bg-[#eaf6da] shadow-lg ring-2 ring-[#8cc63f] ring-opacity-50'
                                : 'border-gray-300 hover:border-[#8cc63f] hover:bg-gray-50'
                            } ${key === 'professional' ? 'relative' : ''}`}
                            onClick={() => setSelectedTier(key)}
                          >
                            {key === 'professional' && (
                              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 no-print">
                                <span className="bg-[#8cc63f] text-white text-xs font-bold px-3 py-1 rounded-full shadow">RECOMMENDED</span>
                              </div>
                            )}
                            <div className={`text-center mb-2 ${key === 'professional' ? 'mt-3' : ''}`}>
                              <div className="text-md font-bold text-[#5a8228]">{tier.name}</div>
                              <div className="text-xs text-gray-500">{tier.description}</div>
                            </div>
                            <div className="space-y-1.5 mt-3 text-sm">
                              <div className="flex justify-between"><span>Setup:</span><span className="font-medium">${tier.setupFee.toLocaleString()}</span></div>
                              <div className="flex justify-between"><span>Monthly:</span><span className="font-medium">${tier.monthlyCost.toLocaleString()}</span></div>
                              <div className="flex justify-between"><span>Per Minute:</span><span className="font-medium">${tier.perMinuteCost.toFixed(2)}</span></div>
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
                      <div>
                        <label htmlFor="salesCallPercentage" className="block text-sm font-medium mb-1 text-gray-600">Sales Opportunity Calls (%)</label>
                        <input id="salesCallPercentage" type="number" min="0" max="100" value={salesCallPercentage} onChange={(e) => handleNumberInputChange(setSalesCallPercentage, 'salesCallPercentage', e.target.value, 0, 100)} className={`w-full p-2 border rounded transition duration-150 ${inputErrors.salesCallPercentage ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[#8cc63f] focus:border-[#8cc63f]'}`}/>
                        {inputErrors.salesCallPercentage && (<p className="text-red-500 text-xs mt-1">Please enter a value between 0 and 100.</p>)}
                      </div>
                      <div>
                        <label htmlFor="avgLeadValue" className="block text-sm font-medium mb-1 text-gray-600">Average Value per Customer ($)</label>
                        <input id="avgLeadValue" type="number" min="0" value={avgLeadValue} onChange={(e) => handleNumberInputChange(setAvgLeadValue, 'avgLeadValue', e.target.value)} className={`w-full p-2 border rounded transition duration-150 ${inputErrors.avgLeadValue ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[#8cc63f] focus:border-[#8cc63f]'}`}/>
                        <p className="text-xs text-gray-500 mt-1">Include initial sale value + potential upsells/repeat business.</p>
                        {inputErrors.avgLeadValue && (<p className="text-red-500 text-xs mt-1">Please enter a valid positive number.</p>)}
                      </div>
                      <div>
                        <label htmlFor="conversionRate" className="block text-sm font-medium mb-1 text-gray-600">Lead-to-Customer Conversion Rate (%)</label>
                        <input id="conversionRate" type="number" min="0" max="100" value={conversionRate} onChange={(e) => handleNumberInputChange(setConversionRate, 'conversionRate', e.target.value, 0, 100)} className={`w-full p-2 border rounded transition duration-150 ${inputErrors.conversionRate ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[#8cc63f] focus:border-[#8cc63f]'}`}/>
                        {inputErrors.conversionRate && (<p className="text-red-500 text-xs mt-1">Please enter a value between 0 and 100.</p>)}
                      </div>
                      <div className="pt-4 mt-4 border-t">
                        <h4 className="text-md font-semibold mb-2 text-gray-600">Current Human Receptionist Details</h4>
                        <div>
                          <label htmlFor="humanHourlyWage" className="block text-sm font-medium mb-1 text-gray-600">Average Hourly Wage ($)</label>
                          <input id="humanHourlyWage" type="number" min="0" step="0.01" value={humanHourlyWage} onChange={(e) => handleNumberInputChange(setHumanHourlyWage, 'humanHourlyWage', e.target.value)} className={`w-full p-2 border rounded transition duration-150 ${inputErrors.humanHourlyWage ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[#8cc63f] focus:border-[#8cc63f]'}`}/>
                          {inputErrors.humanHourlyWage && (<p className="text-red-500 text-xs mt-1">Please enter a valid positive number.</p>)}
                        </div>
                        <div className="mt-4">
                          <label htmlFor="humanHoursPerWeek" className="block text-sm font-medium mb-1 text-gray-600">Average Hours Worked per Week</label>
                          <input id="humanHoursPerWeek" type="number" min="0" value={humanHoursPerWeek} onChange={(e) => handleNumberInputChange(setHumanHoursPerWeek, 'humanHoursPerWeek', e.target.value)} className={`w-full p-2 border rounded transition duration-150 ${inputErrors.humanHoursPerWeek ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[#8cc63f] focus:border-[#8cc63f]'}`}/>
                          {inputErrors.humanHoursPerWeek && (<p className="text-red-500 text-xs mt-1">Please enter a valid positive number.</p>)}
                        </div>
                        <div className="mt-4">
                          <label htmlFor="humanOverheadPercentage" className="block text-sm font-medium mb-1 text-gray-600"> Estimated Overhead (%) </label>
                          <input id="humanOverheadPercentage" type="number" min="0" max="200" value={humanOverheadPercentage} onChange={(e) => handleNumberInputChange(setHumanOverheadPercentage, 'humanOverheadPercentage', e.target.value, 0, 200)} className={`w-full p-2 border rounded transition duration-150 ${inputErrors.humanOverheadPercentage ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[#8cc63f] focus:border-[#8cc63f]'}`}/>
                          <p className="text-xs text-gray-500 mt-1">Include benefits, taxes, software, office space, etc.</p>
                          {inputErrors.humanOverheadPercentage && (<p className="text-red-500 text-xs mt-1">Please enter a valid percentage (e.g., 0-200).</p>)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                 {/* Calculate Button */}
                 <div className="mt-6 no-print">
                    <button
                      onClick={() => {
                        if (!validationError) {
                          const resultsSection = document.getElementById('results-section');
                          if (resultsSection) {
                            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }
                      }}
                      disabled={validationError}
                      className={`w-full font-bold py-3 px-4 rounded transition duration-200 ease-in-out text-white shadow-md hover:shadow-lg ${
                        validationError
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 cursor-pointer'
                      }`}
                    >
                      {validationError ? 'Please Fix Errors Above' : 'Calculate ROI & View Results'}
                    </button>
                    <p className="text-xs text-center text-gray-500 mt-2">
                      {validationError ? 'Correct the highlighted fields to enable calculation.' : 'Click to see your potential savings and revenue gains.'}
                    </p>
                  </div>
              </div> {/* End Left Column */}


              {/* Right Column: Results */}
              <div id="results-section" className="space-y-6">
                {/* ... Results Cards ... */}
                <Card className="border border-gray-200 print-shadow-none print-border-none">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-700">Monthly Call Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="bg-gray-50 p-4 rounded-b-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Total Calls Handled (Est.):</span>
                      <span className="font-medium text-gray-900">{safeLocaleString(results.totalCalls, { maximumFractionDigits: 0 }, '0')}</span>
                    </div>
                    <p className="text-xs text-gray-500 -mt-2 mb-2 pl-1"> (Business + After Hours)</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Currently Missed Calls (Est.):</span>
                      <span className="font-medium text-red-600">{safeLocaleString(results.missedCalls, { maximumFractionDigits: 0 }, '0')}</span>
                    </div>
                    <p className="text-xs text-gray-500 -mt-2 mb-2 pl-1"> (Missed Business Hours + All After Hours)</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Missed Sales Opportunities (Est.):</span>
                      <span className="font-medium text-red-700">{safeLocaleString(results.salesMissedCalls, { maximumFractionDigits: 0 }, '0')}</span>
                    </div>
                    <p className="text-xs text-gray-500 -mt-2 pl-1"> (Missed Calls × Sales %)</p>
                  </CardContent>
                </Card>
                <Card className="border border-gray-200 print-shadow-none print-border-none">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-700">AI Receptionist Cost ({pricingTiers[selectedTier]?.name} Tier)</CardTitle>
                  </CardHeader>
                  <CardContent className="bg-gray-50 p-4 rounded-b-lg space-y-3">
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
                    <div className="flex justify-between items-center border-t pt-2 mt-2">
                      <span className="text-sm font-semibold text-gray-800">Total Monthly Recurring Cost:</span>
                      <span className="font-semibold text-[#5a8228]">${safeLocaleString(results.aiTotalMonthlyCost, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
                <Card className="border border-[#8cc63f]/50 bg-[#eaf6da] print-shadow-none print-border-none">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-[#5a8228]">Monthly Financial Impact (AI vs. Human)</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#5a8228]">Direct Cost Savings (vs. Human):</span>
                      <span className={`font-medium ${results.costSavings >= 0 ? 'text-green-700' : 'text-red-600'}`}> ${safeLocaleString(results.costSavings, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </span>
                    </div>
                    <p className="text-xs text-gray-600 -mt-2 mb-2 pl-1"> (Calculated Human Cost - Effective Monthly AI Cost)</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#5a8228]">Potential Added Revenue:</span>
                      <span className="font-medium text-green-700"> + ${safeLocaleString(results.potentialRevenue, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </span>
                    </div>
                    <p className="text-xs text-gray-500 -mt-2 mb-2 pl-1"> (From capturing missed sales calls)</p>
                    <div className="flex justify-between items-center border-t border-[#8cc63f]/30 pt-2 mt-2">
                      <span className="text-sm font-semibold text-[#5a8228]">Total Monthly Benefit:</span>
                      <span className={`font-semibold text-xl ${results.netBenefit >= 0 ? 'text-green-600' : 'text-red-600'}`}> ${safeLocaleString(results.netBenefit, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </span>
                    </div>
                    <p className="text-xs text-gray-600 -mt-2 pl-1"> (Cost Savings + Added Revenue)</p>
                  </CardContent>
                </Card>
                <Card className="border border-green-300 bg-green-50 print-shadow-none print-border-none">
                  <CardHeader className="text-center">
                    <CardTitle className="text-lg font-semibold text-green-800">Potential Return on Investment (ROI)</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 text-center space-y-4">
                    <div>
                      <div className="text-4xl font-bold text-green-700"> {safeLocaleString(results.roi, { maximumFractionDigits: 0 }, 'N/A')}% </div>
                      <div className="text-sm text-gray-600">Monthly ROI</div>
                      <p className="text-xs text-gray-500 mt-1"> (Total Benefit / Effective Monthly AI Cost)</p>
                    </div>
                    <div>
                      <div className="text-md font-semibold text-gray-700">Payback Period</div>
                      <div className="text-2xl font-bold text-[#5a8228] mt-1"> {formatPaybackPeriod(results.paybackPeriod)} </div>
                      <p className="text-xs text-gray-500 mt-1"> (Time to recoup initial setup fee via Net Benefit)</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border border-gray-200 print-shadow-none print-border-none">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-700 mb-1">Monthly Cost & Benefit Comparison</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div style={{ width: '100%', height: 280 }}>
                      <ResponsiveContainer>
                        <BarChart
                          data={[
                            { name: 'Monthly', 'Human Cost (Calculated)': results.humanCost, 'AI Cost (Effective)': results.aiTotalCostWithSetup, 'Net Benefit': results.netBenefit > 0 ? results.netBenefit : 0 }
                          ]}
                          margin={{ top: 5, right: 5, left: 15, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                          <YAxis tickFormatter={(value) => `$${safeLocaleString(value)}`} tick={{ fontSize: 10 }} />
                          <Tooltip
                            formatter={(value, name) => [`$${safeLocaleString(value, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, name]}
                            labelFormatter={() => 'Monthly Comparison'}
                            cursor={{ fill: 'rgba(230, 230, 230, 0.3)' }}
                            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                          />
                          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: '10px' }} />
                          <Bar dataKey="Human Cost (Calculated)" fill="#F87171" name="Human Cost (Calculated)" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="AI Cost (Effective)" fill="#8cc63f" name="AI Cost (Incl. Setup/12)" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Net Benefit" fill="#5a8228" name="Net Monthly Benefit" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

              </div> {/* End Right Column */}

            </div> {/* End Grid */}


            {/* --- Key Insights Section (Moved Below Grid) --- */}
            <div className="mt-8">
                <Card className="border border-indigo-200 bg-indigo-50 print-shadow-none print-border-none">
                   <CardHeader> <CardTitle className="text-lg font-semibold text-indigo-800">Key Insights & Annual Projections</CardTitle> </CardHeader>
                   <CardContent className="p-4 space-y-4 text-sm">

                     {/* ADDED: Potential Annual Added Revenue Display */}
                     {results.yearlyPotentialRevenue > 0 && (
                       <div className="bg-white p-3 rounded shadow-sm border border-gray-200">
                           <p className="font-medium text-gray-800 mb-1">
                             Potential Annual Added Revenue:
                             {/* Added clarification text */}
                             <span className="text-xs text-gray-500 font-normal ml-1">(First Year)</span>
                           </p>
                           <p className={`text-xl font-semibold text-green-600`}>
                               ${safeLocaleString(results.yearlyPotentialRevenue, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                           </p>
                           <p className="text-xs text-gray-500 mt-1">(Est. Revenue from Captured Missed Calls x 12)</p>
                       </div>
                     )}

                     {/* ADDED: Potential Annual Benefit Display */}
                      <div className="bg-white p-3 rounded shadow-sm border border-gray-200">
                         <p className="font-medium text-gray-800 mb-1">Potential Annual Benefit:</p>
                          <p className={`text-xl font-semibold ${results.yearlyNetBenefit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${safeLocaleString(results.yearlyNetBenefit, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">(Annual Recurring Cost Savings + Annual Added Revenue)</p>
                     </div>

                     {/* --- DYNAMIC INSIGHTS LIST --- */}
                     <ul className="list-disc pl-5 space-y-2 text-gray-700">
                         <li> Overall, the AI solution projects a net monthly <span className={`font-semibold ${results.netBenefit >= 0 ? 'text-green-600' : 'text-red-600'}`}> {results.netBenefit >= 0 ? ' gain ' : ' loss '} of ${safeLocaleString(Math.abs(results.netBenefit), { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </span> , combining cost savings and added revenue. </li>
                         {(results.paybackPeriod > 0 && isFinite(results.paybackPeriod)) && ( <li> The initial investment (setup fee of ${safeLocaleString(results.aiSetupFee, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}) is estimated to be paid back within <span className="font-semibold text-[#5a8228]"> {formatPaybackPeriod(results.paybackPeriod)}</span> through the net monthly benefits {results.paybackPeriod <= 12 && " (indicating a quick return)"}. </li> )}
                         {(results.paybackPeriod <= 0 || !isFinite(results.paybackPeriod)) && results.netBenefit <= 0 && ( <li> Based on the current inputs, the initial investment is not projected to be paid back via net benefits. </li> )}
                         {(results.paybackPeriod <= 0) && results.netBenefit > 0 && isFinite(results.paybackPeriod) && ( <li> With a positive net benefit and zero or negligible setup fee, the return is effectively immediate. </li> )}
                         {results.potentialRevenue > 0 && ( <li> Capturing currently missed calls is estimated to add <span className="font-semibold text-green-600"> ${safeLocaleString(results.potentialRevenue, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> in potential revenue each month. </li> )}
                         {results.costSavings !== 0 && ( <li> Compared to the calculated human cost, the AI shows potential monthly <span className={`font-semibold ${results.costSavings >= 0 ? 'text-green-600' : 'text-red-600'}`}> {results.costSavings >= 0 ? ' savings ' : ' increased cost '} of ${safeLocaleString(Math.abs(results.costSavings), { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </span> (after factoring in the amortized setup fee). </li> )}
                         {/* First Year Net Return Insight Removed */}
                         {isFinite(results.roi) && !isNaN(results.roi) && results.roi !== 0 && ( <li> This translates to a potential monthly ROI of <span className={`font-semibold ${results.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}> {safeLocaleString(results.roi, { maximumFractionDigits: 0 }, 'N/A')}% </span> , comparing the total monthly benefit to the effective AI cost (including amortized setup). </li> )}
                         {/* ADDED: Insight comparing Annual Added Revenue vs Total First Year AI Cost */}
                         <li> Comparing only the potential annual added revenue against the total first-year AI cost (including setup) results in a net <span className={`font-semibold ${results.firstYearRevenueVsAiCost >= 0 ? 'text-green-600' : 'text-red-600'}`}>{results.firstYearRevenueVsAiCost >=0 ? 'gain' : 'loss'} of ${safeLocaleString(Math.abs(results.firstYearRevenueVsAiCost), {minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> (this excludes savings from replacing staff).</li>
                     </ul>
                   </CardContent>
                </Card>
            </div> {/* End Key Insights Section Wrapper */}

            {/* Qualitative Benefits Section */}
            <div className="mt-8">
                <Card className="border border-purple-200 bg-purple-50 print-shadow-none print-border-none">
                    <CardHeader> <CardTitle className="text-lg font-semibold text-purple-800">Additional Potential Benefits (Qualitative)</CardTitle> </CardHeader>
                    <CardContent className="p-4 text-sm text-gray-700">
                        <p className="mb-3">Beyond the quantifiable metrics above, consider how an AI receptionist addresses common operational challenges:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li> <span className="font-medium">Never Miss a Call:</span> Unlike human staff needing breaks, vacations, or sick days, the AI operates 24/7/365, ensuring every incoming call during or after hours is answered promptly, maximizing lead capture and customer support availability. </li>
                            <li> <span className="font-medium">Eliminate Hold Times:</span> Avoid frustrating callers with long waits or voicemail when staff are busy. The AI answers instantly, improving the customer experience and reducing hang-ups from impatient leads. </li>
                            <li> <span className="font-medium">Guarantee Service Consistency:</span> Eliminate variations in service quality or accuracy due to human factors. The AI delivers standardized, error-free information and follows processes exactly the same way for every call. </li>
                            <li> <span className="font-medium">Handle Peak Times Effortlessly:</span> Manage sudden increases in call volume without overwhelming staff or dropping calls. The AI scales instantly to meet demand, ensuring smooth operations during busy periods or marketing campaigns. </li>
                            <li> <span className="font-medium">Free Up Your Team:</span> Offload repetitive call handling from your skilled staff. The AI manages routine inquiries, allowing your team to focus on complex issues, sales follow-ups, and higher-value customer interactions, boosting productivity. </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {/* Print Button Section */}
            <div className="mt-8 text-center no-print">
              <button onClick={handlePrint} className="bg-[#8cc63f] hover:bg-[#7ab430] text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out shadow hover:shadow-md"> Print Results </button>
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