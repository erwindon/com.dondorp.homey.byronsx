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
const Global = require('../drivers/global.js');
Global.buttons = {};

// remember when the bell last sounded
// so that we don't trigger too often
// currently a global setting (not per bell)
var lastRing = Date.now();

// The internal IDs are different from the melody numbers
// This translation table converts from ID to melody-number
// Only 8 out of 16 IDs are used
var melodyNrs = {
	 0: "0",
	 1: "1",
	 2: "8",
	 3: "2",
	 4: "0",
	 5: "3",
	 6: "7",
	 7: "0",
	 8: "0",
	 9: "4",
	10: "0",
	11: "0",
	12: "0",
	13: "5",
	14: "6",
	15: "0",
	};

var melodyIds = {
	"1": 1,
	"2": 3, 
	"3": 5, 
	"4": 9, 
	"5": 13, 
	"6": 14, 
	"7": 6,
	"8": 2,
}

let buttonPressedTriggerGeneric = new Homey.FlowCardTrigger('receive_signal_generic');
buttonPressedTriggerGeneric.register();

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
			var now = Date.now();
			var millis = now - lastRing;
			if(millis < 5000)
			{
				// Accept only one ring within 5 seconds
				// console.log('IGNORED button: [' + buttonBits + ']=' + buttonId + ', melody: [' + melodyBits + ']=' + melodyId + "(" + melodyNr + "), first: " + first);
				return;
			}

			lastRing = now;

			console.log('buttonId: [' + buttonBits + ']=' + buttonId + ', melodyId: [' + melodyBits + ']=' + melodyId + ', melodyNr: ' + melodyNr);

		    Global.buttons[buttonId] = melodyId;

			var tokens = {
				'buttonId': buttonId,
				'melodyId': melodyId,
				'melodyNr': melodyNr
				};

			bellPressedTrigger
				.trigger(tokens, tokens)
				.catch(this.error)
				.then(this.log);
		})
})
.catch(this.error);

let ringBellActionNrA = new Homey.FlowCardAction('send_ring_signal_nrA');
ringBellActionNrA.register();

let ringBellActionNrB = new Homey.FlowCardAction('send_ring_signal_nrB');
ringBellActionNrB.register();

let ringBellActionNrC = new Homey.FlowCardAction('send_ring_signal_nrC');
ringBellActionNrC.register();

let ringBellActionNrD = new Homey.FlowCardAction('send_ring_signal_nrD');
ringBellActionNrD.register();

let ringBellActionNrE = new Homey.FlowCardAction('send_ring_signal_nrE');
ringBellActionNrE.register();

let ringBellActionNrF = new Homey.FlowCardAction('send_ring_signal_nrF');
ringBellActionNrF.register();

let ringBellActionId = new Homey.FlowCardAction('send_ring_signal_id');
ringBellActionId.register();

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
		ringBellActionNrA.registerRunListener((args, state) => {
			var buttonId = args['buttonId']
			var melodyNr = args['melodyNr']
			this.log('RING-A: buttonId:' + buttonId + ', melodyNr:' + melodyNr);
			var melodyId = melodyIds[melodyNr];
			var bits = getBits(buttonId, melodyId);
			byronSxSignal.tx(bits, console.log);
			return true;
		});

		ringBellActionNrB.registerRunListener((args, state) => {
			var buttonId = args['buttonId']
			var melodyNr = args['melodyNr']
			this.log('RING-B: buttonId:' + buttonId + ', melodyNr:' + melodyNr);
			var melodyId = melodyIds[melodyNr];
			var bits = getBits(buttonId, melodyId);
			byronSxSignal.tx(bits, console.log);
			return true;
		});

		ringBellActionNrC.registerRunListener((args, state) => {
			var buttonId = args['buttonId']
			var melodyNr = args['melodyNr']
			this.log('RING-C: buttonId:' + buttonId + ', melodyNr:' + melodyNr);
			var melodyId = melodyIds[melodyNr];
			var bits = getBits(buttonId, melodyId);
			byronSxSignal.tx(bits, console.log);
			return true;
		});

		ringBellActionNrD.registerRunListener((args, state) => {
			var buttonId = args['buttonId']
			var melodyNr = args['melodyNr']
			this.log('RING-D: buttonId:' + buttonId + ', melodyNr:' + melodyNr);
			var melodyId = melodyIds[melodyNr];
			var bits = getBits(buttonId, melodyId);
			byronSxSignal.tx(bits, console.log);
			return true;
		});

		ringBellActionNrE.registerRunListener((args, state) => {
			var buttonId = args['buttonId']
			this.log('RING-E: buttonId:' + buttonId);
			var bits = getBits(buttonId, 0);
			byronSxSignal.tx(bits, console.log);
			return true;
		});

		ringBellActionNrF.registerRunListener((args, state) => {
			var ringerId = args['ringerId']
			var melodyNr = args['melodyNr']
			this.log('RING-F: ringerId:' + ringerId + ', melodyNr:' + melodyNr);
			var melodyId = melodyIds[melodyNr];
			var bits = getBits(ringerId, melodyId);
			byronSxSignal.tx(bits, console.log);
			return true;
		});

		ringBellActionId.registerRunListener((args, state) => {
			var buttonId = args['buttonId']
			var melodyId = args['melodyId']
			this.log('RING: buttonId:' + buttonId + ', melodyId:' + melodyId);
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
