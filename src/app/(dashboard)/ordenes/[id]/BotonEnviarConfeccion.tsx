"use client";

import { useState } from "react";
import { updateOrdenEstado } from "@/app/actions/ordenesActions";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";

export default function BotonEnviarConfeccion({ ordenId }: { ordenId: string }) {
  const [isPending, setIsPending] = useState(false);

  const handleClick = async () => {
    setIsPending(true);
    const res = await updateOrdenEstado(ordenId, "CONFECCION");
    setIsPending(false);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Orden enviada a confección.");
    }
  };

  return (
    <button 
      onClick={handleClick}
      disabled={isPending}
      className="mt-6 w-full sm:w-auto bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-sm inline-flex items-center justify-center gap-2 disabled:opacity-50"
    >
      {isPending ? "Procesando..." : "Mover a Confección"} <ArrowRight className="w-5 h-5" />
    </button>
  );
}
