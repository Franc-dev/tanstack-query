// components/sections/HeroCarousel.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

export interface HeroSlideData {
  id: string | number;
  title: string;
  subtitle?: string;
  description?: string;
  primaryCta?: {
    text: string;
    href: string;
  };
  secondaryCta?: {
    text: string;
    href: string;
  };
  image: {
    src: string;
    alt: string;
    blurDataURL?: string;
  };
  backgroundColor?: string;
  textColor?: string;
  textAlignment?: 'text-left' | 'text-center' | 'text-right';
  contentOrder?: 'textFirst' | 'imageFirst';
}

interface HeroCarouselProps {
  slides: HeroSlideData[];
  autoPlayDelay?: number;
}

export default function HeroCarousel({ slides = [], autoPlayDelay = 7000 }: HeroCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start' },
    [Autoplay({ delay: autoPlayDelay, stopOnInteraction: true, stopOnMouseEnter: true })]
  );

  const [currentSnap, setCurrentSnap] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const toggleAutoplay = useCallback(() => {
    if (emblaApi) {
      const autoplay = emblaApi.plugins().autoplay;
      if (!autoplay) return;
      if (autoplay.isPlaying()) autoplay.stop();
      else autoplay.play();
      setIsPlaying(autoplay.isPlaying());
    }
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setCurrentSnap(emblaApi.selectedScrollSnap());
    const onAutoplayChange = () => setIsPlaying(!!emblaApi.plugins().autoplay?.isPlaying());

    emblaApi.on('select', onSelect);
    emblaApi.on('autoplay:play', onAutoplayChange);
    emblaApi.on('autoplay:stop', onAutoplayChange);
    if (emblaApi.plugins().autoplay) setIsPlaying(emblaApi.plugins().autoplay.isPlaying());

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('autoplay:play', onAutoplayChange);
      emblaApi.off('autoplay:stop', onAutoplayChange);
    };
  }, [emblaApi]);

  if (!slides || slides.length === 0) {
    return (
      <section className="relative w-full h-[calc(100vh-70px)] max-h-[700px] min-h-[500px] flex items-center justify-center bg-slate-800 text-white">
        <p>No hero slides available.</p>
      </section>
    );
  }

  return (
    <div className="relative w-full overflow-hidden group/carousel ">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex touch-pan-y">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className="relative flex-[0_0_100%] min-w-0" // Embla slide
            >
              <div
                className={`
                  relative flex flex-col md:grid md:grid-cols-2
                  h-[calc(100vh-70px)] min-h-[500px] max-h-[700px] xl:max-h-[750px] overflow-hidden
                  ${slide.backgroundColor || 'bg-slate-900'}
                `}
              >
                {/* Text Content Area */}
                <div
                  className={`
                    flex flex-col justify-center
                    order-2 md:order-${slide.contentOrder === 'imageFirst' ? '2' : '1'}
                    ${slide.textColor || 'text-white'}
                    ${slide.textAlignment || 'text-left'}
                    relative z-10
                    px-6 py-10 sm:px-12 md:px-16 lg:px-20 xl:px-28
                    md:py-16 lg:py-20
                  `}
                >
                  <AnimatePresence mode="wait">
                    {currentSnap === index && (
                      <motion.div
                        key={`content-${slide.id}`}
                        initial={{ opacity: 0, x: slide.contentOrder === 'imageFirst' ? 50 : -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: slide.contentOrder === 'imageFirst' ? -50 : 50 }}
                        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                        className="max-w-md lg:max-w-lg xl:max-w-xl" 
                      >
                        <h1 className="mb-5 text-3xl leading-tight sm:text-4xl md:text-5xl lg:text-[3.2rem] xl:text-[3.6rem] font-extrabold sm:leading-tight md:leading-tight lg:leading-tight xl:leading-tight sm:mb-6 md:mb-7">
                          {slide.title}
                        </h1>
                        {slide.description && (
                          <p className="mb-8 text-base sm:text-lg leading-relaxed text-slate-300 sm:mb-10 md:max-w-md lg:max-w-lg">
                            {slide.description}
                          </p>
                        )}
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-start">
                          {slide.primaryCta && (
                            <Link
                              href={slide.primaryCta.href}
                              className="inline-block bg-sky-500 hover:bg-sky-600 focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-900 text-white font-semibold py-3 px-8 rounded-md text-sm sm:text-base transition duration-300 ease-in-out transform hover:scale-105 text-center"
                            >
                              {slide.primaryCta.text}
                            </Link>
                          )}
                          {slide.secondaryCta && (
                            <Link
                              href={slide.secondaryCta.href}
                              className="inline-block bg-transparent hover:bg-white/10 border border-white/40 hover:border-white/60 focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-slate-900 text-white font-semibold py-3 px-8 rounded-md text-sm sm:text-base transition duration-300 ease-in-out transform hover:scale-105 text-center"
                            >
                              {slide.secondaryCta.text}
                            </Link>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Image Area */}
                <div
                  className={`
                    relative order-1 md:order-${slide.contentOrder === 'imageFirst' ? '1' : '2'}
                    h-60 xs:h-72 sm:h-80 md:h-full min-h-[280px] sm:min-h-[320px]
                  `}
                >
                  <AnimatePresence mode="wait">
                    {currentSnap === index && (
                        <motion.div
                        key={`image-${slide.id}`}
                        className="w-full h-full"
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
                      >
                        <Image
                          src={slide.image.src}
                          alt={slide.image.alt || slide.title || 'Hero image'}
                          fill
                          priority={index === 0}
                          loading={index === 0 ? 'eager' : 'lazy'}
                          className="object-cover"
                          placeholder={slide.image.blurDataURL ? "blur" : "empty"}
                          blurDataURL={slide.image.blurDataURL}
                          sizes="(max-width: 767px) 100vw, 50vw"
                        />
                        {/* MODIFIED OVERLAY DIV BELOW */}
                        <div
                          className={`
                            absolute inset-0
                            bg-gradient-to-t from-slate-900/60 via-slate-900/20 to-transparent
                            ${slide.contentOrder === 'imageFirst' // Image is on the LEFT, Text on the RIGHT on desktop
                              ? `md:bg-gradient-to-l md:from-slate-900 md:via-slate-900/70 md:to-transparent` // Fade image from right edge (slate-900) to left (transparent)
                              : `md:bg-gradient-to-r md:from-slate-900 md:via-slate-900/70 md:to-transparent` // Image is on the RIGHT, Text on the LEFT on desktop. Fade image from left edge (slate-900) to right (transparent)
                            }
                          `}
                          aria-hidden="true"
                        ></div>
                        {/* END OF MODIFIED OVERLAY DIV */}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Controls */}
      {slides.length > 1 && (
        <>
        <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8 flex items-center gap-2 md:gap-3 bg-black/40 backdrop-blur-lg rounded-full p-2 md:p-2.5 z-20">
          <button
            onClick={scrollPrev}
            className="p-2 rounded-full text-white hover:bg-white/20 active:bg-white/30 transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 rounded-full bg-black/50 px-3 py-1 md:px-3.5 text-white">
            <span className="text-xs md:text-sm font-medium select-none tabular-nums">
              {String(currentSnap + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
            </span>
            <button
              onClick={toggleAutoplay}
              className="p-1 rounded-full hover:bg-white/20 active:bg-white/30 transition-colors"
              aria-label={isPlaying ? "Pause autoplay" : "Play autoplay"}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
          </div>
          <button
            onClick={scrollNext}
            className="p-2 rounded-full text-white hover:bg-white/20 active:bg-white/30 transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
          <button
            onClick={scrollPrev}
            className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black/25 hover:bg-black/40 text-white p-3 rounded-full transition-all duration-300 ease-in-out z-20 opacity-0 group-hover/carousel:opacity-100 group-focus-within/carousel:opacity-100 focus:opacity-100 hidden md:block"
            aria-label="Previous slide"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            onClick={scrollNext}
            className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black/25 hover:bg-black/40 text-white p-3 rounded-full transition-all duration-300 ease-in-out z-20 opacity-0 group-hover/carousel:opacity-100 group-focus-within/carousel:opacity-100 focus:opacity-100 hidden md:block"
            aria-label="Next slide"
          >
            <ChevronRight size={28} />
          </button>
        </>
       )}
    </div>
  );
}