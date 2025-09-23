"use client";

import { useConvexAuth } from "convex/react";
import { redirect, useRouter } from "next/navigation";
import { useEffect } from "react";


export default function Home() {
  const currentUser = useConvexAuth();
  const router = useRouter();

  useEffect(() => {
    if (currentUser.isLoading) return;
    if (!currentUser.isAuthenticated) {
      return router.replace("/login")
    }
    
    redirect("/thoughts/new");
  }, [currentUser.isAuthenticated, currentUser.isLoading, router])

}
