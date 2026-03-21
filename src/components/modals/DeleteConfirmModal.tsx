import { ConfirmModal } from './ConfirmModal';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  onConfirm(): void;
  onCancel(): void;
  isDeleting?: boolean;
}

export function DeleteConfirmModal({
  title,
  isDeleting = false,
  ...rest
}: DeleteConfirmModalProps) {
  return (
    <ConfirmModal
      {...rest}
      title={`«${title}» жою?`}
      confirmLabel="Жою"
      variant="danger"
      isLoading={isDeleting}
    />
  );
}
