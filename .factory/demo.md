# Demo sandbox

Open `/demo` or `/?demo=1` to enter an isolated seeded sample. It begins at
plan three with Bellows and a Pattern plate, 2 ore, 2 parts, 2 charge, and 6
of 24 production ticks used. The board immediately shows a partly completed
forge plan rather than an empty state.

Demo progress uses only `demo:finite-forge:v1`. It never reads or writes the
real `finite-forge:v1` key. **Reset demo** restores the seeded plan and changes
only the demo key. **Start for real** discards the demo key and opens a new,
empty real campaign.
