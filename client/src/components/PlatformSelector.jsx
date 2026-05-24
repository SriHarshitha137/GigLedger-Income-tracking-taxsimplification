const platforms = ['Ola', 'Uber', 'Swiggy', 'Zomato', 'Dunzo', 'Urban Company', 'Rapido'];

const PlatformSelector = ({ value, onChange }) => {
  const selected = value || [];

  const toggle = (platform) => {
    if (selected.includes(platform)) onChange(selected.filter((item) => item !== platform));
    else onChange([...selected, platform]);
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {platforms.map((platform) => {
        const active = selected.includes(platform);
        return (
          <button
            type="button"
            key={platform}
            onClick={() => toggle(platform)}
            className={`rounded-2xl border p-4 text-left text-sm font-semibold transition-all duration-200 hover:-translate-y-px ${active ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-lg shadow-blue-100' : 'border-slate-200 bg-white text-slate-700 shadow-sm'}`}
          >
            <span className="block">{platform}</span>
            <span className="mt-1 block text-xs font-medium text-slate-500">Gig app collection source</span>
          </button>
        );
      })}
    </div>
  );
};

export default PlatformSelector;
