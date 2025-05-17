// components/admin/HeroForm.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { useActionState } from 'react'; // Corrected: useActionState from 'react'
import { useFormStatus } from 'react-dom'; // Correct: useFormStatus from 'react-dom'
import { type HeroSlide } from '@prisma/client'; // Assuming you renamed HeroSection to HeroSlide
import { type HeroSlideFormState } from '@/lib/actions/heroSlideActions'; // Adjust action name

import { Button } from '@/components/ui/button'; // Assuming these are your styled components
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle2 } from 'lucide-react'; // Icons for messages

interface HeroFormProps {
  initialData: Partial<HeroSlide>; // Allow partial for new slides
  formAction: (prevState: HeroSlideFormState | undefined, formData: FormData) => Promise<HeroSlideFormState>;
  // If you have a specific action for create vs update, you might pass the specific action
  // For upsert, one action is fine.
  slideId?: string; // Pass slideId for updates
}

function SubmitButton({ actionLabel = "Save Slide" }: { actionLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold">
      {pending ? (
        <span className="flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </span>
      ) : actionLabel }
    </Button>
  );
}

export default function HeroForm({ initialData, formAction, slideId }: HeroFormProps) {
  // Ensure initialState matches the structure of HeroSlideFormState from your actions file
  const initialState: HeroSlideFormState = {
    message: '',
    success: undefined,
    fieldErrors: {},
    resetKey: undefined,
    slideId: undefined,
  };
  const [state, dispatch] = useActionState(formAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success && state.resetKey && !slideId) { // Only reset for new slide creation
      formRef.current?.reset();
    }
  }, [state?.success, state?.resetKey, slideId]);

  // Create a new FormData object and append slideId if it exists
  const handleFormAction = (formData: FormData) => {
    if (slideId) {
      formData.append('id', slideId); // Add existing slide ID for updates
    }
    dispatch(formData);
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl border border-slate-200">
      {/* Form Title (example) */}
      <h2 className="text-2xl font-semibold text-slate-700 mb-6 pb-3 border-b border-slate-200">
        {slideId ? 'Edit Hero Slide' : 'Create New Hero Slide'}
      </h2>

      <form ref={formRef} action={handleFormAction} className="space-y-6">
        {state?.message && (
          <div
            className={`flex items-start p-4 rounded-md text-sm border ${
              state.success
                ? 'bg-green-50 border-green-300 text-green-700'
                : 'bg-red-50 border-red-300 text-red-700'
            }`}
            role="alert"
          >
            {state.success ? <CheckCircle2 className="h-5 w-5 mr-2.5 flex-shrink-0" /> : <AlertCircle className="h-5 w-5 mr-2.5 flex-shrink-0" />}
            <span className="flex-grow">{state.message}</span>
          </div>
        )}

        {/* Optional: Hidden input for identifier if you still use it for some default slide */}
        {/* <input type="hidden" name="identifier" defaultValue={initialData.identifier || 'main_hero'} /> */}

        {/* Slide Label (for admin identification) */}
        <div className="grid grid-cols-1 gap-y-2">
          <Label htmlFor="slideLabel" className="text-slate-700 font-medium">Slide Label (Admin)</Label>
          <Input
            id="slideLabel"
            name="slideLabel"
            defaultValue={initialData.slideLabel ?? ''}
            className="mt-1"
            placeholder="e.g., Homepage Welcome Slide"
            aria-describedby={state?.fieldErrors?.slideLabel ? "slideLabel-error" : undefined}
          />
          {state?.fieldErrors?.slideLabel && (
            <p id="slideLabel-error" className="text-xs text-red-600 mt-1" role="alert">
              {state.fieldErrors.slideLabel.join(', ')}
            </p>
          )}
        </div>

        {/* Title */}
        <div className="grid grid-cols-1 gap-y-2">
          <Label htmlFor="title" className="text-slate-700 font-medium">Title*</Label>
          <Input
            id="title"
            name="title"
            defaultValue={initialData.title ?? ''}
            required
            className="mt-1"
            aria-describedby={state?.fieldErrors?.title ? "title-error" : undefined}
          />
          {state?.fieldErrors?.title && (
            <p id="title-error" className="text-xs text-red-600 mt-1" role="alert">
              {state.fieldErrors.title.join(', ')}
            </p>
          )}
        </div>

        {/* Subtitle */}
        <div className="grid grid-cols-1 gap-y-2">
          <Label htmlFor="subtitle" className="text-slate-700 font-medium">Subtitle</Label>
          <Textarea
            id="subtitle"
            name="subtitle"
            defaultValue={initialData.subtitle ?? ''}
            className="mt-1 min-h-[80px]"
            aria-describedby={state?.fieldErrors?.subtitle ? "subtitle-error" : undefined}
          />
          {state?.fieldErrors?.subtitle && (
            <p id="subtitle-error" className="text-xs text-red-600 mt-1" role="alert">
              {state.fieldErrors.subtitle.join(', ')}
            </p>
          )}
        </div>

        {/* CTA Group */}
        <fieldset className="border border-slate-300 p-4 rounded-md">
            <legend className="text-sm font-medium text-slate-600 px-2">Call to Action</legend>
            <div className="space-y-4 mt-2">
                <div>
                    <Label htmlFor="ctaText" className="text-slate-700 font-medium text-sm">CTA Button Text</Label>
                    <Input id="ctaText" name="ctaText" defaultValue={initialData.ctaText ?? ''} className="mt-1" aria-describedby={state?.fieldErrors?.ctaText ? "ctaText-error" : undefined} />
                    {state?.fieldErrors?.ctaText && (<p id="ctaText-error" className="text-xs text-red-600 mt-1" role="alert">{state.fieldErrors.ctaText.join(', ')}</p>)}
                </div>
                <div>
                    <Label htmlFor="ctaLink" className="text-slate-700 font-medium text-sm">CTA Link (URL)</Label>
                    <Input id="ctaLink" name="ctaLink" type="url" defaultValue={initialData.ctaLink ?? ''} className="mt-1" placeholder="https://example.com/action" aria-describedby={state?.fieldErrors?.ctaLink ? "ctaLink-error" : undefined} />
                    {state?.fieldErrors?.ctaLink && (<p id="ctaLink-error" className="text-xs text-red-600 mt-1" role="alert">{state.fieldErrors.ctaLink.join(', ')}</p>)}
                </div>
            </div>
        </fieldset>

        {/* Image Group */}
         <fieldset className="border border-slate-300 p-4 rounded-md">
            <legend className="text-sm font-medium text-slate-600 px-2">Slide Image</legend>
            <div className="space-y-4 mt-2">
                <div>
                    <Label htmlFor="imageUrl" className="text-slate-700 font-medium text-sm">Image URL</Label>
                    <Input id="imageUrl" name="imageUrl" type="url" defaultValue={initialData.imageUrl ?? ''} className="mt-1" placeholder="https://example.com/image.jpg" aria-describedby={state?.fieldErrors?.imageUrl ? "imageUrl-error" : undefined} />
                     {state?.fieldErrors?.imageUrl && (<p id="imageUrl-error" className="text-xs text-red-600 mt-1" role="alert">{state.fieldErrors.imageUrl.join(', ')}</p>)}
                </div>
                <div>
                    <Label htmlFor="imageAlt" className="text-slate-700 font-medium text-sm">Image Alt Text</Label>
                    <Input id="imageAlt" name="imageAlt" defaultValue={initialData.imageAlt ?? ''} className="mt-1" placeholder="Descriptive text for accessibility" aria-describedby={state?.fieldErrors?.imageAlt ? "imageAlt-error" : undefined} />
                    {state?.fieldErrors?.imageAlt && (<p id="imageAlt-error" className="text-xs text-red-600 mt-1" role="alert">{state.fieldErrors.imageAlt.join(', ')}</p>)}
                </div>
            </div>
        </fieldset>

        {/* Order and Published */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pt-2">
            <div>
                <Label htmlFor="order" className="text-slate-700 font-medium">Order</Label>
                <Input id="order" name="order" type="number" defaultValue={initialData.order ?? 0} className="mt-1" aria-describedby={state?.fieldErrors?.order ? "order-error" : undefined} />
                {state?.fieldErrors?.order && (<p id="order-error" className="text-xs text-red-600 mt-1" role="alert">{state.fieldErrors.order.join(', ')}</p>)}
            </div>
            <div className="flex items-center space-x-3 self-end pb-1"> {/* Aligns checkbox with bottom of order input roughly */}
                <Checkbox id="published" name="published" defaultChecked={initialData.published === undefined ? true : initialData.published} className="h-5 w-5" />
                <Label htmlFor="published" className="font-medium text-slate-700 -mb-0.5">Published</Label>
            </div>
             {state?.fieldErrors?.published && (<p className="text-xs text-red-600 mt-1 sm:col-span-2" role="alert">{state.fieldErrors.published.join(', ')}</p>)}
        </div>


        <div className="pt-6 border-t border-slate-200 flex justify-end">
          <SubmitButton actionLabel={slideId ? 'Update Slide' : 'Create Slide'} />
        </div>
      </form>
    </div>
  );
}
