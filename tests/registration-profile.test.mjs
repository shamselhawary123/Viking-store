import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildCreateProfileInput,
  buildPendingRegistrationProfile,
  buildRegistrationProfileUpsertPayload,
} from "../utils/registrationProfile.ts";

describe("registration profile helpers", () => {
  it("builds pending registration data without storing passwords", () => {
    const pendingProfile = buildPendingRegistrationProfile({
      fullName: "Viking User",
      email: "user@example.com",
      phone: "555",
      gender: "Male",
      address: "1 Fight Street",
      city: "Cairo",
      country: "Egypt",
      postalCode: "12345",
      bio: "Training daily",
      password: "super-secret",
      confirmPassword: "super-secret",
    });

    assert.deepEqual(pendingProfile, {
      fullName: "Viking User",
      email: "user@example.com",
      phone: "555",
      gender: "Male",
      address: "1 Fight Street",
      city: "Cairo",
      country: "Egypt",
      postalCode: "12345",
      bio: "Training daily",
    });
    assert.equal(Object.hasOwn(pendingProfile, "password"), false);
    assert.equal(Object.hasOwn(pendingProfile, "confirmPassword"), false);
  });

  it("builds profile creation input from the verified Supabase user id", () => {
    const profileInput = buildCreateProfileInput(
      {
        fullName: "Viking User",
        email: "user@example.com",
        phone: "555",
        gender: "Male",
        address: "1 Fight Street",
        city: "Cairo",
        country: "Egypt",
        postalCode: "12345",
        bio: "Training daily",
      },
      { id: "auth-user-id", email: "verified@example.com" },
    );

    assert.deepEqual(profileInput, {
      id: "auth-user-id",
      email: "verified@example.com",
      fullName: "Viking User",
      avatar: "",
      phone: "555",
      gender: "Male",
      address: "1 Fight Street",
      city: "Cairo",
      country: "Egypt",
      postalCode: "12345",
      bio: "Training daily",
    });
  });

  it("builds an upsert payload keyed by profile id without overwriting role", () => {
    const payload = buildRegistrationProfileUpsertPayload(
      {
        fullName: "Viking User",
        email: "user@example.com",
        phone: "555",
        gender: "Male",
        address: "1 Fight Street",
        city: "Cairo",
        country: "Egypt",
        postalCode: "12345",
        bio: "Training daily",
      },
      { id: "auth-user-id", email: "verified@example.com" },
    );

    assert.deepEqual(payload, {
      id: "auth-user-id",
      email: "verified@example.com",
      full_name: "Viking User",
      avatar: "",
      phone: "555",
      gender: "Male",
      address: "1 Fight Street",
      city: "Cairo",
      country: "Egypt",
      postal_code: "12345",
      bio: "Training daily",
    });
    assert.equal(Object.hasOwn(payload, "role"), false);
  });
});
