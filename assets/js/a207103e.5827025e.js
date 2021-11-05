"use strict";(self.webpackChunkdocusaur=self.webpackChunkdocusaur||[]).push([[312],{3905:function(e,t,n){n.d(t,{Zo:function(){return u},kt:function(){return m}});var a=n(7294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},i=Object.keys(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var c=a.createContext({}),d=function(e){var t=a.useContext(c),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},u=function(e){var t=d(e.components);return a.createElement(c.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},s=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,i=e.originalType,c=e.parentName,u=o(e,["components","mdxType","originalType","parentName"]),s=d(n),m=r,f=s["".concat(c,".").concat(m)]||s[m]||p[m]||i;return n?a.createElement(f,l(l({ref:t},u),{},{components:n})):a.createElement(f,l({ref:t},u))}));function m(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=n.length,l=new Array(i);l[0]=s;var o={};for(var c in t)hasOwnProperty.call(t,c)&&(o[c]=t[c]);o.originalType=e,o.mdxType="string"==typeof e?e:r,l[1]=o;for(var d=2;d<i;d++)l[d]=n[d];return a.createElement.apply(null,l)}return a.createElement.apply(null,n)}s.displayName="MDXCreateElement"},3410:function(e,t,n){n.r(t),n.d(t,{frontMatter:function(){return o},contentTitle:function(){return c},metadata:function(){return d},toc:function(){return u},default:function(){return s}});var a=n(7462),r=n(3366),i=(n(7294),n(3905)),l=["components"],o={},c="AutoSdexFarmFacet",d={unversionedId:"Api Specification/facets/AutoSdexFarmFacet",id:"Api Specification/facets/AutoSdexFarmFacet",isDocsHomePage:!1,title:"AutoSdexFarmFacet",description:"The Native token vault (pid=0) has a special feature that can automatically reinvest Sdex farmed.  This Facet Is Internal to the Diamond, coordinating the restaking by the",source:"@site/docs/Api Specification/facets/AutoSdexFarmFacet.md",sourceDirName:"Api Specification/facets",slug:"/Api Specification/facets/AutoSdexFarmFacet",permalink:"/v0-proto/docs/Api Specification/facets/AutoSdexFarmFacet",tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"ReducedPenaltyReward",permalink:"/v0-proto/docs/Api Specification/Rewards/ReducedPenaltyReward"},next:{title:"DiamondCutFacet",permalink:"/v0-proto/docs/Api Specification/facets/DiamondCutFacet"}},u=[{value:"Functions",id:"functions",children:[{value:"enterStaking",id:"enterstaking",children:[{value:"Declaration",id:"declaration",children:[],level:4},{value:"Modifiers:",id:"modifiers",children:[],level:4},{value:"Args:",id:"args",children:[],level:4}],level:3},{value:"leaveStaking",id:"leavestaking",children:[{value:"Declaration",id:"declaration-1",children:[],level:4},{value:"Modifiers:",id:"modifiers-1",children:[],level:4},{value:"Args:",id:"args-1",children:[],level:4}],level:3}],level:2},{value:"Events",id:"events",children:[{value:"Deposit",id:"deposit",children:[],level:3},{value:"Withdraw",id:"withdraw",children:[],level:3}],level:2}],p={toc:u};function s(e){var t=e.components,n=(0,r.Z)(e,l);return(0,i.kt)("wrapper",(0,a.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("h1",{id:"autosdexfarmfacet"},"AutoSdexFarmFacet"),(0,i.kt)("blockquote",null,(0,i.kt)("p",{parentName:"blockquote"},"The Native token vault (pid=0) has a special feature that can automatically reinvest Sdex farmed.  This Facet Is Internal to the Diamond, coordinating the restaking by the {SdexVaultFacet}")),(0,i.kt)("h2",{id:"functions"},"Functions"),(0,i.kt)("h3",{id:"enterstaking"},"enterStaking"),(0,i.kt)("p",null,"Enter Staking is called by by the Vault to reinvest any Sdex it has accrued into the pool"),(0,i.kt)("h4",{id:"declaration"},"Declaration"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-solidity"},"  function enterStaking(\n    uint256 amount\n  ) public onlyDiamond\n")),(0,i.kt)("h4",{id:"modifiers"},"Modifiers:"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:null},"Modifier"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"onlyDiamond")))),(0,i.kt)("h4",{id:"args"},"Args:"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:null},"Arg"),(0,i.kt)("th",{parentName:"tr",align:null},"Type"),(0,i.kt)("th",{parentName:"tr",align:null},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},(0,i.kt)("inlineCode",{parentName:"td"},"amount")),(0,i.kt)("td",{parentName:"tr",align:null},"uint256"),(0,i.kt)("td",{parentName:"tr",align:null},"The amount of Sdex to be invested into the Sdex Pool (pid=0)")))),(0,i.kt)("h3",{id:"leavestaking"},"leaveStaking"),(0,i.kt)("p",null,"leave staking coordinates the {SdexVaultFacets} removal of funds from the pool to distribute to users or too recollect prior to restaking"),(0,i.kt)("h4",{id:"declaration-1"},"Declaration"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-solidity"},"  function leaveStaking(\n    uint256 amount\n  ) public onlyDiamond\n")),(0,i.kt)("h4",{id:"modifiers-1"},"Modifiers:"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:null},"Modifier"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"onlyDiamond")))),(0,i.kt)("h4",{id:"args-1"},"Args:"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:null},"Arg"),(0,i.kt)("th",{parentName:"tr",align:null},"Type"),(0,i.kt)("th",{parentName:"tr",align:null},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},(0,i.kt)("inlineCode",{parentName:"td"},"amount")),(0,i.kt)("td",{parentName:"tr",align:null},"uint256"),(0,i.kt)("td",{parentName:"tr",align:null},"The amount of funds the {SdexVaultFacet} withdraws from the Sdex pool (pid=1)")))),(0,i.kt)("h2",{id:"events"},"Events"),(0,i.kt)("h3",{id:"deposit"},"Deposit"),(0,i.kt)("p",null,"No description"),(0,i.kt)("h3",{id:"withdraw"},"Withdraw"),(0,i.kt)("p",null,"No description"))}s.isMDXComponent=!0}}]);