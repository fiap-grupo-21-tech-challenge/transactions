import { useEffect, useRef, useMemo, useState } from "react";
import { RiArrowRightDownLine, RiArrowRightUpLine } from "react-icons/ri";
import { transactions as transactionServices, models } from '@grupo21/shared-react'
import TransactionTableActionButtons from "./transaction-table-action-buttons";
import TransactionDetailsModal from "./transaction-table-details-modal";
import TransactionTableEditModal from "./transaction-table-edit-modal";
import { useAppSelector } from "../../store/hooks";

export function TransactionsTable() {
  const { onTransationsByMonth, deleteTransaction } = transactionServices
  const { period, type, category, search } = useAppSelector((s) => s.filters);

  const { transactionTypes, TransactionDetailsHandle } = models
  const { Transaction } = transactionTypes
  const [transactions, setTransactions] = useState<typeof Transaction[]>([]);
  const [editing, setEditing] = useState<typeof Transaction | null>(null);

  const editRef = useRef<any>(null);
  const detailsRef = useRef<typeof TransactionDetailsHandle>(null);

  useEffect(() => {
    let unsub: (() => void) | undefined;

    unsub = onTransationsByMonth(period.year, period.month, setTransactions).then((unsubscribe) => {
      unsub = unsubscribe;
    });

    return () => {
      if (unsub) unsub();
    };
  }, [period.year, period.month]);

  function openView(t: typeof Transaction) {
    detailsRef.current?.open(t);
  }

  function openEdit(t: typeof Transaction) {
    setEditing(t);
    editRef.current?.open();
  }

  async function handleDelete(t: typeof Transaction) {
    await deleteTransaction(t.id);
  }

  function handleEditedSaved() {
    editRef.current?.close();
    setEditing(null);
  }

  const nfBRL = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const isIncome = (t: typeof models.Transaction) => t.type === "deposito";
  const isOutflow = (t: typeof models.Transaction) =>
    t.type === "saque" || t.type === "transferencia";

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return transactions.filter((t) => {
      const okType = type === "all" ? true : t.type === type;
      const okCat = category === "all" ? true : t.category === category;

      const okSearch = !q
        ? true
        : (t.description ?? "").toLowerCase().includes(q);

      return okType && okCat && okSearch;
    });
  }, [transactions, type, category, search]);

  type TransactionRowProp = {
    t: typeof Transaction;
  };

  function TransactionRow({ t }: TransactionRowProp) {
    const textColor =
      t?.type === "saque"
        ? "text-red-500"
        : t?.type === "deposito"
          ? "text-green-600"
          : "text-blue-500";

    return (
      <section
        key={t.id}
        onClick={() => openView(t)}
        className="flex justify-between rounded-lg border border-gray-200 bg-white p-5  w-full transition hover:shadow-md mb-3 cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          {t?.type === "deposito" ? (
            <RiArrowRightUpLine className={textColor} />
          ) : (
            <RiArrowRightDownLine className={textColor} />
          )}

          <div>
            <p className="font-semibold">{t?.description}</p>
            <p className="opacity-60">
              {t.category} •{" "}
              {t.date.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
              })}
            </p>
          </div>
        </div>

        <div className="text-end">
          <h2 className={`font-bold ${textColor}`}>{nfBRL.format(t.value)}</h2>

          <div className="mt-1">
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
              {t?.type}
            </span>
          </div>
        </div>
      </section>
    );
  }

  const columns = [
    { key: "type", label: "Tipo" },
    { key: "description", label: "Descrição" },
    { key: "category", label: "Categoria" },
    { key: "date", label: "Data" },
    { key: "value", label: "Valor", align: "right" },
    { key: "actions", label: "Ações", align: "right" },
  ];

  return (
    <section className={'flex flex-col justify-between rounded-2xl mt-5 border border-gray-200 bg-white p-5 w-full'}>
      <h2 className="text-lg font-semibold">
        Lista de Transações
      </h2>
      {filtered.length === 0 ? (
        <p>(sem transações)</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-4 py-2 border-b border-gray-200 ${col.align === "right"
                      ? "text-right"
                      : col.align === "center"
                        ? "text-center"
                        : ""
                      }`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const textColor =
                  t.type === "saque"
                    ? "text-red-500"
                    : t.type === "deposito"
                      ? "text-green-600"
                      : "text-blue-500";

                return (
                  <tr
                    key={t.id}
                    className="transition-all hover:bg-gray-50 cursor-pointer border-b border-gray-200"
                  >
                    {columns.map((col) => {
                      switch (col.key) {
                        case "type":
                          return (
                            <td key={col.key} className="px-4 py-2">
                              <div className="flex items-center gap-1.5">
                                {t?.type === "deposito" ? (
                                  <RiArrowRightUpLine className={textColor} />
                                ) : (
                                  <RiArrowRightDownLine
                                    className={textColor}
                                  />
                                )}
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                                  {t?.category}
                                </span>
                              </div>
                            </td>
                          );
                        case "description":
                          return (
                            <td key={col.key} className="px-4 py-2">
                              {t.description}
                            </td>
                          );
                        case "category":
                          return (
                            <td key={col.key} className="px-4 py-2">
                              {t.category}
                            </td>
                          );
                        case "date":
                          return (
                            <td key={col.key} className="px-4 py-2">
                              {t.date.toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "short",
                              })}
                            </td>
                          );
                        case "value":
                          return (
                            <td
                              key={col.key}
                              className={`px-4 py-2 text-right ${textColor}`}
                            >
                              {isIncome(t) ? "+ " : "- "}
                              {nfBRL.format(Math.abs(t.value))}
                            </td>
                          );
                        case "actions":
                          return (
                            <td
                              key={col.key}
                              className="px-4 py-2 flex justify-end"
                            >
                              <TransactionTableActionButtons
                                itemLabel={t.description}
                                onView={() => openView(t)}
                                onEdit={() => openEdit(t)}
                                onDelete={() => handleDelete(t)}
                              />
                            </td>
                          );
                        default:
                          return <td key={col.key}></td>;
                      }
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <TransactionDetailsModal
        ref={detailsRef}
        onEdit={(t) => openEdit(t)}
        onDelete={(t) => handleDelete(t)}
      />

      <TransactionTableEditModal
        editing={editing}
        handleEditedSaved={handleEditedSaved}
        editRef={editRef}
      />
    </section>
  );
}