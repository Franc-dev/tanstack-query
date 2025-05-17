/* eslint-disable @typescript-eslint/no-unused-vars */
// components/sections/FeaturedItemsCarousel.tsx
'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ExternalLink, ArrowRight as ArrowRightIcon } from 'lucide-react';
import { type PopulatedFeaturedItem, type CtaButton } from '@/lib/data/featuredItems'; // Your existing types

const TWEEN_FACTOR_SCALE = 0.3; // How much to scale non-active slides
const AUTOPLAY_DELAY = 7000; // Autoplay delay in milliseconds

// Define the structure for a single slide's data adapted for Embla
interface AdaptedFeaturedItem {
  id: string;
  imageUrl: string; // Renamed from 'image'
  title: string;
  smallHeading: string; // Renamed from 'category'
  description: string;
  ctas: CtaButton[]; // Using your existing CtaButton type
  imageAlt?: string | null;
}

interface FeaturedCarouselProps {
  items: PopulatedFeaturedItem[]; // Use your existing PopulatedFeaturedItem
}

// Helper to get button styles based on variant (from previous version, can be adjusted)
const getButtonClasses = (variant?: CtaButton['variant'], isLearnMore?: boolean): string => {
  let baseClasses = "inline-flex items-center justify-center px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-semibold rounded shadow-md hover:shadow-lg transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:ring-sky-500";
  // Styles for buttons on a light background (content box)
  switch (variant) {
    case 'secondary':
      baseClasses += ' bg-transparent border border-slate-700 text-slate-700 hover:bg-slate-700 hover:text-white';
      break;
    case 'outline':
      baseClasses += ' border border-sky-600 text-sky-600 hover:bg-sky-600 hover:text-white';
      break;
    case 'link':
      baseClasses = 'inline-flex items-center text-sky-600 hover:text-sky-700 text-xs sm:text-sm font-semibold group p-0';
      break;
    case 'primary':
    default:
      baseClasses += ' bg-sky-600 hover:bg-sky-700 text-white';
      break;
  }
  return baseClasses;
};


export default function FeaturedItemsCarousel({ items }: FeaturedCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    containScroll: 'trimSnaps',
    duration: 25, // Smoothness of scroll
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tweenValues, setTweenValues] = useState<number[]>([]); // For scale/opacity effects

  // Map your PopulatedFeaturedItem to the structure expected by the carousel logic
  const adaptedItems: AdaptedFeaturedItem[] = items.map(item => ({
    id: item.id,
    imageUrl: item.imageUrl,
    title: item.title,
    smallHeading: item.smallHeading || '', // Provide a fallback
    description: item.description || '', // Provide a fallback
    ctas: item.ctas || [], // Provide a fallback
    imageAlt: item.imageAlt,
  }));

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onScroll = useCallback(() => {
    if (!emblaApi) return;
    const engine = emblaApi.internalEngine();
    const scrollProgress = emblaApi.scrollProgress();

    const getTweenValues = (scrollSnap: number) => {
        let diffToTarget = scrollSnap - scrollProgress;
        if (engine.options.loop) {
            engine.slideLooper.loopPoints.forEach((loopItem) => {
                const target = loopItem.target();
                if (scrollSnap === target && target !== 0) {
                    const sign = Math.sign(target);
                    if (sign === -1) diffToTarget = scrollSnap - (1 + scrollProgress);
                    if (sign === 1) diffToTarget = scrollSnap + (1 - scrollProgress);
                }
            });
        }
        // Adjust scale: less aggressive, more subtle fade for non-active
        const scale = 1 - Math.abs(diffToTarget * TWEEN_FACTOR_SCALE);
        return Math.max(0.7, scale); // Ensure non-active slides are still somewhat visible
    };
    setTweenValues(emblaApi.scrollSnapList().map(getTweenValues));
  }, [emblaApi, setTweenValues]);


  useEffect(() => {
    if (!emblaApi) return;

    onSelect();
    onScroll(); // Initialize tween values
    emblaApi.on('select', onSelect);
    emblaApi.on('scroll', onScroll);
    emblaApi.on('reInit', () => { onSelect(); onScroll(); });


    let autoplayInterval: NodeJS.Timeout | null = null;
    const startAutoplay = () => {
      stopAutoplay(); // Clear any existing interval
      if (items.length <= 1) return; // Don't autoplay if only one or no items
      autoplayInterval = setInterval(() => {
        if (emblaApi) { // Check if emblaApi is available
            if (emblaApi.canScrollNext()) {
                emblaApi.scrollNext();
            } else {
                emblaApi.scrollTo(0); // Loop back to the first slide
            }
        }
      }, AUTOPLAY_DELAY);
    };

    const stopAutoplay = () => {
      if (autoplayInterval) clearInterval(autoplayInterval);
      autoplayInterval = null;
    };

    const onUserInteraction = () => {
        stopAutoplay();
        // Optionally restart autoplay after a delay if desired
        // setTimeout(startAutoplay, AUTOPLAY_DELAY * 2);
    };

    emblaApi.on('pointerDown', onUserInteraction);
    // If you want autoplay to resume after interaction, you might need more logic here
    // or remove the stopAutoplay on pointerDown if continuous play is preferred.

    startAutoplay(); // Start autoplay initially

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('scroll', onScroll);
      emblaApi.off('reInit', onSelect);
      emblaApi.off('pointerDown', onUserInteraction);
      stopAutoplay(); // Clean up interval on component unmount
    };
  }, [emblaApi, onSelect, onScroll, items.length]);

  if (!adaptedItems || adaptedItems.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full bg-slate-100 overflow-hidden"> {/* Section background */}
      {/* Optional Section Title (if needed above the carousel) */}
      <h2 className="text-3xl font-bold text-slate-800 text-center py-8 md:py-8">Featured Products & Solutions</h2>

      <div className="embla relative py-8 md:py-12" ref={emblaRef}>
        <div className="embla__container flex -ml-4"> {/* Negative margin to counteract slide padding */}
          {adaptedItems.map((item, index) => (
            <div
              key={item.id}
              className="embla__slide flex-[0_0_100%] sm:flex-[0_0_90%] md:flex-[0_0_85%] lg:flex-[0_0_75%] min-w-0 relative pl-4 transition-opacity duration-300"
              style={{
                // Apply opacity based on tweenValues for a fade effect
                opacity: tweenValues.length ? tweenValues[index] : 1,
                // transform: `scale(${tweenValues.length ? tweenValues[index] : 1})`, // Optional: re-add scale if desired
              }}
            >
              <div className="relative h-[65vh] min-h-[500px] max-h-[650px] rounded-lg overflow-hidden shadow-2xl bg-slate-800">
                <Image
                  src={item.imageUrl}
                  alt={item.imageAlt || item.title}
                  fill
                  className="object-cover"
                  priority={index === 0} // Prioritize first image
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                />
                {/* Gradient overlay from left, as in Dell screenshot */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

                {/* Content Box - Styled to match Dell screenshot */}
                <div className="absolute top-1/2 -translate-y-1/2 left-0 md:left-[5%] lg:left-[8%]
                                w-[85%] max-w-xs sm:w-[70%] sm:max-w-sm md:max-w-md lg:max-w-lg
                                bg-white p-6 sm:p-8 rounded-r-md md:rounded-md shadow-xl text-slate-800">
                  {item.smallHeading && (
                    <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-sky-600 mb-1 sm:mb-2">
                      {item.smallHeading}
                    </p>
                  )}
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-slate-900 mb-2 sm:mb-3 leading-tight">
                    {item.title}
                  </h2>
                  {item.description && (
                    <p className="text-sm text-slate-600 mb-4 sm:mb-6 leading-relaxed line-clamp-3">
                      {item.description}
                    </p>
                  )}
                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    {item.ctas && item.ctas.length > 0 && (
                      <div className="flex flex-wrap gap-3 items-center">
                        {item.ctas.map((cta, ctaIndex) => {
                          const isExternal = cta.url.startsWith('http');
                          const isLearnMoreStyle = cta.text.toLowerCase().includes('learn more');
                          return (
                            <Link
                              key={ctaIndex}
                              href={cta.url}
                              target={isExternal ? '_blank' : undefined}
                              rel={isExternal ? 'noopener noreferrer' : undefined}
                              className={`${getButtonClasses(isLearnMoreStyle ? 'link' : cta.variant, isLearnMoreStyle)}`}
                            >
                              {cta.text}
                              {isLearnMoreStyle && <ArrowRightIcon size={14} className="ml-1 transition-transform duration-200 group-hover:translate-x-0.5" />}
                              {isExternal && !isLearnMoreStyle && <ExternalLink size={12} className="ml-1 opacity-70" />}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                    {/* Controls: Arrows + Indicators, grouped at bottom-left of content box */}
                    {adaptedItems.length > 1 && (
                        <div className="flex items-center space-x-3 mt-4 sm:mt-0 self-start sm:self-end">
                            <button
                                onClick={scrollPrev}
                                className="bg-slate-800/80 hover:bg-slate-900/90 text-white p-2.5 rounded-full transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 backdrop-blur-sm"
                                aria-label="Previous feature"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                onClick={scrollNext}
                                className="bg-slate-800/80 hover:bg-slate-900/90 text-white p-2.5 rounded-full transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 backdrop-blur-sm"
                                aria-label="Next feature"
                            >
                                <ChevronRight size={18} />
                            </button>
                            {/* Indicators next to arrows */}
                            <div className="flex gap-1.5 items-center">
                                {adaptedItems.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => scrollTo(index)}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ease-in-out
                                                ${index === currentIndex ? 'bg-slate-700 scale-125' : 'bg-slate-700/40 hover:bg-slate-700/70'}`}
                                    aria-label={`Go to feature ${index + 1}`}
                                />
                                ))}
                            </div>
                        </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}