```
<script src="https://yourdomain.com/fingerprint.js"></script>

<script>
  window.onFingerprintReady = function (fp) {
    console.log("Device FP:", fp);

    // Məsələn, sənin backendinə göndər:
    fetch("https://api.qrcodecreator.com/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fingerprint: fp })
    });
  };
</script>
```
