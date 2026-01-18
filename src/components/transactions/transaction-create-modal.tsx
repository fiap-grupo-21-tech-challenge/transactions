import TransactionForm from './transaction-form'
import Modal, { ModalHandle } from '../ui/modal'
import { useRef, useState } from 'react';
import { FiPlus } from "react-icons/fi";

export default function TransactionCreateModal() {
  const [formKey, setFormKey] = useState(0);
  const modalRef = useRef<ModalHandle>(null);

  function openModal() {
    setFormKey((k) => k + 1);
    modalRef.current?.open();
  }

  function closeModal() {
    modalRef.current?.close();
  }

  function handleSaved() {
    closeModal();
    // onCreated?.();
  }

  return (
    <>
      <button
        onClick={openModal}
        className="button-primary w-full md:w-auto shrink-0"
        aria-haspopup="dialog"
        aria-controls="transaction-modal"
      >
        <span className="inline-flex items-center justify-center gap-2">
          <FiPlus aria-hidden />
          Adicionar Transação
        </span>
      </button>

      <Modal ref={modalRef} title="Nova Transação">
        <div id="transaction-modal">
          <TransactionForm
            key={formKey}
            onSaved={handleSaved}
            onCancel={closeModal}
          />
        </div>
      </Modal>
    </>

  )
}
