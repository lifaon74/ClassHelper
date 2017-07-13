"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ClassHelper_1 = require("../src/ClassHelper");
class D {
    constructor() {
        this._d = 'd';
    }
}
class B extends D {
    constructor(value) {
        super();
        this._b = value;
        console.log('create B', value);
    }
    get() {
        return this._b;
    }
    get a() {
        console.log('get a from B');
        return this.get();
    }
    get b() {
        console.log('get b from B');
        return this.get();
    }
}
class C {
    constructor(value) {
        this._c = value;
        console.log('create C', value);
    }
    get() {
        return this._c;
    }
    get a() {
        console.log('get a from C');
        return this.get();
    }
    get b() {
        console.log('get b from C');
        return this.get();
    }
    get c() {
        console.log('get c from C');
        return this.get();
    }
}
class A extends ClassHelper_1.Mixin(B, C) {
    constructor(value) {
        super(['b'], ['C']);
        this.value = value;
        console.log('create A', value);
    }
    getDecorated() {
        return 'a' + "super<B>.get()" + "super<C>.get()";
    }
    get() {
        return 'a' + new ClassHelper_1.Super(this, B).call('get') + new ClassHelper_1.Super(this, C).call('get');
    }
    get a() {
        console.log('get a from A');
        return 'a' + new ClassHelper_1.Super(this, B).call('a') + new ClassHelper_1.Super(this, C).call('a');
    }
}
__decorate([
    ClassHelper_1.Supers()
], A.prototype, "getDecorated", null);
global.A = A;
global.B = B;
global.C = C;
const a = new A();
global.a = a;
console.log(a.a);
console.log(a.b);
//# sourceMappingURL=multilpe-inherit.js.map