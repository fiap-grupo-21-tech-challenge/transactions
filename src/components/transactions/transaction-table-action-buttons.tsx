"use client";

import { useRef } from "react";
import ConfirmDeleteModal, { ConfirmDeleteHandle } from "./transaction-table-delete-modal";
import { FiEdit2, FiTrash2, FiEye } from "react-icons/fi";

type Props = {
  itemLabel?: string;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => Promise<void> | void;
};

export default function TransactionTableActionButtons({
  itemLabel,
  onView,
  onEdit,
  onDelete,
}: Props) {
  const confirmRef = useRef<any>(null);

  function openDelete() {
    if (!onDelete) return;
    confirmRef.current?.open({
      label: itemLabel,
      onConfirm: onDelete,
    });
  }

  return (
    <>
      <div className="flex items-center gap-2 w-fit">
        <button
          type="button"
          aria-label="Ver detalhes"
          title="Ver detalhes"
          onClick={onView}
          className="p-2 border border-gray-300 rounded-md text-black hover:bg-gray-50 hover:text-white"
        >
          <FiEye />
        </button>

        <button
          type="button"
          aria-label="Editar"
          title="Editar"
          onClick={onEdit}
          className="p-2 border border-gray-300 rounded-md text-black hover:bg-gray-50 hover:text-white"
        >
          <FiEdit2 />
        </button>

        <button
          type="button"
          aria-label="Excluir"
          title="Excluir"
          onClick={openDelete}
          className="p-2 border border-gray-300 rounded-md text-black hover:bg-gray-50 hover:text-white"
        >
          <FiTrash2 className="h-4 w-4" />
        </button>
      </div>

      <ConfirmDeleteModal ref={confirmRef} />
    </>
  );
}
