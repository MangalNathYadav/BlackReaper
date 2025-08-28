'use client';

import { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Chip } from '@heroui/chip';
import { Avatar } from '@heroui/avatar';
import { motion } from 'framer-motion';
import ThemeToggle from '@/components/ThemeToggle';

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    setIsVisible(true);

    // Ensure theme is applied on page load
    const savedMode = localStorage.getItem('blackreaper_mode') || 'human';
    document.documentElement.setAttribute('data-mode', savedMode);
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const stats = [
    { value: 50000, label: 'Active Ghouls', suffix: '+' },
    { value: 2500000, label: 'RC Cells Earned', suffix: 'M' },
    { value: 15000, label: 'Battles Fought', suffix: '+' },
    { value: 98, label: 'Satisfaction Rate', suffix: '%' }
  ];

  const features = [
    {
      icon: '⏱️',
      title: 'Pomodoro Mastery',
      description: 'Boost your focus with timed work sessions. Earn RC Cells for completed cycles and level up your productivity.'
    },
    {
      icon: '💎',
      title: 'RC Cell Economy',
      description: 'Collect, trade, and spend RC Cells on upgrades, cosmetics, and battle enhancements.'
    },
    {
      icon: '⚔️',
      title: 'Kagune Battles',
      description: 'Challenge other players in turn-based battles. Stake RC Cells and climb the leaderboards.'
    },
    {
      icon: '🎭',
      title: 'Dual Identity',
      description: 'Switch between Human and Ghoul modes. Each mode offers unique features and visual themes.'
    },
    {
      icon: '📓',
      title: 'Ghoul Journal',
      description: 'Record your thoughts in a secure, Ghoul-only journal. Express yourself without judgment.'
    },
    {
      icon: '💬',
      title: 'Ghoul Community',
      description: 'Connect with other Ghouls in realtime chat rooms. Build your network in the shadows.'
    }
  ];

  const testimonials = [
    {
      name: 'Alex Chen',
      role: 'Productivity Enthusiast',
      content: 'BlackReaper transformed how I approach work. The gamification keeps me motivated, and switching to Ghoul mode helps me focus like never before!',
      avatar: 'AC'
    },
    {
      name: 'Sarah Kim',
      role: 'Freelance Designer',
      content: 'The RC Cell system is addictive! I love earning rewards for completing my Pomodoro sessions. The battle system adds just the right amount of competition.',
      avatar: 'SK'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Software Developer',
      content: 'Finally, a productivity app that doesn\'t feel like work. The dark theme and Ghoul aesthetic make it fun to use, and I\'ve never been more productive!',
      avatar: 'MR'
    }
  ];

  return (
    <div className="min-h-screen gradient-bg">
      {/* Navigation */}
      <motion.nav
        className="flex justify-between items-center p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-2xl font-bold hero-text">BlackReaper</div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button color="primary" variant="solid" size="md">
            Get Started
          </Button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="text-center py-20 px-6">
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="space-y-6"
        >
          <motion.h1
            className="text-6xl font-bold hero-text"
            variants={fadeInUp}
          >
            Unleash Your Inner Ghoul
          </motion.h1>
          <motion.p
            className="text-xl max-w-2xl mx-auto opacity-80"
            variants={fadeInUp}
          >
            Transform your productivity with the ultimate gaming-productivity hybrid.
            Earn RC Cells, battle other players, and switch between Human and Ghoul modes.
          </motion.p>
          <motion.div
            className="flex gap-4 justify-center"
            variants={fadeInUp}
          >
            <Button
              color="primary"
              size="lg"
              className="animate-pulse-gentle"
            >
              Start Your Journey
            </Button>
            <Button
              color="default"
              variant="bordered"
              size="lg"
            >
              Learn More
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-black/10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="grid md:grid-cols-4 gap-8 text-center"
            variants={stagger}
            initial="initial"
            animate="animate"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="space-y-2"
              >
                <div className="text-4xl font-bold hero-text">
                  {stat.value.toLocaleString()}{stat.suffix}
                </div>
                <p className="text-sm opacity-70">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-4xl font-bold text-center mb-12 hero-text"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Core Features
          </motion.h2>
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={stagger}
            initial="initial"
            animate="animate"
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full hover:scale-105 transition-transform duration-300">
                  <CardHeader className="pb-2">
                    <div className="text-4xl mb-2">{feature.icon}</div>
                    <h3 className="text-xl font-bold">{feature.title}</h3>
                  </CardHeader>
                  <CardBody>
                    <p className="opacity-80">{feature.description}</p>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-black/5">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            className="text-4xl font-bold mb-12 hero-text"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            How It Works
          </motion.h2>
          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={stagger}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={fadeInUp} className="space-y-4">
              <div className="text-6xl">1️⃣</div>
              <h3 className="text-2xl font-bold">Choose Your Path</h3>
              <p>Start as a Human or embrace your Ghoul nature. Your choice shapes your experience.</p>
            </motion.div>
            <motion.div variants={fadeInUp} className="space-y-4">
              <div className="text-6xl">2️⃣</div>
              <h3 className="text-2xl font-bold">Complete Tasks</h3>
              <p>Use Pomodoro timers to focus and earn RC Cells. Every completed session brings you closer to power.</p>
            </motion.div>
            <motion.div variants={fadeInUp} className="space-y-4">
              <div className="text-6xl">3️⃣</div>
              <h3 className="text-2xl font-bold">Battle & Conquer</h3>
              <p>Challenge others in Kagune battles, climb leaderboards, and unlock exclusive rewards.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-4xl font-bold text-center mb-12 hero-text"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            What Our Ghouls Say
          </motion.h2>
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={stagger}
            initial="initial"
            animate="animate"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full">
                  <CardBody className="space-y-4">
                    <p className="italic opacity-80">"{testimonial.content}"</p>
                    <div className="flex items-center gap-3">
                      <Avatar name={testimonial.avatar} size="sm" />
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm opacity-60">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-red-900/20 to-red-800/20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold hero-text">Stay in the Shadows</h2>
            <p className="text-xl opacity-80">
              Be the first to know about new features, exclusive events, and special RC Cell rewards.
            </p>
            <div className="flex gap-2 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button color="primary" variant="solid">
                Subscribe
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 text-center">
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold hero-text">Ready to Transform?</h2>
          <p className="text-xl max-w-2xl mx-auto opacity-80">
            Join thousands of users who have discovered their inner Ghoul. Start your journey today.
          </p>
          <div className="flex gap-4 justify-center">
            <Button color="primary" size="lg">
              Create Account
            </Button>
            <Button color="default" variant="bordered" size="lg">
              Try Demo
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center space-y-6">
          <div className="text-2xl font-bold hero-text">BlackReaper</div>
          <p className="opacity-80">Where productivity meets darkness. Embrace your true potential.</p>
          <div className="flex justify-center gap-6 text-sm opacity-60">
            <a href="#" className="hover:opacity-100">Privacy Policy</a>
            <a href="#" className="hover:opacity-100">Terms of Service</a>
            <a href="#" className="hover:opacity-100">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
