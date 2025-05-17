// components/admin/FeaturedItemForm.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { type FeaturedItem } from '@prisma/client';
import { type FeaturedItemFormState } from '@/lib/actions/featuredItemActions';
import { type CtaButton } from '@/lib/data/featuredItems'; // For CTA structure

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Assuming Shadcn/UI Select

interface FeaturedItemFormProps {
  initialData: Partial<FeaturedItem>;
  formAction: (prevState: FeaturedItemFormState | undefined, formData: FormData) => Promise<FeaturedItemFormState>;
  itemId?: string;
}

function SubmitButton({ actionLabel = "Save Item" }: { actionLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold bg-sky-500 hover:bg-sky-600">
      {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : actionLabel}
    </Button>
  );
}

export default function FeaturedItemForm({ initialData, formAction, itemId }: FeaturedItemFormProps) {
  const initialState: FeaturedItemFormState = { message: '', success: undefined, fieldErrors: {} };
  const [state, dispatch] = useActionState(formAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  const [ctas, setCtas] = useState<CtaButton[]>(
    initialData.ctas ? (typeof initialData.ctas === 'string' ? JSON.parse(initialData.ctas) : JSON.parse(JSON.stringify(initialData.ctas))) : []
  );
  const ctasJsonRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ctasJsonRef.current) {
      ctasJsonRef.current.value = JSON.stringify(ctas);
    }
  }, [ctas]);

  useEffect(() => {
    if (state?.success && state.item && !itemId) { // Reset only on successful creation
      formRef.current?.reset();
      setCtas([]); // Reset CTAs for new form
    } else if (state?.success && state.item && itemId) { // Re-sync CTAs on successful update
       setCtas(state.item.ctas ? (JSON.parse(JSON.stringify(state.item.ctas))) : []);
    }
  }, [state?.success, state?.item, itemId]);

  const handleFormAction = (formData: FormData) => {
    if (itemId) formData.append('id', itemId);
    dispatch(formData);
  };

  const addCta = () => setCtas([...ctas, { text: '', url: '', variant: 'primary' }]);
  const updateCta = (index: number, field: keyof CtaButton, value: string) => {
    const newCtas = [...ctas];
    newCtas[index] = { ...newCtas[index], [field]: value };
    setCtas(newCtas);
  };
  const removeCta = (index: number) => setCtas(ctas.filter((_, i) => i !== index));

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl border border-slate-200">
      <h2 className="text-2xl font-semibold text-slate-700 mb-6 pb-3 border-b border-slate-200">
        {itemId ? 'Edit Featured Item' : 'Create New Featured Item'}
      </h2>
      <form ref={formRef} action={handleFormAction} className="space-y-8">
        {state?.message && (
          <div className={`flex items-start p-4 rounded-md text-sm border ${state.success ? 'bg-green-50 border-green-300 text-green-700' : 'bg-red-50 border-red-300 text-red-700'}`} role="alert">
            {state.success ? <CheckCircle2 className="h-5 w-5 mr-2.5 shrink-0" /> : <AlertCircle className="h-5 w-5 mr-2.5 shrink-0" />}
            <span className="flex-grow">{state.message}</span>
          </div>
        )}
        <input type="hidden" name="ctas" ref={ctasJsonRef} defaultValue={JSON.stringify(ctas)} />

        {/* Admin Label */}
        <div className="grid grid-cols-1 gap-y-2">
          <Label htmlFor="adminLabel" className="text-slate-700 font-medium">Admin Label (Optional)</Label>
          <Input id="adminLabel" name="adminLabel" defaultValue={initialData.adminLabel ?? ''} className="mt-1" placeholder="e.g., Homepage Banner - Summer Sale"/>
          {state?.fieldErrors?.adminLabel && <p className="text-xs text-red-600 mt-1">{state.fieldErrors.adminLabel.join(', ')}</p>}
        </div>

        {/* Small Heading */}
        <div className="grid grid-cols-1 gap-y-2">
          <Label htmlFor="smallHeading" className="text-slate-700 font-medium">Small Heading (Optional)</Label>
          <Input id="smallHeading" name="smallHeading" defaultValue={initialData.smallHeading ?? ''} className="mt-1" placeholder="e.g., LIMITED TIME OFFER"/>
          {state?.fieldErrors?.smallHeading && <p className="text-xs text-red-600 mt-1">{state.fieldErrors.smallHeading.join(', ')}</p>}
        </div>

        {/* Title */}
        <div className="grid grid-cols-1 gap-y-2">
          <Label htmlFor="title" className="text-slate-700 font-medium">Main Title*</Label>
          <Input id="title" name="title" defaultValue={initialData.title ?? ''} required className="mt-1"/>
          {state?.fieldErrors?.title && <p className="text-xs text-red-600 mt-1">{state.fieldErrors.title.join(', ')}</p>}
        </div>

        {/* Description */}
        <div className="grid grid-cols-1 gap-y-2">
          <Label htmlFor="description" className="text-slate-700 font-medium">Description (Optional)</Label>
          <Textarea id="description" name="description" defaultValue={initialData.description ?? ''} className="mt-1 min-h-[100px]" />
          {state?.fieldErrors?.description && <p className="text-xs text-red-600 mt-1">{state.fieldErrors.description.join(', ')}</p>}
        </div>

        {/* Image URL */}
        <div className="grid grid-cols-1 gap-y-2">
          <Label htmlFor="imageUrl" className="text-slate-700 font-medium">Background Image URL*</Label>
          <Input id="imageUrl" name="imageUrl" type="url" defaultValue={initialData.imageUrl ?? ''} required className="mt-1" placeholder="https://example.com/banner.jpg"/>
          {state?.fieldErrors?.imageUrl && <p className="text-xs text-red-600 mt-1">{state.fieldErrors.imageUrl.join(', ')}</p>}
        </div>

        {/* Image Alt Text */}
        <div className="grid grid-cols-1 gap-y-2">
          <Label htmlFor="imageAlt" className="text-slate-700 font-medium">Image Alt Text (Optional)</Label>
          <Input id="imageAlt" name="imageAlt" defaultValue={initialData.imageAlt ?? ''} className="mt-1" placeholder="Descriptive text for the image"/>
          {state?.fieldErrors?.imageAlt && <p className="text-xs text-red-600 mt-1">{state.fieldErrors.imageAlt.join(', ')}</p>}
        </div>

        {/* CTAs Section */}
        <fieldset className="border border-slate-300 p-4 rounded-md space-y-4">
          <legend className="text-base font-medium text-slate-700 px-2">Call to Actions (CTAs)</legend>
          {ctas.map((cta, index) => (
            <div key={index} className="p-3 border border-slate-200 rounded-md space-y-3 relative bg-slate-50/50">
               {/* <GripVertical className="absolute top-1/2 -translate-y-1/2 left-1 text-slate-400 cursor-grab" /> */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-1">
                  <Label htmlFor={`cta-text-${index}`} className="text-sm font-medium text-slate-600">Button Text {index + 1}</Label>
                  <Input id={`cta-text-${index}`} value={cta.text} onChange={(e) => updateCta(index, 'text', e.target.value)} placeholder="e.g., Shop Now" className="mt-1 bg-white"/>
                </div>
                <div className="md:col-span-1">
                  <Label htmlFor={`cta-url-${index}`} className="text-sm font-medium text-slate-600">Button URL {index + 1}</Label>
                  <Input id={`cta-url-${index}`} value={cta.url} onChange={(e) => updateCta(index, 'url', e.target.value)} placeholder="/shop or https://" className="mt-1 bg-white"/>
                </div>
                <div>
                    <Label htmlFor={`cta-variant-${index}`} className="text-sm font-medium text-slate-600">Button Style</Label>
                    <Select
                        value={cta.variant || 'primary'}
                        onValueChange={(value) => updateCta(index, 'variant', value)}
                    >
                        <SelectTrigger className="w-full mt-1 bg-white">
                            <SelectValue placeholder="Select style" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="primary">Primary (Solid)</SelectItem>
                            <SelectItem value="secondary">Secondary (Solid)</SelectItem>
                            <SelectItem value="outline">Outline</SelectItem>
                            <SelectItem value="ghost">Ghost (Minimal)</SelectItem>
                            <SelectItem value="link">Link Style</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => removeCta(index)} className="absolute top-1 right-1 text-red-500 hover:text-red-700 h-7 w-7 p-1">
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addCta} className="text-sky-600 border-sky-500 hover:bg-sky-50">
            <PlusCircle size={18} className="mr-2" /> Add CTA Button
          </Button>
          {state?.fieldErrors?.ctas && <p className="text-xs text-red-600 mt-1">{typeof state.fieldErrors.ctas === 'string' ? state.fieldErrors.ctas : state.fieldErrors.ctas.join(', ')}</p>}
        </fieldset>

        {/* Order and Published */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pt-2">
            <div>
                <Label htmlFor="order" className="text-slate-700 font-medium">Order</Label>
                <Input id="order" name="order" type="number" defaultValue={initialData.order ?? 0} className="mt-1"/>
                {state?.fieldErrors?.order && <p className="text-xs text-red-600 mt-1">{state.fieldErrors.order.join(', ')}</p>}
            </div>
            <div className="flex items-center space-x-3 self-end pb-1 sm:pt-7">
                <Checkbox id="published" name="published" defaultChecked={initialData.published === undefined ? true : initialData.published} className="h-5 w-5"/>
                <Label htmlFor="published" className="font-medium text-slate-700 -mb-0.5">Published</Label>
                {state?.fieldErrors?.published && <p className="text-xs text-red-600">{state.fieldErrors.published.join(', ')}</p>}
            </div>
        </div>

        <div className="pt-6 border-t border-slate-200 flex justify-end">
          <SubmitButton actionLabel={itemId ? 'Update Featured Item' : 'Create Featured Item'} />
        </div>
      </form>
    </div>
  );
}
