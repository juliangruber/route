var request = require('supertest');
var koa = require('koa');
var methods = require('methods').map(function(method){
  // normalize method names for tests
  if (method == 'delete') method = 'del';
  if (method == 'connect') return; // WTF
  return method;
}).filter(Boolean)

var route = require('../');

describe('Koa Route', function(){
  methods.forEach(function(method){
    var app = koa();
    app.use(route[method]('/:user(tj)', function*(user){
      this.body = user;
    }))

    describe('route.' + method + '()', function(){
      describe('when method and path match', function(){
        it('should 200', function(done){
          request(app.listen())
          [method]('/tj')
          .expect(200)
          .expect(method === 'head' ? '' : 'tj', done);
        })
      })

      describe('when only method matches', function(){
        it('should 404', function(done){
          request(app.listen())
          [method]('/tjayyyy')
          .expect(404, done);
        })
      })

      describe('when only path matches', function(){
        it('should 404', function(done){
          request(app.listen())
          [method === 'get' ? 'post' : 'get']('/tj')
          .expect(404, done);
        })
      })
    })
  })

  describe('route.all()', function(){
    describe('should work with', function(){
      methods.forEach(function(method){
        var app = koa();
        app.use(route.all('/:user(tj)', function*(user){
          this.body = user;
        }))

        it(method, function(done){
          request(app.listen())
          [method]('/tj')
          .expect(200)
          .expect(method === 'head' ? '' : 'tj', done);
        })
      })
    })

    describe('when patch does not match', function(){
      it('should 404', function (done){
        var app = koa();
        app.use(route.all('/:user(tj)', function*(user){
          this.body = user;
        }))

        request(app.listen())
        .get('/tjayyyyyy')
        .expect(404, done);
      })
    })
  })
  
  describe('arguments', function(){
    it('should pass keys', function(done){
      var app = koa();
      app.use(route.get('/:user/:repo/:commit', function*(user, repo, commit){
        this.body = user + '/' + repo + '#' + commit;
      }))
      
      request(app.listen())
      .get('/koajs/koa/1337')
      .expect('koajs/koa#1337', done);
    })
    
    it('should pass `next`', function(done){
      var app = koa();
      app.use(route.get('/:user(tj)', function*(user, next){
        this.user = user;
        yield next;
      }));
      app.use(function*(){
        this.body = this.user;
      });
      
      request(app.listen())
      .get('/tj')
      .expect('tj', done);
    })
  })
})