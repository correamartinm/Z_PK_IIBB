/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"z_pk_iibb/z_pk_iibb/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
