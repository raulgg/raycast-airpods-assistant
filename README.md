# Airpods Assistant

A simple assistant for controlling your AirPods listening modes from Raycast. Switch between Noise Cancellation, Adaptive, or Transparency using Siri.

## Development

### Mock Data (Automatic)

When running in development mode, the extension automatically uses mocked Bluetooth data:

```bash
npm run dev
```

Mock data from `mocks/devices.json` allows you to:
- Test without AirPods connected
- Verify different battery level scenarios  
- Test edge cases and error handling

See [`mocks/README.md`](./mocks/README.md) for details on customizing mock data.
