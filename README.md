### Add new functionalities to js classes

**TOTALLY EXPERIMENTAL**
**USE WITH CAUTION**

See *examples* for examples and *src/ClassHelper* (documented) for details.

Provide multiple inheritance through Mixin and Super :
```ts
class A extends Mixin<BC>(B, C) {
  get a(): string {
    return 'a -> ' + new Super(this, B).call('a');
  }
}
```

Provide multiple modifiers through Property :
```ts
class A {
  @Property({ access: 'private', friends: [B] })
  a: number = 1; // A only accessible from A or B
}
```

Careful : The modifiers are pretty slow (~1500 times slower than direct access) due to the stack checking.
