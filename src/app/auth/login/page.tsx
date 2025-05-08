"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Suspense } from "react";

const schema = z.object({
  username: z.string().min(2, "Username wajib diisi"),
  password: z.string().min(4, "Password wajib diisi"),
});

type Inputs = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [callbackUrl, setCallbackUrl] = useState<string | null>(null);

  useEffect(() => {
    // Pastikan penggunaan params hanya dilakukan di sisi klien
    setCallbackUrl(params.get("callbackUrl"));
  }, [params]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: Inputs) {
    setLoading(true);
    const res = await signIn("credentials", {
      ...data,
      redirect: false,
    });
    setLoading(false);

    if (res?.error) {
      toast.error("Username atau password salah");
    } else {
      router.push(callbackUrl || "/admin");
    }
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Login Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Input
                  placeholder="Username"
                  {...register("username")}
                  autoFocus
                  autoComplete="username"
                />
                {errors.username && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.username.message}
                  </p>
                )}
              </div>
              <div>
                <Input
                  placeholder="Password"
                  type="password"
                  {...register("password")}
                  autoComplete="current-password"
                />
                {errors.password && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Memproses..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Suspense>
  );
}
