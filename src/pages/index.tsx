import Link from "next/link";
import { Button } from "@/src/component/ui/button";
import {
  Zap,
  Layout,
  Search,
  PenTool,
  ArrowRight,
  UserPlus,
  FileEdit,
  Upload,
} from "lucide-react";

import { useAuth } from "@/src/hooks/useAuth";

export default function LandingPage() {

  const { token } = useAuth();

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">

      <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">

              <span className="text-[26px] font-black tracking-tight text-gray-900 flex items-center group">
                WORD
                <span className="relative flex items-center text-indigo-600 ml-0.5">
                  o
                  <span className="-ml-1.5 transition-transform duration-300 ease-out group-hover:translate-x-0.5">
                    o
                  </span>

                
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 
                     bg-indigo-500 rounded-full 
                     opacity-0 group-hover:opacity-100 
                     transition-all duration-300 ease-out">
                  </span>
                </span>
              </span>

            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-primary font-medium transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-600 hover:text-primary font-medium transition-colors">
                How it works
              </a>

              <a href="#testimonials" className="text-gray-600 hover:text-primary font-medium transition-colors">
                Testimonials
              </a>
            </div>

            <div className="flex items-center space-x-4">
              {token ? (
                <Link href="/dashboard">
                  <Button variant="black" size="lg" className="rounded-full px-6 flex items-center gap-2">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-900 font-medium hover:text-primary transition-colors"
                  >
                    Log in
                  </Link>
                  <Link href="/register">
                    <Button variant="black" size="lg" className="rounded-full px-6">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-20 relative overflow-hidden">

        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">


          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8 leading-tight max-w-6xl mx-auto">
            Create and Discover Beautiful Stories with{" "}
            <span className="text-primary">Unlimited Creative Ideas</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto mb-10 leading-relaxed">
            Create beautiful, SEO-optimized blogs in minutes. Multi-tenant
            architecture means your team can manage multiple publications from
            one dashboard.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/dashboard">
              <Button
                variant="black"
                size="lg"
                className="rounded-full px-8 py-4 text-lg h-auto shadow-xl shadow-gray-200 hover:shadow-2xl hover:-translate-y-1 transition-all"
              >
                {token ? "Continue Reading" : "Start reading Free"} <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>

            <Link href={token ? "/dashboard" : "/register"}>
              <Button
                variant="secondary"
                size="lg"
                className="rounded-full px-8 py-4 text-lg h-auto bg-white border-2 border-gray-100 text-gray-700 hover:border-gray-200 hover:bg-gray-50"
              >
                {token ? "Your Feed" : "Get Started"}
              </Button>
            </Link>
          </div>

          <div className="mt-20">
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-8">
              Trusted by writers and teams worldwide
            </p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
              <h3 className="text-2xl font-bold font-serif text-gray-800">
                TechCrunch
              </h3>
              <h3 className="text-2xl font-bold font-serif text-gray-800">
                Forbes
              </h3>
              <h3 className="text-2xl font-bold font-serif text-gray-800 tracking-tighter">
                WIRED
              </h3>
              <h3 className="text-2xl font-bold font-sans text-gray-800 font-black italic">
                The Verge
              </h3>
            </div>
          </div>
        </div>
      </div>


      <div id="features" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-6">
              Everything you need to publish
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Powerful features designed for writers, marketers, and developer
              teams who care about quality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: UserPlus,
                title: "Multi-Tenant Blogs",
                description:
                  "Manage multiple publications and team blogs from a single dashboard. Each blog gets its own custom URL and branding.",
                bg: "bg-purple-100",
                text: "text-purple-600",
              },
              {
                icon: Search,
                title: "SEO-Ready Posts",
                description:
                  "Every post is optimized for search engines with semantic HTML, meta tags, and structured data out of the box.",
                bg: "bg-blue-100",
                text: "text-blue-600",
              },
              {
                icon: PenTool,
                title: "Rich Text Editor",
                description:
                  "Write with a distraction-free Medium-like editor. Support for images, embeds, code blocks, and more.",
                bg: "bg-pink-100",
                text: "text-pink-600",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-8 rounded-3xl bg-white border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-gray-200/60 transition-all hover:-translate-y-1"
              >
                <div
                  className={`w-14 h-14 ${feature.bg} ${feature.text} rounded-2xl flex items-center justify-center mb-6`}
                >
                  <feature.icon size={28} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>


      <div id="how-it-works" className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-6">
              From idea to published in minutes
            </h2>
            <p className="text-xl text-gray-500">
              Getting started is as simple as four steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-indigo-100 -z-0 border-t-2 border-dashed border-indigo-200" />

            {[
              {
                step: "01",
                title: "Sign Up",
                desc: "Create your account in seconds. No credit card required.",
                icon: UserPlus,
              },
              {
                step: "02",
                title: "Create Blog",
                desc: "Set up your blog with a custom URL and branding.",
                icon: Layout,
              },
              {
                step: "03",
                title: "Write",
                desc: "Craft your content with our beautiful rich text editor.",
                icon: FileEdit,
              },
              {
                step: "04",
                title: "Publish",
                desc: "Share your work with the world in one click.",
                icon: Upload,
              },
            ].map((item, i) => (
              <div
                key={i}
                className="relative flex flex-col items-center text-center group z-10"
              >
                <div className="w-24 h-24 bg-white rounded-3xl shadow-lg border border-indigo-50 flex flex-col items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-xs font-bold text-indigo-400 bg-indigo-50 px-2 py-1 rounded-full mb-1">
                    {item.step}
                  </span>
                  <item.icon className="text-primary w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-500 leading-relaxed max-w-[200px]">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>


      <div id="testimonials" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                name: "Sarah Chen",
                role: "Content Director, TechFlow Inc.",
                image: "https://i.pravatar.cc/150?u=sarah",
                quote:
                  "Wordoo has completely transformed how our content team operates. The multi-tenant feature is a game-changer for managing our different brand blogs.",
              },
              {
                name: "Marcus Williams",
                role: "Head of Marketing, StartupHub",
                image: "https://i.pravatar.cc/150?u=marcus",
                quote:
                  "The SEO features out of the box are incredible. We saw a 40% increase in organic traffic within the first month of migrating to BlogForge.",
              },
            ].map((testimonial, i) => (
              <div
                key={i}
                className="bg-gray-50 p-10 rounded-3xl border border-gray-100"
              >
                <div className="flex text-yellow-400 mb-6">
                  {"★★★★★".split("").map((s, i) => (
                    <span key={i} className="text-xl">
                      {s}
                    </span>
                  ))}
                </div>
                <p className="text-xl text-gray-800 font-medium leading-relaxed mb-8">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-200 rounded-full overflow-hidden">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white pt-16 pb-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
            <div className="col-span-2 lg:col-span-2">
                            <span className="text-[26px] font-black tracking-tight text-gray-900 flex items-center group">
                                WORD
                                <span className="relative flex items-center text-indigo-600 ml-0.5">
                                    o
                                    <span className="-ml-1.5 transition-transform duration-300 ease-out group-hover:translate-x-0.5">
                                        o
                                    </span>

                                   
                            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 
                     bg-indigo-500 rounded-full 
                     opacity-0 group-hover:opacity-100 
                     transition-all duration-300 ease-out">
                                    </span>
                                </span>
                            </span>
              <p className="text-gray-500 max-w-xs mb-6">
                The modern blogging platform for teams and creators. Write,
                publish, and grow your audience.
              </p>
            </div>

            {[
              {
                title: "Product",
                links: ["Features", "Pricing", "Examples", "Changelog"],
              },
              {
                title: "Resources",
                links: ["Documentation", "Blog", "API Reference", "Support"],
              },
              {
                title: "Company",
                links: ["About", "Careers", "Contact", "Privacy"],
              },
            ].map((section, i) => (
              <div key={i}>
                <h4 className="font-bold text-gray-900 mb-4 uppercase text-xs tracking-wider">
                  {section.title}
                </h4>
                <ul className="space-y-3 text-sm text-gray-500">
                  {section.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className="hover:text-primary transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>&copy; 2026 BlogForge. All rights reserved.</p>
            <div className="flex gap-1">
              <span>Made with</span>
              <span className="text-red-400">♥</span>
              <span>for creators everywhere</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}