#!/usr/bin/env node
/**
 * Test: questions are isolated per user.
 * - New user has no questions
 * - User A's questions are not visible to user B
 */

const AUTH_URL = process.env.AUTH_URL || 'http://localhost:3001';
const QUIZ_URL = process.env.QUIZ_URL || 'http://localhost:3002';

const ts = Date.now();
const userA = {
  name: 'Test User A',
  email: `testuser-a-${ts}@test.local`,
  password: 'testpass123'
};
const userB = {
  name: 'Test User B',
  email: `testuser-b-${ts}@test.local`,
  password: 'testpass123'
};

async function request(method, url, body = null, token = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (token) opts.headers['Authorization'] = `Bearer ${token}`;
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (_) {}
  return { status: res.status, data, ok: res.ok };
}

async function register(email, name, password) {
  const registerPath = AUTH_URL.includes('/api/') ? `${AUTH_URL}/users/register` : `${AUTH_URL}/auth/users/register`;
  const { status, data } = await request('POST', registerPath, {
    email,
    name,
    password
  });
  if (status !== 201 && status !== 200) {
    throw new Error(`Register failed: ${status} ${JSON.stringify(data)}`);
  }
  return data;
}

async function login(email, password) {
  const loginPath = AUTH_URL.includes('/api/') ? `${AUTH_URL}/users/login` : `${AUTH_URL}/auth/users/login`;
  const { status, data } = await request('POST', loginPath, {
    email,
    password
  });
  if (!data?.token) {
    throw new Error(`Login failed: ${status} ${JSON.stringify(data)}`);
  }
  return data.token;
}

async function getUserQuestions(token) {
  const path = QUIZ_URL.includes('/api/') ? `${QUIZ_URL}/user/questions` : `${QUIZ_URL}/quiz/user/questions`;
  const { status, data } = await request('GET', path, null, token);
  if (status !== 200) {
    throw new Error(`getUserQuestions failed: ${status} ${JSON.stringify(data)}`);
  }
  return Array.isArray(data) ? data : [];
}

async function createQuestion(token, question, choices, answer) {
  const createPath = QUIZ_URL.includes('/api/') ? `${QUIZ_URL}/create` : `${QUIZ_URL}/quiz/create`;
  const { status, data } = await request(
    'POST',
    createPath,
    { question, choices, answer },
    token
  );
  if (status !== 200 && status !== 201) {
    throw new Error(`createQuestion failed: ${status} ${JSON.stringify(data)}`);
  }
  return data;
}

async function main() {
  console.log('=== Test: questions per user ===\n');
  console.log('Auth URL:', AUTH_URL);
  console.log('Quiz URL:', QUIZ_URL);
  console.log('');

  try {
    // 1. Register user A
    console.log('1. Register user A:', userA.email);
    await register(userA.email, userA.name, userA.password);
    const tokenA = await login(userA.email, userA.password);
    console.log('   User A logged in, token obtained.\n');

    // 2. User A: should have 0 questions
    console.log('2. User A GET /quiz/user/questions');
    const questionsA0 = await getUserQuestions(tokenA);
    if (questionsA0.length !== 0) {
      throw new Error(`Expected 0 questions for new user A, got ${questionsA0.length}`);
    }
    console.log('   OK: User A has 0 questions.\n');

    // 3. User A: create one question
    console.log('3. User A creates a question');
    const q = await createQuestion(
      tokenA,
      'Question specific to user A?',
      ['Choice A1', 'Choice A2'],
      'Choice A1'
    );
    console.log('   Created question id:', q?.id || 'unknown');
    const questionsA1 = await getUserQuestions(tokenA);
    if (questionsA1.length !== 1) {
      throw new Error(`Expected 1 question for user A after create, got ${questionsA1.length}`);
    }
    console.log('   OK: User A has 1 question.\n');

    // 4. Register user B
    console.log('4. Register user B:', userB.email);
    await register(userB.email, userB.name, userB.password);
    const tokenB = await login(userB.email, userB.password);
    console.log('   User B logged in.\n');

    // 5. User B: should have 0 questions (not user A's)
    console.log('5. User B GET /quiz/user/questions');
    const questionsB = await getUserQuestions(tokenB);
    if (questionsB.length !== 0) {
      throw new Error(
        `Expected 0 questions for user B (must not see user A's), got ${questionsB.length}`
      );
    }
    console.log('   OK: User B has 0 questions (user A\'s question not visible).\n');

    // 6. User A: still has 1 question
    console.log('6. User A GET /quiz/user/questions again');
    const questionsA2 = await getUserQuestions(tokenA);
    if (questionsA2.length !== 1) {
      throw new Error(`Expected 1 question for user A, got ${questionsA2.length}`);
    }
    console.log('   OK: User A still has 1 question.\n');

    console.log('=== All checks passed: questions are correctly isolated per user. ===');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Test failed:', err.message);
    process.exit(1);
  }
}

main();
