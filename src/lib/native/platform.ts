/**
 * Platform abstraction layer for the native Capacitor shell (PROJ-9).
 *
 * The web build keeps every existing code path 1:1 — native branches only ever
 * run on a real device/simulator, where `Capacitor.isNativePlatform()` is true.
 * See PROJ-9 Decision Log ("Plattform-Abstraktionsschicht").
 */
import { Capacitor } from '@capacitor/core';

/** True only inside the native iOS/Android Capacitor container. */
export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

/** Current platform: 'ios' | 'android' | 'web'. */
export function getPlatform(): string {
  return Capacitor.getPlatform();
}
