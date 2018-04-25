'use strict';

const Homey = require('homey');
const Global = require('../global.js');

class ByronSxBell extends Homey.Driver {

	// this is the easiest method to overwrite, when only the template 'Drivers-Pairing-System-Views' is being used.
	onPairListDevices( data, callback ) {

		let devices = [];

		for(var buttonId in Global.allLastRings)
		{
			var device = {}
			device["name"] = "Bell-#" + buttonId;
			device["data"] = {"buttonId": buttonId}
			devices.push(device);
		}

		callback(null, devices);
	}

	onInit() {
		console.log("onInit Bell");
	}

// future use; show live device list when pairing
//	getDevices() {
//		this.log("getDevices");
//		let devices = [];
//
//		for(var buttonId in Global.allLastRings)
//		{
//			var device = {}
//			device["name"] = "Bell-#" + buttonId;
//			device["data"] = {"buttonId": buttonId}
//			devices.push(device);
//		}
//
//		return devices;
//	}

}

module.exports = ByronSxBell;

// vim:ts=4
