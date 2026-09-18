import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, Loader, MapPin } from "lucide-react";

import type { CafeConfig } from "../types";
import { cafeConfigAPI, apiMessage } from "../services/api";
import { useAuthStore } from "../store/auth.store";
import FormField from "./FormField";

export default function CafeConfigCard() {
  const employee = useAuthStore((state) => state.employee);
  const isAdmin = employee?.role === "ADMIN";

  const [, setConfig] = useState<CafeConfig | null>(null);

  const [formData, setFormData] = useState({
    cafeName: "The Secret Brew",
    latitude: "28.570468",
    longitude: "77.333510",
    allowedRadiusMeters: "50",
    qrValiditySeconds: "60",
    qrRotationSeconds: "30",
    loyaltyPointsPerUnit: "1",
    isPresenceEnabled: true
  });

  const [loading, setLoading] = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoadingInit(true);
        const data = await cafeConfigAPI.getConfig();
        if (data && active) {
          setConfig(data);
          setFormData({
            cafeName: data.cafeName,
            latitude: data.latitude.toString(),
            longitude: data.longitude.toString(),
            allowedRadiusMeters: data.allowedRadiusMeters.toString(),
            qrValiditySeconds: data.qrValiditySeconds.toString(),
            qrRotationSeconds: data.qrRotationSeconds.toString(),
            loyaltyPointsPerUnit: data.loyaltyPointsPerUnit.toString(),
            isPresenceEnabled: data.isPresenceEnabled
          });
        }
      } catch (err) {
        if (active) {
          setMessage({
            type: "error",
            text: apiMessage(err, "Failed to load cafe configuration")
          });
        }
      } finally {
        if (active) {
          setLoadingInit(false);
        }
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (message) {
      const timer = window.setTimeout(() => setMessage(null), 4000);
      return () => window.clearTimeout(timer);
    }
  }, [message]);

  const validateForm = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    if (!formData.cafeName.trim()) {
      newErrors.cafeName = "Cafe name is required";
    }

    const latitude = parseFloat(formData.latitude);
    if (isNaN(latitude) || latitude < -90 || latitude > 90) {
      newErrors.latitude = "Latitude must be between -90 and 90";
    }

    const longitude = parseFloat(formData.longitude);
    if (isNaN(longitude) || longitude < -180 || longitude > 180) {
      newErrors.longitude = "Longitude must be between -180 and 180";
    }

    const radius = parseFloat(formData.allowedRadiusMeters);
    if (isNaN(radius) || radius <= 0) {
      newErrors.allowedRadiusMeters = "Radius must be greater than 0";
    }

    const qrValidity = parseInt(formData.qrValiditySeconds, 10);
    if (isNaN(qrValidity) || qrValidity <= 0) {
      newErrors.qrValiditySeconds = "QR validity must be greater than 0";
    }

    const qrRotation = parseInt(formData.qrRotationSeconds, 10);
    if (isNaN(qrRotation) || qrRotation <= 0) {
      newErrors.qrRotationSeconds = "QR rotation must be greater than 0";
    }

    const points = parseFloat(formData.loyaltyPointsPerUnit);
    if (isNaN(points) || points < 0) {
      newErrors.loyaltyPointsPerUnit = "Loyalty points must be non-negative";
    }

    return newErrors;
  };

  const handleSave = async () => {
    setErrors({});
    setMessage(null);

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        cafeName: formData.cafeName.trim(),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        allowedRadiusMeters: parseFloat(formData.allowedRadiusMeters),
        qrValiditySeconds: parseInt(formData.qrValiditySeconds, 10),
        qrRotationSeconds: parseInt(formData.qrRotationSeconds, 10),
        loyaltyPointsPerUnit: parseFloat(formData.loyaltyPointsPerUnit),
        isPresenceEnabled: formData.isPresenceEnabled
      };

      const updated = await cafeConfigAPI.upsertConfig(payload);
      setConfig(updated);
      setMessage({
        type: "success",
        text: "Cafe configuration saved successfully!"
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: apiMessage(err, "Failed to save configuration")
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="premium-card p-5">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="mt-0.5 text-accent-red shrink-0" />
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-text-secondary font-semibold">
              Cafe Configuration
            </p>
            <p className="mt-2 text-sm text-text-secondary">
              Only administrators can manage cafe configuration. Please contact your admin for changes.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-card p-5">
      <div className="mb-5 flex items-start gap-3">
        <MapPin size={20} className="text-accent-gold shrink-0" />
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-text-secondary font-semibold">
            Cafe Configuration
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            Configure physical cafe coordinates for GPS verification (authorized radius: 50m).
          </p>
        </div>
      </div>

      {loadingInit ? (
        <div className="flex items-center justify-center py-8">
          <Loader className="animate-spin text-accent-gold" size={24} />
        </div>
      ) : (
        <>
          {message && (
            <div
              className={`mb-4 flex items-start gap-2 rounded-input border p-3 text-sm ${
                message.type === "success"
                  ? "border-accent-green/30 bg-accent-green/10 text-accent-green"
                  : "border-accent-red/30 bg-accent-red/10 text-accent-red"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle size={16} className="mt-0.5 shrink-0" />
              ) : (
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <div className="space-y-4">
            <FormField label="Cafe Name">
              <input
                type="text"
                disabled={loading}
                value={formData.cafeName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, cafeName: e.target.value }))
                }
                className={`premium-input ${errors.cafeName ? "border-accent-red" : ""}`}
                placeholder="Enter cafe name"
              />
              {errors.cafeName && (
                <p className="mt-1 text-xs text-accent-red">{errors.cafeName}</p>
              )}
            </FormField>

            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="Latitude">
                <input
                  type="number"
                  disabled={loading}
                  value={formData.latitude}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, latitude: e.target.value }))
                  }
                  className={`premium-input font-mono ${errors.latitude ? "border-accent-red" : ""}`}
                  placeholder="-90 to 90"
                  step="0.000001"
                />
                {errors.latitude && (
                  <p className="mt-1 text-xs text-accent-red">{errors.latitude}</p>
                )}
              </FormField>

              <FormField label="Longitude">
                <input
                  type="number"
                  disabled={loading}
                  value={formData.longitude}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, longitude: e.target.value }))
                  }
                  className={`premium-input font-mono ${errors.longitude ? "border-accent-red" : ""}`}
                  placeholder="-180 to 180"
                  step="0.000001"
                />
                {errors.longitude && (
                  <p className="mt-1 text-xs text-accent-red">{errors.longitude}</p>
                )}
              </FormField>
            </div>

            <FormField label="Allowed Radius (meters)">
              <input
                type="number"
                disabled={loading}
                value={formData.allowedRadiusMeters}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, allowedRadiusMeters: e.target.value }))
                }
                className={`premium-input font-mono ${errors.allowedRadiusMeters ? "border-accent-red" : ""}`}
                placeholder="e.g. 50"
                step="0.1"
                min="0"
              />
              {errors.allowedRadiusMeters && (
                <p className="mt-1 text-xs text-accent-red">{errors.allowedRadiusMeters}</p>
              )}
            </FormField>

            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="QR Validity (seconds)">
                <input
                  type="number"
                  disabled={loading}
                  value={formData.qrValiditySeconds}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, qrValiditySeconds: e.target.value }))
                  }
                  className={`premium-input font-mono ${errors.qrValiditySeconds ? "border-accent-red" : ""}`}
                  placeholder="60"
                  step="1"
                  min="1"
                />
                {errors.qrValiditySeconds && (
                  <p className="mt-1 text-xs text-accent-red">{errors.qrValiditySeconds}</p>
                )}
              </FormField>

              <FormField label="QR Rotation (seconds)">
                <input
                  type="number"
                  disabled={loading}
                  value={formData.qrRotationSeconds}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, qrRotationSeconds: e.target.value }))
                  }
                  className={`premium-input font-mono ${errors.qrRotationSeconds ? "border-accent-red" : ""}`}
                  placeholder="30"
                  step="1"
                  min="1"
                />
                {errors.qrRotationSeconds && (
                  <p className="mt-1 text-xs text-accent-red">{errors.qrRotationSeconds}</p>
                )}
              </FormField>
            </div>

            <FormField label="Loyalty Points Per Unit">
              <input
                type="number"
                disabled={loading}
                value={formData.loyaltyPointsPerUnit}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, loyaltyPointsPerUnit: e.target.value }))
                }
                className={`premium-input font-mono ${errors.loyaltyPointsPerUnit ? "border-accent-red" : ""}`}
                placeholder="1"
                step="0.1"
                min="0"
              />
              {errors.loyaltyPointsPerUnit && (
                <p className="mt-1 text-xs text-accent-red">{errors.loyaltyPointsPerUnit}</p>
              )}
            </FormField>

            <div className="flex items-center gap-3 py-2">
              <input
                type="checkbox"
                id="isPresenceEnabled"
                disabled={loading}
                checked={formData.isPresenceEnabled}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, isPresenceEnabled: e.target.checked }))
                }
                className="h-4 w-4 cursor-pointer rounded border-border"
              />
              <label
                htmlFor="isPresenceEnabled"
                className="cursor-pointer text-xs uppercase tracking-wider text-text-secondary"
              >
                Enable Presence Verification
              </label>
            </div>

            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={loading}
              className="gold-button mt-4 w-full"
            >
              {loading ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Saving…
                </>
              ) : (
                "Save Configuration"
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
