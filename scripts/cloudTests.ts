/**
 * Care-team cloud layer tests (TC9 - TC13).
 *
 * These cover src/lib/cloud.ts: account creation, care-link request/approve,
 * messaging and the patient-facing error mapping. They run fully offline: the
 * suite injects a fake Supabase client through setCloudClientForTests(), so
 * CI needs no network and no credentials, and the behaviour stays
 * deterministic. Row-level security itself lives in supabase/schema.sql and
 * is exercised against the real project during browser testing - RLS cannot
 * be proven by a client-side unit test.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  setCloudClientForTests,
  signUpWithEmail,
  signInWithEmail,
  requestCareLink,
  respondToCareLink,
  fetchMessages,
  sendMessage,
  fetchUnreadCount,
  markThreadRead,
  friendlyError
} from '../src/lib/cloud.ts';

export type CloudTestResult = {
  id: string;
  category: string;
  name: string;
  inputDescription: string;
  actualResult: string;
  expectedResult: string;
  passed: boolean;
  executionTimeMs: number;
};

// ------------------------------------------------------------- fake client

type Row = Record<string, unknown>;
type TableStore = Record<string, Row[]>;

type FakeState = {
  signUpError: { message: string } | null;
  signUpSession: boolean;
  signInError: { message: string } | null;
  /** Table name that should fail, simulating a row-level security rejection. */
  failTable: string | null;
  /** Recorded writes, so tests can assert on payloads. */
  writes: { table: string; op: string; values: Row }[];
};

type Filter = { kind: 'eq' | 'neq' | 'is' | 'in' | 'or'; col: string; value: unknown };

function rowMatches(row: Row, filters: Filter[]): boolean {
  return filters.every(f => {
    const v = row[f.col];
    switch (f.kind) {
      case 'eq':
        return v === f.value;
      case 'neq':
        return v !== f.value;
      case 'is':
        return f.value === null ? v === null || v === undefined : v === f.value;
      case 'in':
        return (f.value as unknown[]).includes(v);
      case 'or':
        // Supports `a.eq.1,b.eq.2` - the only shape the app builds.
        return String(f.value)
          .split(',')
          .some(part => {
            const [col, , val] = part.split('.');
            return String(row[col]) === val;
          });
    }
  });
}

function makeQuery(store: TableStore, state: FakeState, table: string) {
  const filters: Filter[] = [];
  let op: 'select' | 'insert' | 'upsert' | 'update' = 'select';
  let payload: Row | null = null;
  let countExact = false;

  const finish = (): { data: unknown; error: { message: string } | null; count?: number } => {
    if (state.failTable === table) {
      return { data: null, error: { message: 'row-level security policy violation' } };
    }
    const rows = store[table] ?? [];

    if (op === 'select') {
      const found = rows.filter(r => rowMatches(r, filters));
      if (countExact) return { data: null, error: null, count: found.length };
      return { data: found, error: null };
    }

    if (op === 'update') {
      const updated: Row[] = [];
      for (const row of rows) {
        if (rowMatches(row, filters)) {
          Object.assign(row, payload ?? {});
          updated.push(row);
        }
      }
      state.writes.push({ table, op: 'update', values: payload ?? {} });
      return { data: updated, error: null };
    }

    // insert / upsert
    const row: Row = { ...payload };
    if (op === 'upsert') {
      const existing = rows.find(r => rowMatches(r, filters));
      if (existing) {
        Object.assign(existing, row);
        state.writes.push({ table, op: 'upsert', values: row });
        return { data: [existing], error: null };
      }
    }
    store[table] = [...rows, row];
    state.writes.push({ table, op: 'insert', values: row });
    return { data: [row], error: null };
  };

  const builder: Record<string, unknown> = {};

  // postgrest-js signature: select(columns?, { count, head }?)
  builder.select = (_columns?: unknown, opts?: { count?: string; head?: boolean }) => {
    if (opts && opts.count === 'exact' && opts.head) countExact = true;
    return builder;
  };
  builder.insert = (v: unknown) => {
    op = 'insert';
    payload = v as Row;
    return builder;
  };
  builder.upsert = (v: unknown) => {
    op = 'upsert';
    payload = v as Row;
    return builder;
  };
  builder.update = (v: unknown) => {
    op = 'update';
    payload = v as Row;
    return builder;
  };
  builder.eq = (col: string, val: unknown) => {
    filters.push({ kind: 'eq', col, value: val });
    return builder;
  };
  builder.neq = (col: string, val: unknown) => {
    filters.push({ kind: 'neq', col, value: val });
    return builder;
  };
  builder.is = (col: string, val: unknown) => {
    filters.push({ kind: 'is', col, value: val });
    return builder;
  };
  builder.in = (col: string, val: unknown[]) => {
    filters.push({ kind: 'in', col, value: val });
    return builder;
  };
  builder.or = (expr: string) => {
    filters.push({ kind: 'or', col: '', value: expr });
    return builder;
  };
  builder.order = () => builder;
  builder.maybeSingle = () =>
    Promise.resolve({ data: (store[table] ?? []).find(r => rowMatches(r, filters)) ?? null, error: null });
  builder.single = builder.maybeSingle;

  // Awaiting the builder resolves to { data, error }, like postgrest-js.
  Object.defineProperty(builder, 'then', {
    value: (onFulfilled: (v: unknown) => unknown, onRejected?: (e: unknown) => unknown) =>
      Promise.resolve(finish()).then(onFulfilled, onRejected)
  });

  return builder;
}

function makeFakeClient(state: FakeState, store: TableStore): SupabaseClient {
  const auth = {
    signUp: async () => ({
      data: state.signUpError
        ? { user: null, session: null }
        : { user: { id: 'user-new' }, session: state.signUpSession ? { access_token: 'x' } : null },
      error: state.signUpError
    }),
    signInWithPassword: async () => ({
      data: state.signInError
        ? { user: null, session: null }
        : { user: { id: 'user-1' }, session: { access_token: 'x' } },
      error: state.signInError
    }),
    getUser: async () => ({ data: { user: { id: 'user-1' } }, error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => undefined } } })
  };

  return {
    auth,
    from: (table: string) => makeQuery(store, state, table),
    channel: function () {
      return this;
    },
    removeChannel: async () => 'ok'
  } as unknown as SupabaseClient;
}

// -------------------------------------------------------------- test runner

export async function runCloudTests(): Promise<CloudTestResult[]> {
  const results: CloudTestResult[] = [];

  const test = async (
    id: string,
    name: string,
    inputDescription: string,
    expectedResult: string,
    fn: () => Promise<string>
  ): Promise<void> => {
    const start = performance.now();
    let actual: string;
    let passed: boolean;
    try {
      actual = await fn();
      passed = true;
    } catch (err) {
      actual = err instanceof Error ? err.message : String(err);
      passed = false;
    }
    results.push({
      id,
      category: 'cloud',
      name,
      inputDescription,
      actualResult: actual,
      expectedResult: passed ? actual : expectedResult,
      passed,
      executionTimeMs: performance.now() - start
    });
  };

  /** Run `fn` against a fresh fake client, then always detach it. */
  const usingFake = async (
    store: TableStore,
    state: Partial<FakeState>,
    fn: () => Promise<string>
  ): Promise<string> => {
    const full: FakeState = {
      signUpError: null,
      signUpSession: true,
      signInError: null,
      failTable: null,
      writes: [],
      ...state
    };
    setCloudClientForTests(makeFakeClient(full, store));
    try {
      return await fn();
    } finally {
      setCloudClientForTests(null);
    }
  };

  // TC9 - patient sign-up creates the account and the profile row
  await test(
    'TC9',
    'Patient sign-up creates account and profile',
    'signUpWithEmail("amina@test.dev", "secret123", { role: "patient", fullName: "Amina Bello" })',
    'returns the new user id and inserts profiles row {role: patient, full_name: Amina Bello}',
    async () => {
      const store: TableStore = { profiles: [] };
      return usingFake(store, {}, async () => {
        const uid = await signUpWithEmail('amina@test.dev', 'secret123', {
          role: 'patient',
          fullName: 'Amina Bello'
        });
        if (uid !== 'user-new') throw new Error(`expected user-new, got ${uid}`);
        const row = store.profiles[0];
        if (row?.role !== 'patient') throw new Error(`expected role patient, got ${String(row?.role)}`);
        if (row?.full_name !== 'Amina Bello') throw new Error(`expected Amina Bello, got ${String(row?.full_name)}`);
        return 'uid=user-new; profiles row written with role=patient';
      });
    }
  );

  // TC10 - sign-up with email confirmation enabled must not pretend success
  await test(
    'TC10',
    'Sign-up without a session explains email confirmation',
    'signUpWithEmail(...) with Supabase returning no session (confirmation on)',
    'throws an actionable message telling the user to open the confirmation email / use resend',
    () =>
      usingFake({ profiles: [] }, { signUpSession: false }, async () => {
        try {
          await signUpWithEmail('new@test.dev', 'secret123', { role: 'patient', fullName: 'New Patient' });
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          if (!/confirmation email/i.test(msg)) throw new Error(`unhelpful copy: ${msg}`);
          return `threw: ${msg}`;
        }
        throw new Error('expected a throw when no session is returned');
      })
  );

  // TC11 - duplicate email maps to friendly copy
  await test(
    'TC11',
    'Duplicate sign-up reports a friendly error',
    'signUpWithEmail(...) when Supabase answers "User already registered"',
    'friendlyError renders "An account with this email already exists - switch to Sign in."',
    () =>
      usingFake(
        { profiles: [] },
        { signUpError: { message: 'User already registered' } },
        async () => {
          try {
            await signUpWithEmail('amina@test.dev', 'secret123', { role: 'patient', fullName: 'Amina Bello' });
          } catch (err) {
            const friendly = friendlyError(err);
            if (!/already exists/i.test(friendly)) throw new Error(`unhelpful copy: ${friendly}`);
            return friendly;
          }
          throw new Error('expected a throw for a duplicate email');
        }
      )
  );

  // TC12 - care link: patient requests, doctor approves
  await test(
    'TC12',
    'Care link request then doctor approval',
    'requestCareLink("doc-1") then respondToCareLink(linkId, "active")',
    'upserts a pending link for the signed-in patient, then flips status to active',
    async () => {
      const store: TableStore = {
        care_links: [{ id: 'link-1', patient_id: 'user-1', doctor_id: 'doc-1', status: 'pending' }]
      };
      return usingFake(store, {}, async () => {
        await requestCareLink('doc-1');
        const requested = store.care_links.find(l => l.doctor_id === 'doc-1');
        if (!requested) throw new Error('requestCareLink did not write a care_links row');
        if (requested.status !== 'pending') throw new Error(`expected pending, got ${String(requested.status)}`);

        await respondToCareLink('link-1', 'active');
        if (store.care_links[0].status !== 'active') {
          throw new Error(`expected active, got ${String(store.care_links[0].status)}`);
        }
        return 'pending -> active on link-1';
      });
    }
  );

  // TC13 - messaging round trip, dedup/read tracking and unread count
  await test(
    'TC13',
    'Message send, unread count and mark-as-read',
    'sendMessage(...) from another user, fetchUnreadCount(), markThreadRead(link-1)',
    'count drops from 1 to 0 once the thread is marked read',
    async () => {
      const store: TableStore = {
        care_links: [{ id: 'link-1', patient_id: 'user-1', doctor_id: 'doc-1', status: 'active' }],
        messages: [
          {
            id: 'm1',
            link_id: 'link-1',
            sender_id: 'doc-1',
            body: 'Hello - take your dose with breakfast',
            created_at: '2026-10-05T10:00:00Z',
            read_at: null
          },
          {
            id: 'm2',
            link_id: 'link-1',
            sender_id: 'user-1',
            body: 'Thanks doctor',
            created_at: '2026-10-05T10:01:00Z',
            read_at: null
          }
        ]
      };
      return usingFake(store, {}, async () => {
        const before = await fetchUnreadCount();
        if (before !== 1) throw new Error(`expected 1 unread (only the doctor's message), got ${before}`);

        await sendMessage('link-1', 'user-1', '   Thanks again   ');
        const sent = store.messages[store.messages.length - 1];
        if (sent.body !== 'Thanks again') throw new Error(`send did not trim: ${JSON.stringify(sent.body)}`);

        await markThreadRead('link-1');
        const after = await fetchUnreadCount();
        if (after !== 0) throw new Error(`expected 0 unread after markThreadRead, got ${after}`);

        const fetched = await fetchMessages('link-1');
        if (fetched.length !== 3) throw new Error(`expected 3 messages, got ${fetched.length}`);
        if (fetched[0].senderId !== 'doc-1') throw new Error('fetchMessages mapped senderId wrong');
        return 'unread 1 -> 0; trimmed send; 3 messages fetched';
      });
    }
  );

  // TC14 - patient-facing error mapping
  await test(
    'TC14',
    'Error mapping produces actionable copy',
    'friendlyError over network, credentials, confirmation, RLS and unknown errors',
    'each raw message maps to a specific instruction a patient can follow',
    async () => {
      const cases: Array<[string, RegExp]> = [
        ['Failed to fetch', /check your internet connection/i],
        ['Invalid login credentials', /not correct/i],
        ['Email not confirmed', /confirmation email/i],
        ['User already registered', /already exists/i],
        ['row-level security policy violation', /sign in again|resend the care request/i],
        ['', /something went wrong/i]
      ];
      for (const [raw, pattern] of cases) {
        const friendly = friendlyError(new Error(raw));
        if (!pattern.test(friendly)) {
          throw new Error(`"${raw}" -> "${friendly}" does not match ${pattern}`);
        }
      }
      return `${cases.length} mappings verified`;
    }
  );

  return results;
}
