export default function DashboardLayout({children}: {children: React.ReactNode}) {
  return (
    <div>
      {/* navigation */}
      <aside></aside>

      {/* content */}
      <div>
        <div>
          {children}
        </div>
      </div>

      {/* top-right-nav */}
      <div></div>

      {/* version indicator */}
      <div></div>
    </div>
  )
}