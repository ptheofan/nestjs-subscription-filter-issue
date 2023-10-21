Code First Subscriptions
========================

1. In the resolver function add the `@Subscription` decorator
```ts
  @Subscription(() => Vote, {
  nullable: true,
  filter: (payload, variables: { id: string }) => {
    console.log('FILTER:', payload, variables);
    return payload.voteUpdate.id === variables.id;
  },
})
```

in the function add the `@Args` you want the schema to have which will become available via the `variables`.
```ts
  voteUpdate(@Args('id') id: string) {
    return pubSub.asyncIterator('voteUpdate');
  }
```

Get rid of the warning for unused variables by adding the following comment
```ts
// eslint-disable-next-line @typescript-eslint/no-unused-vars
```

The final correct code looks like this
```ts
@Subscription(() => Vote, {
  nullable: true,
  filter: (payload, variables: { id: string }) => {
    console.log('FILTER:', payload, variables);
    return payload.voteUpdate.id === variables.id;
  },
})
// eslint-disable-next-line @typescript-eslint/no-unused-vars
voteUpdate(@Args('id') id: string): AsyncIterator<Vote> {
  return pubSub.asyncIterator('voteUpdate');
}
```
