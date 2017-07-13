"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const evalFunction = (code) => {
    if (!code.startsWith('function'))
        code = 'function ' + code;
    try {
        let fnc;
        return eval('fnc = ' + code);
    }
    catch (e) {
        throw new Error('Failed to build ' + code + '\n\n' + e);
    }
};
class Tree {
    constructor(value, parent = null, children = []) {
        this.value = value;
        this.parent = parent;
        this.children = children;
    }
    addChild(child) {
        child.parent = this;
        this.children.push(child);
    }
    removeChild(child) {
        if (child.parent = this) {
            child.parent = null;
            const i = this.children.indexOf(child);
            if (i >= 0)
                this.children.splice(i, 1);
        }
    }
    detach() {
        if (this.parent)
            this.parent.removeChild(this);
    }
    forEachChildren(callback) {
        for (let child of this.children) {
            callback(child);
            child.forEachChildren(callback);
        }
    }
    forEachParent(callback) {
        let parent = this;
        while (parent = parent.parent) {
            callback(parent);
        }
    }
    get allChildren() {
        const children = [];
        this.forEachChildren((child) => {
            children.push(child);
        });
        return children;
    }
    get allParents() {
        const parents = [];
        this.forEachParent((parent) => {
            parents.unshift(parent);
        });
        return parents;
    }
}
exports.Tree = Tree;
class InstanceHelper {
    static getClass(_object, _class) {
        if (_class === void 0) {
            return _object.constructor;
        }
        else if (typeof _class === 'string') {
            const __class = this.getClass(_object);
            if (__class.name === _class)
                return __class;
        }
        else if (typeof _class === 'function') {
            if (this.getClass(_object) === _class)
                return _class;
        }
        return null;
    }
    static getSuperList(_object) {
        return ClassHelper.getSuperList(this._getClass(_object));
    }
    static getSuperTree(_object) {
        return ClassHelper.getSuperTree(this._getClass(_object));
    }
    static findSuper(_object, _superClass) {
        return ClassHelper.findSuper(this._getClass(_object), _superClass);
    }
    static hasSuper(_object, _superClass) {
        return ClassHelper.hasSuper(this._getClass(_object), _superClass);
    }
    static instanceOf(_object, _class) {
        if ((_class === Object) || (_class === 'Object')) {
            return true;
        }
        else if ((typeof _class === 'function') && (_object instanceof _class)) {
            return true;
        }
        else {
            return (this.getClass(_object, _class) !== null) || this.hasSuper(_object, _class);
        }
    }
    static get(target, propertyName, receiver = target, throwError = InstanceHelper.ERROR_ON_UNDEFINED_PROPERTIES) {
        const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(target), propertyName);
        if (descriptor) {
            if (typeof descriptor.get === 'function') {
                return descriptor.get.call(receiver);
            }
        }
        else if (target.hasOwnProperty(propertyName)) {
            return target[propertyName];
        }
        if (throwError) {
            throw new TypeError('The class has not the get property ' + propertyName);
        }
        else {
            return void 0;
        }
    }
    static set(target, propertyName, value, receiver = target, throwError = false) {
        const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(target), propertyName);
        if (descriptor) {
            if (typeof descriptor.set === 'function') {
                descriptor.set.call(receiver, value);
                return;
            }
        }
        else if (target.hasOwnProperty(propertyName)) {
            target[propertyName] = value;
            return;
        }
        if (throwError) {
            throw new TypeError('The class has not the set property ' + propertyName);
        }
        else {
            target[propertyName] = value;
        }
    }
    static delete(target, propertyName, throwError = InstanceHelper.ERROR_ON_UNDEFINED_PROPERTIES) {
        if (target.hasOwnProperty(propertyName)) {
            delete target[propertyName];
        }
        if (throwError) {
            throw new TypeError('The class has not the property ' + propertyName);
        }
        else {
            delete target[propertyName];
        }
    }
    static apply(target, propertyName, args = [], receiver = target, throwError = InstanceHelper.ERROR_ON_UNDEFINED_PROPERTIES) {
        const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(target), propertyName);
        if (descriptor) {
            if (typeof descriptor.value === 'function') {
                try {
                    return descriptor.value.apply(receiver, args);
                }
                catch (error) {
                    if (propertyName === 'constructor') {
                        const constructor = ClassHelper.getConstructorAsFunction(descriptor.value);
                        return constructor.apply(receiver, args);
                    }
                    else {
                        throw error;
                    }
                }
            }
        }
        else if (target.hasOwnProperty(propertyName)) {
            if (typeof target[propertyName] === 'function') {
                return target[propertyName].apply(receiver, args);
            }
        }
        if (!throwError) {
            if (typeof target[propertyName] === 'function') {
                return target[propertyName].apply(receiver, args);
            }
        }
        throw new Error('The class has not the method ' + propertyName);
    }
    static _getClass(_object) {
        const _class = this.getClass(_object);
        if (typeof _class !== 'function') {
            throw new Error('Missing constructor for object argument');
        }
        return _class;
    }
}
InstanceHelper.ERROR_ON_UNDEFINED_PROPERTIES = false;
exports.InstanceHelper = InstanceHelper;
class ClassHelper {
    static _extends(destination, sources, mainSource) {
        if (typeof sources === 'function') {
            sources = [sources];
        }
        if (!(sources instanceof Array) || (sources.length === 0)) {
            throw new Error('Sources must be an Array and contains at least one constructor');
        }
        if (mainSource === void 0) {
            if (!this.hasSuper(destination)) {
                mainSource = sources[0];
            }
        }
        if (!('superClasses' in destination)) {
            Object.defineProperty(destination, 'superClasses', {
                value: new Map()
            });
        }
        const destinationDescriptors = Object.getOwnPropertyDescriptors(destination.prototype);
        if (typeof mainSource === 'function') {
            destination.prototype = Object.create(mainSource.prototype);
            destination.prototype.constructor = destination;
            Object.defineProperties(destination.prototype, destinationDescriptors);
        }
        else {
            mainSource = Object.getPrototypeOf(destination);
        }
        destination.superClasses.set(mainSource, mainSource.name);
        for (let source of sources) {
            if (source === mainSource)
                continue;
            if (destination.superClasses.get(source)) {
                console.warn('Class ' + destination.name + ' is already extended by ' + source.name);
                continue;
            }
            const sourceDescriptors = Object.getOwnPropertyDescriptors(source.prototype);
            let sourceDescriptor;
            for (let sourceDescriptorName in sourceDescriptors) {
                sourceDescriptor = sourceDescriptors[sourceDescriptorName];
                if (destinationDescriptors[sourceDescriptorName] === void 0) {
                    Object.defineProperty(destination.prototype, sourceDescriptorName, sourceDescriptor);
                }
            }
            destination.superClasses.set(source, source.name);
        }
        return destination;
    }
    static extends(destination, sources, mainSource) {
        return this._extends(destination, sources, mainSource);
    }
    static getSuperList(_class) {
        const superClasses = [];
        if (_class.superClasses instanceof Map) {
            _class.superClasses.forEach((_name, _superClass) => {
                superClasses.push(_superClass);
            });
        }
        else {
            const _superClass = Object.getPrototypeOf(_class);
            if (_superClass !== this.objectPrototype)
                superClasses.push(_superClass);
        }
        return superClasses;
    }
    static getSuperTree(_class) {
        const tree = new Tree(_class);
        if (_class.prototype !== Object.prototype) {
            const superClasses = this.getSuperList(_class);
            for (let superClass of superClasses) {
                tree.addChild(this.getSuperTree(superClass));
            }
        }
        return tree;
    }
    static findSuper(_class, _superClass) {
        const paths = [];
        const tree = this.getSuperTree(_class);
        tree.allChildren.forEach((child) => {
            let found = false;
            if (typeof _superClass === 'string') {
                found = (child.value.name === _superClass);
            }
            else if (typeof _superClass === 'function') {
                found = (child.value === _superClass);
            }
            if (found) {
                const path = child.allParents;
                path.push(child);
                paths.push(path.map(child => child.value));
            }
        });
        if ((paths.length > 1) && !ClassHelper.ALLOW_DIAMOND_STRUCTURE) {
            if (typeof _superClass === 'function')
                _superClass = _superClass.name;
            let message = `Diamond structure detected\n` + `${_class.name}.super<${_superClass}>` +
                ` resolves in ${paths.length} different paths :\n\t` +
                paths.map(path => path.map(f => f.name).join(' -> ')).join('\n\t');
            throw new Error(message);
        }
        return paths;
    }
    static hasSuper(_class, _superClass) {
        if (_superClass === void 0) {
            return this.getSuperList(_class).length > 0;
        }
        else {
            return this.findSuper(_class, _superClass).length > 0;
        }
    }
    static getConstructorAsFunction(_class) {
        let descriptor = Object.getOwnPropertyDescriptor(_class.prototype, 'constructor');
        if (descriptor) {
            if (typeof descriptor.value === 'function') {
                const code = descriptor.value.toString();
                if (code.startsWith('class')) {
                    const parents = ClassHelper.getSuperList(descriptor.value);
                    let index = code.indexOf('constructor');
                    let constructorString = '';
                    if (index < 0) {
                        constructorString = 'function constructor() {' + ((parents.length > 0) ? 'super(...arguments)' : '') + '}';
                    }
                    else {
                        constructorString = code.slice(index);
                        let j = 0;
                        let i = 0;
                        forEachChar: for (; i < constructorString.length; i++) {
                            switch (constructorString[i]) {
                                case '{':
                                    j++;
                                    break;
                                case '}':
                                    j--;
                                    if (j <= 0)
                                        break forEachChar;
                                    break;
                            }
                        }
                        constructorString = constructorString.slice(0, i + 1);
                    }
                    let hasSuper = false;
                    constructorString = constructorString.replace(new RegExp('super\\((.*?)\\)', 'gm'), function (match, ...matches) {
                        hasSuper = true;
                        if (parents.length === 0)
                            throw new Error('Super detected but class not extended.');
                        let args = '';
                        if (matches[0] === '...arguments') {
                            args = 'Array.prototype.concat.apply([], arguments)';
                        }
                        else {
                            args = '[' + matches[0] + ']';
                        }
                        return 'Super.init(this, \'' + parents[0].name + '\', ' + args + ')';
                    });
                    if (!hasSuper && parents.length > 0)
                        throw new Error('Expect super into class constructor.');
                    return evalFunction(constructorString);
                }
                else {
                    return descriptor.value;
                }
            }
        }
        throw new Error('The super class has no constructor');
    }
}
ClassHelper.ALLOW_DIAMOND_STRUCTURE = true;
ClassHelper.objectPrototype = Object.getPrototypeOf(Object);
exports.ClassHelper = ClassHelper;
function Extends(...args) {
    return (_class) => {
        ClassHelper._extends(_class, args);
    };
}
exports.Extends = Extends;
function Mixin(...sources) {
    return ClassHelper._extends(function (...args) {
        if (args.length !== sources.length) {
            throw new Error('<super> parameters number does\'nt match the number of super classes : ' +
                args.length + ' parameters passed, ' +
                sources.length + ' expected.');
        }
        for (let i = 0; i < sources.length; i++) {
            if (!(args[i] instanceof Array))
                throw new Error('super parameters must be arrays');
            Super.init(this, sources[i], args[i]);
        }
    }, sources);
}
exports.Mixin = Mixin;
class Super {
    static init(object, superClass, args = []) {
        return new Super(object, superClass).apply('constructor', args);
    }
    constructor(object, superClass) {
        this._instance = object;
        const path = InstanceHelper.findSuper(object, superClass);
        if (path.length > 0) {
            const _superClass = path[0][path[0].length - 1];
            this._superPrototype = _superClass.prototype;
        }
        else {
            throw new Error('The class has not been extended by ' + JSON.stringify(superClass));
        }
    }
    ;
    call(propertyName, ...args) {
        return this.apply(propertyName, args);
    }
    get(propertyName) {
        return this.apply(propertyName);
    }
    set(propertyName, value) {
        this.apply(propertyName, [value]);
    }
    apply(propertyName, args = []) {
        const descriptor = Object.getOwnPropertyDescriptor(this._superPrototype, propertyName);
        if (descriptor) {
            if (typeof descriptor.value === 'function') {
                try {
                    return descriptor.value.apply(this._instance, args);
                }
                catch (error) {
                    if (propertyName === 'constructor') {
                        const constructor = ClassHelper.getConstructorAsFunction(descriptor.value);
                        return constructor.apply(this._instance, args);
                    }
                    else {
                        throw error;
                    }
                }
            }
            else if ((typeof descriptor.set === 'function') && (args.length > 0)) {
                return descriptor.set.apply(this._instance, args);
            }
            else if (typeof descriptor.get === 'function' && (args.length === 0)) {
                return descriptor.get.apply(this._instance, args);
            }
        }
        throw new Error('The super class has not the property ' + propertyName);
    }
}
exports.Super = Super;
function Supers() {
    return (_class, name, descriptor) => {
        let fnc = descriptor.value.toString();
        let matchFound = false;
        fnc = fnc.replace(new RegExp('"super<([^>]+)>\\.([^\\(]+)\\((.*?)\\)"', 'gm'), function (match, ...matches) {
            matchFound = true;
            return '(new Super(this, ' + matches[0] + ').call(\'' + matches[1] + '\'' + (matches[2] ? (', ' + matches[2]) : '') + '))';
        });
        if (matchFound) {
            descriptor.value = evalFunction(fnc);
        }
        else {
            console.warn('No "super<class>.prop(args)" found.');
        }
    };
}
exports.Supers = Supers;
function Property(options = {}) {
    options = Object.assign({
        access: 'public',
        friends: []
    }, options);
    function normalizeFriend(friend) {
        if (typeof friend === 'string') {
            return friend;
        }
        else if (typeof friend === 'function') {
            if (friend.hasOwnProperty('name') && (friend.name !== '')) {
                return friend.name;
            }
            else {
                throw new TypeError('Anonymous functions are not supported');
            }
        }
        else {
            throw new TypeError('Invalid friend type');
        }
    }
    options.friends = options.friends.map(normalizeFriend);
    return (classPrototype, name, descriptor) => {
        options.friends.push(normalizeFriend(classPrototype.constructor));
        const reg = new RegExp('^([\\s\\S]+)[\\s]+', 'gm');
        const memoizeMap = new Map();
        function getStack() {
            const errorStack = new Error().stack;
            let stack = memoizeMap.get(errorStack);
            if (stack === void 0) {
                stack = [];
                const lines = errorStack.split(new RegExp('[\\s]+at ', 'gm'));
                for (let i = 4; i < lines.length; i++) {
                    const match = reg.exec(lines[i]);
                    reg.lastIndex = 0;
                    if (match !== null) {
                        stack.push(match[1].replace(/(^new )|(\..*$)/, ''));
                    }
                    else {
                        stack.push('<global>');
                    }
                }
                memoizeMap.set(errorStack, stack);
            }
            return stack;
        }
        function canAccess() {
            const friendsLength = options.friends.length;
            if (friendsLength > 0) {
                const stack = getStack();
                for (let i = 0; i < friendsLength; i++) {
                    let friend = options.friends[i];
                    const deep = friend.endsWith(':deep');
                    if (deep)
                        friend = friend.slice(0, friend.length - 5);
                    for (let j = 0, stackLength = deep ? stack.length : 1; j < stackLength; j++) {
                        if (stack[j] === friend)
                            return true;
                    }
                }
            }
            return false;
        }
        switch (options.access) {
            default:
            case 'public':
                break;
            case 'protected':
            case 'private':
                if (descriptor === void 0) {
                    descriptor = Object.getOwnPropertyDescriptor(classPrototype, name);
                    if (descriptor === void 0)
                        descriptor = { value: void 0 };
                }
                const hasValue = descriptor.hasOwnProperty('value');
                Object.defineProperty(classPrototype, name, {
                    enumerable: false,
                    get: function () {
                        if (canAccess()) {
                            return hasValue ? descriptor.value : descriptor.get();
                        }
                        else {
                            throw new Error('Trying to access to a ' + options.access + ' property : ' + name);
                        }
                    },
                    set: function (value) {
                        if (canAccess()) {
                            if (hasValue) {
                                descriptor.value = value;
                            }
                            else {
                                descriptor.set(value);
                            }
                        }
                        else {
                            throw new Error('Trying to access to a ' + options.access + ' property : ' + name);
                        }
                    }
                });
                break;
        }
    };
}
exports.Property = Property;
const test = (global) => {
    class _B {
        constructor(value) {
            this.value = value;
        }
        get() {
            return ['b', this.value, this.test()].join(',');
        }
        test() {
            return 'test B';
        }
        get a() {
            return this.get();
        }
        get b() {
            return this.get();
        }
    }
    class _A extends _B {
        constructor(value) {
            super('value B');
            this.value = value;
        }
        get() {
            return ['a', this.value, this.test()].join(',');
        }
        test() {
            return 'test A';
        }
        get a() {
            return 'a';
        }
    }
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
    class A extends Mixin(B, C) {
        constructor(value) {
            super(['b'], ['C']);
            this.value = value;
            console.log('create A', value);
        }
        getDecorated() {
            return 'a' + "super<B>.get()" + "super<C>.get()";
        }
        get() {
            return 'a' + new Super(this, B).call('get') + new Super(this, C).call('get');
        }
        get a() {
            console.log('get a from A');
            return 'a' + new Super(this, B).call('a') + new Super(this, C).call('a');
        }
    }
    __decorate([
        Supers()
    ], A.prototype, "getDecorated", null);
    global._A = _A;
    global._B = _B;
    global._a = new _A();
    global.A = A;
    global.B = B;
    global.C = C;
    const a = new A();
    global.a = a;
    console.log(a.b);
};
//# sourceMappingURL=ClassHelper.js.map