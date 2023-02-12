var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _Store_value, _Store_subscribers, _LibUI_If_exp, _LibUI_If_watch, _LibUI_each_of, _LibUI_each_html;
/**
 * LibUI - A simple yet powerful framework for user interfaces.
 * @author Fighter178
 * @license MIT
 * @copyright 2023 Fighter178
 * @version 1.0.0
 * @description A simple yet powerful framework for user interfaces.
 * @name LibUI
 * @package @fighter178/libui
 * @date 2/12/23
 */
/**
 * It replaces all text in the document that is inside of braces with the evaluated value of the
 * expression inside of the braces
 * @param {string} selector - The selector to query for.
 * @param {Document|HTMLElement} from - The element to search from.
 * @returns The return value is the value of the last expression in the function.
 */
const $ = (selector, from = document) => {
    return from.querySelector(selector);
};
export default $;
/**
 * It takes a CSS selector and a DOM element, and returns an array of all the elements in the DOM
 * element that match the CSS selector
 * @param {string} selector - The CSS selector to use to find the elements.
 * @param {Document|HTMLElement} from - The document or element to search in.
 * @returns An array of all the elements that match the selector.
 */
export const $a = (selector, from) => {
    return Array.from(from.querySelectorAll(selector));
};
/**
 * It takes a function that returns a string of html, css, and js, and creates a custom element with
 * the returned html, css, and js. The name of the component will be the name of the function,
 * but lowercase and prefixed by a `c-`. The component will look like this `c-[functionName]`.
 *
 * The component is rendered when it is connected (added) to the DOM.
 *
 * Note
 * - In beta, the component was also rendered when it was created.
 *
 * When the component is rendered, this is when the Javascript gets executed. If you want Javascript to
 * execute before this (or to render it before), then you must not write it in the JS of the function, but outside it.
 * @param {ComponentFunction} comp - ComponentFunction
 * @param {ComponentOptions} [options] - ComponentOptions
 */
export const Component = (comp, options) => {
    var _Component_dom;
    const name = comp.name.toLocaleLowerCase();
    class Component extends HTMLElement {
        render() {
            const dom = __classPrivateFieldGet(this, _Component_dom, "f");
            const html = comp("html", this.render).html;
            if (html) {
                dom.innerHTML = html;
            }
            else {
                dom.innerHTML = this.innerHTML;
            }
            this.setAttribute("style", comp("css", this.render).css);
            try {
                if (options?.sandbox || !options) {
                    // This is how it gets sandboxed.
                    new Function("self", "render", "document", "window", "globalThis", `${comp("js", this.render).js}`).call(dom, this, this.render, null, null, null);
                }
                else {
                    new Function("self", "render", `${comp("js", this.render).js}`).call(dom, this);
                }
            }
            catch (e) {
                console.error(`LibUI | Failed to execute JavaScript on the component ${name} due to error:\n\n`, e);
            }
        }
        ;
        constructor() {
            super();
            _Component_dom.set(this, void 0);
            const shadowMode = options?.shadowMode || "open";
            __classPrivateFieldSet(this, _Component_dom, this.attachShadow({ mode: shadowMode }), "f");
            //this.render() This was removed later, no longer rendered when it is constructed.
            this.addEventListener("change", () => {
                this.render();
            });
        }
        ;
        connectedCallback() {
            this.render();
        }
    }
    _Component_dom = new WeakMap();
    ;
    customElements.define(`c-${name}`, Component);
};
/*
  * A class that allows you to store a value and subscribe to changes in that value.
*/
export class Store {
    constructor(v, subscribers) {
        _Store_value.set(this, null);
        _Store_subscribers.set(this, []);
        __classPrivateFieldSet(this, _Store_value, v, "f");
        if (subscribers) {
            subscribers.forEach(sub => {
                __classPrivateFieldGet(this, _Store_subscribers, "f").push(sub);
            });
        }
        ;
    }
    ;
    subscribe(callback) {
        __classPrivateFieldGet(this, _Store_subscribers, "f").push(callback);
    }
    ;
    unsubscribe(callback) {
        __classPrivateFieldGet(this, _Store_subscribers, "f").filter(sub => sub !== callback);
        return __classPrivateFieldGet(this, _Store_subscribers, "f");
    }
    ;
    clear() {
        __classPrivateFieldSet(this, _Store_subscribers, [], "f");
    }
    set(v) {
        __classPrivateFieldGet(this, _Store_subscribers, "f").forEach(sub => {
            sub(v);
        });
        __classPrivateFieldSet(this, _Store_value, v, "f");
    }
    ;
    set value(v) {
        __classPrivateFieldGet(this, _Store_subscribers, "f").forEach(sub => {
            sub(v);
        });
        __classPrivateFieldSet(this, _Store_value, v, "f");
    }
    ;
    get value() {
        return __classPrivateFieldGet(this, _Store_value, "f");
    }
    ;
    get subscribers() {
        return __classPrivateFieldGet(this, _Store_subscribers, "f");
    }
    ;
    set subscribers(v) {
        throw new Error("LibUI | Subscribers method on a Store is readonly.");
    }
    ;
}
_Store_value = new WeakMap(), _Store_subscribers = new WeakMap();
;
/* It's a custom element that hides or shows itself based on the value of an expression. */
class LibUI_If extends HTMLElement {
    constructor() {
        super();
        _LibUI_If_exp.set(this, void 0);
        _LibUI_If_watch.set(this, false);
        this.style.display = "none";
        __classPrivateFieldSet(this, _LibUI_If_exp, new Function(`return ${this.getAttribute("exp")}`)(), "f");
        __classPrivateFieldSet(this, _LibUI_If_watch, new Function(`return ${this.hasAttribute("w") || this.hasAttribute("watch")};`)(), "f");
    }
    ;
    connectedCallback() {
        setTimeout(() => {
            __classPrivateFieldSet(this, _LibUI_If_exp, new Function(`return ${this.getAttribute("exp")}`).call(window), "f");
            if (__classPrivateFieldGet(this, _LibUI_If_watch, "f") && __classPrivateFieldGet(this, _LibUI_If_exp, "f") instanceof Store) {
                __classPrivateFieldGet(this, _LibUI_If_exp, "f").subscribe((v) => {
                    this.render();
                });
            }
            this.render();
        });
    }
    render() {
        __classPrivateFieldSet(this, _LibUI_If_exp, new Function(`return ${this.getAttribute("e") || this.getAttribute("exp")}`).call(window), "f");
        if (__classPrivateFieldGet(this, _LibUI_If_watch, "f") && __classPrivateFieldGet(this, _LibUI_If_exp, "f") instanceof Store) {
            if (__classPrivateFieldGet(this, _LibUI_If_exp, "f").value) {
                this.style.display = "block";
            }
            else {
                this.style.display = "none";
            }
            ;
        }
        else {
            if (__classPrivateFieldGet(this, _LibUI_If_exp, "f")) {
                this.style.display = "block";
            }
            else {
                this.style.display = "none";
            }
            ;
        }
        ;
    }
    ;
}
_LibUI_If_exp = new WeakMap(), _LibUI_If_watch = new WeakMap();
;
customElements.define("lui-if", LibUI_If);
/**
 * `range` takes a number and returns an array of numbers from 0 to that number
 * @param {number} to - The number to count up to.
 * @returns An array of numbers from 0 to the number passed in.
 */
export const range = (to) => {
    const arr = [];
    for (let i = 0; i < to; i++) {
        arr.push(i);
    }
    ;
    return arr;
};
/* It takes the innerHTML of the element and repeats it for each item in the array or uses the range function if it is a number. */
class LibUI_each extends HTMLElement {
    constructor() {
        super();
        _LibUI_each_of.set(this, void 0);
        _LibUI_each_html.set(this, void 0);
        if (!this.hasAttribute("of"))
            throw new Error("libUI | An each element must have an of attribute");
        __classPrivateFieldSet(this, _LibUI_each_of, new Function(`return ${this.getAttribute("of") || ""}`)(), "f");
        __classPrivateFieldSet(this, _LibUI_each_html, "", "f");
        if (typeof __classPrivateFieldGet(this, _LibUI_each_of, "f") == "number") {
            __classPrivateFieldSet(this, _LibUI_each_of, range(__classPrivateFieldGet(this, _LibUI_each_of, "f")), "f");
        }
        ;
        __classPrivateFieldGet(this, _LibUI_each_of, "f").forEach(_ => {
            __classPrivateFieldSet(this, _LibUI_each_html, __classPrivateFieldGet(this, _LibUI_each_html, "f") + this.innerHTML, "f");
        });
        this.innerHTML = __classPrivateFieldGet(this, _LibUI_each_html, "f");
    }
    ;
}
_LibUI_each_of = new WeakMap(), _LibUI_each_html = new WeakMap();
customElements.define("lui-each", LibUI_each);
// Brace syntax
/**
 * It takes the text content of all elements, finds any text that is wrapped in curly braces, evaluates
 * the text inside the curly braces, and replaces the curly braces with the evaluated text.
 *
 * Here's a more detailed explanation:
 *
 * The function loops through all elements in the document. For each element, it loops through all
 * child nodes. If the child node is a text node, it gets the text content of the node. If the text
 * content contains curly braces, it loops through each character in the text content. If the character
 * is an opening curly brace, it sets a flag to indicate that it is inside curly braces. If the
 * character is a closing curly brace, it sets the flag to indicate that it is no longer inside curly
 * braces. If the character is inside curly braces, it adds the character to a string. If the character
 * is not inside curly braces, it adds the character to a different string. After looping through all
 * characters
 */
const evaluateBraces = () => {
    const elements = document.querySelectorAll("*");
    for (const element of elements) {
        let text = "";
        let newText = "";
        let newHTML = "";
        let insideBraces = false;
        let braceExpression = "";
        for (const childNode of element.childNodes) {
            if (childNode.nodeType === 3) {
                text = childNode.textContent || "";
                if (text && text.includes("{") && text.includes("}")) {
                    for (let i = 0; i < text.length; i++) {
                        if (text[i] === "{") {
                            insideBraces = true;
                            braceExpression = "";
                            continue;
                        }
                        if (text[i] === "}") {
                            insideBraces = false;
                            try {
                                if (braceExpression.startsWith("@html ")) {
                                    newHTML += new Function(`return ${braceExpression.slice(6)};`)();
                                }
                                else {
                                    const evaluated = new Function(`return ${braceExpression};`)();
                                    newText += evaluated;
                                }
                            }
                            catch (e) {
                                console.error(e);
                            }
                            braceExpression = "";
                            continue;
                        }
                        if (insideBraces) {
                            braceExpression += text[i];
                        }
                        else {
                            newText += text[i];
                        }
                    }
                    childNode.textContent = newText;
                    element.innerHTML = element.innerHTML.replace(text, newText + newHTML);
                }
            }
        }
    }
    ;
};
// Brace syntax (attributes)
/**
 * It looks for any attribute that has a value that contains a brace expression, and then evaluates the
 * brace expression and replaces it with the evaluated value
 */
const evaluateBraceAttributes = () => {
    const elements = document.querySelectorAll("*");
    for (const element of elements) {
        for (const attribute of element.attributes) {
            if (attribute.value.includes("{") && attribute.value.includes("}")) {
                let insideBraces = false;
                let braceExpression = "";
                let newValue = "";
                for (let i = 0; i < attribute.value.length; i++) {
                    if (attribute.value[i] === "{") {
                        insideBraces = true;
                        braceExpression = "";
                        continue;
                    }
                    if (attribute.value[i] === "}") {
                        insideBraces = false;
                        try {
                            const evaluated = new Function(`return ${braceExpression};`)();
                            newValue += evaluated;
                        }
                        catch (e) {
                            console.error(e);
                        }
                        braceExpression = "";
                        continue;
                    }
                    if (insideBraces) {
                        braceExpression += attribute.value[i];
                    }
                    else {
                        newValue += attribute.value[i];
                    }
                }
                element.setAttribute(attribute.name, newValue);
            }
        }
    }
};
document.addEventListener("DOMContentLoaded", () => {
    evaluateBraceAttributes();
});
export const useBraces = evaluateBraces;
// POLYFILLS
//TODO: Add more polyfills for the non-required APIs, to allow for LibUI to completely function on IE6 and all other browsers from that same era, that is the target.
const polyfillWarning = (name) => {
    console.warn(`LibUI | Polyfill: A polyfill for ${name} is being used. Consider updating your browser.`);
};
(() => {
    // Polyfill for replaceWith (deprecated)
    if (!Element.prototype.replaceWith) {
        polyfillWarning("replaceWith");
        Element.prototype.replaceWith = function (newNode) {
            this.parentNode?.insertBefore(newNode, this);
            this.remove();
        };
    }
    ;
})();
// Polyfill for customElements API
(() => {
    if ('customElements' in window) {
        return;
    }
    polyfillWarning("customElement");
    const customElements = Object.create(HTMLElement.prototype);
    const originalDefine = customElements.define;
    customElements.define = function (tagName, constructor, options) {
        originalDefine.call(this, tagName, constructor, options);
        constructor.prototype.connectedCallback = constructor.prototype.connectedCallback || function () { };
        constructor.prototype.disconnectedCallback =
            constructor.prototype.disconnectedCallback || function () { };
        constructor.prototype.attributeChangedCallback =
            constructor.prototype.attributeChangedCallback || function (_name, _oldValue, _newValue) { };
        constructor.prototype.adoptedCallback = constructor.prototype.adoptedCallback || function () { };
    };
    //@ts-ignore
    window.customElements = customElements;
})();
// Polyfill for the Shadow DOM API
(() => {
    if ('attachShadow' in Element.prototype) {
        return;
    }
    ;
    polyfillWarning("attachShadow");
    const shadowRoot = Object.create(DocumentFragment.prototype);
    shadowRoot.appendChild = function (node) {
        this.host.appendChild(node);
    };
    shadowRoot.getElementById = function (id) {
        return this.host.querySelector(`[id="${id}"]`);
    };
    shadowRoot.getElementsByClassName = function (className) {
        return Array.from(this.host.getElementsByClassName(className));
    };
    //@ts-ignore
    Element.prototype.attachShadow = function () {
        //@ts-ignore
        this.shadowRoot = shadowRoot;
        //@ts-ignore
        return this.shadowRoot;
    };
})();
