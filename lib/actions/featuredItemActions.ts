/* eslint-disable @typescript-eslint/no-unused-vars */
// lib/actions/featuredItemActions.ts
'use server';

import prisma from '@/lib/prisma';
import { revalidateTag } from 'next/cache';
import { z } from 'zod';
import { type FeaturedItem } from '@prisma/client';

// Define the shape of the form state
export interface FeaturedItemFormState {
  message: string;
  success?: boolean;
  fieldErrors?: Partial<Record<keyof FeaturedItem | 'ctas' | 'general', string[]>>;
  item?: FeaturedItem;
}

// Schema for individual CTAs
const CtaSchema = z.object({
  text: z.string().min(1, "CTA text cannot be empty."),
  url: z.string().min(1, "CTA URL cannot be empty.").refine(value =>
    value.startsWith('/') || value.startsWith('http://') || value.startsWith('https://'),
    { message: "CTA URL must be a relative path or an absolute URL." }
  ),
  variant: z.enum(['primary', 'secondary', 'outline', 'ghost', 'link']).default('primary').optional(),
});

// Main schema for the FeaturedItem
const FeaturedItemSchema = z.object({
  id: z.string().cuid().optional(),
  adminLabel: z.string().optional().nullable(),
  smallHeading: z.string().optional().nullable(),
  title: z.string().min(1, { message: "Title is required." }),
  description: z.string().optional().nullable(),
  imageUrl: z.string().url({ message: "Image URL must be a valid URL." }),
  imageAlt: z.string().optional().nullable(),
  ctas: z.string().optional().transform((str, ctx) => { // Expect JSON string from form
    if (!str || str.trim() === "") return []; // Default to empty array if no input
    try {
      const parsed = JSON.parse(str);
      const result = z.array(CtaSchema).safeParse(parsed);
      if (!result.success) {
        result.error.issues.forEach(issue => {
          ctx.addIssue({
            ...issue,
            path: ['ctas', ...issue.path], // Prepend 'ctas' to the path for better error reporting
          });
        });
        return z.NEVER; // Indicates parsing or validation failed
      }
      return result.data;
    } catch (e) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid JSON format for CTAs. Please ensure it's a valid array of objects.",
        path: ['ctas'],
      });
      return z.NEVER;
    }
  }),
  order: z.preprocess(
    (val) => (typeof val === 'string' && val.trim() !== '' ? parseInt(val.trim(), 10) : (typeof val === 'number' ? val : 0)),
    z.number().int().default(0)
  ),
  published: z.preprocess(
    (val) => String(val).toLowerCase() === 'true' || val === 'on' || val === true,
    z.boolean().default(true)
  ),
});

// Server Action to create or update a FeaturedItem
export async function upsertFeaturedItemAction(
  prevState: FeaturedItemFormState | undefined,
  formData: FormData
): Promise<FeaturedItemFormState> {
  const rawFormData = {
    id: formData.get('id') || undefined, // Handle potential null from get
    adminLabel: formData.get('adminLabel'),
    smallHeading: formData.get('smallHeading'),
    title: formData.get('title'),
    description: formData.get('description'),
    imageUrl: formData.get('imageUrl'),
    imageAlt: formData.get('imageAlt'),
    ctas: formData.get('ctas'), // This will be a JSON string from a hidden input
    order: formData.get('order'),
    published: formData.get('published'),
  };

  const parsedData = FeaturedItemSchema.safeParse(rawFormData);

  if (!parsedData.success) {
    console.error("Validation Errors (Featured Item):", parsedData.error.flatten().fieldErrors);
    return {
      success: false,
      message: "Validation failed. Please check the errors.",
      fieldErrors: parsedData.error.flatten().fieldErrors as FeaturedItemFormState['fieldErrors'],
    };
  }

  const { id, ...dataToSave } = parsedData.data;

  try {
    let savedItem: FeaturedItem;
    const messageAction = id ? "updated" : "created";

    if (id) {
      savedItem = await prisma.featuredItem.update({
        where: { id },
        data: {
          ...dataToSave,
          ctas: dataToSave.ctas ? dataToSave.ctas : [], // Ensure Prisma.JsonValue
        },
      });
    } else {
      savedItem = await prisma.featuredItem.create({
        data: {
          ...dataToSave,
          ctas: dataToSave.ctas ? dataToSave.ctas : [], // Ensure Prisma.JsonValue
        },
      });
    }

    revalidateTag('featuredItems-admin');
    revalidateTag('featuredItems-public');
    if (id) revalidateTag(`featuredItem-${id}`);

    return {
      success: true,
      message: `Featured Item "${savedItem.title}" ${messageAction} successfully!`,
      item: savedItem,
    };
  } catch (error) {
    console.error("Database Error (Featured Item):", error);
    return {
      success: false,
      message: 'Database error: Failed to save featured item.',
      fieldErrors: { general: ['An unexpected database error occurred.'] }
    };
  }
}

// Server Action to delete a FeaturedItem
export async function deleteFeaturedItemAction(itemId: string): Promise<{ success: boolean; message: string }> {
  if (!itemId) {
    return { success: false, message: "Item ID is required for deletion." };
  }
  try {
    await prisma.featuredItem.delete({
      where: { id: itemId },
    });

    revalidateTag('featuredItems-admin');
    revalidateTag('featuredItems-public');
    revalidateTag(`featuredItem-${itemId}`);

    return { success: true, message: "Featured Item deleted successfully." };
  } catch (error) {
    console.error("Database Error (Delete Featured Item):", error);
    return { success: false, message: "Database error: Failed to delete item." };
  }
}
