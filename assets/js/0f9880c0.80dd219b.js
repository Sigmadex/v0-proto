"use strict";(self.webpackChunkdocusaur=self.webpackChunkdocusaur||[]).push([[5498],{3905:function(e,t,n){n.d(t,{Zo:function(){return s},kt:function(){return f}});var r=n(7294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var c=r.createContext({}),d=function(e){var t=r.useContext(c),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},s=function(e){var t=d(e.components);return r.createElement(c.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},p=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,c=e.parentName,s=o(e,["components","mdxType","originalType","parentName"]),p=d(n),f=a,m=p["".concat(c,".").concat(f)]||p[f]||u[f]||i;return n?r.createElement(m,l(l({ref:t},s),{},{components:n})):r.createElement(m,l({ref:t},s))}));function f(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,l=new Array(i);l[0]=p;var o={};for(var c in t)hasOwnProperty.call(t,c)&&(o[c]=t[c]);o.originalType=e,o.mdxType="string"==typeof e?e:a,l[1]=o;for(var d=2;d<i;d++)l[d]=n[d];return r.createElement.apply(null,l)}return r.createElement.apply(null,n)}p.displayName="MDXCreateElement"},2013:function(e,t,n){n.r(t),n.d(t,{frontMatter:function(){return o},contentTitle:function(){return c},metadata:function(){return d},toc:function(){return s},default:function(){return p}});var r=n(7462),a=n(3366),i=(n(7294),n(3905)),l=["components"],o={},c="DiamondLoupeFacet",d={unversionedId:"API Specification/facets/DiamondLoupeFacet",id:"API Specification/facets/DiamondLoupeFacet",isDocsHomePage:!1,title:"DiamondLoupeFacet",description:"Functions",source:"@site/docs/API Specification/facets/DiamondLoupeFacet.md",sourceDirName:"API Specification/facets",slug:"/API Specification/facets/DiamondLoupeFacet",permalink:"/v0-proto/docs/API Specification/facets/DiamondLoupeFacet",tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"DiamondCutFacet",permalink:"/v0-proto/docs/API Specification/facets/DiamondCutFacet"},next:{title:"OperationsFacet",permalink:"/v0-proto/docs/API Specification/facets/OperationsFacet"}},s=[{value:"Functions",id:"functions",children:[{value:"facets",id:"facets",children:[{value:"Declaration",id:"declaration",children:[],level:4},{value:"Modifiers:",id:"modifiers",children:[],level:4},{value:"Returns:",id:"returns",children:[],level:4}],level:3},{value:"facetFunctionSelectors",id:"facetfunctionselectors",children:[{value:"Declaration",id:"declaration-1",children:[],level:4},{value:"Modifiers:",id:"modifiers-1",children:[],level:4},{value:"Args:",id:"args",children:[],level:4}],level:3},{value:"facetAddresses",id:"facetaddresses",children:[{value:"Declaration",id:"declaration-2",children:[],level:4},{value:"Modifiers:",id:"modifiers-2",children:[],level:4}],level:3},{value:"facetAddress",id:"facetaddress",children:[{value:"Declaration",id:"declaration-3",children:[],level:4},{value:"Modifiers:",id:"modifiers-3",children:[],level:4},{value:"Args:",id:"args-1",children:[],level:4},{value:"Returns:",id:"returns-1",children:[],level:4}],level:3},{value:"supportsInterface",id:"supportsinterface",children:[{value:"Declaration",id:"declaration-4",children:[],level:4},{value:"Modifiers:",id:"modifiers-4",children:[],level:4}],level:3}],level:2}],u={toc:s};function p(e){var t=e.components,n=(0,a.Z)(e,l);return(0,i.kt)("wrapper",(0,r.Z)({},u,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("h1",{id:"diamondloupefacet"},"DiamondLoupeFacet"),(0,i.kt)("h2",{id:"functions"},"Functions"),(0,i.kt)("h3",{id:"facets"},"facets"),(0,i.kt)("p",null,"Gets all facets and their selectors."),(0,i.kt)("h4",{id:"declaration"},"Declaration"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-solidity"},"  function facets(\n  ) external returns (struct IDiamondLoupe.Facet[] facets_)\n")),(0,i.kt)("h4",{id:"modifiers"},"Modifiers:"),(0,i.kt)("p",null,"No modifiers"),(0,i.kt)("h4",{id:"returns"},"Returns:"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:null},"Type"),(0,i.kt)("th",{parentName:"tr",align:null},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},(0,i.kt)("inlineCode",{parentName:"td"},"facets_")),(0,i.kt)("td",{parentName:"tr",align:null},"Facet")))),(0,i.kt)("h3",{id:"facetfunctionselectors"},"facetFunctionSelectors"),(0,i.kt)("p",null,"Gets all the function selectors provided by a facet."),(0,i.kt)("h4",{id:"declaration-1"},"Declaration"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-solidity"},"  function facetFunctionSelectors(\n    address _facet\n  ) external returns (bytes4[] facetFunctionSelectors_)\n")),(0,i.kt)("h4",{id:"modifiers-1"},"Modifiers:"),(0,i.kt)("p",null,"No modifiers"),(0,i.kt)("h4",{id:"args"},"Args:"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:null},"Arg"),(0,i.kt)("th",{parentName:"tr",align:null},"Type"),(0,i.kt)("th",{parentName:"tr",align:null},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},(0,i.kt)("inlineCode",{parentName:"td"},"_facet")),(0,i.kt)("td",{parentName:"tr",align:null},"address"),(0,i.kt)("td",{parentName:"tr",align:null},"The facet address.")))),(0,i.kt)("h3",{id:"facetaddresses"},"facetAddresses"),(0,i.kt)("p",null,"Get all the facet addresses used by a diamond."),(0,i.kt)("h4",{id:"declaration-2"},"Declaration"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-solidity"},"  function facetAddresses(\n  ) external returns (address[] facetAddresses_)\n")),(0,i.kt)("h4",{id:"modifiers-2"},"Modifiers:"),(0,i.kt)("p",null,"No modifiers"),(0,i.kt)("h3",{id:"facetaddress"},"facetAddress"),(0,i.kt)("p",null,"Gets the facet that supports the given selector."),(0,i.kt)("blockquote",null,(0,i.kt)("p",{parentName:"blockquote"},"If facet is not found return address(0).")),(0,i.kt)("h4",{id:"declaration-3"},"Declaration"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-solidity"},"  function facetAddress(\n    bytes4 _functionSelector\n  ) external returns (address facetAddress_)\n")),(0,i.kt)("h4",{id:"modifiers-3"},"Modifiers:"),(0,i.kt)("p",null,"No modifiers"),(0,i.kt)("h4",{id:"args-1"},"Args:"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:null},"Arg"),(0,i.kt)("th",{parentName:"tr",align:null},"Type"),(0,i.kt)("th",{parentName:"tr",align:null},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},(0,i.kt)("inlineCode",{parentName:"td"},"_functionSelector")),(0,i.kt)("td",{parentName:"tr",align:null},"bytes4"),(0,i.kt)("td",{parentName:"tr",align:null},"The function selector.")))),(0,i.kt)("h4",{id:"returns-1"},"Returns:"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:null},"Type"),(0,i.kt)("th",{parentName:"tr",align:null},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},(0,i.kt)("inlineCode",{parentName:"td"},"facetAddress_")),(0,i.kt)("td",{parentName:"tr",align:null},"The facet address.")))),(0,i.kt)("h3",{id:"supportsinterface"},"supportsInterface"),(0,i.kt)("p",null,"No description"),(0,i.kt)("h4",{id:"declaration-4"},"Declaration"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-solidity"},"  function supportsInterface(\n  ) external returns (bool)\n")),(0,i.kt)("h4",{id:"modifiers-4"},"Modifiers:"),(0,i.kt)("p",null,"No modifiers"))}p.isMDXComponent=!0}}]);