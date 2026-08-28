import{M as i,ba as y,eb as o}from"./chunk-UEU5EJKW.js";var a="expenzo_currency_preference",U={countryCode:"IN",currencyCode:"INR"},d=`
AD:EUR AE:AED AF:AFN AG:XCD AL:ALL AM:AMD AO:AOA AR:ARS AT:EUR AU:AUD AZ:AZN
BA:BAM BB:BBD BD:BDT BE:EUR BF:XOF BG:BGN BH:BHD BI:BIF BJ:XOF BN:BND BO:BOB BR:BRL BS:BSD BT:BTN BW:BWP BY:BYN BZ:BZD
CA:CAD CD:CDF CF:XAF CG:XAF CH:CHF CI:XOF CL:CLP CM:XAF CN:CNY CO:COP CR:CRC CU:CUP CV:CVE CY:EUR CZ:CZK
DE:EUR DJ:DJF DK:DKK DM:XCD DO:DOP DZ:DZD
EC:USD EE:EUR EG:EGP ER:ERN ES:EUR ET:ETB
FI:EUR FJ:FJD FM:USD FR:EUR
GA:XAF GB:GBP GD:XCD GE:GEL GH:GHS GM:GMD GN:GNF GQ:XAF GR:EUR GT:GTQ GW:XOF GY:GYD
HK:HKD HN:HNL HR:EUR HT:HTG HU:HUF
ID:IDR IE:EUR IL:ILS IN:INR IQ:IQD IR:IRR IS:ISK IT:EUR
JM:JMD JO:JOD JP:JPY
KE:KES KG:KGS KH:KHR KI:AUD KM:KMF KN:XCD KP:KPW KR:KRW KW:KWD KZ:KZT
LA:LAK LB:LBP LC:XCD LI:CHF LK:LKR LR:LRD LS:LSL LT:EUR LU:EUR LV:EUR LY:LYD
MA:MAD MC:EUR MD:MDL ME:EUR MG:MGA MH:USD MK:MKD ML:XOF MM:MMK MN:MNT MR:MRU MT:EUR MU:MUR MV:MVR MW:MWK MX:MXN MY:MYR MZ:MZN
NA:NAD NE:XOF NG:NGN NI:NIO NL:EUR NO:NOK NP:NPR NR:AUD NZ:NZD
OM:OMR
PA:PAB PE:PEN PG:PGK PH:PHP PK:PKR PL:PLN PS:ILS PT:EUR PW:USD PY:PYG
QA:QAR
RO:RON RS:RSD RU:RUB RW:RWF
SA:SAR SB:SBD SC:SCR SD:SDG SE:SEK SG:SGD SI:EUR SK:EUR SL:SLE SM:EUR SN:XOF SO:SOS SR:SRD SS:SSP ST:STN SV:USD SY:SYP SZ:SZL
TD:XAF TG:XOF TH:THB TJ:TJS TL:USD TM:TMT TN:TND TO:TOP TR:TRY TT:TTD TV:AUD TW:TWD TZ:TZS
UA:UAH UG:UGX US:USD UY:UYU UZ:UZS
VA:EUR VC:XCD VE:VES VN:VND VU:VUV
WS:WST XK:EUR
YE:YER
ZA:ZAR ZM:ZMW ZW:USD
`,l=E("region"),A=E("currency"),c=d.trim().split(/\s+/).map(e=>{let[r,t]=e.split(":");return{countryCode:r,countryName:l?.of(r)??r,currencyCode:t}}).filter(e=>/^[A-Z]{2}$/.test(e.countryCode)&&/^[A-Z]{3}$/.test(e.currencyCode)).sort((e,r)=>e.countryName.localeCompare(r.countryName,"en")),s=[...new Set(c.map(e=>e.currencyCode))].sort((e,r)=>S(e).localeCompare(S(r),"en")),m={AUD:"AU",CHF:"CH",EUR:"DE",GBP:"GB",ILS:"IL",USD:"US",XAF:"CM",XCD:"AG",XOF:"SN"},C=class e{state=y(this.load());countryCode=o(()=>this.state().countryCode);currencyCode=o(()=>this.state().currencyCode);locale=o(()=>N(this.countryCode()));setCountry(r){let t=D(r);t&&this.persist({countryCode:t.countryCode,currencyCode:t.currencyCode})}setCurrency(r){if(!s.includes(r))return;let t=R(r,this.countryCode());t&&this.persist({countryCode:t.countryCode,currencyCode:r})}format(r,t=0){try{return new Intl.NumberFormat(this.locale(),{style:"currency",currency:this.currencyCode(),currencyDisplay:"narrowSymbol",minimumFractionDigits:0,maximumFractionDigits:t}).format(r)}catch{return`${this.currencyCode()} ${Math.round(r).toLocaleString(this.locale())}`}}formatForDocument(r){return this.format(r)}formatCompact(r){try{return new Intl.NumberFormat(this.locale(),{style:"currency",currency:this.currencyCode(),currencyDisplay:"narrowSymbol",notation:"compact",maximumFractionDigits:1}).format(r)}catch{return this.format(r)}}load(){try{let r=JSON.parse(localStorage.getItem(a)??""),t=D(r.countryCode??""),n=r.currencyCode??"";if(t&&s.includes(n)){let u=R(n,t.countryCode);if(u)return{countryCode:u.countryCode,currencyCode:n}}}catch{}return U}persist(r){this.state.set(r);try{localStorage.setItem(a,JSON.stringify(r))}catch{}}static \u0275fac=function(t){return new(t||e)};static \u0275prov=i({token:e,factory:e.\u0275fac,providedIn:"root"})};function D(e){return c.find(r=>r.countryCode===e)}function R(e,r){let t=c.filter(n=>n.currencyCode===e);return t.find(n=>n.countryCode===r)??t.find(n=>n.countryCode===m[e])??t[0]}function S(e){try{return A?.of(e)??e}catch{return e}}function B(e,r){try{return new Intl.NumberFormat(N(r),{style:"currency",currency:e,currencyDisplay:"narrowSymbol",maximumFractionDigits:0}).formatToParts(0).find(t=>t.type==="currency")?.value??e}catch{return e}}function N(e){return e==="IN"?"en-IN":`en-${e}`}function E(e){try{return new Intl.DisplayNames(["en"],{type:e})}catch{return null}}export{c as a,s as b,C as c,S as d,B as e};
