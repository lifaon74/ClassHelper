"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ClassHelper_1 = require("../src/ClassHelper");
class B {
    constructor() {
        this.a = new A().a;
    }
    get a_get() {
        return new A().a;
    }
    a_call() {
        return new A().a;
    }
}
class C {
    get a_get() {
        return new A().a;
    }
}
class A {
    constructor() {
        this.a = 1;
        this.c = 1;
    }
    get a_get() {
        return 1;
    }
    get c_get() {
        return 1;
    }
    c_call() {
        return 1;
    }
}
__decorate([
    ClassHelper_1.Property({ access: 'private', friends: ['test', B] })
], A.prototype, "a", void 0);
__decorate([
    ClassHelper_1.Property({ access: 'private', friends: ['test'] })
], A.prototype, "a_get", null);
const a = new A();
const b = new B();
const c = new C();
function test() {
    console.log(a.a);
}
test();
console.log(b.a);
console.log(b.a_get);
console.log(c.a_get);
//# sourceMappingURL=private-properties.js.map