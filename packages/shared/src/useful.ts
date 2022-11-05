export function cloneDeep<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function classes(...args: Array<string | boolean>): string {
  return args.filter(Boolean).join(' ');
}

export function filter(...args: Array<string | boolean>[]): string {
  return args.filter(Boolean).join(' ');
}

export function formatPhoneNumber(number: string) {
  if (!number) return number;
  return number.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
}

// function to capitalize the first letter of each word in a string
export function capitalize(str: string) {
  if (!str) return str;
  str = str.replace(/_|-/g, ' ');
  const words = str.split(' ');
  return words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
}

export function shuffleArray<T>(array: T[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function parseBool(value: any): boolean {
  if (typeof value === 'boolean') return value;
  if (value.toLowerCase() === 'true') return true;
  if (value.toLowerCase() === 'false') return false;
  throw new Error(`Invalid boolean value: ${value}`);
}

export function boolYesNo(value: boolean): string {
  return value ? 'Yes' : 'No';
}

export function zeroPad(num: number, places: number) {
  return String(num).padStart(places, '0');
}

export function formatMoney(n: number | string) {
  if (!n) return '$0.00';
  return n.toLocaleString('en-us', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
}

export function isEmpty(obj: any): boolean {
  if (obj === null || obj === undefined) return true;
  if (typeof obj === 'string' && obj.trim().length === 0) return true;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
}

export function cleanBool(prop: string) {
  if (!prop) return null;
  return prop;
}

export function scrubString(prop: string) {
  if (!prop) return null;
  return prop.replace(/[^a-zA-Z0-9]/g, '-');
}

export function cleanString(prop: string) {
  if (!prop) return null;
  prop = prop.toLowerCase().replace(/[0-9]/g, '');
  return prop.replace(/[^a-z]/g, '-');
}

export function downloadBlobAsFile(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(new Blob([blob]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
}

export async function downloadFileFromLink(url: string, filename: string) {
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  link.setAttribute('target', '_blank');
  document.body.appendChild(link);
  link.click();
}

// recursive function to clean null values from an object
export function cleanNullFromObject<T>(obj: T): T {
  // console.log(obj);
  if (typeof obj === 'object') {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (obj[key] === null) {
          delete obj[key];
        } else if (typeof obj[key] === 'object') {
          cleanNullFromObject(obj[key]);
        }
      }
    }
  }
  return obj;
}

export function encodeQuery(data: any): string {
  let query = '';
  for (let d in data) query += encodeURIComponent(d) + '=' + encodeURIComponent(data[d]) + '&';
  return query.slice(0, -1);
}

export type DeepPartial<T> = T extends never[] | Date | RegExp | Function | undefined
  ? T
  : {
      [P in keyof T]?: DeepPartial<T[P]>;
    };

export type DeepUnPartial<T> = T extends never[] | Date | RegExp | Function | undefined
  ? Required<T>
  : Required<{
      [P in keyof T]: Required<DeepUnPartial<T[P]>>;
    }>;

type Literal = { [k: string]: {} };

export type Stringify<T> = T extends Array<infer U>
  ? U extends Literal
    ? Array<Stringify<U>>
    : string
  : T extends Date
  ? string
  : T extends object
  ? { [Key in keyof T]: Stringify<T[Key]> }
  : string;

export type FormPattern<T> = {
  form: DeepPartial<T>;
  formRef?: React.MutableRefObject<DeepPartial<T>>;
  errors?: Stringify<DeepPartial<T>>;
  update<P extends keyof FormPattern<T>['form']>(v: FormPattern<T>['form'][P], k: keyof FormPattern<T>['form']): void;
  updateError?<P extends keyof FormPattern<T>['errors']>(
    v: FormPattern<T>['errors'][P],
    k: keyof FormPattern<T>['errors'],
  ): void;
};

export type Form<T> = DeepPartial<T>;
export type FormErrors<T> = Stringify<DeepPartial<T>>;

export function ordinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function sOrNot(n: number) {
  return n === 1 ? '' : 's';
}

export function renderMonthObject(month: number, year: number) {
  const prevMonth = getDaysInMonth(month === 0 ? 11 : month - 1, month === 0 ? year - 1 : year);
  const currentMonth = getDaysInMonth(month, year);
  const nextMonth = getDaysInMonth(month === 11 ? 0 : month + 1, month === 11 ? year + 1 : year);
  const firstDayOfMonth = currentMonth[0].getDay(); // 0 = Sunday, 1 = Monday, etc.
  const prevMonthDays = prevMonth.slice(
    !firstDayOfMonth ? prevMonth.length - 6 : prevMonth.length - firstDayOfMonth + 1,
  );
  const nextMonthDays = nextMonth.slice(0, 42 - prevMonthDays.length - currentMonth.length);
  return [...prevMonthDays, ...currentMonth, ...nextMonthDays];
}

export function getDaysInMonth(month: number, year: number): Date[] {
  const date = new Date(year, month, 1);
  let days = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

export function isValidDate(date: any) {
  return date && Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date);
}

export function sameDay(d1: Date, d2: Date) {
  d1 = new Date(d1);
  d2 = new Date(d2);
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

// function to recursively check if an object with nested objects is empty
export function objEmpty(obj: any): boolean {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'object' && Object.keys(obj[key]).length) {
        return objEmpty(obj[key]);
      }
      if (typeof obj[key] === 'object' && !Object.keys(obj[key]).length) continue;
      if (obj[key] !== null && obj[key] !== undefined) {
        return false;
      }
    }
  }
  return true;
}

export function afterFinalSlash(prop: string) {
  if (!prop) return null;
  const split = prop.split('/');
  return split[split.length - 1];
}

export function beforeFirstSlash(prop: string) {
  if (!prop) return null;
  const split = prop.split('/');
  return split[0];
}

export function beforeLastSlash(prop: string) {
  if (!prop) return null;
  const split = prop.split('/');
  return split[split.length - 2];
}

export function arrayOfNLength(n: number) {
  return Array.from({ length: n }, (v, i) => i);
}

// function to convert bytes to human readable size
export function bytes(size: number = 0) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  let i = 0;
  while (size >= 1000) {
    size /= 1000;
    i++;
  }
  return size.toFixed(1) + ' ' + units[i];
}

// function to convert seconds to human readable time
export function time(seconds: number) {
  seconds = Math.round(seconds * 10) / 10;
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const years = Math.floor(days / 365);
  const months = Math.floor(years / 12);
  const daysRemaining = days % 365;
  const hoursRemaining = hours % 24;
  const minutesRemaining = minutes % 60;
  const secondsRemaining = seconds % 60;
  const time = [];
  if (years) time.push(`${years} year${sOrNot(years)}`);
  if (months) time.push(`${months} month${sOrNot(months)}`);
  if (daysRemaining) time.push(`${daysRemaining} day${sOrNot(daysRemaining)}`);
  if (hoursRemaining) time.push(`${hoursRemaining} hour${sOrNot(hoursRemaining)}`);
  if (minutesRemaining) time.push(`${minutesRemaining} minute${sOrNot(minutesRemaining)}`);
  if (secondsRemaining) time.push(`${Math.round(secondsRemaining)} second${sOrNot(secondsRemaining)}`);
  return time.join(', ');
}

export function timeShort(seconds: number) {
  seconds = Math.round(seconds * 10) / 10;
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const years = Math.floor(days / 365);
  const months = Math.floor(years / 12);
  const daysRemaining = days % 365;
  const hoursRemaining = hours % 24;
  const minutesRemaining = minutes % 60;
  const secondsRemaining = seconds % 60;
  const time = [];
  if (years) time.push(`${years}y`);
  if (months) time.push(`${months}m`);
  if (daysRemaining) time.push(`${daysRemaining}d`);
  if (hoursRemaining) time.push(`${hoursRemaining}h`);
  if (minutesRemaining) time.push(`${minutesRemaining}m`);
  if (secondsRemaining) time.push(`${Math.round(secondsRemaining)}s`);
  return time.join(' ');
}

export function formatList(list: Array<string | number>) {
  return list.join(', ');
}

export function formatListAnd(list: Array<string | number>) {
  list = cloneDeep(list);
  const last = list.splice(-1);
  return `${list.join(', ')}${list.length > 1 ? ',' : ''} and ${last}`;
}

export function getFileExtension(file: string) {
  return file.split('.').pop();
}
