import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as any,
    loading: false,
  }),

  actions: {
    // REGISTER
    async register(data: {
      fullName: string;
      email: string;
      password: string;
    }) {
      const supabase = useSupabase();

      const { data: userData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,

        options: {
          data: {
            full_name: data.fullName,
          },
        },
      });

      console.log("USER DATA:", userData);
      console.log("ERROR:", error);

      if (error) {
        throw error;
      }

      return userData;
    },

    // LOGIN
    async login(email: string, password: string) {
      const supabase = useSupabase();

      this.loading = true;

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      this.loading = false;

      if (error) {
        throw error;
      }

      this.user = data.user;

      return data;
    },

    // GOOGLE LOGIN
    async loginWithGoogle() {
      const supabase = useSupabase();

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",

        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        throw error;
      }
    },

    // UPLOAD AVATAR
    async uploadAvatar(file: File) {
      const supabase = useSupabase();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      console.log("SESSION =>", session);

      const fileName = `${Date.now()}-${file.name}`;

      const result = await supabase.storage
        .from("avatars")
        .upload(fileName, file);

      console.log("UPLOAD RESULT =>", result);

      if (result.error) {
        console.error("UPLOAD ERROR =>", result.error);
        throw result.error;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName);

      return publicUrl;
    },

    // LOGOUT
    async logout() {
      const supabase = useSupabase();

      await supabase.auth.signOut();

      this.user = null;

      navigateTo("/");
    },

    // FORGOT PASSWORD
    async forgotPassword(email: string) {
      const supabase = useSupabase();

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        throw error;
      }
    },

    // RESET PASSWORD
    async updatePassword(password: string) {
      const supabase = useSupabase();

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw error;
      }
    },

    // GET USER
    async getUser() {
      try {
        const supabase = useSupabase();

        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          console.log("GET USER ERROR:", error);
          return;
        }

        this.user = user;
      } catch (err) {
        console.log("GET USER CATCH:", err);
      }
    },
  },
});
