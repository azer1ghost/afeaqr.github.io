(function () {
  async function getFingerprint() {
    const canvasFp = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return "unsupported";
      ctx.textBaseline = "top";
      ctx.font = "14px 'Arial'";
      ctx.fillText("Hello Fingerprint!", 2, 2);
      return canvas.toDataURL();
    };

    const webglFp = () => {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) return "unsupported";
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (!debugInfo) return "no-webgl-debug";
      const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      return `${vendor}|${renderer}`;
    };

    const audioFp = async () => {
      try {
        const ctx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(1, 44100, 44100);
        const osc = ctx.createOscillator();
        const comp = ctx.createDynamicsCompressor();
        osc.type = "triangle";
        osc.frequency.value = 10000;
        osc.connect(comp);
        comp.connect(ctx.destination);
        osc.start(0);
        const buffer = await ctx.startRendering();
        let sum = 0;
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) sum += Math.abs(data[i]);
        return sum.toString();
      } catch {
        return "audio-fail";
      }
    };

    const rawData = [
      navigator.userAgent,
      navigator.language,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      `${screen.width}x${screen.height}`,
      screen.colorDepth.toString(),
      navigator.hardwareConcurrency?.toString() || "unknown",
      navigator.deviceMemory?.toString() || "unknown",
      canvasFp(),
      webglFp(),
      await audioFp(),
    ].join("|");

    const encoder = new TextEncoder();
    const encoded = encoder.encode(rawData);
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    // ✅ Global dəyişənə yazılır
    window.__fingerprint = hashHex;

    // ✅ Əgər callback varsa, çağır
    if (typeof window.onFingerprintReady === "function") {
      window.onFingerprintReady(hashHex);
    }
  }

  getFingerprint();
})();
