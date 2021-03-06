import { moduleForModel, test } from 'ember-qunit';
import Pretender from 'pretender';
import Ember from 'ember';
import wait from 'ember-test-helpers/wait';
let server;

moduleForModel('build', 'Unit | Serializer | build', {
  // Specify the other units that are required for this test.
  needs: ['serializer:build'],

  beforeEach() {
    server = new Pretender();
  },

  afterEach() {
    server.shutdown();
  }
});

test('it POSTs only a jobId for create', function (assert) {
  assert.expect(2);
  server.post('/builds', function () {
    return [200, {}, JSON.stringify({ build: { id: 'abcd' } })];
  });

  Ember.run(() => {
    const build = this.store().createRecord('build', { jobId: '1234' });

    build.save().then(() => {
      assert.equal(build.get('id'), 'abcd');
    });
  });

  return wait().then(() => {
    const [request] = server.handledRequests;
    const payload = JSON.parse(request.requestBody);

    assert.deepEqual(payload, { jobId: '1234' });
  });
});

test('it PUTs only a status for update', function (assert) {
  assert.expect(1);
  server.patch('/builds/1234', function () {
    return [200, {}, JSON.stringify({ build: { id: 1234 } })];
  });

  Ember.run(() => {
    this.store().push({
      data: {
        id: 1234,
        type: 'build',
        attributes: {
          jobId: 'abcd',
          status: 'RUNNING'
        }
      }
    });

    const build = this.store().peekRecord('build', 1234);

    build.set('status', 'ABORTED');
    build.save();
  });

  return wait().then(() => {
    const [request] = server.handledRequests;
    const payload = JSON.parse(request.requestBody);

    assert.deepEqual(payload, { status: 'ABORTED' });
  });
});
