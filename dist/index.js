import{h as t}from"hyperapp";function n(t,n){return n&&t.list.push(n),t}function r(t,n=[]){return t.list=t.list.concat(n),t}function e(t,n){return t.tag=n,t.props={},t}function p(t,n){return t.tag=n,t.props={},t}function o(t,n){return t.props={...t.props,...n},t}function u(t,n){return t.props[n]=!0,t}function s(t,n){return t.propname=n,t.props[n]="",t}function i(t,n=!0){return t.props[t.propname]=n,t}function l(t,n){return t.props[t.propname]+=n,t}function c(n){let r;return r="function"==typeof n.tag?n.tag(n.props,[]):t(n.tag,n.props,[]),n.list=n.list.concat(r),n}function a(t){return{list:[],parent:t}}function f(n){let r,e=n.parent;return r="function"==typeof e.tag?e.tag(e.props,n.list):t(e.tag,e.props,n.list),e.list=e.list.concat(r),e}function g(t){return t}const h=t=>" "==t||"\t"==t||"\n"==t||"\r"==t;const d=t=>t;var m=t=>{let m={prev:d,handlers:[]};return((t,d,m)=>{let v,y="",E=0;for(let j=0;j<m.length;j++){for(let r=0;r<m[j].length;r++)v=m[j][r],0==E?"<"==v?E=2:h(v)||(E=1,y=v):1==E?"<"==v?(t(n,y.trimEnd()),y="",E=2):y+=v:2==E?"/"==v?E=3:(E=4,y=v):3==E?">"==v&&(t(f),E=0):4==E?h(v)?(t(p,y),E=5):"/"==v?(t(p,y),E=6):">"==v?(t(p,y),t(a),E=0):y+=v:6==E?">"==v&&(t(c),E=0):5==E?"."==v||("/"==v?E=6:">"==v?(t(a),E=0):h(v)||(y=v,E=7)):7==E?"="==v?(t(s,y),E=8):">"==v?(t(u,y),t(a),E=0):"/"==v?(t(u,y),E=6):h(v)?(t(u,y),E=5):y+=v:8==E?'"'==v&&(E=9,y=""):9==E&&('"'==v?(t(l,y),E=5):y+=v);2==E?(d(e),E=5):1==E?j==m.length-1?(y=y.trimEnd(),t(n,y),y=""):(t(n,y),y="",d(r)):5==E?d(o):8==E?(d(i),E=5):9==E?(t(l,y),d(l),y=""):3==E?d(g):0==E&&j<m.length-1&&d(r)}})((t,n)=>{let r=m.prev;m.prev=e=>t(r(e),n)},t=>{let n=m.prev;m.handlers.push((r,e)=>t(n(r),e)),m.prev=d},t),t=>{let n=m.prev(t.reduce((t,n,r)=>m.handlers[r](t,n),{list:[]})).list;return n.length>1?n:n[0]}};const v={};export default(t,...n)=>(t=>{let n=t.join("|-"),r=v[n];return r||(r=m(t),v[n]=r),r})(t)(n);
