/* eslint-disable */
//prettier-ignore
module.exports = {
name: "@yarnpkg/plugin-unused-resolutions",
factory: function (require) {
"use strict";var plugin=(()=>{var l=Object.defineProperty;var m=Object.getOwnPropertyDescriptor;var d=Object.getOwnPropertyNames;var g=Object.prototype.hasOwnProperty;var u=(o=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(o,{get:(e,r)=>(typeof require<"u"?require:e)[r]}):o)(function(o){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+o+'" is not supported')});var v=(o,e)=>{for(var r in e)l(o,r,{get:e[r],enumerable:!0})},k=(o,e,r,s)=>{if(e&&typeof e=="object"||typeof e=="function")for(let n of d(e))!g.call(o,n)&&n!==r&&l(o,n,{get:()=>e[n],enumerable:!(s=m(e,n))||s.enumerable});return o};var h=o=>k(l({},"__esModule",{value:!0}),o);var L={};v(L,{default:()=>D});var t=u("@yarnpkg/core"),p=u("@yarnpkg/parsers"),y={hooks:{reduceDependency:async(o,e,r,s,{resolver:n,resolveOptions:c})=>{for(let a of e.topLevelWorkspace.manifest.resolutions){let{pattern:i,reference:N}=a;i.from&&(i.from.fullName!==t.structUtils.stringifyIdent(r)||e.configuration.normalizeLocator(t.structUtils.makeLocator(t.structUtils.parseIdent(i.from.fullName),i.from.description??r.reference)).locatorHash!==r.locatorHash)||i.descriptor.fullName!==t.structUtils.stringifyIdent(s)||e.configuration.normalizeDependency(t.structUtils.makeDescriptor(t.structUtils.parseLocator(i.descriptor.fullName),i.descriptor.description??s.range)).descriptorHash!==s.descriptorHash||(a.used=!0)}return o},async afterAllInstalled(o,e){let s=o.topLevelWorkspace.manifest.resolutions.filter(n=>!n.used);if(s.length>0){let n=s.map(({pattern:c,reference:a})=>`- "${(0,p.stringifyResolution)(c)}": "${a}"`).join(`
  `);e.report.reportError(t.MessageName.UNNAMED,`Found ${s.length} unused resolution(s):
  ${n}

These resolutions are defined in package.json but not used by Yarn.
Consider removing them to keep your package.json clean.`)}}}},D=y;return h(L);})();
return plugin;
}
};
