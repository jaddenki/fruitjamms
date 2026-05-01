// Pixel reveal — defaults aligned with https://github.com/jaddenki/type (gooey SVG + shader)
export const CONFIG = {
  // Text
  text:           'jamms',
  fontFamily:     'Pixel Arial',
  fontWeight:     '400',
  fontSizeScale:  0.12,
  fontSizeMax:    160,

  // Animation timing
  duration:       2200,
  autoPlayDelay:  300,
  easing:         'easeOutCubic',

  // Sweep
  sweepSpeed:     1.8,
  sweepSpread:    1.0,
  sweepOffset:    0.1,

  // Pixelation
  maxBlockSize:   12.0,
  minBlockSize:   6.0,

  // Jitter (upstream defaults for calmer gooey silhouette)
  jitterAmount:   0.006,
  jitterBase:     0.0,
  jitterFPS:      1.0,

  // Gooey — blur + contrast on alpha; warp/drift/shader match upstream repo
  gooey:           true,
  gooeyBlur:       1.5,
  gooeyContrast:   50,
  gooeyStrength:   0.06,
  gooeyStiffness:  0.06,
  gooeyDamping:    0.72,
  gooeyWarp:       0.35,
  gooeyWarpRadius: 0.16,
  gooeySwirl:      0.3,

  // 3D model post FX (used by src/pages/index.astro)
  modelPixelSize:  6.0,
  modelPink:       [1.0, 0.298, 0.612],
};
