const BLE_ERROR_SERVICE_UUID = 0x1200;
const BLE_ERROR_CHARACTERISTIC_UUID = 0x1201;


const BLE_IMU_SERVICE_UUID = 0x1101;
const BLE_ACC_CHARACTERISTIC_UUID = 0x1102;
const BLE_GYR_CHARACTERISTIC_UUID = 0x1103;
const BLE_MAG_CHARACTERISTIC_UUID = 0x1104;

const BLE_PPG86_SERVICE_UUID = 0x1300;
////// PDLEDs ////////

////// PDsLED ////////
const BLE_LEDSEQ1A_PD1CHARACTERISTIC2_UUID = 0x1305;
const BLE_LEDSEQ1A_PD2CHARACTERISTIC2_UUID = 0x1307;
const BLE_SNR1_2PD1CHARACTERISTIC2_UUID = 0x1313;
const BLE_SNR2_2PD2CHARACTERISTIC2_UUID = 0x1314;


let LEDSEQ1A_PD1Characteristic2Line;
let LEDSEQ1A_PD2Characteristic2Line;

var LEDSEQ1A_PD1CHARACTERISTIC2;
var LEDSEQ1A_PD2CHARACTERISTIC2;
var SNR1_2PD1CHARACTERISTIC2;
var SNR2_2PD2CHARACTERISTIC2;
var errorCharacteristic;
var ACCCharacteristic;
var GYRCharacteristic;
var MAGCharacteristic;

let PPG86service;
let errorStatus;
let IMUAccXLine;
let IMUAccYLine;
let IMUAccZLine;
let IMUGyrXLine;
let IMUGyrYLine;
let IMUGyrZLine;
let IMUMagXLine;
let IMUMagYLine;
let IMUMagZLine;

let gyrData = {x: null, y: null, z: null}
let pitch
let roll
let yaw

function int16ToFloat32(inputArray, startIndex, length) {
  var output = new Float32Array(inputArray.length-startIndex);
  for (var i = startIndex; i < length; i++) {
    var int = inputArray[i];
    // If the high bit is on, then it is a negative number, and actually counts backwards.
    var float = (int >= 0x8000) ? -(0x10000 - int) / 0x8000 : int / 0x7FFF;
    output[i] = float;
  }
  return output;
}

async function onConnectButtonClick() {
  
try{

   console.log('Requesting any Bluetooth Device...');
    const device = await navigator.bluetooth.requestDevice({
     // filters: [...] <- Prefer filters to save energy & show relevant devices.
        acceptAllDevices: true,
        optionalServices:[BLE_PPG86_SERVICE_UUID,BLE_ERROR_SERVICE_UUID,BLE_IMU_SERVICE_UUID]
      });

    console.log('Connecting to GATT Server...');
    const server = await device.gatt.connect();

    // Note that we could also get all services that match a specific UUID by
    // passing it to getPrimaryServices().
    console.log('Getting Services...');
    const services = await server.getPrimaryServices();

    console.log('Getting Characteristics...');
    for (const service of services) {
      console.log('> Service: ' + service.uuid);
      const characteristics = await service.getCharacteristics();

      characteristics.forEach(characteristic => {
        console.log('>> Characteristic: ' + characteristic.uuid + ' ' +
            getSupportedProperties(characteristic));

          if(characteristic.uuid== '00001201-0000-1000-8000-00805f9b34fb'){
            errorCharacteristic= characteristic;
            errorCharacteristic.addEventListener('characteristicvaluechanged',(event)=>{
   const value = event.target.value; // Read the error buffer
  const IMUError = value.getUint8(0); // Extract the value for each sensors
  const PPG86Error = value.getUint8(1);
  console.log("IMUError: ", IMUError, " PPGError: ", PPG86Error);
  document.getElementById("IMU-state").classList = IMUError ? "status-ko" : "status-ok"; // Update DOM
  document.getElementById("PPG-state").classList = PPG86Error ? "status-ko" : "status-ok";
            });
        errorCharacteristic.startNotifications();
          }

         if(characteristic.uuid== '00001102-0000-1000-8000-00805f9b34fb'){
            ACCCharacteristic= characteristic;
            ACCCharacteristic.addEventListener('characteristicvaluechanged',(event)=>{
const value = event.target.value;
    const timestamp = (value.getUint8(0) << 24) | (value.getUint8(1) << 16) | (value.getUint8(2) << 8) | value.getUint8(3);
   //console.log("timeStamp 111: ",timestamp);
   var v = value.getInt8(5)<<8 | value.getInt8(6);
   var x = ((v * -1) * 16) / 0x8000;

    v = value.getInt8(7)<<8 | value.getInt8(8);
   var y = ((v * -1) * 16) / 0x8000;

    v = value.getInt8(9)<<8 | value.getInt8(10);
   var z = ((v * -1) * 16) / 0x8000;
  
  IMUAccXLine.append(new Date().getTime(), x)
  IMUAccYLine.append(new Date().getTime(), y)
  IMUAccZLine.append(new Date().getTime(), z)
  
  /*const value = event.target.value;
    const timestamp = (value.getUint8(0) << 24) | (value.getUint8(1) << 16) | (value.getUint8(2) << 8) | value.getUint8(3);
   //console.log("timeStamp 111: ",timestamp);
   var v = value.getInt8(5)<<8 | value.getInt8(6);
   var x = ((v * -1) * 16) / 0x8000;

    v = value.getInt8(7)<<8 | value.getInt8(8);
   var y = ((v * -1) * 16) / 0x8000;

    v = value.getInt8(9)<<8 | value.getInt8(10);
   var z = ((v * -1) * 16) / 0x8000;
  
  IMUAccXLine.append(new Date().getTime(), x)
  IMUAccYLine.append(new Date().getTime(), y)
  IMUAccZLine.append(new Date().getTime(), z)

    const timestamp1 = (value.getUint8(11) << 24) | (value.getUint8(12) << 16) | (value.getUint8(13) << 8) | value.getUint8(14);
  var v1 = value.getInt8(16)<<8 | value.getInt8(17);

  var x1 = (v1 * -1) * 2000 / 0x8000;

  v1 = value.getInt8(18)<<8 | value.getInt8(19);
  var y1 = (v1 * -1) * 2000 / 0x8000;

  v1 = value.getInt8(20)<<8 | value.getInt8(21);
  var z1 = (v1 * -1) * 2000 / 0x8000;
  
    IMUGyrXLine.append(new Date().getTime(), x1)
    IMUGyrYLine.append(new Date().getTime(), y1)
    IMUGyrZLine.append(new Date().getTime(), z1)


    const timestamp2 = (value.getUint8(22) << 24) | (value.getUint8(23) << 16) | (value.getUint8(24) << 8) | value.getUint8(25);
   
    var x2 = (value.getInt8(26)<<8 | value.getInt8(27) * (((( 174 - 128) * 0.5) / 128) + 1));
  var y2 = (value.getInt8(28)<<8 | value.getInt8(29) * (((( 177 - 128) * 0.5) / 128) + 1));

  var z2 = (value.getInt8(30)<<8 | value.getInt8(31) * (((( 164 - 128) * 0.5) / 128) + 1));
  IMUMagXLine.append(new Date().getTime(), x2)
  IMUMagYLine.append(new Date().getTime(), y2)
  IMUMagZLine.append(new Date().getTime(), z2)*/
            }
              );
              ACCCharacteristic.startNotifications();
            }
          

          if(characteristic.uuid== '00001103-0000-1000-8000-00805f9b34fb'){
            GYRCharacteristic= characteristic;
            GYRCharacteristic.addEventListener('characteristicvaluechanged',(event) => {
  const value = event.target.value;
    const timestamp = (value.getUint8(0) << 24) | (value.getUint8(1) << 16) | (value.getUint8(2) << 8) | value.getUint8(3);
   
  var v1 = value.getInt8(5)<<8 | value.getInt8(6);

  var x = (v1 * -1) * 2000 / 0x8000;

  v1 = value.getInt8(7)<<8 | value.getInt8(8);
  var y = (v1 * -1) * 2000 / 0x8000;

  v1 = value.getInt8(9)<<8 | value.getInt8(10);
  var z = (v1 * -1) * 2000 / 0x8000;
  
    IMUGyrXLine.append(new Date().getTime(), x)
    IMUGyrYLine.append(new Date().getTime(), y)
    IMUGyrZLine.append(new Date().getTime(), z)
  });
            GYRCharacteristic.startNotifications();
          }
 if(characteristic.uuid== '00001104-0000-1000-8000-00805f9b34fb'){
            MAGCharacteristic= characteristic;
            MAGCharacteristic.addEventListener('characteristicvaluechanged',(event) => {
  const value = event.target.value;

    const timestamp = (value.getUint8(0) << 24) | (value.getUint8(1) << 16) | (value.getUint8(2) << 8) | value.getUint8(3);
   
    var x = (value.getInt8(4)<<8 | value.getInt8(5) * (((( 174 - 128) * 0.5) / 128) + 1));
  var y = (value.getInt8(6)<<8 | value.getInt8(7) * (((( 177 - 128) * 0.5) / 128) + 1));

  var z = (value.getInt8(8)<<8 | value.getInt8(9) * (((( 164 - 128) * 0.5) / 128) + 1));
 //console.log(x,y,z)
  IMUMagXLine.append(new Date().getTime(), x)
  IMUMagYLine.append(new Date().getTime(), y)
  IMUMagZLine.append(new Date().getTime(), z)
  });
            MAGCharacteristic.startNotifications();
          }

          if(characteristic.uuid== '00001305-0000-1000-8000-00805f9b34fb'){
            LEDSEQ1A_PD1CHARACTERISTIC2= characteristic;
            LEDSEQ1A_PD1CHARACTERISTIC2.addEventListener('characteristicvaluechanged',LEDSEQ1A_PD1CHARACTERISTIC2Changed);
            LEDSEQ1A_PD1CHARACTERISTIC2.startNotifications();
          }
         if(characteristic.uuid== '00001307-0000-1000-8000-00805f9b34fb'){
            LEDSEQ1A_PD2CHARACTERISTIC2=  characteristic;
            LEDSEQ1A_PD2CHARACTERISTIC2.addEventListener('characteristicvaluechanged',LEDSEQ1A_PD2CHARACTERISTIC2Changed);
             LEDSEQ1A_PD2CHARACTERISTIC2.startNotifications();
          }
          if(characteristic.uuid== '00001313-0000-1000-8000-00805f9b34fb'){
            SNR1_2PD1CHARACTERISTIC2=  characteristic;
            SNR1_2PD1CHARACTERISTIC2.addEventListener('characteristicvaluechanged',SNR1_2PD1CHARACTERISTIC2Changed);
            SNR1_2PD1CHARACTERISTIC2.startNotifications();
          }
          if(characteristic.uuid== '00001314-0000-1000-8000-00805f9b34fb'){
            SNR1_2PD2CHARACTERISTIC2=  characteristic;
            SNR1_2PD2CHARACTERISTIC2.addEventListener('characteristicvaluechanged',SNR1_2PD2CHARACTERISTIC2Changed);
             SNR1_2PD2CHARACTERISTIC2.startNotifications();
          }

      });
    }
  } catch(error) {
    console.log('Argh! ' + error);
  }
}


/* Utils */

function getSupportedProperties(characteristic) {
  let supportedProperties = [];
  for (const p in characteristic.properties) {
    if (characteristic.properties[p] === true) {
      supportedProperties.push(p.toUpperCase());
    }
  }
  return '[' + supportedProperties.join(', ') + ']';
}

async function LEDSEQ1A_PD1CHARACTERISTIC2Changed(event) {
  /*const value = event.target.value;
  const timestamp = (value.getUint8(0) << 24) | (value.getUint8(1) << 16) | (value.getUint8(2) << 8) | value.getUint8(3); // shifts 4 Uint8 to make a Uint32
  const ledSeq1A_PD1Characteristic2 = (value.getUint8(4) << 24) | (value.getUint8(5) << 16) | (value.getUint8(6) << 8) | value.getUint8(7); // shifts 4 Uint8 to make a Uint32
  //console.log("timestamp: ", timestamp, "ledSeq1A_PD1Characteristic2: ", ledSeq1A_PD1Characteristic2);
    LEDSEQ1A_PD1Characteristic2Line.append(new Date().getTime(), ledSeq1A_PD1Characteristic2);*/
  const value = event.target.value;
  const data1 = (value.getUint8(0) << 24) | (value.getUint8(1) << 16) | (value.getUint8(2) << 8) | value.getUint8(3); // shifts 4 Uint8 to make a Uint32
  const data2 = (value.getUint8(4) << 24) | (value.getUint8(5) << 16) | (value.getUint8(6) << 8) | value.getUint8(7); // shifts 4 Uint8 to make a Uint32
  const data3 = (value.getUint8(8) << 24) | (value.getUint8(9) << 16) | (value.getUint8(10) << 8) | value.getUint8(11); // shifts 4 Uint8 to make a Uint32
  const data4 = (value.getUint8(12) << 24) | (value.getUint8(13) << 16) | (value.getUint8(14) << 8) | value.getUint8(15); // shifts 4 Uint8 to make a Uint32
  
  console.log("data1: ", data1,"data2: ", data2,"data3: ", data3,"data4: ", data4);

  var tab = [data1,data2,data3,data4]
  for (var i = 0; i<4; i++) {
    LEDSEQ1A_PD1Characteristic2Line.append(new Date().getTime(), tab[i]);
  }

}

async function LEDSEQ1A_PD2CHARACTERISTIC2Changed(event) {
    /*const value = event.target.value;
    const ledSeq1A_PD2Characteristic2 = (value.getUint8(0) << 24) | (value.getUint8(1) << 16) | (value.getUint8(2) << 8) | value.getUint8(3); // shifts 4 Uint8 to make a Uint32
    console.log("ledSeq1A_PD2Characteristic2: ", ledSeq1A_PD2Characteristic2);
    LEDSEQ1A_PD2Characteristic2Line.append(new Date().getTime(), ledSeq1A_PD2Characteristic2);*/
  const value = event.target.value;
  const data1 = (value.getUint8(0) << 24) | (value.getUint8(1) << 16) | (value.getUint8(2) << 8) | value.getUint8(3); // shifts 4 Uint8 to make a Uint32
  const data2 = (value.getUint8(4) << 24) | (value.getUint8(5) << 16) | (value.getUint8(6) << 8) | value.getUint8(7); // shifts 4 Uint8 to make a Uint32
  const data3 = (value.getUint8(8) << 24) | (value.getUint8(9) << 16) | (value.getUint8(10) << 8) | value.getUint8(11); // shifts 4 Uint8 to make a Uint32
  const data4 = (value.getUint8(12) << 24) | (value.getUint8(13) << 16) | (value.getUint8(14) << 8) | value.getUint8(15); // shifts 4 Uint8 to make a Uint32

  var tab = [data1,data2,data3,data4]
  for (var i = 0; i<4; i++) {
    LEDSEQ1A_PD2Characteristic2Line.append(new Date().getTime(), tab[i]);
  }
}

async function SNR1_2PD1CHARACTERISTIC2Changed(event) {
    const value = event.target.value;
    var snr1_2PD1CHARACTERISTIC2 = (value.getUint8(0) << 24) | (value.getUint8(1) << 16) | (value.getUint8(2) << 8) | value.getUint8(3); // shifts 4 Uint8 to make a Uint32
    
    //console.log("snr1_2PD1CHARACTERISTIC2: ", snr1_2PD1CHARACTERISTIC2);
    if(snr1_2PD1CHARACTERISTIC2 %100==0){
      var snr_neg= snr1_2PD1CHARACTERISTIC2;
          snr_neg= -(snr_neg/10000);
      //console.log("snr1_2PD1CHARACTERISTIC2: ",snr_neg);
 document.getElementById('snr1_2PD1').innerHTML = String(snr_neg);
    }
    else{
      var snr_pos= snr1_2PD1CHARACTERISTIC2;
      snr_pos = snr_pos/100;
      //console.log("snr1_2PD1CHARACTERISTIC2: ",snr_pos);
  document.getElementById('snr1_2PD1').innerHTML = String(snr_pos);
    }
}
async function SNR1_2PD2CHARACTERISTIC2Changed(event) {
    const value = event.target.value;
    const snr1_2PD2CHARACTERISTIC2 = (value.getUint8(0) << 24) | (value.getUint8(1) << 16) | (value.getUint8(2) << 8) | value.getUint8(3); // shifts 4 Uint8 to make a Uint32
    
    //console.log("snr1_2PD2CHARACTERISTIC2: ", snr1_2PD2CHARACTERISTIC2);

    if(snr1_2PD2CHARACTERISTIC2 %100==0){
      var snr_neg= snr1_2PD2CHARACTERISTIC2;
          snr_neg= -(snr_neg/10000);
     // console.log("snr1_2PD2CHARACTERISTIC2: ",snr_neg);
       document.getElementById('snr2_2PD2').innerHTML = String(snr_neg);
    }
    else{
      var snr_pos= snr1_2PD2CHARACTERISTIC2;
      snr_pos = snr_pos/100;
     // console.log("snr1_2PD2CHARACTERISTIC2: ",snr_pos);
      document.getElementById('snr2_2PD2').innerHTML = String(snr_pos);
    }
}

window.onload = () => {
  // wait for the page to load so that the DOM elements are available
  console.log(navigator.bluetooth ? "Web-BLE Available" : "Web-BLE Unavailable");
  document.getElementById("connect-btn").addEventListener("click", onConnectButtonClick);
  //document.getElementById("disconnect-btn").addEventListener("click", onDisconnected);
  
  let IMUAccSmoothie = new SmoothieChart();
  let IMUGyrSmoothie = new SmoothieChart();
  let IMUMagSmoothie = new SmoothieChart()

  IMUAccXLine = new TimeSeries();
  IMUAccYLine = new TimeSeries();
  IMUAccZLine = new TimeSeries();
  IMUGyrXLine = new TimeSeries();
  IMUGyrYLine = new TimeSeries();
  IMUGyrZLine = new TimeSeries();
  IMUMagXLine = new TimeSeries()
  IMUMagYLine = new TimeSeries()
  IMUMagZLine = new TimeSeries()

  IMUAccSmoothie.addTimeSeries(IMUAccXLine, { strokeStyle: "rgb(255, 0, 0)", lineWidth: 3 });
  IMUAccSmoothie.addTimeSeries(IMUAccYLine, { strokeStyle: "rgb(0, 255, 0)", lineWidth: 3 });
  IMUAccSmoothie.addTimeSeries(IMUAccZLine, { strokeStyle: "rgb(0, 0, 255)", lineWidth: 3 });
  IMUAccSmoothie.streamTo(document.getElementById("smoothie-imu-acc"));

  IMUGyrSmoothie.addTimeSeries(IMUGyrXLine, { strokeStyle: "rgb(255, 0, 0)", lineWidth: 3 });
  IMUGyrSmoothie.addTimeSeries(IMUGyrYLine, { strokeStyle: "rgb(0, 255, 0)", lineWidth: 3 });
  IMUGyrSmoothie.addTimeSeries(IMUGyrZLine, { strokeStyle: "rgb(0, 0, 255)", lineWidth: 3 });
  IMUGyrSmoothie.streamTo(document.getElementById("smoothie-imu-gyr"));

  IMUMagSmoothie.addTimeSeries(IMUMagXLine, { strokeStyle: "rgb(255, 0, 0)", lineWidth: 3 });
  IMUMagSmoothie.addTimeSeries(IMUMagYLine, { strokeStyle: "rgb(0, 255, 0)", lineWidth: 3 });
  IMUMagSmoothie.addTimeSeries(IMUMagZLine, { strokeStyle: "rgb(0, 0, 255)", lineWidth: 3 });
  IMUMagSmoothie.streamTo(document.getElementById("smoothie-imu-mag"));

  let LEDSEQ1A_PD1Characteristic2Smoothie = new SmoothieChart(); // Create SmoothieChart objects
  LEDSEQ1A_PD1Characteristic2Line = new TimeSeries(); // Create a TimeSeries to store the data for each sensor
  LEDSEQ1A_PD1Characteristic2Smoothie.addTimeSeries(LEDSEQ1A_PD1Characteristic2Line, { strokeStyle: "rgb(255, 0, 0)", lineWidth: 3 }); // Link TimeSeries to the SmoothieChart object and add a bit of color
  LEDSEQ1A_PD1Characteristic2Smoothie.streamTo(document.getElementById("smoothie-pd1-led")); // Link the SoothieChart object to its canvas in the HTML

  let LEDSEQ1A_PD2Characteristic2Smoothie = new SmoothieChart(); // Create SmoothieChart objects
  LEDSEQ1A_PD2Characteristic2Line = new TimeSeries(); // Create a TimeSeries to store the data for each sensor
  LEDSEQ1A_PD2Characteristic2Smoothie.addTimeSeries(LEDSEQ1A_PD2Characteristic2Line, { strokeStyle: "rgb(255, 0, 0)", lineWidth: 3 }); // Link TimeSeries to the SmoothieChart object and add a bit of color
  LEDSEQ1A_PD2Characteristic2Smoothie.streamTo(document.getElementById("smoothie-pd2-led")); // Link the SoothieChart object to its canvas in the HTML

}