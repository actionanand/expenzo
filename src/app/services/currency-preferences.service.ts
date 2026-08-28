import { Injectable, computed, signal } from '@angular/core';

export interface CountryCurrencyOption {
  readonly countryCode: string;
  readonly countryName: string;
  readonly currencyCode: string;
}

interface CurrencyPreference {
  readonly countryCode: string;
  readonly currencyCode: string;
}

const STORAGE_KEY = 'expenzo_currency_preference';
const DEFAULT_PREFERENCE: CurrencyPreference = { countryCode: 'IN', currencyCode: 'INR' };

const COUNTRY_CURRENCY_DATA = `
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
LA:LAK LB:LB LC:XCD LI:CHF LK:LKR LR:LRD LS:LSL LT:EUR LU:EUR LV:EUR LY:LYD
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
`;

const regionNames = createDisplayNames('region');
const currencyNames = createDisplayNames('currency');

export const COUNTRY_CURRENCY_OPTIONS: readonly CountryCurrencyOption[] =
  COUNTRY_CURRENCY_DATA.trim()
    .split(/\s+/)
    .map((entry) => {
      const [countryCode, currencyCode] = entry.split(':');
      return {
        countryCode,
        countryName: regionNames?.of(countryCode) ?? countryCode,
        currencyCode,
      };
    })
    .sort((left, right) => left.countryName.localeCompare(right.countryName, 'en'));

export const DISPLAY_CURRENCY_CODES: readonly string[] = [
  ...new Set(COUNTRY_CURRENCY_OPTIONS.map((option) => option.currencyCode)),
].sort((left, right) => currencyLabel(left).localeCompare(currencyLabel(right), 'en'));

const REPRESENTATIVE_COUNTRY_BY_CURRENCY: Readonly<Record<string, string>> = {
  AUD: 'AU',
  CHF: 'CH',
  EUR: 'DE',
  GBP: 'GB',
  ILS: 'IL',
  USD: 'US',
  XAF: 'CM',
  XCD: 'AG',
  XOF: 'SN',
};

@Injectable({ providedIn: 'root' })
export class CurrencyPreferencesService {
  private readonly state = signal<CurrencyPreference>(this.load());

  readonly countryCode = computed(() => this.state().countryCode);
  readonly currencyCode = computed(() => this.state().currencyCode);
  readonly locale = computed(() => localeForCountry(this.countryCode()));

  setCountry(countryCode: string): void {
    const country = countryOption(countryCode);
    if (!country) return;
    this.persist({ countryCode: country.countryCode, currencyCode: country.currencyCode });
  }

  setCurrency(currencyCode: string): void {
    if (!DISPLAY_CURRENCY_CODES.includes(currencyCode)) return;
    const country = countryOptionForCurrency(currencyCode, this.countryCode());
    if (!country) return;
    this.persist({ countryCode: country.countryCode, currencyCode });
  }

  format(value: number, maximumFractionDigits = 0): string {
    try {
      return new Intl.NumberFormat(this.locale(), {
        style: 'currency',
        currency: this.currencyCode(),
        currencyDisplay: 'narrowSymbol',
        minimumFractionDigits: 0,
        maximumFractionDigits,
      }).format(value);
    } catch {
      return `${this.currencyCode()} ${Math.round(value).toLocaleString(this.locale())}`;
    }
  }

  formatForDocument(value: number): string {
    return this.format(value);
  }

  formatCompact(value: number): string {
    try {
      return new Intl.NumberFormat(this.locale(), {
        style: 'currency',
        currency: this.currencyCode(),
        currencyDisplay: 'narrowSymbol',
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(value);
    } catch {
      return this.format(value);
    }
  }

  private load(): CurrencyPreference {
    try {
      const parsed = JSON.parse(
        localStorage.getItem(STORAGE_KEY) ?? '',
      ) as Partial<CurrencyPreference>;
      const country = countryOption(parsed.countryCode ?? '');
      const currency = parsed.currencyCode ?? '';
      if (country && DISPLAY_CURRENCY_CODES.includes(currency)) {
        const matchingCountry = countryOptionForCurrency(currency, country.countryCode);
        if (matchingCountry) {
          return { countryCode: matchingCountry.countryCode, currencyCode: currency };
        }
      }
    } catch {
      // Invalid or unavailable storage falls back to India and INR.
    }
    return DEFAULT_PREFERENCE;
  }

  private persist(preference: CurrencyPreference): void {
    this.state.set(preference);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preference));
    } catch {
      // The in-memory preference still works when storage is unavailable.
    }
  }
}

export function countryOption(countryCode: string): CountryCurrencyOption | undefined {
  return COUNTRY_CURRENCY_OPTIONS.find((option) => option.countryCode === countryCode);
}

export function countryOptionForCurrency(
  currencyCode: string,
  preferredCountryCode?: string,
): CountryCurrencyOption | undefined {
  const matches = COUNTRY_CURRENCY_OPTIONS.filter((option) => option.currencyCode === currencyCode);
  return (
    matches.find((option) => option.countryCode === preferredCountryCode) ??
    matches.find(
      (option) => option.countryCode === REPRESENTATIVE_COUNTRY_BY_CURRENCY[currencyCode],
    ) ??
    matches[0]
  );
}

export function currencyLabel(currencyCode: string): string {
  return currencyNames?.of(currencyCode) ?? currencyCode;
}

export function currencySymbol(currencyCode: string, countryCode: string): string {
  try {
    return (
      new Intl.NumberFormat(localeForCountry(countryCode), {
        style: 'currency',
        currency: currencyCode,
        currencyDisplay: 'narrowSymbol',
        maximumFractionDigits: 0,
      })
        .formatToParts(0)
        .find((part) => part.type === 'currency')?.value ?? currencyCode
    );
  } catch {
    return currencyCode;
  }
}

function localeForCountry(countryCode: string): string {
  return countryCode === 'IN' ? 'en-IN' : `en-${countryCode}`;
}

function createDisplayNames(type: 'region' | 'currency'): Intl.DisplayNames | null {
  try {
    return new Intl.DisplayNames(['en'], { type });
  } catch {
    return null;
  }
}
