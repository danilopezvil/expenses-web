export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold font-headline tracking-tight text-on-surface">
          Resumen General
        </h1>
        <p className="text-on-surface-variant text-sm mt-1">Vista de gastos compartidos del periodo.</p>
      </div>

      {/* KPI placeholders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {['Total Gastado', 'Asignado', 'Sin Asignar', 'Gastos Totales'].map((label) => (
          <div
            key={label}
            className="bg-surface-container-lowest p-6 rounded-lg ring-1 ring-outline-variant/20 shadow-sm"
          >
            <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 opacity-70">
              {label}
            </p>
            <div className="h-8 w-24 bg-surface-container rounded animate-pulse mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
