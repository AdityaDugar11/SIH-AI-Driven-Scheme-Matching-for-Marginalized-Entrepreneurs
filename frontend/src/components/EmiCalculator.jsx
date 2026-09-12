import { useState, useEffect } from 'react';
import { Calculator } from 'lucide-react';

export default function EmiCalculator({ initialLoanAmount = 500000, initialInterest = 8.5 }) {
  const [loanAmount, setLoanAmount] = useState(initialLoanAmount);
  const [interestRate, setInterestRate] = useState(initialInterest);
  const [tenureYears, setTenureYears] = useState(5);
  
  const [emi, setEmi] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);

  useEffect(() => {
    calculateEMI();
  }, [loanAmount, interestRate, tenureYears]);

  const calculateEMI = () => {
    const p = parseFloat(loanAmount);
    const r = parseFloat(interestRate) / 12 / 100;
    const n = parseFloat(tenureYears) * 12;

    if (p && r && n) {
      const emiAmount = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const totalAmount = emiAmount * n;
      const totalInterestAmount = totalAmount - p;

      setEmi(Math.round(emiAmount));
      setTotalPayment(Math.round(totalAmount));
      setTotalInterest(Math.round(totalInterestAmount));
    }
  };

  return (
    <div className="bg-white w-full">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-blue-50 p-2 rounded-lg">
          <Calculator className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">EMI Calculator</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Sliders */}
        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Loan Amount</label>
              <span className="text-sm font-bold text-primary">₹ {loanAmount.toLocaleString('en-IN')}</span>
            </div>
            <input 
              type="range" 
              min="10000" 
              max="5000000" 
              step="10000"
              value={loanAmount} 
              onChange={(e) => setLoanAmount(e.target.value)} 
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Interest Rate (p.a)</label>
              <span className="text-sm font-bold text-primary">{interestRate}%</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="20" 
              step="0.1"
              value={interestRate} 
              onChange={(e) => setInterestRate(e.target.value)} 
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Loan Tenure</label>
              <span className="text-sm font-bold text-primary">{tenureYears} Years</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="30" 
              step="1"
              value={tenureYears} 
              onChange={(e) => setTenureYears(e.target.value)} 
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
        </div>

        {/* Results */}
        <div className="bg-gray-50 rounded-xl p-6 flex flex-col justify-center border border-gray-100">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500 mb-1">Monthly EMI</p>
            <h3 className="text-3xl font-bold text-gray-900">₹ {emi.toLocaleString('en-IN')}</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm text-gray-500">Principal Amount</span>
              <span className="text-sm font-semibold text-gray-900">₹ {Number(loanAmount).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm text-gray-500">Total Interest</span>
              <span className="text-sm font-semibold text-gray-900">₹ {totalInterest.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium text-gray-900">Total Amount Payable</span>
              <span className="text-sm font-bold text-primary">₹ {totalPayment.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
