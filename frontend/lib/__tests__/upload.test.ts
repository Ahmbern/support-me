import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { uploadAvatar, UploadError } from '../upload';

function makeFile(bytes = 1024, type = 'image/png'): File {
  return new File([new Uint8Array(bytes)], 'avatar.png', { type });
}

const sign = {
  cloudName: 'test-cloud',
  apiKey: 'test-key',
  timestamp: 1700000000,
  signature: 'sig',
  folder: 'supportme/avatars',
  transformation: 'c_limit,w_512,h_512',
};

beforeEach(() => {
  // validateImageDimensions loads the file through the DOM Image API.
  class FakeImage {
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    width = 100;
    height = 100;
    set src(_: string) {
      setTimeout(() => this.onload?.(), 0);
    }
  }
  vi.stubGlobal('Image', FakeImage as unknown as typeof Image);
  vi.stubGlobal('URL', { createObjectURL: () => 'blob:mock', revokeObjectURL: () => {} });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('uploadAvatar (#364)', () => {
  it('sends the token as an Authorization header when requesting a signature', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();
      if (url === '/api/cloudinary-sign') {
        return new Response(JSON.stringify(sign), { status: 200 });
      }
      return new Response(JSON.stringify({ secure_url: 'https://cdn.test/avatar.png' }), {
        status: 200,
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    await uploadAvatar(makeFile(), 'jwt-token');

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/cloudinary-sign',
      expect.objectContaining({ headers: { Authorization: 'Bearer jwt-token' } })
    );
  });

  it('omits the Authorization header when there is no token', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify(sign), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await uploadAvatar(makeFile(), null).catch(() => {});

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/cloudinary-sign',
      expect.objectContaining({ headers: undefined })
    );
  });

  it('surfaces the signing route 401 as an UploadError', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ error: 'Authentication required' }), { status: 401 }))
    );

    await expect(uploadAvatar(makeFile(), null)).rejects.toThrow(UploadError);
    await expect(uploadAvatar(makeFile(), null)).rejects.toThrow('Authentication required');
  });
});
