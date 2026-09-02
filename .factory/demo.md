# Demo sandbox

Open `/demo` or `/?demo=1` to enter an isolated seeded sample. It begins at
plan three, shift three, with Bellows, a Pattern plate, and 11 of 30 campaign
shifts solved. The board immediately shows a real forecast, material target,
and planning controls rather than an empty state.

Demo progress uses only `demo:finite-forge:v2`. It never reads or writes the
real `finite-forge:v2` key. **Reset demo** restores the seeded plan and changes
only the demo key. **Start for real** discards the demo key and opens a new,
empty real campaign.
