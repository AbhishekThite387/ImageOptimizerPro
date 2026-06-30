/**
 * Image Optimizer Pro — script.js
 * Clean, modular Vanilla JS
 * Backend integration: TODO (API Gateway endpoint)
 */

/* =============================================
   1. DOM REFERENCES
============================================= */
const tabUpload = document.querySelector("#tabUpload");
const tabUrl = document.querySelector("#tabUrl");
const panelUpload = document.querySelector("#panelUpload");
const panelUrl = document.querySelector("#panelUrl");

const dropZone = document.querySelector("#dropZone");
const fileInput = document.querySelector("#fileInput");
const browseBtn = document.querySelector("#browseBtn");
const dropZoneContent = document.querySelector("#dropZoneContent");
const imagePreviewWrap = document.querySelector("#imagePreviewWrap");
const imagePreview = document.querySelector("#imagePreview");
const previewFileName = document.querySelector("#previewFileName");
const removeImageBtn = document.querySelector("#removeImageBtn");

const imageUrlInput = document.querySelector("#imageUrl");
const urlPreviewWrap = document.querySelector("#urlPreviewWrap");
const urlPreview = document.querySelector("#urlPreview");

const outputFormat = document.querySelector("#outputFormat");
const outputWidth = document.querySelector("#outputWidth");
const outputHeight = document.querySelector("#outputHeight");
const qualitySlider = document.querySelector("#qualitySlider");
const qualityValue = document.querySelector("#qualityValue");

const processBtn = document.querySelector("#processBtn");
const processIcon = document.querySelector("#processIcon");
const processBtnText = document.querySelector("#processBtnText");

const errorCard = document.querySelector("#errorCard");
const errorMessage = document.querySelector("#errorMessage");
const errorClose = document.querySelector("#errorClose");

const loadingCard = document.querySelector("#loadingCard");
const progressFill = document.querySelector("#progressFill");
const progressPercent = document.querySelector("#progressPercent");

const resultSection = document.querySelector("#resultSection");
const originalPreviewResult = document.querySelector("#originalPreviewResult");
const optimizedPreviewResult = document.querySelector(
  "#optimizedPreviewResult",
);

const statOriginalSize = document.querySelector("#statOriginalSize");
const statOptimizedSize = document.querySelector("#statOptimizedSize");
const statSaved = document.querySelector("#statSaved");
const statCompression = document.querySelector("#statCompression");
const statOrigRes = document.querySelector("#statOrigRes");
const statNewRes = document.querySelector("#statNewRes");
const statFormat = document.querySelector("#statFormat");
const statTime = document.querySelector("#statTime");

const downloadBtn = document.querySelector("#downloadBtn");
const resetBtn = document.querySelector("#resetBtn");

/* =============================================
   2. APP STATE
============================================= */
const state = {
  activeTab: "upload", // 'upload' | 'url'
  uploadedFile: null, // File object from file input
  imageDataURL: null, // Preview data URL for uploaded image
  processingTimer: null, // Holds the simulation interval reference
};

/* Processing step definitions */
const STEPS = [
  { label: "Downloading Image", duration: 1000 },
  { label: "Uploading to S3", duration: 1200 },
  { label: "Triggering Lambda", duration: 800 },
  { label: "Compressing Image", duration: 1500 },
  { label: "Uploading Processed Image", duration: 1000 },
  { label: "Generating Download Link", duration: 700 },
  { label: "Completed", duration: 400 },
];

/* Dummy result data (replace with real API response later) */
const DUMMY_RESULTS = {
  originalSize: "3.24 MB",
  optimizedSize: "386 KB",
  saved: "2.87 MB",
  compression: "88.4%",
  originalRes: "3840 × 2160",
  processingTime: "2.8s",
};

/* =============================================
   3. TAB SWITCHING
============================================= */

/**
 * Switch between Upload and URL tabs.
 * @param {string} tab - 'upload' | 'url'
 */
function switchTab(tab) {
  state.activeTab = tab;

  // Toggle tab buttons
  tabUpload.classList.toggle("active", tab === "upload");
  tabUrl.classList.toggle("active", tab === "url");

  // Toggle panels
  panelUpload.classList.toggle("active", tab === "upload");
  panelUrl.classList.toggle("active", tab === "url");

  // Hide error whenever user switches
  hideError();
}

tabUpload.addEventListener("click", () => switchTab("upload"));
tabUrl.addEventListener("click", () => switchTab("url"));

/* =============================================
   4. FILE UPLOAD — DRAG & DROP + BROWSE
============================================= */

/** Open native file picker when Browse button clicked */
browseBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  fileInput.click();
});

/** Open file picker when clicking the drop zone itself (not the preview) */
dropZone.addEventListener("click", (e) => {
  if (imagePreviewWrap.contains(e.target)) return;
  fileInput.click();
});

/** Handle file selection via input */
fileInput.addEventListener("change", () => {
  if (fileInput.files.length > 0) {
    previewUploadedImage(fileInput.files[0]);
  }
});

/** Drag events */
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("drag-over");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("drag-over");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("drag-over");
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith("image/")) {
    previewUploadedImage(file);
  }
});

/**
 * Load and preview an uploaded image file.
 * @param {File} file
 */
function previewUploadedImage(file) {
  state.uploadedFile = file;

  originalImageSize = file.size;

  const img = new Image();

  img.onload = () => {
    originalWidth = img.width;
    originalHeight = img.height;
  };

  img.src = URL.createObjectURL(file);
  const reader = new FileReader();

  reader.onload = (e) => {
    state.imageDataURL = e.target.result;
    imagePreview.src = e.target.result;
    previewFileName.textContent = file.name;

    // Show preview, hide drop prompt
    dropZoneContent.classList.add("hidden");
    imagePreviewWrap.classList.remove("hidden");
    hideError();
  };

  reader.readAsDataURL(file);
}

/** Remove the selected image and reset the drop zone */
removeImageBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  state.uploadedFile = null;
  state.imageDataURL = null;
  fileInput.value = "";
  imagePreview.src = "";
  dropZoneContent.classList.remove("hidden");
  imagePreviewWrap.classList.add("hidden");
});

/* =============================================
   5. URL INPUT — LIVE PREVIEW
============================================= */

/**
 * Preview image from URL input after user stops typing.
 * Debounced to 600ms.
 */
let urlDebounceTimer;
imageUrlInput.addEventListener("input", () => {
  clearTimeout(urlDebounceTimer);
  urlDebounceTimer = setTimeout(() => {
    const url = imageUrlInput.value.trim();
    if (url) {
      urlPreview.src = url;
      urlPreview.onload = () => urlPreviewWrap.classList.remove("hidden");
      urlPreview.onerror = () => urlPreviewWrap.classList.add("hidden");
    } else {
      urlPreviewWrap.classList.add("hidden");
    }
  }, 600);
});

/* =============================================
   6. QUALITY SLIDER
============================================= */

/** Update the displayed quality value when slider changes. */
function updateQualityValue() {
  qualityValue.textContent = qualitySlider.value;
  // Update slider fill visually via background
  const pct = ((qualitySlider.value - 10) / 90) * 100;
  qualitySlider.style.background = `linear-gradient(to right, #7C3AED ${pct}%, rgba(255,255,255,0.08) ${pct}%)`;
}

qualitySlider.addEventListener("input", updateQualityValue);

// Init slider fill on load
updateQualityValue();

/* =============================================
   7. INPUT VALIDATION
============================================= */

/**
 * Convert a File object to a raw Base64 string (no data: URL prefix).
 * @param {File} file
 * @returns {Promise<string>}
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // reader.result looks like "data:image/png;base64,AAAA..."
      // strip everything up to and including the comma
      const result = reader.result;
      const base64 = result.substring(result.indexOf(",") + 1);
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Validate that the user has provided an image source.
 * @returns {boolean} true if valid
 */
function validateInput() {
  if (state.activeTab === "upload") {
    if (!state.uploadedFile) {
      showError(
        "Please upload an image by dragging it in or clicking Browse Files.",
      );
      return false;
    }
  } else {
    const url = imageUrlInput.value.trim();
    if (!url) {
      showError("Please paste a valid image URL before processing.");
      return false;
    }
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      showError("URL must start with http:// or https://");
      return false;
    }
  }
  return true;
}

/* =============================================
   8. ERROR DISPLAY
============================================= */

/**
 * Show the error card with a custom message.
 * @param {string} msg
 */
function showError(msg) {
  errorMessage.textContent = msg;
  errorCard.classList.remove("hidden");
  // Scroll into view
  errorCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/** Hide the error card. */
function hideError() {
  errorCard.classList.add("hidden");
}

errorClose.addEventListener("click", hideError);

/* =============================================
   9. LOADING / PROGRESS SIMULATION
============================================= */

/**
 * Show the loading card and start the step animation.
 */
function showLoading() {
  loadingCard.classList.remove("hidden");
  loadingCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
  runStepAnimation();
}

/** Hide the loading card and reset progress. */
function hideLoading() {
  loadingCard.classList.add("hidden");
  progressFill.style.width = "0%";
  progressPercent.textContent = "0%";
}

/**
 * Update a single step element's visual state.
 * @param {number} index    - Step index (0-based)
 * @param {'pending'|'processing'|'done'} status
 */
function updateProgress(index, status) {
  const stepEl = document.querySelector(`#step-${index}`);
  const iconEl = stepEl.querySelector(".step-icon");
  const statusEl = stepEl.querySelector(".step-status");

  // Clear previous state classes
  stepEl.classList.remove("step-active", "step-completed");
  iconEl.classList.remove("step-pending", "step-processing", "step-done");

  if (status === "processing") {
    stepEl.classList.add("step-active");
    iconEl.classList.add("step-processing");
    statusEl.textContent = "Processing...";
  } else if (status === "done") {
    stepEl.classList.add("step-completed");
    iconEl.classList.add("step-done");
    statusEl.textContent = "Done ✓";
  } else {
    iconEl.classList.add("step-pending");
    statusEl.textContent = "Waiting...";
  }
}

/**
 * Sequentially animate through all pipeline steps.
 * Uses cumulative timeouts based on each step's duration.
 */
function runStepAnimation() {
  let elapsed = 0;
  const total = STEPS.reduce((sum, s) => sum + s.duration, 0);

  STEPS.forEach((step, i) => {
    // Mark step as "processing" at start of its slot
    setTimeout(() => {
      updateProgress(i, "processing");

      // Update progress bar
      const progress = Math.round((elapsed / total) * 100);
      progressFill.style.width = `${progress}%`;
      progressPercent.textContent = `${progress}%`;
    }, elapsed);

    elapsed += step.duration;

    // Mark step as "done" at end of its slot
    const doneAt = elapsed;
    setTimeout(() => {
      updateProgress(i, "done");

      // Final step: complete the bar and show results
      if (i === STEPS.length - 1) {
        progressFill.style.width = "100%";
        progressPercent.textContent = "100%";
        setTimeout(() => {
          hideLoading();
        }, 400);
      }
    }, doneAt);
  });
}

/* =============================================
   10. RESULT DISPLAY
============================================= */

/**
 * Reveal the result section and populate it with data.
 * In production, pass the real API response object instead of DUMMY_RESULTS.
 */
function showResult() {
  // Determine which image to show as "original"
  const src = state.imageDataURL || imageUrlInput.value.trim();
  originalPreviewResult.src = src;
  optimizedPreviewResult.src = src; // In production: use pre-signed S3 URL

  // Populate stats from dummy (replace with real data later)
  statOriginalSize.textContent = DUMMY_RESULTS.originalSize;
  statOptimizedSize.textContent = DUMMY_RESULTS.optimizedSize;
  statSaved.textContent = DUMMY_RESULTS.saved;
  statCompression.textContent = DUMMY_RESULTS.compression;
  statOrigRes.textContent = DUMMY_RESULTS.originalRes;
  statNewRes.textContent = `${outputWidth.value} × ${outputHeight.value}`;
  statFormat.textContent = outputFormat.value.toUpperCase();
  statTime.textContent = DUMMY_RESULTS.processingTime;

  // Show the result section
  resultSection.classList.remove("hidden");
  resultSection.scrollIntoView({ behavior: "smooth", block: "start" });

  // Enable download button (will wire to pre-signed URL later)
  downloadBtn.removeAttribute("disabled");
}

/* =============================================
   11. RESET UI
============================================= */

/**
 * Reset the entire UI back to its initial state.
 * Call when user clicks "Process Another".
 */
function resetUI() {
  // Clear state
  state.uploadedFile = null;
  state.imageDataURL = null;
  fileInput.value = "";

  // Reset drop zone
  imagePreview.src = "";
  dropZoneContent.classList.remove("hidden");
  imagePreviewWrap.classList.add("hidden");

  // Reset URL tab
  imageUrlInput.value = "";
  urlPreviewWrap.classList.add("hidden");
  urlPreview.src = "";

  // Reset settings
  outputWidth.value = "1280";
  outputHeight.value = "720";
  qualitySlider.value = "85";
  outputFormat.value = "webp";
  updateQualityValue();

  // Hide result, error, loading
  resultSection.classList.add("hidden");
  hideLoading();
  hideError();

  // Re-disable download button
  downloadBtn.setAttribute("disabled", true);

  // Reset process button
  setProcessingState(false);

  // Go back to top
  window.scrollTo({ top: 0, behavior: "smooth" });

  // Reset step icons
  STEPS.forEach((_, i) => updateProgress(i, "pending"));
}

resetBtn.addEventListener("click", resetUI);

/* =============================================
   12. PROCESS BUTTON — MAIN FLOW
============================================= */

let processedDownloadUrl = "";

function setProcessingState(isLoading) {
  if (isLoading) {
    processBtn.classList.add("loading");
    processBtnText.textContent = "Processing...";

    processIcon.setAttribute("viewBox", "0 0 24 24");
    processIcon.innerHTML = `
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="2"
        fill="none"
        stroke-dasharray="31.4"
        stroke-dashoffset="10"
      />
    `;

    processIcon.classList.add("spinner-icon");
  } else {
    processBtn.classList.remove("loading");
    processBtnText.textContent = "Process Image";

    processIcon.innerHTML = `
      <path
        d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
        stroke="currentColor"
        stroke-width="2"
        fill="none"
      />
    `;

    processIcon.classList.remove("spinner-icon");
  }
}

processBtn.addEventListener("click", async () => {
  hideError();

  if (!validateInput()) return;

  setProcessingState(true);

  resultSection.classList.add("hidden");
  downloadBtn.setAttribute("disabled", true);

  showLoading();

  try {
    // ── Build payload based on active tab ──────────────────────────
    // Image URL feature: unchanged behavior — image_url is sent,
    // image_base64/file_name stay empty.
    // Upload Image feature: file is converted to Base64 and sent
    // instead — image_url stays empty.
    let imageBase64 = "";
    let fileName = "";

    if (state.activeTab === "upload") {
      // Convert the selected file to a Base64 string (no data: prefix)
      imageBase64 = await fileToBase64(state.uploadedFile);
      fileName = state.uploadedFile.name;
    }

    const payload = {
      image_url: state.activeTab === "url" ? imageUrlInput.value.trim() : "",
      image_base64: imageBase64,
      file_name: fileName,
      width: Number(outputWidth.value),
      height: Number(outputHeight.value),
      quality: Number(qualitySlider.value),
      format: outputFormat.value.toUpperCase(),
    };

    const start = performance.now();

    const response = await fetch(
      "https://9l3zm7nekk.execute-api.ap-south-1.amazonaws.com/dev/process",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );
    const data = await response.json();

    const end = performance.now();

    if (!response.ok) {
      throw new Error(data.message || "Processing failed.");
    }

    processedDownloadUrl = data.download_url;

    // Original Image — size & dimensions
    // URL mode: fetch the source URL exactly as before (unchanged).
    // Upload mode: size & dimensions were already captured in
    // previewUploadedImage(), so we reuse them instead of re-fetching.
    let originalPreviewSrc;

    if (state.activeTab === "url") {
      const originalResponse = await fetch(imageUrlInput.value.trim());
      const originalBlob = await originalResponse.blob();

      originalImageSize = originalBlob.size;

      const originalImg = new Image();

      await new Promise((resolve) => {
        originalImg.onload = () => {
          originalWidth = originalImg.width;
          originalHeight = originalImg.height;
          resolve();
        };
        originalImg.src = imageUrlInput.value.trim();
      });

      originalPreviewSrc = imageUrlInput.value.trim();
    } else {
      // originalImageSize / originalWidth / originalHeight already set
      // by previewUploadedImage() when the file was selected.
      originalPreviewSrc = state.imageDataURL;
    }

    // ── Optimized Image ──────────────────────────────────────────────
    // Root cause of blob.size = 0:
    //   S3 pre-signed URLs use Transfer-Encoding: chunked and may not
    //   expose Content-Length via CORS headers. Calling .blob() on a
    //   chunked/gzip response can yield size = 0 because the browser
    //   defers body consumption. Using .arrayBuffer() forces the entire
    //   body to be read into memory first, so byteLength is always real.
    const optimizedResponse = await fetch(data.download_url);

    // Debug — log everything useful so you can inspect in DevTools
    console.log(
      "[Optimizer] optimized response status:",
      optimizedResponse.status,
    );
    console.log(
      "[Optimizer] optimized Content-Length header:",
      optimizedResponse.headers.get("Content-Length"),
    );
    console.log(
      "[Optimizer] optimized Content-Type header:",
      optimizedResponse.headers.get("Content-Type"),
    );
    console.log(
      "[Optimizer] optimized Transfer-Encoding header:",
      optimizedResponse.headers.get("Transfer-Encoding"),
    );

    // Read the full body as an ArrayBuffer — byteLength is always correct
    // regardless of chunked encoding, gzip, or missing Content-Length.
    const optimizedBuffer = await optimizedResponse.arrayBuffer();
    const optimizedSize = optimizedBuffer.byteLength;

    console.log("[Optimizer] optimizedBuffer.byteLength:", optimizedSize);

    // Convert the buffer to a Blob for preview and download.
    // Using a local blob:// URL means the `download` attribute is honoured
    // by the browser (cross-origin pre-signed S3 URLs ignore it).
    const contentType =
      optimizedResponse.headers.get("Content-Type") ||
      "image/" + outputFormat.value.toLowerCase();
    const optimizedBlob = new Blob([optimizedBuffer], { type: contentType });
    const optimizedObjectUrl = URL.createObjectURL(optimizedBlob);

    // Store blob URL so download button uses it
    processedDownloadUrl = optimizedObjectUrl;

    // Read the ACTUAL optimized image resolution (Pillow's thumbnail()
    // preserves aspect ratio, so this can differ from the requested
    // width/height entered by the user).
    let optimizedWidth = 0;
    let optimizedHeight = 0;

    await new Promise((resolve) => {
      const optimizedImg = new Image();
      optimizedImg.onload = () => {
        optimizedWidth = optimizedImg.width;
        optimizedHeight = optimizedImg.height;
        resolve();
      };
      optimizedImg.src = optimizedObjectUrl;
    });

    // ── Helper: auto-select Bytes / KB / MB ──────────────────────────
    function formatBytes(bytes) {
      if (!bytes || bytes === 0) return "0 Bytes";
      if (bytes < 1024) return bytes + " Bytes";
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
      return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    }

    // ── Statistics ────────────────────────────────────────────────────
    const saved = originalImageSize - optimizedSize;
    const compressionPct =
      originalImageSize > 0
        ? ((saved / originalImageSize) * 100).toFixed(1)
        : "0.0";

    console.log(
      "[Optimizer] originalImageSize:",
      originalImageSize,
      "optimizedSize:",
      optimizedSize,
      "saved:",
      saved,
    );

    statOriginalSize.textContent = formatBytes(originalImageSize);
    statOptimizedSize.textContent = formatBytes(optimizedSize);
    statSaved.textContent = formatBytes(Math.abs(saved));
    statCompression.textContent = compressionPct + "%";
    statOrigRes.textContent =
      originalWidth && originalHeight
        ? `${originalWidth} × ${originalHeight}`
        : "—";

    hideLoading();

    originalPreviewResult.src = originalPreviewSrc;
    optimizedPreviewResult.src = optimizedObjectUrl; // use blob URL for preview too

    statFormat.textContent = outputFormat.value.toUpperCase();
    statNewRes.textContent = `${optimizedWidth} × ${optimizedHeight}`;
    statTime.textContent = ((end - start) / 1000).toFixed(2) + " sec";

    resultSection.classList.remove("hidden");

    downloadBtn.removeAttribute("disabled");

    resultSection.scrollIntoView({
      behavior: "smooth",
    });

    console.log(data);
  } catch (err) {
    hideLoading();
    showError(err.message);
    console.error(err);
  } finally {
    setProcessingState(false);
  }
});

/* =============================================
   13. DOWNLOAD BUTTON
============================================= */

downloadBtn.addEventListener("click", () => {
  if (!processedDownloadUrl) {
    showError("No processed image available.");
    return;
  }

  const ext = outputFormat.value.toLowerCase();
  const link = document.createElement("a");

  link.href = processedDownloadUrl;
  // blob:// URLs are same-origin so the browser honours the `download`
  // attribute and saves the file instead of opening it in a new tab.
  link.download = "optimized-image." + ext;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

/* =============================================
   14. NAVBAR SCROLL EFFECT
============================================= */

/** Add a subtle shadow to navbar on scroll */
window.addEventListener(
  "scroll",
  () => {
    const navbar = document.querySelector("#navbar");
    if (window.scrollY > 20) {
      navbar.style.boxShadow = "0 4px 32px rgba(0,0,0,0.5)";
    } else {
      navbar.style.boxShadow = "none";
    }
  },
  { passive: true },
);

/* =============================================
   15. INIT
============================================= */

/** Run on page load */
function init() {
  // Set initial step states
  STEPS.forEach((_, i) => updateProgress(i, "pending"));
  // Ensure slider fill is correct on load
  updateQualityValue();
}

init();
