import { describe, expect, it } from 'vitest';
import { SignJWT, exportJWK, generateKeyPair, importJWK, type JWK } from 'jose';
import { createTokenVerifier } from '../src/auth/verifier.js';
import { testConfig } from './helpers/fakeUpstream.js';

const ISSUER = 'https://auth.test.local/realms/docs';
const AUDIENCE = 'document-api';

async function keys(): Promise<{ sign: CryptoKey; publicJwk: JWK }> {
  const pair = await generateKeyPair('RS256');
  return { sign: pair.privateKey as CryptoKey, publicJwk: await exportJWK(pair.publicKey) };
}

interface TokenOptions {
  scope?: string;
  expiresIn?: string | false;
  audience?: string;
  subject?: string;
}

async function token(sign: CryptoKey, options: TokenOptions = {}): Promise<string> {
  let jwt = new SignJWT({
    scope: options.scope ?? 'docs:read',
    azp: 'docs-mcp-client'
  })
    .setProtectedHeader({ alg: 'RS256' })
    .setIssuer(ISSUER)
    .setSubject(options.subject ?? 'user-42')
    .setAudience(options.audience ?? AUDIENCE)
    .setIssuedAt();

  if (options.expiresIn !== false) {
    jwt = jwt.setExpirationTime(options.expiresIn ?? '5m');
  }
  return jwt.sign(sign);
}

async function verifierFor(publicJwk: JWK, audience: string | undefined = AUDIENCE) {
  const key = await importJWK(publicJwk, 'RS256');
  const config = testConfig().inboundAuth;
  return createTokenVerifier({
    config: { ...config, ...(audience ? { audience } : {}) },
    keyResolver: key as never
  });
}

describe('inbound token verification (contract §6)', () => {
  it('accepts a docs:read token and reports its subject and expiry', async () => {
    const { sign, publicJwk } = await keys();
    const verifier = await verifierFor(publicJwk);

    const info = await verifier.verifyAccessToken(await token(sign));

    expect(info.scopes).toContain('docs:read');
    expect(info.clientId).toBe('docs-mcp-client');
    expect(info.extra?.sub).toBe('user-42');
    expect(typeof info.expiresAt).toBe('number');
  });

  it('treats an unset expiry as an invalid token', async () => {
    const { sign, publicJwk } = await keys();
    const verifier = await verifierFor(publicJwk);

    await expect(
      verifier.verifyAccessToken(await token(sign, { expiresIn: false }))
    ).rejects.toMatchObject({ errorCode: 'invalid_token' });
  });

  it('rejects a token from another issuer', async () => {
    const { sign, publicJwk } = await keys();
    const verifier = await verifierFor(publicJwk);
    const foreign = await new SignJWT({ scope: 'docs:read' })
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuer('https://auth.elsewhere.test/realms/other')
      .setAudience(AUDIENCE)
      .setExpirationTime('5m')
      .sign(sign);

    await expect(verifier.verifyAccessToken(foreign)).rejects.toMatchObject({
      errorCode: 'invalid_token'
    });
  });

  it('rejects a token for another audience', async () => {
    const { sign, publicJwk } = await keys();
    const verifier = await verifierFor(publicJwk);

    await expect(
      verifier.verifyAccessToken(await token(sign, { audience: 'someone-else' }))
    ).rejects.toMatchObject({ errorCode: 'invalid_token' });
  });

  it('rejects a token without docs:read as insufficient scope', async () => {
    const { sign, publicJwk } = await keys();
    const verifier = await verifierFor(publicJwk);

    await expect(
      verifier.verifyAccessToken(await token(sign, { scope: 'openid profile' }))
    ).rejects.toMatchObject({ errorCode: 'insufficient_scope' });
  });

  it('rejects a token carrying scopes beyond docs:read (contract §2.3, acceptance 5)', async () => {
    const { sign, publicJwk } = await keys();
    const verifier = await verifierFor(publicJwk);

    await expect(
      verifier.verifyAccessToken(await token(sign, { scope: 'docs:read docs:write' }))
    ).rejects.toMatchObject({ errorCode: 'insufficient_scope' });
  });

  it('ignores Keycloak default scopes that confer no capability', async () => {
    const { sign, publicJwk } = await keys();
    const verifier = await verifierFor(publicJwk);

    const info = await verifier.verifyAccessToken(
      await token(sign, { scope: 'openid email profile offline_access docs:read' })
    );
    expect(info.scopes).toContain('docs:read');
  });
});
