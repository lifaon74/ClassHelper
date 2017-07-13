import { Property, } from '../src/ClassHelper';


class B {
  public a: number;
  constructor() {
    this.a = new A().a; // I can read A.a from B
  }

  get a_get(): number {
    return new A().a;
  }

  a_call(): number {
    return new A().a;
  }
}

class C {
  get a_get(): number {
    return new A().a;
  }
}

class A {
  @Property({ access: 'private', friends: ['test', B] })
  a: number = 1;

  @Property({ access: 'private', friends: ['test'] })
  get a_get(): number {
    return 1;
  }

  c: number = 1;

  get c_get(): number {
    return 1;
  }

  c_call(): number {
    return 1;
  }

  constructor() {}
}



const a = new A();
const b = new B();
const c = new C();

function test() {
  // let j = 0;
  // let t1 = process.hrtime();
  // for(let i = 0; i < 1e6; i++) { // 1e6
  //   // j += a.c; // [ 0, 11495721 ] => 0.011495721
  //   // j += a.c_get; // [ 0, 14208758 ]
  //   // j += a.c_call(); // [ 0, 14910585 ]
  //   j += a.a; // [ 18, 960506532 ] => 18.960506532 => 1649 times slower
  //   // j += a.a_get; // [ 21, 4637723 ]
  // }
  // let t2 = process.hrtime(t1);
  // console.log(t2);
  // console.log(j);

  console.log(a.a); // I can read A.a from test
  // console.log(a.a_get); // I can read A.a_get from test

  // console.log(b.a_get);
  // console.log(c.a_get);

}
test();

console.log(b.a);  // B can read A.a_
console.log(b.a_get);  // B can read A.a
console.log(c.a_get);  // C can't read A.a
// console.log(b.a_call());

// console.log(a.a);