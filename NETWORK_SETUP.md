# Local Network QR Code Access Setup

This guide explains how to access and test the QR code scanning system from other devices on the same WiFi network.

## Prerequisites

- Both devices (main device running the app and test device) must be on the **same WiFi network**
- Node.js server must be running on the main device

## Starting the Application for Network Access

### 1. Terminal 1 - Start the Backend Server

```bash
cd d:\projects\passion-clothing
npm run server
```

The server will start on `http://localhost:5000`

**Important:** The server CORS is configured to accept requests from your local network IP (192.168.x.x:3000)

### 2. Terminal 2 - Start the Frontend Development Server

```bash
cd d:\projects\passion-clothing\client
npm run dev
```

The frontend will be available at:
- **Local machine:** `http://localhost:3000`
- **Other devices on WiFi:** `http://<YOUR_LOCAL_IP>:3000` (automatically detected)

Example: `http://192.168.1.100:3000`

## How to Find Your Local IP Address

### On Windows:
```bash
ipconfig
```
Look for "IPv4 Address" - it should be something like `192.168.1.xxx`

### On Mac/Linux:
```bash
ifconfig
```
Look for inet address starting with `192.168` or `10.0`

## Testing QR Code Scanning

### On the Main Device:

1. Navigate to a sales order
2. Click "Show QR Code"
3. A QR code is generated that contains:
   - Your local network IP (e.g., `192.168.1.100:3000`)
   - Encoded order data
   - Link to `/qr/view?data={encoded_data}`

### On Another Device (Same WiFi):

1. Open a QR code scanner app on your phone
2. Scan the QR code from the main device
3. **The app will detect your local network IP and generate a scannable URL**
4. You should see the order details in a clean **table format**

## What Happens Behind the Scenes

1. **IP Detection:** The app uses WebRTC to detect the local IP address
2. **QR Generation:** The QR code contains a URL like:
   ```
   http://192.168.1.100:3000/qr/view?data={encoded_order_data}
   ```
3. **Network Access:** Any device on the same WiFi can now access this URL
4. **Display Page:** The `/qr/view` page renders the data in a beautiful table format

## Troubleshooting

### Issue: "Connection refused" on other device

**Solution:**
- Verify both devices are on the **same WiFi network**
- Check your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
- Make sure the frontend is running on port 3000

### Issue: QR code still shows localhost

**Solution:**
- The network IP detection takes a moment (WebRTC ICE gathering)
- Wait 1-2 seconds after opening the QR code modal
- Refresh the page if still showing localhost

### Issue: Firewall blocking access

**Solution:**
- Add an exception for Node.js in your Windows Firewall
- Or temporarily disable firewall for testing (not recommended for production)

## CORS Configuration

The backend CORS settings are configured in `server/index.js`:
- Development mode: Allows all origins (192.168.x.x:3000)
- Production mode: Restricted to configured origins

For development, CORS is permissive to enable local network access.

## Environment Variables

Ensure `.env` file has (optional for local network):
```env
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

The app will also accept requests from your local network IP automatically.

## Production Deployment

For production deployment, update:
1. **Backend:** Set proper CORS_ORIGIN to your production domain
2. **Frontend:** Configure environment variables for your deployment URL
3. **QR Code:** Will generate URLs pointing to your production domain

## Example Workflow

```
Main Device (192.168.1.100:3000)
    ↓
    [Create/View Order]
    ↓
    [Show QR Code]
    ↓
    QR Code generated with: http://192.168.1.100:3000/qr/view?data=...
    ↓
Other Device (Same WiFi)
    ↓
    [Scan QR Code with phone camera]
    ↓
    [Browser opens] → http://192.168.1.100:3000/qr/view?data=...
    ↓
    [Table view of order data]
    ↓
    [Copy network URL or scan again]
```

## Tips for Best Experience

1. **Keep devices close** during QR scanning for best QR reader reliability
2. **Use high brightness** on the main device for better QR code visibility
3. **Test with built-in camera apps** first before using third-party scanners
4. **The app automatically detects WiFi IP** - no manual configuration needed!

---

**Ready to test?** Start both terminals, generate a QR code, and scan it from another device on the same WiFi! 🚀
