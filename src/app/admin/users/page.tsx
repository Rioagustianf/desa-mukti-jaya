"use client";
import { useState } from "react";
import type React from "react";

import { useUsers, type User, type UserFormData } from "@/hooks/useUsers";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Edit,
  Key,
  Loader2,
  MoreVertical,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { validatePasswordStrength, generateRandomPassword } from "@/lib/auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const userSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter"),
  name: z.string().min(1, "Nama wajib diisi"),
  role: z.string().min(1, "Role wajib diisi"),
  password: z.string().optional(),
});

// Schema for password reset form
const passwordSchema = z
  .object({
    password: z.string().min(8, "Password minimal 8 karakter"),
    confirmPassword: z
      .string()
      .min(8, "Konfirmasi password minimal 8 karakter"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password dan konfirmasi password tidak sama",
    path: ["confirmPassword"],
  });

type UserFormValues = z.infer<typeof userSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function AdminUsersPage() {
  const {
    users,
    isLoading,
    createUser,
    updateUser,
    deleteUser,
    resetPassword,
  } = useUsers();

  const [open, setOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [edit, setEdit] = useState<User | null>(null);
  const [userToResetPassword, setUserToResetPassword] = useState<User | null>(
    null
  );
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPasswordForm,
    setValue: setPasswordValue,
    watch: watchPassword,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const password = watchPassword("password");

  function handleEdit(user: User) {
    setEdit(user);
    setValue("username", user.username);
    setValue("name", user.name);
    setValue("role", user.role);
    setValue("password", ""); // Clear password field when editing
    setOpen(true);
  }

  function handleAdd() {
    setEdit(null);
    reset({
      username: "",
      name: "",
      role: "admin",
      password: "",
    });
    setPasswordStrength(null);
    setGeneratedPassword("");
    setShowPassword(false);
    setOpen(true);
  }

  function handleResetPassword(user: User) {
    setUserToResetPassword(user);
    resetPasswordForm({
      password: "",
      confirmPassword: "",
    });
    setPasswordStrength(null);
    setGeneratedPassword("");
    setShowPassword(false);
    setPasswordDialogOpen(true);
  }

  function handleDeleteConfirm(id: string) {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    if (itemToDelete) {
      try {
        await deleteUser(itemToDelete);
        toast.success("Pengguna berhasil dihapus");
      } catch (error) {
        toast.error("Gagal menghapus pengguna");
      }
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  }

  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    const password = e.target.value;
    if (password) {
      setPasswordStrength(validatePasswordStrength(password));
    } else {
      setPasswordStrength(null);
    }
  }

  function handleGeneratePassword() {
    const newPassword = generateRandomPassword();
    setValue("password", newPassword);
    setGeneratedPassword(newPassword);
    setShowPassword(true);
    setPasswordStrength(validatePasswordStrength(newPassword));
  }

  function handleGenerateResetPassword() {
    const newPassword = generateRandomPassword();
    setPasswordValue("password", newPassword);
    setPasswordValue("confirmPassword", newPassword);
    setGeneratedPassword(newPassword);
    setShowPassword(true);
    setPasswordStrength(validatePasswordStrength(newPassword));
  }

  async function onSubmit(values: UserFormValues) {
    try {
      if (edit) {
        // If editing, only include password if it's provided
        const updateData: Partial<UserFormData> = {
          username: values.username,
          name: values.name,
          role: values.role,
        };

        if (values.password) {
          updateData.password = values.password;
        }

        await updateUser(edit._id, updateData);
        toast.success("Pengguna berhasil diperbarui!");
      } else {
        // If adding new user, password is required
        if (!values.password) {
          toast.error("Password wajib diisi untuk pengguna baru");
          return;
        }

        await createUser(values as UserFormData);
        toast.success("Pengguna berhasil ditambahkan!");
      }
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Gagal menyimpan pengguna");
    }
  }

  async function onSubmitResetPassword(values: PasswordFormValues) {
    if (!userToResetPassword) return;

    try {
      await resetPassword(userToResetPassword._id, values.password);
      toast.success("Password berhasil diatur ulang");
      setPasswordDialogOpen(false);
    } catch (error) {
      toast.error("Gagal mengatur ulang password");
    }
  }

  // Filter users based on search query
  const filteredUsers = users?.filter(
    (user: User) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Kelola Pengguna Admin
          </h1>
          <p className="text-muted-foreground">
            Tambah, edit, dan hapus pengguna admin
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2 self-start">
          <Plus size={16} />
          Tambah Admin
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Daftar Pengguna Admin</CardTitle>
              <CardDescription>
                {!isLoading &&
                  `Menampilkan ${filteredUsers?.length || 0} pengguna`}
              </CardDescription>
            </div>
            <div className="w-full sm:w-auto relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari pengguna..."
                className="pl-8 w-full sm:w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredUsers?.length ? (
            <div className="space-y-4">
              {filteredUsers.map((user: User) => (
                <div
                  key={user._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-md"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{user.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {user.role}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      @{user.username}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Dibuat: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-3 sm:mt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => handleResetPassword(user)}
                    >
                      <Key size={14} />
                      Reset Password
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => handleEdit(user)}
                    >
                      <Edit size={14} />
                      Edit
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(user)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleResetPassword(user)}
                        >
                          <Key className="mr-2 h-4 w-4" />
                          Reset Password
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteConfirm(user._id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "Tidak ada pengguna yang sesuai dengan pencarian"
                  : "Belum ada pengguna admin"}
              </p>
              {searchQuery ? (
                <Button variant="outline" onClick={() => setSearchQuery("")}>
                  Reset Pencarian
                </Button>
              ) : (
                <Button onClick={handleAdd}>Tambah Admin Pertama</Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>
                {edit ? "Edit Pengguna" : "Tambah Pengguna"}
              </DialogTitle>
              <DialogDescription>
                {edit
                  ? "Perbarui informasi pengguna yang sudah ada"
                  : "Tambahkan pengguna admin baru"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <Input
                id="username"
                placeholder="Username untuk login"
                {...register("username")}
              />
              {errors.username && (
                <span className="text-red-500 text-xs">
                  {errors.username.message}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Nama Lengkap
              </label>
              <Input
                id="name"
                placeholder="Nama lengkap pengguna"
                {...register("name")}
              />
              {errors.name && (
                <span className="text-red-500 text-xs">
                  {errors.name.message}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium">
                Role
              </label>
              <Select
                defaultValue={edit?.role || "admin"}
                onValueChange={(value) => setValue("role", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="superadmin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <span className="text-red-500 text-xs">
                  {errors.role.message}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-sm font-medium">
                  {edit ? "Password (Opsional)" : "Password"}
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleGeneratePassword}
                >
                  Generate Password
                </Button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={
                    edit
                      ? "Kosongkan jika tidak ingin mengubah"
                      : "Password minimal 8 karakter"
                  }
                  {...register("password")}
                  onChange={(e) => {
                    register("password").onChange(e);
                    handlePasswordChange(e);
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-7"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Sembunyikan" : "Tampilkan"}
                </Button>
              </div>
              {passwordStrength && (
                <div
                  className={`text-xs ${
                    passwordStrength.valid ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {passwordStrength.message}
                </div>
              )}
              {generatedPassword && (
                <div className="text-xs text-muted-foreground mt-1">
                  Password yang dihasilkan:{" "}
                  {showPassword ? generatedPassword : "••••••••••"}
                </div>
              )}
              {errors.password && (
                <span className="text-red-500 text-xs">
                  {errors.password.message}
                </span>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : edit ? (
                  "Simpan Perubahan"
                ) : (
                  "Tambah Pengguna"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <form
            onSubmit={handleSubmitPassword(onSubmitResetPassword)}
            className="space-y-4"
          >
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
              <DialogDescription>
                Atur ulang password untuk pengguna{" "}
                <span className="font-medium">
                  {userToResetPassword?.name} (@{userToResetPassword?.username})
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="new-password" className="text-sm font-medium">
                  Password Baru
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleGenerateResetPassword}
                >
                  Generate Password
                </Button>
              </div>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password baru minimal 8 karakter"
                  {...registerPassword("password")}
                  onChange={(e) => {
                    registerPassword("password").onChange(e);
                    handlePasswordChange(e);
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-7"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Sembunyikan" : "Tampilkan"}
                </Button>
              </div>
              {passwordStrength && (
                <div
                  className={`text-xs ${
                    passwordStrength.valid ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {passwordStrength.message}
                </div>
              )}
              {passwordErrors.password && (
                <span className="text-red-500 text-xs">
                  {passwordErrors.password.message}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-sm font-medium">
                Konfirmasi Password
              </label>
              <Input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan kembali password baru"
                {...registerPassword("confirmPassword")}
              />
              {passwordErrors.confirmPassword && (
                <span className="text-red-500 text-xs">
                  {passwordErrors.confirmPassword.message}
                </span>
              )}
            </div>

            {generatedPassword && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">Password yang dihasilkan:</p>
                <p className="font-mono mt-1">
                  {showPassword ? generatedPassword : "••••••••••"}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Pastikan untuk menyimpan password ini di tempat yang aman.
                </p>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPasswordDialogOpen(false)}
                disabled={isPasswordSubmitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isPasswordSubmitting}>
                {isPasswordSubmitting ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak
              dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
