"use client";

import { ReactNode, useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScroll({ children }: { children: ReactNode }) {
    useEffect(() => {
        const lenis = new Lenis();

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        // Handle hash-based anchor scrolling (e.g. /#templates)
        const handleHashScroll = () => {
            const hash = window.location.hash;
            if (hash) {
                const target = document.querySelector(hash);
                if (target) {
                    // Small delay to let the page render first
                    setTimeout(() => {
                        lenis.scrollTo(target as HTMLElement, { offset: -80 });
                    }, 100);
                }
            }
        };

        // Scroll on initial load if hash exists
        handleHashScroll();

        // Listen for hash changes
        window.addEventListener("hashchange", handleHashScroll);

        // Also intercept clicks on anchor links so Lenis handles them smoothly
        const handleClick = (e: MouseEvent) => {
            const link = (e.target as HTMLElement).closest("a");
            if (!link) return;
            const href = link.getAttribute("href");
            if (href && (href.startsWith("#") || href.startsWith("/#"))) {
                const hash = href.includes("#") ? "#" + href.split("#")[1] : "";
                const target = document.querySelector(hash);
                if (target) {
                    e.preventDefault();
                    // Update URL hash without jumping
                    window.history.pushState(null, "", href);
                    lenis.scrollTo(target as HTMLElement, { offset: -80 });
                }
            }
        };

        document.addEventListener("click", handleClick);

        return () => {
            lenis.destroy();
            window.removeEventListener("hashchange", handleHashScroll);
            document.removeEventListener("click", handleClick);
        };
    }, []);

    return <>{children}</>;
}
