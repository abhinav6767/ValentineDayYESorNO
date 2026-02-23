import dynamic from "next/dynamic";

// Map of template file key (from DB) to Component
export const templateRegistry: Record<string, any> = {
    "valentine": dynamic(() => import("@/components/templates/valentine/ValentineTemplate"), {
        loading: () => <div className="flex h-screen w-full items-center justify-center bg-pink-50 text-pink-500 animate-pulse">Loading Template...</div>
    }),
    "anniversary": dynamic(() => import("@/components/templates/anniversary/AnniversaryTemplate"), {
        loading: () => <div className="flex h-screen w-full items-center justify-center bg-amber-950 text-amber-400 animate-pulse">Loading Template...</div>
    }),
    "proposal": dynamic(() => import("@/components/templates/proposal/ProposalTemplate"), {
        loading: () => <div className="flex h-screen w-full items-center justify-center bg-purple-950 text-pink-400 animate-pulse">Loading Template...</div>
    }),
    "birthday": dynamic(() => import("@/components/templates/birthday/BirthdayTemplate"), {
        loading: () => <div className="flex h-screen w-full items-center justify-center bg-neutral-950 text-orange-400 animate-pulse">Loading Template...</div>
    }),
    // Add more templates here
};
