<template>
  <section class="space-y-6">
    <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p class="text-sm font-bold uppercase tracking-[0.25em] text-[#FF4D00]">{{ t("admin.customers") }}</p>
        <h2 class="mt-2 text-3xl font-black">{{ t("admin.users") }}</h2>
      </div>

      <input v-model="search" type="search" :placeholder="t('admin.searchUsers')" class="field md:max-w-sm" />
    </div>

    <p v-if="successMessage" class="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
      {{ successMessage }}
    </p>
    <p v-if="errorMessage" class="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
      {{ errorMessage }}
    </p>
    <p v-if="authStateWarning" class="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-200">
      {{ authStateWarning }}
    </p>

    <div class="overflow-hidden rounded-3xl border border-white/10 bg-[#111111]">
      <div class="hidden overflow-x-auto md:block">
        <table class="w-full min-w-[1120px] text-left text-sm">
          <thead class="bg-black text-gray-500">
            <tr>
              <th class="px-5 py-4">{{ t("admin.user") }}</th>
              <th class="px-5 py-4">{{ t("common.phone") }}</th>
              <th class="px-5 py-4">{{ t("admin.role") }}</th>
              <th class="px-5 py-4">{{ t("admin.state") }}</th>
              <th class="px-5 py-4">{{ t("admin.joined") }}</th>
              <th class="px-5 py-4 text-right">{{ t("common.actions") }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/10">
            <tr v-for="user in filteredUsers" :key="user.id">
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <img :src="user.avatar || avatarUrl(user)" alt="" class="h-11 w-11 rounded-full object-cover" />
                  <div>
                    <p class="font-bold">{{ user.full_name || t("admin.user") }}</p>
                    <p class="text-xs text-gray-500">{{ user.email || "-" }}</p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-4 text-gray-400">{{ user.phone || "-" }}</td>
              <td class="px-5 py-4">
                <select
                  :value="user.role || 'customer'"
                  :disabled="savingUserId === user.id"
                  class="rounded-xl border border-white/10 bg-black px-3 py-2 text-[#FF4D00] outline-none disabled:opacity-50"
                  @change="updateRole(user, ($event.target as HTMLSelectElement).value)"
                >
                  <option v-for="role in ADMIN_USER_ROLES" :key="role" :value="role">{{ t(`admin.roles.${role}`) }}</option>
                </select>
              </td>
              <td class="px-5 py-4">
                <span class="rounded-full border px-3 py-1 text-xs font-black" :class="userStateClass(user)">
                  {{ t(`admin.userState.${getAdminUserState(user)}`) }}
                </span>
              </td>
              <td class="px-5 py-4 text-gray-500">{{ formatDate(user.created_at) }}</td>
              <td class="px-5 py-4">
                <div class="flex justify-end gap-2">
                  <button class="rounded-xl border border-white/10 px-3 py-2 font-bold transition hover:border-[#FF4D00]" @click="openDetails(user)">
                    {{ t("common.details") }}
                  </button>
                  <button
                    v-if="getAdminUserState(user) === 'Active'"
                    :disabled="!canRunAdminUserAction(currentAdminId, user.id, 'suspend') || savingUserId === user.id"
                    class="rounded-xl border border-yellow-500/40 px-3 py-2 font-bold text-yellow-300 transition hover:bg-yellow-500 hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
                    @click="runUserAction(user, 'suspend')"
                  >
                    {{ t("admin.suspend") }}
                  </button>
                  <button
                    v-else
                    :disabled="savingUserId === user.id"
                    class="rounded-xl border border-emerald-500/40 px-3 py-2 font-bold text-emerald-300 transition hover:bg-emerald-500 hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
                    @click="runUserAction(user, 'reactivate')"
                  >
                    {{ t("admin.reactivate") }}
                  </button>
                  <button
                    :disabled="!canRunAdminUserAction(currentAdminId, user.id, 'delete') || savingUserId === user.id"
                    class="rounded-xl border border-red-500/40 px-3 py-2 font-bold text-red-400 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    @click="runUserAction(user, 'delete')"
                  >
                    {{ t("common.delete") }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="grid gap-3 p-3 md:hidden">
        <article v-for="user in filteredUsers" :key="user.id" class="admin-mobile-card rounded-2xl border border-white/10 bg-black p-4">
          <div class="flex gap-3">
            <img :src="user.avatar || avatarUrl(user)" alt="" class="h-12 w-12 shrink-0 rounded-full object-cover" />
            <div class="min-w-0 flex-1">
              <p class="truncate font-black">{{ user.full_name || t("admin.user") }}</p>
              <p class="mt-1 truncate text-xs text-gray-500">{{ user.email || "-" }}</p>
              <p class="mt-1 text-sm text-gray-400">{{ user.phone || "-" }}</p>
            </div>
            <span class="h-fit rounded-full border px-3 py-1 text-xs font-black" :class="userStateClass(user)">
              {{ t(`admin.userState.${getAdminUserState(user)}`) }}
            </span>
          </div>

          <div class="mt-3 grid grid-cols-2 gap-2 text-sm">
            <label class="block rounded-xl border border-white/10 bg-[#111111] p-3">
              <span class="text-xs text-gray-500">{{ t("admin.role") }}</span>
              <select
                :value="user.role || 'customer'"
                :disabled="savingUserId === user.id"
                class="mt-2 w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-[#FF4D00] outline-none disabled:opacity-50"
                @change="updateRole(user, ($event.target as HTMLSelectElement).value)"
              >
                <option v-for="role in ADMIN_USER_ROLES" :key="role" :value="role">{{ t(`admin.roles.${role}`) }}</option>
              </select>
            </label>
            <div class="rounded-xl border border-white/10 bg-[#111111] p-3">
              <p class="text-xs text-gray-500">{{ t("admin.joined") }}</p>
              <p class="mt-2 font-bold text-gray-200">{{ formatDate(user.created_at) }}</p>
            </div>
          </div>

          <div class="mt-3 flex flex-wrap justify-end gap-2">
            <button class="min-h-11 rounded-xl border border-white/10 px-3 py-2 text-sm font-bold transition hover:border-[#FF4D00]" @click="openDetails(user)">
              {{ t("common.details") }}
            </button>
            <button
              v-if="getAdminUserState(user) === 'Active'"
              :disabled="!canRunAdminUserAction(currentAdminId, user.id, 'suspend') || savingUserId === user.id"
              class="min-h-11 rounded-xl border border-yellow-500/40 px-3 py-2 text-sm font-bold text-yellow-300 transition hover:bg-yellow-500 hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
              @click="runUserAction(user, 'suspend')"
            >
              {{ t("admin.suspend") }}
            </button>
            <button
              v-else
              :disabled="savingUserId === user.id"
              class="min-h-11 rounded-xl border border-emerald-500/40 px-3 py-2 text-sm font-bold text-emerald-300 transition hover:bg-emerald-500 hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
              @click="runUserAction(user, 'reactivate')"
            >
              {{ t("admin.reactivate") }}
            </button>
            <button
              :disabled="!canRunAdminUserAction(currentAdminId, user.id, 'delete') || savingUserId === user.id"
              class="min-h-11 rounded-xl border border-red-500/40 px-3 py-2 text-sm font-bold text-red-400 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              @click="runUserAction(user, 'delete')"
            >
              {{ t("common.delete") }}
            </button>
          </div>
        </article>
      </div>

      <p v-if="loading" class="p-6 text-sm text-gray-500">{{ t("admin.loadingUsers") }}</p>
      <p v-else-if="!filteredUsers.length" class="p-6 text-sm text-gray-500">{{ t("admin.noUsers") }}</p>
    </div>

    <div v-if="selectedUser" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div class="max-h-[calc(100dvh-1rem)] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-[#111111] p-4 sm:rounded-3xl sm:p-6">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-sm font-bold uppercase tracking-[0.25em] text-[#FF4D00]">{{ t("admin.userDetails") }}</p>
            <h3 class="mt-2 text-2xl font-black">{{ selectedUser.full_name || t("admin.user") }}</h3>
          </div>
          <button class="text-gray-400 hover:text-white" @click="selectedUser = null">{{ t("admin.modalClose") }}</button>
        </div>

        <div class="mt-6 flex items-center gap-4 rounded-2xl bg-black p-5">
          <img :src="selectedUser.avatar || avatarUrl(selectedUser)" alt="" class="h-20 w-20 rounded-full object-cover" />
          <div>
            <p class="text-xl font-black">{{ selectedUser.full_name || t("admin.user") }}</p>
            <p class="mt-1 text-gray-500">{{ selectedUser.email || "-" }}</p>
          </div>
        </div>

        <div class="mt-5 grid gap-4 sm:grid-cols-2">
          <InfoBlock :label="t('common.phone')" :value="selectedUser.phone || '-'" />
          <InfoBlock :label="t('admin.role')" :value="t(`admin.roles.${selectedUser.role || 'customer'}`)" />
          <InfoBlock :label="t('admin.state')" :value="t(`admin.userState.${getAdminUserState(selectedUser)}`)" />
          <InfoBlock :label="t('common.created')" :value="formatDate(selectedUser.created_at)" />
          <InfoBlock :label="t('common.city')" :value="selectedUser.city || '-'" />
          <InfoBlock :label="t('auth.country')" :value="selectedUser.country || '-'" />
          <InfoBlock :label="t('common.address')" :value="selectedUser.address || '-'" />
          <InfoBlock :label="t('admin.postalCode')" :value="selectedUser.postal_code || '-'" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, ref } from "vue";
import {
  ADMIN_USER_ROLES,
  type AdminUserAction,
  type AdminUserRole,
  canRunAdminUserAction,
  filterAdminUsers,
  getAdminUserState,
} from "../../utils/adminUsers";
import { formatDate } from "../../utils/admin";

definePageMeta({
  layout: "admin",
  middleware: ["admin"],
});

type UserRow = {
  id: string;
  full_name?: string | null;
  email?: string | null;
  avatar?: string | null;
  phone?: string | null;
  city?: string | null;
  country?: string | null;
  address?: string | null;
  postal_code?: string | null;
  role?: AdminUserRole | string | null;
  created_at?: string | null;
  banned_until?: string | null;
  [key: string]: any;
};

const InfoBlock = defineComponent({
  props: {
    label: { type: String, required: true },
    value: { type: [String, Number], default: "-" },
  },
  setup(props) {
    return () =>
      h("div", { class: "rounded-2xl bg-black p-4" }, [
        h("p", { class: "text-sm text-gray-500" }, props.label),
        h("p", { class: "mt-2 break-words font-bold text-white" }, String(props.value || "-")),
      ]);
  },
});

const supabase = useSupabase();
const { t } = useI18n();
const users = ref<UserRow[]>([]);
const selectedUser = ref<UserRow | null>(null);
const currentAdminId = ref<string | null>(null);
const search = ref("");
const loading = ref(true);
const savingUserId = ref<string | null>(null);
const successMessage = ref("");
const errorMessage = ref("");
const authStateWarning = ref("");

const filteredUsers = computed(() => filterAdminUsers(users.value, search.value));

const avatarUrl = (user: UserRow) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || user.email || "User")}`;

const userStateClass = (user: UserRow) =>
  getAdminUserState(user) === "Suspended"
    ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-200"
    : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";

const setMessage = (type: "success" | "error", message: string) => {
  successMessage.value = type === "success" ? message : "";
  errorMessage.value = type === "error" ? message : "";
};

const mergeAuthStates = (authUsers: Array<{ id: string; banned_until?: string | null }>) => {
  const stateById = new Map(authUsers.map((user) => [user.id, user.banned_until || null]));
  users.value = users.value.map((user) => ({
    ...user,
    banned_until: stateById.get(user.id) || null,
  }));
};

const loadAuthStates = async () => {
  const { data, error } = await supabase.functions.invoke("admin-users", {
    body: { action: "list" },
  });

  if (error) {
    authStateWarning.value = error.message || t("admin.authStateUnavailable");
    return;
  }

  mergeAuthStates(data?.users || []);
  authStateWarning.value = "";
};

const loadUsers = async () => {
  loading.value = true;
  setMessage("error", "");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  currentAdminId.value = user?.id || null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    setMessage("error", error.message);
    users.value = [];
    loading.value = false;
    return;
  }

  users.value = (data || []) as UserRow[];
  await loadAuthStates();
  loading.value = false;
};

const openDetails = (user: UserRow) => {
  selectedUser.value = user;
};

const updateRole = async (user: UserRow, role: string) => {
  const previousRole = user.role;
  user.role = role;
  savingUserId.value = user.id;
  setMessage("error", "");

  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", user.id);

  if (error) {
    user.role = previousRole;
    setMessage("error", error.message);
  } else {
    setMessage("success", t("admin.userRoleUpdated"));
  }

  savingUserId.value = null;
};

const runUserAction = async (user: UserRow, action: Exclude<AdminUserAction, "list">) => {
  if (!canRunAdminUserAction(currentAdminId.value, user.id, action)) {
    setMessage("error", t("admin.selfActionBlocked"));
    return;
  }

  const label = user.full_name || user.email || t("admin.thisUser");
  const actionLabel = action === "delete" ? t("common.delete") : t(`admin.${action}`);
  if (!confirm(t("admin.userActionConfirm", { action: actionLabel, name: label }))) return;

  savingUserId.value = user.id;
  setMessage("error", "");

  const { data, error } = await supabase.functions.invoke("admin-users", {
    body: { action, userId: user.id },
  });

  if (error) {
    setMessage("error", error.message);
    savingUserId.value = null;
    return;
  }

  if (action === "delete") {
    users.value = users.value.filter((item) => item.id !== user.id);
    if (selectedUser.value?.id === user.id) selectedUser.value = null;
  } else {
    const bannedUntil = data?.user?.banned_until || null;
    users.value = users.value.map((item) =>
      item.id === user.id ? { ...item, banned_until: bannedUntil } : item,
    );
    if (selectedUser.value?.id === user.id) {
      selectedUser.value = { ...selectedUser.value, banned_until: bannedUntil };
    }
  }

  setMessage("success", t("admin.userActionDone", { action: actionLabel }));
  savingUserId.value = null;
};

onMounted(loadUsers);
</script>

<style scoped>
.field {
  width: 100%;
  border-radius: 1rem;
  border: 1px solid rgb(255 255 255 / 0.1);
  background: #111111;
  padding: 0.875rem 1rem;
  color: #fff;
  outline: none;
}

.field:focus {
  border-color: #ff4d00;
}
</style>
