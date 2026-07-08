import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Utensils, Phone, Mail, MapPin, ExternalLink } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  icon: string;
}

interface Product {
  id: number;
  code: string;
  name: string;
  price: number;
  description: string;
  image_path: string;
  status: string;
  category_id: number;
  category_name?: string;
}

const CustomerMenu: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedCats = await api.getCategories();
        const fetchedProds = await api.getProducts({ status: 'Available' });
        setCategories(fetchedCats);
        setProducts(fetchedProds);
      } catch (err) {
        console.error('Error fetching public menu data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category_id === selectedCategory)
    : products;

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
          <Link to="/" className="hover:text-savora-brown transition-colors">Home</Link>
          <Link to="/menu" className="hover:text-savora-brown transition-colors text-savora-brown font-bold border-b-2 border-savora-brown pb-1">Menu</Link>
          <a href="#location-info" className="hover:text-savora-brown transition-colors">Visit Us</a>
        </div>
      </nav>

      {/* Menu Header Banner */}
      <header className="relative bg-gradient-to-br from-savora-brown to-savora-taupe text-white overflow-hidden py-12 px-6 md:px-12 text-center border-b-8 border-savora-peach">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-savora-peach/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-savora-peach/15 rounded-full blur-3xl"></div>

        <div className="relative max-w-4xl mx-auto flex flex-col items-center">
          <span className="text-[10px] uppercase font-bold tracking-widest text-savora-peach bg-white/10 px-3 py-1 rounded-full mb-3">Freshly Prepared</span>
          <h1 className="font-heading font-bold text-3xl md:text-4xl tracking-wide text-savora-peach">
            OUR DIGITAL MENU
          </h1>
          <p className="text-xs md:text-sm font-light italic text-savora-card/90 mt-2 max-w-md">
            Explore our curated selection of signature bakes, premium ice creams, and ice bay treats.
          </p>
        </div>
      </header>

      {/* Menu / Categories section */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 md:px-8 py-10">
        
        {loading ? (
          <div className="space-y-6">
            <div className="flex gap-3 justify-center overflow-x-auto py-2">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="w-28 h-10 rounded-full animate-shimmer bg-savora-border/40"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-white rounded-2xl border border-savora-border overflow-hidden h-72 space-y-3">
                  <div className="h-40 bg-savora-border/40 animate-shimmer"></div>
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-savora-border/40 animate-shimmer w-3/4"></div>
                    <div className="h-3 bg-savora-border/40 animate-shimmer w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Categories filters */}
            <div className="flex gap-3 justify-center overflow-x-auto py-3 select-none">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-5 py-2 rounded-full font-bold transition-all text-xs cursor-pointer border shrink-0 ${
                  selectedCategory === null
                    ? 'bg-savora-brown border-savora-brown text-white shadow-sm'
                    : 'bg-white border-savora-border text-savora-text-secondary hover:bg-savora-card'
                }`}
              >
                All Bakes & Cups
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-5 py-2 rounded-full font-bold transition-all text-xs cursor-pointer border shrink-0 ${
                    selectedCategory === cat.id
                      ? 'bg-savora-brown border-savora-brown text-white shadow-sm'
                      : 'bg-white border-savora-border text-savora-text-secondary hover:bg-savora-card'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Products grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white border border-savora-border rounded-3xl p-12 text-center shadow-sm max-w-md mx-auto my-12 flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-savora-card border border-savora-border flex items-center justify-center text-savora-beige mb-3">
                  <Utensils size={28} />
                </div>
                <h4 className="font-heading font-semibold text-savora-brown">No products available at the moment</h4>
                <p className="text-xs text-savora-text-secondary mt-1 max-w-[280px]">
                  Our kitchen is baking new treats. Please check back later or visit our cashier counter.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
                {filteredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="bg-white border border-savora-border rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div className="relative bg-savora-card/10 h-44 flex items-center justify-center overflow-hidden">
                      {prod.image_path ? (
                        <img
                          src={`http://localhost:5000${prod.image_path}`}
                          alt={prod.name}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23CCBEB1" stroke-width="1"><path d="M12 2L2 22h20L12 2zm0 3l7.5 15h-15L12 5z"/></svg>';
                          }}
                        />
                      ) : (
                        <Utensils size={40} className="text-savora-beige" />
                      )}
                      <span className="absolute top-3 right-3 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/95 text-savora-brown shadow-sm border border-savora-border">
                        {prod.category_name || 'Bakes'}
                      </span>
                    </div>

                    <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
                      <div>
                        <h4 className="font-heading font-bold text-savora-brown text-sm">{prod.name}</h4>
                        <p className="text-[10px] text-savora-text-secondary line-clamp-2 mt-1 leading-relaxed">
                          {prod.description || 'Delicate artisanal creation baked fresh daily with carefully selected local ingredients.'}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-savora-border/40 flex items-center justify-between">
                        <span className="font-heading font-bold text-savora-brown text-sm">₹{prod.price.toFixed(2)}</span>
                        <span className="text-[8px] uppercase tracking-widest font-bold text-savora-success bg-green-50 border border-green-200 px-2 py-0.5 rounded">
                          View Only
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Info Sections */}
      <section id="location-info" className="bg-savora-card py-12 px-6 border-t border-savora-border select-none">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex gap-3">
            <MapPin className="text-savora-brown shrink-0" size={24} />
            <div>
              <h5 className="font-heading font-semibold text-sm text-savora-brown">Visit Us</h5>
              <p className="text-xs text-savora-text-secondary mt-1 leading-relaxed">
                Shop No 14, Savora Ice Bay Arcade, Beach Road, Kochi, Kerala.
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

      {/* Elegant Footer */}
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

export default CustomerMenu;
