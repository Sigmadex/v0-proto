"use strict";(self.webpackChunkdocusaur=self.webpackChunkdocusaur||[]).push([[512],{3905:function(e,t,n){n.d(t,{Zo:function(){return d},kt:function(){return m}});var r=n(7294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var c=r.createContext({}),u=function(e){var t=r.useContext(c),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},d=function(e){var t=u(e.components);return r.createElement(c.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},s=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,c=e.parentName,d=l(e,["components","mdxType","originalType","parentName"]),s=u(n),m=a,f=s["".concat(c,".").concat(m)]||s[m]||p[m]||i;return n?r.createElement(f,o(o({ref:t},d),{},{components:n})):r.createElement(f,o({ref:t},d))}));function m(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,o=new Array(i);o[0]=s;var l={};for(var c in t)hasOwnProperty.call(t,c)&&(l[c]=t[c]);l.originalType=e,l.mdxType="string"==typeof e?e:a,o[1]=l;for(var u=2;u<i;u++)o[u]=n[u];return r.createElement.apply(null,o)}return r.createElement.apply(null,n)}s.displayName="MDXCreateElement"},8476:function(e,t,n){n.r(t),n.d(t,{frontMatter:function(){return l},contentTitle:function(){return c},metadata:function(){return u},toc:function(){return d},default:function(){return s}});var r=n(7462),a=n(3366),i=(n(7294),n(3905)),o=["components"],l={},c="IDiamondCut",u={unversionedId:"Api Specification/interfaces/IDiamondCut",id:"Api Specification/interfaces/IDiamondCut",isDocsHomePage:!1,title:"IDiamondCut",description:"Functions",source:"@site/docs/Api Specification/interfaces/IDiamondCut.md",sourceDirName:"Api Specification/interfaces",slug:"/Api Specification/interfaces/IDiamondCut",permalink:"/v0-proto/docs/Api Specification/interfaces/IDiamondCut",tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"ReducedPenaltyFacet",permalink:"/v0-proto/docs/Api Specification/facets/RewardFacets/ReducedPenaltyFacet"},next:{title:"IDiamondLoupe",permalink:"/v0-proto/docs/Api Specification/interfaces/IDiamondLoupe"}},d=[{value:"Functions",id:"functions",children:[{value:"diamondCut",id:"diamondcut",children:[{value:"Declaration",id:"declaration",children:[],level:4},{value:"Modifiers:",id:"modifiers",children:[],level:4},{value:"Args:",id:"args",children:[],level:4}],level:3}],level:2},{value:"Events",id:"events",children:[{value:"DiamondCut",id:"diamondcut-1",children:[],level:3}],level:2}],p={toc:d};function s(e){var t=e.components,n=(0,a.Z)(e,o);return(0,i.kt)("wrapper",(0,r.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("h1",{id:"idiamondcut"},"IDiamondCut"),(0,i.kt)("h2",{id:"functions"},"Functions"),(0,i.kt)("h3",{id:"diamondcut"},"diamondCut"),(0,i.kt)("p",null,"Add/replace/remove any number of functions and optionally execute\na function with delegatecall"),(0,i.kt)("h4",{id:"declaration"},"Declaration"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-solidity"},"  function diamondCut(\n    struct IDiamondCut.FacetCut[] _diamondCut,\n    address _init,\n    bytes _calldata\n  ) external\n")),(0,i.kt)("h4",{id:"modifiers"},"Modifiers:"),(0,i.kt)("p",null,"No modifiers"),(0,i.kt)("h4",{id:"args"},"Args:"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:null},"Arg"),(0,i.kt)("th",{parentName:"tr",align:null},"Type"),(0,i.kt)("th",{parentName:"tr",align:null},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},(0,i.kt)("inlineCode",{parentName:"td"},"_diamondCut")),(0,i.kt)("td",{parentName:"tr",align:null},"struct IDiamondCut.FacetCut[]"),(0,i.kt)("td",{parentName:"tr",align:null},"Contains the facet addresses and function selectors")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},(0,i.kt)("inlineCode",{parentName:"td"},"_init")),(0,i.kt)("td",{parentName:"tr",align:null},"address"),(0,i.kt)("td",{parentName:"tr",align:null},"The address of the contract or facet to execute _calldata")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},(0,i.kt)("inlineCode",{parentName:"td"},"_calldata")),(0,i.kt)("td",{parentName:"tr",align:null},"bytes"),(0,i.kt)("td",{parentName:"tr",align:null},"A function call, including function selector and arguments")))),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre"},"             _calldata is executed with delegatecall on _init\n")),(0,i.kt)("h2",{id:"events"},"Events"),(0,i.kt)("h3",{id:"diamondcut-1"},"DiamondCut"),(0,i.kt)("p",null,"No description"))}s.isMDXComponent=!0}}]);