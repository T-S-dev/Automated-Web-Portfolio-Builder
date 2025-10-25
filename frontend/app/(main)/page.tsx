import Link from "next/link";
import { ArrowRight, Upload, Palette, Share2, Sparkles, Zap, Shield } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* HERO SECTION */}
      <section className="relative flex flex-col items-center justify-center px-6 py-24 text-center lg:py-32">
        <div className="from-primary/10 via-background to-background absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))]" />

        <Badge variant="secondary" className="mb-6 gap-2 px-4 py-2">
          <Sparkles className="h-3.5 w-3.5" />
          <span className="text-sm">Transform your resume into a stunning portfolio</span>
        </Badge>

        <h1 className="mb-6 max-w-4xl text-5xl font-bold tracking-tight text-balance lg:text-7xl">
          Your Professional Portfolio in Seconds
        </h1>

        <p className="text-muted-foreground mb-10 max-w-2xl text-lg leading-relaxed text-pretty lg:text-xl">
          Upload your resume, choose from beautiful templates, and instantly generate a professional web portfolio that
          showcases your work and experience.
        </p>

        <Link href="/sign-up">
          <Button size="lg" className="group gap-2 px-8">
            Get Started Free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>

        {/* Trust Indicators */}
        <div className="text-muted-foreground mt-16 flex flex-wrap items-center justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <Zap className="text-primary h-4 w-4" />
            <span>Lightning fast setup</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="text-primary h-4 w-4" />
            <span>Secure & private</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="text-primary h-4 w-4" />
            <span>No coding required</span>
          </div>
        </div>
      </section>

      {/* VIDEO DEMO SECTION */}
      <section className="flex flex-col items-center px-6 py-20 lg:py-28">
        <div className="mb-6 text-center">
          <Badge variant="outline" className="mb-4">
            See it in action
          </Badge>
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-balance lg:text-5xl">Watch How Easy It Is</h2>
          <p className="text-muted-foreground text-lg text-pretty">
            From resume upload to live portfolio in under 60 seconds
          </p>
        </div>

        <div className="w-full max-w-5xl">
          <div className="border-border bg-card relative overflow-hidden rounded-2xl border shadow-2xl">
            <div className="from-primary/5 to-accent/5 absolute inset-0 bg-gradient-to-tr" />
            <video
              autoPlay
              muted
              loop
              playsInline
              aria-label="Portfolio creation demo video"
              className="relative w-full"
            >
              <source src="/SeeItInAction.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="px-6 py-20 lg:py-28">
        <div className="mb-16 text-center">
          <Badge variant="outline" className="mb-4">
            Simple process
          </Badge>
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-balance lg:text-5xl">Three Steps to Success</h2>
          <p className="text-muted-foreground text-lg text-pretty">
            Create your professional portfolio in minutes, not hours
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          <div className="group border-border bg-card hover:border-primary/50 relative overflow-hidden rounded-2xl border p-8 transition-all hover:shadow-lg">
            <div className="bg-primary/5 absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full transition-transform group-hover:scale-150" />
            <div className="relative">
              <div className="bg-primary/10 text-primary mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl">
                <Upload className="h-7 w-7" />
              </div>
              <div className="mb-2 flex items-center gap-3">
                <span className="text-muted-foreground/30 text-4xl font-bold">01</span>
                <h3 className="text-2xl font-bold">Upload Resume</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed text-pretty">
                Simply drag and drop your PDF resume. Our AI extracts all the important information automatically.
              </p>
            </div>
          </div>

          <div className="group border-border bg-card hover:border-primary/50 relative overflow-hidden rounded-2xl border p-8 transition-all hover:shadow-lg">
            <div className="bg-primary/5 absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full transition-transform group-hover:scale-150" />
            <div className="relative">
              <div className="bg-primary/10 text-primary mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl">
                <Palette className="h-7 w-7" />
              </div>
              <div className="mb-2 flex items-center gap-3">
                <span className="text-muted-foreground/30 text-4xl font-bold">02</span>
                <h3 className="text-2xl font-bold">Choose Template</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed text-pretty">
                Select from our collection of professionally designed templates that match your style and industry.
              </p>
            </div>
          </div>

          <div className="group border-border bg-card hover:border-primary/50 relative overflow-hidden rounded-2xl border p-8 transition-all hover:shadow-lg">
            <div className="bg-primary/5 absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full transition-transform group-hover:scale-150" />
            <div className="relative">
              <div className="bg-primary/10 text-primary mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl">
                <Share2 className="h-7 w-7" />
              </div>
              <div className="mb-2 flex items-center gap-3">
                <span className="text-muted-foreground/30 text-4xl font-bold">03</span>
                <h3 className="text-2xl font-bold">Publish & Share</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed text-pretty">
                Get your unique portfolio link instantly. Share it with employers, clients, or on social media.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="px-6 py-20 lg:py-28">
        <div className="border-border from-card to-card/50 mx-auto max-w-4xl rounded-3xl border bg-gradient-to-br p-12 text-center shadow-xl lg:p-16">
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-balance lg:text-5xl">Ready to Stand Out?</h2>
          <p className="text-muted-foreground mb-8 text-lg leading-relaxed text-pretty">
            Join thousands of professionals who have already created their stunning portfolios
          </p>
          <Link href="/sign-up">
            <Button size="lg" className="group gap-2 px-8">
              Create Your Portfolio Now
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
