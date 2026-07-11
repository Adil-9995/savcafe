import React from 'react';
import { Link } from 'react-router-dom';
import { Utensils, Phone, Mail, MapPin, ExternalLink, Award, Sparkles, Heart } from 'lucide-react';

const CustomerHome: React.FC = () => {
  return (
    <div className="min-h-screen bg-savora-card flex flex-col font-sans">
      
      {/* Header Navigation Bar */}
      <nav className="no-print bg-white border-b border-savora-border px-6 md:px-12 py-4 flex items-center justify-between select-none shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-savora-brown text-savora-peach flex items-center justify-center font-heading font-extrabold text-lg">S</div>
          <div className="flex flex-col leading-none">
            <span className="font-heading font-semibold text-sm tracking-wide text-savora-brown">SAVORA</span>
            <span className="text-[8px] text-savora-text-secondary uppercase tracking-widest font-semibold">Bakery & Ice Bay</span>
          </div>
        </div>
        <div className="flex items-center gap-6 text-xs font-semibold text-savora-text-secondary">
          <Link to="/" className="hover:text-savora-brown transition-colors text-savora-brown font-bold border-b-2 border-savora-brown pb-1">Home</Link>
          <Link to="/menu" className="hover:text-savora-brown transition-colors">Menu</Link>
          <a href="#location-info" className="hover:text-savora-brown transition-colors">Visit Us</a>
        </div>
      </nav>

      {/* Premium Hero Banner */}
      <header className="relative bg-gradient-to-br from-savora-brown to-savora-taupe text-white overflow-hidden py-20 px-6 md:px-12 text-center border-b-8 border-savora-peach">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-savora-peach/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-savora-peach/15 rounded-full blur-3xl"></div>

        <div className="relative max-w-4xl mx-auto flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-savora-peach text-savora-brown flex items-center justify-center font-heading font-extrabold text-3xl shadow-lg mb-4">
            S
          </div>
          <h1 className="font-heading font-bold text-4xl md:text-5xl tracking-wide text-savora-peach">
            SAVORA
          </h1>
          <p className="font-heading text-lg md:text-xl font-medium tracking-wider text-savora-beige mt-2">
            Bakery & Ice Bay Ice Creams
          </p>
          <div className="w-24 h-1 bg-savora-peach/50 my-4 rounded-full"></div>
          <p className="text-sm md:text-base font-light italic text-savora-card/90 max-w-lg leading-relaxed">
            "Freshly Baked Delights & Premium Ice Creams Handcrafted with Love"
          </p>
          
          <Link
            to="/menu"
            className="mt-8 px-6 py-3 bg-savora-peach text-savora-brown hover:bg-white font-bold rounded-2xl shadow-lg transition-colors flex items-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
          >
            <Utensils size={14} /> Explore Our Menu
          </Link>
        </div>
      </header>

      {/* Brand Highlights Section */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-6 py-16 space-y-16">
        
        {/* Core Value Statement */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[10px] uppercase font-bold tracking-widest text-savora-taupe flex items-center justify-center gap-1.5">
            <Sparkles size={12} /> Artisanal Quality
          </span>
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-savora-brown">Baking Joy, Churning Happiness</h2>
          <p className="text-xs md:text-sm text-savora-text-secondary leading-relaxed">
            For years, Savora has been Kollam's favorite spot for fresh oven bakes and real dairy ice creams. We source local farm cream, real vanilla extract, and high-quality chocolate to create memorable dessert moments.
          </p>
        </div>

        {/* Highlight Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="bg-white border border-savora-border p-6 rounded-3xl shadow-sm text-center space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-savora-peach/30 rounded-2xl flex items-center justify-center text-savora-brown mx-auto">
              <Award size={24} />
            </div>
            <h3 className="font-heading font-bold text-sm text-savora-brown">Fresh Oven Bakes</h3>
            <p className="text-[11px] text-savora-text-secondary leading-relaxed">
              Artisanal breads, cookies, croissants, and celebration cakes baked daily using old-school sourdough and traditional recipes.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-savora-border p-6 rounded-3xl shadow-sm text-center space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-savora-peach/30 rounded-2xl flex items-center justify-center text-savora-brown mx-auto">
              <Utensils size={24} />
            </div>
            <h3 className="font-heading font-bold text-sm text-savora-brown">Premium Ice Bay</h3>
            <p className="text-[11px] text-savora-text-secondary leading-relaxed">
              Rich, creamy gelatos and premium ice cream churns. From classic chocolate fudge to seasonal fruit flavors.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-savora-border p-6 rounded-3xl shadow-sm text-center space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-savora-peach/30 rounded-2xl flex items-center justify-center text-savora-brown mx-auto">
              <Heart size={24} />
            </div>
            <h3 className="font-heading font-bold text-sm text-savora-brown">Handcrafted with Love</h3>
            <p className="text-[11px] text-savora-text-secondary leading-relaxed">
              No artificial preservatives or synthetic flavoring. Pure ingredients crafted with dedication for sweet celebration logs.
            </p>
          </div>

        </div>

        {/* CTA Display */}
        <div className="bg-savora-card rounded-3xl p-8 md:p-12 text-center border border-savora-border flex flex-col items-center space-y-4">
          <h3 className="text-lg font-heading font-bold text-savora-brown">Bespoke Cakes & Special Order Bookings</h3>
          <p className="text-xs text-savora-text-secondary max-w-md leading-relaxed">
            Planning a birthday, anniversary, or corporate event? Speak directly to our chef decorators for custom bakes and multi-flavored ice cream tubs.
          </p>
          <Link
            to="/menu"
            className="px-6 py-2.5 bg-savora-brown hover:bg-savora-taupe text-white font-bold rounded-xl shadow transition-colors text-xs inline-flex items-center gap-1.5 cursor-pointer uppercase"
          >
            Check Out Bakes & Prices
          </Link>
        </div>

      </main>

      {/* Info Sections */}
      <section id="location-info" className="bg-savora-card py-12 px-6 border-t border-savora-border select-none">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex gap-3">
            <MapPin className="text-savora-brown shrink-0" size={24} />
            <div>
              <h5 className="font-heading font-semibold text-sm text-savora-brown">Visit Us</h5>
              <p className="text-xs text-savora-text-secondary mt-1 leading-relaxed">
                Savora Cafe & Bakers, Asramam, Near Younis Convention Centre, Kollam, Kerala. Pincode: 691002
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Phone className="text-savora-brown shrink-0" size={24} />
            <div>
              <h5 className="font-heading font-semibold text-sm text-savora-brown">Call Us</h5>
              <p className="text-xs text-savora-text-secondary mt-1 leading-relaxed">
                +91 98765 43210 <br /> +91 484 234567
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Mail className="text-savora-brown shrink-0" size={24} />
            <div>
              <h5 className="font-heading font-semibold text-sm text-savora-brown">Write to Us</h5>
              <p className="text-xs text-savora-text-secondary mt-1 leading-relaxed truncate">
                savoracafeandice@gmail.com <br /> support@savora.in
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <ExternalLink className="text-savora-brown shrink-0" size={24} />
            <div>
              <h5 className="font-heading font-semibold text-sm text-savora-brown">Staff Area</h5>
              <Link to="/login" className="text-xs text-savora-brown hover:text-savora-taupe underline font-bold mt-1 block">
                Workspace Sign In &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Elegant, Low-Contrast Footer */}
      <footer className="bg-savora-brown text-savora-beige/40 py-8 px-6 text-center text-xs border-t border-savora-border/10">
        <div className="max-w-4xl mx-auto space-y-4">
          <p className="font-heading text-savora-beige/60 font-medium">SAVORA Bakery & Ice Bay Ice Creams</p>
          <p className="text-[10px] max-w-sm mx-auto leading-relaxed text-savora-beige/30">
            © 2026 SAVORA Cafe & Ice Bay. All rights reserved. Designed to deliver fresh delights daily.
          </p>
          
          <div className="flex justify-center items-center gap-6 pt-4 border-t border-savora-border/5 text-[10px] font-medium tracking-wide">
            <a href="#" className="hover:text-savora-peach transition-colors">About Us</a>
            <a href="#" className="hover:text-savora-peach transition-colors">Contact</a>
            <a href="#" className="hover:text-savora-peach transition-colors">Location</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default CustomerHome;
