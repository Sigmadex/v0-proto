"use strict";(self.webpackChunkdocusaur=self.webpackChunkdocusaur||[]).push([[158],{3905:function(e,t,r){r.d(t,{Zo:function(){return u},kt:function(){return f}});var n=r(7294);function i(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function a(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){i(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function c(e,t){if(null==e)return{};var r,n,i=function(e,t){if(null==e)return{};var r,n,i={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(i[r]=e[r]);return i}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(i[r]=e[r])}return i}var l=n.createContext({}),p=function(e){var t=n.useContext(l),r=t;return e&&(r="function"==typeof e?e(t):a(a({},t),e)),r},u=function(e){var t=p(e.components);return n.createElement(l.Provider,{value:t},e.children)},s={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},d=n.forwardRef((function(e,t){var r=e.components,i=e.mdxType,o=e.originalType,l=e.parentName,u=c(e,["components","mdxType","originalType","parentName"]),d=p(r),f=i,m=d["".concat(l,".").concat(f)]||d[f]||s[f]||o;return r?n.createElement(m,a(a({ref:t},u),{},{components:r})):n.createElement(m,a({ref:t},u))}));function f(e,t){var r=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var o=r.length,a=new Array(o);a[0]=d;var c={};for(var l in t)hasOwnProperty.call(t,l)&&(c[l]=t[l]);c.originalType=e,c.mdxType="string"==typeof e?e:i,a[1]=c;for(var p=2;p<o;p++)a[p]=r[p];return n.createElement.apply(null,a)}return n.createElement.apply(null,r)}d.displayName="MDXCreateElement"},2605:function(e,t,r){r.r(t),r.d(t,{frontMatter:function(){return c},contentTitle:function(){return l},metadata:function(){return p},toc:function(){return u},default:function(){return d}});var n=r(7462),i=r(3366),o=(r(7294),r(3905)),a=["components"],c={},l="LibAppStorage",p={unversionedId:"Api Specification/libraries/LibAppStorage",id:"Api Specification/libraries/LibAppStorage",isDocsHomePage:!1,title:"LibAppStorage",description:"LibAppStorage defines the internal state of Sigmadex.  Is appended to over time as new functionalities requiring new state are added",source:"@site/docs/Api Specification/libraries/LibAppStorage.md",sourceDirName:"Api Specification/libraries",slug:"/Api Specification/libraries/LibAppStorage",permalink:"/v0-proto/docs/Api Specification/libraries/LibAppStorage",tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"IERC173",permalink:"/v0-proto/docs/Api Specification/interfaces/IERC173"},next:{title:"LibDiamond",permalink:"/v0-proto/docs/Api Specification/libraries/LibDiamond"}},u=[{value:"Functions",id:"functions",children:[{value:"diamondStorage",id:"diamondstorage",children:[{value:"Declaration",id:"declaration",children:[],level:4},{value:"Modifiers:",id:"modifiers",children:[],level:4}],level:3},{value:"abs",id:"abs",children:[{value:"Declaration",id:"declaration-1",children:[],level:4},{value:"Modifiers:",id:"modifiers-1",children:[],level:4}],level:3}],level:2}],s={toc:u};function d(e){var t=e.components,r=(0,i.Z)(e,a);return(0,o.kt)("wrapper",(0,n.Z)({},s,r,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("h1",{id:"libappstorage"},"LibAppStorage"),(0,o.kt)("blockquote",null,(0,o.kt)("p",{parentName:"blockquote"},"LibAppStorage defines the internal state of Sigmadex.  Is appended to over time as new functionalities requiring new state are added")),(0,o.kt)("h2",{id:"functions"},"Functions"),(0,o.kt)("h3",{id:"diamondstorage"},"diamondStorage"),(0,o.kt)("p",null,"No description"),(0,o.kt)("h4",{id:"declaration"},"Declaration"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-solidity"},"  function diamondStorage(\n  ) internal returns (struct AppStorage ds)\n")),(0,o.kt)("h4",{id:"modifiers"},"Modifiers:"),(0,o.kt)("p",null,"No modifiers"),(0,o.kt)("h3",{id:"abs"},"abs"),(0,o.kt)("p",null,"No description"),(0,o.kt)("h4",{id:"declaration-1"},"Declaration"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-solidity"},"  function abs(\n  ) internal returns (uint256)\n")),(0,o.kt)("h4",{id:"modifiers-1"},"Modifiers:"),(0,o.kt)("p",null,"No modifiers"))}d.isMDXComponent=!0}}]);