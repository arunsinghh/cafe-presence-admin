import {
  useEffect,
  useState
} from "react";

import {
  RefreshCw,
  Smartphone
} from "lucide-react";

import api, {
  apiMessage
} from "../services/api";

import type {
  Customer,
  Device
} from "../types";

import StatusBadge from "../components/StatusBadge";
import Loading from "../components/Loading";

export default function Devices() {
  const [
    rows,
    setRows
  ] = useState<
    Array<
      Device & {
        customer?: Customer;
      }
    >
  >([]);

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    error,
    setError
  ] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const customerResponse =
        await api.get(
          "/customers?limit=100"
        );

      const customers =
        customerResponse.data.data
          ?.customers ??
        customerResponse.data.data ??
        [];

      const responses =
        await Promise.all(
          customers.map(
            (customer: Customer) =>
              api
                .get(
                  `/devices/customer/${customer.id}`
                )
                .then(
                  (response) => {
                    const devices =
                      response.data.data ??
                      response.data ??
                      [];

                    return devices.map(
                      (
                        device: Device
                      ) => ({
                        ...device,
                        customer
                      })
                    );
                  }
                )
                .catch(() => [])
          )
        );

      setRows(
        responses.flat()
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

  const action =
    async (
      device: Device
    ) => {
      setError("");

      try {
        await api.post(
          `/devices/${device.id}/${
            device.status ===
            "PENDING"
              ? "approve"
              : "revoke"
          }`
        );

        await load();
      } catch (requestError) {
        setError(
          apiMessage(requestError)
        );
      }
    };

  if (loading) {
    return (
      <Loading label="Loading device registry" />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent-gold">
            Access / Hardware
          </p>

          <h1 className="page-title">
            Device Registry
          </h1>

          <p className="mt-2 muted">
            Every trusted endpoint
            attached to a member account.
          </p>
        </div>

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
      </div>

      {error && (
        <div className="rounded-input border border-accent-red/30 bg-accent-red/10 p-3 text-sm text-accent-red">
          {error}
        </div>
      )}

      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-border bg-background text-[10px] uppercase tracking-wider text-text-secondary">
              <tr>
                <th className="px-4 py-3">
                  Device
                </th>

                <th className="px-4 py-3">
                  Customer
                </th>

                <th className="px-4 py-3">
                  Device ID
                </th>

                <th className="px-4 py-3">
                  Status
                </th>

                <th className="px-4 py-3">
                  Registered
                </th>

                <th className="px-4 py-3">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {rows.map(
                (device) => (
                  <tr
                    key={device.id}
                    className="hover:bg-surface-hover"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Smartphone
                          size={17}
                          className="text-accent-gold"
                        />

                        <span>
                          {device.deviceName ||
                            device.platform ||
                            "Device"}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      {device.customer
                        ?.name ||
                        `Customer #${device.customerId}`}
                    </td>

                    <td className="px-4 py-3 font-mono text-[10px] text-text-secondary">
                      {device.deviceId}
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge
                        value={
                          device.status
                        }
                      />
                    </td>

                    <td className="px-4 py-3 font-mono text-[10px] text-text-secondary">
                      {new Date(
                        device.createdAt
                      ).toLocaleDateString(
                        "en-IN"
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {device.status ===
                        "PENDING" && (
                        <button
                          type="button"
                          onClick={() =>
                            void action(
                              device
                            )
                          }
                          className="gold-button px-3 py-2 text-xs"
                        >
                          Approve
                        </button>
                      )}

                      {device.status ===
                        "ACTIVE" && (
                        <button
                          type="button"
                          onClick={() =>
                            void action(
                              device
                            )
                          }
                          className="danger-button px-3 py-2 text-xs"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>

          {rows.length === 0 && (
            <div className="p-10 text-center text-sm text-text-secondary">
              No devices found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
