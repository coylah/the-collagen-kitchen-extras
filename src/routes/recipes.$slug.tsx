function PlanPicker({ onPick }: { onPick: (day: string, slot: Slot) => void }) {
  const { plan } = useMealPlan();
  return (
    <div className="mt-4 rounded-xl border border-border p-4">
      <p className="mb-3 text-xs text-muted-foreground">
        Tap a slot to add this recipe. Filled slots are shown in rose.
      </p>
      <div className="overflow-x-auto">
        <div className="grid grid-cols-[auto_repeat(4,1fr)] gap-1 text-xs min-w-[320px]">
          <div />
          {SLOTS.map(s => (
            <div key={s} className="px-1 text-center capitalize text-muted-foreground">{s}</div>
          ))}
          {DAYS.map(d => (
            <PlanRow key={d} day={d} plan={plan} onPick={onPick} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PlanRow({ day, plan, onPick }: { day: string; plan: Record<string, any>; onPick: (d: string, s: Slot) => void }) {
  return (
    <>
      <div className="px-1 py-1 text-muted-foreground">{day}</div>
      {SLOTS.map(s => {
        const key = `${day}-${s}`;
        const filled = !!plan[key];
        return (
          <button
            key={s}
            onClick={() => onPick(day, s)}
            className={`rounded-md border py-1 text-xs transition-colors ${
              filled
                ? "border-secondary bg-secondary/10 text-secondary font-medium"
                : "border-border text-muted-foreground hover:border-secondary hover:text-secondary"
            }`}
          >
            {filled ? "✓" : "+"}
          </button>
        );
      })}
    </>
  );
}
