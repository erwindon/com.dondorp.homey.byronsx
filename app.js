// Homey App for Byron SX series doorbells

// Author: Erwin Dondorp
// E-Mail: byronsx@dondorp.com

// PUSH BUTTONs
// ============
// SX30 8 codes, tested
// SX32 8 codes
// SX33 8 codes
// SX35 8 codes
// SX38 8 codes
// SX39 8 codes

// DOOR CHIMEs
// ===========
// not that we are not supporting the chimes now
// i.e. the Homey App currently cannot ring the bell
// SX1i   8 melodies A
// SX4i   8 melodies A
// SX5i   mechanical E
// SX6    4 melodies B
// SX7    4 melodies B
// SX8i   8 melodies A
// SX11i  8 melodies A
// SX14   8 melodies A
// SX15   mechanical E
// SX15i  mechanical E
// SX21   4 melodies B
// SX20   8 melodies A
// SX34i  8 melodies A
// SX40i  8 melodies A
// SX41i  8 melodies A
// SX55   8 melodies A
// SX56   8 melodies A
// SX60i  mechanical E
// SX72   8 melodies C
// SX80   4 melodies B, used in test
// SX81   8 melodies D
// SX83   4 melodies F
// SX86   8 melodies D
// SX102  8 melodies A
// SX120  4 melodies B
// SX201  8 melodies C
// SX202  8 melodies C (or recorded sound)
// SX204  8 melodies D
// SX205  8 melodies A
// SX209  8 melodies C
// SX210i 8 melodies A
// SX212i 8 melodies A
// SX220  8 melodies A
// SX222  8 melodies A
// SX225  8 melodies A
// SX226  8 melodies A
// SX228  8 melodies A
// SX245  8 melodies A
// SX252  fixed sound E
// SX823  4 melodies F
//
// IN DOUBT
// ========
// SX304
// SX503
//
// OTHER SX PRODUCTS
// =================
// SX200 batteries
// SX36 9v A/C adapter
//
// 8 melodies A
// ============
// 0 = Tubular 3-notes
// 1 = Big Ben
// 2 = Tubular 2-notes
// 3 = Solo
// 4 = Tubular Scare
// 5 = Clarinet
// 6 = Saxophone
// 7 = Morning Dew
//
// 4 melodies B
// ==========
// 0 = Tubular 3-notes
// 1 = Big Ben
// 2 = Tubular 2-notes
// 3 = Solo
// (4-7) play as (0-3)
//
// 8 melodies C
// ============
// 0 = Electro Mechanical - Ding Dong
// 1 = Westminster - 8 notes
// 2 = Jive
// 3 = Wedding March
// 4 = Piano
// 5 = Harmony
// 6 = Dog Barking
// 7 = Ringer
//
// 8 melodies D
// ============
// 0 = Westminster
// 1 = Ding Dong Repeat
// 2 = Telephone Ring
// 3 = Circus Theme
// 4 = Banjo on my Knee
// 5 = Twinkle Twinkle
// 6 = It's a Small World
// 7 = Dog Barking

// TODO
// 1) need Dutch names for "8 melodies C"
// 2) need Dutch names for "8 melodies D"

'use strict';

const Homey = require('homey');

// remember when the bells last sounded
// so that we don't trigger too often
// and so that we can help with pairing
const Global = require('../drivers/global.js');
Global.allLastRings = {};

// The internal IDs are different from the melody numbers
// This translation table converts from ID to melody-number
// Only 8 out of 16 IDs are used
var melodyNrs = {
	 0: 0,
	 1: 1,
	 2: 8,
	 3: 2,
	 4: 0,
	 5: 3,
	 6: 7,
	 7: 0,
	 8: 0,
	 9: 4,
	10: 0,
	11: 0,
	12: 0,
	13: 5,
	14: 6,
	15: 0,
	};

var melodyIds = {
	1: 1,
	2: 3,
	3: 5,
	4: 9,
	5: 13,
	6: 14,
	7: 6,
	8: 2,
}

let buttonPressedTriggerGeneric = new Homey.FlowCardTrigger('receive_signal_generic');
buttonPressedTriggerGeneric.register();

let buttonPressedTriggerPaired = new Homey.FlowCardTrigger('receive_signal_paired');
buttonPressedTriggerPaired.register();

// create & register a signal using the id from your app.json
let byronSxSignal = new Homey.Signal433('ByronSxSignal');
byronSxSignal.register()
	.then(() => {
		// Analysis for melodyBits:
		// payload: 0,0,1,0,0,1,0,1,0,0,0,1 Tubular 3-notes
		// payload: 0,0,1,0,0,1,0,1,0,0,1,1 Big Ben
		// payload: 0,0,1,0,0,1,0,1,0,1,0,1 Tubular 2-notes
		// payload: 0,0,1,0,0,1,0,1,1,0,0,1 Solo
		// payload: 0,0,1,0,0,1,0,1,1,1,0,1 Tubular Scare
		// payload: 0,0,1,0,0,1,0,1,1,1,1,0 Clarinet
		// payload: 0,0,1,0,0,1,0,1,0,1,1,0 Saxophone
		// payload: 0,0,1,0,0,1,0,1,0,0,1,0 Morning Dew
		// 8 other possible codes in last 4 bits do not seem to be generated

		// Other deviceIds
		// proves that all first 8 bit are used
		// payload: 0,1,0,0,0,0,1,1,0,0,0,1
		// payload: 1,0,1,0,1,0,0,1,0,0,0,1
		// payload: 1,0,0,0,1,0,1,0,0,0,0,1

		byronSxSignal.on('payload', function(payload, first) {
			//console.log('received: signal:[' + payload + '], first:' + first);

			// take the relevant groups of bits
			var buttonBits = payload.slice(0, 8);
			var melodyBits = payload.slice(8, 12);

			// get the values from the bit-patterns
			var buttonId =
				buttonBits[0] * 128 +
				buttonBits[1] * 64 +
				buttonBits[2] * 32 +
				buttonBits[3] * 16 +
				buttonBits[4] * 8 +
				buttonBits[5] * 4 +
				buttonBits[6] * 2 +
				buttonBits[7] * 1;
			var melodyId =
				melodyBits[0] * 8 +
				melodyBits[1] * 4 +
				melodyBits[2] * 2 +
				melodyBits[3] * 1;

			var melodyNr = melodyNrs[melodyId];

			// Controller seems to return multiple events with "first=true"
			// Therefore we use our own mechanism
			// Administation is per buttonId
			// Allow quick changes of melodyId
			var now = Date.now();
			var lastRing = Global.allLastRings[buttonId];
			if(lastRing === undefined)
				lastRing = {"dateTime":0, "melodyId":-1};
			var millis = now - lastRing.dateTime;
			if(millis < 5000 && melodyId == lastRing.melodyId)
			{
				// Accept only one ring within 5 seconds
				// console.log('IGNORED button: [' + buttonBits + ']=' + buttonId + ', melody: [' + melodyBits + ']=' + melodyId + "(" + melodyNr + "), first: " + first);
				return;
			}

			Global.allLastRings[buttonId] = {"dateTime":now, "melodyId":melodyId};

			console.log('buttonId: [' + buttonBits + ']=' + buttonId + ', melodyId: [' + melodyBits + ']=' + melodyId + ', melodyNr: ' + melodyNr);

			var tokens = {
				'buttonId': buttonId,
				'melodyId': melodyId,
				'melodyNr': melodyNr
				};

			buttonPressedTriggerGeneric
				.trigger(tokens, tokens)
				.catch(this.error)
				.then(this.log);

			buttonPressedTriggerPaired
				.trigger(tokens, tokens)
				.catch(this.error)
				.then(this.log);
		})
})
.catch(this.error);

let ringBellActionNrAGeneric = new Homey.FlowCardAction('send_ring_melodynrA_generic');
ringBellActionNrAGeneric.register();

let ringBellActionNrAPaired = new Homey.FlowCardAction('send_ring_melodynrA_paired');
ringBellActionNrAPaired.register();

let ringBellActionNrBGeneric = new Homey.FlowCardAction('send_ring_melodynrB_generic');
ringBellActionNrBGeneric.register();

let ringBellActionNrBPaired = new Homey.FlowCardAction('send_ring_melodynrB_paired');
ringBellActionNrBPaired.register();

let ringBellActionNrCGeneric = new Homey.FlowCardAction('send_ring_melodynrC_generic');
ringBellActionNrCGeneric.register();

let ringBellActionNrCPaired = new Homey.FlowCardAction('send_ring_melodynrC_paired');
ringBellActionNrCPaired.register();

let ringBellActionNrDGeneric = new Homey.FlowCardAction('send_ring_melodynrD_generic');
ringBellActionNrDGeneric.register();

let ringBellActionNrDPaired = new Homey.FlowCardAction('send_ring_melodynrD_paired');
ringBellActionNrDPaired.register();

let ringBellActionNrEGeneric = new Homey.FlowCardAction('send_ring_melodynrE_generic');
ringBellActionNrEGeneric.register();

let ringBellActionNrEPaired = new Homey.FlowCardAction('send_ring_melodynrE_paired');
ringBellActionNrEPaired.register();

let ringBellActionNrFGeneric = new Homey.FlowCardAction('send_ring_melodynrF_generic');
ringBellActionNrFGeneric.register();

let ringBellActionNrFPaired = new Homey.FlowCardAction('send_ring_melodynrF_paired');
ringBellActionNrFPaired.register();

let ringBellActionIdGeneric = new Homey.FlowCardAction('send_ring_melodyid_generic');
ringBellActionIdGeneric.register();

let ringBellActionIdPaired = new Homey.FlowCardAction('send_ring_melodyid_paired');
ringBellActionIdPaired.register();

function getBits(buttonId, melodyId)
{
	// +256 to force fixed length of 9 bits
	// then use bits 1..8 (but not bit 0)
	var buttonIdBits = (buttonId + 256).toString(2);
	var melodyIdBits = (melodyId + 16).toString(2);
	return [
			parseInt(buttonIdBits[1]),
			parseInt(buttonIdBits[2]),
			parseInt(buttonIdBits[3]),
			parseInt(buttonIdBits[4]),
			parseInt(buttonIdBits[5]),
			parseInt(buttonIdBits[6]),
			parseInt(buttonIdBits[7]),
			parseInt(buttonIdBits[8]),
			parseInt(melodyIdBits[1]),
			parseInt(melodyIdBits[2]),
			parseInt(melodyIdBits[3]),
			parseInt(melodyIdBits[4])
			];
}

class ByronSxDoorbell extends Homey.App {
	onInit() {
		ringBellActionNrAGeneric.registerRunListener((args, state) => {
			var buttonId = args['buttonId']
			var melodyNr = args['melodyNr']
			this.log('RING-A-GENERIC: buttonId:' + buttonId + ', melodyNr:' + melodyNr);
			var melodyId = melodyIds[melodyNr];
			var bits = getBits(buttonId, melodyId);
			byronSxSignal.tx(bits, console.log);
			return true;
		});

		ringBellActionNrBGeneric.registerRunListener((args, state) => {
			var buttonId = args['buttonId']
			var melodyNr = args['melodyNr']
			this.log('RING-B-GENERIC: buttonId:' + buttonId + ', melodyNr:' + melodyNr);
			var melodyId = melodyIds[melodyNr];
			var bits = getBits(buttonId, melodyId);
			byronSxSignal.tx(bits, console.log);
			return true;
		});

		ringBellActionNrCGeneric.registerRunListener((args, state) => {
			var buttonId = args['buttonId']
			var melodyNr = args['melodyNr']
			this.log('RING-C-GENERIC: buttonId:' + buttonId + ', melodyNr:' + melodyNr);
			var melodyId = melodyIds[melodyNr];
			var bits = getBits(buttonId, melodyId);
			byronSxSignal.tx(bits, console.log);
			return true;
		});

		ringBellActionNrDGeneric.registerRunListener((args, state) => {
			var buttonId = args['buttonId']
			var melodyNr = args['melodyNr']
			this.log('RING-D-GENERIC: buttonId:' + buttonId + ', melodyNr:' + melodyNr);
			var melodyId = melodyIds[melodyNr];
			var bits = getBits(buttonId, melodyId);
			byronSxSignal.tx(bits, console.log);
			return true;
		});

		ringBellActionNrEGeneric.registerRunListener((args, state) => {
			var buttonId = args['buttonId']
			this.log('RING-E-GENERIC: buttonId:' + buttonId);
			var bits = getBits(buttonId, 1);
			byronSxSignal.tx(bits, console.log);
			return true;
		});

		ringBellActionNrFGeneric.registerRunListener((args, state) => {
			var buttonId = args['buttonId']
			var melodyNr = args['melodyNr']
			this.log('RING-F-GENERIC: buttonId:' + buttonId + ', melodyNr:' + melodyNr);
			var melodyId = melodyIds[melodyNr];
			var bits = getBits(buttonId, melodyId);
			byronSxSignal.tx(bits, console.log);
			return true;
		});

		ringBellActionIdGeneric.registerRunListener((args, state) => {
			var buttonId = args['buttonId']
			var melodyId = args['melodyId']
			this.log('RING-ID-GENERIC: buttonId:' + buttonId + ', melodyId:' + melodyId);
			var bits = getBits(buttonId, melodyId);
			this.log("bits:", bits);
			byronSxSignal.tx(bits, console.log);
			return true;
		});


		ringBellActionNrAPaired.registerRunListener((args, state) => {
			var buttonId = parseInt(args['bell_nrA_paired'].getData()["buttonId"]);
			var melodyNr = args['melodyNr']
			this.log('RING-A-PAIRED: buttonId:' + buttonId + ', melodyNr:' + melodyNr);
			var melodyId = melodyIds[melodyNr];
			var bits = getBits(buttonId, melodyId);
			byronSxSignal.tx(bits, console.log);
			return true;
		});

		ringBellActionNrBPaired.registerRunListener((args, state) => {
			var buttonId = parseInt(args['bell_nrB_paired'].getData()["buttonId"]);
			var melodyNr = args['melodyNr']
			this.log('RING-B-PAIRED: buttonId:' + buttonId + ', melodyNr:' + melodyNr);
			var melodyId = melodyIds[melodyNr];
			var bits = getBits(buttonId, melodyId);
			byronSxSignal.tx(bits, console.log);
			return true;
		});

		ringBellActionNrCPaired.registerRunListener((args, state) => {
			var buttonId = parseInt(args['bell_nrC_paired'].getData()["buttonId"]);
			var melodyNr = args['melodyNr']
			this.log('RING-C-PAIRED: buttonId:' + buttonId + ', melodyNr:' + melodyNr);
			var melodyId = melodyIds[melodyNr];
			var bits = getBits(buttonId, melodyId);
			byronSxSignal.tx(bits, console.log);
			return true;
		});

		ringBellActionNrDPaired.registerRunListener((args, state) => {
			var buttonId = parseInt(args['bell_nrD_paired'].getData()["buttonId"]);
			var melodyNr = args['melodyNr']
			this.log('RING-D-PAIRED: buttonId:' + buttonId + ', melodyNr:' + melodyNr);
			var melodyId = melodyIds[melodyNr];
			var bits = getBits(buttonId, melodyId);
			byronSxSignal.tx(bits, console.log);
			return true;
		});

		ringBellActionNrEPaired.registerRunListener((args, state) => {
			var buttonId = parseInt(args['bell_nrE_paired'].getData()["buttonId"]);
			this.log('RING-E-PAIRED: buttonId:' + buttonId);
			var bits = getBits(buttonId, 1);
			byronSxSignal.tx(bits, console.log);
			return true;
		});

		ringBellActionNrFPaired.registerRunListener((args, state) => {
			var buttonId = parseInt(args['bell_nrF_paired'].getData()["buttonId"]);
			var melodyNr = args['melodyNr']
			this.log('RING-F-PAIRED: buttonId:' + buttonId + ', melodyNr:' + melodyNr);
			var melodyId = melodyIds[melodyNr];
			var bits = getBits(buttonId, melodyId);
			byronSxSignal.tx(bits, console.log);
			return true;
		});

		ringBellActionIdPaired.registerRunListener((args, state) => {
			var buttonId = parseInt(args['bell_id_paired'].getData()["buttonId"]);
			var melodyId = args['melodyId']
			this.log('RING-ID-PAIRED: buttonId:' + buttonId + ', melodyId:' + melodyId);
			var bits = getBits(buttonId, melodyId);
			this.log("bits:", bits);
			byronSxSignal.tx(bits, console.log);
			return true;
		});

		this.log('ByronSxDoorbell is running...');
	}
}

module.exports = ByronSxDoorbell;

// vim:ts=4
