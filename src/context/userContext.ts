"use client";

import { createContext, useContext } from "react";

export type UserContextValue = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
};

export type UserContextState = {
  user: UserContextValue | null;
  setUser: (user: UserContextValue | null) => void;
};

export const UserContext = createContext<UserContextState | null>(null);

export const useUser = () => {
  const ctx = useContext(UserContext);
  return ctx?.user ?? null;
};

export const useSetUser = () => useContext(UserContext)?.setUser ?? (() => { });
