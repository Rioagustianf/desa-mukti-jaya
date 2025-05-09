"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";

export interface User {
  _id: string;
  username: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserFormData {
  username: string;
  password?: string;
  name: string;
  role: string;
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/users");
      setUsers(response.data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Gagal memuat data pengguna");
      toast.error("Gagal memuat data pengguna");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const createUser = async (userData: UserFormData) => {
    try {
      const response = await axios.post("/api/users", userData);
      setUsers((prev) => [...prev, response.data]);
      return response.data;
    } catch (err: any) {
      console.error("Error creating user:", err);
      if (err.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
      throw new Error("Gagal membuat pengguna baru");
    }
  };

  const updateUser = async (id: string, userData: Partial<UserFormData>) => {
    try {
      const response = await axios.put(`/api/users/${id}`, userData);
      setUsers((prev) =>
        prev.map((user) => (user._id === id ? response.data : user))
      );
      return response.data;
    } catch (err: any) {
      console.error("Error updating user:", err);
      if (err.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
      throw new Error("Gagal memperbarui pengguna");
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await axios.delete(`/api/users/${id}`);
      setUsers((prev) => prev.filter((user) => user._id !== id));
    } catch (err) {
      console.error("Error deleting user:", err);
      throw new Error("Gagal menghapus pengguna");
    }
  };

  const resetPassword = async (id: string, newPassword: string) => {
    try {
      const response = await axios.put(`/api/users/${id}/reset-password`, {
        password: newPassword,
      });
      return response.data;
    } catch (err) {
      console.error("Error resetting password:", err);
      throw new Error("Gagal mengatur ulang password");
    }
  };

  return {
    users,
    isLoading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    resetPassword,
  };
}
