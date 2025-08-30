import React from 'react';
import { Link } from 'react-router-dom';
import { Car, ShieldCheck, Clock3, MapPin, CreditCard, ArrowRight } from 'lucide-react';

const Feature = ({ icon: Icon, title, desc }) => (
  <div className="rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm backdrop-blur-sm">
    <div className="mb-3 inline-flex rounded-xl bg-indigo-50 p-2 text-indigo-600">
      <Icon className="h-5 w-5" />
    </div>
    <h3 className="text-slate-800 font-semibold">{title}</h3>
    <p className="mt-1 text-sm text-slate-600">{desc}</p>
  </div>
);

const Step = ({ n, title, desc }) => (
  <div className="relative rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
    <div className="absolute -top-3 -left-3 grid h-8 w-8 place-items-center rounded-full bg-indigo-600 text-white text-sm font-semibold">
      {n}
    </div>
    <h4 className="text-slate-800 font-semibold">{title}</h4>
    <p className="mt-1 text-sm text-slate-600">{desc}</p>
  </div>
);

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-50">

      {/* Hero */}
      <section className="relative">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-16 md:grid-cols-2">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
              Get there faster with <span className="text-indigo-700">RideSphere</span>
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Seamless ride-sharing for drivers and customers. Smart matching, real-time tracking,
              and secure payments—all in one place.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-white font-semibold shadow-sm transition hover:bg-indigo-700"
              >
                Register <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                I already have an account
              </Link>
            </div>

            <p className="mt-3 text-sm text-slate-500">
              Register once and choose your role—driver or customer—anytime.
            </p>
          </div>

          {/* Simple illustrative card */}
          <div className="relative">
            <div className="mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
              <div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-6 py-6 text-white">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-white/10 p-3">
                    <Car className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm/5">Next pickup</p>
                    <p className="text-lg font-semibold">Downtown → Airport</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4 p-6">
                <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                  <div className="flex items-center gap-3 text-slate-700">
                    <MapPin className="h-4 w-4 text-indigo-600" />
                    <span>ETA: 5 mins</span>
                  </div>
                  <span className="text-sm text-slate-500">2.3 miles</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                  <div className="flex items-center gap-3 text-slate-700">
                    <CreditCard className="h-4 w-4 text-indigo-600" />
                    <span>Fare estimate</span>
                  </div>
                  <span className="text-sm text-slate-500">$18–22</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button className="rounded-xl bg-indigo-600 py-2 text-white font-medium hover:bg-indigo-700">
                    Accept
                  </button>
                  <button className="rounded-xl border border-slate-300 bg-white py-2 font-medium text-slate-700 hover:bg-slate-50">
                    Later
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <h2 className="mb-6 text-center text-2xl font-bold text-slate-900">Why RideSphere?</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Feature icon={Clock3} title="Fast matching" desc="Find nearby rides instantly with smart routing." />
          <Feature icon={ShieldCheck} title="Trusted & safe" desc="Verified profiles and secure verification." />
          <Feature icon={MapPin} title="Live tracking" desc="See your driver or customer in real time." />
          <Feature icon={CreditCard} title="Easy payments" desc="Clear fares and secure transactions." />
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 pb-20">
        <h2 className="mb-6 text-center text-2xl font-bold text-slate-900">How it works</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Step n="1" title="Create your account" desc="Register once and choose to be a driver or a customer." />
          <Step n="2" title="Set your trip" desc="Enter pickup and destination or go online to accept rides." />
          <Step n="3" title="Ride & pay" desc="Track in real time and pay securely when you arrive." />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} RideSphere</p>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-slate-700">Login</Link>
            <Link to="/register" className="text-indigo-600 hover:underline">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
