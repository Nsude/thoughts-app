"use client";

import ClassicButton from "@/components/buttons/ClassicButton";
import { useToastContext } from "@/components/contexts/ToastContext";
import Logo from "@/components/Logo";
import { api } from "@/convex/_generated/api";
import LoadingIcon from "@/public/icons/LoadingIcon";
import LogoIcon from "@/public/icons/LogoIcon";
import { useConvexAuth, useMutation } from "convex/react";
import { redirect, useRouter } from "next/navigation";
import { use, useEffect } from "react";

export default function AddSharedThought({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const currentUser = useConvexAuth();
  const { setToast } = useToastContext();
  const router = useRouter();

  // convex mutations 
  const addSharedThoughtToDashboard = useMutation(api.shareThought.addSharedThoughtToDashboard);

  useEffect(() => {
    const updateThoughts = async () => {
      try {
        const response = await addSharedThoughtToDashboard({ token });
        router.replace(`/thoughts/${(response).thoughtId}`);
        setToast({
          title: "Shared Thought",
          msg: `You're now collaboration on ${response.title || "a thought."} ${response.title ? "thought file." : ""}`,
          isError: false,
          showToast: true
        })
      } catch (error) {
        console.error(error);
        setToast({
          title: "Token is invalid",
          msg: "The token is wrong or expired, ask the owner to create a new link.",
          isError: true,
          showToast: true
        })
      }
    }

    if (!currentUser.isLoading && !currentUser.isAuthenticated) {
      redirect("/login");
    } else if (!currentUser.isLoading && currentUser.isAuthenticated) {
      updateThoughts();
    }

  }, [currentUser, addSharedThoughtToDashboard, router, setToast, token])

  return (
    <div className="relative w-full h-screen flex flex-col justify-center items-center">
      <div className="flex flex-col justify-center items-center -translate-y-1/2 gap-y-[1.25rem]">
        <LoadingIcon size={60} />
        <Logo />
      </div>

      <div className="absolute top-[1.25rem]">
        <ClassicButton 
          text="Go Home" 
          icon={<LogoIcon />}
          handleClick={() => router.replace("/thoughts/new")} />
      </div>
    </div>
  );
}