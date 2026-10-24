import { describe, expect, it } from 'vitest';
import {
  canUpdateSchoolLocation,
  calculateDistanceMeters,
  DEFAULT_SCHOOL_LOCATION,
  getSchoolCoordinatesForUpdate,
  getNextAttendanceType,
  isLegacySchoolLocation,
  isValidCoordinate,
  isWithinAttendanceRadius,
} from './attendance';

describe('attendance location rules', () => {
  it('uses the configured school coordinates', () => {
    expect(DEFAULT_SCHOOL_LOCATION).toEqual({ lat: -6.346129, lng: 108.099104 });
  });

  it('calculates zero distance for the same point', () => {
    expect(calculateDistanceMeters(-6.346129, 108.099104, -6.346129, 108.099104)).toBe(0);
  });

  it('allows attendance at the school point and rejects a distant point', () => {
    const { lat, lng } = DEFAULT_SCHOOL_LOCATION;

    expect(isWithinAttendanceRadius(lat, lng, lat, lng, 200)).toBe(true);
    expect(isWithinAttendanceRadius(-6.9175, 107.6191, lat, lng, 200)).toBe(false);
  });

  it('includes the radius boundary', () => {
    const schoolLat = -6.346129;
    const schoolLng = 108.099104;
    const nearbyLat = schoolLat + 0.0005;
    const distance = calculateDistanceMeters(nearbyLat, schoolLng, schoolLat, schoolLng);

    expect(isWithinAttendanceRadius(nearbyLat, schoolLng, schoolLat, schoolLng, distance)).toBe(true);
    expect(isWithinAttendanceRadius(nearbyLat, schoolLng, schoolLat, schoolLng, distance - 1)).toBe(false);
  });

  it.each([
    [Number.NaN, 108.099104],
    [-6.346129, Number.POSITIVE_INFINITY],
    [-91, 108.099104],
    [-6.346129, 181],
  ])('rejects invalid coordinates (%s, %s)', (lat, lng) => {
    expect(isValidCoordinate(lat, lng)).toBe(false);
    expect(isWithinAttendanceRadius(lat, lng, -6.346129, 108.099104, 200)).toBe(false);
  });

  it('rejects an invalid radius', () => {
    expect(isWithinAttendanceRadius(-6.346129, 108.099104, -6.346129, 108.099104, Number.NaN)).toBe(false);
    expect(isWithinAttendanceRadius(-6.346129, 108.099104, -6.346129, 108.099104, -1)).toBe(false);
  });

  it('migrates only the old default coordinate pair', () => {
    expect(isLegacySchoolLocation(-6.9175, 107.6191)).toBe(true);
    expect(isLegacySchoolLocation(-6.9175, 108.099104)).toBe(false);
    expect(isLegacySchoolLocation(DEFAULT_SCHOOL_LOCATION.lat, DEFAULT_SCHOOL_LOCATION.lng)).toBe(false);
  });

  it('allows only admins to change school coordinates', () => {
    expect(canUpdateSchoolLocation('ADMIN')).toBe(true);
    expect(canUpdateSchoolLocation('TU')).toBe(false);
    expect(canUpdateSchoolLocation('STUDENT')).toBe(false);
  });

  it('ignores submitted coordinate changes from non-admin users', () => {
    const submitted = { lat: -6.2, lng: 108.2 };
    const current = DEFAULT_SCHOOL_LOCATION;

    expect(getSchoolCoordinatesForUpdate('TU', submitted, current)).toEqual(current);
    expect(getSchoolCoordinatesForUpdate('ADMIN', submitted, current)).toEqual(submitted);
  });

  it('selects the next attendance action from the existing record', () => {
    expect(getNextAttendanceType(null)).toBe('IN');
    expect(getNextAttendanceType({ checkInTime: null, checkOutTime: null })).toBe('IN');
    expect(getNextAttendanceType({ checkInTime: new Date(), checkOutTime: null })).toBe('OUT');
    expect(getNextAttendanceType({ checkInTime: new Date(), checkOutTime: new Date() })).toBeNull();
  });
});
