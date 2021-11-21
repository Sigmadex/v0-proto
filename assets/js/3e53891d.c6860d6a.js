"use strict";(self.webpackChunkdocusaur=self.webpackChunkdocusaur||[]).push([[5829],{3905:function(e,t,n){n.d(t,{Zo:function(){return h},kt:function(){return d}});var r=n(7294);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var c=r.createContext({}),l=function(e){var t=r.useContext(c),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},h=function(e){var t=l(e.components);return r.createElement(c.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},p=r.forwardRef((function(e,t){var n=e.components,o=e.mdxType,a=e.originalType,c=e.parentName,h=s(e,["components","mdxType","originalType","parentName"]),p=l(n),d=o,f=p["".concat(c,".").concat(d)]||p[d]||u[d]||a;return n?r.createElement(f,i(i({ref:t},h),{},{components:n})):r.createElement(f,i({ref:t},h))}));function d(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var a=n.length,i=new Array(a);i[0]=p;var s={};for(var c in t)hasOwnProperty.call(t,c)&&(s[c]=t[c]);s.originalType=e,s.mdxType="string"==typeof e?e:o,i[1]=s;for(var l=2;l<a;l++)i[l]=n[l];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}p.displayName="MDXCreateElement"},4650:function(e,t,n){n.r(t),n.d(t,{frontMatter:function(){return s},contentTitle:function(){return c},metadata:function(){return l},toc:function(){return h},default:function(){return p}});var r=n(7462),o=n(3366),a=(n(7294),n(3905)),i=["components"],s={},c=void 0,l={unversionedId:"Protocol Overview/Protocol Overview",id:"Protocol Overview/Protocol Overview",isDocsHomePage:!1,title:"Protocol Overview",description:"At a high level, Sigmadex is a simple extension of the Swap/Pool/Farm Decentralized Exchange model one may be familiar with from the likes of PancakeSwap and SushiSwap.  When one arrives at the platform, they can expect to see the usual interface that allows one to swap tokens, add liquidity in exchange for liquidity tokens, and interact with an interface that allows themselves to stake these variety of tokens in farms in exchange for the native platform token SDEX, which holds stake in its governance system.",source:"@site/docs/Protocol Overview/Protocol Overview.md",sourceDirName:"Protocol Overview",slug:"/Protocol Overview/Protocol Overview",permalink:"/v0-proto/docs/Protocol Overview/Protocol Overview",tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"Introduction",permalink:"/v0-proto/docs/Introduction"},next:{title:"Farming",permalink:"/v0-proto/docs/Protocol Overview/Farming"}},h=[{value:"Farming",id:"farming",children:[],level:3},{value:"Rewards",id:"rewards",children:[],level:3},{value:"Governance",id:"governance",children:[],level:3}],u={toc:h};function p(e){var t=e.components,n=(0,o.Z)(e,i);return(0,a.kt)("wrapper",(0,r.Z)({},u,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"At a high level, Sigmadex is a simple extension of the Swap/Pool/Farm Decentralized Exchange model one may be familiar with from the likes of ",(0,a.kt)("a",{parentName:"p",href:"https://pancakeswap.finance"},"PancakeSwap")," and ",(0,a.kt)("a",{parentName:"p",href:"https://sushi.com"},"SushiSwap"),".  When one arrives at the platform, they can expect to see the usual interface that allows one to swap tokens, add liquidity in exchange for liquidity tokens, and interact with an interface that allows themselves to stake these variety of tokens in farms in exchange for the native platform token SDEX, which holds stake in its governance system."),(0,a.kt)("p",null,'The extension to this standard protocol structure we have chosen to add was not without much diliberation.  As we\'ve seen the ecosystem advance, the common trend of the "Farm Snipe and Dump Degen Strategy" and the moniker of  "Ponzi Farm" has become more widespread.  Not without good reason- the majority of Farms today are not equipped with an appropriate incentive structure that either motivates or inspires confidance in long term strategies.  Constant token inflation, providing exit liquidity to whales in token buybacks and ever falling APY\'s all contribute to the overarching tendency to gamble on a farm early, and to dump when the growth slows down.'),(0,a.kt)("p",null,"Our answer to the question of providing these incentives at Sigmadex has come in the form of a time staking system in which users set how long they are willing to commit to staking in a farm.  If they withdraw before this time is up, they are penalized for the proportion of time they have remaining, and if they make it through, they are rewarded with additional tokens from the pool  of accrued  penalties in the form of reward NFTs that give enhanced utility on the platform when using it again. Naturally, those who commit to a longer time receive a greater reward at the end.  These rewards are funded from the pool of penalities that accumulate, creating increased incentives for users to stay staked as more users choose to liquiditate."),(0,a.kt)("p",null,"For Version 0: we are exposing the Farm For users to stake various type of tokens as a way to source liquidity from the community for the launch of the Swap and Pool functionality, provide a means of initially allocating the SDEX token beyond the TGE, and provide an opportunity for users to earn some Gen 0 NFTs. The proceeding sections will cover how Depositing and withdrawing from a farm and the vault works, how the penalties and rewards are calculated, and an overview of the Gen0 NFTs. "),(0,a.kt)("h3",{id:"farming"},(0,a.kt)("a",{parentName:"h3",href:"./Farming"},"Farming")),(0,a.kt)("p",null,"Information about Depositing, Accruing Rewards, Withdrawing, The Vault"),(0,a.kt)("h3",{id:"rewards"},(0,a.kt)("a",{parentName:"h3",href:"./Rewards/Rewards"},"Rewards")),(0,a.kt)("p",null,"Descriptions of how Rewards work and the various ones currently available"),(0,a.kt)("h3",{id:"governance"},(0,a.kt)("a",{parentName:"h3",href:"./Governance"},"Governance")),(0,a.kt)("p",null,"How one can engage and participate in governance, the scope and how the voting works"))}p.isMDXComponent=!0}}]);