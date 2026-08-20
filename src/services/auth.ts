import { supabase } from "@/lib/supabase";

export async function registerUser(
    username: string,
    email: string,
    password: string,
    termsAgreed: boolean,
) {
    try {
        const cleanUsername = username.trim().toLowerCase();
        const cleanEmail = email.trim().toLowerCase();

        // Username validation
        if (!cleanUsername) {
            return {
                success: false,
                error: "Please enter a username.",
            };
        }

        if (cleanUsername.length < 3) {
            return {
                success: false,
                error: "Username must be at least 3 characters.",
            };
        }

        if (cleanUsername.length > 30) {
            return {
                success: false,
                error: "Username must not exceed 30 characters.",
            };
        }

        if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
            return {
                success: false,
                error:
                    "Username can only contain letters, numbers, and underscores.",
            };
        }

        // Email validation
        if (!cleanEmail) {
            return {
                success: false,
                error: "Please enter your email address.",
            };
        }

        if (!cleanEmail) {
            return {
                success: false,
                error: "Please enter your email address.",
            };
        }
        // Password validation
        if (password.length < 8) {
            return {
                success: false,
                error: "Password must be at least 8 characters.",
            };
        }

        if (password.length > 72) {
            return {
                success: false,
                error: "Password must not exceed 72 characters.",
            };
        }

        // Terms validation
        if (!termsAgreed) {
            return {
                success: false,
                error: "Please agree to the Terms and Conditions.",
            };
        }

        /*
         * Create the authentication account.
         *
         * Username and terms_agreed are stored temporarily
         * in Supabase Auth metadata.
         *
         * The database trigger then creates the corresponding
         * public.users profile automatically.
         */
        const { data: authData, error: authError } =
            await supabase.auth.signUp({
                email: cleanEmail,
                password,
                options: {
                    data: {
                        username: cleanUsername,
                        terms_agreed: termsAgreed,
                    },
                },
            });

        if (authError) {
            console.error("Registration error:", authError.message);

            return {
                success: false,
                error: authError.message,
            };
        }

        if (!authData.user) {
            return {
                success: false,
                error: "Account could not be created.",
            };
        }

        return {
            success: true,
            user: authData.user,
        };
    } catch (error) {
        console.error("Registration error:", error);

        return {
            success: false,
            error: "Unable to create your account. Please try again.",
        };
    }
}

export async function loginUser(
    usernameOrEmail: string,
    password: string,
) {
    try {
        const identifier = usernameOrEmail.trim().toLowerCase();

        if (!identifier || !password) {
            return {
                success: false,
                error:
                    "Please enter your username or email and password.",
            };
        }

        let email = identifier;

        /*
         * If the user entered a username, find the
         * corresponding email from the users table.
         */
        if (!identifier.includes("@")) {
            const { data: user, error: userError } =
                await supabase
                    .from("users")
                    .select("email")
                    .eq("username", identifier)
                    .maybeSingle();

            if (userError || !user) {
                return {
                    success: false,
                    error: "The username or password is incorrect.",
                };
            }

            email = user.email;
        }

        // Authenticate through Supabase Auth
        const { data, error } =
            await supabase.auth.signInWithPassword({
                email,
                password,
            });

        if (error) {
            return {
                success: false,
                error: "The username or password is incorrect.",
            };
        }

        return {
            success: true,
            user: data.user,
            session: data.session,
        };
    } catch (error) {
        console.error("Login error:", error);

        return {
            success: false,
            error:
                "Unable to sign in right now. Please try again.",
        };
    }
}