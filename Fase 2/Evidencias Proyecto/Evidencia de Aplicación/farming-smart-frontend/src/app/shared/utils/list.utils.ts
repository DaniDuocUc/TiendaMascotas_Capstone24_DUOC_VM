export class ListUtils {

    static unique<T>(array: Array<T>): Array<T> {
        if (!Array.isArray(array)) {
            return [];
        }
        return Array.from(new Set(array));
    }

    static uniqueBy<T extends Record<string, any>>(array: Array<T>, key: string): Array<T> {
        if (!Array.isArray(array)) {
            return [];
        }
        const uniqueKeys = new Set();
        return array.filter(item => {
            const keyValue = item[key];
            if (!uniqueKeys.has(keyValue)) {
                uniqueKeys.add(keyValue);
                return true;
            }
            return false;
        });
    }

    static uniqueByArray<T extends Record<string, any>>(array: Array<T>, key: string): Array<T> {
        if (!Array.isArray(array)) {
            return [];
        }
        const uniqueLengths = new Set();
        return array.filter(item => {
            const arrayLength = item[key]?.length;
            if (arrayLength !== undefined && !uniqueLengths.has(arrayLength)) {
                uniqueLengths.add(arrayLength);
                return true;
            }
            return false;
        });
    }


    static filterByArray<T extends Record<string, any>>(array: Array<T>, key: string, values: Array<any>): Array<T> {
        if (!Array.isArray(array)) {
            return [];
        }
        return array.filter(item => {
            return values.includes(item[key]);
        });
    }
}
