import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-savora-beige flex items-center justify-center p-4 font-sans select-none">
      <div className="max-w-md w-full bg-white border border-savora-border rounded-3xl p-8 text-center shadow-xl space-y-6">
        
        {/* Animated Icon Box */}
        <div className="w-20 h-20 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-savora-error mx-auto shadow-sm">
          <ShieldAlert size={40} />
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-heading font-extrabold text-savora-brown leading-none">404</h1>
          <h2 className="text-base font-heading font-semibold text-savora-text-primary">Page Route Not Found</h2>
          <p className="text-xs text-savora-text-secondary leading-relaxed max-w-xs mx-auto">
            The page you are looking for doesn't exist or you don't have permission to access it.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 py-2.5 border border-savora-border hover:bg-savora-card text-savora-brown font-semibold rounded-xl text-xs flex items-center justify-center gap-1 transition-all cursor-pointer bg-white"
          >
            <ArrowLeft size={14} /> Go Back
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 py-2.5 bg-savora-brown hover:bg-savora-taupe text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-all cursor-pointer shadow-md shadow-savora-brown/10"
          >
            <Home size={14} /> Shop Homepage
          </button>
        </div>

      </div>
    </div>
  );
};

export default NotFound;
