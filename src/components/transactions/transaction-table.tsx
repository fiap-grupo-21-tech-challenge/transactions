import { useEffect, useRef, useMemo, useState, useCallback } from "react";
import { RiArrowRightDownLine, RiArrowRightUpLine } from "react-icons/ri";
import { transactions as transactionServices, models } from '@grupo21/shared-react'
import TransactionTableActionButtons from "./transaction-table-action-buttons";
import TransactionDetailsModal from "./transaction-table-details-modal";
import TransactionTableEditModal from "./transaction-table-edit-modal";
import { useAppSelector } from "../../store/hooks";

const PAGE_SIZE = 20;

function norm(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function TransactionsTable({ createModalRef }: any) {
  const { listAllTransactionsPage, deleteTransaction } = transactionServices

  const { transactionTypes, TransactionDetailsHandle } = models
  const { Transaction } = transactionTypes
  const [transactions, setTransactions] = useState<typeof Transaction[]>([]);
  const [editing, setEditing] = useState<typeof Transaction | null>(null);

  const [loading, setLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState<any | null>(null);
  const [pageCursors, setPageCursors] = useState<(any | null)[]>([null]);
  const [pageIndex, setPageIndex] = useState(0);

  const editRef = useRef<any>(null);
  const detailsRef = useRef<typeof TransactionDetailsHandle>(null);

  const { period, type, category, search } = useAppSelector((s) => s.filters);

  const nfBRL = useMemo(
    () =>
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
    []
  );

  const filteredTransactions = useMemo(() => {
    const q = norm(search ?? "");

    return transactions.filter((t) => {
      const sameMonth =
        t.date.getFullYear() === Number(period.year) &&
        t.date.getMonth() + 1 === Number(period.month);

      if (!sameMonth) return false;

      if (type !== "all" && t.type !== type) return false;

      if (category !== "all" && t.category !== category) return false;

      if (q) {
        const hay = norm(
          `${t.description ?? ""} ${t.category ?? ""} ${t.type ?? ""}`
        );
        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }, [transactions, period.year, period.month, type, category, search]);


  const openView = (t: typeof models.Transaction) => detailsRef.current?.open(t);

  function openEdit(t: typeof Transaction) {
    setEditing(t);
    editRef.current?.open();
  }

  async function handleDelete(t: typeof Transaction) {
    await deleteTransaction(t.id);
    setTransactions((prev) => prev.filter((x) => x.id !== t.id));
  }

  // function handleSaved(saved: Transaction) {
  function handleSaved(saved: any) {
    if (editing) {
      editRef.current?.close();
    } else {
      createModalRef.current?.close()
    }

    setEditing(null);

    console.log('saved: ', saved)
    setTransactions((prev) => {
      const idx = prev.findIndex((t) => t.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }

      return [saved, ...prev].slice(0, PAGE_SIZE);
    });
  }

  // const loadPage = useCallback(async (cursor: TxCursor | null) => {
  const loadPage = useCallback(async (cursor: any | null) => {
    setLoading(true);
    try {
      const { items, nextCursor } = await listAllTransactionsPage(
        PAGE_SIZE,
        cursor ?? undefined
      );

      setTransactions(items);
      setNextCursor(nextCursor);
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    loadPage(null);
  }, [loadPage]);

  async function goNext() {
    if (!nextCursor) return;
    const newIndex = pageIndex + 1;
    setPageCursors((prev) => {
      const copy = [...prev];
      copy[newIndex] = nextCursor;
      return copy;
    });
    setPageIndex(newIndex);
    await loadPage(nextCursor);
  }

  async function goPrev() {
    if (pageIndex === 0) return;

    const newIndex = pageIndex - 1;
    const prevCursor = pageCursors[newIndex] ?? null;

    setPageIndex(newIndex);
    await loadPage(prevCursor);
  }

  const columns = useMemo(
    () => [
      { key: "type", label: "Tipo" },
      { key: "description", label: "Descrição" },
      { key: "category", label: "Categoria" },
      { key: "date", label: "Data" },
      { key: "value", label: "Valor", align: "right" },
      { key: "actions", label: "Ações", align: "right" },
    ],
    []
  )

  return (
    <section className={'flex flex-col justify-between rounded-2xl mt-5 border border-gray-200 bg-white p-5 w-full'}>
      <h2 className="text-lg font-semibold">
        Lista de Transações
      </h2>

      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-sm text-slate-600">
          Página <span className="font-semibold">{pageIndex + 1}</span>

          <span className="ml-3 text-slate-400">
            Mostrando{" "}
            <span className="font-semibold">
              {filteredTransactions.length}
            </span>{" "}
            de <span className="font-semibold">{transactions.length}</span>{" "}
            nesta página
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="button-secondary"
            type="button"
            onClick={goPrev}
            disabled={loading || pageIndex === 0}
          >
            Anterior
          </button>

          <button
            className="button-secondary"
            type="button"
            onClick={goNext}
            disabled={loading || !nextCursor}
          >
            Próxima
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Carregando…</p>
      ) : filteredTransactions.length === 0 ? (
        <p className="text-sm text-slate-600">
          Nenhuma transação encontrada com os filtros atuais.
        </p>
      ) : (
        <div className="max-h-[70vh] overflow-y-auto overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 bg-white">
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
              {filteredTransactions.map((t) => {
                const isOut =
                  t.type === "saque" || t.type === "transferencia";
                const textColor = isOut ? "text-red-500" : "text-green-600";
                const isIn = t.type === "deposito";

                return (
                  <tr
                    key={t.id}
                    className="transition-all hover:bg-gray-50 cursor-pointer border-b border-gray-200"
                    onClick={() => openView(t)}
                  >
                    {columns.map((col) => {
                      switch (col.key) {
                        case "type":
                          return (
                            <td key={col.key} className="px-4 py-2">
                              <div className="flex items-center gap-1.5">
                                {isIn ? (
                                  <RiArrowRightUpLine className={textColor} />
                                ) : (
                                  <RiArrowRightDownLine
                                    className={textColor}
                                  />
                                )}
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                                  {t.type}
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
                                year: "numeric",
                              })}
                            </td>
                          );

                        case "value":
                          return (
                            <td
                              key={col.key}
                              className={`px-4 py-2 text-right ${textColor}`}
                            >
                              {t.value >= 0 ? "+ " : "- "}
                              {nfBRL.format(Math.abs(t.value))}
                            </td>
                          );

                        case "actions":
                          return (
                            <td
                              key={col.key}
                              className="px-4 py-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex justify-end">
                                <TransactionTableActionButtons
                                  itemLabel={t.description}
                                  onView={() => openView(t)}
                                  onEdit={() => openEdit(t)}
                                  onDelete={() => handleDelete(t)}
                                />
                              </div>
                            </td>
                          );

                        default:
                          return <td key={col.key} />;
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
        handleEditedSaved={handleSaved}
        editRef={editRef}
      />
    </section>
  );
}