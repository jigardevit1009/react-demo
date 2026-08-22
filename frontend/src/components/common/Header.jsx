// Functional Component using JSX
function Header() {
  const appTitle = "Employee Task & Productivity Dashboard";
  const subtitle = "Track team progress, employee productivity, and daily tasks";
  const projectDate = "Demo: 26 August 2026";

  return (
    <header className="bg-white border-b border-gray-200 py-6 px-8 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            {appTitle}
          </h1>
          <p className="text-sm text-gray-500">
            {subtitle}
          </p>
        </div>
        <div>
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full inline-block">
            {projectDate}
          </span>
        </div>
      </div>
    </header>
  );
}

export default Header;
