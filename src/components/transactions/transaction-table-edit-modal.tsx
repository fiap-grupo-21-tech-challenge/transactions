import React from 'react'
import Modal from '../ui/modal'
import TransactionForm from './transaction-form'

export default function TransactionTableEditModal({ editRef, editing, handleEditedSaved }) {
  return (
    <Modal ref={editRef} title="Editar Transação">
      {editing ? (
        <TransactionForm
          initial={editing}
          onSaved={handleEditedSaved}
          onCancel={() => editRef.current?.close()}
        />
      ) : (
        <p>Nenhuma transação selecionada.</p>
      )}
    </Modal>
  )
}
