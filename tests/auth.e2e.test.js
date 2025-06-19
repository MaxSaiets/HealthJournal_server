const request = require('supertest');
const app = require('../app');

describe('Auth flow (access + refresh tokens)', () => {
  let server;
  beforeAll((done) => {
    server = app.listen(0, done);
  });
  afterAll((done) => {
    server.close(done);
  });

  const testUser = {
    email: `test${Date.now()}@mail.com`,
    password: 'testpassword',
    name: 'Test User'
  };

  let accessToken;
  let refreshCookie;

  it('registers a new user', async () => {
    const res = await request(server)
      .post('/api/auth/registration')
      .send(testUser)
      .expect(201);

    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email);

    accessToken = res.body.token;
    refreshCookie = res.headers['set-cookie'].find(c => c.startsWith('refreshToken='));
    expect(refreshCookie).toBeDefined();
  });

  it('logs in the user', async () => {
    const res = await request(server)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(200);

    expect(res.body.token).toBeDefined();
    accessToken = res.body.token;
    refreshCookie = res.headers['set-cookie'].find(c => c.startsWith('refreshToken='));
    expect(refreshCookie).toBeDefined();
  });

  it('gets current user with access token', async () => {
    const res = await request(server)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.email).toBe(testUser.email);
  });

  it('refreshes access token with refresh token (cookie)', async () => {
    const res = await request(server)
      .post('/api/auth/refresh')
      .set('Cookie', refreshCookie)
      .expect(200);

    expect(res.body.token).toBeDefined();
    accessToken = res.body.token;
  });

  it('logs out and invalidates refresh token', async () => {
    await request(server)
      .post('/api/auth/logout')
      .set('Cookie', refreshCookie)
      .expect(200);

    await request(server)
      .post('/api/auth/refresh')
      .set('Cookie', refreshCookie)
      .expect(401);
  });
});