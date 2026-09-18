import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Barcode,
  CheckCircle2,
  KeyRound,
  QrCode,
  RefreshCw,
  RotateCcw,
  ScanLine,
  ShieldCheck,
  Ticket,
  UserCheck,
  Usb
} from "lucide-react";

import { apiMessage, voucherRedemptionAPI } from "../services/api";
import type { Customer, CustomerVoucher, Voucher } from "../types";
import ErrorBanner from "../components/ErrorBanner";
import StatusBadge from "../components/StatusBadge";
import Loading from "../components/Loading";
import { formatDate, money } from "../lib/format";

type RedemptionStep = "SCAN" | "VERIFYING_QR" | "OTP_INPUT" | "REDEEMING" | "SUCCESS";

export const extractTokenString = (raw: unknown): string => {
  if (!raw) return "";
  if (typeof raw !== "string") {
    if (typeof raw === "object") {
      const obj = raw as Record<string, unknown>;
      const candidate =
        obj.token ||
        obj.qrToken ||
        obj.sessionToken ||
        obj.qrData ||
        obj.code ||
        obj.sessionId;
      if (candidate) return extractTokenString(candidate);
    }
    return String(raw).trim();
  }

  let str = raw.trim();

  // Strip non-printable / control characters (such as \r, \n, \t, null bytes \0, \x00-\x1F, \x7F)
  str = str.replace(/[\x00-\x1F\x7F]/g, "").trim();

  // Strip AIM symbology prefix (e.g. "]Q1", "]Q2", "]Q3", "]C1")
  if (str.startsWith("]") && str.length > 3) {
    str = str.slice(3).trim();
  }

  // Strip wrapping quotes
  str = str.replace(/^["']+|["']+$/g, "").trim();

  // Check if string is a JSON object
  if (str.startsWith("{") && str.endsWith("}")) {
    try {
      const parsed = JSON.parse(str) as Record<string, unknown>;
      const extracted =
        parsed.token ||
        parsed.qrToken ||
        parsed.sessionToken ||
        parsed.qrData ||
        parsed.code ||
        parsed.sessionId;
      if (extracted) return extractTokenString(extracted);
    } catch {
      // ignore JSON parse error
    }
  }

  // Check if string is a URL containing token or code query param
  if (str.includes("?")) {
    try {
      const url = new URL(str.startsWith("http") ? str : `http://localhost/${str}`);
      const param =
        url.searchParams.get("token") ||
        url.searchParams.get("qrToken") ||
        url.searchParams.get("sessionToken") ||
        url.searchParams.get("qrData") ||
        url.searchParams.get("code");
      if (param) return extractTokenString(param);
    } catch {
      // ignore URL parse error
    }
  }

  // Strip common prefixes like "REDEEM:", "TOKEN:", "QR:"
  if (str.includes(":")) {
    const parts = str.split(":");
    if (parts.length === 2 && ["REDEEM", "TOKEN", "QR"].includes(parts[0].toUpperCase())) {
      str = parts[1].trim();
    }
  }

  // If the token is a 64-character hex session token (ignoring case), normalize to lowercase
  if (/^[0-9a-fA-F]{64}$/.test(str)) {
    str = str.toLowerCase();
  }

  return str.trim();
};

export default function VoucherRedemption() {
  const [step, setStep] = useState<RedemptionStep>("SCAN");
  const [error, setError] = useState("");

  // Scanner & Manual input states
  const [scannerInput, setScannerInput] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [isScannerFocused, setIsScannerFocused] = useState(true);

  // Scanned / Verified data
  const [scannedQr, setScannedQr] = useState("");
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [customer, setCustomer] = useState<Pick<Customer, "id" | "name" | "phone"> | null>(null);
  const [customerVoucher, setCustomerVoucher] = useState<CustomerVoucher | null>(null);

  // OTP
  const [otp, setOtp] = useState("");
  const [redemptionTime, setRedemptionTime] = useState<string | null>(null);

  // References
  const scannerInputRef = useRef<HTMLInputElement>(null);
  const isProcessingRef = useRef(false);

  // Auto-focus scanner input when in SCAN step
  useEffect(() => {
    if (step === "SCAN") {
      const timer = setTimeout(() => {
        scannerInputRef.current?.focus();
        setIsScannerFocused(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Common Token Validation Function
  const validateQrToken = useCallback(
    async (rawDecoded: unknown) => {
      // Required console logging for exact token tracing
      console.log("USB SCANNED VALUE:\n", rawDecoded);

      const token = extractTokenString(rawDecoded);
      console.log("VALUE SENT TO BACKEND:\n", token);

      if (!token) {
        console.warn("[USB Scanner] Empty token extracted from scan");
        return;
      }

      if (isProcessingRef.current) {
        console.log("[USB Scanner] Validation already in progress, skipping duplicate scan");
        return;
      }
      isProcessingRef.current = true;

      // 1. Move to validating state immediately
      setStep("VERIFYING_QR");
      setScannedQr(token);
      setError("");

      // 2. Call authoritative backend validation API
      try {
        const result = await voucherRedemptionAPI.verifyQr(token);
        console.log("[USB Scanner] Backend verifyQr response:", result);

        if (result && result.valid === false) {
          setError(result.message || "Invalid or expired QR code presented.");
          setStep("SCAN");
          setScannerInput("");
          isProcessingRef.current = false;
          setTimeout(() => scannerInputRef.current?.focus(), 50);
          return;
        }

        if (result.sessionToken) {
          setScannedQr(result.sessionToken);
        }
        setVoucher(result.voucher || result.customerVoucher?.voucher || null);
        setCustomer(result.customer || result.customerVoucher?.customer || null);
        setCustomerVoucher(result.customerVoucher || null);
        setStep("OTP_INPUT");
        isProcessingRef.current = false;
      } catch (err: unknown) {
        console.error("[USB Scanner] QR Verification error:", err);
        let userMessage = "Failed to verify customer QR code. Please scan again.";

        if (axios.isAxiosError(err)) {
          const status = err.response?.status;
          const errData = err.response?.data as
            | {
                message?: string;
                errors?: { error?: string; expired?: boolean };
              }
            | undefined;
          const errorCode = errData?.errors?.error;
          const backendMsg = (errData?.message || "").toLowerCase();

          if (errorCode === "TOKEN_EXPIRED" || status === 410 || backendMsg.includes("expired")) {
            userMessage = "QR expired. Ask the customer to display the new QR.";
          } else if (
            errorCode === "VOUCHER_ALREADY_REDEEMED" ||
            status === 409 ||
            backendMsg.includes("already been redeemed") ||
            backendMsg.includes("already redeemed")
          ) {
            userMessage = "Voucher has already been redeemed.";
          } else if (
            errorCode === "SESSION_CANCELLED" ||
            backendMsg.includes("cancelled")
          ) {
            userMessage = "Redemption session has been cancelled. Please generate a new QR.";
          } else if (
            errorCode === "TOKEN_INVALID" ||
            status === 404 ||
            backendMsg.includes("invalid")
          ) {
            userMessage = "Invalid redemption token. Please ask the customer to display their active voucher QR.";
          } else if (errData?.message) {
            userMessage = errData.message;
          }
        }

        setError(userMessage);
        setStep("SCAN");
        setScannerInput("");
        isProcessingRef.current = false;
        setTimeout(() => scannerInputRef.current?.focus(), 50);
      }
    },
    []
  );

  // Handle USB Scanner keyboard/HID form submission or Enter key
  const handleScannerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = scannerInputRef.current?.value || scannerInput;
    if (!raw || !raw.trim()) return;
    void validateQrToken(raw);
  };

  const handleScannerKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const raw = e.currentTarget.value || scannerInputRef.current?.value || scannerInput;
      if (!raw || !raw.trim()) return;
      void validateQrToken(raw);
    }
  };

  const handleScannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setScannerInput(val);
    if (val.includes("\n") || val.includes("\r")) {
      const cleanVal = val.replace(/[\r\n]/g, "").trim();
      if (cleanVal) {
        void validateQrToken(cleanVal);
      }
    }
  };

  // Handle Fallback Manual Token submission
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    await validateQrToken(manualCode.trim());
  };

  // Step 2: Redeem with Customer OTP
  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError("Please enter the OTP provided by the customer.");
      return;
    }

    setStep("REDEEMING");
    setError("");

    try {
      const response = await voucherRedemptionAPI.redeem({
        customerVoucherId: customerVoucher?.id,
        qrData: scannedQr,
        otp: otp.trim()
      });

      if (response && response.success === false) {
        setError(response.message || "Invalid OTP or redemption failed.");
        setStep("OTP_INPUT");
        return;
      }

      setRedemptionTime(response.redeemedAt || new Date().toISOString());
      setStep("SUCCESS");
    } catch (err) {
      setError(apiMessage(err, "Redemption failed. Verify OTP with customer and try again."));
      setStep("OTP_INPUT");
    }
  };

  // Reset all state for next customer
  const resetAll = () => {
    isProcessingRef.current = false;
    setStep("SCAN");
    setError("");
    setScannerInput("");
    setManualCode("");
    setScannedQr("");
    setVoucher(null);
    setCustomer(null);
    setCustomerVoucher(null);
    setOtp("");
    setRedemptionTime(null);
    setTimeout(() => {
      scannerInputRef.current?.focus();
      setIsScannerFocused(true);
    }, 50);
  };

  const handleFocusScanner = () => {
    scannerInputRef.current?.focus();
    setIsScannerFocused(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent-gold">
            Counter / Rewards
          </p>
          <h1 className="page-title">Voucher Redemption</h1>
          <p className="mt-2 muted">
            Scan customer QR code using the USB scanner and verify the one-time password (OTP) to redeem.
          </p>
        </div>

        <div className="flex gap-2">
          <button type="button" onClick={resetAll} className="ghost-button">
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
      </div>

      <ErrorBanner message={error} />

      {/* Process Flow Progress Bar */}
      <div className="premium-card p-4">
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold">
          <div
            className={`rounded-input p-2.5 transition ${
              step === "SCAN" || step === "VERIFYING_QR"
                ? "border border-accent-gold bg-accent-gold/10 text-accent-gold"
                : "bg-background text-text-secondary"
            }`}
          >
            1. Scan Customer QR
          </div>
          <div
            className={`rounded-input p-2.5 transition ${
              step === "OTP_INPUT" || step === "REDEEMING"
                ? "border border-accent-gold bg-accent-gold/10 text-accent-gold"
                : "bg-background text-text-secondary"
            }`}
          >
            2. Customer OTP
          </div>
          <div
            className={`rounded-input p-2.5 transition ${
              step === "SUCCESS"
                ? "border border-accent-green bg-accent-green/10 text-accent-green"
                : "bg-background text-text-secondary"
            }`}
          >
            3. Verified & Redeemed
          </div>
        </div>
      </div>

      {/* Step 1: USB Barcode / QR Scanner */}
      {step === "SCAN" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Primary: USB Barcode/QR Scanner */}
          <div
            className={`premium-card p-6 flex flex-col justify-between cursor-text transition-all ${
              isScannerFocused ? "border-accent-gold/50 shadow-lg shadow-accent-gold/5" : ""
            }`}
            onClick={handleFocusScanner}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-accent-gold/30 bg-accent-gold/10 p-3 text-accent-gold">
                    <ScanLine size={24} />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-semibold">USB QR Scanner</h2>
                    <p className="text-xs text-text-secondary">
                      Point USB reader at customer QR code to scan
                    </p>
                  </div>
                </div>

                {/* Status: Ready to Scan */}
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium bg-accent-green/15 text-accent-green border border-accent-green/30">
                  <span className="h-2 w-2 rounded-full bg-accent-green animate-pulse" />
                  Ready to scan
                </span>
              </div>

              <div className="rounded-input border border-border bg-background p-5 mb-5 space-y-3">
                <div className="flex items-center justify-between text-xs text-text-secondary">
                  <span className="font-medium flex items-center gap-1.5 text-text-primary">
                    <Usb size={14} className="text-accent-gold" />
                    USB Scanner Input Field
                  </span>
                  <span
                    className={`font-mono text-[11px] ${
                      isScannerFocused ? "text-accent-green" : "text-accent-gold"
                    }`}
                  >
                    {isScannerFocused ? "● Scanner Active & Focused" : "○ Click to Focus"}
                  </span>
                </div>

                <form onSubmit={handleScannerSubmit} className="space-y-3">
                  <div className="relative">
                    <input
                      ref={scannerInputRef}
                      type="text"
                      autoFocus
                      autoComplete="off"
                      spellCheck={false}
                      placeholder="Waiting for USB scanner input..."
                      value={scannerInput}
                      onChange={(e) => setScannerInput(e.target.value)}
                      onKeyDown={handleScannerKeyDown}
                      onFocus={() => setIsScannerFocused(true)}
                      onBlur={() => setIsScannerFocused(false)}
                      className="premium-input font-mono text-base py-3.5 px-4 pr-12 w-full focus:ring-2 focus:ring-accent-gold/20"
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
                      <Barcode size={22} />
                    </div>
                  </div>

                  <p className="text-xs text-text-secondary">
                    The USB scanner automatically transmits the decoded QR token followed by an Enter keystroke.
                  </p>
                </form>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4">
              <span className="text-xs text-text-secondary">
                Using a physical USB barcode / QR scanner device
              </span>
              <button
                type="button"
                onClick={handleFocusScanner}
                className="text-xs font-medium text-accent-gold hover:underline flex items-center gap-1"
              >
                <ScanLine size={13} />
                Focus Scanner
              </button>
            </div>
          </div>

          {/* Fallback: Manual Token Entry */}
          <div className="premium-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-xl border border-border bg-surface p-3 text-text-secondary">
                  <QrCode size={24} />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold">Manual Token Entry</h2>
                  <p className="text-xs text-text-secondary">
                    Fallback option if USB scanner is not available
                  </p>
                </div>
              </div>

              <form onSubmit={(e) => void handleManualSubmit(e)} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-text-secondary mb-2">
                    QR Token String / Voucher Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 64-character token or voucher code"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    className="premium-input font-mono text-sm py-3"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!manualCode.trim()}
                  className="gold-button w-full py-3"
                >
                  <ShieldCheck size={16} />
                  Validate QR Token
                </button>
              </form>
            </div>

            <div className="rounded-input border border-border bg-background p-4 mt-6">
              <p className="font-mono text-xs uppercase text-accent-gold mb-1">Security Rule</p>
              <p className="text-xs text-text-secondary leading-relaxed">
                Voucher redemption requires customer QR verification followed by a one-time password (OTP) sent directly to the customer's registered device.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Verifying QR Loading State */}
      {step === "VERIFYING_QR" && (
        <div className="premium-card p-12 text-center">
          <Loading label="Validating voucher QR with server..." />
        </div>
      )}

      {/* Step 2: Verified Details & OTP Input */}
      {(step === "OTP_INPUT" || step === "REDEEMING") && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Customer & Voucher Details */}
          <div className="premium-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-accent-gold/20 bg-accent-gold/10 p-2.5 text-accent-gold">
                  <Ticket size={20} />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold">
                    {voucher?.name || "Member Voucher"}
                  </h2>
                  <p className="font-mono text-xs text-accent-gold">
                    {voucher?.code || "QR Verified"}
                  </p>
                </div>
              </div>
              <StatusBadge value={customerVoucher?.status || voucher?.status || "ACTIVE"} />
            </div>

            <p className="text-sm text-text-secondary">
              {voucher?.description || "Customer reward offer validated."}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-input bg-background p-3">
                <p className="text-[10px] uppercase text-text-secondary">Reward Value</p>
                <p className="mt-1 font-mono text-base font-semibold text-accent-gold">
                  {voucher?.type === "PERCENTAGE"
                    ? `${voucher.value ?? 0}% OFF`
                    : voucher?.value != null
                    ? money(voucher.value)
                    : "Perk"}
                </p>
              </div>

              <div className="rounded-input bg-background p-3">
                <p className="text-[10px] uppercase text-text-secondary">Valid Until</p>
                <p className="mt-1 text-xs text-text-secondary">
                  {formatDate(voucher?.expiresAt)}
                </p>
              </div>
            </div>

            {customer && (
              <div className="border-t border-border pt-4">
                <div className="flex items-center gap-2 mb-2 text-xs uppercase tracking-wider text-text-secondary font-semibold">
                  <UserCheck size={15} className="text-accent-gold" />
                  Verified Customer
                </div>
                <div className="rounded-input bg-background p-3">
                  <p className="font-medium text-sm text-text-primary">{customer.name}</p>
                  <p className="font-mono text-xs text-text-secondary mt-0.5">{customer.phone}</p>
                </div>
              </div>
            )}
          </div>

          {/* OTP Input Form */}
          <div className="premium-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-xl border border-accent-gold/20 bg-accent-gold/10 p-2.5 text-accent-gold">
                  <KeyRound size={20} />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold">Customer OTP</h2>
                  <p className="text-xs text-text-secondary">
                    Customer received a 6-digit OTP upon scanning their QR code.
                  </p>
                </div>
              </div>

              <form onSubmit={(e) => void handleRedeem(e)} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-text-secondary mb-2">
                    Enter OTP Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    autoFocus
                    required
                    placeholder="e.g. 492815"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    disabled={step === "REDEEMING"}
                    className="premium-input font-mono text-2xl tracking-[0.5em] text-center"
                  />
                  <p className="text-xs text-text-secondary mt-2 text-center">
                    Ask the customer for the verification code shown on their screen.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={otp.length < 4 || step === "REDEEMING"}
                  className="gold-button w-full"
                >
                  {step === "REDEEMING" ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Verifying & Redeeming…
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      Verify & Redeem Voucher
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="mt-6 flex justify-between border-t border-border pt-4">
              <button
                type="button"
                onClick={resetAll}
                disabled={step === "REDEEMING"}
                className="ghost-button"
              >
                Cancel & Rescan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Success Confirmation */}
      {step === "SUCCESS" && (
        <div className="premium-card p-10 text-center max-w-xl mx-auto space-y-5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-accent-green/30 bg-accent-green/10 text-accent-green">
            <CheckCircle2 size={36} />
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold">Voucher Redeemed Successfully!</h2>
            <p className="text-sm text-text-secondary mt-1">
              The redemption has been validated and recorded on the ledger.
            </p>
          </div>

          <div className="rounded-input border border-border bg-background p-4 text-left space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-text-secondary">Voucher</span>
              <span className="font-mono text-accent-gold">{voucher?.code || "—"}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-secondary">Customer</span>
              <span className="font-medium">{customer?.name || "Customer"}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-secondary">Redemption Time</span>
              <span className="font-mono text-text-secondary">{formatDate(redemptionTime)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={resetAll}
            className="gold-button w-full"
          >
            Redeem Another Voucher
          </button>
        </div>
      )}
    </div>
  );
}
