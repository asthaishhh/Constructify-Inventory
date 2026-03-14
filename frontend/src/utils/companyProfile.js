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

export function loadCompanyProfile() {
  try {
    const raw = localStorage.getItem(COMPANY_PROFILE_KEY);
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

export function saveCompanyProfile(profile) {
  const normalized = {
    ...defaultCompanyProfile,
    ...profile,
  };

  localStorage.setItem(COMPANY_PROFILE_KEY, JSON.stringify(normalized));
  return normalized;
}
