import Hero from "@/components/landing/Hero";
import Marquee from "@/components/landing/Marquee";
import Problem from "@/components/landing/Problem";
import HowItWorks from "@/components/landing/HowItWorks";
import SwipeDemo from "@/components/landing/SwipeDemo";
import Testimonials from "@/components/landing/Testimonials";
import Stats from "@/components/landing/Stats";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <main className="bg-[#FCFCFA]">
      <Hero />
      <Marquee />
      <Problem />
      <HowItWorks />
      <SwipeDemo />
      <Stats />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  );
}
