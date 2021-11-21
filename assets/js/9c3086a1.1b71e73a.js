"use strict";(self.webpackChunkdocusaur=self.webpackChunkdocusaur||[]).push([[496],{3905:function(e,t,n){n.d(t,{Zo:function(){return c},kt:function(){return m}});var r=n(7294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var d=r.createContext({}),u=function(e){var t=r.useContext(d),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},c=function(e){var t=u(e.components);return r.createElement(d.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},s=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,d=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),s=u(n),m=a,f=s["".concat(d,".").concat(m)]||s[m]||p[m]||i;return n?r.createElement(f,o(o({ref:t},c),{},{components:n})):r.createElement(f,o({ref:t},c))}));function m(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,o=new Array(i);o[0]=s;var l={};for(var d in t)hasOwnProperty.call(t,d)&&(l[d]=t[d]);l.originalType=e,l.mdxType="string"==typeof e?e:a,o[1]=l;for(var u=2;u<i;u++)o[u]=n[u];return r.createElement.apply(null,o)}return r.createElement.apply(null,n)}s.displayName="MDXCreateElement"},9346:function(e,t,n){n.r(t),n.d(t,{frontMatter:function(){return l},contentTitle:function(){return d},metadata:function(){return u},toc:function(){return c},default:function(){return s}});var r=n(7462),a=n(3366),i=(n(7294),n(3905)),o=["components"],l={},d="RewardAmplifierReward",u={unversionedId:"Api Specification/Rewards/RewardAmplifierReward",id:"Api Specification/Rewards/RewardAmplifierReward",isDocsHomePage:!1,title:"RewardAmplifierReward",description:"the Reduced Penalty Reward NFT provides the user a reduced penalty in the event of a premature withdraw on the position in question.  It comes with a reductionAmount for a specific token (such as USDT), and when applied to a pool containing that token, will provide an increased refund, up to that reduction amount.  Is only consumed in the event of a premature withdraw, so it can make a good insurance policy on that token",source:"@site/docs/Api Specification/Rewards/RewardAmplifierReward.md",sourceDirName:"Api Specification/Rewards",slug:"/Api Specification/Rewards/RewardAmplifierReward",permalink:"/v0-proto/docs/Api Specification/Rewards/RewardAmplifierReward",tags:[],version:"current",frontMatter:{}},c=[{value:"Globals",id:"globals",children:[],level:2},{value:"Modifiers",id:"modifiers",children:[{value:"onlyDiamond",id:"onlydiamond",children:[{value:"Declaration",id:"declaration",children:[],level:4}],level:3}],level:2},{value:"Functions",id:"functions",children:[{value:"constructor",id:"constructor",children:[{value:"Declaration",id:"declaration-1",children:[],level:4},{value:"Modifiers:",id:"modifiers-1",children:[],level:4}],level:3},{value:"mint",id:"mint",children:[{value:"Declaration",id:"declaration-2",children:[],level:4},{value:"Modifiers:",id:"modifiers-2",children:[],level:4},{value:"Args:",id:"args",children:[],level:4}],level:3}],level:2}],p={toc:c};function s(e){var t=e.components,n=(0,a.Z)(e,o);return(0,i.kt)("wrapper",(0,r.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("h1",{id:"rewardamplifierreward"},"RewardAmplifierReward"),(0,i.kt)("blockquote",null,(0,i.kt)("p",{parentName:"blockquote"},"the Reduced Penalty Reward NFT provides the user a reduced penalty in the event of a premature withdraw on the position in question.  It comes with a reductionAmount for a specific token (such as USDT), and when applied to a pool containing that token, will provide an increased refund, up to that reduction amount.  Is only consumed in the event of a premature withdraw, so it can make a good insurance policy on that token")),(0,i.kt)("h2",{id:"globals"},"Globals"),(0,i.kt)("blockquote",null,(0,i.kt)("p",{parentName:"blockquote"},"Note this contains internal vars as well due to a bug in the docgen procedure")),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:null},"Var"),(0,i.kt)("th",{parentName:"tr",align:null},"Type"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"diamond"),(0,i.kt)("td",{parentName:"tr",align:null},"address")))),(0,i.kt)("h2",{id:"modifiers"},"Modifiers"),(0,i.kt)("h3",{id:"onlydiamond"},"onlyDiamond"),(0,i.kt)("p",null,"No description"),(0,i.kt)("h4",{id:"declaration"},"Declaration"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-solidity"},"  modifier onlyDiamond\n")),(0,i.kt)("h2",{id:"functions"},"Functions"),(0,i.kt)("h3",{id:"constructor"},"constructor"),(0,i.kt)("p",null,"No description"),(0,i.kt)("h4",{id:"declaration-1"},"Declaration"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-solidity"},"  function constructor(\n  ) public ERC1155PresetMinterPauser\n")),(0,i.kt)("h4",{id:"modifiers-1"},"Modifiers:"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:null},"Modifier"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"ERC1155PresetMinterPauser")))),(0,i.kt)("h3",{id:"mint"},"mint"),(0,i.kt)("p",null,"Mint is exposed to onlyDiamond to provide the creation of rewards"),(0,i.kt)("h4",{id:"declaration-2"},"Declaration"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-solidity"},"  function mint(\n    address to,\n    uint256 id,\n    uint256 amount,\n    bytes data\n  ) public onlyDiamond\n")),(0,i.kt)("h4",{id:"modifiers-2"},"Modifiers:"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:null},"Modifier"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"onlyDiamond")))),(0,i.kt)("h4",{id:"args"},"Args:"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:null},"Arg"),(0,i.kt)("th",{parentName:"tr",align:null},"Type"),(0,i.kt)("th",{parentName:"tr",align:null},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},(0,i.kt)("inlineCode",{parentName:"td"},"to")),(0,i.kt)("td",{parentName:"tr",align:null},"address"),(0,i.kt)("td",{parentName:"tr",align:null},"address of the user receiving the reward")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},(0,i.kt)("inlineCode",{parentName:"td"},"id")),(0,i.kt)("td",{parentName:"tr",align:null},"uint256"),(0,i.kt)("td",{parentName:"tr",align:null},"the id of the rewaerd being minted")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},(0,i.kt)("inlineCode",{parentName:"td"},"amount")),(0,i.kt)("td",{parentName:"tr",align:null},"uint256"),(0,i.kt)("td",{parentName:"tr",align:null},"the amount of nft's being minted (usually 1)")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},(0,i.kt)("inlineCode",{parentName:"td"},"data")),(0,i.kt)("td",{parentName:"tr",align:null},"bytes"),(0,i.kt)("td",{parentName:"tr",align:null},"metadata of the NFT,")))))}s.isMDXComponent=!0}}]);