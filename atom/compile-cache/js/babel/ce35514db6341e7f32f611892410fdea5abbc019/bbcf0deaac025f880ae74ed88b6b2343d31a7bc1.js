Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.getBufferPositionFromMouseEvent = getBufferPositionFromMouseEvent;
exports.mouseEventNearPosition = mouseEventNearPosition;
exports.hasParent = hasParent;

function getBufferPositionFromMouseEvent(event, editor, editorElement) {
  var pixelPosition = editorElement.component.pixelPositionForMouseEvent(event);
  var screenPosition = editorElement.component.screenPositionForPixelPosition(pixelPosition);
  if (Number.isNaN(screenPosition.row) || Number.isNaN(screenPosition.column)) return null;
  // ^ Workaround for NaN bug steelbrain/linter-ui-default#191
  var expectedPixelPosition = editorElement.pixelPositionForScreenPosition(screenPosition);
  var differenceTop = pixelPosition.top - expectedPixelPosition.top;
  var differenceLeft = pixelPosition.left - expectedPixelPosition.left;
  // Only allow offset of 20px - Fixes steelbrain/linter-ui-default#63
  if ((differenceTop === 0 || differenceTop > 0 && differenceTop < 20 || differenceTop < 0 && differenceTop > -20) && (differenceLeft === 0 || differenceLeft > 0 && differenceLeft < 20 || differenceLeft < 0 && differenceLeft > -20)) {
    return editor.bufferPositionForScreenPosition(screenPosition);
  }
  return null;
}

function mouseEventNearPosition(event, editorElement, screenPosition, elementWidth, elementHeight) {
  var pixelPosition = editorElement.component.pixelPositionForMouseEvent(event);
  var expectedPixelPosition = editorElement.pixelPositionForScreenPosition(screenPosition);
  var differenceTop = pixelPosition.top - expectedPixelPosition.top;
  var differenceLeft = pixelPosition.left - expectedPixelPosition.left;
  if (differenceTop === 0 && differenceLeft === 0) {
    return true;
  }
  if (differenceTop > 0 && differenceTop > elementHeight + 20 || differenceTop < 0 && differenceTop < -5) {
    return false;
  }
  if (differenceLeft > 15 && differenceTop < 17) {
    return false;
  }
  return differenceLeft > 0 && differenceLeft < elementWidth + 20 || differenceLeft < 0 && differenceLeft > -5;
}

function hasParent(element, selector) {
  do {
    if (element.matches(selector)) {
      return true;
    }
    // $FlowIgnore: It's parent is an HTMLElement, not a NODE!
    element = element.parentNode;
  } while (element && element.nodeName !== 'HTML');
  return false;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FsaXNhbGVlbWgvLmF0b20vcGFja2FnZXMvbGludGVyLXVpLWRlZmF1bHQvbGliL2VkaXRvci9oZWxwZXJzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFJTyxTQUFTLCtCQUErQixDQUFDLEtBQWlCLEVBQUUsTUFBa0IsRUFBRSxhQUFxQixFQUFVO0FBQ3BILE1BQU0sYUFBYSxHQUFHLGFBQWEsQ0FBQyxTQUFTLENBQUMsMEJBQTBCLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDL0UsTUFBTSxjQUFjLEdBQUcsYUFBYSxDQUFDLFNBQVMsQ0FBQyw4QkFBOEIsQ0FBQyxhQUFhLENBQUMsQ0FBQTtBQUM1RixNQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxFQUFFLE9BQU8sSUFBSSxDQUFBOztBQUV4RixNQUFNLHFCQUFxQixHQUFHLGFBQWEsQ0FBQyw4QkFBOEIsQ0FBQyxjQUFjLENBQUMsQ0FBQTtBQUMxRixNQUFNLGFBQWEsR0FBRyxhQUFhLENBQUMsR0FBRyxHQUFHLHFCQUFxQixDQUFDLEdBQUcsQ0FBQTtBQUNuRSxNQUFNLGNBQWMsR0FBRyxhQUFhLENBQUMsSUFBSSxHQUFHLHFCQUFxQixDQUFDLElBQUksQ0FBQTs7QUFFdEUsTUFDRSxDQUFDLGFBQWEsS0FBSyxDQUFDLElBQUssYUFBYSxHQUFHLENBQUMsSUFBSSxhQUFhLEdBQUcsRUFBRSxBQUFDLElBQUssYUFBYSxHQUFHLENBQUMsSUFBSSxhQUFhLEdBQUcsQ0FBQyxFQUFFLENBQUMsS0FDOUcsY0FBYyxLQUFLLENBQUMsSUFBSyxjQUFjLEdBQUcsQ0FBQyxJQUFJLGNBQWMsR0FBRyxFQUFFLEFBQUMsSUFBSyxjQUFjLEdBQUcsQ0FBQyxJQUFJLGNBQWMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxBQUFDLEVBQ3JIO0FBQ0EsV0FBTyxNQUFNLENBQUMsK0JBQStCLENBQUMsY0FBYyxDQUFDLENBQUE7R0FDOUQ7QUFDRCxTQUFPLElBQUksQ0FBQTtDQUNaOztBQUVNLFNBQVMsc0JBQXNCLENBQUMsS0FBaUIsRUFBRSxhQUFxQixFQUFFLGNBQXFCLEVBQUUsWUFBb0IsRUFBRSxhQUFxQixFQUFXO0FBQzVKLE1BQU0sYUFBYSxHQUFHLGFBQWEsQ0FBQyxTQUFTLENBQUMsMEJBQTBCLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDL0UsTUFBTSxxQkFBcUIsR0FBRyxhQUFhLENBQUMsOEJBQThCLENBQUMsY0FBYyxDQUFDLENBQUE7QUFDMUYsTUFBTSxhQUFhLEdBQUcsYUFBYSxDQUFDLEdBQUcsR0FBRyxxQkFBcUIsQ0FBQyxHQUFHLENBQUE7QUFDbkUsTUFBTSxjQUFjLEdBQUcsYUFBYSxDQUFDLElBQUksR0FBRyxxQkFBcUIsQ0FBQyxJQUFJLENBQUE7QUFDdEUsTUFBSSxhQUFhLEtBQUssQ0FBQyxJQUFJLGNBQWMsS0FBSyxDQUFDLEVBQUU7QUFDL0MsV0FBTyxJQUFJLENBQUE7R0FDWjtBQUNELE1BQUksQUFBQyxhQUFhLEdBQUcsQ0FBQyxJQUFJLGFBQWEsR0FBSSxhQUFhLEdBQUcsRUFBRSxBQUFDLElBQU0sYUFBYSxHQUFHLENBQUMsSUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDLEFBQUMsRUFBRTtBQUM1RyxXQUFPLEtBQUssQ0FBQTtHQUNiO0FBQ0QsTUFBSSxjQUFjLEdBQUcsRUFBRSxJQUFJLGFBQWEsR0FBRyxFQUFFLEVBQUU7QUFDN0MsV0FBTyxLQUFLLENBQUE7R0FDYjtBQUNELFNBQU8sQUFBQyxjQUFjLEdBQUcsQ0FBQyxJQUFJLGNBQWMsR0FBSSxZQUFZLEdBQUcsRUFBRSxBQUFDLElBQU0sY0FBYyxHQUFHLENBQUMsSUFBSSxjQUFjLEdBQUcsQ0FBQyxDQUFDLEFBQUMsQ0FBQTtDQUNuSDs7QUFFTSxTQUFTLFNBQVMsQ0FBQyxPQUFvQixFQUFFLFFBQWdCLEVBQVc7QUFDekUsS0FBRztBQUNELFFBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTtBQUM3QixhQUFPLElBQUksQ0FBQTtLQUNaOztBQUVELFdBQU8sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFBO0dBQzdCLFFBQVEsT0FBTyxJQUFJLE9BQU8sQ0FBQyxRQUFRLEtBQUssTUFBTSxFQUFDO0FBQ2hELFNBQU8sS0FBSyxDQUFBO0NBQ2IiLCJmaWxlIjoiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9saW50ZXItdWktZGVmYXVsdC9saWIvZWRpdG9yL2hlbHBlcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgdHlwZSB7IFBvaW50LCBUZXh0RWRpdG9yIH0gZnJvbSAnYXRvbSdcblxuZXhwb3J0IGZ1bmN0aW9uIGdldEJ1ZmZlclBvc2l0aW9uRnJvbU1vdXNlRXZlbnQoZXZlbnQ6IE1vdXNlRXZlbnQsIGVkaXRvcjogVGV4dEVkaXRvciwgZWRpdG9yRWxlbWVudDogT2JqZWN0KTogP1BvaW50IHtcbiAgY29uc3QgcGl4ZWxQb3NpdGlvbiA9IGVkaXRvckVsZW1lbnQuY29tcG9uZW50LnBpeGVsUG9zaXRpb25Gb3JNb3VzZUV2ZW50KGV2ZW50KVxuICBjb25zdCBzY3JlZW5Qb3NpdGlvbiA9IGVkaXRvckVsZW1lbnQuY29tcG9uZW50LnNjcmVlblBvc2l0aW9uRm9yUGl4ZWxQb3NpdGlvbihwaXhlbFBvc2l0aW9uKVxuICBpZiAoTnVtYmVyLmlzTmFOKHNjcmVlblBvc2l0aW9uLnJvdykgfHwgTnVtYmVyLmlzTmFOKHNjcmVlblBvc2l0aW9uLmNvbHVtbikpIHJldHVybiBudWxsXG4gIC8vIF4gV29ya2Fyb3VuZCBmb3IgTmFOIGJ1ZyBzdGVlbGJyYWluL2xpbnRlci11aS1kZWZhdWx0IzE5MVxuICBjb25zdCBleHBlY3RlZFBpeGVsUG9zaXRpb24gPSBlZGl0b3JFbGVtZW50LnBpeGVsUG9zaXRpb25Gb3JTY3JlZW5Qb3NpdGlvbihzY3JlZW5Qb3NpdGlvbilcbiAgY29uc3QgZGlmZmVyZW5jZVRvcCA9IHBpeGVsUG9zaXRpb24udG9wIC0gZXhwZWN0ZWRQaXhlbFBvc2l0aW9uLnRvcFxuICBjb25zdCBkaWZmZXJlbmNlTGVmdCA9IHBpeGVsUG9zaXRpb24ubGVmdCAtIGV4cGVjdGVkUGl4ZWxQb3NpdGlvbi5sZWZ0XG4gIC8vIE9ubHkgYWxsb3cgb2Zmc2V0IG9mIDIwcHggLSBGaXhlcyBzdGVlbGJyYWluL2xpbnRlci11aS1kZWZhdWx0IzYzXG4gIGlmIChcbiAgICAoZGlmZmVyZW5jZVRvcCA9PT0gMCB8fCAoZGlmZmVyZW5jZVRvcCA+IDAgJiYgZGlmZmVyZW5jZVRvcCA8IDIwKSB8fCAoZGlmZmVyZW5jZVRvcCA8IDAgJiYgZGlmZmVyZW5jZVRvcCA+IC0yMCkpICYmXG4gICAgKGRpZmZlcmVuY2VMZWZ0ID09PSAwIHx8IChkaWZmZXJlbmNlTGVmdCA+IDAgJiYgZGlmZmVyZW5jZUxlZnQgPCAyMCkgfHwgKGRpZmZlcmVuY2VMZWZ0IDwgMCAmJiBkaWZmZXJlbmNlTGVmdCA+IC0yMCkpXG4gICkge1xuICAgIHJldHVybiBlZGl0b3IuYnVmZmVyUG9zaXRpb25Gb3JTY3JlZW5Qb3NpdGlvbihzY3JlZW5Qb3NpdGlvbilcbiAgfVxuICByZXR1cm4gbnVsbFxufVxuXG5leHBvcnQgZnVuY3Rpb24gbW91c2VFdmVudE5lYXJQb3NpdGlvbihldmVudDogTW91c2VFdmVudCwgZWRpdG9yRWxlbWVudDogT2JqZWN0LCBzY3JlZW5Qb3NpdGlvbjogUG9pbnQsIGVsZW1lbnRXaWR0aDogbnVtYmVyLCBlbGVtZW50SGVpZ2h0OiBudW1iZXIpOiBib29sZWFuIHtcbiAgY29uc3QgcGl4ZWxQb3NpdGlvbiA9IGVkaXRvckVsZW1lbnQuY29tcG9uZW50LnBpeGVsUG9zaXRpb25Gb3JNb3VzZUV2ZW50KGV2ZW50KVxuICBjb25zdCBleHBlY3RlZFBpeGVsUG9zaXRpb24gPSBlZGl0b3JFbGVtZW50LnBpeGVsUG9zaXRpb25Gb3JTY3JlZW5Qb3NpdGlvbihzY3JlZW5Qb3NpdGlvbilcbiAgY29uc3QgZGlmZmVyZW5jZVRvcCA9IHBpeGVsUG9zaXRpb24udG9wIC0gZXhwZWN0ZWRQaXhlbFBvc2l0aW9uLnRvcFxuICBjb25zdCBkaWZmZXJlbmNlTGVmdCA9IHBpeGVsUG9zaXRpb24ubGVmdCAtIGV4cGVjdGVkUGl4ZWxQb3NpdGlvbi5sZWZ0XG4gIGlmIChkaWZmZXJlbmNlVG9wID09PSAwICYmIGRpZmZlcmVuY2VMZWZ0ID09PSAwKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuICBpZiAoKGRpZmZlcmVuY2VUb3AgPiAwICYmIGRpZmZlcmVuY2VUb3AgPiAoZWxlbWVudEhlaWdodCArIDIwKSkgfHwgKGRpZmZlcmVuY2VUb3AgPCAwICYmIGRpZmZlcmVuY2VUb3AgPCAtNSkpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuICBpZiAoZGlmZmVyZW5jZUxlZnQgPiAxNSAmJiBkaWZmZXJlbmNlVG9wIDwgMTcpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuICByZXR1cm4gKGRpZmZlcmVuY2VMZWZ0ID4gMCAmJiBkaWZmZXJlbmNlTGVmdCA8IChlbGVtZW50V2lkdGggKyAyMCkpIHx8IChkaWZmZXJlbmNlTGVmdCA8IDAgJiYgZGlmZmVyZW5jZUxlZnQgPiAtNSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhc1BhcmVudChlbGVtZW50OiBIVE1MRWxlbWVudCwgc2VsZWN0b3I6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBkbyB7XG4gICAgaWYgKGVsZW1lbnQubWF0Y2hlcyhzZWxlY3RvcikpIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICAgIC8vICRGbG93SWdub3JlOiBJdCdzIHBhcmVudCBpcyBhbiBIVE1MRWxlbWVudCwgbm90IGEgTk9ERSFcbiAgICBlbGVtZW50ID0gZWxlbWVudC5wYXJlbnROb2RlXG4gIH0gd2hpbGUgKGVsZW1lbnQgJiYgZWxlbWVudC5ub2RlTmFtZSAhPT0gJ0hUTUwnKVxuICByZXR1cm4gZmFsc2Vcbn1cbiJdfQ==