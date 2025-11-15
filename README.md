# Airpods Assistant

A simple assistant for controlling your AirPods listening modes from Raycast. Switch between Noise Cancellation, Adaptive, or Transparency using Siri.

## Development

### Mock Data

By default, the extension uses real Bluetooth device data. To enable mock data for development, create a `.env.local` file in the `/assets` directory with the `USE_MOCK_DATA` variable to `true`:

```bash
echo "USE_MOCK_DATA=true" > assets/.env.local
npm run dev
```

To disable mock data and use real devices again, either remove the line from `assets/.env.local` or delete the `.env.local` file.

Mock data from `mocks/bluetooth-devices.json` allows you to:

- Test without AirPods connected (note that Siri won't be able to respond to the prompts when no compatible headphones are connected)
- Verify different battery level scenarios
- Test edge cases and error handling

See [`mocks/PRODUCT_IDS.md`](./mocks/PRODUCT_IDS.md) for details on mock data structure.
