import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { templates } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Metadata } from 'next';
import { auth } from "@/auth";
import SmoothScroll from "@/components/ui/smooth-scroll";
import { FloatingNav } from "@/components/layout/floating-navbar";
import { HeroParallax } from "@/components/ui/hero-parallax";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import Image from "next/image";
import { FloatingElements } from "@/components/ui/floating-elements";
import Testimonials from "@/components/sections/testimonials";
import { WiggleBanner } from "@/components/ui/wiggle-banner";

import { getValidImageUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: 'OmniTemplates - Create Unforgettable Moments',
  description: 'Craft personalized greeting pages for your loved ones. Choose a template, customize it, and share the love.',
  keywords: ['valentine', 'greeting cards', 'personalized', 'ecards', 'anniversary'],
};

export const revalidate = 0;

// Category configuration with emojis and colors
const categories = [
  { id: "all", label: "All", emoji: "✨" },
  { id: "valentine", label: "Valentine", emoji: "💕" },
  { id: "parents", label: "Parents", emoji: "👨‍👩‍👧" },
  { id: "anniversary", label: "Anniversary", emoji: "💍" },
  { id: "achievement", label: "Achievements", emoji: "🏆" },
  { id: "birthday", label: "Birthday", emoji: "🎂" },
];

export default async function Home() {
  const session = await auth();
  const allTemplates = await db.select().from(templates).where(eq(templates.isPublic, true));

  // Transform templates for HeroParallax
  const products = [
    ...allTemplates.map(t => ({
      title: t.name,
      link: `/create/${t.id}`,
      thumbnail: getValidImageUrl(t.thumbnail)
    })),
    // Filler items for the parallax effect
    { title: "Neon Love", link: "#", thumbnail: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=3540&auto=format&fit=crop" },
    { title: "Cyber Heart", link: "#", thumbnail: "https://images.unsplash.com/photo-1535295972055-1c762f4483e5?q=80&w=3387&auto=format&fit=crop" },
    { title: "Retro Vibe", link: "#", thumbnail: "https://images.unsplash.com/photo-1555685812-4b943f3db3bd?q=80&w=3540&auto=format&fit=crop" },
    { title: "Abstract Passion", link: "#", thumbnail: "https://images.unsplash.com/photo-1550684848-86a5d8727436?q=80&w=3540&auto=format&fit=crop" },
    { title: "Glow Message", link: "#", thumbnail: "https://images.unsplash.com/photo-1513258496098-3126e91054ab?q=80&w=3540&auto=format&fit=crop" },
    { title: "Dark Romance", link: "#", thumbnail: "https://images.unsplash.com/photo-1493037237936-e82020227184?q=80&w=3542&auto=format&fit=crop" },
    { title: "Digital Rose", link: "#", thumbnail: "https://images.unsplash.com/photo-1518199227311-5fe79c6e2710?q=80&w=3401&auto=format&fit=crop" },
    { title: "Future Date", link: "#", thumbnail: "https://images.unsplash.com/photo-1481819613568-3701cbc70156?q=80&w=3400&auto=format&fit=crop" },
    { title: "Holographic", link: "#", thumbnail: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=3540&auto=format&fit=crop" },
    { title: "Synthwave", link: "#", thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=3540&auto=format&fit=crop" },
    { title: "Pixel Heart", link: "#", thumbnail: "https://images.unsplash.com/photo-1550159930-40066082a4fc?q=80&w=3540&auto=format&fit=crop" },
    { title: "Glitch Love", link: "#", thumbnail: "https://images.unsplash.com/photo-1534802046520-4f27db7f3ae9?q=80&w=3429&auto=format&fit=crop" },
    { title: "Vaporwave", link: "#", thumbnail: "https://images.unsplash.com/photo-1492551557933-34265f7af79e?q=80&w=3400&auto=format&fit=crop" },
    { title: "Golden Hour", link: "#", thumbnail: "https://images.unsplash.com/photo-1516709322316-d44b5631cd0d?q=80&w=3540&auto=format&fit=crop" },
  ];

  return (
    <SmoothScroll>
      <div className="bg-gradient-to-b from-white via-neutral-50 to-white dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 w-full relative min-h-screen transition-colors duration-500">
        <FloatingNav />

        {/* Hero Section with Floating 3D Elements */}
        <div className="relative">
          <FloatingElements />
          <HeroParallax products={products} />
        </div>

        {/* Testimonials / Reviews Section */}
        <Testimonials />

        {/* Template Categories & Cards */}
        <section id="templates" className="py-20 px-4 md:px-8 max-w-7xl mx-auto relative">
          <FloatingElements />

          <div className="text-center mb-12 relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
              Choose Your Template
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 mt-4 text-lg">
              Select a design that speaks to your heart. Customize every detail.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-12 relative z-10">
            {categories.map((cat) => (
              <span
                key={cat.id}
                className="px-5 py-2.5 rounded-full text-sm font-medium cursor-pointer transition-all duration-200 border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/50 text-neutral-700 dark:text-neutral-200 hover:bg-pink-50 dark:hover:bg-pink-500/10 hover:border-pink-300 dark:hover:border-pink-500/30 hover:text-pink-600 dark:hover:text-pink-400"
              >
                {cat.emoji} {cat.label}
              </span>
            ))}
          </div>

          {/* Promo Banner */}
          <WiggleBanner />

          {/* Template Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
            {allTemplates.map((template) => (
              <CardContainer key={template.id} className="inter-var">
                <CardBody className="bg-white/80 dark:bg-neutral-900/60 relative group/card hover:shadow-2xl dark:hover:shadow-pink-500/5 border border-neutral-200 dark:border-white/10 w-auto h-auto rounded-xl p-4 backdrop-blur-sm transition-all duration-300">
                  <CardItem
                    translateZ="50"
                    className="text-base font-bold text-neutral-800 dark:text-white"
                  >
                    {template.name}
                  </CardItem>
                  <CardItem
                    as="p"
                    translateZ="60"
                    className="text-neutral-500 dark:text-neutral-300 text-xs max-w-sm mt-1 line-clamp-2"
                  >
                    {template.description || "A beautiful template for your loved one."}
                  </CardItem>

                  {/* Tags */}
                  {template.tags && template.tags.length > 0 && (
                    <CardItem translateZ="40" className="flex flex-wrap gap-1 mt-2">
                      {template.tags.map((tag, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-full bg-pink-100 dark:bg-pink-500/20 text-pink-600 dark:text-pink-300">
                          {tag}
                        </span>
                      ))}
                    </CardItem>
                  )}

                  <CardItem translateZ="100" className="w-full mt-3">
                    <Image
                      src={getValidImageUrl(template.thumbnail)}
                      height="600"
                      width="600"
                      className="h-36 w-full object-cover rounded-lg group-hover/card:shadow-xl"
                      alt={template.name}
                    />
                  </CardItem>

                  <div className="mt-4 space-y-3">
                    <CardItem translateZ={20} as="div">
                      {template.salePrice ? (
                        <div className="flex flex-col">
                          <span className="line-through text-neutral-400 dark:text-neutral-500 text-xs">{template.price} 🪙</span>
                          <span className="text-sm font-bold text-pink-500">{template.salePrice} 🪙</span>
                        </div>
                      ) : (
                        <span className="text-sm font-bold text-neutral-800 dark:text-white">{template.price} 🪙</span>
                      )}
                    </CardItem>
                    <div className="flex items-center gap-2">
                      <CardItem
                        translateZ={20}
                        as="div"
                        className="flex-1 text-center px-3 py-1.5 rounded-full border border-neutral-300 dark:border-white/20 text-neutral-700 dark:text-neutral-200 text-xs font-medium hover:bg-neutral-100 dark:hover:bg-white/10 transition-all duration-200 cursor-pointer"
                      >
                        <Link href={`/preview/${template.id}`}>
                          Preview 👁️
                        </Link>
                      </CardItem>
                      <CardItem
                        translateZ={20}
                        as="div"
                        className="flex-1 text-center px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-violet-600 text-white text-xs font-bold hover:from-pink-600 hover:to-violet-700 transition-all duration-200 cursor-pointer"
                      >
                        <Link href={`/create/${template.id}`}>
                          Create Now →
                        </Link>
                      </CardItem>
                    </div>
                  </div>
                </CardBody>
              </CardContainer>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 bg-neutral-50 dark:bg-neutral-950 transition-colors duration-500 relative">
          <FloatingElements />
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 text-neutral-800 dark:text-white">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-pink-500 to-violet-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-pink-500/20">1</div>
                <h3 className="text-2xl font-bold text-neutral-800 dark:text-white">Select Template</h3>
                <p className="text-neutral-500 dark:text-neutral-400">Browse our collection for Valentine&apos;s, anniversaries, birthdays & more.</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-violet-500/20">2</div>
                <h3 className="text-2xl font-bold text-neutral-800 dark:text-white">Customize</h3>
                <p className="text-neutral-500 dark:text-neutral-400">Add names, photos, messages, and audio to make it truly personal.</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-indigo-500/20">3</div>
                <h3 className="text-2xl font-bold text-neutral-800 dark:text-white">Share Link</h3>
                <p className="text-neutral-500 dark:text-neutral-400">Get a unique link to send to your special someone.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-10 bg-white dark:bg-neutral-950 text-center border-t border-neutral-200 dark:border-neutral-800 transition-colors duration-500">
          <p className="text-neutral-400 dark:text-neutral-500">&copy; 2024 OmniTemplates. All rights reserved.</p>
        </footer>
      </div>
    </SmoothScroll>
  );
}
