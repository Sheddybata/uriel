"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="bg-amber-400 px-4 py-2 text-center text-sm font-medium text-[#111111]">
      <WifiOff className="mr-2 inline h-4 w-4" />
      Local Network Connected. Starlink Link Recovering...
    </div>
  );
}
