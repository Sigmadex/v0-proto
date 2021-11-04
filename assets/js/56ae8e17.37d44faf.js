"use strict";(self.webpackChunkdocusaur=self.webpackChunkdocusaur||[]).push([[475],{3905:function(t,e,n){n.d(e,{Zo:function(){return d},kt:function(){return m}});var a=n(7294);function r(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function i(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(t);e&&(a=a.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),n.push.apply(n,a)}return n}function o(t){for(var e=1;e<arguments.length;e++){var n=null!=arguments[e]?arguments[e]:{};e%2?i(Object(n),!0).forEach((function(e){r(t,e,n[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(n,e))}))}return t}function c(t,e){if(null==t)return{};var n,a,r=function(t,e){if(null==t)return{};var n,a,r={},i=Object.keys(t);for(a=0;a<i.length;a++)n=i[a],e.indexOf(n)>=0||(r[n]=t[n]);return r}(t,e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(t);for(a=0;a<i.length;a++)n=i[a],e.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(t,n)&&(r[n]=t[n])}return r}var l=a.createContext({}),u=function(t){var e=a.useContext(l),n=e;return t&&(n="function"==typeof t?t(e):o(o({},e),t)),n},d=function(t){var e=u(t.components);return a.createElement(l.Provider,{value:e},t.children)},p={inlineCode:"code",wrapper:function(t){var e=t.children;return a.createElement(a.Fragment,{},e)}},s=a.forwardRef((function(t,e){var n=t.components,r=t.mdxType,i=t.originalType,l=t.parentName,d=c(t,["components","mdxType","originalType","parentName"]),s=u(n),m=r,f=s["".concat(l,".").concat(m)]||s[m]||p[m]||i;return n?a.createElement(f,o(o({ref:e},d),{},{components:n})):a.createElement(f,o({ref:e},d))}));function m(t,e){var n=arguments,r=e&&e.mdxType;if("string"==typeof t||r){var i=n.length,o=new Array(i);o[0]=s;var c={};for(var l in e)hasOwnProperty.call(e,l)&&(c[l]=e[l]);c.originalType=t,c.mdxType="string"==typeof t?t:r,o[1]=c;for(var u=2;u<i;u++)o[u]=n[u];return a.createElement.apply(null,o)}return a.createElement.apply(null,n)}s.displayName="MDXCreateElement"},8230:function(t,e,n){n.r(e),n.d(e,{frontMatter:function(){return c},contentTitle:function(){return l},metadata:function(){return u},toc:function(){return d},default:function(){return s}});var a=n(7462),r=n(3366),i=(n(7294),n(3905)),o=["components"],c={},l="DiamondCutFacet",u={unversionedId:"Api Specification/facets/DiamondCutFacet",id:"Api Specification/facets/DiamondCutFacet",isDocsHomePage:!1,title:"DiamondCutFacet",description:"Functions",source:"@site/docs/Api Specification/facets/DiamondCutFacet.md",sourceDirName:"Api Specification/facets",slug:"/Api Specification/facets/DiamondCutFacet",permalink:"v0-proto/docs/Api Specification/facets/DiamondCutFacet",editUrl:"https://github.com/Sigmadex/v0-proto/docs/Api Specification/facets/DiamondCutFacet.md",tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"AutoSdexFarmFacet",permalink:"v0-proto/docs/Api Specification/facets/AutoSdexFarmFacet"},next:{title:"DiamondLoupeFacet",permalink:"v0-proto/docs/Api Specification/facets/DiamondLoupeFacet"}},d=[{value:"Functions",id:"functions",children:[{value:"diamondCut",id:"diamondcut",children:[{value:"Declaration",id:"declaration",children:[],level:4},{value:"Modifiers:",id:"modifiers",children:[],level:4},{value:"Args:",id:"args",children:[],level:4}],level:3}],level:2}],p={toc:d};function s(t){var e=t.components,n=(0,r.Z)(t,o);return(0,i.kt)("wrapper",(0,a.Z)({},p,n,{components:e,mdxType:"MDXLayout"}),(0,i.kt)("h1",{id:"diamondcutfacet"},"DiamondCutFacet"),(0,i.kt)("h2",{id:"functions"},"Functions"),(0,i.kt)("h3",{id:"diamondcut"},"diamondCut"),(0,i.kt)("p",null,"Add/replace/remove any number of functions and optionally execute\na function with delegatecall"),(0,i.kt)("h4",{id:"declaration"},"Declaration"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-solidity"},"  function diamondCut(\n    struct IDiamondCut.FacetCut[] _diamondCut,\n    address _init,\n    bytes _calldata\n  ) external\n")),(0,i.kt)("h4",{id:"modifiers"},"Modifiers:"),(0,i.kt)("p",null,"No modifiers"),(0,i.kt)("h4",{id:"args"},"Args:"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:null},"Arg"),(0,i.kt)("th",{parentName:"tr",align:null},"Type"),(0,i.kt)("th",{parentName:"tr",align:null},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},(0,i.kt)("inlineCode",{parentName:"td"},"_diamondCut")),(0,i.kt)("td",{parentName:"tr",align:null},"struct IDiamondCut.FacetCut[]"),(0,i.kt)("td",{parentName:"tr",align:null},"Contains the facet addresses and function selectors")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},(0,i.kt)("inlineCode",{parentName:"td"},"_init")),(0,i.kt)("td",{parentName:"tr",align:null},"address"),(0,i.kt)("td",{parentName:"tr",align:null},"The address of the contract or facet to execute _calldata")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},(0,i.kt)("inlineCode",{parentName:"td"},"_calldata")),(0,i.kt)("td",{parentName:"tr",align:null},"bytes"),(0,i.kt)("td",{parentName:"tr",align:null},"A function call, including function selector and arguments")))),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre"},"             _calldata is executed with delegatecall on _init\n")))}s.isMDXComponent=!0}}]);