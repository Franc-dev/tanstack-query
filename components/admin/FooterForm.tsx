/* eslint-disable @typescript-eslint/no-unused-vars */
// components/admin/FooterForm.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { type FooterContent } from '@prisma/client';
import { updateFooterContentAction, type FooterFormState } from '@/lib/actions/footerActions';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea'; // For potentially larger text areas if needed
import { PlusCircle, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface LinkItem {
  text: string;
  href: string;
}

interface SocialMediaItem {
  platform: string;
  url: string;
}

interface FooterFormProps {
  initialData: FooterContent;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold bg-sky-500 hover:bg-sky-600">
      {pending ? 'Saving...' : 'Save Footer Content'}
    </Button>
  );
}

export default function FooterForm({ initialData }: FooterFormProps) {
  const initialState: FooterFormState = { message: '', success: undefined, fieldErrors: {} };
  const [state, formAction] = useActionState(updateFooterContentAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  // State for managing dynamic link lists
  const [links, setLinks] = useState<LinkItem[]>(initialData.links ? JSON.parse(JSON.stringify(initialData.links)) : []);
  const [socialMedia, setSocialMedia] = useState<SocialMediaItem[]>(initialData.socialMedia ? JSON.parse(JSON.stringify(initialData.socialMedia)) : []);

  // Hidden inputs to store JSON strings for submission
  const linksJsonRef = useRef<HTMLInputElement>(null);
  const socialMediaJsonRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Update hidden inputs whenever local link states change
    if (linksJsonRef.current) {
      linksJsonRef.current.value = JSON.stringify(links);
    }
    if (socialMediaJsonRef.current) {
      socialMediaJsonRef.current.value = JSON.stringify(socialMedia);
    }
  }, [links, socialMedia]);

  useEffect(() => {
    if (state?.success && state.footerContent) {
      // If server returns updated content, re-sync local state for links
      setLinks(state.footerContent.links ? JSON.parse(JSON.stringify(state.footerContent.links)) : []);
      setSocialMedia(state.footerContent.socialMedia ? JSON.parse(JSON.stringify(state.footerContent.socialMedia)) : []);
    }
  }, [state?.success, state?.footerContent]);


  // Handlers for Links
  const addLink = () => setLinks([...links, { text: '', href: '' }]);
  const updateLink = (index: number, field: keyof LinkItem, value: string) => {
    const newLinks = [...links];
    newLinks[index][field] = value;
    setLinks(newLinks);
  };
  const removeLink = (index: number) => setLinks(links.filter((_, i) => i !== index));

  // Handlers for Social Media Links
  const addSocialMedia = () => setSocialMedia([...socialMedia, { platform: '', url: '' }]);
  const updateSocialMedia = (index: number, field: keyof SocialMediaItem, value: string) => {
    const newSocials = [...socialMedia];
    newSocials[index][field] = value;
    setSocialMedia(newSocials);
  };
  const removeSocialMedia = (index: number) => setSocialMedia(socialMedia.filter((_, i) => i !== index));

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl border border-slate-200">
      <form ref={formRef} action={formAction} className="space-y-8">
        {state?.message && (
          <div
            className={`flex items-start p-4 rounded-md text-sm border ${
              state.success ? 'bg-green-50 border-green-300 text-green-700' : 'bg-red-50 border-red-300 text-red-700'
            }`}
            role="alert"
          >
            {state.success ? <CheckCircle2 className="h-5 w-5 mr-2.5 flex-shrink-0" /> : <AlertCircle className="h-5 w-5 mr-2.5 flex-shrink-0" />}
            <span className="flex-grow">{state.message}</span>
          </div>
        )}

        <input type="hidden" name="identifier" defaultValue={initialData.identifier} />
        {/* Hidden inputs for JSON data */}
        <input type="hidden" name="links" ref={linksJsonRef} defaultValue={JSON.stringify(links)} />
        <input type="hidden" name="socialMedia" ref={socialMediaJsonRef} defaultValue={JSON.stringify(socialMedia)} />


        {/* Copyright Text */}
        <div className="grid grid-cols-1 gap-y-2">
          <Label htmlFor="copyrightText" className="text-slate-700 font-medium">Copyright Text*</Label>
          <Input
            id="copyrightText"
            name="copyrightText"
            defaultValue={initialData.copyrightText}
            required
            className="mt-1"
            aria-describedby={state?.fieldErrors?.copyrightText ? "copyrightText-error" : undefined}
          />
          {state?.fieldErrors?.copyrightText && (
            <p id="copyrightText-error" className="text-xs text-red-600 mt-1" role="alert">
              {state.fieldErrors.copyrightText.join(', ')}
            </p>
          )}
        </div>

        {/* Footer Links Section */}
        <fieldset className="border border-slate-300 p-4 rounded-md space-y-4">
          <legend className="text-base font-medium text-slate-700 px-2">Footer Links</legend>
          {links.map((link, index) => (
            <div key={index} className="p-3 border border-slate-200 rounded-md space-y-3 relative bg-slate-50/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`link-text-${index}`} className="text-sm font-medium text-slate-600">Link Text {index + 1}</Label>
                  <Input id={`link-text-${index}`} value={link.text} onChange={(e) => updateLink(index, 'text', e.target.value)} placeholder="e.g., About Us" className="mt-1 bg-white"/>
                </div>
                <div>
                  <Label htmlFor={`link-href-${index}`} className="text-sm font-medium text-slate-600">Link URL {index + 1}</Label>
                  <Input id={`link-href-${index}`} value={link.href} onChange={(e) => updateLink(index, 'href', e.target.value)} placeholder="/about or https://example.com" className="mt-1 bg-white"/>
                </div>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => removeLink(index)} className="absolute top-1 right-1 text-red-500 hover:text-red-700 h-7 w-7 p-1">
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addLink} className="text-sky-600 border-sky-500 hover:bg-sky-50">
            <PlusCircle size={18} className="mr-2" /> Add Footer Link
          </Button>
           {state?.fieldErrors?.links && ( <p className="text-xs text-red-600 mt-1" role="alert"> {typeof state.fieldErrors.links === 'string' ? state.fieldErrors.links : state.fieldErrors.links.join(', ')}</p>)}
        </fieldset>

        {/* Social Media Links Section */}
        <fieldset className="border border-slate-300 p-4 rounded-md space-y-4">
          <legend className="text-base font-medium text-slate-700 px-2">Social Media Links</legend>
          {socialMedia.map((social, index) => (
            <div key={index} className="p-3 border border-slate-200 rounded-md space-y-3 relative bg-slate-50/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`social-platform-${index}`} className="text-sm font-medium text-slate-600">Platform {index + 1}</Label>
                  <Input id={`social-platform-${index}`} value={social.platform} onChange={(e) => updateSocialMedia(index, 'platform', e.target.value)} placeholder="e.g., Twitter, Facebook" className="mt-1 bg-white"/>
                </div>
                <div>
                  <Label htmlFor={`social-url-${index}`} className="text-sm font-medium text-slate-600">URL {index + 1}</Label>
                  <Input id={`social-url-${index}`} type="url" value={social.url} onChange={(e) => updateSocialMedia(index, 'url', e.target.value)} placeholder="https://twitter.com/yourprofile" className="mt-1 bg-white"/>
                </div>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => removeSocialMedia(index)} className="absolute top-1 right-1 text-red-500 hover:text-red-700 h-7 w-7 p-1">
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addSocialMedia} className="text-sky-600 border-sky-500 hover:bg-sky-50">
            <PlusCircle size={18} className="mr-2" /> Add Social Media Link
          </Button>
          {state?.fieldErrors?.socialMedia && ( <p className="text-xs text-red-600 mt-1" role="alert"> {typeof state.fieldErrors.socialMedia === 'string' ? state.fieldErrors.socialMedia : state.fieldErrors.socialMedia.join(', ')}</p>)}
        </fieldset>

        {/* Published Checkbox */}
        <div className="flex items-center space-x-3 pt-2">
          <Checkbox
            id="published"
            name="published"
            defaultChecked={initialData.published}
            className="h-5 w-5"
          />
          <Label htmlFor="published" className="font-medium text-slate-700 -mb-0.5">Published</Label>
        </div>
        {state?.fieldErrors?.published && (
          <p className="text-xs text-red-600 mt-1" role="alert">
            {state.fieldErrors.published.join(', ')}
          </p>
        )}

        {/* Submit Button */}
        <div className="pt-6 border-t border-slate-200 flex justify-end">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
