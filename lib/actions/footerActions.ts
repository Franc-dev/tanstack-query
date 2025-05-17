/* eslint-disable @typescript-eslint/no-unused-vars */
// lib/actions/footerActions.ts
'use server';

import prisma from '@/lib/prisma';
import { revalidateTag } from 'next/cache';
import { z } from 'zod';
import { type FooterContent } from '@prisma/client';

// Define the shape of the form state
export interface FooterFormState {
  message: string;
  success?: boolean;
  fieldErrors?: Partial<Record<keyof FooterContent | 'links' | 'socialMedia' | 'general', string[]>>;
  footerContent?: FooterContent;
}

// Schemas for individual links
const LinkSchema = z.object({
  text: z.string().min(1, "Link text cannot be empty."),
  href: z.string().min(1, "Link URL cannot be empty.").refine(value => {
    // Allow relative paths or absolute URLs
    return value.startsWith('/') || value.startsWith('http://') || value.startsWith('https://');
  }, { message: "Link URL must be a relative path (e.g., /about) or an absolute URL (e.g., https://example.com)."}),
});

const SocialLinkSchema = z.object({
  platform: z.string().min(1, "Platform name cannot be empty."),
  url: z.string().url("Social media link must be a valid URL."),
});

// Main schema for the footer content
const FooterContentSchema = z.object({
  identifier: z.string().min(1).default("main_footer"),
  copyrightText: z.string().min(1, "Copyright text is required."),
  // For links and socialMedia, we expect JSON strings from the form, then parse them
  links: z.string().optional().transform((str, ctx) => {
    if (!str || str.trim() === "") return [];
    try {
      const parsed = JSON.parse(str);
      const result = z.array(LinkSchema).safeParse(parsed);
      if (!result.success) {
        // Add issue to Zod context to report error on the 'links' field
        result.error.issues.forEach(issue => {
            ctx.addIssue({
                ...issue,
                path: ['links', ...issue.path], // Prepend 'links' to the path
            });
        });
        return z.NEVER; // Indicates parsing failed
      }
      return result.data;
    } catch (e) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid JSON format for links.",
        path: ['links'],
      });
      return z.NEVER;
    }
  }),
  socialMedia: z.string().optional().transform((str, ctx) => {
    if (!str || str.trim() === "") return [];
    try {
      const parsed = JSON.parse(str);
      const result = z.array(SocialLinkSchema).safeParse(parsed);
       if (!result.success) {
        result.error.issues.forEach(issue => {
            ctx.addIssue({
                ...issue,
                path: ['socialMedia', ...issue.path],
            });
        });
        return z.NEVER;
      }
      return result.data;
    } catch (e) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid JSON format for social media links.",
        path: ['socialMedia'],
      });
      return z.NEVER;
    }
  }),
  published: z.preprocess(
    (val) => String(val).toLowerCase() === 'true' || val === 'on' || val === true,
    z.boolean().default(true)
  ),
});

// Server Action to update footer content
export async function updateFooterContentAction(
  prevState: FooterFormState | undefined,
  formData: FormData
): Promise<FooterFormState> {
  const rawFormData = {
    identifier: formData.get('identifier'),
    copyrightText: formData.get('copyrightText'),
    links: formData.get('links'), // This will be a JSON string
    socialMedia: formData.get('socialMedia'), // This will be a JSON string
    published: formData.get('published'),
  };

  const parsedData = FooterContentSchema.safeParse(rawFormData);

  if (!parsedData.success) {
    console.error("Validation Errors (Footer):", parsedData.error.flatten().fieldErrors);
    const fieldErrors: FooterFormState['fieldErrors'] = parsedData.error.flatten().fieldErrors as FooterFormState['fieldErrors'] || {};
    
    // Check if custom parsing errors for JSON fields were added
    if (parsedData.error.issues.some(issue => issue.path.includes('links') && issue.code === 'custom')) {
        fieldErrors.links = ["Invalid JSON structure for links. Please ensure it's a valid array of objects."];
    }
    if (parsedData.error.issues.some(issue => issue.path.includes('socialMedia') && issue.code === 'custom')) {
        fieldErrors.socialMedia = ["Invalid JSON structure for social media. Please ensure it's a valid array of objects."];
    }

    return {
      success: false,
      message: "Validation failed. Please check the errors below.",
      fieldErrors: fieldErrors,
    };
  }

  const { identifier, ...dataToSave } = parsedData.data;

  try {
    const updatedFooter = await prisma.footerContent.upsert({
      where: { identifier: identifier! }, // identifier is guaranteed by schema default
      update: {
        ...dataToSave,
        // Prisma expects Json type for links and socialMedia
        links: dataToSave.links ? dataToSave.links : [], // Ensure it's Prisma.JsonValue
        socialMedia: dataToSave.socialMedia ? dataToSave.socialMedia : [], // Ensure it's Prisma.JsonValue
      },
      create: {
        identifier: identifier!,
        ...dataToSave,
        links: dataToSave.links ? dataToSave.links : [],
        socialMedia: dataToSave.socialMedia ? dataToSave.socialMedia : [],
      },
    });

    revalidateTag(`footer-${identifier}`);
    revalidateTag('footer'); // General tag
    revalidateTag('content'); // Global content tag

    return {
      success: true,
      message: 'Footer content updated successfully!',
      footerContent: updatedFooter,
    };
  } catch (error) {
    console.error("Database Error (Footer):", error);
    return {
      success: false,
      message: 'Database error: Failed to save footer content.',
      fieldErrors: { general: ['An unexpected database error occurred.'] }
    };
  }
}
