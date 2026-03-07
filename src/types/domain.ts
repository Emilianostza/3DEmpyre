/**
 * Domain Types - Phase 2+
 *
 * Shared enums used by both UI types (types.ts) and API DTOs (dtos.ts).
 */

// ============================================================================
// ENUMS
// ============================================================================

export enum ProjectStatus {
  Pending = 'pending',
  Requested = 'requested',
  Assigned = 'assigned',
  Captured = 'captured',
  Processing = 'processing',
  QA = 'qa',
  Approved = 'approved',
  InProgress = 'in_progress',
  Delivered = 'delivered',
  Archived = 'archived',
  Rejected = 'rejected',
}

export enum AssetType {
  Model3D = '3d_model',
  Photo = 'photo',
  Mesh = 'mesh',
  PointCloud = 'point_cloud',
  Video = 'video',
}

export enum AssetStatus {
  Uploaded = 'uploaded',
  Processing = 'processing',
  Published = 'published',
  Failed = 'failed',
  Archived = 'archived',
}

export enum TierType {
  Basic = 'basic',
  Standard = 'standard',
  Premium = 'premium',
  Enterprise = 'enterprise',
}

export enum PhotogrammetryJobStatus {
  Queued = 'queued',
  Preprocessing = 'preprocessing',
  FeatureExtraction = 'feature_extraction',
  FeatureMatching = 'feature_matching',
  SparseReconstruction = 'sparse_reconstruction',
  DenseReconstruction = 'dense_reconstruction',
  Meshing = 'meshing',
  Texturing = 'texturing',
  Converting = 'converting',
  QAPending = 'qa_pending',
  Completed = 'completed',
  Failed = 'failed',
  Cancelled = 'cancelled',
}

export enum PipelineEngine {
  COLMAP_OpenMVS = 'colmap_openmvs',
  MetaSAM3D = 'meta_sam_3d',
  Polycam = 'polycam',
  NeRF = 'nerf',
  GaussianSplatting = 'gaussian_splatting',
}

export enum CaptureMode {
  CrossPolarized = 'cross_polarized',
  Normal = 'normal',
  TwoPass = 'two_pass',
}

export enum TextureBakeMethod {
  SingleUDIM = 'single_udim',
  MultiUDIM = 'multi_udim',
}

export enum ModelOutputFormat {
  GLB = 'glb',
  USDZ = 'usdz',
  OBJ = 'obj',
  FBX = 'fbx',
  PLY = 'ply',
}
