"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "~/hooks/api/auth";

export default function Home() {
  const { user, isLoading, error } = useUser();
  const router = useRouter();

  useEffect(() => {
    if(user && user.id) {
      router.replace(`/dashboard`);
    } else {
      router.replace(`/login`);
    }
  }, [user])

  return (
    <div>
      <h1>Home</h1>
      {isLoading ? <div>Loading...</div> : error ? <div>Error: {error.message}</div> : <div>Welcome {user?.email}</div>}
    </div>
  );
}