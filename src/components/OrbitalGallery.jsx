import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

function getDeptImages(dept) {
  const raw = [];
  for (let i = 1; i <= dept.count; i++) {
    raw.push(`/campus-images/${dept.folder}/${dept.prefix}${i}.jpg`);
  }
  return Array.from({ length: 72 }, (_, i) => raw[i % raw.length]);
}

function createFallbackCanvas(dept) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 329;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = `${dept.color}33`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = dept.color;
  ctx.font = 'bold 76px Syne, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(dept.prefix.toUpperCase(), canvas.width / 2, canvas.height / 2 + 6);
  return canvas;
}

function createFallbackDataUrl(dept) {
  return createFallbackCanvas(dept).toDataURL('image/png');
}

function findVisibleImageBounds(image) {
  const scanCanvas = document.createElement('canvas');
  scanCanvas.width = image.naturalWidth || image.width;
  scanCanvas.height = image.naturalHeight || image.height;
  const ctx = scanCanvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(image, 0, 0);
  const { data, width, height } = ctx.getImageData(0, 0, scanCanvas.width, scanCanvas.height);
  const threshold = 22;
  const minContentRatio = 0.02;

  const rowHasContent = (y) => {
    let content = 0;
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      if (data[index] > threshold || data[index + 1] > threshold || data[index + 2] > threshold) {
        content++;
      }
    }
    return content / width > minContentRatio;
  };

  const colHasContent = (x) => {
    let content = 0;
    for (let y = 0; y < height; y++) {
      const index = (y * width + x) * 4;
      if (data[index] > threshold || data[index + 1] > threshold || data[index + 2] > threshold) {
        content++;
      }
    }
    return content / height > minContentRatio;
  };

  let top = 0;
  let bottom = height - 1;
  let left = 0;
  let right = width - 1;

  while (top < height - 1 && !rowHasContent(top)) top++;
  while (bottom > top && !rowHasContent(bottom)) bottom--;
  while (left < width - 1 && !colHasContent(left)) left++;
  while (right > left && !colHasContent(right)) right--;

  return {
    x: left,
    y: top,
    width: right - left + 1,
    height: bottom - top + 1,
  };
}

function createCoverCanvasFromImage(image, frameAspect) {
  const outputWidth = 512;
  const outputHeight = Math.round(outputWidth / frameAspect);
  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = outputWidth;
  outputCanvas.height = outputHeight;
  const outputCtx = outputCanvas.getContext('2d');
  const bounds = findVisibleImageBounds(image);
  const sourceAspect = bounds.width / bounds.height;
  let sx = bounds.x;
  let sy = bounds.y;
  let sw = bounds.width;
  let sh = bounds.height;

  if (sourceAspect > frameAspect) {
    sw = bounds.height * frameAspect;
    sx = bounds.x + (bounds.width - sw) / 2;
  } else {
    sh = bounds.width / frameAspect;
    sy = bounds.y + (bounds.height - sh) / 2;
  }

  outputCtx.drawImage(image, sx, sy, sw, sh, 0, 0, outputWidth, outputHeight);
  return outputCanvas;
}

function loadCoveredTexture(src, dept, frameAspect, onReady) {
  const image = new Image();
  image.onload = () => {
    const canvas = createCoverCanvasFromImage(image, frameAspect);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    onReady(texture, canvas.toDataURL('image/jpeg', 0.9));
  };
  image.onerror = () => {
    const canvas = createFallbackCanvas(dept);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    onReady(texture, canvas.toDataURL('image/png'));
  };
  image.src = src;
}

export default function OrbitalGallery({ dept, onBack }) {
  const mountRef = useRef(null);
  const previewRef = useRef(null);
  const previewImgRef = useRef(null);
  const cursorRef = useRef(null);
  const cursorDotRef = useRef(null);
  const textRef = useRef(null);
  const fallbackPreviewRef = useRef('');

  useEffect(() => {
    const mount = mountRef.current;
    const preview = previewRef.current;
    const previewImg = previewImgRef.current;
    const cursor = cursorRef.current;
    const cursorDot = cursorDotRef.current;
    const text = textRef.current;
    const fallbackPreview = createFallbackDataUrl(dept);
    fallbackPreviewRef.current = fallbackPreview;

    const scene = new THREE.Scene();
    scene.background = null;
    scene.fog = new THREE.Fog('#ffffff', 80, 160);

    const aspect = mount.clientWidth / mount.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 300);
    camera.position.set(0, 8, aspect < 1 ? 90 / aspect : 90);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0xffffff, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.domElement.className = 'orbital-canvas';
    mount.appendChild(renderer.domElement);

    const parallaxGroup = new THREE.Group();
    const dragGroup = new THREE.Group();
    scene.add(parallaxGroup);
    parallaxGroup.add(dragGroup);

    const cardWidth = 7.0;
    const cardHeight = 4.5;
    const cardGap = 0.5;
    const cardAspect = cardWidth / cardHeight;
    const geometry = new THREE.PlaneGeometry(cardWidth, cardHeight);
    const images = getDeptImages(dept);
    const fallbackCanvas = createFallbackCanvas(dept);
    const fallbackTexture = new THREE.CanvasTexture(fallbackCanvas);
    fallbackTexture.colorSpace = THREE.SRGBColorSpace;
    fallbackTexture.minFilter = THREE.LinearMipmapLinearFilter;
    fallbackTexture.magFilter = THREE.LinearFilter;
    const textures = [fallbackTexture];

    const ringsConfig = [
      { count: 16, speed: 0.15, direction: 1 },
      { count: 24, speed: 0.10, direction: -1 },
      { count: 32, speed: 0.05, direction: 1 },
    ].map((config) => ({
      ...config,
      radius: (cardWidth + cardGap) / (2 * Math.sin(Math.PI / config.count)),
    }));

    const allCards = [];
    const materials = [];
    const ringGroups = ringsConfig.map((config, ringIndex) => {
      const group = new THREE.Group();
      dragGroup.add(group);

      for (let i = 0; i < config.count; i++) {
        const angle = (i / config.count) * Math.PI * 2;
        const x = config.radius * Math.cos(angle);
        const z = config.radius * Math.sin(angle);
        const texIndex = (ringIndex === 0 ? 0 : ringsConfig.slice(0, ringIndex).reduce((sum, ring) => sum + ring.count, 0)) + i;
        const material = new THREE.MeshBasicMaterial({
          map: fallbackTexture,
          transparent: true,
          opacity: 1,
          side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, 0, z);
        mesh.lookAt(x * 2, 0, z * 2);
        mesh.userData = {
          ringIndex,
          imageUrl: images[texIndex],
          previewUrl: fallbackPreview,
        };
        loadCoveredTexture(images[texIndex], dept, cardAspect, (texture, previewUrl) => {
          textures.push(texture);
          material.map = texture;
          material.needsUpdate = true;
          mesh.userData.previewUrl = previewUrl;
        });
        group.add(mesh);
        allCards.push(mesh);
        materials.push(material);
      }

      return {
        group,
        baseSpeed: config.speed,
        direction: config.direction,
        velocity: 0,
        isDragging: false,
      };
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(10, 10);
    const targetRotation = { x: 0, y: 0 };
    const dragState = {
      activeRing: null,
      global: false,
      lastX: 0,
      hoveredCard: null,
    };

    const showPreview = (card) => {
      if (!preview || !previewImg) return;
      previewImg.src = card.userData.previewUrl;
      gsap.to(preview, { opacity: 1, duration: 0.3, ease: 'power2.out' });
    };

    const hidePreview = () => {
      if (!preview) return;
      gsap.to(preview, { opacity: 0, duration: 0.3, ease: 'power2.out' });
    };

    const dimCardsForHover = (hoveredCard) => {
      allCards.forEach((card) => {
        gsap.to(card.material, {
          opacity: card === hoveredCard ? 1.0 : 0.1,
          duration: 0.4,
          ease: 'power2.out',
        });
      });
    };

    const restoreCards = () => {
      materials.forEach((material) => {
        gsap.to(material, { opacity: 1.0, duration: 0.4, ease: 'power2.out' });
      });
    };

    const updateMouse = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotation.y = mouse.x * 0.12;
      targetRotation.x = mouse.y * 0.08;

      gsap.to(cursor, {
        x: event.clientX,
        y: event.clientY,
        duration: 0.6,
        ease: 'expo.out',
      });
      gsap.to(cursorDot, {
        x: event.clientX,
        y: event.clientY,
        duration: 0.1,
        ease: 'power2.out',
      });
      gsap.to(text, {
        x: -50 - mouse.x * 1.5,
        y: -50 + mouse.y * 1.5,
        duration: 0.8,
        ease: 'expo.out',
      });
    };

    const handlePointerDown = (event) => {
      updateMouse(event);
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(allCards);
      dragState.lastX = event.clientX;

      if (intersects.length > 0) {
        const ring = ringGroups[intersects[0].object.userData.ringIndex];
        dragState.activeRing = ring;
        ring.isDragging = true;
      } else {
        dragState.global = true;
      }
    };

    const handlePointerMove = (event) => {
      updateMouse(event);
      const deltaX = event.clientX - dragState.lastX;
      dragState.lastX = event.clientX;

      if (dragState.activeRing) {
        dragState.activeRing.group.rotation.y += deltaX * 0.008;
        dragState.activeRing.velocity = deltaX * 0.0009;
      } else if (dragState.global) {
        dragGroup.rotation.y += deltaX * 0.006;
      }
    };

    const handlePointerUp = () => {
      if (dragState.activeRing) {
        dragState.activeRing.isDragging = false;
      }
      dragState.activeRing = null;
      dragState.global = false;
    };

    const handleResize = () => {
      const nextAspect = mount.clientWidth / mount.clientHeight;
      camera.aspect = nextAspect;
      camera.position.set(0, 8, nextAspect < 1 ? 90 / nextAspect : 90);
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('resize', handleResize);

    const clock = new THREE.Clock();
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      ringGroups.forEach((ring) => {
        if (!ring.isDragging) {
          const targetVelocity = ring.baseSpeed * ring.direction * delta;
          ring.velocity += (targetVelocity - ring.velocity) * 0.05;
        } else {
          ring.velocity *= 0.9;
        }
        ring.group.rotation.y += ring.velocity;
      });

      parallaxGroup.rotation.y += (targetRotation.y - parallaxGroup.rotation.y) * 0.05;
      parallaxGroup.rotation.x += (targetRotation.x - parallaxGroup.rotation.x) * 0.05;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(allCards);
      const nextHovered = intersects[0]?.object || null;

      if (nextHovered !== dragState.hoveredCard) {
        dragState.hoveredCard = nextHovered;
        if (nextHovered) {
          dimCardsForHover(nextHovered);
          showPreview(nextHovered);
        } else {
          restoreCards();
          hidePreview();
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('resize', handleResize);
      gsap.killTweensOf([preview, cursor, cursorDot, text, ...materials]);
      geometry.dispose();
      materials.forEach((material) => material.dispose());
      textures.forEach((texture) => texture.dispose());
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [dept]);

  return (
    <section
      ref={mountRef}
      className="orbital-shell"
      style={{
        '--dept-color': dept.color,
      }}
    >
      <h1
        ref={textRef}
        className="orbital-bg-label"
        style={{ color: `${dept.color}12` }}
      >
        {dept.label.toUpperCase()}
      </h1>

      <div
        className="orbital-noise"
        aria-hidden="true"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
        }}
      ></div>

      <div ref={previewRef} className="orbital-preview-panel">
        <img
          ref={previewImgRef}
          className="preview-img"
          alt={`${dept.label} preview`}
          onError={(event) => {
            event.currentTarget.src = fallbackPreviewRef.current;
          }}
        />
        <div className="preview-label">
          <span>{dept.label}</span>
          <span
            className="preview-badge"
            style={{
              background: `${dept.color}22`,
              color: dept.color,
            }}
          >
            Geeta University
          </span>
        </div>
      </div>

      <div
        ref={cursorRef}
        className="orbital-cursor"
        style={{ borderColor: dept.color }}
      ></div>
      <div
        ref={cursorDotRef}
        className="orbital-cursor-dot"
        style={{ background: dept.color }}
      ></div>

      <button
        type="button"
        className="orbital-back-btn"
        style={{ '--dept-color': dept.color }}
        onClick={onBack}
      >
        &larr; Change Block
      </button>
    </section>
  );
}
