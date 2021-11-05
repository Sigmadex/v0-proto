"use strict";(self.webpackChunkdocusaur=self.webpackChunkdocusaur||[]).push([[306],{3905:function(e,t,n){n.d(t,{Zo:function(){return u},kt:function(){return m}});var r=n(7294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var c=r.createContext({}),d=function(e){var t=r.useContext(c),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},u=function(e){var t=d(e.components);return r.createElement(c.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},s=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,c=e.parentName,u=o(e,["components","mdxType","originalType","parentName"]),s=d(n),m=a,f=s["".concat(c,".").concat(m)]||s[m]||p[m]||i;return n?r.createElement(f,l(l({ref:t},u),{},{components:n})):r.createElement(f,l({ref:t},u))}));function m(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,l=new Array(i);l[0]=s;var o={};for(var c in t)hasOwnProperty.call(t,c)&&(o[c]=t[c]);o.originalType=e,o.mdxType="string"==typeof e?e:a,l[1]=o;for(var d=2;d<i;d++)l[d]=n[d];return r.createElement.apply(null,l)}return r.createElement.apply(null,n)}s.displayName="MDXCreateElement"},5543:function(e,t,n){n.r(t),n.d(t,{frontMatter:function(){return o},contentTitle:function(){return c},metadata:function(){return d},toc:function(){return u},default:function(){return s}});var r=n(7462),a=n(3366),i=(n(7294),n(3905)),l=["components"],o={},c="DiamondInit",d={unversionedId:"Api Specification/upgradeInitializers/DiamondInit",id:"Api Specification/upgradeInitializers/DiamondInit",isDocsHomePage:!1,title:"DiamondInit",description:"Holds the initialization function for SDEX's internal state, which is defined in",source:"@site/docs/Api Specification/upgradeInitializers/DiamondInit.md",sourceDirName:"Api Specification/upgradeInitializers",slug:"/Api Specification/upgradeInitializers/DiamondInit",permalink:"/v0-proto/docs/Api Specification/upgradeInitializers/DiamondInit",tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"MockERC20",permalink:"/v0-proto/docs/Api Specification/mocks/MockERC20"}},u=[{value:"Globals",id:"globals",children:[],level:2},{value:"Functions",id:"functions",children:[{value:"init",id:"init",children:[{value:"Declaration",id:"declaration",children:[],level:4},{value:"Modifiers:",id:"modifiers",children:[],level:4},{value:"Args:",id:"args",children:[],level:4}],level:3}],level:2}],p={toc:u};function s(e){var t=e.components,n=(0,a.Z)(e,l);return(0,i.kt)("wrapper",(0,r.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("h1",{id:"diamondinit"},"DiamondInit"),(0,i.kt)("blockquote",null,(0,i.kt)("p",{parentName:"blockquote"},"Holds the initialization function for SDEX's internal state, which is defined in {AppStorage}")),(0,i.kt)("h2",{id:"globals"},"Globals"),(0,i.kt)("blockquote",null,(0,i.kt)("p",{parentName:"blockquote"},"Note this contains internal vars as well due to a bug in the docgen procedure")),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:null},"Var"),(0,i.kt)("th",{parentName:"tr",align:null},"Type"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"s"),(0,i.kt)("td",{parentName:"tr",align:null},"struct AppStorage")))),(0,i.kt)("h2",{id:"functions"},"Functions"),(0,i.kt)("h3",{id:"init"},"init"),(0,i.kt)("p",null,"called during deployment to intialize SDEX variables for the {SdexFacet} native governance token, the {TokenFarmFacet} yield farm, the {SdexVaultFacet}"),(0,i.kt)("h4",{id:"declaration"},"Declaration"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-solidity"},"  function init(\n    address reducedPenaltyReward,\n    bytes4 _withdrawSelector,\n    bytes4 _vaultWithdrawSelector,\n    bytes4 _rewardSelector\n  ) external\n")),(0,i.kt)("h4",{id:"modifiers"},"Modifiers:"),(0,i.kt)("p",null,"No modifiers"),(0,i.kt)("h4",{id:"args"},"Args:"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:null},"Arg"),(0,i.kt)("th",{parentName:"tr",align:null},"Type"),(0,i.kt)("th",{parentName:"tr",align:null},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},(0,i.kt)("inlineCode",{parentName:"td"},"reducedPenaltyReward")),(0,i.kt)("td",{parentName:"tr",align:null},"address"),(0,i.kt)("td",{parentName:"tr",align:null},"address, will be array of GEN0 NFT soon")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},(0,i.kt)("inlineCode",{parentName:"td"},"_withdrawSelector")),(0,i.kt)("td",{parentName:"tr",align:null},"bytes4"),(0,i.kt)("td",{parentName:"tr",align:null},"function signature of the reduced penalty withdraw function.  will be array of GEN0 NFT withdraw function selectors soon")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},(0,i.kt)("inlineCode",{parentName:"td"},"_vaultWithdrawSelector")),(0,i.kt)("td",{parentName:"tr",align:null},"bytes4"),(0,i.kt)("td",{parentName:"tr",align:null},"fn selectors for vault withdraw")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},(0,i.kt)("inlineCode",{parentName:"td"},"_rewardSelector")),(0,i.kt)("td",{parentName:"tr",align:null},"bytes4"),(0,i.kt)("td",{parentName:"tr",align:null},"fn selectors for reward function")))))}s.isMDXComponent=!0}}]);