# jotai-query-toolkit

## 0.1.23

### Patch Changes

- [#39](https://github.com/fungible-systems/jotai-query-toolkit/pull/39) [`172e916`](https://github.com/fungible-systems/jotai-query-toolkit/commit/172e9163f1f08b8501c82371c84f2796e59339eb) Thanks [@aulneau](https://github.com/aulneau)! - This updates the build tooling to improve bundle sizes and tree shaking.

## 0.1.22

### Patch Changes

- [#37](https://github.com/fungible-systems/jotai-query-toolkit/pull/37) [`00b5246`](https://github.com/fungible-systems/jotai-query-toolkit/commit/00b5246ea40ee9a6669739ebb891fbc5819bb4ed) Thanks [@aulneau](https://github.com/aulneau)! - This improves some of the ways we were caching certain atoms, and uses use-memo-one for more stable atom references.

## 0.1.21

### Patch Changes

- [#35](https://github.com/fungible-systems/jotai-query-toolkit/pull/35) [`aba4298`](https://github.com/fungible-systems/jotai-query-toolkit/commit/aba4298f9a670752d7c684799a2f52f11b1f326e) Thanks [@aulneau](https://github.com/aulneau)! - This has a small fix for how we generate query-keys for our atom families, this should prevent keys from including params more than one time.

## 0.1.20

### Patch Changes

- [`f6ddb00`](https://github.com/fungible-systems/jotai-query-toolkit/commit/f6ddb00fae12c8e46962991eb156d60f627b902e) Thanks [@aulneau](https://github.com/aulneau)! - This prevents an error from being thrown during dev mode.

## 0.1.19

### Patch Changes

- [#31](https://github.com/fungible-systems/jotai-query-toolkit/pull/31) [`94ab573`](https://github.com/fungible-systems/jotai-query-toolkit/commit/94ab5736e4efdce652fc8e4f7eb6fad5807b9021) Thanks [@aulneau](https://github.com/aulneau)! - This update cleans up some of the typings around various functions, and removes certain checks while in dev mode.

## 0.1.18

### Patch Changes

- [#28](https://github.com/fungible-systems/jotai-query-toolkit/pull/28) [`24111df`](https://github.com/fungible-systems/jotai-query-toolkit/commit/24111df5d5ef26fc152658f7202658fb06e7c7a8) Thanks [@hstove](https://github.com/hstove)! - fix: allow falsy values in initial values

## 0.1.17

### Patch Changes

- [#25](https://github.com/fungible-systems/jotai-query-toolkit/pull/25) [`62b126e`](https://github.com/fungible-systems/jotai-query-toolkit/commit/62b126ebaf7dfaebce8265d619f82d4bb9990633) Thanks [@aulneau](https://github.com/aulneau)! - This updates the versions for react-query and jotai.

## 0.1.16

### Patch Changes

- [#24](https://github.com/fungible-systems/jotai-query-toolkit/pull/24) [`a344f76`](https://github.com/fungible-systems/jotai-query-toolkit/commit/a344f7625dbd4b8d4c24d5d52f2964d85095f914) Thanks [@aulneau](https://github.com/aulneau)! - Makes it so you do not have to pass props to useQueryInitialValues.

* [`6ababc9`](https://github.com/fungible-systems/jotai-query-toolkit/commit/6ababc9726caf6b8a10a4db2e3c33ee0b124d08a) Thanks [@aulneau](https://github.com/aulneau)! - Fixes a small issue around peer deps.

## 0.1.15

### Patch Changes

- [#21](https://github.com/fungible-systems/jotai-query-toolkit/pull/21) [`2389018`](https://github.com/fungible-systems/jotai-query-toolkit/commit/238901869f8cecd2ba00184d99dcf6f2b5e04db8) Thanks [@aulneau](https://github.com/aulneau)! - Small fix around nextjs integration.

## 0.1.14

### Patch Changes

- [#20](https://github.com/fungible-systems/jotai-query-toolkit/pull/20) [`3cdba6c`](https://github.com/fungible-systems/jotai-query-toolkit/commit/3cdba6c65d09c615b1851a2f9c02db3273c60848) Thanks [@aulneau](https://github.com/aulneau)! - General clean up and tidy around where logic lives.

## 0.1.13

### Patch Changes

- [#16](https://github.com/fungible-systems/jotai-query-toolkit/pull/16) [`cea9795`](https://github.com/fungible-systems/jotai-query-toolkit/commit/cea9795622e450f8706da1ed7d1452ebf3bcafa3) Thanks [@aulneau](https://github.com/aulneau)! - This update works to improve and optimize the next.js integration, making it easier to use and extend for other libraries (such as micro-stacks).
