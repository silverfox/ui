import DS from 'ember-data';

export default DS.Model.extend({
  pipelineId: DS.attr('string'),
  name: DS.attr('string'),
  state: DS.attr('string'),
  permutations: DS.attr(),
  builds: DS.hasMany('build', { async: true })
});
