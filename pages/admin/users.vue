<template>
  <section class="space-y-6">
    <div>
      <p class="text-sm font-bold uppercase tracking-[0.25em] text-[#FF4D00]">
        Customers
      </p>
      <h2 class="mt-2 text-3xl font-black">Users</h2>
    </div>

    <div class="overflow-hidden rounded-3xl border border-white/10 bg-[#111111]">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[760px] text-left text-sm">
          <thead class="bg-black text-gray-500">
            <tr>
              <th class="px-5 py-4">User</th>
              <th class="px-5 py-4">Phone</th>
              <th class="px-5 py-4">City</th>
              <th class="px-5 py-4">Country</th>
              <th class="px-5 py-4">Joined</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/10">
            <tr v-for="user in users" :key="user.id">
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <img
                    :src="user.avatar || 'https://ui-avatars.com/api/?name=User'"
                    alt=""
                    class="h-11 w-11 rounded-full object-cover"
                  />
                  <div>
                    <p class="font-bold">{{ user.full_name || "User" }}</p>
                    <p class="text-xs text-gray-500">{{ user.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-4 text-gray-400">{{ user.phone || "-" }}</td>
              <td class="px-5 py-4 text-gray-400">{{ user.city || "-" }}</td>
              <td class="px-5 py-4 text-gray-400">{{ user.country || "-" }}</td>
              <td class="px-5 py-4 text-gray-500">{{ formatDate(user.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-if="!loading && !users.length" class="p-6 text-sm text-gray-500">
        No users found.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";

definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

type UserRow = {
  id: string;
  full_name?: string;
  email?: string;
  avatar?: string;
  phone?: string;
  city?: string;
  country?: string;
  created_at?: string;
};

const supabase = useSupabase();
const users = ref<UserRow[]>([]);
const loading = ref(true);

const formatDate = (date?: string) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

onMounted(async () => {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  users.value = (data || []) as UserRow[];
  loading.value = false;
});
</script>
