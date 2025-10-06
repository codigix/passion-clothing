import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
} from "lucide-react";

const iconMap = {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
};

export const getIcon = (iconName) => {
  const IconComponent = iconMap[iconName];
  return IconComponent || null;
};

export const formatCurrency = (value) => {
  if (!value) {
    return "₹0";
  }
  return `₹${value.toLocaleString()}`;
};

export const formatShortCurrency = (value) => {
  if (!value) {
    return "₹0";
  }
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(1)}Cr`;
  }
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  }
  if (value >= 1000) {
    return `₹${(value / 1000).toFixed(1)}K`;
  }
  return `₹${value.toLocaleString()}`;
};

export const formatPercentage = (value) => {
  if (value === null || value === undefined) {
    return "0%";
  }
  return `${value > 0 ? "+" : ""}${value}%`;
};

export const getBadgeClass = (mapping, key, fallback) => {
  if (!key) {
    return fallback;
  }
  return mapping[key] || fallback;
};

export const getTrendIndicator = (value) => {
  if (value === null || value === undefined) {
    return "neutral";
  }
  if (value > 0) {
    return "up";
  }
  if (value < 0) {
    return "down";
  }
  return "neutral";
};