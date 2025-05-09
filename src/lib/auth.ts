import bcrypt from "bcryptjs";

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

// Compare password with hash
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// Generate random password
export function generateRandomPassword(length = 10): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Validate password strength
export function validatePasswordStrength(password: string): {
  valid: boolean;
  message: string;
} {
  if (password.length < 8) {
    return { valid: false, message: "Password harus minimal 8 karakter" };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Password harus mengandung huruf kapital" };
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "Password harus mengandung huruf kecil" };
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Password harus mengandung angka" };
  }

  return { valid: true, message: "Password valid" };
}
