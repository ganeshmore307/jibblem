import { db } from "@/lib/data/store";
import { formatMediumDate } from "@/lib/time";
import { Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default function InvoicesPage() {
  const database = db();
  const invoices = [...database.invoices].sort((a, b) => b.issueDate.localeCompare(a.issueDate));
  const total = invoices.reduce((s, i) => s + i.amount, 0);
  const outstanding = invoices.filter((i) => i.status === "sent" || i.status === "overdue").reduce((s, i) => s + i.amount, 0);

  return (
    <div className="p-4 lg:p-6 max-w-4xl space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl shadow-card p-4">
          <div className="text-xs font-bold text-muted uppercase">Total invoiced</div>
          <div className="text-2xl font-extrabold mt-1">₹{total.toLocaleString("en-IN")}</div>
        </div>
        <div className="bg-white rounded-xl shadow-card p-4">
          <div className="text-xs font-bold text-muted uppercase">Outstanding</div>
          <div className="text-2xl font-extrabold mt-1">₹{outstanding.toLocaleString("en-IN")}</div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-card overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-line text-xs font-extrabold text-muted uppercase">
              <th className="text-left px-4 py-2.5">Invoice</th>
              <th className="text-left px-3 py-2.5">Client</th>
              <th className="text-left px-3 py-2.5">Issued</th>
              <th className="text-left px-3 py-2.5">Due</th>
              <th className="text-right px-3 py-2.5">Amount</th>
              <th className="text-left px-3 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-b border-line last:border-0 hover:bg-gray-50">
                <td className="px-4 py-2.5 font-bold">{inv.number}</td>
                <td className="px-3 py-2.5">{database.clients.find((c) => c.id === inv.clientId)?.name ?? "—"}</td>
                <td className="px-3 py-2.5">{formatMediumDate(inv.issueDate)}</td>
                <td className="px-3 py-2.5">{formatMediumDate(inv.dueDate)}</td>
                <td className="px-3 py-2.5 text-right font-extrabold">₹{inv.amount.toLocaleString("en-IN")}</td>
                <td className="px-3 py-2.5">
                  <Badge tone={inv.status === "paid" ? "green" : inv.status === "overdue" ? "red" : inv.status === "sent" ? "blue" : "gray"}>
                    {inv.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted">
        Invoices are generated from billable tracked time. Billable rates are configured per member in People.
      </p>
    </div>
  );
}
