# Quickstart & Verification: Fix Send File Button Bug & UI Simplification

This guide outlines the validation scenarios to confirm that the javascript initialization error is resolved and the light mode user interface layout renders correctly.

## 1. Run Automated Backend Suite
Verify that existing transfer/SSE routes function correctly:
```bash
npm test
```

## 2. Manual Verification Scenarios

### Scenario A: Clean Browser Load
1. Start the server: `npm start`
2. Open the page [http://localhost:3000](http://localhost:3000) in a desktop browser.
3. Right-click and inspect the console logs.
4. **Expected Outcome**: The console contains **0 errors/warnings** on load. The device name is assigned and displayed correctly.

### Scenario B: Light Mode Visual Layout Check
1. Inspect the layout in both PC browser and mobile phone viewport sizes.
2. **Expected Outcome**: The page background is white/light-grey, typography is crisp system-sans-serif, buttons have high contrast, cards are simple, and there are no dark glassmorphic backgrounds.

### Scenario C: File Transfer Dialog Execution
1. Open the page in two separate browser instances/devices.
2. Select a target peer from the discovered peers list.
3. Select a small test file (<5MB) in the Send File tab.
4. Click **Send File**.
5. **Expected Outcome**: The transfer dialog opens successfully displaying "Waiting for acceptance...", confirming that the click event listener binds and triggers correctly.
