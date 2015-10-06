(function(){
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

	function toDescriptors(object){
		for(var key in object)
			if(!isDescriptor(object[key])){
				object[key] = {
					configurable:	true,
					enumerable:		true,
					writable:		true,

					value: object[key]
				};
			}
	}

	function isDescriptor(object){
		// If object is not an object, then it cannot be a property descriptor.
		if(typeof object !== "object" || object === null) return false;

		// If there are any property names in the object that arn't in the array below, the object is not a descriptor.
		var validProps = ["configurable", "enumerable", "writable", "value", "get", "set"];
		for(var prop in object)
			if(validProps.indexOf(prop) === -1)
				return false;

		// Only say it's a descriptor if it has a value, or getter or setter.
		return ("value" in object || "get" in object || "set" in object);
	}
	
	if(module) module.exports = Class;
	else if(window) window.Class = Class;
	if(angular) angular.module("jsClass", []).constant("$Class", Class);
})();