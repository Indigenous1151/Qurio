import React from "react";

type Column<T> = {
  header: string;
  accessor: (row: T) => React.ReactNode;
};

type AdminTableProps<T> = {
  title: string;
  data: T[];
  columns: Column<T>[];

  currentPage: number;
  totalPages: number;

  onNext: () => void;
  onPrev: () => void;
  rowKey: (row: T) => string;

  loading?: boolean;
  error?: string | null;
};

export function AdminTable<T>({
  title,
  data,
  columns,
  currentPage,
  totalPages,
  onNext,
  onPrev,
  rowKey,
  loading = false,
  error = null,
}: AdminTableProps<T>) {
  return (
    <div className="max-w-7xl mx-auto px-6 pt-10">
      {/* Title */}
      <h1 className="text-3xl font-bold mb-6">{title}</h1>

      {/* Error */}
      {error && (
        <div className="mb-4 text-red-600 font-medium">
          {error}
        </div>
      )}

      {/* Table wrapper */}
      <div className="overflow-x-auto bg-white shadow rounded-xl">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="px-4 py-3">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {/* LOADING STATE */}
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-6 text-gray-500"
                >
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              /* EMPTY STATE */
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-6 text-gray-500"
                >
                  No data found.
                </td>
              </tr>
            ) : (
              /* DATA ROWS */
              data.map((row) => (
                <tr
                  key={rowKey(row)}
                  className="border-t hover:bg-gray-50"
                >
                  {columns.map((col, idx) => (
                    <td key={idx} className="px-4 py-3">
                      {col.accessor(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          onClick={onPrev}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
        >
          Previous
        </button>

        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={onNext}
          disabled={currentPage === totalPages || totalPages === 0}
          className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
        >
          Next
        </button>
      </div>
    </div>
  );
}