/* eslint-disable @typescript-eslint/no-unused-vars */
// components/admin/DeleteFeaturedItemButton.tsx
'use client';

import { useState } from 'react';
import { deleteFeaturedItemAction } from '@/lib/actions/featuredItemActions';
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
} from "@/components/ui/alert-dialog";

interface DeleteFeaturedItemButtonProps {
  itemId: string;
  itemTitle: string;
}

export default function DeleteFeaturedItemButton({ itemId, itemTitle }: DeleteFeaturedItemButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      const result = await deleteFeaturedItemAction(itemId);
      if (!result.success) {
        setError(result.message || 'Failed to delete item.');
      } else {
        setIsAlertOpen(false);
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
          <Button variant="destructive" size="sm" className="h-8 w-8 p-0" aria-label={`Delete ${itemTitle}`}>
            <Trash2 size={16} />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the featured item: <strong className="mx-1">{itemTitle}</strong>.
              {error && <p className="mt-3 text-sm font-medium text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
              {isDeleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : 'Yes, delete item'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
