/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// components/admin/NavigationManager.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useActionState } from 'react';
import { PopulatedNavItem } from '@/lib/data/navigation';
import {
  upsertNavigationItemAction,
  deleteNavigationItemAction,
  reorderNavigationItemsAction, // Added for future use
  type NavigationItemFormState,
} from '@/lib/actions/navigationActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"; // Assuming Shadcn/UI Dialog
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
} from "@/components/ui/alert-dialog"; // Assuming Shadcn/UI AlertDialog
import { PlusCircle, Edit3, Trash2, GripVertical, ChevronDown, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { type NavigationItem as PrismaNavigationItem } from '@prisma/client'; // For form data type

interface NavigationManagerProps {
  initialItems: PopulatedNavItem[];
}

interface NavItemFormData {
  id?: string;
  label: string;
  href: string;
  order: number;
  parentId?: string | null;
}

const initialFormState: NavigationItemFormState = { message: '', success: undefined, fieldErrors: {} };

function NavigationItemForm({
  itemToEdit,
  parentId,
  onFormSubmitSuccess,
  onCancel,
  existingItems, // For parent selector
}: {
  itemToEdit?: PrismaNavigationItem | Partial<PrismaNavigationItem>;
  parentId?: string | null;
  onFormSubmitSuccess: (item: PrismaNavigationItem) => void;
  onCancel: () => void;
  existingItems: PopulatedNavItem[];
}) {
  const [state, formAction, isPending] = useActionState(upsertNavigationItemAction, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success && state.item) {
      onFormSubmitSuccess(state.item);
      formRef.current?.reset(); // Reset form fields after successful submission
    }
  }, [state.success, state.item, onFormSubmitSuccess]);

  const defaultOrder = itemToEdit?.order ?? 0;

  const flattenItemsForSelect = (items: PopulatedNavItem[], prefix = ""): { value: string; label: string }[] => {
    let options: { value: string; label: string }[] = [];
    items.forEach(item => {
      // Prevent selecting the item itself or its descendants as its parent
      if (itemToEdit?.id !== item.id) {
        options.push({ value: item.id, label: prefix + item.label });
        if (item.children && item.children.length > 0) {
          options = options.concat(flattenItemsForSelect(item.children, prefix + "-- "));
        }
      }
    });
    return options;
  };
  const parentOptions = flattenItemsForSelect(existingItems);


  return (
    <form action={formAction} ref={formRef} className="space-y-4">
      {state.message && (
         <div className={`flex items-start p-3 rounded-md text-sm border ${ state.success ? 'bg-green-50 border-green-300 text-green-700' : 'bg-red-50 border-red-300 text-red-700'}`} role="alert" >
            {state.success ? <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0" /> : <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />}
            <span>{state.message}</span>
        </div>
      )}
      {itemToEdit?.id && <input type="hidden" name="id" defaultValue={itemToEdit.id} />}
      
      <div>
        <Label htmlFor="label">Label*</Label>
        <Input id="label" name="label" defaultValue={itemToEdit?.label ?? ''} required />
        {state.fieldErrors?.label && <p className="text-xs text-red-500 mt-1">{state.fieldErrors.label.join(', ')}</p>}
      </div>
      <div>
        <Label htmlFor="href">Link/Href*</Label>
        <Input id="href" name="href" defaultValue={itemToEdit?.href ?? ''} required placeholder="/example-page or https://example.com" />
        {state.fieldErrors?.href && <p className="text-xs text-red-500 mt-1">{state.fieldErrors.href.join(', ')}</p>}
      </div>
      <div>
        <Label htmlFor="order">Order</Label>
        <Input id="order" name="order" type="number" defaultValue={defaultOrder} />
         {state.fieldErrors?.order && <p className="text-xs text-red-500 mt-1">{state.fieldErrors.order.join(', ')}</p>}
      </div>
      <div>
        <Label htmlFor="parentId">Parent Item</Label>
        <select
          id="parentId"
          name="parentId"
          defaultValue={itemToEdit?.parentId ?? parentId ?? ""}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md bg-white"
        >
          <option value="">-- No Parent (Root Item) --</option>
          {parentOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {state.fieldErrors?.parentId && <p className="text-xs text-red-500 mt-1">{state.fieldErrors.parentId.join(', ')}</p>}
      </div>
      <DialogFooter className="mt-6">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>Cancel</Button>
        <Button type="submit" disabled={isPending} className="bg-sky-500 hover:bg-sky-600">
          {isPending ? 'Saving...' : (itemToEdit?.id ? 'Update Item' : 'Add Item')}
        </Button>
      </DialogFooter>
    </form>
  );
}


function NavItemDisplay({
  item,
  level = 0,
  onEdit,
  onDelete,
  onAddChild,
  isDragging, // For future drag-and-drop
  dragHandleProps, // For future drag-and-drop
}: {
  item: PopulatedNavItem;
  level?: number;
  onEdit: (item: PrismaNavigationItem) => void;
  onDelete: (itemId: string, itemLabel: string) => void;
  onAddChild: (parentId: string) => void;
  isDragging?: boolean;
  dragHandleProps?: any;
}) {
  const [isExpanded, setIsExpanded] = useState(true); // Default to expanded

  return (
    <div className={`rounded-md ${level > 0 ? 'ml-6' : ''} ${isDragging ? 'opacity-50 bg-sky-100' : ''}`}>
      <div className={`flex items-center justify-between p-3 rounded-t-md group ${level === 0 ? 'bg-slate-100 border border-slate-200' : 'bg-white border border-slate-200 mt-2'}`}>
        <div className="flex items-center">
          {/* <Button variant="ghost" size="sm" className="cursor-grab mr-2" {...dragHandleProps}><GripVertical size={16} /></Button> */}
          {item.children && item.children.length > 0 && (
            <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)} className="mr-1 h-7 w-7">
              {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </Button>
          )}
          <span className={`font-medium ${level === 0 ? 'text-slate-700' : 'text-slate-600'}`}>{item.label}</span>
          <span className="text-xs text-slate-500 ml-2 truncate group-hover:hidden">({item.href})</span>
          <span className="text-xs text-slate-400 ml-2 hidden group-hover:inline">Order: {item.order}</span>
        </div>
        <div className="space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="outline" size="sm" onClick={() => onAddChild(item.id)} className="h-7 px-2 py-1 text-xs">
            <PlusCircle size={14} className="mr-1" /> Add Child
          </Button>
          <Button variant="outline" size="sm" onClick={() => onEdit(item)} className="h-7 px-2 py-1 text-xs">
            <Edit3 size={14} className="mr-1" /> Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(item.id, item.label)} className="h-7 px-2 py-1 text-xs">
            <Trash2 size={14} className="mr-1" /> Delete
          </Button>
        </div>
      </div>
      {isExpanded && item.children && item.children.length > 0 && (
        <div className={`pl-4 py-1 rounded-b-md ${level === 0 ? 'border border-t-0 border-slate-200' : ''}`}>
          {item.children.map((child) => (
            <NavItemDisplay
              key={child.id}
              item={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function NavigationManager({ initialItems }: NavigationManagerProps) {
  const [items, setItems] = useState<PopulatedNavItem[]>(initialItems);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PrismaNavigationItem | Partial<PrismaNavigationItem> | undefined>(undefined);
  const [selectedParentId, setSelectedParentId] = useState<string | null | undefined>(null); // For adding child to specific parent

  // For delete confirmation
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; label: string } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);


  // Effect to update local state if initialItems prop changes (e.g., after a server action revalidates and page re-fetches)
   useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);


  const handleOpenModalForNew = (parentId?: string | null) => {
    setEditingItem({}); // Empty object for new item
    setSelectedParentId(parentId);
    setIsModalOpen(true);
  };

  const handleOpenModalForEdit = (item: PrismaNavigationItem) => {
    setEditingItem(item);
    setSelectedParentId(item.parentId); // Set parentId for editing context
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(undefined);
    setSelectedParentId(null);
  };

  const handleFormSubmitSuccess = async (changedItem: PrismaNavigationItem) => {
    // This is tricky: server revalidates, page re-fetches, initialItems updates, useEffect updates items.
    // For immediate UI feedback, you might manually update 'items' state, but it can get complex with hierarchy.
    // Relying on Next.js revalidation + useEffect is simpler.
    handleCloseModal();
    // Force a re-fetch by calling an action or navigating (if revalidatePath isn't enough)
    // For now, we assume revalidateTag in the action is sufficient and useEffect will update.
    // To be robust, you might need to trigger a manual refresh of the items list if needed.
    // Example: const updatedItems = await getAdminNavigationItems(); setItems(updatedItems);
    // This would require getAdminNavigationItems to be callable from client, not ideal.
    // Best to rely on Next.js data flow.
  };

  const handleDeleteConfirmation = (itemId: string, itemLabel: string) => {
    setItemToDelete({ id: itemId, label: itemLabel });
    setDeleteError(null);
    setIsAlertOpen(true);
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    const result = await deleteNavigationItemAction(itemToDelete.id);
    if (!result.success) {
      setDeleteError(result.message);
    } else {
      setIsAlertOpen(false); // Close dialog on success
      setItemToDelete(null);
      // Data will be re-fetched due to revalidation in action
    }
    setIsDeleting(false);
  };


  return (
    <div className="bg-white p-6 rounded-xl shadow-xl border border-slate-200 space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => handleOpenModalForNew(null)} className="bg-sky-500 hover:bg-sky-600">
          <PlusCircle size={20} className="mr-2" /> Add Root Item
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-slate-500 text-center py-4">No navigation items yet. Add one to get started!</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <NavItemDisplay
              key={item.id}
              item={item}
              onEdit={handleOpenModalForEdit}
              onDelete={handleDeleteConfirmation}
              onAddChild={(parentId) => handleOpenModalForNew(parentId)}
            />
          ))}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingItem?.id ? 'Edit' : 'Add'} Navigation Item</DialogTitle>
            <DialogDescription>
              {editingItem?.id ? 'Modify the details of this navigation item.' : 'Create a new item for your site navigation.'}
            </DialogDescription>
          </DialogHeader>
          <NavigationItemForm
            itemToEdit={editingItem}
            parentId={selectedParentId}
            onFormSubmitSuccess={handleFormSubmitSuccess}
            onCancel={handleCloseModal}
            existingItems={items} // Pass all items for parent selection
          />
        </DialogContent>
      </Dialog>

       <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this item?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the item &quot;<strong>{itemToDelete?.label}</strong>&quot;.
              If this item has children, they will also be deleted. This action cannot be undone.
              {deleteError && <p className="mt-2 text-sm text-red-600">{deleteError}</p>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
              {isDeleting ? 'Deleting...' : 'Yes, delete item'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
