import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Cloud,
  Share2,
  Bell,
  Search,
  Users,
  FileText,
  ArrowRight,
  LayoutDashboard,
  CheckCircle2,
} from "lucide-react";
import Magnet from "../responsive/Magnet";
import RippleGrid from "../responsive/RippleGrid";

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Mouse position for the 3D tilt effect on the card
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // 1. Check for Authentication Token
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }

    // 2. Mouse Move Logic for 3D Card
    const handleMouseMove = (e) => {
      const x = (window.innerWidth / 2 - e.clientX) / 25;
      const y = (window.innerHeight / 2 - e.clientY) / 25;
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="bg-gray-50 font-sans selection:bg-blue-100 selection:text-blue-700 overflow-x-hidden">
      {/* 2. HERO SECTION (Full Height with RippleGrid) */}
      <section className="relative min-h-screen flex flex-col justify-center pt-20 overflow-hidden">
        {/* --- RIPPLE GRID BACKGROUND (Updated for Light Blue/Clear Look) --- */}
        <div className="absolute inset-0 z-0 bg-gray-700">
          <RippleGrid
            gridColor="#7dd3fc" // Light Sky Blue (removes the dark/gray look)
            opacity={1} // Lower opacity for text readability
            rippleIntensity={0.1}
            mouseInteractionRadius={2}
            gridThickness={15}
            // IMPORTANT: These settings make it full-screen width/height
            vignetteStrength={100} // 0 = No corner fading (Full rectangular coverage)
            fadeDistance={50} // High number = No radial fade from center
            gridSize={12} // Slightly larger grid squares
          />
          {/* 
               Gradient Overlay: 
               Pure White at top -> Semi-transparent White -> Very light Blue at bottom.
               This ensures the "gray" look is gone.
            */}
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white/85 to-blue-50/30 pointer-events-none"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center z-10 mt-10">
          {/* MAGNET 1: The Badge */}
          <Magnet
            padding={50}
            magnetStrength={5}
            wrapperClassName="w-fit mx-auto mb-8"
            innerClassName="cursor-pointer"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm border border-blue-100 text-blue-700 text-sm font-semibold shadow-sm hover:shadow-md transition-shadow">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              v2.0 is now live with Cloud Storage
            </div>
          </Magnet>

          {/* MAIN HEADING */}
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight max-w-4xl drop-shadow-sm">
            Your Digital Life, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              Secured & Organized.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-xl text-gray-800 mb-10 leading-relaxed font-medium">
            Store Aadhaar, PAN, Passports, and medical records in one encrypted
            vault. Access them anywhere, share securely, and never miss an
            expiry date again.
          </p>

          {/* MAGNET 2: CTA BUTTON (Condition: Logged In vs Guest) */}
          <Magnet
            padding={100}
            magnetStrength={10}
            wrapperClassName="w-fit mx-auto"
            innerClassName="block"
          >
            {isLoggedIn ? (
              // --- STATE: LOGGED IN (Green/Emerald Button) ---
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/40 hover:-translate-y-1 transition-all transform ring-4 ring-emerald-50"
              >
                <LayoutDashboard className="w-5 h-5" />
                Go to Dashboard
              </Link>
            ) : (
              // --- STATE: GUEST (Blue/Cyan Button) ---
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-1 transition-all transform"
              >
                Create Free Vault
                <ArrowRight className="w-5 h-5" />
              </Link>
            )}
          </Magnet>

          {isLoggedIn && (
            <div className="mt-6 flex items-center gap-2 text-sm font-medium text-emerald-600 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-emerald-100 shadow-sm animate-fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>You are currently logged in</span>
            </div>
          )}
        </div>
      </section>

      {/* 3. FEATURES GRID */}
      <section id="features" className="py-24 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Enterprise-Grade Features for Everyone
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              We moved beyond simple storage. DigiVault is an intelligent
              document management system designed for your personal life.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Cloud className="w-6 h-6 text-white" />}
              color="bg-blue-500"
              title="Secure Cloud Storage"
              desc="Files are stored in encrypted cloud containers, ensuring 99.9% uptime and instant access."
            />
            <FeatureCard
              icon={<ShieldCheck className="w-6 h-6 text-white" />}
              color="bg-green-500"
              title="Bank-Level Encryption"
              desc="Your documents are encrypted at rest and in transit. We use bcrypt hashing and JWT tokens."
            />
            <FeatureCard
              icon={<Share2 className="w-6 h-6 text-white" />}
              color="bg-purple-500"
              title="Smart Sharing"
              desc="Generate temporary links with expiry timers or share securely with trusted family members."
            />
            <FeatureCard
              icon={<Bell className="w-6 h-6 text-white" />}
              color="bg-orange-500"
              title="Expiry Reminders"
              desc="Never let a Passport or Insurance Policy expire. Get notified via Email and SMS."
            />
            <FeatureCard
              icon={<Search className="w-6 h-6 text-white" />}
              color="bg-cyan-500"
              title="Intelligent Search"
              desc="Find documents instantly by tags, categories, or even upload date. Organization made effortless."
            />
            <FeatureCard
              icon={<Users className="w-6 h-6 text-white" />}
              color="bg-pink-500"
              title="Emergency Access"
              desc="Designate a trusted contact who can access specific documents in case of emergencies."
            />
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS / CTA */}
      <section
        id="how-it-works"
        className="py-24 bg-gray-900 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Ready to organize your life?
              </h2>
              <p className="text-gray-400 text-lg mb-8">
                Join thousands of users who trust DigiVault with their most
                sensitive information. Get started in less than 2 minutes.
              </p>

              <div className="space-y-6">
                <Step
                  number="01"
                  title="Create an Account"
                  desc="Sign up securely using your email and verify via OTP."
                />
                <Step
                  number="02"
                  title="Upload Documents"
                  desc="Scan or upload files. We auto-categorize them for you."
                />
                <Step
                  number="03"
                  title="Access Anytime"
                  desc="Log in from any device. Your files follow you everywhere."
                />
              </div>

              {/* SECOND BUTTON (Bottom CTA) - Also Checks Login Status */}
              <div className="mt-10">
                {isLoggedIn ? (
                  <Link
                    to="/dashboard"
                    className="inline-block px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/30 hover:-translate-y-1"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/signup"
                    className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/30 hover:-translate-y-1"
                  >
                    Get Started Now
                  </Link>
                )}
              </div>
            </div>

            {/* Visual Representation (Abstract Card) */}
            <div className="relative hidden md:block">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 transform rotate-6 rounded-3xl blur-lg opacity-40"></div>
              <div
                className="relative bg-gray-800 border border-gray-700 p-8 rounded-3xl shadow-2xl transition-transform duration-100 ease-out will-change-transform"
                style={{
                  transform: `perspective(1000px) rotateY(${
                    mousePosition.x
                  }deg) rotateX(${mousePosition.y * -1}deg)`,
                }}
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="px-3 py-1 bg-gray-700 rounded-md text-xs text-gray-300">
                    Vault Status: {isLoggedIn ? "Unlocked" : "Locked"}
                  </div>
                </div>

                <div className="space-y-4">
                  <FileRow
                    name="Passport_Scan.pdf"
                    size="2.4 MB"
                    date="Aug 12, 2024"
                    tag="Identity"
                  />
                  <FileRow
                    name="Vaccination_Cert.pdf"
                    size="1.1 MB"
                    date="Sep 05, 2024"
                    tag="Medical"
                  />
                  <FileRow
                    name="Property_Deed.docx"
                    size="5.8 MB"
                    date="Oct 20, 2024"
                    tag="Legal"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="bg-gray-50 pt-16 pb-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                  D
                </div>
                <span className="font-bold text-gray-900 text-xl">
                  DigiVault
                </span>
              </div>
              <p className="text-gray-500 text-sm">
                Securely storing memories and documents since 2024.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>
                  <a href="#" className="hover:text-blue-600">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-600">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>
                  <a href="#" className="hover:text-blue-600">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-600">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="text-center pt-8 border-t border-gray-200">
            <p className="text-gray-400 text-sm">
              © 2024 DigiVault Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

/* --- SUBCOMPONENTS --- */
const FeatureCard = ({ icon, color, title, desc }) => (
  <div className="group p-8 bg-gray-50 rounded-3xl hover:bg-white border border-gray-100 hover:border-blue-100 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 cursor-default">
    <div
      className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-${
        color.split("-")[1]
      }-500/30 group-hover:scale-110 transition-transform`}
    >
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-500 leading-relaxed">{desc}</p>
  </div>
);

const Step = ({ number, title, desc }) => (
  <div className="flex gap-4">
    <span className="text-2xl font-bold text-blue-500 font-mono opacity-50">
      {number}
    </span>
    <div>
      <h4 className="text-xl font-bold text-white mb-1">{title}</h4>
      <p className="text-gray-400 text-sm">{desc}</p>
    </div>
  </div>
);

const FileRow = ({ name, size, date, tag }) => (
  <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-xl border border-gray-600 hover:bg-gray-700 transition-colors">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-gray-800 rounded-lg">
        <FileText className="w-5 h-5 text-blue-400" />
      </div>
      <div>
        <p className="text-sm font-medium text-white">{name}</p>
        <p className="text-xs text-gray-400">
          {size} • {date}
        </p>
      </div>
    </div>
    <span className="text-xs font-semibold px-2 py-1 bg-gray-600 text-gray-300 rounded-md">
      {tag}
    </span>
  </div>
);

export default Home;
