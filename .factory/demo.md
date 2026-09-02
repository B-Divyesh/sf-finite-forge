# Demo sandbox

Open `/demo` or `/?demo=1` to start the sample forge. It begins at run one with
an empty board and needs six charge actions to prepare a beacon. Press **M**,
**S**, and **C** in sequence six times, or use the touch controls.

Demo progress uses the `demo:finite-forge:v1` localStorage key only. It never
reads the real `finite-forge:v1` key. **Reset demo** removes only the demo key.
**Start for real** discards the demo and opens an empty real forge.
