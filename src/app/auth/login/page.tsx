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

// Create a separate component that uses useSearchParams
function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const callbackUrl = params.get("callbackUrl");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Input type="text" placeholder="Username" {...register("username")} />
        {errors.username && (
          <p className="text-sm text-red-500">{errors.username.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Input
          type="password"
          placeholder="Password"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full bg-sky-800 hover:bg-sky-700"
        disabled={loading}
      >
        {loading ? "Memproses..." : "Login"}
      </Button>
    </form>
  );
}

// Fallback for suspense
function LoginFormFallback() {
  return <div>Loading form...</div>;
}

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md  mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Login Admin</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<LoginFormFallback />}>
            <LoginForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
