"use client";

import { createContext, useContext } from "react";

export const UserContext = createContext<{
  name: string;
  email: string;
} | null>(null);

export const useUser = () => useContext(UserContext);
