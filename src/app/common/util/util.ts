import { BinaryField, ListNodeFieldType, MicronodeFieldMap, MicronodeFieldType, NodeFieldType } from '../models/node.model';

// Pure functions for utility

/**
 * Retrieves all values of an object as an array.
 * @param object Any object
 */
export function hashValues<T>(object: { [key: string]: T } | { [key: number]: T }): T[] {
    return Object.keys(object).map(key => object[key]);
}

/**
 * Checks if the provided field is an image field.
 */
export function isImageField(field: BinaryField): boolean {
    return field && field.mimeType.startsWith('image/');
}

/**
 * Checks if a value is not null or undefined.
 * @example
 *     appState.select(state => state.possiblyUndefinedValue)
 *         .filter(notNullOrUndefined)
 */
export function notNullOrUndefined<T extends string | number | boolean | object>(input: T | null | undefined): input is T;
export function notNullOrUndefined(input: boolean[]): input is boolean[];
export function notNullOrUndefined(input: number[]): input is number[];
export function notNullOrUndefined(input: string[]): input is string[];
export function notNullOrUndefined(input: any): boolean {
    return input != null;
}

/**
 * Checks if all values of an array are equal (by reference).
 * @example
 *     appState.select(state => state.possiblyUndefinedValue)
 *         .distinctUntilChanged(arrayContentsEqual)
 */
export function arrayContentsEqual<T>(a: T[], b: T[]): boolean {
    return a === b || a && b && a.length === b.length && a.every((value, index) => b[index] === value);
}


/**
 * Returns the extension of a filename.
 */
export function filenameExtension(filename: string): string {
    const index = filename.lastIndexOf('.');
    if (index < 0) {
        return '';
    } else {
        return filename.substring(index);
    }
}

/**
 * Creates an query string from the provided object.
 * Uses all properties from the object that are not undefined or null.
 * This will prepend an '?' if at least one valid property is found.
 *
 * TODO Add url encode or use angular URLSearchParams
 */
export function queryString(obj: any): string {
    let qs = Object.keys(obj).reduce<string[]>((query, key) => {
        const val = obj[key];
        if (val !== undefined && val !== null) {
            query.push(`${key}=${val}`);
        }
        return query;
    }, []).join('&');

    if (qs.length > 0) {
        qs = '?' + qs;
    }
    return qs;
}

/**
 * Creates an object out of an array, which has elements with uuids. These uuids are used
 * for the keys of the object.
 * This is useful for transforming a list response from mesh to a format suitable to the state.
 */
export function uuidHash<T extends { uuid: string }>(elements: T[]): {[uuid: string]: T} {
    return elements.reduce((hash, element) => {
        hash[element.uuid] = element;
        return hash;
    }, {});
}

export function noop() {}


export type Primitive = string | number | boolean;
export interface SimpleObject { [key: string]: SimpleObject | Primitive | SimpleArray; }
export type SimpleArray = Array<SimpleObject | Primitive>;
export type SimpleDeepEqualsType = Primitive | SimpleObject | SimpleArray |
    NodeFieldType | ListNodeFieldType | MicronodeFieldType | MicronodeFieldMap;

/**
 * An simple object equality function designed for primitives (string, number, boolean), plain objects, arrays, or any combination thereof.
 */
export function simpleDeepEquals<T extends SimpleDeepEqualsType>(o1?: T, o2?: T): boolean {
    if (isPrimitiveValue(o1) || isPrimitiveValue(o2)) {
        return o1 === o2;
    }

    if (!o1 || !o2) {
        return o1 === o2;
    }

    const keys1 = Object.keys(o1);
    const keys2 = Object.keys(o2);

    if (keys1.length !== keys2.length) {
        return false;
    }

    for (let i = keys1.length - 1; i >= 0; i--) {
        const key = keys1[i];
        if (!simpleDeepEquals(o1[key], o2[key])) {
            return false;
        }
    }

    return true;
}

function isPrimitiveValue(arg: any): boolean {
    return typeof arg === 'string' ||
        typeof arg === 'number' ||
        typeof arg === 'boolean' ||
        arg === null;
}
