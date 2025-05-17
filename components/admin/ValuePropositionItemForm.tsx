// components/admin/ValuePropositionItemForm.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { type ValuePropositionItem } from '@prisma/client';
import {
  type ValuePropositionItemFormState
} from '@/lib/actions/valuePropositionActions';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface ValuePropositionItemFormProps {
  initialData: Partial<ValuePropositionItem>; // Partial for new items
  formAction: (prevState: ValuePropositionItemFormState | undefined, formData: FormData) => Promise<ValuePropositionItemFormState>;
  itemId?: string; // Pass itemId for updates
}

function SubmitButton({ actionLabel = "Save Item" }: { actionLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold bg-sky-500 hover:bg-sky-600">
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

export default function ValuePropositionItemForm({ initialData, formAction, itemId }: ValuePropositionItemFormProps) {
  const initialState: ValuePropositionItemFormState = {
    message: '',
    success: undefined,
    fieldErrors: {},
    item: undefined,
  };
  const [state, dispatch] = useActionState(formAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // Only reset the form for successful *creation* of new items
    if (state?.success && state.item && !itemId) {
      formRef.current?.reset();
      // Optionally, clear specific fields or re-initialize if needed,
      // but a full reset is often simplest for "add new" forms.
    }
  }, [state?.success, state?.item, itemId]);

  // Wrapper for form action to include itemId if present
  const handleFormAction = (formData: FormData) => {
    if (itemId) {
      formData.append('id', itemId);
    }
    dispatch(formData);
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl border border-slate-200">
      <h2 className="text-2xl font-semibold text-slate-700 mb-6 pb-3 border-b border-slate-200">
        {itemId ? 'Edit Value Proposition Item' : 'Create New Value Proposition Item'}
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

        {/* Image URL */}
        <div className="grid grid-cols-1 gap-y-2">
          <Label htmlFor="imageUrl" className="text-slate-700 font-medium">Image URL</Label>
          <Input
            id="imageUrl"
            name="imageUrl"
            type="url"
            defaultValue={initialData.imageUrl ?? ''}
            className="mt-1"
            placeholder="https://example.com/image.jpg"
            aria-describedby={state?.fieldErrors?.imageUrl ? "imageUrl-error" : undefined}
          />
          {state?.fieldErrors?.imageUrl && (
            <p id="imageUrl-error" className="text-xs text-red-600 mt-1" role="alert">
              {state.fieldErrors.imageUrl.join(', ')}
            </p>
          )}
        </div>

        {/* Image Alt Text */}
        <div className="grid grid-cols-1 gap-y-2">
          <Label htmlFor="imageAlt" className="text-slate-700 font-medium">Image Alt Text</Label>
          <Input
            id="imageAlt"
            name="imageAlt"
            defaultValue={initialData.imageAlt ?? ''}
            className="mt-1"
            placeholder="Descriptive text for accessibility"
            aria-describedby={state?.fieldErrors?.imageAlt ? "imageAlt-error" : undefined}
          />
          {state?.fieldErrors?.imageAlt && (
            <p id="imageAlt-error" className="text-xs text-red-600 mt-1" role="alert">
              {state.fieldErrors.imageAlt.join(', ')}
            </p>
          )}
        </div>

        {/* Link URL */}
        <div className="grid grid-cols-1 gap-y-2">
          <Label htmlFor="linkUrl" className="text-slate-700 font-medium">Link URL (Optional)</Label>
          <Input
            id="linkUrl"
            name="linkUrl"
            type="url"
            defaultValue={initialData.linkUrl ?? ''}
            className="mt-1"
            placeholder="https://example.com/product-category"
            aria-describedby={state?.fieldErrors?.linkUrl ? "linkUrl-error" : undefined}
          />
          {state?.fieldErrors?.linkUrl && (
            <p id="linkUrl-error" className="text-xs text-red-600 mt-1" role="alert">
              {state.fieldErrors.linkUrl.join(', ')}
            </p>
          )}
        </div>

        {/* Order and Published */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pt-2">
            <div>
                <Label htmlFor="order" className="text-slate-700 font-medium">Order</Label>
                <Input
                  id="order"
                  name="order"
                  type="number"
                  defaultValue={initialData.order ?? 0}
                  className="mt-1"
                  aria-describedby={state?.fieldErrors?.order ? "order-error" : undefined}
                />
                {state?.fieldErrors?.order && (
                  <p id="order-error" className="text-xs text-red-600 mt-1" role="alert">
                    {state.fieldErrors.order.join(', ')}
                  </p>
                )}
            </div>
            <div className="flex items-center space-x-3 self-end pb-1 sm:pt-7"> {/* Adjust alignment */}
                <Checkbox
                  id="published"
                  name="published"
                  defaultChecked={initialData.published === undefined ? true : initialData.published}
                  className="h-5 w-5"
                />
                <Label htmlFor="published" className="font-medium text-slate-700 -mb-0.5">Published</Label>
                 {state?.fieldErrors?.published && (
                    <p id="published-error" className="text-xs text-red-600" role="alert">
                        {state.fieldErrors.published.join(', ')}
                    </p>
                )}
            </div>
        </div>

        <div className="pt-6 border-t border-slate-200 flex justify-end">
          <SubmitButton actionLabel={itemId ? 'Update Item' : 'Create Item'} />
        </div>
      </form>
    </div>
  );
}
