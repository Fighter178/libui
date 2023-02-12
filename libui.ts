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
const $ = (selector:string,from:Document|HTMLElement = document):HTMLElement|null=>{
    return from.querySelector(selector);
};
export default $
/**
 * It takes a CSS selector and a DOM element, and returns an array of all the elements in the DOM
 * element that match the CSS selector
 * @param {string} selector - The CSS selector to use to find the elements.
 * @param {Document|HTMLElement} from - The document or element to search in.
 * @returns An array of all the elements that match the selector.
 */
export const $a = (selector:string, from:Document|HTMLElement):Array<HTMLElement>=>{
    return Array.from(from.querySelectorAll(selector));
};
interface ComponentOptions {
    sandbox?:boolean,
    shadowMode?:"open"|"closed"
}
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
export const Component = (comp:ComponentFunction, options?:ComponentOptions)=>{
    const name = comp.name.toLocaleLowerCase();
    class Component extends HTMLElement { 
        #dom:ShadowRoot;
        render(){
            const dom = this.#dom;
            const html = comp("html", this.render).html;
            if (html) {
                dom.innerHTML = html;
            } else {
                dom.innerHTML = this.innerHTML
            }
            this.setAttribute("style", comp("css", this.render).css);
            try {
                if (options?.sandbox || !options) {
                    // This is how it gets sandboxed.
                    new Function("self", "render","document","window","globalThis",`${comp("js", this.render).js}`).call(dom, this, this.render, null, null, null);
                } else {
                    new Function("self", "render", `${comp("js", this.render).js}`).call(dom, this);
                }
            } catch (e){
                console.error(`LibUI | Failed to execute JavaScript on the component ${name} due to error:\n\n`, e);
            }
        };
        constructor(){
            super();
            const shadowMode = options?.shadowMode||"open";
            this.#dom = this.attachShadow({mode:shadowMode});
            //this.render() This was removed later, no longer rendered when it is constructed.
            this.addEventListener("change", ()=>{
                this.render();
            });
        };
        connectedCallback(){
            this.render();
        }
    };
    customElements.define(`c-${name}`, Component);
};

export interface ComponentFunctionResult {
    html:string|null,
    css:string,
    js:string,
}
/**
 * This is the function that renders a component.
 */
export type RenderFunction = ()=>void
export type ComponentFunction = (accessing:"html"|"js"|"css",render:RenderFunction)=>ComponentFunctionResult;
/* 
  * A class that allows you to store a value and subscribe to changes in that value.
*/
export class Store {
    #value:any = null;
    #subscribers:Array<CallableFunction> = [];
    constructor(v:any, subscribers?:Array<CallableFunction>) {
        this.#value = v;
        if (subscribers) {
            subscribers.forEach(sub=>{
                this.#subscribers.push(sub);
            });
        };
    };
    subscribe(callback:CallableFunction){
        this.#subscribers.push(callback);
    };
    unsubscribe(callback:CallableFunction){
        this.#subscribers.filter(sub=>sub !== callback);
        return this.#subscribers;
    };
    clear(){
        this.#subscribers = [];
    }
    set(v:any){
        this.#subscribers.forEach(sub=>{
            sub(v);
        });
        this.#value = v;
    };
    set value(v:any) {
        this.#subscribers.forEach(sub=>{
            sub(v);
        });
        this.#value = v;
    };
    get value(){
        return this.#value;
    };
    get subscribers(){
        return this.#subscribers;
    };
    set subscribers(v:any){
        throw new Error("LibUI | Subscribers method on a Store is readonly.")
    };
};

/* It's a custom element that hides or shows itself based on the value of an expression. */
class LibUI_If extends HTMLElement {
    #exp:any;
    #watch:boolean=false;
    constructor(){
        super();
        this.style.display = "none";
        this.#exp = new Function(`return ${this.getAttribute("exp")}`)();
        this.#watch = new Function(`return ${this.hasAttribute("w")||this.hasAttribute("watch")};`)();
    };
    connectedCallback(){
        setTimeout(()=>{
            this.#exp = new Function(`return ${this.getAttribute("exp")}`).call(window);
            if (this.#watch && this.#exp instanceof Store) {
                this.#exp.subscribe((v:any)=>{
                    this.render();
                })
            }
            this.render();
        })
    }
    render(){
        this.#exp = new Function(`return ${this.getAttribute("e")||this.getAttribute("exp")}`).call(window);

        if (this.#watch && this.#exp instanceof Store) {
            if (this.#exp.value) {
                this.style.display = "block";
            } else {
                this.style.display = "none";
            };
        } else {
            if (this.#exp) {
                this.style.display = "block";
            } else {
                this.style.display = "none";
            };
        };
    };
};
customElements.define("lui-if", LibUI_If);
/**
 * `range` takes a number and returns an array of numbers from 0 to that number
 * @param {number} to - The number to count up to.
 * @returns An array of numbers from 0 to the number passed in.
 */
export const range = (to:number):Array<number>=>{
    const arr:Array<number> = [];
    for(let i=0;i<to;i++) {
        arr.push(i);
    };
    return arr;
};
/* It takes the innerHTML of the element and repeats it for each item in the array or uses the range function if it is a number. */
class LibUI_each extends HTMLElement {
    #of:number|Array<any>;
    #html:string;
    constructor() {
        super();
        if (!this.hasAttribute("of")) throw new Error("libUI | An each element must have an of attribute");
        this.#of = new Function(`return ${this.getAttribute("of")||""}`)();
        this.#html = "";
        if (typeof this.#of == "number") {
            this.#of = range(this.#of);
        };
        this.#of.forEach(_=>{
            this.#html += this.innerHTML;
        });
        this.innerHTML = this.#html;
    };
}
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
const evaluateBraces = ():void=>{
    const elements = document.querySelectorAll("*");
    for (const element of elements) {
        let text = "";
        let newText = "";
        let newHTML = "";
        let insideBraces = false;
        let braceExpression = "";
        for (const childNode of element.childNodes) {
            if (childNode.nodeType === 3) {
                text = childNode.textContent||"";
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
                                } else {
                                    const evaluated = new Function(`return ${braceExpression};`)();
                                    newText += evaluated;
                                }
                            } catch (e) {
                                console.error(e);
                            }
                            braceExpression = "";
                            continue;
                        }
            
                        if (insideBraces) {
                            braceExpression += text[i];
                        } else {
                            newText += text[i];
                        }
                    }
            
                    childNode.textContent = newText;
                    element.innerHTML = element.innerHTML.replace(text, newText + newHTML);
                }
            }
        }
    };
};

// Brace syntax (attributes)
/**
 * It looks for any attribute that has a value that contains a brace expression, and then evaluates the
 * brace expression and replaces it with the evaluated value
 */
const evaluateBraceAttributes = (): void => {
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
              } catch (e) {
                console.error(e);
              }
              braceExpression = "";
              continue;
            }
    
            if (insideBraces) {
              braceExpression += attribute.value[i];
            } else {
              newValue += attribute.value[i];
            }
          }
    
          element.setAttribute(attribute.name, newValue);
        }
      }
    }
  };
  
document.addEventListener("DOMContentLoaded", ()=>{
    evaluateBraceAttributes();
});
export const useBraces = evaluateBraces;

// POLYFILLS
//TODO: Add more polyfills for the non-required APIs, to allow for LibUI to completely function on IE6 and all other browsers from that same era, that is the target.
const polyfillWarning = (name:string)=>{
    console.warn(`LibUI | Polyfill: A polyfill for ${name} is being used. Consider updating your browser.`)
}
(()=>{
    // Polyfill for replaceWith (deprecated)
    if (!Element.prototype.replaceWith) {
        polyfillWarning("replaceWith");
        Element.prototype.replaceWith = function (newNode: Node) {
            this.parentNode?.insertBefore(newNode, this);
            this.remove();
        };
    };
})();
// Polyfill for customElements API
(() => {
    if ('customElements' in window) {
        return;
    }
    polyfillWarning("customElement");
    interface CustomElement {
        connectedCallback?(): void;
        disconnectedCallback?(): void;
        attributeChangedCallback?(name: string, oldValue: string, newValue: string): void;
        adoptedCallback?(): void;
    }

    const customElements: {
        define: (
            tagName: string,
            constructor: { new (): CustomElement },
            options?: ElementDefinitionOptions,
        ) => void;
    } = Object.create(HTMLElement.prototype);
    const originalDefine = customElements.define;

    customElements.define = function (
        tagName: string,
        constructor: { new (): CustomElement },
        options?: ElementDefinitionOptions,
    ): void {
        originalDefine.call(this, tagName, constructor, options);
        constructor.prototype.connectedCallback = constructor.prototype.connectedCallback || function () {};
        constructor.prototype.disconnectedCallback =
            constructor.prototype.disconnectedCallback || function () {};
        constructor.prototype.attributeChangedCallback =
            constructor.prototype.attributeChangedCallback || function (_name: string, _oldValue: string, _newValue: string) {};
        constructor.prototype.adoptedCallback = constructor.prototype.adoptedCallback || function () {};
    };
    //@ts-ignore
    window.customElements = customElements;
})();

// Polyfill for the Shadow DOM API
(() => {
    if ('attachShadow' in Element.prototype) {
        return;
    };
    polyfillWarning("attachShadow");
    interface ShadowRoot {
        host: Element;
        appendChild(node: Node): void;
        getElementById(id: string): Element | null;
        getElementsByClassName(className: string): Element[];
    }

    const shadowRoot: ShadowRoot = Object.create(DocumentFragment.prototype);

    shadowRoot.appendChild = function (node: Node): void {
        this.host.appendChild(node);
    };

    shadowRoot.getElementById = function (id: string): Element | null {
        return this.host.querySelector(`[id="${id}"]`);
    };

    shadowRoot.getElementsByClassName = function (className: string): Element[] {
        return Array.from(this.host.getElementsByClassName(className));
    };
    //@ts-ignore
    Element.prototype.attachShadow = function (): ShadowRoot {
        //@ts-ignore
        this.shadowRoot = shadowRoot;
        //@ts-ignore
        return this.shadowRoot;
    };
})();
