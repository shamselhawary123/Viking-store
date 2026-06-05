import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as any,
    profile: null as any,
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

    async createProfile(data: {
      id: string;
      email: string;
      fullName: string;
      avatar: string;
      phone: string;
      gender: string;
      address: string;
      city: string;
      country: string;
      postalCode: string;
      bio: string;
    }) {
      const supabase = useSupabase();

      const { error } = await supabase.from("profiles").insert({
        id: data.id,
        email: data.email,
        full_name: data.fullName,
        avatar: data.avatar,
        phone: data.phone,
        gender: data.gender,
        address: data.address,
        city: data.city,
        country: data.country,
        postal_code: data.postalCode,
        bio: data.bio,
      });

      if (error) {
        throw error;
      }
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
    // LOGOUT
    async logout() {
      const supabase = useSupabase();

      await supabase.auth.signOut();

      this.user = null;

      navigateTo("/");
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
    // ORDERS
    async createOrder(cartItems: any[], totalPrice: number) {
      const supabase = useSupabase();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Please login first");
      }

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,

          total_price: cartItems.reduce(
            (total, item) => total + item.price * item.quantity,
            0,
          ),

          status: "pending",

          payment_method: "cash",
        })
        .select()
        .single();

      if (orderError) {
        throw orderError;
      }

      const items = cartItems.map((item) => ({
        order_id: order.id,

        product_id: item.id,

        product_name: item.title,

        product_image: item.image,

        product_price: item.price,

        color: item.color,

        size: item.size,

        quantity: item.quantity,
      }));
      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(items);

      if (itemsError) {
        throw itemsError;
      }

      return order;
    },
    // GET ORDERS
    async getOrders() {
      const supabase = useSupabase();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return [];
      }

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data;
    },

    // GET ORDER DETAILS
    async getOrderDetails(orderId: string) {
      const supabase = useSupabase();

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (orderError) {
        throw orderError;
      }

      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId);

      if (itemsError) {
        throw itemsError;
      }

      return {
        order,
        items,
      };
    },
    // GET PROFILE
    async getProfile() {
      const supabase = useSupabase();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        throw error;
      }
      this.profile = data;

      return data;
    },
    // UPDATE PROFILE
    async updateProfile(profileData: any) {
      const supabase = useSupabase();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not found");
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profileData.full_name,
          phone: profileData.phone,
          gender: profileData.gender,
          address: profileData.address,
          city: profileData.city,
          country: profileData.country,
          postal_code: profileData.postal_code,
          bio: profileData.bio,
          avatar: profileData.avatar,
        })
        .eq("id", user.id);

      if (error) {
        throw error;
      }

      return true;
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
  },
});
