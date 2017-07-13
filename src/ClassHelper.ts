/**
 * Author : Valentin
 * Date : 29/05/2017
 */

// export type Constructor<T> = new(...args: any[]) => T;

export type Constructor<T> = new(...args: any[]) => T;

const evalFunction = (code: string): any => {
  if(!code.startsWith('function')) code = 'function ' + code;
  try {
    let fnc: string;
    return eval('fnc = ' + code);
  } catch(e) {
    throw new Error('Failed to build ' + code + '\n\n' + e);
  }
};

export class Tree {
  constructor(
    public value: any,
    public parent: Tree = null,
    public children: Tree[] = []
  ) {}

  addChild(child: Tree) {
    child.parent = this;
    this.children.push(child);
  }

  removeChild(child: Tree) {
    if(child.parent = this) {
      child.parent = null;
      const i = this.children.indexOf(child);
      if(i >= 0) this.children.splice(i, 1);
    }
  }

  detach() {
    if(this.parent) this.parent.removeChild(this);
  }


  forEachChildren(callback: (child: Tree) => any) {
    for(let child of this.children) {
      callback(child);
      child.forEachChildren(callback);
    }
  }

  forEachParent(callback: (parent: Tree) => any) {
    let parent: Tree = this;
    while(parent = parent.parent) {
      callback(parent);
    }
  }

  get allChildren(): Tree[] {
    const children: Tree[] = [];
    this.forEachChildren((child: Tree) => {
      children.push(child);
    });
    return children;
  }

  get allParents(): Tree[] {
    const parents: Tree[] = [];
    this.forEachParent((parent: Tree) => {
      parents.unshift(parent);
    });
    return parents;
  }

}

export class InstanceHelper {

  static ERROR_ON_UNDEFINED_PROPERTIES: boolean = false;


  /**
   * Get the constructor of an object,
   * If _class if present, check if _object's constructor is _class
   * @param _object
   * @param _class
   * @returns {any}
   */
  static getClass(_object: any, _class?: any): any {
    if(_class === void 0) {
      return _object.constructor; // Object.getPrototypeOf(_object).constructor
    } else if(typeof _class === 'string') {
      const __class: any = this.getClass(_object);
      if(__class.name === _class) return __class;
    } else if(typeof _class === 'function') {
      if(this.getClass(_object) === _class) return _class;
    }
    return null;
  }


  static getSuperList(_object: any): any[] {
    return ClassHelper.getSuperList(this._getClass(_object));
  }

  static getSuperTree(_object: any): Tree {
    return ClassHelper.getSuperTree(this._getClass(_object));
  }

  static findSuper(_object: any, _superClass: any): any[][] {
    return ClassHelper.findSuper(this._getClass(_object), _superClass);
  }

  static hasSuper(_object: any, _superClass?: any): boolean {
    return ClassHelper.hasSuper(this._getClass(_object), _superClass);
  }

  /**
   * Check if _object is an instance of _class (_class must be a super of _object, or _object is a _class)
   * IMPORTANT       Take a look at => https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Symbol/hasInstance
   * @param _object
   * @param _class
   * @returns {boolean}
   */
  static instanceOf(_object: any, _class: any): boolean {
    if((_class === Object) || (_class === 'Object')) {
      return true;
    } else if((typeof _class === 'function') && (_object instanceof _class)) {
      return true;
    } else {
      return (this.getClass(_object, _class) !== null) || this.hasSuper(_object, _class);
    }
  }



  static get<T>(target: any, propertyName: string, receiver: any = target, throwError: boolean = InstanceHelper.ERROR_ON_UNDEFINED_PROPERTIES): T {
    const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(target), propertyName);
    if(descriptor) {
      if(typeof descriptor.get === 'function') {
        return descriptor.get.call(receiver);
      }
    } else if(target.hasOwnProperty(propertyName)) {
      return target[propertyName];
    }

    if(throwError) {
      throw new TypeError('The class has not the get property ' + propertyName);
    } else {
      return void 0;
    }
  }

  static set<T>(target: any, propertyName: string, value: T, receiver: any = target, throwError: boolean = false): void {
    const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(target), propertyName);
    if(descriptor) {
      if(typeof descriptor.set === 'function') {
        descriptor.set.call(receiver, value);
        return;
      }
    } else if(target.hasOwnProperty(propertyName)) {
      target[propertyName] = value;
      return;
    }

    if(throwError) {
      throw new TypeError('The class has not the set property ' + propertyName);
    } else {
      target[propertyName] = value;
    }
  }

  static delete(target: any, propertyName: string, throwError: boolean = InstanceHelper.ERROR_ON_UNDEFINED_PROPERTIES): void {
    if(target.hasOwnProperty(propertyName)) {
      delete target[propertyName];
    }

    if(throwError) {
      throw new TypeError('The class has not the property ' + propertyName);
    } else {
      delete target[propertyName];
    }
  }

  static apply(target: any, propertyName: string, args: any[] = [],
               receiver: any = target, throwError: boolean = InstanceHelper.ERROR_ON_UNDEFINED_PROPERTIES): any {
    const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(target), propertyName);
    if(descriptor) {
      if(typeof descriptor.value === 'function') {
        try {
          return descriptor.value.apply(receiver, args);
        } catch(error) {
          if(propertyName === 'constructor') {
            const constructor = ClassHelper.getConstructorAsFunction(descriptor.value);
            return constructor.apply(receiver, args);
          } else {
            throw error;
          }
        }
        // Object.getPrototypeOf(a)
        // Reflect.construct(descriptor.value, args, this._instance.constructor)
        // Reflect.construct(descriptor.value, args, class extends this._instance.constructor {
        //   constructor(...args) { // : any[]
        //     console.log(args);
        //     super(...args);
        //     return
        //   }
        // });

      }
    } else if(target.hasOwnProperty(propertyName)) {
      if(typeof target[propertyName] === 'function') {
        return target[propertyName].apply(receiver, args);
      }
    }

    if(!throwError) {
      if(typeof target[propertyName] === 'function') {
        return target[propertyName].apply(receiver, args);
      }
    }

    throw new Error('The class has not the method ' + propertyName);
  }


  private static _getClass(_object: any): any {
    const _class = this.getClass(_object);
    if(typeof _class !== 'function') {
      throw new Error('Missing constructor for object argument');
    }
    return _class;
  }

}

export class ClassHelper {

  static ALLOW_DIAMOND_STRUCTURE: boolean = true;

  static objectPrototype: any = Object.getPrototypeOf(Object);

  /**
   * Extends <destination> with <sources>
   *
   * @param destination - the class to extend (called child)
   * @param sources - the classes to inherit (called parent)
   * @param mainSource - the main class to inherit (useful for instanceof),
   *                     if mainSource is undefined, and destination not already extended, choose sources[0] as mainSource
   */
  static _extends<T>(destination: Constructor<any>, sources: Constructor<any>[], mainSource?: any): Constructor<T> {

    /* If sources is an Function, convert it as Array */
    if(typeof sources === 'function') {
      sources = [sources];
    }

    /* If sources is not an Array, throw an error */
    if(!(sources instanceof Array) || (sources.length === 0)) {
      throw new Error('Sources must be an Array and contains at least one constructor');
    }

    /* If mainSource is undefined, and destination not already extended, choose sources[0] as mainSource */
    if(mainSource === void 0) {
      if(!this.hasSuper(destination)) {
        mainSource = sources[0];
      }
    }

    /* Add new property : <superClasses> to the constructor */
    if(!('superClasses' in destination)) {
      Object.defineProperty(destination, 'superClasses', {
        value: new Map<any, any>() // superClass, superClassName
      });
    }

    /* Get all properties of destination already set */
    const destinationDescriptors = (<any>Object).getOwnPropertyDescriptors(destination.prototype);

    /* Set prototype of destination according to mainSource */
    if(typeof mainSource === 'function') {
      destination.prototype = Object.create(mainSource.prototype); // create a shallow copy of mainSource.prototype
      destination.prototype.constructor = destination;
      Object.defineProperties(destination.prototype, destinationDescriptors);
    } else {
      mainSource = Object.getPrototypeOf(destination);
      // console.log('mainSource', mainSource);
    }

    (destination as any).superClasses.set(mainSource, mainSource.name);


    /* For each sources */
    for(let source of sources) {
      if(source === mainSource) continue;

      /* If destination already extended by source */
      if((destination as any).superClasses.get(source)) {
        console.warn('Class ' + destination.name + ' is already extended by ' + source.name);
        continue;
      }

      /* Copy all source properties that are not already defined in destination */
      const sourceDescriptors = (<any>Object).getOwnPropertyDescriptors(source.prototype);
      let sourceDescriptor: any;
      for(let sourceDescriptorName in sourceDescriptors) {
        sourceDescriptor = sourceDescriptors[sourceDescriptorName];
        if(destinationDescriptors[sourceDescriptorName] === void 0) {
          Object.defineProperty(destination.prototype, sourceDescriptorName, sourceDescriptor);
        }
      }

      (destination as any).superClasses.set(source, source.name);
    }

    return destination;
  }

  /**
   * Alias of _extends
   */
  static extends<T>(destination: any, sources: any, mainSource?: any): Constructor<T> {
    return this._extends<T>(destination, sources, mainSource);
  }


  /**
   * Get the list of direct parent classes of _class
   * @param _class
   * @returns {any[]}
   */
  static getSuperList(_class: any): any[] {
    const superClasses: any[] = [];
    if(_class.superClasses instanceof Map) {
      _class.superClasses.forEach((_name: string, _superClass: any) => {
        superClasses.push(_superClass);
      });
    } else {
      const _superClass = Object.getPrototypeOf(_class);
      if(_superClass !== this.objectPrototype) superClasses.push(_superClass);

    }
    return superClasses;
  }

  /**
   * Get the Tree of the parent classes of _class
   * @param _class
   * @returns {Tree}
   */
  static getSuperTree(_class: any): Tree {
    const tree: Tree = new Tree(_class);
    if(_class.prototype !== Object.prototype) {
      const superClasses: any[] = this.getSuperList(_class);
      for(let superClass of superClasses) {
        tree.addChild(this.getSuperTree(superClass));
      }
    }
    return tree;
  }

  /**
   * Search for a super class of _class
   * @param _class
   * @param _superClass
   * @returns {any[][]}
   */
  static findSuper(_class: any, _superClass: any): any[][] {
    const paths: any[][] = [];

    const tree: Tree = this.getSuperTree(_class);

    tree.allChildren.forEach((child: Tree) => {
      let found: boolean = false;
      if(typeof _superClass === 'string') {
        found = (child.value.name === _superClass);
      } else if(typeof _superClass === 'function') {
        found = (child.value === _superClass);
      }

      if(found) {
        const path = child.allParents;
        path.push(child);
        paths.push(path.map(child => child.value));
      }
    });

    if((paths.length > 1) && !ClassHelper.ALLOW_DIAMOND_STRUCTURE) {
      if(typeof _superClass === 'function') _superClass = _superClass.name;
      let message = `Diamond structure detected\n` + `${_class.name}.super<${_superClass}>` +
        ` resolves in ${paths.length} different paths :\n\t` +
        paths.map(path => path.map(f => f.name).join(' -> ')).join('\n\t')
      ;
      throw new Error(message);
    }

    return paths;
  }

  /**
   * Verify if _class inherits from _superClass
   * @param _class
   * @param _superClass
   * @returns {boolean}
   */
  static hasSuper(_class: any, _superClass?: any): boolean {
    if(_superClass === void 0) {
      return this.getSuperList(_class).length > 0;
    } else {
      return this.findSuper(_class, _superClass).length > 0;
    }
  }


  // experimental
  static getConstructorAsFunction(_class: any): () => any {
    let descriptor = Object.getOwnPropertyDescriptor(_class.prototype, 'constructor');
    if(descriptor) {
      if(typeof descriptor.value === 'function') {
        const code = descriptor.value.toString();
        if(code.startsWith('class')) {
          const parents = ClassHelper.getSuperList(descriptor.value);
          let index = code.indexOf('constructor');
          let constructorString = '';
          if(index < 0) {
            constructorString = 'function constructor() {' + ((parents.length > 0) ? 'super(...arguments)' : '') + '}';
          } else {
            constructorString = code.slice(index);
            let j = 0;
            let i = 0;
            forEachChar : for(; i < constructorString.length; i++) {
              switch(constructorString[i]) {
                case '{':
                  j++;
                  break;
                case '}':
                  j--;
                  if(j <= 0) break forEachChar;
                  break;
              }
            }
            constructorString = constructorString.slice(0, i + 1);
          }

          let hasSuper: boolean = false;
          constructorString = constructorString.replace(new RegExp('super\\((.*?)\\)', 'gm'), function(match: string, ...matches: any[]) {
            hasSuper = true;
            if(parents.length === 0) throw new Error('Super detected but class not extended.');
            let args = '';
            if(matches[0] === '...arguments') {
              args = 'Array.prototype.concat.apply([], arguments)';
            } else {
              args = '[' + matches[0] + ']';
            }
            return 'Super.init(this, \'' + parents[0].name + '\', ' + args + ')';
          });

          if(!hasSuper && parents.length > 0) throw new Error('Expect super into class constructor.');
          // console.log(constructorString);
          return evalFunction(constructorString);
        } else {
          return descriptor.value;
        }
      }
    }

    throw new Error('The super class has no constructor');
  }

}

/**
 * DECORATOR - for class
 * Helps to extend a class
 * @param args
 * @constructor
 */
export function Extends(...args: any[]): any {
  return (_class: any): void => {
    ClassHelper._extends(_class, args);
  };
}


/**
 * Used to build mixin and extend a class with it
 * @param sources
 * @returns {Constructor<T>}
 * @constructor
 */
export function Mixin<T>(...sources: Constructor<any>[]): Constructor<T> {
  return ClassHelper._extends<T>(function(...args: any[]) {
    if(args.length !== sources.length) {
      throw new Error(
        '<super> parameters number does\'nt match the number of super classes : ' +
        args.length + ' parameters passed, ' +
        sources.length + ' expected.'
      );
    }

    // let _this = this;
    for(let i = 0; i < sources.length; i++) {
      if(!(args[i] instanceof Array))  throw new Error('super parameters must be arrays');
      // console.log(sources[i], args[i]);
      Super.init(this, sources[i], args[i]);
      // console.log('_this =>', _this);
    }
    // return _this;
  } as any, sources);
  // return ClassHelper._extends<T>(class {}, sources);
}

/**
 * Super provide a wrapper to call super methods or properties
 */
export class Super {

  private _instance: any;
  private _superPrototype: any;

  /**
   * Call init from the constructor of the child class (equivalent of super())
   * @param object - the "this" object of the child class
   * @param superClass - the super class to init
   * @param args - the arguments to pass to the super class
   * @returns {any}
   */
  static init(object: any, superClass: any, args: any[] = []) {
    return new Super(object, superClass).apply('constructor', args);
  }

  constructor(object: any, superClass: any) {
    this._instance = object;
    const path: any[][] = InstanceHelper.findSuper(object, superClass);
    // console.log(superClass, path);
    if(path.length > 0) {
      const _superClass = path[0][path[0].length - 1];
      this._superPrototype = _superClass.prototype;
    } else {
      throw new Error('The class has not been extended by ' + JSON.stringify(superClass));
    }
  };

  /**
   * Call a method of the super class
   * @param propertyName
   * @param args
   * @returns {any}
   */
  call(propertyName: string, ...args: any[]): any {
    return this.apply(propertyName, args);
  }

  /**
   * Get a "get" property of the super class
   * @param propertyName
   * @returns {any}
   */
  get(propertyName: string): any {
    return this.apply(propertyName);
  }

  /**
   * Set a "set" property of the super class
   * @param propertyName
   * @param value
   */
  set(propertyName: string, value: any) {
    this.apply(propertyName, [value]);
  }

  /**
   * Call a method, getter or setter of the super class
   * @param propertyName
   * @param args
   * @returns {any}
   */
  apply(propertyName: string, args: any[] = []): any {
    const descriptor = Object.getOwnPropertyDescriptor(this._superPrototype, propertyName);
    if(descriptor) {
      if(typeof descriptor.value === 'function') {
        try {
          return descriptor.value.apply(this._instance, args);
        } catch(error) {
          if(propertyName === 'constructor') {
            const constructor = ClassHelper.getConstructorAsFunction(descriptor.value);
            return constructor.apply(this._instance, args);
          } else {
            throw error;
          }
        }
        // Object.getPrototypeOf(a)
        // Reflect.construct(descriptor.value, args, this._instance.constructor)
        // Reflect.construct(descriptor.value, args, class extends this._instance.constructor {
        //   constructor(...args) { // : any[]
        //     console.log(args);
        //     super(...args);
        //     return
        //   }
        // });

      } else if((typeof descriptor.set === 'function') && (args.length > 0)) {
        return descriptor.set.apply(this._instance, args);
      } else if(typeof descriptor.get === 'function' && (args.length === 0)) {
        return descriptor.get.apply(this._instance, args);
      }
    }

    throw new Error('The super class has not the property ' + propertyName);
  }

}

/**
 * DECORATOR - for method
 * Replace "super<className>.methodName(...arguments)" pattern by :
 * new Super(this, className).call(methodName, arguments)
 * @constructor
 */
export function Supers(): any {
  return (_class: any, name: string, descriptor: PropertyDescriptor): void => {
    let fnc = descriptor.value.toString();
    let matchFound: boolean = false;
    fnc = fnc.replace(new RegExp('"super<([^>]+)>\\.([^\\(]+)\\((.*?)\\)"', 'gm'), function(match: string, ...matches: any[]) {
      matchFound = true;
      return '(new Super(this, ' + matches[0] + ').call(\'' + matches[1] + '\'' + (matches[2] ? (', ' + matches[2]) : '') + '))';
    });

    if(matchFound) {
      descriptor.value = evalFunction(fnc);
    } else {
      console.warn('No "super<class>.prop(args)" found.');
    }
  };
}








export type PropertyAccessModifier = 'public' | 'protected' | 'private';
export interface PropertyOptions {
  access?: PropertyAccessModifier;
  friends?: any[];
}

/**
 * DECORATOR - for method
 * @constructor
 */
export function Property(options: PropertyOptions = {}): any {
  options = Object.assign({
    access: 'public',
    friends: []
  } as PropertyOptions, options);

  function normalizeFriend(friend: any): string {
    if(typeof friend === 'string') {
      return friend;
    } else if(typeof friend === 'function') {
      if(friend.hasOwnProperty('name') && (friend.name !== '')) {
        return friend.name;
      } else {
        throw new TypeError('Anonymous functions are not supported');
      }
    } else {
      throw new TypeError('Invalid friend type');
    }
  }

  options.friends = options.friends.map(normalizeFriend);

  return (classPrototype: any, name: string, descriptor: PropertyDescriptor): void => {
    options.friends.push(normalizeFriend(classPrototype.constructor));
    // console.log(options.friends);
    const reg: RegExp = new RegExp('^([\\s\\S]+)[\\s]+', 'gm');

    const memoizeMap: Map<string, string[]> = new Map<string, string[]>();

    function getStack(): string[] {
      const errorStack: string = new Error().stack;
      let stack: string[] = memoizeMap.get(errorStack);
      if(stack === void 0) {
        stack = [];
        const lines: string[] = errorStack.split(new RegExp('[\\s]+at ', 'gm'));
        for(let i = 4; i < lines.length; i++) {
          const match: string[] | null = reg.exec(lines[i]);
          reg.lastIndex = 0;
          if(match !== null) {
            stack.push(match[1].replace(/(^new )|(\..*$)/, ''));
          } else {
            stack.push('<global>');
          }
        }
        memoizeMap.set(errorStack, stack);
      }
      return stack;
    }

    function canAccess(): boolean {
      // console.log('\n\ncanAccess\n\n');
      const friendsLength: number = options.friends.length;
      if(friendsLength > 0) {
        const stack: string[] = getStack();
        // console.log(stack);

        for(let i = 0; i < friendsLength; i++) {
          let friend: any = options.friends[i];
          const deep: boolean = friend.endsWith(':deep');
          // console.log(deep);
          if(deep) friend = friend.slice(0, friend.length - 5);
          for(let j = 0, stackLength = deep ? stack.length : 1; j < stackLength; j++) {
            // console.log(stack[j], friend);
            if(stack[j] === friend) return true;
          }
        }
      }
      return false;
    }

    switch(options.access) {
      default:
      case 'public':
        break;
      case 'protected':
      case 'private':
        if(descriptor === void 0) {
          descriptor = Object.getOwnPropertyDescriptor(classPrototype, name);
          if(descriptor === void 0) descriptor = { value: void 0 };
        }
        const hasValue: boolean = descriptor.hasOwnProperty('value');

        Object.defineProperty(classPrototype, name, {
          enumerable: false,
          get: function (): any {
            if(canAccess()) {
              return hasValue ? descriptor.value : descriptor.get();
            } else {
              throw new Error('Trying to access to a ' + options.access + ' property : ' + name);
            }
          },
          set: function(value: any): void {
            if(canAccess()) {
              if(hasValue) {
                descriptor.value = value;
              } else {
                descriptor.set(value);
              }
            } else {
              throw new Error('Trying to access to a ' + options.access + ' property : ' + name);
            }
          }
        });
        break;
    }
  };
}




const test = (global: any) => {
  class _B {
    public value: string;
    constructor(value?: string) {
      this.value = value;
      // console.log('create B', value);
    }

    get(): string {
      // console.log(this, this.test());
      return ['b', this.value, this.test()].join(',');
    }

    test(): string {
      return 'test B';
    }

    get a(): string {
      return this.get();
    }

    get b(): string {
      return this.get();
    }
  }

  class _A extends _B {
    public value: string;
    constructor(value?: string) {
      super('value B');
      this.value = value;
      // console.log('create A', value);
    }

    get(): string {
      return ['a', this.value, this.test()].join(',');
    }

    test(): string {
      return 'test A';
    }

    get a(): string {
      // console.log('get a from A');
      return 'a'/* + super.a*/;
    }
  }

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



  interface AType extends A, B, C {}
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


  // _extend(A, [B, C]);

  global._A = _A;
  global._B = _B;
  global._a = new _A();

  global.A = A;
  global.B = B;
  global.C = C;
  const a = new A()/* as AType*/;
  (global as any).a = a;
  console.log(a.b);

  // console.log(ClassHelper._instanceof((<any>window).a, A));
  // console.log(ClassHelper._instanceof((<any>window).a, _A));
};

// test(global || self || this);
