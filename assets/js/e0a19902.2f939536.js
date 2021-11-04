"use strict";(self.webpackChunkdocusaur=self.webpackChunkdocusaur||[]).push([[394],{3905:function(e,t,r){r.d(t,{Zo:function(){return m},kt:function(){return h}});var o=r(7294);function n(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function a(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,o)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?a(Object(r),!0).forEach((function(t){n(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function c(e,t){if(null==e)return{};var r,o,n=function(e,t){if(null==e)return{};var r,o,n={},a=Object.keys(e);for(o=0;o<a.length;o++)r=a[o],t.indexOf(r)>=0||(n[r]=e[r]);return n}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(o=0;o<a.length;o++)r=a[o],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(n[r]=e[r])}return n}var u=o.createContext({}),l=function(e){var t=o.useContext(u),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},m=function(e){var t=l(e.components);return o.createElement(u.Provider,{value:t},e.children)},s={inlineCode:"code",wrapper:function(e){var t=e.children;return o.createElement(o.Fragment,{},t)}},p=o.forwardRef((function(e,t){var r=e.components,n=e.mdxType,a=e.originalType,u=e.parentName,m=c(e,["components","mdxType","originalType","parentName"]),p=l(r),h=n,d=p["".concat(u,".").concat(h)]||p[h]||s[h]||a;return r?o.createElement(d,i(i({ref:t},m),{},{components:r})):o.createElement(d,i({ref:t},m))}));function h(e,t){var r=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var a=r.length,i=new Array(a);i[0]=p;var c={};for(var u in t)hasOwnProperty.call(t,u)&&(c[u]=t[u]);c.originalType=e,c.mdxType="string"==typeof e?e:n,i[1]=c;for(var l=2;l<a;l++)i[l]=r[l];return o.createElement.apply(null,i)}return o.createElement.apply(null,r)}p.displayName="MDXCreateElement"},7170:function(e,t,r){r.r(t),r.d(t,{frontMatter:function(){return c},contentTitle:function(){return u},metadata:function(){return l},toc:function(){return m},default:function(){return p}});var o=r(7462),n=r(3366),a=(r(7294),r(3905)),i=["components"],c={sidebar_position:1,sidebar_label:"Introduction"},u="![Sigmadex](/img/sigmadex-logo.png)",l={unversionedId:"Introduction",id:"Introduction",isDocsHomePage:!1,title:"![Sigmadex](/img/sigmadex-logo.png)",description:"Welcome to the Sigmadex Smart Contract documentation- A Swap/Pool/Farm decentralized exchange and home of the SDEX token. Through the use of a novel penalty/reward system, this protocol targets a systemic issue in the current DEX ecosystem- the prevalence of the farm & dump protocol; the lack of incentive to stake for the long term and to continue using it the platform as it ages. The focus of these documents is to describe in detail the structure and functioning of the protocol, its various subsystems, how they work together and provide an API Reference to the smart contracts themselves.",source:"@site/docs/Introduction.md",sourceDirName:".",slug:"/Introduction",permalink:"v0-proto/docs/Introduction",editUrl:"https://github.com/Sigmadex/v0-proto/docs/Introduction.md",tags:[],version:"current",sidebarPosition:1,frontMatter:{sidebar_position:1,sidebar_label:"Introduction"},sidebar:"tutorialSidebar",next:{title:"Protocol Overview",permalink:"v0-proto/docs/Protocol Overview/Protocol Overview"}},m=[{value:"Protocol Overview",id:"protocol-overview",children:[],level:2},{value:"System Overview",id:"system-overview",children:[],level:2},{value:"API Reference",id:"api-reference",children:[],level:2}],s={toc:m};function p(e){var t=e.components,c=(0,n.Z)(e,i);return(0,a.kt)("wrapper",(0,o.Z)({},s,c,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h1",{id:"sigmadex"},(0,a.kt)("img",{alt:"Sigmadex",src:r(6183).Z})),(0,a.kt)("p",null,"Welcome to the Sigmadex Smart Contract documentation- A Swap/Pool/Farm decentralized exchange and home of the SDEX token. Through the use of a novel penalty/reward system, this protocol targets a systemic issue in the current DEX ecosystem- the prevalence of the farm & dump protocol; the lack of incentive to stake for the long term and to continue using it the platform as it ages. The focus of these documents is to describe in detail the structure and functioning of the protocol, its various subsystems, how they work together and provide an API Reference to the smart contracts themselves."),(0,a.kt)("h2",{id:"protocol-overview"},(0,a.kt)("a",{parentName:"h2",href:"Protocol%20Overview/Protocol%20Overview"},"Protocol Overview")),(0,a.kt)("p",null,"The Protocol Overview Section Concerns the general functions of the Protocol, specifically how they relate from the perspective of the end user"),(0,a.kt)("h2",{id:"system-overview"},(0,a.kt)("a",{parentName:"h2",href:"System%20Overview/System%20Overview"},"System Overview")),(0,a.kt)("p",null,"The System Overview Section Concerns the internal structure of the various subsystems and how they come together to provide the features described in the Protocol Overview"),(0,a.kt)("h2",{id:"api-reference"},(0,a.kt)("a",{parentName:"h2",href:"Api%20Specification/Diamond"},"API Reference")),(0,a.kt)("p",null,"The API Reference Section Concerns a function by function description and explanation of the protocol"))}p.isMDXComponent=!0},6183:function(e,t){t.Z="data:image/png;base64,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"}}]);