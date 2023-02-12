# LibUI - Overview

This library exports a number of utility functions and classes that can be used to build user interfaces. Some of the functions are utility functions, while others are more advanced, such as the Component and Store classes.
### `$` function

The `$` function is a utility function that returns the first element in the document or a given HTMLElement that matches the given selector.
#### Parameters

    selector:string - A string representing the CSS selector to search for.
    from:Document|HTMLElement (optional) - The document or HTMLElement to search within. If not provided, the document object is used.

#### Returns

An HTMLElement object representing the first element matching the selector, or null if no elements were found.
$a function
## The `$a` function
The `$a` function is similar to the $ function, but returns an array of all elements that match the selector.
### Parameters

    selector:string - A string representing the CSS selector to search for.
    from:Document|HTMLElement - The document or HTMLElement to search within.

### Returns

An array of HTMLElement objects representing all elements matching the selector.
## Component function

The Component function is a higher-level utility function that allows you to define custom HTML elements. The name of the function will be the name of the component, though due to the limitations of the web components API, it is going to be `c-[component name]`.
### Parameters

    comp:ComponentFunction - A function that returns an object with properties html, css, and js representing the HTML, CSS, and JavaScript code to render the component.
    options?:ComponentOptions (optional) - An object that contains options for the component.

## ComponentFunctionResult interface

The `ComponentFunctionResult` interface represents the object returned by the `comp` parameter in the Component function. It must have properties html, css, and js that are of type string or null.
ComponentFunction type

The ComponentFunction type represents the type of the comp parameter in the Component function. It is a function that takes two parameters, accessing and render, and returns an object of type ComponentFunctionResult.
## Store class

The Store class is a utility class that can be used to store data in a way that allows other parts of the application to subscribe to changes in the data.
### Properties

    value - The value stored in the store. (can be written, and will notify subscribers too)
    subscribers - An array of functions that will be called when the value of the store changes.

### Methods

    subscribe(callback:CallableFunction) - Adds a function to the list of subscribers.
    unsubscribe(callback:CallableFunction) - Removes a function from the list of subscribers.
    clear() - Clears the list of subscribers.
    set(v:any) - Sets the value of the store and calls all subscribers.

## Builtin Components
Any builtin component will not be prefixed by `c-` but instead `lui-`.
### `lui-if` Component
The `lui-if` component conditionally renders content depending on the `exp` or `e` for short attributes.
#### Attributes
    exp | e - The expression to evaluate
    watch | w - If this is present, it will watch for changes to the exp attribute. The exp attribute must be a store for this to work.
#### Usage
##### Simple Example
```html
<lui-if exp="false">
    I am invisible!
</lui-if>
<lui-if exp="true">
    <h3>Hello!</h3>
</lui-if>
```
##### Advanced Usage
*index.js*
```js
import {Store} from "libui";
const myStore = new Store(false);
setTimeout(()=>{
    myStore.value = true;
},1000);
// You may need to do this to:
globalThis.myStore = myStore;
// A polyfill for you (for older browsers, probably not required)
const globalThis = window;
window.globalThis = globalThis;
```
*index.html*
```html
<lui-if exp="myStore" watch>
    <h3>You can see me after a second!</h3>
    <p>Isn't that neat?</p>
</lui-if>
```
### `lui-each` Component
The `lui-each` component will render its content multiple times depending on the `of` attribute, which can either be a number or an array of anything.
#### Attributes
    of - A number or array (of anything) to indicate how many times to duplicate the content.
    as - What variable name to scope to brace syntaxes that corresponds with the value of the array at the current time COMING IN V2!
#### Usage
*index.html*
```html
<lui-each of="5">
    <p>This is duplicated 5 times</p>
</lui-each>
```
##### Advanced Example
*index.js*
```js
const myArray = [1,2,3,4,5];
```
*index.html*
```html
<lui-each of="myArray">
    <p>This is also duplicated 5 times.</p>
</lui-each>
```
##### In V2 Example (Not working yet)
```html
<lui-each of="myArray" as="val">
    <p>This is {val}/5</p>
</lui-each>
```
Which would show 
```
    This is 1/5
    This is 2/5
    This is 3/5
    This is 4/5
    This is 5/5
```
on the screen.
