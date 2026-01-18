import { FiPlus } from "react-icons/fi";
import { hooks } from '@grupo21/shared-react'
import { TransactionsTable } from "./components/transactions/transaction-table";
import { Card } from "./components/ui/card";
import { useState, useRef } from "react";
import { ModalHandle } from "./components/ui/modal";
import TransactionCreateModal from "./components/transactions/transaction-create-modal";

export default function Transacoes() {
  const { useTransactions } = hooks;
  const { balance, monthlyIncome, monthlyExpenses } = useTransactions()


  //  const textColor =
  //     t?.type === "saque"
  //       ? "text-red-500"
  //       : t?.type === "deposito"
  //       ? "text-green-600"
  //       : "text-blue-500";

  return (
    // <RequireAuth>
    <div className="p-16">
      <header className="flex items-center justify-between">
        <div className="{`space-y-1 ${className ??}`}">
          <h1 className="text-3xl font-extrabold leading-tight text-slate-900">
            Todas as transações
          </h1>

          <p className="text-base text-slate-500 font-bold">
            Gerencie e visualize todas as suas transações
          </p>
        </div>

        <TransactionCreateModal />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full mt-5">
        <Card type="balance" amount={balance} />
        <Card type="monthlyIncome" amount={monthlyIncome} />
        <Card type="monthlyExpenses" amount={monthlyExpenses} />
      </div>

      <TransactionsTable />
    </div>
    // </RequireAuth>
  );
}
