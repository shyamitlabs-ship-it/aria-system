function KPICard({ label, value, sub, accent }) {
  return (
    <div
      className="bg-white rounded-xl border border-slate-200 p-5"
      style={{ borderLeft: `3px solid ${accent}` }}
    >
      <div
        className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none"
      >
        {value}
      </div>
      <div className="text-xs font-medium text-slate-500 mt-2">{label}</div>
      <div
        className="text-xs font-semibold mt-2"
        style={{ color: accent }}
      >
        {sub}
      </div>
    </div>
  )
}

export default KPICard