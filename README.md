# Jotai query toolkit

This is an opinionated toolkit for working with Jotai and react-query. This library extends upon the react-query
integration found within jotai and includes some batteries included solutions for using these tools with next.js. You
can learn more about [Jotai here](https://jotai.pmnd.rs/), and [react-query here](https://react-query.tanstack.com/).

## Why

I've spent years trying to find the optimal state management and remote data solutions that work well in both
client-side react apps and server side rendered react apps (typically using next.js), and I have come to believe this is
one of the best combinations both for developer experience and user experience and performance. Jotai is my favorite way
to handle state in react applications, and react-query has an amazing API for handling remote data state. Together they
create a new way of handling state and fetching remote data at the same time.

## Getting started

To get started, you'll have to install a few dependencies:

```bash
yarn add jotai jotai-query-toolkit react-query
```

### Query keys

Due to the tight integration with react-query, every atom we make will need to have some key that connects it to
react-query state. To read more about how react-query uses query
keys, [read this](https://react-query.tanstack.com/guides/query-keys).

> At its core, React Query manages query caching for you based on query keys. Query keys can be as simple as a string, or as complex as an array of many strings and nested objects. As long as the query key is serializable, and unique to the query's data, you can use it!

For this example, lets create a simple string enum as a key:

```typescript
enum MyQueryKeys {
  FooBar = 'keys/FooBar'
}
```

### atomFamilyWithQuery

Often times you'll have a category of remote data that you want to pass a parameter or set of parameters to, such as a
remote user profile with a unique id. This atom is very similar to the standard `atomFamily` but takes some additional
parameters: a query key, and a fetcher function. All `atomFamilyWithQuery` atom's will ultimately combine the base
atomFamily key with whatever param is fed to the atom when used.

```typescript
import {atomFamilyWithQuery} from "jotai-query-toolkit";

const fooBarAtom = atomFamilyWithQuery<string, string>(MyQueryKeys.FooBar, async (get, param) => {
  const anotherAtomValue = get(anotherAtom);
  // this could be to fetch a unique users profile
  const remoteData = await fetchRemoteDate(anotherAtomValue, param);
  return remoteData;
})
```

To make use of this atom:

```tsx
const FooBar = ({param}) => {
  const [fooBar, refresh] = useAtom(fooBarAtom(param));
  return <>{fooBar}</>
}

const Component = () => {
  const param = 'foo'
  return <React.Suspense fallback={<>loading...</>}>
    <FooBar param={param}/>
  </React.Suspense>
}
```

### atomWithQueryRefresh

For data types that don't have unique parameters you need to fetch by, you can use the `atomWithQueryRefresh`, which is
very similar to the jotai exported `atomWithQuery` but with some opinionated defaults and better initialData handling.

```typescript
import {atomWithQueryRefresh} from "jotai-query-toolkit";

const fooBarAtom = atomWithQueryRefresh<string>(MyQueryKeys.FooBar, async (get) => {
  const anotherAtomValue = get(anotherAtom);
  // this could be to fetch a list of all users
  const remoteData = await fetchRemoteDate(anotherAtomValue);
  return remoteData;
})
```

## Next.js

Next.js is a framework that makes using server side rendered react very easy. Fetching data on the server and ensuring
that client state reflects that initial data is less easy. JQT hopes to make this experience much better.

To get started, create a query key and an atom:

```typescript
// our query keys
enum HomeQueryKeys {
  FooBar = 'home/FooBar',
}

// some values for demo, 
// not specific to JQT
let count = 0;
let hasMounted = false;

// our atomWithQueryRefresh
const fooBarAtom = atomWithQueryRefresh(
  HomeQueryKeys.FooBar, // our QueryKey
  () => {
    if (hasMounted) count += 3;
    if (!hasMounted) hasMounted = true;
    return `bar ${count} (client rendered, updates every 3 seconds)`;
  },
  {refetchInterval: 3000} // some extra queryClient options can be passed here
);
```

Next up we can create a component that will use this atom:

```tsx
// the component that uses the atomWithQueryRefresh
const FooBar = () => {
  const [fooBar, refresh] = useAtom(fooBarAtom);
  return (
    <>
      <h2>{fooBar}</h2>
      <button onClick={() => refresh()}>refresh</button>
    </>
  );
};
```

Next we will go to the page which will contain this atom and component, and we'll import `QueryProvider`
from `jotai-query-toolkit`, and pass it our page props, and the query keys we are using.

```tsx
// our next.js page component
const MyHomePage = (props: Record<string, unknown>) => {
  return (
    <QueryProvider queryKeys={[HomeQueryKeys.FooBar]} initialQueryData={props}>
      <div style={{maxWidth: '900px', margin: '0 auto', textAlign: 'center'}}>
        <h1>next.js jotai-query-toolkit</h1>
        <FooBar/>
      </div>
    </QueryProvider>
  );
};
```

To fetch the data on the server, we'll use `getInitialProps` and from `getInitialPropsFromQueries`
from `jotai-query-toolkit`.

```ts
MyHomePage.getInitialProps = async (_context: NextPageContext) => {
  const queries = [
    [
      HomeQueryKeys.FooBar, // the query key we're using
      async () => {
        return `foo ${count} (initial data on the server, will update in 3 seconds)`;
      }, // our fetcher for the server
    ] as const,
  ];

  return getInitialPropsFromQueries(queries); // returns Record<string, unknown>
};
```

And there you have it! you'll automatically fetch the data on the server, and when the client hydrates, the atom will
take over and automatically refresh every 3 seconds as we've defined above. If the user navigates to this page from a
different page and there is data in the react-query cache, no additional fetching will occur.
