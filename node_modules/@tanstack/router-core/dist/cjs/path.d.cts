import { MatchLocation } from './RouterProvider.cjs';
import { AnyPathParams } from './route.cjs';
export declare const SEGMENT_TYPE_PATHNAME = 0;
export declare const SEGMENT_TYPE_PARAM = 1;
export declare const SEGMENT_TYPE_WILDCARD = 2;
export declare const SEGMENT_TYPE_OPTIONAL_PARAM = 3;
export interface Segment {
    readonly type: typeof SEGMENT_TYPE_PATHNAME | typeof SEGMENT_TYPE_PARAM | typeof SEGMENT_TYPE_WILDCARD | typeof SEGMENT_TYPE_OPTIONAL_PARAM;
    readonly value: string;
    readonly prefixSegment?: string;
    readonly suffixSegment?: string;
    readonly hasStaticAfter?: boolean;
}
export declare function joinPaths(paths: Array<string | undefined>): string;
export declare function cleanPath(path: string): string;
export declare function trimPathLeft(path: string): string;
export declare function trimPathRight(path: string): string;
export declare function trimPath(path: string): string;
export declare function removeTrailingSlash(value: string, basepath: string): string;
export declare function exactPathTest(pathName1: string, pathName2: string, basepath: string): boolean;
interface ResolvePathOptions {
    basepath: string;
    base: string;
    to: string;
    trailingSlash?: 'always' | 'never' | 'preserve';
    caseSensitive?: boolean;
}
export declare function resolvePath({ basepath, base, to, trailingSlash, caseSensitive, }: ResolvePathOptions): string;
/**
 * Required: `/foo/$bar` ✅
 * Prefix and Suffix: `/foo/prefix${bar}suffix` ✅
 * Wildcard: `/foo/$` ✅
 * Wildcard with Prefix and Suffix: `/foo/prefix{$}suffix` ✅
 *
 * Optional param: `/foo/{-$bar}`
 * Optional param with Prefix and Suffix: `/foo/prefix{-$bar}suffix`

 * Future:
 * Optional named segment: `/foo/{bar}`
 * Optional named segment with Prefix and Suffix: `/foo/prefix{-bar}suffix`
 * Escape special characters:
 * - `/foo/[$]` - Static route
 * - `/foo/[$]{$foo} - Dynamic route with a static prefix of `$`
 * - `/foo/{$foo}[$]` - Dynamic route with a static suffix of `$`
 */
export declare function parsePathname(pathname?: string): ReadonlyArray<Segment>;
interface InterpolatePathOptions {
    path?: string;
    params: Record<string, unknown>;
    leaveWildcards?: boolean;
    leaveParams?: boolean;
    decodeCharMap?: Map<string, string>;
}
type InterPolatePathResult = {
    interpolatedPath: string;
    usedParams: Record<string, unknown>;
    isMissingParams: boolean;
};
export declare function interpolatePath({ path, params, leaveWildcards, leaveParams, decodeCharMap, }: InterpolatePathOptions): InterPolatePathResult;
export declare function matchPathname(basepath: string, currentPathname: string, matchLocation: Pick<MatchLocation, 'to' | 'fuzzy' | 'caseSensitive'>): AnyPathParams | undefined;
export declare function removeBasepath(basepath: string, pathname: string, caseSensitive?: boolean): string;
export declare function matchByPath(basepath: string, from: string, { to, fuzzy, caseSensitive, }: Pick<MatchLocation, 'to' | 'caseSensitive' | 'fuzzy'>): Record<string, string> | undefined;
export {};
