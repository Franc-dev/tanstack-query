/* eslint-disable @typescript-eslint/no-unused-vars */
// components/admin/DeleteSlideButton.tsx
'use client';

import { useState } from 'react';
import { deleteHeroSlideAction } from '@/lib/actions/heroSlideActions';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"; // Assuming you have Shadcn/UI AlertDialog

interface DeleteSlideButtonProps {
  slideId: string;
  slideTitle: string;
}

export default function DeleteSlideButton({ slideId, slideTitle }: DeleteSlideButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      const result = await deleteHeroSlideAction(slideId);
      if (!result.success) {
        setError(result.message || 'Failed to delete slide.');
      } else {
        // Optionally, show a success toast or message
        // The page will revalidate and list will update
        setIsAlertOpen(false); // Close dialog on success
      }
    } catch (e) {
      setError('An unexpected error occurred.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm" aria-label={`Delete ${slideTitle}`}>
            <Trash2 size={16} />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the hero slide titled
              <strong className="mx-1">{slideTitle}</strong>.
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Yes, delete slide'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
