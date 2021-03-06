# web-BLE-GUI-PPG86141_IMU

This firmware allows to send by BLE data from PPG (photo-diode(s), SNR), IMU (accel, gyro, mag) between peripherals (NRF52 boards or wearable with movuino) and centrals (NRF52 boards, HTML page or app).

#### Board definition

- Open the Arduino IDE
- Navigate to `Preferences`
- Add `https://movuino.github.io/movuino-board-index/package_movuino_index.json` as an 'Additional Board Manager URL'.

#### Libraries
The following librairies are required to build the firmware and tests:
- [MPU9250](https://github.com/movuino/OpenHealthBandFirmware/tree/main/Libraires/MPU9250) by [hideakitai](https://github.com/hideakitai/MPU9250) : **place the version provided in Arduino Librairies**
- [Adafruit Bluefruit nRF52](https://github.com/adafruit/Adafruit_nRF52_Arduino/tree/master/libraries/Bluefruit52Lib) : **version 0.21.0**
- [Max86141](https://github.com/Youniesta/Max86141) : **version 1.0.4**

Those libraries are all available in the Arduino Library manager except MPU9250 that we should add in Arduino Librairie.

#### Services and Characteristics for BLE

The following services and characteristics use **Notification** properties :

##### Error Service & characteristic
The Error Characteristic allows to send boolean errors from IMU, PPG. Thus, when error is 0 data is detected else 1.

|        | ErrorService | ErrorCharacteristic |
|:------:|:------:|:------:|
|UUID | **0x1200** | **0x1201** |

| 2 bytes| byte 1 | byte 2 |   
|:------:|:------:|:------:|
|ErrorCharacteristic | errorIMU | errorPPG86 |

##### IMU Service & characteristic

With the IMU Service and characteristic, data from accelerometer, gyrometer and magnetometer can be send by BLE.

|        | IMUService | AccGyrMagCharacteristic |
|:------:|:------:|:------:|
|UUID | **0x1101** | **0x1102** |

|22 bytes        | 4 bytes (0-3) | 2 bytes (4-5) | 2 bytes (6-7) | 2 bytes (8-9) | 2 bytes (10-11) | 2 bytes (12-13) | 2 bytes (14-15) | 2 bytes (16-17) | 2 bytes (18-19) | 2 bytes (20-21) | 
|:------:|:------:|:------:|:------:|:------:|:------:|:------:|:------:|:------:|:------:|:------: |
|AccGyrMagCharacteristic | timestamp | AccX | AccY | AccZ | GyrX | GyrY | GyrZ | MagX | MagY | MagZ |


##### PPG Max 86140 - 86141 Service & Characteristics

With the PPG Service and characteristics, data from PPG can be send by BLE. We can have these type of sensor configuartions :

+ 1 PD - 2 LEDS

**PDLEDs_PD1_SNR1Characteristic** = characteristic for data taken from photo-diode


|        | PPG86Service | PDLEDs_PD1_SNR1Characteristic |
|:------:|:------:|:------:|
|UUID | **0x1300** | **0x1301** |

| 24 bytes | 4 bytes (0-3) | 4 bytes (4-7) | 4 bytes (8-11) | 4 bytes (12-15) | 4 bytes (16-19) | 4 bytes (20-23) |    
|:------:|:------:|:------:|:------:|:------:|:------:|:------:|
|PDLEDs_PD1_SNR1Characteristic | timestamp | sample 1 | sample 2 | sample 3 | sample 4 | SNR photo-diode |


+ 2 PDs - 1 LED

**PDsLED_PD1_PD2_SNR1_SNR2Characteristic** = characteristic for data taken from photo-diode 1 and 2


|        | PPG86Service | PDsLED_PD1_PD2_SNR1_SNR2Characteristic |
|:------:|:------:|:------:|
|UUID | **0x1300** | **0x1302** |

| 28 bytes | 4 bytes (0-3) | 4 bytes (4-7) | 4 bytes (8-11) | 4 bytes (12-15) | 4 bytes (16-19) | 4 bytes (20-23) | 4 bytes (24-27) |
|:------:|:------:|:------:|:------:|:------:|:------:|:------:|:------:|
|PDsLED_PD1_PD2_SNR1_SNR2Characteristic | timestamp | sample 1 photo-diode 1 | sample 2 photo-diode 1 | SNR photo-diode 1 | sample 1 photo-diode 2 | sample 2 photo-diode 2 | | SNR photo-diode 2 |


+ 2 PDs - 3 LEDs

**PDsLEDs_PD1_PD2_SNR1_SNR2Characteristic** = characteristic for data taken from photo-diode 1 and 2


|        | PPG86Service | PDsLEDs_PD1_PD2_SNR1_SNR2Characteristic |
|:------:|:------:|:------:|
|UUID | **0x1300** | **0x1302** |

| 28 bytes | 4 bytes (0-3) | 4 bytes (4-7) | 4 bytes (8-11) | 4 bytes (12-15) | 4 bytes (16-19) | 4 bytes (20-23) | 4 bytes (24-27) |
|:------:|:------:|:------:|:------:|:------:|:------:|:------:|:------:|
|PDsLEDs_PD1_PD2_SNR1_SNR2Characteristic | timestamp | sample 1 photo-diode 1 | sample 2 photo-diode 1 | SNR photo-diode 1 | sample 1 photo-diode 2 | sample 2 photo-diode 2 | | SNR photo-diode 2 |


##### HeartRate Service & characteristics

In order to detect the peripheral in the Bluetooth Settings for iPhone, we added the HeartRate taken from Adafruit Bluefruit nrf52 librairies --> Peripheral. However, it is not sent by BLE. 

The following service and characteristics use **READ and Write** properties :

##### Start_Stop Service & characteristics

With the Start_Stop Service and characteristics, central BLE can decide when to start or stop data transfert and change leds intensity, sample rate and sample average.

|        | Start_StopService | StartCharacteristic | intensityLedsCharacteristic | smplRateCharacteristic | smplAvgCharacteristic |
|:------:|:------:			 |:------:             |:------:                     |:------:                |:------:               |
|UUID    | **0x1400**        | **0x1401**          | **0x1402**                  | **0x1403**             |**0x1404**             |

|1 byte| 1 byte (0)     | 
|:------:|:------:      |
|StartCharacteristic | 1 (start) or 2 (stop)  |
|intensityLedsCharacteristic | leds intensity |
|smplRateCharacteristic | PPG sample rate     |
|smplAvgCharacteristic | PPG sample average   |

|Values  | leds intensity   | 
|:------:|:------:          |
|0 - 255 | leds off (min value) - leds on (max value) |

|Values (integer) 	| PPG sample rate (Hz)  | 
|:------:			|:------:      			|
| 0 	 			|25   					| 
| 1 	 			|50   					| 
| 2 	 			|84   					| 
| 3 	 			|100   					| 
| 4 	 			|200   					| 
| 5 	 			|400   					| 
| 14 	 			|128   					| 
| 15 	 			|256   					| 
| 16 	 			|512   					| 

|Values (integer)   | PPG sample average (Hz)| 
|:------:			|:------:      			|
| 0 	 			|1   					| 
| 1 	 			|2   					| 
| 2 	 			|4   					| 
| 3 	 			|8   					| 
| 4 	 			|16   					| 
| 5 	 			|32   					| 
| 6 	 			|64   					| 


#### Use

+ Choose your PPG sensor type (PDLEDs, PDsLED or PDsLEDs) by activating the #define
<p align="center"><img width="200" src="https://user-images.githubusercontent.com/47628329/156622531-7f8c6de8-a089-4c18-8624-6c1727f6303c.png"></p>

+ To read data from PPG, IMU activated the #define from peripheral and central
<p align="center"><img width="200" src="https://user-images.githubusercontent.com/47628329/156010773-e1a3c952-65e3-4916-afef-292665ef7b79.png"></p>

+ To read data on Serial Monitor or send by BLE activate the #define from peripheral
<p align="center"><img width="200" src="https://user-images.githubusercontent.com/47628329/156010756-466be41c-46be-4552-b925-e32fa0832059.png"></p>