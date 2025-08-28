'use client';

import { useState } from 'react';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the email to your backend
    setIsSubscribed(true);
    setEmail('');
  };

  return (
    <div className="card p-8 text-center max-w-md mx-auto">
      <h3 className="text-2xl font-bold mb-4 hero-text">Stay Updated</h3>
      <p className="opacity-80 mb-6">
        Get the latest updates on new features, battle tournaments, and exclusive RC Cell rewards.
      </p>

      {isSubscribed ? (
        <div className="text-green-400 font-bold">
          ✅ Thanks for subscribing! Check your email for confirmation.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-red-400 text-white placeholder-white/60"
            required
          />
          <button type="submit" className="btn-primary w-full">
            Subscribe to Updates
          </button>
        </form>
      )}
    </div>
  );
}
