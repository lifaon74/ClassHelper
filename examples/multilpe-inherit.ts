import { Mixin, Super, Supers } from '../src/ClassHelper';

class D {
  public _d: string = 'd';
}


class B extends D {
  public _b: string;

  constructor(value?: string) {
    super();
    this._b = value;
    console.log('create B', value);
  }

  get(): string {
    return this._b;
  }

  get a(): string {
    console.log('get a from B');
    return this.get();
  }

  get b(): string {
    console.log('get b from B');
    return this.get();
  }

}

class C {
  public _c: string;
  constructor(value?: string) {
    this._c = value;
    console.log('create C', value);
  }

  get() {
    return this._c;
  }

  get a(): string {
    console.log('get a from C');
    return this.get();
  }

  get b(): string {
    console.log('get b from C');
    return this.get();
  }

  get c(): string {
    console.log('get c from C');
    return this.get();
  }
}



interface BC extends B, C {}

// @Extends(B, C)
// class A extends Array {
class A extends Mixin<BC>(B, C) {
  public value: string;

  constructor(value?: string) {
    super(['b'], ['C']);
    // Super.init(this, B, ['b']);
    // Super.init(this, C, ['c']);

    this.value = value;
    console.log('create A', value);
  }

  @Supers()
  getDecorated(): string {
    return 'a' + "super<B>.get()" + "super<C>.get()";
  }

  get(): string {
    return 'a' + new Super(this, B).call('get') + new Super(this, C).call('get');
  }

  get a(): string {
    console.log('get a from A');
    return 'a' + new Super(this, B).call('a') + new Super(this, C).call('a');
  }
}


(global as any).A = A;
(global as any).B = B;
(global as any).C = C;
const a = new A();
(global as any).a = a;
console.log(a.a);
console.log(a.b);