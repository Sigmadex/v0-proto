"use strict";(self.webpackChunkdocusaur=self.webpackChunkdocusaur||[]).push([[231],{3905:function(e,t,n){n.d(t,{Zo:function(){return s},kt:function(){return f}});var r=n(7294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var c=r.createContext({}),p=function(e){var t=r.useContext(c),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},s=function(e){var t=p(e.components);return r.createElement(c.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},u=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,a=e.originalType,c=e.parentName,s=l(e,["components","mdxType","originalType","parentName"]),u=p(n),f=i,m=u["".concat(c,".").concat(f)]||u[f]||d[f]||a;return n?r.createElement(m,o(o({ref:t},s),{},{components:n})):r.createElement(m,o({ref:t},s))}));function f(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var a=n.length,o=new Array(a);o[0]=u;var l={};for(var c in t)hasOwnProperty.call(t,c)&&(l[c]=t[c]);l.originalType=e,l.mdxType="string"==typeof e?e:i,o[1]=l;for(var p=2;p<a;p++)o[p]=n[p];return r.createElement.apply(null,o)}return r.createElement.apply(null,n)}u.displayName="MDXCreateElement"},6221:function(e,t,n){n.r(t),n.d(t,{frontMatter:function(){return l},contentTitle:function(){return c},metadata:function(){return p},toc:function(){return s},default:function(){return u}});var r=n(7462),i=n(3366),a=(n(7294),n(3905)),o=["components"],l={},c="IERC173",p={unversionedId:"Api Specification/interfaces/IERC173",id:"Api Specification/interfaces/IERC173",isDocsHomePage:!1,title:"IERC173",description:"Functions",source:"@site/docs/Api Specification/interfaces/IERC173.md",sourceDirName:"Api Specification/interfaces",slug:"/Api Specification/interfaces/IERC173",permalink:"/v0-proto/docs/Api Specification/interfaces/IERC173",editUrl:"https://github.com/Sigmadex/v0-proto/docs/Api Specification/interfaces/IERC173.md",tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"IERC165",permalink:"/v0-proto/docs/Api Specification/interfaces/IERC165"},next:{title:"LibAppStorage",permalink:"/v0-proto/docs/Api Specification/libraries/LibAppStorage"}},s=[{value:"Functions",id:"functions",children:[{value:"owner",id:"owner",children:[{value:"Declaration",id:"declaration",children:[],level:4},{value:"Modifiers:",id:"modifiers",children:[],level:4},{value:"Returns:",id:"returns",children:[],level:4}],level:3},{value:"transferOwnership",id:"transferownership",children:[{value:"Declaration",id:"declaration-1",children:[],level:4},{value:"Modifiers:",id:"modifiers-1",children:[],level:4},{value:"Args:",id:"args",children:[],level:4}],level:3}],level:2},{value:"Events",id:"events",children:[{value:"OwnershipTransferred",id:"ownershiptransferred",children:[],level:3}],level:2}],d={toc:s};function u(e){var t=e.components,n=(0,i.Z)(e,o);return(0,a.kt)("wrapper",(0,r.Z)({},d,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h1",{id:"ierc173"},"IERC173"),(0,a.kt)("h2",{id:"functions"},"Functions"),(0,a.kt)("h3",{id:"owner"},"owner"),(0,a.kt)("p",null,"Get the address of the owner"),(0,a.kt)("h4",{id:"declaration"},"Declaration"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-solidity"},"  function owner(\n  ) external returns (address owner_)\n")),(0,a.kt)("h4",{id:"modifiers"},"Modifiers:"),(0,a.kt)("p",null,"No modifiers"),(0,a.kt)("h4",{id:"returns"},"Returns:"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:null},"Type"),(0,a.kt)("th",{parentName:"tr",align:null},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:null},(0,a.kt)("inlineCode",{parentName:"td"},"owner_")),(0,a.kt)("td",{parentName:"tr",align:null},"The address of the owner.")))),(0,a.kt)("h3",{id:"transferownership"},"transferOwnership"),(0,a.kt)("p",null,"Set the address of the new owner of the contract"),(0,a.kt)("blockquote",null,(0,a.kt)("p",{parentName:"blockquote"},"Set _newOwner to address(0) to renounce any ownership.")),(0,a.kt)("h4",{id:"declaration-1"},"Declaration"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-solidity"},"  function transferOwnership(\n    address _newOwner\n  ) external\n")),(0,a.kt)("h4",{id:"modifiers-1"},"Modifiers:"),(0,a.kt)("p",null,"No modifiers"),(0,a.kt)("h4",{id:"args"},"Args:"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:null},"Arg"),(0,a.kt)("th",{parentName:"tr",align:null},"Type"),(0,a.kt)("th",{parentName:"tr",align:null},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:null},(0,a.kt)("inlineCode",{parentName:"td"},"_newOwner")),(0,a.kt)("td",{parentName:"tr",align:null},"address"),(0,a.kt)("td",{parentName:"tr",align:null},"The address of the new owner of the contract")))),(0,a.kt)("h2",{id:"events"},"Events"),(0,a.kt)("h3",{id:"ownershiptransferred"},"OwnershipTransferred"),(0,a.kt)("p",null,"No description"),(0,a.kt)("blockquote",null,(0,a.kt)("p",{parentName:"blockquote"},"This emits when ownership of a contract changes.")))}u.isMDXComponent=!0}}]);