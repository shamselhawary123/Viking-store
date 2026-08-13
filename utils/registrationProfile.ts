export type RegistrationFormData = {
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  bio: string;
};

export type PendingRegistrationProfile = RegistrationFormData;

export const buildPendingRegistrationProfile = (
  form: RegistrationFormData & Record<string, unknown>,
): PendingRegistrationProfile => ({
  fullName: form.fullName,
  email: form.email,
  phone: form.phone,
  gender: form.gender,
  address: form.address,
  city: form.city,
  country: form.country,
  postalCode: form.postalCode,
  bio: form.bio,
});

export const buildCreateProfileInput = (
  profile: PendingRegistrationProfile,
  user: { id: string; email?: string | null },
) => ({
  id: user.id,
  email: user.email || profile.email,
  fullName: profile.fullName,
  avatar: "",
  phone: profile.phone,
  gender: profile.gender,
  address: profile.address,
  city: profile.city,
  country: profile.country,
  postalCode: profile.postalCode,
  bio: profile.bio,
});

export const buildRegistrationProfileUpsertPayload = (
  profile: PendingRegistrationProfile,
  user: { id: string; email?: string | null },
  avatar = "",
) => ({
  id: user.id,
  email: user.email || profile.email,
  full_name: profile.fullName,
  avatar,
  phone: profile.phone,
  gender: profile.gender,
  address: profile.address,
  city: profile.city,
  country: profile.country,
  postal_code: profile.postalCode,
  bio: profile.bio,
});
