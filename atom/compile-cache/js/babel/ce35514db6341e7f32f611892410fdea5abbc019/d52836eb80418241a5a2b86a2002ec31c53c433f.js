function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _libCanvasLayer = require('../lib/canvas-layer');

var _libCanvasLayer2 = _interopRequireDefault(_libCanvasLayer);

'use babel';

describe('CanvasLayer', function () {
  var _ref = [];
  var layer = _ref[0];

  beforeEach(function () {
    layer = new _libCanvasLayer2['default']();

    layer.setSize(100, 300);
  });

  it('has two canvas', function () {
    expect(layer.canvas).toBeDefined();
    expect(layer.offscreenCanvas).toBeDefined();
  });

  it('has a context for each canvas', function () {
    expect(layer.context).toBeDefined();
    expect(layer.offscreenContext).toBeDefined();
  });

  it('disables the smoothing for the canvas', function () {
    expect(layer.canvas.webkitImageSmoothingEnabled).toBeFalsy();
    expect(layer.offscreenCanvas.webkitImageSmoothingEnabled).toBeFalsy();

    expect(layer.context.imageSmoothingEnabled).toBeFalsy();
    expect(layer.offscreenContext.imageSmoothingEnabled).toBeFalsy();
  });

  describe('.prototype.attach', function () {
    it('attaches the onscreen canvas to the provided element', function () {
      var jasmineContent = document.body.querySelector('#jasmine-content');

      layer.attach(jasmineContent);

      expect(jasmineContent.querySelector('canvas')).toExist();
    });
  });

  describe('.prototype.resetOffscreenSize', function () {
    it('sets the width of the offscreen canvas to the ', function () {
      layer.canvas.width = 500;
      layer.canvas.height = 400;

      expect(layer.offscreenCanvas.width).toEqual(100);
      expect(layer.offscreenCanvas.height).toEqual(300);

      layer.resetOffscreenSize();

      expect(layer.offscreenCanvas.width).toEqual(500);
      expect(layer.offscreenCanvas.height).toEqual(400);
    });
  });

  describe('.prototype.copyToOffscreen', function () {
    it('copies the onscreen bitmap onto the offscreen canvas', function () {
      spyOn(layer.offscreenContext, 'drawImage');

      layer.copyToOffscreen();

      expect(layer.offscreenContext.drawImage).toHaveBeenCalledWith(layer.canvas, 0, 0);
    });
  });

  describe('.prototype.copyFromOffscreen', function () {
    it('copies the offscreen bitmap onto the onscreen canvas', function () {
      spyOn(layer.context, 'drawImage');

      layer.copyFromOffscreen();

      expect(layer.context.drawImage).toHaveBeenCalledWith(layer.offscreenCanvas, 0, 0);
    });
  });

  describe('.prototype.copyPartFromOffscren', function () {
    it('copies to the onscreen canvas the region that were specified', function () {
      spyOn(layer.context, 'drawImage');

      layer.copyPartFromOffscreen(50, 100, 150);

      expect(layer.context.drawImage).toHaveBeenCalledWith(layer.offscreenCanvas, 0, 50, 100, 150, 0, 100, 100, 150);
    });
  });

  describe('.prototype.clearCanvas', function () {
    it('clears the whole canvas region', function () {
      spyOn(layer.context, 'clearRect');

      layer.clearCanvas();

      expect(layer.context.clearRect).toHaveBeenCalledWith(0, 0, layer.canvas.width, layer.canvas.height);
    });
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FsaXNhbGVlbWgvLmF0b20vcGFja2FnZXMvbWluaW1hcC9zcGVjL2NhbnZhcy1sYXllci1zcGVjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OzhCQUV3QixxQkFBcUI7Ozs7QUFGN0MsV0FBVyxDQUFBOztBQUlYLFFBQVEsQ0FBQyxhQUFhLEVBQUUsWUFBTTthQUNkLEVBQUU7TUFBWCxLQUFLOztBQUVWLFlBQVUsQ0FBQyxZQUFNO0FBQ2YsU0FBSyxHQUFHLGlDQUFpQixDQUFBOztBQUV6QixTQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQTtHQUN4QixDQUFDLENBQUE7O0FBRUYsSUFBRSxDQUFDLGdCQUFnQixFQUFFLFlBQU07QUFDekIsVUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUNsQyxVQUFNLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFBO0dBQzVDLENBQUMsQ0FBQTs7QUFFRixJQUFFLENBQUMsK0JBQStCLEVBQUUsWUFBTTtBQUN4QyxVQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBQ25DLFVBQU0sQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtHQUM3QyxDQUFDLENBQUE7O0FBRUYsSUFBRSxDQUFDLHVDQUF1QyxFQUFFLFlBQU07QUFDaEQsVUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQTtBQUM1RCxVQUFNLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFBOztBQUVyRSxVQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFBO0FBQ3ZELFVBQU0sQ0FBQyxLQUFL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Q0FDakIsQ0FBQTtLQUNGLENBQUMsQ0FBQTtHQUNILENBQUMsQ0FBQTs7QUFFRixVQUFRLENBQUMsd0JBQXdCLEVBQUUsWUFBTTtBQUN2QyxNQUFFLENBQUMsZ0NBQWdDLEVBQUUsWUFBTTtBQUN6QyxXQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUMsQ0FBQTs7QUFFakMsV0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFBOztBQUVuQixZQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUE7S0FDcEcsQ0FBQyxDQUFBO0dBQ0gsQ0FBQyxDQUFBO0NBQ0gsQ0FBQyxDQUFBIiwiZmlsZSI6Ii9ob21lL2FsaXNhbGVlbWgvLmF0b20vcGFja2FnZXMvbWluaW1hcC9zcGVjL2NhbnZhcy1sYXllci1zcGVjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IENhbnZhc0xheWVyIGZyb20gJy4uL2xpYi9jYW52YXMtbGF5ZXInXG5cbmRlc2NyaWJlKCdDYW52YXNMYXllcicsICgpID0+IHtcbiAgbGV0IFtsYXllcl0gPSBbXVxuXG4gIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgIGxheWVyID0gbmV3IENhbnZhc0xheWVyKClcblxuICAgIGxheWVyLnNldFNpemUoMTAwLCAzMDApXG4gIH0pXG5cbiAgaXQoJ2hhcyB0d28gY2FudmFzJywgKCkgPT4ge1xuICAgIGV4cGVjdChsYXllci5jYW52YXMpLnRvQmVEZWZpbmVkKClcbiAgICBleHBlY3QobGF5ZXIub2Zmc2NyZWVuQ2FudmFzKS50b0JlRGVmaW5lZCgpXG4gIH0pXG5cbiAgaXQoJ2hhcyBhIGNvbnRleHQgZm9yIGVhY2ggY2FudmFzJywgKCkgPT4ge1xuICAgIGV4cGVjdChsYXllci5jb250ZXh0KS50b0JlRGVmaW5lZCgpXG4gICAgZXhwZWN0KGxheWVyLm9mZnNjcmVlbkNvbnRleHQpLnRvQmVEZWZpbmVkKClcbiAgfSlcblxuICBpdCgnZGlzYWJsZXMgdGhlIHNtb290aGluZyBmb3IgdGhlIGNhbnZhcycsICgpID0+IHtcbiAgICBleHBlY3QobGF5ZXIuY2FudmFzLndlYmtpdEltYWdlU21vb3RoaW5nRW5hYmxlZCkudG9CZUZhbHN5KClcbiAgICBleHBlY3QobGF5ZXIub2Zmc2NyZWVuQ2FudmFzLndlYmtpdEltYWdlU21vb3RoaW5nRW5hYmxlZCkudG9CZUZhbHN5KClcblxuICAgIGV4cGVjdChsYXllci5jb250ZXh0LmltYWdlU21vb3RoaW5nRW5hYmxlZCkudG9CZUZhbHN5KClcbiAgICBleHBlY3QobGF5ZXIub2Zmc2NyZWVuQ29udGV4dC5pbWFnZVNtb290aGluZ0VuYWJsZWQpLnRvQmVGYWxzeSgpXG4gIH0pXG5cbiAgZGVzY3JpYmUoJy5wcm90b3R5cGUuYXR0YWNoJywgKCkgPT4ge1xuICAgIGl0KCdhdHRhY2hlcyB0aGUgb25zY3JlZW4gY2FudmFzIHRvIHRoZSBwcm92aWRlZCBlbGVtZW50JywgKCkgPT4ge1xuICAgICAgbGV0IGphc21pbmVDb250ZW50ID0gZG9jdW1lbnQuYm9keS5xdWVyeVNlbGVjdG9yKCcjamFzbWluZS1jb250ZW50JylcblxuICAgICAgbGF5ZXIuYXR0YWNoKGphc21pbmVDb250ZW50KVxuXG4gICAgICBleHBlY3QoamFzbWluZUNvbnRlbnQucXVlcnlTZWxlY3RvcignY2FudmFzJykpLnRvRXhpc3QoKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJy5wcm90b3R5cGUucmVzZXRPZmZzY3JlZW5TaXplJywgKCkgPT4ge1xuICAgIGl0KCdzZXRzIHRoZSB3aWR0aCBvZiB0aGUgb2Zmc2NyZWVuIGNhbnZhcyB0byB0aGUgJywgKCkgPT4ge1xuICAgICAgbGF5ZXIuY2FudmFzLndpZHRoID0gNTAwXG4gICAgICBsYXllci5jYW52YXMuaGVpZ2h0ID0gNDAwXG5cbiAgICAgIGV4cGVjdChsYXllci5vZmZzY3JlZW5DYW52YXMud2lkdGgpLnRvRXF1YWwoMTAwKVxuICAgICAgZXhwZWN0KGxheWVyLm9mZnNjcmVlbkNhbnZhcy5oZWlnaHQpLnRvRXF1YWwoMzAwKVxuXG4gICAgICBsYXllci5yZXNldE9mZnNjcmVlblNpemUoKVxuXG4gICAgICBleHBlY3QobGF5ZXIub2Zmc2NyZWVuQ2FudmFzLndpZHRoKS50b0VxdWFsKDUwMClcbiAgICAgIGV4cGVjdChsYXllci5vZmZzY3JlZW5DYW52YXMuaGVpZ2h0KS50b0VxdWFsKDQwMClcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCcucHJvdG90eXBlLmNvcHlUb09mZnNjcmVlbicsICgpID0+IHtcbiAgICBpdCgnY29waWVzIHRoZSBvbnNjcmVlbiBiaXRtYXAgb250byB0aGUgb2Zmc2NyZWVuIGNhbnZhcycsICgpID0+IHtcbiAgICAgIHNweU9uKGxheWVyLm9mZnNjcmVlbkNvbnRleHQsICdkcmF3SW1hZ2UnKVxuXG4gICAgICBsYXllci5jb3B5VG9PZmZzY3JlZW4oKVxuXG4gICAgICBleHBlY3QobGF5ZXIub2Zmc2NyZWVuQ29udGV4dC5kcmF3SW1hZ2UpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKGxheWVyLmNhbnZhcywgMCwgMClcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCcucHJvdG90eXBlLmNvcHlGcm9tT2Zmc2NyZWVuJywgKCkgPT4ge1xuICAgIGl0KCdjb3BpZXMgdGhlIG9mZnNjcmVlbiBiaXRtYXAgb250byB0aGUgb25zY3JlZW4gY2FudmFzJywgKCkgPT4ge1xuICAgICAgc3B5T24obGF5ZXIuY29udGV4dCwgJ2RyYXdJbWFnZScpXG5cbiAgICAgIGxheWVyLmNvcHlGcm9tT2Zmc2NyZWVuKClcblxuICAgICAgZXhwZWN0KGxheWVyLmNvbnRleHQuZHJhd0ltYWdlKS50b0hhdmVCZWVuQ2FsbGVkV2l0aChsYXllci5vZmZzY3JlZW5DYW52YXMsIDAsIDApXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnLnByb3RvdHlwZS5jb3B5UGFydEZyb21PZmZzY3JlbicsICgpID0+IHtcbiAgICBpdCgnY29waWVzIHRvIHRoZSBvbnNjcmVlbiBjYW52YXMgdGhlIHJlZ2lvbiB0aGF0IHdlcmUgc3BlY2lmaWVkJywgKCkgPT4ge1xuICAgICAgc3B5T24obGF5ZXIuY29udGV4dCwgJ2RyYXdJbWFnZScpXG5cbiAgICAgIGxheWVyLmNvcHlQYXJ0RnJvbU9mZnNjcmVlbig1MCwgMTAwLCAxNTApXG5cbiAgICAgIGV4cGVjdChsYXllci5jb250ZXh0LmRyYXdJbWFnZSkudG9IYXZlQmVlbkNhbGxlZFdpdGgoXG4gICAgICAgIGxheWVyLm9mZnNjcmVlbkNhbnZhcyxcbiAgICAgICAgMCwgNTAsIDEwMCwgMTUwLFxuICAgICAgICAwLCAxMDAsIDEwMCwgMTUwXG4gICAgICApXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnLnByb3RvdHlwZS5jbGVhckNhbnZhcycsICgpID0+IHtcbiAgICBpdCgnY2xlYXJzIHRoZSB3aG9sZSBjYW52YXMgcmVnaW9uJywgKCkgPT4ge1xuICAgICAgc3B5T24obGF5ZXIuY29udGV4dCwgJ2NsZWFyUmVjdCcpXG5cbiAgICAgIGxheWVyLmNsZWFyQ2FudmFzKClcblxuICAgICAgZXhwZWN0KGxheWVyLmNvbnRleHQuY2xlYXJSZWN0KS50b0hhdmVCZWVuQ2FsbGVkV2l0aCgwLCAwLCBsYXllci5jYW52YXMud2lkdGgsIGxheWVyLmNhbnZhcy5oZWlnaHQpXG4gICAgfSlcbiAgfSlcbn0pXG4iXX0=
//# sourceURL=/home/alisaleemh/.atom/packages/minimap/spec/canvas-layer-spec.js
