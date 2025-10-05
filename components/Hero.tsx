"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    { 
      image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1920&q=80",
      title: "Blockchain Technology", 
      desc: "Decentralized & Transparent" 
    },
    { 
      image: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=1920&q=80",
      title: "Cryptocurrency", 
      desc: "Digital Financial Revolution" 
    },
    { 
      image: "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?w=1920&q=80",
      title: "NFT Marketplace", 
      desc: "Unique Digital Assets" 
    },
    { 
      image: "https://images.unsplash.com/photo-1644361566696-3d442b5b482a?w=1920&q=80",
      title: "Secure Transactions", 
      desc: "Cryptographic Protection" 
    },
    { 
      image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=1920&q=80",
      title: "Web3 Future", 
      desc: "Decentralized Internet" 
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-[600px] overflow-hidden bg-black">
      <AnimatePresence initial={false}>
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0"
        >
          <img
            src={slides[currentSlide].image}
            alt={slides[currentSlide].title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content Overlay */}
      <div className="relative h-full container mx-auto px-4 flex items-center">
        <motion.div
          key={`content-${currentSlide}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
          className="max-w-2xl text-white"
        >
          <h1 className="text-6xl md:text-7xl font-bold mb-4">
            {slides[currentSlide].title}
          </h1>
          <p className="text-2xl md:text-3xl mb-8 opacity-90">
            {slides[currentSlide].desc}
          </p>
          <div className="flex items-center gap-4">
            <div className="text-5xl font-bold">Filora</div>
            <div className="h-12 w-px bg-white/50" />
            <div className="text-lg opacity-80">Decentralized Digital Asset Marketplace</div>
          </div>
        </motion.div>
      </div>

      {/* Dots Navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide ? "bg-white w-12" : "bg-white/50 w-2"
            }`}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all z-10"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all z-10"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};
