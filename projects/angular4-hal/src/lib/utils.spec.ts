import {Utils} from './utils';

describe('Utils', () => {

  describe('.isNullOrUndefined', () => {
    it('should return true for null ', () => {
      expect(Utils.isNullOrUndefined(null)).toBe(true);
    });

    it('should return true for undefined ', () => {
      expect(Utils.isNullOrUndefined(undefined)).toBe(true);
    });

    it('should return false for an object', () => {
      expect(Utils.isNullOrUndefined({})).toBe(false);
    });
  });

  describe('.isPrimitive', () => {
    it('should return true for a number', () => {
      expect(Utils.isPrimitive(0.1)).toBe(true);
    });

    it('should return true for a string', () => {
      expect(Utils.isPrimitive('test')).toBe(true);
    });

    it('should return true for null', () => {
      expect(Utils.isPrimitive(null)).toBe(true);
    });

    it('should return false for an object', () => {
      expect(Utils.isPrimitive({})).toBe(false);
    });

    it('should return false for a function', () => {
      expect(Utils.isPrimitive(() => {
      })).toBe(false);
    });
  });
});

/*
import { TestBed } from '@angular/core/testing';

import { TestlibService } from './testlib.service';

describe('TestlibService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TestlibService = TestBed.get(TestlibService);
    expect(service).toBeTruthy();
  });
});

 */
