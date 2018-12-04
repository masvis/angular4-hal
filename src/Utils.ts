export class Utils {
    public static isNullOrUndefined(value: any): boolean {
        return value === null || value === undefined;
    }

    public static isPrimitive(value: any): boolean {
        return (typeof value !== 'object' && typeof value !== 'function') || value === null;
    }
}