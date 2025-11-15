# AirPods Product IDs Reference

This document lists the Bluetooth product IDs (hex values) used by macOS for various AirPods models.

## Mock Data Usage

Mock data (`devices.json`) is automatically loaded when running `npm run dev` in Raycast development mode. No configuration needed - the extension detects `environment.isDevelopment` and loads mocks instead of real system calls.

**What's included:**

- 2 connected devices: AirPods Pro 2 (full battery info) + AirPods Max (no case)
- 3 nearby devices with RSSI: AirPods 3, AirPods Pro 1, AirPods 4 ANC (low battery)
- 1 out-of-range device: AirPods 2 (no battery/RSSI, simulating case closed)
- 1 non-AirPods device: Magic Keyboard (for filtering tests)

## Product ID Format

In macOS Bluetooth system_profiler output, AirPods are identified by their `device_productID` field, which contains a hexadecimal value like `0x2024`.

## Complete Product ID List

| Model                         | Product ID (Hex) | Product ID (Dec) | Year Released |
| ----------------------------- | ---------------- | ---------------- | ------------- |
| **AirPods (1st generation)**  | `0x2002`         | 8194             | 2016          |
| **AirPods (2nd generation)**  | `0x200F`         | 8207             | 2019          |
| **AirPods Pro (1st gen)**     | `0x200E`         | 8206             | 2019          |
| **AirPods Max (Lightning)**   | `0x200A`         | 8202             | 2020          |
| **AirPods (3rd generation)**  | `0x2013`         | 8211             | 2021          |
| **AirPods Pro 2 (Lightning)** | `0x2014`         | 8212             | 2022          |
| **AirPods Pro 2 (USB-C)**     | `0x2024`         | 8228             | 2023          |
| **AirPods Max (USB-C)**       | `0x201F`         | 8223             | 2024          |
| **AirPods 4**                 | `0x2019`         | 8217             | 2024          |
| **AirPods 4 with ANC**        | `0x201B`         | 8219             | 2024          |
| **AirPods Pro (3rd gen)**     | `0x2027`         | 8231             | 2025          |

## Model Numbers (For Reference)

### AirPods Pro 3

- **USB-C**: A3063 (left), A3064 (right), A3065 (case)

### AirPods Pro 2

- **USB-C**: A3047 (left), A3048 (right), A3049 (case)
- **Lightning**: A2931 (left), A2699 (right), A2698 (case)

### AirPods Max

- **USB-C**: A3184
- **Lightning**: A2096

### AirPods 4

- **Standard**: A3053 (left), A3050 (right), A3054 (case)
- **With ANC**: A3056 (left), A3055 (right), A3057 (case)

### AirPods 3

- A2565 (left), A2564 (right), A2566 (case)

### AirPods 2

- A2032 (left), A2031 (right)
- Case: A1602 (wired) or A1938 (wireless)

### AirPods 1

- A1523 (left), A1722 (right), A1602 (case)

### AirPods Pro 1

- A2084 (left), A2083 (right)

## Battery Information by Connection State

### Connected Devices

When AirPods are connected to the Mac, the following fields are typically present:

- `device_batteryLevelLeft` - Left earbud/ear cup battery percentage
- `device_batteryLevelRight` - Right earbud/ear cup battery percentage
- `device_batteryLevelCase` - Charging case battery (not applicable for AirPods Max)
- `device_rssi` - Signal strength (negative number, closer to 0 = stronger)

**Note:**

- **AirPods Max** report a single `device_batteryLevel` for the entire device (not separate left/right). They don't have a charging case.
- **Regular AirPods/Pro** report `device_batteryLevelLeft` and `device_batteryLevelRight` separately, plus `device_batteryLevelCase` when case is open/nearby.

### Not Connected but Nearby

When AirPods are nearby but connected to another device (iPhone, iPad, etc.):

- Battery levels are present when `device_rssi` is available
- This indicates the AirPods are actively broadcasting
- Typically occurs when AirPods are in use on another device

### Not Connected and Out of Range

When AirPods are not connected and out of range:

- No `device_rssi` field
- No battery level fields
- Only basic device information is cached

## Device Detection

AirPods can be identified by:

1. `device_vendorID` = `0x004C` (Apple)
2. `device_minorType` = `Headphones`
3. `device_productID` matches one of the hex values above
4. Device name typically contains "AirPods"

## Sources

- Apple Support: https://support.apple.com/en-uz/109525
- AppleDB: https://appledb.dev/device-selection/AirPods.html
- macOS system_profiler SPBluetoothDataType output
- Community reverse engineering projects

## Notes

- The product ID is used for device identification and capability detection
- Different charging port versions (Lightning vs USB-C) may have different product IDs
- The H1 and H2 chip versions determine available features (ANC, Adaptive Audio, etc.)
- Battery reporting accuracy depends on Bluetooth proximity and connection state
