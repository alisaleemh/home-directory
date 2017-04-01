Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _validator = require("./validator");

var _validator2 = _interopRequireDefault(_validator);

var _atom = require("atom");

"use babel";

var oConfig = undefined,
    oDisposables = undefined,
    fActivate = undefined,
    fDeactivate = undefined;

exports.config = oConfig = {
    "validateOnSave": {
        "default": true,
        "description": "Make a validation each time you save an HTML file.",
        "title": "Validate on save",
        "type": "boolean"
    },
    "validateOnChange": {
        "default": false,
        "description": "Make a validation each time you change an HTML file.",
        "title": "Validate on change",
        "type": "boolean"
    },
    "hideOnNoErrors": {
        "default": false,
        "description": "Hide the panel if there was no errors.",
        "title": "Hide on no errors",
        "type": "boolean"
    },
    "useFoldModeAsDefault": {
        "default": false,
        "description": "Fold the results panel by default.",
        "title": "Use fold mode as default",
        "type": "boolean"
    },
    "cssProfile": {
        "default": "css3",
        "description": "Profile to use for CSS file validation (default: css3).",
        "enum": ["none", "css1", "css2", "css21", "css3", "svg", "svgbasic", "svgtiny", "mobile", "atsc-tv", "tv"],
        "title": "CSS Profile",
        "type": "string"
    },
    "cssMedia": {
        "default": "all",
        "description": "Media to use for CSS file validation (default: all).",
        "enum": ["all", "aural", "braille", "embossed", "handheld", "print", "projection", "screen", "tty", "tv", "presentation"],
        "title": "CSS Media",
        "type": "string"
    },
    "cssReportType": {
        "default": "normal",
        "description": "CSS Report severity (default: normal).",
        "enum": ["all", "normal", "most important", "no warnings"],
        "title": "CSS Report severity",
        "type": "string"
    }
};

exports.activate = fActivate = function () {
    var oCommand = undefined;

    oDisposables && oDisposables.dispose();
    oDisposables = new _atom.CompositeDisposable();

    oCommand = atom.commands.add("atom-text-editor:not([mini])", "w3c-validation:validate", function () {

        if (atom.workspace.getActiveTextEditor().getGrammar().scopeName.indexOf("text.html") > -1 || atom.workspace.getActiveTextEditor().getGrammar().scopeName.indexOf("source.css") > -1) {
            (0, _validator2["default"])();
        } else {
            atom.notifications.addWarning("Current file ins't HTML or CSS!");
        }
    });

    atom.config.observe("w3c-validation.validateOnSave", function (bValue) {
        atom.workspace.observeTextEditors(function (oEditor) {
            if (bValue && (oEditor.getGrammar().scopeName.indexOf("text.html") > -1 || oEditor.getGrammar().scopeName.indexOf("source.css") > -1)) {
                oEditor.getBuffer().onDidSave(_validator2["default"]);
            }
        });
    });

    atom.config.observe("w3c-validation.validateOnChange", function (bValue) {
        atom.workspace.observeTextEditors(function (oEditor) {
            if (bValue && (oEditor.getGrammar().scopeName.indexOf("text.html") > -1 || oEditor.getGrammar().scopeName.indexOf("source.css") > -1)) {
                oEditor.getBuffer().onDidChange("contents-modified", _validator2["default"]);
            }
        });
    });

    oDisposables.add(oCommand);
};

exports.deactivate = fDeactivate = function () {
    oDisposables && oDisposables.dispose();
};

exports.config = oConfig;
exports.activate = fActivate;
exports.deactivate = fDeactivate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FsaXNhbGVlbWgvLmF0b20vcGFja2FnZXMvdzNjLXZhbGlkYXRpb24vbGliL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O3lCQUVzQixhQUFhOzs7O29CQUNDLE1BQU07O0FBSDFDLFdBQVcsQ0FBQzs7QUFLWixJQUFJLE9BQU8sWUFBQTtJQUNQLFlBQVksWUFBQTtJQUNaLFNBQVMsWUFBQTtJQUNULFdBQVcsWUFBQSxDQUFDOztBQUVoQixRQXVGZSxNQUFNLEdBdkZyQixPQUFPLEdBQUc7QUFDTixvQkFBZ0IsRUFBRTtBQUNkLGlCQUFTLEVBQUUsSUFBSTtBQUNmLHFCQUFhLEVBQUUsb0RBQW9EO0FBQ25FLGVBQU8sRUFBRSxrQkFBa0I7QUFDM0IsY0FBTSxFQUFFLFNBQVM7S0FDcEI7QUFDRCxzQkFBa0IsRUFBRTtBQUNoQixpQkFBUyxFQUFFLEtBQUs7QUFDaEIscUJBQWEsRUFBRSxzREFBc0Q7QUFDckUsZUFBTyxFQUFFLG9CQUFvQjtBQUM3QixjQUFNLEVBQUUsU0FBUztLQUNwQjtBQUNELG9CQUFnQixFQUFFO0FBQ2QsaUJBQVMsRUFBRSxLQUFLO0FBQ2hCLHFCQUFhLEVBQUUsd0NBQXdDO0FBQ3ZELGVBQU8sRUFBRSxtQkFBbUI7QUFDNUIsY0FBTSxFQUFFLFNBQVM7S0FDcEI7QUFDRCwwQkFBc0IsRUFBRTtBQUNwQixpQkFBUyxFQUFFLEtBQUs7QUFDaEIscUJBQWEsRUFBRSxvQ0FBb0M7QUFDbkQsZUFBTyxFQUFFLDBCQUEwQjtBQUNuQyxjQUFNLEVBQUUsU0FBUztLQUNwQjtBQUNELGdCQUFZLEVBQUU7QUFDVixpQkFBUyxFQUFFLE1BQU07QUFDakIscUJBQWEsRUFBRSx5REFBeUQ7QUFDeEUsY0FBTSxFQUFFLENBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLElBQUks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Qzs7QUFFSixnQkFBWSxDQUFDLEdBQUcsQ0FBRSxRQUFRLENBQUUsQ0FBQztDQUNoQyxDQUFDOztBQUVGLFFBT21CLFVBQVUsR0FQN0IsV0FBVyxHQUFHLFlBQVc7QUFDckIsZ0JBQVksSUFBSSxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7Q0FDMUMsQ0FBQzs7UUFHYSxNQUFNLEdBQWpCLE9BQU87UUFDTSxRQUFRLEdBQXJCLFNBQVM7UUFDTSxVQUFVLEdBQXpCLFdBQVciLCJmaWxlIjoiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy93M2MtdmFsaWRhdGlvbi9saWIvbWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIGJhYmVsXCI7XG5cbmltcG9ydCB2YWxpZGF0b3IgZnJvbSBcIi4vdmFsaWRhdG9yXCI7XG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlIH0gZnJvbSBcImF0b21cIjtcblxubGV0IG9Db25maWcsXG4gICAgb0Rpc3Bvc2FibGVzLFxuICAgIGZBY3RpdmF0ZSxcbiAgICBmRGVhY3RpdmF0ZTtcblxub0NvbmZpZyA9IHtcbiAgICBcInZhbGlkYXRlT25TYXZlXCI6IHtcbiAgICAgICAgXCJkZWZhdWx0XCI6IHRydWUsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJNYWtlIGEgdmFsaWRhdGlvbiBlYWNoIHRpbWUgeW91IHNhdmUgYW4gSFRNTCBmaWxlLlwiLFxuICAgICAgICBcInRpdGxlXCI6IFwiVmFsaWRhdGUgb24gc2F2ZVwiLFxuICAgICAgICBcInR5cGVcIjogXCJib29sZWFuXCJcbiAgICB9LFxuICAgIFwidmFsaWRhdGVPbkNoYW5nZVwiOiB7XG4gICAgICAgIFwiZGVmYXVsdFwiOiBmYWxzZSxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIk1ha2UgYSB2YWxpZGF0aW9uIGVhY2ggdGltZSB5b3UgY2hhbmdlIGFuIEhUTUwgZmlsZS5cIixcbiAgICAgICAgXCJ0aXRsZVwiOiBcIlZhbGlkYXRlIG9uIGNoYW5nZVwiLFxuICAgICAgICBcInR5cGVcIjogXCJib29sZWFuXCJcbiAgICB9LFxuICAgIFwiaGlkZU9uTm9FcnJvcnNcIjoge1xuICAgICAgICBcImRlZmF1bHRcIjogZmFsc2UsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJIaWRlIHRoZSBwYW5lbCBpZiB0aGVyZSB3YXMgbm8gZXJyb3JzLlwiLFxuICAgICAgICBcInRpdGxlXCI6IFwiSGlkZSBvbiBubyBlcnJvcnNcIixcbiAgICAgICAgXCJ0eXBlXCI6IFwiYm9vbGVhblwiXG4gICAgfSxcbiAgICBcInVzZUZvbGRNb2RlQXNEZWZhdWx0XCI6IHtcbiAgICAgICAgXCJkZWZhdWx0XCI6IGZhbHNlLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiRm9sZCB0aGUgcmVzdWx0cyBwYW5lbCBieSBkZWZhdWx0LlwiLFxuICAgICAgICBcInRpdGxlXCI6IFwiVXNlIGZvbGQgbW9kZSBhcyBkZWZhdWx0XCIsXG4gICAgICAgIFwidHlwZVwiOiBcImJvb2xlYW5cIlxuICAgIH0sXG4gICAgXCJjc3NQcm9maWxlXCI6IHtcbiAgICAgICAgXCJkZWZhdWx0XCI6IFwiY3NzM1wiLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiUHJvZmlsZSB0byB1c2UgZm9yIENTUyBmaWxlIHZhbGlkYXRpb24gKGRlZmF1bHQ6IGNzczMpLlwiLFxuICAgICAgICBcImVudW1cIjogWyBcIm5vbmVcIiwgXCJjc3MxXCIsIFwiY3NzMlwiLCBcImNzczIxXCIsIFwiY3NzM1wiLCBcInN2Z1wiLCBcInN2Z2Jhc2ljXCIsIFwic3ZndGlueVwiLCBcIm1vYmlsZVwiLCBcImF0c2MtdHZcIiwgXCJ0dlwiIF0sXG4gICAgICAgIFwidGl0bGVcIjogXCJDU1MgUHJvZmlsZVwiLFxuICAgICAgICBcInR5cGVcIjogXCJzdHJpbmdcIlxuICAgIH0sXG4gICAgXCJjc3NNZWRpYVwiOiB7XG4gICAgICAgIFwiZGVmYXVsdFwiOiBcImFsbFwiLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiTWVkaWEgdG8gdXNlIGZvciBDU1MgZmlsZSB2YWxpZGF0aW9uIChkZWZhdWx0OiBhbGwpLlwiLFxuICAgICAgICBcImVudW1cIjogWyBcImFsbFwiLCBcImF1cmFsXCIsIFwiYnJhaWxsZVwiLCBcImVtYm9zc2VkXCIsIFwiaGFuZGhlbGRcIiwgXCJwcmludFwiLCBcInByb2plY3Rpb25cIiwgXCJzY3JlZW5cIiwgXCJ0dHlcIiwgXCJ0dlwiLCBcInByZXNlbnRhdGlvblwiIF0sXG4gICAgICAgIFwidGl0bGVcIjogXCJDU1MgTWVkaWFcIixcbiAgICAgICAgXCJ0eXBlXCI6IFwic3RyaW5nXCJcbiAgICB9LFxuICAgIFwiY3NzUmVwb3J0VHlwZVwiOiB7XG4gICAgICAgIFwiZGVmYXVsdFwiOiBcIm5vcm1hbFwiLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiQ1NTIFJlcG9ydCBzZXZlcml0eSAoZGVmYXVsdDogbm9ybWFsKS5cIixcbiAgICAgICAgXCJlbnVtXCI6IFsgXCJhbGxcIiwgXCJub3JtYWxcIiwgXCJtb3N0IGltcG9ydGFudFwiLCBcIm5vIHdhcm5pbmdzXCIgXSxcbiAgICAgICAgXCJ0aXRsZVwiOiBcIkNTUyBSZXBvcnQgc2V2ZXJpdHlcIixcbiAgICAgICAgXCJ0eXBlXCI6IFwic3RyaW5nXCJcbiAgICB9XG59O1xuXG5mQWN0aXZhdGUgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgb0NvbW1hbmQ7XG5cbiAgICBvRGlzcG9zYWJsZXMgJiYgb0Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgICBvRGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuXG4gICAgb0NvbW1hbmQgPSBhdG9tLmNvbW1hbmRzLmFkZCggXCJhdG9tLXRleHQtZWRpdG9yOm5vdChbbWluaV0pXCIsIFwidzNjLXZhbGlkYXRpb246dmFsaWRhdGVcIiwgKCkgPT4ge1xuXG4gICAgICAgIGlmICggKCBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZS5pbmRleE9mKCBcInRleHQuaHRtbFwiICkgPiAtMSApIHx8ICggYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpLmdldEdyYW1tYXIoKS5zY29wZU5hbWUuaW5kZXhPZiggXCJzb3VyY2UuY3NzXCIgKSA+IC0xICkgKSB7XG4gICAgICAgICAgICB2YWxpZGF0b3IoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKCBcIkN1cnJlbnQgZmlsZSBpbnMndCBIVE1MIG9yIENTUyFcIiApO1xuICAgICAgICB9XG4gICAgfSApO1xuXG4gICAgYXRvbS5jb25maWcub2JzZXJ2ZSggXCJ3M2MtdmFsaWRhdGlvbi52YWxpZGF0ZU9uU2F2ZVwiLCAoIGJWYWx1ZSApID0+IHtcbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzKCAoIG9FZGl0b3IgKSA9PiB7XG4gICAgICAgICAgICBpZiAoIGJWYWx1ZSAmJiAoICggb0VkaXRvci5nZXRHcmFtbWFyKCkuc2NvcGVOYW1lLmluZGV4T2YoIFwidGV4dC5odG1sXCIgKSA+IC0xICkgfHwgKCBvRWRpdG9yLmdldEdyYW1tYXIoKS5zY29wZU5hbWUuaW5kZXhPZiggXCJzb3VyY2UuY3NzXCIgKSA+IC0xICkgKSApIHtcbiAgICAgICAgICAgICAgICBvRWRpdG9yLmdldEJ1ZmZlcigpLm9uRGlkU2F2ZSggdmFsaWRhdG9yICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gKTtcbiAgICB9ICk7XG5cbiAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKCBcInczYy12YWxpZGF0aW9uLnZhbGlkYXRlT25DaGFuZ2VcIiwgKCBiVmFsdWUgKSA9PiB7XG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyggKCBvRWRpdG9yICkgPT4ge1xuICAgICAgICAgICAgaWYgKCBiVmFsdWUgJiYgKCAoIG9FZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZS5pbmRleE9mKCBcInRleHQuaHRtbFwiICkgPiAtMSApIHx8ICggb0VkaXRvci5nZXRHcmFtbWFyKCkuc2NvcGVOYW1lLmluZGV4T2YoIFwic291cmNlLmNzc1wiICkgPiAtMSApICkgKSB7XG4gICAgICAgICAgICAgICAgb0VkaXRvci5nZXRCdWZmZXIoKS5vbkRpZENoYW5nZSggXCJjb250ZW50cy1tb2RpZmllZFwiLCB2YWxpZGF0b3IgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSApO1xuICAgIH0gKTtcblxuICAgIG9EaXNwb3NhYmxlcy5hZGQoIG9Db21tYW5kICk7XG59O1xuXG5mRGVhY3RpdmF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIG9EaXNwb3NhYmxlcyAmJiBvRGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xufTtcblxuZXhwb3J0IHtcbiAgICBvQ29uZmlnIGFzIGNvbmZpZyxcbiAgICBmQWN0aXZhdGUgYXMgYWN0aXZhdGUsXG4gICAgZkRlYWN0aXZhdGUgYXMgZGVhY3RpdmF0ZVxufTtcbiJdfQ==
//# sourceURL=/home/alisaleemh/.atom/packages/w3c-validation/lib/main.js
