import React from 'react';
import { FaEllipsisH, FaRegSquare, FaTrash, FaPen, FaSpinner } from 'react-icons/fa';
import clsx from 'clsx';

/**
 * DataTable — highly reusable table component styled to match UBold-inspired UX.
 *
 * Props:
 * - title: string — table title shown above the card (optional)
 * - description: string — helper text under the title (optional)
 * - columns: Array<{
 *     id: string,
 *     label: string,
 *     width?: string | number,
 *     align?: 'left' | 'center' | 'right',
 *     render?: (row, rowIndex) => React.ReactNode,
 *     className?: string,
 *     headerClassName?: string,
 *   }>
 * - rows: Array<any>
 * - loading: boolean
 * - emptyMessage: string
 * - selectable: boolean — shows leading checkboxes and exposes callbacks
 * - selectedRowIds: string[] | number[]
 * - onToggleRow: (rowId: string | number) => void
 * - onToggleAll: () => void
 * - headerActions: React.ReactNode — actions rendered aligned to the right of the title
 * - toolbar: React.ReactNode — optional filters/toolbars stacked below header
 * - rowActions: (row) => React.ReactNode | undefined — custom actions per row
 */
export default function DataTable({
  title,
  description,
  columns,
  rows,
  loading = false,
  emptyMessage = 'No records found.',
  selectable = false,
  selectedRowIds = [],
  onToggleRow,
  onToggleAll,
  headerActions,
  toolbar,
  rowActions,
}) {
  const resolvedColumns = Array.isArray(columns) ? columns : [];
  const resolvedRows = Array.isArray(rows) ? rows : [];

  const allRowsSelected = selectable && resolvedRows.length > 0 && selectedRowIds.length === resolvedRows.length;

  return (
    <section className="bg-white border border-slate-200 rounded-sm shadow-sm">
      {(title || headerActions) && (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between p-5 border-b border-slate-200">
          <div>
            {title && <h2 className="text-xl font-semibold text-slate-900">{title}</h2>}
            {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
          </div>
          {headerActions && <div className="flex items-center gap-2 flex-wrap">{headerActions}</div>}
        </div>
      )}

      {toolbar && <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/70">{toolbar}</div>}

      <div className="relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
            <FaSpinner className="animate-spin text-indigo-500 text-2xl" />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-100 text-slate-600 uppercase text-xs font-semibold tracking-wide">
              <tr>
                {selectable && (
                  <th className="w-12 px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      className="accent-indigo-600"
                      checked={allRowsSelected}
                      onChange={onToggleAll}
                    />
                  </th>
                )}
                {resolvedColumns.map((col) => (
                  <th
                    key={col.id}
                    style={col.width ? { width: col.width } : undefined}
                    className={clsx('px-4 py-3 text-left align-middle', col.headerClassName, {
                      'text-center': col.align === 'center',
                      'text-right': col.align === 'right',
                    })}
                  >
                    {col.label}
                  </th>
                ))}
                {rowActions && <th className="px-4 py-3 text-right w-16">Actions</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {!loading && resolvedRows.length === 0 && (
                <tr>
                  <td
                    colSpan={resolvedColumns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)}
                    className="px-6 py-12 text-center text-slate-500 text-sm"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )}

              {resolvedRows.map((row, rowIndex) => {
                const rowId = row.id ?? row.key ?? rowIndex;
                const isSelected = selectable && selectedRowIds.includes(rowId);

                return (
                  <tr key={rowId} className="hover:bg-slate-50 transition">
                    {selectable && (
                      <td className="px-4 py-3 align-middle">
                        <input
                          type="checkbox"
                          className="accent-indigo-600"
                          checked={isSelected}
                          onChange={() => onToggleRow?.(rowId)}
                        />
                      </td>
                    )}

                    {resolvedColumns.map((col) => (
                      <td
                        key={`${rowId}-${col.id}`}
                        className={clsx('px-4 py-3 align-middle text-sm text-slate-700', col.className, {
                          'text-center': col.align === 'center',
                          'text-right': col.align === 'right',
                        })}
                      >
                        {col.render ? col.render(row, rowIndex) : row[col.id] ?? '\u2014'}
                      </td>
                    ))}

                    {rowActions && (
                      <td className="px-4 py-3 text-right align-middle">
                        <div className="inline-flex items-center gap-2 text-slate-500">
                          {rowActions(row)}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}