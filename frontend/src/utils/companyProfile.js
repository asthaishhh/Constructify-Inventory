export const COMPANY_PROFILE_KEY = "companyProfile";

export const defaultCompanyProfile = {
  companyName: "",
  companyTagline: "",
  logo: "",
  ownerName: "",
  gstIn: "",
  address: "",
  phone: "",
  email: "",
};

const safeEmailKey = (email = "") =>
  String(email || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9@._-]/g, "");

const getCurrentUserEmail = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return String(user?.email || "").trim().toLowerCase();
  } catch {
    return "";
  }
};

export const getCompanyProfileStorageKey = (email = "") => {
  const normalized = safeEmailKey(email || getCurrentUserEmail());
  if (!normalized) return COMPANY_PROFILE_KEY;
  return `${COMPANY_PROFILE_KEY}:${normalized}`;
};

export function loadCompanyProfile(options = {}) {
  const preferredEmail =
    typeof options === "string"
      ? options
      : options?.email || options?.userEmail || "";

  try {
    const scopedKey = getCompanyProfileStorageKey(preferredEmail);
    const raw = localStorage.getItem(scopedKey);
    if (!raw) {
      return { ...defaultCompanyProfile };
    }

    const parsed = JSON.parse(raw);
    return {
      ...defaultCompanyProfile,
      ...parsed,
    };
  } catch {
    return { ...defaultCompanyProfile };
  }
}

export function saveCompanyProfile(profile, options = {}) {
  const normalized = {
    ...defaultCompanyProfile,
    ...profile,
  };

  const preferredEmail =
    typeof options === "string"
      ? options
      : options?.email || options?.userEmail || normalized.email || "";

  // Do not persist confirmPassword field
  if (normalized.hasOwnProperty("confirmPassword")) {
    delete normalized.confirmPassword;
  }
  // Do not persist plaintext password in localStorage
  if (normalized.hasOwnProperty("password")) {
    delete normalized.password;
  }

  const scopedKey = getCompanyProfileStorageKey(preferredEmail);
  localStorage.setItem(scopedKey, JSON.stringify(normalized));
  return normalized;
}
