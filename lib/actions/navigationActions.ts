// lib/actions/navigationActions.ts
'use server';

import prisma from '@/lib/prisma';
import { revalidateTag } from 'next/cache';
import { z } from 'zod';
import { type NavigationItem } from '@prisma/client';

// Define the shape of the form state for navigation item actions
export interface NavigationItemFormState {
  message: string;
  success?: boolean;
  fieldErrors?: Partial<Record<keyof NavigationItem | 'general' | 'parentId', string[]>>; // Added parentId here for specific errors
  item?: NavigationItem; // Return the created/updated item
}

// Schema for validating navigation item data
const NavigationItemSchema = z.object({
  id: z.string().cuid().optional(),
  label: z.string().min(1, { message: "Label is required." }),
  href: z.string().min(1, { message: "Link/Href is required." }),
  order: z.preprocess(
    (val) => (typeof val === 'string' && val !== '' ? parseInt(val, 10) : (typeof val === 'number' ? val : 0)), // Ensure empty string order becomes 0
    z.number().int().default(0)
  ),
  // parentId can be a CUID, or null/undefined. An empty string from form needs to become null.
  parentId: z.string().cuid().nullable().optional(),
});

// Server Action to create or update a navigation item
export async function upsertNavigationItemAction(
  prevState: NavigationItemFormState | undefined,
  formData: FormData
): Promise<NavigationItemFormState> {
  const rawFormData = Object.fromEntries(formData.entries());

  // Explicitly convert empty string parentId to null BEFORE validation
  // This is crucial for root items where the select sends ""
  if (rawFormData.parentId === '') {
    rawFormData.parentId = null as unknown as FormDataEntryValue;
  }
   // Ensure 'order' is a number or can be parsed to one, default to 0 if empty or invalid
   if (typeof rawFormData.order === 'string' && rawFormData.order.trim() === '') {
    rawFormData.order = '0';
  } else if (typeof rawFormData.order === 'string') {
    const parsedOrder = parseInt(rawFormData.order, 10);
    rawFormData.order = isNaN(parsedOrder) ? '0' : parsedOrder.toString();
  } else if (rawFormData.order === undefined || rawFormData.order === null) {
    rawFormData.order = '0';
  }


  const parsedData = NavigationItemSchema.safeParse(rawFormData);

  if (!parsedData.success) {
    console.error("Validation Errors (Nav Item):", parsedData.error.flatten().fieldErrors);
    return {
      success: false,
      message: "Validation failed. Please check the errors.",
      fieldErrors: parsedData.error.flatten().fieldErrors as NavigationItemFormState['fieldErrors'],
    };
  }

  const { id, ...dataToSave } = parsedData.data;

  try {
    let savedItem: NavigationItem;
    const messageAction = id ? "updated" : "created";

    if (id) {
      // Update existing item
      savedItem = await prisma.navigationItem.update({
        where: { id },
        data: dataToSave,
      });
    } else {
      // Create new item
      savedItem = await prisma.navigationItem.create({
        // Ensure dataToSave has parentId as null if it was processed that way
        data: {
            ...dataToSave,
            parentId: dataToSave.parentId // This will be null if it was an empty string initially
        },
      });
    }

    // Revalidate caches
    revalidateTag('navigation');
    revalidateTag('navigation-items-admin');


    return {
      success: true,
      message: `Navigation item "${savedItem.label}" ${messageAction} successfully!`,
      item: savedItem,
    };
  } catch (error) {
    console.error("Database Error (Nav Item):", error);
    let errorMessage = 'Database error: Failed to save navigation item.';
    if (error instanceof Error && error.message.includes('Unique constraint failed')) {
        errorMessage = 'A navigation item with this label or link might already exist where it needs to be unique, or there was a conflict with parent/child relationships.';
    } else if (error instanceof Error) {
        errorMessage = error.message; // More specific DB errors
    }
    return {
      success: false,
      message: errorMessage,
      fieldErrors: { general: [errorMessage] }
    };
  }
}

// Server Action to delete a navigation item
export async function deleteNavigationItemAction(itemId: string): Promise<{ success: boolean; message: string }> {
  if (!itemId) {
    return { success: false, message: "Item ID is required for deletion." };
  }
  try {
    await prisma.navigationItem.delete({
      where: { id: itemId },
    });

    revalidateTag('navigation');
    revalidateTag('navigation-items-admin');

    return { success: true, message: "Navigation item deleted successfully." };
  } catch (error) {
    console.error("Database Error (Delete Nav Item):", error);
    return { success: false, message: "Database error: Failed to delete navigation item." };
  }
}

// Placeholder for reordering action
export async function reorderNavigationItemsAction(items: { id: string; order: number; parentId?: string | null }[]): Promise<{ success: boolean; message: string }> {
    try {
        const transactions = items.map(item =>
            prisma.navigationItem.update({
                where: { id: item.id },
                data: { order: item.order, parentId: item.parentId },
            })
        );
        await prisma.$transaction(transactions);

        revalidateTag('navigation');
        revalidateTag('navigation-items-admin');
        return { success: true, message: "Navigation items reordered successfully." };
    } catch (error) {
        console.error("Database Error (Reorder Nav Items):", error);
        return { success: false, message: "Database error: Failed to reorder items." };
    }
}
