import {ListUtils} from './list.utils';

describe('Use cases for ListUtils', () => {

    describe('unique', () => {
        it('should remove duplicates from number array', () => {
            expect(ListUtils.unique([1, 2, 2, 3])).toEqual([1, 2, 3]);
        });

        it('should remove duplicates from string array', () => {
            expect(ListUtils.unique(['a', 'b', 'b', 'c'])).toEqual(['a', 'b', 'c']);
        });

        it('should return the same array if all elements are unique', () => {
            expect(ListUtils.unique([1, 2, 3])).toEqual([1, 2, 3]);
        });

        it('should return an empty array if given an empty array', () => {
            expect(ListUtils.unique([])).toEqual([]);
        });
    });

    describe('uniqueBy', () => {
        const objects = [{id: 1}, {id: 2}, {id: 1}];

        it('should remove duplicates based on a key', () => {
            expect(ListUtils.uniqueBy(objects, 'id')).toEqual([{id: 1}, {id: 2}]);
        });

        it('should return an empty array if given an empty array', () => {
            expect(ListUtils.uniqueBy([], 'id')).toEqual([]);
        });

    });

    describe('uniqueByArray', () => {
        const objects = [{tags: ['a', 'b']}, {tags: ['a']}, {tags: ['a', 'b']}];

        it('should remove duplicates based on array length in a key', () => {
            expect(ListUtils.uniqueByArray(objects, 'tags')).toEqual([{tags: ['a', 'b']}, {tags: ['a']}]);
        });

        it('should return an empty array if given an empty array', () => {
            expect(ListUtils.uniqueByArray([], 'tags')).toEqual([]);
        });
    });

});
