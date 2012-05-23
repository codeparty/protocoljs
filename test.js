var protocol = require('./index')
  , expect = require('expect.js');

describe('protocol implementation', function () {
  describe('for basic types', function () {
    var Sequence = protocol({
      first: [protocol]
    , rest: [protocol]
    });

    Sequence(String, {
      first: function (str) { return str.charAt(0); }
    , rest:  function (str) { return str.slice(1); }
    });

    Sequence(Array, {
      first: function (a) { return a[0]; }
    , rest:  function (a) { return a.slice(1); }
    });

    it('should be able to invoke the proper implementation for > 1 type', function () {
      expect(Sequence.first('abcd')).to.equal('a');
      expect(Sequence.rest('abcd')).to.equal('bcd');
      expect(Sequence.first([1, 2, 3, 4])).to.equal(1);
      expect(Sequence.rest([1, 2, 3, 4])).to.eql([2, 3, 4]);
    });

    it('should be able to re-open protocols', function () {
      protocol(Sequence, { reverse: [protocol] });
      Sequence(String, {
        reverse: function (str) {
          var rev = '';
          for (var i = str.length; i--; ) {
            rev += str[i];
          }
          return rev;
        }
      });
      expect(Sequence.reverse('abc')).to.equal('cba');
    });

    it('should support multiple arguments', function () {
      protocol(Sequence, { slice: [protocol, ('start', Number), ('end', Number)] });
      Sequence(String, {
        slice: function (string, start, end) {
          return string.substring(start, end);
        }
      });
      Sequence(Array, {
        slice: function (array, start, end) {
          return array.slice(start, end);
        }
      });
      expect(Sequence.slice('abc', 0, 1)).to.equal('a');
      expect(Sequence.slice([1, 2, 3], 0, 1)).to.eql([1]);
    });


    it('should support the type as not necessarily the 1st argument', function () {
      protocol(Sequence, { repeat: [Number, protocol] });
      Sequence(String, {
        repeat: function (times, string) {
          var result = '';
          while (times--) result += string;
          return result;
        }
      });

      Sequence(Array, {
        repeat: function (times, array) {
          var result = [];
          while (times--) result = result.concat(array);
          return result;
        }
      });

      expect(Sequence.repeat(3, 'ab')).to.equal('ababab');
      expect(Sequence.repeat(2, [1, 2])).to.eql([1, 2, 1, 2]);
    });

    it('should support more than 1 protocol with overlapping method names', function () {
      var Arbitrary = protocol({
        first: [protocol]
      , rest: [protocol]
      });

      Arbitrary(String, {
        first: function (str) { return 'first'; }
      , rest: function (str) { return 'rest'; }
      });

      Arbitrary(Array, {
        first: function (arr) { return 'first'.split(''); }
      , rest: function (arr) { return 'rest'.split(''); }
      });

      expect(Sequence.first('abc')).to.equal('a');
      expect(Sequence.rest('abc')).to.equal('bc');
      expect(Sequence.first([0])).to.equal(0);
      expect(Sequence.rest([0])).to.eql([]);

      expect(Arbitrary.first('abc')).to.equal('first');
      expect(Arbitrary.rest('abc')).to.equal('rest');
      expect(Arbitrary.first([0])).to.eql(['f','i','r','s','t']);
      expect(Arbitrary.rest([0])).to.eql(['r','e','s','t']);
    });
  });

  describe('for non-basic types', function () {
    function Human () {}
    Human.prototype.protocolId = 'human';

    function Dog () {}
    Dog.prototype.protocolId = 'dog';

    var Talker = protocol({
      speak: [protocol]
    });

    Talker(Human, { speak: function (h) { return 'hello'; } });
    Talker(Dog, { speak: function (d) { return 'woof'; } });

    it('should invoke the proper implementation for > 1 type', function () {
      var human = new Human();
      expect(Talker.speak(human)).to.equal('hello');
      var dog = new Dog();
      expect(Talker.speak(dog)).to.equal('woof');
    });
  });

  describe('for inherited types', function () {
    function User () {}
    User.prototype.protocolId = 'user';

    function Guest () {}
    Guest.prototype = new User();

    function Admin () {}
    Admin.prototype = new User();
    Admin.prototype.protocolId = 'admin';

    var Actor = protocol({ access: [protocol] });

    Actor(User, { access: function () { return 'denied'; } });
    Actor(Admin, { access: function () { return 'accepted'; } });

    it('should invoke the ancestor method if it inherits a protocolId', function () {
      expect(Actor.access(new Guest())).to.equal('denied');
    });

    it('should invoke its own method if it defines its own protocolId', function () {
      expect(Actor.access(new Admin())).to.equal('accepted');
    });
  });
});
