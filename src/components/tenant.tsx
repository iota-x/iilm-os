"use client";

import { createContext, useContext } from "react";
import { tenantInfo, tenantOf, type TenantInfo } from "@/lib/universities";

const Ctx = createContext<TenantInfo>(tenantInfo(tenantOf(null)));

/** Gives client components the signed-in student's university, class and calendar. */
export function TenantProvider({ value, children }: { value: TenantInfo; children: React.ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTenant(): TenantInfo {
  return useContext(Ctx);
}
