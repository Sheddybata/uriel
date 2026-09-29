import Link from "next/link";
import Image from "next/image";
import { HomeHeader } from "@/components/site/home-header";

const specs = [
  ["−58 dBm", "Bridge signal"],
  ["3 Mbps", "Typical stall speed"],
  ["24 hrs", "Link up today"],
  ["< 1 sec", "PIN connects"],
  ["100%", "Link quality"],
];

export default function Home() {
  return (
    <div className="bg-black text-white">
      <HomeHeader />

      <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden px-6 pb-16 pt-28 md:px-10 md:pt-32">
        <Image
          src="/herpbackground.jpg"
          alt=""
          fill
          priority
          className="object-cover object-center"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/25" />
        <div className="relative max-w-5xl">
          <h1 className="max-w-4xl text-5xl font-medium leading-[1.02] tracking-tight md:text-6xl">
            Data without limits.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
            High-speed internet for every offices, businesses and residential areas. One voucher. One PIN. Instant connection over the local Starlink satellite.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/login" className="inline-flex h-14 items-center justify-center rounded-full bg-white px-8 text-base font-medium text-black md:h-12">Connect now</Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-px border-t border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-5">
        {specs.map(([value, label]) => (
          <div key={label} className="bg-black px-6 py-8 md:px-6">
            <p className="text-4xl font-medium tracking-tight lg:text-3xl">{value}</p>
            <p className="mt-2 text-sm uppercase tracking-[0.14em] text-white/60">{label}</p>
          </div>
        ))}
      </section>

      <section id="plans" className="px-6 py-16 md:px-10 md:py-20">
        <p className="text-sm uppercase tracking-[0.22em] text-white/50">Trader plans</p>
        <h2 className="mt-3 max-w-xl text-4xl font-medium leading-tight tracking-tight">Simple pricing for a busy stall.</h2>
        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
          <article className="rounded-3xl border border-white/10 p-8">
            <p className="text-base text-white/70">Daily Pass</p>
            <p className="mt-4 text-5xl font-medium tracking-tight">₦700</p>
            <p className="mt-4 text-base text-white/70">24 hours · 3 Mbps · one shop device</p>
          </article>
          <article className="rounded-3xl bg-[#800020] p-8">
            <p className="text-base text-white/80">Monthly Unlimited · Save 60%</p>
            <p className="mt-4 text-5xl font-medium tracking-tight">₦8,000</p>
            <p className="mt-4 text-base text-white/80">30 days · 15 Mbps · remembered for a month</p>
          </article>
        </div>
      </section>

      <section id="coverage" className="border-t border-white/10 px-6 py-16 md:px-10 md:py-20">
        <p className="text-sm uppercase tracking-[0.22em] text-white/50">Coverage</p>
        <h2 className="mt-3 max-w-3xl text-4xl font-medium leading-tight tracking-tight">1-2km range wifi signal with direct access to offices, businesses and residential areas.</h2>
        <ol className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {["Starlink Gateway", "5 GHz PtP Bridge", "Market Receiver", "Omada AP1 / AP2"].map((step, index) => (
            <li key={step} className="border-t border-white/15 pt-4">
              <span className="text-xs text-white/40">0{index + 1}</span>
              <p className="mt-3 text-xl">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <footer className="flex flex-col gap-5 border-t border-white/10 px-6 py-10 text-base text-white/60 md:flex-row md:items-center md:justify-between md:px-10">
        <p>Uriel Network</p>
        <div className="flex gap-5">
          <Link href="/login">Trader portal</Link>
        </div>
      </footer>
    </div>
  );
}
