# 3D Capture Technologies — Research

> Updated: 2026-02-20
> Sources cited inline

## 1. Photogrammetry (CURRENT — our primary method)

### How it works

Reconstructs 3D models from overlapping 2D photographs using triangulation.

### Quality

- Photorealistic textures with true RGB color
- Sub-millimeter accuracy achievable with proper setup
- BEST for food/product objects — captures fine detail, natural color, realistic textures
- LiDAR generates far less detail for small objects (food, products) than photogrammetry

### Automated Pipeline Options (CRITICAL — full automation required)

| Service                          | Type                 | Speed              | Pricing               | API                                  |
| -------------------------------- | -------------------- | ------------------ | --------------------- | ------------------------------------ |
| **Reali3 API**                   | Cloud REST API       | Seconds to minutes | ~$0.10/image (beta)   | YES — upload images, get 3D back     |
| **Autodesk Reality Capture API** | Cloud API            | Minutes            | Enterprise pricing    | YES — via Autodesk Platform Services |
| **PIX4Dengine**                  | SDK/API              | Minutes            | Custom pricing        | YES — SDK for integration            |
| **Beholder**                     | Cloud REST API       | Minutes            | TBD                   | YES — export STL/OBJ/GLB             |
| **OpenScanCloud**                | Open source          | Variable           | Free (self-host)      | YES — web API                        |
| **RealityCapture**               | Desktop (Epic Games) | Fast               | $15k perpetual or PPI | CLI automation possible              |
| **Meshroom/AliceVision**         | Open source          | Slow               | Free                  | CLI-based pipeline                   |

### RECOMMENDATION for our automated pipeline

**Primary**: Reali3 API (purpose-built for this exact use case — photos in, 3D out, REST API)
**Backup**: Autodesk Reality Capture API (enterprise-grade, proven)
**Self-hosted option**: OpenScanCloud + Meshroom (full control, no per-image costs)

### Output formats: OBJ, PLY, GLTF/GLB, LAS

---

## 2. 3D Gaussian Splatting (NEWEST — high priority to adopt)

### How it works

Represents scenes as millions of 3D Gaussians (colored blobs) that are "splatted" onto the screen. Learns Gaussian positions/shapes from photos.

### Quality

- Photorealistic rendering, sometimes BETTER than NeRF for visual quality
- Real-time rendering (60fps+) — critical for web viewers
- Weakness: can look "chunky" if Gaussians are too large or poorly optimized
- Less effective for very fine geometric detail

### Speed

- Training: minutes to hours (vs. hours/days for NeRF)
- Rendering: REAL-TIME (this is the game-changer vs NeRF)

### State of the Art (2025-2026)

- **2025 was the year 3DGS moved from research to production**
- Apple released **SHARP** (Dec 2025): generates 3DGS from a SINGLE IMAGE in under 1 second
  - Open source: github.com/apple/ml-sharp
  - On HuggingFace: huggingface.co/apple/Sharp
  - Compatible with standard .ply viewers
  - visionOS 26 Photos app has one-click "Spatial Scene" from any photo
- Used in Jurassic World Rebirth (2025) for preproduction
- .ply output format compatible with many public renderers

### Automation potential: VERY HIGH

- Apple SHARP: single image → 3DGS in <1 second (open source, self-hostable)
- Could run as serverless function on GPU cloud
- No human intervention needed

### RECOMMENDATION

**Adopt 3D Gaussian Splatting as secondary output format alongside mesh-based photogrammetry.**
Use SHARP for quick previews / low-cost captures. Use multi-image 3DGS for premium captures.

---

## 3. Neural Radiance Fields (NeRF)

### How it works

Neural network learns a volumetric representation of a scene from photos. Renders by shooting rays through the neural field.

### Quality

- Excellent detail with fine textures and complex lighting
- Smooth surfaces with accurate geometry
- Better than 3DGS for tiny, complex geometric areas

### Speed

- Training: hours to days
- Rendering: SLOW (not real-time) — this is the critical weakness
- Instant-NGP improved training to minutes but rendering still slow

### Current State (2025-2026)

- Being SUPERSEDED by 3D Gaussian Splatting for most commercial uses
- Research now focuses on combining NeRF detail with 3DGS speed
- Still relevant for highest-quality offline rendering

### Automation potential: MODERATE

- Nerfacto, Instant-NGP can be automated via CLI
- Slow processing limits throughput

### RECOMMENDATION

**Monitor but don't invest heavily.** 3DGS is winning the commercial race.
Consider hybrid NeRF+3DGS approaches when they mature.

---

## 4. LiDAR Scanning

### How it works

Emits laser pulses, measures time-of-flight to create 3D point clouds.

### For food/product objects: NOT RECOMMENDED as primary method

- Generates FAR less detail than photogrammetry for small objects
- Lacks true color/texture information (captures geometry only)
- Objects reflect less laser light → less detail for food/products
- Equipment expensive: $15K-$100K+ for professional systems

### Where LiDAR IS useful

- Large spaces (rooms, buildings, construction sites)
- Combining with photogrammetry for structural accuracy + visual quality
- iPhone/iPad LiDAR: useful for quick room scans, NOT for product quality

### Mobile LiDAR (iPhone/iPad)

- Apps: Polycam, Scaniverse, 3D Scanner App
- Quality: sufficient for room-scale, insufficient for product-quality capture
- Scaniverse (Niantic): fast, on-device processing, Apple-only
- Polycam: cross-platform, supports both LiDAR + photogrammetry

### RECOMMENDATION

**Use LiDAR only for space/room capture vertical (real estate, architecture).**
For food/product: photogrammetry remains superior.

---

## 5. Structured Light Scanning

### How it works

Projects known light patterns onto object, camera captures deformation to calculate 3D shape.

### Quality

- Very high geometric accuracy
- Good for industrial/manufacturing applications
- Less photorealistic than photogrammetry (no natural texture capture)

### Key Products

- **Artec**: Eva ($15K), Leo ($35K), Space Spider ($25K) — professional grade
- **EinScan**: more affordable ($5-15K range)
- **Revopoint**: consumer/prosumer ($500-$2K)

### For our use case

- Overkill for food/restaurant objects
- Could be relevant for retail products, automotive parts, industrial objects
- NOT portable enough for on-site capture at restaurants

### RECOMMENDATION

**Only adopt for specific industrial/manufacturing verticals in future.**

---

## 6. AI Single-Image 3D Generation

### How it works

Neural network predicts 3D shape from a single 2D image.

### Key Tools (2025-2026)

- **Apple SHARP**: single image → 3DGS in <1 second (BEST current option)
- **TripoSR**: single image → mesh
- **Meshy**: text/image to 3D
- **Kaedim**: image to game-ready 3D
- **Point-E** (OpenAI): text to 3D point cloud

### Quality

- NOT production-ready for photorealistic assets (yet)
- Good for previews, placeholders, concept visualization
- Apple SHARP is closest to production quality (25-34% better than prior models)
- Improving RAPIDLY — revisit every 6 months

### RECOMMENDATION

**Use Apple SHARP for instant previews / budget captures.**
**Do NOT use for premium deliverables — quality gap still too large.**
Will become viable for production within 1-2 years at current pace.

---

## 7. Cloud GPU Processing Options

| Provider          | GPUs Available  | Pricing               | Best For                  |
| ----------------- | --------------- | --------------------- | ------------------------- |
| RunPod            | A100, H100, A40 | $0.44-$2.49/hr        | Serverless GPU, on-demand |
| Lambda            | A100, H100      | $1.10-$2.50/hr        | Reserved capacity         |
| AWS (EC2 P4/P5)   | A100, H100      | $12-32/hr (on-demand) | Enterprise scale          |
| Google Cloud (A3) | H100, A100      | Similar to AWS        | Enterprise scale          |
| Vast.ai           | Various         | $0.10-$1.00/hr        | Budget processing         |

### RECOMMENDATION

**RunPod for serverless GPU processing** — spin up, process, spin down. No idle costs.
Use for SHARP, photogrammetry, and future 3DGS processing.

---

## MASTER RECOMMENDATION: Capture Tech Roadmap

### Phase 1 (NOW): Automated Photogrammetry Pipeline

- Integrate Reali3 API or self-host with OpenScanCloud/Meshroom
- Technician uploads photos → API processes → 3D model auto-delivered
- Output: GLB/GLTF for web, USDZ for iOS AR

### Phase 2 (3-6 months): Add 3D Gaussian Splatting

- Deploy Apple SHARP for instant preview generation
- Add 3DGS viewer alongside mesh viewer on website
- Offer "instant preview" (SHARP) + "full quality" (photogrammetry) tiers

### Phase 3 (6-12 months): Hybrid Pipeline

- Combine photogrammetry meshes with 3DGS for best of both worlds
- Automated quality scoring (AI checks for artifacts, completeness)
- WebGPU-powered viewer for 15-30x rendering performance boost

### Phase 4 (12-24 months): Multi-Technology

- Add LiDAR for space/room capture (new vertical)
- Structured light for industrial clients (new vertical)
- AI single-image generation for budget tier
