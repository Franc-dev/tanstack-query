/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/actions/heroActions.ts
'use server';

import { revalidateTag } from 'next/cache';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { HeroSlide } from '@prisma/client';

const HeroFormSchema = z.object({
  id: z.string().cuid().optional(),
  slideLabel: z.string().optional().nullable(),
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional().nullable(),
  ctaText: z.string().optional().nullable(),
  ctaLink: z.string().url("Must be a valid URL if provided").optional().or(z.literal('')).nullable(),
  imageUrl: z.string().url("Must be a valid URL if provided").optional().or(z.literal('')).nullable(),
  imageAlt: z.string().optional().nullable(),
  order: z.number().int().default(0),
  published: z.preprocess((val) => String(val).toLowerCase() === 'true' || val === 'on' || val === true, z.boolean()),
});

export type HeroFormState = {
    message?: string;
    success?: boolean;
    fieldErrors?: Partial<Record<keyof HeroSlide, string[]>>;
    resetKey?: string;
    slideId?: string;
}

export async function updateHeroSection(
    prevState: HeroFormState | undefined,
    formData: FormData
): Promise<HeroFormState> {
  const rawFormData = Object.fromEntries(formData.entries());

  const validatedFields = HeroFormSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    console.error("Validation Errors:", validatedFields.error.flatten().fieldErrors);
    return {
      success: false,
      message: "Validation failed. Please check the errors below.",
      fieldErrors: validatedFields.error.flatten().fieldErrors as any,
    };
  }

  const { id, ...dataToSave } = validatedFields.data;

  try {
    const savedSlide = id 
      ? await prisma.heroSlide.update({
          where: { id },
          data: dataToSave,
        })
      : await prisma.heroSlide.create({
          data: dataToSave,
        });

    revalidateTag(`heroSlide-${savedSlide.id}`);
    revalidateTag('heroSlides-admin');
    revalidateTag('heroSlides-public');

    return {
        success: true,
        message: 'Hero slide updated successfully!',
        resetKey: Date.now().toString(),
        slideId: savedSlide.id,
    };
  } catch (error) {
    console.error("Database Error:", error);
    return {
        success: false,
        message: 'Database error: Failed to save hero slide.'
    };
  }
}