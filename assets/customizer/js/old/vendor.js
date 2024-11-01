(function($){
var Node = Node || {
  ELEMENT_NODE: 1,
  ATTRIBUTE_NODE: 2,
  TEXT_NODE: 3
};

/*!
 * jQuery UI Core 1.10.4
 * http://jqueryui.com
 *
 * Copyright 2014 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/category/ui-core/
 */
(function( $, undefined ) {

var uuid = 0,
	runiqueId = /^ui-id-\d+$/;

// $.ui might exist from components with no dependencies, e.g., $.ui.position
$.ui = $.ui || {};

$.extend( $.ui, {
	version: "1.10.4",

	keyCode: {
		BACKSPACE: 8,
		COMMA: 188,
		DELETE: 46,
		DOWN: 40,
		END: 35,
		ENTER: 13,
		ESCAPE: 27,
		HOME: 36,
		LEFT: 37,
		NUMPAD_ADD: 107,
		NUMPAD_DECIMAL: 110,
		NUMPAD_DIVIDE: 111,
		NUMPAD_ENTER: 108,
		NUMPAD_MULTIPLY: 106,
		NUMPAD_SUBTRACT: 109,
		PAGE_DOWN: 34,
		PAGE_UP: 33,
		PERIOD: 190,
		RIGHT: 39,
		SPACE: 32,
		TAB: 9,
		UP: 38
	}
});

// plugins
$.fn.extend({
	focus: (function( orig ) {
		return function( delay, fn ) {
			return typeof delay === "number" ?
				this.each(function() {
					var elem = this;
					setTimeout(function() {
						$( elem ).focus();
						if ( fn ) {
							fn.call( elem );
						}
					}, delay );
				}) :
				orig.apply( this, arguments );
		};
	})( $.fn.focus ),

	scrollParent: function() {
		var scrollParent;
		if (($.ui.ie && (/(static|relative)/).test(this.css("position"))) || (/absolute/).test(this.css("position"))) {
			scrollParent = this.parents().filter(function() {
				return (/(relative|absolute|fixed)/).test($.css(this,"position")) && (/(auto|scroll)/).test($.css(this,"overflow")+$.css(this,"overflow-y")+$.css(this,"overflow-x"));
			}).eq(0);
		} else {
			scrollParent = this.parents().filter(function() {
				return (/(auto|scroll)/).test($.css(this,"overflow")+$.css(this,"overflow-y")+$.css(this,"overflow-x"));
			}).eq(0);
		}

		return (/fixed/).test(this.css("position")) || !scrollParent.length ? $(document) : scrollParent;
	},

	zIndex: function( zIndex ) {
		if ( zIndex !== undefined ) {
			return this.css( "zIndex", zIndex );
		}

		if ( this.length ) {
			var elem = $( this[ 0 ] ), position, value;
			while ( elem.length && elem[ 0 ] !== document ) {
				// Ignore z-index if position is set to a value where z-index is ignored by the browser
				// This makes behavior of this function consistent across browsers
				// WebKit always returns auto if the element is positioned
				position = elem.css( "position" );
				if ( position === "absolute" || position === "relative" || position === "fixed" ) {
					// IE returns 0 when zIndex is not specified
					// other browsers return a string
					// we ignore the case of nested elements with an explicit value of 0
					// <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
					value = parseInt( elem.css( "zIndex" ), 10 );
					if ( !isNaN( value ) && value !== 0 ) {
						return value;
					}
				}
				elem = elem.parent();
			}
		}

		return 0;
	},

	uniqueId: function() {
		return this.each(function() {
			if ( !this.id ) {
				this.id = "ui-id-" + (++uuid);
			}
		});
	},

	removeUniqueId: function() {
		return this.each(function() {
			if ( runiqueId.test( this.id ) ) {
				$( this ).removeAttr( "id" );
			}
		});
	}
});

// selectors
function focusable( element, isTabIndexNotNaN ) {
	var map, mapName, img,
		nodeName = element.nodeName.toLowerCase();
	if ( "area" === nodeName ) {
		map = element.parentNode;
		mapName = map.name;
		if ( !element.href || !mapName || map.nodeName.toLowerCase() !== "map" ) {
			return false;
		}
		img = $( "img[usemap=#" + mapName + "]" )[0];
		return !!img && visible( img );
	}
	return ( /input|select|textarea|button|object/.test( nodeName ) ?
		!element.disabled :
		"a" === nodeName ?
			element.href || isTabIndexNotNaN :
			isTabIndexNotNaN) &&
		// the element and all of its ancestors must be visible
		visible( element );
}

function visible( element ) {
	return $.expr.filters.visible( element ) &&
		!$( element ).parents().addBack().filter(function() {
			return $.css( this, "visibility" ) === "hidden";
		}).length;
}

$.extend( $.expr[ ":" ], {
	data: $.expr.createPseudo ?
		$.expr.createPseudo(function( dataName ) {
			return function( elem ) {
				return !!$.data( elem, dataName );
			};
		}) :
		// support: jQuery <1.8
		function( elem, i, match ) {
			return !!$.data( elem, match[ 3 ] );
		},

	focusable: function( element ) {
		return focusable( element, !isNaN( $.attr( element, "tabindex" ) ) );
	},

	tabbable: function( element ) {
		var tabIndex = $.attr( element, "tabindex" ),
			isTabIndexNaN = isNaN( tabIndex );
		return ( isTabIndexNaN || tabIndex >= 0 ) && focusable( element, !isTabIndexNaN );
	}
});

// support: jQuery <1.8
if ( !$( "<a>" ).outerWidth( 1 ).jquery ) {
	$.each( [ "Width", "Height" ], function( i, name ) {
		var side = name === "Width" ? [ "Left", "Right" ] : [ "Top", "Bottom" ],
			type = name.toLowerCase(),
			orig = {
				innerWidth: $.fn.innerWidth,
				innerHeight: $.fn.innerHeight,
				outerWidth: $.fn.outerWidth,
				outerHeight: $.fn.outerHeight
			};

		function reduce( elem, size, border, margin ) {
			$.each( side, function() {
				size -= parseFloat( $.css( elem, "padding" + this ) ) || 0;
				if ( border ) {
					size -= parseFloat( $.css( elem, "border" + this + "Width" ) ) || 0;
				}
				if ( margin ) {
					size -= parseFloat( $.css( elem, "margin" + this ) ) || 0;
				}
			});
			return size;
		}

		$.fn[ "inner" + name ] = function( size ) {
			if ( size === undefined ) {
				return orig[ "inner" + name ].call( this );
			}

			return this.each(function() {
				$( this ).css( type, reduce( this, size ) + "px" );
			});
		};

		$.fn[ "outer" + name] = function( size, margin ) {
			if ( typeof size !== "number" ) {
				return orig[ "outer" + name ].call( this, size );
			}

			return this.each(function() {
				$( this).css( type, reduce( this, size, true, margin ) + "px" );
			});
		};
	});
}

// support: jQuery <1.8
if ( !$.fn.addBack ) {
	$.fn.addBack = function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter( selector )
		);
	};
}

// support: jQuery 1.6.1, 1.6.2 (http://bugs.jquery.com/ticket/9413)
if ( $( "<a>" ).data( "a-b", "a" ).removeData( "a-b" ).data( "a-b" ) ) {
	$.fn.removeData = (function( removeData ) {
		return function( key ) {
			if ( arguments.length ) {
				return removeData.call( this, $.camelCase( key ) );
			} else {
				return removeData.call( this );
			}
		};
	})( $.fn.removeData );
}





// deprecated
$.ui.ie = !!/msie [\w.]+/.exec( navigator.userAgent.toLowerCase() );

$.support.selectstart = "onselectstart" in document.createElement( "div" );
$.fn.extend({
	disableSelection: function() {
		return this.bind( ( $.support.selectstart ? "selectstart" : "mousedown" ) +
			".ui-disableSelection", function( event ) {
				event.preventDefault();
			});
	},

	enableSelection: function() {
		return this.unbind( ".ui-disableSelection" );
	}
});

$.extend( $.ui, {
	// $.ui.plugin is deprecated. Use $.widget() extensions instead.
	plugin: {
		add: function( module, option, set ) {
			var i,
				proto = $.ui[ module ].prototype;
			for ( i in set ) {
				proto.plugins[ i ] = proto.plugins[ i ] || [];
				proto.plugins[ i ].push( [ option, set[ i ] ] );
			}
		},
		call: function( instance, name, args ) {
			var i,
				set = instance.plugins[ name ];
			if ( !set || !instance.element[ 0 ].parentNode || instance.element[ 0 ].parentNode.nodeType === 11 ) {
				return;
			}

			for ( i = 0; i < set.length; i++ ) {
				if ( instance.options[ set[ i ][ 0 ] ] ) {
					set[ i ][ 1 ].apply( instance.element, args );
				}
			}
		}
	},

	// only used by resizable
	hasScroll: function( el, a ) {

		//If overflow is hidden, the element might have extra content, but the user wants to hide it
		if ( $( el ).css( "overflow" ) === "hidden") {
			return false;
		}

		var scroll = ( a && a === "left" ) ? "scrollLeft" : "scrollTop",
			has = false;

		if ( el[ scroll ] > 0 ) {
			return true;
		}

		// TODO: determine which cases actually cause this to happen
		// if the element doesn't have the scroll set, see if it's possible to
		// set the scroll
		el[ scroll ] = 1;
		has = ( el[ scroll ] > 0 );
		el[ scroll ] = 0;
		return has;
	}
});

})( jQuery );

/*!
 * jQuery UI Widget 1.10.4
 * http://jqueryui.com
 *
 * Copyright 2014 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/jQuery.widget/
 */
(function( $, undefined ) {

var uuid = 0,
	slice = Array.prototype.slice,
	_cleanData = $.cleanData;
$.cleanData = function( elems ) {
	for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
		try {
			$( elem ).triggerHandler( "remove" );
		// http://bugs.jquery.com/ticket/8235
		} catch( e ) {}
	}
	_cleanData( elems );
};

$.widget = function( name, base, prototype ) {
	var fullName, existingConstructor, constructor, basePrototype,
		// proxiedPrototype allows the provided prototype to remain unmodified
		// so that it can be used as a mixin for multiple widgets (#8876)
		proxiedPrototype = {},
		namespace = name.split( "." )[ 0 ];

	name = name.split( "." )[ 1 ];
	fullName = namespace + "-" + name;

	if ( !prototype ) {
		prototype = base;
		base = $.Widget;
	}

	// create selector for plugin
	$.expr[ ":" ][ fullName.toLowerCase() ] = function( elem ) {
		return !!$.data( elem, fullName );
	};

	$[ namespace ] = $[ namespace ] || {};
	existingConstructor = $[ namespace ][ name ];
	constructor = $[ namespace ][ name ] = function( options, element ) {
		// allow instantiation without "new" keyword
		if ( !this._createWidget ) {
			return new constructor( options, element );
		}

		// allow instantiation without initializing for simple inheritance
		// must use "new" keyword (the code above always passes args)
		if ( arguments.length ) {
			this._createWidget( options, element );
		}
	};
	// extend with the existing constructor to carry over any static properties
	$.extend( constructor, existingConstructor, {
		version: prototype.version,
		// copy the object used to create the prototype in case we need to
		// redefine the widget later
		_proto: $.extend( {}, prototype ),
		// track widgets that inherit from this widget in case this widget is
		// redefined after a widget inherits from it
		_childConstructors: []
	});

	basePrototype = new base();
	// we need to make the options hash a property directly on the new instance
	// otherwise we'll modify the options hash on the prototype that we're
	// inheriting from
	basePrototype.options = $.widget.extend( {}, basePrototype.options );
	$.each( prototype, function( prop, value ) {
		if ( !$.isFunction( value ) ) {
			proxiedPrototype[ prop ] = value;
			return;
		}
		proxiedPrototype[ prop ] = (function() {
			var _super = function() {
					return base.prototype[ prop ].apply( this, arguments );
				},
				_superApply = function( args ) {
					return base.prototype[ prop ].apply( this, args );
				};
			return function() {
				var __super = this._super,
					__superApply = this._superApply,
					returnValue;

				this._super = _super;
				this._superApply = _superApply;

				returnValue = value.apply( this, arguments );

				this._super = __super;
				this._superApply = __superApply;

				return returnValue;
			};
		})();
	});
	constructor.prototype = $.widget.extend( basePrototype, {
		// TODO: remove support for widgetEventPrefix
		// always use the name + a colon as the prefix, e.g., draggable:start
		// don't prefix for widgets that aren't DOM-based
		widgetEventPrefix: existingConstructor ? (basePrototype.widgetEventPrefix || name) : name
	}, proxiedPrototype, {
		constructor: constructor,
		namespace: namespace,
		widgetName: name,
		widgetFullName: fullName
	});

	// If this widget is being redefined then we need to find all widgets that
	// are inheriting from it and redefine all of them so that they inherit from
	// the new version of this widget. We're essentially trying to replace one
	// level in the prototype chain.
	if ( existingConstructor ) {
		$.each( existingConstructor._childConstructors, function( i, child ) {
			var childPrototype = child.prototype;

			// redefine the child widget using the same prototype that was
			// originally used, but inherit from the new version of the base
			$.widget( childPrototype.namespace + "." + childPrototype.widgetName, constructor, child._proto );
		});
		// remove the list of existing child constructors from the old constructor
		// so the old child constructors can be garbage collected
		delete existingConstructor._childConstructors;
	} else {
		base._childConstructors.push( constructor );
	}

	$.widget.bridge( name, constructor );
};

$.widget.extend = function( target ) {
	var input = slice.call( arguments, 1 ),
		inputIndex = 0,
		inputLength = input.length,
		key,
		value;
	for ( ; inputIndex < inputLength; inputIndex++ ) {
		for ( key in input[ inputIndex ] ) {
			value = input[ inputIndex ][ key ];
			if ( input[ inputIndex ].hasOwnProperty( key ) && value !== undefined ) {
				// Clone objects
				if ( $.isPlainObject( value ) ) {
					target[ key ] = $.isPlainObject( target[ key ] ) ?
						$.widget.extend( {}, target[ key ], value ) :
						// Don't extend strings, arrays, etc. with objects
						$.widget.extend( {}, value );
				// Copy everything else by reference
				} else {
					target[ key ] = value;
				}
			}
		}
	}
	return target;
};

$.widget.bridge = function( name, object ) {
	var fullName = object.prototype.widgetFullName || name;
	$.fn[ name ] = function( options ) {
		var isMethodCall = typeof options === "string",
			args = slice.call( arguments, 1 ),
			returnValue = this;

		// allow multiple hashes to be passed on init
		options = !isMethodCall && args.length ?
			$.widget.extend.apply( null, [ options ].concat(args) ) :
			options;

		if ( isMethodCall ) {
			this.each(function() {
				var methodValue,
					instance = $.data( this, fullName );
				if ( !instance ) {
					return $.error( "cannot call methods on " + name + " prior to initialization; " +
						"attempted to call method '" + options + "'" );
				}
				if ( !$.isFunction( instance[options] ) || options.charAt( 0 ) === "_" ) {
					return $.error( "no such method '" + options + "' for " + name + " widget instance" );
				}
				methodValue = instance[ options ].apply( instance, args );
				if ( methodValue !== instance && methodValue !== undefined ) {
					returnValue = methodValue && methodValue.jquery ?
						returnValue.pushStack( methodValue.get() ) :
						methodValue;
					return false;
				}
			});
		} else {
			this.each(function() {
				var instance = $.data( this, fullName );
				if ( instance ) {
					instance.option( options || {} )._init();
				} else {
					$.data( this, fullName, new object( options, this ) );
				}
			});
		}

		return returnValue;
	};
};

$.Widget = function( /* options, element */ ) {};
$.Widget._childConstructors = [];

$.Widget.prototype = {
	widgetName: "widget",
	widgetEventPrefix: "",
	defaultElement: "<div>",
	options: {
		disabled: false,

		// callbacks
		create: null
	},
	_createWidget: function( options, element ) {
		element = $( element || this.defaultElement || this )[ 0 ];
		this.element = $( element );
		this.uuid = uuid++;
		this.eventNamespace = "." + this.widgetName + this.uuid;
		this.options = $.widget.extend( {},
			this.options,
			this._getCreateOptions(),
			options );

		this.bindings = $();
		this.hoverable = $();
		this.focusable = $();

		if ( element !== this ) {
			$.data( element, this.widgetFullName, this );
			this._on( true, this.element, {
				remove: function( event ) {
					if ( event.target === element ) {
						this.destroy();
					}
				}
			});
			this.document = $( element.style ?
				// element within the document
				element.ownerDocument :
				// element is window or document
				element.document || element );
			this.window = $( this.document[0].defaultView || this.document[0].parentWindow );
		}

		this._create();
		this._trigger( "create", null, this._getCreateEventData() );
		this._init();
	},
	_getCreateOptions: $.noop,
	_getCreateEventData: $.noop,
	_create: $.noop,
	_init: $.noop,

	destroy: function() {
		this._destroy();
		// we can probably remove the unbind calls in 2.0
		// all event bindings should go through this._on()
		this.element
			.unbind( this.eventNamespace )
			// 1.9 BC for #7810
			// TODO remove dual storage
			.removeData( this.widgetName )
			.removeData( this.widgetFullName )
			// support: jquery <1.6.3
			// http://bugs.jquery.com/ticket/9413
			.removeData( $.camelCase( this.widgetFullName ) );
		this.widget()
			.unbind( this.eventNamespace )
			.removeAttr( "aria-disabled" )
			.removeClass(
				this.widgetFullName + "-disabled " +
				"ui-state-disabled" );

		// clean up events and states
		this.bindings.unbind( this.eventNamespace );
		this.hoverable.removeClass( "ui-state-hover" );
		this.focusable.removeClass( "ui-state-focus" );
	},
	_destroy: $.noop,

	widget: function() {
		return this.element;
	},

	option: function( key, value ) {
		var options = key,
			parts,
			curOption,
			i;

		if ( arguments.length === 0 ) {
			// don't return a reference to the internal hash
			return $.widget.extend( {}, this.options );
		}

		if ( typeof key === "string" ) {
			// handle nested keys, e.g., "foo.bar" => { foo: { bar: ___ } }
			options = {};
			parts = key.split( "." );
			key = parts.shift();
			if ( parts.length ) {
				curOption = options[ key ] = $.widget.extend( {}, this.options[ key ] );
				for ( i = 0; i < parts.length - 1; i++ ) {
					curOption[ parts[ i ] ] = curOption[ parts[ i ] ] || {};
					curOption = curOption[ parts[ i ] ];
				}
				key = parts.pop();
				if ( arguments.length === 1 ) {
					return curOption[ key ] === undefined ? null : curOption[ key ];
				}
				curOption[ key ] = value;
			} else {
				if ( arguments.length === 1 ) {
					return this.options[ key ] === undefined ? null : this.options[ key ];
				}
				options[ key ] = value;
			}
		}

		this._setOptions( options );

		return this;
	},
	_setOptions: function( options ) {
		var key;

		for ( key in options ) {
			this._setOption( key, options[ key ] );
		}

		return this;
	},
	_setOption: function( key, value ) {
		this.options[ key ] = value;

		if ( key === "disabled" ) {
			this.widget()
				.toggleClass( this.widgetFullName + "-disabled ui-state-disabled", !!value )
				.attr( "aria-disabled", value );
			this.hoverable.removeClass( "ui-state-hover" );
			this.focusable.removeClass( "ui-state-focus" );
		}

		return this;
	},

	enable: function() {
		return this._setOption( "disabled", false );
	},
	disable: function() {
		return this._setOption( "disabled", true );
	},

	_on: function( suppressDisabledCheck, element, handlers ) {
		var delegateElement,
			instance = this;

		// no suppressDisabledCheck flag, shuffle arguments
		if ( typeof suppressDisabledCheck !== "boolean" ) {
			handlers = element;
			element = suppressDisabledCheck;
			suppressDisabledCheck = false;
		}

		// no element argument, shuffle and use this.element
		if ( !handlers ) {
			handlers = element;
			element = this.element;
			delegateElement = this.widget();
		} else {
			// accept selectors, DOM elements
			element = delegateElement = $( element );
			this.bindings = this.bindings.add( element );
		}

		$.each( handlers, function( event, handler ) {
			function handlerProxy() {
				// allow widgets to customize the disabled handling
				// - disabled as an array instead of boolean
				// - disabled class as method for disabling individual parts
				if ( !suppressDisabledCheck &&
						( instance.options.disabled === true ||
							$( this ).hasClass( "ui-state-disabled" ) ) ) {
					return;
				}
				return ( typeof handler === "string" ? instance[ handler ] : handler )
					.apply( instance, arguments );
			}

			// copy the guid so direct unbinding works
			if ( typeof handler !== "string" ) {
				handlerProxy.guid = handler.guid =
					handler.guid || handlerProxy.guid || $.guid++;
			}

			var match = event.match( /^(\w+)\s*(.*)$/ ),
				eventName = match[1] + instance.eventNamespace,
				selector = match[2];
			if ( selector ) {
				delegateElement.delegate( selector, eventName, handlerProxy );
			} else {
				element.bind( eventName, handlerProxy );
			}
		});
	},

	_off: function( element, eventName ) {
		eventName = (eventName || "").split( " " ).join( this.eventNamespace + " " ) + this.eventNamespace;
		element.unbind( eventName ).undelegate( eventName );
	},

	_delay: function( handler, delay ) {
		function handlerProxy() {
			return ( typeof handler === "string" ? instance[ handler ] : handler )
				.apply( instance, arguments );
		}
		var instance = this;
		return setTimeout( handlerProxy, delay || 0 );
	},

	_hoverable: function( element ) {
		this.hoverable = this.hoverable.add( element );
		this._on( element, {
			mouseenter: function( event ) {
				$( event.currentTarget ).addClass( "ui-state-hover" );
			},
			mouseleave: function( event ) {
				$( event.currentTarget ).removeClass( "ui-state-hover" );
			}
		});
	},

	_focusable: function( element ) {
		this.focusable = this.focusable.add( element );
		this._on( element, {
			focusin: function( event ) {
				$( event.currentTarget ).addClass( "ui-state-focus" );
			},
			focusout: function( event ) {
				$( event.currentTarget ).removeClass( "ui-state-focus" );
			}
		});
	},

	_trigger: function( type, event, data ) {
		var prop, orig,
			callback = this.options[ type ];

		data = data || {};
		event = $.Event( event );
		event.type = ( type === this.widgetEventPrefix ?
			type :
			this.widgetEventPrefix + type ).toLowerCase();
		// the original event may come from any element
		// so we need to reset the target on the new event
		event.target = this.element[ 0 ];

		// copy original event properties over to the new event
		orig = event.originalEvent;
		if ( orig ) {
			for ( prop in orig ) {
				if ( !( prop in event ) ) {
					event[ prop ] = orig[ prop ];
				}
			}
		}

		this.element.trigger( event, data );
		return !( $.isFunction( callback ) &&
			callback.apply( this.element[0], [ event ].concat( data ) ) === false ||
			event.isDefaultPrevented() );
	}
};

$.each( { show: "fadeIn", hide: "fadeOut" }, function( method, defaultEffect ) {
	$.Widget.prototype[ "_" + method ] = function( element, options, callback ) {
		if ( typeof options === "string" ) {
			options = { effect: options };
		}
		var hasOptions,
			effectName = !options ?
				method :
				options === true || typeof options === "number" ?
					defaultEffect :
					options.effect || defaultEffect;
		options = options || {};
		if ( typeof options === "number" ) {
			options = { duration: options };
		}
		hasOptions = !$.isEmptyObject( options );
		options.complete = callback;
		if ( options.delay ) {
			element.delay( options.delay );
		}
		if ( hasOptions && $.effects && $.effects.effect[ effectName ] ) {
			element[ method ]( options );
		} else if ( effectName !== method && element[ effectName ] ) {
			element[ effectName ]( options.duration, options.easing, callback );
		} else {
			element.queue(function( next ) {
				$( this )[ method ]();
				if ( callback ) {
					callback.call( element[ 0 ] );
				}
				next();
			});
		}
	};
});

})( jQuery );

/*!
 * jQuery UI Mouse 1.10.4
 * http://jqueryui.com
 *
 * Copyright 2014 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/mouse/
 *
 * Depends:
 *	jquery.ui.widget.js
 */
(function( $, undefined ) {

var mouseHandled = false;
$( document ).mouseup( function() {
	mouseHandled = false;
});

$.widget("ui.mouse", {
	version: "1.10.4",
	options: {
		cancel: "input,textarea,button,select,option",
		distance: 1,
		delay: 0
	},
	_mouseInit: function() {
		var that = this;

		this.element
			.bind("mousedown."+this.widgetName, function(event) {
				return that._mouseDown(event);
			})
			.bind("click."+this.widgetName, function(event) {
				if (true === $.data(event.target, that.widgetName + ".preventClickEvent")) {
					$.removeData(event.target, that.widgetName + ".preventClickEvent");
					event.stopImmediatePropagation();
					return false;
				}
			});

		this.started = false;
	},

	// TODO: make sure destroying one instance of mouse doesn't mess with
	// other instances of mouse
	_mouseDestroy: function() {
		this.element.unbind("."+this.widgetName);
		if ( this._mouseMoveDelegate ) {
			$(document)
				.unbind("mousemove."+this.widgetName, this._mouseMoveDelegate)
				.unbind("mouseup."+this.widgetName, this._mouseUpDelegate);
		}
	},

	_mouseDown: function(event) {
		// don't let more than one widget handle mouseStart
		if( mouseHandled ) { return; }

		// we may have missed mouseup (out of window)
		(this._mouseStarted && this._mouseUp(event));

		this._mouseDownEvent = event;

		var that = this,
			btnIsLeft = (event.which === 1),
			// event.target.nodeName works around a bug in IE 8 with
			// disabled inputs (#7620)
			elIsCancel = (typeof this.options.cancel === "string" && event.target.nodeName ? $(event.target).closest(this.options.cancel).length : false);
		if (!btnIsLeft || elIsCancel || !this._mouseCapture(event)) {
			return true;
		}

		this.mouseDelayMet = !this.options.delay;
		if (!this.mouseDelayMet) {
			this._mouseDelayTimer = setTimeout(function() {
				that.mouseDelayMet = true;
			}, this.options.delay);
		}

		if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
			this._mouseStarted = (this._mouseStart(event) !== false);
			if (!this._mouseStarted) {
				event.preventDefault();
				return true;
			}
		}

		// Click event may never have fired (Gecko & Opera)
		if (true === $.data(event.target, this.widgetName + ".preventClickEvent")) {
			$.removeData(event.target, this.widgetName + ".preventClickEvent");
		}

		// these delegates are required to keep context
		this._mouseMoveDelegate = function(event) {
			return that._mouseMove(event);
		};
		this._mouseUpDelegate = function(event) {
			return that._mouseUp(event);
		};
		$(document)
			.bind("mousemove."+this.widgetName, this._mouseMoveDelegate)
			.bind("mouseup."+this.widgetName, this._mouseUpDelegate);

		event.preventDefault();

		mouseHandled = true;
		return true;
	},

	_mouseMove: function(event) {
		// IE mouseup check - mouseup happened when mouse was out of window
		if ($.ui.ie && ( !document.documentMode || document.documentMode < 9 ) && !event.button) {
			return this._mouseUp(event);
		}

		if (this._mouseStarted) {
			this._mouseDrag(event);
			return event.preventDefault();
		}

		if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
			this._mouseStarted =
				(this._mouseStart(this._mouseDownEvent, event) !== false);
			(this._mouseStarted ? this._mouseDrag(event) : this._mouseUp(event));
		}

		return !this._mouseStarted;
	},

	_mouseUp: function(event) {
		$(document)
			.unbind("mousemove."+this.widgetName, this._mouseMoveDelegate)
			.unbind("mouseup."+this.widgetName, this._mouseUpDelegate);

		if (this._mouseStarted) {
			this._mouseStarted = false;

			if (event.target === this._mouseDownEvent.target) {
				$.data(event.target, this.widgetName + ".preventClickEvent", true);
			}

			this._mouseStop(event);
		}

		return false;
	},

	_mouseDistanceMet: function(event) {
		return (Math.max(
				Math.abs(this._mouseDownEvent.pageX - event.pageX),
				Math.abs(this._mouseDownEvent.pageY - event.pageY)
			) >= this.options.distance
		);
	},

	_mouseDelayMet: function(/* event */) {
		return this.mouseDelayMet;
	},

	// These are placeholder methods, to be overriden by extending plugin
	_mouseStart: function(/* event */) {},
	_mouseDrag: function(/* event */) {},
	_mouseStop: function(/* event */) {},
	_mouseCapture: function(/* event */) { return true; }
});

})(jQuery);

/*!
 * jQuery UI Draggable 1.10.4
 * http://jqueryui.com
 *
 * Copyright 2014 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/draggable/
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.mouse.js
 *	jquery.ui.widget.js
 */
(function( $, undefined ) {

$.widget("ui.draggable", $.ui.mouse, {
	version: "1.10.4",
	widgetEventPrefix: "drag",
	options: {
		addClasses: true,
		appendTo: "parent",
		axis: false,
		connectToSortable: false,
		containment: false,
		cursor: "auto",
		cursorAt: false,
		grid: false,
		handle: false,
		helper: "original",
		iframeFix: false,
		opacity: false,
		refreshPositions: false,
		revert: false,
		revertDuration: 500,
		scope: "default",
		scroll: true,
		scrollSensitivity: 20,
		scrollSpeed: 20,
		snap: false,
		snapMode: "both",
		snapTolerance: 20,
		stack: false,
		zIndex: false,

		// callbacks
		drag: null,
		start: null,
		stop: null
	},
	_create: function() {

		if (this.options.helper === "original" && !(/^(?:r|a|f)/).test(this.element.css("position"))) {
			this.element[0].style.position = "relative";
		}
		if (this.options.addClasses){
			this.element.addClass("ui-draggable");
		}
		if (this.options.disabled){
			this.element.addClass("ui-draggable-disabled");
		}

		this._mouseInit();

	},

	_destroy: function() {
		this.element.removeClass( "ui-draggable ui-draggable-dragging ui-draggable-disabled" );
		this._mouseDestroy();
	},

	_mouseCapture: function(event) {

		var o = this.options;

		// among others, prevent a drag on a resizable-handle
		if (this.helper || o.disabled || $(event.target).closest(".ui-resizable-handle").length > 0) {
			return false;
		}

		//Quit if we're not on a valid handle
		this.handle = this._getHandle(event);
		if (!this.handle) {
			return false;
		}

		$(o.iframeFix === true ? "iframe" : o.iframeFix).each(function() {
			$("<div class='ui-draggable-iframeFix' style='background: #fff;'></div>")
			.css({
				width: this.offsetWidth+"px", height: this.offsetHeight+"px",
				position: "absolute", opacity: "0.001", zIndex: 1000
			})
			.css($(this).offset())
			.appendTo("body");
		});

		return true;

	},

	_mouseStart: function(event) {

		var o = this.options;

		//Create and append the visible helper
		this.helper = this._createHelper(event);

		this.helper.addClass("ui-draggable-dragging");

		//Cache the helper size
		this._cacheHelperProportions();

		//If ddmanager is used for droppables, set the global draggable
		if($.ui.ddmanager) {
			$.ui.ddmanager.current = this;
		}

		/*
		 * - Position generation -
		 * This block generates everything position related - it's the core of draggables.
		 */

		//Cache the margins of the original element
		this._cacheMargins();

		//Store the helper's css position
		this.cssPosition = this.helper.css( "position" );
		this.scrollParent = this.helper.scrollParent();
		this.offsetParent = this.helper.offsetParent();
		this.offsetParentCssPosition = this.offsetParent.css( "position" );

		//The element's absolute position on the page minus margins
		this.offset = this.positionAbs = this.element.offset();
		this.offset = {
			top: this.offset.top - this.margins.top,
			left: this.offset.left - this.margins.left
		};

		//Reset scroll cache
		this.offset.scroll = false;

		$.extend(this.offset, {
			click: { //Where the click happened, relative to the element
				left: event.pageX - this.offset.left,
				top: event.pageY - this.offset.top
			},
			parent: this._getParentOffset(),
			relative: this._getRelativeOffset() //This is a relative to absolute position minus the actual position calculation - only used for relative positioned helper
		});

		//Generate the original position
		this.originalPosition = this.position = this._generatePosition(event);
		this.originalPageX = event.pageX;
		this.originalPageY = event.pageY;

		//Adjust the mouse offset relative to the helper if "cursorAt" is supplied
		(o.cursorAt && this._adjustOffsetFromHelper(o.cursorAt));

		//Set a containment if given in the options
		this._setContainment();

		//Trigger event + callbacks
		if(this._trigger("start", event) === false) {
			this._clear();
			return false;
		}

		//Recache the helper size
		this._cacheHelperProportions();

		//Prepare the droppable offsets
		if ($.ui.ddmanager && !o.dropBehaviour) {
			$.ui.ddmanager.prepareOffsets(this, event);
		}


		this._mouseDrag(event, true); //Execute the drag once - this causes the helper not to be visible before getting its correct position

		//If the ddmanager is used for droppables, inform the manager that dragging has started (see #5003)
		if ( $.ui.ddmanager ) {
			$.ui.ddmanager.dragStart(this, event);
		}

		return true;
	},

	_mouseDrag: function(event, noPropagation) {
		// reset any necessary cached properties (see #5009)
		if ( this.offsetParentCssPosition === "fixed" ) {
			this.offset.parent = this._getParentOffset();
		}

		//Compute the helpers position
		this.position = this._generatePosition(event);
		this.positionAbs = this._convertPositionTo("absolute");

		//Call plugins and callbacks and use the resulting position if something is returned
		if (!noPropagation) {
			var ui = this._uiHash();
			if(this._trigger("drag", event, ui) === false) {
				this._mouseUp({});
				return false;
			}
			this.position = ui.position;
		}

		if(!this.options.axis || this.options.axis !== "y") {
			this.helper[0].style.left = this.position.left+"px";
		}
		if(!this.options.axis || this.options.axis !== "x") {
			this.helper[0].style.top = this.position.top+"px";
		}
		if($.ui.ddmanager) {
			$.ui.ddmanager.drag(this, event);
		}

		return false;
	},

	_mouseStop: function(event) {

		//If we are using droppables, inform the manager about the drop
		var that = this,
			dropped = false;
		if ($.ui.ddmanager && !this.options.dropBehaviour) {
			dropped = $.ui.ddmanager.drop(this, event);
		}

		//if a drop comes from outside (a sortable)
		if(this.dropped) {
			dropped = this.dropped;
			this.dropped = false;
		}

		//if the original element is no longer in the DOM don't bother to continue (see #8269)
		if ( this.options.helper === "original" && !$.contains( this.element[ 0 ].ownerDocument, this.element[ 0 ] ) ) {
			return false;
		}

		if((this.options.revert === "invalid" && !dropped) || (this.options.revert === "valid" && dropped) || this.options.revert === true || ($.isFunction(this.options.revert) && this.options.revert.call(this.element, dropped))) {
			$(this.helper).animate(this.originalPosition, parseInt(this.options.revertDuration, 10), function() {
				if(that._trigger("stop", event) !== false) {
					that._clear();
				}
			});
		} else {
			if(this._trigger("stop", event) !== false) {
				this._clear();
			}
		}

		return false;
	},

	_mouseUp: function(event) {
		//Remove frame helpers
		$("div.ui-draggable-iframeFix").each(function() {
			this.parentNode.removeChild(this);
		});

		//If the ddmanager is used for droppables, inform the manager that dragging has stopped (see #5003)
		if( $.ui.ddmanager ) {
			$.ui.ddmanager.dragStop(this, event);
		}

		return $.ui.mouse.prototype._mouseUp.call(this, event);
	},

	cancel: function() {

		if(this.helper.is(".ui-draggable-dragging")) {
			this._mouseUp({});
		} else {
			this._clear();
		}

		return this;

	},

	_getHandle: function(event) {
		return this.options.handle ?
			!!$( event.target ).closest( this.element.find( this.options.handle ) ).length :
			true;
	},

	_createHelper: function(event) {

		var o = this.options,
			helper = $.isFunction(o.helper) ? $(o.helper.apply(this.element[0], [event])) : (o.helper === "clone" ? this.element.clone().removeAttr("id") : this.element);

		if(!helper.parents("body").length) {
			helper.appendTo((o.appendTo === "parent" ? this.element[0].parentNode : o.appendTo));
		}

		if(helper[0] !== this.element[0] && !(/(fixed|absolute)/).test(helper.css("position"))) {
			helper.css("position", "absolute");
		}

		return helper;

	},

	_adjustOffsetFromHelper: function(obj) {
		if (typeof obj === "string") {
			obj = obj.split(" ");
		}
		if ($.isArray(obj)) {
			obj = {left: +obj[0], top: +obj[1] || 0};
		}
		if ("left" in obj) {
			this.offset.click.left = obj.left + this.margins.left;
		}
		if ("right" in obj) {
			this.offset.click.left = this.helperProportions.width - obj.right + this.margins.left;
		}
		if ("top" in obj) {
			this.offset.click.top = obj.top + this.margins.top;
		}
		if ("bottom" in obj) {
			this.offset.click.top = this.helperProportions.height - obj.bottom + this.margins.top;
		}
	},

	_getParentOffset: function() {

		//Get the offsetParent and cache its position
		var po = this.offsetParent.offset();

		// This is a special case where we need to modify a offset calculated on start, since the following happened:
		// 1. The position of the helper is absolute, so it's position is calculated based on the next positioned parent
		// 2. The actual offset parent is a child of the scroll parent, and the scroll parent isn't the document, which means that
		//    the scroll is included in the initial calculation of the offset of the parent, and never recalculated upon drag
		if(this.cssPosition === "absolute" && this.scrollParent[0] !== document && $.contains(this.scrollParent[0], this.offsetParent[0])) {
			po.left += this.scrollParent.scrollLeft();
			po.top += this.scrollParent.scrollTop();
		}

		//This needs to be actually done for all browsers, since pageX/pageY includes this information
		//Ugly IE fix
		if((this.offsetParent[0] === document.body) ||
			(this.offsetParent[0].tagName && this.offsetParent[0].tagName.toLowerCase() === "html" && $.ui.ie)) {
			po = { top: 0, left: 0 };
		}

		return {
			top: po.top + (parseInt(this.offsetParent.css("borderTopWidth"),10) || 0),
			left: po.left + (parseInt(this.offsetParent.css("borderLeftWidth"),10) || 0)
		};

	},

	_getRelativeOffset: function() {

		if(this.cssPosition === "relative") {
			var p = this.element.position();
			return {
				top: p.top - (parseInt(this.helper.css("top"),10) || 0) + this.scrollParent.scrollTop(),
				left: p.left - (parseInt(this.helper.css("left"),10) || 0) + this.scrollParent.scrollLeft()
			};
		} else {
			return { top: 0, left: 0 };
		}

	},

	_cacheMargins: function() {
		this.margins = {
			left: (parseInt(this.element.css("marginLeft"),10) || 0),
			top: (parseInt(this.element.css("marginTop"),10) || 0),
			right: (parseInt(this.element.css("marginRight"),10) || 0),
			bottom: (parseInt(this.element.css("marginBottom"),10) || 0)
		};
	},

	_cacheHelperProportions: function() {
		this.helperProportions = {
			width: this.helper.outerWidth(),
			height: this.helper.outerHeight()
		};
	},

	_setContainment: function() {

		var over, c, ce,
			o = this.options;

		if ( !o.containment ) {
			this.containment = null;
			return;
		}

		if ( o.containment === "window" ) {
			this.containment = [
				$( window ).scrollLeft() - this.offset.relative.left - this.offset.parent.left,
				$( window ).scrollTop() - this.offset.relative.top - this.offset.parent.top,
				$( window ).scrollLeft() + $( window ).width() - this.helperProportions.width - this.margins.left,
				$( window ).scrollTop() + ( $( window ).height() || document.body.parentNode.scrollHeight ) - this.helperProportions.height - this.margins.top
			];
			return;
		}

		if ( o.containment === "document") {
			this.containment = [
				0,
				0,
				$( document ).width() - this.helperProportions.width - this.margins.left,
				( $( document ).height() || document.body.parentNode.scrollHeight ) - this.helperProportions.height - this.margins.top
			];
			return;
		}

		if ( o.containment.constructor === Array ) {
			this.containment = o.containment;
			return;
		}

		if ( o.containment === "parent" ) {
			o.containment = this.helper[ 0 ].parentNode;
		}

		c = $( o.containment );
		ce = c[ 0 ];

		if( !ce ) {
			return;
		}

		over = c.css( "overflow" ) !== "hidden";

		this.containment = [
			( parseInt( c.css( "borderLeftWidth" ), 10 ) || 0 ) + ( parseInt( c.css( "paddingLeft" ), 10 ) || 0 ),
			( parseInt( c.css( "borderTopWidth" ), 10 ) || 0 ) + ( parseInt( c.css( "paddingTop" ), 10 ) || 0 ) ,
			( over ? Math.max( ce.scrollWidth, ce.offsetWidth ) : ce.offsetWidth ) - ( parseInt( c.css( "borderRightWidth" ), 10 ) || 0 ) - ( parseInt( c.css( "paddingRight" ), 10 ) || 0 ) - this.helperProportions.width - this.margins.left - this.margins.right,
			( over ? Math.max( ce.scrollHeight, ce.offsetHeight ) : ce.offsetHeight ) - ( parseInt( c.css( "borderBottomWidth" ), 10 ) || 0 ) - ( parseInt( c.css( "paddingBottom" ), 10 ) || 0 ) - this.helperProportions.height - this.margins.top  - this.margins.bottom
		];
		this.relative_container = c;
	},

	_convertPositionTo: function(d, pos) {

		if(!pos) {
			pos = this.position;
		}

		var mod = d === "absolute" ? 1 : -1,
			scroll = this.cssPosition === "absolute" && !( this.scrollParent[ 0 ] !== document && $.contains( this.scrollParent[ 0 ], this.offsetParent[ 0 ] ) ) ? this.offsetParent : this.scrollParent;

		//Cache the scroll
		if (!this.offset.scroll) {
			this.offset.scroll = {top : scroll.scrollTop(), left : scroll.scrollLeft()};
		}

		return {
			top: (
				pos.top	+																// The absolute mouse position
				this.offset.relative.top * mod +										// Only for relative positioned nodes: Relative offset from element to offset parent
				this.offset.parent.top * mod -										// The offsetParent's offset without borders (offset + border)
				( ( this.cssPosition === "fixed" ? -this.scrollParent.scrollTop() : this.offset.scroll.top ) * mod )
			),
			left: (
				pos.left +																// The absolute mouse position
				this.offset.relative.left * mod +										// Only for relative positioned nodes: Relative offset from element to offset parent
				this.offset.parent.left * mod	-										// The offsetParent's offset without borders (offset + border)
				( ( this.cssPosition === "fixed" ? -this.scrollParent.scrollLeft() : this.offset.scroll.left ) * mod )
			)
		};

	},

	_generatePosition: function(event) {

		var containment, co, top, left,
			o = this.options,
			scroll = this.cssPosition === "absolute" && !( this.scrollParent[ 0 ] !== document && $.contains( this.scrollParent[ 0 ], this.offsetParent[ 0 ] ) ) ? this.offsetParent : this.scrollParent,
			pageX = event.pageX,
			pageY = event.pageY;

		//Cache the scroll
		if (!this.offset.scroll) {
			this.offset.scroll = {top : scroll.scrollTop(), left : scroll.scrollLeft()};
		}

		/*
		 * - Position constraining -
		 * Constrain the position to a mix of grid, containment.
		 */

		// If we are not dragging yet, we won't check for options
		if ( this.originalPosition ) {
			if ( this.containment ) {
				if ( this.relative_container ){
					co = this.relative_container.offset();
					containment = [
						this.containment[ 0 ] + co.left,
						this.containment[ 1 ] + co.top,
						this.containment[ 2 ] + co.left,
						this.containment[ 3 ] + co.top
					];
				}
				else {
					containment = this.containment;
				}

				if(event.pageX - this.offset.click.left < containment[0]) {
					pageX = containment[0] + this.offset.click.left;
				}
				if(event.pageY - this.offset.click.top < containment[1]) {
					pageY = containment[1] + this.offset.click.top;
				}
				if(event.pageX - this.offset.click.left > containment[2]) {
					pageX = containment[2] + this.offset.click.left;
				}
				if(event.pageY - this.offset.click.top > containment[3]) {
					pageY = containment[3] + this.offset.click.top;
				}
			}

			if(o.grid) {
				//Check for grid elements set to 0 to prevent divide by 0 error causing invalid argument errors in IE (see ticket #6950)
				top = o.grid[1] ? this.originalPageY + Math.round((pageY - this.originalPageY) / o.grid[1]) * o.grid[1] : this.originalPageY;
				pageY = containment ? ((top - this.offset.click.top >= containment[1] || top - this.offset.click.top > containment[3]) ? top : ((top - this.offset.click.top >= containment[1]) ? top - o.grid[1] : top + o.grid[1])) : top;

				left = o.grid[0] ? this.originalPageX + Math.round((pageX - this.originalPageX) / o.grid[0]) * o.grid[0] : this.originalPageX;
				pageX = containment ? ((left - this.offset.click.left >= containment[0] || left - this.offset.click.left > containment[2]) ? left : ((left - this.offset.click.left >= containment[0]) ? left - o.grid[0] : left + o.grid[0])) : left;
			}

		}

		return {
			top: (
				pageY -																	// The absolute mouse position
				this.offset.click.top	-												// Click offset (relative to the element)
				this.offset.relative.top -												// Only for relative positioned nodes: Relative offset from element to offset parent
				this.offset.parent.top +												// The offsetParent's offset without borders (offset + border)
				( this.cssPosition === "fixed" ? -this.scrollParent.scrollTop() : this.offset.scroll.top )
			),
			left: (
				pageX -																	// The absolute mouse position
				this.offset.click.left -												// Click offset (relative to the element)
				this.offset.relative.left -												// Only for relative positioned nodes: Relative offset from element to offset parent
				this.offset.parent.left +												// The offsetParent's offset without borders (offset + border)
				( this.cssPosition === "fixed" ? -this.scrollParent.scrollLeft() : this.offset.scroll.left )
			)
		};

	},

	_clear: function() {
		this.helper.removeClass("ui-draggable-dragging");
		if(this.helper[0] !== this.element[0] && !this.cancelHelperRemoval) {
			this.helper.remove();
		}
		this.helper = null;
		this.cancelHelperRemoval = false;
	},

	// From now on bulk stuff - mainly helpers

	_trigger: function(type, event, ui) {
		ui = ui || this._uiHash();
		$.ui.plugin.call(this, type, [event, ui]);
		//The absolute position has to be recalculated after plugins
		if(type === "drag") {
			this.positionAbs = this._convertPositionTo("absolute");
		}
		return $.Widget.prototype._trigger.call(this, type, event, ui);
	},

	plugins: {},

	_uiHash: function() {
		return {
			helper: this.helper,
			position: this.position,
			originalPosition: this.originalPosition,
			offset: this.positionAbs
		};
	}

});

$.ui.plugin.add("draggable", "connectToSortable", {
	start: function(event, ui) {

		var inst = $(this).data("ui-draggable"), o = inst.options,
			uiSortable = $.extend({}, ui, { item: inst.element });
		inst.sortables = [];
		$(o.connectToSortable).each(function() {
			var sortable = $.data(this, "ui-sortable");
			if (sortable && !sortable.options.disabled) {
				inst.sortables.push({
					instance: sortable,
					shouldRevert: sortable.options.revert
				});
				sortable.refreshPositions();	// Call the sortable's refreshPositions at drag start to refresh the containerCache since the sortable container cache is used in drag and needs to be up to date (this will ensure it's initialised as well as being kept in step with any changes that might have happened on the page).
				sortable._trigger("activate", event, uiSortable);
			}
		});

	},
	stop: function(event, ui) {

		//If we are still over the sortable, we fake the stop event of the sortable, but also remove helper
		var inst = $(this).data("ui-draggable"),
			uiSortable = $.extend({}, ui, { item: inst.element });

		$.each(inst.sortables, function() {
			if(this.instance.isOver) {

				this.instance.isOver = 0;

				inst.cancelHelperRemoval = true; //Don't remove the helper in the draggable instance
				this.instance.cancelHelperRemoval = false; //Remove it in the sortable instance (so sortable plugins like revert still work)

				//The sortable revert is supported, and we have to set a temporary dropped variable on the draggable to support revert: "valid/invalid"
				if(this.shouldRevert) {
					this.instance.options.revert = this.shouldRevert;
				}

				//Trigger the stop of the sortable
				this.instance._mouseStop(event);

				this.instance.options.helper = this.instance.options._helper;

				//If the helper has been the original item, restore properties in the sortable
				if(inst.options.helper === "original") {
					this.instance.currentItem.css({ top: "auto", left: "auto" });
				}

			} else {
				this.instance.cancelHelperRemoval = false; //Remove the helper in the sortable instance
				this.instance._trigger("deactivate", event, uiSortable);
			}

		});

	},
	drag: function(event, ui) {

		var inst = $(this).data("ui-draggable"), that = this;

		$.each(inst.sortables, function() {

			var innermostIntersecting = false,
				thisSortable = this;

			//Copy over some variables to allow calling the sortable's native _intersectsWith
			this.instance.positionAbs = inst.positionAbs;
			this.instance.helperProportions = inst.helperProportions;
			this.instance.offset.click = inst.offset.click;

			if(this.instance._intersectsWith(this.instance.containerCache)) {
				innermostIntersecting = true;
				$.each(inst.sortables, function () {
					this.instance.positionAbs = inst.positionAbs;
					this.instance.helperProportions = inst.helperProportions;
					this.instance.offset.click = inst.offset.click;
					if (this !== thisSortable &&
						this.instance._intersectsWith(this.instance.containerCache) &&
						$.contains(thisSortable.instance.element[0], this.instance.element[0])
					) {
						innermostIntersecting = false;
					}
					return innermostIntersecting;
				});
			}


			if(innermostIntersecting) {
				//If it intersects, we use a little isOver variable and set it once, so our move-in stuff gets fired only once
				if(!this.instance.isOver) {

					this.instance.isOver = 1;
					//Now we fake the start of dragging for the sortable instance,
					//by cloning the list group item, appending it to the sortable and using it as inst.currentItem
					//We can then fire the start event of the sortable with our passed browser event, and our own helper (so it doesn't create a new one)
					this.instance.currentItem = $(that).clone().removeAttr("id").appendTo(this.instance.element).data("ui-sortable-item", true);
					this.instance.options._helper = this.instance.options.helper; //Store helper option to later restore it
					this.instance.options.helper = function() { return ui.helper[0]; };

					event.target = this.instance.currentItem[0];
					this.instance._mouseCapture(event, true);
					this.instance._mouseStart(event, true, true);

					//Because the browser event is way off the new appended portlet, we modify a couple of variables to reflect the changes
					this.instance.offset.click.top = inst.offset.click.top;
					this.instance.offset.click.left = inst.offset.click.left;
					this.instance.offset.parent.left -= inst.offset.parent.left - this.instance.offset.parent.left;
					this.instance.offset.parent.top -= inst.offset.parent.top - this.instance.offset.parent.top;

					inst._trigger("toSortable", event);
					inst.dropped = this.instance.element; //draggable revert needs that
					//hack so receive/update callbacks work (mostly)
					inst.currentItem = inst.element;
					this.instance.fromOutside = inst;

				}

				//Provided we did all the previous steps, we can fire the drag event of the sortable on every draggable drag, when it intersects with the sortable
				if(this.instance.currentItem) {
					this.instance._mouseDrag(event);
				}

			} else {

				//If it doesn't intersect with the sortable, and it intersected before,
				//we fake the drag stop of the sortable, but make sure it doesn't remove the helper by using cancelHelperRemoval
				if(this.instance.isOver) {

					this.instance.isOver = 0;
					this.instance.cancelHelperRemoval = true;

					//Prevent reverting on this forced stop
					this.instance.options.revert = false;

					// The out event needs to be triggered independently
					this.instance._trigger("out", event, this.instance._uiHash(this.instance));

					this.instance._mouseStop(event, true);
					this.instance.options.helper = this.instance.options._helper;

					//Now we remove our currentItem, the list group clone again, and the placeholder, and animate the helper back to it's original size
					this.instance.currentItem.remove();
					if(this.instance.placeholder) {
						this.instance.placeholder.remove();
					}

					inst._trigger("fromSortable", event);
					inst.dropped = false; //draggable revert needs that
				}

			}

		});

	}
});

$.ui.plugin.add("draggable", "cursor", {
	start: function() {
		var t = $("body"), o = $(this).data("ui-draggable").options;
		if (t.css("cursor")) {
			o._cursor = t.css("cursor");
		}
		t.css("cursor", o.cursor);
	},
	stop: function() {
		var o = $(this).data("ui-draggable").options;
		if (o._cursor) {
			$("body").css("cursor", o._cursor);
		}
	}
});

$.ui.plugin.add("draggable", "opacity", {
	start: function(event, ui) {
		var t = $(ui.helper), o = $(this).data("ui-draggable").options;
		if(t.css("opacity")) {
			o._opacity = t.css("opacity");
		}
		t.css("opacity", o.opacity);
	},
	stop: function(event, ui) {
		var o = $(this).data("ui-draggable").options;
		if(o._opacity) {
			$(ui.helper).css("opacity", o._opacity);
		}
	}
});

$.ui.plugin.add("draggable", "scroll", {
	start: function() {
		var i = $(this).data("ui-draggable");
		if(i.scrollParent[0] !== document && i.scrollParent[0].tagName !== "HTML") {
			i.overflowOffset = i.scrollParent.offset();
		}
	},
	drag: function( event ) {

		var i = $(this).data("ui-draggable"), o = i.options, scrolled = false;

		if(i.scrollParent[0] !== document && i.scrollParent[0].tagName !== "HTML") {

			if(!o.axis || o.axis !== "x") {
				if((i.overflowOffset.top + i.scrollParent[0].offsetHeight) - event.pageY < o.scrollSensitivity) {
					i.scrollParent[0].scrollTop = scrolled = i.scrollParent[0].scrollTop + o.scrollSpeed;
				} else if(event.pageY - i.overflowOffset.top < o.scrollSensitivity) {
					i.scrollParent[0].scrollTop = scrolled = i.scrollParent[0].scrollTop - o.scrollSpeed;
				}
			}

			if(!o.axis || o.axis !== "y") {
				if((i.overflowOffset.left + i.scrollParent[0].offsetWidth) - event.pageX < o.scrollSensitivity) {
					i.scrollParent[0].scrollLeft = scrolled = i.scrollParent[0].scrollLeft + o.scrollSpeed;
				} else if(event.pageX - i.overflowOffset.left < o.scrollSensitivity) {
					i.scrollParent[0].scrollLeft = scrolled = i.scrollParent[0].scrollLeft - o.scrollSpeed;
				}
			}

		} else {

			if(!o.axis || o.axis !== "x") {
				if(event.pageY - $(document).scrollTop() < o.scrollSensitivity) {
					scrolled = $(document).scrollTop($(document).scrollTop() - o.scrollSpeed);
				} else if($(window).height() - (event.pageY - $(document).scrollTop()) < o.scrollSensitivity) {
					scrolled = $(document).scrollTop($(document).scrollTop() + o.scrollSpeed);
				}
			}

			if(!o.axis || o.axis !== "y") {
				if(event.pageX - $(document).scrollLeft() < o.scrollSensitivity) {
					scrolled = $(document).scrollLeft($(document).scrollLeft() - o.scrollSpeed);
				} else if($(window).width() - (event.pageX - $(document).scrollLeft()) < o.scrollSensitivity) {
					scrolled = $(document).scrollLeft($(document).scrollLeft() + o.scrollSpeed);
				}
			}

		}

		if(scrolled !== false && $.ui.ddmanager && !o.dropBehaviour) {
			$.ui.ddmanager.prepareOffsets(i, event);
		}

	}
});

$.ui.plugin.add("draggable", "snap", {
	start: function() {

		var i = $(this).data("ui-draggable"),
			o = i.options;

		i.snapElements = [];

		$(o.snap.constructor !== String ? ( o.snap.items || ":data(ui-draggable)" ) : o.snap).each(function() {
			var $t = $(this),
				$o = $t.offset();
			if(this !== i.element[0]) {
				i.snapElements.push({
					item: this,
					width: $t.outerWidth(), height: $t.outerHeight(),
					top: $o.top, left: $o.left
				});
			}
		});

	},
	drag: function(event, ui) {

		var ts, bs, ls, rs, l, r, t, b, i, first,
			inst = $(this).data("ui-draggable"),
			o = inst.options,
			d = o.snapTolerance,
			x1 = ui.offset.left, x2 = x1 + inst.helperProportions.width,
			y1 = ui.offset.top, y2 = y1 + inst.helperProportions.height;

		for (i = inst.snapElements.length - 1; i >= 0; i--){

			l = inst.snapElements[i].left;
			r = l + inst.snapElements[i].width;
			t = inst.snapElements[i].top;
			b = t + inst.snapElements[i].height;

			if ( x2 < l - d || x1 > r + d || y2 < t - d || y1 > b + d || !$.contains( inst.snapElements[ i ].item.ownerDocument, inst.snapElements[ i ].item ) ) {
				if(inst.snapElements[i].snapping) {
					(inst.options.snap.release && inst.options.snap.release.call(inst.element, event, $.extend(inst._uiHash(), { snapItem: inst.snapElements[i].item })));
				}
				inst.snapElements[i].snapping = false;
				continue;
			}

			if(o.snapMode !== "inner") {
				ts = Math.abs(t - y2) <= d;
				bs = Math.abs(b - y1) <= d;
				ls = Math.abs(l - x2) <= d;
				rs = Math.abs(r - x1) <= d;
				if(ts) {
					ui.position.top = inst._convertPositionTo("relative", { top: t - inst.helperProportions.height, left: 0 }).top - inst.margins.top;
				}
				if(bs) {
					ui.position.top = inst._convertPositionTo("relative", { top: b, left: 0 }).top - inst.margins.top;
				}
				if(ls) {
					ui.position.left = inst._convertPositionTo("relative", { top: 0, left: l - inst.helperProportions.width }).left - inst.margins.left;
				}
				if(rs) {
					ui.position.left = inst._convertPositionTo("relative", { top: 0, left: r }).left - inst.margins.left;
				}
			}

			first = (ts || bs || ls || rs);

			if(o.snapMode !== "outer") {
				ts = Math.abs(t - y1) <= d;
				bs = Math.abs(b - y2) <= d;
				ls = Math.abs(l - x1) <= d;
				rs = Math.abs(r - x2) <= d;
				if(ts) {
					ui.position.top = inst._convertPositionTo("relative", { top: t, left: 0 }).top - inst.margins.top;
				}
				if(bs) {
					ui.position.top = inst._convertPositionTo("relative", { top: b - inst.helperProportions.height, left: 0 }).top - inst.margins.top;
				}
				if(ls) {
					ui.position.left = inst._convertPositionTo("relative", { top: 0, left: l }).left - inst.margins.left;
				}
				if(rs) {
					ui.position.left = inst._convertPositionTo("relative", { top: 0, left: r - inst.helperProportions.width }).left - inst.margins.left;
				}
			}

			if(!inst.snapElements[i].snapping && (ts || bs || ls || rs || first)) {
				(inst.options.snap.snap && inst.options.snap.snap.call(inst.element, event, $.extend(inst._uiHash(), { snapItem: inst.snapElements[i].item })));
			}
			inst.snapElements[i].snapping = (ts || bs || ls || rs || first);

		}

	}
});

$.ui.plugin.add("draggable", "stack", {
	start: function() {
		var min,
			o = this.data("ui-draggable").options,
			group = $.makeArray($(o.stack)).sort(function(a,b) {
				return (parseInt($(a).css("zIndex"),10) || 0) - (parseInt($(b).css("zIndex"),10) || 0);
			});

		if (!group.length) { return; }

		min = parseInt($(group[0]).css("zIndex"), 10) || 0;
		$(group).each(function(i) {
			$(this).css("zIndex", min + i);
		});
		this.css("zIndex", (min + group.length));
	}
});

$.ui.plugin.add("draggable", "zIndex", {
	start: function(event, ui) {
		var t = $(ui.helper), o = $(this).data("ui-draggable").options;
		if(t.css("zIndex")) {
			o._zIndex = t.css("zIndex");
		}
		t.css("zIndex", o.zIndex);
	},
	stop: function(event, ui) {
		var o = $(this).data("ui-draggable").options;
		if(o._zIndex) {
			$(ui.helper).css("zIndex", o._zIndex);
		}
	}
});

})(jQuery);

/*!
 * jQuery UI Droppable 1.10.4
 * http://jqueryui.com
 *
 * Copyright 2014 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/droppable/
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 *	jquery.ui.mouse.js
 *	jquery.ui.draggable.js
 */
(function( $, undefined ) {

function isOverAxis( x, reference, size ) {
	return ( x > reference ) && ( x < ( reference + size ) );
}

$.widget("ui.droppable", {
	version: "1.10.4",
	widgetEventPrefix: "drop",
	options: {
		accept: "*",
		activeClass: false,
		addClasses: true,
		greedy: false,
		hoverClass: false,
		scope: "default",
		tolerance: "intersect",

		// callbacks
		activate: null,
		deactivate: null,
		drop: null,
		out: null,
		over: null
	},
	_create: function() {

		var proportions,
			o = this.options,
			accept = o.accept;

		this.isover = false;
		this.isout = true;

		this.accept = $.isFunction(accept) ? accept : function(d) {
			return d.is(accept);
		};

		this.proportions = function( /* valueToWrite */ ) {
			if ( arguments.length ) {
				// Store the droppable's proportions
				proportions = arguments[ 0 ];
			} else {
				// Retrieve or derive the droppable's proportions
				return proportions ?
					proportions :
					proportions = {
						width: this.element[ 0 ].offsetWidth,
						height: this.element[ 0 ].offsetHeight
					};
			}
		};

		// Add the reference and positions to the manager
		$.ui.ddmanager.droppables[o.scope] = $.ui.ddmanager.droppables[o.scope] || [];
		$.ui.ddmanager.droppables[o.scope].push(this);

		(o.addClasses && this.element.addClass("ui-droppable"));

	},

	_destroy: function() {
		var i = 0,
			drop = $.ui.ddmanager.droppables[this.options.scope];

		for ( ; i < drop.length; i++ ) {
			if ( drop[i] === this ) {
				drop.splice(i, 1);
			}
		}

		this.element.removeClass("ui-droppable ui-droppable-disabled");
	},

	_setOption: function(key, value) {

		if(key === "accept") {
			this.accept = $.isFunction(value) ? value : function(d) {
				return d.is(value);
			};
		}
		$.Widget.prototype._setOption.apply(this, arguments);
	},

	_activate: function(event) {
		var draggable = $.ui.ddmanager.current;
		if(this.options.activeClass) {
			this.element.addClass(this.options.activeClass);
		}
		if(draggable){
			this._trigger("activate", event, this.ui(draggable));
		}
	},

	_deactivate: function(event) {
		var draggable = $.ui.ddmanager.current;
		if(this.options.activeClass) {
			this.element.removeClass(this.options.activeClass);
		}
		if(draggable){
			this._trigger("deactivate", event, this.ui(draggable));
		}
	},

	_over: function(event) {

		var draggable = $.ui.ddmanager.current;

		// Bail if draggable and droppable are same element
		if (!draggable || (draggable.currentItem || draggable.element)[0] === this.element[0]) {
			return;
		}

		if (this.accept.call(this.element[0],(draggable.currentItem || draggable.element))) {
			if(this.options.hoverClass) {
				this.element.addClass(this.options.hoverClass);
			}
			this._trigger("over", event, this.ui(draggable));
		}

	},

	_out: function(event) {

		var draggable = $.ui.ddmanager.current;

		// Bail if draggable and droppable are same element
		if (!draggable || (draggable.currentItem || draggable.element)[0] === this.element[0]) {
			return;
		}

		if (this.accept.call(this.element[0],(draggable.currentItem || draggable.element))) {
			if(this.options.hoverClass) {
				this.element.removeClass(this.options.hoverClass);
			}
			this._trigger("out", event, this.ui(draggable));
		}

	},

	_drop: function(event,custom) {

		var draggable = custom || $.ui.ddmanager.current,
			childrenIntersection = false;

		// Bail if draggable and droppable are same element
		if (!draggable || (draggable.currentItem || draggable.element)[0] === this.element[0]) {
			return false;
		}

		this.element.find(":data(ui-droppable)").not(".ui-draggable-dragging").each(function() {
			var inst = $.data(this, "ui-droppable");
			if(
				inst.options.greedy &&
				!inst.options.disabled &&
				inst.options.scope === draggable.options.scope &&
				inst.accept.call(inst.element[0], (draggable.currentItem || draggable.element)) &&
				$.ui.intersect(draggable, $.extend(inst, { offset: inst.element.offset() }), inst.options.tolerance)
			) { childrenIntersection = true; return false; }
		});
		if(childrenIntersection) {
			return false;
		}

		if(this.accept.call(this.element[0],(draggable.currentItem || draggable.element))) {
			if(this.options.activeClass) {
				this.element.removeClass(this.options.activeClass);
			}
			if(this.options.hoverClass) {
				this.element.removeClass(this.options.hoverClass);
			}
			this._trigger("drop", event, this.ui(draggable));
			return this.element;
		}

		return false;

	},

	ui: function(c) {
		return {
			draggable: (c.currentItem || c.element),
			helper: c.helper,
			position: c.position,
			offset: c.positionAbs
		};
	}

});

$.ui.intersect = function(draggable, droppable, toleranceMode) {

	if (!droppable.offset) {
		return false;
	}

	var draggableLeft, draggableTop,
		x1 = (draggable.positionAbs || draggable.position.absolute).left,
		y1 = (draggable.positionAbs || draggable.position.absolute).top,
		x2 = x1 + draggable.helperProportions.width,
		y2 = y1 + draggable.helperProportions.height,
		l = droppable.offset.left,
		t = droppable.offset.top,
		r = l + droppable.proportions().width,
		b = t + droppable.proportions().height;

	switch (toleranceMode) {
		case "fit":
			return (l <= x1 && x2 <= r && t <= y1 && y2 <= b);
		case "intersect":
			return (l < x1 + (draggable.helperProportions.width / 2) && // Right Half
				x2 - (draggable.helperProportions.width / 2) < r && // Left Half
				t < y1 + (draggable.helperProportions.height / 2) && // Bottom Half
				y2 - (draggable.helperProportions.height / 2) < b ); // Top Half
		case "pointer":
			draggableLeft = ((draggable.positionAbs || draggable.position.absolute).left + (draggable.clickOffset || draggable.offset.click).left);
			draggableTop = ((draggable.positionAbs || draggable.position.absolute).top + (draggable.clickOffset || draggable.offset.click).top);
			return isOverAxis( draggableTop, t, droppable.proportions().height ) && isOverAxis( draggableLeft, l, droppable.proportions().width );
		case "touch":
			return (
				(y1 >= t && y1 <= b) ||	// Top edge touching
				(y2 >= t && y2 <= b) ||	// Bottom edge touching
				(y1 < t && y2 > b)		// Surrounded vertically
			) && (
				(x1 >= l && x1 <= r) ||	// Left edge touching
				(x2 >= l && x2 <= r) ||	// Right edge touching
				(x1 < l && x2 > r)		// Surrounded horizontally
			);
		default:
			return false;
		}

};

/*
	This manager tracks offsets of draggables and droppables
*/
$.ui.ddmanager = {
	current: null,
	droppables: { "default": [] },
	prepareOffsets: function(t, event) {

		var i, j,
			m = $.ui.ddmanager.droppables[t.options.scope] || [],
			type = event ? event.type : null, // workaround for #2317
			list = (t.currentItem || t.element).find(":data(ui-droppable)").addBack();

		droppablesLoop: for (i = 0; i < m.length; i++) {

			//No disabled and non-accepted
			if(m[i].options.disabled || (t && !m[i].accept.call(m[i].element[0],(t.currentItem || t.element)))) {
				continue;
			}

			// Filter out elements in the current dragged item
			for (j=0; j < list.length; j++) {
				if(list[j] === m[i].element[0]) {
					m[i].proportions().height = 0;
					continue droppablesLoop;
				}
			}

			m[i].visible = m[i].element.css("display") !== "none";
			if(!m[i].visible) {
				continue;
			}

			//Activate the droppable if used directly from draggables
			if(type === "mousedown") {
				m[i]._activate.call(m[i], event);
			}

			m[ i ].offset = m[ i ].element.offset();
			m[ i ].proportions({ width: m[ i ].element[ 0 ].offsetWidth, height: m[ i ].element[ 0 ].offsetHeight });

		}

	},
	drop: function(draggable, event) {

		var dropped = false;
		// Create a copy of the droppables in case the list changes during the drop (#9116)
		$.each(($.ui.ddmanager.droppables[draggable.options.scope] || []).slice(), function() {

			if(!this.options) {
				return;
			}
			if (!this.options.disabled && this.visible && $.ui.intersect(draggable, this, this.options.tolerance)) {
				dropped = this._drop.call(this, event) || dropped;
			}

			if (!this.options.disabled && this.visible && this.accept.call(this.element[0],(draggable.currentItem || draggable.element))) {
				this.isout = true;
				this.isover = false;
				this._deactivate.call(this, event);
			}

		});
		return dropped;

	},
	dragStart: function( draggable, event ) {
		//Listen for scrolling so that if the dragging causes scrolling the position of the droppables can be recalculated (see #5003)
		draggable.element.parentsUntil( "body" ).bind( "scroll.droppable", function() {
			if( !draggable.options.refreshPositions ) {
				$.ui.ddmanager.prepareOffsets( draggable, event );
			}
		});
	},
	drag: function(draggable, event) {

		//If you have a highly dynamic page, you might try this option. It renders positions every time you move the mouse.
		if(draggable.options.refreshPositions) {
			$.ui.ddmanager.prepareOffsets(draggable, event);
		}

		//Run through all droppables and check their positions based on specific tolerance options
		$.each($.ui.ddmanager.droppables[draggable.options.scope] || [], function() {

			if(this.options.disabled || this.greedyChild || !this.visible) {
				return;
			}

			var parentInstance, scope, parent,
				intersects = $.ui.intersect(draggable, this, this.options.tolerance),
				c = !intersects && this.isover ? "isout" : (intersects && !this.isover ? "isover" : null);
			if(!c) {
				return;
			}

			if (this.options.greedy) {
				// find droppable parents with same scope
				scope = this.options.scope;
				parent = this.element.parents(":data(ui-droppable)").filter(function () {
					return $.data(this, "ui-droppable").options.scope === scope;
				});

				if (parent.length) {
					parentInstance = $.data(parent[0], "ui-droppable");
					parentInstance.greedyChild = (c === "isover");
				}
			}

			// we just moved into a greedy child
			if (parentInstance && c === "isover") {
				parentInstance.isover = false;
				parentInstance.isout = true;
				parentInstance._out.call(parentInstance, event);
			}

			this[c] = true;
			this[c === "isout" ? "isover" : "isout"] = false;
			this[c === "isover" ? "_over" : "_out"].call(this, event);

			// we just moved out of a greedy child
			if (parentInstance && c === "isout") {
				parentInstance.isout = false;
				parentInstance.isover = true;
				parentInstance._over.call(parentInstance, event);
			}
		});

	},
	dragStop: function( draggable, event ) {
		draggable.element.parentsUntil( "body" ).unbind( "scroll.droppable" );
		//Call prepareOffsets one final time since IE does not fire return scroll events when overflow was caused by drag (see #5003)
		if( !draggable.options.refreshPositions ) {
			$.ui.ddmanager.prepareOffsets( draggable, event );
		}
	}
};

})(jQuery);

/*!
 * jQuery UI Sortable 1.10.4
 * http://jqueryui.com
 *
 * Copyright 2014 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/sortable/
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.mouse.js
 *	jquery.ui.widget.js
 */
(function( $, undefined ) {

function isOverAxis( x, reference, size ) {
	return ( x > reference ) && ( x < ( reference + size ) );
}

function isFloating(item) {
	return (/left|right/).test(item.css("float")) || (/inline|table-cell/).test(item.css("display"));
}

$.widget("ui.sortable", $.ui.mouse, {
	version: "1.10.4",
	widgetEventPrefix: "sort",
	ready: false,
	options: {
		appendTo: "parent",
		axis: false,
		connectWith: false,
		containment: false,
		cursor: "auto",
		cursorAt: false,
		dropOnEmpty: true,
		forcePlaceholderSize: false,
		forceHelperSize: false,
		grid: false,
		handle: false,
		helper: "original",
		items: "> *",
		opacity: false,
		placeholder: false,
		revert: false,
		scroll: true,
		scrollSensitivity: 20,
		scrollSpeed: 20,
		scope: "default",
		tolerance: "intersect",
		zIndex: 1000,

		// callbacks
		activate: null,
		beforeStop: null,
		change: null,
		deactivate: null,
		out: null,
		over: null,
		receive: null,
		remove: null,
		sort: null,
		start: null,
		stop: null,
		update: null
	},
	_create: function() {

		var o = this.options;
		this.containerCache = {};
		this.element.addClass("ui-sortable");

		//Get the items
		this.refresh();

		//Let's determine if the items are being displayed horizontally
		this.floating = this.items.length ? o.axis === "x" || isFloating(this.items[0].item) : false;

		//Let's determine the parent's offset
		this.offset = this.element.offset();

		//Initialize mouse events for interaction
		this._mouseInit();

		//We're ready to go
		this.ready = true;

	},

	_destroy: function() {
		this.element
			.removeClass("ui-sortable ui-sortable-disabled");
		this._mouseDestroy();

		for ( var i = this.items.length - 1; i >= 0; i-- ) {
			this.items[i].item.removeData(this.widgetName + "-item");
		}

		return this;
	},

	_setOption: function(key, value){
		if ( key === "disabled" ) {
			this.options[ key ] = value;

			this.widget().toggleClass( "ui-sortable-disabled", !!value );
		} else {
			// Don't call widget base _setOption for disable as it adds ui-state-disabled class
			$.Widget.prototype._setOption.apply(this, arguments);
		}
	},

	_mouseCapture: function(event, overrideHandle) {
		var currentItem = null,
			validHandle = false,
			that = this;

		if (this.reverting) {
			return false;
		}

		if(this.options.disabled || this.options.type === "static") {
			return false;
		}

		//We have to refresh the items data once first
		this._refreshItems(event);

		//Find out if the clicked node (or one of its parents) is a actual item in this.items
		$(event.target).parents().each(function() {
			if($.data(this, that.widgetName + "-item") === that) {
				currentItem = $(this);
				return false;
			}
		});
		if($.data(event.target, that.widgetName + "-item") === that) {
			currentItem = $(event.target);
		}

		if(!currentItem) {
			return false;
		}
		if(this.options.handle && !overrideHandle) {
			$(this.options.handle, currentItem).find("*").addBack().each(function() {
				if(this === event.target) {
					validHandle = true;
				}
			});
			if(!validHandle) {
				return false;
			}
		}

		this.currentItem = currentItem;
		this._removeCurrentsFromItems();
		return true;

	},

	_mouseStart: function(event, overrideHandle, noActivation) {

		var i, body,
			o = this.options;

		this.currentContainer = this;

		//We only need to call refreshPositions, because the refreshItems call has been moved to mouseCapture
		this.refreshPositions();

		//Create and append the visible helper
		this.helper = this._createHelper(event);

		//Cache the helper size
		this._cacheHelperProportions();

		/*
		 * - Position generation -
		 * This block generates everything position related - it's the core of draggables.
		 */

		//Cache the margins of the original element
		this._cacheMargins();

		//Get the next scrolling parent
		this.scrollParent = this.helper.scrollParent();

		//The element's absolute position on the page minus margins
		this.offset = this.currentItem.offset();
		this.offset = {
			top: this.offset.top - this.margins.top,
			left: this.offset.left - this.margins.left
		};

		$.extend(this.offset, {
			click: { //Where the click happened, relative to the element
				left: event.pageX - this.offset.left,
				top: event.pageY - this.offset.top
			},
			parent: this._getParentOffset(),
			relative: this._getRelativeOffset() //This is a relative to absolute position minus the actual position calculation - only used for relative positioned helper
		});

		// Only after we got the offset, we can change the helper's position to absolute
		// TODO: Still need to figure out a way to make relative sorting possible
		this.helper.css("position", "absolute");
		this.cssPosition = this.helper.css("position");

		//Generate the original position
		this.originalPosition = this._generatePosition(event);
		this.originalPageX = event.pageX;
		this.originalPageY = event.pageY;

		//Adjust the mouse offset relative to the helper if "cursorAt" is supplied
		(o.cursorAt && this._adjustOffsetFromHelper(o.cursorAt));

		//Cache the former DOM position
		this.domPosition = { prev: this.currentItem.prev()[0], parent: this.currentItem.parent()[0] };

		//If the helper is not the original, hide the original so it's not playing any role during the drag, won't cause anything bad this way
		if(this.helper[0] !== this.currentItem[0]) {
			this.currentItem.hide();
		}

		//Create the placeholder
		this._createPlaceholder();

		//Set a containment if given in the options
		if(o.containment) {
			this._setContainment();
		}

		if( o.cursor && o.cursor !== "auto" ) { // cursor option
			body = this.document.find( "body" );

			// support: IE
			this.storedCursor = body.css( "cursor" );
			body.css( "cursor", o.cursor );

			this.storedStylesheet = $( "<style>*{ cursor: "+o.cursor+" !important; }</style>" ).appendTo( body );
		}

		if(o.opacity) { // opacity option
			if (this.helper.css("opacity")) {
				this._storedOpacity = this.helper.css("opacity");
			}
			this.helper.css("opacity", o.opacity);
		}

		if(o.zIndex) { // zIndex option
			if (this.helper.css("zIndex")) {
				this._storedZIndex = this.helper.css("zIndex");
			}
			this.helper.css("zIndex", o.zIndex);
		}

		//Prepare scrolling
		if(this.scrollParent[0] !== document && this.scrollParent[0].tagName !== "HTML") {
			this.overflowOffset = this.scrollParent.offset();
		}

		//Call callbacks
		this._trigger("start", event, this._uiHash());

		//Recache the helper size
		if(!this._preserveHelperProportions) {
			this._cacheHelperProportions();
		}


		//Post "activate" events to possible containers
		if( !noActivation ) {
			for ( i = this.containers.length - 1; i >= 0; i-- ) {
				this.containers[ i ]._trigger( "activate", event, this._uiHash( this ) );
			}
		}

		//Prepare possible droppables
		if($.ui.ddmanager) {
			$.ui.ddmanager.current = this;
		}

		if ($.ui.ddmanager && !o.dropBehaviour) {
			$.ui.ddmanager.prepareOffsets(this, event);
		}

		this.dragging = true;

		this.helper.addClass("ui-sortable-helper");
		this._mouseDrag(event); //Execute the drag once - this causes the helper not to be visible before getting its correct position
		return true;

	},

	_mouseDrag: function(event) {
		var i, item, itemElement, intersection,
			o = this.options,
			scrolled = false;

		//Compute the helpers position
		this.position = this._generatePosition(event);
		this.positionAbs = this._convertPositionTo("absolute");

		if (!this.lastPositionAbs) {
			this.lastPositionAbs = this.positionAbs;
		}

		//Do scrolling
		if(this.options.scroll) {
			if(this.scrollParent[0] !== document && this.scrollParent[0].tagName !== "HTML") {

				if((this.overflowOffset.top + this.scrollParent[0].offsetHeight) - event.pageY < o.scrollSensitivity) {
					this.scrollParent[0].scrollTop = scrolled = this.scrollParent[0].scrollTop + o.scrollSpeed;
				} else if(event.pageY - this.overflowOffset.top < o.scrollSensitivity) {
					this.scrollParent[0].scrollTop = scrolled = this.scrollParent[0].scrollTop - o.scrollSpeed;
				}

				if((this.overflowOffset.left + this.scrollParent[0].offsetWidth) - event.pageX < o.scrollSensitivity) {
					this.scrollParent[0].scrollLeft = scrolled = this.scrollParent[0].scrollLeft + o.scrollSpeed;
				} else if(event.pageX - this.overflowOffset.left < o.scrollSensitivity) {
					this.scrollParent[0].scrollLeft = scrolled = this.scrollParent[0].scrollLeft - o.scrollSpeed;
				}

			} else {

				if(event.pageY - $(document).scrollTop() < o.scrollSensitivity) {
					scrolled = $(document).scrollTop($(document).scrollTop() - o.scrollSpeed);
				} else if($(window).height() - (event.pageY - $(document).scrollTop()) < o.scrollSensitivity) {
					scrolled = $(document).scrollTop($(document).scrollTop() + o.scrollSpeed);
				}

				if(event.pageX - $(document).scrollLeft() < o.scrollSensitivity) {
					scrolled = $(document).scrollLeft($(document).scrollLeft() - o.scrollSpeed);
				} else if($(window).width() - (event.pageX - $(document).scrollLeft()) < o.scrollSensitivity) {
					scrolled = $(document).scrollLeft($(document).scrollLeft() + o.scrollSpeed);
				}

			}

			if(scrolled !== false && $.ui.ddmanager && !o.dropBehaviour) {
				$.ui.ddmanager.prepareOffsets(this, event);
			}
		}

		//Regenerate the absolute position used for position checks
		this.positionAbs = this._convertPositionTo("absolute");

		//Set the helper position
		if(!this.options.axis || this.options.axis !== "y") {
			this.helper[0].style.left = this.position.left+"px";
		}
		if(!this.options.axis || this.options.axis !== "x") {
			this.helper[0].style.top = this.position.top+"px";
		}

		//Rearrange
		for (i = this.items.length - 1; i >= 0; i--) {

			//Cache variables and intersection, continue if no intersection
			item = this.items[i];
			itemElement = item.item[0];
			intersection = this._intersectsWithPointer(item);
			if (!intersection) {
				continue;
			}

			// Only put the placeholder inside the current Container, skip all
			// items from other containers. This works because when moving
			// an item from one container to another the
			// currentContainer is switched before the placeholder is moved.
			//
			// Without this, moving items in "sub-sortables" can cause
			// the placeholder to jitter beetween the outer and inner container.
			if (item.instance !== this.currentContainer) {
				continue;
			}

			// cannot intersect with itself
			// no useless actions that have been done before
			// no action if the item moved is the parent of the item checked
			if (itemElement !== this.currentItem[0] &&
				this.placeholder[intersection === 1 ? "next" : "prev"]()[0] !== itemElement &&
				!$.contains(this.placeholder[0], itemElement) &&
				(this.options.type === "semi-dynamic" ? !$.contains(this.element[0], itemElement) : true)
			) {

				this.direction = intersection === 1 ? "down" : "up";

				if (this.options.tolerance === "pointer" || this._intersectsWithSides(item)) {
					this._rearrange(event, item);
				} else {
					break;
				}

				this._trigger("change", event, this._uiHash());
				break;
			}
		}

		//Post events to containers
		this._contactContainers(event);

		//Interconnect with droppables
		if($.ui.ddmanager) {
			$.ui.ddmanager.drag(this, event);
		}

		//Call callbacks
		this._trigger("sort", event, this._uiHash());

		this.lastPositionAbs = this.positionAbs;
		return false;

	},

	_mouseStop: function(event, noPropagation) {

		if(!event) {
			return;
		}

		//If we are using droppables, inform the manager about the drop
		if ($.ui.ddmanager && !this.options.dropBehaviour) {
			$.ui.ddmanager.drop(this, event);
		}

		if(this.options.revert) {
			var that = this,
				cur = this.placeholder.offset(),
				axis = this.options.axis,
				animation = {};

			if ( !axis || axis === "x" ) {
				animation.left = cur.left - this.offset.parent.left - this.margins.left + (this.offsetParent[0] === document.body ? 0 : this.offsetParent[0].scrollLeft);
			}
			if ( !axis || axis === "y" ) {
				animation.top = cur.top - this.offset.parent.top - this.margins.top + (this.offsetParent[0] === document.body ? 0 : this.offsetParent[0].scrollTop);
			}
			this.reverting = true;
			$(this.helper).animate( animation, parseInt(this.options.revert, 10) || 500, function() {
				that._clear(event);
			});
		} else {
			this._clear(event, noPropagation);
		}

		return false;

	},

	cancel: function() {

		if(this.dragging) {

			this._mouseUp({ target: null });

			if(this.options.helper === "original") {
				this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper");
			} else {
				this.currentItem.show();
			}

			//Post deactivating events to containers
			for (var i = this.containers.length - 1; i >= 0; i--){
				this.containers[i]._trigger("deactivate", null, this._uiHash(this));
				if(this.containers[i].containerCache.over) {
					this.containers[i]._trigger("out", null, this._uiHash(this));
					this.containers[i].containerCache.over = 0;
				}
			}

		}

		if (this.placeholder) {
			//$(this.placeholder[0]).remove(); would have been the jQuery way - unfortunately, it unbinds ALL events from the original node!
			if(this.placeholder[0].parentNode) {
				this.placeholder[0].parentNode.removeChild(this.placeholder[0]);
			}
			if(this.options.helper !== "original" && this.helper && this.helper[0].parentNode) {
				this.helper.remove();
			}

			$.extend(this, {
				helper: null,
				dragging: false,
				reverting: false,
				_noFinalSort: null
			});

			if(this.domPosition.prev) {
				$(this.domPosition.prev).after(this.currentItem);
			} else {
				$(this.domPosition.parent).prepend(this.currentItem);
			}
		}

		return this;

	},

	serialize: function(o) {

		var items = this._getItemsAsjQuery(o && o.connected),
			str = [];
		o = o || {};

		$(items).each(function() {
			var res = ($(o.item || this).attr(o.attribute || "id") || "").match(o.expression || (/(.+)[\-=_](.+)/));
			if (res) {
				str.push((o.key || res[1]+"[]")+"="+(o.key && o.expression ? res[1] : res[2]));
			}
		});

		if(!str.length && o.key) {
			str.push(o.key + "=");
		}

		return str.join("&");

	},

	toArray: function(o) {

		var items = this._getItemsAsjQuery(o && o.connected),
			ret = [];

		o = o || {};

		items.each(function() { ret.push($(o.item || this).attr(o.attribute || "id") || ""); });
		return ret;

	},

	/* Be careful with the following core functions */
	_intersectsWith: function(item) {

		var x1 = this.positionAbs.left,
			x2 = x1 + this.helperProportions.width,
			y1 = this.positionAbs.top,
			y2 = y1 + this.helperProportions.height,
			l = item.left,
			r = l + item.width,
			t = item.top,
			b = t + item.height,
			dyClick = this.offset.click.top,
			dxClick = this.offset.click.left,
			isOverElementHeight = ( this.options.axis === "x" ) || ( ( y1 + dyClick ) > t && ( y1 + dyClick ) < b ),
			isOverElementWidth = ( this.options.axis === "y" ) || ( ( x1 + dxClick ) > l && ( x1 + dxClick ) < r ),
			isOverElement = isOverElementHeight && isOverElementWidth;

		if ( this.options.tolerance === "pointer" ||
			this.options.forcePointerForContainers ||
			(this.options.tolerance !== "pointer" && this.helperProportions[this.floating ? "width" : "height"] > item[this.floating ? "width" : "height"])
		) {
			return isOverElement;
		} else {

			return (l < x1 + (this.helperProportions.width / 2) && // Right Half
				x2 - (this.helperProportions.width / 2) < r && // Left Half
				t < y1 + (this.helperProportions.height / 2) && // Bottom Half
				y2 - (this.helperProportions.height / 2) < b ); // Top Half

		}
	},

	_intersectsWithPointer: function(item) {

		var isOverElementHeight = (this.options.axis === "x") || isOverAxis(this.positionAbs.top + this.offset.click.top, item.top, item.height),
			isOverElementWidth = (this.options.axis === "y") || isOverAxis(this.positionAbs.left + this.offset.click.left, item.left, item.width),
			isOverElement = isOverElementHeight && isOverElementWidth,
			verticalDirection = this._getDragVerticalDirection(),
			horizontalDirection = this._getDragHorizontalDirection();

		if (!isOverElement) {
			return false;
		}

		return this.floating ?
			( ((horizontalDirection && horizontalDirection === "right") || verticalDirection === "down") ? 2 : 1 )
			: ( verticalDirection && (verticalDirection === "down" ? 2 : 1) );

	},

	_intersectsWithSides: function(item) {

		var isOverBottomHalf = isOverAxis(this.positionAbs.top + this.offset.click.top, item.top + (item.height/2), item.height),
			isOverRightHalf = isOverAxis(this.positionAbs.left + this.offset.click.left, item.left + (item.width/2), item.width),
			verticalDirection = this._getDragVerticalDirection(),
			horizontalDirection = this._getDragHorizontalDirection();

		if (this.floating && horizontalDirection) {
			return ((horizontalDirection === "right" && isOverRightHalf) || (horizontalDirection === "left" && !isOverRightHalf));
		} else {
			return verticalDirection && ((verticalDirection === "down" && isOverBottomHalf) || (verticalDirection === "up" && !isOverBottomHalf));
		}

	},

	_getDragVerticalDirection: function() {
		var delta = this.positionAbs.top - this.lastPositionAbs.top;
		return delta !== 0 && (delta > 0 ? "down" : "up");
	},

	_getDragHorizontalDirection: function() {
		var delta = this.positionAbs.left - this.lastPositionAbs.left;
		return delta !== 0 && (delta > 0 ? "right" : "left");
	},

	refresh: function(event) {
		this._refreshItems(event);
		this.refreshPositions();
		return this;
	},

	_connectWith: function() {
		var options = this.options;
		return options.connectWith.constructor === String ? [options.connectWith] : options.connectWith;
	},

	_getItemsAsjQuery: function(connected) {

		var i, j, cur, inst,
			items = [],
			queries = [],
			connectWith = this._connectWith();

		if(connectWith && connected) {
			for (i = connectWith.length - 1; i >= 0; i--){
				cur = $(connectWith[i]);
				for ( j = cur.length - 1; j >= 0; j--){
					inst = $.data(cur[j], this.widgetFullName);
					if(inst && inst !== this && !inst.options.disabled) {
						queries.push([$.isFunction(inst.options.items) ? inst.options.items.call(inst.element) : $(inst.options.items, inst.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"), inst]);
					}
				}
			}
		}

		queries.push([$.isFunction(this.options.items) ? this.options.items.call(this.element, null, { options: this.options, item: this.currentItem }) : $(this.options.items, this.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"), this]);

		function addItems() {
			items.push( this );
		}
		for (i = queries.length - 1; i >= 0; i--){
			queries[i][0].each( addItems );
		}

		return $(items);

	},

	_removeCurrentsFromItems: function() {

		var list = this.currentItem.find(":data(" + this.widgetName + "-item)");

		this.items = $.grep(this.items, function (item) {
			for (var j=0; j < list.length; j++) {
				if(list[j] === item.item[0]) {
					return false;
				}
			}
			return true;
		});

	},

	_refreshItems: function(event) {

		this.items = [];
		this.containers = [this];

		var i, j, cur, inst, targetData, _queries, item, queriesLength,
			items = this.items,
			queries = [[$.isFunction(this.options.items) ? this.options.items.call(this.element[0], event, { item: this.currentItem }) : $(this.options.items, this.element), this]],
			connectWith = this._connectWith();

		if(connectWith && this.ready) { //Shouldn't be run the first time through due to massive slow-down
			for (i = connectWith.length - 1; i >= 0; i--){
				cur = $(connectWith[i]);
				for (j = cur.length - 1; j >= 0; j--){
					inst = $.data(cur[j], this.widgetFullName);
					if(inst && inst !== this && !inst.options.disabled) {
						queries.push([$.isFunction(inst.options.items) ? inst.options.items.call(inst.element[0], event, { item: this.currentItem }) : $(inst.options.items, inst.element), inst]);
						this.containers.push(inst);
					}
				}
			}
		}

		for (i = queries.length - 1; i >= 0; i--) {
			targetData = queries[i][1];
			_queries = queries[i][0];

			for (j=0, queriesLength = _queries.length; j < queriesLength; j++) {
				item = $(_queries[j]);

				item.data(this.widgetName + "-item", targetData); // Data for target checking (mouse manager)

				items.push({
					item: item,
					instance: targetData,
					width: 0, height: 0,
					left: 0, top: 0
				});
			}
		}

	},

	refreshPositions: function(fast) {

		//This has to be redone because due to the item being moved out/into the offsetParent, the offsetParent's position will change
		if(this.offsetParent && this.helper) {
			this.offset.parent = this._getParentOffset();
		}

		var i, item, t, p;

		for (i = this.items.length - 1; i >= 0; i--){
			item = this.items[i];

			//We ignore calculating positions of all connected containers when we're not over them
			if(item.instance !== this.currentContainer && this.currentContainer && item.item[0] !== this.currentItem[0]) {
				continue;
			}

			t = this.options.toleranceElement ? $(this.options.toleranceElement, item.item) : item.item;

			if (!fast) {
				item.width = t.outerWidth();
				item.height = t.outerHeight();
			}

			p = t.offset();
			item.left = p.left;
			item.top = p.top;
		}

		if(this.options.custom && this.options.custom.refreshContainers) {
			this.options.custom.refreshContainers.call(this);
		} else {
			for (i = this.containers.length - 1; i >= 0; i--){
				p = this.containers[i].element.offset();
				this.containers[i].containerCache.left = p.left;
				this.containers[i].containerCache.top = p.top;
				this.containers[i].containerCache.width	= this.containers[i].element.outerWidth();
				this.containers[i].containerCache.height = this.containers[i].element.outerHeight();
			}
		}

		return this;
	},

	_createPlaceholder: function(that) {
		that = that || this;
		var className,
			o = that.options;

		if(!o.placeholder || o.placeholder.constructor === String) {
			className = o.placeholder;
			o.placeholder = {
				element: function() {

					var nodeName = that.currentItem[0].nodeName.toLowerCase(),
						element = $( "<" + nodeName + ">", that.document[0] )
							.addClass(className || that.currentItem[0].className+" ui-sortable-placeholder")
							.removeClass("ui-sortable-helper");

					if ( nodeName === "tr" ) {
						that.currentItem.children().each(function() {
							$( "<td>&#160;</td>", that.document[0] )
								.attr( "colspan", $( this ).attr( "colspan" ) || 1 )
								.appendTo( element );
						});
					} else if ( nodeName === "img" ) {
						element.attr( "src", that.currentItem.attr( "src" ) );
					}

					if ( !className ) {
						element.css( "visibility", "hidden" );
					}

					return element;
				},
				update: function(container, p) {

					// 1. If a className is set as 'placeholder option, we don't force sizes - the class is responsible for that
					// 2. The option 'forcePlaceholderSize can be enabled to force it even if a class name is specified
					if(className && !o.forcePlaceholderSize) {
						return;
					}

					//If the element doesn't have a actual height by itself (without styles coming from a stylesheet), it receives the inline height from the dragged item
					if(!p.height()) { p.height(that.currentItem.innerHeight() - parseInt(that.currentItem.css("paddingTop")||0, 10) - parseInt(that.currentItem.css("paddingBottom")||0, 10)); }
					if(!p.width()) { p.width(that.currentItem.innerWidth() - parseInt(that.currentItem.css("paddingLeft")||0, 10) - parseInt(that.currentItem.css("paddingRight")||0, 10)); }
				}
			};
		}

		//Create the placeholder
		that.placeholder = $(o.placeholder.element.call(that.element, that.currentItem));

		//Append it after the actual current item
		that.currentItem.after(that.placeholder);

		//Update the size of the placeholder (TODO: Logic to fuzzy, see line 316/317)
		o.placeholder.update(that, that.placeholder);

	},

	_contactContainers: function(event) {
		var i, j, dist, itemWithLeastDistance, posProperty, sizeProperty, base, cur, nearBottom, floating,
			innermostContainer = null,
			innermostIndex = null;

		// get innermost container that intersects with item
		for (i = this.containers.length - 1; i >= 0; i--) {

			// never consider a container that's located within the item itself
			if($.contains(this.currentItem[0], this.containers[i].element[0])) {
				continue;
			}

			if(this._intersectsWith(this.containers[i].containerCache)) {

				// if we've already found a container and it's more "inner" than this, then continue
				if(innermostContainer && $.contains(this.containers[i].element[0], innermostContainer.element[0])) {
					continue;
				}

				innermostContainer = this.containers[i];
				innermostIndex = i;

			} else {
				// container doesn't intersect. trigger "out" event if necessary
				if(this.containers[i].containerCache.over) {
					this.containers[i]._trigger("out", event, this._uiHash(this));
					this.containers[i].containerCache.over = 0;
				}
			}

		}

		// if no intersecting containers found, return
		if(!innermostContainer) {
			return;
		}

		// move the item into the container if it's not there already
		if(this.containers.length === 1) {
			if (!this.containers[innermostIndex].containerCache.over) {
				this.containers[innermostIndex]._trigger("over", event, this._uiHash(this));
				this.containers[innermostIndex].containerCache.over = 1;
			}
		} else {

			//When entering a new container, we will find the item with the least distance and append our item near it
			dist = 10000;
			itemWithLeastDistance = null;
			floating = innermostContainer.floating || isFloating(this.currentItem);
			posProperty = floating ? "left" : "top";
			sizeProperty = floating ? "width" : "height";
			base = this.positionAbs[posProperty] + this.offset.click[posProperty];
			for (j = this.items.length - 1; j >= 0; j--) {
				if(!$.contains(this.containers[innermostIndex].element[0], this.items[j].item[0])) {
					continue;
				}
				if(this.items[j].item[0] === this.currentItem[0]) {
					continue;
				}
				if (floating && !isOverAxis(this.positionAbs.top + this.offset.click.top, this.items[j].top, this.items[j].height)) {
					continue;
				}
				cur = this.items[j].item.offset()[posProperty];
				nearBottom = false;
				if(Math.abs(cur - base) > Math.abs(cur + this.items[j][sizeProperty] - base)){
					nearBottom = true;
					cur += this.items[j][sizeProperty];
				}

				if(Math.abs(cur - base) < dist) {
					dist = Math.abs(cur - base); itemWithLeastDistance = this.items[j];
					this.direction = nearBottom ? "up": "down";
				}
			}

			//Check if dropOnEmpty is enabled
			if(!itemWithLeastDistance && !this.options.dropOnEmpty) {
				return;
			}

			if(this.currentContainer === this.containers[innermostIndex]) {
				return;
			}

			itemWithLeastDistance ? this._rearrange(event, itemWithLeastDistance, null, true) : this._rearrange(event, null, this.containers[innermostIndex].element, true);
			this._trigger("change", event, this._uiHash());
			this.containers[innermostIndex]._trigger("change", event, this._uiHash(this));
			this.currentContainer = this.containers[innermostIndex];

			//Update the placeholder
			this.options.placeholder.update(this.currentContainer, this.placeholder);

			this.containers[innermostIndex]._trigger("over", event, this._uiHash(this));
			this.containers[innermostIndex].containerCache.over = 1;
		}


	},

	_createHelper: function(event) {

		var o = this.options,
			helper = $.isFunction(o.helper) ? $(o.helper.apply(this.element[0], [event, this.currentItem])) : (o.helper === "clone" ? this.currentItem.clone() : this.currentItem);

		//Add the helper to the DOM if that didn't happen already
		if(!helper.parents("body").length) {
			$(o.appendTo !== "parent" ? o.appendTo : this.currentItem[0].parentNode)[0].appendChild(helper[0]);
		}

		if(helper[0] === this.currentItem[0]) {
			this._storedCSS = { width: this.currentItem[0].style.width, height: this.currentItem[0].style.height, position: this.currentItem.css("position"), top: this.currentItem.css("top"), left: this.currentItem.css("left") };
		}

		if(!helper[0].style.width || o.forceHelperSize) {
			helper.width(this.currentItem.width());
		}
		if(!helper[0].style.height || o.forceHelperSize) {
			helper.height(this.currentItem.height());
		}

		return helper;

	},

	_adjustOffsetFromHelper: function(obj) {
		if (typeof obj === "string") {
			obj = obj.split(" ");
		}
		if ($.isArray(obj)) {
			obj = {left: +obj[0], top: +obj[1] || 0};
		}
		if ("left" in obj) {
			this.offset.click.left = obj.left + this.margins.left;
		}
		if ("right" in obj) {
			this.offset.click.left = this.helperProportions.width - obj.right + this.margins.left;
		}
		if ("top" in obj) {
			this.offset.click.top = obj.top + this.margins.top;
		}
		if ("bottom" in obj) {
			this.offset.click.top = this.helperProportions.height - obj.bottom + this.margins.top;
		}
	},

	_getParentOffset: function() {


		//Get the offsetParent and cache its position
		this.offsetParent = this.helper.offsetParent();
		var po = this.offsetParent.offset();

		// This is a special case where we need to modify a offset calculated on start, since the following happened:
		// 1. The position of the helper is absolute, so it's position is calculated based on the next positioned parent
		// 2. The actual offset parent is a child of the scroll parent, and the scroll parent isn't the document, which means that
		//    the scroll is included in the initial calculation of the offset of the parent, and never recalculated upon drag
		if(this.cssPosition === "absolute" && this.scrollParent[0] !== document && $.contains(this.scrollParent[0], this.offsetParent[0])) {
			po.left += this.scrollParent.scrollLeft();
			po.top += this.scrollParent.scrollTop();
		}

		// This needs to be actually done for all browsers, since pageX/pageY includes this information
		// with an ugly IE fix
		if( this.offsetParent[0] === document.body || (this.offsetParent[0].tagName && this.offsetParent[0].tagName.toLowerCase() === "html" && $.ui.ie)) {
			po = { top: 0, left: 0 };
		}

		return {
			top: po.top + (parseInt(this.offsetParent.css("borderTopWidth"),10) || 0),
			left: po.left + (parseInt(this.offsetParent.css("borderLeftWidth"),10) || 0)
		};

	},

	_getRelativeOffset: function() {

		if(this.cssPosition === "relative") {
			var p = this.currentItem.position();
			return {
				top: p.top - (parseInt(this.helper.css("top"),10) || 0) + this.scrollParent.scrollTop(),
				left: p.left - (parseInt(this.helper.css("left"),10) || 0) + this.scrollParent.scrollLeft()
			};
		} else {
			return { top: 0, left: 0 };
		}

	},

	_cacheMargins: function() {
		this.margins = {
			left: (parseInt(this.currentItem.css("marginLeft"),10) || 0),
			top: (parseInt(this.currentItem.css("marginTop"),10) || 0)
		};
	},

	_cacheHelperProportions: function() {
		this.helperProportions = {
			width: this.helper.outerWidth(),
			height: this.helper.outerHeight()
		};
	},

	_setContainment: function() {

		var ce, co, over,
			o = this.options;
		if(o.containment === "parent") {
			o.containment = this.helper[0].parentNode;
		}
		if(o.containment === "document" || o.containment === "window") {
			this.containment = [
				0 - this.offset.relative.left - this.offset.parent.left,
				0 - this.offset.relative.top - this.offset.parent.top,
				$(o.containment === "document" ? document : window).width() - this.helperProportions.width - this.margins.left,
				($(o.containment === "document" ? document : window).height() || document.body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top
			];
		}

		if(!(/^(document|window|parent)$/).test(o.containment)) {
			ce = $(o.containment)[0];
			co = $(o.containment).offset();
			over = ($(ce).css("overflow") !== "hidden");

			this.containment = [
				co.left + (parseInt($(ce).css("borderLeftWidth"),10) || 0) + (parseInt($(ce).css("paddingLeft"),10) || 0) - this.margins.left,
				co.top + (parseInt($(ce).css("borderTopWidth"),10) || 0) + (parseInt($(ce).css("paddingTop"),10) || 0) - this.margins.top,
				co.left+(over ? Math.max(ce.scrollWidth,ce.offsetWidth) : ce.offsetWidth) - (parseInt($(ce).css("borderLeftWidth"),10) || 0) - (parseInt($(ce).css("paddingRight"),10) || 0) - this.helperProportions.width - this.margins.left,
				co.top+(over ? Math.max(ce.scrollHeight,ce.offsetHeight) : ce.offsetHeight) - (parseInt($(ce).css("borderTopWidth"),10) || 0) - (parseInt($(ce).css("paddingBottom"),10) || 0) - this.helperProportions.height - this.margins.top
			];
		}

	},

	_convertPositionTo: function(d, pos) {

		if(!pos) {
			pos = this.position;
		}
		var mod = d === "absolute" ? 1 : -1,
			scroll = this.cssPosition === "absolute" && !(this.scrollParent[0] !== document && $.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent,
			scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);

		return {
			top: (
				pos.top	+																// The absolute mouse position
				this.offset.relative.top * mod +										// Only for relative positioned nodes: Relative offset from element to offset parent
				this.offset.parent.top * mod -											// The offsetParent's offset without borders (offset + border)
				( ( this.cssPosition === "fixed" ? -this.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) ) * mod)
			),
			left: (
				pos.left +																// The absolute mouse position
				this.offset.relative.left * mod +										// Only for relative positioned nodes: Relative offset from element to offset parent
				this.offset.parent.left * mod	-										// The offsetParent's offset without borders (offset + border)
				( ( this.cssPosition === "fixed" ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() ) * mod)
			)
		};

	},

	_generatePosition: function(event) {

		var top, left,
			o = this.options,
			pageX = event.pageX,
			pageY = event.pageY,
			scroll = this.cssPosition === "absolute" && !(this.scrollParent[0] !== document && $.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent, scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);

		// This is another very weird special case that only happens for relative elements:
		// 1. If the css position is relative
		// 2. and the scroll parent is the document or similar to the offset parent
		// we have to refresh the relative offset during the scroll so there are no jumps
		if(this.cssPosition === "relative" && !(this.scrollParent[0] !== document && this.scrollParent[0] !== this.offsetParent[0])) {
			this.offset.relative = this._getRelativeOffset();
		}

		/*
		 * - Position constraining -
		 * Constrain the position to a mix of grid, containment.
		 */

		if(this.originalPosition) { //If we are not dragging yet, we won't check for options

			if(this.containment) {
				if(event.pageX - this.offset.click.left < this.containment[0]) {
					pageX = this.containment[0] + this.offset.click.left;
				}
				if(event.pageY - this.offset.click.top < this.containment[1]) {
					pageY = this.containment[1] + this.offset.click.top;
				}
				if(event.pageX - this.offset.click.left > this.containment[2]) {
					pageX = this.containment[2] + this.offset.click.left;
				}
				if(event.pageY - this.offset.click.top > this.containment[3]) {
					pageY = this.containment[3] + this.offset.click.top;
				}
			}

			if(o.grid) {
				top = this.originalPageY + Math.round((pageY - this.originalPageY) / o.grid[1]) * o.grid[1];
				pageY = this.containment ? ( (top - this.offset.click.top >= this.containment[1] && top - this.offset.click.top <= this.containment[3]) ? top : ((top - this.offset.click.top >= this.containment[1]) ? top - o.grid[1] : top + o.grid[1])) : top;

				left = this.originalPageX + Math.round((pageX - this.originalPageX) / o.grid[0]) * o.grid[0];
				pageX = this.containment ? ( (left - this.offset.click.left >= this.containment[0] && left - this.offset.click.left <= this.containment[2]) ? left : ((left - this.offset.click.left >= this.containment[0]) ? left - o.grid[0] : left + o.grid[0])) : left;
			}

		}

		return {
			top: (
				pageY -																// The absolute mouse position
				this.offset.click.top -													// Click offset (relative to the element)
				this.offset.relative.top	-											// Only for relative positioned nodes: Relative offset from element to offset parent
				this.offset.parent.top +												// The offsetParent's offset without borders (offset + border)
				( ( this.cssPosition === "fixed" ? -this.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) ))
			),
			left: (
				pageX -																// The absolute mouse position
				this.offset.click.left -												// Click offset (relative to the element)
				this.offset.relative.left	-											// Only for relative positioned nodes: Relative offset from element to offset parent
				this.offset.parent.left +												// The offsetParent's offset without borders (offset + border)
				( ( this.cssPosition === "fixed" ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() ))
			)
		};

	},

	_rearrange: function(event, i, a, hardRefresh) {

		a ? a[0].appendChild(this.placeholder[0]) : i.item[0].parentNode.insertBefore(this.placeholder[0], (this.direction === "down" ? i.item[0] : i.item[0].nextSibling));

		//Various things done here to improve the performance:
		// 1. we create a setTimeout, that calls refreshPositions
		// 2. on the instance, we have a counter variable, that get's higher after every append
		// 3. on the local scope, we copy the counter variable, and check in the timeout, if it's still the same
		// 4. this lets only the last addition to the timeout stack through
		this.counter = this.counter ? ++this.counter : 1;
		var counter = this.counter;

		this._delay(function() {
			if(counter === this.counter) {
				this.refreshPositions(!hardRefresh); //Precompute after each DOM insertion, NOT on mousemove
			}
		});

	},

	_clear: function(event, noPropagation) {

		this.reverting = false;
		// We delay all events that have to be triggered to after the point where the placeholder has been removed and
		// everything else normalized again
		var i,
			delayedTriggers = [];

		// We first have to update the dom position of the actual currentItem
		// Note: don't do it if the current item is already removed (by a user), or it gets reappended (see #4088)
		if(!this._noFinalSort && this.currentItem.parent().length) {
			this.placeholder.before(this.currentItem);
		}
		this._noFinalSort = null;

		if(this.helper[0] === this.currentItem[0]) {
			for(i in this._storedCSS) {
				if(this._storedCSS[i] === "auto" || this._storedCSS[i] === "static") {
					this._storedCSS[i] = "";
				}
			}
			this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper");
		} else {
			this.currentItem.show();
		}

		if(this.fromOutside && !noPropagation) {
			delayedTriggers.push(function(event) { this._trigger("receive", event, this._uiHash(this.fromOutside)); });
		}
		if((this.fromOutside || this.domPosition.prev !== this.currentItem.prev().not(".ui-sortable-helper")[0] || this.domPosition.parent !== this.currentItem.parent()[0]) && !noPropagation) {
			delayedTriggers.push(function(event) { this._trigger("update", event, this._uiHash()); }); //Trigger update callback if the DOM position has changed
		}

		// Check if the items Container has Changed and trigger appropriate
		// events.
		if (this !== this.currentContainer) {
			if(!noPropagation) {
				delayedTriggers.push(function(event) { this._trigger("remove", event, this._uiHash()); });
				delayedTriggers.push((function(c) { return function(event) { c._trigger("receive", event, this._uiHash(this)); };  }).call(this, this.currentContainer));
				delayedTriggers.push((function(c) { return function(event) { c._trigger("update", event, this._uiHash(this));  }; }).call(this, this.currentContainer));
			}
		}


		//Post events to containers
		function delayEvent( type, instance, container ) {
			return function( event ) {
				container._trigger( type, event, instance._uiHash( instance ) );
			};
		}
		for (i = this.containers.length - 1; i >= 0; i--){
			if (!noPropagation) {
				delayedTriggers.push( delayEvent( "deactivate", this, this.containers[ i ] ) );
			}
			if(this.containers[i].containerCache.over) {
				delayedTriggers.push( delayEvent( "out", this, this.containers[ i ] ) );
				this.containers[i].containerCache.over = 0;
			}
		}

		//Do what was originally in plugins
		if ( this.storedCursor ) {
			this.document.find( "body" ).css( "cursor", this.storedCursor );
			this.storedStylesheet.remove();
		}
		if(this._storedOpacity) {
			this.helper.css("opacity", this._storedOpacity);
		}
		if(this._storedZIndex) {
			this.helper.css("zIndex", this._storedZIndex === "auto" ? "" : this._storedZIndex);
		}

		this.dragging = false;
		if(this.cancelHelperRemoval) {
			if(!noPropagation) {
				this._trigger("beforeStop", event, this._uiHash());
				for (i=0; i < delayedTriggers.length; i++) {
					delayedTriggers[i].call(this, event);
				} //Trigger all delayed events
				this._trigger("stop", event, this._uiHash());
			}

			this.fromOutside = false;
			return false;
		}

		if(!noPropagation) {
			this._trigger("beforeStop", event, this._uiHash());
		}

		//$(this.placeholder[0]).remove(); would have been the jQuery way - unfortunately, it unbinds ALL events from the original node!
		this.placeholder[0].parentNode.removeChild(this.placeholder[0]);

		if(this.helper[0] !== this.currentItem[0]) {
			this.helper.remove();
		}
		this.helper = null;

		if(!noPropagation) {
			for (i=0; i < delayedTriggers.length; i++) {
				delayedTriggers[i].call(this, event);
			} //Trigger all delayed events
			this._trigger("stop", event, this._uiHash());
		}

		this.fromOutside = false;
		return true;

	},

	_trigger: function() {
		if ($.Widget.prototype._trigger.apply(this, arguments) === false) {
			this.cancel();
		}
	},

	_uiHash: function(_inst) {
		var inst = _inst || this;
		return {
			helper: inst.helper,
			placeholder: inst.placeholder || $([]),
			position: inst.position,
			originalPosition: inst.originalPosition,
			offset: inst.positionAbs,
			item: inst.currentItem,
			sender: _inst ? _inst.element : null
		};
	}

});

})(jQuery);

/*
 * jQuery UI Nested Sortable
 * v 1.3.4 / 28 apr 2011
 * http://mjsarfatti.com/sandbox/nestedSortable
 *
 * Depends:
 *	 jquery.ui.sortable.js 1.8+
 *
 * License CC BY-SA 3.0
 * Copyright 2010-2011, Manuele J Sarfatti
 */

(function($) {

	$.widget("ui.nestedSortable", $.extend({}, $.ui.sortable.prototype, {

		options: {
			tabSize: 20,
			disableNesting: 'ui-nestedSortable-no-nesting',
			errorClass: 'ui-nestedSortable-error',
			listType: 'ol',
			maxLevels: 0,
			noJumpFix: 0
		},

		_create: function(){
			if (this.noJumpFix == false)
				this.element.height(this.element.height());
			this.element.data('sortable', this.element.data('nestedSortable'));
			return $.ui.sortable.prototype._create.apply(this, arguments);
		},



		_mouseDrag: function(event) {

			//Compute the helpers position
			this.position = this._generatePosition(event);
			this.positionAbs = this._convertPositionTo("absolute");

			if (!this.lastPositionAbs) {
				this.lastPositionAbs = this.positionAbs;
			}

			//Do scrolling
			if(this.options.scroll) {
				var o = this.options, scrolled = false;
				if(this.scrollParent[0] != document && this.scrollParent[0].tagName != 'HTML') {

					if((this.overflowOffset.top + this.scrollParent[0].offsetHeight) - event.pageY < o.scrollSensitivity)
						this.scrollParent[0].scrollTop = scrolled = this.scrollParent[0].scrollTop + o.scrollSpeed;
					else if(event.pageY - this.overflowOffset.top < o.scrollSensitivity)
						this.scrollParent[0].scrollTop = scrolled = this.scrollParent[0].scrollTop - o.scrollSpeed;

					if((this.overflowOffset.left + this.scrollParent[0].offsetWidth) - event.pageX < o.scrollSensitivity)
						this.scrollParent[0].scrollLeft = scrolled = this.scrollParent[0].scrollLeft + o.scrollSpeed;
					else if(event.pageX - this.overflowOffset.left < o.scrollSensitivity)
						this.scrollParent[0].scrollLeft = scrolled = this.scrollParent[0].scrollLeft - o.scrollSpeed;

				} else {

					if(event.pageY - $(document).scrollTop() < o.scrollSensitivity)
						scrolled = $(document).scrollTop($(document).scrollTop() - o.scrollSpeed);
					else if($(window).height() - (event.pageY - $(document).scrollTop()) < o.scrollSensitivity)
						scrolled = $(document).scrollTop($(document).scrollTop() + o.scrollSpeed);

					if(event.pageX - $(document).scrollLeft() < o.scrollSensitivity)
						scrolled = $(document).scrollLeft($(document).scrollLeft() - o.scrollSpeed);
					else if($(window).width() - (event.pageX - $(document).scrollLeft()) < o.scrollSensitivity)
						scrolled = $(document).scrollLeft($(document).scrollLeft() + o.scrollSpeed);

				}

				if(scrolled !== false && $.ui.ddmanager && !o.dropBehaviour)
					$.ui.ddmanager.prepareOffsets(this, event);
			}

			//Regenerate the absolute position used for position checks
			this.positionAbs = this._convertPositionTo("absolute");

			//Set the helper position
			if(!this.options.axis || this.options.axis != "y") this.helper[0].style.left = this.position.left+'px';
			if(!this.options.axis || this.options.axis != "x") this.helper[0].style.top = this.position.top+'px';

			//Rearrange
			for (var i = this.items.length - 1; i >= 0; i--) {

				//Cache variables and intersection, continue if no intersection
				var item = this.items[i], itemElement = item.item[0], intersection = this._intersectsWithPointer(item);
				if (!intersection) continue;

				if(itemElement != this.currentItem[0] //cannot intersect with itself
					&&	this.placeholder[intersection == 1 ? "next" : "prev"]()[0] != itemElement //no useless actions that have been done before
					&&	!$.contains(this.placeholder[0], itemElement) //no action if the item moved is the parent of the item checked
					&& (this.options.type == 'semi-dynamic' ? !$.contains(this.element[0], itemElement) : true)
					//&& itemElement.parentNode == this.placeholder[0].parentNode // only rearrange items within the same container
				) {

					this.direction = intersection == 1 ? "down" : "up";

					if (this.options.tolerance == "pointer" || this._intersectsWithSides(item)) {
						this._rearrange(event, item);
					} else {
						break;
					}

					// Clear emtpy ul's/ol's
					this._clearEmpty(itemElement);

					this._trigger("change", event, this._uiHash());
					break;
				}
			}

			var parentItem = (this.placeholder[0].parentNode.parentNode && $(this.placeholder[0].parentNode.parentNode).closest('.ui-sortable').length) ? $(this.placeholder[0].parentNode.parentNode) : null;
			var level = this._getLevel(this.placeholder);
			var childLevels = this._getChildLevels(this.helper);
			var previousItem = this.placeholder[0].previousSibling ? $(this.placeholder[0].previousSibling) : null;
			if (previousItem != null) {
				while (previousItem[0].nodeName.toLowerCase() != 'li' || previousItem[0] == this.currentItem[0]) {
					if (previousItem[0].previousSibling) {
						previousItem = $(previousItem[0].previousSibling);
					} else {
						previousItem = null;
						break;
					}
				}
			}

			newList = document.createElement(o.listType);

			this.beyondMaxLevels = 0;

			// If the item is moved to the left, send it to its parent level
			if (parentItem != null && this.positionAbs.left < parentItem.offset().left) {
				parentItem.after(this.placeholder[0]);
				this._clearEmpty(parentItem[0]);
				this._trigger("change", event, this._uiHash());
			}
			// If the item is below another one and is moved to the right, make it a children of it
			else if (previousItem != null && this.positionAbs.left > previousItem.offset().left + o.tabSize) {
				this._isAllowed(previousItem, level+childLevels+1);
				if (previousItem[0].children[1] == null) {
					previousItem[0].appendChild(newList);
				}
				previousItem[0].children[1].appendChild(this.placeholder[0]);
				this._trigger("change", event, this._uiHash());
			}
			else {
				this._isAllowed(parentItem, level+childLevels);
			}

			//Post events to containers
			this._contactContainers(event);

			//Interconnect with droppables
			if($.ui.ddmanager) $.ui.ddmanager.drag(this, event);

			//Call callbacks
			this._trigger('sort', event, this._uiHash());

			this.lastPositionAbs = this.positionAbs;
			return false;

		},

		_mouseStop: function(event, noPropagation) {

			// If the item is in a position not allowed, send it back
			if (this.beyondMaxLevels) {
				var parent = this.placeholder.parent().closest(this.options.items);
				
				for (var i = this.beyondMaxLevels - 1; i > 0; i--) {
					parent = parent.parent().closest(this.options.items);
				}

				this.placeholder.removeClass(this.options.errorClass);
				parent.after(this.placeholder);
				this._trigger("change", event, this._uiHash());
			}

			$.ui.sortable.prototype._mouseStop.apply(this, arguments);

		},

		serialize: function(o) {

			var items = this._getItemsAsjQuery(o && o.connected);
			var str = []; o = o || {};

			$(items).each(function() {
				var res = ($(o.item || this).attr(o.attribute || 'id') || '').match(o.expression || (/(.+)[-=_](.+)/));
				var pid = ($(o.item || this).parent(o.listType).parent('li').attr(o.attribute || 'id') || '').match(o.expression || (/(.+)[-=_](.+)/));
				if(res) str.push((o.key || res[1]+'['+(o.key && o.expression ? res[1] : res[2])+']')+'='+(pid ? (o.key && o.expression ? pid[1] : pid[2]) : 'root'));
			});

			if(!str.length && o.key) {
				str.push(o.key + '=');
			}

			return str.join('&');

		},

		toHierarchy: function(o) {

			o = o || {};
			var sDepth = o.startDepthCount || 0;
			var ret = [];

			$(this.element).children('li').each(function() {
				var level = _recursiveItems($(this));
				ret.push(level);
			});

			return ret;

			function _recursiveItems(li) {
				var id = ($(li).attr(o.attribute || 'id') || '').match(o.expression || (/(.+)[-=_](.+)/));
				if (id != null) {
					var item = {"id" : id[2]};
					if ($(li).children(o.listType).children('li').length > 0) {
						item.children = [];
						$(li).children(o.listType).children('li').each(function () {
							var level = _recursiveItems($(this));
							item.children.push(level);
						});
					}
					return item;
				}
			}
        },

		toArray: function(o) {

			o = o || {};
			var sDepth = o.startDepthCount || 0;
			var ret = [];
			var left = 2;

			ret.push({"item_id": 'root', "parent_id": 'none', "depth": sDepth, "left": '1', "right": ($('li', this.element).length + 1) * 2});

			$(this.element).children('li').each(function () {
				left = _recursiveArray(this, sDepth + 1, left);
			});

			function _sortByLeft(a,b) {
				return a['left'] - b['left'];
			}
			ret = ret.sort(_sortByLeft);

			return ret;

			function _recursiveArray(item, depth, left) {

				right = left + 1;

				if ($(item).children(o.listType).children('li').length > 0) {
					depth ++;
					$(item).children(o.listType).children('li').each(function () {
						right = _recursiveArray($(this), depth, right);
					});
					depth --;
				}

				id = ($(item).attr(o.attribute || 'id')).match(o.expression || (/(.+)[-=_](.+)/));

				if (depth === sDepth + 1) pid = 'root';
				else {
					parentItem = ($(item).parent(o.listType).parent('li').attr('id')).match(o.expression || (/(.+)[-=_](.+)/));
					pid = parentItem[2];
				}

				if (id != null) {
						ret.push({"item_id": id[2], "parent_id": pid, "depth": depth, "left": left, "right": right});
				}

				return left = right + 1;
			}

		},

		_clear: function(event, noPropagation) {

			$.ui.sortable.prototype._clear.apply(this, arguments);

			// Clean last empty ul/ol
			for (var i = this.items.length - 1; i >= 0; i--) {
				var item = this.items[i].item[0];
				this._clearEmpty(item);
			}
			return true;

		},

		_clearEmpty: function(item) {

			if (item.children[1] && item.children[1].children.length == 0) {
				item.removeChild(item.children[1]);
			}

		},

		_getLevel: function(item) {

			var level = 1;

			if (this.options.listType) {
					var list = item.closest(this.options.listType);
					while (!list.is('.ui-sortable')/* && level < this.options.maxLevels*/) {
							level++;
							list = list.parent().closest(this.options.listType);
					}
			}

			return level;
		},

		_getChildLevels: function(parent, depth) {
			var self = this,
			    o = this.options,
			    result = 0;
			depth = depth || 0;

			$(parent).children(o.listType).children(o.items).each(function (index, child) {
					result = Math.max(self._getChildLevels(child, depth + 1), result);
			});

			return depth ? result + 1 : result;
		},

		_isAllowed: function(parentItem, levels) {
			var o = this.options
			// Are we trying to nest under a no-nest or are we nesting too deep?
			if (parentItem == null || !(parentItem.hasClass(o.disableNesting))) {
				if (o.maxLevels < levels && o.maxLevels != 0) {
					this.placeholder.addClass(o.errorClass);
					this.beyondMaxLevels = levels - o.maxLevels;
				} else {
					this.placeholder.removeClass(o.errorClass);
					this.beyondMaxLevels = 0;
				}
			} else {
				this.placeholder.addClass(o.errorClass);
				this.beyondMaxLevels = (levels - o.maxLevels) > 0 ? levels - o.maxLevels : 1;
			}
		}

	}));

	$.ui.nestedSortable.prototype.options = $.extend({}, $.ui.sortable.prototype.options, $.ui.nestedSortable.prototype.options);
})(jQuery);
//     Underscore.js 1.5.2
//     http://underscorejs.org
//     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.
(function(){var n=this,t=n._,r={},e=Array.prototype,u=Object.prototype,i=Function.prototype,a=e.push,o=e.slice,c=e.concat,l=u.toString,f=u.hasOwnProperty,s=e.forEach,p=e.map,h=e.reduce,v=e.reduceRight,g=e.filter,d=e.every,m=e.some,y=e.indexOf,b=e.lastIndexOf,x=Array.isArray,w=Object.keys,_=i.bind,j=function(n){return n instanceof j?n:this instanceof j?(this._wrapped=n,void 0):new j(n)};"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(exports=module.exports=j),exports._=j):n._=j,j.VERSION="1.5.2";var A=j.each=j.forEach=function(n,t,e){if(null!=n)if(s&&n.forEach===s)n.forEach(t,e);else if(n.length===+n.length){for(var u=0,i=n.length;i>u;u++)if(t.call(e,n[u],u,n)===r)return}else for(var a=j.keys(n),u=0,i=a.length;i>u;u++)if(t.call(e,n[a[u]],a[u],n)===r)return};j.map=j.collect=function(n,t,r){var e=[];return null==n?e:p&&n.map===p?n.map(t,r):(A(n,function(n,u,i){e.push(t.call(r,n,u,i))}),e)};var E="Reduce of empty array with no initial value";j.reduce=j.foldl=j.inject=function(n,t,r,e){var u=arguments.length>2;if(null==n&&(n=[]),h&&n.reduce===h)return e&&(t=j.bind(t,e)),u?n.reduce(t,r):n.reduce(t);if(A(n,function(n,i,a){u?r=t.call(e,r,n,i,a):(r=n,u=!0)}),!u)throw new TypeError(E);return r},j.reduceRight=j.foldr=function(n,t,r,e){var u=arguments.length>2;if(null==n&&(n=[]),v&&n.reduceRight===v)return e&&(t=j.bind(t,e)),u?n.reduceRight(t,r):n.reduceRight(t);var i=n.length;if(i!==+i){var a=j.keys(n);i=a.length}if(A(n,function(o,c,l){c=a?a[--i]:--i,u?r=t.call(e,r,n[c],c,l):(r=n[c],u=!0)}),!u)throw new TypeError(E);return r},j.find=j.detect=function(n,t,r){var e;return O(n,function(n,u,i){return t.call(r,n,u,i)?(e=n,!0):void 0}),e},j.filter=j.select=function(n,t,r){var e=[];return null==n?e:g&&n.filter===g?n.filter(t,r):(A(n,function(n,u,i){t.call(r,n,u,i)&&e.push(n)}),e)},j.reject=function(n,t,r){return j.filter(n,function(n,e,u){return!t.call(r,n,e,u)},r)},j.every=j.all=function(n,t,e){t||(t=j.identity);var u=!0;return null==n?u:d&&n.every===d?n.every(t,e):(A(n,function(n,i,a){return(u=u&&t.call(e,n,i,a))?void 0:r}),!!u)};var O=j.some=j.any=function(n,t,e){t||(t=j.identity);var u=!1;return null==n?u:m&&n.some===m?n.some(t,e):(A(n,function(n,i,a){return u||(u=t.call(e,n,i,a))?r:void 0}),!!u)};j.contains=j.include=function(n,t){return null==n?!1:y&&n.indexOf===y?n.indexOf(t)!=-1:O(n,function(n){return n===t})},j.invoke=function(n,t){var r=o.call(arguments,2),e=j.isFunction(t);return j.map(n,function(n){return(e?t:n[t]).apply(n,r)})},j.pluck=function(n,t){return j.map(n,function(n){return n[t]})},j.where=function(n,t,r){return j.isEmpty(t)?r?void 0:[]:j[r?"find":"filter"](n,function(n){for(var r in t)if(t[r]!==n[r])return!1;return!0})},j.findWhere=function(n,t){return j.where(n,t,!0)},j.max=function(n,t,r){if(!t&&j.isArray(n)&&n[0]===+n[0]&&n.length<65535)return Math.max.apply(Math,n);if(!t&&j.isEmpty(n))return-1/0;var e={computed:-1/0,value:-1/0};return A(n,function(n,u,i){var a=t?t.call(r,n,u,i):n;a>e.computed&&(e={value:n,computed:a})}),e.value},j.min=function(n,t,r){if(!t&&j.isArray(n)&&n[0]===+n[0]&&n.length<65535)return Math.min.apply(Math,n);if(!t&&j.isEmpty(n))return 1/0;var e={computed:1/0,value:1/0};return A(n,function(n,u,i){var a=t?t.call(r,n,u,i):n;a<e.computed&&(e={value:n,computed:a})}),e.value},j.shuffle=function(n){var t,r=0,e=[];return A(n,function(n){t=j.random(r++),e[r-1]=e[t],e[t]=n}),e},j.sample=function(n,t,r){return arguments.length<2||r?n[j.random(n.length-1)]:j.shuffle(n).slice(0,Math.max(0,t))};var k=function(n){return j.isFunction(n)?n:function(t){return t[n]}};j.sortBy=function(n,t,r){var e=k(t);return j.pluck(j.map(n,function(n,t,u){return{value:n,index:t,criteria:e.call(r,n,t,u)}}).sort(function(n,t){var r=n.criteria,e=t.criteria;if(r!==e){if(r>e||r===void 0)return 1;if(e>r||e===void 0)return-1}return n.index-t.index}),"value")};var F=function(n){return function(t,r,e){var u={},i=null==r?j.identity:k(r);return A(t,function(r,a){var o=i.call(e,r,a,t);n(u,o,r)}),u}};j.groupBy=F(function(n,t,r){(j.has(n,t)?n[t]:n[t]=[]).push(r)}),j.indexBy=F(function(n,t,r){n[t]=r}),j.countBy=F(function(n,t){j.has(n,t)?n[t]++:n[t]=1}),j.sortedIndex=function(n,t,r,e){r=null==r?j.identity:k(r);for(var u=r.call(e,t),i=0,a=n.length;a>i;){var o=i+a>>>1;r.call(e,n[o])<u?i=o+1:a=o}return i},j.toArray=function(n){return n?j.isArray(n)?o.call(n):n.length===+n.length?j.map(n,j.identity):j.values(n):[]},j.size=function(n){return null==n?0:n.length===+n.length?n.length:j.keys(n).length},j.first=j.head=j.take=function(n,t,r){return null==n?void 0:null==t||r?n[0]:o.call(n,0,t)},j.initial=function(n,t,r){return o.call(n,0,n.length-(null==t||r?1:t))},j.last=function(n,t,r){return null==n?void 0:null==t||r?n[n.length-1]:o.call(n,Math.max(n.length-t,0))},j.rest=j.tail=j.drop=function(n,t,r){return o.call(n,null==t||r?1:t)},j.compact=function(n){return j.filter(n,j.identity)};var M=function(n,t,r){return t&&j.every(n,j.isArray)?c.apply(r,n):(A(n,function(n){j.isArray(n)||j.isArguments(n)?t?a.apply(r,n):M(n,t,r):r.push(n)}),r)};j.flatten=function(n,t){return M(n,t,[])},j.without=function(n){return j.difference(n,o.call(arguments,1))},j.uniq=j.unique=function(n,t,r,e){j.isFunction(t)&&(e=r,r=t,t=!1);var u=r?j.map(n,r,e):n,i=[],a=[];return A(u,function(r,e){(t?e&&a[a.length-1]===r:j.contains(a,r))||(a.push(r),i.push(n[e]))}),i},j.union=function(){return j.uniq(j.flatten(arguments,!0))},j.intersection=function(n){var t=o.call(arguments,1);return j.filter(j.uniq(n),function(n){return j.every(t,function(t){return j.indexOf(t,n)>=0})})},j.difference=function(n){var t=c.apply(e,o.call(arguments,1));return j.filter(n,function(n){return!j.contains(t,n)})},j.zip=function(){for(var n=j.max(j.pluck(arguments,"length").concat(0)),t=new Array(n),r=0;n>r;r++)t[r]=j.pluck(arguments,""+r);return t},j.object=function(n,t){if(null==n)return{};for(var r={},e=0,u=n.length;u>e;e++)t?r[n[e]]=t[e]:r[n[e][0]]=n[e][1];return r},j.indexOf=function(n,t,r){if(null==n)return-1;var e=0,u=n.length;if(r){if("number"!=typeof r)return e=j.sortedIndex(n,t),n[e]===t?e:-1;e=0>r?Math.max(0,u+r):r}if(y&&n.indexOf===y)return n.indexOf(t,r);for(;u>e;e++)if(n[e]===t)return e;return-1},j.lastIndexOf=function(n,t,r){if(null==n)return-1;var e=null!=r;if(b&&n.lastIndexOf===b)return e?n.lastIndexOf(t,r):n.lastIndexOf(t);for(var u=e?r:n.length;u--;)if(n[u]===t)return u;return-1},j.range=function(n,t,r){arguments.length<=1&&(t=n||0,n=0),r=arguments[2]||1;for(var e=Math.max(Math.ceil((t-n)/r),0),u=0,i=new Array(e);e>u;)i[u++]=n,n+=r;return i};var R=function(){};j.bind=function(n,t){var r,e;if(_&&n.bind===_)return _.apply(n,o.call(arguments,1));if(!j.isFunction(n))throw new TypeError;return r=o.call(arguments,2),e=function(){if(!(this instanceof e))return n.apply(t,r.concat(o.call(arguments)));R.prototype=n.prototype;var u=new R;R.prototype=null;var i=n.apply(u,r.concat(o.call(arguments)));return Object(i)===i?i:u}},j.partial=function(n){var t=o.call(arguments,1);return function(){return n.apply(this,t.concat(o.call(arguments)))}},j.bindAll=function(n){var t=o.call(arguments,1);if(0===t.length)throw new Error("bindAll must be passed function names");return A(t,function(t){n[t]=j.bind(n[t],n)}),n},j.memoize=function(n,t){var r={};return t||(t=j.identity),function(){var e=t.apply(this,arguments);return j.has(r,e)?r[e]:r[e]=n.apply(this,arguments)}},j.delay=function(n,t){var r=o.call(arguments,2);return setTimeout(function(){return n.apply(null,r)},t)},j.defer=function(n){return j.delay.apply(j,[n,1].concat(o.call(arguments,1)))},j.throttle=function(n,t,r){var e,u,i,a=null,o=0;r||(r={});var c=function(){o=r.leading===!1?0:new Date,a=null,i=n.apply(e,u)};return function(){var l=new Date;o||r.leading!==!1||(o=l);var f=t-(l-o);return e=this,u=arguments,0>=f?(clearTimeout(a),a=null,o=l,i=n.apply(e,u)):a||r.trailing===!1||(a=setTimeout(c,f)),i}},j.debounce=function(n,t,r){var e,u,i,a,o;return function(){i=this,u=arguments,a=new Date;var c=function(){var l=new Date-a;t>l?e=setTimeout(c,t-l):(e=null,r||(o=n.apply(i,u)))},l=r&&!e;return e||(e=setTimeout(c,t)),l&&(o=n.apply(i,u)),o}},j.once=function(n){var t,r=!1;return function(){return r?t:(r=!0,t=n.apply(this,arguments),n=null,t)}},j.wrap=function(n,t){return function(){var r=[n];return a.apply(r,arguments),t.apply(this,r)}},j.compose=function(){var n=arguments;return function(){for(var t=arguments,r=n.length-1;r>=0;r--)t=[n[r].apply(this,t)];return t[0]}},j.after=function(n,t){return function(){return--n<1?t.apply(this,arguments):void 0}},j.keys=w||function(n){if(n!==Object(n))throw new TypeError("Invalid object");var t=[];for(var r in n)j.has(n,r)&&t.push(r);return t},j.values=function(n){for(var t=j.keys(n),r=t.length,e=new Array(r),u=0;r>u;u++)e[u]=n[t[u]];return e},j.pairs=function(n){for(var t=j.keys(n),r=t.length,e=new Array(r),u=0;r>u;u++)e[u]=[t[u],n[t[u]]];return e},j.invert=function(n){for(var t={},r=j.keys(n),e=0,u=r.length;u>e;e++)t[n[r[e]]]=r[e];return t},j.functions=j.methods=function(n){var t=[];for(var r in n)j.isFunction(n[r])&&t.push(r);return t.sort()},j.extend=function(n){return A(o.call(arguments,1),function(t){if(t)for(var r in t)n[r]=t[r]}),n},j.pick=function(n){var t={},r=c.apply(e,o.call(arguments,1));return A(r,function(r){r in n&&(t[r]=n[r])}),t},j.omit=function(n){var t={},r=c.apply(e,o.call(arguments,1));for(var u in n)j.contains(r,u)||(t[u]=n[u]);return t},j.defaults=function(n){return A(o.call(arguments,1),function(t){if(t)for(var r in t)n[r]===void 0&&(n[r]=t[r])}),n},j.clone=function(n){return j.isObject(n)?j.isArray(n)?n.slice():j.extend({},n):n},j.tap=function(n,t){return t(n),n};var S=function(n,t,r,e){if(n===t)return 0!==n||1/n==1/t;if(null==n||null==t)return n===t;n instanceof j&&(n=n._wrapped),t instanceof j&&(t=t._wrapped);var u=l.call(n);if(u!=l.call(t))return!1;switch(u){case"[object String]":return n==String(t);case"[object Number]":return n!=+n?t!=+t:0==n?1/n==1/t:n==+t;case"[object Date]":case"[object Boolean]":return+n==+t;case"[object RegExp]":return n.source==t.source&&n.global==t.global&&n.multiline==t.multiline&&n.ignoreCase==t.ignoreCase}if("object"!=typeof n||"object"!=typeof t)return!1;for(var i=r.length;i--;)if(r[i]==n)return e[i]==t;var a=n.constructor,o=t.constructor;if(a!==o&&!(j.isFunction(a)&&a instanceof a&&j.isFunction(o)&&o instanceof o))return!1;r.push(n),e.push(t);var c=0,f=!0;if("[object Array]"==u){if(c=n.length,f=c==t.length)for(;c--&&(f=S(n[c],t[c],r,e)););}else{for(var s in n)if(j.has(n,s)&&(c++,!(f=j.has(t,s)&&S(n[s],t[s],r,e))))break;if(f){for(s in t)if(j.has(t,s)&&!c--)break;f=!c}}return r.pop(),e.pop(),f};j.isEqual=function(n,t){return S(n,t,[],[])},j.isEmpty=function(n){if(null==n)return!0;if(j.isArray(n)||j.isString(n))return 0===n.length;for(var t in n)if(j.has(n,t))return!1;return!0},j.isElement=function(n){return!(!n||1!==n.nodeType)},j.isArray=x||function(n){return"[object Array]"==l.call(n)},j.isObject=function(n){return n===Object(n)},A(["Arguments","Function","String","Number","Date","RegExp"],function(n){j["is"+n]=function(t){return l.call(t)=="[object "+n+"]"}}),j.isArguments(arguments)||(j.isArguments=function(n){return!(!n||!j.has(n,"callee"))}),"function"!=typeof/./&&(j.isFunction=function(n){return"function"==typeof n}),j.isFinite=function(n){return isFinite(n)&&!isNaN(parseFloat(n))},j.isNaN=function(n){return j.isNumber(n)&&n!=+n},j.isBoolean=function(n){return n===!0||n===!1||"[object Boolean]"==l.call(n)},j.isNull=function(n){return null===n},j.isUndefined=function(n){return n===void 0},j.has=function(n,t){return f.call(n,t)},j.noConflict=function(){return n._=t,this},j.identity=function(n){return n},j.times=function(n,t,r){for(var e=Array(Math.max(0,n)),u=0;n>u;u++)e[u]=t.call(r,u);return e},j.random=function(n,t){return null==t&&(t=n,n=0),n+Math.floor(Math.random()*(t-n+1))};var I={escape:{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;"}};I.unescape=j.invert(I.escape);var T={escape:new RegExp("["+j.keys(I.escape).join("")+"]","g"),unescape:new RegExp("("+j.keys(I.unescape).join("|")+")","g")};j.each(["escape","unescape"],function(n){j[n]=function(t){return null==t?"":(""+t).replace(T[n],function(t){return I[n][t]})}}),j.result=function(n,t){if(null==n)return void 0;var r=n[t];return j.isFunction(r)?r.call(n):r},j.mixin=function(n){A(j.functions(n),function(t){var r=j[t]=n[t];j.prototype[t]=function(){var n=[this._wrapped];return a.apply(n,arguments),z.call(this,r.apply(j,n))}})};var N=0;j.uniqueId=function(n){var t=++N+"";return n?n+t:t},j.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var q=/(.)^/,B={"'":"'","\\":"\\","\r":"r","\n":"n","	":"t","\u2028":"u2028","\u2029":"u2029"},D=/\\|'|\r|\n|\t|\u2028|\u2029/g;j.template=function(n,t,r){var e;r=j.defaults({},r,j.templateSettings);var u=new RegExp([(r.escape||q).source,(r.interpolate||q).source,(r.evaluate||q).source].join("|")+"|$","g"),i=0,a="__p+='";n.replace(u,function(t,r,e,u,o){return a+=n.slice(i,o).replace(D,function(n){return"\\"+B[n]}),r&&(a+="'+\n((__t=("+r+"))==null?'':_.escape(__t))+\n'"),e&&(a+="'+\n((__t=("+e+"))==null?'':__t)+\n'"),u&&(a+="';\n"+u+"\n__p+='"),i=o+t.length,t}),a+="';\n",r.variable||(a="with(obj||{}){\n"+a+"}\n"),a="var __t,__p='',__j=Array.prototype.join,"+"print=function(){__p+=__j.call(arguments,'');};\n"+a+"return __p;\n";try{e=new Function(r.variable||"obj","_",a)}catch(o){throw o.source=a,o}if(t)return e(t,j);var c=function(n){return e.call(this,n,j)};return c.source="function("+(r.variable||"obj")+"){\n"+a+"}",c},j.chain=function(n){return j(n).chain()};var z=function(n){return this._chain?j(n).chain():n};j.mixin(j),A(["pop","push","reverse","shift","sort","splice","unshift"],function(n){var t=e[n];j.prototype[n]=function(){var r=this._wrapped;return t.apply(r,arguments),"shift"!=n&&"splice"!=n||0!==r.length||delete r[0],z.call(this,r)}}),A(["concat","join","slice"],function(n){var t=e[n];j.prototype[n]=function(){return z.call(this,t.apply(this._wrapped,arguments))}}),j.extend(j.prototype,{chain:function(){return this._chain=!0,this},value:function(){return this._wrapped}})}).call(this);
//# sourceMappingURL=underscore-min.map
$.scrollWindowTo = function(pos, duration, cb) {
  if (duration == null) {
    duration = 0;
  }
  if (pos === $(window).scrollTop()) {
    $(window).trigger('scroll');
    if (typeof cb === "function") {
      cb();
    }
    return;
  }
  return $('html, body').animate({
    scrollTop: pos
  }, duration, function() {
    return typeof cb === "function" ? cb() : void 0;
  });
};
(function() {
  var arrays, basicObjects, deepClone, deepExtend, deepExtendCouple, isBasicObject,
    __slice = [].slice;

  deepClone = function(obj) {
    var func, isArr;
    if (!_.isObject(obj || _.isFunction(obj))) {
      return obj;
    }
    if (_.isDate(obj)) {
      return new Date(obj.getTime());
    }
    if (_.isRegExp(obj)) {
      return new RegExp(obj.source, obj.toString().replace(/.*\//, ""));
    }
    isArr = _.isArray(obj || _.isArguments(obj));
    func = function(memo, value, key) {
      if (isArr) {
        memo.push(deepClone(value));
      } else {
        memo[key] = deepClone(value);
      }
      return memo;
    };
    return _.reduce(obj, func, isArr ? [] : {});
  };

  isBasicObject = function(object) {
    if(object === null) return false;
    return (object.prototype === {}.prototype || object.prototype === Object.prototype) && _.isObject(object) && !_.isArray(object) && !_.isFunction(object) && !_.isDate(object) && !_.isRegExp(object) && !_.isArguments(object);
  };

  basicObjects = function(object) {
    return _.filter(_.keys(object), function(key) {
      return isBasicObject(object[key]);
    });
  };

  arrays = function(object) {
    return _.filter(_.keys(object), function(key) {
      return _.isArray(object[key]);
    });
  };

  deepExtendCouple = function(destination, source, maxDepth) {
    var combine, recurse, sharedArrayKey, sharedArrayKeys, sharedObjectKey, sharedObjectKeys, _i, _j, _len, _len1;
    if (maxDepth == null) {
      maxDepth = 20;
    }
    if (maxDepth <= 0) {
      console.warn('_.deepExtend(): Maximum depth of recursion hit.');
      return _.extend(destination, source);
    }
    sharedObjectKeys = _.intersection(basicObjects(destination), basicObjects(source));
    recurse = function(key) {
      return source[key] = deepExtendCouple(destination[key], source[key], maxDepth - 1);
    };
    for (_i = 0, _len = sharedObjectKeys.length; _i < _len; _i++) {
      sharedObjectKey = sharedObjectKeys[_i];
      recurse(sharedObjectKey);
    }
    sharedArrayKeys = _.intersection(arrays(destination), arrays(source));
    combine = function(key) {
      return source[key] = _.union(destination[key], source[key]);
    };
    for (_j = 0, _len1 = sharedArrayKeys.length; _j < _len1; _j++) {
      sharedArrayKey = sharedArrayKeys[_j];
      combine(sharedArrayKey);
    }
    return _.extend(destination, source);
  };

  deepExtend = function() {
    var finalObj, maxDepth, objects, _i;
    objects = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), maxDepth = arguments[_i++];
    if (!_.isNumber(maxDepth)) {
      objects.push(maxDepth);
      maxDepth = 20;
    }
    if (objects.length <= 1) {
      return objects[0];
    }
    if (maxDepth <= 0) {
      return _.extend.apply(this, objects);
    }
    finalObj = objects.shift();
    while (objects.length > 0) {
      finalObj = deepExtendCouple(finalObj, deepClone(objects.shift()), maxDepth);
    }
    return finalObj;
  };

  _.mixin({
    deepClone: deepClone,
    isBasicObject: isBasicObject,
    basicObjects: basicObjects,
    arrays: arrays,
    deepExtend: deepExtend
  });

}).call(this);
// Rivets.js
// version: 0.5.13
// author: Michael Richards
// license: MIT
(function() {
  var Rivets, jQuery,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Rivets = {};

  jQuery = window.jQuery || window.Zepto;

  if (!String.prototype.trim) {
    String.prototype.trim = function() {
      return this.replace(/^\s+|\s+$/g, '');
    };
  }

  Rivets.Binding = (function() {
    function Binding(view, el, type, key, keypath, options) {
      var identifier, regexp, value, _ref;
      this.view = view;
      this.el = el;
      this.type = type;
      this.key = key;
      this.keypath = keypath;
      this.options = options != null ? options : {};
      this.update = __bind(this.update, this);
      this.unbind = __bind(this.unbind, this);
      this.bind = __bind(this.bind, this);
      this.publish = __bind(this.publish, this);
      this.sync = __bind(this.sync, this);
      this.set = __bind(this.set, this);
      this.eventHandler = __bind(this.eventHandler, this);
      this.formattedValue = __bind(this.formattedValue, this);
      if (!(this.binder = this.view.binders[type])) {
        _ref = this.view.binders;
        for (identifier in _ref) {
          value = _ref[identifier];
          if (identifier !== '*' && identifier.indexOf('*') !== -1) {
            regexp = new RegExp("^" + (identifier.replace('*', '.+')) + "$");
            if (regexp.test(type)) {
              this.binder = value;
              this.args = new RegExp("^" + (identifier.replace('*', '(.+)')) + "$").exec(type);
              this.args.shift();
            }
          }
        }
      }
      this.binder || (this.binder = this.view.binders['*']);
      if (this.binder instanceof Function) {
        this.binder = {
          routine: this.binder
        };
      }
      this.formatters = this.options.formatters || [];
      this.model = this.key ? this.view.models[this.key] : this.view.models;
    }

    Binding.prototype.formattedValue = function(value) {
      var args, formatter, id, _i, _len, _ref;
      _ref = this.formatters;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        formatter = _ref[_i];
        args = formatter.split(/\s+/);
        id = args.shift();
        formatter = this.model[id] instanceof Function ? this.model[id] : this.view.formatters[id];
        if ((formatter != null ? formatter.read : void 0) instanceof Function) {
          value = formatter.read.apply(formatter, [value].concat(__slice.call(args)));
        } else if (formatter instanceof Function) {
          value = formatter.apply(null, [value].concat(__slice.call(args)));
        }
      }
      return value;
    };

    Binding.prototype.eventHandler = function(fn) {
      var binding, handler;
      handler = (binding = this).view.config.handler;
      return function(ev) {
        return handler.call(fn, this, ev, binding);
      };
    };

    Binding.prototype.set = function(value) {
      var _ref;
      value = value instanceof Function && !this.binder["function"] ? this.formattedValue(value.call(this.model)) : this.formattedValue(value);
      return (_ref = this.binder.routine) != null ? _ref.call(this, this.el, value) : void 0;
    };

    Binding.prototype.sync = function() {
      return this.set(this.options.bypass ? this.model[this.keypath] : this.view.config.adapter.read(this.model, this.keypath));
    };

    Binding.prototype.publish = function() {
      var args, formatter, id, value, _i, _len, _ref, _ref1, _ref2;
      value = Rivets.Util.getInputValue(this.el);
      _ref = this.formatters.slice(0).reverse();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        formatter = _ref[_i];
        args = formatter.split(/\s+/);
        id = args.shift();
        if ((_ref1 = this.view.formatters[id]) != null ? _ref1.publish : void 0) {
          value = (_ref2 = this.view.formatters[id]).publish.apply(_ref2, [value].concat(__slice.call(args)));
        }
      }
      return this.view.config.adapter.publish(this.model, this.keypath, value);
    };

    Binding.prototype.bind = function() {
      var dependency, keypath, model, _i, _len, _ref, _ref1, _ref2, _results;
      if ((_ref = this.binder.bind) != null) {
        _ref.call(this, this.el);
      }
      if (this.options.bypass) {
        this.sync();
      } else {
        this.view.config.adapter.subscribe(this.model, this.keypath, this.sync);
        if (this.view.config.preloadData) {
          this.sync();
        }
      }
      if ((_ref1 = this.options.dependencies) != null ? _ref1.length : void 0) {
        _ref2 = this.options.dependencies;
        _results = [];
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          dependency = _ref2[_i];
          if (/^\./.test(dependency)) {
            model = this.model;
            keypath = dependency.substr(1);
          } else {
            dependency = dependency.split('.');
            model = this.view.models[dependency.shift()];
            keypath = dependency.join('.');
          }
          _results.push(this.view.config.adapter.subscribe(model, keypath, this.sync));
        }
        return _results;
      }
    };

    Binding.prototype.unbind = function() {
      var dependency, keypath, model, _i, _len, _ref, _ref1, _ref2, _results;
      if ((_ref = this.binder.unbind) != null) {
        _ref.call(this, this.el);
      }
      if (!this.options.bypass) {
        this.view.config.adapter.unsubscribe(this.model, this.keypath, this.sync);
      }
      if ((_ref1 = this.options.dependencies) != null ? _ref1.length : void 0) {
        _ref2 = this.options.dependencies;
        _results = [];
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          dependency = _ref2[_i];
          if (/^\./.test(dependency)) {
            model = this.model;
            keypath = dependency.substr(1);
          } else {
            dependency = dependency.split('.');
            model = this.view.models[dependency.shift()];
            keypath = dependency.join('.');
          }
          _results.push(this.view.config.adapter.unsubscribe(model, keypath, this.sync));
        }
        return _results;
      }
    };

    Binding.prototype.update = function(models) {
      var _ref;
      if (models == null) {
        models = {};
      }
      if (this.key) {
        if (models[this.key]) {
          if (!this.options.bypass) {
            this.view.config.adapter.unsubscribe(this.model, this.keypath, this.sync);
          }
          this.model = models[this.key];
          if (this.options.bypass) {
            this.sync();
          } else {
            this.view.config.adapter.subscribe(this.model, this.keypath, this.sync);
            if (this.view.config.preloadData) {
              this.sync();
            }
          }
        }
      } else {
        this.sync();
      }
      return (_ref = this.binder.update) != null ? _ref.call(this, models) : void 0;
    };

    return Binding;

  })();

  Rivets.ComponentBinding = (function(_super) {
    __extends(ComponentBinding, _super);

    function ComponentBinding(view, el, type) {
      var attribute, _i, _len, _ref, _ref1;
      this.view = view;
      this.el = el;
      this.type = type;
      this.unbind = __bind(this.unbind, this);
      this.bind = __bind(this.bind, this);
      this.update = __bind(this.update, this);
      this.locals = __bind(this.locals, this);
      this.component = Rivets.components[this.type];
      this.attributes = {};
      this.inflections = {};
      _ref = this.el.attributes || [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        attribute = _ref[_i];
        if (_ref1 = attribute.name, __indexOf.call(this.component.attributes, _ref1) >= 0) {
          this.attributes[attribute.name] = attribute.value;
        } else {
          this.inflections[attribute.name] = attribute.value;
        }
      }
    }

    ComponentBinding.prototype.sync = function() {};

    ComponentBinding.prototype.locals = function(models) {
      var inverse, key, model, path, result, _i, _len, _ref, _ref1;
      if (models == null) {
        models = this.view.models;
      }
      result = {};
      _ref = this.inflections;
      for (key in _ref) {
        inverse = _ref[key];
        _ref1 = inverse.split('.');
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          path = _ref1[_i];
          result[key] = (result[key] || models)[path];
        }
      }
      for (key in models) {
        model = models[key];
        if (result[key] == null) {
          result[key] = model;
        }
      }
      return result;
    };

    ComponentBinding.prototype.update = function(models) {
      var _ref;
      return (_ref = this.componentView) != null ? _ref.update(this.locals(models)) : void 0;
    };

    ComponentBinding.prototype.bind = function() {
      var el, _ref;
      if (this.componentView != null) {
        return (_ref = this.componentView) != null ? _ref.bind() : void 0;
      } else {
        el = this.component.build.call(this.attributes);
        (this.componentView = new Rivets.View(el, this.locals(), this.view.options)).bind();
        return this.el.parentNode.replaceChild(el, this.el);
      }
    };

    ComponentBinding.prototype.unbind = function() {
      var _ref;
      return (_ref = this.componentView) != null ? _ref.unbind() : void 0;
    };

    return ComponentBinding;

  })(Rivets.Binding);

  Rivets.TextBinding = (function(_super) {
    __extends(TextBinding, _super);

    function TextBinding(view, el, type, key, keypath, options) {
      this.view = view;
      this.el = el;
      this.type = type;
      this.key = key;
      this.keypath = keypath;
      this.options = options != null ? options : {};
      this.sync = __bind(this.sync, this);
      this.formatters = this.options.formatters || [];
      this.model = this.key ? this.view.models[this.key] : this.view.models;
    }

    TextBinding.prototype.binder = {
      routine: function(node, value) {
        return node.data = value != null ? value : '';
      }
    };

    TextBinding.prototype.sync = function() {
      return TextBinding.__super__.sync.apply(this, arguments);
    };

    return TextBinding;

  })(Rivets.Binding);

  Rivets.View = (function() {
    function View(els, models, options) {
      var k, option, v, _base, _i, _len, _ref, _ref1, _ref2;
      this.els = els;
      this.models = models;
      this.options = options != null ? options : {};
      this.update = __bind(this.update, this);
      this.publish = __bind(this.publish, this);
      this.sync = __bind(this.sync, this);
      this.unbind = __bind(this.unbind, this);
      this.bind = __bind(this.bind, this);
      this.select = __bind(this.select, this);
      this.build = __bind(this.build, this);
      this.componentRegExp = __bind(this.componentRegExp, this);
      this.bindingRegExp = __bind(this.bindingRegExp, this);
      if (typeof this.els.length === 'undefined') {
        this.els = [this.els];
      }
      _ref = ['config', 'binders', 'formatters'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        option = _ref[_i];
        this[option] = {};
        if (this.options[option]) {
          _ref1 = this.options[option];
          for (k in _ref1) {
            v = _ref1[k];
            this[option][k] = v;
          }
        }
        _ref2 = Rivets[option];
        for (k in _ref2) {
          v = _ref2[k];
          if ((_base = this[option])[k] == null) {
            _base[k] = v;
          }
        }
      }
      this.build();
    }

    View.prototype.bindingRegExp = function() {
      var prefix;
      prefix = this.config.prefix;
      if (prefix) {
        return new RegExp("^data-" + prefix + "-");
      } else {
        return /^data-/;
      }
    };

    View.prototype.componentRegExp = function() {
      var _ref, _ref1;
      return new RegExp("^" + ((_ref = (_ref1 = this.config.prefix) != null ? _ref1.toUpperCase() : void 0) != null ? _ref : 'RV') + "-");
    };

    View.prototype.build = function() {
      var bindingRegExp, buildBinding, componentRegExp, el, parse, skipNodes, _i, _len, _ref,
        _this = this;
      this.bindings = [];
      skipNodes = [];
      bindingRegExp = this.bindingRegExp();
      componentRegExp = this.componentRegExp();
      buildBinding = function(binding, node, type, declaration) {
        var context, ctx, dependencies, key, keypath, options, path, pipe, pipes, splitPath;
        options = {};
        pipes = (function() {
          var _i, _len, _ref, _results;
          _ref = declaration.split('|');
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            pipe = _ref[_i];
            _results.push(pipe.trim());
          }
          return _results;
        })();
        context = (function() {
          var _i, _len, _ref, _results;
          _ref = pipes.shift().split('<');
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            ctx = _ref[_i];
            _results.push(ctx.trim());
          }
          return _results;
        })();
        path = context.shift();
        splitPath = path.split(/\.|:/);
        options.formatters = pipes;
        options.bypass = path.indexOf(':') !== -1;
        if (splitPath[0]) {
          key = splitPath.shift();
        } else {
          key = null;
          splitPath.shift();
        }
        keypath = splitPath.join('.');
        if (dependencies = context.shift()) {
          options.dependencies = dependencies.split(/\s+/);
        }
        return _this.bindings.push(new Rivets[binding](_this, node, type, key, keypath, options));
      };
      parse = function(node) {
        var attribute, attributes, binder, childNode, delimiters, identifier, n, parser, regexp, restTokens, startToken, text, token, tokens, type, value, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref, _ref1, _ref2, _ref3, _ref4, _results;
        if (__indexOf.call(skipNodes, node) < 0) {
          if (node.nodeType === Node.TEXT_NODE) {
            parser = Rivets.TextTemplateParser;
            if (delimiters = _this.config.templateDelimiters) {
              if ((tokens = parser.parse(node.data, delimiters)).length) {
                if (!(tokens.length === 1 && tokens[0].type === parser.types.text)) {
                  startToken = tokens[0], restTokens = 2 <= tokens.length ? __slice.call(tokens, 1) : [];
                  node.data = startToken.value;
                  if (startToken.type === 0) {
                    node.data = startToken.value;
                  } else {
                    buildBinding('TextBinding', node, null, startToken.value);
                  }
                  for (_i = 0, _len = restTokens.length; _i < _len; _i++) {
                    token = restTokens[_i];
                    text = document.createTextNode(token.value);
                    node.parentNode.appendChild(text);
                    if (token.type === 1) {
                      buildBinding('TextBinding', text, null, token.value);
                    }
                  }
                }
              }
            }
          } else if (componentRegExp.test(node.tagName)) {
            type = node.tagName.replace(componentRegExp, '').toLowerCase();
            _this.bindings.push(new Rivets.ComponentBinding(_this, node, type));
          } else if (node.attributes != null) {
            _ref = node.attributes;
            for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
              attribute = _ref[_j];
              if (bindingRegExp.test(attribute.name)) {
                type = attribute.name.replace(bindingRegExp, '');
                if (!(binder = _this.binders[type])) {
                  _ref1 = _this.binders;
                  for (identifier in _ref1) {
                    value = _ref1[identifier];
                    if (identifier !== '*' && identifier.indexOf('*') !== -1) {
                      regexp = new RegExp("^" + (identifier.replace('*', '.+')) + "$");
                      if (regexp.test(type)) {
                        binder = value;
                      }
                    }
                  }
                }
                binder || (binder = _this.binders['*']);
                if (binder.block) {
                  _ref2 = node.childNodes;
                  for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
                    n = _ref2[_k];
                    skipNodes.push(n);
                  }
                  attributes = [attribute];
                }
              }
            }
            _ref3 = attributes || node.attributes;
            for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
              attribute = _ref3[_l];
              if (bindingRegExp.test(attribute.name)) {
                type = attribute.name.replace(bindingRegExp, '');
                buildBinding('Binding', node, type, attribute.value);
              }
            }
          }
          _ref4 = node.childNodes;
          _results = [];
          for (_m = 0, _len4 = _ref4.length; _m < _len4; _m++) {
            childNode = _ref4[_m];
            _results.push(parse(childNode));
          }
          return _results;
        }
      };
      _ref = this.els;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        el = _ref[_i];
        parse(el);
      }
    };

    View.prototype.select = function(fn) {
      var binding, _i, _len, _ref, _results;
      _ref = this.bindings;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        binding = _ref[_i];
        if (fn(binding)) {
          _results.push(binding);
        }
      }
      return _results;
    };

    View.prototype.bind = function() {
      var binding, _i, _len, _ref, _results;
      _ref = this.bindings;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        binding = _ref[_i];
        _results.push(binding.bind());
      }
      return _results;
    };

    View.prototype.unbind = function() {
      var binding, _i, _len, _ref, _results;
      _ref = this.bindings;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        binding = _ref[_i];
        _results.push(binding.unbind());
      }
      return _results;
    };

    View.prototype.sync = function() {
      var binding, _i, _len, _ref, _results;
      _ref = this.bindings;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        binding = _ref[_i];
        _results.push(binding.sync());
      }
      return _results;
    };

    View.prototype.publish = function() {
      var binding, _i, _len, _ref, _results;
      _ref = this.select(function(b) {
        return b.binder.publishes;
      });
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        binding = _ref[_i];
        _results.push(binding.publish());
      }
      return _results;
    };

    View.prototype.update = function(models) {
      var binding, key, model, _i, _len, _ref, _results;
      if (models == null) {
        models = {};
      }
      for (key in models) {
        model = models[key];
        this.models[key] = model;
      }
      _ref = this.bindings;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        binding = _ref[_i];
        _results.push(binding.update(models));
      }
      return _results;
    };

    return View;

  })();

  Rivets.TextTemplateParser = (function() {
    function TextTemplateParser() {}

    TextTemplateParser.types = {
      text: 0,
      binding: 1
    };

    TextTemplateParser.parse = function(template, delimiters) {
      var index, lastIndex, lastToken, length, substring, tokens, value;
      tokens = [];
      length = template.length;
      index = 0;
      lastIndex = 0;
      while (lastIndex < length) {
        index = template.indexOf(delimiters[0], lastIndex);
        if (index < 0) {
          tokens.push({
            type: this.types.text,
            value: template.slice(lastIndex)
          });
          break;
        } else {
          if (index > 0 && lastIndex < index) {
            tokens.push({
              type: this.types.text,
              value: template.slice(lastIndex, index)
            });
          }
          lastIndex = index + 2;
          index = template.indexOf(delimiters[1], lastIndex);
          if (index < 0) {
            substring = template.slice(lastIndex - 2);
            lastToken = tokens[tokens.length - 1];
            if ((lastToken != null ? lastToken.type : void 0) === this.types.text) {
              lastToken.value += substring;
            } else {
              tokens.push({
                type: this.types.text,
                value: substring
              });
            }
            break;
          }
          value = template.slice(lastIndex, index).trim();
          tokens.push({
            type: this.types.binding,
            value: value
          });
          lastIndex = index + 2;
        }
      }
      return tokens;
    };

    return TextTemplateParser;

  })();

  Rivets.Util = {
    bindEvent: function(el, event, handler) {
      if (window.jQuery != null) {
        el = jQuery(el);
        if (el.on != null) {
          return el.on(event, handler);
        } else {
          return el.bind(event, handler);
        }
      } else if (window.addEventListener != null) {
        return el.addEventListener(event, handler, false);
      } else {
        event = 'on' + event;
        return el.attachEvent(event, handler);
      }
    },
    unbindEvent: function(el, event, handler) {
      if (window.jQuery != null) {
        el = jQuery(el);
        if (el.off != null) {
          return el.off(event, handler);
        } else {
          return el.unbind(event, handler);
        }
      } else if (window.removeEventListener != null) {
        return el.removeEventListener(event, handler, false);
      } else {
        event = 'on' + event;
        return el.detachEvent(event, handler);
      }
    },
    getInputValue: function(el) {
      var o, _i, _len, _results;
      if (window.jQuery != null) {
        el = jQuery(el);
        switch (el[0].type) {
          case 'checkbox':
            return el.is(':checked');
          default:
            return el.val();
        }
      } else {
        switch (el.type) {
          case 'checkbox':
            return el.checked;
          case 'select-multiple':
            _results = [];
            for (_i = 0, _len = el.length; _i < _len; _i++) {
              o = el[_i];
              if (o.selected) {
                _results.push(o.value);
              }
            }
            return _results;
            break;
          default:
            return el.value;
        }
      }
    }
  };

  Rivets.binders = {
    enabled: function(el, value) {
      return el.disabled = !value;
    },
    disabled: function(el, value) {
      return el.disabled = !!value;
    },
    checked: {
      publishes: true,
      bind: function(el) {
        return Rivets.Util.bindEvent(el, 'change', this.publish);
      },
      unbind: function(el) {
        return Rivets.Util.unbindEvent(el, 'change', this.publish);
      },
      routine: function(el, value) {
        var _ref;
        if (el.type === 'radio') {
          return el.checked = ((_ref = el.value) != null ? _ref.toString() : void 0) === (value != null ? value.toString() : void 0);
        } else {
          return el.checked = !!value;
        }
      }
    },
    unchecked: {
      publishes: true,
      bind: function(el) {
        return Rivets.Util.bindEvent(el, 'change', this.publish);
      },
      unbind: function(el) {
        return Rivets.Util.unbindEvent(el, 'change', this.publish);
      },
      routine: function(el, value) {
        var _ref;
        if (el.type === 'radio') {
          return el.checked = ((_ref = el.value) != null ? _ref.toString() : void 0) !== (value != null ? value.toString() : void 0);
        } else {
          return el.checked = !value;
        }
      }
    },
    show: function(el, value) {
      return el.style.display = value ? '' : 'none';
    },
    hide: function(el, value) {
      return el.style.display = value ? 'none' : '';
    },
    html: function(el, value) {
      return el.innerHTML = value != null ? value : '';
    },
    value: {
      publishes: true,
      bind: function(el) {
        return Rivets.Util.bindEvent(el, 'change', this.publish);
      },
      unbind: function(el) {
        return Rivets.Util.unbindEvent(el, 'change', this.publish);
      },
      routine: function(el, value) {
        var o, _i, _len, _ref, _ref1, _ref2, _results;
        if (window.jQuery != null) {
          el = jQuery(el);
          if ((value != null ? value.toString() : void 0) !== ((_ref = el.val()) != null ? _ref.toString() : void 0)) {
            return el.val(value != null ? value : '');
          }
        } else {
          if (el.type === 'select-multiple') {
            if (value != null) {
              _results = [];
              for (_i = 0, _len = el.length; _i < _len; _i++) {
                o = el[_i];
                _results.push(o.selected = (_ref1 = o.value, __indexOf.call(value, _ref1) >= 0));
              }
              return _results;
            }
          } else if ((value != null ? value.toString() : void 0) !== ((_ref2 = el.value) != null ? _ref2.toString() : void 0)) {
            return el.value = value != null ? value : '';
          }
        }
      }
    },
    text: function(el, value) {
      if (el.innerText != null) {
        return el.innerText = value != null ? value : '';
      } else {
        return el.textContent = value != null ? value : '';
      }
    },
    "if": {
      block: true,
      bind: function(el) {
        var attr, declaration;
        if (this.marker == null) {
          attr = ['data', this.view.config.prefix, this.type].join('-').replace('--', '-');
          declaration = el.getAttribute(attr);
          this.marker = document.createComment(" rivets: " + this.type + " " + declaration + " ");
          el.removeAttribute(attr);
          el.parentNode.insertBefore(this.marker, el);
          return el.parentNode.removeChild(el);
        }
      },
      unbind: function() {
        var _ref;
        return (_ref = this.nested) != null ? _ref.unbind() : void 0;
      },
      routine: function(el, value) {
        var key, model, models, options, _ref;
        if (!!value === (this.nested == null)) {
          if (value) {
            models = {};
            _ref = this.view.models;
            for (key in _ref) {
              model = _ref[key];
              models[key] = model;
            }
            options = {
              binders: this.view.options.binders,
              formatters: this.view.options.formatters,
              config: this.view.options.config
            };
            (this.nested = new Rivets.View(el, models, options)).bind();
            return this.marker.parentNode.insertBefore(el, this.marker.nextSibling);
          } else {
            el.parentNode.removeChild(el);
            this.nested.unbind();
            return delete this.nested;
          }
        }
      },
      update: function(models) {
        var _ref;
        return (_ref = this.nested) != null ? _ref.update(models) : void 0;
      }
    },
    unless: {
      block: true,
      bind: function(el) {
        return Rivets.binders["if"].bind.call(this, el);
      },
      unbind: function() {
        return Rivets.binders["if"].unbind.call(this);
      },
      routine: function(el, value) {
        return Rivets.binders["if"].routine.call(this, el, !value);
      },
      update: function(models) {
        return Rivets.binders["if"].update.call(this, models);
      }
    },
    "on-*": {
      "function": true,
      unbind: function(el) {
        if (this.handler) {
          return Rivets.Util.unbindEvent(el, this.args[0], this.handler);
        }
      },
      routine: function(el, value) {
        if (this.handler) {
          Rivets.Util.unbindEvent(el, this.args[0], this.handler);
        }
        return Rivets.Util.bindEvent(el, this.args[0], this.handler = this.eventHandler(value));
      }
    },
    "each-*": {
      block: true,
      bind: function(el) {
        var attr;
        if (this.marker == null) {
          attr = ['data', this.view.config.prefix, this.type].join('-').replace('--', '-');
          this.marker = document.createComment(" rivets: " + this.type + " ");
          this.iterated = [];
          el.removeAttribute(attr);
          el.parentNode.insertBefore(this.marker, el);
          return el.parentNode.removeChild(el);
        }
      },
      unbind: function(el) {
        var view, _i, _len, _ref, _results;
        if (this.iterated != null) {
          _ref = this.iterated;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            view = _ref[_i];
            _results.push(view.unbind());
          }
          return _results;
        }
      },
      routine: function(el, collection) {
        var data, i, index, k, key, model, modelName, options, previous, template, v, view, _i, _j, _len, _len1, _ref, _ref1, _ref2, _results;
        modelName = this.args[0];
        collection = collection || [];
        if (this.iterated.length > collection.length) {
          _ref = Array(this.iterated.length - collection.length);
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            i = _ref[_i];
            view = this.iterated.pop();
            view.unbind();
            this.marker.parentNode.removeChild(view.els[0]);
          }
        }
        _results = [];
        for (index = _j = 0, _len1 = collection.length; _j < _len1; index = ++_j) {
          model = collection[index];
          data = {};
          data[modelName] = model;
          if (this.iterated[index] == null) {
            _ref1 = this.view.models;
            for (key in _ref1) {
              model = _ref1[key];
              if (data[key] == null) {
                data[key] = model;
              }
            }
            previous = this.iterated.length ? this.iterated[this.iterated.length - 1].els[0] : this.marker;
            options = {
              binders: this.view.options.binders,
              formatters: this.view.options.formatters,
              config: {}
            };
            _ref2 = this.view.options.config;
            for (k in _ref2) {
              v = _ref2[k];
              options.config[k] = v;
            }
            options.config.preloadData = true;
            template = el.cloneNode(true);
            view = new Rivets.View(template, data, options);
            view.bind();
            this.iterated.push(view);
            _results.push(this.marker.parentNode.insertBefore(template, previous.nextSibling));
          } else if (this.iterated[index].models[modelName] !== model) {
            _results.push(this.iterated[index].update(data));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      },
      update: function(models) {
        var data, key, model, view, _i, _len, _ref, _results;
        data = {};
        for (key in models) {
          model = models[key];
          if (key !== this.args[0]) {
            data[key] = model;
          }
        }
        _ref = this.iterated;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          view = _ref[_i];
          _results.push(view.update(data));
        }
        return _results;
      }
    },
    "class-*": function(el, value) {
      var elClass;
      elClass = " " + el.className + " ";
      if (!value === (elClass.indexOf(" " + this.args[0] + " ") !== -1)) {
        return el.className = value ? "" + el.className + " " + this.args[0] : elClass.replace(" " + this.args[0] + " ", ' ').trim();
      }
    },
    "*": function(el, value) {
      if (value) {
        return el.setAttribute(this.type, value);
      } else {
        return el.removeAttribute(this.type);
      }
    }
  };

  Rivets.components = {};

  Rivets.config = {
    preloadData: true,
    handler: function(context, ev, binding) {
      return this.call(context, ev, binding.view.models);
    }
  };

  Rivets.formatters = {};

  Rivets.factory = function(exports) {
    exports._ = Rivets;
    exports.binders = Rivets.binders;
    exports.components = Rivets.components;
    exports.formatters = Rivets.formatters;
    exports.config = Rivets.config;
    exports.configure = function(options) {
      var property, value;
      if (options == null) {
        options = {};
      }
      for (property in options) {
        value = options[property];
        Rivets.config[property] = value;
      }
    };
    return exports.bind = function(el, models, options) {
      var view;
      if (models == null) {
        models = {};
      }
      if (options == null) {
        options = {};
      }
      view = new Rivets.View(el, models, options);
      view.bind();
      return view;
    };
  };

  if (typeof exports === 'object') {
    Rivets.factory(exports);
  } else if (typeof define === 'function' && define.amd) {
    define(['exports'], function(exports) {
      Rivets.factory(this.rivets = exports);
      return exports;
    });
  } else {
    Rivets.factory(this.rivets = {});
  }

}).call(this);

//     Backbone.js 1.1.2

//     (c) 2010-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Backbone may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://backbonejs.org

(function(root, factory) {

  // Set up Backbone appropriately for the environment. Start with AMD.
  if (typeof define === 'function' && define.amd) {
    define(['underscore', 'jquery', 'exports'], function(_, $, exports) {
      // Export global even in AMD case in case this script is loaded with
      // others that may still expect a global Backbone.
      root.Backbone = factory(root, exports, _, $);
    });

  // Next for Node.js or CommonJS. jQuery may not be needed as a module.
  } else if (typeof exports !== 'undefined') {
    var _ = require('underscore');
    factory(root, exports, _);

  // Finally, as a browser global.
  } else {
    root.Backbone = factory(root, {}, root._, (root.jQuery || root.Zepto || root.ender || root.$));
  }

}(this, function(root, Backbone, _, $) {

  // Initial Setup
  // -------------

  // Save the previous value of the `Backbone` variable, so that it can be
  // restored later on, if `noConflict` is used.
  var previousBackbone = root.Backbone;

  // Create local references to array methods we'll want to use later.
  var array = [];
  var push = array.push;
  var slice = array.slice;
  var splice = array.splice;

  // Current version of the library. Keep in sync with `package.json`.
  Backbone.VERSION = '1.1.2';

  // For Backbone's purposes, jQuery, Zepto, Ender, or My Library (kidding) owns
  // the `$` variable.
  Backbone.$ = $;

  // Runs Backbone.js in *noConflict* mode, returning the `Backbone` variable
  // to its previous owner. Returns a reference to this Backbone object.
  Backbone.noConflict = function() {
    root.Backbone = previousBackbone;
    return this;
  };

  // Turn on `emulateHTTP` to support legacy HTTP servers. Setting this option
  // will fake `"PATCH"`, `"PUT"` and `"DELETE"` requests via the `_method` parameter and
  // set a `X-Http-Method-Override` header.
  Backbone.emulateHTTP = false;

  // Turn on `emulateJSON` to support legacy servers that can't deal with direct
  // `application/json` requests ... will encode the body as
  // `application/x-www-form-urlencoded` instead and will send the model in a
  // form param named `model`.
  Backbone.emulateJSON = false;

  // Backbone.Events
  // ---------------

  // A module that can be mixed in to *any object* in order to provide it with
  // custom events. You may bind with `on` or remove with `off` callback
  // functions to an event; `trigger`-ing an event fires all callbacks in
  // succession.
  //
  //     var object = {};
  //     _.extend(object, Backbone.Events);
  //     object.on('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  var Events = Backbone.Events = {

    // Bind an event to a `callback` function. Passing `"all"` will bind
    // the callback to all events fired.
    on: function(name, callback, context) {
      if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
      this._events || (this._events = {});
      var events = this._events[name] || (this._events[name] = []);
      events.push({callback: callback, context: context, ctx: context || this});
      return this;
    },

    // Bind an event to only be triggered a single time. After the first time
    // the callback is invoked, it will be removed.
    once: function(name, callback, context) {
      if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
      var self = this;
      var once = _.once(function() {
        self.off(name, once);
        callback.apply(this, arguments);
      });
      once._callback = callback;
      return this.on(name, once, context);
    },

    // Remove one or many callbacks. If `context` is null, removes all
    // callbacks with that function. If `callback` is null, removes all
    // callbacks for the event. If `name` is null, removes all bound
    // callbacks for all events.
    off: function(name, callback, context) {
      var retain, ev, events, names, i, l, j, k;
      if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
      if (!name && !callback && !context) {
        this._events = void 0;
        return this;
      }
      names = name ? [name] : _.keys(this._events);
      for (i = 0, l = names.length; i < l; i++) {
        name = names[i];
        if (events = this._events[name]) {
          this._events[name] = retain = [];
          if (callback || context) {
            for (j = 0, k = events.length; j < k; j++) {
              ev = events[j];
              if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                  (context && context !== ev.context)) {
                retain.push(ev);
              }
            }
          }
          if (!retain.length) delete this._events[name];
        }
      }

      return this;
    },

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    trigger: function(name) {
      if (!this._events) return this;
      var args = slice.call(arguments, 1);
      if (!eventsApi(this, 'trigger', name, args)) return this;
      var events = this._events[name];
      var allEvents = this._events.all;
      if (events) triggerEvents(events, args);
      if (allEvents) triggerEvents(allEvents, arguments);
      return this;
    },

    // Tell this object to stop listening to either specific events ... or
    // to every object it's currently listening to.
    stopListening: function(obj, name, callback) {
      var listeningTo = this._listeningTo;
      if (!listeningTo) return this;
      var remove = !name && !callback;
      if (!callback && typeof name === 'object') callback = this;
      if (obj) (listeningTo = {})[obj._listenId] = obj;
      for (var id in listeningTo) {
        obj = listeningTo[id];
        obj.off(name, callback, this);
        if (remove || _.isEmpty(obj._events)) delete this._listeningTo[id];
      }
      return this;
    }

  };

  // Regular expression used to split event strings.
  var eventSplitter = /\s+/;

  // Implement fancy features of the Events API such as multiple event
  // names `"change blur"` and jQuery-style event maps `{change: action}`
  // in terms of the existing API.
  var eventsApi = function(obj, action, name, rest) {
    if (!name) return true;

    // Handle event maps.
    if (typeof name === 'object') {
      for (var key in name) {
        obj[action].apply(obj, [key, name[key]].concat(rest));
      }
      return false;
    }

    // Handle space separated event names.
    if (eventSplitter.test(name)) {
      var names = name.split(eventSplitter);
      for (var i = 0, l = names.length; i < l; i++) {
        obj[action].apply(obj, [names[i]].concat(rest));
      }
      return false;
    }

    return true;
  };

  // A difficult-to-believe, but optimized internal dispatch function for
  // triggering events. Tries to keep the usual cases speedy (most internal
  // Backbone events have 3 arguments).
  var triggerEvents = function(events, args) {
    var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
    switch (args.length) {
      case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
      case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
      case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
      case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
      default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args); return;
    }
  };

  var listenMethods = {listenTo: 'on', listenToOnce: 'once'};

  // Inversion-of-control versions of `on` and `once`. Tell *this* object to
  // listen to an event in another object ... keeping track of what it's
  // listening to.
  _.each(listenMethods, function(implementation, method) {
    Events[method] = function(obj, name, callback) {
      var listeningTo = this._listeningTo || (this._listeningTo = {});
      var id = obj._listenId || (obj._listenId = _.uniqueId('l'));
      listeningTo[id] = obj;
      if (!callback && typeof name === 'object') callback = this;
      obj[implementation](name, callback, this);
      return this;
    };
  });

  // Aliases for backwards compatibility.
  Events.bind   = Events.on;
  Events.unbind = Events.off;

  // Allow the `Backbone` object to serve as a global event bus, for folks who
  // want global "pubsub" in a convenient place.
  _.extend(Backbone, Events);

  // Backbone.Model
  // --------------

  // Backbone **Models** are the basic data object in the framework --
  // frequently representing a row in a table in a database on your server.
  // A discrete chunk of data and a bunch of useful, related methods for
  // performing computations and transformations on that data.

  // Create a new model with the specified attributes. A client id (`cid`)
  // is automatically generated and assigned for you.
  var Model = Backbone.Model = function(attributes, options) {
    var attrs = attributes || {};
    options || (options = {});
    this.cid = _.uniqueId('c');
    this.attributes = {};
    if (options.collection) this.collection = options.collection;
    if (options.parse) attrs = this.parse(attrs, options) || {};
    attrs = _.defaults({}, attrs, _.result(this, 'defaults'));
    this.set(attrs, options);
    this.changed = {};
    this.initialize.apply(this, arguments);
  };

  // Attach all inheritable methods to the Model prototype.
  _.extend(Model.prototype, Events, {

    // A hash of attributes whose current and previous value differ.
    changed: null,

    // The value returned during the last failed validation.
    validationError: null,

    // The default name for the JSON `id` attribute is `"id"`. MongoDB and
    // CouchDB users may want to set this to `"_id"`.
    idAttribute: 'id',

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Return a copy of the model's `attributes` object.
    toJSON: function(options) {
      return _.clone(this.attributes);
    },

    // Proxy `Backbone.sync` by default -- but override this if you need
    // custom syncing semantics for *this* particular model.
    sync: function() {
      return Backbone.sync.apply(this, arguments);
    },

    // Get the value of an attribute.
    get: function(attr) {
      return this.attributes[attr];
    },

    // Get the HTML-escaped value of an attribute.
    escape: function(attr) {
      return _.escape(this.get(attr));
    },

    // Returns `true` if the attribute contains a value that is not null
    // or undefined.
    has: function(attr) {
      return this.get(attr) != null;
    },

    // Set a hash of model attributes on the object, firing `"change"`. This is
    // the core primitive operation of a model, updating the data and notifying
    // anyone who needs to know about the change in state. The heart of the beast.
    set: function(key, val, options) {
      var attr, attrs, unset, changes, silent, changing, prev, current;
      if (key == null) return this;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options || (options = {});

      // Run validation.
      if (!this._validate(attrs, options)) return false;

      // Extract attributes and options.
      unset           = options.unset;
      silent          = options.silent;
      changes         = [];
      changing        = this._changing;
      this._changing  = true;

      if (!changing) {
        this._previousAttributes = _.clone(this.attributes);
        this.changed = {};
      }
      current = this.attributes, prev = this._previousAttributes;

      // Check for changes of `id`.
      if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

      // For each `set` attribute, update or delete the current value.
      for (attr in attrs) {
        val = attrs[attr];
        if (!_.isEqual(current[attr], val)) changes.push(attr);
        if (!_.isEqual(prev[attr], val)) {
          this.changed[attr] = val;
        } else {
          delete this.changed[attr];
        }
        unset ? delete current[attr] : current[attr] = val;
      }

      // Trigger all relevant attribute changes.
      if (!silent) {
        if (changes.length) this._pending = options;
        for (var i = 0, l = changes.length; i < l; i++) {
          this.trigger('change:' + changes[i], this, current[changes[i]], options);
        }
      }

      // You might be wondering why there's a `while` loop here. Changes can
      // be recursively nested within `"change"` events.
      if (changing) return this;
      if (!silent) {
        while (this._pending) {
          options = this._pending;
          this._pending = false;
          this.trigger('change', this, options);
        }
      }
      this._pending = false;
      this._changing = false;
      return this;
    },

    // Remove an attribute from the model, firing `"change"`. `unset` is a noop
    // if the attribute doesn't exist.
    unset: function(attr, options) {
      return this.set(attr, void 0, _.extend({}, options, {unset: true}));
    },

    // Clear all attributes on the model, firing `"change"`.
    clear: function(options) {
      var attrs = {};
      for (var key in this.attributes) attrs[key] = void 0;
      return this.set(attrs, _.extend({}, options, {unset: true}));
    },

    // Determine if the model has changed since the last `"change"` event.
    // If you specify an attribute name, determine if that attribute has changed.
    hasChanged: function(attr) {
      if (attr == null) return !_.isEmpty(this.changed);
      return _.has(this.changed, attr);
    },

    // Return an object containing all the attributes that have changed, or
    // false if there are no changed attributes. Useful for determining what
    // parts of a view need to be updated and/or what attributes need to be
    // persisted to the server. Unset attributes will be set to undefined.
    // You can also pass an attributes object to diff against the model,
    // determining if there *would be* a change.
    changedAttributes: function(diff) {
      if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;
      var val, changed = false;
      var old = this._changing ? this._previousAttributes : this.attributes;
      for (var attr in diff) {
        if (_.isEqual(old[attr], (val = diff[attr]))) continue;
        (changed || (changed = {}))[attr] = val;
      }
      return changed;
    },

    // Get the previous value of an attribute, recorded at the time the last
    // `"change"` event was fired.
    previous: function(attr) {
      if (attr == null || !this._previousAttributes) return null;
      return this._previousAttributes[attr];
    },

    // Get all of the attributes of the model at the time of the previous
    // `"change"` event.
    previousAttributes: function() {
      return _.clone(this._previousAttributes);
    },

    // Fetch the model from the server. If the server's representation of the
    // model differs from its current attributes, they will be overridden,
    // triggering a `"change"` event.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      if (options.parse === void 0) options.parse = true;
      var model = this;
      var success = options.success;
      options.success = function(resp) {
        if (!model.set(model.parse(resp, options), options)) return false;
        if (success) success(model, resp, options);
        model.trigger('sync', model, resp, options);
      };
      wrapError(this, options);
      return this.sync('read', this, options);
    },

    // Set a hash of model attributes, and sync the model to the server.
    // If the server returns an attributes hash that differs, the model's
    // state will be `set` again.
    save: function(key, val, options) {
      var attrs, method, xhr, attributes = this.attributes;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (key == null || typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options = _.extend({validate: true}, options);

      // If we're not waiting and attributes exist, save acts as
      // `set(attr).save(null, opts)` with validation. Otherwise, check if
      // the model will be valid when the attributes, if any, are set.
      if (attrs && !options.wait) {
        if (!this.set(attrs, options)) return false;
      } else {
        if (!this._validate(attrs, options)) return false;
      }

      // Set temporary attributes if `{wait: true}`.
      if (attrs && options.wait) {
        this.attributes = _.extend({}, attributes, attrs);
      }

      // After a successful server-side save, the client is (optionally)
      // updated with the server-side state.
      if (options.parse === void 0) options.parse = true;
      var model = this;
      var success = options.success;
      options.success = function(resp) {
        // Ensure attributes are restored during synchronous saves.
        model.attributes = attributes;
        var serverAttrs = model.parse(resp, options);
        if (options.wait) serverAttrs = _.extend(attrs || {}, serverAttrs);
        if (_.isObject(serverAttrs) && !model.set(serverAttrs, options)) {
          return false;
        }
        if (success) success(model, resp, options);
        model.trigger('sync', model, resp, options);
      };
      wrapError(this, options);

      method = this.isNew() ? 'create' : (options.patch ? 'patch' : 'update');
      if (method === 'patch') options.attrs = attrs;
      xhr = this.sync(method, this, options);

      // Restore attributes.
      if (attrs && options.wait) this.attributes = attributes;

      return xhr;
    },

    // Destroy this model on the server if it was already persisted.
    // Optimistically removes the model from its collection, if it has one.
    // If `wait: true` is passed, waits for the server to respond before removal.
    destroy: function(options) {
      options = options ? _.clone(options) : {};
      var model = this;
      var success = options.success;

      var destroy = function() {
        model.trigger('destroy', model, model.collection, options);
      };

      options.success = function(resp) {
        if (options.wait || model.isNew()) destroy();
        if (success) success(model, resp, options);
        if (!model.isNew()) model.trigger('sync', model, resp, options);
      };

      if (this.isNew()) {
        options.success();
        return false;
      }
      wrapError(this, options);

      var xhr = this.sync('delete', this, options);
      if (!options.wait) destroy();
      return xhr;
    },

    // Default URL for the model's representation on the server -- if you're
    // using Backbone's restful methods, override this to change the endpoint
    // that will be called.
    url: function() {
      var base =
        _.result(this, 'urlRoot') ||
        _.result(this.collection, 'url') ||
        urlError();
      if (this.isNew()) return base;
      return base.replace(/([^\/])$/, '$1/') + encodeURIComponent(this.id);
    },

    // **parse** converts a response into the hash of attributes to be `set` on
    // the model. The default implementation is just to pass the response along.
    parse: function(resp, options) {
      return resp;
    },

    // Create a new model with identical attributes to this one.
    clone: function() {
      return new this.constructor(this.attributes);
    },

    // A model is new if it has never been saved to the server, and lacks an id.
    isNew: function() {
      return !this.has(this.idAttribute);
    },

    // Check if the model is currently in a valid state.
    isValid: function(options) {
      return this._validate({}, _.extend(options || {}, { validate: true }));
    },

    // Run validation against the next complete set of model attributes,
    // returning `true` if all is well. Otherwise, fire an `"invalid"` event.
    _validate: function(attrs, options) {
      if (!options.validate || !this.validate) return true;
      attrs = _.extend({}, this.attributes, attrs);
      var error = this.validationError = this.validate(attrs, options) || null;
      if (!error) return true;
      this.trigger('invalid', this, error, _.extend(options, {validationError: error}));
      return false;
    }

  });

  // Underscore methods that we want to implement on the Model.
  var modelMethods = ['keys', 'values', 'pairs', 'invert', 'pick', 'omit'];

  // Mix in each Underscore method as a proxy to `Model#attributes`.
  _.each(modelMethods, function(method) {
    Model.prototype[method] = function() {
      var args = slice.call(arguments);
      args.unshift(this.attributes);
      return _[method].apply(_, args);
    };
  });

  // Backbone.Collection
  // -------------------

  // If models tend to represent a single row of data, a Backbone Collection is
  // more analagous to a table full of data ... or a small slice or page of that
  // table, or a collection of rows that belong together for a particular reason
  // -- all of the messages in this particular folder, all of the documents
  // belonging to this particular author, and so on. Collections maintain
  // indexes of their models, both in order, and for lookup by `id`.

  // Create a new **Collection**, perhaps to contain a specific type of `model`.
  // If a `comparator` is specified, the Collection will maintain
  // its models in sort order, as they're added and removed.
  var Collection = Backbone.Collection = function(models, options) {
    options || (options = {});
    if (options.model) this.model = options.model;
    if (options.comparator !== void 0) this.comparator = options.comparator;
    this._reset();
    this.initialize.apply(this, arguments);
    if (models) this.reset(models, _.extend({silent: true}, options));
  };

  // Default options for `Collection#set`.
  var setOptions = {add: true, remove: true, merge: true};
  var addOptions = {add: true, remove: false};

  // Define the Collection's inheritable methods.
  _.extend(Collection.prototype, Events, {

    // The default model for a collection is just a **Backbone.Model**.
    // This should be overridden in most cases.
    model: Model,

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // The JSON representation of a Collection is an array of the
    // models' attributes.
    toJSON: function(options) {
      return this.map(function(model){ return model.toJSON(options); });
    },

    // Proxy `Backbone.sync` by default.
    sync: function() {
      return Backbone.sync.apply(this, arguments);
    },

    // Add a model, or list of models to the set.
    add: function(models, options) {
      return this.set(models, _.extend({merge: false}, options, addOptions));
    },

    // Remove a model, or a list of models from the set.
    remove: function(models, options) {
      var singular = !_.isArray(models);
      models = singular ? [models] : _.clone(models);
      options || (options = {});
      var i, l, index, model;
      for (i = 0, l = models.length; i < l; i++) {
        model = models[i] = this.get(models[i]);
        if (!model) continue;
        delete this._byId[model.id];
        delete this._byId[model.cid];
        index = this.indexOf(model);
        this.models.splice(index, 1);
        this.length--;
        if (!options.silent) {
          options.index = index;
          model.trigger('remove', model, this, options);
        }
        this._removeReference(model, options);
      }
      return singular ? models[0] : models;
    },

    // Update a collection by `set`-ing a new list of models, adding new ones,
    // removing models that are no longer present, and merging models that
    // already exist in the collection, as necessary. Similar to **Model#set**,
    // the core operation for updating the data contained by the collection.
    set: function(models, options) {
      options = _.defaults({}, options, setOptions);
      if (options.parse) models = this.parse(models, options);
      var singular = !_.isArray(models);
      models = singular ? (models ? [models] : []) : _.clone(models);
      var i, l, id, model, attrs, existing, sort;
      var at = options.at;
      var targetModel = this.model;
      var sortable = this.comparator && (at == null) && options.sort !== false;
      var sortAttr = _.isString(this.comparator) ? this.comparator : null;
      var toAdd = [], toRemove = [], modelMap = {};
      var add = options.add, merge = options.merge, remove = options.remove;
      var order = !sortable && add && remove ? [] : false;

      // Turn bare objects into model references, and prevent invalid models
      // from being added.
      for (i = 0, l = models.length; i < l; i++) {
        attrs = models[i] || {};
        if (attrs instanceof Model) {
          id = model = attrs;
        } else {
          id = attrs[targetModel.prototype.idAttribute || 'id'];
        }

        // If a duplicate is found, prevent it from being added and
        // optionally merge it into the existing model.
        if (existing = this.get(id)) {
          if (remove) modelMap[existing.cid] = true;
          if (merge) {
            attrs = attrs === model ? model.attributes : attrs;
            if (options.parse) attrs = existing.parse(attrs, options);
            existing.set(attrs, options);
            if (sortable && !sort && existing.hasChanged(sortAttr)) sort = true;
          }
          models[i] = existing;

        // If this is a new, valid model, push it to the `toAdd` list.
        } else if (add) {
          model = models[i] = this._prepareModel(attrs, options);
          if (!model) continue;
          toAdd.push(model);
          this._addReference(model, options);
        }

        // Do not add multiple models with the same `id`.
        model = existing || model;
        if (order && (model.isNew() || !modelMap[model.id])) order.push(model);
        modelMap[model.id] = true;
      }

      // Remove nonexistent models if appropriate.
      if (remove) {
        for (i = 0, l = this.length; i < l; ++i) {
          if (!modelMap[(model = this.models[i]).cid]) toRemove.push(model);
        }
        if (toRemove.length) this.remove(toRemove, options);
      }

      // See if sorting is needed, update `length` and splice in new models.
      if (toAdd.length || (order && order.length)) {
        if (sortable) sort = true;
        this.length += toAdd.length;
        if (at != null) {
          for (i = 0, l = toAdd.length; i < l; i++) {
            this.models.splice(at + i, 0, toAdd[i]);
          }
        } else {
          if (order) this.models.length = 0;
          var orderedModels = order || toAdd;
          for (i = 0, l = orderedModels.length; i < l; i++) {
            this.models.push(orderedModels[i]);
          }
        }
      }

      // Silently sort the collection if appropriate.
      if (sort) this.sort({silent: true});

      // Unless silenced, it's time to fire all appropriate add/sort events.
      if (!options.silent) {
        for (i = 0, l = toAdd.length; i < l; i++) {
          (model = toAdd[i]).trigger('add', model, this, options);
        }
        if (sort || (order && order.length)) this.trigger('sort', this, options);
      }

      // Return the added (or merged) model (or models).
      return singular ? models[0] : models;
    },

    // When you have more items than you want to add or remove individually,
    // you can reset the entire set with a new list of models, without firing
    // any granular `add` or `remove` events. Fires `reset` when finished.
    // Useful for bulk operations and optimizations.
    reset: function(models, options) {
      options || (options = {});
      for (var i = 0, l = this.models.length; i < l; i++) {
        this._removeReference(this.models[i], options);
      }
      options.previousModels = this.models;
      this._reset();
      models = this.add(models, _.extend({silent: true}, options));
      if (!options.silent) this.trigger('reset', this, options);
      return models;
    },

    // Add a model to the end of the collection.
    push: function(model, options) {
      return this.add(model, _.extend({at: this.length}, options));
    },

    // Remove a model from the end of the collection.
    pop: function(options) {
      var model = this.at(this.length - 1);
      this.remove(model, options);
      return model;
    },

    // Add a model to the beginning of the collection.
    unshift: function(model, options) {
      return this.add(model, _.extend({at: 0}, options));
    },

    // Remove a model from the beginning of the collection.
    shift: function(options) {
      var model = this.at(0);
      this.remove(model, options);
      return model;
    },

    // Slice out a sub-array of models from the collection.
    slice: function() {
      return slice.apply(this.models, arguments);
    },

    // Get a model from the set by id.
    get: function(obj) {
      if (obj == null) return void 0;
      return this._byId[obj] || this._byId[obj.id] || this._byId[obj.cid];
    },

    // Get the model at the given index.
    at: function(index) {
      return this.models[index];
    },

    // Return models with matching attributes. Useful for simple cases of
    // `filter`.
    where: function(attrs, first) {
      if (_.isEmpty(attrs)) return first ? void 0 : [];
      return this[first ? 'find' : 'filter'](function(model) {
        for (var key in attrs) {
          if (attrs[key] !== model.get(key)) return false;
        }
        return true;
      });
    },

    // Return the first model with matching attributes. Useful for simple cases
    // of `find`.
    findWhere: function(attrs) {
      return this.where(attrs, true);
    },

    // Force the collection to re-sort itself. You don't need to call this under
    // normal circumstances, as the set will maintain sort order as each item
    // is added.
    sort: function(options) {
      if (!this.comparator) throw new Error('Cannot sort a set without a comparator');
      options || (options = {});

      // Run sort based on type of `comparator`.
      if (_.isString(this.comparator) || this.comparator.length === 1) {
        this.models = this.sortBy(this.comparator, this);
      } else {
        this.models.sort(_.bind(this.comparator, this));
      }

      if (!options.silent) this.trigger('sort', this, options);
      return this;
    },

    // Pluck an attribute from each model in the collection.
    pluck: function(attr) {
      return _.invoke(this.models, 'get', attr);
    },

    // Fetch the default set of models for this collection, resetting the
    // collection when they arrive. If `reset: true` is passed, the response
    // data will be passed through the `reset` method instead of `set`.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      if (options.parse === void 0) options.parse = true;
      var success = options.success;
      var collection = this;
      options.success = function(resp) {
        var method = options.reset ? 'reset' : 'set';
        collection[method](resp, options);
        if (success) success(collection, resp, options);
        collection.trigger('sync', collection, resp, options);
      };
      wrapError(this, options);
      return this.sync('read', this, options);
    },

    // Create a new instance of a model in this collection. Add the model to the
    // collection immediately, unless `wait: true` is passed, in which case we
    // wait for the server to agree.
    create: function(model, options) {
      options = options ? _.clone(options) : {};
      if (!(model = this._prepareModel(model, options))) return false;
      if (!options.wait) this.add(model, options);
      var collection = this;
      var success = options.success;
      options.success = function(model, resp) {
        if (options.wait) collection.add(model, options);
        if (success) success(model, resp, options);
      };
      model.save(null, options);
      return model;
    },

    // **parse** converts a response into a list of models to be added to the
    // collection. The default implementation is just to pass it through.
    parse: function(resp, options) {
      return resp;
    },

    // Create a new collection with an identical list of models as this one.
    clone: function() {
      return new this.constructor(this.models);
    },

    // Private method to reset all internal state. Called when the collection
    // is first initialized or reset.
    _reset: function() {
      this.length = 0;
      this.models = [];
      this._byId  = {};
    },

    // Prepare a hash of attributes (or other model) to be added to this
    // collection.
    _prepareModel: function(attrs, options) {
      if (attrs instanceof Model) return attrs;
      options = options ? _.clone(options) : {};
      options.collection = this;
      var model = new this.model(attrs, options);
      if (!model.validationError) return model;
      this.trigger('invalid', this, model.validationError, options);
      return false;
    },

    // Internal method to create a model's ties to a collection.
    _addReference: function(model, options) {
      this._byId[model.cid] = model;
      if (model.id != null) this._byId[model.id] = model;
      if (!model.collection) model.collection = this;
      model.on('all', this._onModelEvent, this);
    },

    // Internal method to sever a model's ties to a collection.
    _removeReference: function(model, options) {
      if (this === model.collection) delete model.collection;
      model.off('all', this._onModelEvent, this);
    },

    // Internal method called every time a model in the set fires an event.
    // Sets need to update their indexes when models change ids. All other
    // events simply proxy through. "add" and "remove" events that originate
    // in other collections are ignored.
    _onModelEvent: function(event, model, collection, options) {
      if ((event === 'add' || event === 'remove') && collection !== this) return;
      if (event === 'destroy') this.remove(model, options);
      if (model && event === 'change:' + model.idAttribute) {
        delete this._byId[model.previous(model.idAttribute)];
        if (model.id != null) this._byId[model.id] = model;
      }
      this.trigger.apply(this, arguments);
    }

  });

  // Underscore methods that we want to implement on the Collection.
  // 90% of the core usefulness of Backbone Collections is actually implemented
  // right here:
  var methods = ['forEach', 'each', 'map', 'collect', 'reduce', 'foldl',
    'inject', 'reduceRight', 'foldr', 'find', 'detect', 'filter', 'select',
    'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke',
    'max', 'min', 'toArray', 'size', 'first', 'head', 'take', 'initial', 'rest',
    'tail', 'drop', 'last', 'without', 'difference', 'indexOf', 'shuffle',
    'lastIndexOf', 'isEmpty', 'chain', 'sample'];

  // Mix in each Underscore method as a proxy to `Collection#models`.
  _.each(methods, function(method) {
    Collection.prototype[method] = function() {
      var args = slice.call(arguments);
      args.unshift(this.models);
      return _[method].apply(_, args);
    };
  });

  // Underscore methods that take a property name as an argument.
  var attributeMethods = ['groupBy', 'countBy', 'sortBy', 'indexBy'];

  // Use attributes instead of properties.
  _.each(attributeMethods, function(method) {
    Collection.prototype[method] = function(value, context) {
      var iterator = _.isFunction(value) ? value : function(model) {
        return model.get(value);
      };
      return _[method](this.models, iterator, context);
    };
  });

  // Backbone.View
  // -------------

  // Backbone Views are almost more convention than they are actual code. A View
  // is simply a JavaScript object that represents a logical chunk of UI in the
  // DOM. This might be a single item, an entire list, a sidebar or panel, or
  // even the surrounding frame which wraps your whole app. Defining a chunk of
  // UI as a **View** allows you to define your DOM events declaratively, without
  // having to worry about render order ... and makes it easy for the view to
  // react to specific changes in the state of your models.

  // Creating a Backbone.View creates its initial element outside of the DOM,
  // if an existing element is not provided...
  var View = Backbone.View = function(options) {
    this.cid = _.uniqueId('view');
    options || (options = {});
    _.extend(this, _.pick(options, viewOptions));
    this._ensureElement();
    this.initialize.apply(this, arguments);
    this.delegateEvents();
  };

  // Cached regex to split keys for `delegate`.
  var delegateEventSplitter = /^(\S+)\s*(.*)$/;

  // List of view options to be merged as properties.
  var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];

  // Set up all inheritable **Backbone.View** properties and methods.
  _.extend(View.prototype, Events, {

    // The default `tagName` of a View's element is `"div"`.
    tagName: 'div',

    // jQuery delegate for element lookup, scoped to DOM elements within the
    // current view. This should be preferred to global lookups where possible.
    $: function(selector) {
      return this.$el.find(selector);
    },

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // **render** is the core function that your view should override, in order
    // to populate its element (`this.el`), with the appropriate HTML. The
    // convention is for **render** to always return `this`.
    render: function() {
      return this;
    },

    // Remove this view by taking the element out of the DOM, and removing any
    // applicable Backbone.Events listeners.
    remove: function() {
      this.$el.remove();
      this.stopListening();
      return this;
    },

    // Change the view's element (`this.el` property), including event
    // re-delegation.
    setElement: function(element, delegate) {
      if (this.$el) this.undelegateEvents();
      this.$el = element instanceof Backbone.$ ? element : Backbone.$(element);
      this.el = this.$el[0];
      if (delegate !== false) this.delegateEvents();
      return this;
    },

    // Set callbacks, where `this.events` is a hash of
    //
    // *{"event selector": "callback"}*
    //
    //     {
    //       'mousedown .title':  'edit',
    //       'click .button':     'save',
    //       'click .open':       function(e) { ... }
    //     }
    //
    // pairs. Callbacks will be bound to the view, with `this` set properly.
    // Uses event delegation for efficiency.
    // Omitting the selector binds the event to `this.el`.
    // This only works for delegate-able events: not `focus`, `blur`, and
    // not `change`, `submit`, and `reset` in Internet Explorer.
    delegateEvents: function(events) {
      if (!(events || (events = _.result(this, 'events')))) return this;
      this.undelegateEvents();
      for (var key in events) {
        var method = events[key];
        if (!_.isFunction(method)) method = this[events[key]];
        if (!method) continue;

        var match = key.match(delegateEventSplitter);
        var eventName = match[1], selector = match[2];
        method = _.bind(method, this);
        eventName += '.delegateEvents' + this.cid;
        if (selector === '') {
          this.$el.on(eventName, method);
        } else {
          this.$el.on(eventName, selector, method);
        }
      }
      return this;
    },

    // Clears all callbacks previously bound to the view with `delegateEvents`.
    // You usually don't need to use this, but may wish to if you have multiple
    // Backbone views attached to the same DOM element.
    undelegateEvents: function() {
      this.$el.off('.delegateEvents' + this.cid);
      return this;
    },

    // Ensure that the View has a DOM element to render into.
    // If `this.el` is a string, pass it through `$()`, take the first
    // matching element, and re-assign it to `el`. Otherwise, create
    // an element from the `id`, `className` and `tagName` properties.
    _ensureElement: function() {
      if (!this.el) {
        var attrs = _.extend({}, _.result(this, 'attributes'));
        if (this.id) attrs.id = _.result(this, 'id');
        if (this.className) attrs['class'] = _.result(this, 'className');
        var $el = Backbone.$('<' + _.result(this, 'tagName') + '>').attr(attrs);
        this.setElement($el, false);
      } else {
        this.setElement(_.result(this, 'el'), false);
      }
    }

  });

  // Backbone.sync
  // -------------

  // Override this function to change the manner in which Backbone persists
  // models to the server. You will be passed the type of request, and the
  // model in question. By default, makes a RESTful Ajax request
  // to the model's `url()`. Some possible customizations could be:
  //
  // * Use `setTimeout` to batch rapid-fire updates into a single request.
  // * Send up the models as XML instead of JSON.
  // * Persist models via WebSockets instead of Ajax.
  //
  // Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests
  // as `POST`, with a `_method` parameter containing the true HTTP method,
  // as well as all requests with the body as `application/x-www-form-urlencoded`
  // instead of `application/json` with the model in a param named `model`.
  // Useful when interfacing with server-side languages like **PHP** that make
  // it difficult to read the body of `PUT` requests.
  Backbone.sync = function(method, model, options) {
    var type = methodMap[method];

    // Default options, unless specified.
    _.defaults(options || (options = {}), {
      emulateHTTP: Backbone.emulateHTTP,
      emulateJSON: Backbone.emulateJSON
    });

    // Default JSON-request options.
    var params = {type: type, dataType: 'json'};

    // Ensure that we have a URL.
    if (!options.url) {
      params.url = _.result(model, 'url') || urlError();
    }

    // Ensure that we have the appropriate request data.
    if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
      params.contentType = 'application/json';
      params.data = JSON.stringify(options.attrs || model.toJSON(options));
    }

    // For older servers, emulate JSON by encoding the request into an HTML-form.
    if (options.emulateJSON) {
      params.contentType = 'application/x-www-form-urlencoded';
      params.data = params.data ? {model: params.data} : {};
    }

    // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
    // And an `X-HTTP-Method-Override` header.
    if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {
      params.type = 'POST';
      if (options.emulateJSON) params.data._method = type;
      var beforeSend = options.beforeSend;
      options.beforeSend = function(xhr) {
        xhr.setRequestHeader('X-HTTP-Method-Override', type);
        if (beforeSend) return beforeSend.apply(this, arguments);
      };
    }

    // Don't process data on a non-GET request.
    if (params.type !== 'GET' && !options.emulateJSON) {
      params.processData = false;
    }

    // If we're sending a `PATCH` request, and we're in an old Internet Explorer
    // that still has ActiveX enabled by default, override jQuery to use that
    // for XHR instead. Remove this line when jQuery supports `PATCH` on IE8.
    if (params.type === 'PATCH' && noXhrPatch) {
      params.xhr = function() {
        return new ActiveXObject("Microsoft.XMLHTTP");
      };
    }

    // Make the request, allowing the user to override any Ajax options.
    var xhr = options.xhr = Backbone.ajax(_.extend(params, options));
    model.trigger('request', model, xhr, options);
    return xhr;
  };

  var noXhrPatch =
    typeof window !== 'undefined' && !!window.ActiveXObject &&
      !(window.XMLHttpRequest && (new XMLHttpRequest).dispatchEvent);

  // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
  var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'patch':  'PATCH',
    'delete': 'DELETE',
    'read':   'GET'
  };

  // Set the default implementation of `Backbone.ajax` to proxy through to `$`.
  // Override this if you'd like to use a different library.
  Backbone.ajax = function() {
    return Backbone.$.ajax.apply(Backbone.$, arguments);
  };

  // Backbone.Router
  // ---------------

  // Routers map faux-URLs to actions, and fire events when routes are
  // matched. Creating a new one sets its `routes` hash, if not set statically.
  var Router = Backbone.Router = function(options) {
    options || (options = {});
    if (options.routes) this.routes = options.routes;
    this._bindRoutes();
    this.initialize.apply(this, arguments);
  };

  // Cached regular expressions for matching named param parts and splatted
  // parts of route strings.
  var optionalParam = /\((.*?)\)/g;
  var namedParam    = /(\(\?)?:\w+/g;
  var splatParam    = /\*\w+/g;
  var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;

  // Set up all inheritable **Backbone.Router** properties and methods.
  _.extend(Router.prototype, Events, {

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Manually bind a single named route to a callback. For example:
    //
    //     this.route('search/:query/p:num', 'search', function(query, num) {
    //       ...
    //     });
    //
    route: function(route, name, callback) {
      if (!_.isRegExp(route)) route = this._routeToRegExp(route);
      if (_.isFunction(name)) {
        callback = name;
        name = '';
      }
      if (!callback) callback = this[name];
      var router = this;
      Backbone.history.route(route, function(fragment) {
        var args = router._extractParameters(route, fragment);
        router.execute(callback, args);
        router.trigger.apply(router, ['route:' + name].concat(args));
        router.trigger('route', name, args);
        Backbone.history.trigger('route', router, name, args);
      });
      return this;
    },

    // Execute a route handler with the provided parameters.  This is an
    // excellent place to do pre-route setup or post-route cleanup.
    execute: function(callback, args) {
      if (callback) callback.apply(this, args);
    },

    // Simple proxy to `Backbone.history` to save a fragment into the history.
    navigate: function(fragment, options) {
      Backbone.history.navigate(fragment, options);
      return this;
    },

    // Bind all defined routes to `Backbone.history`. We have to reverse the
    // order of the routes here to support behavior where the most general
    // routes can be defined at the bottom of the route map.
    _bindRoutes: function() {
      if (!this.routes) return;
      this.routes = _.result(this, 'routes');
      var route, routes = _.keys(this.routes);
      while ((route = routes.pop()) != null) {
        this.route(route, this.routes[route]);
      }
    },

    // Convert a route string into a regular expression, suitable for matching
    // against the current location hash.
    _routeToRegExp: function(route) {
      route = route.replace(escapeRegExp, '\\$&')
                   .replace(optionalParam, '(?:$1)?')
                   .replace(namedParam, function(match, optional) {
                     return optional ? match : '([^/?]+)';
                   })
                   .replace(splatParam, '([^?]*?)');
      return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
    },

    // Given a route, and a URL fragment that it matches, return the array of
    // extracted decoded parameters. Empty or unmatched parameters will be
    // treated as `null` to normalize cross-browser behavior.
    _extractParameters: function(route, fragment) {
      var params = route.exec(fragment).slice(1);
      return _.map(params, function(param, i) {
        // Don't decode the search params.
        if (i === params.length - 1) return param || null;
        return param ? decodeURIComponent(param) : null;
      });
    }

  });

  // Backbone.History
  // ----------------

  // Handles cross-browser history management, based on either
  // [pushState](http://diveintohtml5.info/history.html) and real URLs, or
  // [onhashchange](https://developer.mozilla.org/en-US/docs/DOM/window.onhashchange)
  // and URL fragments. If the browser supports neither (old IE, natch),
  // falls back to polling.
  var History = Backbone.History = function() {
    this.handlers = [];
    _.bindAll(this, 'checkUrl');

    // Ensure that `History` can be used outside of the browser.
    if (typeof window !== 'undefined') {
      this.location = window.location;
      this.history = window.history;
    }
  };

  // Cached regex for stripping a leading hash/slash and trailing space.
  var routeStripper = /^[#\/]|\s+$/g;

  // Cached regex for stripping leading and trailing slashes.
  var rootStripper = /^\/+|\/+$/g;

  // Cached regex for detecting MSIE.
  var isExplorer = /msie [\w.]+/;

  // Cached regex for removing a trailing slash.
  var trailingSlash = /\/$/;

  // Cached regex for stripping urls of hash.
  var pathStripper = /#.*$/;

  // Has the history handling already been started?
  History.started = false;

  // Set up all inheritable **Backbone.History** properties and methods.
  _.extend(History.prototype, Events, {

    // The default interval to poll for hash changes, if necessary, is
    // twenty times a second.
    interval: 50,

    // Are we at the app root?
    atRoot: function() {
      return this.location.pathname.replace(/[^\/]$/, '$&/') === this.root;
    },

    // Gets the true hash value. Cannot use location.hash directly due to bug
    // in Firefox where location.hash will always be decoded.
    getHash: function(window) {
      var match = (window || this).location.href.match(/#(.*)$/);
      return match ? match[1] : '';
    },

    // Get the cross-browser normalized URL fragment, either from the URL,
    // the hash, or the override.
    getFragment: function(fragment, forcePushState) {
      if (fragment == null) {
        if (this._hasPushState || !this._wantsHashChange || forcePushState) {
          fragment = decodeURI(this.location.pathname + this.location.search);
          var root = this.root.replace(trailingSlash, '');
          if (!fragment.indexOf(root)) fragment = fragment.slice(root.length);
        } else {
          fragment = this.getHash();
        }
      }
      return fragment.replace(routeStripper, '');
    },

    // Start the hash change handling, returning `true` if the current URL matches
    // an existing route, and `false` otherwise.
    start: function(options) {
      if (History.started) throw new Error("Backbone.history has already been started");
      History.started = true;

      // Figure out the initial configuration. Do we need an iframe?
      // Is pushState desired ... is it available?
      this.options          = _.extend({root: '/'}, this.options, options);
      this.root             = this.options.root;
      this._wantsHashChange = this.options.hashChange !== false;
      this._wantsPushState  = !!this.options.pushState;
      this._hasPushState    = !!(this.options.pushState && this.history && this.history.pushState);
      var fragment          = this.getFragment();
      var docMode           = document.documentMode;
      var oldIE             = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));

      // Normalize root to always include a leading and trailing slash.
      this.root = ('/' + this.root + '/').replace(rootStripper, '/');

      if (oldIE && this._wantsHashChange) {
        var frame = Backbone.$('<iframe src="javascript:0" tabindex="-1">');
        this.iframe = frame.hide().appendTo('body')[0].contentWindow;
        this.navigate(fragment);
      }

      // Depending on whether we're using pushState or hashes, and whether
      // 'onhashchange' is supported, determine how we check the URL state.
      if (this._hasPushState) {
        Backbone.$(window).on('popstate', this.checkUrl);
      } else if (this._wantsHashChange && ('onhashchange' in window) && !oldIE) {
        Backbone.$(window).on('hashchange', this.checkUrl);
      } else if (this._wantsHashChange) {
        this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
      }

      // Determine if we need to change the base url, for a pushState link
      // opened by a non-pushState browser.
      this.fragment = fragment;
      var loc = this.location;

      // Transition from hashChange to pushState or vice versa if both are
      // requested.
      if (this._wantsHashChange && this._wantsPushState) {

        // If we've started off with a route from a `pushState`-enabled
        // browser, but we're currently in a browser that doesn't support it...
        if (!this._hasPushState && !this.atRoot()) {
          this.fragment = this.getFragment(null, true);
          this.location.replace(this.root + '#' + this.fragment);
          // Return immediately as browser will do redirect to new url
          return true;

        // Or if we've started out with a hash-based route, but we're currently
        // in a browser where it could be `pushState`-based instead...
        } else if (this._hasPushState && this.atRoot() && loc.hash) {
          this.fragment = this.getHash().replace(routeStripper, '');
          this.history.replaceState({}, document.title, this.root + this.fragment);
        }

      }

      if (!this.options.silent) return this.loadUrl();
    },

    // Disable Backbone.history, perhaps temporarily. Not useful in a real app,
    // but possibly useful for unit testing Routers.
    stop: function() {
      Backbone.$(window).off('popstate', this.checkUrl).off('hashchange', this.checkUrl);
      if (this._checkUrlInterval) clearInterval(this._checkUrlInterval);
      History.started = false;
    },

    // Add a route to be tested when the fragment changes. Routes added later
    // may override previous routes.
    route: function(route, callback) {
      this.handlers.unshift({route: route, callback: callback});
    },

    // Checks the current URL to see if it has changed, and if it has,
    // calls `loadUrl`, normalizing across the hidden iframe.
    checkUrl: function(e) {
      var current = this.getFragment();
      if (current === this.fragment && this.iframe) {
        current = this.getFragment(this.getHash(this.iframe));
      }
      if (current === this.fragment) return false;
      if (this.iframe) this.navigate(current);
      this.loadUrl();
    },

    // Attempt to load the current URL fragment. If a route succeeds with a
    // match, returns `true`. If no defined routes matches the fragment,
    // returns `false`.
    loadUrl: function(fragment) {
      fragment = this.fragment = this.getFragment(fragment);
      return _.any(this.handlers, function(handler) {
        if (handler.route.test(fragment)) {
          handler.callback(fragment);
          return true;
        }
      });
    },

    // Save a fragment into the hash history, or replace the URL state if the
    // 'replace' option is passed. You are responsible for properly URL-encoding
    // the fragment in advance.
    //
    // The options object can contain `trigger: true` if you wish to have the
    // route callback be fired (not usually desirable), or `replace: true`, if
    // you wish to modify the current URL without adding an entry to the history.
    navigate: function(fragment, options) {
      if (!History.started) return false;
      if (!options || options === true) options = {trigger: !!options};

      var url = this.root + (fragment = this.getFragment(fragment || ''));

      // Strip the hash for matching.
      fragment = fragment.replace(pathStripper, '');

      if (this.fragment === fragment) return;
      this.fragment = fragment;

      // Don't include a trailing slash on the root.
      if (fragment === '' && url !== '/') url = url.slice(0, -1);

      // If pushState is available, we use it to set the fragment as a real URL.
      if (this._hasPushState) {
        this.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, url);

      // If hash changes haven't been explicitly disabled, update the hash
      // fragment to store history.
      } else if (this._wantsHashChange) {
        this._updateHash(this.location, fragment, options.replace);
        if (this.iframe && (fragment !== this.getFragment(this.getHash(this.iframe)))) {
          // Opening and closing the iframe tricks IE7 and earlier to push a
          // history entry on hash-tag change.  When replace is true, we don't
          // want this.
          if(!options.replace) this.iframe.document.open().close();
          this._updateHash(this.iframe.location, fragment, options.replace);
        }

      // If you've told us that you explicitly don't want fallback hashchange-
      // based history, then `navigate` becomes a page refresh.
      } else {
        return this.location.assign(url);
      }
      if (options.trigger) return this.loadUrl(fragment);
    },

    // Update the hash location, either replacing the current entry, or adding
    // a new one to the browser history.
    _updateHash: function(location, fragment, replace) {
      if (replace) {
        var href = location.href.replace(/(javascript:|#).*$/, '');
        location.replace(href + '#' + fragment);
      } else {
        // Some browsers require that `hash` contains a leading #.
        location.hash = '#' + fragment;
      }
    }

  });

  // Create the default Backbone.history.
  Backbone.history = new History;

  // Helpers
  // -------

  // Helper function to correctly set up the prototype chain, for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var extend = function(protoProps, staticProps) {
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ return parent.apply(this, arguments); };
    }

    // Add static properties to the constructor function, if supplied.
    _.extend(child, parent, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    var Surrogate = function(){ this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate;

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
  };

  // Set up inheritance for the model, collection, router, view and history.
  Model.extend = Collection.extend = Router.extend = View.extend = History.extend = extend;

  // Throw an error when a URL is needed, and none is supplied.
  var urlError = function() {
    throw new Error('A "url" property or function must be specified');
  };

  // Wrap an optional error callback with a fallback error event.
  var wrapError = function(model, options) {
    var error = options.error;
    options.error = function(resp) {
      if (error) error(model, resp, options);
      model.trigger('error', model, resp, options);
    };
  };

  return Backbone;

}));

/**
 * Main source
 */

;(function(factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['underscore', 'backbone'], factory);
    } else {
        // globals
        factory(_, Backbone);
    }
}(function(_, Backbone) {
    
    /**
     * Takes a nested object and returns a shallow object keyed with the path names
     * e.g. { "level1.level2": "value" }
     *
     * @param  {Object}      Nested object e.g. { level1: { level2: 'value' } }
     * @return {Object}      Shallow object with path names e.g. { 'level1.level2': 'value' }
     */
    function objToPaths(obj) {
        var ret = {},
            separator = DeepModel.keyPathSeparator;

        for (var key in obj) {
            var val = obj[key];

            if (val && val.constructor === Object && !_.isEmpty(val)) {
                //Recursion for embedded objects
                var obj2 = objToPaths(val);

                for (var key2 in obj2) {
                    var val2 = obj2[key2];

                    ret[key + separator + key2] = val2;
                }
            } else {
                ret[key] = val;
            }
        }

        return ret;
    }

    /**
     * @param {Object}  Object to fetch attribute from
     * @param {String}  Object path e.g. 'user.name'
     * @return {Mixed}
     */
    function getNested(obj, path, return_exists) {
        var separator = DeepModel.keyPathSeparator;

        var fields = path.split(separator);
        var result = obj;
        return_exists || (return_exists === false);
        for (var i = 0, n = fields.length; i < n; i++) {
            if (return_exists && !_.has(result, fields[i])) {
                return false;
            }
            result = result[fields[i]];

            if (result == null && i < n - 1) {
                result = {};
            }
            
            if (typeof result === 'undefined') {
                if (return_exists)
                {
                    return true;
                }
                return result;
            }
        }
        if (return_exists)
        {
            return true;
        }
        return result;
    }

    /**
     * @param {Object} obj                Object to fetch attribute from
     * @param {String} path               Object path e.g. 'user.name'
     * @param {Object} [options]          Options
     * @param {Boolean} [options.unset]   Whether to delete the value
     * @param {Mixed}                     Value to set
     */
    function setNested(obj, path, val, options) {
        options = options || {};

        var separator = DeepModel.keyPathSeparator;

        var fields = path.split(separator);
        var result = obj;
        for (var i = 0, n = fields.length; i < n && result !== undefined ; i++) {
            var field = fields[i];

            //If the last in the path, set the value
            if (i === n - 1) {
                options.unset ? delete result[field] : result[field] = val;
            } else {
                //Create the child object if it doesn't exist, or isn't an object
                if (typeof result[field] === 'undefined' || ! _.isObject(result[field])) {
                    result[field] = {};
                }

                //Move onto the next part of the path
                result = result[field];
            }
        }
    }

    function deleteNested(obj, path) {
      setNested(obj, path, null, { unset: true });
    }

    var DeepModel = Backbone.Model.extend({

        // Override constructor
        // Support having nested defaults by using _.deepExtend instead of _.extend
        constructor: function(attributes, options) {
            var defaults;
            var attrs = attributes || {};
            this.cid = _.uniqueId('c');
            this.attributes = {};
            if (options && options.collection) this.collection = options.collection;
            if (options && options.parse) attrs = this.parse(attrs, options) || {};
            if (defaults = _.result(this, 'defaults')) {
                //<custom code>
                // Replaced the call to _.defaults with _.deepExtend.
                attrs = _.deepExtend({}, defaults, attrs);
                //</custom code>
            }
            this.set(attrs, options);
            this.changed = {};
            this.initialize.apply(this, arguments);
        },

        // Return a copy of the model's `attributes` object.
        toJSON: function(options) {
          return _.deepClone(this.attributes);
        },

        // Override get
        // Supports nested attributes via the syntax 'obj.attr' e.g. 'author.user.name'
        get: function(attr) {
            return getNested(this.attributes, attr);
        },

        // Override set
        // Supports nested attributes via the syntax 'obj.attr' e.g. 'author.user.name'
        set: function(key, val, options) {
            var attr, attrs, unset, changes, silent, changing, prev, current;
            if (key == null) return this;
            
            // Handle both `"key", value` and `{key: value}` -style arguments.
            if (typeof key === 'object') {
              attrs = key;
              options = val || {};
            } else {
              (attrs = {})[key] = val;
            }

            options || (options = {});
            
            // Run validation.
            if (!this._validate(attrs, options)) return false;

            // Extract attributes and options.
            unset           = options.unset;
            silent          = options.silent;
            changes         = [];
            changing        = this._changing;
            this._changing  = true;

            if (!changing) {
              this._previousAttributes = _.deepClone(this.attributes); //<custom>: Replaced _.clone with _.deepClone
              this.changed = {};
            }
            current = this.attributes, prev = this._previousAttributes;

            // Check for changes of `id`.
            if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

            //<custom code>
            attrs = objToPaths(attrs);
            //</custom code>

            // For each `set` attribute, update or delete the current value.
            for (attr in attrs) {
              val = attrs[attr];

              //<custom code>: Using getNested, setNested and deleteNested
              if (!_.isEqual(getNested(current, attr), val)) changes.push(attr);
              if (!_.isEqual(getNested(prev, attr), val)) {
                setNested(this.changed, attr, val);
              } else {
                deleteNested(this.changed, attr);
              }
              unset ? deleteNested(current, attr) : setNested(current, attr, val);
              //</custom code>
            }

            // Trigger all relevant attribute changes.
            if (!silent) {
              if (changes.length) this._pending = true;

              //<custom code>
              var separator = DeepModel.keyPathSeparator;

              for (var i = 0, l = changes.length; i < l; i++) {
                var key = changes[i];

                this.trigger('change:' + key, this, getNested(current, key), options);

                var fields = key.split(separator);

                //Trigger change events for parent keys with wildcard (*) notation
                for(var n = fields.length - 1; n > 0; n--) {
                  var parentKey = _.first(fields, n).join(separator),
                      wildcardKey = parentKey + separator + '*';

                  this.trigger('change:' + wildcardKey, this, getNested(current, parentKey), options);
                }
                //</custom code>
              }
            }

            if (changing) return this;
            if (!silent) {
              while (this._pending) {
                this._pending = false;
                this.trigger('change', this, options);
              }
            }
            this._pending = false;
            this._changing = false;
            return this;
        },

        // Clear all attributes on the model, firing `"change"` unless you choose
        // to silence it.
        clear: function(options) {
          var attrs = {};
          var shallowAttributes = objToPaths(this.attributes);
          for (var key in shallowAttributes) attrs[key] = void 0;
          return this.set(attrs, _.extend({}, options, {unset: true}));
        },

        // Determine if the model has changed since the last `"change"` event.
        // If you specify an attribute name, determine if that attribute has changed.
        hasChanged: function(attr) {
          if (attr == null) return !_.isEmpty(this.changed);
          return getNested(this.changed, attr) !== undefined;
        },

        // Return an object containing all the attributes that have changed, or
        // false if there are no changed attributes. Useful for determining what
        // parts of a view need to be updated and/or what attributes need to be
        // persisted to the server. Unset attributes will be set to undefined.
        // You can also pass an attributes object to diff against the model,
        // determining if there *would be* a change.
        changedAttributes: function(diff) {
          //<custom code>: objToPaths
          if (!diff) return this.hasChanged() ? objToPaths(this.changed) : false;
          //</custom code>

          var old = this._changing ? this._previousAttributes : this.attributes;
          
          //<custom code>
          diff = objToPaths(diff);
          old = objToPaths(old);
          //</custom code>

          var val, changed = false;
          for (var attr in diff) {
            if (_.isEqual(old[attr], (val = diff[attr]))) continue;
            (changed || (changed = {}))[attr] = val;
          }
          return changed;
        },

        // Get the previous value of an attribute, recorded at the time the last
        // `"change"` event was fired.
        previous: function(attr) {
          if (attr == null || !this._previousAttributes) return null;

          //<custom code>
          return getNested(this._previousAttributes, attr);
          //</custom code>
        },

        // Get all of the attributes of the model at the time of the previous
        // `"change"` event.
        previousAttributes: function() {
          //<custom code>
          return _.deepClone(this._previousAttributes);
          //</custom code>
        }
    });


    //Config; override in your app to customise
    DeepModel.keyPathSeparator = '.';


    //Exports
    Backbone.DeepModel = DeepModel;

    //For use in NodeJS
    if (typeof module != 'undefined') module.exports = DeepModel;
    
    return Backbone;

}));

var fabric=fabric||{version:"1.6.7"};"undefined"!=typeof exports&&(exports.fabric=fabric),"undefined"!=typeof document&&"undefined"!=typeof window?(fabric.document=document,fabric.window=window,window.fabric=fabric):(fabric.document=require("jsdom").jsdom("<!DOCTYPE html><html><head></head><body></body></html>"),fabric.document.createWindow?fabric.window=fabric.document.createWindow():fabric.window=fabric.document.parentWindow),fabric.isTouchSupported="ontouchstart"in fabric.document.documentElement,fabric.isLikelyNode="undefined"!=typeof Buffer&&"undefined"==typeof window,fabric.SHARED_ATTRIBUTES=["display","transform","fill","fill-opacity","fill-rule","opacity","stroke","stroke-dasharray","stroke-linecap","stroke-linejoin","stroke-miterlimit","stroke-opacity","stroke-width","id"],fabric.DPI=96,fabric.reNum="(?:[-+]?(?:\\d+|\\d*\\.\\d+)(?:e[-+]?\\d+)?)",fabric.fontPaths={},fabric.charWidthsCache={},fabric.devicePixelRatio=fabric.window.devicePixelRatio||fabric.window.webkitDevicePixelRatio||fabric.window.mozDevicePixelRatio||1,function(){function t(t,e){if(this.__eventListeners[t]){var i=this.__eventListeners[t];e?i[i.indexOf(e)]=!1:fabric.util.array.fill(i,!1)}}function e(t,e){if(this.__eventListeners||(this.__eventListeners={}),1===arguments.length)for(var i in t)this.on(i,t[i]);else this.__eventListeners[t]||(this.__eventListeners[t]=[]),this.__eventListeners[t].push(e);return this}function i(e,i){if(this.__eventListeners){if(0===arguments.length)for(e in this.__eventListeners)t.call(this,e);else if(1===arguments.length&&"object"==typeof arguments[0])for(var r in e)t.call(this,r,e[r]);else t.call(this,e,i);return this}}function r(t,e){if(this.__eventListeners){var i=this.__eventListeners[t];if(i){for(var r=0,n=i.length;r<n;r++)i[r]&&i[r].call(this,e||{});return this.__eventListeners[t]=i.filter(function(t){return t!==!1}),this}}}fabric.Observable={observe:e,stopObserving:i,fire:r,on:e,off:i,trigger:r}}(),fabric.Collection={_objects:[],add:function(){if(this._objects.push.apply(this._objects,arguments),this._onObjectAdded)for(var t=0,e=arguments.length;t<e;t++)this._onObjectAdded(arguments[t]);return this.renderOnAddRemove&&this.renderAll(),this},insertAt:function(t,e,i){var r=this.getObjects();return i?r[e]=t:r.splice(e,0,t),this._onObjectAdded&&this._onObjectAdded(t),this.renderOnAddRemove&&this.renderAll(),this},remove:function(){for(var t,e=this.getObjects(),i=!1,r=0,n=arguments.length;r<n;r++)t=e.indexOf(arguments[r]),t!==-1&&(i=!0,e.splice(t,1),this._onObjectRemoved&&this._onObjectRemoved(arguments[r]));return this.renderOnAddRemove&&i&&this.renderAll(),this},forEachObject:function(t,e){for(var i=this.getObjects(),r=0,n=i.length;r<n;r++)t.call(e,i[r],r,i);return this},getObjects:function(t){return"undefined"==typeof t?this._objects:this._objects.filter(function(e){return e.type===t})},item:function(t){return this.getObjects()[t]},isEmpty:function(){return 0===this.getObjects().length},size:function(){return this.getObjects().length},contains:function(t){return this.getObjects().indexOf(t)>-1},complexity:function(){return this.getObjects().reduce(function(t,e){return t+=e.complexity?e.complexity():0},0)}},function(t){var e=Math.sqrt,i=Math.atan2,r=Math.pow,n=Math.abs,s=Math.PI/180;fabric.util={removeFromArray:function(t,e){var i=t.indexOf(e);return i!==-1&&t.splice(i,1),t},getRandomInt:function(t,e){return Math.floor(Math.random()*(e-t+1))+t},degreesToRadians:function(t){return t*s},radiansToDegrees:function(t){return t/s},rotatePoint:function(t,e,i){t.subtractEquals(e);var r=fabric.util.rotateVector(t,i);return new fabric.Point(r.x,r.y).addEquals(e)},rotateVector:function(t,e){var i=Math.sin(e),r=Math.cos(e),n=t.x*r-t.y*i,s=t.x*i+t.y*r;return{x:n,y:s}},transformPoint:function(t,e,i){return i?new fabric.Point(e[0]*t.x+e[2]*t.y,e[1]*t.x+e[3]*t.y):new fabric.Point(e[0]*t.x+e[2]*t.y+e[4],e[1]*t.x+e[3]*t.y+e[5])},makeBoundingBoxFromPoints:function(t){var e=[t[0].x,t[1].x,t[2].x,t[3].x],i=fabric.util.array.min(e),r=fabric.util.array.max(e),n=Math.abs(i-r),s=[t[0].y,t[1].y,t[2].y,t[3].y],o=fabric.util.array.min(s),a=fabric.util.array.max(s),h=Math.abs(o-a);return{left:i,top:o,width:n,height:h}},invertTransform:function(t){var e=1/(t[0]*t[3]-t[1]*t[2]),i=[e*t[3],-e*t[1],-e*t[2],e*t[0]],r=fabric.util.transformPoint({x:t[4],y:t[5]},i,!0);return i[4]=-r.x,i[5]=-r.y,i},toFixed:function(t,e){return parseFloat(Number(t).toFixed(e))},parseUnit:function(t,e){var i=/\D{0,2}$/.exec(t),r=parseFloat(t);switch(e||(e=fabric.Text.DEFAULT_SVG_FONT_SIZE),i[0]){case"mm":return r*fabric.DPI/25.4;case"cm":return r*fabric.DPI/2.54;case"in":return r*fabric.DPI;case"pt":return r*fabric.DPI/72;case"pc":return r*fabric.DPI/72*12;case"em":return r*e;default:return r}},falseFunction:function(){return!1},getKlass:function(t,e){return t=fabric.util.string.camelize(t.charAt(0).toUpperCase()+t.slice(1)),fabric.util.resolveNamespace(e)[t]},resolveNamespace:function(e){if(!e)return fabric;var i,r=e.split("."),n=r.length,s=t||fabric.window;for(i=0;i<n;++i)s=s[r[i]];return s},loadImage:function(t,e,i,r){if(!t)return void(e&&e.call(i,t));var n=fabric.util.createImage();n.onload=function(){e&&e.call(i,n),n=n.onload=n.onerror=null},n.onerror=function(){fabric.log("Error loading "+n.src),e&&e.call(i,null,!0),n=n.onload=n.onerror=null},0!==t.indexOf("data")&&r&&(n.crossOrigin=r),n.src=t},enlivenObjects:function(t,e,i,r){function n(){++o===a&&e&&e(s)}t=t||[];var s=[],o=0,a=t.length;return a?void t.forEach(function(t,e){if(!t||!t.type)return void n();var o=fabric.util.getKlass(t.type,i);o.async?o.fromObject(t,function(i,o){o||(s[e]=i,r&&r(t,s[e])),n()}):(s[e]=o.fromObject(t),r&&r(t,s[e]),n())}):void(e&&e(s))},groupSVGElements:function(t,e,i){var r;return r=new fabric.PathGroup(t,e),"undefined"!=typeof i&&r.setSourcePath(i),r},populateWithProperties:function(t,e,i){if(i&&"[object Array]"===Object.prototype.toString.call(i))for(var r=0,n=i.length;r<n;r++)i[r]in t&&(e[i[r]]=t[i[r]])},drawDashedLine:function(t,r,n,s,o,a){var h=s-r,c=o-n,l=e(h*h+c*c),u=i(c,h),f=a.length,d=0,g=!0;for(t.save(),t.translate(r,n),t.moveTo(0,0),t.rotate(u),r=0;l>r;)r+=a[d++%f],r>l&&(r=l),t[g?"lineTo":"moveTo"](r,0),g=!g;t.restore()},createCanvasElement:function(t){return t||(t=fabric.document.createElement("canvas")),t.getContext||"undefined"==typeof G_vmlCanvasManager||G_vmlCanvasManager.initElement(t),t},createImage:function(){return fabric.isLikelyNode?new(require("canvas").Image):fabric.document.createElement("img")},createAccessors:function(t){var e,i,r,n,s,o=t.prototype;for(e=o.stateProperties.length;e--;)i=o.stateProperties[e],r=i.charAt(0).toUpperCase()+i.slice(1),n="set"+r,s="get"+r,o[s]||(o[s]=function(t){return new Function('return this.get("'+t+'")')}(i)),o[n]||(o[n]=function(t){return new Function("value",'return this.set("'+t+'", value)')}(i))},clipContext:function(t,e){e.save(),e.beginPath(),t.clipTo(e),e.clip()},multiplyTransformMatrices:function(t,e,i){return[t[0]*e[0]+t[2]*e[1],t[1]*e[0]+t[3]*e[1],t[0]*e[2]+t[2]*e[3],t[1]*e[2]+t[3]*e[3],i?0:t[0]*e[4]+t[2]*e[5]+t[4],i?0:t[1]*e[4]+t[3]*e[5]+t[5]]},qrDecompose:function(t){var n=i(t[1],t[0]),o=r(t[0],2)+r(t[1],2),a=e(o),h=(t[0]*t[3]-t[2]*t[1])/a,c=i(t[0]*t[2]+t[1]*t[3],o);return{angle:n/s,scaleX:a,scaleY:h,skewX:c/s,skewY:0,translateX:t[4],translateY:t[5]}},customTransformMatrix:function(t,e,i){var r=[1,0,n(Math.tan(i*s)),1],o=[n(t),0,0,n(e)];return fabric.util.multiplyTransformMatrices(o,r,!0)},resetObjectTransform:function(t){t.scaleX=1,t.scaleY=1,t.skewX=0,t.skewY=0,t.flipX=!1,t.flipY=!1,t.setAngle(0)},getFunctionBody:function(t){return(String(t).match(/function[^{]*\{([\s\S]*)\}/)||{})[1]},isTransparent:function(t,e,i,r){r>0&&(e>r?e-=r:e=0,i>r?i-=r:i=0);var n,s,o=!0,a=t.getImageData(e,i,2*r||1,2*r||1),h=a.data.length;for(n=3;n<h&&(s=a.data[n],o=s<=0,o!==!1);n+=4);return a=null,o},parsePreserveAspectRatioAttribute:function(t){var e,i="meet",r="Mid",n="Mid",s=t.split(" ");return s&&s.length&&(i=s.pop(),"meet"!==i&&"slice"!==i?(e=i,i="meet"):s.length&&(e=s.pop())),r="none"!==e?e.slice(1,4):"none",n="none"!==e?e.slice(5,8):"none",{meetOrSlice:i,alignX:r,alignY:n}},clearFabricFontCache:function(t){t?fabric.charWidthsCache[t]&&delete fabric.charWidthsCache[t]:fabric.charWidthsCache={}}}}("undefined"!=typeof exports?exports:this),function(){function t(t,r,s,o,h,c,l){var u=a.call(arguments);if(n[u])return n[u];var f=Math.PI,d=l*f/180,g=Math.sin(d),p=Math.cos(d),v=0,b=0;s=Math.abs(s),o=Math.abs(o);var m=-p*t*.5-g*r*.5,y=-p*r*.5+g*t*.5,_=s*s,x=o*o,S=y*y,C=m*m,w=_*x-_*S-x*C,O=0;if(w<0){var T=Math.sqrt(1-w/(_*x));s*=T,o*=T}else O=(h===c?-1:1)*Math.sqrt(w/(_*S+x*C));var k=O*s*y/o,j=-O*o*m/s,M=p*k-g*j+.5*t,A=g*k+p*j+.5*r,P=i(1,0,(m-k)/s,(y-j)/o),I=i((m-k)/s,(y-j)/o,(-m-k)/s,(-y-j)/o);0===c&&I>0?I-=2*f:1===c&&I<0&&(I+=2*f);for(var E=Math.ceil(Math.abs(I/f*2)),D=[],L=I/E,R=8/3*Math.sin(L/4)*Math.sin(L/4)/Math.sin(L/2),F=P+L,B=0;B<E;B++)D[B]=e(P,F,p,g,s,o,M,A,R,v,b),v=D[B][4],b=D[B][5],P=F,F+=L;return n[u]=D,D}function e(t,e,i,r,n,o,h,c,l,u,f){var d=a.call(arguments);if(s[d])return s[d];var g=Math.cos(t),p=Math.sin(t),v=Math.cos(e),b=Math.sin(e),m=i*n*v-r*o*b+h,y=r*n*v+i*o*b+c,_=u+l*(-i*n*p-r*o*g),x=f+l*(-r*n*p+i*o*g),S=m+l*(i*n*b+r*o*v),C=y+l*(r*n*b-i*o*v);return s[d]=[_,x,S,C,m,y],s[d]}function i(t,e,i,r){var n=Math.atan2(e,t),s=Math.atan2(r,i);return s>=n?s-n:2*Math.PI-(n-s)}function r(t,e,i,r,n,s,h,c){var l=a.call(arguments);if(o[l])return o[l];var u,f,d,g,p,v,b,m,y=Math.sqrt,_=Math.min,x=Math.max,S=Math.abs,C=[],w=[[],[]];f=6*t-12*i+6*n,u=-3*t+9*i-9*n+3*h,d=3*i-3*t;for(var O=0;O<2;++O)if(O>0&&(f=6*e-12*r+6*s,u=-3*e+9*r-9*s+3*c,d=3*r-3*e),S(u)<1e-12){if(S(f)<1e-12)continue;g=-d/f,0<g&&g<1&&C.push(g)}else b=f*f-4*d*u,b<0||(m=y(b),p=(-f+m)/(2*u),0<p&&p<1&&C.push(p),v=(-f-m)/(2*u),0<v&&v<1&&C.push(v));for(var T,k,j,M=C.length,A=M;M--;)g=C[M],j=1-g,T=j*j*j*t+3*j*j*g*i+3*j*g*g*n+g*g*g*h,w[0][M]=T,k=j*j*j*e+3*j*j*g*r+3*j*g*g*s+g*g*g*c,w[1][M]=k;w[0][A]=t,w[1][A]=e,w[0][A+1]=h,w[1][A+1]=c;var P=[{x:_.apply(null,w[0]),y:_.apply(null,w[1])},{x:x.apply(null,w[0]),y:x.apply(null,w[1])}];return o[l]=P,P}var n={},s={},o={},a=Array.prototype.join;fabric.util.drawArc=function(e,i,r,n){for(var s=n[0],o=n[1],a=n[2],h=n[3],c=n[4],l=n[5],u=n[6],f=[[],[],[],[]],d=t(l-i,u-r,s,o,h,c,a),g=0,p=d.length;g<p;g++)f[g][0]=d[g][0]+i,f[g][1]=d[g][1]+r,f[g][2]=d[g][2]+i,f[g][3]=d[g][3]+r,f[g][4]=d[g][4]+i,f[g][5]=d[g][5]+r,e.bezierCurveTo.apply(e,f[g])},fabric.util.getBoundsOfArc=function(e,i,n,s,o,a,h,c,l){for(var u,f=0,d=0,g=[],p=t(c-e,l-i,n,s,a,h,o),v=0,b=p.length;v<b;v++)u=r(f,d,p[v][0],p[v][1],p[v][2],p[v][3],p[v][4],p[v][5]),g.push({x:u[0].x+e,y:u[0].y+i}),g.push({x:u[1].x+e,y:u[1].y+i}),f=p[v][4],d=p[v][5];return g},fabric.util.getBoundsOfCurve=r}(),function(){function t(t,e){for(var i=s.call(arguments,2),r=[],n=0,o=t.length;n<o;n++)r[n]=i.length?t[n][e].apply(t[n],i):t[n][e].call(t[n]);return r}function e(t,e){return n(t,e,function(t,e){return t>=e})}function i(t,e){return n(t,e,function(t,e){return t<e})}function r(t,e){for(var i=t.length;i--;)t[i]=e;return t}function n(t,e,i){if(t&&0!==t.length){var r=t.length-1,n=e?t[r][e]:t[r];if(e)for(;r--;)i(t[r][e],n)&&(n=t[r][e]);else for(;r--;)i(t[r],n)&&(n=t[r]);return n}}var s=Array.prototype.slice;Array.prototype.indexOf||(Array.prototype.indexOf=function(t){if(void 0===this||null===this)throw new TypeError;var e=Object(this),i=e.length>>>0;if(0===i)return-1;var r=0;if(arguments.length>0&&(r=Number(arguments[1]),r!==r?r=0:0!==r&&r!==Number.POSITIVE_INFINITY&&r!==Number.NEGATIVE_INFINITY&&(r=(r>0||-1)*Math.floor(Math.abs(r)))),r>=i)return-1;for(var n=r>=0?r:Math.max(i-Math.abs(r),0);n<i;n++)if(n in e&&e[n]===t)return n;return-1}),Array.prototype.forEach||(Array.prototype.forEach=function(t,e){for(var i=0,r=this.length>>>0;i<r;i++)i in this&&t.call(e,this[i],i,this)}),Array.prototype.map||(Array.prototype.map=function(t,e){for(var i=[],r=0,n=this.length>>>0;r<n;r++)r in this&&(i[r]=t.call(e,this[r],r,this));return i}),Array.prototype.every||(Array.prototype.every=function(t,e){for(var i=0,r=this.length>>>0;i<r;i++)if(i in this&&!t.call(e,this[i],i,this))return!1;return!0}),Array.prototype.some||(Array.prototype.some=function(t,e){for(var i=0,r=this.length>>>0;i<r;i++)if(i in this&&t.call(e,this[i],i,this))return!0;return!1}),Array.prototype.filter||(Array.prototype.filter=function(t,e){for(var i,r=[],n=0,s=this.length>>>0;n<s;n++)n in this&&(i=this[n],t.call(e,i,n,this)&&r.push(i));return r}),Array.prototype.reduce||(Array.prototype.reduce=function(t){var e,i=this.length>>>0,r=0;if(arguments.length>1)e=arguments[1];else for(;;){if(r in this){e=this[r++];break}if(++r>=i)throw new TypeError}for(;r<i;r++)r in this&&(e=t.call(null,e,this[r],r,this));return e}),fabric.util.array={fill:r,invoke:t,min:i,max:e}}(),function(){function t(t,i,r){if(r)if(!fabric.isLikelyNode&&i instanceof Element)t=i;else if(i instanceof Array)t=i.map(function(t){return e(t,r)});else if(i instanceof Object)for(var n in i)t[n]=e(i[n],r);else t=i;else for(var n in i)t[n]=i[n];return t}function e(e,i){return t({},e,i)}fabric.util.object={extend:t,clone:e}}(),function(){function t(t){return t.replace(/-+(.)?/g,function(t,e){return e?e.toUpperCase():""})}function e(t,e){return t.charAt(0).toUpperCase()+(e?t.slice(1):t.slice(1).toLowerCase())}function i(t){return t.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&apos;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}String.prototype.trim||(String.prototype.trim=function(){return this.replace(/^[\s\xA0]+/,"").replace(/[\s\xA0]+$/,"")}),fabric.util.string={camelize:t,capitalize:e,escapeXml:i}}(),function(){var t=Array.prototype.slice,e=Function.prototype.apply,i=function(){};Function.prototype.bind||(Function.prototype.bind=function(r){var n,s=this,o=t.call(arguments,1);return n=o.length?function(){return e.call(s,this instanceof i?this:r,o.concat(t.call(arguments)))}:function(){return e.call(s,this instanceof i?this:r,arguments)},i.prototype=this.prototype,n.prototype=new i,n})}(),function(){function t(){}function e(t){var e=this.constructor.superclass.prototype[t];return arguments.length>1?e.apply(this,r.call(arguments,1)):e.call(this)}function i(){function i(){this.initialize.apply(this,arguments)}var s=null,a=r.call(arguments,0);"function"==typeof a[0]&&(s=a.shift()),i.superclass=s,i.subclasses=[],s&&(t.prototype=s.prototype,i.prototype=new t,s.subclasses.push(i));for(var h=0,c=a.length;h<c;h++)o(i,a[h],s);return i.prototype.initialize||(i.prototype.initialize=n),i.prototype.constructor=i,i.prototype.callSuper=e,i}var r=Array.prototype.slice,n=function(){},s=function(){for(var t in{toString:1})if("toString"===t)return!1;return!0}(),o=function(t,e,i){for(var r in e)r in t.prototype&&"function"==typeof t.prototype[r]&&(e[r]+"").indexOf("callSuper")>-1?t.prototype[r]=function(t){return function(){var r=this.constructor.superclass;this.constructor.superclass=i;var n=e[t].apply(this,arguments);if(this.constructor.superclass=r,"initialize"!==t)return n}}(r):t.prototype[r]=e[r],s&&(e.toString!==Object.prototype.toString&&(t.prototype.toString=e.toString),e.valueOf!==Object.prototype.valueOf&&(t.prototype.valueOf=e.valueOf))};fabric.util.createClass=i}(),function(){function t(t){var e,i,r=Array.prototype.slice.call(arguments,1),n=r.length;for(i=0;i<n;i++)if(e=typeof t[r[i]],!/^(?:function|object|unknown)$/.test(e))return!1;return!0}function e(t,e){return{handler:e,wrappedHandler:i(t,e)}}function i(t,e){return function(i){e.call(o(t),i||fabric.window.event)}}function r(t,e){return function(i){if(p[t]&&p[t][e])for(var r=p[t][e],n=0,s=r.length;n<s;n++)r[n].call(this,i||fabric.window.event)}}function n(t){t||(t=fabric.window.event);var e=t.target||(typeof t.srcElement!==h?t.srcElement:null),i=fabric.util.getScrollLeftTop(e);return{x:v(t)+i.left,y:b(t)+i.top}}function s(t,e,i){var r="touchend"===t.type?"changedTouches":"touches";return t[r]&&t[r][0]?t[r][0][e]-(t[r][0][e]-t[r][0][i])||t[i]:t[i]}var o,a,h="unknown",c=function(){var t=0;return function(e){return e.__uniqueID||(e.__uniqueID="uniqueID__"+t++)}}();!function(){var t={};o=function(e){return t[e]},a=function(e,i){t[e]=i}}();var l,u,f=t(fabric.document.documentElement,"addEventListener","removeEventListener")&&t(fabric.window,"addEventListener","removeEventListener"),d=t(fabric.document.documentElement,"attachEvent","detachEvent")&&t(fabric.window,"attachEvent","detachEvent"),g={},p={};f?(l=function(t,e,i){t.addEventListener(e,i,!1)},u=function(t,e,i){t.removeEventListener(e,i,!1)}):d?(l=function(t,i,r){var n=c(t);a(n,t),g[n]||(g[n]={}),g[n][i]||(g[n][i]=[]);var s=e(n,r);g[n][i].push(s),t.attachEvent("on"+i,s.wrappedHandler)},u=function(t,e,i){var r,n=c(t);if(g[n]&&g[n][e])for(var s=0,o=g[n][e].length;s<o;s++)r=g[n][e][s],r&&r.handler===i&&(t.detachEvent("on"+e,r.wrappedHandler),g[n][e][s]=null)}):(l=function(t,e,i){var n=c(t);if(p[n]||(p[n]={}),!p[n][e]){p[n][e]=[];var s=t["on"+e];s&&p[n][e].push(s),t["on"+e]=r(n,e)}p[n][e].push(i)},u=function(t,e,i){var r=c(t);if(p[r]&&p[r][e])for(var n=p[r][e],s=0,o=n.length;s<o;s++)n[s]===i&&n.splice(s,1)}),fabric.util.addListener=l,fabric.util.removeListener=u;var v=function(t){return typeof t.clientX!==h?t.clientX:0},b=function(t){return typeof t.clientY!==h?t.clientY:0};fabric.isTouchSupported&&(v=function(t){return s(t,"pageX","clientX")},b=function(t){return s(t,"pageY","clientY")}),fabric.util.getPointer=n,fabric.util.object.extend(fabric.util,fabric.Observable)}(),function(){function t(t,e){var i=t.style;if(!i)return t;if("string"==typeof e)return t.style.cssText+=";"+e,e.indexOf("opacity")>-1?s(t,e.match(/opacity:\s*(\d?\.?\d*)/)[1]):t;for(var r in e)if("opacity"===r)s(t,e[r]);else{var n="float"===r||"cssFloat"===r?"undefined"==typeof i.styleFloat?"cssFloat":"styleFloat":r;i[n]=e[r]}return t}var e=fabric.document.createElement("div"),i="string"==typeof e.style.opacity,r="string"==typeof e.style.filter,n=/alpha\s*\(\s*opacity\s*=\s*([^\)]+)\)/,s=function(t){return t};i?s=function(t,e){return t.style.opacity=e,t}:r&&(s=function(t,e){var i=t.style;return t.currentStyle&&!t.currentStyle.hasLayout&&(i.zoom=1),n.test(i.filter)?(e=e>=.9999?"":"alpha(opacity="+100*e+")",i.filter=i.filter.replace(n,e)):i.filter+=" alpha(opacity="+100*e+")",t}),fabric.util.setStyle=t}(),function(){function t(t){return"string"==typeof t?fabric.document.getElementById(t):t}function e(t,e){var i=fabric.document.createElement(t);for(var r in e)"class"===r?i.className=e[r]:"for"===r?i.htmlFor=e[r]:i.setAttribute(r,e[r]);return i}function i(t,e){t&&(" "+t.className+" ").indexOf(" "+e+" ")===-1&&(t.className+=(t.className?" ":"")+e)}function r(t,i,r){return"string"==typeof i&&(i=e(i,r)),t.parentNode&&t.parentNode.replaceChild(i,t),i.appendChild(t),i}function n(t){for(var e=0,i=0,r=fabric.document.documentElement,n=fabric.document.body||{scrollLeft:0,scrollTop:0};t&&(t.parentNode||t.host)&&(t=t.parentNode||t.host,t===fabric.document?(e=n.scrollLeft||r.scrollLeft||0,i=n.scrollTop||r.scrollTop||0):(e+=t.scrollLeft||0,i+=t.scrollTop||0),1!==t.nodeType||"fixed"!==fabric.util.getElementStyle(t,"position")););return{left:e,top:i}}function s(t){var e,i,r=t&&t.ownerDocument,s={left:0,top:0},o={left:0,top:0},a={borderLeftWidth:"left",borderTopWidth:"top",paddingLeft:"left",paddingTop:"top"};if(!r)return o;for(var h in a)o[a[h]]+=parseInt(c(t,h),10)||0;return e=r.documentElement,"undefined"!=typeof t.getBoundingClientRect&&(s=t.getBoundingClientRect()),i=n(t),{left:s.left+i.left-(e.clientLeft||0)+o.left,top:s.top+i.top-(e.clientTop||0)+o.top}}var o,a=Array.prototype.slice,h=function(t){return a.call(t,0)};try{o=h(fabric.document.childNodes)instanceof Array}catch(t){}o||(h=function(t){for(var e=new Array(t.length),i=t.length;i--;)e[i]=t[i];return e});var c;c=fabric.document.defaultView&&fabric.document.defaultView.getComputedStyle?function(t,e){var i=fabric.document.defaultView.getComputedStyle(t,null);return i?i[e]:void 0}:function(t,e){var i=t.style[e];return!i&&t.currentStyle&&(i=t.currentStyle[e]),i},function(){function t(t){return"undefined"!=typeof t.onselectstart&&(t.onselectstart=fabric.util.falseFunction),r?t.style[r]="none":"string"==typeof t.unselectable&&(t.unselectable="on"),t}function e(t){return"undefined"!=typeof t.onselectstart&&(t.onselectstart=null),r?t.style[r]="":"string"==typeof t.unselectable&&(t.unselectable=""),t}var i=fabric.document.documentElement.style,r="userSelect"in i?"userSelect":"MozUserSelect"in i?"MozUserSelect":"WebkitUserSelect"in i?"WebkitUserSelect":"KhtmlUserSelect"in i?"KhtmlUserSelect":"";fabric.util.makeElementUnselectable=t,fabric.util.makeElementSelectable=e}(),function(){function t(t,e){var i=fabric.document.getElementsByTagName("head")[0],r=fabric.document.createElement("script"),n=!0;r.onload=r.onreadystatechange=function(t){if(n){if("string"==typeof this.readyState&&"loaded"!==this.readyState&&"complete"!==this.readyState)return;n=!1,e(t||fabric.window.event),r=r.onload=r.onreadystatechange=null}},r.src=t,i.appendChild(r)}fabric.util.getScript=t}(),fabric.util.getById=t,fabric.util.toArray=h,fabric.util.makeElement=e,fabric.util.addClass=i,fabric.util.wrapElement=r,fabric.util.getScrollLeftTop=n,fabric.util.getElementOffset=s,fabric.util.getElementStyle=c}(),function(){function t(t,e){return t+(/\?/.test(t)?"&":"?")+e}function e(){}function i(i,n){n||(n={});var s=n.method?n.method.toUpperCase():"GET",o=n.onComplete||function(){},a=r(),h=n.body||n.parameters;return a.onreadystatechange=function(){4===a.readyState&&(o(a),a.onreadystatechange=e)},"GET"===s&&(h=null,"string"==typeof n.parameters&&(i=t(i,n.parameters))),a.open(s,i,!0),"POST"!==s&&"PUT"!==s||a.setRequestHeader("Content-Type","application/x-www-form-urlencoded"),a.send(h),a}var r=function(){for(var t=[function(){return new ActiveXObject("Microsoft.XMLHTTP")},function(){return new ActiveXObject("Msxml2.XMLHTTP")},function(){return new ActiveXObject("Msxml2.XMLHTTP.3.0")},function(){return new XMLHttpRequest}],e=t.length;e--;)try{var i=t[e]();if(i)return t[e]}catch(t){}}();fabric.util.request=i}(),fabric.log=function(){},fabric.warn=function(){},"undefined"!=typeof console&&["log","warn"].forEach(function(t){"undefined"!=typeof console[t]&&"function"==typeof console[t].apply&&(fabric[t]=function(){return console[t].apply(console,arguments)})}),function(){function t(t){e(function(i){t||(t={});var r,n=i||+new Date,s=t.duration||500,o=n+s,a=t.onChange||function(){},h=t.abort||function(){return!1},c=t.easing||function(t,e,i,r){return-i*Math.cos(t/r*(Math.PI/2))+i+e},l="startValue"in t?t.startValue:0,u="endValue"in t?t.endValue:100,f=t.byValue||u-l;t.onStart&&t.onStart(),function i(u){r=u||+new Date;var d=r>o?s:r-n;return h()?void(t.onComplete&&t.onComplete()):(a(c(d,l,f,s)),r>o?void(t.onComplete&&t.onComplete()):void e(i))}(n)})}function e(){return i.apply(fabric.window,arguments)}var i=fabric.window.requestAnimationFrame||fabric.window.webkitRequestAnimationFrame||fabric.window.mozRequestAnimationFrame||fabric.window.oRequestAnimationFrame||fabric.window.msRequestAnimationFrame||function(t){fabric.window.setTimeout(t,1e3/60)};fabric.util.animate=t,fabric.util.requestAnimFrame=e}(),function(){function t(t,e,i,r){return t<Math.abs(e)?(t=e,r=i/4):r=0===e&&0===t?i/(2*Math.PI)*Math.asin(1):i/(2*Math.PI)*Math.asin(e/t),{a:t,c:e,p:i,s:r}}function e(t,e,i){return t.a*Math.pow(2,10*(e-=1))*Math.sin((e*i-t.s)*(2*Math.PI)/t.p)}function i(t,e,i,r){return i*((t=t/r-1)*t*t+1)+e}function r(t,e,i,r){return t/=r/2,t<1?i/2*t*t*t+e:i/2*((t-=2)*t*t+2)+e}function n(t,e,i,r){return i*(t/=r)*t*t*t+e}function s(t,e,i,r){return-i*((t=t/r-1)*t*t*t-1)+e}function o(t,e,i,r){return t/=r/2,t<1?i/2*t*t*t*t+e:-i/2*((t-=2)*t*t*t-2)+e}function a(t,e,i,r){return i*(t/=r)*t*t*t*t+e}function h(t,e,i,r){return i*((t=t/r-1)*t*t*t*t+1)+e}function c(t,e,i,r){return t/=r/2,t<1?i/2*t*t*t*t*t+e:i/2*((t-=2)*t*t*t*t+2)+e}function l(t,e,i,r){return-i*Math.cos(t/r*(Math.PI/2))+i+e}function u(t,e,i,r){return i*Math.sin(t/r*(Math.PI/2))+e}function f(t,e,i,r){return-i/2*(Math.cos(Math.PI*t/r)-1)+e}function d(t,e,i,r){return 0===t?e:i*Math.pow(2,10*(t/r-1))+e}function g(t,e,i,r){return t===r?e+i:i*(-Math.pow(2,-10*t/r)+1)+e}function p(t,e,i,r){return 0===t?e:t===r?e+i:(t/=r/2,t<1?i/2*Math.pow(2,10*(t-1))+e:i/2*(-Math.pow(2,-10*--t)+2)+e)}function v(t,e,i,r){return-i*(Math.sqrt(1-(t/=r)*t)-1)+e}function b(t,e,i,r){return i*Math.sqrt(1-(t=t/r-1)*t)+e}function m(t,e,i,r){return t/=r/2,t<1?-i/2*(Math.sqrt(1-t*t)-1)+e:i/2*(Math.sqrt(1-(t-=2)*t)+1)+e}function y(i,r,n,s){var o=1.70158,a=0,h=n;if(0===i)return r;if(i/=s,1===i)return r+n;a||(a=.3*s);var c=t(h,n,a,o);return-e(c,i,s)+r}function _(e,i,r,n){var s=1.70158,o=0,a=r;if(0===e)return i;if(e/=n,1===e)return i+r;o||(o=.3*n);var h=t(a,r,o,s);return h.a*Math.pow(2,-10*e)*Math.sin((e*n-h.s)*(2*Math.PI)/h.p)+h.c+i}function x(i,r,n,s){var o=1.70158,a=0,h=n;if(0===i)return r;if(i/=s/2,2===i)return r+n;a||(a=s*(.3*1.5));var c=t(h,n,a,o);return i<1?-.5*e(c,i,s)+r:c.a*Math.pow(2,-10*(i-=1))*Math.sin((i*s-c.s)*(2*Math.PI)/c.p)*.5+c.c+r}function S(t,e,i,r,n){return void 0===n&&(n=1.70158),i*(t/=r)*t*((n+1)*t-n)+e}function C(t,e,i,r,n){return void 0===n&&(n=1.70158),i*((t=t/r-1)*t*((n+1)*t+n)+1)+e}function w(t,e,i,r,n){return void 0===n&&(n=1.70158),t/=r/2,t<1?i/2*(t*t*(((n*=1.525)+1)*t-n))+e:i/2*((t-=2)*t*(((n*=1.525)+1)*t+n)+2)+e}function O(t,e,i,r){return i-T(r-t,0,i,r)+e}function T(t,e,i,r){return(t/=r)<1/2.75?i*(7.5625*t*t)+e:t<2/2.75?i*(7.5625*(t-=1.5/2.75)*t+.75)+e:t<2.5/2.75?i*(7.5625*(t-=2.25/2.75)*t+.9375)+e:i*(7.5625*(t-=2.625/2.75)*t+.984375)+e}function k(t,e,i,r){return t<r/2?.5*O(2*t,0,i,r)+e:.5*T(2*t-r,0,i,r)+.5*i+e}fabric.util.ease={easeInQuad:function(t,e,i,r){return i*(t/=r)*t+e},easeOutQuad:function(t,e,i,r){return-i*(t/=r)*(t-2)+e},easeInOutQuad:function(t,e,i,r){return t/=r/2,t<1?i/2*t*t+e:-i/2*(--t*(t-2)-1)+e},easeInCubic:function(t,e,i,r){return i*(t/=r)*t*t+e},easeOutCubic:i,easeInOutCubic:r,easeInQuart:n,easeOutQuart:s,easeInOutQuart:o,easeInQuint:a,easeOutQuint:h,easeInOutQuint:c,easeInSine:l,easeOutSine:u,easeInOutSine:f,easeInExpo:d,easeOutExpo:g,easeInOutExpo:p,easeInCirc:v,easeOutCirc:b,easeInOutCirc:m,easeInElastic:y,easeOutElastic:_,easeInOutElastic:x,easeInBack:S,easeOutBack:C,easeInOutBack:w,easeInBounce:O,easeOutBounce:T,easeInOutBounce:k}}(),function(t){"use strict";function e(t){return t in k?k[t]:t}function i(t,e,i,r){var n,s="[object Array]"===Object.prototype.toString.call(e);return"fill"!==t&&"stroke"!==t||"none"!==e?"strokeDashArray"===t?e=e.replace(/,/g," ").split(/\s+/).map(function(t){return parseFloat(t)}):"transformMatrix"===t?e=i&&i.transformMatrix?S(i.transformMatrix,v.parseTransformAttribute(e)):v.parseTransformAttribute(e):"visible"===t?(e="none"!==e&&"hidden"!==e,i&&i.visible===!1&&(e=!1)):"originX"===t?e="start"===e?"left":"end"===e?"right":"center":n=s?e.map(x):x(e,r):e="",!s&&isNaN(n)?e:n}function r(t){for(var e in j)if("undefined"!=typeof t[j[e]]&&""!==t[e]){if("undefined"==typeof t[e]){if(!v.Object.prototype[e])continue;t[e]=v.Object.prototype[e]}if(0!==t[e].indexOf("url(")){var i=new v.Color(t[e]);t[e]=i.setAlpha(_(i.getAlpha()*t[j[e]],2)).toRgba()}}return t}function n(t,e){for(var i,r,n=[],s=0;s<e.length;s++)i=e[s],r=t.getElementsByTagName(i),n=n.concat(Array.prototype.slice.call(r));return n}function s(t,r){var n,s;t.replace(/;\s*$/,"").split(";").forEach(function(t){var o=t.split(":");n=e(o[0].trim().toLowerCase()),s=i(n,o[1].trim()),r[n]=s})}function o(t,r){var n,s;for(var o in t)"undefined"!=typeof t[o]&&(n=e(o.toLowerCase()),s=i(n,t[o]),r[n]=s)}function a(t,e){var i={};for(var r in v.cssRules[e])if(h(t,r.split(" ")))for(var n in v.cssRules[e][r])i[n]=v.cssRules[e][r][n];return i}function h(t,e){var i,r=!0;return i=l(t,e.pop()),i&&e.length&&(r=c(t,e)),i&&r&&0===e.length}function c(t,e){for(var i,r=!0;t.parentNode&&1===t.parentNode.nodeType&&e.length;)r&&(i=e.pop()),t=t.parentNode,r=l(t,i);return 0===e.length}function l(t,e){var i,r=t.nodeName,n=t.getAttribute("class"),s=t.getAttribute("id");if(i=new RegExp("^"+r,"i"),e=e.replace(i,""),s&&e.length&&(i=new RegExp("#"+s+"(?![a-zA-Z\\-]+)","i"),e=e.replace(i,"")),n&&e.length){n=n.split(" ");for(var o=n.length;o--;)i=new RegExp("\\."+n[o]+"(?![a-zA-Z\\-]+)","i"),e=e.replace(i,"")}return 0===e.length}function u(t,e){var i;if(t.getElementById&&(i=t.getElementById(e)),i)return i;var r,n,s=t.getElementsByTagName("*");for(n=0;n<s.length;n++)if(r=s[n],e===r.getAttribute("id"))return r}function f(t){for(var e=n(t,["use","svg:use"]),i=0;e.length&&i<e.length;){var r,s,o,a,h,c=e[i],l=c.getAttribute("xlink:href").substr(1),f=c.getAttribute("x")||0,g=c.getAttribute("y")||0,p=u(t,l).cloneNode(!0),v=(p.getAttribute("transform")||"")+" translate("+f+", "+g+")",b=e.length;if(d(p),/^svg$/i.test(p.nodeName)){var m=p.ownerDocument.createElement("g");for(o=0,a=p.attributes,h=a.length;o<h;o++)s=a.item(o),m.setAttribute(s.nodeName,s.nodeValue);for(;p.firstChild;)m.appendChild(p.firstChild);p=m}for(o=0,a=c.attributes,h=a.length;o<h;o++)s=a.item(o),"x"!==s.nodeName&&"y"!==s.nodeName&&"xlink:href"!==s.nodeName&&("transform"===s.nodeName?v=s.nodeValue+" "+v:p.setAttribute(s.nodeName,s.nodeValue));p.setAttribute("transform",v),p.setAttribute("instantiated_by_use","1"),p.removeAttribute("id"),r=c.parentNode,r.replaceChild(p,c),e.length===b&&i++}}function d(t){var e,i,r,n,s=t.getAttribute("viewBox"),o=1,a=1,h=0,c=0,l=t.getAttribute("width"),u=t.getAttribute("height"),f=t.getAttribute("x")||0,d=t.getAttribute("y")||0,g=t.getAttribute("preserveAspectRatio")||"",p=!s||!w.test(t.nodeName)||!(s=s.match(M)),b=!l||!u||"100%"===l||"100%"===u,m=p&&b,y={},_="";if(y.width=0,y.height=0,y.toBeParsed=m,m)return y;if(p)return y.width=x(l),y.height=x(u),y;if(h=-parseFloat(s[1]),c=-parseFloat(s[2]),e=parseFloat(s[3]),i=parseFloat(s[4]),b?(y.width=e,y.height=i):(y.width=x(l),y.height=x(u),o=y.width/e,a=y.height/i),g=v.util.parsePreserveAspectRatioAttribute(g),"none"!==g.alignX&&(a=o=o>a?a:o),1===o&&1===a&&0===h&&0===c&&0===f&&0===d)return y;if((f||d)&&(_=" translate("+x(f)+" "+x(d)+") "),r=_+" matrix("+o+" 0 0 "+a+" "+h*o+" "+c*a+") ","svg"===t.nodeName){for(n=t.ownerDocument.createElement("g");t.firstChild;)n.appendChild(t.firstChild);t.appendChild(n)}else n=t,r=n.getAttribute("transform")+r;return n.setAttribute("transform",r),y}function g(t){var e=t.objects,i=t.options;return e=e.map(function(t){return v[m(t.type)].fromObject(t)}),{objects:e,options:i}}function p(t,e,i){e[i]&&e[i].toSVG&&t.push('\t<pattern x="0" y="0" id="',i,'Pattern" ','width="',e[i].source.width,'" height="',e[i].source.height,'" patternUnits="userSpaceOnUse">\n','\t\t<image x="0" y="0" ','width="',e[i].source.width,'" height="',e[i].source.height,'" xlink:href="',e[i].source.src,'"></image>\n\t</pattern>\n')}var v=t.fabric||(t.fabric={}),b=v.util.object.extend,m=v.util.string.capitalize,y=v.util.object.clone,_=v.util.toFixed,x=v.util.parseUnit,S=v.util.multiplyTransformMatrices,C=/^(path|circle|polygon|polyline|ellipse|rect|line|image|text)$/i,w=/^(symbol|image|marker|pattern|view|svg)$/i,O=/^(?:pattern|defs|symbol|metadata)$/i,T=/^(symbol|g|a|svg)$/i,k={cx:"left",x:"left",r:"radius",cy:"top",y:"top",display:"visible",visibility:"visible",transform:"transformMatrix","fill-opacity":"fillOpacity","fill-rule":"fillRule","font-family":"fontFamily","font-size":"fontSize","font-style":"fontStyle","font-weight":"fontWeight","stroke-dasharray":"strokeDashArray","stroke-linecap":"strokeLineCap","stroke-linejoin":"strokeLineJoin","stroke-miterlimit":"strokeMiterLimit","stroke-opacity":"strokeOpacity","stroke-width":"strokeWidth","text-decoration":"textDecoration","text-anchor":"originX"},j={stroke:"strokeOpacity",fill:"fillOpacity"};v.cssRules={},v.gradientDefs={},v.parseTransformAttribute=function(){function t(t,e){var i=e[0],r=3===e.length?e[1]:0,n=3===e.length?e[2]:0;t[0]=Math.cos(i),t[1]=Math.sin(i),t[2]=-Math.sin(i),t[3]=Math.cos(i),t[4]=r-(t[0]*r+t[2]*n),t[5]=n-(t[1]*r+t[3]*n)}function e(t,e){var i=e[0],r=2===e.length?e[1]:e[0];t[0]=i,t[3]=r}function i(t,e){t[2]=Math.tan(v.util.degreesToRadians(e[0]));
}function r(t,e){t[1]=Math.tan(v.util.degreesToRadians(e[0]))}function n(t,e){t[4]=e[0],2===e.length&&(t[5]=e[1])}var s=[1,0,0,1,0,0],o=v.reNum,a="(?:\\s+,?\\s*|,\\s*)",h="(?:(skewX)\\s*\\(\\s*("+o+")\\s*\\))",c="(?:(skewY)\\s*\\(\\s*("+o+")\\s*\\))",l="(?:(rotate)\\s*\\(\\s*("+o+")(?:"+a+"("+o+")"+a+"("+o+"))?\\s*\\))",u="(?:(scale)\\s*\\(\\s*("+o+")(?:"+a+"("+o+"))?\\s*\\))",f="(?:(translate)\\s*\\(\\s*("+o+")(?:"+a+"("+o+"))?\\s*\\))",d="(?:(matrix)\\s*\\(\\s*("+o+")"+a+"("+o+")"+a+"("+o+")"+a+"("+o+")"+a+"("+o+")"+a+"("+o+")\\s*\\))",g="(?:"+d+"|"+f+"|"+u+"|"+l+"|"+h+"|"+c+")",p="(?:"+g+"(?:"+a+"*"+g+")*)",b="^\\s*(?:"+p+"?)\\s*$",m=new RegExp(b),y=new RegExp(g,"g");return function(o){var a=s.concat(),h=[];if(!o||o&&!m.test(o))return a;o.replace(y,function(o){var c=new RegExp(g).exec(o).filter(function(t){return!!t}),l=c[1],u=c.slice(2).map(parseFloat);switch(l){case"translate":n(a,u);break;case"rotate":u[0]=v.util.degreesToRadians(u[0]),t(a,u);break;case"scale":e(a,u);break;case"skewX":i(a,u);break;case"skewY":r(a,u);break;case"matrix":a=u}h.push(a.concat()),a=s.concat()});for(var c=h[0];h.length>1;)h.shift(),c=v.util.multiplyTransformMatrices(c,h[0]);return c}}();var M=new RegExp("^\\s*("+v.reNum+"+)\\s*,?\\s*("+v.reNum+"+)\\s*,?\\s*("+v.reNum+"+)\\s*,?\\s*("+v.reNum+"+)\\s*$");v.parseSVGDocument=function(){function t(t,e){for(;t&&(t=t.parentNode);)if(t.nodeName&&e.test(t.nodeName.replace("svg:",""))&&!t.getAttribute("instantiated_by_use"))return!0;return!1}return function(e,i,r){if(e){f(e);var n=new Date,s=v.Object.__uid++,o=d(e),a=v.util.toArray(e.getElementsByTagName("*"));if(o.svgUid=s,0===a.length&&v.isLikelyNode){a=e.selectNodes('//*[name(.)!="svg"]');for(var h=[],c=0,l=a.length;c<l;c++)h[c]=a[c];a=h}var u=a.filter(function(e){return d(e),C.test(e.nodeName.replace("svg:",""))&&!t(e,O)});if(!u||u&&!u.length)return void(i&&i([],{}));v.gradientDefs[s]=v.getGradientDefs(e),v.cssRules[s]=v.getCSSRules(e),v.parseElements(u,function(t){v.documentParsingTime=new Date-n,i&&i(t,o)},y(o),r)}}}();var A={has:function(t,e){e(!1)},get:function(){},set:function(){}},P=new RegExp("(normal|italic)?\\s*(normal|small-caps)?\\s*(normal|bold|bolder|lighter|100|200|300|400|500|600|700|800|900)?\\s*("+v.reNum+"(?:px|cm|mm|em|pt|pc|in)*)(?:\\/(normal|"+v.reNum+"))?\\s+(.*)");b(v,{parseFontDeclaration:function(t,e){var i=t.match(P);if(i){var r=i[1],n=i[3],s=i[4],o=i[5],a=i[6];r&&(e.fontStyle=r),n&&(e.fontWeight=isNaN(parseFloat(n))?n:parseFloat(n)),s&&(e.fontSize=x(s)),a&&(e.fontFamily=a),o&&(e.lineHeight="normal"===o?1:o)}},getGradientDefs:function(t){var e,i,r,s=["linearGradient","radialGradient","svg:linearGradient","svg:radialGradient"],o=n(t,s),a=0,h={},c={};for(a=o.length;a--;)e=o[a],r=e.getAttribute("xlink:href"),i=e.getAttribute("id"),r&&(c[i]=r.substr(1)),h[i]=e;for(i in c){var l=h[c[i]].cloneNode(!0);for(e=h[i];l.firstChild;)e.appendChild(l.firstChild)}return h},parseAttributes:function(t,n,s){if(t){var o,h,c={};"undefined"==typeof s&&(s=t.getAttribute("svgUid")),t.parentNode&&T.test(t.parentNode.nodeName)&&(c=v.parseAttributes(t.parentNode,n,s)),h=c&&c.fontSize||t.getAttribute("font-size")||v.Text.DEFAULT_SVG_FONT_SIZE;var l=n.reduce(function(r,n){return o=t.getAttribute(n),o&&(n=e(n),o=i(n,o,c,h),r[n]=o),r},{});return l=b(l,b(a(t,s),v.parseStyleAttribute(t))),l.font&&v.parseFontDeclaration(l.font,l),r(b(c,l))}},parseElements:function(t,e,i,r){new v.ElementsParser(t,e,i,r).parse()},parseStyleAttribute:function(t){var e={},i=t.getAttribute("style");return i?("string"==typeof i?s(i,e):o(i,e),e):e},parsePointsAttribute:function(t){if(!t)return null;t=t.replace(/,/g," ").trim(),t=t.split(/\s+/);var e,i,r=[];for(e=0,i=t.length;e<i;e+=2)r.push({x:parseFloat(t[e]),y:parseFloat(t[e+1])});return r},getCSSRules:function(t){for(var r,n=t.getElementsByTagName("style"),s={},o=0,a=n.length;o<a;o++){var h=n[o].textContent||n[o].text;h=h.replace(/\/\*[\s\S]*?\*\//g,""),""!==h.trim()&&(r=h.match(/[^{]*\{[\s\S]*?\}/g),r=r.map(function(t){return t.trim()}),r.forEach(function(t){for(var r=t.match(/([\s\S]*?)\s*\{([^}]*)\}/),n={},o=r[2].trim(),a=o.replace(/;$/,"").split(/\s*;\s*/),h=0,c=a.length;h<c;h++){var l=a[h].split(/\s*:\s*/),u=e(l[0]),f=i(u,l[1],l[0]);n[u]=f}t=r[1],t.split(",").forEach(function(t){t=t.replace(/^svg/i,"").trim(),""!==t&&(s[t]?v.util.object.extend(s[t],n):s[t]=v.util.object.clone(n))})}))}return s},loadSVGFromURL:function(t,e,i){function r(r){var n=r.responseXML;n&&!n.documentElement&&v.window.ActiveXObject&&r.responseText&&(n=new ActiveXObject("Microsoft.XMLDOM"),n.async="false",n.loadXML(r.responseText.replace(/<!DOCTYPE[\s\S]*?(\[[\s\S]*\])*?>/i,""))),n&&n.documentElement||e&&e(null),v.parseSVGDocument(n.documentElement,function(i,r){A.set(t,{objects:v.util.array.invoke(i,"toObject"),options:r}),e&&e(i,r)},i)}t=t.replace(/^\n\s*/,"").trim(),A.has(t,function(i){i?A.get(t,function(t){var i=g(t);e(i.objects,i.options)}):new v.util.request(t,{method:"get",onComplete:r})})},loadSVGFromString:function(t,e,i){t=t.trim();var r;if("undefined"!=typeof DOMParser){var n=new DOMParser;n&&n.parseFromString&&(r=n.parseFromString(t,"text/xml"))}else v.window.ActiveXObject&&(r=new ActiveXObject("Microsoft.XMLDOM"),r.async="false",r.loadXML(t.replace(/<!DOCTYPE[\s\S]*?(\[[\s\S]*\])*?>/i,"")));v.parseSVGDocument(r.documentElement,function(t,i){e(t,i)},i)},createSVGFontFacesMarkup:function(t){for(var e,i,r,n,s,o,a,h="",c={},l=v.fontPaths,u=0,f=t.length;u<f;u++)if(e=t[u],i=e.fontFamily,e.type.indexOf("text")!==-1&&!c[i]&&l[i]&&(c[i]=!0,e.styles)){r=e.styles;for(s in r){n=r[s];for(a in n)o=n[a],i=o.fontFamily,!c[i]&&l[i]&&(c[i]=!0)}}for(var d in c)h+=["\t\t@font-face {\n","\t\t\tfont-family: '",d,"';\n","\t\t\tsrc: url('",l[d],"');\n","\t\t}\n"].join("");return h&&(h=['\t<style type="text/css">',"<![CDATA[\n",h,"]]>","</style>\n"].join("")),h},createSVGRefElementsMarkup:function(t){var e=[];return p(e,t,"backgroundColor"),p(e,t,"overlayColor"),e.join("")}})}("undefined"!=typeof exports?exports:this),fabric.ElementsParser=function(t,e,i,r){this.elements=t,this.callback=e,this.options=i,this.reviver=r,this.svgUid=i&&i.svgUid||0},fabric.ElementsParser.prototype.parse=function(){this.instances=new Array(this.elements.length),this.numElements=this.elements.length,this.createObjects()},fabric.ElementsParser.prototype.createObjects=function(){for(var t=0,e=this.elements.length;t<e;t++)this.elements[t].setAttribute("svgUid",this.svgUid),function(t,e){setTimeout(function(){t.createObject(t.elements[e],e)},0)}(this,t)},fabric.ElementsParser.prototype.createObject=function(t,e){var i=fabric[fabric.util.string.capitalize(t.tagName.replace("svg:",""))];if(i&&i.fromElement)try{this._createObject(i,t,e)}catch(t){fabric.log(t)}else this.checkIfDone()},fabric.ElementsParser.prototype._createObject=function(t,e,i){if(t.async)t.fromElement(e,this.createCallback(i,e),this.options);else{var r=t.fromElement(e,this.options);this.resolveGradient(r,"fill"),this.resolveGradient(r,"stroke"),this.reviver&&this.reviver(e,r),this.instances[i]=r,this.checkIfDone()}},fabric.ElementsParser.prototype.createCallback=function(t,e){var i=this;return function(r){i.resolveGradient(r,"fill"),i.resolveGradient(r,"stroke"),i.reviver&&i.reviver(e,r),i.instances[t]=r,i.checkIfDone()}},fabric.ElementsParser.prototype.resolveGradient=function(t,e){var i=t.get(e);if(/^url\(/.test(i)){var r=i.slice(5,i.length-1);fabric.gradientDefs[this.svgUid][r]&&t.set(e,fabric.Gradient.fromElement(fabric.gradientDefs[this.svgUid][r],t))}},fabric.ElementsParser.prototype.checkIfDone=function(){0===--this.numElements&&(this.instances=this.instances.filter(function(t){return null!=t}),this.callback(this.instances))},function(t){"use strict";function e(t,e){this.x=t,this.y=e}var i=t.fabric||(t.fabric={});return i.Point?void i.warn("fabric.Point is already defined"):(i.Point=e,void(e.prototype={type:"point",constructor:e,add:function(t){return new e(this.x+t.x,this.y+t.y)},addEquals:function(t){return this.x+=t.x,this.y+=t.y,this},scalarAdd:function(t){return new e(this.x+t,this.y+t)},scalarAddEquals:function(t){return this.x+=t,this.y+=t,this},subtract:function(t){return new e(this.x-t.x,this.y-t.y)},subtractEquals:function(t){return this.x-=t.x,this.y-=t.y,this},scalarSubtract:function(t){return new e(this.x-t,this.y-t)},scalarSubtractEquals:function(t){return this.x-=t,this.y-=t,this},multiply:function(t){return new e(this.x*t,this.y*t)},multiplyEquals:function(t){return this.x*=t,this.y*=t,this},divide:function(t){return new e(this.x/t,this.y/t)},divideEquals:function(t){return this.x/=t,this.y/=t,this},eq:function(t){return this.x===t.x&&this.y===t.y},lt:function(t){return this.x<t.x&&this.y<t.y},lte:function(t){return this.x<=t.x&&this.y<=t.y},gt:function(t){return this.x>t.x&&this.y>t.y},gte:function(t){return this.x>=t.x&&this.y>=t.y},lerp:function(t,i){return"undefined"==typeof i&&(i=.5),i=Math.max(Math.min(1,i),0),new e(this.x+(t.x-this.x)*i,this.y+(t.y-this.y)*i)},distanceFrom:function(t){var e=this.x-t.x,i=this.y-t.y;return Math.sqrt(e*e+i*i)},midPointFrom:function(t){return this.lerp(t)},min:function(t){return new e(Math.min(this.x,t.x),Math.min(this.y,t.y))},max:function(t){return new e(Math.max(this.x,t.x),Math.max(this.y,t.y))},toString:function(){return this.x+","+this.y},setXY:function(t,e){return this.x=t,this.y=e,this},setX:function(t){return this.x=t,this},setY:function(t){return this.y=t,this},setFromPoint:function(t){return this.x=t.x,this.y=t.y,this},swap:function(t){var e=this.x,i=this.y;this.x=t.x,this.y=t.y,t.x=e,t.y=i},clone:function(){return new e(this.x,this.y)}}))}("undefined"!=typeof exports?exports:this),function(t){"use strict";function e(t){this.status=t,this.points=[]}var i=t.fabric||(t.fabric={});return i.Intersection?void i.warn("fabric.Intersection is already defined"):(i.Intersection=e,i.Intersection.prototype={constructor:e,appendPoint:function(t){return this.points.push(t),this},appendPoints:function(t){return this.points=this.points.concat(t),this}},i.Intersection.intersectLineLine=function(t,r,n,s){var o,a=(s.x-n.x)*(t.y-n.y)-(s.y-n.y)*(t.x-n.x),h=(r.x-t.x)*(t.y-n.y)-(r.y-t.y)*(t.x-n.x),c=(s.y-n.y)*(r.x-t.x)-(s.x-n.x)*(r.y-t.y);if(0!==c){var l=a/c,u=h/c;0<=l&&l<=1&&0<=u&&u<=1?(o=new e("Intersection"),o.appendPoint(new i.Point(t.x+l*(r.x-t.x),t.y+l*(r.y-t.y)))):o=new e}else o=new e(0===a||0===h?"Coincident":"Parallel");return o},i.Intersection.intersectLinePolygon=function(t,i,r){for(var n,s,o,a=new e,h=r.length,c=0;c<h;c++)n=r[c],s=r[(c+1)%h],o=e.intersectLineLine(t,i,n,s),a.appendPoints(o.points);return a.points.length>0&&(a.status="Intersection"),a},i.Intersection.intersectPolygonPolygon=function(t,i){for(var r=new e,n=t.length,s=0;s<n;s++){var o=t[s],a=t[(s+1)%n],h=e.intersectLinePolygon(o,a,i);r.appendPoints(h.points)}return r.points.length>0&&(r.status="Intersection"),r},void(i.Intersection.intersectPolygonRectangle=function(t,r,n){var s=r.min(n),o=r.max(n),a=new i.Point(o.x,s.y),h=new i.Point(s.x,o.y),c=e.intersectLinePolygon(s,a,t),l=e.intersectLinePolygon(a,o,t),u=e.intersectLinePolygon(o,h,t),f=e.intersectLinePolygon(h,s,t),d=new e;return d.appendPoints(c.points),d.appendPoints(l.points),d.appendPoints(u.points),d.appendPoints(f.points),d.points.length>0&&(d.status="Intersection"),d}))}("undefined"!=typeof exports?exports:this),function(t){"use strict";function e(t){t?this._tryParsingColor(t):this.setSource([0,0,0,1])}function i(t,e,i){return i<0&&(i+=1),i>1&&(i-=1),i<1/6?t+6*(e-t)*i:i<.5?e:i<2/3?t+(e-t)*(2/3-i)*6:t}var r=t.fabric||(t.fabric={});return r.Color?void r.warn("fabric.Color is already defined."):(r.Color=e,r.Color.prototype={_tryParsingColor:function(t){var i;t in e.colorNameMap&&(t=e.colorNameMap[t]),"transparent"===t&&(i=[255,255,255,0]),i||(i=e.sourceFromHex(t)),i||(i=e.sourceFromRgb(t)),i||(i=e.sourceFromHsl(t)),i||(i=[0,0,0,1]),i&&this.setSource(i)},_rgbToHsl:function(t,e,i){t/=255,e/=255,i/=255;var n,s,o,a=r.util.array.max([t,e,i]),h=r.util.array.min([t,e,i]);if(o=(a+h)/2,a===h)n=s=0;else{var c=a-h;switch(s=o>.5?c/(2-a-h):c/(a+h),a){case t:n=(e-i)/c+(e<i?6:0);break;case e:n=(i-t)/c+2;break;case i:n=(t-e)/c+4}n/=6}return[Math.round(360*n),Math.round(100*s),Math.round(100*o)]},getSource:function(){return this._source},setSource:function(t){this._source=t},toRgb:function(){var t=this.getSource();return"rgb("+t[0]+","+t[1]+","+t[2]+")"},toRgba:function(){var t=this.getSource();return"rgba("+t[0]+","+t[1]+","+t[2]+","+t[3]+")"},toHsl:function(){var t=this.getSource(),e=this._rgbToHsl(t[0],t[1],t[2]);return"hsl("+e[0]+","+e[1]+"%,"+e[2]+"%)"},toHsla:function(){var t=this.getSource(),e=this._rgbToHsl(t[0],t[1],t[2]);return"hsla("+e[0]+","+e[1]+"%,"+e[2]+"%,"+t[3]+")"},toHex:function(){var t,e,i,r=this.getSource();return t=r[0].toString(16),t=1===t.length?"0"+t:t,e=r[1].toString(16),e=1===e.length?"0"+e:e,i=r[2].toString(16),i=1===i.length?"0"+i:i,t.toUpperCase()+e.toUpperCase()+i.toUpperCase()},getAlpha:function(){return this.getSource()[3]},setAlpha:function(t){var e=this.getSource();return e[3]=t,this.setSource(e),this},toGrayscale:function(){var t=this.getSource(),e=parseInt((.3*t[0]+.59*t[1]+.11*t[2]).toFixed(0),10),i=t[3];return this.setSource([e,e,e,i]),this},toBlackWhite:function(t){var e=this.getSource(),i=(.3*e[0]+.59*e[1]+.11*e[2]).toFixed(0),r=e[3];return t=t||127,i=Number(i)<Number(t)?0:255,this.setSource([i,i,i,r]),this},overlayWith:function(t){t instanceof e||(t=new e(t));for(var i=[],r=this.getAlpha(),n=.5,s=this.getSource(),o=t.getSource(),a=0;a<3;a++)i.push(Math.round(s[a]*(1-n)+o[a]*n));return i[3]=r,this.setSource(i),this}},r.Color.reRGBa=/^rgba?\(\s*(\d{1,3}(?:\.\d+)?\%?)\s*,\s*(\d{1,3}(?:\.\d+)?\%?)\s*,\s*(\d{1,3}(?:\.\d+)?\%?)\s*(?:\s*,\s*(\d+(?:\.\d+)?)\s*)?\)$/,r.Color.reHSLa=/^hsla?\(\s*(\d{1,3})\s*,\s*(\d{1,3}\%)\s*,\s*(\d{1,3}\%)\s*(?:\s*,\s*(\d+(?:\.\d+)?)\s*)?\)$/,r.Color.reHex=/^#?([0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{4}|[0-9a-f]{3})$/i,r.Color.colorNameMap={aqua:"#00FFFF",black:"#000000",blue:"#0000FF",fuchsia:"#FF00FF",gray:"#808080",grey:"#808080",green:"#008000",lime:"#00FF00",maroon:"#800000",navy:"#000080",olive:"#808000",orange:"#FFA500",purple:"#800080",red:"#FF0000",silver:"#C0C0C0",teal:"#008080",white:"#FFFFFF",yellow:"#FFFF00"},r.Color.fromRgb=function(t){return e.fromSource(e.sourceFromRgb(t))},r.Color.sourceFromRgb=function(t){var i=t.match(e.reRGBa);if(i){var r=parseInt(i[1],10)/(/%$/.test(i[1])?100:1)*(/%$/.test(i[1])?255:1),n=parseInt(i[2],10)/(/%$/.test(i[2])?100:1)*(/%$/.test(i[2])?255:1),s=parseInt(i[3],10)/(/%$/.test(i[3])?100:1)*(/%$/.test(i[3])?255:1);return[parseInt(r,10),parseInt(n,10),parseInt(s,10),i[4]?parseFloat(i[4]):1]}},r.Color.fromRgba=e.fromRgb,r.Color.fromHsl=function(t){return e.fromSource(e.sourceFromHsl(t))},r.Color.sourceFromHsl=function(t){var r=t.match(e.reHSLa);if(r){var n,s,o,a=(parseFloat(r[1])%360+360)%360/360,h=parseFloat(r[2])/(/%$/.test(r[2])?100:1),c=parseFloat(r[3])/(/%$/.test(r[3])?100:1);if(0===h)n=s=o=c;else{var l=c<=.5?c*(h+1):c+h-c*h,u=2*c-l;n=i(u,l,a+1/3),s=i(u,l,a),o=i(u,l,a-1/3)}return[Math.round(255*n),Math.round(255*s),Math.round(255*o),r[4]?parseFloat(r[4]):1]}},r.Color.fromHsla=e.fromHsl,r.Color.fromHex=function(t){return e.fromSource(e.sourceFromHex(t))},r.Color.sourceFromHex=function(t){if(t.match(e.reHex)){var i=t.slice(t.indexOf("#")+1),r=3===i.length||4===i.length,n=8===i.length||4===i.length,s=r?i.charAt(0)+i.charAt(0):i.substring(0,2),o=r?i.charAt(1)+i.charAt(1):i.substring(2,4),a=r?i.charAt(2)+i.charAt(2):i.substring(4,6),h=n?r?i.charAt(3)+i.charAt(3):i.substring(6,8):"FF";return[parseInt(s,16),parseInt(o,16),parseInt(a,16),parseFloat((parseInt(h,16)/255).toFixed(2))]}},void(r.Color.fromSource=function(t){var i=new e;return i.setSource(t),i}))}("undefined"!=typeof exports?exports:this),function(){function t(t){var e,i,r,n=t.getAttribute("style"),s=t.getAttribute("offset")||0;if(s=parseFloat(s)/(/%$/.test(s)?100:1),s=s<0?0:s>1?1:s,n){var o=n.split(/\s*;\s*/);""===o[o.length-1]&&o.pop();for(var a=o.length;a--;){var h=o[a].split(/\s*:\s*/),c=h[0].trim(),l=h[1].trim();"stop-color"===c?e=l:"stop-opacity"===c&&(r=l)}}return e||(e=t.getAttribute("stop-color")||"rgb(0,0,0)"),r||(r=t.getAttribute("stop-opacity")),e=new fabric.Color(e),i=e.getAlpha(),r=isNaN(parseFloat(r))?1:parseFloat(r),r*=i,{offset:s,color:e.toRgb(),opacity:r}}function e(t){return{x1:t.getAttribute("x1")||0,y1:t.getAttribute("y1")||0,x2:t.getAttribute("x2")||"100%",y2:t.getAttribute("y2")||0}}function i(t){return{x1:t.getAttribute("fx")||t.getAttribute("cx")||"50%",y1:t.getAttribute("fy")||t.getAttribute("cy")||"50%",r1:0,x2:t.getAttribute("cx")||"50%",y2:t.getAttribute("cy")||"50%",r2:t.getAttribute("r")||"50%"}}function r(t,e,i){var r,n=0,s=1,o="";for(var a in e)"Infinity"===e[a]?e[a]=1:"-Infinity"===e[a]&&(e[a]=0),r=parseFloat(e[a],10),s="string"==typeof e[a]&&/^\d+%$/.test(e[a])?.01:1,"x1"===a||"x2"===a||"r2"===a?(s*="objectBoundingBox"===i?t.width:1,n="objectBoundingBox"===i?t.left||0:0):"y1"!==a&&"y2"!==a||(s*="objectBoundingBox"===i?t.height:1,n="objectBoundingBox"===i?t.top||0:0),e[a]=r*s+n;if("ellipse"===t.type&&null!==e.r2&&"objectBoundingBox"===i&&t.rx!==t.ry){var h=t.ry/t.rx;o=" scale(1, "+h+")",e.y1&&(e.y1/=h),e.y2&&(e.y2/=h)}return o}fabric.Gradient=fabric.util.createClass({offsetX:0,offsetY:0,initialize:function(t){t||(t={});var e={};this.id=fabric.Object.__uid++,this.type=t.type||"linear",e={x1:t.coords.x1||0,y1:t.coords.y1||0,x2:t.coords.x2||0,y2:t.coords.y2||0},"radial"===this.type&&(e.r1=t.coords.r1||0,e.r2=t.coords.r2||0),this.coords=e,this.colorStops=t.colorStops.slice(),t.gradientTransform&&(this.gradientTransform=t.gradientTransform),this.offsetX=t.offsetX||this.offsetX,this.offsetY=t.offsetY||this.offsetY},addColorStop:function(t){for(var e in t){var i=new fabric.Color(t[e]);this.colorStops.push({offset:e,color:i.toRgb(),opacity:i.getAlpha()})}return this},toObject:function(){return{type:this.type,coords:this.coords,colorStops:this.colorStops,offsetX:this.offsetX,offsetY:this.offsetY,gradientTransform:this.gradientTransform?this.gradientTransform.concat():this.gradientTransform}},toSVG:function(t){var e,i,r=fabric.util.object.clone(this.coords);if(this.colorStops.sort(function(t,e){return t.offset-e.offset}),!t.group||"path-group"!==t.group.type)for(var n in r)"x1"===n||"x2"===n||"r2"===n?r[n]+=this.offsetX-t.width/2:"y1"!==n&&"y2"!==n||(r[n]+=this.offsetY-t.height/2);i='id="SVGID_'+this.id+'" gradientUnits="userSpaceOnUse"',this.gradientTransform&&(i+=' gradientTransform="matrix('+this.gradientTransform.join(" ")+')" '),"linear"===this.type?e=["<linearGradient ",i,' x1="',r.x1,'" y1="',r.y1,'" x2="',r.x2,'" y2="',r.y2,'">\n']:"radial"===this.type&&(e=["<radialGradient ",i,' cx="',r.x2,'" cy="',r.y2,'" r="',r.r2,'" fx="',r.x1,'" fy="',r.y1,'">\n']);for(var s=0;s<this.colorStops.length;s++)e.push("<stop ",'offset="',100*this.colorStops[s].offset+"%",'" style="stop-color:',this.colorStops[s].color,null!==this.colorStops[s].opacity?";stop-opacity: "+this.colorStops[s].opacity:";",'"/>\n');return e.push("linear"===this.type?"</linearGradient>\n":"</radialGradient>\n"),e.join("")},toLive:function(t,e){var i,r,n=fabric.util.object.clone(this.coords);if(this.type){if(e.group&&"path-group"===e.group.type)for(r in n)"x1"===r||"x2"===r?n[r]+=-this.offsetX+e.width/2:"y1"!==r&&"y2"!==r||(n[r]+=-this.offsetY+e.height/2);"linear"===this.type?i=t.createLinearGradient(n.x1,n.y1,n.x2,n.y2):"radial"===this.type&&(i=t.createRadialGradient(n.x1,n.y1,n.r1,n.x2,n.y2,n.r2));for(var s=0,o=this.colorStops.length;s<o;s++){var a=this.colorStops[s].color,h=this.colorStops[s].opacity,c=this.colorStops[s].offset;"undefined"!=typeof h&&(a=new fabric.Color(a).setAlpha(h).toRgba()),i.addColorStop(parseFloat(c),a)}return i}}}),fabric.util.object.extend(fabric.Gradient,{fromElement:function(n,s){var o,a,h,c=n.getElementsByTagName("stop"),l=n.getAttribute("gradientUnits")||"objectBoundingBox",u=n.getAttribute("gradientTransform"),f=[];o="linearGradient"===n.nodeName||"LINEARGRADIENT"===n.nodeName?"linear":"radial","linear"===o?a=e(n):"radial"===o&&(a=i(n));for(var d=c.length;d--;)f.push(t(c[d]));h=r(s,a,l);var g=new fabric.Gradient({type:o,coords:a,colorStops:f,offsetX:-s.left,offsetY:-s.top});return(u||""!==h)&&(g.gradientTransform=fabric.parseTransformAttribute((u||"")+h)),g},forObject:function(t,e){return e||(e={}),r(t,e.coords,"userSpaceOnUse"),new fabric.Gradient(e)}})}(),fabric.Pattern=fabric.util.createClass({repeat:"repeat",offsetX:0,offsetY:0,initialize:function(t){if(t||(t={}),this.id=fabric.Object.__uid++,t.source)if("string"==typeof t.source)if("undefined"!=typeof fabric.util.getFunctionBody(t.source))this.source=new Function(fabric.util.getFunctionBody(t.source));else{var e=this;this.source=fabric.util.createImage(),fabric.util.loadImage(t.source,function(t){e.source=t})}else this.source=t.source;t.repeat&&(this.repeat=t.repeat),t.offsetX&&(this.offsetX=t.offsetX),t.offsetY&&(this.offsetY=t.offsetY)},toObject:function(){var t;return"function"==typeof this.source?t=String(this.source):"string"==typeof this.source.src?t=this.source.src:"object"==typeof this.source&&this.source.toDataURL&&(t=this.source.toDataURL()),{source:t,repeat:this.repeat,offsetX:this.offsetX,offsetY:this.offsetY}},toSVG:function(t){var e="function"==typeof this.source?this.source():this.source,i=e.width/t.getWidth(),r=e.height/t.getHeight(),n=this.offsetX/t.getWidth(),s=this.offsetY/t.getHeight(),o="";return"repeat-x"!==this.repeat&&"no-repeat"!==this.repeat||(r=1),"repeat-y"!==this.repeat&&"no-repeat"!==this.repeat||(i=1),e.src?o=e.src:e.toDataURL&&(o=e.toDataURL()),'<pattern id="SVGID_'+this.id+'" x="'+n+'" y="'+s+'" width="'+i+'" height="'+r+'">\n<image x="0" y="0" width="'+e.width+'" height="'+e.height+'" xlink:href="'+o+'"></image>\n</pattern>\n'},toLive:function(t){var e="function"==typeof this.source?this.source():this.source;if(!e)return"";if("undefined"!=typeof e.src){if(!e.complete)return"";if(0===e.naturalWidth||0===e.naturalHeight)return""}return t.createPattern(e,this.repeat)}}),function(t){"use strict";var e=t.fabric||(t.fabric={}),i=e.util.toFixed;return e.Shadow?void e.warn("fabric.Shadow is already defined."):(e.Shadow=e.util.createClass({color:"rgb(0,0,0)",blur:0,offsetX:0,offsetY:0,affectStroke:!1,includeDefaultValues:!0,initialize:function(t){"string"==typeof t&&(t=this._parseShadow(t));for(var i in t)this[i]=t[i];this.id=e.Object.__uid++},_parseShadow:function(t){var i=t.trim(),r=e.Shadow.reOffsetsAndBlur.exec(i)||[],n=i.replace(e.Shadow.reOffsetsAndBlur,"")||"rgb(0,0,0)";return{color:n.trim(),offsetX:parseInt(r[1],10)||0,offsetY:parseInt(r[2],10)||0,blur:parseInt(r[3],10)||0}},toString:function(){return[this.offsetX,this.offsetY,this.blur,this.color].join("px ")},toSVG:function(t){var r=40,n=40,s=e.Object.NUM_FRACTION_DIGITS,o=e.util.rotateVector({x:this.offsetX,y:this.offsetY},e.util.degreesToRadians(-t.angle)),a=20;return t.width&&t.height&&(r=100*i((Math.abs(o.x)+this.blur)/t.width,s)+a,n=100*i((Math.abs(o.y)+this.blur)/t.height,s)+a),t.flipX&&(o.x*=-1),t.flipY&&(o.y*=-1),'<filter id="SVGID_'+this.id+'" y="-'+n+'%" height="'+(100+2*n)+'%" x="-'+r+'%" width="'+(100+2*r)+'%" >\n\t<feGaussianBlur in="SourceAlpha" stdDeviation="'+i(this.blur?this.blur/2:0,s)+'"></feGaussianBlur>\n\t<feOffset dx="'+i(o.x,s)+'" dy="'+i(o.y,s)+'" result="oBlur" ></feOffset>\n\t<feFlood flood-color="'+this.color+'"/>\n\t<feComposite in2="oBlur" operator="in" />\n\t<feMerge>\n\t\t<feMergeNode></feMergeNode>\n\t\t<feMergeNode in="SourceGraphic"></feMergeNode>\n\t</feMerge>\n</filter>\n'},toObject:function(){if(this.includeDefaultValues)return{color:this.color,blur:this.blur,offsetX:this.offsetX,offsetY:this.offsetY,affectStroke:this.affectStroke};var t={},i=e.Shadow.prototype;return["color","blur","offsetX","offsetY","affectStroke"].forEach(function(e){this[e]!==i[e]&&(t[e]=this[e])},this),t}}),void(e.Shadow.reOffsetsAndBlur=/(?:\s|^)(-?\d+(?:px)?(?:\s?|$))?(-?\d+(?:px)?(?:\s?|$))?(\d+(?:px)?)?(?:\s?|$)(?:$|\s)/))}("undefined"!=typeof exports?exports:this),function(){"use strict";if(fabric.StaticCanvas)return void fabric.warn("fabric.StaticCanvas is already defined.");var t=fabric.util.object.extend,e=fabric.util.getElementOffset,i=fabric.util.removeFromArray,r=fabric.util.toFixed,n=new Error("Could not initialize `canvas` element");fabric.StaticCanvas=fabric.util.createClass({initialize:function(t,e){e||(e={}),this._initStatic(t,e)},backgroundColor:"",backgroundImage:null,overlayColor:"",overlayImage:null,includeDefaultValues:!0,stateful:!0,renderOnAddRemove:!0,clipTo:null,controlsAboveOverlay:!1,allowTouchScrolling:!1,imageSmoothingEnabled:!0,viewportTransform:[1,0,0,1,0,0],backgroundVpt:!0,overlayVpt:!0,onBeforeScaleRotate:function(){},enableRetinaScaling:!0,_initStatic:function(t,e){var i=fabric.StaticCanvas.prototype.renderAll.bind(this);this._objects=[],this._createLowerCanvas(t),this._initOptions(e),this._setImageSmoothing(),this.interactive||this._initRetinaScaling(),e.overlayImage&&this.setOverlayImage(e.overlayImage,i),e.backgroundImage&&this.setBackgroundImage(e.backgroundImage,i),e.backgroundColor&&this.setBackgroundColor(e.backgroundColor,i),e.overlayColor&&this.setOverlayColor(e.overlayColor,i),this.calcOffset()},_isRetinaScaling:function(){return 1!==fabric.devicePixelRatio&&this.enableRetinaScaling},getRetinaScaling:function(){return this._isRetinaScaling()?fabric.devicePixelRatio:1},_initRetinaScaling:function(){this._isRetinaScaling()&&(this.lowerCanvasEl.setAttribute("width",this.width*fabric.devicePixelRatio),this.lowerCanvasEl.setAttribute("height",this.height*fabric.devicePixelRatio),this.contextContainer.scale(fabric.devicePixelRatio,fabric.devicePixelRatio))},calcOffset:function(){return this._offset=e(this.lowerCanvasEl),this},setOverlayImage:function(t,e,i){return this.__setBgOverlayImage("overlayImage",t,e,i)},setBackgroundImage:function(t,e,i){return this.__setBgOverlayImage("backgroundImage",t,e,i)},setOverlayColor:function(t,e){return this.__setBgOverlayColor("overlayColor",t,e)},setBackgroundColor:function(t,e){return this.__setBgOverlayColor("backgroundColor",t,e)},_setImageSmoothing:function(){var t=this.getContext();t.imageSmoothingEnabled=t.imageSmoothingEnabled||t.webkitImageSmoothingEnabled||t.mozImageSmoothingEnabled||t.msImageSmoothingEnabled||t.oImageSmoothingEnabled,t.imageSmoothingEnabled=this.imageSmoothingEnabled},__setBgOverlayImage:function(t,e,i,r){return"string"==typeof e?fabric.util.loadImage(e,function(e){e&&(this[t]=new fabric.Image(e,r)),i&&i(e)},this,r&&r.crossOrigin):(r&&e.setOptions(r),this[t]=e,i&&i(e)),this},__setBgOverlayColor:function(t,e,i){if(e&&e.source){var r=this;fabric.util.loadImage(e.source,function(n){r[t]=new fabric.Pattern({source:n,repeat:e.repeat,offsetX:e.offsetX,offsetY:e.offsetY}),i&&i()})}else this[t]=e,i&&i();return this},_createCanvasElement:function(t){var e=fabric.util.createCanvasElement(t);if(e.style||(e.style={}),!e)throw n;if("undefined"==typeof e.getContext)throw n;return e},_initOptions:function(t){for(var e in t)this[e]=t[e];this.width=this.width||parseInt(this.lowerCanvasEl.width,10)||0,this.height=this.height||parseInt(this.lowerCanvasEl.height,10)||0,this.lowerCanvasEl.style&&(this.lowerCanvasEl.width=this.width,this.lowerCanvasEl.height=this.height,this.lowerCanvasEl.style.width=this.width+"px",this.lowerCanvasEl.style.height=this.height+"px",this.viewportTransform=this.viewportTransform.slice())},_createLowerCanvas:function(t){this.lowerCanvasEl=fabric.util.getById(t)||this._createCanvasElement(t),fabric.util.addClass(this.lowerCanvasEl,"lower-canvas"),this.interactive&&this._applyCanvasStyle(this.lowerCanvasEl),this.contextContainer=this.lowerCanvasEl.getContext("2d")},getWidth:function(){return this.width},getHeight:function(){return this.height},setWidth:function(t,e){return this.setDimensions({width:t},e)},setHeight:function(t,e){return this.setDimensions({height:t},e)},setDimensions:function(t,e){var i;e=e||{};for(var r in t)i=t[r],e.cssOnly||(this._setBackstoreDimension(r,t[r]),i+="px"),e.backstoreOnly||this._setCssDimension(r,i);return this._initRetinaScaling(),this._setImageSmoothing(),this.calcOffset(),e.cssOnly||this.renderAll(),this},_setBackstoreDimension:function(t,e){return this.lowerCanvasEl[t]=e,this.upperCanvasEl&&(this.upperCanvasEl[t]=e),this.cacheCanvasEl&&(this.cacheCanvasEl[t]=e),this[t]=e,this},_setCssDimension:function(t,e){return this.lowerCanvasEl.style[t]=e,this.upperCanvasEl&&(this.upperCanvasEl.style[t]=e),this.wrapperEl&&(this.wrapperEl.style[t]=e),this},getZoom:function(){return Math.sqrt(this.viewportTransform[0]*this.viewportTransform[3])},setViewportTransform:function(t){var e,i=this._activeGroup;this.viewportTransform=t;for(var r=0,n=this._objects.length;r<n;r++)e=this._objects[r],e.group||e.setCoords();return i&&i.setCoords(),this.renderAll(),this},zoomToPoint:function(t,e){var i=t,r=this.viewportTransform.slice(0);t=fabric.util.transformPoint(t,fabric.util.invertTransform(this.viewportTransform)),r[0]=e,r[3]=e;var n=fabric.util.transformPoint(t,r);return r[4]+=i.x-n.x,r[5]+=i.y-n.y,this.setViewportTransform(r)},setZoom:function(t){return this.zoomToPoint(new fabric.Point(0,0),t),this},absolutePan:function(t){var e=this.viewportTransform.slice(0);return e[4]=-t.x,e[5]=-t.y,this.setViewportTransform(e)},relativePan:function(t){return this.absolutePan(new fabric.Point(-t.x-this.viewportTransform[4],-t.y-this.viewportTransform[5]))},getElement:function(){return this.lowerCanvasEl},_onObjectAdded:function(t){this.stateful&&t.setupState(),t._set("canvas",this),t.setCoords(),this.fire("object:added",{target:t}),t.fire("added")},_onObjectRemoved:function(t){this.fire("object:removed",{target:t}),t.fire("removed"),delete t.canvas},clearContext:function(t){return t.clearRect(0,0,this.width,this.height),this},getContext:function(){return this.contextContainer},clear:function(){return this._objects.length=0,this.backgroundImage=null,this.overlayImage=null,this.backgroundColor="",this.overlayColor="",this._hasITextHandlers&&(this.off("selection:cleared",this._canvasITextSelectionClearedHanlder),this.off("object:selected",this._canvasITextSelectionClearedHanlder),this.off("mouse:up",this._mouseUpITextHandler),this._iTextInstances=null,this._hasITextHandlers=!1),this.clearContext(this.contextContainer),this.fire("canvas:cleared"),this.renderAll(),this},renderAll:function(){var t=this.contextContainer;return this.renderCanvas(t,this._objects),this},renderCanvas:function(t,e){this.clearContext(t),this.fire("before:render"),this.clipTo&&fabric.util.clipContext(this,t),this._renderBackground(t),t.save(),t.transform.apply(t,this.viewportTransform),this._renderObjects(t,e),t.restore(),!this.controlsAboveOverlay&&this.interactive&&this.drawControls(t),this.clipTo&&t.restore(),this._renderOverlay(t),this.controlsAboveOverlay&&this.interactive&&this.drawControls(t),this.fire("after:render")},_renderObjects:function(t,e){for(var i=0,r=e.length;i<r;++i)e[i]&&e[i].render(t)},_renderBackgroundOrOverlay:function(t,e){var i=this[e+"Color"];i&&(t.fillStyle=i.toLive?i.toLive(t):i,t.fillRect(i.offsetX||0,i.offsetY||0,this.width,this.height)),i=this[e+"Image"],i&&(this[e+"Vpt"]&&(t.save(),t.transform.apply(t,this.viewportTransform)),i.render(t),this[e+"Vpt"]&&t.restore())},_renderBackground:function(t){this._renderBackgroundOrOverlay(t,"background")},_renderOverlay:function(t){this._renderBackgroundOrOverlay(t,"overlay")},getCenter:function(){return{top:this.getHeight()/2,left:this.getWidth()/2}},centerObjectH:function(t){return this._centerObject(t,new fabric.Point(this.getCenter().left,t.getCenterPoint().y))},centerObjectV:function(t){return this._centerObject(t,new fabric.Point(t.getCenterPoint().x,this.getCenter().top))},centerObject:function(t){var e=this.getCenter();return this._centerObject(t,new fabric.Point(e.left,e.top))},viewportCenterObject:function(t){var e=this.getVpCenter();return this._centerObject(t,e)},viewportCenterObjectH:function(t){var e=this.getVpCenter();return this._centerObject(t,new fabric.Point(e.x,t.getCenterPoint().y)),
this},viewportCenterObjectV:function(t){var e=this.getVpCenter();return this._centerObject(t,new fabric.Point(t.getCenterPoint().x,e.y))},getVpCenter:function(){var t=this.getCenter(),e=fabric.util.invertTransform(this.viewportTransform);return fabric.util.transformPoint({x:t.left,y:t.top},e)},_centerObject:function(t,e){return t.setPositionByOrigin(e,"center","center"),this.renderAll(),this},toDatalessJSON:function(t){return this.toDatalessObject(t)},toObject:function(t){return this._toObjectMethod("toObject",t)},toDatalessObject:function(t){return this._toObjectMethod("toDatalessObject",t)},_toObjectMethod:function(e,i){var r={objects:this._toObjects(e,i)};return t(r,this.__serializeBgOverlay(e,i)),fabric.util.populateWithProperties(this,r,i),r},_toObjects:function(t,e){return this.getObjects().filter(function(t){return!t.excludeFromExport}).map(function(i){return this._toObject(i,t,e)},this)},_toObject:function(t,e,i){var r;this.includeDefaultValues||(r=t.includeDefaultValues,t.includeDefaultValues=!1);var n=t[e](i);return this.includeDefaultValues||(t.includeDefaultValues=r),n},__serializeBgOverlay:function(t,e){var i={background:this.backgroundColor&&this.backgroundColor.toObject?this.backgroundColor.toObject(e):this.backgroundColor};return this.overlayColor&&(i.overlay=this.overlayColor.toObject?this.overlayColor.toObject(e):this.overlayColor),this.backgroundImage&&(i.backgroundImage=this._toObject(this.backgroundImage,t,e)),this.overlayImage&&(i.overlayImage=this._toObject(this.overlayImage,t,e)),i},svgViewportTransformation:!0,toSVG:function(t,e){t||(t={});var i=[];return this._setSVGPreamble(i,t),this._setSVGHeader(i,t),this._setSVGBgOverlayColor(i,"backgroundColor"),this._setSVGBgOverlayImage(i,"backgroundImage",e),this._setSVGObjects(i,e),this._setSVGBgOverlayColor(i,"overlayColor"),this._setSVGBgOverlayImage(i,"overlayImage",e),i.push("</svg>"),i.join("")},_setSVGPreamble:function(t,e){e.suppressPreamble||t.push('<?xml version="1.0" encoding="',e.encoding||"UTF-8",'" standalone="no" ?>\n','<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" ','"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n')},_setSVGHeader:function(t,e){var i,n=e.width||this.width,s=e.height||this.height,o='viewBox="0 0 '+this.width+" "+this.height+'" ',a=fabric.Object.NUM_FRACTION_DIGITS;e.viewBox?o='viewBox="'+e.viewBox.x+" "+e.viewBox.y+" "+e.viewBox.width+" "+e.viewBox.height+'" ':this.svgViewportTransformation&&(i=this.viewportTransform,o='viewBox="'+r(-i[4]/i[0],a)+" "+r(-i[5]/i[3],a)+" "+r(this.width/i[0],a)+" "+r(this.height/i[3],a)+'" '),t.push("<svg ",'xmlns="http://www.w3.org/2000/svg" ','xmlns:xlink="http://www.w3.org/1999/xlink" ','version="1.1" ','width="',n,'" ','height="',s,'" ',this.backgroundColor&&!this.backgroundColor.toLive?'style="background-color: '+this.backgroundColor+'" ':null,o,'xml:space="preserve">\n',"<desc>Created with Fabric.js ",fabric.version,"</desc>\n","<defs>",fabric.createSVGFontFacesMarkup(this.getObjects()),fabric.createSVGRefElementsMarkup(this),"</defs>\n")},_setSVGObjects:function(t,e){for(var i,r=0,n=this.getObjects(),s=n.length;r<s;r++)i=n[r],i.excludeFromExport||this._setSVGObject(t,i,e)},_setSVGObject:function(t,e,i){t.push(e.toSVG(i))},_setSVGBgOverlayImage:function(t,e,i){this[e]&&this[e].toSVG&&t.push(this[e].toSVG(i))},_setSVGBgOverlayColor:function(t,e){this[e]&&this[e].source?t.push('<rect x="',this[e].offsetX,'" y="',this[e].offsetY,'" ','width="',"repeat-y"===this[e].repeat||"no-repeat"===this[e].repeat?this[e].source.width:this.width,'" height="',"repeat-x"===this[e].repeat||"no-repeat"===this[e].repeat?this[e].source.height:this.height,'" fill="url(#'+e+'Pattern)"',"></rect>\n"):this[e]&&"overlayColor"===e&&t.push('<rect x="0" y="0" ','width="',this.width,'" height="',this.height,'" fill="',this[e],'"',"></rect>\n")},sendToBack:function(t){if(!t)return this;var e,r,n,s=this._activeGroup;if(t===s)for(n=s._objects,e=n.length;e--;)r=n[e],i(this._objects,r),this._objects.unshift(r);else i(this._objects,t),this._objects.unshift(t);return this.renderAll&&this.renderAll()},bringToFront:function(t){if(!t)return this;var e,r,n,s=this._activeGroup;if(t===s)for(n=s._objects,e=0;e<n.length;e++)r=n[e],i(this._objects,r),this._objects.push(r);else i(this._objects,t),this._objects.push(t);return this.renderAll&&this.renderAll()},sendBackwards:function(t,e){if(!t)return this;var r,n,s,o,a,h=this._activeGroup;if(t===h)for(a=h._objects,r=0;r<a.length;r++)n=a[r],s=this._objects.indexOf(n),0!==s&&(o=s-1,i(this._objects,n),this._objects.splice(o,0,n));else s=this._objects.indexOf(t),0!==s&&(o=this._findNewLowerIndex(t,s,e),i(this._objects,t),this._objects.splice(o,0,t));return this.renderAll&&this.renderAll(),this},_findNewLowerIndex:function(t,e,i){var r;if(i){r=e;for(var n=e-1;n>=0;--n){var s=t.intersectsWithObject(this._objects[n])||t.isContainedWithinObject(this._objects[n])||this._objects[n].isContainedWithinObject(t);if(s){r=n;break}}}else r=e-1;return r},bringForward:function(t,e){if(!t)return this;var r,n,s,o,a,h=this._activeGroup;if(t===h)for(a=h._objects,r=a.length;r--;)n=a[r],s=this._objects.indexOf(n),s!==this._objects.length-1&&(o=s+1,i(this._objects,n),this._objects.splice(o,0,n));else s=this._objects.indexOf(t),s!==this._objects.length-1&&(o=this._findNewUpperIndex(t,s,e),i(this._objects,t),this._objects.splice(o,0,t));return this.renderAll&&this.renderAll(),this},_findNewUpperIndex:function(t,e,i){var r;if(i){r=e;for(var n=e+1;n<this._objects.length;++n){var s=t.intersectsWithObject(this._objects[n])||t.isContainedWithinObject(this._objects[n])||this._objects[n].isContainedWithinObject(t);if(s){r=n;break}}}else r=e+1;return r},moveTo:function(t,e){return i(this._objects,t),this._objects.splice(e,0,t),this.renderAll&&this.renderAll()},dispose:function(){return this.clear(),this},toString:function(){return"#<fabric.Canvas ("+this.complexity()+"): { objects: "+this.getObjects().length+" }>"}}),t(fabric.StaticCanvas.prototype,fabric.Observable),t(fabric.StaticCanvas.prototype,fabric.Collection),t(fabric.StaticCanvas.prototype,fabric.DataURLExporter),t(fabric.StaticCanvas,{EMPTY_JSON:'{"objects": [], "background": "white"}',supports:function(t){var e=fabric.util.createCanvasElement();if(!e||!e.getContext)return null;var i=e.getContext("2d");if(!i)return null;switch(t){case"getImageData":return"undefined"!=typeof i.getImageData;case"setLineDash":return"undefined"!=typeof i.setLineDash;case"toDataURL":return"undefined"!=typeof e.toDataURL;case"toDataURLWithQuality":try{return e.toDataURL("image/jpeg",0),!0}catch(t){}return!1;default:return null}}}),fabric.StaticCanvas.prototype.toJSON=fabric.StaticCanvas.prototype.toObject}(),fabric.BaseBrush=fabric.util.createClass({color:"rgb(0, 0, 0)",width:1,shadow:null,strokeLineCap:"round",strokeLineJoin:"round",strokeDashArray:null,setShadow:function(t){return this.shadow=new fabric.Shadow(t),this},_setBrushStyles:function(){var t=this.canvas.contextTop;t.strokeStyle=this.color,t.lineWidth=this.width,t.lineCap=this.strokeLineCap,t.lineJoin=this.strokeLineJoin,this.strokeDashArray&&fabric.StaticCanvas.supports("setLineDash")&&t.setLineDash(this.strokeDashArray)},_setShadow:function(){if(this.shadow){var t=this.canvas.contextTop;t.shadowColor=this.shadow.color,t.shadowBlur=this.shadow.blur,t.shadowOffsetX=this.shadow.offsetX,t.shadowOffsetY=this.shadow.offsetY}},_resetShadow:function(){var t=this.canvas.contextTop;t.shadowColor="",t.shadowBlur=t.shadowOffsetX=t.shadowOffsetY=0}}),function(){fabric.PencilBrush=fabric.util.createClass(fabric.BaseBrush,{initialize:function(t){this.canvas=t,this._points=[]},onMouseDown:function(t){this._prepareForDrawing(t),this._captureDrawingPath(t),this._render()},onMouseMove:function(t){this._captureDrawingPath(t),this.canvas.clearContext(this.canvas.contextTop),this._render()},onMouseUp:function(){this._finalizeAndAddPath()},_prepareForDrawing:function(t){var e=new fabric.Point(t.x,t.y);this._reset(),this._addPoint(e),this.canvas.contextTop.moveTo(e.x,e.y)},_addPoint:function(t){this._points.push(t)},_reset:function(){this._points.length=0,this._setBrushStyles(),this._setShadow()},_captureDrawingPath:function(t){var e=new fabric.Point(t.x,t.y);this._addPoint(e)},_render:function(){var t=this.canvas.contextTop,e=this.canvas.viewportTransform,i=this._points[0],r=this._points[1];t.save(),t.transform(e[0],e[1],e[2],e[3],e[4],e[5]),t.beginPath(),2===this._points.length&&i.x===r.x&&i.y===r.y&&(i.x-=.5,r.x+=.5),t.moveTo(i.x,i.y);for(var n=1,s=this._points.length;n<s;n++){var o=i.midPointFrom(r);t.quadraticCurveTo(i.x,i.y,o.x,o.y),i=this._points[n],r=this._points[n+1]}t.lineTo(i.x,i.y),t.stroke(),t.restore()},convertPointsToSVGPath:function(t){var e=[],i=new fabric.Point(t[0].x,t[0].y),r=new fabric.Point(t[1].x,t[1].y);e.push("M ",t[0].x," ",t[0].y," ");for(var n=1,s=t.length;n<s;n++){var o=i.midPointFrom(r);e.push("Q ",i.x," ",i.y," ",o.x," ",o.y," "),i=new fabric.Point(t[n].x,t[n].y),n+1<t.length&&(r=new fabric.Point(t[n+1].x,t[n+1].y))}return e.push("L ",i.x," ",i.y," "),e},createPath:function(t){var e=new fabric.Path(t,{fill:null,stroke:this.color,strokeWidth:this.width,strokeLineCap:this.strokeLineCap,strokeLineJoin:this.strokeLineJoin,strokeDashArray:this.strokeDashArray,originX:"center",originY:"center"});return this.shadow&&(this.shadow.affectStroke=!0,e.setShadow(this.shadow)),e},_finalizeAndAddPath:function(){var t=this.canvas.contextTop;t.closePath();var e=this.convertPointsToSVGPath(this._points).join("");if("M 0 0 Q 0 0 0 0 L 0 0"===e)return void this.canvas.renderAll();var i=this.createPath(e);this.canvas.add(i),i.setCoords(),this.canvas.clearContext(this.canvas.contextTop),this._resetShadow(),this.canvas.renderAll(),this.canvas.fire("path:created",{path:i})}})}(),fabric.CircleBrush=fabric.util.createClass(fabric.BaseBrush,{width:10,initialize:function(t){this.canvas=t,this.points=[]},drawDot:function(t){var e=this.addPoint(t),i=this.canvas.contextTop,r=this.canvas.viewportTransform;i.save(),i.transform(r[0],r[1],r[2],r[3],r[4],r[5]),i.fillStyle=e.fill,i.beginPath(),i.arc(e.x,e.y,e.radius,0,2*Math.PI,!1),i.closePath(),i.fill(),i.restore()},onMouseDown:function(t){this.points.length=0,this.canvas.clearContext(this.canvas.contextTop),this._setShadow(),this.drawDot(t)},onMouseMove:function(t){this.drawDot(t)},onMouseUp:function(){var t=this.canvas.renderOnAddRemove;this.canvas.renderOnAddRemove=!1;for(var e=[],i=0,r=this.points.length;i<r;i++){var n=this.points[i],s=new fabric.Circle({radius:n.radius,left:n.x,top:n.y,originX:"center",originY:"center",fill:n.fill});this.shadow&&s.setShadow(this.shadow),e.push(s)}var o=new fabric.Group(e,{originX:"center",originY:"center"});o.canvas=this.canvas,this.canvas.add(o),this.canvas.fire("path:created",{path:o}),this.canvas.clearContext(this.canvas.contextTop),this._resetShadow(),this.canvas.renderOnAddRemove=t,this.canvas.renderAll()},addPoint:function(t){var e=new fabric.Point(t.x,t.y),i=fabric.util.getRandomInt(Math.max(0,this.width-20),this.width+20)/2,r=new fabric.Color(this.color).setAlpha(fabric.util.getRandomInt(0,100)/100).toRgba();return e.radius=i,e.fill=r,this.points.push(e),e}}),fabric.SprayBrush=fabric.util.createClass(fabric.BaseBrush,{width:10,density:20,dotWidth:1,dotWidthVariance:1,randomOpacity:!1,optimizeOverlapping:!0,initialize:function(t){this.canvas=t,this.sprayChunks=[]},onMouseDown:function(t){this.sprayChunks.length=0,this.canvas.clearContext(this.canvas.contextTop),this._setShadow(),this.addSprayChunk(t),this.render()},onMouseMove:function(t){this.addSprayChunk(t),this.render()},onMouseUp:function(){var t=this.canvas.renderOnAddRemove;this.canvas.renderOnAddRemove=!1;for(var e=[],i=0,r=this.sprayChunks.length;i<r;i++)for(var n=this.sprayChunks[i],s=0,o=n.length;s<o;s++){var a=new fabric.Rect({width:n[s].width,height:n[s].width,left:n[s].x+1,top:n[s].y+1,originX:"center",originY:"center",fill:this.color});this.shadow&&a.setShadow(this.shadow),e.push(a)}this.optimizeOverlapping&&(e=this._getOptimizedRects(e));var h=new fabric.Group(e,{originX:"center",originY:"center"});h.canvas=this.canvas,this.canvas.add(h),this.canvas.fire("path:created",{path:h}),this.canvas.clearContext(this.canvas.contextTop),this._resetShadow(),this.canvas.renderOnAddRemove=t,this.canvas.renderAll()},_getOptimizedRects:function(t){for(var e,i={},r=0,n=t.length;r<n;r++)e=t[r].left+""+t[r].top,i[e]||(i[e]=t[r]);var s=[];for(e in i)s.push(i[e]);return s},render:function(){var t=this.canvas.contextTop;t.fillStyle=this.color;var e=this.canvas.viewportTransform;t.save(),t.transform(e[0],e[1],e[2],e[3],e[4],e[5]);for(var i=0,r=this.sprayChunkPoints.length;i<r;i++){var n=this.sprayChunkPoints[i];"undefined"!=typeof n.opacity&&(t.globalAlpha=n.opacity),t.fillRect(n.x,n.y,n.width,n.width)}t.restore()},addSprayChunk:function(t){this.sprayChunkPoints=[];for(var e,i,r,n=this.width/2,s=0;s<this.density;s++){e=fabric.util.getRandomInt(t.x-n,t.x+n),i=fabric.util.getRandomInt(t.y-n,t.y+n),r=this.dotWidthVariance?fabric.util.getRandomInt(Math.max(1,this.dotWidth-this.dotWidthVariance),this.dotWidth+this.dotWidthVariance):this.dotWidth;var o=new fabric.Point(e,i);o.width=r,this.randomOpacity&&(o.opacity=fabric.util.getRandomInt(0,100)/100),this.sprayChunkPoints.push(o)}this.sprayChunks.push(this.sprayChunkPoints)}}),fabric.PatternBrush=fabric.util.createClass(fabric.PencilBrush,{getPatternSrc:function(){var t=20,e=5,i=fabric.document.createElement("canvas"),r=i.getContext("2d");return i.width=i.height=t+e,r.fillStyle=this.color,r.beginPath(),r.arc(t/2,t/2,t/2,0,2*Math.PI,!1),r.closePath(),r.fill(),i},getPatternSrcFunction:function(){return String(this.getPatternSrc).replace("this.color",'"'+this.color+'"')},getPattern:function(){return this.canvas.contextTop.createPattern(this.source||this.getPatternSrc(),"repeat")},_setBrushStyles:function(){this.callSuper("_setBrushStyles"),this.canvas.contextTop.strokeStyle=this.getPattern()},createPath:function(t){var e=this.callSuper("createPath",t),i=e._getLeftTopCoords().scalarAdd(e.strokeWidth/2);return e.stroke=new fabric.Pattern({source:this.source||this.getPatternSrcFunction(),offsetX:-i.x,offsetY:-i.y}),e}}),function(){var t=fabric.util.getPointer,e=fabric.util.degreesToRadians,i=fabric.util.radiansToDegrees,r=Math.atan2,n=Math.abs,s=fabric.StaticCanvas.supports("setLineDash"),o=.5;fabric.Canvas=fabric.util.createClass(fabric.StaticCanvas,{initialize:function(t,e){e||(e={}),this._initStatic(t,e),this._initInteractive(),this._createCacheCanvas()},uniScaleTransform:!1,uniScaleKey:"shiftKey",centeredScaling:!1,centeredRotation:!1,centeredKey:"altKey",altActionKey:"shiftKey",interactive:!0,selection:!0,selectionKey:"shiftKey",altSelectionKey:null,selectionColor:"rgba(100, 100, 255, 0.3)",selectionDashArray:[],selectionBorderColor:"rgba(255, 255, 255, 0.3)",selectionLineWidth:1,hoverCursor:"move",moveCursor:"move",defaultCursor:"default",freeDrawingCursor:"crosshair",rotationCursor:"crosshair",containerClass:"canvas-container",perPixelTargetFind:!1,targetFindTolerance:0,skipTargetFind:!1,isDrawingMode:!1,preserveObjectStacking:!1,snapAngle:0,snapThreshold:null,stopContextMenu:!1,fireRightClick:!1,_initInteractive:function(){this._currentTransform=null,this._groupSelector=null,this._initWrapperElement(),this._createUpperCanvas(),this._initEventListeners(),this._initRetinaScaling(),this.freeDrawingBrush=fabric.PencilBrush&&new fabric.PencilBrush(this),this.calcOffset()},_chooseObjectsToRender:function(){var t,e=this.getActiveGroup(),i=this.getActiveObject(),r=[],n=[];if(!e&&!i||this.preserveObjectStacking)r=this._objects;else{for(var s=0,o=this._objects.length;s<o;s++)t=this._objects[s],e&&e.contains(t)||t===i?n.push(t):r.push(t);e&&(e._set("_objects",n),r.push(e)),i&&r.push(i)}return r},renderAll:function(){!this.contextTopDirty||this._groupSelector||this.isDrawingMode||(this.clearContext(this.contextTop),this.contextTopDirty=!1);var t=this.contextContainer;return this.renderCanvas(t,this._chooseObjectsToRender()),this},renderTop:function(){var t=this.contextTop;return this.clearContext(t),this.selection&&this._groupSelector&&this._drawSelection(t),this.fire("after:render"),this.contextTopDirty=!0,this},_resetCurrentTransform:function(){var t=this._currentTransform;t.target.set({scaleX:t.original.scaleX,scaleY:t.original.scaleY,skewX:t.original.skewX,skewY:t.original.skewY,left:t.original.left,top:t.original.top}),this._shouldCenterTransform(t.target)?"rotate"===t.action?this._setOriginToCenter(t.target):("center"!==t.originX&&("right"===t.originX?t.mouseXSign=-1:t.mouseXSign=1),"center"!==t.originY&&("bottom"===t.originY?t.mouseYSign=-1:t.mouseYSign=1),t.originX="center",t.originY="center"):(t.originX=t.original.originX,t.originY=t.original.originY)},containsPoint:function(t,e,i){var r,n=!0,s=i||this.getPointer(t,n);return r=e.group&&e.group===this.getActiveGroup()?this._normalizePointer(e.group,s):{x:s.x,y:s.y},e.containsPoint(r)||e._findTargetCorner(s)},_normalizePointer:function(t,e){var i=t.calcTransformMatrix(),r=fabric.util.invertTransform(i),n=this.viewportTransform,s=this.restorePointerVpt(e),o=fabric.util.transformPoint(s,r);return fabric.util.transformPoint(o,n)},isTargetTransparent:function(t,e,i){var r=t.hasBorders,n=t.transparentCorners,s=this.contextCache,o=t.selectionBackgroundColor;t.hasBorders=t.transparentCorners=!1,t.selectionBackgroundColor="",s.save(),s.transform.apply(s,this.viewportTransform),t.render(s),s.restore(),t.active&&t._renderControls(s),t.hasBorders=r,t.transparentCorners=n,t.selectionBackgroundColor=o;var a=fabric.util.isTransparent(s,e,i,this.targetFindTolerance);return this.clearContext(s),a},_shouldClearSelection:function(t,e){var i=this.getActiveGroup(),r=this.getActiveObject();return!e||e&&i&&!i.contains(e)&&i!==e&&!t[this.selectionKey]||e&&!e.evented||e&&!e.selectable&&r&&r!==e},_shouldCenterTransform:function(t){if(t){var e,i=this._currentTransform;return"scale"===i.action||"scaleX"===i.action||"scaleY"===i.action?e=this.centeredScaling||t.centeredScaling:"rotate"===i.action&&(e=this.centeredRotation||t.centeredRotation),e?!i.altKey:i.altKey}},_getOriginFromCorner:function(t,e){var i={x:t.originX,y:t.originY};return"ml"===e||"tl"===e||"bl"===e?i.x="right":"mr"!==e&&"tr"!==e&&"br"!==e||(i.x="left"),"tl"===e||"mt"===e||"tr"===e?i.y="bottom":"bl"!==e&&"mb"!==e&&"br"!==e||(i.y="top"),i},_getActionFromCorner:function(t,e,i){if(!e)return"drag";switch(e){case"mtr":return"rotate";case"ml":case"mr":return i[this.altActionKey]?"skewY":"scaleX";case"mt":case"mb":return i[this.altActionKey]?"skewX":"scaleY";default:return"scale"}},_setupCurrentTransform:function(t,i){if(i){var r=this.getPointer(t),n=i._findTargetCorner(this.getPointer(t,!0)),s=this._getActionFromCorner(i,n,t),o=this._getOriginFromCorner(i,n);this._currentTransform={target:i,action:s,corner:n,scaleX:i.scaleX,scaleY:i.scaleY,skewX:i.skewX,skewY:i.skewY,offsetX:r.x-i.left,offsetY:r.y-i.top,originX:o.x,originY:o.y,ex:r.x,ey:r.y,lastX:r.x,lastY:r.y,left:i.left,top:i.top,theta:e(i.angle),width:i.width*i.scaleX,mouseXSign:1,mouseYSign:1,shiftKey:t.shiftKey,altKey:t[this.centeredKey]},this._currentTransform.original={left:i.left,top:i.top,scaleX:i.scaleX,scaleY:i.scaleY,skewX:i.skewX,skewY:i.skewY,originX:o.x,originY:o.y},this._resetCurrentTransform()}},_translateObject:function(t,e){var i=this._currentTransform,r=i.target,n=t-i.offsetX,s=e-i.offsetY,o=!r.get("lockMovementX")&&r.left!==n,a=!r.get("lockMovementY")&&r.top!==s;return o&&r.set("left",n),a&&r.set("top",s),o||a},_changeSkewTransformOrigin:function(t,e,i){var r="originX",n={0:"center"},s=e.target.skewX,o="left",a="right",h="mt"===e.corner||"ml"===e.corner?1:-1,c=1;t=t>0?1:-1,"y"===i&&(s=e.target.skewY,o="top",a="bottom",r="originY"),n[-1]=o,n[1]=a,e.target.flipX&&(c*=-1),e.target.flipY&&(c*=-1),0===s?(e.skewSign=-h*t*c,e[r]=n[-t]):(s=s>0?1:-1,e.skewSign=s,e[r]=n[s*h*c])},_skewObject:function(t,e,i){var r=this._currentTransform,n=r.target,s=!1,o=n.get("lockSkewingX"),a=n.get("lockSkewingY");if(o&&"x"===i||a&&"y"===i)return!1;var h,c,l=n.getCenterPoint(),u=n.toLocalPoint(new fabric.Point(t,e),"center","center")[i],f=n.toLocalPoint(new fabric.Point(r.lastX,r.lastY),"center","center")[i],d=n._getTransformedDimensions();return this._changeSkewTransformOrigin(u-f,r,i),h=n.toLocalPoint(new fabric.Point(t,e),r.originX,r.originY)[i],c=n.translateToOriginPoint(l,r.originX,r.originY),s=this._setObjectSkew(h,r,i,d),r.lastX=t,r.lastY=e,n.setPositionByOrigin(c,r.originX,r.originY),s},_setObjectSkew:function(t,e,i,r){var n,s,o,a,h,c,l,u,f,d=e.target,g=!1,p=e.skewSign;return"x"===i?(a="y",h="Y",c="X",u=0,f=d.skewY):(a="x",h="X",c="Y",u=d.skewX,f=0),o=d._getTransformedDimensions(u,f),l=2*Math.abs(t)-o[i],l<=2?n=0:(n=p*Math.atan(l/d["scale"+c]/(o[a]/d["scale"+h])),n=fabric.util.radiansToDegrees(n)),g=d["skew"+c]!==n,d.set("skew"+c,n),0!==d["skew"+h]&&(s=d._getTransformedDimensions(),n=r[a]/s[a]*d["scale"+h],d.set("scale"+h,n)),g},_scaleObject:function(t,e,i){var r=this._currentTransform,n=r.target,s=n.get("lockScalingX"),o=n.get("lockScalingY"),a=n.get("lockScalingFlip");if(s&&o)return!1;var h=n.translateToOriginPoint(n.getCenterPoint(),r.originX,r.originY),c=n.toLocalPoint(new fabric.Point(t,e),r.originX,r.originY),l=n._getTransformedDimensions(),u=!1;return this._setLocalMouse(c,r),u=this._setObjectScale(c,r,s,o,i,a,l),n.setPositionByOrigin(h,r.originX,r.originY),u},_setObjectScale:function(t,e,i,r,n,s,o){var a,h,c,l,u=e.target,f=!1,d=!1,g=!1;return c=t.x*u.scaleX/o.x,l=t.y*u.scaleY/o.y,a=u.scaleX!==c,h=u.scaleY!==l,s&&c<=0&&c<u.scaleX&&(f=!0),s&&l<=0&&l<u.scaleY&&(d=!0),"equally"!==n||i||r?n?"x"!==n||u.get("lockUniScaling")?"y"!==n||u.get("lockUniScaling")||d||r||u.set("scaleY",l)&&(g=g||h):f||i||u.set("scaleX",c)&&(g=g||a):(f||i||u.set("scaleX",c)&&(g=g||a),d||r||u.set("scaleY",l)&&(g=g||h)):f||d||(g=this._scaleObjectEqually(t,u,e,o)),e.newScaleX=c,e.newScaleY=l,f||d||this._flipObject(e,n),g},_scaleObjectEqually:function(t,e,i,r){var n,s=t.y+t.x,o=r.y*i.original.scaleY/e.scaleY+r.x*i.original.scaleX/e.scaleX;return i.newScaleX=i.original.scaleX*s/o,i.newScaleY=i.original.scaleY*s/o,n=i.newScaleX!==e.scaleX||i.newScaleY!==e.scaleY,e.set("scaleX",i.newScaleX),e.set("scaleY",i.newScaleY),n},_flipObject:function(t,e){t.newScaleX<0&&"y"!==e&&("left"===t.originX?t.originX="right":"right"===t.originX&&(t.originX="left")),t.newScaleY<0&&"x"!==e&&("top"===t.originY?t.originY="bottom":"bottom"===t.originY&&(t.originY="top"))},_setLocalMouse:function(t,e){var i=e.target;"right"===e.originX?t.x*=-1:"center"===e.originX&&(t.x*=2*e.mouseXSign,t.x<0&&(e.mouseXSign=-e.mouseXSign)),"bottom"===e.originY?t.y*=-1:"center"===e.originY&&(t.y*=2*e.mouseYSign,t.y<0&&(e.mouseYSign=-e.mouseYSign)),n(t.x)>i.padding?t.x<0?t.x+=i.padding:t.x-=i.padding:t.x=0,n(t.y)>i.padding?t.y<0?t.y+=i.padding:t.y-=i.padding:t.y=0},_rotateObject:function(t,e){var n=this._currentTransform;if(n.target.get("lockRotation"))return!1;var s=r(n.ey-n.top,n.ex-n.left),o=r(e-n.top,t-n.left),a=i(o-s+n.theta),h=!0;if(a<0&&(a=360+a),a%=360,n.target.snapAngle>0){var c=n.target.snapAngle,l=n.target.snapThreshold||c,u=Math.ceil(a/c)*c,f=Math.floor(a/c)*c;Math.abs(a-f)<l?a=f:Math.abs(a-u)<l&&(a=u),n.target.angle===a&&(h=!1)}return n.target.angle=a,h},setCursor:function(t){this.upperCanvasEl.style.cursor=t},_resetObjectTransform:function(t){t.scaleX=1,t.scaleY=1,t.skewX=0,t.skewY=0,t.setAngle(0)},_drawSelection:function(t){var e=this._groupSelector,i=e.left,r=e.top,a=n(i),h=n(r);if(this.selectionColor&&(t.fillStyle=this.selectionColor,t.fillRect(e.ex-(i>0?0:-i),e.ey-(r>0?0:-r),a,h)),this.selectionLineWidth&&this.selectionBorderColor)if(t.lineWidth=this.selectionLineWidth,t.strokeStyle=this.selectionBorderColor,this.selectionDashArray.length>1&&!s){var c=e.ex+o-(i>0?0:a),l=e.ey+o-(r>0?0:h);t.beginPath(),fabric.util.drawDashedLine(t,c,l,c+a,l,this.selectionDashArray),fabric.util.drawDashedLine(t,c,l+h-1,c+a,l+h-1,this.selectionDashArray),fabric.util.drawDashedLine(t,c,l,c,l+h,this.selectionDashArray),fabric.util.drawDashedLine(t,c+a-1,l,c+a-1,l+h,this.selectionDashArray),t.closePath(),t.stroke()}else fabric.Object.prototype._setLineDash.call(this,t,this.selectionDashArray),t.strokeRect(e.ex+o-(i>0?0:a),e.ey+o-(r>0?0:h),a,h)},findTarget:function(t,e){if(!this.skipTargetFind){var i,r=!0,n=this.getPointer(t,r),s=this.getActiveGroup(),o=this.getActiveObject();if(s&&!e&&this._checkTarget(n,s))return this._fireOverOutEvents(s,t),s;if(o&&o._findTargetCorner(n))return this._fireOverOutEvents(o,t),o;if(o&&this._checkTarget(n,o)){if(!this.preserveObjectStacking)return this._fireOverOutEvents(o,t),o;i=o}this.targets=[];var a=this._searchPossibleTargets(this._objects,n);return t[this.altSelectionKey]&&a&&i&&a!==i&&(a=i),this._fireOverOutEvents(a,t),a}},_fireOverOutEvents:function(t,e){t?this._hoveredTarget!==t&&(this._hoveredTarget&&(this.fire("mouse:out",{target:this._hoveredTarget,e:e}),this._hoveredTarget.fire("mouseout")),this.fire("mouse:over",{target:t,e:e}),t.fire("mouseover"),this._hoveredTarget=t):this._hoveredTarget&&(this.fire("mouse:out",{target:this._hoveredTarget,e:e}),this._hoveredTarget.fire("mouseout"),this._hoveredTarget=null)},_checkTarget:function(t,e){if(e&&e.visible&&e.evented&&this.containsPoint(null,e,t)){if(!this.perPixelTargetFind&&!e.perPixelTargetFind||e.isEditing)return!0;var i=this.isTargetTransparent(e,t.x,t.y);if(!i)return!0}},_searchPossibleTargets:function(t,e){for(var i,r,n,s=t.length;s--;)if(this._checkTarget(e,t[s])){i=t[s],"group"===i.type&&i.subTargetCheck&&(r=this._normalizePointer(i,e),n=this._searchPossibleTargets(i._objects,r),n&&this.targets.push(n));break}return i},restorePointerVpt:function(t){return fabric.util.transformPoint(t,fabric.util.invertTransform(this.viewportTransform))},getPointer:function(e,i,r){r||(r=this.upperCanvasEl);var n,s=t(e),o=r.getBoundingClientRect(),a=o.width||0,h=o.height||0;return a&&h||("top"in o&&"bottom"in o&&(h=Math.abs(o.top-o.bottom)),"right"in o&&"left"in o&&(a=Math.abs(o.right-o.left))),this.calcOffset(),s.x=s.x-this._offset.left,s.y=s.y-this._offset.top,i||(s=this.restorePointerVpt(s)),n=0===a||0===h?{width:1,height:1}:{width:r.width/a,height:r.height/h},{x:s.x*n.width,y:s.y*n.height}},_createUpperCanvas:function(){var t=this.lowerCanvasEl.className.replace(/\s*lower-canvas\s*/,"");this.upperCanvasEl=this._createCanvasElement(),fabric.util.addClass(this.upperCanvasEl,"upper-canvas "+t),this.wrapperEl.appendChild(this.upperCanvasEl),this._copyCanvasStyle(this.lowerCanvasEl,this.upperCanvasEl),this._applyCanvasStyle(this.upperCanvasEl),this.contextTop=this.upperCanvasEl.getContext("2d")},_createCacheCanvas:function(){this.cacheCanvasEl=this._createCanvasElement(),this.cacheCanvasEl.setAttribute("width",this.width),this.cacheCanvasEl.setAttribute("height",this.height),this.contextCache=this.cacheCanvasEl.getContext("2d")},_initWrapperElement:function(){this.wrapperEl=fabric.util.wrapElement(this.lowerCanvasEl,"div",{class:this.containerClass}),fabric.util.setStyle(this.wrapperEl,{width:this.getWidth()+"px",height:this.getHeight()+"px",position:"relative"}),fabric.util.makeElementUnselectable(this.wrapperEl)},_applyCanvasStyle:function(t){var e=this.getWidth()||t.width,i=this.getHeight()||t.height;fabric.util.setStyle(t,{position:"absolute",width:e+"px",height:i+"px",left:0,top:0}),t.width=e,t.height=i,fabric.util.makeElementUnselectable(t)},_copyCanvasStyle:function(t,e){e.style.cssText=t.style.cssText},getSelectionContext:function(){return this.contextTop},getSelectionElement:function(){return this.upperCanvasEl},_setActiveObject:function(t){this._activeObject&&this._activeObject.set("active",!1),this._activeObject=t,t.set("active",!0)},setActiveObject:function(t,e){return this._setActiveObject(t),this.renderAll(),this.fire("object:selected",{target:t,e:e}),t.fire("selected",{e:e}),this},getActiveObject:function(){return this._activeObject},_onObjectRemoved:function(t){this.getActiveObject()===t&&(this.fire("before:selection:cleared",{target:t}),this._discardActiveObject(),this.fire("selection:cleared",{target:t}),t.fire("deselected")),this.callSuper("_onObjectRemoved",t)},_discardActiveObject:function(){this._activeObject&&this._activeObject.set("active",!1),this._activeObject=null},discardActiveObject:function(t){var e=this._activeObject;return this.fire("before:selection:cleared",{target:e,e:t}),this._discardActiveObject(),this.fire("selection:cleared",{e:t}),e&&e.fire("deselected",{e:t}),this},_setActiveGroup:function(t){this._activeGroup=t,t&&t.set("active",!0)},setActiveGroup:function(t,e){return this._setActiveGroup(t),t&&(this.fire("object:selected",{target:t,e:e}),t.fire("selected",{e:e})),this},getActiveGroup:function(){return this._activeGroup},_discardActiveGroup:function(){var t=this.getActiveGroup();t&&t.destroy(),this.setActiveGroup(null)},discardActiveGroup:function(t){var e=this.getActiveGroup();return this.fire("before:selection:cleared",{e:t,target:e}),this._discardActiveGroup(),this.fire("selection:cleared",{e:t}),this},deactivateAll:function(){for(var t=this.getObjects(),e=0,i=t.length;e<i;e++)t[e].set("active",!1);return this._discardActiveGroup(),this._discardActiveObject(),this},deactivateAllWithDispatch:function(t){var e=this.getActiveGroup(),i=this.getActiveObject();return(i||e)&&this.fire("before:selection:cleared",{target:i||e,e:t}),this.deactivateAll(),(i||e)&&(this.fire("selection:cleared",{e:t,target:i}),i&&i.fire("deselected")),this},dispose:function(){this.callSuper("dispose");var t=this.wrapperEl;return this.removeListeners(),t.removeChild(this.upperCanvasEl),t.removeChild(this.lowerCanvasEl),delete this.upperCanvasEl,t.parentNode&&t.parentNode.replaceChild(this.lowerCanvasEl,this.wrapperEl),delete this.wrapperEl,this},clear:function(){return this.discardActiveGroup(),this.discardActiveObject(),this.clearContext(this.contextTop),this.callSuper("clear")},drawControls:function(t){var e=this.getActiveGroup();e?e._renderControls(t):this._drawObjectsControls(t)},_drawObjectsControls:function(t){for(var e=0,i=this._objects.length;e<i;++e)this._objects[e]&&this._objects[e].active&&this._objects[e]._renderControls(t)},_toObject:function(t,e,i){var r=this._realizeGroupTransformOnObject(t),n=this.callSuper("_toObject",t,e,i);return this._unwindGroupTransformOnObject(t,r),n},_realizeGroupTransformOnObject:function(t){var e=["angle","flipX","flipY","height","left","scaleX","scaleY","top","width"];if(t.group&&t.group===this.getActiveGroup()){var i={};return e.forEach(function(e){i[e]=t[e]}),this.getActiveGroup().realizeTransform(t),i}return null},_unwindGroupTransformOnObject:function(t,e){e&&t.set(e)},_setSVGObject:function(t,e,i){var r;r=this._realizeGroupTransformOnObject(e),this.callSuper("_setSVGObject",t,e,i),this._unwindGroupTransformOnObject(e,r)}});for(var a in fabric.StaticCanvas)"prototype"!==a&&(fabric.Canvas[a]=fabric.StaticCanvas[a]);fabric.isTouchSupported&&(fabric.Canvas.prototype._setCursorFromEvent=function(){}),fabric.Element=fabric.Canvas}(),function(){var t={mt:0,tr:1,mr:2,br:3,mb:4,bl:5,ml:6,tl:7},e=fabric.util.addListener,i=fabric.util.removeListener;fabric.util.object.extend(fabric.Canvas.prototype,{cursorMap:["n-resize","ne-resize","e-resize","se-resize","s-resize","sw-resize","w-resize","nw-resize"],_initEventListeners:function(){this._bindEvents(),e(fabric.window,"resize",this._onResize),e(this.upperCanvasEl,"mousedown",this._onMouseDown),e(this.upperCanvasEl,"mousemove",this._onMouseMove),e(this.upperCanvasEl,"mouseout",this._onMouseOut),e(this.upperCanvasEl,"mouseenter",this._onMouseEnter),e(this.upperCanvasEl,"wheel",this._onMouseWheel),e(this.upperCanvasEl,"contextmenu",this._onContextMenu),e(this.upperCanvasEl,"touchstart",this._onMouseDown),e(this.upperCanvasEl,"touchmove",this._onMouseMove),"undefined"!=typeof eventjs&&"add"in eventjs&&(eventjs.add(this.upperCanvasEl,"gesture",this._onGesture),eventjs.add(this.upperCanvasEl,"drag",this._onDrag),eventjs.add(this.upperCanvasEl,"orientation",this._onOrientationChange),eventjs.add(this.upperCanvasEl,"shake",this._onShake),
eventjs.add(this.upperCanvasEl,"longpress",this._onLongPress))},_bindEvents:function(){this._onMouseDown=this._onMouseDown.bind(this),this._onMouseMove=this._onMouseMove.bind(this),this._onMouseUp=this._onMouseUp.bind(this),this._onResize=this._onResize.bind(this),this._onGesture=this._onGesture.bind(this),this._onDrag=this._onDrag.bind(this),this._onShake=this._onShake.bind(this),this._onLongPress=this._onLongPress.bind(this),this._onOrientationChange=this._onOrientationChange.bind(this),this._onMouseWheel=this._onMouseWheel.bind(this),this._onMouseOut=this._onMouseOut.bind(this),this._onMouseEnter=this._onMouseEnter.bind(this),this._onContextMenu=this._onContextMenu.bind(this)},removeListeners:function(){i(fabric.window,"resize",this._onResize),i(this.upperCanvasEl,"mousedown",this._onMouseDown),i(this.upperCanvasEl,"mousemove",this._onMouseMove),i(this.upperCanvasEl,"mouseout",this._onMouseOut),i(this.upperCanvasEl,"mouseenter",this._onMouseEnter),i(this.upperCanvasEl,"wheel",this._onMouseWheel),i(this.upperCanvasEl,"contextmenu",this._onContextMenu),i(this.upperCanvasEl,"touchstart",this._onMouseDown),i(this.upperCanvasEl,"touchmove",this._onMouseMove),"undefined"!=typeof eventjs&&"remove"in eventjs&&(eventjs.remove(this.upperCanvasEl,"gesture",this._onGesture),eventjs.remove(this.upperCanvasEl,"drag",this._onDrag),eventjs.remove(this.upperCanvasEl,"orientation",this._onOrientationChange),eventjs.remove(this.upperCanvasEl,"shake",this._onShake),eventjs.remove(this.upperCanvasEl,"longpress",this._onLongPress))},_onGesture:function(t,e){this.__onTransformGesture&&this.__onTransformGesture(t,e)},_onDrag:function(t,e){this.__onDrag&&this.__onDrag(t,e)},_onMouseWheel:function(t){this.__onMouseWheel(t)},_onMouseOut:function(t){var e=this._hoveredTarget;this.fire("mouse:out",{target:e,e:t}),this._hoveredTarget=null,e&&e.fire("mouseout",{e:t})},_onMouseEnter:function(t){this.findTarget(t)||(this.fire("mouse:over",{target:null,e:t}),this._hoveredTarget=null)},_onOrientationChange:function(t,e){this.__onOrientationChange&&this.__onOrientationChange(t,e)},_onShake:function(t,e){this.__onShake&&this.__onShake(t,e)},_onLongPress:function(t,e){this.__onLongPress&&this.__onLongPress(t,e)},_onContextMenu:function(t){return this.stopContextMenu&&(t.stopPropagation(),t.preventDefault()),!1},_onMouseDown:function(t){this.__onMouseDown(t),e(fabric.document,"touchend",this._onMouseUp),e(fabric.document,"touchmove",this._onMouseMove),i(this.upperCanvasEl,"mousemove",this._onMouseMove),i(this.upperCanvasEl,"touchmove",this._onMouseMove),"touchstart"===t.type?i(this.upperCanvasEl,"mousedown",this._onMouseDown):(e(fabric.document,"mouseup",this._onMouseUp),e(fabric.document,"mousemove",this._onMouseMove))},_onMouseUp:function(t){if(this.__onMouseUp(t),i(fabric.document,"mouseup",this._onMouseUp),i(fabric.document,"touchend",this._onMouseUp),i(fabric.document,"mousemove",this._onMouseMove),i(fabric.document,"touchmove",this._onMouseMove),e(this.upperCanvasEl,"mousemove",this._onMouseMove),e(this.upperCanvasEl,"touchmove",this._onMouseMove),"touchend"===t.type){var r=this;setTimeout(function(){e(r.upperCanvasEl,"mousedown",r._onMouseDown)},400)}},_onMouseMove:function(t){!this.allowTouchScrolling&&t.preventDefault&&t.preventDefault(),this.__onMouseMove(t)},_onResize:function(){this.calcOffset()},_shouldRender:function(t,e){var i=this.getActiveGroup()||this.getActiveObject();return!!(t&&(t.isMoving||t!==i)||!t&&i||!t&&!i&&!this._groupSelector||e&&this._previousPointer&&this.selection&&(e.x!==this._previousPointer.x||e.y!==this._previousPointer.y))},__onMouseUp:function(t){var e,i=!0,r=this._currentTransform,n=this._groupSelector,s=!n||0===n.left&&0===n.top;if(this.isDrawingMode&&this._isCurrentlyDrawing)return void this._onMouseUpInDrawingMode(t);r&&(this._finalizeCurrentTransform(),i=!r.actionPerformed),e=i?this.findTarget(t,!0):r.target;var o=this._shouldRender(e,this.getPointer(t));e||!s?this._maybeGroupObjects(t):(this._groupSelector=null,this._currentTransform=null),e&&(e.isMoving=!1),this._handleCursorAndEvent(t,e,"up"),e&&(e.__corner=0),o&&this.renderAll()},_handleCursorAndEvent:function(t,e,i){this._setCursorFromEvent(t,e),this._handleEvent(t,i,e?e:null)},_handleEvent:function(t,e,i){var r=void 0===typeof i?this.findTarget(t):i,n=this.targets||[],s={e:t,target:r,subTargets:n};this.fire("mouse:"+e,s),r&&r.fire("mouse"+e,s);for(var o=0;o<n.length;o++)n[o].fire("mouse"+e,s)},_finalizeCurrentTransform:function(){var t=this._currentTransform,e=t.target;e._scaling&&(e._scaling=!1),e.setCoords(),this._restoreOriginXY(e),(t.actionPerformed||this.stateful&&e.hasStateChanged())&&(this.fire("object:modified",{target:e}),e.fire("modified"))},_restoreOriginXY:function(t){if(this._previousOriginX&&this._previousOriginY){var e=t.translateToOriginPoint(t.getCenterPoint(),this._previousOriginX,this._previousOriginY);t.originX=this._previousOriginX,t.originY=this._previousOriginY,t.left=e.x,t.top=e.y,this._previousOriginX=null,this._previousOriginY=null}},_onMouseDownInDrawingMode:function(t){this._isCurrentlyDrawing=!0,this.discardActiveObject(t).renderAll(),this.clipTo&&fabric.util.clipContext(this,this.contextTop);var e=this.getPointer(t);this.freeDrawingBrush.onMouseDown(e),this._handleEvent(t,"down")},_onMouseMoveInDrawingMode:function(t){if(this._isCurrentlyDrawing){var e=this.getPointer(t);this.freeDrawingBrush.onMouseMove(e)}this.setCursor(this.freeDrawingCursor),this._handleEvent(t,"move")},_onMouseUpInDrawingMode:function(t){this._isCurrentlyDrawing=!1,this.clipTo&&this.contextTop.restore(),this.freeDrawingBrush.onMouseUp(),this._handleEvent(t,"up")},__onMouseDown:function(t){var e=this.findTarget(t),i=this.getPointer(t,!0),r="which"in t?3===t.which:2===t.button;if(r)return void(this.fireRightClick&&this._handleEvent(t,"down",e?e:null));if(this.isDrawingMode)return void this._onMouseDownInDrawingMode(t);if(!this._currentTransform){this._previousPointer=i;var n=this._shouldRender(e,i),s=this._shouldGroup(t,e);this._shouldClearSelection(t,e)?this._clearSelection(t,e,i):s&&(this._handleGrouping(t,e),e=this.getActiveGroup()),e&&(!e.selectable||!e.__corner&&s||(this._beforeTransform(t,e),this._setupCurrentTransform(t,e)),e!==this.getActiveGroup()&&e!==this.getActiveObject()&&(this.deactivateAll(),e.selectable&&this.setActiveObject(e,t))),this._handleEvent(t,"down",e?e:null),n&&this.renderAll()}},_beforeTransform:function(t,e){this.stateful&&e.saveState(),e._findTargetCorner(this.getPointer(t))&&this.onBeforeScaleRotate(e)},_clearSelection:function(t,e,i){this.deactivateAllWithDispatch(t),e&&e.selectable?this.setActiveObject(e,t):this.selection&&(this._groupSelector={ex:i.x,ey:i.y,top:0,left:0})},_setOriginToCenter:function(t){this._previousOriginX=this._currentTransform.target.originX,this._previousOriginY=this._currentTransform.target.originY;var e=t.getCenterPoint();t.originX="center",t.originY="center",t.left=e.x,t.top=e.y,this._currentTransform.left=t.left,this._currentTransform.top=t.top},_setCenterToOrigin:function(t){var e=t.translateToOriginPoint(t.getCenterPoint(),this._previousOriginX,this._previousOriginY);t.originX=this._previousOriginX,t.originY=this._previousOriginY,t.left=e.x,t.top=e.y,this._previousOriginX=null,this._previousOriginY=null},__onMouseMove:function(t){var e,i;if(this.isDrawingMode)return void this._onMouseMoveInDrawingMode(t);if(!("undefined"!=typeof t.touches&&t.touches.length>1)){var r=this._groupSelector;r?(i=this.getPointer(t,!0),r.left=i.x-r.ex,r.top=i.y-r.ey,this.renderTop()):this._currentTransform?this._transformObject(t):(e=this.findTarget(t),this._setCursorFromEvent(t,e)),this._handleEvent(t,"move",e?e:null)}},__onMouseWheel:function(t){this.fire("mouse:wheel",{e:t})},_transformObject:function(t){var e=this.getPointer(t),i=this._currentTransform;i.reset=!1,i.target.isMoving=!0,this._beforeScaleTransform(t,i),this._performTransformAction(t,i,e),i.actionPerformed&&this.renderAll()},_performTransformAction:function(t,e,i){var r=i.x,n=i.y,s=e.target,o=e.action,a=!1;"rotate"===o?(a=this._rotateObject(r,n))&&this._fire("rotating",s,t):"scale"===o?(a=this._onScale(t,e,r,n))&&this._fire("scaling",s,t):"scaleX"===o?(a=this._scaleObject(r,n,"x"))&&this._fire("scaling",s,t):"scaleY"===o?(a=this._scaleObject(r,n,"y"))&&this._fire("scaling",s,t):"skewX"===o?(a=this._skewObject(r,n,"x"))&&this._fire("skewing",s,t):"skewY"===o?(a=this._skewObject(r,n,"y"))&&this._fire("skewing",s,t):(a=this._translateObject(r,n),a&&(this._fire("moving",s,t),this.setCursor(s.moveCursor||this.moveCursor))),e.actionPerformed=a},_fire:function(t,e,i){this.fire("object:"+t,{target:e,e:i}),e.fire(t,{e:i})},_beforeScaleTransform:function(t,e){if("scale"===e.action||"scaleX"===e.action||"scaleY"===e.action){var i=this._shouldCenterTransform(e.target);(i&&("center"!==e.originX||"center"!==e.originY)||!i&&"center"===e.originX&&"center"===e.originY)&&(this._resetCurrentTransform(),e.reset=!0)}},_onScale:function(t,e,i,r){return!t[this.uniScaleKey]&&!this.uniScaleTransform||e.target.get("lockUniScaling")?(e.reset||"scale"!==e.currentAction||this._resetCurrentTransform(),e.currentAction="scaleEqually",this._scaleObject(i,r,"equally")):(e.currentAction="scale",this._scaleObject(i,r))},_setCursorFromEvent:function(t,e){if(!e)return this.setCursor(this.defaultCursor),!1;var i=e.hoverCursor||this.hoverCursor;if(e.selectable){var r=this.getActiveGroup(),n=e._findTargetCorner&&(!r||!r.contains(e))&&e._findTargetCorner(this.getPointer(t,!0));n?this._setCornerCursor(n,e,t):this.setCursor(i)}else this.setCursor(i);return!0},_setCornerCursor:function(e,i,r){if(e in t)this.setCursor(this._getRotatedCornerCursor(e,i,r));else{if("mtr"!==e||!i.hasRotatingPoint)return this.setCursor(this.defaultCursor),!1;this.setCursor(this.rotationCursor)}},_getRotatedCornerCursor:function(e,i,r){var n=Math.round(i.getAngle()%360/45);return n<0&&(n+=8),n+=t[e],r[this.altActionKey]&&t[e]%2===0&&(n+=2),n%=8,this.cursorMap[n]}})}(),function(){var t=Math.min,e=Math.max;fabric.util.object.extend(fabric.Canvas.prototype,{_shouldGroup:function(t,e){var i=this.getActiveObject();return t[this.selectionKey]&&e&&e.selectable&&(this.getActiveGroup()||i&&i!==e)&&this.selection},_handleGrouping:function(t,e){var i=this.getActiveGroup();(e!==i||(e=this.findTarget(t,!0)))&&(i?this._updateActiveGroup(e,t):this._createActiveGroup(e,t),this._activeGroup&&this._activeGroup.saveCoords())},_updateActiveGroup:function(t,e){var i=this.getActiveGroup();if(i.contains(t)){if(i.removeWithUpdate(t),t.set("active",!1),1===i.size())return this.discardActiveGroup(e),void this.setActiveObject(i.item(0))}else i.addWithUpdate(t);this.fire("selection:created",{target:i,e:e}),i.set("active",!0)},_createActiveGroup:function(t,e){if(this._activeObject&&t!==this._activeObject){var i=this._createGroup(t);i.addWithUpdate(),this.setActiveGroup(i),this._activeObject=null,this.fire("selection:created",{target:i,e:e})}t.set("active",!0)},_createGroup:function(t){var e=this.getObjects(),i=e.indexOf(this._activeObject)<e.indexOf(t),r=i?[this._activeObject,t]:[t,this._activeObject];return this._activeObject.isEditing&&this._activeObject.exitEditing(),new fabric.Group(r,{canvas:this})},_groupSelectedObjects:function(t){var e=this._collectObjects();1===e.length?this.setActiveObject(e[0],t):e.length>1&&(e=new fabric.Group(e.reverse(),{canvas:this}),e.addWithUpdate(),this.setActiveGroup(e,t),e.saveCoords(),this.fire("selection:created",{target:e}),this.renderAll())},_collectObjects:function(){for(var i,r=[],n=this._groupSelector.ex,s=this._groupSelector.ey,o=n+this._groupSelector.left,a=s+this._groupSelector.top,h=new fabric.Point(t(n,o),t(s,a)),c=new fabric.Point(e(n,o),e(s,a)),l=n===o&&s===a,u=this._objects.length;u--&&(i=this._objects[u],!(i&&i.selectable&&i.visible&&(i.intersectsWithRect(h,c)||i.isContainedWithinRect(h,c)||i.containsPoint(h)||i.containsPoint(c))&&(i.set("active",!0),r.push(i),l))););return r},_maybeGroupObjects:function(t){this.selection&&this._groupSelector&&this._groupSelectedObjects(t);var e=this.getActiveGroup();e&&(e.setObjectsCoords().setCoords(),e.isMoving=!1,this.setCursor(this.defaultCursor)),this._groupSelector=null,this._currentTransform=null}})}(),function(){var t=fabric.StaticCanvas.supports("toDataURLWithQuality");fabric.util.object.extend(fabric.StaticCanvas.prototype,{toDataURL:function(t){t||(t={});var e=t.format||"png",i=t.quality||1,r=t.multiplier||1,n={left:t.left||0,top:t.top||0,width:t.width||0,height:t.height||0};return this.__toDataURLWithMultiplier(e,i,n,r)},__toDataURLWithMultiplier:function(t,e,i,r){var n=this.getWidth(),s=this.getHeight(),o=(i.width||this.getWidth())*r,a=(i.height||this.getHeight())*r,h=this.getZoom(),c=h*r,l=this.viewportTransform,u=(l[4]-i.left)*r,f=(l[5]-i.top)*r,d=[c,0,0,c,u,f],g=this.interactive;this.viewportTransform=d,this.interactive&&(this.interactive=!1),n!==o||s!==a?this.setDimensions({width:o,height:a}):this.renderAll();var p=this.__toDataURL(t,e,i);return g&&(this.interactive=g),this.viewportTransform=l,this.setDimensions({width:n,height:s}),p},__toDataURL:function(e,i){var r=this.contextContainer.canvas;"jpg"===e&&(e="jpeg");var n=t?r.toDataURL("image/"+e,i):r.toDataURL("image/"+e);return n},toDataURLWithMultiplier:function(t,e,i){return this.toDataURL({format:t,multiplier:e,quality:i})}})}(),fabric.util.object.extend(fabric.StaticCanvas.prototype,{loadFromDatalessJSON:function(t,e,i){return this.loadFromJSON(t,e,i)},loadFromJSON:function(t,e,i){if(t){var r="string"==typeof t?JSON.parse(t):fabric.util.object.clone(t);this.clear();var n=this;return this._enlivenObjects(r.objects,function(){n._setBgOverlay(r,function(){delete r.objects,delete r.backgroundImage,delete r.overlayImage,delete r.background,delete r.overlay;for(var t in r)n[t]=r[t];e&&e()})},i),this}},_setBgOverlay:function(t,e){var i=this,r={backgroundColor:!1,overlayColor:!1,backgroundImage:!1,overlayImage:!1};if(!(t.backgroundImage||t.overlayImage||t.background||t.overlay))return void(e&&e());var n=function(){r.backgroundImage&&r.overlayImage&&r.backgroundColor&&r.overlayColor&&(i.renderAll(),e&&e())};this.__setBgOverlay("backgroundImage",t.backgroundImage,r,n),this.__setBgOverlay("overlayImage",t.overlayImage,r,n),this.__setBgOverlay("backgroundColor",t.background,r,n),this.__setBgOverlay("overlayColor",t.overlay,r,n),n()},__setBgOverlay:function(t,e,i,r){var n=this;return e?void("backgroundImage"===t||"overlayImage"===t?fabric.Image.fromObject(e,function(e){n[t]=e,i[t]=!0,r&&r()}):this["set"+fabric.util.string.capitalize(t,!0)](e,function(){i[t]=!0,r&&r()})):void(i[t]=!0)},_enlivenObjects:function(t,e,i){var r=this;if(!t||0===t.length)return void(e&&e());var n=this.renderOnAddRemove;this.renderOnAddRemove=!1,fabric.util.enlivenObjects(t,function(t){t.forEach(function(t,e){r.insertAt(t,e)}),r.renderOnAddRemove=n,e&&e()},null,i)},_toDataURL:function(t,e){this.clone(function(i){e(i.toDataURL(t))})},_toDataURLWithMultiplier:function(t,e,i){this.clone(function(r){i(r.toDataURLWithMultiplier(t,e))})},clone:function(t,e){var i=JSON.stringify(this.toJSON(e));this.cloneWithoutData(function(e){e.loadFromJSON(i,function(){t&&t(e)})})},cloneWithoutData:function(t){var e=fabric.document.createElement("canvas");e.width=this.getWidth(),e.height=this.getHeight();var i=new fabric.Canvas(e);i.clipTo=this.clipTo,this.backgroundImage?(i.setBackgroundImage(this.backgroundImage.src,function(){i.renderAll(),t&&t(i)}),i.backgroundImageOpacity=this.backgroundImageOpacity,i.backgroundImageStretch=this.backgroundImageStretch):t&&t(i)}}),function(t){"use strict";var e=t.fabric||(t.fabric={}),i=e.util.object.extend,r=e.util.toFixed,n=e.util.string.capitalize,s=e.util.degreesToRadians,o=e.StaticCanvas.supports("setLineDash");e.Object||(e.Object=e.util.createClass({type:"object",originX:"left",originY:"top",top:0,left:0,width:0,height:0,scaleX:1,scaleY:1,flipX:!1,flipY:!1,opacity:1,angle:0,skewX:0,skewY:0,cornerSize:13,transparentCorners:!0,hoverCursor:null,moveCursor:null,padding:0,borderColor:"rgba(102,153,255,0.75)",borderDashArray:null,cornerColor:"rgba(102,153,255,0.5)",cornerStrokeColor:null,cornerStyle:"rect",cornerDashArray:null,centeredScaling:!1,centeredRotation:!0,fill:"rgb(0,0,0)",fillRule:"nonzero",globalCompositeOperation:"source-over",backgroundColor:"",selectionBackgroundColor:"",stroke:null,strokeWidth:1,strokeDashArray:null,strokeLineCap:"butt",strokeLineJoin:"miter",strokeMiterLimit:10,shadow:null,borderOpacityWhenMoving:.4,borderScaleFactor:1,transformMatrix:null,minScaleLimit:.01,selectable:!0,evented:!0,visible:!0,hasControls:!0,hasBorders:!0,hasRotatingPoint:!0,rotatingPointOffset:40,perPixelTargetFind:!1,includeDefaultValues:!0,clipTo:null,lockMovementX:!1,lockMovementY:!1,lockRotation:!1,lockScalingX:!1,lockScalingY:!1,lockUniScaling:!1,lockSkewingX:!1,lockSkewingY:!1,lockScalingFlip:!1,excludeFromExport:!1,stateProperties:"top left width height scaleX scaleY flipX flipY originX originY transformMatrix stroke strokeWidth strokeDashArray strokeLineCap strokeLineJoin strokeMiterLimit angle opacity fill fillRule globalCompositeOperation shadow clipTo visible backgroundColor skewX skewY".split(" "),initialize:function(t){t&&this.setOptions(t)},_initGradient:function(t){!t.fill||!t.fill.colorStops||t.fill instanceof e.Gradient||this.set("fill",new e.Gradient(t.fill)),!t.stroke||!t.stroke.colorStops||t.stroke instanceof e.Gradient||this.set("stroke",new e.Gradient(t.stroke))},_initPattern:function(t){!t.fill||!t.fill.source||t.fill instanceof e.Pattern||this.set("fill",new e.Pattern(t.fill)),!t.stroke||!t.stroke.source||t.stroke instanceof e.Pattern||this.set("stroke",new e.Pattern(t.stroke))},_initClipping:function(t){if(t.clipTo&&"string"==typeof t.clipTo){var i=e.util.getFunctionBody(t.clipTo);"undefined"!=typeof i&&(this.clipTo=new Function("ctx",i))}},setOptions:function(t){for(var e in t)this.set(e,t[e]);this._initGradient(t),this._initPattern(t),this._initClipping(t)},transform:function(t,e){this.group&&!this.group._transformDone&&this.group===this.canvas._activeGroup&&this.group.transform(t);var i=e?this._getLeftTopCoords():this.getCenterPoint();t.translate(i.x,i.y),t.rotate(s(this.angle)),t.scale(this.scaleX*(this.flipX?-1:1),this.scaleY*(this.flipY?-1:1)),t.transform(1,0,Math.tan(s(this.skewX)),1,0,0),t.transform(1,Math.tan(s(this.skewY)),0,1,0,0)},toObject:function(t){var i=e.Object.NUM_FRACTION_DIGITS,n={type:this.type,originX:this.originX,originY:this.originY,left:r(this.left,i),top:r(this.top,i),width:r(this.width,i),height:r(this.height,i),fill:this.fill&&this.fill.toObject?this.fill.toObject():this.fill,stroke:this.stroke&&this.stroke.toObject?this.stroke.toObject():this.stroke,strokeWidth:r(this.strokeWidth,i),strokeDashArray:this.strokeDashArray?this.strokeDashArray.concat():this.strokeDashArray,strokeLineCap:this.strokeLineCap,strokeLineJoin:this.strokeLineJoin,strokeMiterLimit:r(this.strokeMiterLimit,i),scaleX:r(this.scaleX,i),scaleY:r(this.scaleY,i),angle:r(this.getAngle(),i),flipX:this.flipX,flipY:this.flipY,opacity:r(this.opacity,i),shadow:this.shadow&&this.shadow.toObject?this.shadow.toObject():this.shadow,visible:this.visible,clipTo:this.clipTo&&String(this.clipTo),backgroundColor:this.backgroundColor,fillRule:this.fillRule,globalCompositeOperation:this.globalCompositeOperation,transformMatrix:this.transformMatrix?this.transformMatrix.concat():this.transformMatrix,skewX:r(this.skewX,i),skewY:r(this.skewY,i)};return e.util.populateWithProperties(this,n,t),this.includeDefaultValues||(n=this._removeDefaultValues(n)),n},toDatalessObject:function(t){return this.toObject(t)},_removeDefaultValues:function(t){var i=e.util.getKlass(t.type).prototype,r=i.stateProperties;return r.forEach(function(e){t[e]===i[e]&&delete t[e];var r="[object Array]"===Object.prototype.toString.call(t[e])&&"[object Array]"===Object.prototype.toString.call(i[e]);r&&0===t[e].length&&0===i[e].length&&delete t[e]}),t},toString:function(){return"#<fabric."+n(this.type)+">"},get:function(t){return this[t]},getObjectScaling:function(){var t=this.scaleX,e=this.scaleY;if(this.group){var i=this.group.getObjectScaling();t*=i.scaleX,e*=i.scaleY}return{scaleX:t,scaleY:e}},_setObject:function(t){for(var e in t)this._set(e,t[e])},set:function(t,e){return"object"==typeof t?this._setObject(t):"function"==typeof e&&"clipTo"!==t?this._set(t,e(this.get(t))):this._set(t,e),this},_set:function(t,i){var r="scaleX"===t||"scaleY"===t;return r&&(i=this._constrainScale(i)),"scaleX"===t&&i<0?(this.flipX=!this.flipX,i*=-1):"scaleY"===t&&i<0?(this.flipY=!this.flipY,i*=-1):"shadow"!==t||!i||i instanceof e.Shadow||(i=new e.Shadow(i)),this[t]=i,"width"!==t&&"height"!==t||(this.minScaleLimit=Math.min(.1,1/Math.max(this.width,this.height))),this},setOnGroup:function(){},toggle:function(t){var e=this.get(t);return"boolean"==typeof e&&this.set(t,!e),this},setSourcePath:function(t){return this.sourcePath=t,this},getViewportTransform:function(){return this.canvas&&this.canvas.viewportTransform?this.canvas.viewportTransform:[1,0,0,1,0,0]},render:function(t,i){0===this.width&&0===this.height||!this.visible||(t.save(),this._setupCompositeOperation(t),this.drawSelectionBackground(t),i||this.transform(t),this._setOpacity(t),this._setShadow(t),this._renderBackground(t),this._setStrokeStyles(t),this._setFillStyles(t),this.transformMatrix&&t.transform.apply(t,this.transformMatrix),this.clipTo&&e.util.clipContext(this,t),this._render(t,i),this.clipTo&&t.restore(),t.restore())},_renderBackground:function(t){this.backgroundColor&&(t.fillStyle=this.backgroundColor,t.fillRect(-this.width/2,-this.height/2,this.width,this.height),this._removeShadow(t))},_setOpacity:function(t){this.group&&this.group._setOpacity(t),t.globalAlpha*=this.opacity},_setStrokeStyles:function(t){this.stroke&&(t.lineWidth=this.strokeWidth,t.lineCap=this.strokeLineCap,t.lineJoin=this.strokeLineJoin,t.miterLimit=this.strokeMiterLimit,t.strokeStyle=this.stroke.toLive?this.stroke.toLive(t,this):this.stroke)},_setFillStyles:function(t){this.fill&&(t.fillStyle=this.fill.toLive?this.fill.toLive(t,this):this.fill)},_setLineDash:function(t,e,i){e&&(1&e.length&&e.push.apply(e,e),o?t.setLineDash(e):i&&i(t))},_renderControls:function(t,i){if(!(!this.active||i||this.group&&this.group!==this.canvas.getActiveGroup())){var r,n=this.getViewportTransform(),o=this.calcTransformMatrix();o=e.util.multiplyTransformMatrices(n,o),r=e.util.qrDecompose(o),t.save(),t.translate(r.translateX,r.translateY),t.lineWidth=1*this.borderScaleFactor,t.globalAlpha=this.isMoving?this.borderOpacityWhenMoving:1,this.group&&this.group===this.canvas.getActiveGroup()?(t.rotate(s(r.angle)),this.drawBordersInGroup(t,r)):(t.rotate(s(this.angle)),this.drawBorders(t)),this.drawControls(t),t.restore()}},_setShadow:function(t){if(this.shadow){var i=this.canvas&&this.canvas.viewportTransform[0]||1,r=this.canvas&&this.canvas.viewportTransform[3]||1,n=this.getObjectScaling();this.canvas&&this.canvas._isRetinaScaling()&&(i*=e.devicePixelRatio,r*=e.devicePixelRatio),t.shadowColor=this.shadow.color,t.shadowBlur=this.shadow.blur*(i+r)*(n.scaleX+n.scaleY)/4,t.shadowOffsetX=this.shadow.offsetX*i*n.scaleX,t.shadowOffsetY=this.shadow.offsetY*r*n.scaleY}},_removeShadow:function(t){this.shadow&&(t.shadowColor="",t.shadowBlur=t.shadowOffsetX=t.shadowOffsetY=0)},_renderFill:function(t){if(this.fill){if(t.save(),this.fill.gradientTransform){var e=this.fill.gradientTransform;t.transform.apply(t,e)}this.fill.toLive&&t.translate(-this.width/2+this.fill.offsetX||0,-this.height/2+this.fill.offsetY||0),"evenodd"===this.fillRule?t.fill("evenodd"):t.fill(),t.restore()}},_renderStroke:function(t){if(this.stroke&&0!==this.strokeWidth){if(this.shadow&&!this.shadow.affectStroke&&this._removeShadow(t),t.save(),this._setLineDash(t,this.strokeDashArray,this._renderDashedStroke),this.stroke.gradientTransform){var e=this.stroke.gradientTransform;t.transform.apply(t,e)}this.stroke.toLive&&t.translate(-this.width/2+this.stroke.offsetX||0,-this.height/2+this.stroke.offsetY||0),t.stroke(),t.restore()}},clone:function(t,i){return this.constructor.fromObject?this.constructor.fromObject(this.toObject(i),t):new e.Object(this.toObject(i))},cloneAsImage:function(t,i){var r=this.toDataURL(i);return e.util.loadImage(r,function(i){t&&t(new e.Image(i))}),this},toDataURL:function(t){t||(t={});var i=e.util.createCanvasElement(),r=this.getBoundingRect();i.width=r.width,i.height=r.height,e.util.wrapElement(i,"div");var n=new e.StaticCanvas(i,{enableRetinaScaling:t.enableRetinaScaling});"jpg"===t.format&&(t.format="jpeg"),"jpeg"===t.format&&(n.backgroundColor="#fff");var s={active:this.get("active"),left:this.getLeft(),top:this.getTop()};this.set("active",!1),this.setPositionByOrigin(new e.Point(n.getWidth()/2,n.getHeight()/2),"center","center");var o=this.canvas;n.add(this);var a=n.toDataURL(t);return this.set(s).setCoords(),this.canvas=o,n.dispose(),n=null,a},isType:function(t){return this.type===t},complexity:function(){return 0},toJSON:function(t){return this.toObject(t)},setGradient:function(t,i){i||(i={});var r={colorStops:[]};r.type=i.type||(i.r1||i.r2?"radial":"linear"),r.coords={x1:i.x1,y1:i.y1,x2:i.x2,y2:i.y2},(i.r1||i.r2)&&(r.coords.r1=i.r1,r.coords.r2=i.r2),i.gradientTransform&&(r.gradientTransform=i.gradientTransform);for(var n in i.colorStops){var s=new e.Color(i.colorStops[n]);r.colorStops.push({offset:n,color:s.toRgb(),opacity:s.getAlpha()})}return this.set(t,e.Gradient.forObject(this,r))},setPatternFill:function(t){return this.set("fill",new e.Pattern(t))},setShadow:function(t){return this.set("shadow",t?new e.Shadow(t):null)},setColor:function(t){return this.set("fill",t),this},setAngle:function(t){var e=("center"!==this.originX||"center"!==this.originY)&&this.centeredRotation;return e&&this._setOriginToCenter(),this.set("angle",t),e&&this._resetOrigin(),this},centerH:function(){return this.canvas&&this.canvas.centerObjectH(this),this},viewportCenterH:function(){return this.canvas&&this.canvas.viewportCenterObjectH(this),this},centerV:function(){return this.canvas&&this.canvas.centerObjectV(this),this},viewportCenterV:function(){return this.canvas&&this.canvas.viewportCenterObjectV(this),this},center:function(){return this.canvas&&this.canvas.centerObject(this),this},viewportCenter:function(){return this.canvas&&this.canvas.viewportCenterObject(this),this},remove:function(){return this.canvas&&this.canvas.remove(this),this},getLocalPointer:function(t,i){i=i||this.canvas.getPointer(t);var r=new e.Point(i.x,i.y),n=this._getLeftTopCoords();return this.angle&&(r=e.util.rotatePoint(r,n,e.util.degreesToRadians(-this.angle))),{x:r.x-n.x,y:r.y-n.y}},_setupCompositeOperation:function(t){this.globalCompositeOperation&&(t.globalCompositeOperation=this.globalCompositeOperation)}}),e.util.createAccessors(e.Object),e.Object.prototype.rotate=e.Object.prototype.setAngle,i(e.Object.prototype,e.Observable),e.Object.NUM_FRACTION_DIGITS=2,e.Object.__uid=0)}("undefined"!=typeof exports?exports:this),function(){var t=fabric.util.degreesToRadians,e={left:-.5,center:0,right:.5},i={top:-.5,center:0,bottom:.5};fabric.util.object.extend(fabric.Object.prototype,{translateToGivenOrigin:function(t,r,n,s,o){var a,h,c,l=t.x,u=t.y;return"string"==typeof r?r=e[r]:r-=.5,"string"==typeof s?s=e[s]:s-=.5,a=s-r,"string"==typeof n?n=i[n]:n-=.5,"string"==typeof o?o=i[o]:o-=.5,h=o-n,(a||h)&&(c=this._getTransformedDimensions(),l=t.x+a*c.x,u=t.y+h*c.y),new fabric.Point(l,u)},translateToCenterPoint:function(e,i,r){var n=this.translateToGivenOrigin(e,i,r,"center","center");return this.angle?fabric.util.rotatePoint(n,e,t(this.angle)):n},translateToOriginPoint:function(e,i,r){var n=this.translateToGivenOrigin(e,"center","center",i,r);return this.angle?fabric.util.rotatePoint(n,e,t(this.angle)):n},getCenterPoint:function(){var t=new fabric.Point(this.left,this.top);return this.translateToCenterPoint(t,this.originX,this.originY)},getPointByOrigin:function(t,e){var i=this.getCenterPoint();return this.translateToOriginPoint(i,t,e)},toLocalPoint:function(e,i,r){var n,s,o=this.getCenterPoint();return n="undefined"!=typeof i&&"undefined"!=typeof r?this.translateToGivenOrigin(o,"center","center",i,r):new fabric.Point(this.left,this.top),s=new fabric.Point(e.x,e.y),this.angle&&(s=fabric.util.rotatePoint(s,o,-t(this.angle))),s.subtractEquals(n)},setPositionByOrigin:function(t,e,i){var r=this.translateToCenterPoint(t,e,i),n=this.translateToOriginPoint(r,this.originX,this.originY);this.set("left",n.x),this.set("top",n.y)},adjustPosition:function(i){var r,n,s=t(this.angle),o=this.getWidth(),a=Math.cos(s)*o,h=Math.sin(s)*o;r="string"==typeof this.originX?e[this.originX]:this.originX-.5,n="string"==typeof i?e[i]:i-.5,this.left+=a*(n-r),this.top+=h*(n-r),this.setCoords(),this.originX=i},_setOriginToCenter:function(){this._originalOriginX=this.originX,this._originalOriginY=this.originY;var t=this.getCenterPoint();this.originX="center",this.originY="center",this.left=t.x,this.top=t.y},_resetOrigin:function(){var t=this.translateToOriginPoint(this.getCenterPoint(),this._originalOriginX,this._originalOriginY);this.originX=this._originalOriginX,this.originY=this._originalOriginY,this.left=t.x,this.top=t.y,this._originalOriginX=null,this._originalOriginY=null},_getLeftTopCoords:function(){return this.translateToOriginPoint(this.getCenterPoint(),"left","top")}})}(),function(){function t(t){return[new fabric.Point(t.tl.x,t.tl.y),new fabric.Point(t.tr.x,t.tr.y),new fabric.Point(t.br.x,t.br.y),new fabric.Point(t.bl.x,t.bl.y)]}var e=fabric.util.degreesToRadians,i=fabric.util.multiplyTransformMatrices;fabric.util.object.extend(fabric.Object.prototype,{oCoords:null,intersectsWithRect:function(e,i){var r=t(this.oCoords),n=fabric.Intersection.intersectPolygonRectangle(r,e,i);return"Intersection"===n.status},intersectsWithObject:function(e){var i=fabric.Intersection.intersectPolygonPolygon(t(this.oCoords),t(e.oCoords));return"Intersection"===i.status||e.isContainedWithinObject(this)||this.isContainedWithinObject(e)},isContainedWithinObject:function(e){for(var i=t(this.oCoords),r=0;r<4;r++)if(!e.containsPoint(i[r]))return!1;return!0},isContainedWithinRect:function(t,e){var i=this.getBoundingRect();return i.left>=t.x&&i.left+i.width<=e.x&&i.top>=t.y&&i.top+i.height<=e.y},containsPoint:function(t){this.oCoords||this.setCoords();var e=this._getImageLines(this.oCoords),i=this._findCrossPoints(t,e);return 0!==i&&i%2===1},_getImageLines:function(t){return{topline:{o:t.tl,d:t.tr},rightline:{o:t.tr,d:t.br},bottomline:{o:t.br,d:t.bl},leftline:{o:t.bl,d:t.tl}}},_findCrossPoints:function(t,e){var i,r,n,s,o,a,h=0;for(var c in e)if(a=e[c],!(a.o.y<t.y&&a.d.y<t.y||a.o.y>=t.y&&a.d.y>=t.y||(a.o.x===a.d.x&&a.o.x>=t.x?o=a.o.x:(i=0,r=(a.d.y-a.o.y)/(a.d.x-a.o.x),n=t.y-i*t.x,s=a.o.y-r*a.o.x,o=-(n-s)/(i-r)),o>=t.x&&(h+=1),2!==h)))break;return h},getBoundingRectWidth:function(){return this.getBoundingRect().width},getBoundingRectHeight:function(){return this.getBoundingRect().height},getBoundingRect:function(){return this.oCoords||this.setCoords(),fabric.util.makeBoundingBoxFromPoints([this.oCoords.tl,this.oCoords.tr,this.oCoords.br,this.oCoords.bl])},getWidth:function(){return this._getTransformedDimensions().x},getHeight:function(){return this._getTransformedDimensions().y},_constrainScale:function(t){return Math.abs(t)<this.minScaleLimit?t<0?-this.minScaleLimit:this.minScaleLimit:t},scale:function(t){return t=this._constrainScale(t),t<0&&(this.flipX=!this.flipX,this.flipY=!this.flipY,t*=-1),this.scaleX=t,this.scaleY=t,this.setCoords(),this},scaleToWidth:function(t){var e=this.getBoundingRect().width/this.getWidth();return this.scale(t/this.width/e)},scaleToHeight:function(t){var e=this.getBoundingRect().height/this.getHeight();return this.scale(t/this.height/e)},setCoords:function(){var t=e(this.angle),i=this.getViewportTransform(),r=this._calculateCurrentDimensions(),n=r.x,s=r.y;n<0&&(n=Math.abs(n));var o=Math.sin(t),a=Math.cos(t),h=n>0?Math.atan(s/n):0,c=n/Math.cos(h)/2,l=Math.cos(h+t)*c,u=Math.sin(h+t)*c,f=fabric.util.transformPoint(this.getCenterPoint(),i),d=new fabric.Point(f.x-l,f.y-u),g=new fabric.Point(d.x+n*a,d.y+n*o),p=new fabric.Point(d.x-s*o,d.y+s*a),v=new fabric.Point(f.x+l,f.y+u),b=new fabric.Point((d.x+p.x)/2,(d.y+p.y)/2),m=new fabric.Point((g.x+d.x)/2,(g.y+d.y)/2),y=new fabric.Point((v.x+g.x)/2,(v.y+g.y)/2),_=new fabric.Point((v.x+p.x)/2,(v.y+p.y)/2),x=new fabric.Point(m.x+o*this.rotatingPointOffset,m.y-a*this.rotatingPointOffset);
return this.oCoords={tl:d,tr:g,br:v,bl:p,ml:b,mt:m,mr:y,mb:_,mtr:x},this._setCornerCoords&&this._setCornerCoords(),this},_calcRotateMatrix:function(){if(this.angle){var t=e(this.angle),i=Math.cos(t),r=Math.sin(t);return[i,r,-r,i,0,0]}return[1,0,0,1,0,0]},calcTransformMatrix:function(){var t=this.getCenterPoint(),e=[1,0,0,1,t.x,t.y],r=this._calcRotateMatrix(),n=this._calcDimensionsTransformMatrix(this.skewX,this.skewY,!0),s=this.group?this.group.calcTransformMatrix():[1,0,0,1,0,0];return s=i(s,e),s=i(s,r),s=i(s,n)},_calcDimensionsTransformMatrix:function(t,r,n){var s=[1,0,Math.tan(e(t)),1],o=[1,Math.tan(e(r)),0,1],a=this.scaleX*(n&&this.flipX?-1:1),h=this.scaleY*(n&&this.flipY?-1:1),c=[a,0,0,h],l=i(c,s,!0);return i(l,o,!0)}})}(),fabric.util.object.extend(fabric.Object.prototype,{sendToBack:function(){return this.group?fabric.StaticCanvas.prototype.sendToBack.call(this.group,this):this.canvas.sendToBack(this),this},bringToFront:function(){return this.group?fabric.StaticCanvas.prototype.bringToFront.call(this.group,this):this.canvas.bringToFront(this),this},sendBackwards:function(t){return this.group?fabric.StaticCanvas.prototype.sendBackwards.call(this.group,this,t):this.canvas.sendBackwards(this,t),this},bringForward:function(t){return this.group?fabric.StaticCanvas.prototype.bringForward.call(this.group,this,t):this.canvas.bringForward(this,t),this},moveTo:function(t){return this.group?fabric.StaticCanvas.prototype.moveTo.call(this.group,this,t):this.canvas.moveTo(this,t),this}}),function(){function t(t,e){if(e){if(e.toLive)return t+": url(#SVGID_"+e.id+"); ";var i=new fabric.Color(e),r=t+": "+i.toRgb()+"; ",n=i.getAlpha();return 1!==n&&(r+=t+"-opacity: "+n.toString()+"; "),r}return t+": none; "}fabric.util.object.extend(fabric.Object.prototype,{getSvgStyles:function(e){var i=this.fillRule,r=this.strokeWidth?this.strokeWidth:"0",n=this.strokeDashArray?this.strokeDashArray.join(" "):"none",s=this.strokeLineCap?this.strokeLineCap:"butt",o=this.strokeLineJoin?this.strokeLineJoin:"miter",a=this.strokeMiterLimit?this.strokeMiterLimit:"4",h="undefined"!=typeof this.opacity?this.opacity:"1",c=this.visible?"":" visibility: hidden;",l=e?"":this.getSvgFilter(),u=t("fill",this.fill),f=t("stroke",this.stroke);return[f,"stroke-width: ",r,"; ","stroke-dasharray: ",n,"; ","stroke-linecap: ",s,"; ","stroke-linejoin: ",o,"; ","stroke-miterlimit: ",a,"; ",u,"fill-rule: ",i,"; ","opacity: ",h,";",l,c].join("")},getSvgFilter:function(){return this.shadow?"filter: url(#SVGID_"+this.shadow.id+");":""},getSvgId:function(){return this.id?'id="'+this.id+'" ':""},getSvgTransform:function(){if(this.group&&"path-group"===this.group.type)return"";var t=fabric.util.toFixed,e=this.getAngle(),i=this.getSkewX()%360,r=this.getSkewY()%360,n=this.getCenterPoint(),s=fabric.Object.NUM_FRACTION_DIGITS,o="path-group"===this.type?"":"translate("+t(n.x,s)+" "+t(n.y,s)+")",a=0!==e?" rotate("+t(e,s)+")":"",h=1===this.scaleX&&1===this.scaleY?"":" scale("+t(this.scaleX,s)+" "+t(this.scaleY,s)+")",c=0!==i?" skewX("+t(i,s)+")":"",l=0!==r?" skewY("+t(r,s)+")":"",u="path-group"===this.type?this.width:0,f=this.flipX?" matrix(-1 0 0 1 "+u+" 0) ":"",d="path-group"===this.type?this.height:0,g=this.flipY?" matrix(1 0 0 -1 0 "+d+")":"";return[o,a,h,f,g,c,l].join("")},getSvgTransformMatrix:function(){return this.transformMatrix?" matrix("+this.transformMatrix.join(" ")+") ":""},_createBaseSVGMarkup:function(){var t=[];return this.fill&&this.fill.toLive&&t.push(this.fill.toSVG(this,!1)),this.stroke&&this.stroke.toLive&&t.push(this.stroke.toSVG(this,!1)),this.shadow&&t.push(this.shadow.toSVG(this)),t}})}(),function(){function t(t,e,r){var n={},s=!0;r.forEach(function(e){n[e]=t[e]}),i(t[e],n,s)}function e(t,i){if(!fabric.isLikelyNode&&t instanceof Element)return t===i;if(t instanceof Array){if(t.length!==i.length)return!1;var r=i.concat().sort(),n=t.concat().sort();return!n.some(function(t,i){return!e(r[i],t)})}if(t instanceof Object){for(var s in t)if(!e(t[s],i[s]))return!1;return!0}return t===i}var i=fabric.util.object.extend;fabric.util.object.extend(fabric.Object.prototype,{hasStateChanged:function(){return!e(this.originalState,this)},saveState:function(e){return t(this,"originalState",this.stateProperties),e&&e.stateProperties&&t(this,"originalState",e.stateProperties),this},setupState:function(t){return this.originalState={},this.saveState(t),this}})}(),function(){var t=fabric.util.degreesToRadians,e=function(){return"undefined"!=typeof G_vmlCanvasManager};fabric.util.object.extend(fabric.Object.prototype,{_controlsVisibility:null,_findTargetCorner:function(t){if(!this.hasControls||!this.active)return!1;var e,i,r=t.x,n=t.y;this.__corner=0;for(var s in this.oCoords)if(this.isControlVisible(s)&&("mtr"!==s||this.hasRotatingPoint)&&(!this.get("lockUniScaling")||"mt"!==s&&"mr"!==s&&"mb"!==s&&"ml"!==s)&&(i=this._getImageLines(this.oCoords[s].corner),e=this._findCrossPoints({x:r,y:n},i),0!==e&&e%2===1))return this.__corner=s,s;return!1},_setCornerCoords:function(){var e,i,r=this.oCoords,n=t(45-this.angle),s=.707106*this.cornerSize,o=s*Math.cos(n),a=s*Math.sin(n);for(var h in r)e=r[h].x,i=r[h].y,r[h].corner={tl:{x:e-a,y:i-o},tr:{x:e+o,y:i-a},bl:{x:e-o,y:i+a},br:{x:e+a,y:i+o}}},_getNonTransformedDimensions:function(){var t=this.strokeWidth,e=this.width,i=this.height,r=!0,n=!0;return"line"===this.type&&"butt"===this.strokeLineCap&&(n=e,r=i),n&&(i+=i<0?-t:t),r&&(e+=e<0?-t:t),{x:e,y:i}},_getTransformedDimensions:function(t,e){"undefined"==typeof t&&(t=this.skewX),"undefined"==typeof e&&(e=this.skewY);var i,r,n=this._getNonTransformedDimensions(),s=n.x/2,o=n.y/2,a=[{x:-s,y:-o},{x:s,y:-o},{x:-s,y:o},{x:s,y:o}],h=this._calcDimensionsTransformMatrix(t,e,!1);for(i=0;i<a.length;i++)a[i]=fabric.util.transformPoint(a[i],h);return r=fabric.util.makeBoundingBoxFromPoints(a),{x:r.width,y:r.height}},_calculateCurrentDimensions:function(){var t=this.getViewportTransform(),e=this._getTransformedDimensions(),i=e.x,r=e.y,n=fabric.util.transformPoint(new fabric.Point(i,r),t,!0);return n.scalarAdd(2*this.padding)},drawSelectionBackground:function(e){if(!this.selectionBackgroundColor||this.group||!this.active)return this;e.save();var i=this.getCenterPoint(),r=this._calculateCurrentDimensions(),n=this.canvas.viewportTransform;return e.translate(i.x,i.y),e.scale(1/n[0],1/n[3]),e.rotate(t(this.angle)),e.fillStyle=this.selectionBackgroundColor,e.fillRect(-r.x/2,-r.y/2,r.x,r.y),e.restore(),this},drawBorders:function(t){if(!this.hasBorders)return this;var e=this._calculateCurrentDimensions(),i=1/this.borderScaleFactor,r=e.x+i,n=e.y+i;if(t.save(),t.strokeStyle=this.borderColor,this._setLineDash(t,this.borderDashArray,null),t.strokeRect(-r/2,-n/2,r,n),this.hasRotatingPoint&&this.isControlVisible("mtr")&&!this.get("lockRotation")&&this.hasControls){var s=-n/2;t.beginPath(),t.moveTo(0,s),t.lineTo(0,s-this.rotatingPointOffset),t.closePath(),t.stroke()}return t.restore(),this},drawBordersInGroup:function(t,e){if(!this.hasBorders)return this;var i=this._getNonTransformedDimensions(),r=fabric.util.customTransformMatrix(e.scaleX,e.scaleY,e.skewX),n=fabric.util.transformPoint(i,r),s=1/this.borderScaleFactor,o=n.x+s+2*this.padding,a=n.y+s+2*this.padding;return t.save(),this._setLineDash(t,this.borderDashArray,null),t.strokeStyle=this.borderColor,t.strokeRect(-o/2,-a/2,o,a),t.restore(),this},drawControls:function(t){if(!this.hasControls)return this;var e=this._calculateCurrentDimensions(),i=e.x,r=e.y,n=this.cornerSize,s=-(i+n)/2,o=-(r+n)/2,a=this.transparentCorners?"stroke":"fill";return t.save(),t.strokeStyle=t.fillStyle=this.cornerColor,this.transparentCorners||(t.strokeStyle=this.cornerStrokeColor),this._setLineDash(t,this.cornerDashArray,null),this._drawControl("tl",t,a,s,o),this._drawControl("tr",t,a,s+i,o),this._drawControl("bl",t,a,s,o+r),this._drawControl("br",t,a,s+i,o+r),this.get("lockUniScaling")||(this._drawControl("mt",t,a,s+i/2,o),this._drawControl("mb",t,a,s+i/2,o+r),this._drawControl("mr",t,a,s+i,o+r/2),this._drawControl("ml",t,a,s,o+r/2)),this.hasRotatingPoint&&this._drawControl("mtr",t,a,s+i/2,o-this.rotatingPointOffset),t.restore(),this},_drawControl:function(t,i,r,n,s){if(this.isControlVisible(t)){var o=this.cornerSize,a=!this.transparentCorners&&this.cornerStrokeColor;switch(this.cornerStyle){case"circle":i.beginPath(),i.arc(n+o/2,s+o/2,o/2,0,2*Math.PI,!1),i[r](),a&&i.stroke();break;default:e()||this.transparentCorners||i.clearRect(n,s,o,o),i[r+"Rect"](n,s,o,o),a&&i.strokeRect(n,s,o,o)}}},isControlVisible:function(t){return this._getControlsVisibility()[t]},setControlVisible:function(t,e){return this._getControlsVisibility()[t]=e,this},setControlsVisibility:function(t){t||(t={});for(var e in t)this.setControlVisible(e,t[e]);return this},_getControlsVisibility:function(){return this._controlsVisibility||(this._controlsVisibility={tl:!0,tr:!0,br:!0,bl:!0,ml:!0,mt:!0,mr:!0,mb:!0,mtr:!0}),this._controlsVisibility}})}(),fabric.util.object.extend(fabric.StaticCanvas.prototype,{FX_DURATION:500,fxCenterObjectH:function(t,e){e=e||{};var i=function(){},r=e.onComplete||i,n=e.onChange||i,s=this;return fabric.util.animate({startValue:t.get("left"),endValue:this.getCenter().left,duration:this.FX_DURATION,onChange:function(e){t.set("left",e),s.renderAll(),n()},onComplete:function(){t.setCoords(),r()}}),this},fxCenterObjectV:function(t,e){e=e||{};var i=function(){},r=e.onComplete||i,n=e.onChange||i,s=this;return fabric.util.animate({startValue:t.get("top"),endValue:this.getCenter().top,duration:this.FX_DURATION,onChange:function(e){t.set("top",e),s.renderAll(),n()},onComplete:function(){t.setCoords(),r()}}),this},fxRemove:function(t,e){e=e||{};var i=function(){},r=e.onComplete||i,n=e.onChange||i,s=this;return fabric.util.animate({startValue:t.get("opacity"),endValue:0,duration:this.FX_DURATION,onStart:function(){t.set("active",!1)},onChange:function(e){t.set("opacity",e),s.renderAll(),n()},onComplete:function(){s.remove(t),r()}}),this}}),fabric.util.object.extend(fabric.Object.prototype,{animate:function(){if(arguments[0]&&"object"==typeof arguments[0]){var t,e,i=[];for(t in arguments[0])i.push(t);for(var r=0,n=i.length;r<n;r++)t=i[r],e=r!==n-1,this._animate(t,arguments[0][t],arguments[1],e)}else this._animate.apply(this,arguments);return this},_animate:function(t,e,i,r){var n,s=this;e=e.toString(),i=i?fabric.util.object.clone(i):{},~t.indexOf(".")&&(n=t.split("."));var o=n?this.get(n[0])[n[1]]:this.get(t);"from"in i||(i.from=o),e=~e.indexOf("=")?o+parseFloat(e.replace("=","")):parseFloat(e),fabric.util.animate({startValue:i.from,endValue:e,byValue:i.by,easing:i.easing,duration:i.duration,abort:i.abort&&function(){return i.abort.call(s)},onChange:function(e){n?s[n[0]][n[1]]=e:s.set(t,e),r||i.onChange&&i.onChange()},onComplete:function(){r||(s.setCoords(),i.onComplete&&i.onComplete())}})}}),function(t){"use strict";function e(t,e){var i=t.origin,r=t.axis1,n=t.axis2,s=t.dimension,o=e.nearest,a=e.center,h=e.farthest;return function(){switch(this.get(i)){case o:return Math.min(this.get(r),this.get(n));case a:return Math.min(this.get(r),this.get(n))+.5*this.get(s);case h:return Math.max(this.get(r),this.get(n))}}}var i=t.fabric||(t.fabric={}),r=i.util.object.extend,n={x1:1,x2:1,y1:1,y2:1},s=i.StaticCanvas.supports("setLineDash");return i.Line?void i.warn("fabric.Line is already defined"):(i.Line=i.util.createClass(i.Object,{type:"line",x1:0,y1:0,x2:0,y2:0,initialize:function(t,e){e=e||{},t||(t=[0,0,0,0]),this.callSuper("initialize",e),this.set("x1",t[0]),this.set("y1",t[1]),this.set("x2",t[2]),this.set("y2",t[3]),this._setWidthHeight(e)},_setWidthHeight:function(t){t||(t={}),this.width=Math.abs(this.x2-this.x1),this.height=Math.abs(this.y2-this.y1),this.left="left"in t?t.left:this._getLeftToOriginX(),this.top="top"in t?t.top:this._getTopToOriginY()},_set:function(t,e){return this.callSuper("_set",t,e),"undefined"!=typeof n[t]&&this._setWidthHeight(),this},_getLeftToOriginX:e({origin:"originX",axis1:"x1",axis2:"x2",dimension:"width"},{nearest:"left",center:"center",farthest:"right"}),_getTopToOriginY:e({origin:"originY",axis1:"y1",axis2:"y2",dimension:"height"},{nearest:"top",center:"center",farthest:"bottom"}),_render:function(t,e){if(t.beginPath(),e){var i=this.getCenterPoint();t.translate(i.x-this.strokeWidth/2,i.y-this.strokeWidth/2)}if(!this.strokeDashArray||this.strokeDashArray&&s){var r=this.calcLinePoints();t.moveTo(r.x1,r.y1),t.lineTo(r.x2,r.y2)}t.lineWidth=this.strokeWidth;var n=t.strokeStyle;t.strokeStyle=this.stroke||t.fillStyle,this.stroke&&this._renderStroke(t),t.strokeStyle=n},_renderDashedStroke:function(t){var e=this.calcLinePoints();t.beginPath(),i.util.drawDashedLine(t,e.x1,e.y1,e.x2,e.y2,this.strokeDashArray),t.closePath()},toObject:function(t){return r(this.callSuper("toObject",t),this.calcLinePoints())},calcLinePoints:function(){var t=this.x1<=this.x2?-1:1,e=this.y1<=this.y2?-1:1,i=t*this.width*.5,r=e*this.height*.5,n=t*this.width*-.5,s=e*this.height*-.5;return{x1:i,x2:n,y1:r,y2:s}},toSVG:function(t){var e=this._createBaseSVGMarkup(),i={x1:this.x1,x2:this.x2,y1:this.y1,y2:this.y2};return this.group&&"path-group"===this.group.type||(i=this.calcLinePoints()),e.push("<line ",this.getSvgId(),'x1="',i.x1,'" y1="',i.y1,'" x2="',i.x2,'" y2="',i.y2,'" style="',this.getSvgStyles(),'" transform="',this.getSvgTransform(),this.getSvgTransformMatrix(),'"/>\n'),t?t(e.join("")):e.join("")},complexity:function(){return 1}}),i.Line.ATTRIBUTE_NAMES=i.SHARED_ATTRIBUTES.concat("x1 y1 x2 y2".split(" ")),i.Line.fromElement=function(t,e){var n=i.parseAttributes(t,i.Line.ATTRIBUTE_NAMES),s=[n.x1||0,n.y1||0,n.x2||0,n.y2||0];return new i.Line(s,r(n,e))},void(i.Line.fromObject=function(t,e){var r=[t.x1,t.y1,t.x2,t.y2],n=new i.Line(r,t);return e&&e(n),n}))}("undefined"!=typeof exports?exports:this),function(t){"use strict";function e(t){return"radius"in t&&t.radius>=0}var i=t.fabric||(t.fabric={}),r=Math.PI,n=i.util.object.extend;return i.Circle?void i.warn("fabric.Circle is already defined."):(i.Circle=i.util.createClass(i.Object,{type:"circle",radius:0,startAngle:0,endAngle:2*r,initialize:function(t){t=t||{},this.callSuper("initialize",t),this.set("radius",t.radius||0),this.startAngle=t.startAngle||this.startAngle,this.endAngle=t.endAngle||this.endAngle},_set:function(t,e){return this.callSuper("_set",t,e),"radius"===t&&this.setRadius(e),this},toObject:function(t){return this.callSuper("toObject",["radius","startAngle","endAngle"].concat(t))},toSVG:function(t){var e=this._createBaseSVGMarkup(),i=0,n=0,s=(this.endAngle-this.startAngle)%(2*r);if(0===s)this.group&&"path-group"===this.group.type&&(i=this.left+this.radius,n=this.top+this.radius),e.push("<circle ",this.getSvgId(),'cx="'+i+'" cy="'+n+'" ','r="',this.radius,'" style="',this.getSvgStyles(),'" transform="',this.getSvgTransform()," ",this.getSvgTransformMatrix(),'"/>\n');else{var o=Math.cos(this.startAngle)*this.radius,a=Math.sin(this.startAngle)*this.radius,h=Math.cos(this.endAngle)*this.radius,c=Math.sin(this.endAngle)*this.radius,l=s>r?"1":"0";e.push('<path d="M '+o+" "+a," A "+this.radius+" "+this.radius," 0 ",+l+" 1"," "+h+" "+c,'" style="',this.getSvgStyles(),'" transform="',this.getSvgTransform()," ",this.getSvgTransformMatrix(),'"/>\n')}return t?t(e.join("")):e.join("")},_render:function(t,e){t.beginPath(),t.arc(e?this.left+this.radius:0,e?this.top+this.radius:0,this.radius,this.startAngle,this.endAngle,!1),this._renderFill(t),this._renderStroke(t)},getRadiusX:function(){return this.get("radius")*this.get("scaleX")},getRadiusY:function(){return this.get("radius")*this.get("scaleY")},setRadius:function(t){return this.radius=t,this.set("width",2*t).set("height",2*t)},complexity:function(){return 1}}),i.Circle.ATTRIBUTE_NAMES=i.SHARED_ATTRIBUTES.concat("cx cy r".split(" ")),i.Circle.fromElement=function(t,r){r||(r={});var s=i.parseAttributes(t,i.Circle.ATTRIBUTE_NAMES);if(!e(s))throw new Error("value of `r` attribute is required and can not be negative");s.left=s.left||0,s.top=s.top||0;var o=new i.Circle(n(s,r));return o.left-=o.radius,o.top-=o.radius,o},void(i.Circle.fromObject=function(t,e){var r=new i.Circle(t);return e&&e(r),r}))}("undefined"!=typeof exports?exports:this),function(t){"use strict";var e=t.fabric||(t.fabric={});return e.Triangle?void e.warn("fabric.Triangle is already defined"):(e.Triangle=e.util.createClass(e.Object,{type:"triangle",initialize:function(t){t=t||{},this.callSuper("initialize",t),this.set("width",t.width||100).set("height",t.height||100)},_render:function(t){var e=this.width/2,i=this.height/2;t.beginPath(),t.moveTo(-e,i),t.lineTo(0,-i),t.lineTo(e,i),t.closePath(),this._renderFill(t),this._renderStroke(t)},_renderDashedStroke:function(t){var i=this.width/2,r=this.height/2;t.beginPath(),e.util.drawDashedLine(t,-i,r,0,-r,this.strokeDashArray),e.util.drawDashedLine(t,0,-r,i,r,this.strokeDashArray),e.util.drawDashedLine(t,i,r,-i,r,this.strokeDashArray),t.closePath()},toSVG:function(t){var e=this._createBaseSVGMarkup(),i=this.width/2,r=this.height/2,n=[-i+" "+r,"0 "+-r,i+" "+r].join(",");return e.push("<polygon ",this.getSvgId(),'points="',n,'" style="',this.getSvgStyles(),'" transform="',this.getSvgTransform(),'"/>'),t?t(e.join("")):e.join("")},complexity:function(){return 1}}),void(e.Triangle.fromObject=function(t,i){var r=new e.Triangle(t);return i&&i(r),r}))}("undefined"!=typeof exports?exports:this),function(t){"use strict";var e=t.fabric||(t.fabric={}),i=2*Math.PI,r=e.util.object.extend;return e.Ellipse?void e.warn("fabric.Ellipse is already defined."):(e.Ellipse=e.util.createClass(e.Object,{type:"ellipse",rx:0,ry:0,initialize:function(t){t=t||{},this.callSuper("initialize",t),this.set("rx",t.rx||0),this.set("ry",t.ry||0)},_set:function(t,e){switch(this.callSuper("_set",t,e),t){case"rx":this.rx=e,this.set("width",2*e);break;case"ry":this.ry=e,this.set("height",2*e)}return this},getRx:function(){return this.get("rx")*this.get("scaleX")},getRy:function(){return this.get("ry")*this.get("scaleY")},toObject:function(t){return this.callSuper("toObject",["rx","ry"].concat(t))},toSVG:function(t){var e=this._createBaseSVGMarkup(),i=0,r=0;return this.group&&"path-group"===this.group.type&&(i=this.left+this.rx,r=this.top+this.ry),e.push("<ellipse ",this.getSvgId(),'cx="',i,'" cy="',r,'" ','rx="',this.rx,'" ry="',this.ry,'" style="',this.getSvgStyles(),'" transform="',this.getSvgTransform(),this.getSvgTransformMatrix(),'"/>\n'),t?t(e.join("")):e.join("")},_render:function(t,e){t.beginPath(),t.save(),t.transform(1,0,0,this.ry/this.rx,0,0),t.arc(e?this.left+this.rx:0,e?(this.top+this.ry)*this.rx/this.ry:0,this.rx,0,i,!1),t.restore(),this._renderFill(t),this._renderStroke(t)},complexity:function(){return 1}}),e.Ellipse.ATTRIBUTE_NAMES=e.SHARED_ATTRIBUTES.concat("cx cy rx ry".split(" ")),e.Ellipse.fromElement=function(t,i){i||(i={});var n=e.parseAttributes(t,e.Ellipse.ATTRIBUTE_NAMES);n.left=n.left||0,n.top=n.top||0;var s=new e.Ellipse(r(n,i));return s.top-=s.ry,s.left-=s.rx,s},void(e.Ellipse.fromObject=function(t,i){var r=new e.Ellipse(t);return i&&i(r),r}))}("undefined"!=typeof exports?exports:this),function(t){"use strict";var e=t.fabric||(t.fabric={}),i=e.util.object.extend;if(e.Rect)return void e.warn("fabric.Rect is already defined");var r=e.Object.prototype.stateProperties.concat();r.push("rx","ry","x","y"),e.Rect=e.util.createClass(e.Object,{stateProperties:r,type:"rect",rx:0,ry:0,strokeDashArray:null,initialize:function(t){t=t||{},this.callSuper("initialize",t),this._initRxRy()},_initRxRy:function(){this.rx&&!this.ry?this.ry=this.rx:this.ry&&!this.rx&&(this.rx=this.ry)},_render:function(t,e){if(1===this.width&&1===this.height)return void t.fillRect(-.5,-.5,1,1);var i=this.rx?Math.min(this.rx,this.width/2):0,r=this.ry?Math.min(this.ry,this.height/2):0,n=this.width,s=this.height,o=e?this.left:-this.width/2,a=e?this.top:-this.height/2,h=0!==i||0!==r,c=.4477152502;t.beginPath(),t.moveTo(o+i,a),t.lineTo(o+n-i,a),h&&t.bezierCurveTo(o+n-c*i,a,o+n,a+c*r,o+n,a+r),t.lineTo(o+n,a+s-r),h&&t.bezierCurveTo(o+n,a+s-c*r,o+n-c*i,a+s,o+n-i,a+s),t.lineTo(o+i,a+s),h&&t.bezierCurveTo(o+c*i,a+s,o,a+s-c*r,o,a+s-r),t.lineTo(o,a+r),h&&t.bezierCurveTo(o,a+c*r,o+c*i,a,o+i,a),t.closePath(),this._renderFill(t),this._renderStroke(t)},_renderDashedStroke:function(t){var i=-this.width/2,r=-this.height/2,n=this.width,s=this.height;t.beginPath(),e.util.drawDashedLine(t,i,r,i+n,r,this.strokeDashArray),e.util.drawDashedLine(t,i+n,r,i+n,r+s,this.strokeDashArray),e.util.drawDashedLine(t,i+n,r+s,i,r+s,this.strokeDashArray),e.util.drawDashedLine(t,i,r+s,i,r,this.strokeDashArray),t.closePath()},toObject:function(t){return this.callSuper("toObject",["rx","ry"].concat(t))},toSVG:function(t){var e=this._createBaseSVGMarkup(),i=this.left,r=this.top;return this.group&&"path-group"===this.group.type||(i=-this.width/2,r=-this.height/2),e.push("<rect ",this.getSvgId(),'x="',i,'" y="',r,'" rx="',this.get("rx"),'" ry="',this.get("ry"),'" width="',this.width,'" height="',this.height,'" style="',this.getSvgStyles(),'" transform="',this.getSvgTransform(),this.getSvgTransformMatrix(),'"/>\n'),t?t(e.join("")):e.join("")},complexity:function(){return 1}}),e.Rect.ATTRIBUTE_NAMES=e.SHARED_ATTRIBUTES.concat("x y rx ry width height".split(" ")),e.Rect.fromElement=function(t,r){if(!t)return null;r=r||{};var n=e.parseAttributes(t,e.Rect.ATTRIBUTE_NAMES);n.left=n.left||0,n.top=n.top||0;var s=new e.Rect(i(r?e.util.object.clone(r):{},n));return s.visible=s.visible&&s.width>0&&s.height>0,s},e.Rect.fromObject=function(t,i){var r=new e.Rect(t);return i&&i(r),r}}("undefined"!=typeof exports?exports:this),function(t){"use strict";var e=t.fabric||(t.fabric={});return e.Polyline?void e.warn("fabric.Polyline is already defined"):(e.Polyline=e.util.createClass(e.Object,{type:"polyline",points:null,minX:0,minY:0,initialize:function(t,i){return e.Polygon.prototype.initialize.call(this,t,i)},_calcDimensions:function(){return e.Polygon.prototype._calcDimensions.call(this)},toObject:function(t){return e.Polygon.prototype.toObject.call(this,t)},toSVG:function(t){return e.Polygon.prototype.toSVG.call(this,t)},_render:function(t,i){e.Polygon.prototype.commonRender.call(this,t,i)&&(this._renderFill(t),this._renderStroke(t))},_renderDashedStroke:function(t){var i,r;t.beginPath();for(var n=0,s=this.points.length;n<s;n++)i=this.points[n],r=this.points[n+1]||i,e.util.drawDashedLine(t,i.x,i.y,r.x,r.y,this.strokeDashArray)},complexity:function(){return this.get("points").length}}),e.Polyline.ATTRIBUTE_NAMES=e.SHARED_ATTRIBUTES.concat(),e.Polyline.fromElement=function(t,i){if(!t)return null;i||(i={});var r=e.parsePointsAttribute(t.getAttribute("points")),n=e.parseAttributes(t,e.Polyline.ATTRIBUTE_NAMES);return new e.Polyline(r,e.util.object.extend(n,i))},void(e.Polyline.fromObject=function(t,i){var r=new e.Polyline(t.points,t);return i&&i(r),r}))}("undefined"!=typeof exports?exports:this),function(t){"use strict";var e=t.fabric||(t.fabric={}),i=e.util.object.extend,r=e.util.array.min,n=e.util.array.max,s=e.util.toFixed;return e.Polygon?void e.warn("fabric.Polygon is already defined"):(e.Polygon=e.util.createClass(e.Object,{type:"polygon",points:null,minX:0,minY:0,initialize:function(t,e){e=e||{},this.points=t||[],this.callSuper("initialize",e),this._calcDimensions(),"top"in e||(this.top=this.minY),"left"in e||(this.left=this.minX),this.pathOffset={x:this.minX+this.width/2,y:this.minY+this.height/2}},_calcDimensions:function(){var t=this.points,e=r(t,"x"),i=r(t,"y"),s=n(t,"x"),o=n(t,"y");this.width=s-e||0,this.height=o-i||0,this.minX=e||0,this.minY=i||0},toObject:function(t){return i(this.callSuper("toObject",t),{points:this.points.concat()})},toSVG:function(t){for(var e,i=[],r=this._createBaseSVGMarkup(),n=0,o=this.points.length;n<o;n++)i.push(s(this.points[n].x,2),",",s(this.points[n].y,2)," ");return this.group&&"path-group"===this.group.type||(e=" translate("+-this.pathOffset.x+", "+-this.pathOffset.y+") "),r.push("<",this.type," ",this.getSvgId(),'points="',i.join(""),'" style="',this.getSvgStyles(),'" transform="',this.getSvgTransform(),e," ",this.getSvgTransformMatrix(),'"/>\n'),t?t(r.join("")):r.join("")},_render:function(t,e){this.commonRender(t,e)&&(this._renderFill(t),(this.stroke||this.strokeDashArray)&&(t.closePath(),this._renderStroke(t)))},commonRender:function(t,e){var i,r=this.points.length;if(!r||isNaN(this.points[r-1].y))return!1;e||t.translate(-this.pathOffset.x,-this.pathOffset.y),t.beginPath(),t.moveTo(this.points[0].x,this.points[0].y);for(var n=0;n<r;n++)i=this.points[n],t.lineTo(i.x,i.y);return!0},_renderDashedStroke:function(t){e.Polyline.prototype._renderDashedStroke.call(this,t),t.closePath()},complexity:function(){return this.points.length}}),e.Polygon.ATTRIBUTE_NAMES=e.SHARED_ATTRIBUTES.concat(),e.Polygon.fromElement=function(t,r){if(!t)return null;r||(r={});var n=e.parsePointsAttribute(t.getAttribute("points")),s=e.parseAttributes(t,e.Polygon.ATTRIBUTE_NAMES);return new e.Polygon(n,i(s,r))},void(e.Polygon.fromObject=function(t,i){var r=new e.Polygon(t.points,t);return i&&i(r),r}))}("undefined"!=typeof exports?exports:this),function(t){"use strict";var e=t.fabric||(t.fabric={}),i=e.util.array.min,r=e.util.array.max,n=e.util.object.extend,s=Object.prototype.toString,o=e.util.drawArc,a={m:2,l:2,h:1,v:1,c:6,s:4,q:4,t:2,a:7},h={m:"l",M:"L"};return e.Path?void e.warn("fabric.Path is already defined"):(e.Path=e.util.createClass(e.Object,{type:"path",path:null,minX:0,minY:0,initialize:function(t,e){e=e||{},this.setOptions(e),t||(t=[]);var i="[object Array]"===s.call(t);this.path=i?t:t.match&&t.match(/[mzlhvcsqta][^mzlhvcsqta]*/gi),this.path&&(i||(this.path=this._parsePath()),this._setPositionDimensions(e),e.sourcePath&&this.setSourcePath(e.sourcePath))},_setPositionDimensions:function(t){var e=this._parseDimensions();this.minX=e.left,this.minY=e.top,this.width=e.width,this.height=e.height,"undefined"==typeof t.left&&(this.left=e.left+("center"===this.originX?this.width/2:"right"===this.originX?this.width:0)),"undefined"==typeof t.top&&(this.top=e.top+("center"===this.originY?this.height/2:"bottom"===this.originY?this.height:0)),this.pathOffset=this.pathOffset||{x:this.minX+this.width/2,y:this.minY+this.height/2}},_renderPathCommands:function(t){var e,i,r,n=null,s=0,a=0,h=0,c=0,l=0,u=0,f=-this.pathOffset.x,d=-this.pathOffset.y;this.group&&"path-group"===this.group.type&&(f=0,d=0),t.beginPath();for(var g=0,p=this.path.length;g<p;++g){switch(e=this.path[g],e[0]){case"l":h+=e[1],c+=e[2],t.lineTo(h+f,c+d);break;case"L":h=e[1],c=e[2],t.lineTo(h+f,c+d);break;case"h":h+=e[1],t.lineTo(h+f,c+d);break;case"H":h=e[1],t.lineTo(h+f,c+d);break;case"v":c+=e[1],t.lineTo(h+f,c+d);break;case"V":c=e[1],t.lineTo(h+f,c+d);break;case"m":h+=e[1],c+=e[2],s=h,a=c,t.moveTo(h+f,c+d);break;case"M":h=e[1],c=e[2],s=h,a=c,t.moveTo(h+f,c+d);break;case"c":i=h+e[5],r=c+e[6],l=h+e[3],u=c+e[4],t.bezierCurveTo(h+e[1]+f,c+e[2]+d,l+f,u+d,i+f,r+d),h=i,c=r;break;case"C":h=e[5],c=e[6],l=e[3],u=e[4],t.bezierCurveTo(e[1]+f,e[2]+d,l+f,u+d,h+f,c+d);break;case"s":i=h+e[3],r=c+e[4],null===n[0].match(/[CcSs]/)?(l=h,u=c):(l=2*h-l,u=2*c-u),t.bezierCurveTo(l+f,u+d,h+e[1]+f,c+e[2]+d,i+f,r+d),l=h+e[1],u=c+e[2],h=i,c=r;break;case"S":i=e[3],r=e[4],null===n[0].match(/[CcSs]/)?(l=h,u=c):(l=2*h-l,u=2*c-u),t.bezierCurveTo(l+f,u+d,e[1]+f,e[2]+d,i+f,r+d),h=i,c=r,l=e[1],u=e[2];break;case"q":i=h+e[3],r=c+e[4],l=h+e[1],u=c+e[2],t.quadraticCurveTo(l+f,u+d,i+f,r+d),h=i,c=r;break;case"Q":i=e[3],r=e[4],t.quadraticCurveTo(e[1]+f,e[2]+d,i+f,r+d),h=i,c=r,l=e[1],u=e[2];break;case"t":i=h+e[1],r=c+e[2],null===n[0].match(/[QqTt]/)?(l=h,u=c):(l=2*h-l,u=2*c-u),t.quadraticCurveTo(l+f,u+d,i+f,r+d),h=i,c=r;break;case"T":i=e[1],r=e[2],null===n[0].match(/[QqTt]/)?(l=h,u=c):(l=2*h-l,u=2*c-u),t.quadraticCurveTo(l+f,u+d,i+f,r+d),h=i,c=r;break;case"a":o(t,h+f,c+d,[e[1],e[2],e[3],e[4],e[5],e[6]+h+f,e[7]+c+d]),h+=e[6],c+=e[7];break;case"A":o(t,h+f,c+d,[e[1],e[2],e[3],e[4],e[5],e[6]+f,e[7]+d]),h=e[6],c=e[7];break;case"z":case"Z":h=s,c=a,t.closePath()}n=e}},_render:function(t){this._renderPathCommands(t),this._renderFill(t),this._renderStroke(t)},toString:function(){return"#<fabric.Path ("+this.complexity()+'): { "top": '+this.top+', "left": '+this.left+" }>"},toObject:function(t){var e=n(this.callSuper("toObject",["sourcePath","pathOffset"].concat(t)),{path:this.path.map(function(t){return t.slice()})});return e},toDatalessObject:function(t){var e=this.toObject(t);return this.sourcePath&&(e.path=this.sourcePath),delete e.sourcePath,e},toSVG:function(t){for(var e=[],i=this._createBaseSVGMarkup(),r="",n=0,s=this.path.length;n<s;n++)e.push(this.path[n].join(" "));var o=e.join(" ");return this.group&&"path-group"===this.group.type||(r=" translate("+-this.pathOffset.x+", "+-this.pathOffset.y+") "),i.push("<path ",this.getSvgId(),'d="',o,'" style="',this.getSvgStyles(),'" transform="',this.getSvgTransform(),r,this.getSvgTransformMatrix(),'" stroke-linecap="round" ',"/>\n"),t?t(i.join("")):i.join("")},complexity:function(){return this.path.length},_parsePath:function(){for(var t,e,i,r,n,s=[],o=[],c=/([-+]?((\d+\.\d+)|((\d+)|(\.\d+)))(?:e[-+]?\d+)?)/gi,l=0,u=this.path.length;l<u;l++){for(t=this.path[l],r=t.slice(1).trim(),o.length=0;i=c.exec(r);)o.push(i[0]);n=[t.charAt(0)];for(var f=0,d=o.length;f<d;f++)e=parseFloat(o[f]),isNaN(e)||n.push(e);var g=n[0],p=a[g.toLowerCase()],v=h[g]||g;if(n.length-1>p)for(var b=1,m=n.length;b<m;b+=p)s.push([g].concat(n.slice(b,b+p))),g=v;else s.push(n)}return s},_parseDimensions:function(){for(var t,n,s,o,a=[],h=[],c=null,l=0,u=0,f=0,d=0,g=0,p=0,v=0,b=this.path.length;v<b;++v){switch(t=this.path[v],t[0]){case"l":f+=t[1],d+=t[2],o=[];break;case"L":f=t[1],d=t[2],o=[];break;case"h":f+=t[1],o=[];break;case"H":f=t[1],o=[];break;case"v":d+=t[1],o=[];break;case"V":d=t[1],o=[];break;case"m":f+=t[1],d+=t[2],l=f,u=d,o=[];break;case"M":f=t[1],d=t[2],l=f,u=d,o=[];break;case"c":n=f+t[5],s=d+t[6],g=f+t[3],p=d+t[4],o=e.util.getBoundsOfCurve(f,d,f+t[1],d+t[2],g,p,n,s),f=n,d=s;break;case"C":f=t[5],d=t[6],g=t[3],p=t[4],o=e.util.getBoundsOfCurve(f,d,t[1],t[2],g,p,f,d);break;case"s":n=f+t[3],s=d+t[4],null===c[0].match(/[CcSs]/)?(g=f,p=d):(g=2*f-g,p=2*d-p),o=e.util.getBoundsOfCurve(f,d,g,p,f+t[1],d+t[2],n,s),g=f+t[1],p=d+t[2],f=n,d=s;break;case"S":n=t[3],s=t[4],null===c[0].match(/[CcSs]/)?(g=f,p=d):(g=2*f-g,p=2*d-p),o=e.util.getBoundsOfCurve(f,d,g,p,t[1],t[2],n,s),f=n,d=s,g=t[1],p=t[2];break;case"q":n=f+t[3],s=d+t[4],g=f+t[1],p=d+t[2],o=e.util.getBoundsOfCurve(f,d,g,p,g,p,n,s),f=n,d=s;break;case"Q":g=t[1],p=t[2],o=e.util.getBoundsOfCurve(f,d,g,p,g,p,t[3],t[4]),f=t[3],d=t[4];break;case"t":n=f+t[1],s=d+t[2],null===c[0].match(/[QqTt]/)?(g=f,p=d):(g=2*f-g,p=2*d-p),o=e.util.getBoundsOfCurve(f,d,g,p,g,p,n,s),f=n,d=s;break;case"T":n=t[1],s=t[2],null===c[0].match(/[QqTt]/)?(g=f,p=d):(g=2*f-g,p=2*d-p),o=e.util.getBoundsOfCurve(f,d,g,p,g,p,n,s),f=n,d=s;break;case"a":o=e.util.getBoundsOfArc(f,d,t[1],t[2],t[3],t[4],t[5],t[6]+f,t[7]+d),f+=t[6],d+=t[7];break;case"A":o=e.util.getBoundsOfArc(f,d,t[1],t[2],t[3],t[4],t[5],t[6],t[7]),f=t[6],d=t[7];break;case"z":case"Z":f=l,d=u}c=t,o.forEach(function(t){a.push(t.x),h.push(t.y)}),a.push(f),h.push(d)}var m=i(a)||0,y=i(h)||0,_=r(a)||0,x=r(h)||0,S=_-m,C=x-y,w={left:m,top:y,width:S,height:C};return w}}),e.Path.fromObject=function(t,i){var r;return"string"!=typeof t.path?(r=new e.Path(t.path,t),i&&i(r),r):void e.loadSVGFromURL(t.path,function(n){var s=t.path;r=n[0],delete t.path,e.util.object.extend(r,t),r.setSourcePath(s),i&&i(r)})},e.Path.ATTRIBUTE_NAMES=e.SHARED_ATTRIBUTES.concat(["d"]),e.Path.fromElement=function(t,i,r){var s=e.parseAttributes(t,e.Path.ATTRIBUTE_NAMES);i&&i(new e.Path(s.d,n(s,r)))},void(e.Path.async=!0))}("undefined"!=typeof exports?exports:this),function(t){"use strict";var e=t.fabric||(t.fabric={}),i=e.util.object.extend,r=e.util.array.invoke,n=e.Object.prototype.toObject;return e.PathGroup?void e.warn("fabric.PathGroup is already defined"):(e.PathGroup=e.util.createClass(e.Path,{type:"path-group",fill:"",initialize:function(t,e){e=e||{},this.paths=t||[];for(var i=this.paths.length;i--;)this.paths[i].group=this;
e.toBeParsed&&(this.parseDimensionsFromPaths(e),delete e.toBeParsed),this.setOptions(e),this.setCoords(),e.sourcePath&&this.setSourcePath(e.sourcePath)},parseDimensionsFromPaths:function(t){for(var i,r,n,s,o,a,h=[],c=[],l=this.paths.length;l--;){n=this.paths[l],s=n.height+n.strokeWidth,o=n.width+n.strokeWidth,i=[{x:n.left,y:n.top},{x:n.left+o,y:n.top},{x:n.left,y:n.top+s},{x:n.left+o,y:n.top+s}],a=this.paths[l].transformMatrix;for(var u=0;u<i.length;u++)r=i[u],a&&(r=e.util.transformPoint(r,a,!1)),h.push(r.x),c.push(r.y)}t.width=Math.max.apply(null,h),t.height=Math.max.apply(null,c)},render:function(t){if(this.visible){t.save(),this.transformMatrix&&t.transform.apply(t,this.transformMatrix),this.transform(t),this._setShadow(t),this.clipTo&&e.util.clipContext(this,t),t.translate(-this.width/2,-this.height/2);for(var i=0,r=this.paths.length;i<r;++i)this.paths[i].render(t,!0);this.clipTo&&t.restore(),t.restore()}},_set:function(t,e){if("fill"===t&&e&&this.isSameColor())for(var i=this.paths.length;i--;)this.paths[i]._set(t,e);return this.callSuper("_set",t,e)},toObject:function(t){var e=i(n.call(this,["sourcePath"].concat(t)),{paths:r(this.getObjects(),"toObject",t)});return e},toDatalessObject:function(t){var e=this.toObject(t);return this.sourcePath&&(e.paths=this.sourcePath),e},toSVG:function(t){var e=this.getObjects(),i=this.getPointByOrigin("left","top"),r="translate("+i.x+" "+i.y+")",n=this._createBaseSVGMarkup();n.push("<g ",this.getSvgId(),'style="',this.getSvgStyles(),'" ','transform="',this.getSvgTransformMatrix(),r,this.getSvgTransform(),'" ',">\n");for(var s=0,o=e.length;s<o;s++)n.push("\t",e[s].toSVG(t));return n.push("</g>\n"),t?t(n.join("")):n.join("")},toString:function(){return"#<fabric.PathGroup ("+this.complexity()+"): { top: "+this.top+", left: "+this.left+" }>"},isSameColor:function(){var t=this.getObjects()[0].get("fill")||"";return"string"==typeof t&&(t=t.toLowerCase(),this.getObjects().every(function(e){var i=e.get("fill")||"";return"string"==typeof i&&i.toLowerCase()===t}))},complexity:function(){return this.paths.reduce(function(t,e){return t+(e&&e.complexity?e.complexity():0)},0)},getObjects:function(){return this.paths}}),e.PathGroup.fromObject=function(t,i){"string"==typeof t.paths?e.loadSVGFromURL(t.paths,function(r){var n=t.paths;delete t.paths;var s=e.util.groupSVGElements(r,t,n);i(s)}):e.util.enlivenObjects(t.paths,function(r){delete t.paths,i(new e.PathGroup(r,t))})},void(e.PathGroup.async=!0))}("undefined"!=typeof exports?exports:this),function(t){"use strict";var e=t.fabric||(t.fabric={}),i=e.util.object.extend,r=e.util.array.min,n=e.util.array.max,s=e.util.array.invoke;if(!e.Group){var o={lockMovementX:!0,lockMovementY:!0,lockRotation:!0,lockScalingX:!0,lockScalingY:!0,lockUniScaling:!0};e.Group=e.util.createClass(e.Object,e.Collection,{type:"group",strokeWidth:0,subTargetCheck:!1,initialize:function(t,e,i){e=e||{},this._objects=[],i&&this.callSuper("initialize",e),this._objects=t||[];for(var r=this._objects.length;r--;)this._objects[r].group=this;this.originalState={},e.originX&&(this.originX=e.originX),e.originY&&(this.originY=e.originY),i?this._updateObjectsCoords(!0):(this._calcBounds(),this._updateObjectsCoords(),this.callSuper("initialize",e)),this.setCoords(),this.saveCoords()},_updateObjectsCoords:function(t){for(var e=this._objects.length;e--;)this._updateObjectCoords(this._objects[e],t)},_updateObjectCoords:function(t,e){if(t.__origHasControls=t.hasControls,t.hasControls=!1,!e){var i=t.getLeft(),r=t.getTop(),n=this.getCenterPoint();t.set({originalLeft:i,originalTop:r,left:i-n.x,top:r-n.y}),t.setCoords()}},toString:function(){return"#<fabric.Group: ("+this.complexity()+")>"},addWithUpdate:function(t){return this._restoreObjectsState(),e.util.resetObjectTransform(this),t&&(this._objects.push(t),t.group=this,t._set("canvas",this.canvas)),this.forEachObject(this._setObjectActive,this),this._calcBounds(),this._updateObjectsCoords(),this},_setObjectActive:function(t){t.set("active",!0),t.group=this},removeWithUpdate:function(t){return this._restoreObjectsState(),e.util.resetObjectTransform(this),this.forEachObject(this._setObjectActive,this),this.remove(t),this._calcBounds(),this._updateObjectsCoords(),this},_onObjectAdded:function(t){t.group=this,t._set("canvas",this.canvas)},_onObjectRemoved:function(t){delete t.group,t.set("active",!1)},delegatedProperties:{fill:!0,stroke:!0,strokeWidth:!0,fontFamily:!0,fontWeight:!0,fontSize:!0,fontStyle:!0,lineHeight:!0,textDecoration:!0,textAlign:!0,backgroundColor:!0},_set:function(t,e){var i=this._objects.length;if(this.delegatedProperties[t]||"canvas"===t)for(;i--;)this._objects[i].set(t,e);else for(;i--;)this._objects[i].setOnGroup(t,e);this.callSuper("_set",t,e)},toObject:function(t){return i(this.callSuper("toObject",t),{objects:s(this._objects,"toObject",t)})},render:function(t){if(this.visible){t.save(),this.transformMatrix&&t.transform.apply(t,this.transformMatrix),this.transform(t),this._setShadow(t),this.clipTo&&e.util.clipContext(this,t),this._transformDone=!0;for(var i=0,r=this._objects.length;i<r;i++)this._renderObject(this._objects[i],t);this.clipTo&&t.restore(),t.restore(),this._transformDone=!1}},_renderControls:function(t,e){this.callSuper("_renderControls",t,e);for(var i=0,r=this._objects.length;i<r;i++)this._objects[i]._renderControls(t)},_renderObject:function(t,e){if(t.visible){var i=t.hasRotatingPoint;t.hasRotatingPoint=!1,t.render(e),t.hasRotatingPoint=i}},_restoreObjectsState:function(){return this._objects.forEach(this._restoreObjectState,this),this},realizeTransform:function(t){var i=t.calcTransformMatrix(),r=e.util.qrDecompose(i),n=new e.Point(r.translateX,r.translateY);return t.scaleX=r.scaleX,t.scaleY=r.scaleY,t.skewX=r.skewX,t.skewY=r.skewY,t.angle=r.angle,t.flipX=!1,t.flipY=!1,t.setPositionByOrigin(n,"center","center"),t},_restoreObjectState:function(t){return this.realizeTransform(t),t.setCoords(),t.hasControls=t.__origHasControls,delete t.__origHasControls,t.set("active",!1),delete t.group,this},destroy:function(){return this._restoreObjectsState()},saveCoords:function(){return this._originalLeft=this.get("left"),this._originalTop=this.get("top"),this},hasMoved:function(){return this._originalLeft!==this.get("left")||this._originalTop!==this.get("top")},setObjectsCoords:function(){return this.forEachObject(function(t){t.setCoords()}),this},_calcBounds:function(t){for(var e,i,r,n=[],s=[],o=["tr","br","bl","tl"],a=0,h=this._objects.length,c=o.length;a<h;++a)for(e=this._objects[a],e.setCoords(),r=0;r<c;r++)i=o[r],n.push(e.oCoords[i].x),s.push(e.oCoords[i].y);this.set(this._getBounds(n,s,t))},_getBounds:function(t,i,s){var o=e.util.invertTransform(this.getViewportTransform()),a=e.util.transformPoint(new e.Point(r(t),r(i)),o),h=e.util.transformPoint(new e.Point(n(t),n(i)),o),c={width:h.x-a.x||0,height:h.y-a.y||0};return s||(c.left=a.x||0,c.top=a.y||0,"center"===this.originX&&(c.left+=c.width/2),"right"===this.originX&&(c.left+=c.width),"center"===this.originY&&(c.top+=c.height/2),"bottom"===this.originY&&(c.top+=c.height)),c},toSVG:function(t){var e=this._createBaseSVGMarkup();e.push("<g ",this.getSvgId(),'transform="',this.getSvgTransform(),this.getSvgTransformMatrix(),'" style="',this.getSvgFilter(),'">\n');for(var i=0,r=this._objects.length;i<r;i++)e.push("\t",this._objects[i].toSVG(t));return e.push("</g>\n"),t?t(e.join("")):e.join("")},get:function(t){if(t in o){if(this[t])return this[t];for(var e=0,i=this._objects.length;e<i;e++)if(this._objects[e][t])return!0;return!1}return t in this.delegatedProperties?this._objects[0]&&this._objects[0].get(t):this[t]}}),e.Group.fromObject=function(t,i){e.util.enlivenObjects(t.objects,function(r){delete t.objects,i&&i(new e.Group(r,t,!0))})},e.Group.async=!0}}("undefined"!=typeof exports?exports:this),function(t){"use strict";var e=fabric.util.object.extend;if(t.fabric||(t.fabric={}),t.fabric.Image)return void fabric.warn("fabric.Image is already defined.");var i=fabric.Object.prototype.stateProperties.concat();i.push("alignX","alignY","meetOrSlice"),fabric.Image=fabric.util.createClass(fabric.Object,{type:"image",crossOrigin:"",alignX:"none",alignY:"none",meetOrSlice:"meet",strokeWidth:0,_lastScaleX:1,_lastScaleY:1,minimumScaleTrigger:.5,stateProperties:i,initialize:function(t,e,i){e||(e={}),this.filters=[],this.resizeFilters=[],this.callSuper("initialize",e),this._initElement(t,e,i)},getElement:function(){return this._element},setElement:function(t,e,i){var r,n;return this._element=t,this._originalElement=t,this._initConfig(i),0===this.resizeFilters.length?r=e:(n=this,r=function(){n.applyFilters(e,n.resizeFilters,n._filteredEl||n._originalElement,!0)}),0!==this.filters.length?this.applyFilters(r):r&&r(this),this},setCrossOrigin:function(t){return this.crossOrigin=t,this._element.crossOrigin=t,this},getOriginalSize:function(){var t=this.getElement();return{width:t.width,height:t.height}},_stroke:function(t){if(this.stroke&&0!==this.strokeWidth){var e=this.width/2,i=this.height/2;t.beginPath(),t.moveTo(-e,-i),t.lineTo(e,-i),t.lineTo(e,i),t.lineTo(-e,i),t.lineTo(-e,-i),t.closePath()}},_renderDashedStroke:function(t){var e=-this.width/2,i=-this.height/2,r=this.width,n=this.height;t.save(),this._setStrokeStyles(t),t.beginPath(),fabric.util.drawDashedLine(t,e,i,e+r,i,this.strokeDashArray),fabric.util.drawDashedLine(t,e+r,i,e+r,i+n,this.strokeDashArray),fabric.util.drawDashedLine(t,e+r,i+n,e,i+n,this.strokeDashArray),fabric.util.drawDashedLine(t,e,i+n,e,i,this.strokeDashArray),t.closePath(),t.restore()},toObject:function(t){var i=[],r=[],n=1,s=1;this.filters.forEach(function(t){t&&("Resize"===t.type&&(n*=t.scaleX,s*=t.scaleY),i.push(t.toObject()))}),this.resizeFilters.forEach(function(t){t&&r.push(t.toObject())});var o=e(this.callSuper("toObject",["crossOrigin","alignX","alignY","meetOrSlice"].concat(t)),{src:this.getSrc(),filters:i,resizeFilters:r});return o.width/=n,o.height/=s,o},toSVG:function(t){var e=this._createBaseSVGMarkup(),i=-this.width/2,r=-this.height/2,n="none",s=!0;if(this.group&&"path-group"===this.group.type&&(i=this.left,r=this.top),"none"!==this.alignX&&"none"!==this.alignY&&(n="x"+this.alignX+"Y"+this.alignY+" "+this.meetOrSlice),e.push('<g transform="',this.getSvgTransform(),this.getSvgTransformMatrix(),'">\n',"<image ",this.getSvgId(),'xlink:href="',this.getSvgSrc(s),'" x="',i,'" y="',r,'" style="',this.getSvgStyles(),'" width="',this.width,'" height="',this.height,'" preserveAspectRatio="',n,'"',"></image>\n"),this.stroke||this.strokeDashArray){var o=this.fill;this.fill=null,e.push("<rect ",'x="',i,'" y="',r,'" width="',this.width,'" height="',this.height,'" style="',this.getSvgStyles(),'"/>\n'),this.fill=o}return e.push("</g>\n"),t?t(e.join("")):e.join("")},getSrc:function(t){var e=t?this._element:this._originalElement;return e?fabric.isLikelyNode?e._src:e.src:this.src||""},setSrc:function(t,e,i){fabric.util.loadImage(t,function(t){return this.setElement(t,e,i)},this,i&&i.crossOrigin)},toString:function(){return'#<fabric.Image: { src: "'+this.getSrc()+'" }>'},applyFilters:function(t,e,i,r){if(e=e||this.filters,i=i||this._originalElement){var n,s,o=fabric.util.createImage(),a=this.canvas?this.canvas.getRetinaScaling():fabric.devicePixelRatio,h=this.minimumScaleTrigger/a,c=this;if(0===e.length)return this._element=i,t&&t(this),i;var l=fabric.util.createCanvasElement();return l.width=i.width,l.height=i.height,l.getContext("2d").drawImage(i,0,0,i.width,i.height),e.forEach(function(t){t&&(r?(n=c.scaleX<h?c.scaleX:1,s=c.scaleY<h?c.scaleY:1,n*a<1&&(n*=a),s*a<1&&(s*=a)):(n=t.scaleX,s=t.scaleY),t.applyTo(l,n,s),r||"Resize"!==t.type||(c.width*=t.scaleX,c.height*=t.scaleY))}),o.width=l.width,o.height=l.height,fabric.isLikelyNode?(o.src=l.toBuffer(void 0,fabric.Image.pngCompression),c._element=o,!r&&(c._filteredEl=o),t&&t(c)):(o.onload=function(){c._element=o,!r&&(c._filteredEl=o),t&&t(c),o.onload=l=null},o.src=l.toDataURL("image/png")),l}},_render:function(t,e){var i,r,n,s=this._findMargins();i=e?this.left:-this.width/2,r=e?this.top:-this.height/2,"slice"===this.meetOrSlice&&(t.beginPath(),t.rect(i,r,this.width,this.height),t.clip()),this.isMoving===!1&&this.resizeFilters.length&&this._needsResize()?(this._lastScaleX=this.scaleX,this._lastScaleY=this.scaleY,n=this.applyFilters(null,this.resizeFilters,this._filteredEl||this._originalElement,!0)):n=this._element,n&&t.drawImage(n,i+s.marginX,r+s.marginY,s.width,s.height),this._stroke(t),this._renderStroke(t)},_needsResize:function(){return this.scaleX!==this._lastScaleX||this.scaleY!==this._lastScaleY},_findMargins:function(){var t,e,i=this.width,r=this.height,n=0,s=0;return"none"===this.alignX&&"none"===this.alignY||(t=[this.width/this._element.width,this.height/this._element.height],e="meet"===this.meetOrSlice?Math.min.apply(null,t):Math.max.apply(null,t),i=this._element.width*e,r=this._element.height*e,"Mid"===this.alignX&&(n=(this.width-i)/2),"Max"===this.alignX&&(n=this.width-i),"Mid"===this.alignY&&(s=(this.height-r)/2),"Max"===this.alignY&&(s=this.height-r)),{width:i,height:r,marginX:n,marginY:s}},_resetWidthHeight:function(){var t=this.getElement();this.set("width",t.width),this.set("height",t.height)},_initElement:function(t,e,i){this.setElement(fabric.util.getById(t),i,e),fabric.util.addClass(this.getElement(),fabric.Image.CSS_CANVAS)},_initConfig:function(t){t||(t={}),this.setOptions(t),this._setWidthHeight(t),this._element&&this.crossOrigin&&(this._element.crossOrigin=this.crossOrigin)},_initFilters:function(t,e){t&&t.length?fabric.util.enlivenObjects(t,function(t){e&&e(t)},"fabric.Image.filters"):e&&e()},_setWidthHeight:function(t){this.width="width"in t?t.width:this.getElement()?this.getElement().width||0:0,this.height="height"in t?t.height:this.getElement()?this.getElement().height||0:0},complexity:function(){return 1}}),fabric.Image.CSS_CANVAS="canvas-img",fabric.Image.prototype.getSvgSrc=fabric.Image.prototype.getSrc,fabric.Image.fromObject=function(t,e){fabric.util.loadImage(t.src,function(i){fabric.Image.prototype._initFilters.call(t,t.filters,function(r){t.filters=r||[],fabric.Image.prototype._initFilters.call(t,t.resizeFilters,function(r){return t.resizeFilters=r||[],new fabric.Image(i,t,e)})})},null,t.crossOrigin)},fabric.Image.fromURL=function(t,e,i){fabric.util.loadImage(t,function(t){e&&e(new fabric.Image(t,i))},null,i&&i.crossOrigin)},fabric.Image.ATTRIBUTE_NAMES=fabric.SHARED_ATTRIBUTES.concat("x y width height preserveAspectRatio xlink:href".split(" ")),fabric.Image.fromElement=function(t,i,r){var n,s=fabric.parseAttributes(t,fabric.Image.ATTRIBUTE_NAMES);s.preserveAspectRatio&&(n=fabric.util.parsePreserveAspectRatioAttribute(s.preserveAspectRatio),e(s,n)),fabric.Image.fromURL(s["xlink:href"],i,e(r?fabric.util.object.clone(r):{},s))},fabric.Image.async=!0,fabric.Image.pngCompression=1}("undefined"!=typeof exports?exports:this),fabric.util.object.extend(fabric.Object.prototype,{_getAngleValueForStraighten:function(){var t=this.getAngle()%360;return t>0?90*Math.round((t-1)/90):90*Math.round(t/90)},straighten:function(){return this.setAngle(this._getAngleValueForStraighten()),this},fxStraighten:function(t){t=t||{};var e=function(){},i=t.onComplete||e,r=t.onChange||e,n=this;return fabric.util.animate({startValue:this.get("angle"),endValue:this._getAngleValueForStraighten(),duration:this.FX_DURATION,onChange:function(t){n.setAngle(t),r()},onComplete:function(){n.setCoords(),i()},onStart:function(){n.set("active",!1)}}),this}}),fabric.util.object.extend(fabric.StaticCanvas.prototype,{straightenObject:function(t){return t.straighten(),this.renderAll(),this},fxStraightenObject:function(t){return t.fxStraighten({onChange:this.renderAll.bind(this)}),this}}),fabric.Image.filters=fabric.Image.filters||{},fabric.Image.filters.BaseFilter=fabric.util.createClass({type:"BaseFilter",initialize:function(t){t&&this.setOptions(t)},setOptions:function(t){for(var e in t)this[e]=t[e]},toObject:function(){return{type:this.type}},toJSON:function(){return this.toObject()}}),function(t){"use strict";var e=t.fabric||(t.fabric={}),i=e.util.object.extend,r=e.Image.filters,n=e.util.createClass;r.Brightness=n(r.BaseFilter,{type:"Brightness",initialize:function(t){t=t||{},this.brightness=t.brightness||0},applyTo:function(t){for(var e=t.getContext("2d"),i=e.getImageData(0,0,t.width,t.height),r=i.data,n=this.brightness,s=0,o=r.length;s<o;s+=4)r[s]+=n,r[s+1]+=n,r[s+2]+=n;e.putImageData(i,0,0)},toObject:function(){return i(this.callSuper("toObject"),{brightness:this.brightness})}}),e.Image.filters.Brightness.fromObject=function(t){return new e.Image.filters.Brightness(t)}}("undefined"!=typeof exports?exports:this),function(t){"use strict";var e=t.fabric||(t.fabric={}),i=e.util.object.extend,r=e.Image.filters,n=e.util.createClass;r.Convolute=n(r.BaseFilter,{type:"Convolute",initialize:function(t){t=t||{},this.opaque=t.opaque,this.matrix=t.matrix||[0,0,0,0,1,0,0,0,0]},applyTo:function(t){for(var e,i,r,n,s,o,a,h,c,l=this.matrix,u=t.getContext("2d"),f=u.getImageData(0,0,t.width,t.height),d=Math.round(Math.sqrt(l.length)),g=Math.floor(d/2),p=f.data,v=f.width,b=f.height,m=u.createImageData(v,b),y=m.data,_=this.opaque?1:0,x=0;x<b;x++)for(var S=0;S<v;S++){s=4*(x*v+S),e=0,i=0,r=0,n=0;for(var C=0;C<d;C++)for(var w=0;w<d;w++)a=x+C-g,o=S+w-g,a<0||a>b||o<0||o>v||(h=4*(a*v+o),c=l[C*d+w],e+=p[h]*c,i+=p[h+1]*c,r+=p[h+2]*c,n+=p[h+3]*c);y[s]=e,y[s+1]=i,y[s+2]=r,y[s+3]=n+_*(255-n)}u.putImageData(m,0,0)},toObject:function(){return i(this.callSuper("toObject"),{opaque:this.opaque,matrix:this.matrix})}}),e.Image.filters.Convolute.fromObject=function(t){return new e.Image.filters.Convolute(t)}}("undefined"!=typeof exports?exports:this),function(t){"use strict";var e=t.fabric||(t.fabric={}),i=e.util.object.extend,r=e.Image.filters,n=e.util.createClass;r.GradientTransparency=n(r.BaseFilter,{type:"GradientTransparency",initialize:function(t){t=t||{},this.threshold=t.threshold||100},applyTo:function(t){for(var e=t.getContext("2d"),i=e.getImageData(0,0,t.width,t.height),r=i.data,n=this.threshold,s=r.length,o=0,a=r.length;o<a;o+=4)r[o+3]=n+255*(s-o)/s;e.putImageData(i,0,0)},toObject:function(){return i(this.callSuper("toObject"),{threshold:this.threshold})}}),e.Image.filters.GradientTransparency.fromObject=function(t){return new e.Image.filters.GradientTransparency(t)}}("undefined"!=typeof exports?exports:this),function(t){"use strict";var e=t.fabric||(t.fabric={}),i=e.Image.filters,r=e.util.createClass;i.Grayscale=r(i.BaseFilter,{type:"Grayscale",applyTo:function(t){for(var e,i=t.getContext("2d"),r=i.getImageData(0,0,t.width,t.height),n=r.data,s=r.width*r.height*4,o=0;o<s;)e=(n[o]+n[o+1]+n[o+2])/3,n[o]=e,n[o+1]=e,n[o+2]=e,o+=4;i.putImageData(r,0,0)}}),e.Image.filters.Grayscale.fromObject=function(){return new e.Image.filters.Grayscale}}("undefined"!=typeof exports?exports:this),function(t){"use strict";var e=t.fabric||(t.fabric={}),i=e.Image.filters,r=e.util.createClass;i.Invert=r(i.BaseFilter,{type:"Invert",applyTo:function(t){var e,i=t.getContext("2d"),r=i.getImageData(0,0,t.width,t.height),n=r.data,s=n.length;for(e=0;e<s;e+=4)n[e]=255-n[e],n[e+1]=255-n[e+1],n[e+2]=255-n[e+2];i.putImageData(r,0,0)}}),e.Image.filters.Invert.fromObject=function(){return new e.Image.filters.Invert}}("undefined"!=typeof exports?exports:this),function(t){"use strict";var e=t.fabric||(t.fabric={}),i=e.util.object.extend,r=e.Image.filters,n=e.util.createClass;r.Mask=n(r.BaseFilter,{type:"Mask",initialize:function(t){t=t||{},this.mask=t.mask,this.channel=[0,1,2,3].indexOf(t.channel)>-1?t.channel:0},applyTo:function(t){if(this.mask){var i,r=t.getContext("2d"),n=r.getImageData(0,0,t.width,t.height),s=n.data,o=this.mask.getElement(),a=e.util.createCanvasElement(),h=this.channel,c=n.width*n.height*4;a.width=t.width,a.height=t.height,a.getContext("2d").drawImage(o,0,0,t.width,t.height);var l=a.getContext("2d").getImageData(0,0,t.width,t.height),u=l.data;for(i=0;i<c;i+=4)s[i+3]=u[i+h];r.putImageData(n,0,0)}},toObject:function(){return i(this.callSuper("toObject"),{mask:this.mask.toObject(),channel:this.channel})}}),e.Image.filters.Mask.fromObject=function(t,i){e.util.loadImage(t.mask.src,function(r){t.mask=new e.Image(r,t.mask),i&&i(new e.Image.filters.Mask(t))})},e.Image.filters.Mask.async=!0}("undefined"!=typeof exports?exports:this),function(t){"use strict";var e=t.fabric||(t.fabric={}),i=e.util.object.extend,r=e.Image.filters,n=e.util.createClass;r.Noise=n(r.BaseFilter,{type:"Noise",initialize:function(t){t=t||{},this.noise=t.noise||0},applyTo:function(t){for(var e,i=t.getContext("2d"),r=i.getImageData(0,0,t.width,t.height),n=r.data,s=this.noise,o=0,a=n.length;o<a;o+=4)e=(.5-Math.random())*s,n[o]+=e,n[o+1]+=e,n[o+2]+=e;i.putImageData(r,0,0)},toObject:function(){return i(this.callSuper("toObject"),{noise:this.noise})}}),e.Image.filters.Noise.fromObject=function(t){return new e.Image.filters.Noise(t)}}("undefined"!=typeof exports?exports:this),function(t){"use strict";var e=t.fabric||(t.fabric={}),i=e.util.object.extend,r=e.Image.filters,n=e.util.createClass;r.Pixelate=n(r.BaseFilter,{type:"Pixelate",initialize:function(t){t=t||{},this.blocksize=t.blocksize||4},applyTo:function(t){var e,i,r,n,s,o,a,h=t.getContext("2d"),c=h.getImageData(0,0,t.width,t.height),l=c.data,u=c.height,f=c.width;for(i=0;i<u;i+=this.blocksize)for(r=0;r<f;r+=this.blocksize){e=4*i*f+4*r,n=l[e],s=l[e+1],o=l[e+2],a=l[e+3];for(var d=i,g=i+this.blocksize;d<g;d++)for(var p=r,v=r+this.blocksize;p<v;p++)e=4*d*f+4*p,l[e]=n,l[e+1]=s,l[e+2]=o,l[e+3]=a}h.putImageData(c,0,0)},toObject:function(){return i(this.callSuper("toObject"),{blocksize:this.blocksize})}}),e.Image.filters.Pixelate.fromObject=function(t){return new e.Image.filters.Pixelate(t)}}("undefined"!=typeof exports?exports:this),function(t){"use strict";var e=t.fabric||(t.fabric={}),i=e.util.object.extend,r=e.Image.filters,n=e.util.createClass;r.RemoveWhite=n(r.BaseFilter,{type:"RemoveWhite",initialize:function(t){t=t||{},this.threshold=t.threshold||30,this.distance=t.distance||20},applyTo:function(t){for(var e,i,r,n=t.getContext("2d"),s=n.getImageData(0,0,t.width,t.height),o=s.data,a=this.threshold,h=this.distance,c=255-a,l=Math.abs,u=0,f=o.length;u<f;u+=4)e=o[u],i=o[u+1],r=o[u+2],e>c&&i>c&&r>c&&l(e-i)<h&&l(e-r)<h&&l(i-r)<h&&(o[u+3]=0);n.putImageData(s,0,0)},toObject:function(){return i(this.callSuper("toObject"),{threshold:this.threshold,distance:this.distance})}}),e.Image.filters.RemoveWhite.fromObject=function(t){return new e.Image.filters.RemoveWhite(t)}}("undefined"!=typeof exports?exports:this),function(t){"use strict";var e=t.fabric||(t.fabric={}),i=e.Image.filters,r=e.util.createClass;i.Sepia=r(i.BaseFilter,{type:"Sepia",applyTo:function(t){var e,i,r=t.getContext("2d"),n=r.getImageData(0,0,t.width,t.height),s=n.data,o=s.length;for(e=0;e<o;e+=4)i=.3*s[e]+.59*s[e+1]+.11*s[e+2],s[e]=i+100,s[e+1]=i+50,s[e+2]=i+255;r.putImageData(n,0,0)}}),e.Image.filters.Sepia.fromObject=function(){return new e.Image.filters.Sepia}}("undefined"!=typeof exports?exports:this),function(t){"use strict";var e=t.fabric||(t.fabric={}),i=e.Image.filters,r=e.util.createClass;i.Sepia2=r(i.BaseFilter,{type:"Sepia2",applyTo:function(t){var e,i,r,n,s=t.getContext("2d"),o=s.getImageData(0,0,t.width,t.height),a=o.data,h=a.length;for(e=0;e<h;e+=4)i=a[e],r=a[e+1],n=a[e+2],a[e]=(.393*i+.769*r+.189*n)/1.351,a[e+1]=(.349*i+.686*r+.168*n)/1.203,a[e+2]=(.272*i+.534*r+.131*n)/2.14;s.putImageData(o,0,0)}}),e.Image.filters.Sepia2.fromObject=function(){return new e.Image.filters.Sepia2}}("undefined"!=typeof exports?exports:this),function(t){"use strict";var e=t.fabric||(t.fabric={}),i=e.util.object.extend,r=e.Image.filters,n=e.util.createClass;r.Tint=n(r.BaseFilter,{type:"Tint",initialize:function(t){t=t||{},this.color=t.color||"#000000",this.opacity="undefined"!=typeof t.opacity?t.opacity:new e.Color(this.color).getAlpha()},applyTo:function(t){var i,r,n,s,o,a,h,c,l,u=t.getContext("2d"),f=u.getImageData(0,0,t.width,t.height),d=f.data,g=d.length;for(l=new e.Color(this.color).getSource(),r=l[0]*this.opacity,n=l[1]*this.opacity,s=l[2]*this.opacity,c=1-this.opacity,i=0;i<g;i+=4)o=d[i],a=d[i+1],h=d[i+2],d[i]=r+o*c,d[i+1]=n+a*c,d[i+2]=s+h*c;u.putImageData(f,0,0)},toObject:function(){return i(this.callSuper("toObject"),{color:this.color,opacity:this.opacity})}}),e.Image.filters.Tint.fromObject=function(t){return new e.Image.filters.Tint(t)}}("undefined"!=typeof exports?exports:this),function(t){"use strict";var e=t.fabric||(t.fabric={}),i=e.util.object.extend,r=e.Image.filters,n=e.util.createClass;r.Multiply=n(r.BaseFilter,{type:"Multiply",initialize:function(t){t=t||{},this.color=t.color||"#000000"},applyTo:function(t){var i,r,n=t.getContext("2d"),s=n.getImageData(0,0,t.width,t.height),o=s.data,a=o.length;for(r=new e.Color(this.color).getSource(),i=0;i<a;i+=4)o[i]*=r[0]/255,o[i+1]*=r[1]/255,o[i+2]*=r[2]/255;n.putImageData(s,0,0)},toObject:function(){return i(this.callSuper("toObject"),{color:this.color})}}),e.Image.filters.Multiply.fromObject=function(t){return new e.Image.filters.Multiply(t)}}("undefined"!=typeof exports?exports:this),function(t){"use strict";var e=t.fabric,i=e.Image.filters,r=e.util.createClass;i.Blend=r(i.BaseFilter,{type:"Blend",initialize:function(t){t=t||{},this.color=t.color||"#000",this.image=t.image||!1,this.mode=t.mode||"multiply",this.alpha=t.alpha||1},applyTo:function(t){var i,r,n,s,o,a,h,c,l,u,f=t.getContext("2d"),d=f.getImageData(0,0,t.width,t.height),g=d.data,p=!1;if(this.image){p=!0;var v=e.util.createCanvasElement();v.width=this.image.width,v.height=this.image.height;var b=new e.StaticCanvas(v);b.add(this.image);var m=b.getContext("2d");u=m.getImageData(0,0,b.width,b.height).data}else u=new e.Color(this.color).getSource(),i=u[0]*this.alpha,r=u[1]*this.alpha,n=u[2]*this.alpha;for(var y=0,_=g.length;y<_;y+=4)switch(s=g[y],o=g[y+1],a=g[y+2],p&&(i=u[y]*this.alpha,r=u[y+1]*this.alpha,n=u[y+2]*this.alpha),this.mode){case"multiply":g[y]=s*i/255,g[y+1]=o*r/255,g[y+2]=a*n/255;break;case"screen":g[y]=1-(1-s)*(1-i),g[y+1]=1-(1-o)*(1-r),g[y+2]=1-(1-a)*(1-n);break;case"add":g[y]=Math.min(255,s+i),g[y+1]=Math.min(255,o+r),g[y+2]=Math.min(255,a+n);break;case"diff":case"difference":g[y]=Math.abs(s-i),g[y+1]=Math.abs(o-r),g[y+2]=Math.abs(a-n);break;case"subtract":h=s-i,c=o-r,l=a-n,g[y]=h<0?0:h,g[y+1]=c<0?0:c,g[y+2]=l<0?0:l;break;case"darken":g[y]=Math.min(s,i),g[y+1]=Math.min(o,r),g[y+2]=Math.min(a,n);break;case"lighten":g[y]=Math.max(s,i),g[y+1]=Math.max(o,r),g[y+2]=Math.max(a,n)}f.putImageData(d,0,0)},toObject:function(){return{color:this.color,image:this.image,mode:this.mode,alpha:this.alpha}}}),e.Image.filters.Blend.fromObject=function(t){return new e.Image.filters.Blend(t)}}("undefined"!=typeof exports?exports:this),function(t){"use strict";var e=t.fabric||(t.fabric={}),i=Math.pow,r=Math.floor,n=Math.sqrt,s=Math.abs,o=Math.max,a=Math.round,h=Math.sin,c=Math.ceil,l=e.Image.filters,u=e.util.createClass;l.Resize=u(l.BaseFilter,{type:"Resize",resizeType:"hermite",scaleX:0,scaleY:0,lanczosLobes:3,applyTo:function(t,e,i){if(1!==e||1!==i){this.rcpScaleX=1/e,this.rcpScaleY=1/i;var r,n=t.width,s=t.height,o=a(n*e),h=a(s*i);"sliceHack"===this.resizeType&&(r=this.sliceByTwo(t,n,s,o,h)),"hermite"===this.resizeType&&(r=this.hermiteFastResize(t,n,s,o,h)),"bilinear"===this.resizeType&&(r=this.bilinearFiltering(t,n,s,o,h)),"lanczos"===this.resizeType&&(r=this.lanczosResize(t,n,s,o,h)),t.width=o,t.height=h,t.getContext("2d").putImageData(r,0,0)}},sliceByTwo:function(t,i,n,s,a){var h,c=t.getContext("2d"),l=.5,u=.5,f=1,d=1,g=!1,p=!1,v=i,b=n,m=e.util.createCanvasElement(),y=m.getContext("2d");for(s=r(s),a=r(a),m.width=o(s,i),m.height=o(a,n),s>i&&(l=2,f=-1),a>n&&(u=2,d=-1),h=c.getImageData(0,0,i,n),t.width=o(s,i),t.height=o(a,n),c.putImageData(h,0,0);!g||!p;)i=v,n=b,s*f<r(v*l*f)?v=r(v*l):(v=s,g=!0),a*d<r(b*u*d)?b=r(b*u):(b=a,p=!0),h=c.getImageData(0,0,i,n),y.putImageData(h,0,0),c.clearRect(0,0,v,b),c.drawImage(m,0,0,i,n,0,0,v,b);return c.getImageData(0,0,s,a)},lanczosResize:function(t,e,o,a,l){function u(t){return function(e){if(e>t)return 0;if(e*=Math.PI,s(e)<1e-16)return 1;var i=e/t;return h(e)*h(i)/e/i}}function f(t){var h,c,u,d,g,j,M,A,P,I,E;for(T.x=(t+.5)*y,k.x=r(T.x),h=0;h<l;h++){for(T.y=(h+.5)*_,k.y=r(T.y),g=0,j=0,M=0,A=0,P=0,c=k.x-C;c<=k.x+C;c++)if(!(c<0||c>=e)){I=r(1e3*s(c-T.x)),O[I]||(O[I]={});for(var D=k.y-w;D<=k.y+w;D++)D<0||D>=o||(E=r(1e3*s(D-T.y)),O[I][E]||(O[I][E]=m(n(i(I*x,2)+i(E*S,2))/1e3)),u=O[I][E],u>0&&(d=4*(D*e+c),g+=u,j+=u*v[d],M+=u*v[d+1],A+=u*v[d+2],P+=u*v[d+3]))}d=4*(h*a+t),b[d]=j/g,b[d+1]=M/g,b[d+2]=A/g,b[d+3]=P/g}return++t<a?f(t):p}var d=t.getContext("2d"),g=d.getImageData(0,0,e,o),p=d.getImageData(0,0,a,l),v=g.data,b=p.data,m=u(this.lanczosLobes),y=this.rcpScaleX,_=this.rcpScaleY,x=2/this.rcpScaleX,S=2/this.rcpScaleY,C=c(y*this.lanczosLobes/2),w=c(_*this.lanczosLobes/2),O={},T={},k={};return f(0)},bilinearFiltering:function(t,e,i,n,s){var o,a,h,c,l,u,f,d,g,p,v,b,m,y=0,_=this.rcpScaleX,x=this.rcpScaleY,S=t.getContext("2d"),C=4*(e-1),w=S.getImageData(0,0,e,i),O=w.data,T=S.getImageData(0,0,n,s),k=T.data;for(f=0;f<s;f++)for(d=0;d<n;d++)for(l=r(_*d),u=r(x*f),g=_*d-l,p=x*f-u,m=4*(u*e+l),v=0;v<4;v++)o=O[m+v],a=O[m+4+v],h=O[m+C+v],c=O[m+C+4+v],b=o*(1-g)*(1-p)+a*g*(1-p)+h*p*(1-g)+c*g*p,k[y++]=b;return T},hermiteFastResize:function(t,e,i,o,a){for(var h=this.rcpScaleX,l=this.rcpScaleY,u=c(h/2),f=c(l/2),d=t.getContext("2d"),g=d.getImageData(0,0,e,i),p=g.data,v=d.getImageData(0,0,o,a),b=v.data,m=0;m<a;m++)for(var y=0;y<o;y++){for(var _=4*(y+m*o),x=0,S=0,C=0,w=0,O=0,T=0,k=0,j=(m+.5)*l,M=r(m*l);M<(m+1)*l;M++)for(var A=s(j-(M+.5))/f,P=(y+.5)*h,I=A*A,E=r(y*h);E<(y+1)*h;E++){var D=s(P-(E+.5))/u,L=n(I+D*D);L>1&&L<-1||(x=2*L*L*L-3*L*L+1,x>0&&(D=4*(E+M*e),k+=x*p[D+3],C+=x,p[D+3]<255&&(x=x*p[D+3]/250),w+=x*p[D],O+=x*p[D+1],T+=x*p[D+2],S+=x))}b[_]=w/S,b[_+1]=O/S,b[_+2]=T/S,b[_+3]=k/C}return v},toObject:function(){return{type:this.type,scaleX:this.scaleX,scaleY:this.scaleY,resizeType:this.resizeType,lanczosLobes:this.lanczosLobes}}}),e.Image.filters.Resize.fromObject=function(t){return new e.Image.filters.Resize(t)}}("undefined"!=typeof exports?exports:this),function(t){"use strict";var e=t.fabric||(t.fabric={}),i=e.util.object.extend,r=e.Image.filters,n=e.util.createClass;r.ColorMatrix=n(r.BaseFilter,{type:"ColorMatrix",initialize:function(t){t||(t={}),this.matrix=t.matrix||[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0]},applyTo:function(t){var e,i,r,n,s,o=t.getContext("2d"),a=o.getImageData(0,0,t.width,t.height),h=a.data,c=h.length,l=this.matrix;for(e=0;e<c;e+=4)i=h[e],r=h[e+1],n=h[e+2],s=h[e+3],h[e]=i*l[0]+r*l[1]+n*l[2]+s*l[3]+l[4],h[e+1]=i*l[5]+r*l[6]+n*l[7]+s*l[8]+l[9],h[e+2]=i*l[10]+r*l[11]+n*l[12]+s*l[13]+l[14],h[e+3]=i*l[15]+r*l[16]+n*l[17]+s*l[18]+l[19];o.putImageData(a,0,0)},toObject:function(){return i(this.callSuper("toObject"),{type:this.type,matrix:this.matrix})}}),e.Image.filters.ColorMatrix.fromObject=function(t){return new e.Image.filters.ColorMatrix(t)}}("undefined"!=typeof exports?exports:this),function(t){"use strict";var e=t.fabric||(t.fabric={}),i=e.util.object.extend,r=e.Image.filters,n=e.util.createClass;r.Contrast=n(r.BaseFilter,{type:"Contrast",initialize:function(t){t=t||{},this.contrast=t.contrast||0},applyTo:function(t){for(var e=t.getContext("2d"),i=e.getImageData(0,0,t.width,t.height),r=i.data,n=259*(this.contrast+255)/(255*(259-this.contrast)),s=0,o=r.length;s<o;s+=4)r[s]=n*(r[s]-128)+128,r[s+1]=n*(r[s+1]-128)+128,r[s+2]=n*(r[s+2]-128)+128;e.putImageData(i,0,0)},toObject:function(){return i(this.callSuper("toObject"),{contrast:this.contrast})}}),e.Image.filters.Contrast.fromObject=function(t){return new e.Image.filters.Contrast(t)}}("undefined"!=typeof exports?exports:this),function(t){"use strict";var e=t.fabric||(t.fabric={}),i=e.util.object.extend,r=e.Image.filters,n=e.util.createClass;r.Saturate=n(r.BaseFilter,{type:"Saturate",initialize:function(t){t=t||{},this.saturate=t.saturate||0},applyTo:function(t){for(var e,i=t.getContext("2d"),r=i.getImageData(0,0,t.width,t.height),n=r.data,s=.01*-this.saturate,o=0,a=n.length;o<a;o+=4)e=Math.max(n[o],n[o+1],n[o+2]),
n[o]+=e!==n[o]?(e-n[o])*s:0,n[o+1]+=e!==n[o+1]?(e-n[o+1])*s:0,n[o+2]+=e!==n[o+2]?(e-n[o+2])*s:0;i.putImageData(r,0,0)},toObject:function(){return i(this.callSuper("toObject"),{saturate:this.saturate})}}),e.Image.filters.Saturate.fromObject=function(t){return new e.Image.filters.Saturate(t)}}("undefined"!=typeof exports?exports:this),function(t){"use strict";var e=t.fabric||(t.fabric={}),i=e.util.object.clone,r=e.util.toFixed,n=e.Object.NUM_FRACTION_DIGITS,s=2;if(e.Text)return void e.warn("fabric.Text is already defined");var o=e.Object.prototype.stateProperties.concat();o.push("fontFamily","fontWeight","fontSize","text","textDecoration","textAlign","fontStyle","lineHeight","textBackgroundColor"),e.Text=e.util.createClass(e.Object,{_dimensionAffectingProps:{fontSize:!0,fontWeight:!0,fontFamily:!0,fontStyle:!0,lineHeight:!0,text:!0,charSpacing:!0,textAlign:!0,strokeWidth:!1},_reNewline:/\r?\n/,_reSpacesAndTabs:/[ \t\r]+/g,type:"text",fontSize:40,fontWeight:"normal",fontFamily:"Times New Roman",textDecoration:"",textAlign:"left",fontStyle:"",lineHeight:1.16,textBackgroundColor:"",stateProperties:o,stroke:null,shadow:null,_fontSizeFraction:.25,_fontSizeMult:1.13,charSpacing:0,initialize:function(t,e){e=e||{},this.text=t,this.__skipDimension=!0,this.setOptions(e),this.__skipDimension=!1,this._initDimensions()},_initDimensions:function(t){this.__skipDimension||(t||(t=e.util.createCanvasElement().getContext("2d"),this._setTextStyles(t)),this._textLines=this._splitTextIntoLines(),this._clearCache(),this.width=this._getTextWidth(t)||this.cursorWidth||s,this.height=this._getTextHeight(t))},toString:function(){return"#<fabric.Text ("+this.complexity()+'): { "text": "'+this.text+'", "fontFamily": "'+this.fontFamily+'" }>'},_render:function(t){this.clipTo&&e.util.clipContext(this,t),this._setOpacity(t),this._setShadow(t),this._setupCompositeOperation(t),this._renderTextBackground(t),this._setStrokeStyles(t),this._setFillStyles(t),this._renderText(t),this._renderTextDecoration(t),this.clipTo&&t.restore()},_renderText:function(t){this._renderTextFill(t),this._renderTextStroke(t)},_setTextStyles:function(t){t.textBaseline="alphabetic",t.font=this._getFontDeclaration()},_getTextHeight:function(){return this._getHeightOfSingleLine()+(this._textLines.length-1)*this._getHeightOfLine()},_getTextWidth:function(t){for(var e=this._getLineWidth(t,0),i=1,r=this._textLines.length;i<r;i++){var n=this._getLineWidth(t,i);n>e&&(e=n)}return e},_getNonTransformedDimensions:function(){return{x:this.width,y:this.height}},_renderChars:function(t,e,i,r,n){var s,o,a=t.slice(0,-4);if(this[a].toLive){var h=-this.width/2+this[a].offsetX||0,c=-this.height/2+this[a].offsetY||0;e.save(),e.translate(h,c),r-=h,n-=c}if(0!==this.charSpacing){var l=this._getWidthOfCharSpacing();i=i.split("");for(var u=0,f=i.length;u<f;u++)s=i[u],o=e.measureText(s).width+l,e[t](s,r,n),r+=o>0?o:0}else e[t](i,r,n);this[a].toLive&&e.restore()},_renderTextLine:function(t,e,i,r,n,s){n-=this.fontSize*this._fontSizeFraction;var o=this._getLineWidth(e,s);if("justify"!==this.textAlign||this.width<o)return void this._renderChars(t,e,i,r,n,s);for(var a,h=i.split(/\s+/),c=0,l=this._getWidthOfWords(e,h.join(" "),s,0),u=this.width-l,f=h.length-1,d=f>0?u/f:0,g=0,p=0,v=h.length;p<v;p++){for(;" "===i[c]&&c<i.length;)c++;a=h[p],this._renderChars(t,e,a,r+g,n,s,c),g+=this._getWidthOfWords(e,a,s,c)+d,c+=a.length}},_getWidthOfWords:function(t,e){var i,r,n=t.measureText(e).width;return 0!==this.charSpacing&&(i=e.split("").length,r=i*this._getWidthOfCharSpacing(),n+=r),n>0?n:0},_getLeftOffset:function(){return-this.width/2},_getTopOffset:function(){return-this.height/2},isEmptyStyles:function(){return!0},_renderTextCommon:function(t,e){for(var i=0,r=this._getLeftOffset(),n=this._getTopOffset(),s=0,o=this._textLines.length;s<o;s++){var a=this._getHeightOfLine(t,s),h=a/this.lineHeight,c=this._getLineWidth(t,s),l=this._getLineLeftOffset(c);this._renderTextLine(e,t,this._textLines[s],r+l,n+i+h,s),i+=a}},_renderTextFill:function(t){!this.fill&&this.isEmptyStyles()||this._renderTextCommon(t,"fillText")},_renderTextStroke:function(t){(this.stroke&&0!==this.strokeWidth||!this.isEmptyStyles())&&(this.shadow&&!this.shadow.affectStroke&&this._removeShadow(t),t.save(),this._setLineDash(t,this.strokedashArray),t.beginPath(),this._renderTextCommon(t,"strokeText"),t.closePath(),t.restore())},_getHeightOfLine:function(){return this._getHeightOfSingleLine()*this.lineHeight},_getHeightOfSingleLine:function(){return this.fontSize*this._fontSizeMult},_renderTextBackground:function(t){this._renderBackground(t),this._renderTextLinesBackground(t)},_renderTextLinesBackground:function(t){if(this.textBackgroundColor){var e,i,r,n=0;t.fillStyle=this.textBackgroundColor;for(var s=0,o=this._textLines.length;s<o;s++)e=this._getHeightOfLine(t,s),i=this._getLineWidth(t,s),i>0&&(r=this._getLineLeftOffset(i),t.fillRect(this._getLeftOffset()+r,this._getTopOffset()+n,i,e/this.lineHeight)),n+=e;this._removeShadow(t)}},_getLineLeftOffset:function(t){return"center"===this.textAlign?(this.width-t)/2:"right"===this.textAlign?this.width-t:0},_clearCache:function(){this.__lineWidths=[],this.__lineHeights=[]},_shouldClearCache:function(){var t=!1;if(this._forceClearCache)return this._forceClearCache=!1,!0;for(var e in this._dimensionAffectingProps)this["__"+e]!==this[e]&&(this["__"+e]=this[e],t=!0);return t},_getLineWidth:function(t,e){if(this.__lineWidths[e])return this.__lineWidths[e]===-1?this.width:this.__lineWidths[e];var i,r,n=this._textLines[e];return i=""===n?0:this._measureLine(t,e),this.__lineWidths[e]=i,i&&"justify"===this.textAlign&&(r=n.split(/\s+/),r.length>1&&(this.__lineWidths[e]=-1)),i},_getWidthOfCharSpacing:function(){return 0!==this.charSpacing?this.fontSize*this.charSpacing/1e3:0},_measureLine:function(t,e){var i,r,n=this._textLines[e],s=t.measureText(n).width,o=0;return 0!==this.charSpacing&&(i=n.split("").length,o=(i-1)*this._getWidthOfCharSpacing()),r=s+o,r>0?r:0},_renderTextDecoration:function(t){function e(e){var n,s,o,a,h,c,l,u=0;for(n=0,s=r._textLines.length;n<s;n++){for(h=r._getLineWidth(t,n),c=r._getLineLeftOffset(h),l=r._getHeightOfLine(t,n),o=0,a=e.length;o<a;o++)t.fillRect(r._getLeftOffset()+c,u+(r._fontSizeMult-1+e[o])*r.fontSize-i,h,r.fontSize/15);u+=l}}if(this.textDecoration){var i=this.height/2,r=this,n=[];this.textDecoration.indexOf("underline")>-1&&n.push(.85),this.textDecoration.indexOf("line-through")>-1&&n.push(.43),this.textDecoration.indexOf("overline")>-1&&n.push(-.12),n.length>0&&e(n)}},_getFontDeclaration:function(){return[e.isLikelyNode?this.fontWeight:this.fontStyle,e.isLikelyNode?this.fontStyle:this.fontWeight,this.fontSize+"px",e.isLikelyNode?'"'+this.fontFamily+'"':this.fontFamily].join(" ")},render:function(t,e){this.visible&&(t.save(),this._setTextStyles(t),this._shouldClearCache()&&this._initDimensions(t),this.drawSelectionBackground(t),e||this.transform(t),this.transformMatrix&&t.transform.apply(t,this.transformMatrix),this.group&&"path-group"===this.group.type&&t.translate(this.left,this.top),this._render(t),t.restore())},_splitTextIntoLines:function(){return this.text.split(this._reNewline)},toObject:function(t){var e=["text","fontSize","fontWeight","fontFamily","fontStyle","lineHeight","textDecoration","textAlign","textBackgroundColor","charSpacing"].concat(t);return this.callSuper("toObject",e)},toSVG:function(t){this.ctx||(this.ctx=e.util.createCanvasElement().getContext("2d"));var i=this._createBaseSVGMarkup(),r=this._getSVGLeftTopOffsets(this.ctx),n=this._getSVGTextAndBg(r.textTop,r.textLeft);return this._wrapSVGTextAndBg(i,n),t?t(i.join("")):i.join("")},_getSVGLeftTopOffsets:function(t){var e=this._getHeightOfLine(t,0),i=-this.width/2,r=0;return{textLeft:i+(this.group&&"path-group"===this.group.type?this.left:0),textTop:r+(this.group&&"path-group"===this.group.type?-this.top:0),lineTop:e}},_wrapSVGTextAndBg:function(t,e){var i=!0,r=this.getSvgFilter(),n=""===r?"":' style="'+r+'"';t.push("\t<g ",this.getSvgId(),'transform="',this.getSvgTransform(),this.getSvgTransformMatrix(),'"',n,">\n",e.textBgRects.join(""),"\t\t<text ",this.fontFamily?'font-family="'+this.fontFamily.replace(/"/g,"'")+'" ':"",this.fontSize?'font-size="'+this.fontSize+'" ':"",this.fontStyle?'font-style="'+this.fontStyle+'" ':"",this.fontWeight?'font-weight="'+this.fontWeight+'" ':"",this.textDecoration?'text-decoration="'+this.textDecoration+'" ':"",'style="',this.getSvgStyles(i),'" >\n',e.textSpans.join(""),"\t\t</text>\n","\t</g>\n")},_getSVGTextAndBg:function(t,e){var i=[],r=[],n=0;this._setSVGBg(r);for(var s=0,o=this._textLines.length;s<o;s++)this.textBackgroundColor&&this._setSVGTextLineBg(r,s,e,t,n),this._setSVGTextLineText(s,i,n,e,t,r),n+=this._getHeightOfLine(this.ctx,s);return{textSpans:i,textBgRects:r}},_setSVGTextLineText:function(t,i,s,o,a){var h=this.fontSize*(this._fontSizeMult-this._fontSizeFraction)-a+s-this.height/2;return"justify"===this.textAlign?void this._setSVGTextLineJustifed(t,i,h,o):void i.push('\t\t\t<tspan x="',r(o+this._getLineLeftOffset(this._getLineWidth(this.ctx,t)),n),'" ','y="',r(h,n),'" ',this._getFillAttributes(this.fill),">",e.util.string.escapeXml(this._textLines[t]),"</tspan>\n")},_setSVGTextLineJustifed:function(t,i,s,o){var a=e.util.createCanvasElement().getContext("2d");this._setTextStyles(a);var h,c,l=this._textLines[t],u=l.split(/\s+/),f=this._getWidthOfWords(a,u.join("")),d=this.width-f,g=u.length-1,p=g>0?d/g:0,v=this._getFillAttributes(this.fill);for(o+=this._getLineLeftOffset(this._getLineWidth(a,t)),t=0,c=u.length;t<c;t++)h=u[t],i.push('\t\t\t<tspan x="',r(o,n),'" ','y="',r(s,n),'" ',v,">",e.util.string.escapeXml(h),"</tspan>\n"),o+=this._getWidthOfWords(a,h)+p},_setSVGTextLineBg:function(t,e,i,s,o){t.push("\t\t<rect ",this._getFillAttributes(this.textBackgroundColor),' x="',r(i+this._getLineLeftOffset(this._getLineWidth(this.ctx,e)),n),'" y="',r(o-this.height/2,n),'" width="',r(this._getLineWidth(this.ctx,e),n),'" height="',r(this._getHeightOfLine(this.ctx,e)/this.lineHeight,n),'"></rect>\n')},_setSVGBg:function(t){this.backgroundColor&&t.push("\t\t<rect ",this._getFillAttributes(this.backgroundColor),' x="',r(-this.width/2,n),'" y="',r(-this.height/2,n),'" width="',r(this.width,n),'" height="',r(this.height,n),'"></rect>\n')},_getFillAttributes:function(t){var i=t&&"string"==typeof t?new e.Color(t):"";return i&&i.getSource()&&1!==i.getAlpha()?'opacity="'+i.getAlpha()+'" fill="'+i.setAlpha(1).toRgb()+'"':'fill="'+t+'"'},_set:function(t,e){this.callSuper("_set",t,e),t in this._dimensionAffectingProps&&(this._initDimensions(),this.setCoords())},complexity:function(){return 1}}),e.Text.ATTRIBUTE_NAMES=e.SHARED_ATTRIBUTES.concat("x y dx dy font-family font-style font-weight font-size text-decoration text-anchor".split(" ")),e.Text.DEFAULT_SVG_FONT_SIZE=16,e.Text.fromElement=function(t,i){if(!t)return null;var r=e.parseAttributes(t,e.Text.ATTRIBUTE_NAMES);i=e.util.object.extend(i?e.util.object.clone(i):{},r),i.top=i.top||0,i.left=i.left||0,"dx"in r&&(i.left+=r.dx),"dy"in r&&(i.top+=r.dy),"fontSize"in i||(i.fontSize=e.Text.DEFAULT_SVG_FONT_SIZE),i.originX||(i.originX="left");var n="";"textContent"in t?n=t.textContent:"firstChild"in t&&null!==t.firstChild&&"data"in t.firstChild&&null!==t.firstChild.data&&(n=t.firstChild.data),n=n.replace(/^\s+|\s+$|\n+/g,"").replace(/\s+/g," ");var s=new e.Text(n,i),o=s.getHeight()/s.height,a=(s.height+s.strokeWidth)*s.lineHeight-s.height,h=a*o,c=s.getHeight()+h,l=0;return"left"===s.originX&&(l=s.getWidth()/2),"right"===s.originX&&(l=-s.getWidth()/2),s.set({left:s.getLeft()+l,top:s.getTop()-c/2+s.fontSize*(.18+s._fontSizeFraction)/s.lineHeight}),s},e.Text.fromObject=function(t,r){var n=new e.Text(t.text,i(t));return r&&r(n),n},e.util.createAccessors(e.Text)}("undefined"!=typeof exports?exports:this),function(){var t=fabric.util.object.clone;fabric.IText=fabric.util.createClass(fabric.Text,fabric.Observable,{type:"i-text",selectionStart:0,selectionEnd:0,selectionColor:"rgba(17,119,255,0.3)",isEditing:!1,editable:!0,editingBorderColor:"rgba(102,153,255,0.25)",cursorWidth:2,cursorColor:"#333",cursorDelay:1e3,cursorDuration:600,styles:null,caching:!0,_reSpace:/\s|\n/,_currentCursorOpacity:0,_selectionDirection:null,_abortCursorAnimation:!1,__widthOfSpace:[],initialize:function(t,e){this.styles=e?e.styles||{}:{},this.callSuper("initialize",t,e),this.initBehavior()},_clearCache:function(){this.callSuper("_clearCache"),this.__widthOfSpace=[]},isEmptyStyles:function(){if(!this.styles)return!0;var t=this.styles;for(var e in t)for(var i in t[e])for(var r in t[e][i])return!1;return!0},setSelectionStart:function(t){t=Math.max(t,0),this._updateAndFire("selectionStart",t)},setSelectionEnd:function(t){t=Math.min(t,this.text.length),this._updateAndFire("selectionEnd",t)},_updateAndFire:function(t,e){this[t]!==e&&(this._fireSelectionChanged(),this[t]=e),this._updateTextarea()},_fireSelectionChanged:function(){this.fire("selection:changed"),this.canvas&&this.canvas.fire("text:selection:changed",{target:this})},getSelectionStyles:function(t,e){if(2===arguments.length){for(var i=[],r=t;r<e;r++)i.push(this.getSelectionStyles(r));return i}var n=this.get2DCursorLocation(t),s=this._getStyleDeclaration(n.lineIndex,n.charIndex);return s||{}},setSelectionStyles:function(t){if(this.selectionStart===this.selectionEnd)this._extendStyles(this.selectionStart,t);else for(var e=this.selectionStart;e<this.selectionEnd;e++)this._extendStyles(e,t);return this._forceClearCache=!0,this},_extendStyles:function(t,e){var i=this.get2DCursorLocation(t);this._getLineStyle(i.lineIndex)||this._setLineStyle(i.lineIndex,{}),this._getStyleDeclaration(i.lineIndex,i.charIndex)||this._setStyleDeclaration(i.lineIndex,i.charIndex,{}),fabric.util.object.extend(this._getStyleDeclaration(i.lineIndex,i.charIndex),e)},render:function(t,e){this.clearContextTop(),this.callSuper("render",t,e)},_render:function(t){this.callSuper("_render",t),this.ctx=t,this.cursorOffsetCache={},this.renderCursorOrSelection()},clearContextTop:function(){if(this.active&&this.isEditing&&this.canvas&&this.canvas.contextTop){var t=this.canvas.contextTop;t.save(),t.transform.apply(t,this.canvas.viewportTransform),this.transform(t),this.transformMatrix&&t.transform.apply(t,this.transformMatrix),this._clearTextArea(t),t.restore()}},renderCursorOrSelection:function(){if(this.active&&this.isEditing){var t,e,i=this.text.split("");this.canvas&&this.canvas.contextTop?(e=this.canvas.contextTop,e.save(),e.transform.apply(e,this.canvas.viewportTransform),this.transform(e),this.transformMatrix&&e.transform.apply(e,this.transformMatrix),this._clearTextArea(e)):(e=this.ctx,e.save()),this.selectionStart===this.selectionEnd?(t=this._getCursorBoundaries(i,"cursor"),this.renderCursor(t,e)):(t=this._getCursorBoundaries(i,"selection"),this.renderSelection(i,t,e)),e.restore()}},_clearTextArea:function(t){var e=this.width+4,i=this.height+4;t.clearRect(-e/2,-i/2,e,i)},get2DCursorLocation:function(t){"undefined"==typeof t&&(t=this.selectionStart);for(var e=this._textLines.length,i=0;i<e;i++){if(t<=this._textLines[i].length)return{lineIndex:i,charIndex:t};t-=this._textLines[i].length+1}return{lineIndex:i-1,charIndex:this._textLines[i-1].length<t?this._textLines[i-1].length:t}},getCurrentCharStyle:function(t,e){var i=this._getStyleDeclaration(t,0===e?0:e-1);return{fontSize:i&&i.fontSize||this.fontSize,fill:i&&i.fill||this.fill,textBackgroundColor:i&&i.textBackgroundColor||this.textBackgroundColor,textDecoration:i&&i.textDecoration||this.textDecoration,fontFamily:i&&i.fontFamily||this.fontFamily,fontWeight:i&&i.fontWeight||this.fontWeight,fontStyle:i&&i.fontStyle||this.fontStyle,stroke:i&&i.stroke||this.stroke,strokeWidth:i&&i.strokeWidth||this.strokeWidth}},getCurrentCharFontSize:function(t,e){var i=this._getStyleDeclaration(t,0===e?0:e-1);return i&&i.fontSize?i.fontSize:this.fontSize},getCurrentCharColor:function(t,e){var i=this._getStyleDeclaration(t,0===e?0:e-1);return i&&i.fill?i.fill:this.cursorColor},_getCursorBoundaries:function(t,e){var i=Math.round(this._getLeftOffset()),r=this._getTopOffset(),n=this._getCursorBoundariesOffsets(t,e);return{left:i,top:r,leftOffset:n.left+n.lineLeft,topOffset:n.top}},_getCursorBoundariesOffsets:function(t,e){if(this.cursorOffsetCache&&"top"in this.cursorOffsetCache)return this.cursorOffsetCache;for(var i,r=0,n=0,s=0,o=0,a=0,h=0;h<this.selectionStart;h++)"\n"===t[h]?(a=0,o+=this._getHeightOfLine(this.ctx,n),n++,s=0):(a+=this._getWidthOfChar(this.ctx,t[h],n,s),s++),r=this._getLineLeftOffset(this._getLineWidth(this.ctx,n));return"cursor"===e&&(o+=(1-this._fontSizeFraction)*this._getHeightOfLine(this.ctx,n)/this.lineHeight-this.getCurrentCharFontSize(n,s)*(1-this._fontSizeFraction)),0!==this.charSpacing&&s===this._textLines[n].length&&(a-=this._getWidthOfCharSpacing()),i={top:o,left:a>0?a:0,lineLeft:r},this.cursorOffsetCache=i,this.cursorOffsetCache},renderCursor:function(t,e){var i=this.get2DCursorLocation(),r=i.lineIndex,n=i.charIndex,s=this.getCurrentCharFontSize(r,n),o=0===r&&0===n?this._getLineLeftOffset(this._getLineWidth(e,r)):t.leftOffset,a=this.scaleX*this.canvas.getZoom(),h=this.cursorWidth/a;e.fillStyle=this.getCurrentCharColor(r,n),e.globalAlpha=this.__isMousedown?1:this._currentCursorOpacity,e.fillRect(t.left+o-h/2,t.top+t.topOffset,h,s)},renderSelection:function(t,e,i){i.fillStyle=this.selectionColor;for(var r=this.get2DCursorLocation(this.selectionStart),n=this.get2DCursorLocation(this.selectionEnd),s=r.lineIndex,o=n.lineIndex,a=s;a<=o;a++){var h=this._getLineLeftOffset(this._getLineWidth(i,a))||0,c=this._getHeightOfLine(this.ctx,a),l=0,u=0,f=this._textLines[a];if(a===s){for(var d=0,g=f.length;d<g;d++)d>=r.charIndex&&(a!==o||d<n.charIndex)&&(u+=this._getWidthOfChar(i,f[d],a,d)),d<r.charIndex&&(h+=this._getWidthOfChar(i,f[d],a,d));d===f.length&&(u-=this._getWidthOfCharSpacing())}else if(a>s&&a<o)u+=this._getLineWidth(i,a)||5;else if(a===o){for(var p=0,v=n.charIndex;p<v;p++)u+=this._getWidthOfChar(i,f[p],a,p);n.charIndex===f.length&&(u-=this._getWidthOfCharSpacing())}l=c,(this.lineHeight<1||a===o&&this.lineHeight>1)&&(c/=this.lineHeight),i.fillRect(e.left+h,e.top+e.topOffset,u>0?u:0,c),e.topOffset+=l}},_renderChars:function(t,e,i,r,n,s,o){if(this.isEmptyStyles())return this._renderCharsFast(t,e,i,r,n);o=o||0;var a,h,c=this._getHeightOfLine(e,s),l="";e.save(),n-=c/this.lineHeight*this._fontSizeFraction;for(var u=o,f=i.length+o;u<=f;u++)a=a||this.getCurrentCharStyle(s,u),h=this.getCurrentCharStyle(s,u+1),(this._hasStyleChanged(a,h)||u===f)&&(this._renderChar(t,e,s,u-1,l,r,n,c),l="",a=h),l+=i[u-o];e.restore()},_renderCharsFast:function(t,e,i,r,n){"fillText"===t&&this.fill&&this.callSuper("_renderChars",t,e,i,r,n),"strokeText"===t&&(this.stroke&&this.strokeWidth>0||this.skipFillStrokeCheck)&&this.callSuper("_renderChars",t,e,i,r,n)},_renderChar:function(t,e,i,r,n,s,o,a){var h,c,l,u,f,d,g,p,v,b=this._getStyleDeclaration(i,r);if(b?(c=this._getHeightOfChar(e,n,i,r),u=b.stroke,l=b.fill,d=b.textDecoration):c=this.fontSize,u=(u||this.stroke)&&"strokeText"===t,l=(l||this.fill)&&"fillText"===t,b&&e.save(),h=this._applyCharStylesGetWidth(e,n,i,r,b||null),d=d||this.textDecoration,b&&b.textBackgroundColor&&this._removeShadow(e),0!==this.charSpacing){p=this._getWidthOfCharSpacing(),g=n.split(""),h=0;for(var m,y=0,_=g.length;y<_;y++)m=g[y],l&&e.fillText(m,s+h,o),u&&e.strokeText(m,s+h,o),v=e.measureText(m).width+p,h+=v>0?v:0}else l&&e.fillText(n,s,o),u&&e.strokeText(n,s,o);(d||""!==d)&&(f=this._fontSizeFraction*a/this.lineHeight,this._renderCharDecoration(e,d,s,o,f,h,c)),b&&e.restore(),e.translate(h,0)},_hasStyleChanged:function(t,e){return t.fill!==e.fill||t.fontSize!==e.fontSize||t.textBackgroundColor!==e.textBackgroundColor||t.textDecoration!==e.textDecoration||t.fontFamily!==e.fontFamily||t.fontWeight!==e.fontWeight||t.fontStyle!==e.fontStyle||t.stroke!==e.stroke||t.strokeWidth!==e.strokeWidth},_renderCharDecoration:function(t,e,i,r,n,s,o){if(e){var a,h,c=o/15,l={underline:r+o/10,"line-through":r-o*(this._fontSizeFraction+this._fontSizeMult-1)+c,overline:r-(this._fontSizeMult-this._fontSizeFraction)*o},u=["underline","line-through","overline"];for(a=0;a<u.length;a++)h=u[a],e.indexOf(h)>-1&&t.fillRect(i,l[h],s,c)}},_renderTextLine:function(t,e,i,r,n,s){this.isEmptyStyles()||(n+=this.fontSize*(this._fontSizeFraction+.03)),this.callSuper("_renderTextLine",t,e,i,r,n,s)},_renderTextDecoration:function(t){if(this.isEmptyStyles())return this.callSuper("_renderTextDecoration",t)},_renderTextLinesBackground:function(t){this.callSuper("_renderTextLinesBackground",t);for(var e,i,r,n,s,o,a=0,h=this._getLeftOffset(),c=this._getTopOffset(),l=0,u=this._textLines.length;l<u;l++)if(e=this._getHeightOfLine(t,l),n=this._textLines[l],""!==n&&this.styles&&this._getLineStyle(l)){i=this._getLineWidth(t,l),r=this._getLineLeftOffset(i);for(var f=0,d=n.length;f<d;f++)o=this._getStyleDeclaration(l,f),o&&o.textBackgroundColor&&(s=n[f],t.fillStyle=o.textBackgroundColor,t.fillRect(h+r+this._getWidthOfCharsAt(t,l,f),c+a,this._getWidthOfChar(t,s,l,f),e/this.lineHeight));a+=e}else a+=e},_getCacheProp:function(t,e){return t+e.fontSize+e.fontWeight+e.fontStyle},_getFontCache:function(t){return fabric.charWidthsCache[t]||(fabric.charWidthsCache[t]={}),fabric.charWidthsCache[t]},_applyCharStylesGetWidth:function(e,i,r,n,s){var o,a,h,c=s||this._getStyleDeclaration(r,n),l=t(c);if(this._applyFontStyles(l),h=this._getFontCache(l.fontFamily),a=this._getCacheProp(i,l),!c&&h[a]&&this.caching)return h[a];"string"==typeof l.shadow&&(l.shadow=new fabric.Shadow(l.shadow));var u=l.fill||this.fill;return e.fillStyle=u.toLive?u.toLive(e,this):u,l.stroke&&(e.strokeStyle=l.stroke&&l.stroke.toLive?l.stroke.toLive(e,this):l.stroke),e.lineWidth=l.strokeWidth||this.strokeWidth,e.font=this._getFontDeclaration.call(l),l.shadow&&(l.scaleX=this.scaleX,l.scaleY=this.scaleY,l.canvas=this.canvas,l.getObjectScaling=this.getObjectScaling,this._setShadow.call(l,e)),this.caching&&h[a]?h[a]:(o=e.measureText(i).width,this.caching&&(h[a]=o),o)},_applyFontStyles:function(t){t.fontFamily||(t.fontFamily=this.fontFamily),t.fontSize||(t.fontSize=this.fontSize),t.fontWeight||(t.fontWeight=this.fontWeight),t.fontStyle||(t.fontStyle=this.fontStyle)},_getStyleDeclaration:function(e,i,r){return r?this.styles[e]&&this.styles[e][i]?t(this.styles[e][i]):{}:this.styles[e]&&this.styles[e][i]?this.styles[e][i]:null},_setStyleDeclaration:function(t,e,i){this.styles[t][e]=i},_deleteStyleDeclaration:function(t,e){delete this.styles[t][e]},_getLineStyle:function(t){return this.styles[t]},_setLineStyle:function(t,e){this.styles[t]=e},_deleteLineStyle:function(t){delete this.styles[t]},_getWidthOfChar:function(t,e,i,r){if(!this._isMeasuring&&"justify"===this.textAlign&&this._reSpacesAndTabs.test(e))return this._getWidthOfSpace(t,i);t.save();var n=this._applyCharStylesGetWidth(t,e,i,r);return 0!==this.charSpacing&&(n+=this._getWidthOfCharSpacing()),t.restore(),n>0?n:0},_getHeightOfChar:function(t,e,i){var r=this._getStyleDeclaration(e,i);return r&&r.fontSize?r.fontSize:this.fontSize},_getWidthOfCharsAt:function(t,e,i){var r,n,s=0;for(r=0;r<i;r++)n=this._textLines[e][r],s+=this._getWidthOfChar(t,n,e,r);return s},_measureLine:function(t,e){this._isMeasuring=!0;var i=this._getWidthOfCharsAt(t,e,this._textLines[e].length);return 0!==this.charSpacing&&(i-=this._getWidthOfCharSpacing()),this._isMeasuring=!1,i>0?i:0},_getWidthOfSpace:function(t,e){if(this.__widthOfSpace[e])return this.__widthOfSpace[e];var i=this._textLines[e],r=this._getWidthOfWords(t,i,e,0),n=this.width-r,s=i.length-i.replace(this._reSpacesAndTabs,"").length,o=Math.max(n/s,t.measureText(" ").width);return this.__widthOfSpace[e]=o,o},_getWidthOfWords:function(t,e,i,r){for(var n=0,s=0;s<e.length;s++){var o=e[s];o.match(/\s/)||(n+=this._getWidthOfChar(t,o,i,s+r))}return n},_getHeightOfLine:function(t,e){if(this.__lineHeights[e])return this.__lineHeights[e];for(var i=this._textLines[e],r=this._getHeightOfChar(t,e,0),n=1,s=i.length;n<s;n++){var o=this._getHeightOfChar(t,e,n);o>r&&(r=o)}return this.__lineHeights[e]=r*this.lineHeight*this._fontSizeMult,this.__lineHeights[e]},_getTextHeight:function(t){for(var e,i=0,r=0,n=this._textLines.length;r<n;r++)e=this._getHeightOfLine(t,r),i+=r===n-1?e/this.lineHeight:e;return i},toObject:function(e){return fabric.util.object.extend(this.callSuper("toObject",e),{styles:t(this.styles,!0)})}}),fabric.IText.fromObject=function(e,i){var r=new fabric.IText(e.text,t(e));return i&&i(r),r}}(),function(){var t=fabric.util.object.clone;fabric.util.object.extend(fabric.IText.prototype,{initBehavior:function(){this.initAddedHandler(),this.initRemovedHandler(),this.initCursorSelectionHandlers(),this.initDoubleClickSimulation(),this.mouseMoveHandler=this.mouseMoveHandler.bind(this)},initSelectedHandler:function(){this.on("selected",function(){var t=this;setTimeout(function(){t.selected=!0},100)})},initAddedHandler:function(){var t=this;this.on("added",function(){var e=t.canvas;e&&(e._hasITextHandlers||(e._hasITextHandlers=!0,t._initCanvasHandlers(e)),e._iTextInstances=e._iTextInstances||[],e._iTextInstances.push(t))})},initRemovedHandler:function(){var t=this;this.on("removed",function(){var e=t.canvas;e&&(e._iTextInstances=e._iTextInstances||[],fabric.util.removeFromArray(e._iTextInstances,t),0===e._iTextInstances.length&&(e._hasITextHandlers=!1,t._removeCanvasHandlers(e)))})},_initCanvasHandlers:function(t){t._canvasITextSelectionClearedHanlder=function(){fabric.IText.prototype.exitEditingOnOthers(t)}.bind(this),t._mouseUpITextHandler=function(){t._iTextInstances&&t._iTextInstances.forEach(function(t){t.__isMousedown=!1})}.bind(this),t.on("selection:cleared",t._canvasITextSelectionClearedHanlder),t.on("object:selected",t._canvasITextSelectionClearedHanlder),t.on("mouse:up",t._mouseUpITextHandler)},_removeCanvasHandlers:function(t){t.off("selection:cleared",t._canvasITextSelectionClearedHanlder),t.off("object:selected",t._canvasITextSelectionClearedHanlder),t.off("mouse:up",t._mouseUpITextHandler)},_tick:function(){this._currentTickState=this._animateCursor(this,1,this.cursorDuration,"_onTickComplete")},_animateCursor:function(t,e,i,r){var n;return n={isAborted:!1,abort:function(){this.isAborted=!0}},t.animate("_currentCursorOpacity",e,{duration:i,onComplete:function(){n.isAborted||t[r]()},onChange:function(){t.canvas&&t.selectionStart===t.selectionEnd&&t.renderCursorOrSelection()},abort:function(){return n.isAborted}}),n},_onTickComplete:function(){var t=this;this._cursorTimeout1&&clearTimeout(this._cursorTimeout1),this._cursorTimeout1=setTimeout(function(){t._currentTickCompleteState=t._animateCursor(t,0,this.cursorDuration/2,"_tick")},100)},initDelayedCursor:function(t){var e=this,i=t?0:this.cursorDelay;this.abortCursorAnimation(),this._currentCursorOpacity=1,this._cursorTimeout2=setTimeout(function(){e._tick()},i)},abortCursorAnimation:function(){var t=this._currentTickState||this._currentTickCompleteState;this._currentTickState&&this._currentTickState.abort(),this._currentTickCompleteState&&this._currentTickCompleteState.abort(),clearTimeout(this._cursorTimeout1),clearTimeout(this._cursorTimeout2),this._currentCursorOpacity=0,t&&this.canvas&&this.canvas.clearContext(this.canvas.contextTop||this.ctx)},selectAll:function(){this.selectionStart=0,this.selectionEnd=this.text.length,this._fireSelectionChanged(),this._updateTextarea()},getSelectedText:function(){return this.text.slice(this.selectionStart,this.selectionEnd)},findWordBoundaryLeft:function(t){var e=0,i=t-1;if(this._reSpace.test(this.text.charAt(i)))for(;this._reSpace.test(this.text.charAt(i));)e++,i--;for(;/\S/.test(this.text.charAt(i))&&i>-1;)e++,i--;return t-e},findWordBoundaryRight:function(t){var e=0,i=t;if(this._reSpace.test(this.text.charAt(i)))for(;this._reSpace.test(this.text.charAt(i));)e++,i++;for(;/\S/.test(this.text.charAt(i))&&i<this.text.length;)e++,i++;return t+e},findLineBoundaryLeft:function(t){for(var e=0,i=t-1;!/\n/.test(this.text.charAt(i))&&i>-1;)e++,i--;return t-e},findLineBoundaryRight:function(t){for(var e=0,i=t;!/\n/.test(this.text.charAt(i))&&i<this.text.length;)e++,i++;return t+e},getNumNewLinesInSelectedText:function(){for(var t=this.getSelectedText(),e=0,i=0,r=t.length;i<r;i++)"\n"===t[i]&&e++;return e},searchWordBoundary:function(t,e){for(var i=this._reSpace.test(this.text.charAt(t))?t-1:t,r=this.text.charAt(i),n=/[ \n\.,;!\?\-]/;!n.test(r)&&i>0&&i<this.text.length;)i+=e,r=this.text.charAt(i);return n.test(r)&&"\n"!==r&&(i+=1===e?0:1),i},selectWord:function(t){t=t||this.selectionStart;var e=this.searchWordBoundary(t,-1),i=this.searchWordBoundary(t,1);this.selectionStart=e,this.selectionEnd=i,this._fireSelectionChanged(),this._updateTextarea(),this.renderCursorOrSelection()},selectLine:function(t){t=t||this.selectionStart;var e=this.findLineBoundaryLeft(t),i=this.findLineBoundaryRight(t);this.selectionStart=e,this.selectionEnd=i,this._fireSelectionChanged(),this._updateTextarea()},enterEditing:function(t){if(!this.isEditing&&this.editable)return this.canvas&&this.exitEditingOnOthers(this.canvas),this.isEditing=!0,this.initHiddenTextarea(t),this.hiddenTextarea.focus(),this._updateTextarea(),this._saveEditingProps(),this._setEditingProps(),this._textBeforeEdit=this.text,this._tick(),this.fire("editing:entered"),this.canvas?(this.canvas.fire("text:editing:entered",{target:this}),this.initMouseMoveHandler(),this.canvas.renderAll(),this):this},exitEditingOnOthers:function(t){t._iTextInstances&&t._iTextInstances.forEach(function(t){t.selected=!1,t.isEditing&&t.exitEditing()})},initMouseMoveHandler:function(){this.canvas.on("mouse:move",this.mouseMoveHandler)},mouseMoveHandler:function(t){if(this.__isMousedown&&this.isEditing){var e=this.getSelectionStartFromPointer(t.e),i=this.selectionStart,r=this.selectionEnd;e!==this.__selectionStartOnMouseDown&&(e>this.__selectionStartOnMouseDown?(this.selectionStart=this.__selectionStartOnMouseDown,this.selectionEnd=e):(this.selectionStart=e,this.selectionEnd=this.__selectionStartOnMouseDown),this.selectionStart===i&&this.selectionEnd===r||(this._fireSelectionChanged(),this._updateTextarea(),this.renderCursorOrSelection()))}},_setEditingProps:function(){this.hoverCursor="text",this.canvas&&(this.canvas.defaultCursor=this.canvas.moveCursor="text"),this.borderColor=this.editingBorderColor,this.hasControls=this.selectable=!1,this.lockMovementX=this.lockMovementY=!0},_updateTextarea:function(){if(this.hiddenTextarea&&!this.inCompositionMode&&(this.cursorOffsetCache={},this.hiddenTextarea.value=this.text,this.hiddenTextarea.selectionStart=this.selectionStart,this.hiddenTextarea.selectionEnd=this.selectionEnd,this.selectionStart===this.selectionEnd)){var t=this._calcTextareaPosition();this.hiddenTextarea.style.left=t.left,this.hiddenTextarea.style.top=t.top,this.hiddenTextarea.style.fontSize=t.fontSize}},_calcTextareaPosition:function(){if(!this.canvas)return{x:1,y:1};var t=this.text.split(""),e=this._getCursorBoundaries(t,"cursor"),i=this.get2DCursorLocation(),r=i.lineIndex,n=i.charIndex,s=this.getCurrentCharFontSize(r,n),o=0===r&&0===n?this._getLineLeftOffset(this._getLineWidth(this.ctx,r)):e.leftOffset,a=this.calcTransformMatrix(),h={x:e.left+o,y:e.top+e.topOffset+s},c=this.canvas.upperCanvasEl,l=c.width-s,u=c.height-s;return h=fabric.util.transformPoint(h,a),h=fabric.util.transformPoint(h,this.canvas.viewportTransform),h.x<0&&(h.x=0),h.x>l&&(h.x=l),h.y<0&&(h.y=0),h.y>u&&(h.y=u),h.x+=this.canvas._offset.left,h.y+=this.canvas._offset.top,{left:h.x+"px",top:h.y+"px",fontSize:s}},_saveEditingProps:function(){this._savedProps={hasControls:this.hasControls,borderColor:this.borderColor,lockMovementX:this.lockMovementX,lockMovementY:this.lockMovementY,hoverCursor:this.hoverCursor,defaultCursor:this.canvas&&this.canvas.defaultCursor,moveCursor:this.canvas&&this.canvas.moveCursor}},_restoreEditingProps:function(){this._savedProps&&(this.hoverCursor=this._savedProps.overCursor,this.hasControls=this._savedProps.hasControls,this.borderColor=this._savedProps.borderColor,this.lockMovementX=this._savedProps.lockMovementX,
this.lockMovementY=this._savedProps.lockMovementY,this.canvas&&(this.canvas.defaultCursor=this._savedProps.defaultCursor,this.canvas.moveCursor=this._savedProps.moveCursor))},exitEditing:function(){var t=this._textBeforeEdit!==this.text;return this.selected=!1,this.isEditing=!1,this.selectable=!0,this.selectionEnd=this.selectionStart,this.hiddenTextarea&&this.canvas&&this.hiddenTextarea.parentNode.removeChild(this.hiddenTextarea),this.hiddenTextarea=null,this.abortCursorAnimation(),this._restoreEditingProps(),this._currentCursorOpacity=0,this.fire("editing:exited"),t&&this.fire("modified"),this.canvas&&(this.canvas.off("mouse:move",this.mouseMoveHandler),this.canvas.fire("text:editing:exited",{target:this}),t&&this.canvas.fire("object:modified",{target:this})),this},_removeExtraneousStyles:function(){for(var t in this.styles)this._textLines[t]||delete this.styles[t]},_removeCharsFromTo:function(t,e){for(;e!==t;)this._removeSingleCharAndStyle(t+1),e--;this.selectionStart=t,this.selectionEnd=t},_removeSingleCharAndStyle:function(t){var e="\n"===this.text[t-1],i=e?t:t-1;this.removeStyleObject(e,i),this.text=this.text.slice(0,t-1)+this.text.slice(t),this._textLines=this._splitTextIntoLines()},insertChars:function(t,e){var i;if(this.selectionEnd-this.selectionStart>1&&this._removeCharsFromTo(this.selectionStart,this.selectionEnd),!e&&this.isEmptyStyles())return void this.insertChar(t,!1);for(var r=0,n=t.length;r<n;r++)e&&(i=fabric.copiedTextStyle[r]),this.insertChar(t[r],r<n-1,i)},insertChar:function(t,e,i){var r="\n"===this.text[this.selectionStart];this.text=this.text.slice(0,this.selectionStart)+t+this.text.slice(this.selectionEnd),this._textLines=this._splitTextIntoLines(),this.insertStyleObjects(t,r,i),this.selectionStart+=t.length,this.selectionEnd=this.selectionStart,e||(this._updateTextarea(),this.setCoords(),this._fireSelectionChanged(),this.fire("changed"),this.canvas&&this.canvas.fire("text:changed",{target:this}),this.canvas&&this.canvas.renderAll())},insertNewlineStyleObject:function(e,i,r){this.shiftLineStyles(e,1),this.styles[e+1]||(this.styles[e+1]={});var n={},s={};if(this.styles[e]&&this.styles[e][i-1]&&(n=this.styles[e][i-1]),r)s[0]=t(n),this.styles[e+1]=s;else{for(var o in this.styles[e])parseInt(o,10)>=i&&(s[parseInt(o,10)-i]=this.styles[e][o],delete this.styles[e][o]);this.styles[e+1]=s}this._forceClearCache=!0},insertCharStyleObject:function(e,i,r){var n=this.styles[e],s=t(n);0!==i||r||(i=1);for(var o in s){var a=parseInt(o,10);a>=i&&(n[a+1]=s[a],s[a-1]||delete n[a])}this.styles[e][i]=r||t(n[i-1]),this._forceClearCache=!0},insertStyleObjects:function(t,e,i){var r=this.get2DCursorLocation(),n=r.lineIndex,s=r.charIndex;this._getLineStyle(n)||this._setLineStyle(n,{}),"\n"===t?this.insertNewlineStyleObject(n,s,e):this.insertCharStyleObject(n,s,i)},shiftLineStyles:function(e,i){var r=t(this.styles);for(var n in this.styles){var s=parseInt(n,10);s>e&&(this.styles[s+i]=r[s],r[s-i]||delete this.styles[s])}},removeStyleObject:function(t,e){var i=this.get2DCursorLocation(e),r=i.lineIndex,n=i.charIndex;this._removeStyleObject(t,i,r,n)},_getTextOnPreviousLine:function(t){return this._textLines[t-1]},_removeStyleObject:function(e,i,r,n){if(e){var s=this._getTextOnPreviousLine(i.lineIndex),o=s?s.length:0;this.styles[r-1]||(this.styles[r-1]={});for(n in this.styles[r])this.styles[r-1][parseInt(n,10)+o]=this.styles[r][n];this.shiftLineStyles(i.lineIndex,-1)}else{var a=this.styles[r];a&&delete a[n];var h=t(a);for(var c in h){var l=parseInt(c,10);l>=n&&0!==l&&(a[l-1]=h[l],delete a[l])}}},insertNewline:function(){this.insertChars("\n")},setSelectionStartEndWithShift:function(t,e,i){i<=t?(e===t?this._selectionDirection="left":"right"===this._selectionDirection&&(this._selectionDirection="left",this.selectionEnd=t),this.selectionStart=i):i>t&&i<e?"right"===this._selectionDirection?this.selectionEnd=i:this.selectionStart=i:(e===t?this._selectionDirection="right":"left"===this._selectionDirection&&(this._selectionDirection="right",this.selectionStart=e),this.selectionEnd=i)},setSelectionInBoundaries:function(){var t=this.text.length;this.selectionStart>t?this.selectionStart=t:this.selectionStart<0&&(this.selectionStart=0),this.selectionEnd>t?this.selectionEnd=t:this.selectionEnd<0&&(this.selectionEnd=0)}})}(),fabric.util.object.extend(fabric.IText.prototype,{initDoubleClickSimulation:function(){this.__lastClickTime=+new Date,this.__lastLastClickTime=+new Date,this.__lastPointer={},this.on("mousedown",this.onMouseDown.bind(this))},onMouseDown:function(t){this.__newClickTime=+new Date;var e=this.canvas.getPointer(t.e);this.isTripleClick(e)?(this.fire("tripleclick",t),this._stopEvent(t.e)):this.isDoubleClick(e)&&(this.fire("dblclick",t),this._stopEvent(t.e)),this.__lastLastClickTime=this.__lastClickTime,this.__lastClickTime=this.__newClickTime,this.__lastPointer=e,this.__lastIsEditing=this.isEditing,this.__lastSelected=this.selected},isDoubleClick:function(t){return this.__newClickTime-this.__lastClickTime<500&&this.__lastPointer.x===t.x&&this.__lastPointer.y===t.y&&this.__lastIsEditing},isTripleClick:function(t){return this.__newClickTime-this.__lastClickTime<500&&this.__lastClickTime-this.__lastLastClickTime<500&&this.__lastPointer.x===t.x&&this.__lastPointer.y===t.y},_stopEvent:function(t){t.preventDefault&&t.preventDefault(),t.stopPropagation&&t.stopPropagation()},initCursorSelectionHandlers:function(){this.initSelectedHandler(),this.initMousedownHandler(),this.initMouseupHandler(),this.initClicks()},initClicks:function(){this.on("dblclick",function(t){this.selectWord(this.getSelectionStartFromPointer(t.e))}),this.on("tripleclick",function(t){this.selectLine(this.getSelectionStartFromPointer(t.e))})},initMousedownHandler:function(){this.on("mousedown",function(t){if(this.editable){var e=this.canvas.getPointer(t.e);this.__mousedownX=e.x,this.__mousedownY=e.y,this.__isMousedown=!0,this.selected&&this.setCursorByClick(t.e),this.isEditing&&(this.__selectionStartOnMouseDown=this.selectionStart,this.selectionStart===this.selectionEnd&&this.abortCursorAnimation(),this.renderCursorOrSelection())}})},_isObjectMoved:function(t){var e=this.canvas.getPointer(t);return this.__mousedownX!==e.x||this.__mousedownY!==e.y},initMouseupHandler:function(){this.on("mouseup",function(t){this.__isMousedown=!1,this.editable&&!this._isObjectMoved(t.e)&&(this.__lastSelected&&!this.__corner&&(this.enterEditing(t.e),this.selectionStart===this.selectionEnd?this.initDelayedCursor(!0):this.renderCursorOrSelection()),this.selected=!0)})},setCursorByClick:function(t){var e=this.getSelectionStartFromPointer(t),i=this.selectionStart,r=this.selectionEnd;t.shiftKey?this.setSelectionStartEndWithShift(i,r,e):(this.selectionStart=e,this.selectionEnd=e),this._fireSelectionChanged(),this._updateTextarea()},getSelectionStartFromPointer:function(t){for(var e,i,r=this.getLocalPointer(t),n=0,s=0,o=0,a=0,h=0,c=this._textLines.length;h<c;h++){i=this._textLines[h],o+=this._getHeightOfLine(this.ctx,h)*this.scaleY;var l=this._getLineWidth(this.ctx,h),u=this._getLineLeftOffset(l);s=u*this.scaleX;for(var f=0,d=i.length;f<d;f++){if(n=s,s+=this._getWidthOfChar(this.ctx,i[f],h,this.flipX?d-f:f)*this.scaleX,!(o<=r.y||s<=r.x))return this._getNewSelectionStartFromOffset(r,n,s,a+h,d);a++}if(r.y<o)return this._getNewSelectionStartFromOffset(r,n,s,a+h-1,d)}if("undefined"==typeof e)return this.text.length},_getNewSelectionStartFromOffset:function(t,e,i,r,n){var s=t.x-e,o=i-t.x,a=o>s?0:1,h=r+a;return this.flipX&&(h=n-h),h>this.text.length&&(h=this.text.length),h}}),fabric.util.object.extend(fabric.IText.prototype,{initHiddenTextarea:function(){this.hiddenTextarea=fabric.document.createElement("textarea"),this.hiddenTextarea.setAttribute("autocapitalize","off");var t=this._calcTextareaPosition();this.hiddenTextarea.style.cssText="position: absolute; top: "+t.top+"; left: "+t.left+"; opacity: 0; width: 0px; height: 0px; z-index: -999;",fabric.document.body.appendChild(this.hiddenTextarea),fabric.util.addListener(this.hiddenTextarea,"keydown",this.onKeyDown.bind(this)),fabric.util.addListener(this.hiddenTextarea,"keyup",this.onKeyUp.bind(this)),fabric.util.addListener(this.hiddenTextarea,"input",this.onInput.bind(this)),fabric.util.addListener(this.hiddenTextarea,"copy",this.copy.bind(this)),fabric.util.addListener(this.hiddenTextarea,"cut",this.cut.bind(this)),fabric.util.addListener(this.hiddenTextarea,"paste",this.paste.bind(this)),fabric.util.addListener(this.hiddenTextarea,"compositionstart",this.onCompositionStart.bind(this)),fabric.util.addListener(this.hiddenTextarea,"compositionupdate",this.onCompositionUpdate.bind(this)),fabric.util.addListener(this.hiddenTextarea,"compositionend",this.onCompositionEnd.bind(this)),!this._clickHandlerInitialized&&this.canvas&&(fabric.util.addListener(this.canvas.upperCanvasEl,"click",this.onClick.bind(this)),this._clickHandlerInitialized=!0)},_keysMap:{8:"removeChars",9:"exitEditing",27:"exitEditing",13:"insertNewline",33:"moveCursorUp",34:"moveCursorDown",35:"moveCursorRight",36:"moveCursorLeft",37:"moveCursorLeft",38:"moveCursorUp",39:"moveCursorRight",40:"moveCursorDown",46:"forwardDelete"},_ctrlKeysMapUp:{67:"copy",88:"cut"},_ctrlKeysMapDown:{65:"selectAll"},onClick:function(){this.hiddenTextarea&&this.hiddenTextarea.focus()},onKeyDown:function(t){if(this.isEditing){if(t.keyCode in this._keysMap)this[this._keysMap[t.keyCode]](t);else{if(!(t.keyCode in this._ctrlKeysMapDown&&(t.ctrlKey||t.metaKey)))return;this[this._ctrlKeysMapDown[t.keyCode]](t)}t.stopImmediatePropagation(),t.preventDefault(),this.canvas&&this.canvas.renderAll()}},onKeyUp:function(t){return!this.isEditing||this._copyDone?void(this._copyDone=!1):void(t.keyCode in this._ctrlKeysMapUp&&(t.ctrlKey||t.metaKey)&&(this[this._ctrlKeysMapUp[t.keyCode]](t),t.stopImmediatePropagation(),t.preventDefault(),this.canvas&&this.canvas.renderAll()))},onInput:function(t){if(this.isEditing&&!this.inCompositionMode){var e,i,r,n=this.selectionStart||0,s=this.selectionEnd||0,o=this.text.length,a=this.hiddenTextarea.value.length;a>o?(r="left"===this._selectionDirection?s:n,e=a-o,i=this.hiddenTextarea.value.slice(r,r+e)):(e=a-o+s-n,i=this.hiddenTextarea.value.slice(n,n+e)),this.insertChars(i),t.stopPropagation()}},onCompositionStart:function(){this.inCompositionMode=!0,this.prevCompositionLength=0,this.compositionStart=this.selectionStart},onCompositionEnd:function(){this.inCompositionMode=!1},onCompositionUpdate:function(t){var e=t.data;this.selectionStart=this.compositionStart,this.selectionEnd=this.selectionEnd===this.selectionStart?this.compositionStart+this.prevCompositionLength:this.selectionEnd,this.insertChars(e,!1),this.prevCompositionLength=e.length},forwardDelete:function(t){if(this.selectionStart===this.selectionEnd){if(this.selectionStart===this.text.length)return;this.moveCursorRight(t)}this.removeChars(t)},copy:function(t){if(this.selectionStart!==this.selectionEnd){var e=this.getSelectedText(),i=this._getClipboardData(t);i&&i.setData("text",e),fabric.copiedText=e,fabric.copiedTextStyle=this.getSelectionStyles(this.selectionStart,this.selectionEnd),t.stopImmediatePropagation(),t.preventDefault(),this._copyDone=!0}},paste:function(t){var e=null,i=this._getClipboardData(t),r=!0;i?(e=i.getData("text").replace(/\r/g,""),fabric.copiedTextStyle&&fabric.copiedText===e||(r=!1)):e=fabric.copiedText,e&&this.insertChars(e,r),t.stopImmediatePropagation(),t.preventDefault()},cut:function(t){this.selectionStart!==this.selectionEnd&&(this.copy(t),this.removeChars(t))},_getClipboardData:function(t){return t&&t.clipboardData||fabric.window.clipboardData},_getWidthBeforeCursor:function(t,e){for(var i,r=this._textLines[t].slice(0,e),n=this._getLineWidth(this.ctx,t),s=this._getLineLeftOffset(n),o=0,a=r.length;o<a;o++)i=r[o],s+=this._getWidthOfChar(this.ctx,i,t,o);return s},getDownCursorOffset:function(t,e){var i=this._getSelectionForOffset(t,e),r=this.get2DCursorLocation(i),n=r.lineIndex;if(n===this._textLines.length-1||t.metaKey||34===t.keyCode)return this.text.length-i;var s=r.charIndex,o=this._getWidthBeforeCursor(n,s),a=this._getIndexOnLine(n+1,o),h=this._textLines[n].slice(s);return h.length+a+2},_getSelectionForOffset:function(t,e){return t.shiftKey&&this.selectionStart!==this.selectionEnd&&e?this.selectionEnd:this.selectionStart},getUpCursorOffset:function(t,e){var i=this._getSelectionForOffset(t,e),r=this.get2DCursorLocation(i),n=r.lineIndex;if(0===n||t.metaKey||33===t.keyCode)return-i;var s=r.charIndex,o=this._getWidthBeforeCursor(n,s),a=this._getIndexOnLine(n-1,o),h=this._textLines[n].slice(0,s);return-this._textLines[n-1].length+a-h.length},_getIndexOnLine:function(t,e){for(var i,r=this._getLineWidth(this.ctx,t),n=this._textLines[t],s=this._getLineLeftOffset(r),o=s,a=0,h=0,c=n.length;h<c;h++){var l=n[h],u=this._getWidthOfChar(this.ctx,l,t,h);if(o+=u,o>e){i=!0;var f=o-u,d=o,g=Math.abs(f-e),p=Math.abs(d-e);a=p<g?h:h-1;break}}return i||(a=n.length-1),a},moveCursorDown:function(t){this.selectionStart>=this.text.length&&this.selectionEnd>=this.text.length||this._moveCursorUpOrDown("Down",t)},moveCursorUp:function(t){0===this.selectionStart&&0===this.selectionEnd||this._moveCursorUpOrDown("Up",t)},_moveCursorUpOrDown:function(t,e){var i="get"+t+"CursorOffset",r=this[i](e,"right"===this._selectionDirection);e.shiftKey?this.moveCursorWithShift(r):this.moveCursorWithoutShift(r),0!==r&&(this.setSelectionInBoundaries(),this.abortCursorAnimation(),this._currentCursorOpacity=1,this.initDelayedCursor(),this._fireSelectionChanged(),this._updateTextarea())},moveCursorWithShift:function(t){var e="left"===this._selectionDirection?this.selectionStart+t:this.selectionEnd+t;return this.setSelectionStartEndWithShift(this.selectionStart,this.selectionEnd,e),0!==t},moveCursorWithoutShift:function(t){return t<0?(this.selectionStart+=t,this.selectionEnd=this.selectionStart):(this.selectionEnd+=t,this.selectionStart=this.selectionEnd),0!==t},moveCursorLeft:function(t){0===this.selectionStart&&0===this.selectionEnd||this._moveCursorLeftOrRight("Left",t)},_move:function(t,e,i){var r;if(t.altKey)r=this["findWordBoundary"+i](this[e]);else{if(!t.metaKey&&35!==t.keyCode&&36!==t.keyCode)return this[e]+="Left"===i?-1:1,!0;r=this["findLineBoundary"+i](this[e])}if(void 0!==typeof r&&this[e]!==r)return this[e]=r,!0},_moveLeft:function(t,e){return this._move(t,e,"Left")},_moveRight:function(t,e){return this._move(t,e,"Right")},moveCursorLeftWithoutShift:function(t){var e=!0;return this._selectionDirection="left",this.selectionEnd===this.selectionStart&&0!==this.selectionStart&&(e=this._moveLeft(t,"selectionStart")),this.selectionEnd=this.selectionStart,e},moveCursorLeftWithShift:function(t){return"right"===this._selectionDirection&&this.selectionStart!==this.selectionEnd?this._moveLeft(t,"selectionEnd"):0!==this.selectionStart?(this._selectionDirection="left",this._moveLeft(t,"selectionStart")):void 0},moveCursorRight:function(t){this.selectionStart>=this.text.length&&this.selectionEnd>=this.text.length||this._moveCursorLeftOrRight("Right",t)},_moveCursorLeftOrRight:function(t,e){var i="moveCursor"+t+"With";this._currentCursorOpacity=1,i+=e.shiftKey?"Shift":"outShift",this[i](e)&&(this.abortCursorAnimation(),this.initDelayedCursor(),this._fireSelectionChanged(),this._updateTextarea())},moveCursorRightWithShift:function(t){return"left"===this._selectionDirection&&this.selectionStart!==this.selectionEnd?this._moveRight(t,"selectionStart"):this.selectionEnd!==this.text.length?(this._selectionDirection="right",this._moveRight(t,"selectionEnd")):void 0},moveCursorRightWithoutShift:function(t){var e=!0;return this._selectionDirection="right",this.selectionStart===this.selectionEnd?(e=this._moveRight(t,"selectionStart"),this.selectionEnd=this.selectionStart):this.selectionStart=this.selectionEnd,e},removeChars:function(t){this.selectionStart===this.selectionEnd?this._removeCharsNearCursor(t):this._removeCharsFromTo(this.selectionStart,this.selectionEnd),this.setSelectionEnd(this.selectionStart),this._removeExtraneousStyles(),this.canvas&&this.canvas.renderAll(),this.setCoords(),this.fire("changed"),this.canvas&&this.canvas.fire("text:changed",{target:this})},_removeCharsNearCursor:function(t){if(0!==this.selectionStart)if(t.metaKey){var e=this.findLineBoundaryLeft(this.selectionStart);this._removeCharsFromTo(e,this.selectionStart),this.setSelectionStart(e)}else if(t.altKey){var i=this.findWordBoundaryLeft(this.selectionStart);this._removeCharsFromTo(i,this.selectionStart),this.setSelectionStart(i)}else this._removeSingleCharAndStyle(this.selectionStart),this.setSelectionStart(this.selectionStart-1)}}),function(){var t=fabric.util.toFixed,e=fabric.Object.NUM_FRACTION_DIGITS;fabric.util.object.extend(fabric.IText.prototype,{_setSVGTextLineText:function(t,e,i,r,n,s){this._getLineStyle(t)?this._setSVGTextLineChars(t,e,i,r,s):fabric.Text.prototype._setSVGTextLineText.call(this,t,e,i,r,n)},_setSVGTextLineChars:function(t,e,i,r,n){for(var s=this._textLines[t],o=0,a=this._getLineLeftOffset(this._getLineWidth(this.ctx,t))-this.width/2,h=this._getSVGLineTopOffset(t),c=this._getHeightOfLine(this.ctx,t),l=0,u=s.length;l<u;l++){var f=this._getStyleDeclaration(t,l)||{};e.push(this._createTextCharSpan(s[l],f,a,h.lineTop+h.offset,o));var d=this._getWidthOfChar(this.ctx,s[l],t,l);f.textBackgroundColor&&n.push(this._createTextCharBg(f,a,h.lineTop,c,d,o)),o+=d}},_getSVGLineTopOffset:function(t){for(var e=0,i=0,r=0;r<t;r++)e+=this._getHeightOfLine(this.ctx,r);return i=this._getHeightOfLine(this.ctx,r),{lineTop:e,offset:(this._fontSizeMult-this._fontSizeFraction)*i/(this.lineHeight*this._fontSizeMult)}},_createTextCharBg:function(i,r,n,s,o,a){return['\t\t<rect fill="',i.textBackgroundColor,'" x="',t(r+a,e),'" y="',t(n-this.height/2,e),'" width="',t(o,e),'" height="',t(s/this.lineHeight,e),'"></rect>\n'].join("")},_createTextCharSpan:function(i,r,n,s,o){var a=this.getSvgStyles.call(fabric.util.object.extend({visible:!0,fill:this.fill,stroke:this.stroke,type:"text",getSvgFilter:fabric.Object.prototype.getSvgFilter},r));return['\t\t\t<tspan x="',t(n+o,e),'" y="',t(s-this.height/2,e),'" ',r.fontFamily?'font-family="'+r.fontFamily.replace(/"/g,"'")+'" ':"",r.fontSize?'font-size="'+r.fontSize+'" ':"",r.fontStyle?'font-style="'+r.fontStyle+'" ':"",r.fontWeight?'font-weight="'+r.fontWeight+'" ':"",r.textDecoration?'text-decoration="'+r.textDecoration+'" ':"",'style="',a,'">',fabric.util.string.escapeXml(i),"</tspan>\n"].join("")}})}(),function(t){"use strict";var e=t.fabric||(t.fabric={}),i=e.util.object.clone;e.Textbox=e.util.createClass(e.IText,e.Observable,{type:"textbox",minWidth:20,dynamicMinWidth:2,__cachedLines:null,lockScalingY:!0,lockScalingFlip:!0,initialize:function(t,i){this.ctx=e.util.createCanvasElement().getContext("2d"),this.callSuper("initialize",t,i),this.setControlsVisibility(e.Textbox.getTextboxControlVisibility()),this._dimensionAffectingProps.width=!0},_initDimensions:function(t){this.__skipDimension||(t||(t=e.util.createCanvasElement().getContext("2d"),this._setTextStyles(t)),this.dynamicMinWidth=0,this._textLines=this._splitTextIntoLines(),this.dynamicMinWidth>this.width&&this._set("width",this.dynamicMinWidth),this._clearCache(),this.height=this._getTextHeight(t))},_generateStyleMap:function(){for(var t=0,e=0,i=0,r={},n=0;n<this._textLines.length;n++)"\n"===this.text[i]&&n>0?(e=0,i++,t++):" "===this.text[i]&&n>0&&(e++,i++),r[n]={line:t,offset:e},i+=this._textLines[n].length,e+=this._textLines[n].length;return r},_getStyleDeclaration:function(t,e,i){if(this._styleMap){var r=this._styleMap[t];if(!r)return i?{}:null;t=r.line,e=r.offset+e}return this.callSuper("_getStyleDeclaration",t,e,i)},_setStyleDeclaration:function(t,e,i){var r=this._styleMap[t];t=r.line,e=r.offset+e,this.styles[t][e]=i},_deleteStyleDeclaration:function(t,e){var i=this._styleMap[t];t=i.line,e=i.offset+e,delete this.styles[t][e]},_getLineStyle:function(t){var e=this._styleMap[t];return this.styles[e.line]},_setLineStyle:function(t,e){var i=this._styleMap[t];this.styles[i.line]=e},_deleteLineStyle:function(t){var e=this._styleMap[t];delete this.styles[e.line]},_wrapText:function(t,e){var i,r=e.split(this._reNewline),n=[];for(i=0;i<r.length;i++)n=n.concat(this._wrapLine(t,r[i],i));return n},_measureText:function(t,e,i,r){var n=0;r=r||0;for(var s=0,o=e.length;s<o;s++)n+=this._getWidthOfChar(t,e[s],i,s+r);return n},_wrapLine:function(t,e,i){for(var r=0,n=[],s="",o=e.split(" "),a="",h=0,c=" ",l=0,u=0,f=0,d=!0,g=this._getWidthOfCharSpacing(),p=0;p<o.length;p++)a=o[p],l=this._measureText(t,a,i,h),h+=a.length,r+=u+l-g,r>=this.width&&!d?(n.push(s),s="",r=l,d=!0):r+=g,d||(s+=c),s+=a,u=this._measureText(t,c,i,h),h++,d=!1,l>f&&(f=l);return p&&n.push(s),f>this.dynamicMinWidth&&(this.dynamicMinWidth=f-g),n},_splitTextIntoLines:function(){var t=this.textAlign;this.ctx.save(),this._setTextStyles(this.ctx),this.textAlign="left";var e=this._wrapText(this.ctx,this.text);return this.textAlign=t,this.ctx.restore(),this._textLines=e,this._styleMap=this._generateStyleMap(),e},setOnGroup:function(t,e){"scaleX"===t&&(this.set("scaleX",Math.abs(1/e)),this.set("width",this.get("width")*e/("undefined"==typeof this.__oldScaleX?1:this.__oldScaleX)),this.__oldScaleX=e)},get2DCursorLocation:function(t){"undefined"==typeof t&&(t=this.selectionStart);for(var e=this._textLines.length,i=0,r=0;r<e;r++){var n=this._textLines[r],s=n.length;if(t<=i+s)return{lineIndex:r,charIndex:t-i};i+=s,"\n"!==this.text[i]&&" "!==this.text[i]||i++}return{lineIndex:e-1,charIndex:this._textLines[e-1].length}},_getCursorBoundariesOffsets:function(t,e){for(var i=0,r=0,n=this.get2DCursorLocation(),s=this._textLines[n.lineIndex].split(""),o=this._getLineLeftOffset(this._getLineWidth(this.ctx,n.lineIndex)),a=0;a<n.charIndex;a++)r+=this._getWidthOfChar(this.ctx,s[a],n.lineIndex,a);for(a=0;a<n.lineIndex;a++)i+=this._getHeightOfLine(this.ctx,a);return"cursor"===e&&(i+=(1-this._fontSizeFraction)*this._getHeightOfLine(this.ctx,n.lineIndex)/this.lineHeight-this.getCurrentCharFontSize(n.lineIndex,n.charIndex)*(1-this._fontSizeFraction)),{top:i,left:r,lineLeft:o}},getMinWidth:function(){return Math.max(this.minWidth,this.dynamicMinWidth)},toObject:function(t){return this.callSuper("toObject",["minWidth"].concat(t))}}),e.Textbox.fromObject=function(t,r){var n=new e.Textbox(t.text,i(t));return r&&r(n),n},e.Textbox.getTextboxControlVisibility=function(){return{tl:!1,tr:!1,br:!1,bl:!1,ml:!0,mt:!1,mr:!0,mb:!1,mtr:!0}}}("undefined"!=typeof exports?exports:this),function(){var t=fabric.Canvas.prototype._setObjectScale;fabric.Canvas.prototype._setObjectScale=function(e,i,r,n,s,o,a){var h=i.target;if(!(h instanceof fabric.Textbox))return t.call(fabric.Canvas.prototype,e,i,r,n,s,o,a);var c=h.width*(e.x/i.scaleX/(h.width+h.strokeWidth));return c>=h.getMinWidth()?(h.set("width",c),!0):void 0},fabric.Group.prototype._refreshControlsVisibility=function(){if("undefined"!=typeof fabric.Textbox)for(var t=this._objects.length;t--;)if(this._objects[t]instanceof fabric.Textbox)return void this.setControlsVisibility(fabric.Textbox.getTextboxControlVisibility())};var e=fabric.util.object.clone;fabric.util.object.extend(fabric.Textbox.prototype,{_removeExtraneousStyles:function(){for(var t in this._styleMap)this._textLines[t]||delete this.styles[this._styleMap[t].line]},insertCharStyleObject:function(t,e,i){var r=this._styleMap[t];t=r.line,e=r.offset+e,fabric.IText.prototype.insertCharStyleObject.apply(this,[t,e,i])},insertNewlineStyleObject:function(t,e,i){var r=this._styleMap[t];t=r.line,e=r.offset+e,fabric.IText.prototype.insertNewlineStyleObject.apply(this,[t,e,i])},shiftLineStyles:function(t,i){var r=e(this.styles),n=this._styleMap[t];t=n.line;for(var s in this.styles){var o=parseInt(s,10);o>t&&(this.styles[o+i]=r[o],r[o-i]||delete this.styles[o])}},_getTextOnPreviousLine:function(t){for(var e=this._textLines[t-1];this._styleMap[t-2]&&this._styleMap[t-2].line===this._styleMap[t-1].line;)e=this._textLines[t-2]+e,t--;return e},removeStyleObject:function(t,e){var i=this.get2DCursorLocation(e),r=this._styleMap[i.lineIndex],n=r.line,s=r.offset+i.charIndex;this._removeStyleObject(t,i,n,s)}})}(),function(){var t=fabric.IText.prototype._getNewSelectionStartFromOffset;fabric.IText.prototype._getNewSelectionStartFromOffset=function(e,i,r,n,s){n=t.call(this,e,i,r,n,s);for(var o=0,a=0,h=0;h<this._textLines.length&&(o+=this._textLines[h].length,!(o+a>=n));h++)"\n"!==this.text[o+a]&&" "!==this.text[o+a]||a++;return n-h+a}}(),function(){function request(t,e,i){var r=URL.parse(t);r.port||(r.port=0===r.protocol.indexOf("https:")?443:80);var n=0===r.protocol.indexOf("https:")?HTTPS:HTTP,s=n.request({hostname:r.hostname,port:r.port,path:r.path,method:"GET"},function(t){var r="";e&&t.setEncoding(e),t.on("end",function(){i(r)}),t.on("data",function(e){200===t.statusCode&&(r+=e)})});s.on("error",function(t){t.errno===process.ECONNREFUSED?fabric.log("ECONNREFUSED: connection refused to "+r.hostname+":"+r.port):fabric.log(t.message),i(null)}),s.end()}function requestFs(t,e){var i=require("fs");i.readFile(t,function(t,i){if(t)throw fabric.log(t),t;e(i)})}if("undefined"==typeof document||"undefined"==typeof window){var DOMParser=require("xmldom").DOMParser,URL=require("url"),HTTP=require("http"),HTTPS=require("https"),Canvas=require("canvas"),Image=require("canvas").Image;fabric.util.loadImage=function(t,e,i){function r(r){r?(n.src=new Buffer(r,"binary"),n._src=t,e&&e.call(i,n)):(n=null,e&&e.call(i,null,!0))}var n=new Image;t&&(t instanceof Buffer||0===t.indexOf("data"))?(n.src=n._src=t,e&&e.call(i,n)):t&&0!==t.indexOf("http")?requestFs(t,r):t?request(t,"binary",r):e&&e.call(i,t)},fabric.loadSVGFromURL=function(t,e,i){t=t.replace(/^\n\s*/,"").replace(/\?.*$/,"").trim(),0!==t.indexOf("http")?requestFs(t,function(t){fabric.loadSVGFromString(t.toString(),e,i)}):request(t,"",function(t){fabric.loadSVGFromString(t,e,i)})},fabric.loadSVGFromString=function(t,e,i){var r=(new DOMParser).parseFromString(t);fabric.parseSVGDocument(r.documentElement,function(t,i){e&&e(t,i)},i)},fabric.util.getScript=function(url,callback){request(url,"",function(body){eval(body),callback&&callback()})},fabric.createCanvasForNode=function(t,e,i,r){r=r||i;var n=fabric.document.createElement("canvas"),s=new Canvas(t||600,e||600,r),o=new Canvas(t||600,e||600,r);n.style={},n.width=s.width,n.height=s.height,i=i||{},i.nodeCanvas=s,i.nodeCacheCanvas=o;var a=fabric.Canvas||fabric.StaticCanvas,h=new a(n,i);return h.nodeCanvas=s,h.nodeCacheCanvas=o,h.contextContainer=s.getContext("2d"),h.contextCache=o.getContext("2d"),h.Font=Canvas.Font,h};var originaInitStatic=fabric.StaticCanvas.prototype._initStatic;fabric.StaticCanvas.prototype._initStatic=function(t,e){t=t||fabric.document.createElement("canvas"),this.nodeCanvas=new Canvas(t.width,t.height),this.nodeCacheCanvas=new Canvas(t.width,t.height),originaInitStatic.call(this,t,e),this.contextContainer=this.nodeCanvas.getContext("2d"),this.contextCache=this.nodeCacheCanvas.getContext("2d"),this.Font=Canvas.Font},fabric.StaticCanvas.prototype.createPNGStream=function(){return this.nodeCanvas.createPNGStream()},fabric.StaticCanvas.prototype.createJPEGStream=function(t){return this.nodeCanvas.createJPEGStream(t)},fabric.StaticCanvas.prototype._initRetinaScaling=function(){if(this._isRetinaScaling())return this.lowerCanvasEl.setAttribute("width",this.width*fabric.devicePixelRatio),this.lowerCanvasEl.setAttribute("height",this.height*fabric.devicePixelRatio),this.nodeCanvas.width=this.width*fabric.devicePixelRatio,this.nodeCanvas.height=this.height*fabric.devicePixelRatio,this.contextContainer.scale(fabric.devicePixelRatio,fabric.devicePixelRatio),this},fabric.Canvas&&(fabric.Canvas.prototype._initRetinaScaling=fabric.StaticCanvas.prototype._initRetinaScaling);var origSetBackstoreDimension=fabric.StaticCanvas.prototype._setBackstoreDimension;fabric.StaticCanvas.prototype._setBackstoreDimension=function(t,e){return origSetBackstoreDimension.call(this,t,e),this.nodeCanvas[t]=e,this},fabric.Canvas&&(fabric.Canvas.prototype._setBackstoreDimension=fabric.StaticCanvas.prototype._setBackstoreDimension)}}();
!function(a){"use strict";var b=a.fabric||(a.fabric={}),c="1.6",d=function(){return"undefined"!=typeof G_vmlCanvasManager},e=b.util.degreesToRadians,f={mt:0,tr:1,mr:2,br:3,mb:4,bl:5,ml:6,tl:7};-1===a.fabric.version.indexOf(c)&&console.warn("this extension might not be fully compatible with your version of fabric.js ("+a.fabric.version+").Consider using the latest compatible build of fabric.js"+c),b.util.object.extend(b.Object.prototype,{useCustomIcons:!1,cornerBackgroundColor:"transparent",cornerShape:"",cornerPadding:0,customiseCornerIcons:function(a,b){var c;for(c in a)a.hasOwnProperty(c)&&(void 0!==a[c].cornerShape&&(this.cornerShape=a[c].cornerShape),void 0!==a[c].cornerBackgroundColor&&(this.cornerBackgroundColor=a[c].cornerBackgroundColor),void 0!==a[c].borderColor&&(this.borderColor=a[c].borderColor),void 0!==a[c].cornerSize&&(this.cornerSize=a[c].cornerSize),void 0!==a[c].cornerPadding&&(this.cornerPadding=a[c].cornerPadding),void 0!==a[c].icon&&(this.useCustomIcons=!0,this.loadIcon(c,a[c].icon,function(){b&&"function"==typeof b&&b()})))},loadIcon:function(a,c,d){var e=this,f=new Image;f.onload=function(){e[a+"Icon"]=this,d&&"function"==typeof d&&d()},f.onerror=function(){b.warn(this.src+" icon is not an image")},c.indexOf("http")>-1&&(f.crossOrigin="Anonymous"),f.src=c},customizeCornerIcons:function(a){this.customiseCornerIcons(a)},drawControls:function(a){if(!this.hasControls)return this;var b,c=this._calculateCurrentDimensions(!0),d=c.x,e=c.y,f=this.cornerSize,g=-(d+f)/2,h=-(e+f)/2;return this.useCustomIcons?b="drawImage":(a.lineWidth=1,a.globalAlpha=this.isMoving?this.borderOpacityWhenMoving:1,a.strokeStyle=a.fillStyle=this.cornerColor,b=this.transparentCorners?"strokeRect":"fillRect"),a.save(),this._drawControl("tl",a,b,g,h,this.tlIcon),this._drawControl("tr",a,b,g+d,h,this.trIcon),this._drawControl("bl",a,b,g,h+e,this.blIcon),this._drawControl("br",a,b,g+d,h+e,this.brIcon),this.get("lockUniScaling")||(this._drawControl("mt",a,b,g+d/2,h,this.mtIcon),this._drawControl("mb",a,b,g+d/2,h+e,this.mbIcon),this._drawControl("mr",a,b,g+d,h+e/2,this.mrIcon),this._drawControl("ml",a,b,g,h+e/2,this.mlIcon)),this.hasRotatingPoint&&this._drawControl("mtr",a,b,g+d/2,h-this.rotatingPointOffset,this.mtrIcon),a.restore(),this},_drawControl:function(a,b,c,e,f,g){if(this.isControlVisible(a)){var h=this.cornerSize,i=this.cornerBackgroundColor||"black",j=this.cornerShape||"rect",k=this.cornerPadding||10;if(this.useCustomIcons)if(j)switch(b.globalAlpha=1,b.fillStyle=i,j){case"rect":b.fillRect(e,f,h,h),void 0!==g&&b[c](g,e+k/2,f+k/2,h-k,h-k);break;case"circle":b.beginPath(),b.arc(e+h/2,f+h/2,h/2,0,2*Math.PI),b.fill(),b.closePath(),void 0!==g&&b[c](g,e+k/2,f+k/2,h-k,h-k)}else void 0!==g&&b[c](g,e,f,h,h);else d()||this.transparentCorners||b.clearRect(e,f,h,h),b[c](e,f,h,h)}}}),b.util.object.extend(b.Canvas.prototype,{overwriteActions:!1,fixedCursors:!1,customiseControls:function(a){var b;for(b in a)a.hasOwnProperty(b)&&(void 0!==a[b].action&&(this.overwriteActions=!0,this.setCustomAction(b,a[b].action)),void 0!==a[b].cursor&&(this.fixedCursors=!0,this.setCustomCursor(b,a[b].cursor)))},setCustomAction:function(a,b){this[a+"Action"]=b},setCustomCursor:function(a,b){this[a+"cursorIcon"]=b},customizeControls:function(a){this.customiseControls(a)},_getActionFromCorner:function(a,b,c){if(!b)return"drag";if(b)if(this[b+"Action"]&&this.overwriteActions)switch(b){case"mtr":return this[b+"Action"]||"rotate";case"ml":case"mr":return c.shiftKey?c.shiftKey?"skewY":"scaleX":this[b+"Action"];case"mt":case"mb":return c.shiftKey?c.shiftKey?"skewY":"scaleY":this[b+"Action"];default:return this[b+"Action"]||"scale"}else switch(b){case"mtr":return"rotate";case"ml":case"mr":return c.shiftKey?"skewY":"scaleX";case"mt":case"mb":return c.shiftKey?"skewX":"scaleY";default:return"scale"}},_setupCurrentTransform:function(a,b){if(b){var c=this.getPointer(a),d=b._findTargetCorner(this.getPointer(a,!0)),f=this._getActionFromCorner(b,d,a),g=this._getOriginFromCorner(b,d),h=this;"function"==typeof f&&f.call(h,a,b),this._currentTransform={target:b,action:f,corner:d,scaleX:b.scaleX,scaleY:b.scaleY,skewX:b.skewX,skewY:b.skewY,offsetX:c.x-b.left,offsetY:c.y-b.top,originX:g.x,originY:g.y,ex:c.x,ey:c.y,lastX:c.x,lastY:c.y,left:b.left,top:b.top,theta:e(b.angle),width:b.width*b.scaleX,mouseXSign:1,mouseYSign:1,shiftKey:a.shiftKey,altKey:a.altKey},this._currentTransform.original={left:b.left,top:b.top,scaleX:b.scaleX,scaleY:b.scaleY,skewX:b.skewX,skewY:b.skewY,originX:g.x,originY:g.y},"remove"===f&&this._removeAction(a,b),"moveUp"===f&&this._moveLayerUpAction(a,b),"moveDown"===f&&this._moveLayerDownAction(a,b),"object"==typeof f&&"rotateByDegrees"===Object.keys(f)[0]&&this._rotateByDegrees(a,b,f.rotateByDegrees),this._resetCurrentTransform(a)}},_removeAction:function(a,b){var c=this;this.getActiveGroup()&&"undefined"!==this.getActiveGroup()?(this.getActiveGroup().forEachObject(function(a){a.remove()}),this.discardActiveGroup(),setTimeout(function(){c.deactivateAll()},0)):(b.remove(),setTimeout(function(){c.deactivateAll()},0))},_moveLayerUpAction:function(a,b){this.getActiveGroup()&&"undefined"!==this.getActiveGroup()?this.getActiveGroup().forEachObject(function(a){a.bringForward()}):b.bringForward()},_moveLayerDownAction:function(a,b){this.getActiveGroup()&&"undefined"!==this.getActiveGroup()?this.getActiveGroup().forEachObject(function(a){a.sendBackwards()}):b.sendBackwards()},_rotateByDegrees:function(a,b,c){var d=parseInt(b.getAngle())+c,e=!1;"center"===b.originX&&"center"===b.originY||!b.centeredRotation||(this._setOriginToCenter(b),e=!0),d=d>360?d-360:d,this.getActiveGroup()&&"undefined"!==this.getActiveGroup()?this.getActiveGroup().forEachObject(function(a){a.setAngle(d).setCoords()}):b.setAngle(d).setCoords(),e&&this._setCenterToOrigin(b),this.renderAll()},_setOriginToCenter:function(a){a._originalOriginX=a.originX,a._originalOriginY=a.originY;var b=a.getCenterPoint();a.set({originX:"center",originY:"center",left:b.x,top:b.y})},_setCenterToOrigin:function(a){var b=a.translateToOriginPoint(a.getCenterPoint(),a._originalOriginX,a._originalOriginY);a.set({originX:a._originalOriginX,originY:a._originalOriginY,left:b.x,top:b.y})},_setCornerCursor:function(a,b,c){var d=/\.(?:jpe?g|png|gif|jpg|jpeg|svg)$/;if(this.fixedCursors&&this[a+"cursorIcon"])d.test(this[a+"cursorIcon"])?this.setCursor("url("+this[a+"cursorIcon"]+"), auto"):"resize"===this[a+"cursorIcon"]?this.setCursor(this._getRotatedCornerCursor(a,b,c)):this.setCursor(this[a+"cursorIcon"]);else if(a in f)this.setCursor(this._getRotatedCornerCursor(a,b,c));else{if("mtr"!==a||!b.hasRotatingPoint)return this.setCursor(this.defaultCursor),!1;this.setCursor(this.rotationCursor)}}})}("undefined"!=typeof exports?exports:this);
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):t.jspdf=e()}(this,function(){"use strict";var t="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol?"symbol":typeof t},e=function(e){function n(t){var n={};this.subscribe=function(t,e,r){if("function"!=typeof e)return!1;n.hasOwnProperty(t)||(n[t]={});var i=Math.random().toString(35);return n[t][i]=[e,!!r],i},this.unsubscribe=function(t){for(var e in n)if(n[e][t])return delete n[e][t],!0;return!1},this.publish=function(r){if(n.hasOwnProperty(r)){var i=Array.prototype.slice.call(arguments,1),o=[];for(var a in n[r]){var s=n[r][a];try{s[0].apply(t,i)}catch(t){e.console&&console.error("jsPDF PubSub Error",t.message,t)}s[1]&&o.push(a)}o.length&&o.forEach(this.unsubscribe)}}}function r(c,l,u,h){var f={};"object"===("undefined"==typeof c?"undefined":t(c))&&(f=c,c=f.orientation,l=f.unit||l,u=f.format||u,h=f.compress||f.compressPdf||h),l=l||"mm",u=u||"a4",c=(""+(c||"P")).toLowerCase();var d,p,g,m,w,y,v,b,x,k=((""+u).toLowerCase(),!!h&&"function"==typeof Uint8Array),_=f.textColor||"0 g",C=f.drawColor||"0 G",A=f.fontSize||16,S=f.lineHeight||1.15,q=f.lineWidth||.200025,T=2,I=!1,P=[],E={},O={},F=0,R=[],B=[],D=[],j=[],N=[],z=0,L=0,M=0,U={title:"",subject:"",author:"",keywords:"",creator:""},H={},W=new n(H),X=function(t){return t.toFixed(2)},V=function(t){return t.toFixed(3)},Y=function(t){return("0"+parseInt(t)).slice(-2)},G=function(t){I?R[m].push(t):(M+=t.length+1,j.push(t))},J=function(){return T++,P[T]=M,G(T+" 0 obj"),T},Q=function(){var t=2*R.length+1;t+=N.length;var e={objId:t,content:""};return N.push(e),e},K=function(){return T++,P[T]=function(){return M},T},$=function(t){P[t]=M},Z=function(t){G("stream"),G(t),G("endstream")},tt=function(){var t,n,i,o,s,c,l,u,h,f=[];for(l=e.adler32cs||r.adler32cs,k&&"undefined"==typeof l&&(k=!1),t=1;t<=F;t++){if(f.push(J()),u=(w=D[t].width)*p,h=(y=D[t].height)*p,G("<</Type /Page"),G("/Parent 1 0 R"),G("/Resources 2 0 R"),G("/MediaBox [0 0 "+X(u)+" "+X(h)+"]"),W.publish("putPage",{pageNumber:t,page:R[t]}),G("/Contents "+(T+1)+" 0 R"),G(">>"),G("endobj"),n=R[t].join("\n"),J(),k){for(i=[],o=n.length;o--;)i[o]=n.charCodeAt(o);c=l.from(n),s=new a(6),s.append(new Uint8Array(i)),n=s.flush(),i=new Uint8Array(n.length+6),i.set(new Uint8Array([120,156])),i.set(n,2),i.set(new Uint8Array([255&c,c>>8&255,c>>16&255,c>>24&255]),n.length+2),n=String.fromCharCode.apply(null,i),G("<</Length "+n.length+" /Filter [/FlateDecode]>>")}else G("<</Length "+n.length+">>");Z(n),G("endobj")}P[1]=M,G("1 0 obj"),G("<</Type /Pages");var d="/Kids [";for(o=0;o<F;o++)d+=f[o]+" 0 R ";G(d+"]"),G("/Count "+F),G(">>"),G("endobj"),W.publish("postPutPages")},et=function(t){t.objectNumber=J(),G("<</BaseFont/"+t.PostScriptName+"/Type/Font"),"string"==typeof t.encoding&&G("/Encoding/"+t.encoding),G("/Subtype/Type1>>"),G("endobj")},nt=function(){for(var t in E)E.hasOwnProperty(t)&&et(E[t])},rt=function(){W.publish("putXobjectDict")},it=function(){G("/ProcSet [/PDF /Text /ImageB /ImageC /ImageI]"),G("/Font <<");for(var t in E)E.hasOwnProperty(t)&&G("/"+t+" "+E[t].objectNumber+" 0 R");G(">>"),G("/XObject <<"),rt(),G(">>")},ot=function(){nt(),W.publish("putResources"),P[2]=M,G("2 0 obj"),G("<<"),it(),G(">>"),G("endobj"),W.publish("postPutResources")},at=function(){W.publish("putAdditionalObjects");for(var t=0;t<N.length;t++){var e=N[t];P[e.objId]=M,G(e.objId+" 0 obj"),G(e.content),G("endobj")}T+=N.length,W.publish("postPutAdditionalObjects")},st=function(t,e,n){O.hasOwnProperty(e)||(O[e]={}),O[e][n]=t},ct=function(t,e,n,r){var i="F"+(Object.keys(E).length+1).toString(10),o=E[i]={id:i,PostScriptName:t,fontName:e,fontStyle:n,encoding:r,metadata:{}};return st(i,e,n),W.publish("addFont",o),i},lt=function(){for(var t="helvetica",e="times",n="courier",r="normal",i="bold",o="italic",a="bolditalic",s="StandardEncoding",c="zapfdingbats",l=[["Helvetica",t,r],["Helvetica-Bold",t,i],["Helvetica-Oblique",t,o],["Helvetica-BoldOblique",t,a],["Courier",n,r],["Courier-Bold",n,i],["Courier-Oblique",n,o],["Courier-BoldOblique",n,a],["Times-Roman",e,r],["Times-Bold",e,i],["Times-Italic",e,o],["Times-BoldItalic",e,a],["ZapfDingbats",c]],u=0,h=l.length;u<h;u++){var f=ct(l[u][0],l[u][1],l[u][2],s),d=l[u][0].split("-");st(f,d[0],d[1]||"")}W.publish("addFonts",{fonts:E,dictionary:O})},ut=function(t){return t.foo=function(){try{return t.apply(this,arguments)}catch(t){var n=t.stack||"";~n.indexOf(" at ")&&(n=n.split(" at ")[1]);var r="Error in function "+n.split("\n")[0].split("<")[0]+": "+t.message;if(!e.console)throw new Error(r);e.console.error(r,t),e.alert&&alert(r)}},t.foo.bar=t,t.foo},ht=function(t,e){var n,r,i,o,a,s,c,l,u;if(e=e||{},i=e.sourceEncoding||"Unicode",a=e.outputEncoding,(e.autoencode||a)&&E[d].metadata&&E[d].metadata[i]&&E[d].metadata[i].encoding&&(o=E[d].metadata[i].encoding,!a&&E[d].encoding&&(a=E[d].encoding),!a&&o.codePages&&(a=o.codePages[0]),"string"==typeof a&&(a=o[a]),a)){for(c=!1,s=[],n=0,r=t.length;n<r;n++)l=a[t.charCodeAt(n)],l?s.push(String.fromCharCode(l)):s.push(t[n]),s[n].charCodeAt(0)>>8&&(c=!0);t=s.join("")}for(n=t.length;void 0===c&&0!==n;)t.charCodeAt(n-1)>>8&&(c=!0),n--;if(!c)return t;for(s=e.noBOM?[]:[254,255],n=0,r=t.length;n<r;n++){if(l=t.charCodeAt(n),u=l>>8,u>>8)throw new Error("Character at position "+n+" of string '"+t+"' exceeds 16bits. Cannot be encoded into UCS-2 BE");s.push(u),s.push(l-(u<<8))}return String.fromCharCode.apply(void 0,s)},ft=function(t,e){return ht(t,e).replace(/\\/g,"\\\\").replace(/\(/g,"\\(").replace(/\)/g,"\\)")},dt=function(){G("/Producer (jsPDF "+r.version+")");for(var t in U)U.hasOwnProperty(t)&&U[t]&&G("/"+t.substr(0,1).toUpperCase()+t.substr(1)+" ("+ft(U[t])+")");var e=new Date,n=e.getTimezoneOffset(),i=n<0?"+":"-",o=Math.floor(Math.abs(n/60)),a=Math.abs(n%60),s=[i,Y(o),"'",Y(a),"'"].join("");G(["/CreationDate (D:",e.getFullYear(),Y(e.getMonth()+1),Y(e.getDate()),Y(e.getHours()),Y(e.getMinutes()),Y(e.getSeconds()),s,")"].join(""))},pt=function(){switch(G("/Type /Catalog"),G("/Pages 1 0 R"),b||(b="fullwidth"),b){case"fullwidth":G("/OpenAction [3 0 R /FitH null]");break;case"fullheight":G("/OpenAction [3 0 R /FitV null]");break;case"fullpage":G("/OpenAction [3 0 R /Fit]");break;case"original":G("/OpenAction [3 0 R /XYZ null null 1]");break;default:var t=""+b;"%"===t.substr(t.length-1)&&(b=parseInt(b)/100),"number"==typeof b&&G("/OpenAction [3 0 R /XYZ null null "+X(b)+"]")}switch(x||(x="continuous"),x){case"continuous":G("/PageLayout /OneColumn");break;case"single":G("/PageLayout /SinglePage");break;case"two":case"twoleft":G("/PageLayout /TwoColumnLeft");break;case"tworight":G("/PageLayout /TwoColumnRight")}v&&G("/PageMode /"+v),W.publish("putCatalog")},gt=function(){G("/Size "+(T+1)),G("/Root "+T+" 0 R"),G("/Info "+(T-1)+" 0 R")},mt=function(t,e){var n="string"==typeof e&&e.toLowerCase();if("string"==typeof t){var r=t.toLowerCase();s.hasOwnProperty(r)&&(t=s[r][0]/p,e=s[r][1]/p)}if(Array.isArray(t)&&(e=t[1],t=t[0]),n){switch(n.substr(0,1)){case"l":e>t&&(n="s");break;case"p":t>e&&(n="s")}"s"===n&&(g=t,t=e,e=g)}I=!0,R[++F]=[],D[F]={width:Number(t)||w,height:Number(e)||y},B[F]={},vt(F)},wt=function(){mt.apply(this,arguments),G(X(q*p)+" w"),G(C),0!==z&&G(z+" J"),0!==L&&G(L+" j"),W.publish("addPage",{pageNumber:F})},yt=function(t){t>0&&t<=F&&(R.splice(t,1),D.splice(t,1),F--,m>F&&(m=F),this.setPage(m))},vt=function(t){t>0&&t<=F&&(m=t,w=D[t].width,y=D[t].height)},bt=function(t,e){var n;switch(t=void 0!==t?t:E[d].fontName,e=void 0!==e?e:E[d].fontStyle,void 0!==t&&(t=t.toLowerCase()),t){case"sans-serif":case"verdana":case"arial":case"helvetica":t="helvetica";break;case"fixed":case"monospace":case"terminal":case"courier":t="courier";break;case"serif":case"cursive":case"fantasy":default:t="times"}try{n=O[t][e]}catch(t){}return n||(n=O.times[e],null==n&&(n=O.times.normal)),n},xt=function(){I=!1,T=2,M=0,j=[],P=[],N=[],W.publish("buildDocument"),G("%PDF-"+o),tt(),at(),ot(),J(),G("<<"),dt(),G(">>"),G("endobj"),J(),G("<<"),pt(),G(">>"),G("endobj");var t,e=M,n="0000000000";for(G("xref"),G("0 "+(T+1)),G(n+" 65535 f "),t=1;t<=T;t++){var r=P[t];G("function"==typeof r?(n+P[t]()).slice(-10)+" 00000 n ":(n+P[t]).slice(-10)+" 00000 n ")}return G("trailer"),G("<<"),gt(),G(">>"),G("startxref"),G(""+e),G("%%EOF"),I=!0,j.join("\n")},kt=function(t){var e="S";return"F"===t?e="f":"FD"===t||"DF"===t?e="B":"f"!==t&&"f*"!==t&&"B"!==t&&"B*"!==t||(e=t),e},_t=function(){for(var t=xt(),e=t.length,n=new ArrayBuffer(e),r=new Uint8Array(n);e--;)r[e]=t.charCodeAt(e);return n},Ct=function(){return new Blob([_t()],{type:"application/pdf"})},At=ut(function(t,n){var r="dataur"===(""+t).substr(0,6)?"data:application/pdf;base64,"+btoa(xt()):0;switch(t){case void 0:return xt();case"save":if(navigator.getUserMedia&&(void 0===e.URL||void 0===e.URL.createObjectURL))return H.output("dataurlnewwindow");i(Ct(),n),"function"==typeof i.unload&&e.setTimeout&&setTimeout(i.unload,911);break;case"arraybuffer":return _t();case"blob":return Ct();case"bloburi":case"bloburl":return e.URL&&e.URL.createObjectURL(Ct())||void 0;case"datauristring":case"dataurlstring":return r;case"dataurlnewwindow":var o=e.open(r);if(o||"undefined"==typeof safari)return o;case"datauri":case"dataurl":return e.document.location.href=r;default:throw new Error('Output type "'+t+'" is not supported.')}});switch(l){case"pt":p=1;break;case"mm":p=72/25.4000508;break;case"cm":p=72/2.54000508;break;case"in":p=72;break;case"px":p=96/72;break;case"pc":p=12;break;case"em":p=12;break;case"ex":p=6;break;default:throw"Invalid unit: "+l}H.internal={pdfEscape:ft,getStyle:kt,getFont:function(){return E[bt.apply(H,arguments)]},getFontSize:function(){return A},getLineHeight:function(){return A*S},write:function(t){G(1===arguments.length?t:Array.prototype.join.call(arguments," "))},getCoordinateString:function(t){return X(t*p)},getVerticalCoordinateString:function(t){return X((y-t)*p)},collections:{},newObject:J,newAdditionalObject:Q,newObjectDeferred:K,newObjectDeferredBegin:$,putStream:Z,events:W,scaleFactor:p,pageSize:{get width(){return w},get height(){return y}},output:function(t,e){return At(t,e)},getNumberOfPages:function(){return R.length-1},pages:R,out:G,f2:X,getPageInfo:function(t){var e=2*(t-1)+3;return{objId:e,pageNumber:t,pageContext:B[t]}},getCurrentPageInfo:function(){var t=2*(m-1)+3;return{objId:t,pageNumber:m,pageContext:B[m]}},getPDFVersion:function(){return o}},H.addPage=function(){return wt.apply(this,arguments),this},H.setPage=function(){return vt.apply(this,arguments),this},H.insertPage=function(t){return this.addPage(),this.movePage(m,t),this},H.movePage=function(t,e){if(t>e){for(var n=R[t],r=D[t],i=B[t],o=t;o>e;o--)R[o]=R[o-1],D[o]=D[o-1],B[o]=B[o-1];R[e]=n,D[e]=r,B[e]=i,this.setPage(e)}else if(t<e){for(var n=R[t],r=D[t],i=B[t],o=t;o<e;o++)R[o]=R[o+1],D[o]=D[o+1],B[o]=B[o+1];R[e]=n,D[e]=r,B[e]=i,this.setPage(e)}return this},H.deletePage=function(){return yt.apply(this,arguments),this},H.setDisplayMode=function(t,e,n){return b=t,x=e,v=n,this},H.text=function(t,e,n,r,i,o){function a(t){return t=t.split("\t").join(Array(f.TabLen||9).join(" ")),ft(t,r)}"number"==typeof t&&(g=n,n=e,e=t,t=g),"string"==typeof t&&(t=t.match(/[\n\r]/)?t.split(/\r\n|\r|\n/g):[t]),"string"==typeof i&&(o=i,i=null),"string"==typeof r&&(o=r,r=null),"number"==typeof r&&(i=r,r=null);var s,c="",l="Td";if(i){i*=Math.PI/180;var u=Math.cos(i),h=Math.sin(i);c=[X(u),X(h),X(h*-1),X(u),""].join(" "),l="Tm"}r=r||{},"noBOM"in r||(r.noBOM=!0),"autoencode"in r||(r.autoencode=!0);var m="",w=this.internal.getCurrentPageInfo().pageContext;if(!0===r.stroke?w.lastTextWasStroke!==!0&&(m="1 Tr\n",w.lastTextWasStroke=!0):(w.lastTextWasStroke&&(m="0 Tr\n"),w.lastTextWasStroke=!1),"undefined"==typeof this._runningPageHeight&&(this._runningPageHeight=0),"string"==typeof t)t=a(t);else{if("[object Array]"!==Object.prototype.toString.call(t))throw new Error('Type of text must be string or Array. "'+t+'" is not recognized.');for(var v=t.concat(),b=[],x=v.length;x--;)b.push(a(v.shift()));var k=Math.ceil((y-n-this._runningPageHeight)*p/(A*S));if(0<=k&&k<b.length+1,o){var C,q,T,I=A*S,P=t.map(function(t){return this.getStringUnitWidth(t)*A/p},this);if(T=Math.max.apply(Math,P),"center"===o)C=e-T/2,e-=P[0]/2;else{if("right"!==o)throw new Error('Unrecognized alignment option, use "center" or "right".');C=e-T,e-=P[0]}q=e,t=b[0];for(var E=1,x=b.length;E<x;E++){var O=T-P[E];"center"===o&&(O/=2),t+=") Tj\n"+(C-q+O)+" -"+I+" Td ("+b[E],q=C+O}}else t=b.join(") Tj\nT* (")}var F;return s||(F=X((y-n)*p)),G("BT\n/"+d+" "+A+" Tf\n"+A*S+" TL\n"+m+_+"\n"+c+X(e*p)+" "+F+" "+l+"\n("+t+") Tj\nET"),s&&this.text(s,e,n),this},H.lstext=function(t,e,n,r){for(var i=0,o=t.length;i<o;i++,e+=r)this.text(t[i],e,n)},H.line=function(t,e,n,r){return this.lines([[n-t,r-e]],t,e)},H.clip=function(){G("W"),G("S")},H.clip_fixed=function(t){G("evenodd"===t?"W*":"W"),G("n")},H.lines=function(t,e,n,r,i,o){var a,s,c,l,u,h,f,d,m,w,v;for("number"==typeof t&&(g=n,n=e,e=t,t=g),r=r||[1,1],G(V(e*p)+" "+V((y-n)*p)+" m "),a=r[0],s=r[1],l=t.length,w=e,v=n,c=0;c<l;c++)u=t[c],2===u.length?(w=u[0]*a+w,v=u[1]*s+v,G(V(w*p)+" "+V((y-v)*p)+" l")):(h=u[0]*a+w,f=u[1]*s+v,d=u[2]*a+w,m=u[3]*s+v,w=u[4]*a+w,v=u[5]*s+v,G(V(h*p)+" "+V((y-f)*p)+" "+V(d*p)+" "+V((y-m)*p)+" "+V(w*p)+" "+V((y-v)*p)+" c"));return o&&G(" h"),null!==i&&G(kt(i)),this},H.rect=function(t,e,n,r,i){kt(i);return G([X(t*p),X((y-e)*p),X(n*p),X(-r*p),"re"].join(" ")),null!==i&&G(kt(i)),this},H.triangle=function(t,e,n,r,i,o,a){return this.lines([[n-t,r-e],[i-n,o-r],[t-i,e-o]],t,e,[1,1],a,!0),this},H.roundedRect=function(t,e,n,r,i,o,a){var s=4/3*(Math.SQRT2-1);return this.lines([[n-2*i,0],[i*s,0,i,o-o*s,i,o],[0,r-2*o],[0,o*s,-(i*s),o,-i,o],[-n+2*i,0],[-(i*s),0,-i,-(o*s),-i,-o],[0,-r+2*o],[0,-(o*s),i*s,-o,i,-o]],t+i,e,[1,1],a),this},H.ellipse=function(t,e,n,r,i){var o=4/3*(Math.SQRT2-1)*n,a=4/3*(Math.SQRT2-1)*r;return G([X((t+n)*p),X((y-e)*p),"m",X((t+n)*p),X((y-(e-a))*p),X((t+o)*p),X((y-(e-r))*p),X(t*p),X((y-(e-r))*p),"c"].join(" ")),G([X((t-o)*p),X((y-(e-r))*p),X((t-n)*p),X((y-(e-a))*p),X((t-n)*p),X((y-e)*p),"c"].join(" ")),G([X((t-n)*p),X((y-(e+a))*p),X((t-o)*p),X((y-(e+r))*p),X(t*p),X((y-(e+r))*p),"c"].join(" ")),G([X((t+o)*p),X((y-(e+r))*p),X((t+n)*p),X((y-(e+a))*p),X((t+n)*p),X((y-e)*p),"c"].join(" ")),null!==i&&G(kt(i)),this},H.circle=function(t,e,n,r){return this.ellipse(t,e,n,n,r)},H.setProperties=function(t){for(var e in U)U.hasOwnProperty(e)&&t[e]&&(U[e]=t[e]);return this},H.setFontSize=function(t){return A=t,this},H.setFont=function(t,e){return d=bt(t,e),this},H.setFontStyle=H.setFontType=function(t){return d=bt(void 0,t),this},H.getFontList=function(){var t,e,n,r={};for(t in O)if(O.hasOwnProperty(t)){r[t]=n=[];for(e in O[t])O[t].hasOwnProperty(e)&&n.push(e)}return r},H.addFont=function(t,e,n){ct(t,e,n,"StandardEncoding")},H.setLineWidth=function(t){return G((t*p).toFixed(2)+" w"),this},H.setDrawColor=function(t,e,n,r){var i;return i=void 0===e||void 0===r&&t===e===n?"string"==typeof t?t+" G":X(t/255)+" G":void 0===r?"string"==typeof t?[t,e,n,"RG"].join(" "):[X(t/255),X(e/255),X(n/255),"RG"].join(" "):"string"==typeof t?[t,e,n,r,"K"].join(" "):[X(t),X(e),X(n),X(r),"K"].join(" "),G(i),this},H.setFillColor=function(e,n,r,i){var o;return void 0===n||void 0===i&&e===n===r?o="string"==typeof e?e+" g":X(e/255)+" g":void 0===i||"object"===("undefined"==typeof i?"undefined":t(i))?(o="string"==typeof e?[e,n,r,"rg"].join(" "):[X(e/255),X(n/255),X(r/255),"rg"].join(" "),i&&0===i.a&&(o=["255","255","255","rg"].join(" "))):o="string"==typeof e?[e,n,r,i,"k"].join(" "):[X(e),X(n),X(r),X(i),"k"].join(" "),G(o),this},H.setTextColor=function(t,e,n){if("string"==typeof t&&/^#[0-9A-Fa-f]{6}$/.test(t)){var r=parseInt(t.substr(1),16);t=r>>16&255,e=r>>8&255,n=255&r}return _=0===t&&0===e&&0===n||"undefined"==typeof e?V(t/255)+" g":[V(t/255),V(e/255),V(n/255),"rg"].join(" "),this},H.CapJoinStyles={0:0,butt:0,but:0,miter:0,1:1,round:1,rounded:1,circle:1,2:2,projecting:2,project:2,square:2,bevel:2},H.setLineCap=function(t){var e=this.CapJoinStyles[t];if(void 0===e)throw new Error("Line cap style of '"+t+"' is not recognized. See or extend .CapJoinStyles property for valid styles");return z=e,G(e+" J"),this},H.setLineJoin=function(t){var e=this.CapJoinStyles[t];if(void 0===e)throw new Error("Line join style of '"+t+"' is not recognized. See or extend .CapJoinStyles property for valid styles");return L=e,G(e+" j"),this},H.output=At,H.save=function(t){H.output("save",t)};for(var St in r.API)r.API.hasOwnProperty(St)&&("events"===St&&r.API.events.length?!function(t,e){var n,r,i;for(i=e.length-1;i!==-1;i--)n=e[i][0],r=e[i][1],t.subscribe.apply(t,[n].concat("function"==typeof r?[r]:r))}(W,r.API.events):H[St]=r.API[St]);return lt(),d="F1",wt(u,c),W.publish("initialized"),H}var o="1.3",s={a0:[2383.94,3370.39],a1:[1683.78,2383.94],a2:[1190.55,1683.78],a3:[841.89,1190.55],a4:[595.28,841.89],a5:[419.53,595.28],a6:[297.64,419.53],a7:[209.76,297.64],a8:[147.4,209.76],a9:[104.88,147.4],a10:[73.7,104.88],b0:[2834.65,4008.19],b1:[2004.09,2834.65],b2:[1417.32,2004.09],b3:[1000.63,1417.32],b4:[708.66,1000.63],b5:[498.9,708.66],b6:[354.33,498.9],b7:[249.45,354.33],b8:[175.75,249.45],b9:[124.72,175.75],b10:[87.87,124.72],c0:[2599.37,3676.54],c1:[1836.85,2599.37],c2:[1298.27,1836.85],c3:[918.43,1298.27],c4:[649.13,918.43],c5:[459.21,649.13],c6:[323.15,459.21],c7:[229.61,323.15],c8:[161.57,229.61],c9:[113.39,161.57],c10:[79.37,113.39],dl:[311.81,623.62],letter:[612,792],"government-letter":[576,756],legal:[612,1008],"junior-legal":[576,360],ledger:[1224,792],tabloid:[792,1224],"credit-card":[153,243]};return r.API={events:[]},r.version="1.3.2 2016-09-30T20:33:18.867Z:jameshall","function"==typeof define&&define.amd?define("jsPDF",function(){return r}):"undefined"!=typeof module&&module.exports?module.exports=r:e.jsPDF=r,r}("undefined"!=typeof self&&self||"undefined"!=typeof window&&window||void 0);window.tmp=e,/**
   * jsPDF AcroForm Plugin
   * Copyright (c) 2016 Alexander Weidt, https://github.com/BiggA94
   *
   * Licensed under the MIT License.
   * http://opensource.org/licenses/mit-license
   */
(window.AcroForm=function(t){var n=window.AcroForm;n.scale=function(t){return t*(r.internal.scaleFactor/1)},n.antiScale=function(t){return 1/r.internal.scaleFactor*t};var r={fields:[],xForms:[],acroFormDictionaryRoot:null,printedOut:!1,internal:null};e.API.acroformPlugin=r;var i=function(){for(var t in this.acroformPlugin.acroFormDictionaryRoot.Fields){var e=this.acroformPlugin.acroFormDictionaryRoot.Fields[t];e.hasAnnotation&&a.call(this,e)}},o=function(){if(this.acroformPlugin.acroFormDictionaryRoot)throw new Error("Exception while creating AcroformDictionary");this.acroformPlugin.acroFormDictionaryRoot=new n.AcroFormDictionary,this.acroformPlugin.internal=this.internal,this.acroformPlugin.acroFormDictionaryRoot._eventID=this.internal.events.subscribe("postPutResources",l),this.internal.events.subscribe("buildDocument",i),this.internal.events.subscribe("putCatalog",c),this.internal.events.subscribe("postPutPages",u)},a=function(t){var n={type:"reference",object:t};e.API.annotationPlugin.annotations[this.internal.getPageInfo(t.page).pageNumber].push(n)},s=function(t){this.acroformPlugin.printedOut&&(this.acroformPlugin.printedOut=!1,this.acroformPlugin.acroFormDictionaryRoot=null),this.acroformPlugin.acroFormDictionaryRoot||o.call(this),this.acroformPlugin.acroFormDictionaryRoot.Fields.push(t)},c=function(){"undefined"!=typeof this.acroformPlugin.acroFormDictionaryRoot?this.internal.write("/AcroForm "+this.acroformPlugin.acroFormDictionaryRoot.objId+" 0 R"):console.log("Root missing...")},l=function(){this.internal.events.unsubscribe(this.acroformPlugin.acroFormDictionaryRoot._eventID),delete this.acroformPlugin.acroFormDictionaryRoot._eventID,this.acroformPlugin.printedOut=!0},u=function(t){var e=!t;t||(this.internal.newObjectDeferredBegin(this.acroformPlugin.acroFormDictionaryRoot.objId),this.internal.out(this.acroformPlugin.acroFormDictionaryRoot.getString()));var t=t||this.acroformPlugin.acroFormDictionaryRoot.Kids;for(var r in t){var i=t[r],o=i.Rect;i.Rect&&(i.Rect=n.internal.calculateCoordinates.call(this,i.Rect)),this.internal.newObjectDeferredBegin(i.objId);var a="";if(a+=i.objId+" 0 obj\n",a+="<<\n"+i.getContent(),i.Rect=o,i.hasAppearanceStream&&!i.appearanceStreamContent){var s=n.internal.calculateAppearanceStream.call(this,i);a+="/AP << /N "+s+" >>\n",this.acroformPlugin.xForms.push(s)}if(i.appearanceStreamContent){a+="/AP << ";for(var c in i.appearanceStreamContent){var l=i.appearanceStreamContent[c];if(a+="/"+c+" ",a+="<< ",Object.keys(l).length>=1||Array.isArray(l))for(var r in l){var u=l[r];"function"==typeof u&&(u=u.call(this,i)),a+="/"+r+" "+u+" ",this.acroformPlugin.xForms.indexOf(u)>=0||this.acroformPlugin.xForms.push(u)}else{var u=l;"function"==typeof u&&(u=u.call(this,i)),a+="/"+r+" "+u+" \n",this.acroformPlugin.xForms.indexOf(u)>=0||this.acroformPlugin.xForms.push(u)}a+=" >>\n"}a+=">>\n"}a+=">>\nendobj\n",this.internal.out(a)}e&&h.call(this,this.acroformPlugin.xForms)},h=function(t){for(var e in t){var n=e,r=t[e];this.internal.newObjectDeferredBegin(r&&r.objId);var i="";i+=r?r.getString():"",this.internal.out(i),delete t[n]}};t.addField=function(t){return t instanceof n.TextField?d.call(this,t):t instanceof n.ChoiceField?p.call(this,t):t instanceof n.Button?f.call(this,t):t instanceof n.ChildClass?s.call(this,t):t&&s.call(this,t),t.page=this.acroformPlugin.internal.getCurrentPageInfo().pageNumber,this};var f=function(t){var t=t||new n.Field;t.FT="/Btn";var e=t.Ff||0;t.pushbutton&&(e=n.internal.setBitPosition(e,17),delete t.pushbutton),t.radio&&(e=n.internal.setBitPosition(e,16),delete t.radio),t.noToggleToOff&&(e=n.internal.setBitPosition(e,15)),t.Ff=e,s.call(this,t)},d=function(t){var t=t||new n.Field;t.FT="/Tx";var e=t.Ff||0;t.multiline&&(e=4096|e),t.password&&(e=8192|e),t.fileSelect&&(e|=1<<20),t.doNotSpellCheck&&(e|=1<<22),t.doNotScroll&&(e|=1<<23),t.Ff=t.Ff||e,s.call(this,t)},p=function(t){var e=t||new n.Field;e.FT="/Ch";var r=e.Ff||0;e.combo&&(r=n.internal.setBitPosition(r,18),delete e.combo),e.edit&&(r=n.internal.setBitPosition(r,19),delete e.edit),e.sort&&(r=n.internal.setBitPosition(r,20),delete e.sort),e.multiSelect&&this.internal.getPDFVersion()>=1.4&&(r=n.internal.setBitPosition(r,22),delete e.multiSelect),e.doNotSpellCheck&&this.internal.getPDFVersion()>=1.4&&(r=n.internal.setBitPosition(r,23),delete e.doNotSpellCheck),e.Ff=r,s.call(this,e)}})(e.API);var n=window.AcroForm;n.internal={},n.createFormXObject=function(t){var e=new n.FormXObject,r=n.Appearance.internal.getHeight(t)||0,i=n.Appearance.internal.getWidth(t)||0;return e.BBox=[0,0,i,r],e},n.Appearance={CheckBox:{createAppearanceStream:function(){var t={N:{On:n.Appearance.CheckBox.YesNormal},D:{On:n.Appearance.CheckBox.YesPushDown,Off:n.Appearance.CheckBox.OffPushDown}};return t},createMK:function(){return"<< /CA (3)>>"},YesPushDown:function(t){var e=n.createFormXObject(t),r="";t.Q=1;var i=n.internal.calculateX(t,"3","ZapfDingbats",50);return r+="0.749023 g\n             0 0 "+n.Appearance.internal.getWidth(t)+" "+n.Appearance.internal.getHeight(t)+" re\n             f\n             BMC\n             q\n             0 0 1 rg\n             /F13 "+i.fontSize+" Tf 0 g\n             BT\n",r+=i.text,r+="ET\n             Q\n             EMC\n",e.stream=r,e},YesNormal:function(t){var e=n.createFormXObject(t),r="";t.Q=1;var i=n.internal.calculateX(t,"3","ZapfDingbats",.9*n.Appearance.internal.getHeight(t));return r+="1 g\n0 0 "+n.Appearance.internal.getWidth(t)+" "+n.Appearance.internal.getHeight(t)+" re\nf\nq\n0 0 1 rg\n0 0 "+(n.Appearance.internal.getWidth(t)-1)+" "+(n.Appearance.internal.getHeight(t)-1)+" re\nW\nn\n0 g\nBT\n/F13 "+i.fontSize+" Tf 0 g\n",r+=i.text,r+="ET\n             Q\n",e.stream=r,e},OffPushDown:function(t){var e=n.createFormXObject(t),r="";return r+="0.749023 g\n            0 0 "+n.Appearance.internal.getWidth(t)+" "+n.Appearance.internal.getHeight(t)+" re\n            f\n",e.stream=r,e}},RadioButton:{Circle:{createAppearanceStream:function(t){var e={D:{Off:n.Appearance.RadioButton.Circle.OffPushDown},N:{}};return e.N[t]=n.Appearance.RadioButton.Circle.YesNormal,e.D[t]=n.Appearance.RadioButton.Circle.YesPushDown,e},createMK:function(){return"<< /CA (l)>>"},YesNormal:function(t){var e=n.createFormXObject(t),r="",i=n.Appearance.internal.getWidth(t)<=n.Appearance.internal.getHeight(t)?n.Appearance.internal.getWidth(t)/4:n.Appearance.internal.getHeight(t)/4;i*=.9;var o=n.Appearance.internal.Bezier_C;return r+="q\n1 0 0 1 "+n.Appearance.internal.getWidth(t)/2+" "+n.Appearance.internal.getHeight(t)/2+" cm\n"+i+" 0 m\n"+i+" "+i*o+" "+i*o+" "+i+" 0 "+i+" c\n-"+i*o+" "+i+" -"+i+" "+i*o+" -"+i+" 0 c\n-"+i+" -"+i*o+" -"+i*o+" -"+i+" 0 -"+i+" c\n"+i*o+" -"+i+" "+i+" -"+i*o+" "+i+" 0 c\nf\nQ\n",e.stream=r,e},YesPushDown:function(t){var e=n.createFormXObject(t),r="",i=n.Appearance.internal.getWidth(t)<=n.Appearance.internal.getHeight(t)?n.Appearance.internal.getWidth(t)/4:n.Appearance.internal.getHeight(t)/4;i*=.9;var o=2*i,a=o*n.Appearance.internal.Bezier_C,s=i*n.Appearance.internal.Bezier_C;return r+="0.749023 g\n            q\n           1 0 0 1 "+n.Appearance.internal.getWidth(t)/2+" "+n.Appearance.internal.getHeight(t)/2+" cm\n"+o+" 0 m\n"+o+" "+a+" "+a+" "+o+" 0 "+o+" c\n-"+a+" "+o+" -"+o+" "+a+" -"+o+" 0 c\n-"+o+" -"+a+" -"+a+" -"+o+" 0 -"+o+" c\n"+a+" -"+o+" "+o+" -"+a+" "+o+" 0 c\n            f\n            Q\n            0 g\n            q\n            1 0 0 1 "+n.Appearance.internal.getWidth(t)/2+" "+n.Appearance.internal.getHeight(t)/2+" cm\n"+i+" 0 m\n"+i+" "+s+" "+s+" "+i+" 0 "+i+" c\n-"+s+" "+i+" -"+i+" "+s+" -"+i+" 0 c\n-"+i+" -"+s+" -"+s+" -"+i+" 0 -"+i+" c\n"+s+" -"+i+" "+i+" -"+s+" "+i+" 0 c\n            f\n            Q\n",e.stream=r,e},OffPushDown:function(t){var e=n.createFormXObject(t),r="",i=n.Appearance.internal.getWidth(t)<=n.Appearance.internal.getHeight(t)?n.Appearance.internal.getWidth(t)/4:n.Appearance.internal.getHeight(t)/4;i*=.9;var o=2*i,a=o*n.Appearance.internal.Bezier_C;return r+="0.749023 g\n            q\n 1 0 0 1 "+n.Appearance.internal.getWidth(t)/2+" "+n.Appearance.internal.getHeight(t)/2+" cm\n"+o+" 0 m\n"+o+" "+a+" "+a+" "+o+" 0 "+o+" c\n-"+a+" "+o+" -"+o+" "+a+" -"+o+" 0 c\n-"+o+" -"+a+" -"+a+" -"+o+" 0 -"+o+" c\n"+a+" -"+o+" "+o+" -"+a+" "+o+" 0 c\n            f\n            Q\n",e.stream=r,e}},Cross:{createAppearanceStream:function(t){var e={D:{Off:n.Appearance.RadioButton.Cross.OffPushDown},N:{}};return e.N[t]=n.Appearance.RadioButton.Cross.YesNormal,e.D[t]=n.Appearance.RadioButton.Cross.YesPushDown,e},createMK:function(){return"<< /CA (8)>>"},YesNormal:function(t){var e=n.createFormXObject(t),r="",i=n.Appearance.internal.calculateCross(t);return r+="q\n            1 1 "+(n.Appearance.internal.getWidth(t)-2)+" "+(n.Appearance.internal.getHeight(t)-2)+" re\n            W\n            n\n            "+i.x1.x+" "+i.x1.y+" m\n            "+i.x2.x+" "+i.x2.y+" l\n            "+i.x4.x+" "+i.x4.y+" m\n            "+i.x3.x+" "+i.x3.y+" l\n            s\n            Q\n",e.stream=r,e},YesPushDown:function(t){var e=n.createFormXObject(t),r=n.Appearance.internal.calculateCross(t),i="";return i+="0.749023 g\n            0 0 "+n.Appearance.internal.getWidth(t)+" "+n.Appearance.internal.getHeight(t)+" re\n            f\n            q\n            1 1 "+(n.Appearance.internal.getWidth(t)-2)+" "+(n.Appearance.internal.getHeight(t)-2)+" re\n            W\n            n\n            "+r.x1.x+" "+r.x1.y+" m\n            "+r.x2.x+" "+r.x2.y+" l\n            "+r.x4.x+" "+r.x4.y+" m\n            "+r.x3.x+" "+r.x3.y+" l\n            s\n            Q\n",e.stream=i,e},OffPushDown:function(t){var e=n.createFormXObject(t),r="";return r+="0.749023 g\n            0 0 "+n.Appearance.internal.getWidth(t)+" "+n.Appearance.internal.getHeight(t)+" re\n            f\n",e.stream=r,e}}},createDefaultAppearanceStream:function(t){var e="";return e+="/Helv 0 Tf 0 g"}},n.Appearance.internal={Bezier_C:.551915024494,calculateCross:function(t){var e=function(t,e){return t>e?e:t},r=n.Appearance.internal.getWidth(t),i=n.Appearance.internal.getHeight(t),o=e(r,i),a={x1:{x:(r-o)/2,y:(i-o)/2+o},x2:{x:(r-o)/2+o,y:(i-o)/2},x3:{x:(r-o)/2,y:(i-o)/2},x4:{x:(r-o)/2+o,y:(i-o)/2+o}};return a}},n.Appearance.internal.getWidth=function(t){return t.Rect[2]},n.Appearance.internal.getHeight=function(t){return t.Rect[3]},n.internal.inherit=function(t,e){Object.create||function(t){var e=function(){};return e.prototype=t,new e};t.prototype=Object.create(e.prototype),t.prototype.constructor=t},n.internal.arrayToPdfArray=function(t){if(Array.isArray(t)){var e=" [";for(var n in t){var r=t[n].toString();e+=r,e+=n<t.length-1?" ":""}return e+="]"}},n.internal.toPdfString=function(t){return t=t||"",0!==t.indexOf("(")&&(t="("+t),")"!=t.substring(t.length-1)&&(t+="("),t},n.PDFObject=function(){var t;Object.defineProperty(this,"objId",{get:function(){return t||(this.internal?t=this.internal.newObjectDeferred():e.API.acroformPlugin.internal&&(t=e.API.acroformPlugin.internal.newObjectDeferred())),t||console.log("Couldn't create Object ID"),t},configurable:!1})},n.PDFObject.prototype.toString=function(){return this.objId+" 0 R"},n.PDFObject.prototype.getString=function(){var t=this.objId+" 0 obj\n<<",e=this.getContent();return t+=e+">>\n",this.stream&&(t+="stream\n",t+=this.stream,t+="endstream\n"),t+="endobj\n"},n.PDFObject.prototype.getContent=function(){var t=function(t){var e="",r=Object.keys(t).filter(function(t){return"content"!=t&&"appearanceStreamContent"!=t&&"_"!=t.substring(0,1)});for(var i in r){var o=r[i],a=t[o];a&&(e+=Array.isArray(a)?"/"+o+" "+n.internal.arrayToPdfArray(a)+"\n":a instanceof n.PDFObject?"/"+o+" "+a.objId+" 0 R\n":"/"+o+" "+a+"\n")}return e},e="";return e+=t(this)},n.FormXObject=function(){n.PDFObject.call(this),this.Type="/XObject",this.Subtype="/Form",this.FormType=1,this.BBox,this.Matrix,this.Resources="2 0 R",this.PieceInfo;var t;Object.defineProperty(this,"Length",{enumerable:!0,get:function(){return void 0!==t?t.length:0}}),Object.defineProperty(this,"stream",{enumerable:!1,set:function(e){t=e},get:function(){return t?t:null}})},n.internal.inherit(n.FormXObject,n.PDFObject),n.AcroFormDictionary=function(){n.PDFObject.call(this);var t=[];Object.defineProperty(this,"Kids",{enumerable:!1,configurable:!0,get:function(){return t.length>0?t:void 0}}),Object.defineProperty(this,"Fields",{enumerable:!0,configurable:!0,get:function(){return t}}),this.DA},n.internal.inherit(n.AcroFormDictionary,n.PDFObject),n.Field=function(){n.PDFObject.call(this);var t;Object.defineProperty(this,"Rect",{enumerable:!0,configurable:!1,get:function(){if(t){var e=t;return e}},set:function(e){t=e}});var e="";Object.defineProperty(this,"FT",{enumerable:!0,set:function(t){e=t},get:function(){return e}});var r;Object.defineProperty(this,"T",{enumerable:!0,configurable:!1,set:function(t){r=t},get:function(){if(!r||r.length<1){if(this instanceof n.ChildClass)return;return"(FieldObject"+n.Field.FieldNum++ +")"}return"("==r.substring(0,1)&&r.substring(r.length-1)?r:"("+r+")"}});var i;Object.defineProperty(this,"DA",{enumerable:!0,get:function(){if(i)return"("+i+")"},set:function(t){i=t}});var o;Object.defineProperty(this,"DV",{enumerable:!0,configurable:!0,get:function(){if(o)return o},set:function(t){o=t}}),Object.defineProperty(this,"Type",{enumerable:!0,get:function(){return this.hasAnnotation?"/Annot":null}}),Object.defineProperty(this,"Subtype",{enumerable:!0,get:function(){return this.hasAnnotation?"/Widget":null}}),this.BG,Object.defineProperty(this,"hasAnnotation",{enumerable:!1,get:function(){return!!(this.Rect||this.BC||this.BG)}}),Object.defineProperty(this,"hasAppearanceStream",{enumerable:!1,configurable:!0,writable:!0}),Object.defineProperty(this,"page",{enumerable:!1,configurable:!0,writable:!0})},n.Field.FieldNum=0,n.internal.inherit(n.Field,n.PDFObject),n.ChoiceField=function(){n.Field.call(this),this.FT="/Ch",this.Opt=[],this.V="()",this.TI=0,this.combo=!1,Object.defineProperty(this,"edit",{enumerable:!0,set:function(t){1==t?(this._edit=!0,this.combo=!0):this._edit=!1},get:function(){return!!this._edit&&this._edit},configurable:!1}),this.hasAppearanceStream=!0,Object.defineProperty(this,"V",{get:function(){n.internal.toPdfString()}})},n.internal.inherit(n.ChoiceField,n.Field),window.ChoiceField=n.ChoiceField,n.ListBox=function(){n.ChoiceField.call(this)},n.internal.inherit(n.ListBox,n.ChoiceField),window.ListBox=n.ListBox,n.ComboBox=function(){n.ListBox.call(this),this.combo=!0},n.internal.inherit(n.ComboBox,n.ListBox),window.ComboBox=n.ComboBox,n.EditBox=function(){n.ComboBox.call(this),this.edit=!0},n.internal.inherit(n.EditBox,n.ComboBox),window.EditBox=n.EditBox,n.Button=function(){n.Field.call(this),this.FT="/Btn"},n.internal.inherit(n.Button,n.Field),window.Button=n.Button,n.PushButton=function(){n.Button.call(this),this.pushbutton=!0},n.internal.inherit(n.PushButton,n.Button),window.PushButton=n.PushButton,n.RadioButton=function(){n.Button.call(this),this.radio=!0;var t=[];Object.defineProperty(this,"Kids",{enumerable:!0,get:function(){if(t.length>0)return t}}),Object.defineProperty(this,"__Kids",{get:function(){return t}});var e;Object.defineProperty(this,"noToggleToOff",{enumerable:!1,get:function(){return e},set:function(t){e=t}})},n.internal.inherit(n.RadioButton,n.Button),window.RadioButton=n.RadioButton,n.ChildClass=function(t,e){n.Field.call(this),this.Parent=t,this._AppearanceType=n.Appearance.RadioButton.Circle,this.appearanceStreamContent=this._AppearanceType.createAppearanceStream(e),this.F=n.internal.setBitPosition(this.F,3,1),this.MK=this._AppearanceType.createMK(),this.AS="/Off",this._Name=e},n.internal.inherit(n.ChildClass,n.Field),n.RadioButton.prototype.setAppearance=function(t){if(!("createAppearanceStream"in t&&"createMK"in t))return void console.log("Couldn't assign Appearance to RadioButton. Appearance was Invalid!");for(var e in this.__Kids){var n=this.__Kids[e];n.appearanceStreamContent=t.createAppearanceStream(n._Name),n.MK=t.createMK()}},n.RadioButton.prototype.createOption=function(t){var r=this,i=(this.__Kids.length,new n.ChildClass(r,t));return this.__Kids.push(i),e.API.addField(i),i},n.CheckBox=function(){Button.call(this),this.appearanceStreamContent=n.Appearance.CheckBox.createAppearanceStream(),this.MK=n.Appearance.CheckBox.createMK(),this.AS="/On",this.V="/On"},n.internal.inherit(n.CheckBox,n.Button),window.CheckBox=n.CheckBox,n.TextField=function(){n.Field.call(this),this.DA=n.Appearance.createDefaultAppearanceStream(),this.F=4;var t;Object.defineProperty(this,"V",{get:function(){return t?"("+t+")":t},enumerable:!0,set:function(e){t=e}});var e;Object.defineProperty(this,"DV",{get:function(){return e?"("+e+")":e},enumerable:!0,set:function(t){e=t}});var r=!1;Object.defineProperty(this,"multiline",{enumerable:!1,get:function(){return r},set:function(t){r=t}});var i=!1;Object.defineProperty(this,"MaxLen",{enumerable:!0,get:function(){return i},set:function(t){i=t}}),Object.defineProperty(this,"hasAppearanceStream",{enumerable:!1,get:function(){return this.V||this.DV}})},n.internal.inherit(n.TextField,n.Field),window.TextField=n.TextField,n.PasswordField=function(){TextField.call(this),Object.defineProperty(this,"password",{value:!0,enumerable:!1,configurable:!1,writable:!1})},n.internal.inherit(n.PasswordField,n.TextField),window.PasswordField=n.PasswordField,n.internal.calculateFontSpace=function(t,e,r){var r=r||"helvetica",i=n.internal.calculateFontSpace.canvas||(n.internal.calculateFontSpace.canvas=document.createElement("canvas")),o=i.getContext("2d");o.save();var a=e+" "+r;o.font=a;var s=o.measureText(t);o.fontcolor="black";var o=i.getContext("2d");s.height=1.5*o.measureText("3").width,o.restore();s.width;return s},n.internal.calculateX=function(t,e,r,i){var i=i||12,r=r||"helvetica",o={text:"",fontSize:""};e="("==e.substr(0,1)?e.substr(1):e,e=")"==e.substr(e.length-1)?e.substr(0,e.length-1):e;var a=e.split(" "),s=i,c=2,l=2,u=n.Appearance.internal.getHeight(t)||0;u=u<0?-u:u;var h=n.Appearance.internal.getWidth(t)||0;h=h<0?-h:h;var f=function(t,e,i){if(t+1<a.length){var o=e+" "+a[t+1],s=n.internal.calculateFontSpace(o,i+"px",r).width,c=h-2*l;return s<=c}return!1};s++;t:for(;;){var e="";s--;var d=n.internal.calculateFontSpace("3",s+"px",r).height,p=t.multiline?u-s:(u-d)/2;p+=c;var g=-l,m=g,w=p,y=0,v=0,b=0;if(0==s){s=12,e="(...) Tj\n",e+="% Width of Text: "+n.internal.calculateFontSpace(e,"1px").width+", FieldWidth:"+h+"\n";break}b=n.internal.calculateFontSpace(a[0]+" ",s+"px",r).width;var x="",k=0;for(var _ in a){x+=a[_]+" ",x=" "==x.substr(x.length-1)?x.substr(0,x.length-1):x;var C=parseInt(_);b=n.internal.calculateFontSpace(x+" ",s+"px",r).width;var A=f(C,x,s),S=_>=a.length-1;if(!A||S){if(A||S){if(S)v=C;else if(t.multiline&&(d+c)*(k+2)+c>u)continue t}else{if(!t.multiline)continue t;if((d+c)*(k+2)+c>u)continue t;v=C}for(var q="",T=y;T<=v;T++)q+=a[T]+" ";switch(q=" "==q.substr(q.length-1)?q.substr(0,q.length-1):q,b=n.internal.calculateFontSpace(q,s+"px",r).width,t.Q){case 2:g=h-b-l;break;case 1:g=(h-b)/2;break;case 0:default:g=l}e+=g+" "+w+" Td\n",e+="("+q+") Tj\n",e+=-g+" 0 Td\n",w=-(s+c),m=g,b=0,y=v+1,k++,x=""}else x+=" "}break}return o.text=e,o.fontSize=s,o},n.internal.calculateAppearanceStream=function(t){if(t.appearanceStreamContent)return t.appearanceStreamContent;if(t.V||t.DV){var e="",r=t.V||t.DV,i=n.internal.calculateX(t,r);e+="/Tx BMC\nq\n/F1 "+i.fontSize+" Tf\n1 0 0 1 0 0 Tm\n",e+="BT\n",e+=i.text,e+="ET\n",e+="Q\nEMC\n";var o=new n.createFormXObject(t);o.stream=e;return o}},n.internal.calculateCoordinates=function(t,e,r,i){var o={};if(this.internal){var a=function(t){return t*this.internal.scaleFactor};Array.isArray(t)?(t[0]=n.scale(t[0]),t[1]=n.scale(t[1]),t[2]=n.scale(t[2]),t[3]=n.scale(t[3]),o.lowerLeft_X=t[0]||0,o.lowerLeft_Y=a.call(this,this.internal.pageSize.height)-t[3]-t[1]||0,o.upperRight_X=t[0]+t[2]||0,o.upperRight_Y=a.call(this,this.internal.pageSize.height)-t[1]||0):(t=n.scale(t),e=n.scale(e),r=n.scale(r),i=n.scale(i),o.lowerLeft_X=t||0,o.lowerLeft_Y=this.internal.pageSize.height-e||0,o.upperRight_X=t+r||0,o.upperRight_Y=this.internal.pageSize.height-e+i||0)}else Array.isArray(t)?(o.lowerLeft_X=t[0]||0,o.lowerLeft_Y=t[1]||0,o.upperRight_X=t[0]+t[2]||0,o.upperRight_Y=t[1]+t[3]||0):(o.lowerLeft_X=t||0,o.lowerLeft_Y=e||0,o.upperRight_X=t+r||0,o.upperRight_Y=e+i||0);return[o.lowerLeft_X,o.lowerLeft_Y,o.upperRight_X,o.upperRight_Y]},n.internal.calculateColor=function(t,e,n){var r=new Array(3);return r.r=0|t,r.g=0|e,r.b=0|n,r},n.internal.getBitPosition=function(t,e){t=t||0;var n=1;return n<<=e-1,t|n},n.internal.setBitPosition=function(t,e,n){t=t||0,n=n||1;var r=1;if(r<<=e-1,1==n)var t=t|r;else var t=t&~r;return t},/**
   * jsPDF addHTML PlugIn
   * Copyright (c) 2014 Diego Casorran
   *
   * Licensed under the MIT License.
   * http://opensource.org/licenses/mit-license
   */
function(t){t.addHTML=function(t,e,n,r,i){if("undefined"==typeof html2canvas&&"undefined"==typeof rasterizeHTML)throw new Error("You need either https://github.com/niklasvh/html2canvas or https://github.com/cburgmer/rasterizeHTML.js");"number"!=typeof e&&(r=e,i=n),"function"==typeof r&&(i=r,r=null);var o=this.internal,a=o.scaleFactor,s=o.pageSize.width,c=o.pageSize.height;if(r=r||{},r.onrendered=function(t){e=parseInt(e)||0,n=parseInt(n)||0;var o=r.dim||{},l=o.h||0,u=o.w||Math.min(s,t.width/a)-e,h="JPEG";if(r.format&&(h=r.format),t.height>c&&r.pagesplit){var f=function(){for(var r=0;;){var o=document.createElement("canvas");o.width=Math.min(s*a,t.width),o.height=Math.min(c*a,t.height-r);var l=o.getContext("2d");l.drawImage(t,0,r,t.width,o.height,0,0,o.width,o.height);var f=[o,e,r?0:n,o.width/a,o.height/a,h,null,"SLOW"];if(this.addImage.apply(this,f),r+=o.height,r>=t.height)break;this.addPage()}i(u,r,null,f)}.bind(this);if("CANVAS"===t.nodeName){var d=new Image;d.onload=f,d.src=t.toDataURL("image/png"),t=d}else f()}else{var p=Math.random().toString(35),g=[t,e,n,u,l,h,p,"SLOW"];this.addImage.apply(this,g),i(u,l,p,g)}}.bind(this),"undefined"!=typeof html2canvas&&!r.rstz)return html2canvas(t,r);if("undefined"!=typeof rasterizeHTML){var l="drawDocument";return"string"==typeof t&&(l=/^http/.test(t)?"drawURL":"drawHTML"),r.width=r.width||s*a,rasterizeHTML[l](t,void 0,r).then(function(t){r.onrendered(t.image)},function(t){i(null,t)})}return null}}(e.API),function(e){var n="addImage_",r=["jpeg","jpg","png"],i=function t(e){var n=this.internal.newObject(),r=this.internal.write,i=this.internal.putStream;if(e.n=n,r("<</Type /XObject"),r("/Subtype /Image"),r("/Width "+e.w),r("/Height "+e.h),e.cs===this.color_spaces.INDEXED?r("/ColorSpace [/Indexed /DeviceRGB "+(e.pal.length/3-1)+" "+("smask"in e?n+2:n+1)+" 0 R]"):(r("/ColorSpace /"+e.cs),e.cs===this.color_spaces.DEVICE_CMYK&&r("/Decode [1 0 1 0 1 0 1 0]")),r("/BitsPerComponent "+e.bpc),"f"in e&&r("/Filter /"+e.f),"dp"in e&&r("/DecodeParms <<"+e.dp+">>"),"trns"in e&&e.trns.constructor==Array){for(var o="",a=0,s=e.trns.length;a<s;a++)o+=e.trns[a]+" "+e.trns[a]+" ";r("/Mask ["+o+"]")}if("smask"in e&&r("/SMask "+(n+1)+" 0 R"),r("/Length "+e.data.length+">>"),i(e.data),r("endobj"),"smask"in e){var c="/Predictor "+e.p+" /Colors 1 /BitsPerComponent "+e.bpc+" /Columns "+e.w,l={w:e.w,h:e.h,cs:"DeviceGray",bpc:e.bpc,dp:c,data:e.smask};"f"in e&&(l.f=e.f),t.call(this,l)}e.cs===this.color_spaces.INDEXED&&(this.internal.newObject(),r("<< /Length "+e.pal.length+">>"),i(this.arrayBufferToBinaryString(new Uint8Array(e.pal))),r("endobj"))},o=function(){var t=this.internal.collections[n+"images"];for(var e in t)i.call(this,t[e])},a=function(){var t,e=this.internal.collections[n+"images"],r=this.internal.write;for(var i in e)t=e[i],r("/I"+t.i,t.n,"0","R")},s=function(t){return t&&"string"==typeof t&&(t=t.toUpperCase()),t in e.image_compression?t:e.image_compression.NONE},c=function(){var t=this.internal.collections[n+"images"];return t||(this.internal.collections[n+"images"]=t={},this.internal.events.subscribe("putResources",o),this.internal.events.subscribe("putXobjectDict",a)),t},l=function(t){var e=0;return t&&(e=Object.keys?Object.keys(t).length:function(t){var e=0;for(var n in t)t.hasOwnProperty(n)&&e++;return e}(t)),e},u=function(t){return"undefined"==typeof t||null===t},h=function(t){return"string"==typeof t&&e.sHashCode(t)},f=function(t){return r.indexOf(t)===-1},d=function(t){return"function"!=typeof e["process"+t.toUpperCase()]},p=function(e){return"object"===("undefined"==typeof e?"undefined":t(e))&&1===e.nodeType},g=function(e,n,r){if("IMG"===e.nodeName&&e.hasAttribute("src")){var i=""+e.getAttribute("src");if(!r&&0===i.indexOf("data:image/"))return i;!n&&/\.png(?:[?#].*)?$/i.test(i)&&(n="png")}if("CANVAS"===e.nodeName)var o=e;else{var o=document.createElement("canvas");o.width=e.clientWidth||e.width,o.height=e.clientHeight||e.height;var a=o.getContext("2d");if(!a)throw"addImage requires canvas to be supported by browser.";if(r){var s,c,l,u,h,f,d,p,g=Math.PI/180;"object"===("undefined"==typeof r?"undefined":t(r))&&(s=r.x,c=r.y,l=r.bg,r=r.angle),p=r*g,u=Math.abs(Math.cos(p)),h=Math.abs(Math.sin(p)),f=o.width,d=o.height,o.width=d*h+f*u,o.height=d*u+f*h,isNaN(s)&&(s=o.width/2),isNaN(c)&&(c=o.height/2),a.clearRect(0,0,o.width,o.height),a.fillStyle=l||"white",a.fillRect(0,0,o.width,o.height),a.save(),a.translate(s,c),a.rotate(p),a.drawImage(e,-(f/2),-(d/2)),a.rotate(-p),a.translate(-s,-c),a.restore()}else a.drawImage(e,0,0,o.width,o.height)}return o.toDataURL("png"==(""+n).toLowerCase()?"image/png":"image/jpeg")},m=function(t,e){var n;if(e)for(var r in e)if(t===e[r].alias){n=e[r];break}return n},w=function(t,e,n){return t||e||(t=-96,e=-96),t<0&&(t=-1*n.w*72/t/this.internal.scaleFactor),e<0&&(e=-1*n.h*72/e/this.internal.scaleFactor),0===t&&(t=e*n.w/n.h),0===e&&(e=t*n.h/n.w),[t,e]},y=function(t,e,n,r,i,o,a){var s=w.call(this,n,r,i),c=this.internal.getCoordinateString,l=this.internal.getVerticalCoordinateString;n=s[0],r=s[1],a[o]=i,this.internal.write("q",c(n),"0 0",c(r),c(t),l(e+r),"cm /I"+i.i,"Do Q")};e.color_spaces={DEVICE_RGB:"DeviceRGB",DEVICE_GRAY:"DeviceGray",DEVICE_CMYK:"DeviceCMYK",CAL_GREY:"CalGray",CAL_RGB:"CalRGB",LAB:"Lab",ICC_BASED:"ICCBased",INDEXED:"Indexed",PATTERN:"Pattern",SEPARATION:"Separation",DEVICE_N:"DeviceN"},e.decode={DCT_DECODE:"DCTDecode",FLATE_DECODE:"FlateDecode",LZW_DECODE:"LZWDecode",JPX_DECODE:"JPXDecode",JBIG2_DECODE:"JBIG2Decode",ASCII85_DECODE:"ASCII85Decode",ASCII_HEX_DECODE:"ASCIIHexDecode",RUN_LENGTH_DECODE:"RunLengthDecode",CCITT_FAX_DECODE:"CCITTFaxDecode"},e.image_compression={NONE:"NONE",FAST:"FAST",MEDIUM:"MEDIUM",SLOW:"SLOW"},e.sHashCode=function(t){return Array.prototype.reduce&&t.split("").reduce(function(t,e){return t=(t<<5)-t+e.charCodeAt(0),t&t},0)},e.isString=function(t){return"string"==typeof t},e.extractInfoFromBase64DataURI=function(t){return/^data:([\w]+?\/([\w]+?));base64,(.+?)$/g.exec(t)},e.supportsArrayBuffer=function(){return"undefined"!=typeof ArrayBuffer&&"undefined"!=typeof Uint8Array},e.isArrayBuffer=function(t){return!!this.supportsArrayBuffer()&&t instanceof ArrayBuffer},e.isArrayBufferView=function(t){return!!this.supportsArrayBuffer()&&("undefined"!=typeof Uint32Array&&(t instanceof Int8Array||t instanceof Uint8Array||"undefined"!=typeof Uint8ClampedArray&&t instanceof Uint8ClampedArray||t instanceof Int16Array||t instanceof Uint16Array||t instanceof Int32Array||t instanceof Uint32Array||t instanceof Float32Array||t instanceof Float64Array))},e.binaryStringToUint8Array=function(t){for(var e=t.length,n=new Uint8Array(e),r=0;r<e;r++)n[r]=t.charCodeAt(r);return n},e.arrayBufferToBinaryString=function(t){this.isArrayBuffer(t)&&(t=new Uint8Array(t));for(var e="",n=t.byteLength,r=0;r<n;r++)e+=String.fromCharCode(t[r]);return e},e.arrayBufferToBase64=function(t){for(var e,n,r,i,o,a="",s="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",c=new Uint8Array(t),l=c.byteLength,u=l%3,h=l-u,f=0;f<h;f+=3)o=c[f]<<16|c[f+1]<<8|c[f+2],e=(16515072&o)>>18,n=(258048&o)>>12,r=(4032&o)>>6,i=63&o,a+=s[e]+s[n]+s[r]+s[i];return 1==u?(o=c[h],e=(252&o)>>2,n=(3&o)<<4,a+=s[e]+s[n]+"=="):2==u&&(o=c[h]<<8|c[h+1],e=(64512&o)>>10,n=(1008&o)>>4,r=(15&o)<<2,a+=s[e]+s[n]+s[r]+"="),a},e.createImageInfo=function(t,e,n,r,i,o,a,s,c,l,u,h,f){var d={alias:s,w:e,h:n,cs:r,bpc:i,i:a,data:t};return o&&(d.f=o),c&&(d.dp=c),l&&(d.trns=l),u&&(d.pal=u),h&&(d.smask=h),f&&(d.p=f),d},e.addImage=function(e,n,i,o,a,w,v,b,x){if("string"!=typeof n){var k=w;w=a,a=o,o=i,i=n,n=k}if("object"===("undefined"==typeof e?"undefined":t(e))&&!p(e)&&"imageData"in e){var _=e;e=_.imageData,n=_.format||n,i=_.x||i||0,o=_.y||o||0,a=_.w||a,w=_.h||w,v=_.alias||v,b=_.compression||b,x=_.rotation||_.angle||x}if(isNaN(i)||isNaN(o))throw console.error("jsPDF.addImage: Invalid coordinates",arguments),new Error("Invalid coordinates passed to jsPDF.addImage");var C,A=c.call(this);if(!(C=m(e,A))){var S;if(p(e)&&(e=g(e,n,x)),u(v)&&(v=h(e)),!(C=m(v,A))){if(this.isString(e)){var q=this.extractInfoFromBase64DataURI(e);q?(n=q[2],e=atob(q[3])):137===e.charCodeAt(0)&&80===e.charCodeAt(1)&&78===e.charCodeAt(2)&&71===e.charCodeAt(3)&&(n="png")}if(n=(n||"JPEG").toLowerCase(),f(n))throw new Error("addImage currently only supports formats "+r+", not '"+n+"'");if(d(n))throw new Error("please ensure that the plugin for '"+n+"' support is added");if(this.supportsArrayBuffer()&&(e instanceof Uint8Array||(S=e,e=this.binaryStringToUint8Array(e))),C=this["process"+n.toUpperCase()](e,l(A),v,s(b),S),!C)throw new Error("An unkwown error occurred whilst processing the image")}}return y.call(this,i,o,a,w,C,C.i,A),this};var v=function(t){var e,n,r;if(255===!t.charCodeAt(0)||216===!t.charCodeAt(1)||255===!t.charCodeAt(2)||224===!t.charCodeAt(3)||!t.charCodeAt(6)==="J".charCodeAt(0)||!t.charCodeAt(7)==="F".charCodeAt(0)||!t.charCodeAt(8)==="I".charCodeAt(0)||!t.charCodeAt(9)==="F".charCodeAt(0)||0===!t.charCodeAt(10))throw new Error("getJpegSize requires a binary string jpeg file");for(var i=256*t.charCodeAt(4)+t.charCodeAt(5),o=4,a=t.length;o<a;){if(o+=i,255!==t.charCodeAt(o))throw new Error("getJpegSize could not find the size of the image");if(192===t.charCodeAt(o+1)||193===t.charCodeAt(o+1)||194===t.charCodeAt(o+1)||195===t.charCodeAt(o+1)||196===t.charCodeAt(o+1)||197===t.charCodeAt(o+1)||198===t.charCodeAt(o+1)||199===t.charCodeAt(o+1))return n=256*t.charCodeAt(o+5)+t.charCodeAt(o+6),e=256*t.charCodeAt(o+7)+t.charCodeAt(o+8),r=t.charCodeAt(o+9),[e,n,r];o+=2,i=256*t.charCodeAt(o)+t.charCodeAt(o+1)}},b=function(t){var e=t[0]<<8|t[1];if(65496!==e)throw new Error("Supplied data is not a JPEG");for(var n,r,i,o,a=t.length,s=(t[4]<<8)+t[5],c=4;c<a;){if(c+=s,n=x(t,c),s=(n[2]<<8)+n[3],(192===n[1]||194===n[1])&&255===n[0]&&s>7)return n=x(t,c+5),r=(n[2]<<8)+n[3],i=(n[0]<<8)+n[1],o=n[4],{width:r,height:i,numcomponents:o};c+=2}throw new Error("getJpegSizeFromBytes could not find the size of the image")},x=function(t,e){return t.subarray(e,e+5)};e.processJPEG=function(t,e,n,r,i){var o,a=this.color_spaces.DEVICE_RGB,s=this.decode.DCT_DECODE,c=8;return this.isString(t)?(o=v(t),this.createImageInfo(t,o[0],o[1],1==o[3]?this.color_spaces.DEVICE_GRAY:a,c,s,e,n)):(this.isArrayBuffer(t)&&(t=new Uint8Array(t)),this.isArrayBufferView(t)?(o=b(t),t=i||this.arrayBufferToBinaryString(t),this.createImageInfo(t,o.width,o.height,1==o.numcomponents?this.color_spaces.DEVICE_GRAY:a,c,s,e,n)):null)},e.processJPG=function(){return this.processJPEG.apply(this,arguments)}}(e.API),/**
   * jsPDF Annotations PlugIn
   * Copyright (c) 2014 Steven Spungin (TwelveTone LLC)  steven@twelvetone.tv
   *
   * Licensed under the MIT License.
   * http://opensource.org/licenses/mit-license
   */
function(t){var n={annotations:[],f2:function(t){return t.toFixed(2)},notEmpty:function(t){if("undefined"!=typeof t&&""!=t)return!0}};return e.API.annotationPlugin=n,e.API.events.push(["addPage",function(t){this.annotationPlugin.annotations[t.pageNumber]=[]}]),t.events.push(["putPage",function(t){for(var e=this.annotationPlugin.annotations[t.pageNumber],r=!1,i=0;i<e.length&&!r;i++){var o=e[i];switch(o.type){case"link":if(n.notEmpty(o.options.url)||n.notEmpty(o.options.pageNumber)){r=!0;break}case"reference":case"text":case"freetext":r=!0}}if(0!=r){this.internal.write("/Annots [");for(var a=this.annotationPlugin.f2,s=this.internal.scaleFactor,c=this.internal.pageSize.height,l=this.internal.getPageInfo(t.pageNumber),i=0;i<e.length;i++){var o=e[i];switch(o.type){case"reference":this.internal.write(" "+o.object.objId+" 0 R ");break;case"text":var u=this.internal.newAdditionalObject(),h=this.internal.newAdditionalObject(),f=o.title||"Note",d="/Rect ["+a(o.bounds.x*s)+" "+a(c-(o.bounds.y+o.bounds.h)*s)+" "+a((o.bounds.x+o.bounds.w)*s)+" "+a((c-o.bounds.y)*s)+"] ";y="<</Type /Annot /Subtype /Text "+d+"/Contents ("+o.contents+")",y+=" /Popup "+h.objId+" 0 R",y+=" /P "+l.objId+" 0 R",y+=" /T ("+f+") >>",u.content=y;var p=u.objId+" 0 R",g=30,d="/Rect ["+a((o.bounds.x+g)*s)+" "+a(c-(o.bounds.y+o.bounds.h)*s)+" "+a((o.bounds.x+o.bounds.w+g)*s)+" "+a((c-o.bounds.y)*s)+"] ";y="<</Type /Annot /Subtype /Popup "+d+" /Parent "+p,o.open&&(y+=" /Open true"),y+=" >>",h.content=y,this.internal.write(u.objId,"0 R",h.objId,"0 R");break;case"freetext":var d="/Rect ["+a(o.bounds.x*s)+" "+a((c-o.bounds.y)*s)+" "+a(o.bounds.x+o.bounds.w*s)+" "+a(c-(o.bounds.y+o.bounds.h)*s)+"] ",m=o.color||"#000000";y="<</Type /Annot /Subtype /FreeText "+d+"/Contents ("+o.contents+")",y+=" /DS(font: Helvetica,sans-serif 12.0pt; text-align:left; color:#"+m+")",y+=" /Border [0 0 0]",y+=" >>",this.internal.write(y);break;case"link":if(o.options.name){var w=this.annotations._nameMap[o.options.name];o.options.pageNumber=w.page,o.options.top=w.y}else o.options.top||(o.options.top=0);var d="/Rect ["+a(o.x*s)+" "+a((c-o.y)*s)+" "+a(o.x+o.w*s)+" "+a(c-(o.y+o.h)*s)+"] ",y="";if(o.options.url)y="<</Type /Annot /Subtype /Link "+d+"/Border [0 0 0] /A <</S /URI /URI ("+o.options.url+") >>";else if(o.options.pageNumber){var t=this.internal.getPageInfo(o.options.pageNumber);switch(y="<</Type /Annot /Subtype /Link "+d+"/Border [0 0 0] /Dest ["+t.objId+" 0 R",o.options.magFactor=o.options.magFactor||"XYZ",o.options.magFactor){case"Fit":y+=" /Fit]";break;case"FitH":y+=" /FitH "+o.options.top+"]";break;case"FitV":o.options.left=o.options.left||0,y+=" /FitV "+o.options.left+"]";break;case"XYZ":default:var v=a((c-o.options.top)*s);o.options.left=o.options.left||0,"undefined"==typeof o.options.zoom&&(o.options.zoom=0),y+=" /XYZ "+o.options.left+" "+v+" "+o.options.zoom+"]"}}""!=y&&(y+=" >>",this.internal.write(y))}}this.internal.write("]")}}]),t.createAnnotation=function(t){switch(t.type){case"link":this.link(t.bounds.x,t.bounds.y,t.bounds.w,t.bounds.h,t);break;case"text":case"freetext":this.annotationPlugin.annotations[this.internal.getCurrentPageInfo().pageNumber].push(t)}},t.link=function(t,e,n,r,i){this.annotationPlugin.annotations[this.internal.getCurrentPageInfo().pageNumber].push({x:t,y:e,w:n,h:r,options:i,type:"link"})},t.link=function(t,e,n,r,i){this.annotationPlugin.annotations[this.internal.getCurrentPageInfo().pageNumber].push({x:t,y:e,w:n,h:r,options:i,type:"link"})},t.textWithLink=function(t,e,n,r){var i=this.getTextWidth(t),o=this.internal.getLineHeight();return this.text(t,e,n),n+=.2*o,this.link(e,n-o,i,o,r),i},t.getTextWidth=function(t){var e=this.internal.getFontSize(),n=this.getStringUnitWidth(t)*e/this.internal.scaleFactor;return n},t.getLineHeight=function(){return this.internal.getLineHeight()},this}(e.API),function(t){t.autoPrint=function(){var t;return this.internal.events.subscribe("postPutResources",function(){t=this.internal.newObject(),this.internal.write("<< /S/Named /Type/Action /N/Print >>","endobj")}),this.internal.events.subscribe("putCatalog",function(){this.internal.write("/OpenAction "+t+" 0 R")}),this}}(e.API),/**
   * jsPDF Canvas PlugIn
   * Copyright (c) 2014 Steven Spungin (TwelveTone LLC)  steven@twelvetone.tv
   *
   * Licensed under the MIT License.
   * http://opensource.org/licenses/mit-license
   */
function(t){return t.events.push(["initialized",function(){this.canvas.pdf=this}]),t.canvas={getContext:function(t){return this.pdf.context2d._canvas=this,this.pdf.context2d},style:{}},Object.defineProperty(t.canvas,"width",{get:function(){return this._width},set:function(t){this._width=t,this.getContext("2d").pageWrapX=t+1}}),Object.defineProperty(t.canvas,"height",{get:function(){return this._height},set:function(t){this._height=t,this.getContext("2d").pageWrapY=t+1}}),this}(e.API),/** ====================================================================
   * jsPDF Cell plugin
   * Copyright (c) 2013 Youssef Beddad, youssef.beddad@gmail.com
   *               2013 Eduardo Menezes de Morais, eduardo.morais@usp.br
   *               2013 Lee Driscoll, https://github.com/lsdriscoll
   *               2014 Juan Pablo Gaviria, https://github.com/juanpgaviria
   *               2014 James Hall, james@parall.ax
   *               2014 Diego Casorran, https://github.com/diegocr
   *
   * 
   * ====================================================================
   */
function(t){var e,n,r,i,o=3,a=13,s={x:void 0,y:void 0,w:void 0,h:void 0,ln:void 0},c=1,l=function(t,e,n,r,i){s={x:t,y:e,w:n,h:r,ln:i}},u=function(){return s},h={left:0,top:0,bottom:0};t.setHeaderFunction=function(t){i=t},t.getTextDimensions=function(t){e=this.internal.getFont().fontName,n=this.table_font_size||this.internal.getFontSize(),r=this.internal.getFont().fontStyle;var i,o,a=19.049976/25.4;o=document.createElement("font"),o.id="jsPDFCell";try{o.style.fontStyle=r}catch(t){o.style.fontWeight=r}o.style.fontName=e,o.style.fontSize=n+"pt";try{o.textContent=t}catch(e){o.innerText=t}return document.body.appendChild(o),i={w:(o.offsetWidth+1)*a,h:(o.offsetHeight+1)*a},document.body.removeChild(o),i},t.cellAddPage=function(){var t=this.margins||h;this.addPage(),l(t.left,t.top,void 0,void 0),c+=1},t.cellInitialize=function(){s={x:void 0,y:void 0,w:void 0,h:void 0,ln:void 0},c=1},t.cell=function(t,e,n,r,i,s,c){var f=u(),d=!1;if(void 0!==f.ln)if(f.ln===s)t=f.x+f.w,e=f.y;else{var p=this.margins||h;f.y+f.h+r+a>=this.internal.pageSize.height-p.bottom&&(this.cellAddPage(),d=!0,this.printHeaders&&this.tableHeaderRow&&this.printHeaderRow(s,!0)),e=u().y+u().h,d&&(e=a+10)}if(void 0!==i[0])if(this.printingHeaderRow?this.rect(t,e,n,r,"FD"):this.rect(t,e,n,r),"right"===c){i instanceof Array||(i=[i]);for(var g=0;g<i.length;g++){var m=i[g],w=this.getStringUnitWidth(m)*this.internal.getFontSize();this.text(m,t+n-w-o,e+this.internal.getLineHeight()*(g+1))}}else this.text(i,t+o,e+this.internal.getLineHeight());return l(t,e,n,r,s),this},t.arrayMax=function(t,e){var n,r,i,o=t[0];for(n=0,r=t.length;n<r;n+=1)i=t[n],e?e(o,i)===-1&&(o=i):i>o&&(o=i);return o},t.table=function(e,n,r,i,o){if(!r)throw"No data for PDF table";var a,l,u,f,d,p,g,m,w,y,v=[],b=[],x={},k={},_=[],C=[],A=!1,S=!0,q=12,T=h;if(T.width=this.internal.pageSize.width,o&&(o.autoSize===!0&&(A=!0),o.printHeaders===!1&&(S=!1),o.fontSize&&(q=o.fontSize),o.css&&"undefined"!=typeof o.css["font-size"]&&(q=16*o.css["font-size"]),o.margins&&(T=o.margins)),this.lnMod=0,s={x:void 0,y:void 0,w:void 0,h:void 0,ln:void 0},c=1,this.printHeaders=S,this.margins=T,this.setFontSize(q),this.table_font_size=q,void 0===i||null===i)v=Object.keys(r[0]);else if(i[0]&&"string"!=typeof i[0]){var I=19.049976/25.4;for(l=0,u=i.length;l<u;l+=1)a=i[l],v.push(a.name),b.push(a.prompt),k[a.name]=a.width*I}else v=i;if(A)for(y=function(t){return t[a]},l=0,u=v.length;l<u;l+=1){for(a=v[l],x[a]=r.map(y),_.push(this.getTextDimensions(b[l]||a).w),p=x[a],g=0,f=p.length;g<f;g+=1)d=p[g],_.push(this.getTextDimensions(d).w);k[a]=t.arrayMax(_),_=[]}if(S){var P=this.calculateLineHeight(v,k,b.length?b:v);for(l=0,u=v.length;l<u;l+=1)a=v[l],C.push([e,n,k[a],P,String(b.length?b[l]:a)]);this.setTableHeaderRow(C),this.printHeaderRow(1,!1)}for(l=0,u=r.length;l<u;l+=1){var P;for(m=r[l],P=this.calculateLineHeight(v,k,m),g=0,w=v.length;g<w;g+=1)a=v[g],this.cell(e,n,k[a],P,m[a],l+2,a.align)}return this.lastCellPos=s,this.table_x=e,this.table_y=n,this},t.calculateLineHeight=function(t,e,n){for(var r,i=0,a=0;a<t.length;a++){r=t[a],n[r]=this.splitTextToSize(String(n[r]),e[r]-o);var s=this.internal.getLineHeight()*n[r].length+o;s>i&&(i=s)}return i},t.setTableHeaderRow=function(t){this.tableHeaderRow=t},t.printHeaderRow=function(t,e){if(!this.tableHeaderRow)throw"Property tableHeaderRow does not exist.";var n,r,o,s;if(this.printingHeaderRow=!0,void 0!==i){var u=i(this,c);l(u[0],u[1],u[2],u[3],-1)}this.setFontStyle("bold");var h=[];for(o=0,s=this.tableHeaderRow.length;o<s;o+=1)this.setFillColor(200,200,200),n=this.tableHeaderRow[o],e&&(this.margins.top=a,n[1]=this.margins&&this.margins.top||0,h.push(n)),r=[].concat(n),this.cell.apply(this,r.concat(t));h.length>0&&this.setTableHeaderRow(h),this.setFontStyle("normal"),this.printingHeaderRow=!1}}(e.API),/**
   * jsPDF Context2D PlugIn Copyright (c) 2014 Steven Spungin (TwelveTone LLC) steven@twelvetone.tv
   *
   * Licensed under the MIT License. http://opensource.org/licenses/mit-license
   */
function(t){function e(){this._isStrokeTransparent=!1,this._strokeOpacity=1,this.strokeStyle="#000000",this.fillStyle="#000000",this._isFillTransparent=!1,this._fillOpacity=1,this.font="12pt times",this.textBaseline="alphabetic",this.textAlign="start",this.lineWidth=1,this.lineJoin="miter",this.lineCap="butt",this._transform=[1,0,0,1,0,0],this.globalCompositeOperation="normal",this.globalAlpha=1,this._clip_path=[],this.ignoreClearRect=!1,this.copy=function(t){this._isStrokeTransparent=t._isStrokeTransparent,this._strokeOpacity=t._strokeOpacity,this.strokeStyle=t.strokeStyle,this._isFillTransparent=t._isFillTransparent,this._fillOpacity=t._fillOpacity,this.fillStyle=t.fillStyle,this.font=t.font,this.lineWidth=t.lineWidth,this.lineJoin=t.lineJoin,this.lineCap=t.lineCap,this.textBaseline=t.textBaseline,this.textAlign=t.textAlign,this._fontSize=t._fontSize,this._transform=t._transform.slice(0),this.globalCompositeOperation=t.globalCompositeOperation,this.globalAlpha=t.globalAlpha,this._clip_path=t._clip_path.slice(0),this.ignoreClearRect=t.ignoreClearRect}}t.events.push(["initialized",function(){this.context2d.pdf=this,this.context2d.internal.pdf=this,this.context2d.ctx=new e,this.context2d.ctxStack=[],this.context2d.path=[]}]),t.context2d={pageWrapXEnabled:!1,pageWrapYEnabled:!1,pageWrapX:9999999,pageWrapY:9999999,ctx:new e,f2:function(t){return t.toFixed(2)},fillRect:function(t,e,n,r){if(!this._isFillTransparent()){t=this._wrapX(t),e=this._wrapY(e);var i=this._matrix_map_rect(this.ctx._transform,{x:t,y:e,w:n,h:r});this.pdf.rect(i.x,i.y,i.w,i.h,"f")}},strokeRect:function(t,e,n,r){if(!this._isStrokeTransparent()){t=this._wrapX(t),e=this._wrapY(e);var i=this._matrix_map_rect(this.ctx._transform,{x:t,y:e,w:n,h:r});this.pdf.rect(i.x,i.y,i.w,i.h,"s")}},clearRect:function(t,e,n,r){if(!this.ctx.ignoreClearRect){t=this._wrapX(t),e=this._wrapY(e);var i=this._matrix_map_rect(this.ctx._transform,{x:t,y:e,w:n,h:r});this.save(),this.setFillStyle("#ffffff"),this.pdf.rect(i.x,i.y,i.w,i.h,"f"),this.restore()}},save:function(){this.ctx._fontSize=this.pdf.internal.getFontSize();var t=new e;t.copy(this.ctx),this.ctxStack.push(this.ctx),this.ctx=t},restore:function(){this.ctx=this.ctxStack.pop(),this.setFillStyle(this.ctx.fillStyle),this.setStrokeStyle(this.ctx.strokeStyle),this.setFont(this.ctx.font),this.pdf.setFontSize(this.ctx._fontSize),this.setLineCap(this.ctx.lineCap),this.setLineWidth(this.ctx.lineWidth),this.setLineJoin(this.ctx.lineJoin)},rect:function(t,e,n,r){this.moveTo(t,e),this.lineTo(t+n,e),this.lineTo(t+n,e+r),this.lineTo(t,e+r),this.lineTo(t,e),this.closePath()},beginPath:function(){this.path=[]},closePath:function(){this.path.push({type:"close"})},_getRgba:function(t){var e={};if(this.internal.rxTransparent.test(t))e.r=0,e.g=0,e.b=0,e.a=0;else{var n=this.internal.rxRgb.exec(t);null!=n?(e.r=parseInt(n[1]),e.g=parseInt(n[2]),e.b=parseInt(n[3]),e.a=1):(n=this.internal.rxRgba.exec(t),null!=n?(e.r=parseInt(n[1]),e.g=parseInt(n[2]),e.b=parseInt(n[3]),e.a=parseFloat(n[4])):(e.a=1,"#"!=t.charAt(0)&&(t=o.colorNameToHex(t),t||(t="#000000")),4===t.length?(e.r=t.substring(1,2),e.r+=r,e.g=t.substring(2,3),e.g+=g,e.b=t.substring(3,4),e.b+=b):(e.r=t.substring(1,3),e.g=t.substring(3,5),e.b=t.substring(5,7)),e.r=parseInt(e.r,16),e.g=parseInt(e.g,16),e.b=parseInt(e.b,16)))}return e.style=t,e},setFillStyle:function(t){var e,n,r,i;if(this.internal.rxTransparent.test(t))e=0,n=0,r=0,i=0;else{var a=this.internal.rxRgb.exec(t);null!=a?(e=parseInt(a[1]),n=parseInt(a[2]),r=parseInt(a[3]),i=1):(a=this.internal.rxRgba.exec(t),null!=a?(e=parseInt(a[1]),n=parseInt(a[2]),r=parseInt(a[3]),i=parseFloat(a[4])):(i=1,"#"!=t.charAt(0)&&(t=o.colorNameToHex(t),t||(t="#000000")),4===t.length?(e=t.substring(1,2),e+=e,n=t.substring(2,3),n+=n,r=t.substring(3,4),r+=r):(e=t.substring(1,3),n=t.substring(3,5),r=t.substring(5,7)),e=parseInt(e,16),n=parseInt(n,16),r=parseInt(r,16)))}this.ctx.fillStyle=t,this.ctx._isFillTransparent=0==i,this.ctx._fillOpacity=i,this.pdf.setFillColor(e,n,r,{a:i}),this.pdf.setTextColor(e,n,r,{a:i})},setStrokeStyle:function(t){var e=this._getRgba(t);this.ctx.strokeStyle=e.style,this.ctx._isStrokeTransparent=0==e.a,this.ctx._strokeOpacity=e.a,0===e.a?this.pdf.setDrawColor(255,255,255):1===e.a?this.pdf.setDrawColor(e.r,e.g,e.b):this.pdf.setDrawColor(e.r,e.g,e.b)},fillText:function(t,e,n,r){if(!this._isFillTransparent()){e=this._wrapX(e),n=this._wrapY(n);var i=this._matrix_map_point(this.ctx._transform,[e,n]);e=i[0],n=i[1];var o=this._matrix_rotation(this.ctx._transform),a=57.2958*o;if(this.ctx._clip_path.length>0){var s;s=window.outIntercept?"group"===window.outIntercept.type?window.outIntercept.stream:window.outIntercept:this.pdf.internal.pages[1],s.push("q");var c=this.path;this.path=this.ctx._clip_path,this.ctx._clip_path=[],this._fill(null,!0),this.ctx._clip_path=this.path,this.path=c}this.pdf.text(t,e,this._getBaseline(n),null,a),this.ctx._clip_path.length>0&&s.push("Q")}},strokeText:function(t,e,n,r){if(!this._isStrokeTransparent()){e=this._wrapX(e),n=this._wrapY(n);var i=this._matrix_map_point(this.ctx._transform,[e,n]);e=i[0],n=i[1];var o=this._matrix_rotation(this.ctx._transform),a=57.2958*o;if(this.ctx._clip_path.length>0){var s;s=window.outIntercept?"group"===window.outIntercept.type?window.outIntercept.stream:window.outIntercept:this.pdf.internal.pages[1],s.push("q");var c=this.path;this.path=this.ctx._clip_path,this.ctx._clip_path=[],this._fill(null,!0),this.ctx._clip_path=this.path,this.path=c}this.pdf.text(t,e,this._getBaseline(n),{stroke:!0},a),this.ctx._clip_path.length>0&&s.push("Q")}},setFont:function(t){this.ctx.font=t;var e=/\s*(\w+)\s+(\w+)\s+(\w+)\s+([\d\.]+)(px|pt|em)\s+(.*)?/;if(h=e.exec(t),null!=h){var n=h[1],r=(h[2],h[3]),i=h[4],o=h[5],a=h[6];i="px"===o?Math.floor(parseFloat(i)):"em"===o?Math.floor(parseFloat(i)*this.pdf.getFontSize()):Math.floor(parseFloat(i)),this.pdf.setFontSize(i),"bold"===r||"700"===r?this.pdf.setFontStyle("bold"):"italic"===n?this.pdf.setFontStyle("italic"):this.pdf.setFontStyle("normal");var s,c=a,l=c.toLowerCase().split(/\s*,\s*/);s=l.indexOf("arial")!=-1?"Arial":l.indexOf("verdana")!=-1?"Verdana":l.indexOf("helvetica")!=-1?"Helvetica":l.indexOf("sans-serif")!=-1?"sans-serif":l.indexOf("fixed")!=-1?"Fixed":l.indexOf("monospace")!=-1?"Monospace":l.indexOf("terminal")!=-1?"Terminal":l.indexOf("courier")!=-1?"Courier":l.indexOf("times")!=-1?"Times":l.indexOf("cursive")!=-1?"Cursive":l.indexOf("fantasy")!=-1?"Fantasy":(l.indexOf("serif")!=-1,"Serif");var u;u="bold"===r?"bold":"normal",this.pdf.setFont(s,u)}else{var e=/(\d+)(pt|px|em)\s+(\w+)\s*(\w+)?/,h=e.exec(t);if(null!=h){var f=h[1],c=(h[2],h[3]),u=h[4];u||(u="normal"),f="em"===o?Math.floor(parseFloat(i)*this.pdf.getFontSize()):Math.floor(parseFloat(f)),this.pdf.setFontSize(f),this.pdf.setFont(c,u)}}},setTextBaseline:function(t){this.ctx.textBaseline=t},getTextBaseline:function(){return this.ctx.textBaseline},setTextAlign:function(t){this.ctx.textAlign=t},getTextAlign:function(){return this.ctx.textAlign},setLineWidth:function(t){this.ctx.lineWidth=t,this.pdf.setLineWidth(t)},setLineCap:function(t){this.ctx.lineCap=t,this.pdf.setLineCap(t)},setLineJoin:function(t){this.ctx.lineJoin=t,this.pdf.setLineJoin(t)},moveTo:function(t,e){t=this._wrapX(t),e=this._wrapY(e);var n=this._matrix_map_point(this.ctx._transform,[t,e]);t=n[0],e=n[1];var r={type:"mt",x:t,y:e};this.path.push(r)},_wrapX:function(t){return this.pageWrapXEnabled?t%this.pageWrapX:t},_wrapY:function(t){return this.pageWrapYEnabled?(this._gotoPage(this._page(t)),(t-this.lastBreak)%this.pageWrapY):t},transform:function(t,e,n,r,i,o){this.ctx._transform=[t,e,n,r,i,o]},setTransform:function(t,e,n,r,i,o){this.ctx._transform=[t,e,n,r,i,o]},_getTransform:function(){return this.ctx._transform},lastBreak:0,pageBreaks:[],_page:function(t){if(this.pageWrapYEnabled){this.lastBreak=0;for(var e=0,n=0,r=0;r<this.pageBreaks.length;r++)if(t>=this.pageBreaks[r]){e++,0===this.lastBreak&&n++;var i=this.pageBreaks[r]-this.lastBreak;this.lastBreak=this.pageBreaks[r];var o=Math.floor(i/this.pageWrapY);n+=o}if(0===this.lastBreak){var o=Math.floor(t/this.pageWrapY)+1;n+=o}return n+e}return this.pdf.internal.getCurrentPageInfo().pageNumber},_gotoPage:function(t){},lineTo:function(t,e){t=this._wrapX(t),e=this._wrapY(e);var n=this._matrix_map_point(this.ctx._transform,[t,e]);t=n[0],e=n[1];var r={type:"lt",x:t,y:e};this.path.push(r)},bezierCurveTo:function(t,e,n,r,i,o){t=this._wrapX(t),e=this._wrapY(e),n=this._wrapX(n),r=this._wrapY(r),i=this._wrapX(i),o=this._wrapY(o);var a;a=this._matrix_map_point(this.ctx._transform,[i,o]),i=a[0],o=a[1],a=this._matrix_map_point(this.ctx._transform,[t,e]),t=a[0],e=a[1],a=this._matrix_map_point(this.ctx._transform,[n,r]),n=a[0],r=a[1];var s={type:"bct",x1:t,y1:e,x2:n,y2:r,x:i,y:o};this.path.push(s)},quadraticCurveTo:function(t,e,n,r){t=this._wrapX(t),e=this._wrapY(e),n=this._wrapX(n),r=this._wrapY(r);var i;i=this._matrix_map_point(this.ctx._transform,[n,r]),n=i[0],r=i[1],i=this._matrix_map_point(this.ctx._transform,[t,e]),t=i[0],e=i[1];var o={type:"qct",x1:t,y1:e,x:n,y:r};this.path.push(o)},arc:function(t,e,n,r,i,o){t=this._wrapX(t),e=this._wrapY(e);var a=this._matrix_map_point(this.ctx._transform,[t,e]);t=a[0],e=a[1];var s={type:"arc",x:t,y:e,radius:n,startAngle:r,endAngle:i,anticlockwise:o};this.path.push(s)},drawImage:function(t,e,n,r,i,o,a,s,c){void 0!==o&&(e=o,n=a,r=s,i=c),e=this._wrapX(e),n=this._wrapY(n);var l,u=this._matrix_map_rect(this.ctx._transform,{x:e,y:n,w:r,h:i}),h=(this._matrix_map_rect(this.ctx._transform,{x:o,y:a,w:s,h:c}),/data:image\/(\w+).*/i),f=h.exec(t);l=null!=f?f[1]:"png",this.pdf.addImage(t,l,u.x,u.y,u.w,u.h)},_matrix_multiply:function(t,e){var n=e[0],r=e[1],i=e[2],o=e[3],a=e[4],s=e[5],c=n*t[0]+r*t[2],l=i*t[0]+o*t[2],u=a*t[0]+s*t[2]+t[4];return r=n*t[1]+r*t[3],o=i*t[1]+o*t[3],s=a*t[1]+s*t[3]+t[5],n=c,i=l,a=u,[n,r,i,o,a,s]},_matrix_rotation:function(t){return Math.atan2(t[2],t[0])},_matrix_decompose:function(t){var e=t[0],n=t[1],r=t[2],i=t[3],o=Math.sqrt(e*e+n*n);e/=o,n/=o;var a=e*r+n*i;r-=e*a,i-=n*a;var s=Math.sqrt(r*r+i*i);return r/=s,i/=s,a/=s,e*i<n*r&&(e=-e,n=-n,a=-a,o=-o),{scale:[o,0,0,s,0,0],translate:[1,0,0,1,t[4],t[5]],rotate:[e,n,-n,e,0,0],skew:[1,0,a,1,0,0]}},_matrix_map_point:function(t,e){var n=t[0],r=t[1],i=t[2],o=t[3],a=t[4],s=t[5],c=e[0],l=e[1],u=c*n+l*i+a,h=c*r+l*o+s;return[u,h]},_matrix_map_point_obj:function(t,e){var n=this._matrix_map_point(t,[e.x,e.y]);return{x:n[0],y:n[1]}},_matrix_map_rect:function(t,e){var n=this._matrix_map_point(t,[e.x,e.y]),r=this._matrix_map_point(t,[e.x+e.w,e.y+e.h]);return{x:n[0],y:n[1],w:r[0]-n[0],h:r[1]-n[1]}},_matrix_is_identity:function(t){return 1==t[0]&&(0==t[1]&&(0==t[2]&&(1==t[3]&&(0==t[4]&&0==t[5]))))},rotate:function(t){var e=[Math.cos(t),Math.sin(t),-Math.sin(t),Math.cos(t),0,0];this.ctx._transform=this._matrix_multiply(this.ctx._transform,e)},scale:function(t,e){var n=[t,0,0,e,0,0];this.ctx._transform=this._matrix_multiply(this.ctx._transform,n)},translate:function(t,e){var n=[1,0,0,1,t,e];this.ctx._transform=this._matrix_multiply(this.ctx._transform,n)},stroke:function(){if(this.ctx._clip_path.length>0){var t;t=window.outIntercept?"group"===window.outIntercept.type?window.outIntercept.stream:window.outIntercept:this.pdf.internal.pages[1],t.push("q");var e=this.path;this.path=this.ctx._clip_path,this.ctx._clip_path=[],this._stroke(!0),this.ctx._clip_path=this.path,this.path=e,this._stroke(!1),t.push("Q")}else this._stroke(!1)},_stroke:function(t){if(t||!this._isStrokeTransparent()){for(var e=[],n=!1,r=this.path,i=0;i<r.length;i++){var o=r[i];switch(o.type){case"mt":e.push({start:o,deltas:[],abs:[]});break;case"lt":var a=[o.x-r[i-1].x,o.y-r[i-1].y];e[e.length-1].deltas.push(a),e[e.length-1].abs.push(o);break;case"bct":var a=[o.x1-r[i-1].x,o.y1-r[i-1].y,o.x2-r[i-1].x,o.y2-r[i-1].y,o.x-r[i-1].x,o.y-r[i-1].y];e[e.length-1].deltas.push(a);break;case"qct":var s=r[i-1].x+2/3*(o.x1-r[i-1].x),c=r[i-1].y+2/3*(o.y1-r[i-1].y),l=o.x+2/3*(o.x1-o.x),u=o.y+2/3*(o.y1-o.y),h=o.x,f=o.y,a=[s-r[i-1].x,c-r[i-1].y,l-r[i-1].x,u-r[i-1].y,h-r[i-1].x,f-r[i-1].y];e[e.length-1].deltas.push(a);break;case"arc":e[e.length-1].arc=!0,e[e.length-1].abs.push(o);break;case"close":n=!0}}for(var i=0;i<e.length;i++){var d;if(d=i==e.length-1?"s":null,e[i].arc)for(var p=e[i].abs,g=0;g<p.length;g++){var m=p[g],w=360*m.startAngle/(2*Math.PI),y=360*m.endAngle/(2*Math.PI),v=m.x,b=m.y;this.internal.arc2(this,v,b,m.radius,w,y,m.anticlockwise,d,t)}else{var v=e[i].start.x,b=e[i].start.y;t?(this.pdf.lines(e[i].deltas,v,b,null,null),this.pdf.clip_fixed()):this.pdf.lines(e[i].deltas,v,b,null,d)}}}},_isFillTransparent:function(){return this.ctx._isFillTransparent||0==this.globalAlpha},_isStrokeTransparent:function(){return this.ctx._isStrokeTransparent||0==this.globalAlpha},fill:function(t){if(this.ctx._clip_path.length>0){var e;e=window.outIntercept?"group"===window.outIntercept.type?window.outIntercept.stream:window.outIntercept:this.pdf.internal.pages[1],e.push("q");var n=this.path;this.path=this.ctx._clip_path,this.ctx._clip_path=[],this._fill(t,!0),this.ctx._clip_path=this.path,this.path=n,this._fill(t,!1),e.push("Q")}else this._fill(t,!1)},_fill:function(t,e){if(!this._isFillTransparent()){var r,i="function"==typeof this.pdf.internal.newObject2;r=window.outIntercept?"group"===window.outIntercept.type?window.outIntercept.stream:window.outIntercept:this.pdf.internal.pages[1];var o=[],a=window.outIntercept;if(i)switch(this.ctx.globalCompositeOperation){case"normal":case"source-over":break;case"destination-in":case"destination-out":var s=this.pdf.internal.newStreamObject(),c=this.pdf.internal.newObject2();c.push("<</Type /ExtGState"),c.push("/SMask <</S /Alpha /G "+s.objId+" 0 R>>"),c.push(">>");var l="MASK"+c.objId;this.pdf.internal.addGraphicsState(l,c.objId);var u="/"+l+" gs";r.splice(0,0,"q"),r.splice(1,0,u),r.push("Q"),window.outIntercept=s;break;default:var h="/"+this.pdf.internal.blendModeMap[this.ctx.globalCompositeOperation.toUpperCase()];h&&this.pdf.internal.out(h+" gs")}var f=this.ctx.globalAlpha;if(this.ctx._fillOpacity<1&&(f=this.ctx._fillOpacity),i){var d=this.pdf.internal.newObject2();d.push("<</Type /ExtGState"),d.push("/CA "+f),d.push("/ca "+f),d.push(">>");var l="GS_O_"+d.objId;this.pdf.internal.addGraphicsState(l,d.objId),this.pdf.internal.out("/"+l+" gs")}for(var p=this.path,g=0;g<p.length;g++){var m=p[g];switch(m.type){case"mt":o.push({start:m,deltas:[],abs:[]});break;case"lt":var w=[m.x-p[g-1].x,m.y-p[g-1].y];o[o.length-1].deltas.push(w),o[o.length-1].abs.push(m);break;case"bct":var w=[m.x1-p[g-1].x,m.y1-p[g-1].y,m.x2-p[g-1].x,m.y2-p[g-1].y,m.x-p[g-1].x,m.y-p[g-1].y];o[o.length-1].deltas.push(w);break;case"qct":var y=p[g-1].x+2/3*(m.x1-p[g-1].x),v=p[g-1].y+2/3*(m.y1-p[g-1].y),b=m.x+2/3*(m.x1-m.x),x=m.y+2/3*(m.y1-m.y),k=m.x,_=m.y,w=[y-p[g-1].x,v-p[g-1].y,b-p[g-1].x,x-p[g-1].y,k-p[g-1].x,_-p[g-1].y];o[o.length-1].deltas.push(w);break;case"arc":0==o.length&&o.push({start:{x:0,y:0},deltas:[],abs:[]}),o[o.length-1].arc=!0,o[o.length-1].abs.push(m);break;case"close":}}for(var g=0;g<o.length;g++){var C;if(g==o.length-1?(C="f","evenodd"===t&&(C+="*")):C=null,o[g].arc){for(var A=o[g].abs,S=0;S<A.length;S++){var q=A[S];if("undefined"!=typeof q.startAngle){var T=360*q.startAngle/(2*Math.PI),I=360*q.endAngle/(2*Math.PI),P=q.x,E=q.y;0==S&&this.internal.move2(this,P,E),this.internal.arc2(this,P,E,q.radius,T,I,q.anticlockwise,null,e)}else this.internal.line2(n,q.x,q.y)}var P=o[g].start.x,E=o[g].start.y;this.internal.line2(n,P,E),this.pdf.internal.out("h"),this.pdf.internal.out("f")}else{var P=o[g].start.x,E=o[g].start.y;e?(this.pdf.lines(o[g].deltas,P,E,null,null),this.pdf.clip_fixed()):this.pdf.lines(o[g].deltas,P,E,null,C)}}window.outIntercept=a}},pushMask:function(){var t="function"==typeof this.pdf.internal.newObject2;if(!t)return void console.log("jsPDF v2 not enabled");var e=this.pdf.internal.newStreamObject(),n=this.pdf.internal.newObject2();n.push("<</Type /ExtGState"),n.push("/SMask <</S /Alpha /G "+e.objId+" 0 R>>"),n.push(">>");var r="MASK"+n.objId;this.pdf.internal.addGraphicsState(r,n.objId);var i="/"+r+" gs";this.pdf.internal.out(i)},clip:function(){if(this.ctx._clip_path.length>0)for(var t=0;t<this.path.length;t++)this.ctx._clip_path.push(this.path[t]);else this.ctx._clip_path=this.path;this.path=[]},measureText:function(t){var e=this.pdf;return{getWidth:function(){var n=e.internal.getFontSize(),r=e.getStringUnitWidth(t)*n/e.internal.scaleFactor;return r},get width(){return this.getWidth(t)}}},_getBaseline:function(t){var e=parseInt(this.pdf.internal.getFontSize()),n=.25*e;switch(this.ctx.textBaseline){case"bottom":return t-n;case"top":return t+e;case"hanging":return t+e-n;case"middle":return t+e/2-n;case"ideographic":return t;case"alphabetic":default:return t}}};var n=t.context2d;return Object.defineProperty(n,"fillStyle",{set:function(t){this.setFillStyle(t)},get:function(){return this.ctx.fillStyle}}),Object.defineProperty(n,"strokeStyle",{set:function(t){this.setStrokeStyle(t)},get:function(){return this.ctx.strokeStyle}}),Object.defineProperty(n,"lineWidth",{set:function(t){this.setLineWidth(t)},get:function(){return this.ctx.lineWidth}}),Object.defineProperty(n,"lineCap",{set:function(t){this.setLineCap(t)},get:function(){return this.ctx.lineCap}}),Object.defineProperty(n,"lineJoin",{set:function(t){this.setLineJoin(t)},get:function(){return this.ctx.lineJoin}}),Object.defineProperty(n,"miterLimit",{set:function(t){this.ctx.miterLimit=t},get:function(){return this.ctx.miterLimit}}),Object.defineProperty(n,"textBaseline",{set:function(t){this.setTextBaseline(t)},get:function(){return this.getTextBaseline()}}),Object.defineProperty(n,"textAlign",{set:function(t){this.setTextAlign(t)},get:function(){return this.getTextAlign()}}),Object.defineProperty(n,"font",{set:function(t){this.setFont(t)},get:function(){return this.ctx.font}}),Object.defineProperty(n,"globalCompositeOperation",{set:function(t){this.ctx.globalCompositeOperation=t},get:function(){return this.ctx.globalCompositeOperation}}),Object.defineProperty(n,"globalAlpha",{set:function(t){this.ctx.globalAlpha=t},get:function(){return this.ctx.globalAlpha}}),Object.defineProperty(n,"ignoreClearRect",{set:function(t){this.ctx.ignoreClearRect=t},get:function(){return this.ctx.ignoreClearRect}}),n.internal={},n.internal.rxRgb=/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/,n.internal.rxRgba=/rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d\.]+)\s*\)/,n.internal.rxTransparent=/transparent|rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*0+\s*\)/,n.internal.arc=function(t,e,n,r,i,o,a,s){for(var c=!0,l=this.pdf.internal.scaleFactor,u=this.pdf.internal.pageSize.height,h=this.pdf.internal.f2,f=i*(Math.PI/180),d=o*(Math.PI/180),p=this.createArc(r,f,d,a),g=0;g<p.length;g++){var m=p[g];c&&0==g?this.pdf.internal.out([h((m.x1+e)*l),h((u-(m.y1+n))*l),"m",h((m.x2+e)*l),h((u-(m.y2+n))*l),h((m.x3+e)*l),h((u-(m.y3+n))*l),h((m.x4+e)*l),h((u-(m.y4+n))*l),"c"].join(" ")):this.pdf.internal.out([h((m.x2+e)*l),h((u-(m.y2+n))*l),h((m.x3+e)*l),h((u-(m.y3+n))*l),h((m.x4+e)*l),h((u-(m.y4+n))*l),"c"].join(" ")),t._lastPoint={x:e,y:n}}null!==s&&this.pdf.internal.out(this.pdf.internal.getStyle(s))},n.internal.arc2=function(t,e,n,r,i,o,a,s,c){var l=e,u=n;c?(this.arc(t,l,u,r,i,o,a,null),this.pdf.clip_fixed()):this.arc(t,l,u,r,i,o,a,s)},n.internal.move2=function(t,e,n){var r=this.pdf.internal.scaleFactor,i=this.pdf.internal.pageSize.height,o=this.pdf.internal.f2;this.pdf.internal.out([o(e*r),o((i-n)*r),"m"].join(" ")),t._lastPoint={x:e,y:n}},n.internal.line2=function(t,e,n){var r=this.pdf.internal.scaleFactor,i=this.pdf.internal.pageSize.height,o=this.pdf.internal.f2,a={x:e,y:n};this.pdf.internal.out([o(a.x*r),o((i-a.y)*r),"l"].join(" ")),t._lastPoint=a},n.internal.createArc=function(t,e,n,r){var i=1e-5,o=2*Math.PI,a=e;(a<o||a>o)&&(a%=o);var s=n;(s<o||s>o)&&(s%=o);for(var c=[],l=Math.PI/2,u=r?-1:1,h=e,f=Math.min(o,Math.abs(s-a));f>i;){var d=h+u*Math.min(f,l);c.push(this.createSmallArc(t,h,d)),f-=Math.abs(d-h),h=d}return c},n.internal.createSmallArc=function(t,e,n){var r=(n-e)/2,i=t*Math.cos(r),o=t*Math.sin(r),a=i,s=-o,c=a*a+s*s,l=c+a*i+s*o,u=4/3*(Math.sqrt(2*c*l)-l)/(a*o-s*i),h=a-u*s,f=s+u*a,d=h,p=-f,g=r+e,m=Math.cos(g),w=Math.sin(g);return{x1:t*Math.cos(e),y1:t*Math.sin(e),x2:h*m-f*w,y2:h*w+f*m,x3:d*m-p*w,y3:d*w+p*m,x4:t*Math.cos(n),y4:t*Math.sin(n)}},this}(e.API),/** @preserve
   * jsPDF fromHTML plugin. BETA stage. API subject to change. Needs browser
   * Copyright (c) 2012 Willow Systems Corporation, willow-systems.com
   *               2014 Juan Pablo Gaviria, https://github.com/juanpgaviria
   *               2014 Diego Casorran, https://github.com/diegocr
   *               2014 Daniel Husar, https://github.com/danielhusar
   *               2014 Wolfgang Gassler, https://github.com/woolfg
   *               2014 Steven Spungin, https://github.com/flamenco
   *
   * 
   * ====================================================================
   */
function(e){var n,r,i,a,s,c,l,u,h,f,d,p,g,m,w,y,v,b,x,k;n=function(){function t(){}return function(e){return t.prototype=e,new t}}(),f=function(t){var e,n,r,i,o,a,s;for(n=0,r=t.length,e=void 0,i=!1,a=!1;!i&&n!==r;)e=t[n]=t[n].trimLeft(),e&&(i=!0),n++;for(n=r-1;r&&!a&&n!==-1;)e=t[n]=t[n].trimRight(),e&&(a=!0),n--;for(o=/\s+$/g,s=!0,n=0;n!==r;)"\u2028"!=t[n]&&(e=t[n].replace(/\s+/g," "),s&&(e=e.trimLeft()),e&&(s=o.test(e)),t[n]=e),n++;return t},d=function(t,e,n,r){return this.pdf=t,this.x=e,this.y=n,this.settings=r,this.watchFunctions=[],this.init(),this},p=function(t){var e,n,r;for(e=void 0,r=t.split(","),n=r.shift();!e&&n;)e=i[n.trim().toLowerCase()],n=r.shift();return e},g=function(t){t="auto"===t?"0px":t,t.indexOf("em")>-1&&!isNaN(Number(t.replace("em","")))&&(t=18.719*Number(t.replace("em",""))+"px"),t.indexOf("pt")>-1&&!isNaN(Number(t.replace("pt","")))&&(t=1.333*Number(t.replace("pt",""))+"px");var e,n,r;return n=void 0,e=16,(r=m[t])?r:(r={"xx-small":9,"x-small":11,small:13,medium:16,large:19,"x-large":23,"xx-large":28,auto:0}[{css_line_height_string:t}],r!==n?m[t]=r/e:(r=parseFloat(t))?m[t]=r/e:(r=t.match(/([\d\.]+)(px)/),3===r.length?m[t]=parseFloat(r[1])/e:m[t]=1))},h=function(t){var e,n,r;return r=function(t){var e;return e=function(t){return document.defaultView&&document.defaultView.getComputedStyle?document.defaultView.getComputedStyle(t,null):t.currentStyle?t.currentStyle:t.style}(t),function(t){return t=t.replace(/-\D/g,function(t){return t.charAt(1).toUpperCase()}),e[t]}}(t),e={},n=void 0,e["font-family"]=p(r("font-family"))||"times",e["font-style"]=a[r("font-style")]||"normal",e["text-align"]=s[r("text-align")]||"left",n=c[r("font-weight")]||"normal","bold"===n&&("normal"===e["font-style"]?e["font-style"]=n:e["font-style"]=n+e["font-style"]),e["font-size"]=g(r("font-size"))||1,e["line-height"]=g(r("line-height"))||1,e.display="inline"===r("display")?"inline":"block",n="block"===e.display,e["margin-top"]=n&&g(r("margin-top"))||0,e["margin-bottom"]=n&&g(r("margin-bottom"))||0,e["padding-top"]=n&&g(r("padding-top"))||0,e["padding-bottom"]=n&&g(r("padding-bottom"))||0,e["margin-left"]=n&&g(r("margin-left"))||0,e["margin-right"]=n&&g(r("margin-right"))||0,e["padding-left"]=n&&g(r("padding-left"))||0,e["padding-right"]=n&&g(r("padding-right"))||0,e["page-break-before"]=r("page-break-before")||"auto",e.float=l[r("cssFloat")]||"none",e.clear=u[r("clear")]||"none",e.color=r("color"),e},w=function(t,e,n){var r,i,o,a,s;if(o=!1,i=void 0,a=void 0,s=void 0,r=n["#"+t.id])if("function"==typeof r)o=r(t,e);else for(i=0,a=r.length;!o&&i!==a;)o=r[i](t,e),i++;if(r=n[t.nodeName],!o&&r)if("function"==typeof r)o=r(t,e);else for(i=0,a=r.length;!o&&i!==a;)o=r[i](t,e),i++;return o},k=function(t,e){var n,r,i,o,a,s,c,l,u,h;for(n=[],r=[],i=0,h=t.rows[0].cells.length,l=t.clientWidth;i<h;)u=t.rows[0].cells[i],r[i]={name:u.textContent.toLowerCase().replace(/\s+/g,""),prompt:u.textContent.replace(/\r?\n/g,""),width:u.clientWidth/l*e.pdf.internal.pageSize.width},i++;for(i=1;i<t.rows.length;){for(s=t.rows[i],a={},o=0;o<s.cells.length;)a[r[o].name]=s.cells[o].textContent.replace(/\r?\n/g,""),o++;n.push(a),i++}return c={rows:n,headers:r}};var _={SCRIPT:1,STYLE:1,NOSCRIPT:1,OBJECT:1,EMBED:1,SELECT:1},C=1;r=function(e,i,o){var a,s,c,l,u,f,d,p,g;for(s=e.childNodes,a=void 0,c=h(e),u="block"===c.display,u&&(i.setBlockBoundary(),i.setBlockStyle(c)),d=19.049976/25.4,l=0,f=s.length;l<f;){if(a=s[l],"object"===("undefined"==typeof a?"undefined":t(a))){if(i.executeWatchFunctions(a),1===a.nodeType&&"HEADER"===a.nodeName){var m=a,v=i.pdf.margins_doc.top;i.pdf.internal.events.subscribe("addPage",function(t){i.y=v,r(m,i,o),i.pdf.margins_doc.top=i.y+10,i.y+=10},!1)}if(8===a.nodeType&&"#comment"===a.nodeName)~a.textContent.indexOf("ADD_PAGE")&&(i.pdf.addPage(),i.y=i.pdf.margins_doc.top);else if(1!==a.nodeType||_[a.nodeName])if(3===a.nodeType){var b=a.nodeValue;if(a.nodeValue&&"LI"===a.parentNode.nodeName)if("OL"===a.parentNode.parentNode.nodeName)b=C++ +". "+b;else{var x=c["font-size"],A=(3-.75*x)*i.pdf.internal.scaleFactor,S=.75*x*i.pdf.internal.scaleFactor,q=1.74*x/i.pdf.internal.scaleFactor;g=function(t,e){this.pdf.circle(t+A,e+S,q,"FD")}}16&a.ownerDocument.body.compareDocumentPosition(a)&&i.addText(b,c)}else"string"==typeof a&&i.addText(a,c);else{var T;if("IMG"===a.nodeName){var I=a.getAttribute("src");T=y[i.pdf.sHashCode(I)||I]}if(T){i.pdf.internal.pageSize.height-i.pdf.margins_doc.bottom<i.y+a.height&&i.y>i.pdf.margins_doc.top&&(i.pdf.addPage(),i.y=i.pdf.margins_doc.top,i.executeWatchFunctions(a));var P=h(a),E=i.x,O=12/i.pdf.internal.scaleFactor,F=(P["margin-left"]+P["padding-left"])*O,R=(P["margin-right"]+P["padding-right"])*O,B=(P["margin-top"]+P["padding-top"])*O,D=(P["margin-bottom"]+P["padding-bottom"])*O;E+=void 0!==P.float&&"right"===P.float?i.settings.width-a.width-R:F,i.pdf.addImage(T,E,i.y+B,a.width,a.height),T=void 0,"right"===P.float||"left"===P.float?(i.watchFunctions.push(function(t,e,n,r){return i.y>=e?(i.x+=t,i.settings.width+=n,!0):!!(r&&1===r.nodeType&&!_[r.nodeName]&&i.x+r.width>i.pdf.margins_doc.left+i.pdf.margins_doc.width)&&(i.x+=t,i.y=e,i.settings.width+=n,!0)}.bind(this,"left"===P.float?-a.width-F-R:0,i.y+a.height+B+D,a.width)),i.watchFunctions.push(function(t,e,n){return!(i.y<t&&e===i.pdf.internal.getNumberOfPages())||1===n.nodeType&&"both"===h(n).clear&&(i.y=t,!0)}.bind(this,i.y+a.height,i.pdf.internal.getNumberOfPages())),i.settings.width-=a.width+F+R,"left"===P.float&&(i.x+=a.width+F+R)):i.y+=a.height+B+D}else if("TABLE"===a.nodeName)p=k(a,i),i.y+=10,i.pdf.table(i.x,i.y,p.rows,p.headers,{autoSize:!1,printHeaders:o.printHeaders,margins:i.pdf.margins_doc,css:h(a)}),i.y=i.pdf.lastCellPos.y+i.pdf.lastCellPos.h+20;else if("OL"===a.nodeName||"UL"===a.nodeName)C=1,w(a,i,o)||r(a,i,o),i.y+=10;else if("LI"===a.nodeName){var j=i.x;i.x+=20/i.pdf.internal.scaleFactor,i.y+=3,w(a,i,o)||r(a,i,o),i.x=j}else"BR"===a.nodeName?(i.y+=c["font-size"]*i.pdf.internal.scaleFactor,i.addText("\u2028",n(c))):w(a,i,o)||r(a,i,o)}}l++}if(o.outY=i.y,u)return i.setBlockBoundary(g)},y={},v=function(t,e,n,r){function i(){e.pdf.internal.events.publish("imagesLoaded"),r(a)}function o(t,n,r){if(t){var o=new Image;a=++l,o.crossOrigin="",o.onerror=o.onload=function(){if(o.complete&&(0===o.src.indexOf("data:image/")&&(o.width=n||o.width||0,o.height=r||o.height||0),o.width+o.height)){var a=e.pdf.sHashCode(t)||t;y[a]=y[a]||o}--l||i()},o.src=t}}for(var a,s=t.getElementsByTagName("img"),c=s.length,l=0;c--;)o(s[c].getAttribute("src"),s[c].width,s[c].height);return l||i()},b=function(t,e,n){var i=t.getElementsByTagName("footer");if(i.length>0){i=i[0];var o=e.pdf.internal.write,a=e.y;e.pdf.internal.write=function(){},r(i,e,n);var s=Math.ceil(e.y-a)+5;e.y=a,e.pdf.internal.write=o,e.pdf.margins_doc.bottom+=s;for(var c=function(t){var o=void 0!==t?t.pageNumber:1,a=e.y;e.y=e.pdf.internal.pageSize.height-e.pdf.margins_doc.bottom,e.pdf.margins_doc.bottom-=s;for(var c=i.getElementsByTagName("span"),l=0;l<c.length;++l)(" "+c[l].className+" ").replace(/[\n\t]/g," ").indexOf(" pageCounter ")>-1&&(c[l].innerHTML=o),(" "+c[l].className+" ").replace(/[\n\t]/g," ").indexOf(" totalPages ")>-1&&(c[l].innerHTML="###jsPDFVarTotalPages###");r(i,e,n),e.pdf.margins_doc.bottom+=s,e.y=a},l=i.getElementsByTagName("span"),u=0;u<l.length;++u)(" "+l[u].className+" ").replace(/[\n\t]/g," ").indexOf(" totalPages ")>-1&&e.pdf.internal.events.subscribe("htmlRenderingFinished",e.pdf.putTotalPages.bind(e.pdf,"###jsPDFVarTotalPages###"),!0);e.pdf.internal.events.subscribe("addPage",c,!1),c(),_.FOOTER=1}},x=function(t,e,n,i,o,a){if(!e)return!1;"string"==typeof e||e.parentNode||(e=""+e.innerHTML),"string"==typeof e&&(e=function(t){var e,n,r,i;return r="jsPDFhtmlText"+Date.now().toString()+(1e3*Math.random()).toFixed(0),i="position: absolute !important;clip: rect(1px 1px 1px 1px); /* IE6, IE7 */clip: rect(1px, 1px, 1px, 1px);padding:0 !important;border:0 !important;height: 1px !important;width: 1px !important; top:auto;left:-100px;overflow: hidden;",n=document.createElement("div"),n.style.cssText=i,n.innerHTML='<iframe style="height:1px;width:1px" name="'+r+'" />',document.body.appendChild(n),e=window.frames[r],e.document.open(),e.document.writeln(t),e.document.close(),e.document.body}(e.replace(/<\/?script[^>]*?>/gi,"")));var s,c=new d(t,n,i,o);return v.call(this,e,c,o.elementHandlers,function(t){b(e,c,o.elementHandlers),r(e,c,o.elementHandlers),c.pdf.internal.events.publish("htmlRenderingFinished"),s=c.dispose(),"function"==typeof a?a(s):t&&console.error("jsPDF Warning: rendering issues? provide a callback to fromHTML!")}),s||{x:c.x,y:c.y}},d.prototype.init=function(){return this.paragraph={text:[],style:[]},this.pdf.internal.write("q")},d.prototype.dispose=function(){return this.pdf.internal.write("Q"),{x:this.x,y:this.y,ready:!0}},d.prototype.executeWatchFunctions=function(t){var e=!1,n=[];if(this.watchFunctions.length>0){for(var r=0;r<this.watchFunctions.length;++r)this.watchFunctions[r](t)===!0?e=!0:n.push(this.watchFunctions[r]);this.watchFunctions=n}return e},d.prototype.splitFragmentsIntoLines=function(t,e){var r,i,o,a,s,c,l,u,h,f,d,p,g,m,w;for(i=12,d=this.pdf.internal.scaleFactor,s={},o=void 0,f=void 0,a=void 0,c=void 0,w=void 0,h=void 0,u=void 0,l=void 0,p=[],g=[p],r=0,m=this.settings.width;t.length;)if(c=t.shift(),w=e.shift(),c)if(o=w["font-family"],f=w["font-style"],a=s[o+f],a||(a=this.pdf.internal.getFont(o,f).metadata.Unicode,s[o+f]=a),h={widths:a.widths,kerning:a.kerning,fontSize:w["font-size"]*i,textIndent:r},u=this.pdf.getStringUnitWidth(c,h)*h.fontSize/d,"\u2028"==c)p=[],g.push(p);else if(r+u>m){for(l=this.pdf.splitTextToSize(c,m,h),p.push([l.shift(),w]);l.length;)p=[[l.shift(),w]],g.push(p);r=this.pdf.getStringUnitWidth(p[0][0],h)*h.fontSize/d}else p.push([c,w]),r+=u;if(void 0!==w["text-align"]&&("center"===w["text-align"]||"right"===w["text-align"]||"justify"===w["text-align"]))for(var y=0;y<g.length;++y){var v=this.pdf.getStringUnitWidth(g[y][0][0],h)*h.fontSize/d;y>0&&(g[y][0][1]=n(g[y][0][1]));var b=m-v;if("right"===w["text-align"])g[y][0][1]["margin-left"]=b;else if("center"===w["text-align"])g[y][0][1]["margin-left"]=b/2;else if("justify"===w["text-align"]){var x=g[y][0][0].split(" ").length-1;g[y][0][1]["word-spacing"]=b/x,y===g.length-1&&(g[y][0][1]["word-spacing"]=0)}}return g},d.prototype.RenderTextFragment=function(t,e){var n,r,i;i=0,n=12,this.pdf.internal.pageSize.height-this.pdf.margins_doc.bottom<this.y+this.pdf.internal.getFontSize()&&(this.pdf.internal.write("ET","Q"),this.pdf.addPage(),this.y=this.pdf.margins_doc.top,this.pdf.internal.write("q","BT 0 g",this.pdf.internal.getCoordinateString(this.x),this.pdf.internal.getVerticalCoordinateString(this.y),e.color,"Td"),i=Math.max(i,e["line-height"],e["font-size"]),this.pdf.internal.write(0,(-1*n*i).toFixed(2),"Td")),r=this.pdf.internal.getFont(e["font-family"],e["font-style"]);var o=this.getPdfColor(e.color);o!==this.lastTextColor&&(this.pdf.internal.write(o),this.lastTextColor=o),void 0!==e["word-spacing"]&&e["word-spacing"]>0&&this.pdf.internal.write(e["word-spacing"].toFixed(2),"Tw"),this.pdf.internal.write("/"+r.id,(n*e["font-size"]).toFixed(2),"Tf","("+this.pdf.internal.pdfEscape(t)+") Tj"),void 0!==e["word-spacing"]&&this.pdf.internal.write(0,"Tw")},d.prototype.getPdfColor=function(t){var e,n,r,i,a=/rgb\s*\(\s*(\d+),\s*(\d+),\s*(\d+\s*)\)/,s=a.exec(t);if(null!=s?(n=parseInt(s[1]),r=parseInt(s[2]),i=parseInt(s[3])):("#"!=t.charAt(0)&&(t=o.colorNameToHex(t),t||(t="#000000")),n=t.substring(1,3),n=parseInt(n,16),r=t.substring(3,5),r=parseInt(r,16),i=t.substring(5,7),i=parseInt(i,16)),"string"==typeof n&&/^#[0-9A-Fa-f]{6}$/.test(n)){var c=parseInt(n.substr(1),16);n=c>>16&255,r=c>>8&255,i=255&c}var l=this.f3;return e=0===n&&0===r&&0===i||"undefined"==typeof r?l(n/255)+" g":[l(n/255),l(r/255),l(i/255),"rg"].join(" ")},d.prototype.f3=function(t){return t.toFixed(3)},d.prototype.renderParagraph=function(t){var e,n,r,i,o,a,s,c,l,u,h,d,p,g,m;if(i=f(this.paragraph.text),g=this.paragraph.style,e=this.paragraph.blockstyle,p=this.paragraph.priorblockstyle||{},this.paragraph={text:[],style:[],blockstyle:{},priorblockstyle:e},i.join("").trim()){c=this.splitFragmentsIntoLines(i,g),s=void 0,l=void 0,n=12,r=n/this.pdf.internal.scaleFactor,this.priorMarginBottom=this.priorMarginBottom||0,d=(Math.max((e["margin-top"]||0)-this.priorMarginBottom,0)+(e["padding-top"]||0))*r,h=((e["margin-bottom"]||0)+(e["padding-bottom"]||0))*r,this.priorMarginBottom=e["margin-bottom"]||0,"always"===e["page-break-before"]&&(this.pdf.addPage(),this.y=0,d=((e["margin-top"]||0)+(e["padding-top"]||0))*r),u=this.pdf.internal.write,o=void 0,a=void 0,this.y+=d,u("q","BT 0 g",this.pdf.internal.getCoordinateString(this.x),this.pdf.internal.getVerticalCoordinateString(this.y),"Td");for(var w=0;c.length;){for(s=c.shift(),l=0,o=0,a=s.length;o!==a;)s[o][0].trim()&&(l=Math.max(l,s[o][1]["line-height"],s[o][1]["font-size"]),m=7*s[o][1]["font-size"]),o++;var y=0,v=0;void 0!==s[0][1]["margin-left"]&&s[0][1]["margin-left"]>0&&(v=this.pdf.internal.getCoordinateString(s[0][1]["margin-left"]),y=v-w,w=v);var b=Math.max(e["margin-left"]||0,0)*r;for(u(y+b,(-1*n*l).toFixed(2),"Td"),o=0,a=s.length;o!==a;)s[o][0]&&this.RenderTextFragment(s[o][0],s[o][1]),o++;if(this.y+=l*r,this.executeWatchFunctions(s[0][1])&&c.length>0){var x=[],k=[];c.forEach(function(t){for(var e=0,n=t.length;e!==n;)t[e][0]&&(x.push(t[e][0]+" "),k.push(t[e][1])),++e}),c=this.splitFragmentsIntoLines(f(x),k),u("ET","Q"),u("q","BT 0 g",this.pdf.internal.getCoordinateString(this.x),this.pdf.internal.getVerticalCoordinateString(this.y),"Td")}}return t&&"function"==typeof t&&t.call(this,this.x-9,this.y-m/2),u("ET","Q"),this.y+=h}},d.prototype.setBlockBoundary=function(t){return this.renderParagraph(t)},d.prototype.setBlockStyle=function(t){return this.paragraph.blockstyle=t},d.prototype.addText=function(t,e){return this.paragraph.text.push(t),this.paragraph.style.push(e)},i={helvetica:"helvetica","sans-serif":"helvetica","times new roman":"times",serif:"times",times:"times",monospace:"courier",courier:"courier"},c={100:"normal",200:"normal",300:"normal",400:"normal",500:"bold",600:"bold",700:"bold",800:"bold",900:"bold",normal:"normal",bold:"bold",bolder:"bold",lighter:"normal"},a={normal:"normal",italic:"italic",oblique:"italic"},s={left:"left",right:"right",center:"center",justify:"justify"},l={none:"none",right:"right",left:"left"},u={none:"none",both:"both"},m={normal:1},e.fromHTML=function(t,e,n,r,i,o){return this.margins_doc=o||{top:0,bottom:0},r||(r={}),r.elementHandlers||(r.elementHandlers={}),x(this,t,isNaN(e)?4:e,isNaN(n)?4:n,r,i)}}(e.API),/** ==================================================================== 
   * jsPDF JavaScript plugin
   * Copyright (c) 2013 Youssef Beddad, youssef.beddad@gmail.com
   * 
   * 
   * ====================================================================
   */
function(t){var e,n,r;t.addJS=function(t){return r=t,this.internal.events.subscribe("postPutResources",function(t){e=this.internal.newObject(),this.internal.write("<< /Names [(EmbeddedJS) "+(e+1)+" 0 R] >>","endobj"),n=this.internal.newObject(),this.internal.write("<< /S /JavaScript /JS (",r,") >>","endobj")}),this.internal.events.subscribe("putCatalog",function(){void 0!==e&&void 0!==n&&this.internal.write("/Names <</JavaScript "+e+" 0 R>>")}),this}}(e.API),function(t){return t.events.push(["postPutResources",function(){var t=this,e=/^(\d+) 0 obj$/;if(this.outline.root.children.length>0)for(var n=t.outline.render().split(/\r\n/),r=0;r<n.length;r++){var i=n[r],o=e.exec(i);if(null!=o){var a=o[1];t.internal.newObjectDeferredBegin(a)}t.internal.write(i)}if(this.outline.createNamedDestinations){for(var s=this.internal.pages.length,c=[],r=0;r<s;r++){var l=t.internal.newObject();c.push(l);var u=t.internal.getPageInfo(r+1);t.internal.write("<< /D["+u.objId+" 0 R /XYZ null null null]>> endobj")}var h=t.internal.newObject();t.internal.write("<< /Names [ ");for(var r=0;r<c.length;r++)t.internal.write("(page_"+(r+1)+")"+c[r]+" 0 R");t.internal.write(" ] >>","endobj");t.internal.newObject();t.internal.write("<< /Dests "+h+" 0 R"),t.internal.write(">>","endobj")}}]),t.events.push(["putCatalog",function(){var t=this;t.outline.root.children.length>0&&(t.internal.write("/Outlines",this.outline.makeRef(this.outline.root)),this.outline.createNamedDestinations&&t.internal.write("/Names "+namesOid+" 0 R"))}]),t.events.push(["initialized",function(){var t=this;t.outline={createNamedDestinations:!1,root:{children:[]}};t.outline.add=function(t,e,n){var r={title:e,options:n,children:[]};return null==t&&(t=this.root),t.children.push(r),r},t.outline.render=function(){return this.ctx={},this.ctx.val="",this.ctx.pdf=t,this.genIds_r(this.root),this.renderRoot(this.root),this.renderItems(this.root),this.ctx.val},t.outline.genIds_r=function(e){e.id=t.internal.newObjectDeferred();for(var n=0;n<e.children.length;n++)this.genIds_r(e.children[n])},t.outline.renderRoot=function(t){this.objStart(t),this.line("/Type /Outlines"),t.children.length>0&&(this.line("/First "+this.makeRef(t.children[0])),this.line("/Last "+this.makeRef(t.children[t.children.length-1]))),this.line("/Count "+this.count_r({count:0},t)),this.objEnd()},t.outline.renderItems=function(e){for(var n=0;n<e.children.length;n++){var r=e.children[n];this.objStart(r),this.line("/Title "+this.makeString(r.title)),this.line("/Parent "+this.makeRef(e)),n>0&&this.line("/Prev "+this.makeRef(e.children[n-1])),n<e.children.length-1&&this.line("/Next "+this.makeRef(e.children[n+1])),r.children.length>0&&(this.line("/First "+this.makeRef(r.children[0])),this.line("/Last "+this.makeRef(r.children[r.children.length-1])));var i=this.count=this.count_r({count:0},r);if(i>0&&this.line("/Count "+i),r.options&&r.options.pageNumber){var o=t.internal.getPageInfo(r.options.pageNumber);this.line("/Dest ["+o.objId+" 0 R /XYZ 0 "+this.ctx.pdf.internal.pageSize.height+" 0]")}this.objEnd()}for(var n=0;n<e.children.length;n++){var r=e.children[n];this.renderItems(r)}},t.outline.line=function(t){this.ctx.val+=t+"\r\n"},t.outline.makeRef=function(t){return t.id+" 0 R"},t.outline.makeString=function(e){return"("+t.internal.pdfEscape(e)+")"},t.outline.objStart=function(t){this.ctx.val+="\r\n"+t.id+" 0 obj\r\n<<\r\n"},t.outline.objEnd=function(t){this.ctx.val+=">> \r\nendobj\r\n"},t.outline.count_r=function(t,e){for(var n=0;n<e.children.length;n++)t.count++,this.count_r(t,e.children[n]);return t.count}}]),this}(e.API),/**@preserve
   *  ====================================================================
   * jsPDF PNG PlugIn
   * Copyright (c) 2014 James Robb, https://github.com/jamesbrobb
   *
   * 
   * ====================================================================
   */
function(t){var e=function(){return"function"!=typeof PNG||"function"!=typeof c},n=function(e){return e!==t.image_compression.NONE&&r()},r=function(){var t="function"==typeof a;if(!t)throw new Error("requires deflate.js for compression");return t},i=function(e,n,r,i){var c=5,u=f;switch(i){case t.image_compression.FAST:c=3,u=h;break;case t.image_compression.MEDIUM:c=6,u=d;break;case t.image_compression.SLOW:c=9,u=p}e=l(e,n,r,u);var g=new Uint8Array(o(c)),m=s(e),w=new a(c),y=w.append(e),v=w.flush(),b=g.length+y.length+v.length,x=new Uint8Array(b+4);return x.set(g),x.set(y,g.length),x.set(v,g.length+y.length),x[b++]=m>>>24&255,x[b++]=m>>>16&255,x[b++]=m>>>8&255,x[b++]=255&m,t.arrayBufferToBinaryString(x)},o=function(t,e){var n=8,r=Math.LOG2E*Math.log(32768)-8,i=r<<4|n,o=i<<8,a=Math.min(3,(e-1&255)>>1);return o|=a<<6,o|=0,o+=31-o%31,[i,255&o&255]},s=function(t,e){for(var n,r=1,i=65535&r,o=r>>>16&65535,a=t.length,s=0;a>0;){n=a>e?e:a,a-=n;do i+=t[s++],o+=i;while(--n);i%=65521,o%=65521}return(o<<16|i)>>>0},l=function(t,e,n,r){for(var i,o,a,s=t.length/e,c=new Uint8Array(t.length+s),l=m(),u=0;u<s;u++){if(a=u*e,i=t.subarray(a,a+e),r)c.set(r(i,n,o),a+u);else{for(var h=0,f=l.length,d=[];h<f;h++)d[h]=l[h](i,n,o);var p=w(d.concat());c.set(d[p],a+u)}o=i}return c},u=function(t,e,n){var r=Array.apply([],t);return r.unshift(0),r},h=function(t,e,n){var r,i=[],o=0,a=t.length;for(i[0]=1;o<a;o++)r=t[o-e]||0,i[o+1]=t[o]-r+256&255;return i},f=function(t,e,n){var r,i=[],o=0,a=t.length;for(i[0]=2;o<a;o++)r=n&&n[o]||0,i[o+1]=t[o]-r+256&255;return i},d=function(t,e,n){var r,i,o=[],a=0,s=t.length;for(o[0]=3;a<s;a++)r=t[a-e]||0,i=n&&n[a]||0,o[a+1]=t[a]+256-(r+i>>>1)&255;return o},p=function(t,e,n){var r,i,o,a,s=[],c=0,l=t.length;for(s[0]=4;c<l;c++)r=t[c-e]||0,i=n&&n[c]||0,o=n&&n[c-e]||0,a=g(r,i,o),s[c+1]=t[c]-a+256&255;return s},g=function(t,e,n){var r=t+e-n,i=Math.abs(r-t),o=Math.abs(r-e),a=Math.abs(r-n);return i<=o&&i<=a?t:o<=a?e:n},m=function(){return[u,h,f,d,p]},w=function(t){for(var e,n,r,i=0,o=t.length;i<o;)e=y(t[i].slice(1)),(e<n||!n)&&(n=e,r=i),i++;return r},y=function(t){for(var e=0,n=t.length,r=0;e<n;)r+=Math.abs(t[e++]);return r},v=function(e){var n;switch(e){case t.image_compression.FAST:n=11;break;case t.image_compression.MEDIUM:n=13;break;case t.image_compression.SLOW:n=14}return n};t.processPNG=function(t,r,o,a,s){var c,l,u,h,f,d,p=this.color_spaces.DEVICE_RGB,g=this.decode.FLATE_DECODE,m=8;if(this.isArrayBuffer(t)&&(t=new Uint8Array(t)),this.isArrayBufferView(t)){if(e())throw new Error("PNG support requires png.js and zlib.js");if(c=new PNG(t),t=c.imgData,m=c.bits,p=c.colorSpace,h=c.colors,[4,6].indexOf(c.colorType)!==-1){if(8===c.bits)for(var w,y,b=32==c.pixelBitlength?new Uint32Array(c.decodePixels().buffer):16==c.pixelBitlength?new Uint16Array(c.decodePixels().buffer):new Uint8Array(c.decodePixels().buffer),x=b.length,k=new Uint8Array(x*c.colors),_=new Uint8Array(x),C=c.pixelBitlength-c.bits,A=0,S=0;A<x;A++){for(w=b[A],y=0;y<C;)k[S++]=w>>>y&255,y+=c.bits;_[A]=w>>>y&255}if(16===c.bits){for(var w,b=new Uint32Array(c.decodePixels().buffer),x=b.length,k=new Uint8Array(x*(32/c.pixelBitlength)*c.colors),_=new Uint8Array(x*(32/c.pixelBitlength)),q=c.colors>1,A=0,S=0,T=0;A<x;)w=b[A++],k[S++]=w>>>0&255,q&&(k[S++]=w>>>16&255,w=b[A++],k[S++]=w>>>0&255),_[T++]=w>>>16&255;m=8}n(a)?(t=i(k,c.width*c.colors,c.colors,a),d=i(_,c.width,1,a)):(t=k,d=_,g=null)}if(3===c.colorType&&(p=this.color_spaces.INDEXED,f=c.palette,c.transparency.indexed)){for(var I=c.transparency.indexed,P=0,A=0,x=I.length;A<x;++A)P+=I[A];if(P/=255,P===x-1&&I.indexOf(0)!==-1)u=[I.indexOf(0)];else if(P!==x){for(var b=c.decodePixels(),_=new Uint8Array(b.length),A=0,x=b.length;A<x;A++)_[A]=I[b[A]];d=i(_,c.width,1)}}var E=v(a);return l=g===this.decode.FLATE_DECODE?"/Predictor "+E+" /Colors "+h+" /BitsPerComponent "+m+" /Columns "+c.width:"/Colors "+h+" /BitsPerComponent "+m+" /Columns "+c.width,(this.isArrayBuffer(t)||this.isArrayBufferView(t))&&(t=this.arrayBufferToBinaryString(t)),(d&&this.isArrayBuffer(d)||this.isArrayBufferView(d))&&(d=this.arrayBufferToBinaryString(d)),this.createImageInfo(t,c.width,c.height,p,m,g,r,o,l,u,f,d,E)}throw new Error("Unsupported PNG image data, try using JPEG instead.")}}(e.API),function(t){t.autoPrint=function(){var t;return this.internal.events.subscribe("postPutResources",function(){t=this.internal.newObject(),this.internal.write("<< /S/Named /Type/Action /N/Print >>","endobj")}),this.internal.events.subscribe("putCatalog",function(){this.internal.write("/OpenAction "+t+" 0 R")}),this}}(e.API),function(t){var e=t.getCharWidthsArray=function(t,e){e||(e={});var n,r,i,o=e.widths?e.widths:this.internal.getFont().metadata.Unicode.widths,a=o.fof?o.fof:1,s=e.kerning?e.kerning:this.internal.getFont().metadata.Unicode.kerning,c=s.fof?s.fof:1,l=0,u=o[0]||a,h=[];for(n=0,r=t.length;n<r;n++)i=t.charCodeAt(n),h.push((o[i]||u)/a+(s[i]&&s[i][l]||0)/c),l=i;return h},n=function(t){for(var e=t.length,n=0;e;)e--,n+=t[e];return n},r=t.getStringUnitWidth=function(t,r){return n(e.call(this,t,r))},i=function(t,e,n,r){for(var i=[],o=0,a=t.length,s=0;o!==a&&s+e[o]<n;)s+=e[o],o++;i.push(t.slice(0,o));var c=o;for(s=0;o!==a;)s+e[o]>r&&(i.push(t.slice(c,o)),s=0,c=o),s+=e[o],o++;return c!==o&&i.push(t.slice(c,o)),i},o=function(t,o,a){a||(a={});var s,c,l,u,h,f,d=[],p=[d],g=a.textIndent||0,m=0,w=0,y=t.split(" "),v=e(" ",a)[0];if(f=a.lineIndent===-1?y[0].length+2:a.lineIndent||0){var b=Array(f).join(" "),x=[];y.map(function(t){t=t.split(/\s*\n/),t.length>1?x=x.concat(t.map(function(t,e){return(e&&t.length?"\n":"")+t})):x.push(t[0])}),y=x,f=r(b,a)}for(l=0,u=y.length;l<u;l++){var k=0;if(s=y[l],f&&"\n"==s[0]&&(s=s.substr(1),k=1),c=e(s,a),w=n(c),g+m+w>o||k){if(w>o){for(h=i(s,c,o-(g+m),o),d.push(h.shift()),d=[h.pop()];h.length;)p.push([h.shift()]);w=n(c.slice(s.length-d[0].length))}else d=[s];p.push(d),g=w+f,m=v}else d.push(s),g+=m+w,m=v}if(f)var _=function(t,e){return(e?b:"")+t.join(" ")};else var _=function(t){return t.join(" ")};return p.map(_)};t.splitTextToSize=function(t,e,n){n||(n={});var r,i=n.fontSize||this.internal.getFontSize(),a=function(t){var e={0:1},n={};if(t.widths&&t.kerning)return{widths:t.widths,kerning:t.kerning};var r=this.internal.getFont(t.fontName,t.fontStyle),i="Unicode";return r.metadata[i]?{widths:r.metadata[i].widths||e,kerning:r.metadata[i].kerning||n}:{widths:e,kerning:n}}.call(this,n);r=Array.isArray(t)?t:t.split(/\r?\n/);var s=1*this.internal.scaleFactor*e/i;a.textIndent=n.textIndent?1*n.textIndent*this.internal.scaleFactor/i:0,a.lineIndent=n.lineIndent;var c,l,u=[];for(c=0,l=r.length;c<l;c++)u=u.concat(o(r[c],s,a));return u}}(e.API),function(t){var e=function(t){for(var e="0123456789abcdef",n="klmnopqrstuvwxyz",r={},i=0;i<n.length;i++)r[n[i]]=e[i];var o,a,s,c,l,u={},h=1,f=u,d=[],p="",g="",m=t.length-1;for(i=1;i!=m;)l=t[i],i+=1,"'"==l?a?(c=a.join(""),a=o):a=[]:a?a.push(l):"{"==l?(d.push([f,c]),f={},c=o):"}"==l?(s=d.pop(),s[0][s[1]]=f,c=o,f=s[0]):"-"==l?h=-1:c===o?r.hasOwnProperty(l)?(p+=r[l],c=parseInt(p,16)*h,h=1,p=""):p+=l:r.hasOwnProperty(l)?(g+=r[l],f[c]=parseInt(g,16)*h,h=1,c=o,g=""):g+=l;return u},n={codePages:["WinAnsiEncoding"],WinAnsiEncoding:e("{19m8n201n9q201o9r201s9l201t9m201u8m201w9n201x9o201y8o202k8q202l8r202m9p202q8p20aw8k203k8t203t8v203u9v2cq8s212m9t15m8w15n9w2dw9s16k8u16l9u17s9z17x8y17y9y}")},r={Unicode:{Courier:n,"Courier-Bold":n,"Courier-BoldOblique":n,"Courier-Oblique":n,Helvetica:n,"Helvetica-Bold":n,"Helvetica-BoldOblique":n,"Helvetica-Oblique":n,"Times-Roman":n,"Times-Bold":n,"Times-BoldItalic":n,"Times-Italic":n}},i={Unicode:{"Courier-Oblique":e("{'widths'{k3w'fof'6o}'kerning'{'fof'-6o}}"),"Times-BoldItalic":e("{'widths'{k3o2q4ycx2r201n3m201o6o201s2l201t2l201u2l201w3m201x3m201y3m2k1t2l2r202m2n2n3m2o3m2p5n202q6o2r1w2s2l2t2l2u3m2v3t2w1t2x2l2y1t2z1w3k3m3l3m3m3m3n3m3o3m3p3m3q3m3r3m3s3m203t2l203u2l3v2l3w3t3x3t3y3t3z3m4k5n4l4m4m4m4n4m4o4s4p4m4q4m4r4s4s4y4t2r4u3m4v4m4w3x4x5t4y4s4z4s5k3x5l4s5m4m5n3r5o3x5p4s5q4m5r5t5s4m5t3x5u3x5v2l5w1w5x2l5y3t5z3m6k2l6l3m6m3m6n2w6o3m6p2w6q2l6r3m6s3r6t1w6u1w6v3m6w1w6x4y6y3r6z3m7k3m7l3m7m2r7n2r7o1w7p3r7q2w7r4m7s3m7t2w7u2r7v2n7w1q7x2n7y3t202l3mcl4mal2ram3man3mao3map3mar3mas2lat4uau1uav3maw3way4uaz2lbk2sbl3t'fof'6obo2lbp3tbq3mbr1tbs2lbu1ybv3mbz3mck4m202k3mcm4mcn4mco4mcp4mcq5ycr4mcs4mct4mcu4mcv4mcw2r2m3rcy2rcz2rdl4sdm4sdn4sdo4sdp4sdq4sds4sdt4sdu4sdv4sdw4sdz3mek3mel3mem3men3meo3mep3meq4ser2wes2wet2weu2wev2wew1wex1wey1wez1wfl3rfm3mfn3mfo3mfp3mfq3mfr3tfs3mft3rfu3rfv3rfw3rfz2w203k6o212m6o2dw2l2cq2l3t3m3u2l17s3x19m3m}'kerning'{cl{4qu5kt5qt5rs17ss5ts}201s{201ss}201t{cks4lscmscnscoscpscls2wu2yu201ts}201x{2wu2yu}2k{201ts}2w{4qx5kx5ou5qx5rs17su5tu}2x{17su5tu5ou}2y{4qx5kx5ou5qx5rs17ss5ts}'fof'-6ofn{17sw5tw5ou5qw5rs}7t{cksclscmscnscoscps4ls}3u{17su5tu5os5qs}3v{17su5tu5os5qs}7p{17su5tu}ck{4qu5kt5qt5rs17ss5ts}4l{4qu5kt5qt5rs17ss5ts}cm{4qu5kt5qt5rs17ss5ts}cn{4qu5kt5qt5rs17ss5ts}co{4qu5kt5qt5rs17ss5ts}cp{4qu5kt5qt5rs17ss5ts}6l{4qu5ou5qw5rt17su5tu}5q{ckuclucmucnucoucpu4lu}5r{ckuclucmucnucoucpu4lu}7q{cksclscmscnscoscps4ls}6p{4qu5ou5qw5rt17sw5tw}ek{4qu5ou5qw5rt17su5tu}el{4qu5ou5qw5rt17su5tu}em{4qu5ou5qw5rt17su5tu}en{4qu5ou5qw5rt17su5tu}eo{4qu5ou5qw5rt17su5tu}ep{4qu5ou5qw5rt17su5tu}es{17ss5ts5qs4qu}et{4qu5ou5qw5rt17sw5tw}eu{4qu5ou5qw5rt17ss5ts}ev{17ss5ts5qs4qu}6z{17sw5tw5ou5qw5rs}fm{17sw5tw5ou5qw5rs}7n{201ts}fo{17sw5tw5ou5qw5rs}fp{17sw5tw5ou5qw5rs}fq{17sw5tw5ou5qw5rs}7r{cksclscmscnscoscps4ls}fs{17sw5tw5ou5qw5rs}ft{17su5tu}fu{17su5tu}fv{17su5tu}fw{17su5tu}fz{cksclscmscnscoscps4ls}}}"),"Helvetica-Bold":e("{'widths'{k3s2q4scx1w201n3r201o6o201s1w201t1w201u1w201w3m201x3m201y3m2k1w2l2l202m2n2n3r2o3r2p5t202q6o2r1s2s2l2t2l2u2r2v3u2w1w2x2l2y1w2z1w3k3r3l3r3m3r3n3r3o3r3p3r3q3r3r3r3s3r203t2l203u2l3v2l3w3u3x3u3y3u3z3x4k6l4l4s4m4s4n4s4o4s4p4m4q3x4r4y4s4s4t1w4u3r4v4s4w3x4x5n4y4s4z4y5k4m5l4y5m4s5n4m5o3x5p4s5q4m5r5y5s4m5t4m5u3x5v2l5w1w5x2l5y3u5z3r6k2l6l3r6m3x6n3r6o3x6p3r6q2l6r3x6s3x6t1w6u1w6v3r6w1w6x5t6y3x6z3x7k3x7l3x7m2r7n3r7o2l7p3x7q3r7r4y7s3r7t3r7u3m7v2r7w1w7x2r7y3u202l3rcl4sal2lam3ran3rao3rap3rar3ras2lat4tau2pav3raw3uay4taz2lbk2sbl3u'fof'6obo2lbp3xbq3rbr1wbs2lbu2obv3rbz3xck4s202k3rcm4scn4sco4scp4scq6ocr4scs4mct4mcu4mcv4mcw1w2m2zcy1wcz1wdl4sdm4ydn4ydo4ydp4ydq4yds4ydt4sdu4sdv4sdw4sdz3xek3rel3rem3ren3reo3rep3req5ter3res3ret3reu3rev3rew1wex1wey1wez1wfl3xfm3xfn3xfo3xfp3xfq3xfr3ufs3xft3xfu3xfv3xfw3xfz3r203k6o212m6o2dw2l2cq2l3t3r3u2l17s4m19m3r}'kerning'{cl{4qs5ku5ot5qs17sv5tv}201t{2ww4wy2yw}201w{2ks}201x{2ww4wy2yw}2k{201ts201xs}2w{7qs4qu5kw5os5qw5rs17su5tu7tsfzs}2x{5ow5qs}2y{7qs4qu5kw5os5qw5rs17su5tu7tsfzs}'fof'-6o7p{17su5tu5ot}ck{4qs5ku5ot5qs17sv5tv}4l{4qs5ku5ot5qs17sv5tv}cm{4qs5ku5ot5qs17sv5tv}cn{4qs5ku5ot5qs17sv5tv}co{4qs5ku5ot5qs17sv5tv}cp{4qs5ku5ot5qs17sv5tv}6l{17st5tt5os}17s{2kwclvcmvcnvcovcpv4lv4wwckv}5o{2kucltcmtcntcotcpt4lt4wtckt}5q{2ksclscmscnscoscps4ls4wvcks}5r{2ks4ws}5t{2kwclvcmvcnvcovcpv4lv4wwckv}eo{17st5tt5os}fu{17su5tu5ot}6p{17ss5ts}ek{17st5tt5os}el{17st5tt5os}em{17st5tt5os}en{17st5tt5os}6o{201ts}ep{17st5tt5os}es{17ss5ts}et{17ss5ts}eu{17ss5ts}ev{17ss5ts}6z{17su5tu5os5qt}fm{17su5tu5os5qt}fn{17su5tu5os5qt}fo{17su5tu5os5qt}fp{17su5tu5os5qt}fq{17su5tu5os5qt}fs{17su5tu5os5qt}ft{17su5tu5ot}7m{5os}fv{17su5tu5ot}fw{17su5tu5ot}}}"),Courier:e("{'widths'{k3w'fof'6o}'kerning'{'fof'-6o}}"),"Courier-BoldOblique":e("{'widths'{k3w'fof'6o}'kerning'{'fof'-6o}}"),"Times-Bold":e("{'widths'{k3q2q5ncx2r201n3m201o6o201s2l201t2l201u2l201w3m201x3m201y3m2k1t2l2l202m2n2n3m2o3m2p6o202q6o2r1w2s2l2t2l2u3m2v3t2w1t2x2l2y1t2z1w3k3m3l3m3m3m3n3m3o3m3p3m3q3m3r3m3s3m203t2l203u2l3v2l3w3t3x3t3y3t3z3m4k5x4l4s4m4m4n4s4o4s4p4m4q3x4r4y4s4y4t2r4u3m4v4y4w4m4x5y4y4s4z4y5k3x5l4y5m4s5n3r5o4m5p4s5q4s5r6o5s4s5t4s5u4m5v2l5w1w5x2l5y3u5z3m6k2l6l3m6m3r6n2w6o3r6p2w6q2l6r3m6s3r6t1w6u2l6v3r6w1w6x5n6y3r6z3m7k3r7l3r7m2w7n2r7o2l7p3r7q3m7r4s7s3m7t3m7u2w7v2r7w1q7x2r7y3o202l3mcl4sal2lam3man3mao3map3mar3mas2lat4uau1yav3maw3tay4uaz2lbk2sbl3t'fof'6obo2lbp3rbr1tbs2lbu2lbv3mbz3mck4s202k3mcm4scn4sco4scp4scq6ocr4scs4mct4mcu4mcv4mcw2r2m3rcy2rcz2rdl4sdm4ydn4ydo4ydp4ydq4yds4ydt4sdu4sdv4sdw4sdz3rek3mel3mem3men3meo3mep3meq4ser2wes2wet2weu2wev2wew1wex1wey1wez1wfl3rfm3mfn3mfo3mfp3mfq3mfr3tfs3mft3rfu3rfv3rfw3rfz3m203k6o212m6o2dw2l2cq2l3t3m3u2l17s4s19m3m}'kerning'{cl{4qt5ks5ot5qy5rw17sv5tv}201t{cks4lscmscnscoscpscls4wv}2k{201ts}2w{4qu5ku7mu5os5qx5ru17su5tu}2x{17su5tu5ou5qs}2y{4qv5kv7mu5ot5qz5ru17su5tu}'fof'-6o7t{cksclscmscnscoscps4ls}3u{17su5tu5os5qu}3v{17su5tu5os5qu}fu{17su5tu5ou5qu}7p{17su5tu5ou5qu}ck{4qt5ks5ot5qy5rw17sv5tv}4l{4qt5ks5ot5qy5rw17sv5tv}cm{4qt5ks5ot5qy5rw17sv5tv}cn{4qt5ks5ot5qy5rw17sv5tv}co{4qt5ks5ot5qy5rw17sv5tv}cp{4qt5ks5ot5qy5rw17sv5tv}6l{17st5tt5ou5qu}17s{ckuclucmucnucoucpu4lu4wu}5o{ckuclucmucnucoucpu4lu4wu}5q{ckzclzcmzcnzcozcpz4lz4wu}5r{ckxclxcmxcnxcoxcpx4lx4wu}5t{ckuclucmucnucoucpu4lu4wu}7q{ckuclucmucnucoucpu4lu}6p{17sw5tw5ou5qu}ek{17st5tt5qu}el{17st5tt5ou5qu}em{17st5tt5qu}en{17st5tt5qu}eo{17st5tt5qu}ep{17st5tt5ou5qu}es{17ss5ts5qu}et{17sw5tw5ou5qu}eu{17sw5tw5ou5qu}ev{17ss5ts5qu}6z{17sw5tw5ou5qu5rs}fm{17sw5tw5ou5qu5rs}fn{17sw5tw5ou5qu5rs}fo{17sw5tw5ou5qu5rs}fp{17sw5tw5ou5qu5rs}fq{17sw5tw5ou5qu5rs}7r{cktcltcmtcntcotcpt4lt5os}fs{17sw5tw5ou5qu5rs}ft{17su5tu5ou5qu}7m{5os}fv{17su5tu5ou5qu}fw{17su5tu5ou5qu}fz{cksclscmscnscoscps4ls}}}"),Helvetica:e("{'widths'{k3p2q4mcx1w201n3r201o6o201s1q201t1q201u1q201w2l201x2l201y2l2k1w2l1w202m2n2n3r2o3r2p5t202q6o2r1n2s2l2t2l2u2r2v3u2w1w2x2l2y1w2z1w3k3r3l3r3m3r3n3r3o3r3p3r3q3r3r3r3s3r203t2l203u2l3v1w3w3u3x3u3y3u3z3r4k6p4l4m4m4m4n4s4o4s4p4m4q3x4r4y4s4s4t1w4u3m4v4m4w3r4x5n4y4s4z4y5k4m5l4y5m4s5n4m5o3x5p4s5q4m5r5y5s4m5t4m5u3x5v1w5w1w5x1w5y2z5z3r6k2l6l3r6m3r6n3m6o3r6p3r6q1w6r3r6s3r6t1q6u1q6v3m6w1q6x5n6y3r6z3r7k3r7l3r7m2l7n3m7o1w7p3r7q3m7r4s7s3m7t3m7u3m7v2l7w1u7x2l7y3u202l3rcl4mal2lam3ran3rao3rap3rar3ras2lat4tau2pav3raw3uay4taz2lbk2sbl3u'fof'6obo2lbp3rbr1wbs2lbu2obv3rbz3xck4m202k3rcm4mcn4mco4mcp4mcq6ocr4scs4mct4mcu4mcv4mcw1w2m2ncy1wcz1wdl4sdm4ydn4ydo4ydp4ydq4yds4ydt4sdu4sdv4sdw4sdz3xek3rel3rem3ren3reo3rep3req5ter3mes3ret3reu3rev3rew1wex1wey1wez1wfl3rfm3rfn3rfo3rfp3rfq3rfr3ufs3xft3rfu3rfv3rfw3rfz3m203k6o212m6o2dw2l2cq2l3t3r3u1w17s4m19m3r}'kerning'{5q{4wv}cl{4qs5kw5ow5qs17sv5tv}201t{2wu4w1k2yu}201x{2wu4wy2yu}17s{2ktclucmucnu4otcpu4lu4wycoucku}2w{7qs4qz5k1m17sy5ow5qx5rsfsu5ty7tufzu}2x{17sy5ty5oy5qs}2y{7qs4qz5k1m17sy5ow5qx5rsfsu5ty7tufzu}'fof'-6o7p{17sv5tv5ow}ck{4qs5kw5ow5qs17sv5tv}4l{4qs5kw5ow5qs17sv5tv}cm{4qs5kw5ow5qs17sv5tv}cn{4qs5kw5ow5qs17sv5tv}co{4qs5kw5ow5qs17sv5tv}cp{4qs5kw5ow5qs17sv5tv}6l{17sy5ty5ow}do{17st5tt}4z{17st5tt}7s{fst}dm{17st5tt}dn{17st5tt}5o{ckwclwcmwcnwcowcpw4lw4wv}dp{17st5tt}dq{17st5tt}7t{5ow}ds{17st5tt}5t{2ktclucmucnu4otcpu4lu4wycoucku}fu{17sv5tv5ow}6p{17sy5ty5ow5qs}ek{17sy5ty5ow}el{17sy5ty5ow}em{17sy5ty5ow}en{5ty}eo{17sy5ty5ow}ep{17sy5ty5ow}es{17sy5ty5qs}et{17sy5ty5ow5qs}eu{17sy5ty5ow5qs}ev{17sy5ty5ow5qs}6z{17sy5ty5ow5qs}fm{17sy5ty5ow5qs}fn{17sy5ty5ow5qs}fo{17sy5ty5ow5qs}fp{17sy5ty5qs}fq{17sy5ty5ow5qs}7r{5ow}fs{17sy5ty5ow5qs}ft{17sv5tv5ow}7m{5ow}fv{17sv5tv5ow}fw{17sv5tv5ow}}}"),"Helvetica-BoldOblique":e("{'widths'{k3s2q4scx1w201n3r201o6o201s1w201t1w201u1w201w3m201x3m201y3m2k1w2l2l202m2n2n3r2o3r2p5t202q6o2r1s2s2l2t2l2u2r2v3u2w1w2x2l2y1w2z1w3k3r3l3r3m3r3n3r3o3r3p3r3q3r3r3r3s3r203t2l203u2l3v2l3w3u3x3u3y3u3z3x4k6l4l4s4m4s4n4s4o4s4p4m4q3x4r4y4s4s4t1w4u3r4v4s4w3x4x5n4y4s4z4y5k4m5l4y5m4s5n4m5o3x5p4s5q4m5r5y5s4m5t4m5u3x5v2l5w1w5x2l5y3u5z3r6k2l6l3r6m3x6n3r6o3x6p3r6q2l6r3x6s3x6t1w6u1w6v3r6w1w6x5t6y3x6z3x7k3x7l3x7m2r7n3r7o2l7p3x7q3r7r4y7s3r7t3r7u3m7v2r7w1w7x2r7y3u202l3rcl4sal2lam3ran3rao3rap3rar3ras2lat4tau2pav3raw3uay4taz2lbk2sbl3u'fof'6obo2lbp3xbq3rbr1wbs2lbu2obv3rbz3xck4s202k3rcm4scn4sco4scp4scq6ocr4scs4mct4mcu4mcv4mcw1w2m2zcy1wcz1wdl4sdm4ydn4ydo4ydp4ydq4yds4ydt4sdu4sdv4sdw4sdz3xek3rel3rem3ren3reo3rep3req5ter3res3ret3reu3rev3rew1wex1wey1wez1wfl3xfm3xfn3xfo3xfp3xfq3xfr3ufs3xft3xfu3xfv3xfw3xfz3r203k6o212m6o2dw2l2cq2l3t3r3u2l17s4m19m3r}'kerning'{cl{4qs5ku5ot5qs17sv5tv}201t{2ww4wy2yw}201w{2ks}201x{2ww4wy2yw}2k{201ts201xs}2w{7qs4qu5kw5os5qw5rs17su5tu7tsfzs}2x{5ow5qs}2y{7qs4qu5kw5os5qw5rs17su5tu7tsfzs}'fof'-6o7p{17su5tu5ot}ck{4qs5ku5ot5qs17sv5tv}4l{4qs5ku5ot5qs17sv5tv}cm{4qs5ku5ot5qs17sv5tv}cn{4qs5ku5ot5qs17sv5tv}co{4qs5ku5ot5qs17sv5tv}cp{4qs5ku5ot5qs17sv5tv}6l{17st5tt5os}17s{2kwclvcmvcnvcovcpv4lv4wwckv}5o{2kucltcmtcntcotcpt4lt4wtckt}5q{2ksclscmscnscoscps4ls4wvcks}5r{2ks4ws}5t{2kwclvcmvcnvcovcpv4lv4wwckv}eo{17st5tt5os}fu{17su5tu5ot}6p{17ss5ts}ek{17st5tt5os}el{17st5tt5os}em{17st5tt5os}en{17st5tt5os}6o{201ts}ep{17st5tt5os}es{17ss5ts}et{17ss5ts}eu{17ss5ts}ev{17ss5ts}6z{17su5tu5os5qt}fm{17su5tu5os5qt}fn{17su5tu5os5qt}fo{17su5tu5os5qt}fp{17su5tu5os5qt}fq{17su5tu5os5qt}fs{17su5tu5os5qt}ft{17su5tu5ot}7m{5os}fv{17su5tu5ot}fw{17su5tu5ot}}}"),"Courier-Bold":e("{'widths'{k3w'fof'6o}'kerning'{'fof'-6o}}"),"Times-Italic":e("{'widths'{k3n2q4ycx2l201n3m201o5t201s2l201t2l201u2l201w3r201x3r201y3r2k1t2l2l202m2n2n3m2o3m2p5n202q5t2r1p2s2l2t2l2u3m2v4n2w1t2x2l2y1t2z1w3k3m3l3m3m3m3n3m3o3m3p3m3q3m3r3m3s3m203t2l203u2l3v2l3w4n3x4n3y4n3z3m4k5w4l3x4m3x4n4m4o4s4p3x4q3x4r4s4s4s4t2l4u2w4v4m4w3r4x5n4y4m4z4s5k3x5l4s5m3x5n3m5o3r5p4s5q3x5r5n5s3x5t3r5u3r5v2r5w1w5x2r5y2u5z3m6k2l6l3m6m3m6n2w6o3m6p2w6q1w6r3m6s3m6t1w6u1w6v2w6w1w6x4s6y3m6z3m7k3m7l3m7m2r7n2r7o1w7p3m7q2w7r4m7s2w7t2w7u2r7v2s7w1v7x2s7y3q202l3mcl3xal2ram3man3mao3map3mar3mas2lat4wau1vav3maw4nay4waz2lbk2sbl4n'fof'6obo2lbp3mbq3obr1tbs2lbu1zbv3mbz3mck3x202k3mcm3xcn3xco3xcp3xcq5tcr4mcs3xct3xcu3xcv3xcw2l2m2ucy2lcz2ldl4mdm4sdn4sdo4sdp4sdq4sds4sdt4sdu4sdv4sdw4sdz3mek3mel3mem3men3meo3mep3meq4mer2wes2wet2weu2wev2wew1wex1wey1wez1wfl3mfm3mfn3mfo3mfp3mfq3mfr4nfs3mft3mfu3mfv3mfw3mfz2w203k6o212m6m2dw2l2cq2l3t3m3u2l17s3r19m3m}'kerning'{cl{5kt4qw}201s{201sw}201t{201tw2wy2yy6q-t}201x{2wy2yy}2k{201tw}2w{7qs4qy7rs5ky7mw5os5qx5ru17su5tu}2x{17ss5ts5os}2y{7qs4qy7rs5ky7mw5os5qx5ru17su5tu}'fof'-6o6t{17ss5ts5qs}7t{5os}3v{5qs}7p{17su5tu5qs}ck{5kt4qw}4l{5kt4qw}cm{5kt4qw}cn{5kt4qw}co{5kt4qw}cp{5kt4qw}6l{4qs5ks5ou5qw5ru17su5tu}17s{2ks}5q{ckvclvcmvcnvcovcpv4lv}5r{ckuclucmucnucoucpu4lu}5t{2ks}6p{4qs5ks5ou5qw5ru17su5tu}ek{4qs5ks5ou5qw5ru17su5tu}el{4qs5ks5ou5qw5ru17su5tu}em{4qs5ks5ou5qw5ru17su5tu}en{4qs5ks5ou5qw5ru17su5tu}eo{4qs5ks5ou5qw5ru17su5tu}ep{4qs5ks5ou5qw5ru17su5tu}es{5ks5qs4qs}et{4qs5ks5ou5qw5ru17su5tu}eu{4qs5ks5qw5ru17su5tu}ev{5ks5qs4qs}ex{17ss5ts5qs}6z{4qv5ks5ou5qw5ru17su5tu}fm{4qv5ks5ou5qw5ru17su5tu}fn{4qv5ks5ou5qw5ru17su5tu}fo{4qv5ks5ou5qw5ru17su5tu}fp{4qv5ks5ou5qw5ru17su5tu}fq{4qv5ks5ou5qw5ru17su5tu}7r{5os}fs{4qv5ks5ou5qw5ru17su5tu}ft{17su5tu5qs}fu{17su5tu5qs}fv{17su5tu5qs}fw{17su5tu5qs}}}"),"Times-Roman":e("{'widths'{k3n2q4ycx2l201n3m201o6o201s2l201t2l201u2l201w2w201x2w201y2w2k1t2l2l202m2n2n3m2o3m2p5n202q6o2r1m2s2l2t2l2u3m2v3s2w1t2x2l2y1t2z1w3k3m3l3m3m3m3n3m3o3m3p3m3q3m3r3m3s3m203t2l203u2l3v1w3w3s3x3s3y3s3z2w4k5w4l4s4m4m4n4m4o4s4p3x4q3r4r4s4s4s4t2l4u2r4v4s4w3x4x5t4y4s4z4s5k3r5l4s5m4m5n3r5o3x5p4s5q4s5r5y5s4s5t4s5u3x5v2l5w1w5x2l5y2z5z3m6k2l6l2w6m3m6n2w6o3m6p2w6q2l6r3m6s3m6t1w6u1w6v3m6w1w6x4y6y3m6z3m7k3m7l3m7m2l7n2r7o1w7p3m7q3m7r4s7s3m7t3m7u2w7v3k7w1o7x3k7y3q202l3mcl4sal2lam3man3mao3map3mar3mas2lat4wau1vav3maw3say4waz2lbk2sbl3s'fof'6obo2lbp3mbq2xbr1tbs2lbu1zbv3mbz2wck4s202k3mcm4scn4sco4scp4scq5tcr4mcs3xct3xcu3xcv3xcw2l2m2tcy2lcz2ldl4sdm4sdn4sdo4sdp4sdq4sds4sdt4sdu4sdv4sdw4sdz3mek2wel2wem2wen2weo2wep2weq4mer2wes2wet2weu2wev2wew1wex1wey1wez1wfl3mfm3mfn3mfo3mfp3mfq3mfr3sfs3mft3mfu3mfv3mfw3mfz3m203k6o212m6m2dw2l2cq2l3t3m3u1w17s4s19m3m}'kerning'{cl{4qs5ku17sw5ou5qy5rw201ss5tw201ws}201s{201ss}201t{ckw4lwcmwcnwcowcpwclw4wu201ts}2k{201ts}2w{4qs5kw5os5qx5ru17sx5tx}2x{17sw5tw5ou5qu}2y{4qs5kw5os5qx5ru17sx5tx}'fof'-6o7t{ckuclucmucnucoucpu4lu5os5rs}3u{17su5tu5qs}3v{17su5tu5qs}7p{17sw5tw5qs}ck{4qs5ku17sw5ou5qy5rw201ss5tw201ws}4l{4qs5ku17sw5ou5qy5rw201ss5tw201ws}cm{4qs5ku17sw5ou5qy5rw201ss5tw201ws}cn{4qs5ku17sw5ou5qy5rw201ss5tw201ws}co{4qs5ku17sw5ou5qy5rw201ss5tw201ws}cp{4qs5ku17sw5ou5qy5rw201ss5tw201ws}6l{17su5tu5os5qw5rs}17s{2ktclvcmvcnvcovcpv4lv4wuckv}5o{ckwclwcmwcnwcowcpw4lw4wu}5q{ckyclycmycnycoycpy4ly4wu5ms}5r{cktcltcmtcntcotcpt4lt4ws}5t{2ktclvcmvcnvcovcpv4lv4wuckv}7q{cksclscmscnscoscps4ls}6p{17su5tu5qw5rs}ek{5qs5rs}el{17su5tu5os5qw5rs}em{17su5tu5os5qs5rs}en{17su5qs5rs}eo{5qs5rs}ep{17su5tu5os5qw5rs}es{5qs}et{17su5tu5qw5rs}eu{17su5tu5qs5rs}ev{5qs}6z{17sv5tv5os5qx5rs}fm{5os5qt5rs}fn{17sv5tv5os5qx5rs}fo{17sv5tv5os5qx5rs}fp{5os5qt5rs}fq{5os5qt5rs}7r{ckuclucmucnucoucpu4lu5os}fs{17sv5tv5os5qx5rs}ft{17ss5ts5qs}fu{17sw5tw5qs}fv{17sw5tw5qs}fw{17ss5ts5qs}fz{ckuclucmucnucoucpu4lu5os5rs}}}"),"Helvetica-Oblique":e("{'widths'{k3p2q4mcx1w201n3r201o6o201s1q201t1q201u1q201w2l201x2l201y2l2k1w2l1w202m2n2n3r2o3r2p5t202q6o2r1n2s2l2t2l2u2r2v3u2w1w2x2l2y1w2z1w3k3r3l3r3m3r3n3r3o3r3p3r3q3r3r3r3s3r203t2l203u2l3v1w3w3u3x3u3y3u3z3r4k6p4l4m4m4m4n4s4o4s4p4m4q3x4r4y4s4s4t1w4u3m4v4m4w3r4x5n4y4s4z4y5k4m5l4y5m4s5n4m5o3x5p4s5q4m5r5y5s4m5t4m5u3x5v1w5w1w5x1w5y2z5z3r6k2l6l3r6m3r6n3m6o3r6p3r6q1w6r3r6s3r6t1q6u1q6v3m6w1q6x5n6y3r6z3r7k3r7l3r7m2l7n3m7o1w7p3r7q3m7r4s7s3m7t3m7u3m7v2l7w1u7x2l7y3u202l3rcl4mal2lam3ran3rao3rap3rar3ras2lat4tau2pav3raw3uay4taz2lbk2sbl3u'fof'6obo2lbp3rbr1wbs2lbu2obv3rbz3xck4m202k3rcm4mcn4mco4mcp4mcq6ocr4scs4mct4mcu4mcv4mcw1w2m2ncy1wcz1wdl4sdm4ydn4ydo4ydp4ydq4yds4ydt4sdu4sdv4sdw4sdz3xek3rel3rem3ren3reo3rep3req5ter3mes3ret3reu3rev3rew1wex1wey1wez1wfl3rfm3rfn3rfo3rfp3rfq3rfr3ufs3xft3rfu3rfv3rfw3rfz3m203k6o212m6o2dw2l2cq2l3t3r3u1w17s4m19m3r}'kerning'{5q{4wv}cl{4qs5kw5ow5qs17sv5tv}201t{2wu4w1k2yu}201x{2wu4wy2yu}17s{2ktclucmucnu4otcpu4lu4wycoucku}2w{7qs4qz5k1m17sy5ow5qx5rsfsu5ty7tufzu}2x{17sy5ty5oy5qs}2y{7qs4qz5k1m17sy5ow5qx5rsfsu5ty7tufzu}'fof'-6o7p{17sv5tv5ow}ck{4qs5kw5ow5qs17sv5tv}4l{4qs5kw5ow5qs17sv5tv}cm{4qs5kw5ow5qs17sv5tv}cn{4qs5kw5ow5qs17sv5tv}co{4qs5kw5ow5qs17sv5tv}cp{4qs5kw5ow5qs17sv5tv}6l{17sy5ty5ow}do{17st5tt}4z{17st5tt}7s{fst}dm{17st5tt}dn{17st5tt}5o{ckwclwcmwcnwcowcpw4lw4wv}dp{17st5tt}dq{17st5tt}7t{5ow}ds{17st5tt}5t{2ktclucmucnu4otcpu4lu4wycoucku}fu{17sv5tv5ow}6p{17sy5ty5ow5qs}ek{17sy5ty5ow}el{17sy5ty5ow}em{17sy5ty5ow}en{5ty}eo{17sy5ty5ow}ep{17sy5ty5ow}es{17sy5ty5qs}et{17sy5ty5ow5qs}eu{17sy5ty5ow5qs}ev{17sy5ty5ow5qs}6z{17sy5ty5ow5qs}fm{17sy5ty5ow5qs}fn{17sy5ty5ow5qs}fo{17sy5ty5ow5qs}fp{17sy5ty5qs}fq{17sy5ty5ow5qs}7r{5ow}fs{17sy5ty5ow5qs}ft{17sv5tv5ow}7m{5ow}fv{17sv5tv5ow}fw{17sv5tv5ow}}}")}};t.events.push(["addFont",function(t){var e,n,o,a="Unicode";e=i[a][t.PostScriptName],e&&(n=t.metadata[a]?t.metadata[a]:t.metadata[a]={},n.widths=e.widths,n.kerning=e.kerning),o=r[a][t.PostScriptName],o&&(n=t.metadata[a]?t.metadata[a]:t.metadata[a]={},n.encoding=o,o.codePages&&o.codePages.length&&(t.encoding=o.codePages[0]))}])}(e.API),function(t){t.addSVG=function(t,e,n,r,i){function o(t,e){var n=e.createElement("style");n.type="text/css",n.styleSheet?n.styleSheet.cssText=t:n.appendChild(e.createTextNode(t)),e.getElementsByTagName("head")[0].appendChild(n)}function a(t){var e="childframe",n=t.createElement("iframe");return o(".jsPDF_sillysvg_iframe {display:none;position:absolute;}",t),n.name=e,n.setAttribute("width",0),n.setAttribute("height",0),n.setAttribute("frameborder","0"),n.setAttribute("scrolling","no"),n.setAttribute("seamless","seamless"),n.setAttribute("class","jsPDF_sillysvg_iframe"),t.body.appendChild(n),n}function s(t,e){var n=(e.contentWindow||e.contentDocument).document;return n.write(t),n.close(),n.getElementsByTagName("svg")[0]}function c(t){for(var e=parseFloat(t[1]),n=parseFloat(t[2]),r=[],i=3,o=t.length;i<o;)"c"===t[i]?(r.push([parseFloat(t[i+1]),parseFloat(t[i+2]),parseFloat(t[i+3]),parseFloat(t[i+4]),parseFloat(t[i+5]),parseFloat(t[i+6])]),i+=7):"l"===t[i]?(r.push([parseFloat(t[i+1]),parseFloat(t[i+2])]),i+=3):i+=1;return[e,n,r]}var l;if(e===l||n===l)throw new Error("addSVG needs values for 'x' and 'y'");var u=a(document),h=s(t,u),f=[1,1],d=parseFloat(h.getAttribute("width")),p=parseFloat(h.getAttribute("height"));d&&p&&(r&&i?f=[r/d,i/p]:r?f=[r/d,r/d]:i&&(f=[i/p,i/p]));var g,m,w,y,v=h.childNodes;for(g=0,m=v.length;g<m;g++)w=v[g],w.tagName&&"PATH"===w.tagName.toUpperCase()&&(y=c(w.getAttribute("d").split(" ")),y[0]=y[0]*f[0]+e,y[1]=y[1]*f[1]+n,this.lines.call(this,y[2],y[0],y[1],f));return this}}(e.API),/** ==================================================================== 
   * jsPDF total_pages plugin
   * Copyright (c) 2013 Eduardo Menezes de Morais, eduardo.morais@usp.br
   * 
   * 
   * ====================================================================
   */
function(t){t.putTotalPages=function(t){for(var e=new RegExp(t,"g"),n=1;n<=this.internal.getNumberOfPages();n++)for(var r=0;r<this.internal.pages[n].length;r++)this.internal.pages[n][r]=this.internal.pages[n][r].replace(e,this.internal.getNumberOfPages());return this}}(e.API),/** ==================================================================== 
   * jsPDF XMP metadata plugin
   * Copyright (c) 2016 Jussi Utunen, u-jussi@suomi24.fi
   * 
   * 
   * ====================================================================
   */
function(t){var e="",n="",r="";t.addMetadata=function(t,i){return n=i||"http://jspdf.default.namespaceuri/",e=t,this.internal.events.subscribe("postPutResources",function(){if(e){var t='<x:xmpmeta xmlns:x="adobe:ns:meta/">',i='<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="" xmlns:jspdf="'+n+'"><jspdf:metadata>',o="</jspdf:metadata></rdf:Description></rdf:RDF>",a="</x:xmpmeta>",s=unescape(encodeURIComponent(t)),c=unescape(encodeURIComponent(i)),l=unescape(encodeURIComponent(e)),u=unescape(encodeURIComponent(o)),h=unescape(encodeURIComponent(a)),f=c.length+l.length+u.length+s.length+h.length;r=this.internal.newObject(),this.internal.write("<< /Type /Metadata /Subtype /XML /Length "+f+" >>"),this.internal.write("stream"),this.internal.write(s+c+l+u+h),this.internal.write("endstream"),this.internal.write("endobj")}else r=""}),this.internal.events.subscribe("putCatalog",function(){r&&this.internal.write("/Metadata "+r+" 0 R")}),this}}(e.API),function(t){if(t.URL=t.URL||t.webkitURL,t.Blob&&t.URL)try{return void new Blob}catch(t){}var e=t.BlobBuilder||t.WebKitBlobBuilder||t.MozBlobBuilder||function(t){var e=function(t){return Object.prototype.toString.call(t).match(/^\[object\s(.*)\]$/)[1]},n=function(){this.data=[]},r=function(t,e,n){this.data=t,this.size=t.length,this.type=e,this.encoding=n},i=n.prototype,o=r.prototype,a=t.FileReaderSync,s=function(t){this.code=this[this.name=t]},c="NOT_FOUND_ERR SECURITY_ERR ABORT_ERR NOT_READABLE_ERR ENCODING_ERR NO_MODIFICATION_ALLOWED_ERR INVALID_STATE_ERR SYNTAX_ERR".split(" "),l=c.length,u=t.URL||t.webkitURL||t,h=u.createObjectURL,f=u.revokeObjectURL,d=u,p=t.btoa,g=t.atob,m=t.ArrayBuffer,w=t.Uint8Array,y=/^[\w-]+:\/*\[?[\w\.:-]+\]?(?::[0-9]+)?/;for(r.fake=o.fake=!0;l--;)s.prototype[c[l]]=l+1;return u.createObjectURL||(d=t.URL=function(t){var e,n=document.createElementNS("http://www.w3.org/1999/xhtml","a");return n.href=t,"origin"in n||("data:"===n.protocol.toLowerCase()?n.origin=null:(e=t.match(y),n.origin=e&&e[1])),n}),d.createObjectURL=function(t){var e,n=t.type;return null===n&&(n="application/octet-stream"),t instanceof r?(e="data:"+n,"base64"===t.encoding?e+";base64,"+t.data:"URI"===t.encoding?e+","+decodeURIComponent(t.data):p?e+";base64,"+p(t.data):e+","+encodeURIComponent(t.data)):h?h.call(u,t):void 0},d.revokeObjectURL=function(t){"data:"!==t.substring(0,5)&&f&&f.call(u,t)},i.append=function(t){var n=this.data;if(w&&(t instanceof m||t instanceof w)){for(var i="",o=new w(t),c=0,l=o.length;c<l;c++)i+=String.fromCharCode(o[c]);n.push(i)}else if("Blob"===e(t)||"File"===e(t)){if(!a)throw new s("NOT_READABLE_ERR");var u=new a;n.push(u.readAsBinaryString(t))}else t instanceof r?"base64"===t.encoding&&g?n.push(g(t.data)):"URI"===t.encoding?n.push(decodeURIComponent(t.data)):"raw"===t.encoding&&n.push(t.data):("string"!=typeof t&&(t+=""),n.push(unescape(encodeURIComponent(t))))},i.getBlob=function(t){return arguments.length||(t=null),new r(this.data.join(""),t,"raw")},i.toString=function(){return"[object BlobBuilder]"},o.slice=function(t,e,n){var i=arguments.length;return i<3&&(n=null),new r(this.data.slice(t,i>1?e:this.data.length),n,this.encoding)},o.toString=function(){return"[object Blob]"},o.close=function(){this.size=0,delete this.data},n}(t);t.Blob=function(t,n){var r=n?n.type||"":"",i=new e;if(t)for(var o=0,a=t.length;o<a;o++)Uint8Array&&t[o]instanceof Uint8Array?i.append(t[o].buffer):i.append(t[o]);var s=i.getBlob(r);return!s.slice&&s.webkitSlice&&(s.slice=s.webkitSlice),s};var n=Object.getPrototypeOf||function(t){return t.__proto__};t.Blob.prototype=n(new t.Blob)}("undefined"!=typeof self&&self||"undefined"!=typeof window&&window||(void 0).content||void 0);var i=i||function(t){if("undefined"==typeof navigator||!/MSIE [1-9]\./.test(navigator.userAgent)){var e=t.document,n=function(){return t.URL||t.webkitURL||t},r=e.createElementNS("http://www.w3.org/1999/xhtml","a"),i="download"in r,o=function(t){var e=new MouseEvent("click");t.dispatchEvent(e)},a=/Version\/[\d\.]+.*Safari/.test(navigator.userAgent),s=t.webkitRequestFileSystem,c=t.requestFileSystem||s||t.mozRequestFileSystem,l=function(e){(t.setImmediate||t.setTimeout)(function(){throw e},0)},u="application/octet-stream",h=0,f=500,d=function(e){var r=function(){"string"==typeof e?n().revokeObjectURL(e):e.remove()};t.chrome?r():setTimeout(r,f)},p=function(t,e,n){e=[].concat(e);for(var r=e.length;r--;){var i=t["on"+e[r]];if("function"==typeof i)try{i.call(t,n||t)}catch(t){l(t)}}},g=function(t){return/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(t.type)?new Blob(["\ufeff",t],{type:t.type}):t},m=function(e,l,f){f||(e=g(e));var m,w,y,v=this,b=e.type,x=!1,k=function(){p(v,"writestart progress write writeend".split(" "))},_=function(){if(w&&a&&"undefined"!=typeof FileReader){var r=new FileReader;return r.onloadend=function(){var t=r.result;w.location.href="data:attachment/file"+t.slice(t.search(/[,;]/)),v.readyState=v.DONE,k()},r.readAsDataURL(e),void(v.readyState=v.INIT)}if(!x&&m||(m=n().createObjectURL(e)),w)w.location.href=m;else{var i=t.open(m,"_blank");void 0==i&&a&&(t.location.href=m)}v.readyState=v.DONE,k(),d(m)},C=function(t){return function(){if(v.readyState!==v.DONE)return t.apply(this,arguments)}},A={create:!0,exclusive:!1};return v.readyState=v.INIT,l||(l="download"),i?(m=n().createObjectURL(e),void setTimeout(function(){r.href=m,r.download=l,o(r),k(),d(m),v.readyState=v.DONE})):(t.chrome&&b&&b!==u&&(y=e.slice||e.webkitSlice,e=y.call(e,0,e.size,u),x=!0),s&&"download"!==l&&(l+=".download"),(b===u||s)&&(w=t),c?(h+=e.size,void c(t.TEMPORARY,h,C(function(t){t.root.getDirectory("saved",A,C(function(t){var n=function(){t.getFile(l,A,C(function(t){t.createWriter(C(function(n){n.onwriteend=function(e){w.location.href=t.toURL(),v.readyState=v.DONE,p(v,"writeend",e),d(t)},n.onerror=function(){var t=n.error;t.code!==t.ABORT_ERR&&_()},"writestart progress write abort".split(" ").forEach(function(t){n["on"+t]=v["on"+t]}),n.write(e),v.abort=function(){n.abort(),v.readyState=v.DONE},v.readyState=v.WRITING}),_)}),_)};t.getFile(l,{create:!1},C(function(t){t.remove(),n()}),C(function(t){t.code===t.NOT_FOUND_ERR?n():_()}))}),_)}),_)):void _())},w=m.prototype,y=function(t,e,n){return new m(t,e,n)};return"undefined"!=typeof navigator&&navigator.msSaveOrOpenBlob?function(t,e,n){return n||(t=g(t)),navigator.msSaveOrOpenBlob(t,e||"download")}:(w.abort=function(){var t=this;t.readyState=t.DONE,p(t,"abort")},w.readyState=w.INIT=0,w.WRITING=1,w.DONE=2,w.error=w.onwritestart=w.onprogress=w.onwrite=w.onabort=w.onerror=w.onwriteend=null,y)}}("undefined"!=typeof self&&self||"undefined"!=typeof window&&window||(void 0).content);"undefined"!=typeof module&&module.exports?module.exports.saveAs=i:"undefined"!=typeof define&&null!==define&&null!=define.amd&&define([],function(){return i}),/*
   * Copyright (c) 2012 chick307 <chick307@gmail.com>
   *
   * Licensed under the MIT License.
   * http://opensource.org/licenses/mit-license
   */
void function(t,e){"object"==typeof module?module.exports=e():"function"==typeof define?define(e):t.adler32cs=e()}(e,function(){var t="function"==typeof ArrayBuffer&&"function"==typeof Uint8Array,e=null,n=function(){if(!t)return function(){return!1};try{var n={};"function"==typeof n.Buffer&&(e=n.Buffer)}catch(t){}return function(t){return t instanceof ArrayBuffer||null!==e&&t instanceof e}}(),r=function(){return null!==e?function(t){return new e(t,"utf8").toString("binary")}:function(t){return unescape(encodeURIComponent(t))}}(),i=65521,o=function(t,e){for(var n=65535&t,r=t>>>16,o=0,a=e.length;o<a;o++)n=(n+(255&e.charCodeAt(o)))%i,r=(r+n)%i;return(r<<16|n)>>>0},a=function(t,e){for(var n=65535&t,r=t>>>16,o=0,a=e.length;o<a;o++)n=(n+e[o])%i,r=(r+n)%i;return(r<<16|n)>>>0},s={},c=s.Adler32=function(){var e=function(t){if(!(this instanceof e))throw new TypeError("Constructor cannot called be as a function.");if(!isFinite(t=null==t?1:+t))throw new Error("First arguments needs to be a finite number.");this.checksum=t>>>0},i=e.prototype={};return i.constructor=e,e.from=function(t){return t.prototype=i,t}(function(t){if(!(this instanceof e))throw new TypeError("Constructor cannot called be as a function.");if(null==t)throw new Error("First argument needs to be a string.");this.checksum=o(1,t.toString())}),e.fromUtf8=function(t){return t.prototype=i,t}(function(t){if(!(this instanceof e))throw new TypeError("Constructor cannot called be as a function.");if(null==t)throw new Error("First argument needs to be a string.");var n=r(t.toString());this.checksum=o(1,n)}),t&&(e.fromBuffer=function(t){return t.prototype=i,t}(function(t){if(!(this instanceof e))throw new TypeError("Constructor cannot called be as a function.");if(!n(t))throw new Error("First argument needs to be ArrayBuffer.");var r=new Uint8Array(t);return this.checksum=a(1,r)})),i.update=function(t){if(null==t)throw new Error("First argument needs to be a string.");return t=t.toString(),this.checksum=o(this.checksum,t)},i.updateUtf8=function(t){if(null==t)throw new Error("First argument needs to be a string.");var e=r(t.toString());return this.checksum=o(this.checksum,e)},t&&(i.updateBuffer=function(t){if(!n(t))throw new Error("First argument needs to be ArrayBuffer.");var e=new Uint8Array(t);return this.checksum=a(this.checksum,e)}),i.clone=function(){return new c(this.checksum)},e}();return s.from=function(t){if(null==t)throw new Error("First argument needs to be a string.");return o(1,t.toString())},s.fromUtf8=function(t){if(null==t)throw new Error("First argument needs to be a string.");var e=r(t.toString());return o(1,e)},t&&(s.fromBuffer=function(t){if(!n(t))throw new Error("First argument need to be ArrayBuffer.");var e=new Uint8Array(t);return a(1,e)}),s});/**
   * CssColors
   * Copyright (c) 2014 Steven Spungin (TwelveTone LLC)  steven@twelvetone.tv
   *
   * Licensed under the MIT License.
   * http://opensource.org/licenses/mit-license
   */
var o={};o._colorsTable={aliceblue:"#f0f8ff",antiquewhite:"#faebd7",aqua:"#00ffff",aquamarine:"#7fffd4",azure:"#f0ffff",beige:"#f5f5dc",bisque:"#ffe4c4",black:"#000000",blanchedalmond:"#ffebcd",blue:"#0000ff",blueviolet:"#8a2be2",brown:"#a52a2a",burlywood:"#deb887",cadetblue:"#5f9ea0",chartreuse:"#7fff00",chocolate:"#d2691e",coral:"#ff7f50",cornflowerblue:"#6495ed",cornsilk:"#fff8dc",crimson:"#dc143c",cyan:"#00ffff",darkblue:"#00008b",darkcyan:"#008b8b",darkgoldenrod:"#b8860b",darkgray:"#a9a9a9",darkgreen:"#006400",darkkhaki:"#bdb76b",darkmagenta:"#8b008b",darkolivegreen:"#556b2f",darkorange:"#ff8c00",darkorchid:"#9932cc",darkred:"#8b0000",darksalmon:"#e9967a",darkseagreen:"#8fbc8f",darkslateblue:"#483d8b",darkslategray:"#2f4f4f",darkturquoise:"#00ced1",darkviolet:"#9400d3",deeppink:"#ff1493",deepskyblue:"#00bfff",dimgray:"#696969",dodgerblue:"#1e90ff",firebrick:"#b22222",floralwhite:"#fffaf0",forestgreen:"#228b22",fuchsia:"#ff00ff",gainsboro:"#dcdcdc",ghostwhite:"#f8f8ff",gold:"#ffd700",goldenrod:"#daa520",gray:"#808080",green:"#008000",greenyellow:"#adff2f",honeydew:"#f0fff0",hotpink:"#ff69b4","indianred ":"#cd5c5c",indigo:"#4b0082",ivory:"#fffff0",khaki:"#f0e68c",lavender:"#e6e6fa",lavenderblush:"#fff0f5",lawngreen:"#7cfc00",lemonchiffon:"#fffacd",lightblue:"#add8e6",lightcoral:"#f08080",lightcyan:"#e0ffff",lightgoldenrodyellow:"#fafad2",lightgrey:"#d3d3d3",lightgreen:"#90ee90",lightpink:"#ffb6c1",lightsalmon:"#ffa07a",lightseagreen:"#20b2aa",lightskyblue:"#87cefa",lightslategray:"#778899",lightsteelblue:"#b0c4de",lightyellow:"#ffffe0",lime:"#00ff00",limegreen:"#32cd32",linen:"#faf0e6",magenta:"#ff00ff",maroon:"#800000",mediumaquamarine:"#66cdaa",mediumblue:"#0000cd",mediumorchid:"#ba55d3",mediumpurple:"#9370d8",mediumseagreen:"#3cb371",mediumslateblue:"#7b68ee",mediumspringgreen:"#00fa9a",mediumturquoise:"#48d1cc",mediumvioletred:"#c71585",midnightblue:"#191970",mintcream:"#f5fffa",mistyrose:"#ffe4e1",moccasin:"#ffe4b5",navajowhite:"#ffdead",navy:"#000080",oldlace:"#fdf5e6",olive:"#808000",olivedrab:"#6b8e23",orange:"#ffa500",orangered:"#ff4500",orchid:"#da70d6",palegoldenrod:"#eee8aa",palegreen:"#98fb98",paleturquoise:"#afeeee",palevioletred:"#d87093",papayawhip:"#ffefd5",peachpuff:"#ffdab9",peru:"#cd853f",pink:"#ffc0cb",plum:"#dda0dd",powderblue:"#b0e0e6",purple:"#800080",red:"#ff0000",rosybrown:"#bc8f8f",royalblue:"#4169e1",saddlebrown:"#8b4513",salmon:"#fa8072",sandybrown:"#f4a460",seagreen:"#2e8b57",seashell:"#fff5ee",sienna:"#a0522d",silver:"#c0c0c0",skyblue:"#87ceeb",slateblue:"#6a5acd",slategray:"#708090",snow:"#fffafa",springgreen:"#00ff7f",steelblue:"#4682b4",tan:"#d2b48c",teal:"#008080",thistle:"#d8bfd8",tomato:"#ff6347",turquoise:"#40e0d0",violet:"#ee82ee",wheat:"#f5deb3",white:"#ffffff",whitesmoke:"#f5f5f5",yellow:"#ffff00",yellowgreen:"#9acd32"},o.colorNameToHex=function(t){return t=t.toLowerCase(),"undefined"!=typeof this._colorsTable[t]&&this._colorsTable[t]};/*
   Deflate.js - https://github.com/gildas-lormeau/zip.js
   Copyright (c) 2013 Gildas Lormeau. All rights reserved.

   Redistribution and use in source and binary forms, with or without
   modification, are permitted provided that the following conditions are met:

   1. Redistributions of source code must retain the above copyright notice,
   this list of conditions and the following disclaimer.

   2. Redistributions in binary form must reproduce the above copyright 
   notice, this list of conditions and the following disclaimer in 
   the documentation and/or other materials provided with the distribution.

   3. The names of the authors may not be used to endorse or promote products
   derived from this software without specific prior written permission.

   THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
   INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
   FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
   INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
   INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
   LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
   OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
   LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
   NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
   EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
   */
var a=function(t){function e(){function t(t){var e,n,i,o,a,c,l=r.dyn_tree,u=r.stat_desc.static_tree,h=r.stat_desc.extra_bits,f=r.stat_desc.extra_base,p=r.stat_desc.max_length,g=0;for(o=0;o<=s;o++)t.bl_count[o]=0;for(l[2*t.heap[t.heap_max]+1]=0,e=t.heap_max+1;e<d;e++)n=t.heap[e],o=l[2*l[2*n+1]+1]+1,o>p&&(o=p,g++),l[2*n+1]=o,n>r.max_code||(t.bl_count[o]++,a=0,n>=f&&(a=h[n-f]),c=l[2*n],t.opt_len+=c*(o+a),u&&(t.static_len+=c*(u[2*n+1]+a)));if(0!==g){do{for(o=p-1;0===t.bl_count[o];)o--;t.bl_count[o]--,t.bl_count[o+1]+=2,t.bl_count[p]--,g-=2}while(g>0);for(o=p;0!==o;o--)for(n=t.bl_count[o];0!==n;)i=t.heap[--e],i>r.max_code||(l[2*i+1]!=o&&(t.opt_len+=(o-l[2*i+1])*l[2*i],l[2*i+1]=o),n--)}}function e(t,e){var n=0;do n|=1&t,t>>>=1,n<<=1;while(--e>0);return n>>>1}function n(t,n,r){var i,o,a,c=[],l=0;for(i=1;i<=s;i++)c[i]=l=l+r[i-1]<<1;for(o=0;o<=n;o++)a=t[2*o+1],0!==a&&(t[2*o]=e(c[a]++,a))}var r=this;r.build_tree=function(e){var i,o,a,s=r.dyn_tree,c=r.stat_desc.static_tree,l=r.stat_desc.elems,u=-1;for(e.heap_len=0,e.heap_max=d,i=0;i<l;i++)0!==s[2*i]?(e.heap[++e.heap_len]=u=i,e.depth[i]=0):s[2*i+1]=0;for(;e.heap_len<2;)a=e.heap[++e.heap_len]=u<2?++u:0,s[2*a]=1,e.depth[a]=0,e.opt_len--,c&&(e.static_len-=c[2*a+1]);for(r.max_code=u,i=Math.floor(e.heap_len/2);i>=1;i--)e.pqdownheap(s,i);a=l;do i=e.heap[1],e.heap[1]=e.heap[e.heap_len--],e.pqdownheap(s,1),o=e.heap[1],e.heap[--e.heap_max]=i,e.heap[--e.heap_max]=o,s[2*a]=s[2*i]+s[2*o],e.depth[a]=Math.max(e.depth[i],e.depth[o])+1,s[2*i+1]=s[2*o+1]=a,e.heap[1]=a++,e.pqdownheap(s,1);while(e.heap_len>=2);e.heap[--e.heap_max]=e.heap[1],t(e),n(s,r.max_code,e.bl_count)}}function n(t,e,n,r,i){var o=this;o.static_tree=t,o.extra_bits=e,o.extra_base=n,o.elems=r,o.max_length=i}function r(t,e,n,r,i){var o=this;o.good_length=t,o.max_lazy=e,o.nice_length=n,o.max_chain=r,o.func=i}function i(t,e,n,r){var i=t[2*e],o=t[2*n];return i<o||i==o&&r[e]<=r[n]}function o(){function t(){var t;for(Pt=2*St,Ot[Rt-1]=0,t=0;t<Rt-1;t++)Ot[t]=0;Yt=L[Gt].max_lazy,Qt=L[Gt].good_length,Kt=L[Gt].nice_length,Vt=L[Gt].max_chain,Ut=0,Nt=0,Wt=0,zt=Xt=tt-1,Mt=0,Ft=0}function r(){var t;for(t=0;t<f;t++)$t[2*t]=0;for(t=0;t<c;t++)Zt[2*t]=0;for(t=0;t<l;t++)te[2*t]=0;$t[2*p]=1,ee.opt_len=ee.static_len=0,se=le=0}function o(){ne.dyn_tree=$t,ne.stat_desc=n.static_l_desc,re.dyn_tree=Zt,re.stat_desc=n.static_d_desc,ie.dyn_tree=te,ie.stat_desc=n.static_bl_desc,he=0,fe=0,ue=8,r()}function a(t,e){var n,r,i=-1,o=t[1],a=0,s=7,c=4;for(0===o&&(s=138,c=3),t[2*(e+1)+1]=65535,n=0;n<=e;n++)r=o,o=t[2*(n+1)+1],++a<s&&r==o||(a<c?te[2*r]+=a:0!==r?(r!=i&&te[2*r]++,te[2*m]++):a<=10?te[2*w]++:te[2*y]++,a=0,i=r,0===o?(s=138,c=3):r==o?(s=6,c=3):(s=7,c=4))}function s(){var t;for(a($t,ne.max_code),a(Zt,re.max_code),ie.build_tree(ee),t=l-1;t>=3&&0===te[2*e.bl_order[t]+1];t--);return ee.opt_len+=3*(t+1)+5+5+4,t}function u(t){ee.pending_buf[ee.pending++]=t}function d(t){u(255&t),u(t>>>8&255)}function g(t){u(t>>8&255),u(255&t&255)}function R(t,e){var n,r=e;fe>v-r?(n=t,he|=n<<fe&65535,d(he),he=n>>>v-fe,fe+=r-v):(he|=t<<fe&65535,fe+=r)}function rt(t,e){var n=2*t;R(65535&e[n],65535&e[n+1])}function it(t,e){var n,r,i=-1,o=t[1],a=0,s=7,c=4;for(0===o&&(s=138,c=3),n=0;n<=e;n++)if(r=o,o=t[2*(n+1)+1],!(++a<s&&r==o)){if(a<c){do rt(r,te);while(0!==--a)}else 0!==r?(r!=i&&(rt(r,te),a--),rt(m,te),R(a-3,2)):a<=10?(rt(w,te),R(a-3,3)):(rt(y,te),R(a-11,7));a=0,i=r,0===o?(s=138,c=3):r==o?(s=6,c=3):(s=7,c=4)}}function ot(t,n,r){var i;for(R(t-257,5),R(n-1,5),R(r-4,4),i=0;i<r;i++)R(te[2*e.bl_order[i]+1],3);it($t,t-1),it(Zt,n-1)}function at(){16==fe?(d(he),he=0,fe=0):fe>=8&&(u(255&he),he>>>=8,fe-=8)}function st(){R($<<1,3),rt(p,n.static_ltree),at(),1+ue+10-fe<9&&(R($<<1,3),rt(p,n.static_ltree),at()),ue=7}function ct(t,n){var r,i,o;if(ee.pending_buf[ce+2*se]=t>>>8&255,ee.pending_buf[ce+2*se+1]=255&t,ee.pending_buf[oe+se]=255&n,se++,0===t?$t[2*n]++:(le++,t--,$t[2*(e._length_code[n]+h+1)]++,Zt[2*e.d_code(t)]++),0===(8191&se)&&Gt>2){for(r=8*se,i=Ut-Nt,o=0;o<c;o++)r+=Zt[2*o]*(5+e.extra_dbits[o]);if(r>>>=3,le<Math.floor(se/2)&&r<Math.floor(i/2))return!0}return se==ae-1}function lt(t,n){var r,i,o,a,s=0;if(0!==se)do r=ee.pending_buf[ce+2*s]<<8&65280|255&ee.pending_buf[ce+2*s+1],i=255&ee.pending_buf[oe+s],s++,0===r?rt(i,t):(o=e._length_code[i],rt(o+h+1,t),a=e.extra_lbits[o],0!==a&&(i-=e.base_length[o],R(i,a)),r--,o=e.d_code(r),rt(o,n),a=e.extra_dbits[o],0!==a&&(r-=e.base_dist[o],R(r,a)));while(s<se);rt(p,t),ue=t[2*p+1]}function ut(){fe>8?d(he):fe>0&&u(255&he),he=0,fe=0}function ht(t,e,n){ut(),ue=8,n&&(d(e),d(~e)),ee.pending_buf.set(It.subarray(t,t+e),ee.pending),ee.pending+=e}function ft(t,e,n){R((K<<1)+(n?1:0),3),ht(t,e,!0)}function dt(t,e,i){var o,a,c=0;Gt>0?(ne.build_tree(ee),re.build_tree(ee),c=s(),o=ee.opt_len+3+7>>>3,a=ee.static_len+3+7>>>3,a<=o&&(o=a)):o=a=e+5,e+4<=o&&t!=-1?ft(t,e,i):a==o?(R(($<<1)+(i?1:0),3),lt(n.static_ltree,n.static_dtree)):(R((Z<<1)+(i?1:0),3),ot(ne.max_code+1,re.max_code+1,c+1),lt($t,Zt)),r(),i&&ut()}function pt(t){dt(Nt>=0?Nt:-1,Ut-Nt,t),Nt=Ut,xt.flush_pending()}function gt(){var t,e,n,r;do{if(r=Pt-Wt-Ut,0===r&&0===Ut&&0===Wt)r=St;else if(r==-1)r--;else if(Ut>=St+St-nt){It.set(It.subarray(St,St+St),0),Ht-=St,Ut-=St,Nt-=St,t=Rt,n=t;do e=65535&Ot[--n],Ot[n]=e>=St?e-St:0;while(0!==--t);t=St,n=t;do e=65535&Et[--n],Et[n]=e>=St?e-St:0;while(0!==--t);r+=St}if(0===xt.avail_in)return;t=xt.read_buf(It,Ut+Wt,r),Wt+=t,Wt>=tt&&(Ft=255&It[Ut],Ft=(Ft<<jt^255&It[Ut+1])&Dt)}while(Wt<nt&&0!==xt.avail_in)}function mt(t){var e,n=65535;for(n>_t-5&&(n=_t-5);;){if(Wt<=1){if(gt(),0===Wt&&t==C)return U;if(0===Wt)break}if(Ut+=Wt,Wt=0,e=Nt+n,(0===Ut||Ut>=e)&&(Wt=Ut-e,Ut=e,pt(!1),0===xt.avail_out))return U;if(Ut-Nt>=St-nt&&(pt(!1),0===xt.avail_out))return U}return pt(t==q),0===xt.avail_out?t==q?W:U:t==q?X:H}function wt(t){var e,n,r=Vt,i=Ut,o=Xt,a=Ut>St-nt?Ut-(St-nt):0,s=Kt,c=Tt,l=Ut+et,u=It[i+o-1],h=It[i+o];Xt>=Qt&&(r>>=2),s>Wt&&(s=Wt);do if(e=t,It[e+o]==h&&It[e+o-1]==u&&It[e]==It[i]&&It[++e]==It[i+1]){i+=2,e++;do;while(It[++i]==It[++e]&&It[++i]==It[++e]&&It[++i]==It[++e]&&It[++i]==It[++e]&&It[++i]==It[++e]&&It[++i]==It[++e]&&It[++i]==It[++e]&&It[++i]==It[++e]&&i<l);if(n=et-(l-i),i=l-et,n>o){if(Ht=t,o=n,n>=s)break;u=It[i+o-1],h=It[i+o]}}while((t=65535&Et[t&c])>a&&0!==--r);return o<=Wt?o:Wt}function yt(t){for(var e,n=0;;){if(Wt<nt){if(gt(),Wt<nt&&t==C)return U;if(0===Wt)break}if(Wt>=tt&&(Ft=(Ft<<jt^255&It[Ut+(tt-1)])&Dt,n=65535&Ot[Ft],Et[Ut&Tt]=Ot[Ft],Ot[Ft]=Ut),0!==n&&(Ut-n&65535)<=St-nt&&Jt!=k&&(zt=wt(n)),zt>=tt)if(e=ct(Ut-Ht,zt-tt),Wt-=zt,zt<=Yt&&Wt>=tt){zt--;do Ut++,Ft=(Ft<<jt^255&It[Ut+(tt-1)])&Dt,n=65535&Ot[Ft],Et[Ut&Tt]=Ot[Ft],Ot[Ft]=Ut;while(0!==--zt);Ut++}else Ut+=zt,zt=0,Ft=255&It[Ut],Ft=(Ft<<jt^255&It[Ut+1])&Dt;else e=ct(0,255&It[Ut]),Wt--,Ut++;if(e&&(pt(!1),0===xt.avail_out))return U}return pt(t==q),0===xt.avail_out?t==q?W:U:t==q?X:H}function vt(t){for(var e,n,r=0;;){if(Wt<nt){if(gt(),Wt<nt&&t==C)return U;if(0===Wt)break}if(Wt>=tt&&(Ft=(Ft<<jt^255&It[Ut+(tt-1)])&Dt,r=65535&Ot[Ft],Et[Ut&Tt]=Ot[Ft],Ot[Ft]=Ut),Xt=zt,Lt=Ht,zt=tt-1,0!==r&&Xt<Yt&&(Ut-r&65535)<=St-nt&&(Jt!=k&&(zt=wt(r)),zt<=5&&(Jt==x||zt==tt&&Ut-Ht>4096)&&(zt=tt-1)),Xt>=tt&&zt<=Xt){n=Ut+Wt-tt,e=ct(Ut-1-Lt,Xt-tt),Wt-=Xt-1,Xt-=2;do++Ut<=n&&(Ft=(Ft<<jt^255&It[Ut+(tt-1)])&Dt,r=65535&Ot[Ft],Et[Ut&Tt]=Ot[Ft],Ot[Ft]=Ut);while(0!==--Xt);if(Mt=0,zt=tt-1,Ut++,e&&(pt(!1),0===xt.avail_out))return U}else if(0!==Mt){if(e=ct(0,255&It[Ut-1]),e&&pt(!1),Ut++,Wt--,0===xt.avail_out)return U}else Mt=1,Ut++,Wt--}return 0!==Mt&&(e=ct(0,255&It[Ut-1]),Mt=0),pt(t==q),0===xt.avail_out?t==q?W:U:t==q?X:H}function bt(e){return e.total_in=e.total_out=0,e.msg=null,ee.pending=0,ee.pending_out=0,kt=G,At=C,o(),t(),T}var xt,kt,_t,Ct,At,St,qt,Tt,It,Pt,Et,Ot,Ft,Rt,Bt,Dt,jt,Nt,zt,Lt,Mt,Ut,Ht,Wt,Xt,Vt,Yt,Gt,Jt,Qt,Kt,$t,Zt,te,ee=this,ne=new e,re=new e,ie=new e;ee.depth=[];var oe,ae,se,ce,le,ue,he,fe;ee.bl_count=[],ee.heap=[],$t=[],Zt=[],te=[],ee.pqdownheap=function(t,e){for(var n=ee.heap,r=n[e],o=e<<1;o<=ee.heap_len&&(o<ee.heap_len&&i(t,n[o+1],n[o],ee.depth)&&o++,!i(t,r,n[o],ee.depth));)n[e]=n[o],e=o,o<<=1;n[e]=r},ee.deflateInit=function(t,e,n,r,i,o){return r||(r=Q),i||(i=D),o||(o=_),t.msg=null,e==b&&(e=6),i<1||i>B||r!=Q||n<9||n>15||e<0||e>9||o<0||o>k?E:(t.dstate=ee,qt=n,St=1<<qt,Tt=St-1,Bt=i+7,Rt=1<<Bt,Dt=Rt-1,jt=Math.floor((Bt+tt-1)/tt),It=new Uint8Array(2*St),Et=[],Ot=[],ae=1<<i+6,ee.pending_buf=new Uint8Array(4*ae),_t=4*ae,ce=Math.floor(ae/2),oe=3*ae,Gt=e,Jt=o,Ct=255&r,bt(t))},ee.deflateEnd=function(){return kt!=Y&&kt!=G&&kt!=J?E:(ee.pending_buf=null,Ot=null,Et=null,It=null,ee.dstate=null,kt==G?O:T)},ee.deflateParams=function(t,e,n){var r=T;return e==b&&(e=6),e<0||e>9||n<0||n>k?E:(L[Gt].func!=L[e].func&&0!==t.total_in&&(r=t.deflate(A)),Gt!=e&&(Gt=e,Yt=L[Gt].max_lazy,Qt=L[Gt].good_length,Kt=L[Gt].nice_length,Vt=L[Gt].max_chain),Jt=n,r)},ee.deflateSetDictionary=function(t,e,n){var r,i=n,o=0;if(!e||kt!=Y)return E;if(i<tt)return T;for(i>St-nt&&(i=St-nt,o=n-i),It.set(e.subarray(o,o+i),0),Ut=i,Nt=i,Ft=255&It[0],Ft=(Ft<<jt^255&It[1])&Dt,r=0;r<=i-tt;r++)Ft=(Ft<<jt^255&It[r+(tt-1)])&Dt,Et[r&Tt]=Ot[Ft],Ot[Ft]=r;return T},ee.deflate=function(t,e){var n,r,i,o,a;if(e>q||e<0)return E;if(!t.next_out||!t.next_in&&0!==t.avail_in||kt==J&&e!=q)return t.msg=M[P-E],E;if(0===t.avail_out)return t.msg=M[P-F],F;if(xt=t,o=At,At=e,kt==Y&&(r=Q+(qt-8<<4)<<8,i=(Gt-1&255)>>1,i>3&&(i=3),r|=i<<6,0!==Ut&&(r|=V),r+=31-r%31,kt=G,g(r)),0!==ee.pending){if(xt.flush_pending(),0===xt.avail_out)return At=-1,T}else if(0===xt.avail_in&&e<=o&&e!=q)return xt.msg=M[P-F],F;if(kt==J&&0!==xt.avail_in)return t.msg=M[P-F],F;if(0!==xt.avail_in||0!==Wt||e!=C&&kt!=J){switch(a=-1,L[Gt].func){case j:a=mt(e);break;case N:a=yt(e);break;case z:a=vt(e)}if(a!=W&&a!=X||(kt=J),a==U||a==W)return 0===xt.avail_out&&(At=-1),T;if(a==H){if(e==A)st();else if(ft(0,0,!1),e==S)for(n=0;n<Rt;n++)Ot[n]=0;if(xt.flush_pending(),0===xt.avail_out)return At=-1,T}}return e!=q?T:I}}function a(){var t=this;t.next_in_index=0,t.next_out_index=0,t.avail_in=0,t.total_in=0,t.avail_out=0,t.total_out=0}var s=15,c=30,l=19,u=29,h=256,f=h+1+u,d=2*f+1,p=256,g=7,m=16,w=17,y=18,v=16,b=-1,x=1,k=2,_=0,C=0,A=1,S=3,q=4,T=0,I=1,P=2,E=-2,O=-3,F=-5,R=[0,1,2,3,4,4,5,5,6,6,6,6,7,7,7,7,8,8,8,8,8,8,8,8,9,9,9,9,9,9,9,9,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,0,0,16,17,18,18,19,19,20,20,20,20,21,21,21,21,22,22,22,22,22,22,22,22,23,23,23,23,23,23,23,23,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29];e._length_code=[0,1,2,3,4,5,6,7,8,8,9,9,10,10,11,11,12,12,12,12,13,13,13,13,14,14,14,14,15,15,15,15,16,16,16,16,16,16,16,16,17,17,17,17,17,17,17,17,18,18,18,18,18,18,18,18,19,19,19,19,19,19,19,19,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,28],e.base_length=[0,1,2,3,4,5,6,7,8,10,12,14,16,20,24,28,32,40,48,56,64,80,96,112,128,160,192,224,0],e.base_dist=[0,1,2,3,4,6,8,12,16,24,32,48,64,96,128,192,256,384,512,768,1024,1536,2048,3072,4096,6144,8192,12288,16384,24576],e.d_code=function(t){return t<256?R[t]:R[256+(t>>>7)]},e.extra_lbits=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],e.extra_dbits=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],e.extra_blbits=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7],e.bl_order=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],n.static_ltree=[12,8,140,8,76,8,204,8,44,8,172,8,108,8,236,8,28,8,156,8,92,8,220,8,60,8,188,8,124,8,252,8,2,8,130,8,66,8,194,8,34,8,162,8,98,8,226,8,18,8,146,8,82,8,210,8,50,8,178,8,114,8,242,8,10,8,138,8,74,8,202,8,42,8,170,8,106,8,234,8,26,8,154,8,90,8,218,8,58,8,186,8,122,8,250,8,6,8,134,8,70,8,198,8,38,8,166,8,102,8,230,8,22,8,150,8,86,8,214,8,54,8,182,8,118,8,246,8,14,8,142,8,78,8,206,8,46,8,174,8,110,8,238,8,30,8,158,8,94,8,222,8,62,8,190,8,126,8,254,8,1,8,129,8,65,8,193,8,33,8,161,8,97,8,225,8,17,8,145,8,81,8,209,8,49,8,177,8,113,8,241,8,9,8,137,8,73,8,201,8,41,8,169,8,105,8,233,8,25,8,153,8,89,8,217,8,57,8,185,8,121,8,249,8,5,8,133,8,69,8,197,8,37,8,165,8,101,8,229,8,21,8,149,8,85,8,213,8,53,8,181,8,117,8,245,8,13,8,141,8,77,8,205,8,45,8,173,8,109,8,237,8,29,8,157,8,93,8,221,8,61,8,189,8,125,8,253,8,19,9,275,9,147,9,403,9,83,9,339,9,211,9,467,9,51,9,307,9,179,9,435,9,115,9,371,9,243,9,499,9,11,9,267,9,139,9,395,9,75,9,331,9,203,9,459,9,43,9,299,9,171,9,427,9,107,9,363,9,235,9,491,9,27,9,283,9,155,9,411,9,91,9,347,9,219,9,475,9,59,9,315,9,187,9,443,9,123,9,379,9,251,9,507,9,7,9,263,9,135,9,391,9,71,9,327,9,199,9,455,9,39,9,295,9,167,9,423,9,103,9,359,9,231,9,487,9,23,9,279,9,151,9,407,9,87,9,343,9,215,9,471,9,55,9,311,9,183,9,439,9,119,9,375,9,247,9,503,9,15,9,271,9,143,9,399,9,79,9,335,9,207,9,463,9,47,9,303,9,175,9,431,9,111,9,367,9,239,9,495,9,31,9,287,9,159,9,415,9,95,9,351,9,223,9,479,9,63,9,319,9,191,9,447,9,127,9,383,9,255,9,511,9,0,7,64,7,32,7,96,7,16,7,80,7,48,7,112,7,8,7,72,7,40,7,104,7,24,7,88,7,56,7,120,7,4,7,68,7,36,7,100,7,20,7,84,7,52,7,116,7,3,8,131,8,67,8,195,8,35,8,163,8,99,8,227,8],n.static_dtree=[0,5,16,5,8,5,24,5,4,5,20,5,12,5,28,5,2,5,18,5,10,5,26,5,6,5,22,5,14,5,30,5,1,5,17,5,9,5,25,5,5,5,21,5,13,5,29,5,3,5,19,5,11,5,27,5,7,5,23,5],n.static_l_desc=new n(n.static_ltree,e.extra_lbits,h+1,f,s),n.static_d_desc=new n(n.static_dtree,e.extra_dbits,0,c,s),n.static_bl_desc=new n(null,e.extra_blbits,0,l,g);var B=9,D=8,j=0,N=1,z=2,L=[new r(0,0,0,0,j),new r(4,4,8,4,N),new r(4,5,16,8,N),new r(4,6,32,32,N),new r(4,4,16,16,z),new r(8,16,32,32,z),new r(8,16,128,128,z),new r(8,32,128,256,z),new r(32,128,258,1024,z),new r(32,258,258,4096,z)],M=["need dictionary","stream end","","","stream error","data error","","buffer error","",""],U=0,H=1,W=2,X=3,V=32,Y=42,G=113,J=666,Q=8,K=0,$=1,Z=2,tt=3,et=258,nt=et+tt+1;return a.prototype={deflateInit:function(t,e){var n=this;return n.dstate=new o,e||(e=s),n.dstate.deflateInit(n,t,e)},deflate:function(t){var e=this;return e.dstate?e.dstate.deflate(e,t):E},deflateEnd:function(){var t=this;if(!t.dstate)return E;var e=t.dstate.deflateEnd();return t.dstate=null,e},deflateParams:function(t,e){var n=this;return n.dstate?n.dstate.deflateParams(n,t,e):E},deflateSetDictionary:function(t,e){var n=this;return n.dstate?n.dstate.deflateSetDictionary(n,t,e):E},read_buf:function(t,e,n){var r=this,i=r.avail_in;return i>n&&(i=n),0===i?0:(r.avail_in-=i,t.set(r.next_in.subarray(r.next_in_index,r.next_in_index+i),e),r.next_in_index+=i,r.total_in+=i,i)},flush_pending:function(){var t=this,e=t.dstate.pending;e>t.avail_out&&(e=t.avail_out),0!==e&&(t.next_out.set(t.dstate.pending_buf.subarray(t.dstate.pending_out,t.dstate.pending_out+e),t.next_out_index),t.next_out_index+=e,t.dstate.pending_out+=e,t.total_out+=e,t.avail_out-=e,t.dstate.pending-=e,0===t.dstate.pending&&(t.dstate.pending_out=0))}},function(t){var e=this,n=new a,r=512,i=C,o=new Uint8Array(r);"undefined"==typeof t&&(t=b),n.deflateInit(t),n.next_out=o,e.append=function(t,e){var a,s,c=[],l=0,u=0,h=0;if(t.length){n.next_in_index=0,n.next_in=t,n.avail_in=t.length;do{if(n.next_out_index=0,n.avail_out=r,a=n.deflate(i),a!=T)throw"deflating: "+n.msg;n.next_out_index&&(n.next_out_index==r?c.push(new Uint8Array(o)):c.push(new Uint8Array(o.subarray(0,n.next_out_index)))),h+=n.next_out_index,e&&n.next_in_index>0&&n.next_in_index!=l&&(e(n.next_in_index),l=n.next_in_index)}while(n.avail_in>0||0===n.avail_out);return s=new Uint8Array(h),c.forEach(function(t){s.set(t,u),u+=t.length}),s}},e.flush=function(){var t,e,i=[],a=0,s=0;do{if(n.next_out_index=0,n.avail_out=r,t=n.deflate(q),t!=I&&t!=T)throw"deflating: "+n.msg;r-n.avail_out>0&&i.push(new Uint8Array(o.subarray(0,n.next_out_index))),s+=n.next_out_index}while(n.avail_in>0||0===n.avail_out);return n.deflateEnd(),e=new Uint8Array(s),i.forEach(function(t){e.set(t,a),a+=t.length}),e}}}(void 0);/*
    html2canvas 0.5.0-beta3 <http://html2canvas.hertzen.com>
    Copyright (c) 2016 Niklas von Hertzen

    Released under  License
  */
!function(t){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=t();else if("function"==typeof define&&define.amd)define([],t);else{var e;"undefined"!=typeof window?e=window:"undefined"!=typeof global?e=global:"undefined"!=typeof self&&(e=self),e.html2canvas=t()}}(function(){var t;return function t(e,n,r){function i(a,s){if(!n[a]){if(!e[a]){var c="function"==typeof require&&require;if(!s&&c)return c(a,!0);if(o)return o(a,!0);var l=new Error("Cannot find module '"+a+"'");throw l.code="MODULE_NOT_FOUND",l}var u=n[a]={exports:{}};e[a][0].call(u.exports,function(t){var n=e[a][1][t];return i(n?n:t)},u,u.exports,t,e,n,r)}return n[a].exports}for(var o="function"==typeof require&&require,a=0;a<r.length;a++)i(r[a]);return i}({1:[function(e,n,r){(function(e){!function(i){function o(t){throw RangeError(R[t])}function a(t,e){for(var n=t.length;n--;)t[n]=e(t[n]);return t}function s(t,e){return a(t.split(F),e).join(".")}function c(t){for(var e,n,r=[],i=0,o=t.length;i<o;)e=t.charCodeAt(i++),e>=55296&&e<=56319&&i<o?(n=t.charCodeAt(i++),56320==(64512&n)?r.push(((1023&e)<<10)+(1023&n)+65536):(r.push(e),i--)):r.push(e);return r}function l(t){return a(t,function(t){var e="";return t>65535&&(t-=65536,e+=j(t>>>10&1023|55296),t=56320|1023&t),e+=j(t)}).join("")}function u(t){return t-48<10?t-22:t-65<26?t-65:t-97<26?t-97:_}function h(t,e){return t+22+75*(t<26)-((0!=e)<<5)}function f(t,e,n){var r=0;for(t=n?D(t/q):t>>1,t+=D(t/e);t>B*A>>1;r+=_)t=D(t/B);return D(r+(B+1)*t/(t+S))}function d(t){var e,n,r,i,a,s,c,h,d,p,g=[],m=t.length,w=0,y=I,v=T;for(n=t.lastIndexOf(P),n<0&&(n=0),r=0;r<n;++r)t.charCodeAt(r)>=128&&o("not-basic"),g.push(t.charCodeAt(r));for(i=n>0?n+1:0;i<m;){for(a=w,s=1,c=_;i>=m&&o("invalid-input"),h=u(t.charCodeAt(i++)),(h>=_||h>D((k-w)/s))&&o("overflow"),w+=h*s,d=c<=v?C:c>=v+A?A:c-v,!(h<d);c+=_)p=_-d,s>D(k/p)&&o("overflow"),s*=p;e=g.length+1,v=f(w-a,e,0==a),D(w/e)>k-y&&o("overflow"),y+=D(w/e),w%=e,g.splice(w++,0,y)}return l(g)}function p(t){var e,n,r,i,a,s,l,u,d,p,g,m,w,y,v,b=[];for(t=c(t),m=t.length,e=I,n=0,a=T,s=0;s<m;++s)g=t[s],g<128&&b.push(j(g));for(r=i=b.length,i&&b.push(P);r<m;){for(l=k,s=0;s<m;++s)g=t[s],g>=e&&g<l&&(l=g);for(w=r+1,l-e>D((k-n)/w)&&o("overflow"),n+=(l-e)*w,e=l,s=0;s<m;++s)if(g=t[s],g<e&&++n>k&&o("overflow"),g==e){for(u=n,d=_;p=d<=a?C:d>=a+A?A:d-a,!(u<p);d+=_)v=u-p,y=_-p,b.push(j(h(p+v%y,0))),u=D(v/y);b.push(j(h(u,0))),a=f(n,w,r==i),n=0,++r}++n,++e}return b.join("")}function g(t){return s(t,function(t){return E.test(t)?d(t.slice(4).toLowerCase()):t})}function m(t){return s(t,function(t){return O.test(t)?"xn--"+p(t):t})}var w="object"==typeof r&&r,y="object"==typeof n&&n&&n.exports==w&&n,v="object"==typeof e&&e;v.global!==v&&v.window!==v||(i=v);var b,x,k=2147483647,_=36,C=1,A=26,S=38,q=700,T=72,I=128,P="-",E=/^xn--/,O=/[^ -~]/,F=/\x2E|\u3002|\uFF0E|\uFF61/g,R={overflow:"Overflow: input needs wider integers to process","not-basic":"Illegal input >= 0x80 (not a basic code point)","invalid-input":"Invalid input"},B=_-C,D=Math.floor,j=String.fromCharCode;if(b={version:"1.2.4",ucs2:{decode:c,encode:l},decode:d,encode:p,toASCII:m,toUnicode:g},"function"==typeof t&&"object"==typeof t.amd&&t.amd)t("punycode",function(){return b});else if(w&&!w.nodeType)if(y)y.exports=b;else for(x in b)b.hasOwnProperty(x)&&(w[x]=b[x]);else i.punycode=b}(this)}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],2:[function(t,e,n){function r(t,e,n){!t.defaultView||e===t.defaultView.pageXOffset&&n===t.defaultView.pageYOffset||t.defaultView.scrollTo(e,n)}function i(t,e){try{e&&(e.width=t.width,e.height=t.height,e.getContext("2d").putImageData(t.getContext("2d").getImageData(0,0,t.width,t.height),0,0))}catch(e){s("Unable to copy canvas content from",t,e)}}function o(t,e){for(var n=3===t.nodeType?document.createTextNode(t.nodeValue):t.cloneNode(!1),r=t.firstChild;r;)e!==!0&&1===r.nodeType&&"SCRIPT"===r.nodeName||n.appendChild(o(r,e)),r=r.nextSibling;return 1===t.nodeType&&(n._scrollTop=t.scrollTop,n._scrollLeft=t.scrollLeft,"CANVAS"===t.nodeName?i(t,n):"TEXTAREA"!==t.nodeName&&"SELECT"!==t.nodeName||(n.value=t.value)),n}function a(t){if(1===t.nodeType){t.scrollTop=t._scrollTop,t.scrollLeft=t._scrollLeft;for(var e=t.firstChild;e;)a(e),e=e.nextSibling}}var s=t("./log");e.exports=function(t,e,n,i,s,c,l){var u=o(t.documentElement,s.javascriptEnabled),h=e.createElement("iframe");return h.className="html2canvas-container",h.style.visibility="hidden",h.style.position="fixed",h.style.left="-10000px",h.style.top="0px",h.style.border="0",h.width=n,h.height=i,h.scrolling="no",e.body.appendChild(h),new Promise(function(e){var n=h.contentWindow.document;h.contentWindow.onload=h.onload=function(){var t=setInterval(function(){n.body.childNodes.length>0&&(a(n.documentElement),clearInterval(t),"view"===s.type&&(h.contentWindow.scrollTo(c,l),!/(iPad|iPhone|iPod)/g.test(navigator.userAgent)||h.contentWindow.scrollY===l&&h.contentWindow.scrollX===c||(n.documentElement.style.top=-l+"px",n.documentElement.style.left=-c+"px",n.documentElement.style.position="absolute")),e(h))},50)},n.open(),n.write("<!DOCTYPE html><html></html>"),r(t,c,l),n.replaceChild(n.adoptNode(u),n.documentElement),n.close()})}},{"./log":13}],3:[function(t,e,n){function r(t){this.r=0,this.g=0,this.b=0,this.a=null;this.fromArray(t)||this.namedColor(t)||this.rgb(t)||this.rgba(t)||this.hex6(t)||this.hex3(t)}r.prototype.darken=function(t){var e=1-t;return new r([Math.round(this.r*e),Math.round(this.g*e),Math.round(this.b*e),this.a])},r.prototype.isTransparent=function(){return 0===this.a},r.prototype.isBlack=function(){return 0===this.r&&0===this.g&&0===this.b},r.prototype.fromArray=function(t){return Array.isArray(t)&&(this.r=Math.min(t[0],255),this.g=Math.min(t[1],255),this.b=Math.min(t[2],255),t.length>3&&(this.a=t[3])),Array.isArray(t)};var i=/^#([a-f0-9]{3})$/i;r.prototype.hex3=function(t){var e=null;return null!==(e=t.match(i))&&(this.r=parseInt(e[1][0]+e[1][0],16),this.g=parseInt(e[1][1]+e[1][1],16),this.b=parseInt(e[1][2]+e[1][2],16)),null!==e};var o=/^#([a-f0-9]{6})$/i;r.prototype.hex6=function(t){var e=null;return null!==(e=t.match(o))&&(this.r=parseInt(e[1].substring(0,2),16),this.g=parseInt(e[1].substring(2,4),16),this.b=parseInt(e[1].substring(4,6),16)),null!==e};var a=/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/;r.prototype.rgb=function(t){var e=null;return null!==(e=t.match(a))&&(this.r=Number(e[1]),this.g=Number(e[2]),this.b=Number(e[3])),null!==e};var s=/^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d?\.?\d+)\s*\)$/;r.prototype.rgba=function(t){var e=null;return null!==(e=t.match(s))&&(this.r=Number(e[1]),this.g=Number(e[2]),this.b=Number(e[3]),this.a=Number(e[4])),null!==e},r.prototype.toString=function(){return null!==this.a&&1!==this.a?"rgba("+[this.r,this.g,this.b,this.a].join(",")+")":"rgb("+[this.r,this.g,this.b].join(",")+")"},r.prototype.namedColor=function(t){t=t.toLowerCase();var e=c[t];if(e)this.r=e[0],this.g=e[1],this.b=e[2];else if("transparent"===t)return this.r=this.g=this.b=this.a=0,!0;return!!e},r.prototype.isColor=!0;var c={aliceblue:[240,248,255],antiquewhite:[250,235,215],aqua:[0,255,255],aquamarine:[127,255,212],azure:[240,255,255],beige:[245,245,220],bisque:[255,228,196],black:[0,0,0],blanchedalmond:[255,235,205],blue:[0,0,255],blueviolet:[138,43,226],brown:[165,42,42],burlywood:[222,184,135],cadetblue:[95,158,160],chartreuse:[127,255,0],chocolate:[210,105,30],coral:[255,127,80],cornflowerblue:[100,149,237],cornsilk:[255,248,220],crimson:[220,20,60],cyan:[0,255,255],darkblue:[0,0,139],darkcyan:[0,139,139],darkgoldenrod:[184,134,11],darkgray:[169,169,169],darkgreen:[0,100,0],darkgrey:[169,169,169],darkkhaki:[189,183,107],darkmagenta:[139,0,139],darkolivegreen:[85,107,47],darkorange:[255,140,0],darkorchid:[153,50,204],darkred:[139,0,0],darksalmon:[233,150,122],darkseagreen:[143,188,143],darkslateblue:[72,61,139],darkslategray:[47,79,79],darkslategrey:[47,79,79],darkturquoise:[0,206,209],darkviolet:[148,0,211],deeppink:[255,20,147],deepskyblue:[0,191,255],dimgray:[105,105,105],dimgrey:[105,105,105],dodgerblue:[30,144,255],firebrick:[178,34,34],floralwhite:[255,250,240],forestgreen:[34,139,34],fuchsia:[255,0,255],gainsboro:[220,220,220],ghostwhite:[248,248,255],gold:[255,215,0],goldenrod:[218,165,32],gray:[128,128,128],green:[0,128,0],greenyellow:[173,255,47],grey:[128,128,128],honeydew:[240,255,240],hotpink:[255,105,180],indianred:[205,92,92],indigo:[75,0,130],ivory:[255,255,240],khaki:[240,230,140],lavender:[230,230,250],lavenderblush:[255,240,245],lawngreen:[124,252,0],lemonchiffon:[255,250,205],lightblue:[173,216,230],lightcoral:[240,128,128],lightcyan:[224,255,255],lightgoldenrodyellow:[250,250,210],lightgray:[211,211,211],lightgreen:[144,238,144],lightgrey:[211,211,211],lightpink:[255,182,193],lightsalmon:[255,160,122],lightseagreen:[32,178,170],lightskyblue:[135,206,250],lightslategray:[119,136,153],lightslategrey:[119,136,153],lightsteelblue:[176,196,222],lightyellow:[255,255,224],lime:[0,255,0],limegreen:[50,205,50],linen:[250,240,230],magenta:[255,0,255],maroon:[128,0,0],mediumaquamarine:[102,205,170],mediumblue:[0,0,205],mediumorchid:[186,85,211],mediumpurple:[147,112,219],mediumseagreen:[60,179,113],mediumslateblue:[123,104,238],mediumspringgreen:[0,250,154],mediumturquoise:[72,209,204],mediumvioletred:[199,21,133],midnightblue:[25,25,112],mintcream:[245,255,250],mistyrose:[255,228,225],moccasin:[255,228,181],navajowhite:[255,222,173],navy:[0,0,128],oldlace:[253,245,230],olive:[128,128,0],olivedrab:[107,142,35],orange:[255,165,0],orangered:[255,69,0],orchid:[218,112,214],palegoldenrod:[238,232,170],palegreen:[152,251,152],paleturquoise:[175,238,238],palevioletred:[219,112,147],papayawhip:[255,239,213],peachpuff:[255,218,185],peru:[205,133,63],pink:[255,192,203],plum:[221,160,221],powderblue:[176,224,230],purple:[128,0,128],rebeccapurple:[102,51,153],red:[255,0,0],rosybrown:[188,143,143],royalblue:[65,105,225],saddlebrown:[139,69,19],salmon:[250,128,114],sandybrown:[244,164,96],seagreen:[46,139,87],seashell:[255,245,238],sienna:[160,82,45],silver:[192,192,192],skyblue:[135,206,235],slateblue:[106,90,205],slategray:[112,128,144],slategrey:[112,128,144],snow:[255,250,250],springgreen:[0,255,127],steelblue:[70,130,180],tan:[210,180,140],teal:[0,128,128],thistle:[216,191,216],tomato:[255,99,71],turquoise:[64,224,208],violet:[238,130,238],wheat:[245,222,179],white:[255,255,255],whitesmoke:[245,245,245],yellow:[255,255,0],yellowgreen:[154,205,50]};e.exports=r},{}],4:[function(e,n,r){function i(t,e){var n=_++;if(e=e||{},e.logging&&(w.options.logging=!0,w.options.start=Date.now()),e.async="undefined"==typeof e.async||e.async,e.allowTaint="undefined"!=typeof e.allowTaint&&e.allowTaint,e.removeContainer="undefined"==typeof e.removeContainer||e.removeContainer,e.javascriptEnabled="undefined"!=typeof e.javascriptEnabled&&e.javascriptEnabled,e.imageTimeout="undefined"==typeof e.imageTimeout?1e4:e.imageTimeout,e.renderer="function"==typeof e.renderer?e.renderer:d,e.strict=!!e.strict,"string"==typeof t){if("string"!=typeof e.proxy)return Promise.reject("Proxy must be used when rendering url");var r=null!=e.width?e.width:window.innerWidth,i=null!=e.height?e.height:window.innerHeight;return b(h(t),e.proxy,document,r,i,e).then(function(t){return a(t.contentWindow.document.documentElement,t,e,r,i)})}var s=(void 0===t?[document.documentElement]:t.length?t:[t])[0];return s.setAttribute(k+n,n),o(s.ownerDocument,e,s.ownerDocument.defaultView.innerWidth,s.ownerDocument.defaultView.innerHeight,n).then(function(t){return"function"==typeof e.onrendered&&(w("options.onrendered is deprecated, html2canvas returns a Promise containing the canvas"),e.onrendered(t)),t})}function o(t,e,n,r,i){return v(t,t,n,r,e,t.defaultView.pageXOffset,t.defaultView.pageYOffset).then(function(o){w("Document cloned");var s=k+i,c="["+s+"='"+i+"']";t.querySelector(c).removeAttribute(s);var l=o.contentWindow,u=l.document.querySelector(c),h="function"==typeof e.onclone?Promise.resolve(e.onclone(l.document)):Promise.resolve(!0);return h.then(function(){return a(u,o,e,n,r)})})}function a(t,e,n,r,i){var o=e.contentWindow,a=new f(o.document),h=new p(n,a),d=x(t),m="view"===n.type?r:l(o.document),y="view"===n.type?i:u(o.document),v=new n.renderer(m,y,h,n,document),b=new g(t,v,a,h,n);return b.ready.then(function(){w("Finished rendering");var r;return r="view"===n.type?c(v.canvas,{width:v.canvas.width,height:v.canvas.height,top:0,left:0,x:0,y:0}):t===o.document.body||t===o.document.documentElement||null!=n.canvas?v.canvas:c(v.canvas,{width:null!=n.width?n.width:d.width,height:null!=n.height?n.height:d.height,top:d.top,left:d.left,x:0,y:0}),s(e,n),r})}function s(t,e){e.removeContainer&&(t.parentNode.removeChild(t),w("Cleaned up container"))}function c(t,e){var n=document.createElement("canvas"),r=Math.min(t.width-1,Math.max(0,e.left)),i=Math.min(t.width,Math.max(1,e.left+e.width)),o=Math.min(t.height-1,Math.max(0,e.top)),a=Math.min(t.height,Math.max(1,e.top+e.height));n.width=e.width,n.height=e.height;var s=i-r,c=a-o;return w("Cropping canvas at:","left:",e.left,"top:",e.top,"width:",s,"height:",c),w("Resulting crop with width",e.width,"and height",e.height,"with x",r,"and y",o),n.getContext("2d").drawImage(t,r,o,s,c,e.x,e.y,s,c),n}function l(t){return Math.max(Math.max(t.body.scrollWidth,t.documentElement.scrollWidth),Math.max(t.body.offsetWidth,t.documentElement.offsetWidth),Math.max(t.body.clientWidth,t.documentElement.clientWidth))}function u(t){return Math.max(Math.max(t.body.scrollHeight,t.documentElement.scrollHeight),Math.max(t.body.offsetHeight,t.documentElement.offsetHeight),Math.max(t.body.clientHeight,t.documentElement.clientHeight))}function h(t){var e=document.createElement("a");return e.href=t,e.href=e.href,e}var f=e("./support"),d=e("./renderers/canvas"),p=e("./imageloader"),g=e("./nodeparser"),m=e("./nodecontainer"),w=e("./log"),y=e("./utils"),v=e("./clone"),b=e("./proxy").loadUrlDocument,x=y.getBounds,k="data-html2canvas-node",_=0;i.CanvasRenderer=d,i.NodeContainer=m,i.log=w,i.utils=y;var C="undefined"==typeof document||"function"!=typeof Object.create||"function"!=typeof document.createElement("canvas").getContext?function(){return Promise.reject("No canvas support")}:i;n.exports=C,"function"==typeof t&&t.amd&&t("html2canvas",[],function(){return C})},{"./clone":2,"./imageloader":11,"./log":13,"./nodecontainer":14,"./nodeparser":15,"./proxy":16,"./renderers/canvas":20,"./support":22,"./utils":26}],5:[function(t,e,n){function r(t){if(this.src=t,i("DummyImageContainer for",t),!this.promise||!this.image){i("Initiating DummyImageContainer"),r.prototype.image=new Image;var e=this.image;r.prototype.promise=new Promise(function(t,n){e.onload=t,e.onerror=n,e.src=o(),e.complete===!0&&t(e)})}}var i=t("./log"),o=t("./utils").smallImage;e.exports=r},{"./log":13,"./utils":26}],6:[function(t,e,n){function r(t,e){var n,r,o=document.createElement("div"),a=document.createElement("img"),s=document.createElement("span"),c="Hidden Text";o.style.visibility="hidden",o.style.fontFamily=t,o.style.fontSize=e,o.style.margin=0,o.style.padding=0,document.body.appendChild(o),a.src=i(),a.width=1,a.height=1,a.style.margin=0,a.style.padding=0,a.style.verticalAlign="baseline",s.style.fontFamily=t,s.style.fontSize=e,s.style.margin=0,s.style.padding=0,s.appendChild(document.createTextNode(c)),o.appendChild(s),o.appendChild(a),n=a.offsetTop-s.offsetTop+1,o.removeChild(s),o.appendChild(document.createTextNode(c)),o.style.lineHeight="normal",a.style.verticalAlign="super",r=a.offsetTop-o.offsetTop+1,document.body.removeChild(o),this.baseline=n,this.lineWidth=1,this.middle=r}var i=t("./utils").smallImage;e.exports=r},{"./utils":26}],7:[function(t,e,n){function r(){this.data={}}var i=t("./font");r.prototype.getMetrics=function(t,e){return void 0===this.data[t+"-"+e]&&(this.data[t+"-"+e]=new i(t,e)),this.data[t+"-"+e]},e.exports=r},{"./font":6}],8:[function(t,e,n){function r(e,n,r){this.image=null,this.src=e;var i=this,a=o(e);this.promise=(n?new Promise(function(t){"about:blank"===e.contentWindow.document.URL||null==e.contentWindow.document.documentElement?e.contentWindow.onload=e.onload=function(){t(e)}:t(e)}):this.proxyLoad(r.proxy,a,r)).then(function(e){var n=t("./core");return n(e.contentWindow.document.documentElement,{type:"view",width:e.width,height:e.height,proxy:r.proxy,javascriptEnabled:r.javascriptEnabled,removeContainer:r.removeContainer,allowTaint:r.allowTaint,imageTimeout:r.imageTimeout/2})}).then(function(t){return i.image=t})}var i=t("./utils"),o=i.getBounds,a=t("./proxy").loadUrlDocument;r.prototype.proxyLoad=function(t,e,n){var r=this.src;return a(r.src,t,r.ownerDocument,e.width,e.height,n)},e.exports=r},{"./core":4,"./proxy":16,"./utils":26}],9:[function(t,e,n){function r(t){this.src=t.value,this.colorStops=[],this.type=null,this.x0=.5,this.y0=.5,this.x1=.5,this.y1=.5,this.promise=Promise.resolve(!0)}r.TYPES={LINEAR:1,RADIAL:2},r.REGEXP_COLORSTOP=/^\s*(rgba?\(\s*\d{1,3},\s*\d{1,3},\s*\d{1,3}(?:,\s*[0-9\.]+)?\s*\)|[a-z]{3,20}|#[a-f0-9]{3,6})(?:\s+(\d{1,3}(?:\.\d+)?)(%|px)?)?(?:\s|$)/i,e.exports=r},{}],10:[function(t,e,n){function r(t,e){this.src=t,this.image=new Image;var n=this;this.tainted=null,this.promise=new Promise(function(r,i){n.image.onload=r,n.image.onerror=i,e&&(n.image.crossOrigin="anonymous"),n.image.src=t,n.image.complete===!0&&r(n.image)})}e.exports=r},{}],11:[function(t,e,n){function r(t,e){this.link=null,this.options=t,this.support=e,this.origin=this.getOrigin(window.location.href)}var i=t("./log"),o=t("./imagecontainer"),a=t("./dummyimagecontainer"),s=t("./proxyimagecontainer"),c=t("./framecontainer"),l=t("./svgcontainer"),u=t("./svgnodecontainer"),h=t("./lineargradientcontainer"),f=t("./webkitgradientcontainer"),d=t("./utils").bind;r.prototype.findImages=function(t){var e=[];return t.reduce(function(t,e){switch(e.node.nodeName){case"IMG":return t.concat([{args:[e.node.src],method:"url"}]);case"svg":case"IFRAME":return t.concat([{args:[e.node],method:e.node.nodeName}])}return t},[]).forEach(this.addImage(e,this.loadImage),this),e},r.prototype.findBackgroundImage=function(t,e){return e.parseBackgroundImages().filter(this.hasImageBackground).forEach(this.addImage(t,this.loadImage),this),t},r.prototype.addImage=function(t,e){return function(n){n.args.forEach(function(r){this.imageExists(t,r)||(t.splice(0,0,e.call(this,n)),i("Added image #"+t.length,"string"==typeof r?r.substring(0,100):r))},this)}},r.prototype.hasImageBackground=function(t){return"none"!==t.method},r.prototype.loadImage=function(t){if("url"===t.method){var e=t.args[0];return!this.isSVG(e)||this.support.svg||this.options.allowTaint?e.match(/data:image\/.*;base64,/i)?new o(e.replace(/url\(['"]{0,}|['"]{0,}\)$/gi,""),!1):this.isSameOrigin(e)||this.options.allowTaint===!0||this.isSVG(e)?new o(e,!1):this.support.cors&&!this.options.allowTaint&&this.options.useCORS?new o(e,!0):this.options.proxy?new s(e,this.options.proxy):new a(e):new l(e)}return"linear-gradient"===t.method?new h(t):"gradient"===t.method?new f(t):"svg"===t.method?new u(t.args[0],this.support.svg):"IFRAME"===t.method?new c(t.args[0],this.isSameOrigin(t.args[0].src),this.options):new a(t)},r.prototype.isSVG=function(t){return"svg"===t.substring(t.length-3).toLowerCase()||l.prototype.isInline(t)},r.prototype.imageExists=function(t,e){return t.some(function(t){return t.src===e})},r.prototype.isSameOrigin=function(t){return this.getOrigin(t)===this.origin},r.prototype.getOrigin=function(t){var e=this.link||(this.link=document.createElement("a"));return e.href=t,e.href=e.href,e.protocol+e.hostname+e.port},r.prototype.getPromise=function(t){return this.timeout(t,this.options.imageTimeout).catch(function(){var e=new a(t.src);return e.promise.then(function(e){t.image=e})})},r.prototype.get=function(t){var e=null;return this.images.some(function(n){return(e=n).src===t})?e:null},r.prototype.fetch=function(t){return this.images=t.reduce(d(this.findBackgroundImage,this),this.findImages(t)),this.images.forEach(function(t,e){t.promise.then(function(){i("Succesfully loaded image #"+(e+1),t)},function(n){i("Failed loading image #"+(e+1),t,n)})}),this.ready=Promise.all(this.images.map(this.getPromise,this)),i("Finished searching images"),this},r.prototype.timeout=function(t,e){var n,r=Promise.race([t.promise,new Promise(function(r,o){n=setTimeout(function(){i("Timed out loading image",t),o(t)},e)})]).then(function(t){return clearTimeout(n),t});return r.catch(function(){clearTimeout(n)}),r},e.exports=r},{"./dummyimagecontainer":5,"./framecontainer":8,"./imagecontainer":10,"./lineargradientcontainer":12,"./log":13,"./proxyimagecontainer":17,"./svgcontainer":23,"./svgnodecontainer":24,"./utils":26,"./webkitgradientcontainer":27}],12:[function(t,e,n){function r(t){i.apply(this,arguments),this.type=i.TYPES.LINEAR;var e=r.REGEXP_DIRECTION.test(t.args[0])||!i.REGEXP_COLORSTOP.test(t.args[0]);e?t.args[0].split(/\s+/).reverse().forEach(function(t,e){switch(t){case"left":this.x0=0,this.x1=1;break;case"top":this.y0=0,this.y1=1;break;case"right":this.x0=1,this.x1=0;break;case"bottom":this.y0=1,this.y1=0;break;case"to":var n=this.y0,r=this.x0;this.y0=this.y1,this.x0=this.x1,this.x1=r,this.y1=n;break;case"center":break;default:var i=.01*parseFloat(t,10);if(isNaN(i))break;0===e?(this.y0=i,this.y1=1-this.y0):(this.x0=i,this.x1=1-this.x0)}},this):(this.y0=0,this.y1=1),this.colorStops=t.args.slice(e?1:0).map(function(t){var e=t.match(i.REGEXP_COLORSTOP),n=+e[2],r=0===n?"%":e[3];return{color:new o(e[1]),stop:"%"===r?n/100:null}}),null===this.colorStops[0].stop&&(this.colorStops[0].stop=0),null===this.colorStops[this.colorStops.length-1].stop&&(this.colorStops[this.colorStops.length-1].stop=1),this.colorStops.forEach(function(t,e){null===t.stop&&this.colorStops.slice(e).some(function(n,r){return null!==n.stop&&(t.stop=(n.stop-this.colorStops[e-1].stop)/(r+1)+this.colorStops[e-1].stop,!0)},this)},this)}var i=t("./gradientcontainer"),o=t("./color");r.prototype=Object.create(i.prototype),r.REGEXP_DIRECTION=/^\s*(?:to|left|right|top|bottom|center|\d{1,3}(?:\.\d+)?%?)(?:\s|$)/i,e.exports=r},{"./color":3,"./gradientcontainer":9}],13:[function(t,e,n){var r=function(){r.options.logging&&window.console&&window.console.log&&Function.prototype.bind.call(window.console.log,window.console).apply(window.console,[Date.now()-r.options.start+"ms","html2canvas:"].concat([].slice.call(arguments,0)))};r.options={logging:!1},e.exports=r},{}],14:[function(t,e,n){function r(t,e){this.node=t,this.parent=e,this.stack=null,this.bounds=null,this.borders=null,this.clip=[],this.backgroundClip=[],this.offsetBounds=null,this.visible=null,this.computedStyles=null,this.colors={},this.styles={},this.backgroundImages=null,this.transformData=null,this.transformMatrix=null,this.isPseudoElement=!1,this.opacity=null}function i(t){var e=t.options[t.selectedIndex||0];return e?e.text||"":""}function o(t){if(t&&"matrix"===t[1])return t[2].split(",").map(function(t){return parseFloat(t.trim())});if(t&&"matrix3d"===t[1]){var e=t[2].split(",").map(function(t){return parseFloat(t.trim())});return[e[0],e[1],e[4],e[5],e[12],e[13]]}}function a(t){return t.toString().indexOf("%")!==-1}function s(t){return t.replace("px","")}function c(t){return parseFloat(t)}var l=t("./color"),u=t("./utils"),h=u.getBounds,f=u.parseBackgrounds,d=u.offsetBounds;r.prototype.cloneTo=function(t){t.visible=this.visible,t.borders=this.borders,t.bounds=this.bounds,t.clip=this.clip,t.backgroundClip=this.backgroundClip,t.computedStyles=this.computedStyles,t.styles=this.styles,t.backgroundImages=this.backgroundImages,t.opacity=this.opacity},r.prototype.getOpacity=function(){return null===this.opacity?this.opacity=this.cssFloat("opacity"):this.opacity},r.prototype.assignStack=function(t){this.stack=t,t.children.push(this)},r.prototype.isElementVisible=function(){return this.node.nodeType===Node.TEXT_NODE?this.parent.visible:"none"!==this.css("display")&&"hidden"!==this.css("visibility")&&!this.node.hasAttribute("data-html2canvas-ignore")&&("INPUT"!==this.node.nodeName||"hidden"!==this.node.getAttribute("type"))},r.prototype.css=function(t){return this.computedStyles||(this.computedStyles=this.isPseudoElement?this.parent.computedStyle(this.before?":before":":after"):this.computedStyle(null)),this.styles[t]||(this.styles[t]=this.computedStyles[t])},r.prototype.prefixedCss=function(t){var e=["webkit","moz","ms","o"],n=this.css(t);return void 0===n&&e.some(function(e){return n=this.css(e+t.substr(0,1).toUpperCase()+t.substr(1)),void 0!==n},this),void 0===n?null:n},r.prototype.computedStyle=function(t){return this.node.ownerDocument.defaultView.getComputedStyle(this.node,t)},r.prototype.cssInt=function(t){var e=parseInt(this.css(t),10);return isNaN(e)?0:e},r.prototype.color=function(t){return this.colors[t]||(this.colors[t]=new l(this.css(t)))},r.prototype.cssFloat=function(t){var e=parseFloat(this.css(t));return isNaN(e)?0:e},r.prototype.fontWeight=function(){var t=this.css("fontWeight");switch(parseInt(t,10)){case 401:t="bold";break;case 400:t="normal"}return t},r.prototype.parseClip=function(){var t=this.css("clip").match(this.CLIP);return t?{top:parseInt(t[1],10),right:parseInt(t[2],10),bottom:parseInt(t[3],10),left:parseInt(t[4],10)}:null},r.prototype.parseBackgroundImages=function(){return this.backgroundImages||(this.backgroundImages=f(this.css("backgroundImage")))},r.prototype.cssList=function(t,e){var n=(this.css(t)||"").split(",");return n=n[e||0]||n[0]||"auto",n=n.trim().split(" "),1===n.length&&(n=[n[0],a(n[0])?"auto":n[0]]),n},r.prototype.parseBackgroundSize=function(t,e,n){var r,i,o=this.cssList("backgroundSize",n);if(a(o[0]))r=t.width*parseFloat(o[0])/100;else{if(/contain|cover/.test(o[0])){var s=t.width/t.height,c=e.width/e.height;return s<c^"contain"===o[0]?{width:t.height*c,height:t.height}:{width:t.width,height:t.width/c}}r=parseInt(o[0],10)}return i="auto"===o[0]&&"auto"===o[1]?e.height:"auto"===o[1]?r/e.width*e.height:a(o[1])?t.height*parseFloat(o[1])/100:parseInt(o[1],10),"auto"===o[0]&&(r=i/e.height*e.width),{width:r,height:i}},r.prototype.parseBackgroundPosition=function(t,e,n,r){var i,o,s=this.cssList("backgroundPosition",n);return i=a(s[0])?(t.width-(r||e).width)*(parseFloat(s[0])/100):parseInt(s[0],10),o="auto"===s[1]?i/e.width*e.height:a(s[1])?(t.height-(r||e).height)*parseFloat(s[1])/100:parseInt(s[1],10),"auto"===s[0]&&(i=o/e.height*e.width),{left:i,top:o}},r.prototype.parseBackgroundRepeat=function(t){return this.cssList("backgroundRepeat",t)[0]},r.prototype.parseTextShadows=function(){var t=this.css("textShadow"),e=[];if(t&&"none"!==t)for(var n=t.match(this.TEXT_SHADOW_PROPERTY),r=0;n&&r<n.length;r++){var i=n[r].match(this.TEXT_SHADOW_VALUES);e.push({color:new l(i[0]),offsetX:i[1]?parseFloat(i[1].replace("px","")):0,offsetY:i[2]?parseFloat(i[2].replace("px","")):0,blur:i[3]?i[3].replace("px",""):0})}return e},r.prototype.parseTransform=function(){if(!this.transformData)if(this.hasTransform()){var t=this.parseBounds(),e=this.prefixedCss("transformOrigin").split(" ").map(s).map(c);e[0]+=t.left,e[1]+=t.top,this.transformData={origin:e,matrix:this.parseTransformMatrix()}}else this.transformData={origin:[0,0],matrix:[1,0,0,1,0,0]};return this.transformData},r.prototype.parseTransformMatrix=function(){if(!this.transformMatrix){var t=this.prefixedCss("transform"),e=t?o(t.match(this.MATRIX_PROPERTY)):null;this.transformMatrix=e?e:[1,0,0,1,0,0]}return this.transformMatrix},r.prototype.parseBounds=function(){return this.bounds||(this.bounds=this.hasTransform()?d(this.node):h(this.node))},r.prototype.hasTransform=function(){return"1,0,0,1,0,0"!==this.parseTransformMatrix().join(",")||this.parent&&this.parent.hasTransform()},r.prototype.getValue=function(){var t=this.node.value||"";return"SELECT"===this.node.tagName?t=i(this.node):"password"===this.node.type&&(t=Array(t.length+1).join("•")),0===t.length?this.node.placeholder||"":t},r.prototype.MATRIX_PROPERTY=/(matrix|matrix3d)\((.+)\)/,r.prototype.TEXT_SHADOW_PROPERTY=/((rgba|rgb)\([^\)]+\)(\s-?\d+px){0,})/g,r.prototype.TEXT_SHADOW_VALUES=/(-?\d+px)|(#.+)|(rgb\(.+\))|(rgba\(.+\))/g,r.prototype.CLIP=/^rect\((\d+)px,? (\d+)px,? (\d+)px,? (\d+)px\)$/,e.exports=r},{"./color":3,"./utils":26}],15:[function(t,e,n){function r(t,e,n,r,i){L("Starting NodeParser"),this.renderer=e,this.options=i,this.range=null,this.support=n,this.renderQueue=[],this.stack=new Y(!0,1,t.ownerDocument,null);var o=new U(t,null);if(i.background&&e.rectangle(0,0,e.width,e.height,new V(i.background)),t===t.ownerDocument.documentElement){var a=new U(o.color("backgroundColor").isTransparent()?t.ownerDocument.body:t.ownerDocument.documentElement,null);e.rectangle(0,0,e.width,e.height,a.color("backgroundColor"))}o.visibile=o.isElementVisible(),this.createPseudoHideStyles(t.ownerDocument),this.disableAnimations(t.ownerDocument),this.nodes=B([o].concat(this.getChildren(o)).filter(function(t){return t.visible=t.isElementVisible()}).map(this.getPseudoElements,this)),this.fontMetrics=new X,L("Fetched nodes, total:",this.nodes.length),L("Calculate overflow clips"),this.calculateOverflowClips(),L("Start fetching images"),this.images=r.fetch(this.nodes.filter(q)),this.ready=this.images.ready.then(J(function(){return L("Images loaded, starting parsing"),L("Creating stacking contexts"),this.createStackingContexts(),L("Sorting stacking contexts"),this.sortStackingContexts(this.stack),this.parse(this.stack),L("Render queue created with "+this.renderQueue.length+" items"),new Promise(J(function(t){i.async?"function"==typeof i.async?i.async.call(this,this.renderQueue,t):this.renderQueue.length>0?(this.renderIndex=0,this.asyncRenderer(this.renderQueue,t)):t():(this.renderQueue.forEach(this.paint,this),t())},this))},this))}function i(t){return t.parent&&t.parent.clip.length}function o(t){return t.replace(/(\-[a-z])/g,function(t){return t.toUpperCase().replace("-","")})}function a(){}function s(t,e,n,r){return t.map(function(i,o){if(i.width>0){var a=e.left,s=e.top,c=e.width,l=e.height-t[2].width;switch(o){case 0:l=t[0].width,i.args=h({c1:[a,s],c2:[a+c,s],c3:[a+c-t[1].width,s+l],c4:[a+t[3].width,s+l]},r[0],r[1],n.topLeftOuter,n.topLeftInner,n.topRightOuter,n.topRightInner);break;case 1:a=e.left+e.width-t[1].width,c=t[1].width,i.args=h({c1:[a+c,s],c2:[a+c,s+l+t[2].width],c3:[a,s+l],c4:[a,s+t[0].width]},r[1],r[2],n.topRightOuter,n.topRightInner,n.bottomRightOuter,n.bottomRightInner);break;case 2:s=s+e.height-t[2].width,l=t[2].width,i.args=h({c1:[a+c,s+l],c2:[a,s+l],c3:[a+t[3].width,s],c4:[a+c-t[3].width,s]},r[2],r[3],n.bottomRightOuter,n.bottomRightInner,n.bottomLeftOuter,n.bottomLeftInner);break;case 3:c=t[3].width,i.args=h({c1:[a,s+l+t[2].width],c2:[a,s],c3:[a+c,s+t[0].width],c4:[a+c,s+l]},r[3],r[0],n.bottomLeftOuter,n.bottomLeftInner,n.topLeftOuter,n.topLeftInner)}}return i})}function c(t,e,n,r){var i=4*((Math.sqrt(2)-1)/3),o=n*i,a=r*i,s=t+n,c=e+r;return{topLeft:u({x:t,y:c},{x:t,y:c-a},{x:s-o,y:e},{x:s,y:e}),topRight:u({x:t,y:e},{x:t+o,y:e},{x:s,y:c-a},{x:s,y:c}),bottomRight:u({x:s,y:e},{x:s,y:e+a},{x:t+o,y:c},{x:t,y:c}),bottomLeft:u({x:s,y:c},{x:s-o,y:c},{x:t,y:e+a},{x:t,y:e})}}function l(t,e,n){var r=t.left,i=t.top,o=t.width,a=t.height,s=e[0][0]<o/2?e[0][0]:o/2,l=e[0][1]<a/2?e[0][1]:a/2,u=e[1][0]<o/2?e[1][0]:o/2,h=e[1][1]<a/2?e[1][1]:a/2,f=e[2][0]<o/2?e[2][0]:o/2,d=e[2][1]<a/2?e[2][1]:a/2,p=e[3][0]<o/2?e[3][0]:o/2,g=e[3][1]<a/2?e[3][1]:a/2,m=o-u,w=a-d,y=o-f,v=a-g;return{topLeftOuter:c(r,i,s,l).topLeft.subdivide(.5),topLeftInner:c(r+n[3].width,i+n[0].width,Math.max(0,s-n[3].width),Math.max(0,l-n[0].width)).topLeft.subdivide(.5),topRightOuter:c(r+m,i,u,h).topRight.subdivide(.5),topRightInner:c(r+Math.min(m,o+n[3].width),i+n[0].width,m>o+n[3].width?0:u-n[3].width,h-n[0].width).topRight.subdivide(.5),bottomRightOuter:c(r+y,i+w,f,d).bottomRight.subdivide(.5),bottomRightInner:c(r+Math.min(y,o-n[3].width),i+Math.min(w,a+n[0].width),Math.max(0,f-n[1].width),d-n[2].width).bottomRight.subdivide(.5),bottomLeftOuter:c(r,i+v,p,g).bottomLeft.subdivide(.5),
bottomLeftInner:c(r+n[3].width,i+v,Math.max(0,p-n[3].width),g-n[2].width).bottomLeft.subdivide(.5)}}function u(t,e,n,r){var i=function(t,e,n){return{x:t.x+(e.x-t.x)*n,y:t.y+(e.y-t.y)*n}};return{start:t,startControl:e,endControl:n,end:r,subdivide:function(o){var a=i(t,e,o),s=i(e,n,o),c=i(n,r,o),l=i(a,s,o),h=i(s,c,o),f=i(l,h,o);return[u(t,a,l,f),u(f,h,c,r)]},curveTo:function(t){t.push(["bezierCurve",e.x,e.y,n.x,n.y,r.x,r.y])},curveToReversed:function(r){r.push(["bezierCurve",n.x,n.y,e.x,e.y,t.x,t.y])}}}function h(t,e,n,r,i,o,a){var s=[];return e[0]>0||e[1]>0?(s.push(["line",r[1].start.x,r[1].start.y]),r[1].curveTo(s)):s.push(["line",t.c1[0],t.c1[1]]),n[0]>0||n[1]>0?(s.push(["line",o[0].start.x,o[0].start.y]),o[0].curveTo(s),s.push(["line",a[0].end.x,a[0].end.y]),a[0].curveToReversed(s)):(s.push(["line",t.c2[0],t.c2[1]]),s.push(["line",t.c3[0],t.c3[1]])),e[0]>0||e[1]>0?(s.push(["line",i[1].end.x,i[1].end.y]),i[1].curveToReversed(s)):s.push(["line",t.c4[0],t.c4[1]]),s}function f(t,e,n,r,i,o,a){e[0]>0||e[1]>0?(t.push(["line",r[0].start.x,r[0].start.y]),r[0].curveTo(t),r[1].curveTo(t)):t.push(["line",o,a]),(n[0]>0||n[1]>0)&&t.push(["line",i[0].start.x,i[0].start.y])}function d(t){return t.cssInt("zIndex")<0}function p(t){return t.cssInt("zIndex")>0}function g(t){return 0===t.cssInt("zIndex")}function m(t){return["inline","inline-block","inline-table"].indexOf(t.css("display"))!==-1}function w(t){return t instanceof Y}function y(t){return t.node.data.trim().length>0}function v(t){return/^(normal|none|0px)$/.test(t.parent.css("letterSpacing"))}function b(t){return["TopLeft","TopRight","BottomRight","BottomLeft"].map(function(e){var n=t.css("border"+e+"Radius"),r=n.split(" ");return r.length<=1&&(r[1]=r[0]),r.map(O)})}function x(t){return t.nodeType===Node.TEXT_NODE||t.nodeType===Node.ELEMENT_NODE}function k(t){var e=t.css("position"),n=["absolute","relative","fixed"].indexOf(e)!==-1?t.css("zIndex"):"auto";return"auto"!==n}function _(t){return"static"!==t.css("position")}function C(t){return"none"!==t.css("float")}function A(t){return["inline-block","inline-table"].indexOf(t.css("display"))!==-1}function S(t){var e=this;return function(){return!t.apply(e,arguments)}}function q(t){return t.node.nodeType===Node.ELEMENT_NODE}function T(t){return t.isPseudoElement===!0}function I(t){return t.node.nodeType===Node.TEXT_NODE}function P(t){return function(e,n){return e.cssInt("zIndex")+t.indexOf(e)/t.length-(n.cssInt("zIndex")+t.indexOf(n)/t.length)}}function E(t){return t.getOpacity()<1}function O(t){return parseInt(t,10)}function F(t){return t.width}function R(t){return t.node.nodeType!==Node.ELEMENT_NODE||["SCRIPT","HEAD","TITLE","OBJECT","BR","OPTION"].indexOf(t.node.nodeName)===-1}function B(t){return[].concat.apply([],t)}function D(t){var e=t.substr(0,1);return e===t.substr(t.length-1)&&e.match(/'|"/)?t.substr(1,t.length-2):t}function j(t){for(var e,n=[],r=0,i=!1;t.length;)N(t[r])===i?(e=t.splice(0,r),e.length&&n.push(M.ucs2.encode(e)),i=!i,r=0):r++,r>=t.length&&(e=t.splice(0,r),e.length&&n.push(M.ucs2.encode(e)));return n}function N(t){return[32,13,10,9,45].indexOf(t)!==-1}function z(t){return/[^\u0000-\u00ff]/.test(t)}var L=t("./log"),M=t("punycode"),U=t("./nodecontainer"),H=t("./textcontainer"),W=t("./pseudoelementcontainer"),X=t("./fontmetrics"),V=t("./color"),Y=t("./stackingcontext"),G=t("./utils"),J=G.bind,Q=G.getBounds,K=G.parseBackgrounds,$=G.offsetBounds;r.prototype.calculateOverflowClips=function(){this.nodes.forEach(function(t){if(q(t)){T(t)&&t.appendToDOM(),t.borders=this.parseBorders(t);var e="hidden"===t.css("overflow")?[t.borders.clip]:[],n=t.parseClip();n&&["absolute","fixed"].indexOf(t.css("position"))!==-1&&e.push([["rect",t.bounds.left+n.left,t.bounds.top+n.top,n.right-n.left,n.bottom-n.top]]),t.clip=i(t)?t.parent.clip.concat(e):e,t.backgroundClip="hidden"!==t.css("overflow")?t.clip.concat([t.borders.clip]):t.clip,T(t)&&t.cleanDOM()}else I(t)&&(t.clip=i(t)?t.parent.clip:[]);T(t)||(t.bounds=null)},this)},r.prototype.asyncRenderer=function(t,e,n){n=n||Date.now(),this.paint(t[this.renderIndex++]),t.length===this.renderIndex?e():n+20>Date.now()?this.asyncRenderer(t,e,n):setTimeout(J(function(){this.asyncRenderer(t,e)},this),0)},r.prototype.createPseudoHideStyles=function(t){this.createStyles(t,"."+W.prototype.PSEUDO_HIDE_ELEMENT_CLASS_BEFORE+':before { content: "" !important; display: none !important; }.'+W.prototype.PSEUDO_HIDE_ELEMENT_CLASS_AFTER+':after { content: "" !important; display: none !important; }')},r.prototype.disableAnimations=function(t){this.createStyles(t,"* { -webkit-animation: none !important; -moz-animation: none !important; -o-animation: none !important; animation: none !important; -webkit-transition: none !important; -moz-transition: none !important; -o-transition: none !important; transition: none !important;}")},r.prototype.createStyles=function(t,e){var n=t.createElement("style");n.innerHTML=e,t.body.appendChild(n)},r.prototype.getPseudoElements=function(t){var e=[[t]];if(t.node.nodeType===Node.ELEMENT_NODE){var n=this.getPseudoElement(t,":before"),r=this.getPseudoElement(t,":after");n&&e.push(n),r&&e.push(r)}return B(e)},r.prototype.getPseudoElement=function(t,e){var n=t.computedStyle(e);if(!n||!n.content||"none"===n.content||"-moz-alt-content"===n.content||"none"===n.display)return null;for(var r=D(n.content),i="url"===r.substr(0,3),a=document.createElement(i?"img":"html2canvaspseudoelement"),s=new W(a,t,e),c=n.length-1;c>=0;c--){var l=o(n.item(c));a.style[l]=n[l]}if(a.className=W.prototype.PSEUDO_HIDE_ELEMENT_CLASS_BEFORE+" "+W.prototype.PSEUDO_HIDE_ELEMENT_CLASS_AFTER,i)return a.src=K(r)[0].args[0],[s];var u=document.createTextNode(r);return a.appendChild(u),[s,new H(u,s)]},r.prototype.getChildren=function(t){return B([].filter.call(t.node.childNodes,x).map(function(e){var n=[e.nodeType===Node.TEXT_NODE?new H(e,t):new U(e,t)].filter(R);return e.nodeType===Node.ELEMENT_NODE&&n.length&&"TEXTAREA"!==e.tagName?n[0].isElementVisible()?n.concat(this.getChildren(n[0])):[]:n},this))},r.prototype.newStackingContext=function(t,e){var n=new Y(e,t.getOpacity(),t.node,t.parent);t.cloneTo(n);var r=e?n.getParentStack(this):n.parent.stack;r.contexts.push(n),t.stack=n},r.prototype.createStackingContexts=function(){this.nodes.forEach(function(t){q(t)&&(this.isRootElement(t)||E(t)||k(t)||this.isBodyWithTransparentRoot(t)||t.hasTransform())?this.newStackingContext(t,!0):q(t)&&(_(t)&&g(t)||A(t)||C(t))?this.newStackingContext(t,!1):t.assignStack(t.parent.stack)},this)},r.prototype.isBodyWithTransparentRoot=function(t){return"BODY"===t.node.nodeName&&t.parent.color("backgroundColor").isTransparent()},r.prototype.isRootElement=function(t){return null===t.parent},r.prototype.sortStackingContexts=function(t){t.contexts.sort(P(t.contexts.slice(0))),t.contexts.forEach(this.sortStackingContexts,this)},r.prototype.parseTextBounds=function(t){return function(e,n,r){if("none"!==t.parent.css("textDecoration").substr(0,4)||0!==e.trim().length){if(this.support.rangeBounds&&!t.parent.hasTransform()){var i=r.slice(0,n).join("").length;return this.getRangeBounds(t.node,i,e.length)}if(t.node&&"string"==typeof t.node.data){var o=t.node.splitText(e.length),a=this.getWrapperBounds(t.node,t.parent.hasTransform());return t.node=o,a}}else this.support.rangeBounds&&!t.parent.hasTransform()||(t.node=t.node.splitText(e.length));return{}}},r.prototype.getWrapperBounds=function(t,e){var n=t.ownerDocument.createElement("html2canvaswrapper"),r=t.parentNode,i=t.cloneNode(!0);n.appendChild(t.cloneNode(!0)),r.replaceChild(n,t);var o=e?$(n):Q(n);return r.replaceChild(i,n),o},r.prototype.getRangeBounds=function(t,e,n){var r=this.range||(this.range=t.ownerDocument.createRange());return r.setStart(t,e),r.setEnd(t,e+n),r.getBoundingClientRect()},r.prototype.parse=function(t){var e=t.contexts.filter(d),n=t.children.filter(q),r=n.filter(S(C)),i=r.filter(S(_)).filter(S(m)),o=n.filter(S(_)).filter(C),s=r.filter(S(_)).filter(m),c=t.contexts.concat(r.filter(_)).filter(g),l=t.children.filter(I).filter(y),u=t.contexts.filter(p);e.concat(i).concat(o).concat(s).concat(c).concat(l).concat(u).forEach(function(t){this.renderQueue.push(t),w(t)&&(this.parse(t),this.renderQueue.push(new a))},this)},r.prototype.paint=function(t){try{t instanceof a?this.renderer.ctx.restore():I(t)?(T(t.parent)&&t.parent.appendToDOM(),this.paintText(t),T(t.parent)&&t.parent.cleanDOM()):this.paintNode(t)}catch(t){if(L(t),this.options.strict)throw t}},r.prototype.paintNode=function(t){w(t)&&(this.renderer.setOpacity(t.opacity),this.renderer.ctx.save(),t.hasTransform()&&this.renderer.setTransform(t.parseTransform())),"INPUT"===t.node.nodeName&&"checkbox"===t.node.type?this.paintCheckbox(t):"INPUT"===t.node.nodeName&&"radio"===t.node.type?this.paintRadio(t):this.paintElement(t)},r.prototype.paintElement=function(t){var e=t.parseBounds();this.renderer.clip(t.backgroundClip,function(){this.renderer.renderBackground(t,e,t.borders.borders.map(F))},this),this.renderer.clip(t.clip,function(){this.renderer.renderBorders(t.borders.borders)},this),this.renderer.clip(t.backgroundClip,function(){switch(t.node.nodeName){case"svg":case"IFRAME":var n=this.images.get(t.node);n?this.renderer.renderImage(t,e,t.borders,n):L("Error loading <"+t.node.nodeName+">",t.node);break;case"IMG":var r=this.images.get(t.node.src);r?this.renderer.renderImage(t,e,t.borders,r):L("Error loading <img>",t.node.src);break;case"CANVAS":this.renderer.renderImage(t,e,t.borders,{image:t.node});break;case"SELECT":case"INPUT":case"TEXTAREA":this.paintFormValue(t)}},this)},r.prototype.paintCheckbox=function(t){var e=t.parseBounds(),n=Math.min(e.width,e.height),r={width:n-1,height:n-1,top:e.top,left:e.left},i=[3,3],o=[i,i,i,i],a=[1,1,1,1].map(function(t){return{color:new V("#A5A5A5"),width:t}}),c=l(r,o,a);this.renderer.clip(t.backgroundClip,function(){this.renderer.rectangle(r.left+1,r.top+1,r.width-2,r.height-2,new V("#DEDEDE")),this.renderer.renderBorders(s(a,r,c,o)),t.node.checked&&(this.renderer.font(new V("#424242"),"normal","normal","bold",n-3+"px","arial"),this.renderer.text("✔",r.left+n/6,r.top+n-1))},this)},r.prototype.paintRadio=function(t){var e=t.parseBounds(),n=Math.min(e.width,e.height)-2;this.renderer.clip(t.backgroundClip,function(){this.renderer.circleStroke(e.left+1,e.top+1,n,new V("#DEDEDE"),1,new V("#A5A5A5")),t.node.checked&&this.renderer.circle(Math.ceil(e.left+n/4)+1,Math.ceil(e.top+n/4)+1,Math.floor(n/2),new V("#424242"))},this)},r.prototype.paintFormValue=function(t){var e=t.getValue();if(e.length>0){var n=t.node.ownerDocument,r=n.createElement("html2canvaswrapper"),i=["lineHeight","textAlign","fontFamily","fontWeight","fontSize","color","paddingLeft","paddingTop","paddingRight","paddingBottom","width","height","borderLeftStyle","borderTopStyle","borderLeftWidth","borderTopWidth","boxSizing","whiteSpace","wordWrap"];i.forEach(function(e){try{r.style[e]=t.css(e)}catch(t){L("html2canvas: Parse: Exception caught in renderFormValue: "+t.message)}});var o=t.parseBounds();r.style.position="fixed",r.style.left=o.left+"px",r.style.top=o.top+"px",r.textContent=e,n.body.appendChild(r),this.paintText(new H(r.firstChild,t)),n.body.removeChild(r)}},r.prototype.paintText=function(t){t.applyTextTransform();var e=M.ucs2.decode(t.node.data),n=this.options.letterRendering&&!v(t)||z(t.node.data)?e.map(function(t){return M.ucs2.encode([t])}):j(e),r=t.parent.fontWeight(),i=t.parent.css("fontSize"),o=t.parent.css("fontFamily"),a=t.parent.parseTextShadows();this.renderer.font(t.parent.color("color"),t.parent.css("fontStyle"),t.parent.css("fontVariant"),r,i,o),a.length?this.renderer.fontShadow(a[0].color,a[0].offsetX,a[0].offsetY,a[0].blur):this.renderer.clearShadow(),this.renderer.clip(t.parent.clip,function(){n.map(this.parseTextBounds(t),this).forEach(function(e,r){e&&(this.renderer.text(n[r],e.left,e.bottom),this.renderTextDecoration(t.parent,e,this.fontMetrics.getMetrics(o,i)))},this)},this)},r.prototype.renderTextDecoration=function(t,e,n){switch(t.css("textDecoration").split(" ")[0]){case"underline":this.renderer.rectangle(e.left,Math.round(e.top+n.baseline+n.lineWidth),e.width,1,t.color("color"));break;case"overline":this.renderer.rectangle(e.left,Math.round(e.top),e.width,1,t.color("color"));break;case"line-through":this.renderer.rectangle(e.left,Math.ceil(e.top+n.middle+n.lineWidth),e.width,1,t.color("color"))}};var Z={inset:[["darken",.6],["darken",.1],["darken",.1],["darken",.6]]};r.prototype.parseBorders=function(t){var e=t.parseBounds(),n=b(t),r=["Top","Right","Bottom","Left"].map(function(e,n){var r=t.css("border"+e+"Style"),i=t.color("border"+e+"Color");"inset"===r&&i.isBlack()&&(i=new V([255,255,255,i.a]));var o=Z[r]?Z[r][n]:null;return{width:t.cssInt("border"+e+"Width"),color:o?i[o[0]](o[1]):i,args:null}}),i=l(e,n,r);return{clip:this.parseBackgroundClip(t,i,r,n,e),borders:s(r,e,i,n)}},r.prototype.parseBackgroundClip=function(t,e,n,r,i){var o=t.css("backgroundClip"),a=[];switch(o){case"content-box":case"padding-box":f(a,r[0],r[1],e.topLeftInner,e.topRightInner,i.left+n[3].width,i.top+n[0].width),f(a,r[1],r[2],e.topRightInner,e.bottomRightInner,i.left+i.width-n[1].width,i.top+n[0].width),f(a,r[2],r[3],e.bottomRightInner,e.bottomLeftInner,i.left+i.width-n[1].width,i.top+i.height-n[2].width),f(a,r[3],r[0],e.bottomLeftInner,e.topLeftInner,i.left+n[3].width,i.top+i.height-n[2].width);break;default:f(a,r[0],r[1],e.topLeftOuter,e.topRightOuter,i.left,i.top),f(a,r[1],r[2],e.topRightOuter,e.bottomRightOuter,i.left+i.width,i.top),f(a,r[2],r[3],e.bottomRightOuter,e.bottomLeftOuter,i.left+i.width,i.top+i.height),f(a,r[3],r[0],e.bottomLeftOuter,e.topLeftOuter,i.left,i.top+i.height)}return a},e.exports=r},{"./color":3,"./fontmetrics":7,"./log":13,"./nodecontainer":14,"./pseudoelementcontainer":18,"./stackingcontext":21,"./textcontainer":25,"./utils":26,punycode:1}],16:[function(t,e,n){function r(t,e,n){var r="withCredentials"in new XMLHttpRequest;if(!e)return Promise.reject("No proxy configured");var i=a(r),c=s(e,t,i);return r?u(c):o(n,c,i).then(function(t){return p(t.content)})}function i(t,e,n){var r="crossOrigin"in new Image,i=a(r),c=s(e,t,i);return r?Promise.resolve(c):o(n,c,i).then(function(t){return"data:"+t.type+";base64,"+t.content})}function o(t,e,n){return new Promise(function(r,i){var o=t.createElement("script"),a=function(){delete window.html2canvas.proxy[n],t.body.removeChild(o)};window.html2canvas.proxy[n]=function(t){a(),r(t)},o.src=e,o.onerror=function(t){a(),i(t)},t.body.appendChild(o)})}function a(t){return t?"":"html2canvas_"+Date.now()+"_"+ ++g+"_"+Math.round(1e5*Math.random())}function s(t,e,n){return t+"?url="+encodeURIComponent(e)+(n.length?"&callback=html2canvas.proxy."+n:"")}function c(t){return function(e){var n,r=new DOMParser;try{n=r.parseFromString(e,"text/html")}catch(t){f("DOMParser not supported, falling back to createHTMLDocument"),n=document.implementation.createHTMLDocument("");try{n.open(),n.write(e),n.close()}catch(t){f("createHTMLDocument write not supported, falling back to document.body.innerHTML"),n.body.innerHTML=e}}var i=n.querySelector("base");if(!i||!i.href.host){var o=n.createElement("base");o.href=t,n.head.insertBefore(o,n.head.firstChild)}return n}}function l(t,e,n,i,o,a){return new r(t,e,window.document).then(c(t)).then(function(t){return d(t,n,i,o,a,0,0)})}var u=t("./xhr"),h=t("./utils"),f=t("./log"),d=t("./clone"),p=h.decode64,g=0;n.Proxy=r,n.ProxyURL=i,n.loadUrlDocument=l},{"./clone":2,"./log":13,"./utils":26,"./xhr":28}],17:[function(t,e,n){function r(t,e){var n=document.createElement("a");n.href=t,t=n.href,this.src=t,this.image=new Image;var r=this;this.promise=new Promise(function(n,o){r.image.crossOrigin="Anonymous",r.image.onload=n,r.image.onerror=o,new i(t,e,document).then(function(t){r.image.src=t}).catch(o)})}var i=t("./proxy").ProxyURL;e.exports=r},{"./proxy":16}],18:[function(t,e,n){function r(t,e,n){i.call(this,t,e),this.isPseudoElement=!0,this.before=":before"===n}var i=t("./nodecontainer");r.prototype.cloneTo=function(t){r.prototype.cloneTo.call(this,t),t.isPseudoElement=!0,t.before=this.before},r.prototype=Object.create(i.prototype),r.prototype.appendToDOM=function(){this.before?this.parent.node.insertBefore(this.node,this.parent.node.firstChild):this.parent.node.appendChild(this.node),this.parent.node.className+=" "+this.getHideClass()},r.prototype.cleanDOM=function(){this.node.parentNode.removeChild(this.node),this.parent.node.className=this.parent.node.className.replace(this.getHideClass(),"")},r.prototype.getHideClass=function(){return this["PSEUDO_HIDE_ELEMENT_CLASS_"+(this.before?"BEFORE":"AFTER")]},r.prototype.PSEUDO_HIDE_ELEMENT_CLASS_BEFORE="___html2canvas___pseudoelement_before",r.prototype.PSEUDO_HIDE_ELEMENT_CLASS_AFTER="___html2canvas___pseudoelement_after",e.exports=r},{"./nodecontainer":14}],19:[function(t,e,n){function r(t,e,n,r,i){this.width=t,this.height=e,this.images=n,this.options=r,this.document=i}var i=t("./log");r.prototype.renderImage=function(t,e,n,r){var i=t.cssInt("paddingLeft"),o=t.cssInt("paddingTop"),a=t.cssInt("paddingRight"),s=t.cssInt("paddingBottom"),c=n.borders,l=e.width-(c[1].width+c[3].width+i+a),u=e.height-(c[0].width+c[2].width+o+s);this.drawImage(r,0,0,r.image.width||l,r.image.height||u,e.left+i+c[3].width,e.top+o+c[0].width,l,u)},r.prototype.renderBackground=function(t,e,n){e.height>0&&e.width>0&&(this.renderBackgroundColor(t,e),this.renderBackgroundImage(t,e,n))},r.prototype.renderBackgroundColor=function(t,e){var n=t.color("backgroundColor");n.isTransparent()||this.rectangle(e.left,e.top,e.width,e.height,n)},r.prototype.renderBorders=function(t){t.forEach(this.renderBorder,this)},r.prototype.renderBorder=function(t){t.color.isTransparent()||null===t.args||this.drawShape(t.args,t.color)},r.prototype.renderBackgroundImage=function(t,e,n){var r=t.parseBackgroundImages();r.reverse().forEach(function(r,o,a){switch(r.method){case"url":var s=this.images.get(r.args[0]);s?this.renderBackgroundRepeating(t,e,s,a.length-(o+1),n):i("Error loading background-image",r.args[0]);break;case"linear-gradient":case"gradient":var c=this.images.get(r.value);c?this.renderBackgroundGradient(c,e,n):i("Error loading background-image",r.args[0]);break;case"none":break;default:i("Unknown background-image type",r.args[0])}},this)},r.prototype.renderBackgroundRepeating=function(t,e,n,r,i){var o=t.parseBackgroundSize(e,n.image,r),a=t.parseBackgroundPosition(e,n.image,r,o),s=t.parseBackgroundRepeat(r);switch(s){case"repeat-x":case"repeat no-repeat":this.backgroundRepeatShape(n,a,o,e,e.left+i[3],e.top+a.top+i[0],99999,o.height,i);break;case"repeat-y":case"no-repeat repeat":this.backgroundRepeatShape(n,a,o,e,e.left+a.left+i[3],e.top+i[0],o.width,99999,i);break;case"no-repeat":this.backgroundRepeatShape(n,a,o,e,e.left+a.left+i[3],e.top+a.top+i[0],o.width,o.height,i);break;default:this.renderBackgroundRepeat(n,a,o,{top:e.top,left:e.left},i[3],i[0])}},e.exports=r},{"./log":13}],20:[function(t,e,n){function r(t,e){o.apply(this,arguments),this.canvas=this.options.canvas||this.document.createElement("canvas"),this.options.canvas||(this.canvas.width=t,this.canvas.height=e),this.ctx=this.canvas.getContext("2d"),this.taintCtx=this.document.createElement("canvas").getContext("2d"),this.ctx.textBaseline="bottom",this.variables={},s("Initialized CanvasRenderer with size",t,"x",e)}function i(t){return t.length>0}var o=t("../renderer"),a=t("../lineargradientcontainer"),s=t("../log");r.prototype=Object.create(o.prototype),r.prototype.setFillStyle=function(t){return this.ctx.fillStyle="object"==typeof t&&t.isColor?t.toString():t,this.ctx},r.prototype.rectangle=function(t,e,n,r,i){this.setFillStyle(i).fillRect(t,e,n,r)},r.prototype.circle=function(t,e,n,r){this.setFillStyle(r),this.ctx.beginPath(),this.ctx.arc(t+n/2,e+n/2,n/2,0,2*Math.PI,!0),this.ctx.closePath(),this.ctx.fill()},r.prototype.circleStroke=function(t,e,n,r,i,o){this.circle(t,e,n,r),this.ctx.strokeStyle=o.toString(),this.ctx.stroke()},r.prototype.drawShape=function(t,e){this.shape(t),this.setFillStyle(e).fill()},r.prototype.taints=function(t){if(null===t.tainted){this.taintCtx.drawImage(t.image,0,0);try{this.taintCtx.getImageData(0,0,1,1),t.tainted=!1}catch(e){this.taintCtx=document.createElement("canvas").getContext("2d"),t.tainted=!0}}return t.tainted},r.prototype.drawImage=function(t,e,n,r,i,o,a,s,c){this.taints(t)&&!this.options.allowTaint||this.ctx.drawImage(t.image,e,n,r,i,o,a,s,c)},r.prototype.clip=function(t,e,n){this.ctx.save(),t.filter(i).forEach(function(t){this.shape(t).clip()},this),e.call(n),this.ctx.restore()},r.prototype.shape=function(t){return this.ctx.beginPath(),t.forEach(function(t,e){"rect"===t[0]?this.ctx.rect.apply(this.ctx,t.slice(1)):this.ctx[0===e?"moveTo":t[0]+"To"].apply(this.ctx,t.slice(1))},this),this.ctx.closePath(),this.ctx},r.prototype.font=function(t,e,n,r,i,o){this.setFillStyle(t).font=[e,n,r,i,o].join(" ").split(",")[0]},r.prototype.fontShadow=function(t,e,n,r){this.setVariable("shadowColor",t.toString()).setVariable("shadowOffsetY",e).setVariable("shadowOffsetX",n).setVariable("shadowBlur",r)},r.prototype.clearShadow=function(){this.setVariable("shadowColor","rgba(0,0,0,0)")},r.prototype.setOpacity=function(t){this.ctx.globalAlpha=t},r.prototype.setTransform=function(t){this.ctx.translate(t.origin[0],t.origin[1]),this.ctx.transform.apply(this.ctx,t.matrix),this.ctx.translate(-t.origin[0],-t.origin[1])},r.prototype.setVariable=function(t,e){return this.variables[t]!==e&&(this.variables[t]=this.ctx[t]=e),this},r.prototype.text=function(t,e,n){this.ctx.fillText(t,e,n)},r.prototype.backgroundRepeatShape=function(t,e,n,r,i,o,a,s,c){var l=[["line",Math.round(i),Math.round(o)],["line",Math.round(i+a),Math.round(o)],["line",Math.round(i+a),Math.round(s+o)],["line",Math.round(i),Math.round(s+o)]];this.clip([l],function(){this.renderBackgroundRepeat(t,e,n,r,c[3],c[0])},this)},r.prototype.renderBackgroundRepeat=function(t,e,n,r,i,o){var a=Math.round(r.left+e.left+i),s=Math.round(r.top+e.top+o);this.setFillStyle(this.ctx.createPattern(this.resizeImage(t,n),"repeat")),this.ctx.translate(a,s),this.ctx.fill(),this.ctx.translate(-a,-s)},r.prototype.renderBackgroundGradient=function(t,e){if(t instanceof a){var n=this.ctx.createLinearGradient(e.left+e.width*t.x0,e.top+e.height*t.y0,e.left+e.width*t.x1,e.top+e.height*t.y1);t.colorStops.forEach(function(t){n.addColorStop(t.stop,t.color.toString())}),this.rectangle(e.left,e.top,e.width,e.height,n)}},r.prototype.resizeImage=function(t,e){var n=t.image;if(n.width===e.width&&n.height===e.height)return n;var r,i=document.createElement("canvas");return i.width=e.width,i.height=e.height,r=i.getContext("2d"),r.drawImage(n,0,0,n.width,n.height,0,0,e.width,e.height),i},e.exports=r},{"../lineargradientcontainer":12,"../log":13,"../renderer":19}],21:[function(t,e,n){function r(t,e,n,r){i.call(this,n,r),this.ownStacking=t,this.contexts=[],this.children=[],this.opacity=(this.parent?this.parent.stack.opacity:1)*e}var i=t("./nodecontainer");r.prototype=Object.create(i.prototype),r.prototype.getParentStack=function(t){var e=this.parent?this.parent.stack:null;return e?e.ownStacking?e:e.getParentStack(t):t.stack},e.exports=r},{"./nodecontainer":14}],22:[function(t,e,n){function r(t){this.rangeBounds=this.testRangeBounds(t),this.cors=this.testCORS(),this.svg=this.testSVG()}r.prototype.testRangeBounds=function(t){var e,n,r,i,o=!1;return t.createRange&&(e=t.createRange(),e.getBoundingClientRect&&(n=t.createElement("boundtest"),n.style.height="123px",n.style.display="block",t.body.appendChild(n),e.selectNode(n),r=e.getBoundingClientRect(),i=r.height,123===i&&(o=!0),t.body.removeChild(n))),o},r.prototype.testCORS=function(){return"undefined"!=typeof(new Image).crossOrigin},r.prototype.testSVG=function(){var t=new Image,e=document.createElement("canvas"),n=e.getContext("2d");t.src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'></svg>";try{n.drawImage(t,0,0),e.toDataURL()}catch(t){return!1}return!0},e.exports=r},{}],23:[function(t,e,n){function r(t){this.src=t,this.image=null;var e=this;this.promise=this.hasFabric().then(function(){return e.isInline(t)?Promise.resolve(e.inlineFormatting(t)):i(t)}).then(function(t){return new Promise(function(n){window.html2canvas.svg.fabric.loadSVGFromString(t,e.createCanvas.call(e,n))})})}var i=t("./xhr"),o=t("./utils").decode64;r.prototype.hasFabric=function(){return window.html2canvas.svg&&window.html2canvas.svg.fabric?Promise.resolve():Promise.reject(new Error("html2canvas.svg.js is not loaded, cannot render svg"))},r.prototype.inlineFormatting=function(t){return/^data:image\/svg\+xml;base64,/.test(t)?this.decode64(this.removeContentType(t)):this.removeContentType(t)},r.prototype.removeContentType=function(t){return t.replace(/^data:image\/svg\+xml(;base64)?,/,"")},r.prototype.isInline=function(t){return/^data:image\/svg\+xml/i.test(t)},r.prototype.createCanvas=function(t){var e=this;return function(n,r){var i=new window.html2canvas.svg.fabric.StaticCanvas("c");e.image=i.lowerCanvasEl,i.setWidth(r.width).setHeight(r.height).add(window.html2canvas.svg.fabric.util.groupSVGElements(n,r)).renderAll(),t(i.lowerCanvasEl)}},r.prototype.decode64=function(t){return"function"==typeof window.atob?window.atob(t):o(t)},e.exports=r},{"./utils":26,"./xhr":28}],24:[function(t,e,n){function r(t,e){this.src=t,this.image=null;var n=this;this.promise=e?new Promise(function(e,r){n.image=new Image,n.image.onload=e,n.image.onerror=r,n.image.src="data:image/svg+xml,"+(new XMLSerializer).serializeToString(t),n.image.complete===!0&&e(n.image)}):this.hasFabric().then(function(){return new Promise(function(e){window.html2canvas.svg.fabric.parseSVGDocument(t,n.createCanvas.call(n,e))})})}var i=t("./svgcontainer");r.prototype=Object.create(i.prototype),e.exports=r},{"./svgcontainer":23}],25:[function(t,e,n){function r(t,e){o.call(this,t,e)}function i(t,e,n){if(t.length>0)return e+n.toUpperCase()}var o=t("./nodecontainer");r.prototype=Object.create(o.prototype),r.prototype.applyTextTransform=function(){this.node.data=this.transform(this.parent.css("textTransform"))},r.prototype.transform=function(t){var e=this.node.data;switch(t){case"lowercase":return e.toLowerCase();case"capitalize":return e.replace(/(^|\s|:|-|\(|\))([a-z])/g,i);case"uppercase":return e.toUpperCase();default:return e}},e.exports=r},{"./nodecontainer":14}],26:[function(t,e,n){n.smallImage=function(){return"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"},n.bind=function(t,e){return function(){return t.apply(e,arguments)}},/*
   * base64-arraybuffer
   * https://github.com/niklasvh/base64-arraybuffer
   *
   * Copyright (c) 2012 Niklas von Hertzen
   * Licensed under the MIT license.
   */
n.decode64=function(t){var e,n,r,i,o,a,s,c,l="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",u=t.length,h="";for(e=0;e<u;e+=4)n=l.indexOf(t[e]),r=l.indexOf(t[e+1]),i=l.indexOf(t[e+2]),o=l.indexOf(t[e+3]),a=n<<2|r>>4,s=(15&r)<<4|i>>2,c=(3&i)<<6|o,h+=64===i?String.fromCharCode(a):64===o||o===-1?String.fromCharCode(a,s):String.fromCharCode(a,s,c);return h},n.getBounds=function(t){if(t.getBoundingClientRect){var e=t.getBoundingClientRect(),n=null==t.offsetWidth?e.width:t.offsetWidth;return{top:e.top,bottom:e.bottom||e.top+e.height,right:e.left+n,left:e.left,width:n,height:null==t.offsetHeight?e.height:t.offsetHeight}}return{}},n.offsetBounds=function(t){var e=t.offsetParent?n.offsetBounds(t.offsetParent):{top:0,left:0};return{top:t.offsetTop+e.top,bottom:t.offsetTop+t.offsetHeight+e.top,right:t.offsetLeft+e.left+t.offsetWidth,left:t.offsetLeft+e.left,width:t.offsetWidth,height:t.offsetHeight}},n.parseBackgrounds=function(t){var e,n,r,i,o,a,s,c=" \r\n\t",l=[],u=0,h=0,f=function(){e&&('"'===n.substr(0,1)&&(n=n.substr(1,n.length-2)),n&&s.push(n),"-"===e.substr(0,1)&&(i=e.indexOf("-",1)+1)>0&&(r=e.substr(0,i),e=e.substr(i)),l.push({prefix:r,method:e.toLowerCase(),value:o,args:s,image:null})),s=[],e=r=n=o=""};return s=[],e=r=n=o="",t.split("").forEach(function(t){if(!(0===u&&c.indexOf(t)>-1)){switch(t){case'"':a?a===t&&(a=null):a=t;break;case"(":if(a)break;if(0===u)return u=1,void(o+=t);h++;break;case")":if(a)break;if(1===u){if(0===h)return u=0,o+=t,void f();h--}break;case",":if(a)break;if(0===u)return void f();if(1===u&&0===h&&!e.match(/^url$/i))return s.push(n),n="",void(o+=t)}o+=t,0===u?e+=t:n+=t}}),f(),l}},{}],27:[function(t,e,n){function r(t){i.apply(this,arguments),this.type="linear"===t.args[0]?i.TYPES.LINEAR:i.TYPES.RADIAL}var i=t("./gradientcontainer");r.prototype=Object.create(i.prototype),e.exports=r},{"./gradientcontainer":9}],28:[function(t,e,n){function r(t){return new Promise(function(e,n){var r=new XMLHttpRequest;r.open("GET",t),r.onload=function(){200===r.status?e(r.responseText):n(new Error(r.statusText))},r.onerror=function(){n(new Error("Network Error"))},r.send()})}e.exports=r},{}]},{},[4])(4)}),/*
  # PNG.js
  # Copyright (c) 2011 Devon Govett
  # MIT LICENSE
  # 
  # 
  */
function(t){var e;e=function(){function e(t){var e,n,r,i,o,a,s,c,l,u,h,f,d,p,g;for(this.data=t,this.pos=8,this.palette=[],this.imgData=[],this.transparency={},this.animation=null,this.text={},a=null;;){switch(e=this.readUInt32(),u=function(){var t,e;for(e=[],s=t=0;t<4;s=++t)e.push(String.fromCharCode(this.data[this.pos++]));return e}.call(this).join("")){case"IHDR":this.width=this.readUInt32(),this.height=this.readUInt32(),this.bits=this.data[this.pos++],this.colorType=this.data[this.pos++],this.compressionMethod=this.data[this.pos++],this.filterMethod=this.data[this.pos++],this.interlaceMethod=this.data[this.pos++];break;case"acTL":this.animation={numFrames:this.readUInt32(),numPlays:this.readUInt32()||1/0,frames:[]};break;case"PLTE":this.palette=this.read(e);break;case"fcTL":a&&this.animation.frames.push(a),this.pos+=4,a={width:this.readUInt32(),height:this.readUInt32(),xOffset:this.readUInt32(),yOffset:this.readUInt32()},o=this.readUInt16(),i=this.readUInt16()||100,a.delay=1e3*o/i,a.disposeOp=this.data[this.pos++],a.blendOp=this.data[this.pos++],a.data=[];break;case"IDAT":case"fdAT":for("fdAT"===u&&(this.pos+=4,e-=4),t=(null!=a?a.data:void 0)||this.imgData,s=d=0;0<=e?d<e:d>e;s=0<=e?++d:--d)t.push(this.data[this.pos++]);break;case"tRNS":switch(this.transparency={},this.colorType){case 3:if(r=this.palette.length/3,this.transparency.indexed=this.read(e),this.transparency.indexed.length>r)throw new Error("More transparent colors than palette size");if(h=r-this.transparency.indexed.length,h>0)for(s=p=0;0<=h?p<h:p>h;s=0<=h?++p:--p)this.transparency.indexed.push(255);break;case 0:this.transparency.grayscale=this.read(e)[0];break;case 2:this.transparency.rgb=this.read(e)}break;case"tEXt":f=this.read(e),c=f.indexOf(0),l=String.fromCharCode.apply(String,f.slice(0,c)),this.text[l]=String.fromCharCode.apply(String,f.slice(c+1));break;case"IEND":return a&&this.animation.frames.push(a),this.colors=function(){switch(this.colorType){case 0:case 3:case 4:return 1;case 2:case 6:return 3}}.call(this),this.hasAlphaChannel=4===(g=this.colorType)||6===g,n=this.colors+(this.hasAlphaChannel?1:0),this.pixelBitlength=this.bits*n,this.colorSpace=function(){switch(this.colors){case 1:return"DeviceGray";case 3:return"DeviceRGB"}}.call(this),void(this.imgData=new Uint8Array(this.imgData));default:this.pos+=e}if(this.pos+=4,this.pos>this.data.length)throw new Error("Incomplete or corrupt PNG file")}}var n,r,i,o,a,s,l,u;e.load=function(t,n,r){var i;return"function"==typeof n&&(r=n),i=new XMLHttpRequest,i.open("GET",t,!0),i.responseType="arraybuffer",i.onload=function(){var t,o;return t=new Uint8Array(i.response||i.mozResponseArrayBuffer),o=new e(t),"function"==typeof(null!=n?n.getContext:void 0)&&o.render(n),"function"==typeof r?r(o):void 0},i.send(null)},o=0,i=1,a=2,r=0,n=1,e.prototype.read=function(t){var e,n,r;for(r=[],e=n=0;0<=t?n<t:n>t;e=0<=t?++n:--n)r.push(this.data[this.pos++]);return r},e.prototype.readUInt32=function(){var t,e,n,r;return t=this.data[this.pos++]<<24,e=this.data[this.pos++]<<16,n=this.data[this.pos++]<<8,r=this.data[this.pos++],t|e|n|r},e.prototype.readUInt16=function(){var t,e;return t=this.data[this.pos++]<<8,e=this.data[this.pos++],t|e},e.prototype.decodePixels=function(t){var e,n,r,i,o,a,s,l,u,h,f,d,p,g,m,w,y,v,b,x,k,_,C;if(null==t&&(t=this.imgData),0===t.length)return new Uint8Array(0);for(t=new c(t),t=t.getBytes(),d=this.pixelBitlength/8,w=d*this.width,p=new Uint8Array(w*this.height),a=t.length,m=0,g=0,n=0;g<a;){switch(t[g++]){case 0:for(i=b=0;b<w;i=b+=1)p[n++]=t[g++];break;case 1:for(i=x=0;x<w;i=x+=1)e=t[g++],o=i<d?0:p[n-d],p[n++]=(e+o)%256;break;case 2:for(i=k=0;k<w;i=k+=1)e=t[g++],r=(i-i%d)/d,y=m&&p[(m-1)*w+r*d+i%d],p[n++]=(y+e)%256;break;case 3:for(i=_=0;_<w;i=_+=1)e=t[g++],r=(i-i%d)/d,o=i<d?0:p[n-d],y=m&&p[(m-1)*w+r*d+i%d],p[n++]=(e+Math.floor((o+y)/2))%256;break;case 4:for(i=C=0;C<w;i=C+=1)e=t[g++],r=(i-i%d)/d,o=i<d?0:p[n-d],0===m?y=v=0:(y=p[(m-1)*w+r*d+i%d],v=r&&p[(m-1)*w+(r-1)*d+i%d]),s=o+y-v,l=Math.abs(s-o),h=Math.abs(s-y),f=Math.abs(s-v),u=l<=h&&l<=f?o:h<=f?y:v,p[n++]=(e+u)%256;break;default:throw new Error("Invalid filter algorithm: "+t[g-1])}m++}return p},e.prototype.decodePalette=function(){var t,e,n,r,i,o,a,s,c,l;for(r=this.palette,a=this.transparency.indexed||[],o=new Uint8Array((a.length||0)+r.length),i=0,n=r.length,t=0,e=s=0,c=r.length;s<c;e=s+=3)o[i++]=r[e],o[i++]=r[e+1],o[i++]=r[e+2],o[i++]=null!=(l=a[t++])?l:255;return o},e.prototype.copyToImageData=function(t,e){var n,r,i,o,a,s,c,l,u,h,f;if(r=this.colors,u=null,n=this.hasAlphaChannel,this.palette.length&&(u=null!=(f=this._decodedPalette)?f:this._decodedPalette=this.decodePalette(),r=4,n=!0),i=t.data||t,l=i.length,a=u||e,o=s=0,1===r)for(;o<l;)c=u?4*e[o/4]:s,h=a[c++],i[o++]=h,i[o++]=h,i[o++]=h,i[o++]=n?a[c++]:255,s=c;else for(;o<l;)c=u?4*e[o/4]:s,i[o++]=a[c++],i[o++]=a[c++],i[o++]=a[c++],i[o++]=n?a[c++]:255,s=c},e.prototype.decode=function(){var t;return t=new Uint8Array(this.width*this.height*4),this.copyToImageData(t,this.decodePixels()),t};try{l=t.document.createElement("canvas"),u=l.getContext("2d")}catch(t){return-1}return s=function(t){var e;return u.width=t.width,u.height=t.height,u.clearRect(0,0,t.width,t.height),u.putImageData(t,0,0),e=new Image,e.src=l.toDataURL(),e},e.prototype.decodeFrames=function(t){var e,n,r,i,o,a,c,l;if(this.animation){for(c=this.animation.frames,l=[],n=o=0,a=c.length;o<a;n=++o)e=c[n],r=t.createImageData(e.width,e.height),i=this.decodePixels(new Uint8Array(e.data)),this.copyToImageData(r,i),e.imageData=r,l.push(e.image=s(r));return l}},e.prototype.renderFrame=function(t,e){var n,o,s;return o=this.animation.frames,n=o[e],s=o[e-1],0===e&&t.clearRect(0,0,this.width,this.height),(null!=s?s.disposeOp:void 0)===i?t.clearRect(s.xOffset,s.yOffset,s.width,s.height):(null!=s?s.disposeOp:void 0)===a&&t.putImageData(s.imageData,s.xOffset,s.yOffset),n.blendOp===r&&t.clearRect(n.xOffset,n.yOffset,n.width,n.height),t.drawImage(n.image,n.xOffset,n.yOffset)},e.prototype.animate=function(t){var e,n,r,i,o,a,s=this;return n=0,a=this.animation,i=a.numFrames,r=a.frames,o=a.numPlays,(e=function(){var a,c;if(a=n++%i,c=r[a],s.renderFrame(t,a),i>1&&n/i<o)return s.animation._timeout=setTimeout(e,c.delay)})()},e.prototype.stopAnimation=function(){var t;return clearTimeout(null!=(t=this.animation)?t._timeout:void 0)},e.prototype.render=function(t){var e,n;return t._png&&t._png.stopAnimation(),t._png=this,t.width=this.width,t.height=this.height,e=t.getContext("2d"),this.animation?(this.decodeFrames(e),this.animate(e)):(n=e.createImageData(this.width,this.height),this.copyToImageData(n,this.decodePixels()),e.putImageData(n,0,0))},e}(),t.PNG=e}("undefined"!=typeof window&&window||void 0);/*
   * Extracted from pdf.js
   * https://github.com/andreasgal/pdf.js
   *
   * Copyright (c) 2011 Mozilla Foundation
   *
   * Contributors: Andreas Gal <gal@mozilla.com>
   *               Chris G Jones <cjones@mozilla.com>
   *               Shaon Barman <shaon.barman@gmail.com>
   *               Vivien Nicolas <21@vingtetun.org>
   *               Justin D'Arcangelo <justindarc@gmail.com>
   *               Yury Delendik
   *
   * 
   */
var s=function(){function t(){this.pos=0,this.bufferLength=0,this.eof=!1,this.buffer=null}return t.prototype={ensureBuffer:function(t){var e=this.buffer,n=e?e.byteLength:0;if(t<n)return e;for(var r=512;r<t;)r<<=1;for(var i=new Uint8Array(r),o=0;o<n;++o)i[o]=e[o];return this.buffer=i},getByte:function(){for(var t=this.pos;this.bufferLength<=t;){if(this.eof)return null;this.readBlock()}return this.buffer[this.pos++]},getBytes:function(t){var e=this.pos;if(t){this.ensureBuffer(e+t);for(var n=e+t;!this.eof&&this.bufferLength<n;)this.readBlock();var r=this.bufferLength;n>r&&(n=r)}else{for(;!this.eof;)this.readBlock();var n=this.bufferLength}return this.pos=n,this.buffer.subarray(e,n)},lookChar:function(){for(var t=this.pos;this.bufferLength<=t;){if(this.eof)return null;this.readBlock()}return String.fromCharCode(this.buffer[this.pos])},getChar:function(){for(var t=this.pos;this.bufferLength<=t;){if(this.eof)return null;this.readBlock()}return String.fromCharCode(this.buffer[this.pos++])},makeSubStream:function(t,e,n){for(var r=t+e;this.bufferLength<=r&&!this.eof;)this.readBlock();return new Stream(this.buffer,t,e,n)},skip:function(t){t||(t=1),this.pos+=t},reset:function(){this.pos=0}},t}(),c=function(){function t(t){throw new Error(t)}function e(e){var n=0,r=e[n++],i=e[n++];r!=-1&&i!=-1||t("Invalid header in flate stream"),8!=(15&r)&&t("Unknown compression method in flate stream"),((r<<8)+i)%31!=0&&t("Bad FCHECK in flate stream"),32&i&&t("FDICT bit set in flate stream"),this.bytes=e,this.bytesPos=n,this.codeSize=0,this.codeBuf=0,s.call(this)}if("undefined"!=typeof Uint32Array){var n=new Uint32Array([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),r=new Uint32Array([3,4,5,6,7,8,9,10,65547,65549,65551,65553,131091,131095,131099,131103,196643,196651,196659,196667,262211,262227,262243,262259,327811,327843,327875,327907,258,258,258]),i=new Uint32Array([1,2,3,4,65541,65543,131081,131085,196625,196633,262177,262193,327745,327777,393345,393409,459009,459137,524801,525057,590849,591361,657409,658433,724993,727041,794625,798721,868353,876545]),o=[new Uint32Array([459008,524368,524304,524568,459024,524400,524336,590016,459016,524384,524320,589984,524288,524416,524352,590048,459012,524376,524312,589968,459028,524408,524344,590032,459020,524392,524328,59e4,524296,524424,524360,590064,459010,524372,524308,524572,459026,524404,524340,590024,459018,524388,524324,589992,524292,524420,524356,590056,459014,524380,524316,589976,459030,524412,524348,590040,459022,524396,524332,590008,524300,524428,524364,590072,459009,524370,524306,524570,459025,524402,524338,590020,459017,524386,524322,589988,524290,524418,524354,590052,459013,524378,524314,589972,459029,524410,524346,590036,459021,524394,524330,590004,524298,524426,524362,590068,459011,524374,524310,524574,459027,524406,524342,590028,459019,524390,524326,589996,524294,524422,524358,590060,459015,524382,524318,589980,459031,524414,524350,590044,459023,524398,524334,590012,524302,524430,524366,590076,459008,524369,524305,524569,459024,524401,524337,590018,459016,524385,524321,589986,524289,524417,524353,590050,459012,524377,524313,589970,459028,524409,524345,590034,459020,524393,524329,590002,524297,524425,524361,590066,459010,524373,524309,524573,459026,524405,524341,590026,459018,524389,524325,589994,524293,524421,524357,590058,459014,524381,524317,589978,459030,524413,524349,590042,459022,524397,524333,590010,524301,524429,524365,590074,459009,524371,524307,524571,459025,524403,524339,590022,459017,524387,524323,589990,524291,524419,524355,590054,459013,524379,524315,589974,459029,524411,524347,590038,459021,524395,524331,590006,524299,524427,524363,590070,459011,524375,524311,524575,459027,524407,524343,590030,459019,524391,524327,589998,524295,524423,524359,590062,459015,524383,524319,589982,459031,524415,524351,590046,459023,524399,524335,590014,524303,524431,524367,590078,459008,524368,524304,524568,459024,524400,524336,590017,459016,524384,524320,589985,524288,524416,524352,590049,459012,524376,524312,589969,459028,524408,524344,590033,459020,524392,524328,590001,524296,524424,524360,590065,459010,524372,524308,524572,459026,524404,524340,590025,459018,524388,524324,589993,524292,524420,524356,590057,459014,524380,524316,589977,459030,524412,524348,590041,459022,524396,524332,590009,524300,524428,524364,590073,459009,524370,524306,524570,459025,524402,524338,590021,459017,524386,524322,589989,524290,524418,524354,590053,459013,524378,524314,589973,459029,524410,524346,590037,459021,524394,524330,590005,524298,524426,524362,590069,459011,524374,524310,524574,459027,524406,524342,590029,459019,524390,524326,589997,524294,524422,524358,590061,459015,524382,524318,589981,459031,524414,524350,590045,459023,524398,524334,590013,524302,524430,524366,590077,459008,524369,524305,524569,459024,524401,524337,590019,459016,524385,524321,589987,524289,524417,524353,590051,459012,524377,524313,589971,459028,524409,524345,590035,459020,524393,524329,590003,524297,524425,524361,590067,459010,524373,524309,524573,459026,524405,524341,590027,459018,524389,524325,589995,524293,524421,524357,590059,459014,524381,524317,589979,459030,524413,524349,590043,459022,524397,524333,590011,524301,524429,524365,590075,459009,524371,524307,524571,459025,524403,524339,590023,459017,524387,524323,589991,524291,524419,524355,590055,459013,524379,524315,589975,459029,524411,524347,590039,459021,524395,524331,590007,524299,524427,524363,590071,459011,524375,524311,524575,459027,524407,524343,590031,459019,524391,524327,589999,524295,524423,524359,590063,459015,524383,524319,589983,459031,524415,524351,590047,459023,524399,524335,590015,524303,524431,524367,590079]),9],a=[new Uint32Array([327680,327696,327688,327704,327684,327700,327692,327708,327682,327698,327690,327706,327686,327702,327694,0,327681,327697,327689,327705,327685,327701,327693,327709,327683,327699,327691,327707,327687,327703,327695,0]),5];return e.prototype=Object.create(s.prototype),e.prototype.getBits=function(e){for(var n,r=this.codeSize,i=this.codeBuf,o=this.bytes,a=this.bytesPos;r<e;)"undefined"==typeof(n=o[a++])&&t("Bad encoding in flate stream"),i|=n<<r,r+=8;return n=i&(1<<e)-1,this.codeBuf=i>>e,this.codeSize=r-=e,this.bytesPos=a,n},e.prototype.getCode=function(e){for(var n=e[0],r=e[1],i=this.codeSize,o=this.codeBuf,a=this.bytes,s=this.bytesPos;i<r;){var c;"undefined"==typeof(c=a[s++])&&t("Bad encoding in flate stream"),o|=c<<i,i+=8}var l=n[o&(1<<r)-1],u=l>>16,h=65535&l;return(0==i||i<u||0==u)&&t("Bad encoding in flate stream"),this.codeBuf=o>>u,this.codeSize=i-u,this.bytesPos=s,h},e.prototype.generateHuffmanTable=function(t){for(var e=t.length,n=0,r=0;r<e;++r)t[r]>n&&(n=t[r]);for(var i=1<<n,o=new Uint32Array(i),a=1,s=0,c=2;a<=n;++a,s<<=1,c<<=1)for(var l=0;l<e;++l)if(t[l]==a){for(var u=0,h=s,r=0;r<a;++r)u=u<<1|1&h,h>>=1;for(var r=u;r<i;r+=c)o[r]=a<<16|l;++s}return[o,n]},e.prototype.readBlock=function(){function e(t,e,n,r,i){for(var o=t.getBits(n)+r;o-- >0;)e[_++]=i}var s=this.getBits(3);if(1&s&&(this.eof=!0),s>>=1,0==s){var c,l=this.bytes,u=this.bytesPos;"undefined"==typeof(c=l[u++])&&t("Bad block header in flate stream");var h=c;"undefined"==typeof(c=l[u++])&&t("Bad block header in flate stream"),h|=c<<8,"undefined"==typeof(c=l[u++])&&t("Bad block header in flate stream");var f=c;"undefined"==typeof(c=l[u++])&&t("Bad block header in flate stream"),f|=c<<8,f!=(65535&~h)&&t("Bad uncompressed block length in flate stream"),this.codeBuf=0,this.codeSize=0;var d=this.bufferLength,p=this.ensureBuffer(d+h),g=d+h;this.bufferLength=g;for(var m=d;m<g;++m){if("undefined"==typeof(c=l[u++])){this.eof=!0;break}p[m]=c}return void(this.bytesPos=u)}var w,y;if(1==s)w=o,y=a;else if(2==s){for(var v=this.getBits(5)+257,b=this.getBits(5)+1,x=this.getBits(4)+4,k=Array(n.length),_=0;_<x;)k[n[_++]]=this.getBits(3);for(var C=this.generateHuffmanTable(k),A=0,_=0,S=v+b,q=new Array(S);_<S;){var T=this.getCode(C);16==T?e(this,q,2,3,A):17==T?e(this,q,3,3,A=0):18==T?e(this,q,7,11,A=0):q[_++]=A=T}w=this.generateHuffmanTable(q.slice(0,v)),y=this.generateHuffmanTable(q.slice(v,S))}else t("Unknown block type in flate stream");for(var p=this.buffer,I=p?p.length:0,P=this.bufferLength;;){var E=this.getCode(w);if(E<256)P+1>=I&&(p=this.ensureBuffer(P+1),I=p.length),p[P++]=E;else{if(256==E)return void(this.bufferLength=P);E-=257,E=r[E];var O=E>>16;O>0&&(O=this.getBits(O));var A=(65535&E)+O;E=this.getCode(y),E=i[E],O=E>>16,O>0&&(O=this.getBits(O));var F=(65535&E)+O;P+A>=I&&(p=this.ensureBuffer(P+A),I=p.length);for(var R=0;R<A;++R,++P)p[P]=p[P-F]}}},e}}();!function(t){var e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";"undefined"==typeof t.btoa&&(t.btoa=function(t){var n,r,i,o,a,s,c,l,u=0,h=0,f="",d=[];if(!t)return t;do n=t.charCodeAt(u++),r=t.charCodeAt(u++),i=t.charCodeAt(u++),l=n<<16|r<<8|i,o=l>>18&63,a=l>>12&63,s=l>>6&63,c=63&l,d[h++]=e.charAt(o)+e.charAt(a)+e.charAt(s)+e.charAt(c);while(u<t.length);f=d.join("");var p=t.length%3;return(p?f.slice(0,p-3):f)+"===".slice(p||3)}),"undefined"==typeof t.atob&&(t.atob=function(t){var n,r,i,o,a,s,c,l,u=0,h=0,f="",d=[];if(!t)return t;t+="";do o=e.indexOf(t.charAt(u++)),a=e.indexOf(t.charAt(u++)),s=e.indexOf(t.charAt(u++)),c=e.indexOf(t.charAt(u++)),l=o<<18|a<<12|s<<6|c,n=l>>16&255,r=l>>8&255,i=255&l,64==s?d[h++]=String.fromCharCode(n):64==c?d[h++]=String.fromCharCode(n,r):d[h++]=String.fromCharCode(n,r,i);while(u<t.length);return f=d.join("")}),Array.prototype.map||(Array.prototype.map=function(t){if(void 0===this||null===this||"function"!=typeof t)throw new TypeError;for(var e=Object(this),n=e.length>>>0,r=new Array(n),i=arguments.length>1?arguments[1]:void 0,o=0;o<n;o++)o in e&&(r[o]=t.call(i,e[o],o,e));return r}),Array.isArray||(Array.isArray=function(t){return"[object Array]"===Object.prototype.toString.call(t)}),Array.prototype.forEach||(Array.prototype.forEach=function(t,e){if(void 0===this||null===this||"function"!=typeof t)throw new TypeError;for(var n=Object(this),r=n.length>>>0,i=0;i<r;i++)i in n&&t.call(e,n[i],i,n)}),Object.keys||(Object.keys=function(){var t=Object.prototype.hasOwnProperty,e=!{toString:null}.propertyIsEnumerable("toString"),n=["toString","toLocaleString","valueOf","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","constructor"],r=n.length;return function(i){if("object"!=typeof i&&("function"!=typeof i||null===i))throw new TypeError;var o,a,s=[];for(o in i)t.call(i,o)&&s.push(o);if(e)for(a=0;a<r;a++)t.call(i,n[a])&&s.push(n[a]);return s}}()),String.prototype.trim||(String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g,"")}),String.prototype.trimLeft||(String.prototype.trimLeft=function(){return this.replace(/^\s+/g,"")}),String.prototype.trimRight||(String.prototype.trimRight=function(){return this.replace(/\s+$/g,"")})}("undefined"!=typeof self&&self||"undefined"!=typeof window&&window||void 0);var e=e;return e});
(function(e){var t=function(){var t=65,n='<div class="colorpicker"><div class="colorpicker_color"><div><div></div></div></div><div class="colorpicker_hue"><div></div></div><div class="colorpicker_new_color"></div><div class="colorpicker_current_color"></div><div class="colorpicker_hex"><label for="hex">#</label><input type="text" maxlength="6" size="6" id="hex" /></div><div class="colorpicker_rgb_r colorpicker_field"><label for="rbg_r">R</label><input type="text" maxlength="3" size="3" id="rgb_r" /><span></span></div><div class="colorpicker_rgb_g colorpicker_field"><label for="rbg_g">G</label><input type="text" maxlength="3" size="3" id="rgb_g" /><span></span></div><div class="colorpicker_rgb_b colorpicker_field"><label for="rbg_b">B</label><input type="text" maxlength="3" size="3" id="rgb_b" /><span></span></div><div class="colorpicker_hsb_h colorpicker_field"><label for="hsb_h">H</label><input type="text" maxlength="3" size="3" id="hsb_h" /><span></span></div><div class="colorpicker_hsb_s colorpicker_field"><label for="hsb_s">S</label><input type="text" maxlength="3" size="3" id="hsb_s" /><span></span></div><div class="colorpicker_hsb_b colorpicker_field"><label for="hsb_b">B</label><input type="text" maxlength="3" size="3" id="hsb_b" /><span></span></div><div class="colorpicker_submit"></div></div>',r={eventName:"click",onShow:function(){},onBeforeShow:function(){},onHide:function(){},onChange:function(){},onSubmit:function(){},color:"ff0000",livePreview:!0,flat:!1},i=function(t,n){var r=HSBToRGB(t);e(n).data("colorpicker").fields.eq(1).val(r.r).end().eq(2).val(r.g).end().eq(3).val(r.b).end()},s=function(t,n){e(n).data("colorpicker").fields.eq(4).val(t.h).end().eq(5).val(t.s).end().eq(6).val(t.b).end()},o=function(t,n){e(n).data("colorpicker").fields.eq(0).val(HSBToHex(t)).end()},u=function(t,n){e(n).data("colorpicker").selector.css("backgroundColor","#"+HSBToHex({h:t.h,s:100,b:100}));e(n).data("colorpicker").selectorIndic.css({left:parseInt(150*t.s/100,10),top:parseInt(150*(100-t.b)/100,10)})},a=function(t,n){e(n).data("colorpicker").hue.css("top",parseInt(150-150*t.h/360,10))},f=function(t,n){e(n).data("colorpicker").currentColor.css("backgroundColor","#"+HSBToHex(t))},l=function(t,n){e(n).data("colorpicker").newColor.css("backgroundColor","#"+HSBToHex(t))},c=function(n){var r=n.charCode||n.keyCode||-1;if(r>t&&r<=90||r===32)return!1;var i=e(this).parent().parent();i.data("colorpicker").livePreview===!0&&h.apply(this)},h=function(t){var n=e(this).parent().parent(),r;this.parentNode.className.indexOf("_hex")>0?n.data("colorpicker").color=r=HexToHSB(fixHex(this.value)):this.parentNode.className.indexOf("_hsb")>0?n.data("colorpicker").color=r=fixHSB({h:parseInt(n.data("colorpicker").fields.eq(4).val(),10),s:parseInt(n.data("colorpicker").fields.eq(5).val(),10),b:parseInt(n.data("colorpicker").fields.eq(6).val(),10)}):n.data("colorpicker").color=r=RGBToHSB(fixRGB({r:parseInt(n.data("colorpicker").fields.eq(1).val(),10),g:parseInt(n.data("colorpicker").fields.eq(2).val(),10),b:parseInt(n.data("colorpicker").fields.eq(3).val(),10)}));if(t){i(r,n.get(0));o(r,n.get(0));s(r,n.get(0))}u(r,n.get(0));a(r,n.get(0));l(r,n.get(0));n.data("colorpicker").onChange.apply(n,[r,HSBToHex(r),HSBToRGB(r)])},p=function(t){var n=e(this).parent().parent();n.data("colorpicker").fields.parent().removeClass("colorpicker_focus")},d=function(){t=this.parentNode.className.indexOf("_hex")>0?70:65;e(this).parent().parent().data("colorpicker").fields.parent().removeClass("colorpicker_focus");e(this).parent().addClass("colorpicker_focus")},v=function(t){var n=e(this).parent().find("input").focus(),r={el:e(this).parent().addClass("colorpicker_slider"),max:this.parentNode.className.indexOf("_hsb_h")>0?360:this.parentNode.className.indexOf("_hsb")>0?100:255,y:t.pageY,field:n,val:parseInt(n.val(),10),preview:e(this).parent().parent().data("colorpicker").livePreview};e(document).on("mouseup",r,g);e(document).on("mousemove",r,m)},m=function(e){e.data.field.val(Math.max(0,Math.min(e.data.max,parseInt(e.data.val+e.pageY-e.data.y,10))));e.data.preview&&h.apply(e.data.field.get(0),[!0]);return!1},g=function(t){h.apply(t.data.field.get(0),[!0]);t.data.el.removeClass("colorpicker_slider").find("input").focus();e(document).off("mouseup",g);e(document).off("mousemove",m);return!1},b=function(t){var n={cal:e(this).parent(),y:e(this).offset().top};n.preview=n.cal.data("colorpicker").livePreview;e(document).on("mouseup",n,E);e(document).on("mousemove",n,w)},w=function(e){h.apply(e.data.cal.data("colorpicker").fields.eq(4).val(parseInt(360*(150-Math.max(0,Math.min(150,e.pageY-e.data.y)))/150,10)).get(0),[e.data.preview]);return!1},E=function(t){i(t.data.cal.data("colorpicker").color,t.data.cal.get(0));o(t.data.cal.data("colorpicker").color,t.data.cal.get(0));e(document).off("mouseup",E);e(document).off("mousemove",w);return!1},S=function(t){y=e(this).offset().top;preview=t.data.cal.data("colorpicker").livePreview;h.apply(t.data.cal.data("colorpicker").fields.eq(4).val(parseInt(360*(150-Math.max(0,Math.min(150,t.pageY-y)))/150,10)).get(0),[preview])};downSelector=function(t){var n={cal:e(this).parent(),pos:e(this).offset()};n.preview=n.cal.data("colorpicker").livePreview;e(document).on("mouseup",n,upSelector);e(document).on("mousemove",n,moveSelector);e(".colorpicker_color").one("click",n,moveSelector)},moveSelector=function(e){h.apply(e.data.cal.data("colorpicker").fields.eq(6).val(parseInt(100*(150-Math.max(0,Math.min(150,e.pageY-e.data.pos.top)))/150,10)).end().eq(5).val(parseInt(100*Math.max(0,Math.min(150,e.pageX-e.data.pos.left))/150,10)).get(0),[e.data.preview]);return!1},upSelector=function(t){var n={cal:e(this).parent(),pos:e(this).offset()};i(t.data.cal.data("colorpicker").color,t.data.cal.get(0));o(t.data.cal.data("colorpicker").color,t.data.cal.get(0));e(document).off("mouseup",upSelector);e(document).off("mousemove",moveSelector);return!1},enterSubmit=function(t){e(this).addClass("colorpicker_focus")},leaveSubmit=function(t){e(this).removeClass("colorpicker_focus")},clickSubmit=function(t){var n=e(this).parent(),r=n.data("colorpicker").color;n.data("colorpicker").origColor=r;f(r,n.get(0));n.data("colorpicker").onSubmit(r,HSBToHex(r),HSBToRGB(r),n.data("colorpicker").el,n.data("colorpicker").parent)},show=function(t){var n=e("#"+e(this).data("colorpickerId"));n.data("colorpicker").onBeforeShow.apply(this,[n.get(0)]);var r=e(this).offset(),i=getViewport(),s=r.top+this.offsetHeight,o=r.left;s+176>i.t+i.h&&(s-=this.offsetHeight+176);o+356>i.l+i.w&&(o-=356);n.css({left:o+"px",top:s+"px"});n.data("colorpicker").onShow.apply(this,[n.get(0)])!=0&&n.show();e(document).on("mousedown",{cal:n},hide);return!1},hide=function(t){if(!isChildOf(t.data.cal.get(0),t.target,t.data.cal.get(0))){t.data.cal.data("colorpicker").onHide.apply(this,[t.data.cal.get(0)])!=0&&t.data.cal.hide();e(document).off("mousedown",hide)}},isChildOf=function(e,t,n){if(e===t)return!0;if(e.contains)return e.contains(t);if(e.compareDocumentPosition)return!!(e.compareDocumentPosition(t)&16);var r=t.parentNode;while(r&&r!==n){if(r===e)return!0;r=r.parentNode}return!1},getViewport=function(){var e=document.compatMode=="CSS1Compat";return{l:window.pageXOffset||(e?document.documentElement.scrollLeft:document.body.scrollLeft),t:window.pageYOffset||(e?document.documentElement.scrollTop:document.body.scrollTop),w:window.innerWidth||(e?document.documentElement.clientWidth:document.body.clientWidth),h:window.innerHeight||(e?document.documentElement.clientHeight:document.body.clientHeight)}},fixHSB=function(e){return{h:Math.min(360,Math.max(0,e.h)),s:Math.min(100,Math.max(0,e.s)),b:Math.min(100,Math.max(0,e.b))}},fixRGB=function(e){return{r:Math.min(255,Math.max(0,e.r)),g:Math.min(255,Math.max(0,e.g)),b:Math.min(255,Math.max(0,e.b))}},fixHex=function(e){var t=6-e.length;if(t>0){var n=[];for(var r=0;r<t;r++)n.push("0");n.push(e);e=n.join("")}return e},HexToRGB=function(e){e=parseInt(e.indexOf("#")>-1?e.substring(1):e,16);return{r:e>>16,g:(e&65280)>>8,b:e&255}},HexToHSB=function(e){return RGBToHSB(HexToRGB(e))},RGBToHSB=function(e){var t={h:0,s:0,b:0},n=Math.min(e.r,e.g,e.b),r=Math.max(e.r,e.g,e.b),i=r-n;t.b=r;t.s=r!=0?255*i/r:0;t.s!=0?e.r===r?t.h=(e.g-e.b)/i:e.g===r?t.h=2+(e.b-e.r)/i:t.h=4+(e.r-e.g)/i:t.h=-1;t.h*=60;t.h<0&&(t.h+=360);t.s*=100/255;t.b*=100/255;return t},HSBToRGB=function(e){var t={},n=Math.round(e.h),r=Math.round(e.s*255/100),i=Math.round(e.b*255/100);if(r==0)t.r=t.g=t.b=i;else{var s=i,o=(255-r)*i/255,u=(s-o)*(n%60)/60;n===360&&(n=0);if(n<60){t.r=s;t.b=o;t.g=o+u}else if(n<120){t.g=s;t.b=o;t.r=s-u}else if(n<180){t.g=s;t.r=o;t.b=o+u}else if(n<240){t.b=s;t.r=o;t.g=s-u}else if(n<300){t.b=s;t.g=o;t.r=o+u}else if(n<360){t.r=s;t.g=o;t.b=s-u}else{t.r=0;t.g=0;t.b=0}}return{r:Math.round(t.r),g:Math.round(t.g),b:Math.round(t.b)}},RGBToHex=function(t){var n=[t.r.toString(16),t.g.toString(16),t.b.toString(16)];e.each(n,function(e,t){t.length===1&&(n[e]="0"+t)});return n.join("")},RGBstringToHex=function(e){function n(e){return("0"+parseInt(e,10).toString(16)).slice(-2)}if(!e)return"#FFFFFF";var t=e.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);return t?"#"+n(t[1])+n(t[2])+n(t[3]):e},HSBToHex=function(e){return RGBToHex(HSBToRGB(e))},restoreOriginal=function(){var t=e(this).parent(),n=t.data("colorpicker").origColor;t.data("colorpicker").color=n;i(n,t.get(0));o(n,t.get(0));s(n,t.get(0));u(n,t.get(0));a(n,t.get(0));l(n,t.get(0))};return{init:function(t){t=e.extend({},r,t||{});if(typeof t.color=="string")t.color.substring(0,4)=="rgb("?t.color=HexToHSB(RGBstringToHex(t.color)):t.color=HexToHSB(t.color);else if(t.color.r!==undefined&&t.color.g!==undefined&&t.color.b!==undefined)t.color=RGBToHSB(t.color);else{if(t.color.h===undefined||t.color.s===undefined||t.color.b===undefined)return this;t.color=fixHSB(t.color)}return this.each(function(){if(!e(this).data("colorpickerId")){var r=e.extend({},t);r.origColor=t.color;var m,g=0;m=e("#colorpicker_"+g).length===0;while(!m){g=parseInt(Math.random()*1e4);m=e("#colorpicker_"+g).length===0}var y="colorpicker_"+g;e(this).data("colorpickerId",y);r.parent=e(this);var w=e(n);w.attr("id",y).attr("data-parent",e(this).attr("id"));r.flat?w.appendTo(this).show():w.appendTo(document.body);r.fields=w.find("input").on("keyup",c).on("change",h).on("blur",p).on("focus",d);w.find("span").on("mousedown",v).end().find(">div.colorpicker_current_color").on("click",restoreOriginal);r.selector=w.find("div.colorpicker_color").on("mousedown",downSelector);r.selectorIndic=r.selector.find("div div");r.el=this;r.hue=w.find("div.colorpicker_hue div");w.find("div.colorpicker_hue").on("mousedown",b);w.find("div.colorpicker_hue").on("click",{cal:w},S);r.newColor=w.find("div.colorpicker_new_color");r.currentColor=w.find("div.colorpicker_current_color");w.data("colorpicker",r);w.find("div.colorpicker_submit").on("mouseenter",enterSubmit).on("mouseleave",leaveSubmit).on("click",clickSubmit);i(r.color,w.get(0));s(r.color,w.get(0));o(r.color,w.get(0));a(r.color,w.get(0));u(r.color,w.get(0));f(r.color,w.get(0));l(r.color,w.get(0));r.flat?w.css({position:"relative",display:"block"}):e(this).on(r.eventName,show)}})},showPicker:function(){return this.each(function(){e(this).data("colorpickerId")&&show.apply(this)})},hidePicker:function(){return this.each(function(){e(this).data("colorpickerId")&&e("#"+e(this).data("colorpickerId")).hide()})},setColor:function(t){if(typeof t=="string")t.substring(0,4)=="rgb("?t=HexToHSB(RGBstringToHex(t)):t=HexToHSB(t);else if(t.r!==undefined&&t.g!==undefined&&t.b!==undefined)t=RGBToHSB(t);else{if(t.h===undefined||t.s===undefined||t.b===undefined)return this;t=fixHSB(t)}return this.each(function(){if(e(this).data("colorpickerId")){var n=e("#"+e(this).data("colorpickerId"));n.data("colorpicker").color=t;n.data("colorpicker").origColor=t;i(t,n.get(0));s(t,n.get(0));o(t,n.get(0));a(t,n.get(0));u(t,n.get(0));f(t,n.get(0));l(t,n.get(0))}})}}}();e.fn.extend({ColorPicker:t.init,ColorPickerHide:t.hidePicker,ColorPickerShow:t.showPicker,ColorPickerSetColor:t.setColor})})(jQuery);
/* Web Font Loader v1.6.6 - (c) Adobe Systems, Google. License: Apache 2.0 */
(function(){function aa(a,b,c){return a.call.apply(a.bind,arguments)}function ba(a,b,c){if(!a)throw Error();if(2<arguments.length){var d=Array.prototype.slice.call(arguments,2);return function(){var c=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(c,d);return a.apply(b,c)}}return function(){return a.apply(b,arguments)}}function n(a,b,c){n=Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?aa:ba;return n.apply(null,arguments)}var p=Date.now||function(){return+new Date};function r(a,b){this.D=a;this.m=b||a;this.F=this.m.document}r.prototype.createElement=function(a,b,c){a=this.F.createElement(a);if(b)for(var d in b)b.hasOwnProperty(d)&&("style"==d?a.style.cssText=b[d]:a.setAttribute(d,b[d]));c&&a.appendChild(this.F.createTextNode(c));return a};function s(a,b,c){a=a.F.getElementsByTagName(b)[0];a||(a=document.documentElement);a.insertBefore(c,a.lastChild)}
function t(a,b,c){b=b||[];c=c||[];for(var d=a.className.split(/\s+/),f=0;f<b.length;f+=1){for(var e=!1,g=0;g<d.length;g+=1)if(b[f]===d[g]){e=!0;break}e||d.push(b[f])}b=[];for(f=0;f<d.length;f+=1){e=!1;for(g=0;g<c.length;g+=1)if(d[f]===c[g]){e=!0;break}e||b.push(d[f])}a.className=b.join(" ").replace(/\s+/g," ").replace(/^\s+|\s+$/,"")}function u(a,b){for(var c=a.className.split(/\s+/),d=0,f=c.length;d<f;d++)if(c[d]==b)return!0;return!1}
function v(a){if("string"===typeof a.da)return a.da;var b=a.m.location.protocol;"about:"==b&&(b=a.D.location.protocol);return"https:"==b?"https:":"http:"}function w(a,b){var c=a.createElement("link",{rel:"stylesheet",href:b,media:"all"}),d=!1;c.onload=function(){d||(d=!0)};c.onerror=function(){d||(d=!0)};s(a,"head",c)}
function x(a,b,c,d){var f=a.F.getElementsByTagName("head")[0];if(f){var e=a.createElement("script",{src:b}),g=!1;e.onload=e.onreadystatechange=function(){g||this.readyState&&"loaded"!=this.readyState&&"complete"!=this.readyState||(g=!0,c&&c(null),e.onload=e.onreadystatechange=null,"HEAD"==e.parentNode.tagName&&f.removeChild(e))};f.appendChild(e);setTimeout(function(){g||(g=!0,c&&c(Error("Script load timeout")))},d||5E3);return e}return null};function y(a){this.ca=a||"-"}y.prototype.d=function(a){for(var b=[],c=0;c<arguments.length;c++)b.push(arguments[c].replace(/[\W_]+/g,"").toLowerCase());return b.join(this.ca)};function A(a,b){this.V=a;this.N=4;this.H="n";var c=(b||"n4").match(/^([nio])([1-9])$/i);c&&(this.H=c[1],this.N=parseInt(c[2],10))}A.prototype.getName=function(){return this.V};function B(a){return a.H+a.N}function ca(a){var b=4,c="n",d=null;a&&((d=a.match(/(normal|oblique|italic)/i))&&d[1]&&(c=d[1].substr(0,1).toLowerCase()),(d=a.match(/([1-9]00|normal|bold)/i))&&d[1]&&(/bold/i.test(d[1])?b=7:/[1-9]00/.test(d[1])&&(b=parseInt(d[1].substr(0,1),10))));return c+b};function da(a,b){this.a=a;this.h=a.m.document.documentElement;this.J=b;this.f="wf";this.e=new y("-");this.Z=!1!==b.events;this.u=!1!==b.classes}function ea(a){a.u&&t(a.h,[a.e.d(a.f,"loading")]);C(a,"loading")}function D(a){if(a.u){var b=u(a.h,a.e.d(a.f,"active")),c=[],d=[a.e.d(a.f,"loading")];b||c.push(a.e.d(a.f,"inactive"));t(a.h,c,d)}C(a,"inactive")}function C(a,b,c){if(a.Z&&a.J[b])if(c)a.J[b](c.getName(),B(c));else a.J[b]()};function fa(){this.t={}}function ga(a,b,c){var d=[],f;for(f in b)if(b.hasOwnProperty(f)){var e=a.t[f];e&&d.push(e(b[f],c))}return d};function E(a,b){this.a=a;this.q=b;this.j=this.a.createElement("span",{"aria-hidden":"true"},this.q)}
function G(a,b){var c=a.j,d;d=[];for(var f=b.V.split(/,\s*/),e=0;e<f.length;e++){var g=f[e].replace(/['"]/g,"");-1==g.indexOf(" ")?d.push(g):d.push("'"+g+"'")}d=d.join(",");f="normal";"o"===b.H?f="oblique":"i"===b.H&&(f="italic");c.style.cssText="display:block;position:absolute;top:-9999px;left:-9999px;font-size:300px;width:auto;height:auto;line-height:normal;margin:0;padding:0;font-variant:normal;white-space:nowrap;font-family:"+d+";"+("font-style:"+f+";font-weight:"+(b.N+"00")+";")}
function H(a){s(a.a,"body",a.j)}E.prototype.remove=function(){var a=this.j;a.parentNode&&a.parentNode.removeChild(a)};function I(a,b,c,d,f,e,g){this.O=a;this.ba=b;this.a=c;this.g=d;this.q=g||"BESbswy";this.s={};this.M=f||3E3;this.T=e||null;this.C=this.B=this.w=this.v=null;this.v=new E(this.a,this.q);this.w=new E(this.a,this.q);this.B=new E(this.a,this.q);this.C=new E(this.a,this.q);G(this.v,new A(this.g.getName()+",serif",B(this.g)));G(this.w,new A(this.g.getName()+",sans-serif",B(this.g)));G(this.B,new A("serif",B(this.g)));G(this.C,new A("sans-serif",B(this.g)));H(this.v);H(this.w);H(this.B);H(this.C)}
var J={ga:"serif",fa:"sans-serif"},K=null;function L(){if(null===K){var a=/AppleWebKit\/([0-9]+)(?:\.([0-9]+))/.exec(window.navigator.userAgent);K=!!a&&(536>parseInt(a[1],10)||536===parseInt(a[1],10)&&11>=parseInt(a[2],10))}return K}I.prototype.start=function(){this.s.serif=this.B.j.offsetWidth;this.s["sans-serif"]=this.C.j.offsetWidth;this.ea=p();M(this)};function N(a,b,c){for(var d in J)if(J.hasOwnProperty(d)&&b===a.s[J[d]]&&c===a.s[J[d]])return!0;return!1}
function M(a){var b=a.v.j.offsetWidth,c=a.w.j.offsetWidth,d;(d=b===a.s.serif&&c===a.s["sans-serif"])||(d=L()&&N(a,b,c));d?p()-a.ea>=a.M?L()&&N(a,b,c)&&(null===a.T||a.T.hasOwnProperty(a.g.getName()))?O(a,a.O):O(a,a.ba):ha(a):O(a,a.O)}function ha(a){setTimeout(n(function(){M(this)},a),50)}function O(a,b){setTimeout(n(function(){this.v.remove();this.w.remove();this.B.remove();this.C.remove();b(this.g)},a),0)};function P(a,b,c){this.a=a;this.o=b;this.K=0;this.X=this.S=!1;this.M=c}P.prototype.$=function(a){var b=this.o;b.u&&t(b.h,[b.e.d(b.f,a.getName(),B(a).toString(),"active")],[b.e.d(b.f,a.getName(),B(a).toString(),"loading"),b.e.d(b.f,a.getName(),B(a).toString(),"inactive")]);C(b,"fontactive",a);this.X=!0;Q(this)};
P.prototype.aa=function(a){var b=this.o;if(b.u){var c=u(b.h,b.e.d(b.f,a.getName(),B(a).toString(),"active")),d=[],f=[b.e.d(b.f,a.getName(),B(a).toString(),"loading")];c||d.push(b.e.d(b.f,a.getName(),B(a).toString(),"inactive"));t(b.h,d,f)}C(b,"fontinactive",a);Q(this)};function Q(a){0==--a.K&&a.S&&(a.X?(a=a.o,a.u&&t(a.h,[a.e.d(a.f,"active")],[a.e.d(a.f,"loading"),a.e.d(a.f,"inactive")]),C(a,"active")):D(a.o))};function R(a){this.D=a;this.p=new fa;this.U=0;this.P=this.Q=!0}R.prototype.load=function(a){this.a=new r(this.D,a.context||this.D);this.Q=!1!==a.events;this.P=!1!==a.classes;ia(this,new da(this.a,a),a)};
function ja(a,b,c,d,f){var e=0==--a.U;(a.P||a.Q)&&setTimeout(function(){var a=f||null,l=d||null||{};if(0===c.length&&e)D(b.o);else{b.K+=c.length;e&&(b.S=e);var h,k=[];for(h=0;h<c.length;h++){var m=c[h],z=l[m.getName()],q=b.o,F=m;q.u&&t(q.h,[q.e.d(q.f,F.getName(),B(F).toString(),"loading")]);C(q,"fontloading",F);q=null;q=new I(n(b.$,b),n(b.aa,b),b.a,m,b.M,a,z);k.push(q)}for(h=0;h<k.length;h++)k[h].start()}},0)}
function ia(a,b,c){var d=[],f=c.timeout;ea(b);var d=ga(a.p,c,a.a),e=new P(a.a,b,f);a.U=d.length;b=0;for(c=d.length;b<c;b++)d[b].load(function(b,c,d){ja(a,e,b,c,d)})};function S(a,b,c){this.I=a?a:b+ka;this.k=[];this.L=[];this.Y=c||""}var ka="//fonts.googleapis.com/css";S.prototype.d=function(){if(0==this.k.length)throw Error("No fonts to load!");if(-1!=this.I.indexOf("kit="))return this.I;for(var a=this.k.length,b=[],c=0;c<a;c++)b.push(this.k[c].replace(/ /g,"+"));a=this.I+"?family="+b.join("%7C");0<this.L.length&&(a+="&subset="+this.L.join(","));0<this.Y.length&&(a+="&text="+encodeURIComponent(this.Y));return a};function T(a){this.k=a;this.W=[];this.G={}}
var U={latin:"BESbswy",cyrillic:"&#1081;&#1103;&#1046;",greek:"&#945;&#946;&#931;",khmer:"&#x1780;&#x1781;&#x1782;",Hanuman:"&#x1780;&#x1781;&#x1782;"},la={thin:"1",extralight:"2","extra-light":"2",ultralight:"2","ultra-light":"2",light:"3",regular:"4",book:"4",medium:"5","semi-bold":"6",semibold:"6","demi-bold":"6",demibold:"6",bold:"7","extra-bold":"8",extrabold:"8","ultra-bold":"8",ultrabold:"8",black:"9",heavy:"9",l:"3",r:"4",b:"7"},ma={i:"i",italic:"i",n:"n",normal:"n"},na=/^(thin|(?:(?:extra|ultra)-?)?light|regular|book|medium|(?:(?:semi|demi|extra|ultra)-?)?bold|black|heavy|l|r|b|[1-9]00)?(n|i|normal|italic)?$/;
T.prototype.parse=function(){for(var a=this.k.length,b=0;b<a;b++){var c=this.k[b].split(":"),d=c[0].replace(/\+/g," "),f=["n4"];if(2<=c.length){var e;var g=c[1];e=[];if(g)for(var g=g.split(","),l=g.length,h=0;h<l;h++){var k;k=g[h];if(k.match(/^[\w-]+$/))if(k=na.exec(k.toLowerCase()),null==k)k="";else{var m;m=k[1];if(null==m||""==m)m="4";else{var z=la[m];m=z?z:isNaN(m)?"4":m.substr(0,1)}k=k[2];k=[null==k||""==k?"n":ma[k],m].join("")}else k="";k&&e.push(k)}0<e.length&&(f=e);3==c.length&&(c=c[2],e=[],
c=c?c.split(","):e,0<c.length&&(c=U[c[0]])&&(this.G[d]=c))}this.G[d]||(c=U[d])&&(this.G[d]=c);for(c=0;c<f.length;c+=1)this.W.push(new A(d,f[c]))}};function V(a,b){this.a=a;this.c=b}var oa={Arimo:!0,Cousine:!0,Tinos:!0};V.prototype.load=function(a){for(var b=this.a,c=new S(this.c.api,v(b),this.c.text),d=this.c.families,f=d.length,e=0;e<f;e++){var g=d[e].split(":");3==g.length&&c.L.push(g.pop());var l="";2==g.length&&""!=g[1]&&(l=":");c.k.push(g.join(l))}d=new T(d);d.parse();w(b,c.d());a(d.W,d.G,oa)};function W(a,b){this.a=a;this.c=b;this.R=[]}W.prototype.A=function(a){var b=this.a;return v(this.a)+(this.c.api||"//f.fontdeck.com/s/css/js/")+(b.m.location.hostname||b.D.location.hostname)+"/"+a+".js"};
W.prototype.load=function(a){var b=this.c.id,c=this.a.m,d=this;b?(c.__webfontfontdeckmodule__||(c.__webfontfontdeckmodule__={}),c.__webfontfontdeckmodule__[b]=function(b,c){for(var g=0,l=c.fonts.length;g<l;++g){var h=c.fonts[g];d.R.push(new A(h.name,ca("font-weight:"+h.weight+";font-style:"+h.style)))}a(d.R)},x(this.a,this.A(b),function(b){b&&a([])})):a([])};function X(a,b){this.a=a;this.c=b}X.prototype.A=function(a){return(this.c.api||"https://use.typekit.net")+"/"+a+".js"};X.prototype.load=function(a){var b=this.c.id,c=this.a.m;b?x(this.a,this.A(b),function(b){if(b)a([]);else if(c.Typekit&&c.Typekit.config&&c.Typekit.config.fn){b=c.Typekit.config.fn;for(var f=[],e=0;e<b.length;e+=2)for(var g=b[e],l=b[e+1],h=0;h<l.length;h++)f.push(new A(g,l[h]));try{c.Typekit.load({events:!1,classes:!1,async:!0})}catch(k){}a(f)}},2E3):a([])};function Y(a,b){this.a=a;this.c=b}Y.prototype.A=function(a,b){var c=v(this.a),d=(this.c.api||"fast.fonts.net/jsapi").replace(/^.*http(s?):(\/\/)?/,"");return c+"//"+d+"/"+a+".js"+(b?"?v="+b:"")};Y.prototype.load=function(a){var b=this.c.projectId,c=this.c.version;if(b){var d=this.a.m;x(this.a,this.A(b,c),function(c){if(c)a([]);else if(d["__mti_fntLst"+b]){c=d["__mti_fntLst"+b]();var e=[];if(c)for(var g=0;g<c.length;g++)e.push(new A(c[g].fontfamily));a(e)}else a([])}).id="__MonotypeAPIScript__"+b}else a([])};function pa(a,b){this.a=a;this.c=b}pa.prototype.load=function(a){var b,c,d=this.c.urls||[],f=this.c.families||[],e=this.c.testStrings||{};b=0;for(c=d.length;b<c;b++)w(this.a,d[b]);d=[];b=0;for(c=f.length;b<c;b++){var g=f[b].split(":");if(g[1])for(var l=g[1].split(","),h=0;h<l.length;h+=1)d.push(new A(g[0],l[h]));else d.push(new A(g[0]))}a(d,e)};var Z=new R(window);Z.p.t.custom=function(a,b){return new pa(b,a)};Z.p.t.fontdeck=function(a,b){return new W(b,a)};Z.p.t.monotype=function(a,b){return new Y(b,a)};Z.p.t.typekit=function(a,b){return new X(b,a)};Z.p.t.google=function(a,b){return new V(b,a)};var $={load:n(Z.load,Z)};"function"===typeof define&&define.amd?define(function(){return $}):"undefined"!==typeof module&&module.exports?module.exports=$:(window.WebFont=$,window.WebFontConfig&&Z.load(window.WebFontConfig));}());

})(jQuery)