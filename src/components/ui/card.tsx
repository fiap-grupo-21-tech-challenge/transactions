import { transactions, constants, utils } from '@grupo21/shared-react'


export function Card({ amount, type }: any) {
  const { colorsByType } = constants;
  const { formatCurrency } = utils;

  const getCaption = (filterType: "deposito" | "saque") => {
    const count = transactions.filter(
      (t) =>
        t.type === filterType &&
        new Date(t.date).getMonth() === new Date().getMonth()
    ).length;
    return count === 1 ? "1 transação" : `${count} transações`;
  };

  const { bg, text, icon: Icon, title, caption } = colorsByType[type];

  return (
    <section className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 w-full transition hover:shadow-md">
      <div className="flex flex-row justify-between items-center pb-3">
        <p className="text-sm text-gray-600 font-semibold">{title}</p>
      </div>

      <div className={`text-2xl font-bold ${type !== "balance" ? text : ""}`}>
        {formatCurrency(amount)}
      </div>
    </section>
  );
}