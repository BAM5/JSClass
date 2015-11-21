(function(global){
	"use strict";
	
	/*
	Class2("com.bam5.CoolStuffMcGee extends com.bam5.neat", {...});
	Class2("extends com.bam5.neat" {...});
	Class2(com.bam5.neat, {...});
	Class2({...});
	Class2("com.bam5.coolStuffMcGee", com.bam5.neat, {...});
	Class2("com.bam5.CoolStuffMcGee", "com.bam5.neat", {
		// everything in the object before the constructor function is static
		StaticVar: "This is static",
		StaticFunc: function(){return "Static!"},
		
		// Constructor
		CoolStuffMcGee: function(){
			// This is the constructor function
		},
		
		// The constructor can also just be called "constructor"
		constructor: function(){
			
		},
		
		// Instance properties
		isOpen: {
			get: function(){return this._open;},
			set: function(newVal){this._open = newVal)}
		},
		
		open: function(){},
		
		// Non Enumerable Props (anything beginning with an underscore)
		_open: false
	});
	*/
	
	var argErr = "Argument Error: The arguments are not what was expected";
	
	var ol = {
		"object":						"classObj",
		"string, object":				"defineStr, classObj",
		"constructor, object":			"extendInfo.extendObj, classObj",
		"string, string, object":		"classInfo.fqn, extendInfo.fqn, classObj",
		"string, constructor, object":	"defineStr, extendInfo.extendObj, classObj",
	};
	
	var Class2 = function(){
		var args = overload(ol, arguments);
		
		if(args.defineStr){
			var fqnInfo = getFQNInfo(args.defineStr);
			if(fqnInfo) args.classInfo = getClassInfo(fqnInfo);

			if(!args.extendInfo){
				fqnInfo = getExtendFQNInfo(args.defineStr);
				if(fqnInfo) args.extendInfo = getClassInfo(fqnInfo);
			}
			if(args.extendInfo && args.extendInfo.fqn && !args.extendInfo.fqnInfo)
				args.extendInfo = getClassInfo(getFQNInfo(args.extendInfo.fqn));
			
			if(args.extendInfo && !args.extendInfo.extendObj)
				args.extendInfo.extendObj = getObj(args.extendInfo.fqnInfo);
		}
		
		var promise = {
			finished:	false,
			state:		null,
			cbArgs:		null,
			success:	null,
			failure:	null,
			then: function(success, failure){ this.success = success; this.failure = failure; if(this.finished) this.call(); },
			call: function(){ this.finished = true; this[this.state] && this[this.state].apply(global, this.cbArgs); }
		};
		
		var createClass = function(){
			if(args.extendInfo && !args.extendInfo.extendObj){
				args.extendInfo.extendObj = getObj(args.extendInfo.fqnInfo);
				if(!args.extendInfo.extendObj) return false;
			}
			
			var classObj = args.classObj;
			var isStatic = true;
			var statics = {};
			var instance = {};
			var hidden = {};
			var constructor = null;
			
			for(var prop in classObj){
				if(prop === "constructor" || prop === args.classInfo.className || (prop === "instance")){
					isStatic = false;
					constructor = classObj[args.classInfo.className || "constructor"] || null;
					continue;
				}
				
				if(isStatic) statics[prop] = classObj[prop];
				else if(prop[0] === "_" && Class2.HideUnderscored) instance[prop] = hidden[prop] = classObj[prop];
				else instance[prop] = classObj[prop];
			}
			
			var ClassConstructor;
			
			var evalFunc = "function(){\n\
					// We do this because if we don't the property will be visible when set on the instance.\n\
					Object.defineProperties(this, hidden);\n\
					return (constructor && constructor.apply(this, arguments)) || this;\n\
				}";
			
			if(args.classInfo){
				if(getObj(args.classInfo.fqnInfo)) throw new Error(args.classInfo.fqn + " is already defined");
				// Make the class name in console the same as the class's fqn instead of being "ClassConstructor"
				setObj(args.classInfo.fqnInfo, null)
				eval(args.classInfo.fqn+ " = "+evalFunc+";\n\
				ClassConstructor = "+args.classInfo.fqn+";");
			} else{
				var AnonymousConstructor = eval("("+evalFunc+")");
				ClassConstructor = AnonymousConstructor;
			}
			
			// Set up inheritance
			var proto = {};
			
			if(args.extendInfo){
				proto = Object.create(args.extendInfo.extendObj);
				
				Object.defineProperty(proto, "super", {
					configurable:	false,
					enumerable:		false,
					
					writable:		false,
					value:			args.extendInfo.extendObj
				});
			}
			
			Object.defineProperty(proto, "constructor", {
				configurable:	false,
				enumerable:		false,
				
				writable:		false,
				value:			ClassConstructor
			});
			
			statics.prototype = {
				value:		proto
			};
			
			Object.defineProperties(ClassConstructor,	toDescriptors(statics));
			Object.defineProperties(proto,				toDescriptors(instance));
			Object.defineProperties(proto,				toDescriptors(hidden));
			
			if(args.classInfo)
				Class2.queue.updateRequired(args.classInfo.fqn, ClassConstructor);
			
			promise.finished = true;
			promise.state = "success";
			promise.cbArgs = [ClassConstructor];
			promise.call();
			
			return ClassConstructor;
		};
		
		if(args.extendInfo && args.extendInfo.fqn && !args.extendInfo.extendObj){
			Class2.queue.add(args.extendInfo.fqn, createClass);
			return promise;
		} else
			return createClass();
	}
		
	Object.defineProperty(Class2, "queue", {
		configurable:	false,
		enumerable:		false,

		writable:	false,
		value:		{}
	});
	Class2.queue.add = function(requiredFQN, createClass){
		if(!(requiredFQN in this)) this[requiredFQN] = [];
		this[requiredFQN].push(createClass);
	};
	Class2.queue.updateRequired = function(fqn){
		if(this[fqn])
			this[fqn].each(function(el, i, arr){
				el();
			});
	};
	
	function getObj(fqn, root){
		fqn = Array.isArray(fqn) ? fqn : getFQNInfo(fqn);
		var obj = root || global;
		for(var i = 0; i<fqn.length && obj; i++) obj = obj[fqn[i]];
		return i === fqn.length?obj:undefined;
	}
	
	function setObj(fqn, value, root){
		fqn = Array.isArray(fqn) ? fqn : getFQNInfo(fqn);
		var obj = root || global;
		for(var i=0, len=fqn.length; i<len-1; i++)
			obj = obj[fqn[i]] = obj[fqn[i]] || {};
		obj[fqn[fqn.length-1]] = value;
	}
	
	var csv = /([a-zA-Z_](?:\w|\.)*)\s*,?\s*/g;
	var is = {
		"string":		function(check){ return "string" === typeof(check)},
		"number":		function(check){ return "number" === typeof(check)},
		"object":		function(check){ return "object" === typeof(check)},
		"boolean":		function(check){ return "boolean" === typeof(check)},
		"function":		function(check){ return "function" === typeof(check)},
		"array":		function(check){ return Array.isArray(check)},
		"constructor":	function(check){ return "function" === typeof(check) && check.prototype.constructor === check},
	};
	function overload(signatures, args){
		var matches, matchNum, correctSig;
		
		sigIterate: for(var signature in signatures){
			matchNum = 0;
			csv.lastIndex = 0;
			while((matches = csv.exec(signature)) && matchNum<args.length){
				if(!is[matches[1]](args[matchNum])) continue sigIterate;
				matchNum++;
			}
			if(matchNum !== args.length || matches) continue sigIterate;
			correctSig = signature;
			break;
		}
		
		if(!correctSig) throw new Error("The arguments provided did not match any of the signatures for this function.");
		
		if(is["function"](signatures[correctSig]))
			return signatures[correctSig].apply(this, args);
		
		var organized = {}, matchNum = 0;
		csv.lastIndex = 0;
		while(matches = csv.exec(signatures[correctSig]))
			setObj(matches[1].split("."), args[matchNum++], organized);
		
		return organized;
	}
	
	Class2.Overload = overload;
	
	var isFQN = /^(?:[a-zA-Z_]\w*\.?)+$/;
	var defineString = /^\s*(?:class\s)?\s*((?:[a-zA-Z_]\w*\.?)+)?(?:\s*(?:extends\s*((?:[a-zA-Z_]\w*\.?)+))?)?\s*$/i;
	
	function getClassInfo(fqnInfo){
		return {
			fqn:		fqnInfo.join("."),
			fqnInfo:	fqnInfo,
			package:	fqnInfo.slice(0, -1).join("."),
			className:	fqnInfo[fqnInfo.length -1]
		};
	}
	
	function getFQNInfo(src){
		if(!isFQN.test(src)){
			var match = defineString.exec(src);
			src = match !== null && match[1];
		}
		if(src && isFQN.test(src))
			return src.split(".");
		return null;
	}
	
	function getExtendFQNInfo(src){
		var match = defineString.exec(src);
		src = match !== null && match[2];
		if(src && isFQN.test(src))
			return src.split(".");
		return null;
	}
	
	
	/**
	 * This property decides whether or not to hide (enumerable: false) properties that begin with an underscore from enumeration.
	 * 
	 * @type {Boolean}
	 * @default
	 */
	Class2.HideUnderscored = true;

	/**
	 * This method will convert an object with a key:value, or a mix between key:value and key:property-descriptor format to a key:property-descriptor format.
	 * 
	 * @private
	 * 
	 * @param {Object} object - An object to convert.
	 */
	function toDescriptors(object){
		for(var key in object){
			if(!isDescriptor(object[key])){
				object[key] = {
					configurable:	true,
					enumerable:		!(key[0] === "_" && Class2.HideUnderscored),
					writable:		true,

					value: object[key]
				};
			}
		}
			console.log(object);
		return object;
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
	
	
	if("module" in global) module.exports = Class2;
	else if("window" in global) window.Class = Class2;
	if("angular" in global) angular.module("jsClass", []).constant("$Class", Class);
	
})(this);