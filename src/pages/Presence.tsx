import {
  useEffect,
  useState
} from "react";

import {
  Check,
  Copy,
  Download,
  QrCode,
  RefreshCw,
  Search
} from "lucide-react";

import QRCode from "qrcode";

import api, {
  apiMessage
} from "../services/api";

import type {
  PresenceLog,
  QrToken
} from "../types";

import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import Loading from "../components/Loading";

import {
  formatDate
} from "../lib/format";

export default function Presence() {
  const [
    logs,
    setLogs
  ] = useState<PresenceLog[]>([]);

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    error,
    setError
  ] = useState("");

  const [
    result,
    setResult
  ] = useState("ALL");

  const [
    method,
    setMethod
  ] = useState("ALL");

  const [
    customer,
    setCustomer
  ] = useState("");

  const [
    qr,
    setQr
  ] = useState<QrToken | null>(
    null
  );

  const [
    qrImage,
    setQrImage
  ] = useState("");

  const [
    seconds,
    setSeconds
  ] = useState(0);

  const [
    busy,
    setBusy
  ] = useState(false);

  const [
    copied,
    setCopied
  ] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const response =
        await api.get(
          "/presence/logs?limit=100"
        );

      setLogs(
        response.data.data
          ?.logs ??
          response.data.data ??
          []
      );
    } catch (requestError) {
      setError(
        apiMessage(requestError)
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (!qr) {
      return;
    }

    const tick = () => {
      const remaining =
        Math.ceil(
          (new Date(
            qr.expiresAt
          ).getTime() -
            Date.now()) /
            1000
        );

      setSeconds(
        Math.max(
          0,
          remaining
        )
      );
    };

    tick();

    const interval =
      window.setInterval(
        tick,
        500
      );

    return () =>
      window.clearInterval(
        interval
      );
  }, [qr]);

  const generateQr =
    async () => {
      setBusy(true);
      setError("");

      try {
        const response =
          await api.post(
            "/presence/qr/generate",
            {}
          );

        const token =
          response.data.data ??
          response.data;

        setQr(token);

        const image =
          await QRCode.toDataURL(
            token.token,
            {
              width: 320,
              margin: 2,
              color: {
                dark: "#0B0B0F",
                light: "#F5F5F7"
              }
            }
          );

        setQrImage(image);
      } catch (requestError) {
        setError(
          apiMessage(requestError)
        );
      } finally {
        setBusy(false);
      }
    };

  const filtered =
    logs.filter((log) => {
      const resultMatches =
        result === "ALL" ||
        log.result === result;

      const methodMatches =
        method === "ALL" ||
        log.method === method;

      const customerMatches =
        !customer ||
        String(
          log.customerId
        ) === customer ||
        log.customer?.name
          ?.toLowerCase()
          .includes(
            customer.toLowerCase()
          );

      return (
        resultMatches &&
        methodMatches &&
        customerMatches
      );
    });

  const copyToken =
    async () => {
      if (!qr) {
        return;
      }

      await navigator.clipboard.writeText(
        qr.token
      );

      setCopied(true);

      window.setTimeout(
        () => setCopied(false),
        1200
      );
    };

  if (loading) {
    return (
      <Loading label="Loading presence logs" />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent-gold">
            Presence / Verification
          </p>

          <h1 className="page-title">
            Presence & QR Logs
          </h1>

          <p className="mt-2 muted">
            Monitor GPS + single-use
            QR verification events.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              void load()
            }
            className="ghost-button"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            type="button"
            onClick={() =>
              void generateQr()
            }
            disabled={busy}
            className="gold-button"
          >
            <QrCode size={16} />

            {busy
              ? "Generating…"
              : "Generate New QR"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-input border border-accent-red/30 bg-accent-red/10 p-3 text-sm text-accent-red">
          {error}
        </div>
      )}

      <div className="premium-card p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-3 text-text-secondary"
              size={16}
            />

            <input
              className="premium-input pl-9"
              placeholder="Customer name or ID"
              value={customer}
              onChange={(event) =>
                setCustomer(
                  event.target.value
                )
              }
            />
          </div>

          <select
            className="premium-input"
            value={method}
            onChange={(event) =>
              setMethod(
                event.target.value
              )
            }
          >
            <option value="ALL">
              All methods
            </option>
            <option value="GPS_QR">
              GPS + QR
            </option>
            <option value="COMBINED">
              Combined
            </option>
            <option value="QR">
              QR
            </option>
            <option value="LOCATION">
              Location
            </option>
          </select>

          <select
            className="premium-input"
            value={result}
            onChange={(event) =>
              setResult(
                event.target.value
              )
            }
          >
            <option value="ALL">
              All results
            </option>
            <option value="SUCCESS">
              Success
            </option>
            <option value="FAILED">
              Failed
            </option>
            <option value="REJECTED">
              Rejected
            </option>
          </select>
        </div>
      </div>

      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-border bg-background">
              <tr className="text-[10px] uppercase tracking-wider text-text-secondary">
                <th className="px-4 py-3">
                  Timestamp
                </th>

                <th className="px-4 py-3">
                  Customer
                </th>

                <th className="px-4 py-3">
                  Method
                </th>

                <th className="px-4 py-3">
                  Distance
                </th>

                <th className="px-4 py-3">
                  Accuracy
                </th>

                <th className="px-4 py-3">
                  Result
                </th>

                <th className="px-4 py-3">
                  QR Token
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {filtered.map(
                (log) => (
                  <tr
                    key={log.id}
                    className="transition hover:bg-surface-hover"
                  >
                    <td className="px-4 py-3 font-mono text-[11px] text-text-secondary">
                      {formatDate(
                        log.timestamp
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <p className="font-medium">
                        {log.customer?.name ||
                          `Customer #${log.customerId}`}
                      </p>

                      <p className="font-mono text-[10px] text-text-secondary">
                        #{log.customerId}
                      </p>
                    </td>

                    <td className="px-4 py-3 font-mono text-[11px]">
                      {log.method}
                    </td>

                    <td className="px-4 py-3">
                      {log.distanceMeters !=
                      null
                        ? `${Math.round(
                            log.distanceMeters
                          )} m`
                        : "—"}
                    </td>

                    <td className="px-4 py-3">
                      {log.accuracy !=
                      null
                        ? `±${Math.round(
                            log.accuracy
                          )} m`
                        : "—"}
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge
                        value={
                          log.result
                        }
                      />
                    </td>

                    <td className="max-w-[220px] truncate px-4 py-3 font-mono text-[10px] text-text-secondary">
                      {log.qrTokenId
                        ? `QR #${log.qrTokenId}`
                        : "—"}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="p-10 text-center text-sm text-text-secondary">
              No presence logs
              match the filters.
            </div>
          )}
        </div>
      </div>

      <Modal
        open={!!qr}
        onClose={() =>
          setQr(null)
        }
        title="Single-use QR token"
        wide
      >
        {qr && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col items-center justify-center rounded-card border border-border bg-background p-6">
              <img
                src={qrImage}
                alt="Dynamic cafe verification QR"
                className="h-64 w-64 rounded-xl bg-white p-3"
              />

              <p className="mt-4 text-xs text-text-secondary">
                Scan inside the cafe to
                verify presence.
              </p>
            </div>

            <div className="flex flex-col justify-center">
              <p className="text-xs uppercase tracking-wider text-text-secondary">
                Expires in
              </p>

              <p
                className={`mt-1 font-mono text-4xl font-semibold ${
                  seconds <= 5
                    ? "text-accent-red"
                    : "text-accent-gold"
                }`}
              >
                {seconds}s
              </p>

              <div className="mt-2">
                <StatusBadge
                  value={
                    seconds > 0
                      ? "PENDING"
                      : "EXPIRED"
                  }
                  pulse
                />
              </div>

              <div className="mt-5 rounded-input border border-border bg-background p-3">
                <p className="mb-2 text-[10px] uppercase tracking-wider text-text-secondary">
                  Token
                </p>

                <p className="break-all font-mono text-xs leading-5 text-text-primary">
                  {qr.token}
                </p>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  className="ghost-button flex-1"
                  onClick={() =>
                    void copyToken()
                  }
                >
                  {copied ? (
                    <Check size={15} />
                  ) : (
                    <Copy size={15} />
                  )}

                  {copied
                    ? "Copied"
                    : "Copy token"}
                </button>

                <a
                  className="ghost-button"
                  href={qrImage}
                  download="secret-brew-qr.png"
                >
                  <Download size={15} />
                  PNG
                </a>
              </div>

              <p className="mt-4 font-mono text-[10px] text-text-secondary">
                TOKEN ID: {qr.id} ·
                STATUS: {qr.status}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
