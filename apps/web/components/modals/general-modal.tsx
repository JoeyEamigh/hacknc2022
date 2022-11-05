import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { classes } from 'shared';

export default function GeneralModal({
  open,
  onClose,
  children,
  clean,
  className,
  big,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  clean?: boolean;
  className?: string;
  big?: boolean;
}) {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-20 overflow-y-auto" onClose={onClose}>
        <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0">
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
            {clean ? (
              <div className={classes('inline-block transform align-middle transition-all', className)}>{children}</div>
            ) : (
              <div
                className={classes(
                  'bg-bg inline-block w-full transform rounded-lg px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:p-6 sm:align-middle',
                  big ? 'max-w-5xl' : 'max-w-3xl',
                  className,
                )}>
                {children}
              </div>
            )}
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
