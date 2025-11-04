# @racgoo/reactive-kit(v1.0.0)

> 객체, 배열, Map, Set, 그리고 모든 원시 타입을 지원하는 React용 Reactive Fine Grained 유틸리티 도구입니다.  
> `@vue/reactivity` 패키지를 코어로 동작합니다.

## 소개

**reactive-kit**은 React에서 `ref` 방식의 명령적 상태 관리와 완전한 반응형 상태 업데이트를 모두 제공합니다. 지원 범위는 다음과 같습니다:

- **원시값**: `number`, `string`, `boolean` 등
- **객체**: 일반 객체, 중첩 객체
- **배열 (Array)**
- **Map**
- **Set**

모든 업데이트는 Vue의(`@vue/reactivity`)을 기반으로 하여, 단일 상태 소스든, 깊게 중첩된 슬라이스든, 꼭 필요한 UI만 선택적으로 갱신합니다.

## 제공 React 훅

- **`useReactiveRef<T>(initial: T): ReactiveRef<T>`**

  - 반응형(Reactive Fine Grained) 업데이트가 가능한 수정 가능한 ReactiveRef((`{ current: T }`))를 반환합니다. 변경해도 컴포넌트가 자동으로 리렌더되지 **않습니다**.
  - `Vue`에서 다루는 어떤 타입의 값도 저장/수정에 적합합니다.

- **`useReactiveState<T>(reactiveRef: ReactiveRef<T>)`**

  - 주어진 ReactiveRef로부터 현재 값의 "state 뷰"를 반환합니다. 인자로 제공된 ReactiveRef가 변경되면 리턴하는 state를 갱신하며 랜더링 트리거를 작동시킵니다.

- **`useReactiveSubRef<T, S>(parentRef: ReactiveRef<T>, selector: (ref: ReactiveRef<T>) => S)`**
  - 상위 ReactiveRef로부터 하위 필드나 값을 범위로 하는 새로운 ReactiveRef를 만듭니다. 모든 sub-ref는 원본과 동기화됩니다.

## 주요 특징

- **원시값과 복합 데이터 모두 완벽 지원**: 객체, 배열, Map, Set, 단순 값 등 모두 빠르고 효율적으로 관리
- **ref & state 혼합 사용**: 명령적(`ref`), 선언적(`state`) 업데이트 플로우를 원하는대로 혼합
- **선택적 렌더링**: 관찰하는 데이터가 바뀔 때만 React 컴포넌트가 재렌더됨
- **선택적 업데이트 편리**: sub-ref로 데이터 하위 부분만 분리/조작할 수 있어, 원하는 부분만 쉽게 독립적으로 관리
- **Props Drilling 간소화**: props로 깊게 전달하지 않고도 전역/공유 상태 관리가 매우 쉬움(상위에서 만든 ref/sub-ref 를 필요한 컴포넌트에만 직접 전달하면 됨). Context 없이도 중첩 컴포넌트 어디에서든 동일 데이터 접근 및 선택적 렌더링 가능

> 💡 Tip & Thinking
>
> React는 본질적으로 "Reactive Coarse Grained" 방식을 따릅니다. 즉, 값의 변경 여부를 판별할 때 내부적으로 `Object.is`를 사용해 이전 값과 비교합니다.  
> 그래서 중첩 객체나 배열을 갱신할 때는 `{ ...originObject, new: "test" }` 나 `[ ...originArray, newItem ]`처럼 항상 얕은 복사를 하게 됩니다.

이 방식은 불변성을 명확히 지키는 데엔 도움이 되지만,

- **코드가 장황해지고**
- **성능 부담**이 커질 수 있으며,
- 내부 프로퍼티(필드)가 레퍼런스 타입이면 진짜 깊은 불변성이 보장되지 않습니다.

제 기술이 무조건 최고라고 할 수는 없지만,  
기존 방식과 다양한 패러다임을 혼합해서 더 쉽고 직관적으로 문제를 풀 수 있다면, 그것도 충분히 좋은 선택지가 될 수 있다고 생각합니다.

## 설치

```bash
npm install reactive-kit
# 또는
pnpm add reactive-kit
# 또는
yarn add reactive-kit
```

## 사용 예시

```tsx
import {
  useReactiveRef, // ref 기반의 observable 값 생성 (리렌더 없음)
  useReactiveState, // ref를 트래킹 React state로 변환 (ref와 동기화됨)
  useReactiveSubRef, // 기존 ref에서 하위 필드/객체를 위한 sub-ref 생성 (깊은 슬라이스!)
} from "reactive-kit/react";

function App() {
  // useReactiveRef: 반응형(ref 기반)으로 객체/배열/Map/Set/원시타입 등 초기화
  // ⚠️ 이걸 직접 바꾸더라도 컴포넌트는 재렌더되지 않습니다!
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
      // Set, Map, Array 모두 완벽 지원!
      skillSet: new Set<string>(["React", "TypeScript", "JavaScript"]),
    },
  });

  // useReactiveSubRef: 하위 객체, 배열, 필드를 위한 ref 생성 (slice)
  // 원본과 완벽히 동기화. 아래 세 서브 ref도 accountRef와 연결, 상태 공유
  const profileRef = useReactiveSubRef(
    accountRef,
    (ref) => ref.current.profile
  );

  // profileRef에서 다시 skillSet만 subRef로 분리 (아래와 완벽히 동일)
  // const skillSetRef = useReactiveSubRef(accountRef, (ref) => ref.current.profile.skillSet);
  const skillSetRef = useReactiveSubRef(
    profileRef,
    (ref) => ref.current.skillSet
  );

  const friendsRef = useReactiveSubRef(
    profileRef,
    (ref) => ref.current.friends
  );

  // useReactiveState: ref 기반 값이 바뀌면 컴포넌트가 자동으로 재렌더
  // "reactiveRef"를 React state처럼 관리할 때 사용
  const profileState = useReactiveState(profileRef); // 객체, 배열 다 가능
  const friendState = useReactiveState(friendsRef); // friends 배열 변경 시 리렌더
  const skillSetState = useReactiveState(skillSetRef); // Set 변동도 감지

  const handleClick = () => {
    // useReactiveState로 만든 state는 깊이 관찰됨. 아래 코드 실행 시 자동 재렌더!
    // 예시: 문자열, 숫자, Set, 배열 변이 모두 감지됨
    const hash = Math.random().toFixed(2).toString();
    profileRef.current.name = "racgoo" + hash; // 객체 필드 변경
    profileRef.current.age += 29; // 원시값 변경
    skillSetState.add("Thanks Vue!" + hash); // Set 조작
    friendState.push({ id: 999999, name: "GGO BU GI" }); // 배열 push
  };

  return (
    <div>
      <button onClick={handleClick}>Mutate Account</button>
      {/* useReactiveState에서 얻은 state 값은 변할 때마다 자동으로 재렌더 */}
      <div>Profile: {JSON.stringify(profileState)}</div>
      <div>Friends: {JSON.stringify(friendState)}</div>
      <div>Skill Set: {JSON.stringify(skillSetState)}</div>
    </div>
  );
}

export default App;
```

### 예시 코드 해설

- `useReactiveRef`로 만든 ref는 값이 바뀌어도 컴포넌트가 자동 리렌더되지 않음 (직접 접근/수정 가능)
- `useReactiveState`로 얻은 값은 바뀌면 자동 리렌더 (React state와 동일)
- `useReactiveSubRef`로 원본 ref의 하위 구조(필드, 배열, Set 등)를 별도의 ref로 slice해 세밀하게 분리 관찰 가능. subRef는 원본과 항상 동기화. (깊은 중첩도 지원)
- Array, Object, Map, Set, Primitive 전부 트래킹/관찰 가능! 배열의 push/pop, set의 add/delete 등 변이도 완벽 반영
- 각 state는 내부적으로 proxy로 래핑되어 변동 시 해당 부분만 재렌더

## 로드맵

- 현재는 React만 지원. 앞으로 더 다양한 프레임워크 연동도 고려 중입니다.

## 라이선스

이 프로젝트는 **MIT 라이선스** 하에 배포됩니다.  
자세한 내용은 `LICENSE` 파일을 참조하세요.

---

## 문의

질문, 제안, 버그 리포트, 기여 모두 환영합니다!
**Email**: [[📬 send mail lhsung98@naver.com]](mailto:lhsung98@naver.com)
