"use client";

import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


export default function Home() {
  const currentUser = useConvexAuth();
  const router = useRouter();

  useEffect(() => {
    if (currentUser.isLoading) return;
    if (!currentUser.isAuthenticated) {
      return router.replace("/login")
    }
    
    router.replace("/thoughts/new");
  }, [currentUser.isAuthenticated, currentUser.isLoading, router])

}
