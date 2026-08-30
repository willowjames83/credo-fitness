// Clock access for timer components. Timer UIs re-render on an interval
// and derive display values from timestamps (never tick accumulation), so
// tab sleep / interval throttling can't cause drift. Reading the clock via
// this module keeps render functions free of direct impure calls.

export function nowMs(): number {
  return Date.now();
}
