"use strict";(self.webpackChunkdocusaur=self.webpackChunkdocusaur||[]).push([[2658],{3905:function(e,t,a){a.d(t,{Zo:function(){return u},kt:function(){return k}});var r=a(7294);function n(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function l(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,r)}return a}function i(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?l(Object(a),!0).forEach((function(t){n(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):l(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function d(e,t){if(null==e)return{};var a,r,n=function(e,t){if(null==e)return{};var a,r,n={},l=Object.keys(e);for(r=0;r<l.length;r++)a=l[r],t.indexOf(a)>=0||(n[a]=e[a]);return n}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(r=0;r<l.length;r++)a=l[r],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(n[a]=e[a])}return n}var o=r.createContext({}),s=function(e){var t=r.useContext(o),a=t;return e&&(a="function"==typeof e?e(t):i(i({},t),e)),a},u=function(e){var t=s(e.components);return r.createElement(o.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},c=r.forwardRef((function(e,t){var a=e.components,n=e.mdxType,l=e.originalType,o=e.parentName,u=d(e,["components","mdxType","originalType","parentName"]),c=s(a),k=n,m=c["".concat(o,".").concat(k)]||c[k]||p[k]||l;return a?r.createElement(m,i(i({ref:t},u),{},{components:a})):r.createElement(m,i({ref:t},u))}));function k(e,t){var a=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var l=a.length,i=new Array(l);i[0]=c;var d={};for(var o in t)hasOwnProperty.call(t,o)&&(d[o]=t[o]);d.originalType=e,d.mdxType="string"==typeof e?e:n,i[1]=d;for(var s=2;s<l;s++)i[s]=a[s];return r.createElement.apply(null,i)}return r.createElement.apply(null,a)}c.displayName="MDXCreateElement"},9882:function(e,t,a){a.r(t),a.d(t,{frontMatter:function(){return d},contentTitle:function(){return o},metadata:function(){return s},toc:function(){return u},default:function(){return c}});var r=a(7462),n=a(3366),l=(a(7294),a(3905)),i=["components"],d={},o="RewardFacet",s={unversionedId:"Api Specification/facets/RewardFacet",id:"Api Specification/facets/RewardFacet",isDocsHomePage:!1,title:"RewardFacet",description:"The  is tasked with minting Reward NFT's upon the withdrawal of a successfully completed stake by a user.",source:"@site/docs/Api Specification/facets/RewardFacet.md",sourceDirName:"Api Specification/facets",slug:"/Api Specification/facets/RewardFacet",permalink:"/v0-proto/docs/Api Specification/facets/RewardFacet",tags:[],version:"current",frontMatter:{}},u=[{value:"Functions",id:"functions",children:[{value:"addReward",id:"addreward",children:[{value:"Declaration",id:"declaration",children:[],level:4},{value:"Modifiers:",id:"modifiers",children:[],level:4},{value:"Args:",id:"args",children:[],level:4}],level:3},{value:"mintReward",id:"mintreward",children:[{value:"Declaration",id:"declaration-1",children:[],level:4},{value:"Modifiers:",id:"modifiers-1",children:[],level:4},{value:"Args:",id:"args-1",children:[],level:4}],level:3},{value:"requestReward",id:"requestreward",children:[{value:"Declaration",id:"declaration-2",children:[],level:4},{value:"Modifiers:",id:"modifiers-2",children:[],level:4},{value:"Args:",id:"args-2",children:[],level:4}],level:3},{value:"requestSdexReward",id:"requestsdexreward",children:[{value:"Declaration",id:"declaration-3",children:[],level:4},{value:"Modifiers:",id:"modifiers-3",children:[],level:4},{value:"Args:",id:"args-3",children:[],level:4}],level:3},{value:"getValidRewardsForToken",id:"getvalidrewardsfortoken",children:[{value:"Declaration",id:"declaration-4",children:[],level:4},{value:"Modifiers:",id:"modifiers-4",children:[],level:4},{value:"Args:",id:"args-4",children:[],level:4},{value:"Returns:",id:"returns",children:[],level:4}],level:3}],level:2}],p={toc:u};function c(e){var t=e.components,a=(0,n.Z)(e,i);return(0,l.kt)("wrapper",(0,r.Z)({},p,a,{components:t,mdxType:"MDXLayout"}),(0,l.kt)("h1",{id:"rewardfacet"},"RewardFacet"),(0,l.kt)("blockquote",null,(0,l.kt)("p",{parentName:"blockquote"},"The {RewardFacet} is tasked with minting Reward NFT's upon the withdrawal of a successfully completed stake by a user.")),(0,l.kt)("h2",{id:"functions"},"Functions"),(0,l.kt)("h3",{id:"addreward"},"addReward"),(0,l.kt)("p",null,"addReward is called by Sigmadex to add an NFT reward to a token that is found in one or more pools.  Many NFT rewards are token specific, A USDT pool will mint a USDT specific reward.  The valid rewards are found in this array"),(0,l.kt)("h4",{id:"declaration"},"Declaration"),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-solidity"},"  function addReward(\n    address tokenAddr,\n    address nftRewardAddr\n  ) public onlyOwner\n")),(0,l.kt)("h4",{id:"modifiers"},"Modifiers:"),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:null},"Modifier"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},"onlyOwner")))),(0,l.kt)("h4",{id:"args"},"Args:"),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:null},"Arg"),(0,l.kt)("th",{parentName:"tr",align:null},"Type"),(0,l.kt)("th",{parentName:"tr",align:null},"Description"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("inlineCode",{parentName:"td"},"tokenAddr")),(0,l.kt)("td",{parentName:"tr",align:null},"address"),(0,l.kt)("td",{parentName:"tr",align:null},"The address of the token this nft (such as USDT)")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("inlineCode",{parentName:"td"},"nftRewardAddr")),(0,l.kt)("td",{parentName:"tr",align:null},"address"),(0,l.kt)("td",{parentName:"tr",align:null},"the address of the NFT reward (such as reduced penalty reward)")))),(0,l.kt)("h3",{id:"mintreward"},"mintReward"),(0,l.kt)("p",null,"The mintReward Function is tasked with choosing a pseudorandom NFT choice from the list of available rewards, and minting it to the user who successfully completed their stake of the specified reward value"),(0,l.kt)("h4",{id:"declaration-1"},"Declaration"),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-solidity"},"  function mintReward(\n    address to,\n    address token,\n    uint256 rewardAmount\n  ) public onlyDiamond\n")),(0,l.kt)("h4",{id:"modifiers-1"},"Modifiers:"),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:null},"Modifier"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},"onlyDiamond")))),(0,l.kt)("h4",{id:"args-1"},"Args:"),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:null},"Arg"),(0,l.kt)("th",{parentName:"tr",align:null},"Type"),(0,l.kt)("th",{parentName:"tr",align:null},"Description"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("inlineCode",{parentName:"td"},"to")),(0,l.kt)("td",{parentName:"tr",align:null},"address"),(0,l.kt)("td",{parentName:"tr",align:null},"The future recipient of the NFT reward (you)")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("inlineCode",{parentName:"td"},"token")),(0,l.kt)("td",{parentName:"tr",align:null},"address"),(0,l.kt)("td",{parentName:"tr",align:null},"The underlying token the NFT rewards (such as USDT)")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("inlineCode",{parentName:"td"},"rewardAmount")),(0,l.kt)("td",{parentName:"tr",align:null},"uint256"),(0,l.kt)("td",{parentName:"tr",align:null},"the amount of the Underlying token this NFT has available to consume (such as 10 USDT)")))),(0,l.kt)("h3",{id:"requestreward"},"requestReward"),(0,l.kt)("p",null,"requestReward is called by the {TokenFarmFacet} and {SdexVaultFacet} upon the withdrawal of a successful position in a given pool by the user.  It is responsibile for calculating what proportion of the penalty pool the user receives in the form of an NFT reward.  The algorithm awards the proportion (timeStaked x amountStaked)/(totalStaked x totalTimeStaked) of the penalties pools current holding."),(0,l.kt)("h4",{id:"declaration-2"},"Declaration"),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-solidity"},"  function requestReward(\n    address to,\n    address token,\n    uint256 blockAmount\n  ) public onlyDiamond\n")),(0,l.kt)("h4",{id:"modifiers-2"},"Modifiers:"),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:null},"Modifier"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},"onlyDiamond")))),(0,l.kt)("h4",{id:"args-2"},"Args:"),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:null},"Arg"),(0,l.kt)("th",{parentName:"tr",align:null},"Type"),(0,l.kt)("th",{parentName:"tr",align:null},"Description"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("inlineCode",{parentName:"td"},"to")),(0,l.kt)("td",{parentName:"tr",align:null},"address"),(0,l.kt)("td",{parentName:"tr",align:null},"the address of the future Reward NFT holder")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("inlineCode",{parentName:"td"},"token")),(0,l.kt)("td",{parentName:"tr",align:null},"address"),(0,l.kt)("td",{parentName:"tr",align:null},"the address of the token being withdrawed (such as USDT)")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("inlineCode",{parentName:"td"},"blockAmount")),(0,l.kt)("td",{parentName:"tr",align:null},"uint256"),(0,l.kt)("td",{parentName:"tr",align:null},"(blocksAhead*amountStaked) the product of the amount staked and how long.  Used to to determine what proportion the user receives from the penalty pool")))),(0,l.kt)("h3",{id:"requestsdexreward"},"requestSdexReward"),(0,l.kt)("p",null,"Internally two penalty pools for Sdex are kept, one for penalties lost on staking Sdex itself, and another for penalites derived from lost block rewards. For example a premature withdraw on USDT-ETH results in a loss of accrued Sdex from block rewards, while an SDEX-ETH pair premature withdraw results in both a loss of accrued block rewards, and the SDEX originally staked as well. requestSdexReward mints NFT rewards based on penalties accrued only from lost block rewards."),(0,l.kt)("h4",{id:"declaration-3"},"Declaration"),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-solidity"},"  function requestSdexReward(\n    address to,\n    uint256 startBlock,\n    uint256 endBlock,\n    uint256 poolAllocPoint,\n    uint256 amountAccumulated\n  ) public onlyDiamond\n")),(0,l.kt)("h4",{id:"modifiers-3"},"Modifiers:"),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:null},"Modifier"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},"onlyDiamond")))),(0,l.kt)("h4",{id:"args-3"},"Args:"),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:null},"Arg"),(0,l.kt)("th",{parentName:"tr",align:null},"Type"),(0,l.kt)("th",{parentName:"tr",align:null},"Description"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("inlineCode",{parentName:"td"},"to")),(0,l.kt)("td",{parentName:"tr",align:null},"address"),(0,l.kt)("td",{parentName:"tr",align:null},"the address of the user receiving the reward")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("inlineCode",{parentName:"td"},"startBlock")),(0,l.kt)("td",{parentName:"tr",align:null},"uint256"),(0,l.kt)("td",{parentName:"tr",align:null},"the block the position started accruing sdex block rewards")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("inlineCode",{parentName:"td"},"endBlock")),(0,l.kt)("td",{parentName:"tr",align:null},"uint256"),(0,l.kt)("td",{parentName:"tr",align:null},"the block the position was commited to")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("inlineCode",{parentName:"td"},"poolAllocPoint")),(0,l.kt)("td",{parentName:"tr",align:null},"uint256"),(0,l.kt)("td",{parentName:"tr",align:null},"the allocation points of the specific pool. Divided by the totalAllocPoint of the farm to determine which proportion of the block rewards go to that pool")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("inlineCode",{parentName:"td"},"amountAccumulated")),(0,l.kt)("td",{parentName:"tr",align:null},"uint256"),(0,l.kt)("td",{parentName:"tr",align:null},"the amount of Sdex this position accrued as block rewards. Divided by the total amound of block rewards for the pool in the same time frame to determine what proportion of the SDEX block rewards pool is given")))),(0,l.kt)("h3",{id:"getvalidrewardsfortoken"},"getValidRewardsForToken"),(0,l.kt)("p",null,"Returns a list of addresses belong to the valid NFT's for a specific token"),(0,l.kt)("h4",{id:"declaration-4"},"Declaration"),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-solidity"},"  function getValidRewardsForToken(\n    address token\n  ) public returns (address[])\n")),(0,l.kt)("h4",{id:"modifiers-4"},"Modifiers:"),(0,l.kt)("p",null,"No modifiers"),(0,l.kt)("h4",{id:"args-4"},"Args:"),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:null},"Arg"),(0,l.kt)("th",{parentName:"tr",align:null},"Type"),(0,l.kt)("th",{parentName:"tr",align:null},"Description"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("inlineCode",{parentName:"td"},"token")),(0,l.kt)("td",{parentName:"tr",align:null},"address"),(0,l.kt)("td",{parentName:"tr",align:null},"the token, such as USDT in question")))),(0,l.kt)("h4",{id:"returns"},"Returns:"),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:null},"Type"),(0,l.kt)("th",{parentName:"tr",align:null},"Description"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("inlineCode",{parentName:"td"},"validRewards")),(0,l.kt)("td",{parentName:"tr",align:null},"an array of NFT addresses that are valid rewards for this token")))))}c.isMDXComponent=!0}}]);