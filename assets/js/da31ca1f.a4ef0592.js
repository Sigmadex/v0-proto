"use strict";(self.webpackChunkdocusaur=self.webpackChunkdocusaur||[]).push([[1398],{3905:function(e,t,n){n.d(t,{Zo:function(){return u},kt:function(){return m}});var r=n(7294);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var d=r.createContext({}),c=function(e){var t=r.useContext(d),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},u=function(e){var t=c(e.components);return r.createElement(d.Provider,{value:t},e.children)},l={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},p=r.forwardRef((function(e,t){var n=e.components,o=e.mdxType,a=e.originalType,d=e.parentName,u=s(e,["components","mdxType","originalType","parentName"]),p=c(n),m=o,h=p["".concat(d,".").concat(m)]||p[m]||l[m]||a;return n?r.createElement(h,i(i({ref:t},u),{},{components:n})):r.createElement(h,i({ref:t},u))}));function m(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var a=n.length,i=new Array(a);i[0]=p;var s={};for(var d in t)hasOwnProperty.call(t,d)&&(s[d]=t[d]);s.originalType=e,s.mdxType="string"==typeof e?e:o,i[1]=s;for(var c=2;c<a;c++)i[c]=n[c];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}p.displayName="MDXCreateElement"},4587:function(e,t,n){n.r(t),n.d(t,{frontMatter:function(){return s},contentTitle:function(){return d},metadata:function(){return c},toc:function(){return u},default:function(){return p}});var r=n(7462),o=n(3366),a=(n(7294),n(3905)),i=["components"],s={sidebar_position:1},d=void 0,c={unversionedId:"Protocol Overview/Rewards/Rewards",id:"Protocol Overview/Rewards/Rewards",isDocsHomePage:!1,title:"Rewards",description:"Sigmadex awards users who successfully complete their staking period without withdrawing with Reward NFT's, which can be applied to various aspects of the platform to receive discounts and bonuses. EverReward NFT has a general structure of what it does, what it can be used on, and how much value its underlying asset it can claim when the time comes for it to be used. Some are multiuse, some are consumable, some deplete based on use.  For example, a {USDT ReducedPenaltyReward} NFT can be applied to any USDT denominated Farm, which provides a maximum penalty reduction amount of 10 USDT, which is only consumed in the event of a premature withdraw.  Sigmadex intends to rollout new NFT's as time moves forward, and, based on demand, add the ability to change their denomination, grow existing NFT's in value, or even polymerize them together into new and exciting combinations of NFTs.",source:"@site/docs/Protocol Overview/Rewards/Rewards.md",sourceDirName:"Protocol Overview/Rewards",slug:"/Protocol Overview/Rewards/Rewards",permalink:"/v0-proto/docs/Protocol Overview/Rewards/Rewards",tags:[],version:"current",sidebarPosition:1,frontMatter:{sidebar_position:1},sidebar:"tutorialSidebar",previous:{title:"Farming",permalink:"/v0-proto/docs/Protocol Overview/Farming"},next:{title:"Reduced Penalty",permalink:"/v0-proto/docs/Protocol Overview/Rewards/Reduced Penalty"}},u=[{value:"Rewards",id:"rewards",children:[{value:"Reduced Penalty",id:"reduced-penalty",children:[],level:3}],level:2}],l={toc:u};function p(e){var t=e.components,n=(0,o.Z)(e,i);return(0,a.kt)("wrapper",(0,r.Z)({},l,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"Sigmadex awards users who successfully complete their staking period without withdrawing with Reward NFT's, which can be applied to various aspects of the platform to receive discounts and bonuses. EverReward NFT has a general structure of what it does, what it can be used on, and how much value its underlying asset it can claim when the time comes for it to be used. Some are multiuse, some are consumable, some deplete based on use.  For example, a {USDT ReducedPenaltyReward} NFT can be applied to any USDT denominated Farm, which provides a maximum penalty reduction amount of 10 USDT, which is only consumed in the event of a premature withdraw.  Sigmadex intends to rollout new NFT's as time moves forward, and, based on demand, add the ability to change their denomination, grow existing NFT's in value, or even polymerize them together into new and exciting combinations of NFTs."),(0,a.kt)("p",null,"Which NFT rewards that are minted upon completion depends on the Token staked, each one on the platform has a list of Valid NFTs.  In V0: the one that is determined is picked by a ",(0,a.kt)("em",{parentName:"p"},"pseudorandom")," generator, though future plans entail delegating this out to ",(0,a.kt)("a",{parentName:"p",href:"https://docs.chain.link/docs/chainlink-vrf/"},"Chainlink VRF"),". So until than, savvy users will be able to techniqually choose which NFT if they so decide."),(0,a.kt)("h2",{id:"rewards"},"Rewards"),(0,a.kt)("h3",{id:"reduced-penalty"},(0,a.kt)("a",{parentName:"h3",href:"./Reduced%20Penalty"},"Reduced Penalty")),(0,a.kt)("p",null,"In the event of a premature withdraw, the penalty is lessened up to the ",(0,a.kt)("inlineCode",{parentName:"p"},"reductionAmount"),", depletes as used, good as insurance"))}p.isMDXComponent=!0}}]);