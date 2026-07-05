import { describe, it, expect, vi, beforeEach } from 'vitest';

// Controllable platform + plugin mocks. `isNativePlatform` is flipped per-test so
// we can exercise both the web no-op path and the native path without a device.
const isNativePlatform = vi.fn(() => false);
vi.mock('./platform', () => ({
  isNativePlatform: () => isNativePlatform(),
  getPlatform: () => (isNativePlatform() ? 'ios' : 'web'),
}));

const notifyAppReadyMock = vi.fn();
const setChannelMock = vi.fn();
const getChannelMock = vi.fn();
const currentMock = vi.fn();
vi.mock('@capgo/capacitor-updater', () => ({
  CapacitorUpdater: {
    notifyAppReady: () => notifyAppReadyMock(),
    setChannel: (o: { channel: string }) => setChannelMock(o),
    getChannel: () => getChannelMock(),
    current: () => currentMock(),
  },
}));

import { notifyAppReady, setOtaChannel, getOtaStatus } from './ota';

beforeEach(() => {
  vi.clearAllMocks();
  isNativePlatform.mockReturnValue(false);
});

describe('notifyAppReady', () => {
  it('is a silent no-op on the web (never touches the plugin)', async () => {
    await expect(notifyAppReady()).resolves.toBeUndefined();
    expect(notifyAppReadyMock).not.toHaveBeenCalled();
  });

  it('signals the plugin on native', async () => {
    isNativePlatform.mockReturnValue(true);
    notifyAppReadyMock.mockResolvedValue({ bundle: {} });
    await notifyAppReady();
    expect(notifyAppReadyMock).toHaveBeenCalledOnce();
  });

  it('swallows plugin errors (no account / offline never surfaces)', async () => {
    isNativePlatform.mockReturnValue(true);
    notifyAppReadyMock.mockRejectedValue(new Error('no backend'));
    await expect(notifyAppReady()).resolves.toBeUndefined();
  });
});

describe('setOtaChannel', () => {
  it('returns false and does nothing on the web', async () => {
    expect(await setOtaChannel('beta')).toBe(false);
    expect(setChannelMock).not.toHaveBeenCalled();
  });

  it('returns true when the channel is accepted', async () => {
    isNativePlatform.mockReturnValue(true);
    setChannelMock.mockResolvedValue({ status: 'ok' });
    expect(await setOtaChannel('beta')).toBe(true);
    expect(setChannelMock).toHaveBeenCalledWith({ channel: 'beta' });
  });

  it('returns false when the plugin reports a non-ok status', async () => {
    isNativePlatform.mockReturnValue(true);
    setChannelMock.mockResolvedValue({ status: 'error', error: 'disabled_by_config' });
    expect(await setOtaChannel('beta')).toBe(false);
  });

  it('returns false when the plugin throws', async () => {
    isNativePlatform.mockReturnValue(true);
    setChannelMock.mockRejectedValue(new Error('offline'));
    expect(await setOtaChannel('production')).toBe(false);
  });
});

describe('getOtaStatus', () => {
  it('returns null on the web', async () => {
    expect(await getOtaStatus()).toBeNull();
  });

  it('reports the current bundle + channel on native', async () => {
    isNativePlatform.mockReturnValue(true);
    currentMock.mockResolvedValue({
      bundle: { version: '1.2.3', id: 'abc', downloaded: '', checksum: '', status: 'success' },
      native: '1.0.0',
    });
    getChannelMock.mockResolvedValue({ channel: 'beta' });
    expect(await getOtaStatus()).toEqual({
      bundleVersion: '1.2.3',
      nativeVersion: '1.0.0',
      channel: 'beta',
    });
  });

  it('omits the channel when it cannot be read (offline) but still returns the bundle', async () => {
    isNativePlatform.mockReturnValue(true);
    currentMock.mockResolvedValue({
      bundle: { version: 'builtin', id: '', downloaded: '', checksum: '', status: 'success' },
      native: '1.0.0',
    });
    getChannelMock.mockRejectedValue(new Error('no backend'));
    expect(await getOtaStatus()).toEqual({ bundleVersion: 'builtin', nativeVersion: '1.0.0' });
  });

  it('returns null when the plugin is unavailable', async () => {
    isNativePlatform.mockReturnValue(true);
    currentMock.mockRejectedValue(new Error('no plugin'));
    expect(await getOtaStatus()).toBeNull();
  });
});
