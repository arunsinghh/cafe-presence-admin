export const formatDate = (
  value?: string | null
): string => {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
};

export const formatDateOnly = (
  value?: string | null
): string => {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium"
  }).format(new Date(value));
};

export const initials = (
  name = ""
): string => {
  const result = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return result || "?";
};

export const money = (
  value?: number | string | null
): string => {
  if (value === null || value === undefined) {
    return "—";
  }

  return `₹${Number(value).toLocaleString(
    "en-IN"
  )}`;
};

export const prettyAction = (
  action: string
): string => {
  return action.replace(/_/g, " ");
};

export const resolveImageUrl = (
  url?: string | null
): string => {
  if (!url || typeof url !== "string") return "";
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:") ||
    url.startsWith("blob:")
  ) {
    return url;
  }
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return `http://localhost:4000${cleanPath}`;
};

