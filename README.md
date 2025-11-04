# reactive-kit

> Reactive fine-grained utility toolkit for React that supports objects, arrays, Map, Set, and all primitive types.  
> Powered by the `@vue/reactivity` package as its core.

## Introduction

**reactive-kit** offers both "ref-style" imperative state management and fully reactive state updates in React. It supports:

- **Primitives**: `number`, `string`, `boolean`, etc.
- **Objects**: plain and nested objects
- **Array**
- **Map**
- **Set**

All updates use Vue’s (`@vue/reactivity`) engine underneath, so only the necessary UI is updated, no matter how deeply nested or sliced your state is.

## Provided React Hooks

- **`useReactiveRef<T>(initial: T): ReactiveRef<T>`**

  - Returns a mutable ReactiveRef (`{ current: T }`) supporting reactive fine-grained updates. Mutating this directly **does not** cause the component to re-render.
  - Any value type that works with Vue can be stored and updated.

- **`useReactiveState<T>(reactiveRef: ReactiveRef<T>)`**

  - Returns the current "state-view" of the provided ReactiveRef. If the ReactiveRef changes, the returned state updates and triggers re-render.

- **`useReactiveSubRef<T, S>(parentRef: ReactiveRef<T>, selector: (ref: ReactiveRef<T>) => S)`**
  - Creates a new ReactiveRef for a subfield or value within the parent, synchronized with the original.

## Key Features

- **Full support for primitives and complex data**: manage objects, arrays, Map, Set, and simple values efficiently
- **Mix ref & state usage**: blend imperative (`ref`) and declarative (`state`) update flows as you prefer
- **Selective rendering**: only React components observing changed data are re-rendered
- **Convenient partial updates**: easily manage deeply nested data independently using sub-refs
- **Simplifies Props Drilling**: manage global/shared state without deeply passing props—just pass the top-level ref/sub-ref to components that need it. Enables access and selective rendering of shared data anywhere in nested components, even without Context.

> 💡 Tip & Thinking
>
> React by nature is "Reactive Coarse Grained": it checks for value changes using `Object.is` between old and new values.  
> This is why updating nested structures always requires shallow copies like `{ ...originObject, new: "value" }` or `[ ...originArray, newItem ]`.
>
> While this enforces clear immutability, it:
>
> - **Makes code verbose**
> - **Can impact performance**
> - And does **not guarantee true deep immutability** for objects containing reference types
>
> My solution isn't "the one true way"—but I believe mixing paradigms and approaches can lead to simpler, more intuitive solutions in practice.

## Installation

```bash
npm install reactive-kit
# or
pnpm add reactive-kit
# or
yarn add reactive-kit
```

## Usage Example

```tsx
import {
  useReactiveRef, // creates an observable value (no re-render on change)
  useReactiveState, // synchronizes the ref to an auto-updating React state
  useReactiveSubRef, // create sub-refs (deep slice!) for fields or parts of the ref
} from "reactive-kit/react";

function App() {
  // useReactiveRef: initialize a fully reactive ref for object/array/Map/Set/primitives.
  // ⚠️ Mutations here DO NOT trigger component re-render!
  const accountRef = useReactiveRef({
    profile: {
      name: "Racgoo",
      age: 28,
      email: "lhsung98@naver.com",
      friends: [
        { id: 1, name: "John" },
        { id: 2, name: "Jane" },
        { id: 3, name: "Jim" },
      ],
      // Full support for Set, Map, Array!
      skillSet: new Set<string>(["React", "TypeScript", "JavaScript"]),
    },
  });

  // useReactiveSubRef: create a ref for a nested object, array, or field (slice)
  // All these sub-refs are in sync with the original accountRef
  const profileRef = useReactiveSubRef(
    accountRef,
    (ref) => ref.current.profile
  );

  // From profileRef, get a sub-ref for just skillSet (equivalent to the commented line below)
  // const skillSetRef = useReactiveSubRef(accountRef, (ref) => ref.current.profile.skillSet);
  const skillSetRef = useReactiveSubRef(
    profileRef,
    (ref) => ref.current.skillSet
  );

  const friendsRef = useReactiveSubRef(
    profileRef,
    (ref) => ref.current.friends
  );

  // useReactiveState: hook that auto re-renders when ref-based value changes (deep tracked)
  // Use for anything you want as a React state
  const profileState = useReactiveState(profileRef); // Any object/array is okay
  const friendState = useReactiveState(friendsRef); // Re-renders on friends array updates
  const skillSetState = useReactiveState(skillSetRef); // Detects Set changes

  const handleClick = () => {
    // States returned by useReactiveState are deeply tracked—this will automatically re-render!
    // Mutate strings, numbers, Set, Array—they're all detected
    const hash = Math.random().toFixed(2).toString();
    profileRef.current.name = "racgoo" + hash; // object field change
    profileRef.current.age += 29; // primitive value change
    skillSetState.add("Thanks Vue!" + hash); // mutate Set
    friendState.push({ id: 999999, name: "GGO BU GI" }); // push to array
  };

  return (
    <div>
      <button onClick={handleClick}>Mutate Account</button>
      {/* Every value from useReactiveState automatically updates view on change */}
      <div>Profile: {JSON.stringify(profileState)}</div>
      <div>Friends: {JSON.stringify(friendState)}</div>
      <div>Skill Set: {JSON.stringify(skillSetState)}</div>
    </div>
  );
}

export default App;
```

### Example Code Review

- `useReactiveRef` creates a ref whose updates do **not** trigger component re-render (direct read/write)
- `useReactiveState` provides a view that triggers re-render on change (just like React's state)
- `useReactiveSubRef` lets you slice the original ref into deep subfields/arrays/Sets for fine-grained tracking—subRefs stay in sync with the source, even deep-nested
- Array, Object, Map, Set, and primitive values are all automatically tracked! Changes like array `push/pop` or set `add/delete` are fully reflected
- Each state is internally wrapped in a proxy for efficient, granular re-rendering

## Roadmap

- Currently supports React only. More frameworks may be supported in the future.

## License

This project is distributed under the **MIT License**.  
For more details, see the `LICENSE` file.

---

## Contact

Questions, suggestions, bug reports, and contributions are all welcome!
**Email**: [[📬 send mail lhsung98@naver.com]](mailto:lhsung98@naver.com)
