// E2E của Portal chạy với một Academic GIẢ (http server nhỏ ngay trong test), nên không cần PostgreSQL.
// Chạy: npm test
import assert from 'node:assert/strict';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { after, before, describe, it } from 'node:test';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import request from 'supertest';

type Mode = 'ok' | 'slow' | 'crash' | 'garbage' | 'gone' | 'ratelimited' | 'reset';
let mode: Mode = 'ok';
let lastForwarded: { requestId?: string; xff?: string } = {};

const USER = { id: 'u1', email: 'a@x.vn', fullName: 'A', role: 'student' };

// Academic giả: bắt chước hợp đồng của Academic thật (lỗi theo dạng mặc định của Nest).
const fake = http.createServer((req, res) => {
  lastForwarded = { requestId: String(req.headers['x-request-id']), xff: String(req.headers['x-forwarded-for']) };
  const send = (status: number, body?: unknown) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(body === undefined ? '' : JSON.stringify(body));
  };
  if (mode === 'slow') return void setTimeout(() => send(200, {}), 2000);
  if (mode === 'crash') return send(500, { statusCode: 500, message: 'Internal server error' });
  if (mode === 'gone') return send(404, { statusCode: 404, message: 'Cannot POST /api/v1/auth/login' });
  if (mode === 'ratelimited') {
    res.writeHead(429, { 'Content-Type': 'application/json', 'Retry-After': '42' });
    return void res.end(JSON.stringify({ statusCode: 429, message: 'ThrottlerException: Too Many Requests' }));
  }
  if (mode === 'reset') {
    // Gửi header + một phần body rồi cắt kết nối: đã kết nối được nhưng phản hồi hỏng.
    res.writeHead(200, { 'Content-Type': 'application/json', 'Content-Length': '100' });
    res.write('{"accessToken":');
    return void setTimeout(() => res.socket?.destroy(), 20);
  }
  if (mode === 'garbage') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    return void res.end('<html>oops</html>');
  }

  let raw = '';
  req.on('data', (c) => (raw += c));
  req.on('end', () => {
    if (req.url === '/api/v1/auth/login' && req.method === 'POST') {
      const b = raw ? JSON.parse(raw) : {};
      if (b.email === USER.email && b.password === 'Password123!') {
        return send(200, { accessToken: 'good-token', refreshToken: 'r', user: USER });
      }
      if (!b.email) return send(400, { statusCode: 400, message: ['email must be an email'], error: 'Bad Request' });
      return send(401, { statusCode: 401, message: 'Email hoặc mật khẩu không đúng', error: 'Unauthorized' });
    }
    if (req.url === '/api/v1/auth/me') {
      return req.headers.authorization === 'Bearer good-token'
        ? send(200, USER)
        : send(401, { statusCode: 401, message: 'Unauthorized' });
    }
    if (req.url === '/api/v1/auth/logout') return send(204);
    send(404, { statusCode: 404, message: 'Not Found' });
  });
});

let app: NestExpressApplication;
let client: ReturnType<typeof request>;
const api = (path: string) => `/api/v1${path}`;

describe('Portal (điều phối đăng nhập tới Academic)', () => {
  before(async () => {
    await new Promise<void>((r) => fake.listen(0, '127.0.0.1', r));
    const port = (fake.address() as AddressInfo).port;

    // Đặt env TRƯỚC khi nạp AppModule (ConfigModule đọc process.env lúc nạp).
    process.env.NODE_ENV = 'test';
    process.env.ACADEMIC_URL = `http://127.0.0.1:${port}`;
    process.env.FINANCE_URL = 'http://127.0.0.1:1';
    process.env.UPSTREAM_TIMEOUT_MS = '300';

    const { AppModule } = await import('../src/app.module.js');
    const { configureApp } = await import('../src/app.setup.js');
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication<NestExpressApplication>();
    configureApp(app);
    await app.init();
    client = request(app.getHttpServer());
  });

  after(async () => {
    await app.close();
    fake.closeAllConnections();
    await new Promise((r) => fake.close(r));
  });

  it('GET /health công khai và không phụ thuộc Academic', async () => {
    mode = 'crash';
    const res = await client.get(api('/health'));
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
    mode = 'ok';
  });

  it('đăng nhập đúng -> 200, trả nguyên token của Academic', async () => {
    const res = await client.post(api('/portal/auth/login')).send({ email: USER.email, password: 'Password123!' });
    assert.equal(res.status, 200);
    assert.equal(res.body.accessToken, 'good-token');
  });

  it('đăng nhập sai -> 401 theo định dạng lỗi chuẩn, có requestId', async () => {
    const res = await client.post(api('/portal/auth/login')).send({ email: USER.email, password: 'sai' });
    assert.equal(res.status, 401);
    assert.equal(res.body.error.code, 'UNAUTHORIZED');
    assert.equal(res.body.error.message, 'Email hoặc mật khẩu không đúng');
    assert.ok(res.body.error.requestId);
    assert.equal(res.headers['x-request-id'], res.body.error.requestId);
  });

  it('thiếu email -> 400 VALIDATION_ERROR (message mảng được nối lại)', async () => {
    const res = await client.post(api('/portal/auth/login')).send({ password: 'x' });
    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
    assert.equal(res.body.error.message, 'email must be an email');
  });

  it('X-Request-ID của client được giữ và truyền xuống Academic', async () => {
    await client.post(api('/portal/auth/login')).set('X-Request-ID', 'trace-abc-12345').send({ email: USER.email, password: 'Password123!' });
    assert.equal(lastForwarded.requestId, 'trace-abc-12345');
    assert.ok(lastForwarded.xff, 'phải gửi X-Forwarded-For');
  });

  it('GET /portal/me: không token -> 401, token đúng -> 200', async () => {
    const no = await client.get(api('/portal/me'));
    assert.equal(no.status, 401);
    assert.equal(no.body.error.code, 'UNAUTHORIZED');

    const bad = await client.get(api('/portal/me')).set('Authorization', 'Bearer sai');
    assert.equal(bad.status, 401);

    const ok = await client.get(api('/portal/me')).set('Authorization', 'Bearer good-token');
    assert.equal(ok.status, 200);
    assert.equal(ok.body.email, USER.email);
  });

  it('logout -> 204', async () => {
    const res = await client.post(api('/portal/auth/logout')).set('Authorization', 'Bearer good-token');
    assert.equal(res.status, 204);
  });

  it('Academic chậm hơn timeout -> 504 UPSTREAM_TIMEOUT, Portal trả lời nhanh', async () => {
    mode = 'slow';
    const t0 = Date.now();
    const res = await client.post(api('/portal/auth/login')).send({ email: USER.email, password: 'Password123!' });
    assert.equal(res.status, 504);
    assert.equal(res.body.error.code, 'UPSTREAM_TIMEOUT');
    assert.ok(Date.now() - t0 < 1500, 'không được chờ hết 2 giây của Academic giả');
    mode = 'ok';
  });

  it('Academic trả 500 hoặc dữ liệu hỏng -> 502 UPSTREAM_BAD_RESPONSE', async () => {
    mode = 'crash';
    let res = await client.post(api('/portal/auth/login')).send({ email: USER.email, password: 'Password123!' });
    assert.equal(res.status, 502);
    assert.equal(res.body.error.code, 'UPSTREAM_BAD_RESPONSE');

    mode = 'garbage';
    res = await client.post(api('/portal/auth/login')).send({ email: USER.email, password: 'Password123!' });
    assert.equal(res.status, 502);
    mode = 'ok';
  });

  it('không tin X-Forwarded-For do client tự gửi (TRUST_PROXY để trống)', async () => {
    await client.post(api('/portal/auth/login')).set('X-Forwarded-For', '6.6.6.6').send({ email: USER.email, password: 'Password123!' });
    assert.notEqual(lastForwarded.xff, '6.6.6.6');
    assert.match(lastForwarded.xff ?? '', /127\.0\.0\.1|::1/);
  });

  it('TRUST_PROXY nguy hiểm bị từ chối ngay lúc khởi động', async () => {
    const { parseTrustProxy } = await import('../src/common/trust-proxy.js');
    assert.equal(parseTrustProxy(undefined), false);
    assert.equal(parseTrustProxy('false'), false);
    assert.equal(parseTrustProxy('172.30.0.10'), '172.30.0.10');
    assert.throws(() => parseTrustProxy('true'));
    assert.throws(() => parseTrustProxy('1'));
  });

  it('Academic trả 404 (sai hợp đồng) -> 502, không lộ đường dẫn nội bộ', async () => {
    mode = 'gone';
    const res = await client.post(api('/portal/auth/login')).send({ email: USER.email, password: 'Password123!' });
    assert.equal(res.status, 502);
    assert.equal(res.body.error.code, 'UPSTREAM_BAD_RESPONSE');
    assert.equal(JSON.stringify(res.body).includes('/api/v1/auth'), false);
    mode = 'ok';
  });

  it('Academic trả 429 -> giữ 429 và header Retry-After', async () => {
    mode = 'ratelimited';
    const res = await client.post(api('/portal/auth/login')).send({ email: USER.email, password: 'x' });
    assert.equal(res.status, 429);
    assert.equal(res.body.error.code, 'TOO_MANY_REQUESTS');
    assert.equal(res.headers['retry-after'], '42');
    mode = 'ok';
  });

  it('Academic cắt kết nối giữa lúc gửi body -> 502 (không phải 503)', async () => {
    mode = 'reset';
    const res = await client.post(api('/portal/auth/login')).send({ email: USER.email, password: 'Password123!' });
    assert.equal(res.status, 502);
    assert.equal(res.body.error.code, 'UPSTREAM_BAD_RESPONSE');
    mode = 'ok';
  });

  it('Academic sập hẳn -> 503 UPSTREAM_UNAVAILABLE', async () => {
    fake.closeAllConnections();
    await new Promise((r) => fake.close(r));
    const res = await client.post(api('/portal/auth/login')).send({ email: USER.email, password: 'Password123!' });
    assert.equal(res.status, 503);
    assert.equal(res.body.error.code, 'UPSTREAM_UNAVAILABLE');
  });

  it('route không tồn tại -> 404 theo định dạng chuẩn', async () => {
    const res = await client.get(api('/khong-co'));
    assert.equal(res.status, 404);
    assert.equal(res.body.error.code, 'NOT_FOUND');
  });
});
