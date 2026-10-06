"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

const COLORS = {
  EN_PROCESO: "#3b82f6", // blue-500
  DEMORADO: "#ef4444",   // red-500
  ENTREGADO: "#22c55e",  // green-500
  CANCELADO: "#94a3b8"   // slate-400
};

export default function DashboardCharts({ 
  lotesPorEstado,
  datosProduccion
}: { 
  lotesPorEstado: { name: string, value: number, fill: string }[],
  datosProduccion: { name: string, total: number, pagado: number }[]
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-sm font-bold text-slate-900 mb-6">Estado de los Lotes</h3>
        <div className="h-[250px] w-full">
          {lotesPorEstado.reduce((a, b) => a + b.value, 0) > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={lotesPorEstado}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {lotesPorEstado.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value} lotes`, "Cantidad"]}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
             <div className="h-full flex items-center justify-center text-slate-400 text-sm">Sin datos</div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-sm font-bold text-slate-900 mb-6">Producción vs Pagos</h3>
        <div className="h-[250px] w-full">
          {datosProduccion[0].total > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={datosProduccion}
                margin={{ top: 5, right: 10, left: 20, bottom: 5 }}
                barSize={40}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} />
                <Bar dataKey="total" name="Total Producción" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pagado" name="Total Pagado" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">Sin datos</div>
          )}
        </div>
      </div>
    </div>
  );
}
