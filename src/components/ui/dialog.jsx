import * as React from 'react';
import { Dialog as HeadlessDialog } from '@headlessui/react';
import { X } from 'lucide-react';

export function Dialog({ open, onOpenChange, children }) {
  return (
    <HeadlessDialog
      open={open}
      onClose={() => onOpenChange?.(false)}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      {children}
    </HeadlessDialog>
  );
}

export function DialogContent({ children, ...props }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center p-4">
      <HeadlessDialog.Panel 
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
        {...props}
      >
        {children}
      </HeadlessDialog.Panel>
    </div>
  );
}

export function DialogHeader({ className, ...props }) {
  return (
    <div className="flex flex-col space-y-1.5 text-center sm:text-left" {...props} />
  );
}

export function DialogTitle({ children, ...props }) {
  return (
    <HeadlessDialog.Title 
      className="text-lg font-semibold leading-none tracking-tight"
      {...props}
    >
      {children}
    </HeadlessDialog.Title>
  );
}