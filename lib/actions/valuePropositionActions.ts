// lib/actions/valuePropositionActions.ts
'use server';

import prisma from '@/lib/prisma';
import { revalidateTag } from 'next/cache';
import { z } from 'zod';
import { type ValuePropositionItem } from '@prisma/client';

// Define the shape of the form state for these actions
export interface ValuePropositionItemFormState {
  message: string;
  success?: boolean;
  fieldErrors?: Partial<Record<keyof ValuePropositionItem | 'general', string[]>>;
  item?: ValuePropositionItem; // Return the created/updated item
}

// Schema for validating ValuePropositionItem data
const ValuePropositionItemSchema = z.object({
  id: z.string().cuid().optional(), // CUID for existing items being updated
  title: z.string().min(1, { message: "Title is required." }),
  imageUrl: z.string().url({ message: "Image URL must be a valid URL if provided." }).optional().or(z.literal('')).nullable(),
  imageAlt: z.string().optional().nullable(),
  linkUrl: z.string().url({ message: "Link URL must be a valid URL if provided." }).optional().or(z.literal('')).nullable(),
  order: z.preprocess(
    (val) => (typeof val === 'string' && val.trim() !== '' ? parseInt(val.trim(), 10) : (typeof val === 'number' ? val : 0)),
    z.number().int().default(0)
  ),
  published: z.preprocess(
    (val) => String(val).toLowerCase() === 'true' || val === 'on' || val === true,
    z.boolean().default(true)
  ),
});

// Server Action to create or update a ValuePropositionItem
export async function upsertValuePropositionItemAction(
  prevState: ValuePropositionItemFormState | undefined,
  formData: FormData
): Promise<ValuePropositionItemFormState> {
  const rawFormData = Object.fromEntries(formData.entries());
  const parsedData = ValuePropositionItemSchema.safeParse(rawFormData);

  if (!parsedData.success) {
    console.error("Validation Errors (Value Proposition Item):", parsedData.error.flatten().fieldErrors);
    return {
      success: false,
      message: "Validation failed. Please check the errors.",
      fieldErrors: parsedData.error.flatten().fieldErrors as ValuePropositionItemFormState['fieldErrors'],
    };
  }

  const { id, ...dataToSave } = parsedData.data;

  try {
    let savedItem: ValuePropositionItem;
    const messageAction = id ? "updated" : "created";

    if (id) {
      // Update existing item
      savedItem = await prisma.valuePropositionItem.update({
        where: { id },
        data: dataToSave,
      });
    } else {
      // Create new item
      savedItem = await prisma.valuePropositionItem.create({
        data: dataToSave,
      });
    }

    // Revalidate relevant caches
    revalidateTag('valuePropositionItems-admin'); // For the admin list page
    revalidateTag('valuePropositionItems-public'); // For the public display
    if (id) {
      revalidateTag(`valuePropositionItem-${id}`); // For specific item if needed
    }

    return {
      success: true,
      message: `Value Proposition Item "${savedItem.title}" ${messageAction} successfully!`,
      item: savedItem,
    };
  } catch (error) {
    console.error("Database Error (Value Proposition Item):", error);
    return {
      success: false,
      message: 'Database error: Failed to save item.',
      fieldErrors: { general: ['An unexpected database error occurred.'] }
    };
  }
}

// Server Action to delete a ValuePropositionItem
export async function deleteValuePropositionItemAction(itemId: string): Promise<{ success: boolean; message: string }> {
  if (!itemId) {
    return { success: false, message: "Item ID is required for deletion." };
  }
  try {
    await prisma.valuePropositionItem.delete({
      where: { id: itemId },
    });

    revalidateTag('valuePropositionItems-admin');
    revalidateTag('valuePropositionItems-public');
    revalidateTag(`valuePropositionItem-${itemId}`);


    return { success: true, message: "Value Proposition Item deleted successfully." };
  } catch (error) {
    console.error("Database Error (Delete Value Proposition Item):", error);
    return { success: false, message: "Database error: Failed to delete item." };
  }
}
