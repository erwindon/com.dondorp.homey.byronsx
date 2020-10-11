Homey app to receive signals from Byron SX doorbell pushbuttons; and to send signals to Byron SX doorbell chimes.

Depending on the doorbell chime model, the list of possible sounds is adjusted in the app.

Install the app and add the App to a flow. You can use the generic Byron SX application as a starting trigger, or as an action in a flow. In that case you are required to fill in the button-id that is used. Better, you can pair a Byron SX button and/or a Byron SX chime and use these in a flow.

When the card is added to the trigger section of a flow, it detects a Byron SX push button being pushed. 3 parameters are added to the trigger:
* buttonId:
Contains the internal ID of the button that is pushed. This is a number between 0 and 255. This number is assigned randomly to a push button once the battery is inserted.
* melodyNr:
Contains the melody number of the melody that was chosen. This is a number between 1 and 8. These are the numbers that are listed in the manual that comes with the device. Some chimes only support 4 melodies. Some chimes support only 1 melody or are mechanical bells.
* melodyId:
Contains the internal ID of the melody that was chosen. This is a number between 0 and 15. But only 8 specific values seem to in use. This number can be changed by pushing the small button that is inside the push button.

When the card is added to the action section of a flow, it is able to send a signal to a Byron SX chime. There are separate cards for each category of chime. There are 6 categories. A 7th card is available, which allows all 16 melody IDs. The hint icon shows the exact models that are supported by that card. But you can also pick the card that has the list of ringtones that matches your Byron SX chime. This card takes a few parameters:
* buttonId:
Contains the internal ID of the button that is recognized by the chime. This is a number between 0 and 255. Typically, this is the same number as is sent by the push button.
* melodyNr:
Contains the melody that should be played by the chime. You can select the melody from a dropdown list. When you select the proper card, the list of melodies should exactly match with what is possible. This parameter is not available for chimes that have only one melody.
* melodyId:
Contains the melody that should be played by the chime. You can select the melody by its internal number. Note that the internal numbers are not equal to the sequence number suggested by the dropdown lists.
