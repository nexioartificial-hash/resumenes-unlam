export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-fondo flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-[3px] border-verde/20 border-t-verde rounded-full animate-spin" />
        <p className="text-tinta/40 text-sm tracking-widest font-medium">CARGANDO...</p>
      </div>
    </div>
  )
}
