import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  ADMIN_USER_ROLES,
  canRunAdminUserAction,
  filterAdminUsers,
  getAdminUserState,
} from "../utils/adminUsers.ts";

describe("admin user helpers", () => {
  it("searches users by name, email, and phone", () => {
    const users = [
      { id: "1", full_name: "Amina Stone", email: "amina@example.com", phone: "111" },
      { id: "2", full_name: "Karim North", email: "karim@example.com", phone: "222" },
    ];

    assert.deepEqual(filterAdminUsers(users, "amina").map((user) => user.id), ["1"]);
    assert.deepEqual(filterAdminUsers(users, "karim@example").map((user) => user.id), ["2"]);
    assert.deepEqual(filterAdminUsers(users, "222").map((user) => user.id), ["2"]);
  });

  it("uses only existing profile roles for role management", () => {
    assert.deepEqual(ADMIN_USER_ROLES, ["customer", "admin"]);
  });

  it("marks users suspended only when auth banned_until is in the future", () => {
    const now = new Date("2026-08-12T10:00:00Z");

    assert.equal(getAdminUserState({ banned_until: "2026-08-13T10:00:00Z" }, now), "Suspended");
    assert.equal(getAdminUserState({ banned_until: "2026-08-11T10:00:00Z" }, now), "Active");
    assert.equal(getAdminUserState({}, now), "Active");
  });

  it("prevents the current admin from deleting or suspending themselves", () => {
    assert.equal(canRunAdminUserAction("admin-1", "admin-1", "suspend"), false);
    assert.equal(canRunAdminUserAction("admin-1", "admin-1", "delete"), false);
    assert.equal(canRunAdminUserAction("admin-1", "admin-1", "reactivate"), true);
    assert.equal(canRunAdminUserAction("admin-1", "user-1", "delete"), true);
  });
});
