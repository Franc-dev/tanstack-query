/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/actions/heroSlideActions.ts
'use server';

import prisma from '@/lib/prisma';
import { revalidateTag } from 'next/cache';
import { z } from 'zod';
import { type HeroSlide } from '@prisma/client';

// Define the shape of the form state
export interface HeroSlideFormState {
  message: string;
  success?: boolean;
  fieldErrors?: Partial<Record<keyof HeroSlide | 'general', string[]>>; // Allow general errors too
  resetKey?: string; // To help reset form on client for new entries
  slideId?: string; // To return the ID of the created/updated slide
}

// Schema for validating hero slide form data
const HeroSlideSchema = z.object({
  id: z.string().cuid().optional(), // CUID for existing slides being updated
  slideLabel: z.string().optional().nullable(),
  title: z.string().min(1, { message: "Title is required." }),
  subtitle: z.string().optional().nullable(),
  ctaText: z.string().optional().nullable(),
  ctaLink: z.string().url({ message: "CTA Link must be a valid URL if provided." }).optional().or(z.literal('')).nullable(),
  imageUrl: z.string().url({ message: "Image URL must be a valid URL if provided." }).optional().or(z.literal('')).nullable(),
  imageAlt: z.string().optional().nullable(),
  order: z.preprocess(
    (val) => (typeof val === 'string' ? parseInt(val, 10) : val),
    z.number().int().default(0)
  ),
  published: z.preprocess(
    // Converts "true", "on", true to true, others to false
    (val) => String(val).toLowerCase() === 'true' || val === 'on' || val === true,
    z.boolean().default(true)
  ),
});

// Server Action to create or update a hero slide
export async function updateHeroSlideAction(
  prevState: HeroSlideFormState | undefined, // Not directly used here but part of useActionState signature
  formData: FormData
): Promise<HeroSlideFormState> {
  const rawFormData = Object.fromEntries(formData.entries());

  // If an 'id' is present in formData, it means we're updating an existing slide.
  // The schema expects 'id' to be part of the object if it's an update.
  const parsedData = HeroSlideSchema.safeParse(rawFormData);

  if (!parsedData.success) {
    console.error("Validation Errors:", parsedData.error.flatten().fieldErrors);
    return {
      success: false,
      message: "Validation failed. Please check the errors.",
      fieldErrors: parsedData.error.flatten().fieldErrors as any, // Cast for now
    };
  }

  const { id, ...dataToSave } = parsedData.data;

  try {
    let savedSlide: HeroSlide;
    if (id) {
      // Update existing slide
      savedSlide = await prisma.heroSlide.update({
        where: { id },
        data: dataToSave,
      });
      revalidateTag(`heroSlide-${id}`); // Revalidate specific slide
      revalidateTag('heroSlides-admin'); // Revalidate admin list
      revalidateTag('heroSlides-public'); // Revalidate public list
      return {
        success: true,
        message: `Slide "${savedSlide.title}" updated successfully!`,
        slideId: savedSlide.id,
      };
    } else {
      // Create new slide
      savedSlide = await prisma.heroSlide.create({
        data: dataToSave,
      });
      revalidateTag('heroSlides-admin');
      revalidateTag('heroSlides-public');
      return {
        success: true,
        message: `Slide "${savedSlide.title}" created successfully!`,
        resetKey: Date.now().toString(), // For resetting the form after creation
        slideId: savedSlide.id,
      };
    }
  } catch (error) {
    console.error("Database Error:", error);
    return {
      success: false,
      message: 'Database error: Failed to save hero slide. Please try again.',
      fieldErrors: { general: ['An unexpected error occurred.'] }
    };
  }
}

// Server Action to delete a hero slide
export async function deleteHeroSlideAction(slideId: string): Promise<{ success: boolean; message: string }> {
    if (!slideId) {
        return { success: false, message: "Slide ID is required for deletion." };
    }
    try {
        await prisma.heroSlide.delete({
            where: { id: slideId },
        });
        revalidateTag(`heroSlide-${slideId}`);
        revalidateTag('heroSlides-admin');
        revalidateTag('heroSlides-public');
        return { success: true, message: "Slide deleted successfully." };
    } catch (error) {
        console.error("Database Error (Delete):", error);
        return { success: false, message: "Database error: Failed to delete slide." };
    }
}
