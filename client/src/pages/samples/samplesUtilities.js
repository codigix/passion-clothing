export const formatLabel = (value) =>
  value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export const getInitials = (name) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export const formatCurrency = (value) => {
  if (!value) {
    return "Free";
  }
  return `₹${value.toLocaleString()}`;
};

export const getBadgeClass = (mapping, key) => mapping[key] || "border-gray-200 bg-gray-100 text-gray-600";