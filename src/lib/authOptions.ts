import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";
import PengajuanSurat from "@/lib/models/PengajuanSurat";
import bcrypt from "bcryptjs";

// Function to normalize phone numbers for comparison
function normalizePhoneNumber(phone: string): string {
  if (!phone) {
    console.log("Phone number is undefined or null");
    return "";
  }

  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, "");

  // Convert to standard format (remove country code if present)
  if (digitsOnly.startsWith("62")) {
    return "0" + digitsOnly.slice(2);
  }

  return digitsOnly;
}

// Utility function to safely extract phone number from user document
function extractUserPhoneNumber(user: any): string | null {
  try {
    // Try multiple access patterns to get the phone number
    const phoneNumber =
      user.teleponWA || // Direct property access
      user.get?.("teleponWA") || // Mongoose getter method
      user.toObject?.()?.teleponWA || // Convert to plain object
      user._doc?.teleponWA; // Access raw document

    return phoneNumber || null;
  } catch (error) {
    console.error("Error extracting phone number from user document:", error);
    return null;
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        loginType: { label: "Login Type", type: "text" },
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        nik: { label: "NIK", type: "text" },
        teleponWA: { label: "Telepon WA", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials) {
          console.error("No credentials provided");
          return null;
        }

        await dbConnect();

        // Admin login
        if (credentials.loginType === "admin") {
          if (!credentials.username || !credentials.password) {
            console.error("Username dan password diperlukan untuk admin");
            return null;
          }

          const admin = await User.findOne({
            username: credentials.username,
            role: "admin",
          });

          if (!admin) {
            console.error("Admin tidak ditemukan");
            return null;
          }

          const isValid = await bcrypt.compare(
            credentials.password,
            admin.password
          );

          if (!isValid) {
            console.error("Password admin salah");
            return null;
          }

          return {
            id: admin._id.toString(),
            name: admin.name,
            username: admin.username,
            role: admin.role,
            nik: undefined,
            teleponWA: undefined,
            isAutoCreated: undefined,
          };
        }

        // User (resident) login with NIK
        if (credentials.loginType === "user") {
          if (!credentials.nik || !credentials.teleponWA) {
            console.error("NIK dan telepon WA diperlukan untuk user");
            return null;
          }

          // Validate NIK format (16 digits)
          if (!/^\d{16}$/.test(credentials.nik)) {
            console.error("NIK harus 16 digit angka");
            return null;
          }

          // Check if user already exists
          console.log(`🔍 Login attempt for NIK: ${credentials.nik}, Phone: ${credentials.teleponWA}`);
          
          let user = await User.findOne({
            nik: credentials.nik,
            role: "resident",
          });

          console.log(`🔍 User search result:`, user ? {
            id: user._id,
            name: user.name,
            nik: user.nik,
            teleponWA: user.teleponWA,
            role: user.role
          } : 'User not found');

          // If user doesn't exist, they need to submit a letter application first
          if (!user) {
            // Let's also check if there are any users with this NIK but different role
            const anyUserWithNIK = await User.findOne({ nik: credentials.nik });
            console.log(`🔍 Any user with NIK ${credentials.nik}:`, anyUserWithNIK ? {
              role: anyUserWithNIK.role,
              name: anyUserWithNIK.name
            } : 'None found');
            
            // Fallback: Check if there's a letter application and create user
            console.log(`🔍 Checking for letter applications...`);
            const pengajuan = await PengajuanSurat.findOne({
              nik: credentials.nik,
              teleponWA: credentials.teleponWA,
            }).sort({ createdAt: -1 });
            
            if (pengajuan) {
              console.log(`🔍 Found letter application, creating user account...`);
              try {
                const userData = {
                  nik: credentials.nik,
                  teleponWA: credentials.teleponWA,
                  name: pengajuan.nama,
                  role: "resident" as const,
                  isAutoCreated: true,
                  hasSetPassword: false,
                  isVerified: false,
                };
                
                user = await User.create(userData);
                console.log(`✅ User account created during login for NIK: ${credentials.nik}`);
              } catch (createError: any) {
                console.error('Error creating user during login:', createError);
                if (createError?.code === 11000) {
                  // Duplicate key, try to find the user again
                  user = await User.findOne({
                    nik: credentials.nik,
                    role: "resident",
                  });
                }
              }
            }
            
            if (!user) {
              console.error(
                "User account not found. Please submit a letter application first to create your account."
              );
              return null;
            }
          }

          // User exists, verify phone number
          const userPhone = extractUserPhoneNumber(user);

          if (!userPhone) {
            console.error("Could not extract phone number from user document");
            return null;
          }

          const normalizedInputPhone = normalizePhoneNumber(
            credentials.teleponWA
          );
          const normalizedUserPhone = normalizePhoneNumber(userPhone);

          if (normalizedUserPhone !== normalizedInputPhone) {
            console.error(
              `Phone number mismatch. Expected: ${normalizedUserPhone}, Received: ${normalizedInputPhone}`
            );
            return null;
          }

          // If password is provided, verify it
          if (credentials.password && user.password) {
            const isValid = await bcrypt.compare(
              credentials.password,
              user.password
            );
            if (!isValid) {
              console.error("Password salah");
              return null;
            }
          }

          return {
            id: user._id.toString(),
            name: user.name,
            nik: user.nik,
            teleponWA: user.teleponWA || credentials.teleponWA,
            role: user.role,
            isAutoCreated: user.isAutoCreated,
          };
        }

        console.error("Login type tidak valid");
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
        token.nik = user.nik;
        token.teleponWA = user.teleponWA;
        token.isAutoCreated = user.isAutoCreated;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.username = token.username as string;
        session.user.nik = token.nik as string;
        session.user.teleponWA = token.teleponWA as string;
        session.user.isAutoCreated = token.isAutoCreated as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login", // This will be the admin login
  },
};
