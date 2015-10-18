(function(){
	/**
	 * This is a convenience function for creating javascript "class"es.
	 * 
	 * The main reason for this function's existance is to semantically and easily create
	 * javascript constructor functions that will also configure prototype and constructor
	 * properties while also allowing for easy prototype inheritance.
	 * 
	 * This is also an easy way to add getter and setter properties to the prototype and
	 * constructor. This is possible because the static and instance parameters look for
	 * property descriptors allowing you to easily make getter, setter, and readonly values.
	 * Any property descriptor is supported.  
	 * [See the MDN page on Object.defineProperty for more details on property descriptors.]
	 * (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty#Description)
	 * 
	 * @example <caption>Inclusion</caption>
	 * // To use in a browser environment, just include the file in a script tag and access through window.Class
	 * window.Class(...);
	 * // Or just
	 * Class(...)
	 * 
	 * // To use in a node.js environment, just require the module in
	 * var Class = require("jsclass")
	 * Class(...)
	 * 
	 * // To use in a angular environment just include the module "jsClass" and use the injector parameter "$Class".
	 * // $Class is defined as a constant, so it is available in the configuration stage.
	 * angular.module("exampleScript", ["jsClass"])
	 * .config(["$Class", function($Class){
	 *     $Class(...)
	 * });
	 * 
	 * @example <caption>Creating a class</caption>
	 * // Once you have access to your class function you can create a class as follows
	 * var Foo = Class(
	 *     // This is your constructor function
	 *     function Foo(param1){
	 *         // Do stuff
	 *         this.someVar = param1;
	 *     },
	 *     
	 *     // These are your static properties.
	 *     // Note: These properties can contain property descriptors such as getters and setters, as well as read only values.
	 *     {
	 *         // Example of a regular variable
	 *         StaticVariable: "Foo",
	 *         
	 *         // Example of a static method
	 *         StaticFunction: function(){
	 *             // Do stuff
	 *         }
	 *         
	 *         // Example of a read only variable
	 *         StaticConstant: {
	 *             // We use a property descriptor object to accomplish this.
	 *             configurable: true,
	 *             enumerable:   true,
	 *             
	 *             writable: false
	 *             value:    "FooBar"
	 *         },
	 *         
	 *         // Example of a static getter setter
	 *         StaticGetterSetter: {
	 *             // Once again we use a property descriptor object to accomplish this.
	 *             configurable: true,
	 *             enumerable:   true,
	 *             
	 *             get: function(){
	 *                 return this.StaticVariable;
	 *             },
	 *             
	 *             set: function(newValue){
	 *                 console.log("Assigning new value to Foo.StaticVariable: ", this.StaticVariable, " => ", newValue);
	 *                 this.StaticVariable = newValue;
	 *             }
	 *         },
	 *         
	 *         // Example of a factory function
	 *         StaticFactory: function(param1){
	 *             return new this(param1 + "Factory");
	 *         }
	 *     },
	 *     
	 *     // These are your instance properties (Foo.prototype properties)
	 *     // Note: These properties can contain property descriptors such as getters and setters, as well as read only values.
	 *     {
	 *         // Example of a variable
	 *         someVar: "foo",
	 *         
	 *         // Example of a method
	 *         someFunc: function(param){
	 *             // Do some stuff
	 *             return this.someVar;
	 *         },
	 *         
	 *         // Example of readonly value
	 *         someReadonlyValue: {
	 *             // We use a property descriptor object to accomplish this.
	 *             configurable: true,
	 *             enumerable:   true,
	 *             
	 *             writable: false
	 *             value:    "fooBar"
	 *         },
	 *         
	 *         // Example of a getter setter
	 *         getterSetter: {
	 *             // Once again we use a property descriptor object to accomplish this.
	 *             configurable: true,
	 *             enumerable:   true,
	 *             
	 *             get: function(){
	 *                 return this.someVar;
	 *             },
	 *             
	 *             set: function(newValue){
	 *                 console.log("Assigning new value to Foo#someVar: ", this.someVar, " => ", newValue);
	 *                 this.someVar = newValue;
	 *             }
	 *         }
	 *     }
	 * );
	 * 
	 * var foo = new Foo("FooBarBaz");
	 * console.log(foo.someVar);           // "FooBarBaz"
	 * console.log(foo.someFunc());        // "FooBarBaz"
	 * console.log(foo.getterSetter);      // "FooBarBaz"
	 * console.log(foo.someReadonlyValue); // "fooBar"
	 * 
	 * foo.someReadonlyValue = "fooBarBaz";
	 * console.log(foo.someReadonlyValue); // "fooBar"
	 * 
	 * @example <caption>Inheritance and overriding</caption>
	 * // There are 2 ways to easily have a class inherit from another.
	 * 
	 * // The first and recommended way is to call the .extend function that gets added automatically by any class defined by the Class function.
	 * var Bar = Foo.extend(
	 *     function Bar(param1, param2){
	 *         param1 = param1 + param2;
	 *         // In order to get all the properties that are added by the super constructor you must call the constructor. Any prototype proprties are automatically extended. However you arn't required to do this.
	 *         // this.super is a convenience function that is automatically added that points to the constructor of the parent class. In this case, this.super points to Foo.
	 *         this.super.call(this, param1);
	 *         // For those not familiar with javascript inheritance, you must use the .call (or .apply) method of the super function with the first parameter equal to this in order for the super function to modify this instance.
	 *     },
	 *     null, // Bar has no static properties.
	 *     {
	 *         // Overriding functions
	 *         someFunc: function(param){
	 *             param = param + param + param;
	 *             
	 *             // If you want to call the parent's class version of this method then you must access it through this.super.prototype
	 *             return this.super.prototype.someFunc.call(this, param);
	 *             // Once again we need to call the .call or .apply method of the function in order to set the "this" variable so the function will modify this instance.
	 *         }
	 *     }
	 * );
	 * 
	 * console.log(Bar.StaticVariable); // null - this is because StaticVariable is on the Foo class. Static properties arn't inherited. Only instance properties are.
	 * 
	 * var bar = new Bar("FooBaz", "Bar");
	 * console.log(bar.someVar);           // "FooBazBar"
	 * console.log(bar.someFunc());        // "FooBazBar"
	 * console.log(bar.getterSetter);      // "FooBazBar"
	 * console.log(bar.someReadonlyValue); // "fooBar"
	 * 
	 * 
	 * 
	 * // The second method is to use the 4th parameter of the Class function. This is useful for extending javascript classes that arn't created with the Class function.
	 * var Baz = Class(
	 *     function Baz(...){...},
	 *     ...,
	 *     ...,
	 *     Array
	 * );
	 * 
	 * @see [MDN Property Descriptors](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty#Description)
	 * 
	 * @param   {Function}           constructor    - The constructor function for your new class.
	 * @param   {?(Object|Function)} static         - An object with a list of properties as keys, and values as the value for the property. Values can also be property descriptor objects. Check the See link for more details. This can also be a function that returns an object with this format. These properties will be added to the Constructor function.
	 * @param   {?(Object|Function)} instance       - An object with a list of properties as keys, and values as the value for the property. Values can also be property descriptor objects. Check the See link for more details. This can also be a function that returns an object with this format. These properties will be added to the Constructor function's prototype object.
	 * @param   {Function}           [inheritsFrom] - A constructor function that this class should inherit from.
	 *                                          
	 * @returns {Function}           Your new class's constructor function.
	 */
	function Class(constructor, static, instance, inheritsFrom){
		if(inheritsFrom && typeof inheritsFrom !== "function")
			throw new Error("Argument Error: inheritsFrom parameter must be a constructor function.");
		if(static && typeof static === "function") static = static(constructor);
		if(instance && typeof instance === "function") instance = instance(constructor);

		var prototype = {};

		// Extend inheritsFrom
		if(inheritsFrom){
			prototype = Object.create(inheritsFrom.prototype);
			Object.defineProperty(prototype, "super", {
				configurable:	false,
				enumerable:		false,
				writable:		false,

				value: inheritsFrom.prototype
			});
		}

		if(static){
			toDescriptors(static);
			Object.defineProperties(constructor, static);
		}

		if(instance){
			toDescriptors(instance);
			Object.defineProperties(prototype, instance);
		}

		Object.defineProperty(prototype, "constructor", {
			configurable:	false,
			enumerable:		false,
			writable:		false,

			value: constructor
		});
		Object.defineProperty(constructor, "prototype", {
			value: prototype
		});

		if(!("extend" in constructor))
			Object.defineProperty(constructor, "extend", {
				configurable:	true,
				enumerable:		false,
				writable:		false,

				value: function(childConstructor, static, instance){
					return Class(childConstructor, static, instance, constructor);
				}
			});

		return constructor;
	}
	
	/**
	 * This property decides whether or not to hide (enumerable: false) properties that begin with an underscore from enumeration.
	 * 
	 * @type {Boolean}
	 * @default
	 */
	Class.HideUnderscores = true;

	/**
	 * This method will convert an object with a key:value, or a mix between key:value and key:property-descriptor format to a key:property-descriptor format.
	 * 
	 * @private
	 * 
	 * @param {Object} object - An object to convert.
	 */
	function toDescriptors(object){
		for(var key in object)
			if(!isDescriptor(object[key])){
				object[key] = {
					configurable:	true,
					enumerable:		!(key[0] === "_" && Class.HideUnderscores),
					writable:		true,

					value: object[key]
				};
			}
	}

	var validProps = ["configurable", "enumerable", "writable", "value", "get", "set"];
	/**
	 * This function will determine whether an object with key:value pairs mathces the signature of a property-descriptor.
	 * 
	 * A property descriptor will have one or more of these keys.
	 * - configurable
	 * - enumerable
	 * - writable
	 * - value
	 * - get
	 * - set
	 * 
	 * @private
	 * 
	 * @param   {Object} object - The object to check.
	 * @returns {Boolean} Whether or not the passed object is a property descriptor.
	 */
	function isDescriptor(object){
		// If object is not an object, then it cannot be a property descriptor.
		if(typeof object !== "object" || object === null) return false;

		// If there are any property names in the object that arn't in the array below, the object is not a descriptor.
		for(var prop in object)
			if(validProps.indexOf(prop) === -1)
				return false;

		// Only say it's a descriptor if it has a value, or getter or setter.
		return ("value" in object || "get" in object || "set" in object);
	}
	
	if("module" in this) module.exports = Class;
	else if("window" in this) window.Class = Class;
	if("angular" in this) angular.module("jsClass", []).constant("$Class", Class);
})();