// Fragment shader aligned with https://github.com/jaddenki/type — gooey = black RGB + alpha for SVG #goo
export const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fragmentShader = /* glsl */ `
  precision highp float;

  uniform sampler2D uTexture;
  uniform float uProgress;
  uniform float uTime;
  uniform vec2  uResolution;

  uniform float uMaxBlockSize;
  uniform float uMinBlockSize;
  uniform float uSweepSpeed;
  uniform float uSweepSpread;
  uniform float uSweepOffset;
  uniform float uJitterAmount;
  uniform float uJitterBase;
  uniform float uJitterFPS;
  uniform float uGooey;
  uniform vec2  uMouseUV;
  uniform vec2  uMouseVel;
  uniform float uMouseSpeed;
  uniform float uGooeyWarp;
  uniform float uGooeyWarpRadius;
  uniform float uGooeySwirl;

  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  vec2 hash2(vec2 p) {
    return vec2(
      fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123),
      fract(sin(dot(p, vec2(269.5, 183.3))) * 43758.5453123)
    );
  }

  void main() {
    vec2 uv = vUv;

    // liquid warp: velocity + swirl + noise break-up (upstream type)
    if (uGooey > 0.5) {
      float aspect = uResolution.x / uResolution.y;
      vec2 toMouse = uMouseUV - uv;
      float dist = length(toMouse * vec2(aspect, 1.0));
      float r2 = uGooeyWarpRadius * uGooeyWarpRadius;
      float pull = exp(-dist * dist / r2);

      float noiseBreak = hash(floor(uv * 30.0));
      pull *= mix(0.8, 1.0, noiseBreak);

      float angle = pull * uGooeySwirl;
      float cs = cos(angle), sn = sin(angle);
      vec2 swirlPull = vec2(toMouse.x * cs - toMouse.y * sn,
                            toMouse.x * sn + toMouse.y * cs);

      vec2 velPush = uMouseVel * pull * uMouseSpeed;

      uv += (swirlPull * pull + velPush) * uGooeyWarp;
    }

    vec2 fragCoord = uv * uResolution;

    float wave = uProgress * uSweepSpeed - uv.x * uSweepSpread - uSweepOffset;
    float localProgress = clamp(wave, 0.0, 1.0);
    localProgress = localProgress * localProgress * (3.0 - 2.0 * localProgress);

    float minBlock = max(uMinBlockSize, 1.0);
    float blockPx = mix(uMaxBlockSize, minBlock, localProgress * localProgress);
    blockPx = max(floor(blockPx + 0.5), minBlock);

    vec2 block = floor(fragCoord / blockPx) * blockPx;
    vec2 blockUV = (block + blockPx * 0.5) / uResolution;

    float noise = hash(block / uMaxBlockSize);
    float visible = step(noise, localProgress);

    float jitterAmt = uJitterAmount * (1.0 - localProgress * localProgress) + uJitterBase;
    float timeSeed  = floor(uTime * uJitterFPS);
    vec2  jitter    = (hash2(block + timeSeed) - 0.5) * jitterAmt;

    vec2 sampleUV = clamp(blockUV + jitter, 0.0, 1.0);
    vec4 texColor = texture2D(uTexture, sampleUV);

    float lum = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
    float isText = 1.0 - step(0.5, lum);

    // SVG #goo blurs this layer, feColorMatrix chokes alpha, feComposite keeps soft + crisp read
    if (uGooey > 0.5) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, visible * isText);
    } else {
      texColor = vec4(vec3(1.0 - isText), 1.0);
      gl_FragColor = mix(vec4(1.0), texColor, visible);
    }
  }
`;
