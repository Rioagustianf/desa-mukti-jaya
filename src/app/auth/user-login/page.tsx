"use client";

import { useState, Suspense } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Info, User, Phone, Lock } from "lucide-react";
import Link from "next/link";

const userLoginSchema = z.object({
  nik: z
    .string()
    .length(16, "NIK harus 16 digit")
    .regex(/^\d{16}$/, "NIK harus berupa 16 digit angka"),
  teleponWA: z
    .string()
    .min(10, "Nomor telepon minimal 10 digit")
    .regex(/^(\+62|62|0)[0-9]{9,13}$/, "Format nomor telepon tidak valid"),
  password: z.string().optional(),
});

type UserLoginFormValues = z.infer<typeof userLoginSchema>;

function UserLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/user/dashboard";
  const [loading, setLoading] = useState(false);

  const form = useForm<UserLoginFormValues>({
    resolver: zodResolver(userLoginSchema),
    defaultValues: {
      nik: "",
      teleponWA: "",
      password: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  async function onSubmit(values: UserLoginFormValues) {
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        loginType: "user",
        nik: values.nik,
        teleponWA: values.teleponWA,
        password: values.password,
        redirect: false,
      });

      if (res?.error) {
        toast.error("Login gagal. Periksa kembali NIK dan nomor telepon Anda.");
      } else {
        // Check if login was successful
        const session = await getSession();
        if (session?.user) {
          toast.success(`Selamat datang, ${session.user.name}!`);

          if (session.user.isAutoCreated) {
            toast.info(
              "Akun Anda telah dibuat otomatis. Anda dapat mengatur password di halaman profil."
            );
          }

          router.push(callbackUrl);
        } else {
          toast.error("Terjadi kesalahan saat login. Silakan coba lagi.");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Terjadi kesalahan sistem. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Cara Login:</strong>
          <ul className="mt-2 space-y-1 text-sm">
            <li>
              • Masukkan NIK (16 digit) yang sama dengan saat mengajukan surat
            </li>
            <li>
              • Masukkan nomor WhatsApp yang sama dengan saat mengajukan surat
            </li>
            <li>
              • Password bersifat opsional (kosongkan jika belum pernah diatur)
            </li>
            <li>• Jika belum pernah login, akun akan dibuat otomatis</li>
          </ul>
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nik" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            NIK (16 digit)
          </Label>
          <Input
            id="nik"
            type="text"
            placeholder="Masukkan NIK 16 digit"
            maxLength={16}
            {...register("nik")}
          />
          {errors.nik && (
            <p className="text-sm text-red-500">{errors.nik.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="teleponWA" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Nomor WhatsApp
          </Label>
          <Input
            id="teleponWA"
            type="text"
            placeholder="Contoh: 081234567890"
            {...register("teleponWA")}
          />
          {errors.teleponWA && (
            <p className="text-sm text-red-500">{errors.teleponWA.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Password (Opsional)
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Kosongkan jika belum pernah diatur"
            {...register("password")}
          />
          <p className="text-xs text-gray-500">
            Password hanya diperlukan jika Anda sudah pernah mengaturnya
            sebelumnya
          </p>
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Memproses...
            </>
          ) : (
            "Masuk"
          )}
        </Button>
      </form>

      <div className="text-center text-sm text-gray-500">
        <p>Belum pernah mengajukan surat?</p>
        <Link
          href="/layanan-administrasi/ajukan"
          className="text-blue-600 hover:underline"
        >
          Ajukan Surat Administrasi
        </Link>
      </div>

      <div className="text-center text-sm">
        <Link href="/auth/login" className="text-gray-500 hover:underline">
          Login sebagai Admin
        </Link>
      </div>
    </div>
  );
}

// Loading fallback for the Suspense boundary
function LoginFormFallback() {
  return (
    <div className="space-y-4">
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

export default function UserLoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-800">
            Login Warga
          </CardTitle>
          <p className="text-gray-600">
            Akses dashboard dan download surat Anda
          </p>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<LoginFormFallback />}>
            <UserLoginForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
