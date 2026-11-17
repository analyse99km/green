'use client';

import React, { useState } from 'react';
import { useGame } from '../GameContext';
import { Landmark, ArrowUpRight, ArrowDownLeft, AlertOctagon, TrendingUp, Clock, DollarSign } from 'lucide-react';

export default function TornBankView() {
  const { player, depositToBank, withdrawFromBank, createFixedDeposit, takeLoan, repayLoan, cashCompliance } = useGame();
  
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [fdAmount, setFdAmount] = useState('25000');
  const [fdDuration, setFdDuration] = useState<7 | 14 | 30>(14);
  const [loanAmount, setLoanAmount] = useState('50000');
  const [message, setMessage] = useState<string | null>(null);

  const handleDeposit = () => {
    const val = parseInt(depositAmount, 10);
    if (!val) return;
    const res = depositToBank(val);
    setMessage(res.message);
    setDepositAmount('');
  };

  const handleWithdraw = () => {
    const val = parseInt(withdrawAmount, 10);
    if (!val) return;
    const res = withdrawFromBank(val);
    setMessage(res.message);
    setWithdrawAmount('');
  };

  const handleCreateFD = () => {
    const val = parseInt(fdAmount, 10);
    if (!val) return;
    const res = createFixedDeposit(val, fdDuration);
    setMessage(res.message);
  };

  const handleTakeLoan = () => {
    const val = parseInt(loanAmount, 10);
    if (!val) return;
    const res = takeLoan(val);
    setMessage(res.message);
  };

  return (
    <div className="space-y-6">
      {/* City Bank Header */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-indigo-950/40 border border-neutral-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏛️</span>
              <h2 className="text-xl font-bold text-white">Metropolis Reserve Bank & Trust</h2>
            </div>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              Secure funds inside reinforced titanium vaults, lock capital into high-yield Fixed Deposits, or secure commercial venture loans.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-neutral-950 px-5 py-3 rounded-xl border border-neutral-800 font-mono text-xs">
            <div>
              <span className="text-[10px] text-neutral-500 block">Bank Vault Reserves</span>
              <span className="text-white font-bold text-base">🌿 {player.bankMoney.toLocaleString()} GREEN</span>
            </div>
            <div className="h-6 w-px bg-neutral-800 mx-1" />
            <div>
              <span className="text-[10px] text-neutral-500 block">Pocket GREEN</span>
              <span className="text-emerald-400 font-bold text-base">🌿 {player.money.toLocaleString()} GREEN</span>
            </div>
          </div>
        </div>

        {/* 20% Cash Rule Explainer: SHOWN ONLY IN BANK AS REQUESTED */}
        <div className="mt-4 p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-start gap-3 text-xs">
          <AlertOctagon className={`w-4 h-4 shrink-0 mt-0.5 ${cashCompliance.isCompliant ? 'text-emerald-400' : 'text-amber-400'}`} />
          <div className="text-neutral-300 leading-relaxed">
            <span className="font-bold text-white">Municipal Banking Regulation (20% Cash Ratio): </span>
            To keep city commerce liquid, citizens are advised to maintain at least 20% of their net liquid wealth in pocket cash (🌿 {cashCompliance.minRequiredInHand.toLocaleString()} GREEN minimum recommended).
            {!cashCompliance.isCompliant && (
              <span className="text-amber-400 font-semibold ml-1 block mt-1">
                Notice: You are currently carrying {cashCompliance.handPercentage}% in hand. Depositing further will trigger bank hoarding notifications.
              </span>
            )}
          </div>
        </div>

        {message && (
          <div className="mt-3 text-xs font-semibold px-3 py-1.5 rounded-lg bg-neutral-800 text-emerald-400">
            {message}
          </div>
        )}
      </div>

      {/* Deposit & Withdraw Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Deposit */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">Deposit GREEN into Bank Vault</h3>
          </div>
          <p className="text-xs text-neutral-400 mb-4">
            Available in Pocket: <strong className="text-emerald-400 font-mono">🌿 {player.money.toLocaleString()} GREEN</strong>
          </p>

          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Amount to deposit"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              onClick={handleDeposit}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Deposit
            </button>
          </div>
        </div>

        {/* Withdraw */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <ArrowUpRight className="w-4 h-4 text-blue-400" />
            <h3 className="font-bold text-white text-sm">Withdraw to Pocket GREEN</h3>
          </div>
          <p className="text-xs text-neutral-400 mb-4">
            Available in Bank: <strong className="text-neutral-200 font-mono">🌿 {player.bankMoney.toLocaleString()} GREEN</strong>
          </p>

          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Amount to withdraw"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={handleWithdraw}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Withdraw
            </button>
          </div>
        </div>
      </div>

      {/* Fixed Deposits (FDs) & Loans Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fixed Deposits */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <h3 className="font-bold text-white text-sm">High-Yield Fixed Deposits (FDs)</h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/20">
              Guaranteed Interest
            </span>
          </div>
          <p className="text-xs text-neutral-400 mb-4">
            Lock capital to compound returns. Protected against street muggers and market volatility.
          </p>

          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="number"
                value={fdAmount}
                onChange={(e) => setFdAmount(e.target.value)}
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none"
                placeholder="Principal Amount"
              />
              <select
                value={fdDuration}
                onChange={(e) => setFdDuration(Number(e.target.value) as any)}
                className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-300 font-mono"
              >
                <option value={7}>7 Days (5% Interest)</option>
                <option value={14}>14 Days (12% Interest)</option>
                <option value={30}>30 Days (25% Interest)</option>
              </select>
            </div>

            <button
              onClick={handleCreateFD}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow transition-all cursor-pointer"
            >
              Open Fixed Deposit
            </button>

            {/* Active FDs */}
            {player.fixedDeposits.length > 0 && (
              <div className="mt-4 pt-4 border-t border-neutral-800 space-y-2">
                <span className="text-xs font-bold text-neutral-400">Active Fixed Deposits:</span>
                {player.fixedDeposits.map((fd) => (
                  <div key={fd.id} className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex justify-between items-center text-xs font-mono">
                    <div>
                      <span className="text-white font-bold">🌿 {fd.principal.toLocaleString()} GREEN</span>
                      <span className="text-emerald-400 ml-2">(+{(fd.interestRate * 100)}% return)</span>
                    </div>
                    <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-purple-400" /> {fd.durationDays} Days Term
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bank Loans & Foreclosure */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Landmark className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-white text-sm">Commercial Credit & Bank Loans</h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/20">
              15% APR
            </span>
          </div>
          <p className="text-xs text-neutral-400 mb-4">
            Borrow operating funds for real estate or business deeds. <strong>Notice:</strong> Defaulting results in property foreclosure and public auction!
          </p>

          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none"
                placeholder="Loan Amount"
              />
              <button
                onClick={handleTakeLoan}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-neutral-950 font-bold text-xs rounded-xl shadow transition-all cursor-pointer"
              >
                Apply for Loan
              </button>
            </div>

            {/* Active Loans */}
            {player.loans.length > 0 && (
              <div className="mt-4 pt-4 border-t border-neutral-800 space-y-2">
                <span className="text-xs font-bold text-amber-400">Active Debt:</span>
                {player.loans.map((loan) => (
                  <div key={loan.id} className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex justify-between items-center text-xs font-mono">
                    <div>
                      <span className="text-rose-400 font-bold">🌿 {loan.amountDue.toLocaleString()} GREEN Due</span>
                      <span className="text-neutral-500 block text-[10px]">Principal: 🌿 {loan.principal.toLocaleString()} GREEN</span>
                    </div>
                    <button
                      onClick={() => repayLoan(loan.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                    >
                      Repay Debt
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
