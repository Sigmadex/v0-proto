"use strict";(self.webpackChunkdocusaur=self.webpackChunkdocusaur||[]).push([[3886],{3905:function(e,t,r){r.d(t,{Zo:function(){return p},kt:function(){return d}});var n=r(7294);function i(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function a(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){i(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function c(e,t){if(null==e)return{};var r,n,i=function(e,t){if(null==e)return{};var r,n,i={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(i[r]=e[r]);return i}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(i[r]=e[r])}return i}var l=n.createContext({}),s=function(e){var t=n.useContext(l),r=t;return e&&(r="function"==typeof e?e(t):a(a({},t),e)),r},p=function(e){var t=s(e.components);return n.createElement(l.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},f=n.forwardRef((function(e,t){var r=e.components,i=e.mdxType,o=e.originalType,l=e.parentName,p=c(e,["components","mdxType","originalType","parentName"]),f=s(r),d=i,m=f["".concat(l,".").concat(d)]||f[d]||u[d]||o;return r?n.createElement(m,a(a({ref:t},p),{},{components:r})):n.createElement(m,a({ref:t},p))}));function d(e,t){var r=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var o=r.length,a=new Array(o);a[0]=f;var c={};for(var l in t)hasOwnProperty.call(t,l)&&(c[l]=t[l]);c.originalType=e,c.mdxType="string"==typeof e?e:i,a[1]=c;for(var s=2;s<o;s++)a[s]=r[s];return n.createElement.apply(null,a)}return n.createElement.apply(null,r)}f.displayName="MDXCreateElement"},6556:function(e,t,r){r.r(t),r.d(t,{frontMatter:function(){return c},contentTitle:function(){return l},metadata:function(){return s},toc:function(){return p},default:function(){return f}});var n=r(7462),i=r(3366),o=(r(7294),r(3905)),a=["components"],c={},l="OwnershipFacet",s={unversionedId:"API Specification/facets/OwnershipFacet",id:"API Specification/facets/OwnershipFacet",isDocsHomePage:!1,title:"OwnershipFacet",description:"Functions",source:"@site/docs/API Specification/facets/OwnershipFacet.md",sourceDirName:"API Specification/facets",slug:"/API Specification/facets/OwnershipFacet",permalink:"/v0-proto/docs/API Specification/facets/OwnershipFacet",tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"OperationsFacet",permalink:"/v0-proto/docs/API Specification/facets/OperationsFacet"},next:{title:"RewardFacet",permalink:"/v0-proto/docs/API Specification/facets/RewardFacet"}},p=[{value:"Functions",id:"functions",children:[{value:"transferOwnership",id:"transferownership",children:[{value:"Declaration",id:"declaration",children:[],level:4},{value:"Modifiers:",id:"modifiers",children:[],level:4}],level:3},{value:"owner",id:"owner",children:[{value:"Declaration",id:"declaration-1",children:[],level:4},{value:"Modifiers:",id:"modifiers-1",children:[],level:4}],level:3}],level:2}],u={toc:p};function f(e){var t=e.components,r=(0,i.Z)(e,a);return(0,o.kt)("wrapper",(0,n.Z)({},u,r,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("h1",{id:"ownershipfacet"},"OwnershipFacet"),(0,o.kt)("h2",{id:"functions"},"Functions"),(0,o.kt)("h3",{id:"transferownership"},"transferOwnership"),(0,o.kt)("p",null,"No description"),(0,o.kt)("h4",{id:"declaration"},"Declaration"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-solidity"},"  function transferOwnership(\n  ) external\n")),(0,o.kt)("h4",{id:"modifiers"},"Modifiers:"),(0,o.kt)("p",null,"No modifiers"),(0,o.kt)("h3",{id:"owner"},"owner"),(0,o.kt)("p",null,"No description"),(0,o.kt)("h4",{id:"declaration-1"},"Declaration"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-solidity"},"  function owner(\n  ) external returns (address owner_)\n")),(0,o.kt)("h4",{id:"modifiers-1"},"Modifiers:"),(0,o.kt)("p",null,"No modifiers"))}f.isMDXComponent=!0}}]);