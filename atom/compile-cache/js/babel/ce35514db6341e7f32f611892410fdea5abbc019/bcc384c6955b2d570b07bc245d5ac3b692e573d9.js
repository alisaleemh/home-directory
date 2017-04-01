Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _atomMessagePanel = require("atom-message-panel");

var _w3cjs = require("w3cjs");

var _w3cjs2 = _interopRequireDefault(_w3cjs);

var _w3cCss = require("w3c-css");

var _w3cCss2 = _interopRequireDefault(_w3cCss);

"use babel";

var sHTMLPanelTitle = '<span class="icon-microscope"></span> W3C Markup Validation Service Report',
    sCSSPanelTitle = '<span class="icon-microscope"></span> W3C CSS Validation Service Report',
    oMessagesPanel = new _atomMessagePanel.MessagePanelView({
    "rawTitle": true,
    "closeMethod": "destroy"
}),
    fValidate = undefined,
    fShowError = undefined,
    fShowResults = undefined;

fShowError = function (oError) {
    oMessagesPanel.clear();
    oMessagesPanel.add(new _atomMessagePanel.PlainMessageView({
        "message": '<span class="icon-alert"></span> Validation fails with error.',
        "preview": oError.message,
        "raw": true,
        "className": "text-error"
    }));
};

fShowResults = function (oEditor, aMessages) {
    var iErrorCount = 0,
        iWarningCount = 0,
        aFilteredMessages = undefined,
        sErrorReport = undefined,
        sWarningReport = undefined;

    oMessagesPanel.clear();
    aFilteredMessages = aMessages.filter(function (oMessage) {
        return oMessage.type !== "info";
    });
    if (aFilteredMessages.length === 0) {
        if (atom.config.get("w3c-validation.hideOnNoErrors")) {
            return oMessagesPanel.close();
        }
        oMessagesPanel.add(new _atomMessagePanel.PlainMessageView({
            "message": '<span class="icon-check"></span> No errors were found !',
            "raw": true,
            "className": "text-success"
        }));
        return;
    }
    for (var oMessage of aFilteredMessages) {
        if (oMessage.type !== "info") {
            oMessage.type === "error" && iErrorCount++;
            oMessage.type === "warning" && iWarningCount++;
            oMessagesPanel.add(new _atomMessagePanel.LineMessageView({
                "character": oMessage.lastColumn,
                "className": "text-" + oMessage.type,
                "line": oMessage.lastLine,
                "message": oMessage.message,
                "preview": (oEditor.lineTextForBufferRow(oMessage.lastLine - 1) || "").trim()
            }));
        }
    }
    sErrorReport = iErrorCount + " error" + (iErrorCount > 1 ? "s" : "");
    sWarningReport = iWarningCount + " warning" + (iWarningCount > 1 ? "s" : "");
    oMessagesPanel.setTitle(oMessagesPanel.heading.html() + " (" + sErrorReport + ", " + sWarningReport + ")", true);
};

fValidate = function () {
    var oEditor = undefined,
        oValidatorOptions = undefined;

    if (!(oEditor = atom.workspace.getActiveTextEditor())) {
        return;
    }

    oMessagesPanel.clear();
    oMessagesPanel.setTitle(oEditor.getGrammar().scopeName.indexOf("css") > -1 ? sCSSPanelTitle : sHTMLPanelTitle, true);
    oMessagesPanel.attach();

    if (atom.config.get("w3c-validation.useFoldModeAsDefault") && oMessagesPanel.summary.css("display") === "none") {
        oMessagesPanel.toggle();
    }

    oMessagesPanel.add(new _atomMessagePanel.PlainMessageView({
        "message": '<span class="icon-hourglass"></span> Validation pending (this can take some time)...',
        "raw": true,
        "className": "text-info"
    }));

    if (oEditor.getGrammar().scopeName.indexOf("html") > -1) {
        oValidatorOptions = {
            "input": oEditor.getText(),
            callback: function callback(oResponse) {
                if (!oResponse || !oResponse.messages) {
                    oMessagesPanel.add(new _atomMessagePanel.PlainMessageView({
                        "message": '<span class="icon-alert"></span> Validation fails without error.',
                        "raw": true,
                        "className": "text-error"
                    }));
                    return;
                }
                fShowResults(oEditor, oResponse.messages);
            }
        };

        try {
            _w3cjs2["default"].validate(oValidatorOptions);
        } catch (oError) {
            fShowError(oError);
        }
    }

    if (oEditor.getGrammar().scopeName.indexOf("css") > -1) {
        oValidatorOptions = {
            "text": oEditor.getText(),
            "profile": atom.config.get("w3c-validation.cssProfile"),
            "medium": atom.config.get("w3c-validation.cssMedia")
        };
        switch (atom.config.get("w3c-validation.cssReportType")) {
            case "all":
                oValidatorOptions.warnings = 2;
                break;
            case "most important":
                oValidatorOptions.warnings = 0;
                break;
            case "no warnings":
                oValidatorOptions.warnings = "no";
                break;
            default:
                oValidatorOptions.warnings = 1;
                break;
        }
        try {
            _w3cCss2["default"].validate(oValidatorOptions, function (oError, aResults) {
                var aParsedErrors = undefined,
                    aParsedWarnings = undefined;

                if (oError) {
                    fShowError(oError);
                    return;
                }
                aParsedErrors = (aResults.errors || []).map(function (oMessage) {
                    return {
                        "lastLine": oMessage.line,
                        "type": "error",
                        "message": oMessage.message
                    };
                });
                aParsedWarnings = (aResults.warnings || []).map(function (oMessage) {
                    return {
                        "lastLine": oMessage.line,
                        "type": "warning",
                        "message": oMessage.message
                    };
                });
                fShowResults(oEditor, [].concat(aParsedErrors, aParsedWarnings));
            });
        } catch (oError) {
            fShowError(oError);
        }
    }
};

exports["default"] = fValidate;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FsaXNhbGVlbWgvLmF0b20vcGFja2FnZXMvdzNjLXZhbGlkYXRpb24vbGliL3ZhbGlkYXRvci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Z0NBRW9FLG9CQUFvQjs7cUJBQzNELE9BQU87Ozs7c0JBQ1IsU0FBUzs7OztBQUpyQyxXQUFXLENBQUM7O0FBTVosSUFBSSxlQUFlLEdBQUcsNEVBQTRFO0lBQzlGLGNBQWMsR0FBRyx5RUFBeUU7SUFDMUYsY0FBYyxHQUFHLHVDQUFzQjtBQUNuQyxjQUFVLEVBQUUsSUFBSTtBQUNoQixpQkFBYSxFQUFFLFNBQVM7Q0FDM0IsQ0FBRTtJQUNILFNBQVMsWUFBQTtJQUNULFVBQVUsWUFBQTtJQUNWLFlBQVksWUFBQSxDQUFDOztBQUVqQixVQUFVLEdBQUcsVUFBVSxNQUFNLEVBQUc7QUFDNUIsa0JBQWMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUN2QixrQkFBYyxDQUFDLEdBQUcsQ0FBRSx1Q0FBc0I7QUFDdEMsaUJBQVMsRUFBRSwrREFBK0Q7QUFDMUUsaUJBQVMsRUFBRSxNQUFNLENBQUMsT0FBTztBQUN6QixhQUFLLEVBQUUsSUFBSTtBQUNYLG1CQUFXLEVBQUUsWUFBWTtLQUM1QixDQUFFLENBQUUsQ0FBQztDQUNULENBQUM7O0FBRUYsWUFBWSxHQUFHLFVBQVUsT0FBTyxFQUFFLFNBQVMsRUFBRztBQUMxQyxRQUFJLFdBQVcsR0FBRyxDQUFDO1FBQ2YsYUFBYSxHQUFHLENBQUM7UUFDakIsaUJBQWlCLFlBQUE7UUFBRSxZQUFZLFlBQUE7UUFBRSxjQUFjLFlBQUEsQ0FBQzs7QUFFcEQsa0JBQWMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUN2QixxQkFBaUIsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFFLFVBQUUsUUFBUSxFQUFNO0FBQ2xELGVBQU8sUUFBUSxDQUFDLElBQUksS0FBSyxNQUFNLENBQUM7S0FDbkMsQ0FBRSxDQUFDO0FBQ0osUUFBSyxpQkFBaUIsQ0FBQyxNQUFNLEtBQUss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dzNjLXZhbGlkYXRpb24vbGliL3ZhbGlkYXRvci5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIGJhYmVsXCI7XG5cbmltcG9ydCB7IE1lc3NhZ2VQYW5lbFZpZXcsIExpbmVNZXNzYWdlVmlldywgUGxhaW5NZXNzYWdlVmlldyB9IGZyb20gXCJhdG9tLW1lc3NhZ2UtcGFuZWxcIjtcbmltcG9ydCBXM0NIVE1MVmFsaWRhdG9yIGZyb20gXCJ3M2Nqc1wiO1xuaW1wb3J0IFczQ0NTU1ZhbGlkYXRvciBmcm9tIFwidzNjLWNzc1wiO1xuXG5sZXQgc0hUTUxQYW5lbFRpdGxlID0gJzxzcGFuIGNsYXNzPVwiaWNvbi1taWNyb3Njb3BlXCI+PC9zcGFuPiBXM0MgTWFya3VwIFZhbGlkYXRpb24gU2VydmljZSBSZXBvcnQnLFxuICAgIHNDU1NQYW5lbFRpdGxlID0gJzxzcGFuIGNsYXNzPVwiaWNvbi1taWNyb3Njb3BlXCI+PC9zcGFuPiBXM0MgQ1NTIFZhbGlkYXRpb24gU2VydmljZSBSZXBvcnQnLFxuICAgIG9NZXNzYWdlc1BhbmVsID0gbmV3IE1lc3NhZ2VQYW5lbFZpZXcoIHtcbiAgICAgICAgXCJyYXdUaXRsZVwiOiB0cnVlLFxuICAgICAgICBcImNsb3NlTWV0aG9kXCI6IFwiZGVzdHJveVwiXG4gICAgfSApLFxuICAgIGZWYWxpZGF0ZSxcbiAgICBmU2hvd0Vycm9yLFxuICAgIGZTaG93UmVzdWx0cztcblxuZlNob3dFcnJvciA9IGZ1bmN0aW9uKCBvRXJyb3IgKSB7XG4gICAgb01lc3NhZ2VzUGFuZWwuY2xlYXIoKTtcbiAgICBvTWVzc2FnZXNQYW5lbC5hZGQoIG5ldyBQbGFpbk1lc3NhZ2VWaWV3KCB7XG4gICAgICAgIFwibWVzc2FnZVwiOiAnPHNwYW4gY2xhc3M9XCJpY29uLWFsZXJ0XCI+PC9zcGFuPiBWYWxpZGF0aW9uIGZhaWxzIHdpdGggZXJyb3IuJyxcbiAgICAgICAgXCJwcmV2aWV3XCI6IG9FcnJvci5tZXNzYWdlLFxuICAgICAgICBcInJhd1wiOiB0cnVlLFxuICAgICAgICBcImNsYXNzTmFtZVwiOiBcInRleHQtZXJyb3JcIlxuICAgIH0gKSApO1xufTtcblxuZlNob3dSZXN1bHRzID0gZnVuY3Rpb24oIG9FZGl0b3IsIGFNZXNzYWdlcyApIHtcbiAgICBsZXQgaUVycm9yQ291bnQgPSAwLFxuICAgICAgICBpV2FybmluZ0NvdW50ID0gMCxcbiAgICAgICAgYUZpbHRlcmVkTWVzc2FnZXMsIHNFcnJvclJlcG9ydCwgc1dhcm5pbmdSZXBvcnQ7XG5cbiAgICBvTWVzc2FnZXNQYW5lbC5jbGVhcigpO1xuICAgIGFGaWx0ZXJlZE1lc3NhZ2VzID0gYU1lc3NhZ2VzLmZpbHRlciggKCBvTWVzc2FnZSApID0+IHtcbiAgICAgICAgcmV0dXJuIG9NZXNzYWdlLnR5cGUgIT09IFwiaW5mb1wiO1xuICAgIH0gKTtcbiAgICBpZiAoIGFGaWx0ZXJlZE1lc3NhZ2VzLmxlbmd0aCA9PT0gMCApIHtcbiAgICAgICAgaWYgKCBhdG9tLmNvbmZpZy5nZXQoIFwidzNjLXZhbGlkYXRpb24uaGlkZU9uTm9FcnJvcnNcIiApICkge1xuICAgICAgICAgICAgcmV0dXJuIG9NZXNzYWdlc1BhbmVsLmNsb3NlKCk7XG4gICAgICAgIH1cbiAgICAgICAgb01lc3NhZ2VzUGFuZWwuYWRkKCBuZXcgUGxhaW5NZXNzYWdlVmlldygge1xuICAgICAgICAgICAgXCJtZXNzYWdlXCI6ICc8c3BhbiBjbGFzcz1cImljb24tY2hlY2tcIj48L3NwYW4+IE5vIGVycm9ycyB3ZXJlIGZvdW5kICEnLFxuICAgICAgICAgICAgXCJyYXdcIjogdHJ1ZSxcbiAgICAgICAgICAgIFwiY2xhc3NOYW1lXCI6IFwidGV4dC1zdWNjZXNzXCJcbiAgICAgICAgfSApICk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZm9yICggbGV0IG9NZXNzYWdlIG9mIGFGaWx0ZXJlZE1lc3NhZ2VzICkge1xuICAgICAgICBpZiAoIG9NZXNzYWdlLnR5cGUgIT09IFwiaW5mb1wiICkge1xuICAgICAgICAgICAgKCBvTWVzc2FnZS50eXBlID09PSBcImVycm9yXCIgKSAmJiBpRXJyb3JDb3VudCsrO1xuICAgICAgICAgICAgKCBvTWVzc2FnZS50eXBlID09PSBcIndhcm5pbmdcIiApICYmIGlXYXJuaW5nQ291bnQrKztcbiAgICAgICAgICAgIG9NZXNzYWdlc1BhbmVsLmFkZCggbmV3IExpbmVNZXNzYWdlVmlldygge1xuICAgICAgICAgICAgICAgIFwiY2hhcmFjdGVyXCI6IG9NZXNzYWdlLmxhc3RDb2x1bW4sXG4gICAgICAgICAgICAgICAgXCJjbGFzc05hbWVcIjogYHRleHQtJHsgb01lc3NhZ2UudHlwZSB9YCxcbiAgICAgICAgICAgICAgICBcImxpbmVcIjogb01lc3NhZ2UubGFzdExpbmUsXG4gICAgICAgICAgICAgICAgXCJtZXNzYWdlXCI6IG9NZXNzYWdlLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgXCJwcmV2aWV3XCI6ICggb0VkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyggb01lc3NhZ2UubGFzdExpbmUgLSAxICkgfHwgXCJcIiApLnRyaW0oKVxuICAgICAgICAgICAgfSApICk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgc0Vycm9yUmVwb3J0ID0gYCR7IGlFcnJvckNvdW50IH0gZXJyb3IkeyBpRXJyb3JDb3VudCA+IDEgPyBcInNcIiA6IFwiXCIgfWA7XG4gICAgc1dhcm5pbmdSZXBvcnQgPSBgJHsgaVdhcm5pbmdDb3VudCB9IHdhcm5pbmckeyBpV2FybmluZ0NvdW50ID4gMSA/IFwic1wiIDogXCJcIiB9YDtcbiAgICBvTWVzc2FnZXNQYW5lbC5zZXRUaXRsZSggYCR7IG9NZXNzYWdlc1BhbmVsLmhlYWRpbmcuaHRtbCgpIH0gKCR7IHNFcnJvclJlcG9ydCB9LCAkeyBzV2FybmluZ1JlcG9ydCB9KWAsIHRydWUgKTtcbn07XG5cbmZWYWxpZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBvRWRpdG9yLFxuICAgICAgICBvVmFsaWRhdG9yT3B0aW9ucztcblxuICAgIGlmICggISggb0VkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKSApICkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgb01lc3NhZ2VzUGFuZWwuY2xlYXIoKTtcbiAgICBvTWVzc2FnZXNQYW5lbC5zZXRUaXRsZSggKCBvRWRpdG9yLmdldEdyYW1tYXIoKS5zY29wZU5hbWUuaW5kZXhPZiggXCJjc3NcIiApID4gLTEgPyBzQ1NTUGFuZWxUaXRsZSA6IHNIVE1MUGFuZWxUaXRsZSApLCB0cnVlICk7XG4gICAgb01lc3NhZ2VzUGFuZWwuYXR0YWNoKCk7XG5cbiAgICBpZiAoIGF0b20uY29uZmlnLmdldCggXCJ3M2MtdmFsaWRhdGlvbi51c2VGb2xkTW9kZUFzRGVmYXVsdFwiICkgJiYgb01lc3NhZ2VzUGFuZWwuc3VtbWFyeS5jc3MoIFwiZGlzcGxheVwiICkgPT09IFwibm9uZVwiICkge1xuICAgICAgICBvTWVzc2FnZXNQYW5lbC50b2dnbGUoKTtcbiAgICB9XG5cbiAgICBvTWVzc2FnZXNQYW5lbC5hZGQoIG5ldyBQbGFpbk1lc3NhZ2VWaWV3KCB7XG4gICAgICAgIFwibWVzc2FnZVwiOiAnPHNwYW4gY2xhc3M9XCJpY29uLWhvdXJnbGFzc1wiPjwvc3Bhbj4gVmFsaWRhdGlvbiBwZW5kaW5nICh0aGlzIGNhbiB0YWtlIHNvbWUgdGltZSkuLi4nLFxuICAgICAgICBcInJhd1wiOiB0cnVlLFxuICAgICAgICBcImNsYXNzTmFtZVwiOiBcInRleHQtaW5mb1wiXG4gICAgfSApICk7XG5cbiAgICBpZiAoIG9FZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZS5pbmRleE9mKCBcImh0bWxcIiApID4gLTEgKSB7XG4gICAgICAgIG9WYWxpZGF0b3JPcHRpb25zID0ge1xuICAgICAgICAgICAgXCJpbnB1dFwiOiBvRWRpdG9yLmdldFRleHQoKSxcbiAgICAgICAgICAgIGNhbGxiYWNrKCBvUmVzcG9uc2UgKSB7XG4gICAgICAgICAgICAgICAgaWYgKCAhb1Jlc3BvbnNlIHx8ICFvUmVzcG9uc2UubWVzc2FnZXMgKSB7XG4gICAgICAgICAgICAgICAgICAgIG9NZXNzYWdlc1BhbmVsLmFkZCggbmV3IFBsYWluTWVzc2FnZVZpZXcoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwibWVzc2FnZVwiOiAnPHNwYW4gY2xhc3M9XCJpY29uLWFsZXJ0XCI+PC9zcGFuPiBWYWxpZGF0aW9uIGZhaWxzIHdpdGhvdXQgZXJyb3IuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwicmF3XCI6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBcImNsYXNzTmFtZVwiOiBcInRleHQtZXJyb3JcIlxuICAgICAgICAgICAgICAgICAgICB9ICkgKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmU2hvd1Jlc3VsdHMoIG9FZGl0b3IsIG9SZXNwb25zZS5tZXNzYWdlcyApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBXM0NIVE1MVmFsaWRhdG9yLnZhbGlkYXRlKCBvVmFsaWRhdG9yT3B0aW9ucyApO1xuICAgICAgICB9IGNhdGNoICggb0Vycm9yICkge1xuICAgICAgICAgICAgZlNob3dFcnJvciggb0Vycm9yICk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIG9FZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZS5pbmRleE9mKCBcImNzc1wiICkgPiAtMSApIHtcbiAgICAgICAgb1ZhbGlkYXRvck9wdGlvbnMgPSB7XG4gICAgICAgICAgICBcInRleHRcIjogb0VkaXRvci5nZXRUZXh0KCksXG4gICAgICAgICAgICBcInByb2ZpbGVcIjogYXRvbS5jb25maWcuZ2V0KCBcInczYy12YWxpZGF0aW9uLmNzc1Byb2ZpbGVcIiApLFxuICAgICAgICAgICAgXCJtZWRpdW1cIjogYXRvbS5jb25maWcuZ2V0KCBcInczYy12YWxpZGF0aW9uLmNzc01lZGlhXCIgKVxuICAgICAgICB9O1xuICAgICAgICBzd2l0Y2ggKCBhdG9tLmNvbmZpZy5nZXQoIFwidzNjLXZhbGlkYXRpb24uY3NzUmVwb3J0VHlwZVwiICkgKSB7XG4gICAgICAgICAgICBjYXNlIFwiYWxsXCI6XG4gICAgICAgICAgICAgICAgb1ZhbGlkYXRvck9wdGlvbnMud2FybmluZ3MgPSAyO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIm1vc3QgaW1wb3J0YW50XCI6XG4gICAgICAgICAgICAgICAgb1ZhbGlkYXRvck9wdGlvbnMud2FybmluZ3MgPSAwO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIm5vIHdhcm5pbmdzXCI6XG4gICAgICAgICAgICAgICAgb1ZhbGlkYXRvck9wdGlvbnMud2FybmluZ3MgPSBcIm5vXCI7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIG9WYWxpZGF0b3JPcHRpb25zLndhcm5pbmdzID0gMTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgVzNDQ1NTVmFsaWRhdG9yLnZhbGlkYXRlKCBvVmFsaWRhdG9yT3B0aW9ucywgKCBvRXJyb3IsIGFSZXN1bHRzICkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBhUGFyc2VkRXJyb3JzLFxuICAgICAgICAgICAgICAgICAgICBhUGFyc2VkV2FybmluZ3M7XG5cbiAgICAgICAgICAgICAgICBpZiAoIG9FcnJvciApIHtcbiAgICAgICAgICAgICAgICAgICAgZlNob3dFcnJvciggb0Vycm9yICk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYVBhcnNlZEVycm9ycyA9ICggYVJlc3VsdHMuZXJyb3JzIHx8IFtdICkubWFwKCAoIG9NZXNzYWdlICkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJsYXN0TGluZVwiOiBvTWVzc2FnZS5saW5lLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiZXJyb3JcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwibWVzc2FnZVwiOiBvTWVzc2FnZS5tZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgIGFQYXJzZWRXYXJuaW5ncyA9ICggYVJlc3VsdHMud2FybmluZ3MgfHwgW10gKS5tYXAoICggb01lc3NhZ2UgKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcImxhc3RMaW5lXCI6IG9NZXNzYWdlLmxpbmUsXG4gICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJ3YXJuaW5nXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBcIm1lc3NhZ2VcIjogb01lc3NhZ2UubWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICBmU2hvd1Jlc3VsdHMoIG9FZGl0b3IsIFtdLmNvbmNhdCggYVBhcnNlZEVycm9ycywgYVBhcnNlZFdhcm5pbmdzICkgKTtcbiAgICAgICAgICAgIH0gKTtcbiAgICAgICAgfSBjYXRjaCAoIG9FcnJvciApIHtcbiAgICAgICAgICAgIGZTaG93RXJyb3IoIG9FcnJvciApO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgZlZhbGlkYXRlO1xuIl19
//# sourceURL=/home/alisaleemh/.atom/packages/w3c-validation/lib/validator.js
