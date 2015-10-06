## Synopsis

ClassConstructor is a way of organizing the data, methods, and getters and setters for classes and doing prototype inheritance quickly and easily in javascript.

## Code Example

### Basic Usage
```
var ExampleClass = Class(
	// Constructor Function
	function ExampleClass(someArgs){
		// Do stuff
	},
	
	// Constructor(Static) properties
	// An object as a list of properties that will be added to the constructor function.
	// This list can be of name:value pairs, or it can be of name:property-descriptor pairs.
	// For more information on property descriptors see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty#Description
	// If your value is an object that is a valid property descriptor the class constructor will treat it as a property descriptor.
	{
		ClassVariable: "Foo",
		
		ClassConstant: {
			configurable: false,
			enumerable: true,
			
			writable: false,
			value: "Bar"
		}
	},
	
	// Prototype(Instance) Properties
	// This is an object that has the same format as the Constructor Properties object.
	{
		someFunc: function(){
		
		},
		
		gettersetter: {
			configurable: false,
			enumerable: true,
			
			get: function(){ return this._gettersetter; },
			
			set: function(newGetterSetter){
				if(this._gettersetter)
					this._gettersetter.destroy();
				
				this.gettersetter = newGetterSetter;
			}
		}
	}
);

var example = new ExampleClass();
example.someFunc();
example.gettersetter = "Cool Stuff";
```

### Inheritance
```
var Bar = ExampleClass.extend( // The .extend is an alias function that invokes the Class function with ExampleClass as the last argument. Eg Class(constructor, constructorProps, protoProps, ExampleClass)
	// Constructor
	function Bar(someArgs){
		// Do some stuff
		
		// Invoke super class constructor on this object
		this.super.constructor.call(this, someArgs);
	},
	
	null, // Don't want to define any static props
	
	{
		someFunc: function(){
			// Override ExampleClass.someFunc
			// Do stuff
			// Invoke old function
			this.super.someFunc.call(this);
		}
	}
);
```

## Motivation

I made this little function to quickly and neatly define javascript "classes"

## Installation

Clone and use the function in your web projects

## API Reference

### `Class(constructor, static, instance, inheritsFrom)`
A quick, neat, and organized way to create a "class" in javascript.

`constructor` - A constructor function. The prototype.constructor property is automatically set to this function.
`static` - An object that contains name:value pairs or name:[property-descriptor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty#Description) pairs, or a combination of both. This argument can also be a function that returns this object. If this arguments evaluates as false then no action is taken.
`instance` - A value the same as the `static` argument. These properties get applied to the prototype.
`inheritsFrom` - A constructor function to inherit from. If provided the prototype will extend this constructors prototype. A hidden property named `super` will also be available to child instances that point to the `inheritsFrom`'s prototype.

Returns - A constructor function that will create new objects.

## Contributors

BAM5

Please feel free to use github's bug tracker if anything is not working properly or if there is something that I should add that I have overlooked.

## License

I really need to look into licenses...
Uhh, feel free to use this code and modify it however you want, you just can't sell it for profit. Crediting me is appreciated.