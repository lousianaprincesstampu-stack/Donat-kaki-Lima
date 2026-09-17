import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CustomerOrder, DonutItem, Station } from '../types';

interface ThreeCanvasProps {
  currentStation: Station;
  activeOrder: CustomerOrder | null;
  fryingDonuts: DonutItem[];
  activeDonut: DonutItem | null;
  toppingParticlesTrigger: { type: string; timestamp: number } | null;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  currentStation,
  activeOrder,
  fryingDonuts,
  activeDonut,
  toppingParticlesTrigger,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameId = useRef<number | null>(null);

  // Group references for stations
  const orderGroupRef = useRef<THREE.Group>(new THREE.Group());
  const doughGroupRef = useRef<THREE.Group>(new THREE.Group());
  const fryGroupRef = useRef<THREE.Group>(new THREE.Group());
  const toppingGroupRef = useRef<THREE.Group>(new THREE.Group());

  // Dynamic mesh references
  const customerMeshRef = useRef<THREE.Group | null>(null);
  const toppingDonutMeshRef = useRef<THREE.Group | null>(null);
  const toppingGlazeMeshRef = useRef<THREE.Mesh | null>(null);
  const oilBubblesRef = useRef<THREE.Points | null>(null);
  const lampLightRef = useRef<THREE.PointLight | null>(null);
  const hangingBulbMeshRef = useRef<THREE.Mesh | null>(null);

  // ----------------------------------------------------
  // Procedural Indonesian Textures
  // ----------------------------------------------------
  const createBannerTexture = (title: string, subtitle: string, badge: string): THREE.CanvasTexture => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Warm yellow canvas background khas spanduk kain kaki lima
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(0, 0, 1024, 256);

    // Green outer border
    ctx.fillStyle = '#15803d';
    ctx.fillRect(0, 0, 1024, 18);
    ctx.fillRect(0, 238, 1024, 18);
    ctx.fillRect(0, 0, 18, 256);
    ctx.fillRect(1006, 0, 18, 256);

    // Red inner border
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 6;
    ctx.strokeRect(26, 26, 972, 204);

    // Indonesian Street Typography
    ctx.textAlign = 'center';

    // Badge / Tagline
    ctx.fillStyle = '#15803d';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(badge, 512, 60);

    // Main Title in Bold Red
    ctx.fillStyle = '#b91c1c';
    ctx.font = '900 68px sans-serif';
    ctx.fillText(title, 512, 134);

    // Subtitle in Blue
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(subtitle, 512, 194);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  };

  // ----------------------------------------------------
  // Initialize Three.js Scene
  // ----------------------------------------------------
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth || 800;
    const height = mountRef.current.clientHeight || 500;

    const scene = new THREE.Scene();
    // Warm Indonesian roadside evening sky
    scene.background = new THREE.Color(0x1a120c);
    scene.fog = new THREE.FogExp2(0x1a120c, 0.032);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0.6, 2.3, 4.4);
    camera.lookAt(0, 1.3, 0.4);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Ambient & Directional Lighting
    const ambientLight = new THREE.AmbientLight(0xfff3e0, 0.85);
    scene.add(ambientLight);

    const streetLight = new THREE.DirectionalLight(0xffe4b5, 1.25);
    streetLight.position.set(4, 7, 5);
    streetLight.castShadow = true;
    streetLight.shadow.mapSize.width = 1024;
    streetLight.shadow.mapSize.height = 1024;
    scene.add(streetLight);

    // Warm hanging light bulb (Lampu bohlam kuning gerobak)
    const bulbLight = new THREE.PointLight(0xffb03b, 2.2, 7.5);
    bulbLight.position.set(0, 2.65, 0.5);
    bulbLight.castShadow = true;
    scene.add(bulbLight);
    lampLightRef.current = bulbLight;

    // Add Station Groups to Scene
    scene.add(orderGroupRef.current);
    scene.add(doughGroupRef.current);
    scene.add(fryGroupRef.current);
    scene.add(toppingGroupRef.current);

    // Build the 3D Environments
    buildOrderScene(orderGroupRef.current);
    buildDoughScene(doughGroupRef.current);
    buildFryScene(fryGroupRef.current);
    buildToppingScene(toppingGroupRef.current);

    // Responsive Resize Handler
    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    if (mountRef.current) {
      resizeObserver.observe(mountRef.current);
    }

    // Animation Loop
    const clock = new THREE.Clock();
    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Soft breeze swaying the cart's hanging bulb
      if (lampLightRef.current) {
        const swayX = Math.sin(time * 1.6) * 0.12;
        const swayZ = 0.5 + Math.cos(time * 1.3) * 0.08;
        lampLightRef.current.position.x = swayX;
        lampLightRef.current.position.z = swayZ;
        if (hangingBulbMeshRef.current) {
          hangingBulbMeshRef.current.position.x = swayX;
          hangingBulbMeshRef.current.position.z = swayZ;
        }
      }

      // Customer natural idle breathing & gesturing
      if (customerMeshRef.current) {
        customerMeshRef.current.position.y = Math.sin(time * 2.2) * 0.03;
        const wavingArm = customerMeshRef.current.getObjectByName('wavingArm');
        if (wavingArm) {
          wavingArm.rotation.z = -0.3 + Math.sin(time * 4) * 0.2;
        }
      }

      // Frying wajan oil bubbling
      if (oilBubblesRef.current) {
        const posAttr = oilBubblesRef.current.geometry.attributes.position;
        const arr = posAttr.array as Float32Array;
        for (let i = 0; i < arr.length; i += 3) {
          arr[i + 1] = 1.07 + Math.sin(time * 6 + i) * 0.03;
        }
        posAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.innerHTML = '';
      }
      renderer.dispose();
    };
  }, []);

  // ----------------------------------------------------
  // Update Station Camera and Scene Visibility
  // ----------------------------------------------------
  useEffect(() => {
    if (!cameraRef.current) return;

    orderGroupRef.current.visible = currentStation === 'order' || currentStation === 'serve';
    doughGroupRef.current.visible = currentStation === 'dough';
    fryGroupRef.current.visible = currentStation === 'fry';
    toppingGroupRef.current.visible = currentStation === 'topping';

    const cam = cameraRef.current;
    if (currentStation === 'order' || currentStation === 'serve') {
      // 3/4 Indonesian street food perspective showing cart, street, and customer
      cam.position.set(0.6, 2.3, 4.4);
      cam.lookAt(0, 1.3, 0.4);
    } else if (currentStation === 'dough') {
      cam.position.set(0, 3.2, 3.2);
      cam.lookAt(0, 1.0, 0);
    } else if (currentStation === 'fry') {
      cam.position.set(0, 3.5, 3.4);
      cam.lookAt(0, 1.2, 0);
    } else if (currentStation === 'topping') {
      // Direct focus on the donut turntable decorator
      cam.position.set(0, 2.7, 2.9);
      cam.lookAt(0, 1.05, 0);
    }
  }, [currentStation]);

  // ----------------------------------------------------
  // Update Indonesian Customer Character Model
  // ----------------------------------------------------
  useEffect(() => {
    if (!orderGroupRef.current) return;

    // Remove existing customer mesh
    if (customerMeshRef.current) {
      orderGroupRef.current.remove(customerMeshRef.current);
      customerMeshRef.current = null;
    }

    if (activeOrder) {
      const newCustomer = createIndonesianCustomerModel(activeOrder);
      // Position standing right at the cart counter, facing slightly angled towards vendor & camera
      newCustomer.position.set(0.2, 0, 1.9);
      newCustomer.rotation.y = Math.PI - 0.2;
      orderGroupRef.current.add(newCustomer);
      customerMeshRef.current = newCustomer;
    }
  }, [activeOrder]);

  // ----------------------------------------------------
  // Update Frying Donuts in Hot Oil
  // ----------------------------------------------------
  useEffect(() => {
    if (!fryGroupRef.current) return;

    const donutsGroup = fryGroupRef.current.getObjectByName('donutsFryingGroup') as THREE.Group;
    if (!donutsGroup) return;

    while (donutsGroup.children.length > 0) {
      donutsGroup.remove(donutsGroup.children[0]);
    }

    const wajanPositions = [
      { x: -0.85, z: -0.4 },
      { x: 0.05, z: -0.4 },
      { x: -0.4, z: 0.4 },
    ];

    fryingDonuts.forEach((donut, idx) => {
      const donutGroup = create3DDonutMesh(donut.shape);
      donutsGroup.add(donutGroup);

      const pos = wajanPositions[idx % wajanPositions.length];

      if (donut.isCooked || donut.isBurnt) {
        // Tiriskan di rak tirisan minyak
        donutGroup.position.set(1.6 + idx * 0.35, 1.32, -0.2 + idx * 0.35);
        donutGroup.rotation.x = Math.PI / 7;
      } else {
        // Mengapung di minyak panas kuali
        donutGroup.position.set(pos.x, 1.12, pos.z);
        donutGroup.rotation.x = donut.currentSide === 'A' ? 0 : Math.PI;
      }

      const currentFry = donut.currentSide === 'A' ? donut.frySideA : donut.frySideB;
      const mesh = donutGroup.getObjectByName('torusMesh') as THREE.Mesh;
      if (mesh && mesh.material) {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (donut.isBurnt) {
          mat.color.setHex(0x24140a); // Gosong hitam pekat
        } else if (currentFry >= 50) {
          mat.color.setHex(0xd97706); // Kuning keemasan matang
        } else {
          const t = currentFry / 50;
          const raw = new THREE.Color(0xfde68a);
          const golden = new THREE.Color(0xd97706);
          mat.color.copy(raw).lerp(golden, t);
        }
      }
    });
  }, [fryingDonuts]);

  // ----------------------------------------------------
  // Update Topping Station Donut & Full 360-degree Glaze
  // ----------------------------------------------------
  useEffect(() => {
    if (!toppingDonutMeshRef.current || !toppingGlazeMeshRef.current) return;

    if (activeDonut) {
      toppingDonutMeshRef.current.visible = true;

      // Update base donut geometry and color
      const torus = toppingDonutMeshRef.current.getObjectByName('torusMesh') as THREE.Mesh;
      if (torus) {
        if (toppingDonutMeshRef.current.userData.shape !== activeDonut.shape) {
          torus.geometry.dispose();
          if (activeDonut.shape === 'bolong') {
            const bGeo = new THREE.SphereGeometry(0.48, 28, 20);
            bGeo.scale(1.0, 0.65, 1.0);
            torus.geometry = bGeo;
          } else if (activeDonut.shape === 'hati') {
            const hGeo = new THREE.TorusGeometry(0.42, 0.22, 20, 36);
            hGeo.scale(1.2, 0.8, 1);
            torus.geometry = hGeo;
          } else {
            torus.geometry = new THREE.TorusGeometry(0.45, 0.22, 20, 36);
          }
          toppingDonutMeshRef.current.userData.shape = activeDonut.shape;
        }

        if (torus.material) {
          const mat = torus.material as THREE.MeshStandardMaterial;
          mat.color.setHex(activeDonut.isBurnt ? 0x24140a : 0xd97706);
        }
      }

      // Glaze update: Full 360-degree coverage properly aligned on top
      const glazeMesh = toppingGlazeMeshRef.current;
      if (activeDonut.glaze === 'none') {
        glazeMesh.visible = false;
      } else {
        glazeMesh.visible = true;

        if (activeDonut.shape === 'bolong') {
          // Round bun: Full smooth dome cap on top of potato bun
          glazeMesh.geometry.dispose();
          glazeMesh.geometry = new THREE.SphereGeometry(0.488, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2.2);
          glazeMesh.rotation.set(0, 0, 0); // Keep upright dome on top of bun
          glazeMesh.position.set(0, 0.02, 0);
          glazeMesh.scale.set(1.01, 0.65, 1.01);
        } else if (activeDonut.shape === 'hati') {
          // Heart: Full loop heart torus
          glazeMesh.geometry.dispose();
          const heartGlazeGeo = new THREE.TorusGeometry(0.425, 0.21, 20, 48, Math.PI * 2);
          heartGlazeGeo.scale(1.2, 0.8, 1);
          glazeMesh.geometry = heartGlazeGeo;
          glazeMesh.rotation.set(Math.PI / 2, 0, 0);
          glazeMesh.position.set(0, 0.035, 0);
          glazeMesh.scale.set(1.015, 1.015, 0.85);
        } else {
          // Ring Klasik: FULL 360-degree loop (Math.PI * 2)
          glazeMesh.geometry.dispose();
          glazeMesh.geometry = new THREE.TorusGeometry(0.452, 0.21, 24, 48, Math.PI * 2);
          glazeMesh.rotation.set(Math.PI / 2, 0, 0);
          glazeMesh.position.set(0, 0.035, 0);
          glazeMesh.scale.set(1.015, 1.015, 0.85);
        }

        const glazeMat = glazeMesh.material as THREE.MeshStandardMaterial;
        if (activeDonut.glaze === 'gula_merah') {
          glazeMat.color.setHex(0x451a03); // Kinca Gula Merah Aren Pekat Khas Gerobak
          glazeMat.roughness = 0.16;
          glazeMat.metalness = 0.08;
        } else if (activeDonut.glaze === 'coklat') {
          glazeMat.color.setHex(0x271309); // Coklat Leleh Pekat Khas Gerobak
          glazeMat.roughness = 0.14;
          glazeMat.metalness = 0.06;
        } else if (activeDonut.glaze === 'mentega') {
          glazeMat.color.setHex(0xfef08a); // Krim Mentega Manis
          glazeMat.roughness = 0.25;
          glazeMat.metalness = 0.02;
        }
      }

      // Re-populate topping particles (seres pelangi, kacang sangrai, gula aren)
      updateToppingParticles(toppingDonutMeshRef.current, activeDonut);
    } else {
      toppingDonutMeshRef.current.visible = false;
    }
  }, [activeDonut]);

  // Particle burst when user taps topping buttons
  useEffect(() => {
    if (!toppingParticlesTrigger || !toppingDonutMeshRef.current) return;
    spawnSprinkleBurst(toppingDonutMeshRef.current, toppingParticlesTrigger.type);
  }, [toppingParticlesTrigger]);

  // ----------------------------------------------------
  // Scene Builder: Authentic Indonesian Street Cart & Road
  // ----------------------------------------------------
  const buildOrderScene = (group: THREE.Group) => {
    // 1. Asphalt Road with painted road lines
    const roadGeo = new THREE.PlaneGeometry(18, 18);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x22262d, roughness: 0.95 });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.y = 0;
    road.receiveShadow = true;
    group.add(road);

    // White dashed road markings (Marka Jalan Putih)
    for (let i = -6; i <= 6; i += 3) {
      const lineGeo = new THREE.PlaneGeometry(0.18, 1.4);
      const lineMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.8 });
      const roadLine = new THREE.Mesh(lineGeo, lineMat);
      roadLine.rotation.x = -Math.PI / 2;
      roadLine.position.set(2.8, 0.005, i);
      group.add(roadLine);
    }

    // 2. Sidewalk with Black & White Curb Stones (Trotoar Belang Hitam Putih Khas Kota Indonesia)
    const curbGeo = new THREE.BoxGeometry(18, 0.2, 3.2);
    const curbMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.85 });
    const curb = new THREE.Mesh(curbGeo, curbMat);
    curb.position.set(0, 0.1, 0.2);
    curb.receiveShadow = true;
    group.add(curb);

    // Black & White curb edge stones
    for (let x = -8; x <= 8; x += 0.8) {
      const isWhite = Math.abs(Math.round(x / 0.8)) % 2 === 0;
      const stoneGeo = new THREE.BoxGeometry(0.78, 0.22, 0.2);
      const stoneMat = new THREE.MeshStandardMaterial({
        color: isWhite ? 0xf8fafc : 0x1e293b,
        roughness: 0.8,
      });
      const stone = new THREE.Mesh(stoneGeo, stoneMat);
      stone.position.set(x, 0.11, 1.75);
      group.add(stone);
    }

    // 3. Gerobak Kayu Tradisional (Traditional Indonesian Food Cart Body)
    const cartBodyGeo = new THREE.BoxGeometry(2.7, 1.15, 1.45);
    const cartWoodMat = new THREE.MeshStandardMaterial({ color: 0x5c2b0e, roughness: 0.75 });
    const cartBody = new THREE.Mesh(cartBodyGeo, cartWoodMat);
    cartBody.position.set(0, 0.78, -0.3);
    cartBody.castShadow = true;
    cartBody.receiveShadow = true;
    group.add(cartBody);

    // Front Kain Spanduk Banner on Cart Counter
    const frontBannerGeo = new THREE.PlaneGeometry(2.4, 0.65);
    const frontBannerMat = new THREE.MeshStandardMaterial({
      map: createBannerTexture('DONAT KAMPUNG GEROBAK', 'Gula Merah Aren • Seres • Coklat Kacang', '★ ASLI KENTANG GURIH ★'),
      roughness: 0.6,
    });
    const frontBanner = new THREE.Mesh(frontBannerGeo, frontBannerMat);
    frontBanner.position.set(0, 0.8, 0.44);
    group.add(frontBanner);

    // Gerobak Wheels (Roda gerobak ban karet & velg jari)
    const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.09, 24);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });

    const leftWheel = new THREE.Mesh(wheelGeo, wheelMat);
    leftWheel.rotation.z = Math.PI / 2;
    leftWheel.position.set(-1.25, 0.38, 0.35);
    group.add(leftWheel);

    const leftRim = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.1, 16), rimMat);
    leftRim.rotation.z = Math.PI / 2;
    leftRim.position.set(-1.25, 0.38, 0.35);
    group.add(leftRim);

    const rightWheel = leftWheel.clone();
    rightWheel.position.set(1.25, 0.38, 0.35);
    group.add(rightWheel);

    const rightRim = leftRim.clone();
    rightRim.position.set(1.25, 0.38, 0.35);
    group.add(rightRim);

    // 4. Etalase Kaca Donat (Glass Display Case)
    const glassCaseGeo = new THREE.BoxGeometry(2.4, 0.72, 1.1);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      transmission: 0.85,
      thickness: 0.4,
    });
    const glassCase = new THREE.Mesh(glassCaseGeo, glassMat);
    glassCase.position.set(0, 1.72, -0.3);
    group.add(glassCase);

    // Sample Donuts inside Glass Case
    const sampleDonutGula = createMiniDonut(0x451a03, -0.65);
    const sampleDonutSeres = createMiniDonut(0xf43f5e, 0);
    const sampleDonutCoklat = createMiniDonut(0x271309, 0.65);
    glassCase.add(sampleDonutGula);
    glassCase.add(sampleDonutSeres);
    glassCase.add(sampleDonutCoklat);

    // 5. Wooden Roof Pillars
    const pillarGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.6, 8);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x3d1a04 });
    const p1 = new THREE.Mesh(pillarGeo, pillarMat);
    p1.position.set(-1.22, 2.15, 0.35);
    group.add(p1);
    const p2 = p1.clone();
    p2.position.set(1.22, 2.15, 0.35);
    group.add(p2);
    const p3 = p1.clone();
    p3.position.set(-1.22, 2.15, -0.95);
    group.add(p3);
    const p4 = p1.clone();
    p4.position.set(1.22, 2.15, -0.95);
    group.add(p4);

    // 6. Canopy & Upper Spanduk Kain Pecel Lele/Kaki Lima
    const canopyGeo = new THREE.BoxGeometry(2.9, 0.12, 1.85);
    const canopyMat = new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.7 });
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.set(0, 2.95, -0.3);
    canopy.castShadow = true;
    group.add(canopy);

    // Upper Banner Fabric
    const topBannerGeo = new THREE.PlaneGeometry(2.7, 0.55);
    const topBannerMat = new THREE.MeshStandardMaterial({
      map: createBannerTexture('DONAT KAMPUNG', 'Ketan & Kentang Goreng Hangat', 'SEDAP & EMPUK MENUL-MENUL'),
      roughness: 0.6,
    });
    const topBanner = new THREE.Mesh(topBannerGeo, topBannerMat);
    topBanner.position.set(0, 2.7, 0.64);
    group.add(topBanner);

    // 7. Hanging Yellow Light Bulb (Bohlam Gantung Khas Pinggir Jalan)
    const bulbCordGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.45, 6);
    const bulbCordMat = new THREE.MeshBasicMaterial({ color: 0x18181b });
    const bulbCord = new THREE.Mesh(bulbCordGeo, bulbCordMat);
    bulbCord.position.set(0, 2.85, 0.5);
    group.add(bulbCord);

    const bulbGeo = new THREE.SphereGeometry(0.1, 12, 12);
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffe27a });
    const bulbMesh = new THREE.Mesh(bulbGeo, bulbMat);
    bulbMesh.position.set(0, 2.65, 0.5);
    group.add(bulbMesh);
    hangingBulbMeshRef.current = bulbMesh;

    // 8. Kaleng Kerupuk Blek Biru Khas Warung Indonesia (Ikonik!)
    const kalengBlek = createKalengKerupukBlek();
    kalengBlek.position.set(-0.95, 1.38, 0.15);
    group.add(kalengBlek);

    // 9. Motor Bebek / Matic Parkir di Samping Trotoar (Motor Ojol / Warga)
    const motorBebek = createMotorBebek();
    motorBebek.position.set(-2.5, 0.1, 0.4);
    motorBebek.rotation.y = -Math.PI / 5;
    group.add(motorBebek);

    // 10. Tiang Listrik Beton & Kabel Semrawut Khas Jalanan Indonesia
    const tiangListrik = createTiangListrik();
    tiangListrik.position.set(3.2, 0.1, -1.2);
    group.add(tiangListrik);

    // 11. Krat Botol Minuman Teh Botol Kaca Khas Kaki Lima
    const crate = createBeverageCrate();
    crate.position.set(1.9, 0.1, 0.2);
    group.add(crate);

    // 12. Pot Tanaman Kaleng Cat Bekas di Trotoar
    const potPlant = createTinPotPlant();
    potPlant.position.set(2.4, 0.1, 0.8);
    group.add(potPlant);
  };

  // Helper: Mini donut inside display case
  const createMiniDonut = (colorHex: number, xOffset: number) => {
    const geo = new THREE.TorusGeometry(0.12, 0.05, 10, 20);
    const mat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.35 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = Math.PI / 2;
    mesh.position.set(xOffset, -0.18, 0);
    return mesh;
  };

  // Helper: Kaleng Kerupuk Blek Biru Khas Warung
  const createKalengKerupukBlek = (): THREE.Group => {
    const group = new THREE.Group();
    // Blue tin box body
    const bodyGeo = new THREE.BoxGeometry(0.36, 0.42, 0.36);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.3, roughness: 0.4 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.21;
    group.add(body);

    // Front glass round window
    const glassGeo = new THREE.CircleGeometry(0.11, 16);
    const glassMat = new THREE.MeshStandardMaterial({ color: 0xe0f2fe, roughness: 0.1, transparent: true, opacity: 0.8 });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.set(0, 0.21, 0.181);
    group.add(glass);

    // Kerupuk inside
    const kGeo = new THREE.TorusGeometry(0.06, 0.02, 6, 12);
    const kMat = new THREE.MeshStandardMaterial({ color: 0xfef9c3, roughness: 0.8 });
    const k1 = new THREE.Mesh(kGeo, kMat);
    k1.position.set(0, 0.21, 0.16);
    group.add(k1);

    // Red round lid with handle
    const lidGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.04, 16);
    const lidMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 });
    const lid = new THREE.Mesh(lidGeo, lidMat);
    lid.position.y = 0.44;
    group.add(lid);

    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), lidMat);
    knob.position.y = 0.47;
    group.add(knob);

    return group;
  };

  // Helper: Motor Bebek / Matic Parkir di Trotoar
  const createMotorBebek = (): THREE.Group => {
    const motor = new THREE.Group();

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.08, 20);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.85 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xcfd4dc, metalness: 0.8 });

    const frontWheel = new THREE.Mesh(wheelGeo, wheelMat);
    frontWheel.rotation.z = Math.PI / 2;
    frontWheel.position.set(0, 0.28, 0.75);
    motor.add(frontWheel);

    const frontRim = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.09, 14), rimMat);
    frontRim.rotation.z = Math.PI / 2;
    frontRim.position.set(0, 0.28, 0.75);
    motor.add(frontRim);

    const backWheel = frontWheel.clone();
    backWheel.position.set(0, 0.28, -0.65);
    motor.add(backWheel);

    const backRim = frontRim.clone();
    backRim.position.set(0, 0.28, -0.65);
    motor.add(backRim);

    // Motor Body (Hijau Ojol / Street Motor)
    const bodyGeo = new THREE.BoxGeometry(0.3, 0.36, 1.15);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.35 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.set(0, 0.52, 0.05);
    motor.add(body);

    // Front Fairing
    const fairingGeo = new THREE.CylinderGeometry(0.16, 0.12, 0.4, 8);
    const fairing = new THREE.Mesh(fairingGeo, bodyMat);
    fairing.position.set(0, 0.7, 0.55);
    motor.add(fairing);

    // Black Padded Seat (Jok Motor)
    const seatGeo = new THREE.BoxGeometry(0.26, 0.1, 0.7);
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9 });
    const seat = new THREE.Mesh(seatGeo, seatMat);
    seat.position.set(0, 0.74, -0.15);
    motor.add(seat);

    // Handlebars (Stang)
    const barGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.55, 8);
    const barMat = new THREE.MeshStandardMaterial({ color: 0x374151, metalness: 0.7 });
    const bar = new THREE.Mesh(barGeo, barMat);
    bar.rotation.z = Math.PI / 2;
    bar.position.set(0, 0.94, 0.55);
    motor.add(bar);

    // Dual Rearview Mirrors (Spion Kiri Kanan)
    const mirrorGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.01, 8);
    const mirrorMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
    const mLeft = new THREE.Mesh(mirrorGeo, mirrorMat);
    mLeft.position.set(-0.25, 1.05, 0.53);
    motor.add(mLeft);

    const mRight = mLeft.clone();
    mRight.position.set(0.25, 1.05, 0.53);
    motor.add(mRight);

    // Headlight (Lampu Utama)
    const lightGeo = new THREE.SphereGeometry(0.07, 10, 10);
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const light = new THREE.Mesh(lightGeo, lightMat);
    light.position.set(0, 0.85, 0.68);
    motor.add(light);

    // Exhaust Pipe (Knalpot Perak)
    const pipeGeo = new THREE.CylinderGeometry(0.035, 0.045, 0.65, 8);
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85 });
    const pipe = new THREE.Mesh(pipeGeo, pipeMat);
    pipe.rotation.x = Math.PI / 2.2;
    pipe.position.set(0.18, 0.28, -0.35);
    motor.add(pipe);

    // Plat Nomor Indonesia Depan & Belakang ("B 3456 DNT")
    const platGeo = new THREE.BoxGeometry(0.18, 0.08, 0.01);
    const platMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
    const plat = new THREE.Mesh(platGeo, platMat);
    plat.position.set(0, 0.45, 0.75);
    motor.add(plat);

    return motor;
  };

  // Helper: Tiang Listrik Beton & Kabel Semrawut
  const createTiangListrik = (): THREE.Group => {
    const tiang = new THREE.Group();

    // Concrete Pole
    const poleGeo = new THREE.CylinderGeometry(0.14, 0.18, 5.5, 12);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.set(0, 2.75, 0);
    tiang.add(pole);

    // Cross beam
    const crossGeo = new THREE.BoxGeometry(1.6, 0.1, 0.1);
    const cross = new THREE.Mesh(crossGeo, poleMat);
    cross.position.set(0, 4.8, 0);
    tiang.add(cross);

    // Dangling Power Lines (Kabel Semrawut)
    const wireMat = new THREE.LineBasicMaterial({ color: 0x0f172a, linewidth: 2 });
    const curve1 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.7, 4.8, 0),
      new THREE.Vector3(-0.2, 4.3, 1.2),
      new THREE.Vector3(1.5, 4.9, 3.0),
    ]);
    const wire1 = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve1.getPoints(20)), wireMat);
    tiang.add(wire1);

    const curve2 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.7, 4.8, 0),
      new THREE.Vector3(0.1, 4.1, 1.5),
      new THREE.Vector3(-3.0, 4.6, 2.5),
    ]);
    const wire2 = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve2.getPoints(20)), wireMat);
    tiang.add(wire2);

    // Stiker "SEDOT WC / TAMBAL BAN"
    const stickerGeo = new THREE.PlaneGeometry(0.24, 0.35);
    const stickerMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.9 });
    const sticker = new THREE.Mesh(stickerGeo, stickerMat);
    sticker.position.set(0, 1.6, 0.17);
    tiang.add(sticker);

    return tiang;
  };

  // Helper: Krat Botol Minuman Kaca
  const createBeverageCrate = (): THREE.Group => {
    const group = new THREE.Group();
    // Red crate
    const boxGeo = new THREE.BoxGeometry(0.48, 0.3, 0.36);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.6 });
    const crate = new THREE.Mesh(boxGeo, boxMat);
    crate.position.y = 0.15;
    group.add(crate);

    // Glass bottles inside
    const bottleGeo = new THREE.CylinderGeometry(0.03, 0.035, 0.22, 8);
    const bottleMat = new THREE.MeshStandardMaterial({ color: 0x78350f, transparent: true, opacity: 0.85 });
    for (let x = -0.16; x <= 0.16; x += 0.08) {
      for (let z = -0.1; z <= 0.1; z += 0.1) {
        const bottle = new THREE.Mesh(bottleGeo, bottleMat);
        bottle.position.set(x, 0.26, z);
        group.add(bottle);
      }
    }
    return group;
  };

  // Helper: Pot Tanaman Kaleng Cat Bekas di Trotoar
  const createTinPotPlant = (): THREE.Group => {
    const group = new THREE.Group();
    // White paint can pot
    const canGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.35, 12);
    const canMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.6 });
    const can = new THREE.Mesh(canGeo, canMat);
    can.position.y = 0.175;
    group.add(can);

    // Tropical green leaves (Daun Palem/Pisang)
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.7 });
    for (let i = 0; i < 5; i++) {
      const leafGeo = new THREE.CylinderGeometry(0.02, 0.08, 0.5, 6);
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.set(0, 0.35, 0);
      leaf.rotation.x = Math.sin((i * Math.PI) / 2.5) * 0.45;
      leaf.rotation.z = Math.cos((i * Math.PI) / 2.5) * 0.45;
      group.add(leaf);
    }
    return group;
  };

  // ----------------------------------------------------
  // Indonesian Characters Builder (Model Karakter Asli Indonesia Sangat Detail)
  // ----------------------------------------------------
  const createIndonesianCustomerModel = (order: CustomerOrder): THREE.Group => {
    const group = new THREE.Group();
    const role = order.customerRole;
    const isChild = role.includes('SD');

    if (isChild) {
      group.scale.set(0.74, 0.74, 0.74);
    }

    // Authentic Indonesian Skin Tone (Sawo Matang Alami Khas Nusantara)
    const skinTone = isChild ? 0xe2a77a : 0xd2976b;
    const skinMat = new THREE.MeshStandardMaterial({ color: skinTone, roughness: 0.6 });

    // 1. Neck & Head Base
    const neckGeo = new THREE.CylinderGeometry(0.09, 0.11, 0.14, 16);
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.y = 1.34;
    group.add(neck);

    const headGeo = new THREE.SphereGeometry(0.23, 20, 20);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 1.5;
    head.castShadow = true;
    group.add(head);

    // Natural Ears
    const earGeo = new THREE.SphereGeometry(0.045, 8, 8);
    earGeo.scale(0.5, 1.0, 0.7);
    const leftEar = new THREE.Mesh(earGeo, skinMat);
    leftEar.position.set(-0.23, 1.5, 0);
    group.add(leftEar);
    const rightEar = leftEar.clone();
    rightEar.position.set(0.23, 1.5, 0);
    group.add(rightEar);

    // Friendly Animated Eyes (Eye White + Dark Pupil + Specular Highlight)
    const createEye = (xPos: number) => {
      const eyeGroup = new THREE.Group();
      const white = new THREE.Mesh(
        new THREE.SphereGeometry(0.042, 10, 10),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      eyeGroup.add(white);

      const pupil = new THREE.Mesh(
        new THREE.SphereGeometry(0.024, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x18181b })
      );
      pupil.position.z = 0.028;
      eyeGroup.add(pupil);

      const highlight = new THREE.Mesh(
        new THREE.SphereGeometry(0.009, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      highlight.position.set(0.01, 0.012, 0.038);
      eyeGroup.add(highlight);

      eyeGroup.position.set(xPos, 1.52, 0.195);
      return eyeGroup;
    };

    group.add(createEye(-0.08));
    group.add(createEye(0.08));

    // Expressive Eyebrows
    const browGeo = new THREE.BoxGeometry(0.06, 0.014, 0.02);
    const browMat = new THREE.MeshBasicMaterial({ color: 0x27272a });
    const leftBrow = new THREE.Mesh(browGeo, browMat);
    leftBrow.position.set(-0.08, 1.58, 0.21);
    leftBrow.rotation.z = 0.1;
    group.add(leftBrow);

    const rightBrow = new THREE.Mesh(browGeo, browMat);
    rightBrow.position.set(0.08, 1.58, 0.21);
    rightBrow.rotation.z = -0.1;
    group.add(rightBrow);

    // Stylized Cute Indonesian Nose
    const noseGeo = new THREE.SphereGeometry(0.026, 8, 8);
    const nose = new THREE.Mesh(noseGeo, skinMat);
    nose.position.set(0, 1.48, 0.235);
    group.add(nose);

    // Warm Friendly Smile
    const smileGeo = new THREE.TorusGeometry(0.055, 0.014, 8, 16, Math.PI);
    const smileMat = new THREE.MeshBasicMaterial({ color: 0x991b1b });
    const smile = new THREE.Mesh(smileGeo, smileMat);
    smile.rotation.x = Math.PI;
    smile.position.set(0, 1.42, 0.215);
    group.add(smile);

    // 2. Persona Specific Outfits, Legs & Props
    if (role.includes('Ojol')) {
      // ===== BANG BUDI (DRIVER OJOL HIJAU RESMI) =====
      // Green Ojol Helmet with glossy black tinted visor & reflective safety stripe
      const helmetGeo = new THREE.SphereGeometry(0.28, 20, 18);
      const helmetMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.25, metalness: 0.1 });
      const helmet = new THREE.Mesh(helmetGeo, helmetMat);
      helmet.position.set(0, 1.57, -0.01);
      group.add(helmet);

      const visorGeo = new THREE.CylinderGeometry(0.265, 0.265, 0.12, 16, 1, false, -Math.PI / 3, (Math.PI * 2) / 3);
      const visorMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.1, metalness: 0.9 });
      const visor = new THREE.Mesh(visorGeo, visorMat);
      visor.rotation.y = Math.PI / 2;
      visor.position.set(0, 1.55, 0.05);
      group.add(visor);

      const whiteStripe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.284, 0.284, 0.035, 18),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      whiteStripe.position.set(0, 1.63, -0.01);
      group.add(whiteStripe);

      // Green Windbreaker Ojol Jacket
      const jacketGeo = new THREE.CylinderGeometry(0.29, 0.33, 0.65, 16);
      const jacketMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.45 });
      const jacket = new THREE.Mesh(jacketGeo, jacketMat);
      jacket.position.y = 0.98;
      group.add(jacket);

      // Black Chest Stripe & Silver Reflector Line
      const chestBand = new THREE.Mesh(
        new THREE.CylinderGeometry(0.305, 0.305, 0.12, 16),
        new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.6 })
      );
      chestBand.position.set(0, 1.05, 0);
      group.add(chestBand);

      const reflLine = new THREE.Mesh(
        new THREE.CylinderGeometry(0.31, 0.31, 0.02, 16),
        new THREE.MeshBasicMaterial({ color: 0xe2e8f0 })
      );
      reflLine.position.set(0, 1.08, 0);
      group.add(reflLine);

      // Legs & Dark Jeans
      const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
      const legLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.62, 12), pantsMat);
      legLeft.position.set(-0.14, 0.36, 0);
      group.add(legLeft);

      const legRight = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.62, 12), pantsMat);
      legRight.position.set(0.14, 0.36, 0);
      group.add(legRight);

      // Black Sneakers with White Soles
      const shoeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
      const soleMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const createShoe = (x: number) => {
        const sGroup = new THREE.Group();
        const upper = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.08, 0.22), shoeMat);
        upper.position.set(0, 0.04, 0.03);
        sGroup.add(upper);
        const sole = new THREE.Mesh(new THREE.BoxGeometry(0.135, 0.025, 0.23), soleMat);
        sole.position.set(0, 0.01, 0.03);
        sGroup.add(sole);
        sGroup.position.set(x, 0, 0);
        return sGroup;
      };
      group.add(createShoe(-0.14));
      group.add(createShoe(0.14));

      // Smartphone held in right hand (HP Orderan Mas Ojol)
      const phoneGroup = new THREE.Group();
      const phoneBody = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.16, 0.015), new THREE.MeshStandardMaterial({ color: 0x09090b }));
      phoneGroup.add(phoneBody);
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.14), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
      screen.position.z = 0.009;
      phoneGroup.add(screen);
      phoneGroup.position.set(0.44, 1.05, 0.25);
      phoneGroup.rotation.set(-0.2, -0.4, 0.1);
      group.add(phoneGroup);
    } else if (role.includes('SD')) {
      // ===== ADIT (BOCIL SD MERAH PUTIH) =====
      // Red-and-White Topi Pet SD
      const hatGeo = new THREE.SphereGeometry(0.245, 18, 14, 0, Math.PI * 2, 0, Math.PI / 2);
      const hatMat = new THREE.MeshStandardMaterial({ color: 0xdc2626 });
      const hat = new THREE.Mesh(hatGeo, hatMat);
      hat.position.set(0, 1.58, 0);
      group.add(hat);

      // Red Brim
      const brim = new THREE.Mesh(
        new THREE.CylinderGeometry(0.26, 0.26, 0.02, 14, 1, false, -Math.PI / 3, (Math.PI * 2) / 3),
        hatMat
      );
      brim.position.set(0, 1.58, 0.07);
      group.add(brim);

      // Rosy Cheeks (Blush Bocil)
      const blushMat = new THREE.MeshBasicMaterial({ color: 0xf87171 });
      const blushLeft = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 8), blushMat);
      blushLeft.position.set(-0.13, 1.47, 0.18);
      group.add(blushLeft);
      const blushRight = blushLeft.clone();
      blushRight.position.set(0.13, 1.47, 0.18);
      group.add(blushRight);

      // White School Uniform Shirt (Kemeja Putih Seragam SD)
      const shirtGeo = new THREE.CylinderGeometry(0.25, 0.28, 0.58, 16);
      const shirtMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.55 });
      const shirt = new THREE.Mesh(shirtGeo, shirtMat);
      shirt.position.y = 0.98;
      group.add(shirt);

      // Dasi Merah SD & Saku Badge
      const tie = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.22, 0.02), hatMat);
      tie.position.set(0, 1.08, 0.265);
      group.add(tie);

      const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.06, 0.01), hatMat);
      pocket.position.set(-0.11, 1.04, 0.26);
      group.add(pocket);

      // Blue School Backpack (Tas Ransel Sekolah Adit)
      const bag = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.42, 0.18), new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.6 }));
      bag.position.set(0, 0.95, -0.22);
      group.add(bag);

      // Red SD Shorts (Celana Pendek Merah)
      const shortsMat = new THREE.MeshStandardMaterial({ color: 0xbe123c, roughness: 0.6 });
      const shortLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.28, 12), shortsMat);
      shortLeft.position.set(-0.11, 0.58, 0);
      group.add(shortLeft);
      const shortRight = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.28, 12), shortsMat);
      shortRight.position.set(0.11, 0.58, 0);
      group.add(shortRight);

      // Bare Legs with White Socks & Black School Shoes
      const bareLegGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.32, 10);
      const legL = new THREE.Mesh(bareLegGeo, skinMat);
      legL.position.set(-0.11, 0.32, 0);
      group.add(legL);
      const legR = new THREE.Mesh(bareLegGeo, skinMat);
      legR.position.set(0.11, 0.32, 0);
      group.add(legR);

      // Black Warrior School Shoes
      const shoeMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5 });
      const shoeL = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.07, 0.18), shoeMat);
      shoeL.position.set(-0.11, 0.035, 0.03);
      group.add(shoeL);
      const shoeR = shoeL.clone();
      shoeR.position.set(0.11, 0.035, 0.03);
      group.add(shoeR);

      // Adit holding Rupiah Pocket Money (Uang Jajan Bocil)
      const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.008, 12), new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.8 }));
      coin.rotation.x = Math.PI / 3;
      coin.position.set(0.42, 0.98, 0.25);
      group.add(coin);
    } else if (role.includes('Daster')) {
      // ===== BU TEJO (EMAK-EMAK GAUL DASTERAN) =====
      // Hair Sanggul Cepol with Iconic Jedai Clip (Jepit Jedai Pink)
      const hairGeo = new THREE.SphereGeometry(0.245, 18, 16);
      const hairMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.85 });
      const hair = new THREE.Mesh(hairGeo, hairMat);
      hair.position.set(0, 1.53, -0.04);
      group.add(hair);

      const bun = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 12), hairMat);
      bun.position.set(0, 1.69, -0.12);
      group.add(bun);

      const jedai = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.06, 0.08), new THREE.MeshStandardMaterial({ color: 0xf43f5e }));
      jedai.position.set(0, 1.77, -0.12);
      group.add(jedai);

      // Sparkling Gold Hoop Earrings
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.9, roughness: 0.15 });
      const leftEarring = new THREE.Mesh(new THREE.TorusGeometry(0.038, 0.008, 6, 14), goldMat);
      leftEarring.position.set(-0.24, 1.48, 0);
      group.add(leftEarring);
      const rightEarring = leftEarring.clone();
      rightEarring.position.set(0.24, 1.48, 0);
      group.add(rightEarring);

      // Flared Indonesian Daster Batik (Batik Kencana Ungu / Kuning Oranye)
      const dasterGeo = new THREE.CylinderGeometry(0.28, 0.46, 1.05, 18);
      const dasterMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.65 });
      const daster = new THREE.Mesh(dasterGeo, dasterMat);
      daster.position.y = 0.78;
      group.add(daster);

      // Batik Flower Accents on Daster
      const flowerMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const fl = new THREE.Mesh(new THREE.CircleGeometry(0.035, 6), flowerMat);
        fl.position.set(Math.cos(angle) * 0.38, 0.65 + (i % 3) * 0.12, Math.sin(angle) * 0.38);
        fl.rotation.y = -angle + Math.PI / 2;
        group.add(fl);
      }

      // Indonesian Market Dompet (Dompet Resleting Batik Emak-Emak)
      const purse = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.05), new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.5 }));
      purse.position.set(-0.46, 0.88, 0.16);
      group.add(purse);

      // Slip-on Sandals
      const sandalMat = new THREE.MeshStandardMaterial({ color: 0x059669 });
      const sandalL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.22), sandalMat);
      sandalL.position.set(-0.15, 0.02, 0.02);
      group.add(sandalL);
      const sandalR = sandalL.clone();
      sandalR.position.set(0.15, 0.02, 0.02);
      group.add(sandalR);
    } else if (role.includes('RT')) {
      // ===== PAK RT JOKO (KETUA RT TELADAN BERPECI) =====
      // Songkok / Peci Hitam Beludru Khas Bapak-Bapak RT
      const peciGeo = new THREE.CylinderGeometry(0.25, 0.26, 0.24, 18);
      const peciMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.95 });
      const peci = new THREE.Mesh(peciGeo, peciMat);
      peci.position.set(0, 1.68, 0);
      peci.scale.set(0.92, 1.0, 1.15);
      group.add(peci);

      // Golden Embroidery on Songkok Rim
      const goldRim = new THREE.Mesh(new THREE.TorusGeometry(0.255, 0.008, 6, 18), new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.8 }));
      goldRim.rotation.x = Math.PI / 2;
      goldRim.position.set(0, 1.58, 0);
      group.add(goldRim);

      // Kumis Rapi Khas Bapak-Bapak Ramah
      const kumis = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.025, 0.02), new THREE.MeshBasicMaterial({ color: 0x18181b }));
      kumis.position.set(0, 1.45, 0.23);
      group.add(kumis);

      // Baju Koko Bordir Putih Bersih
      const kokoMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 });
      const koko = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.34, 0.72, 16), kokoMat);
      koko.position.y = 0.98;
      group.add(koko);

      // Bordir Koko Tengah
      const bordir = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.46, 0.02), new THREE.MeshStandardMaterial({ color: 0xd1d5db }));
      bordir.position.set(0, 1.05, 0.32);
      group.add(bordir);

      // Sarung Tenun Kotak-Kotak Hijau Khas Nusantara
      const sarungGeo = new THREE.CylinderGeometry(0.34, 0.38, 0.75, 18);
      const sarungMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.8 });
      const sarung = new THREE.Mesh(sarungGeo, sarungMat);
      sarung.position.y = 0.38;
      group.add(sarung);

      // Bapak-Bapak Leather Slop Sandals
      const leatherMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.6 });
      const slopL = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.05, 0.24), leatherMat);
      slopL.position.set(-0.15, 0.025, 0.03);
      group.add(slopL);
      const slopR = slopL.clone();
      slopR.position.set(0.15, 0.025, 0.03);
      group.add(slopR);
    } else {
      // ===== MBAK SITI (KARYAWATI MODIS BERHIJAB) =====
      // Pashmina Hijab Lavender Modis
      const hijabMat = new THREE.MeshStandardMaterial({ color: 0x9333ea, roughness: 0.55 });
      const hijab = new THREE.Mesh(new THREE.SphereGeometry(0.27, 18, 16), hijabMat);
      hijab.position.set(0, 1.52, -0.02);
      group.add(hijab);

      const drape = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.34, 0.42, 16), hijabMat);
      drape.position.set(0, 1.26, 0.02);
      group.add(drape);

      // Modest Office Blouse
      const blouse = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.32, 0.65, 16), new THREE.MeshStandardMaterial({ color: 0xc084fc, roughness: 0.6 }));
      blouse.position.y = 0.96;
      group.add(blouse);

      // Blue Corporate ID Badge & Lanyard
      const lanyard = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.012, 6, 16, Math.PI), new THREE.MeshBasicMaterial({ color: 0x2563eb }));
      lanyard.position.set(0, 1.16, 0.22);
      group.add(lanyard);

      const badge = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.01), new THREE.MeshStandardMaterial({ color: 0xffffff }));
      badge.position.set(0, 0.98, 0.3);
      group.add(badge);

      // Tailored Pants & Heels/Flats
      const pantsMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
      const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.075, 0.62, 12), pantsMat);
      legL.position.set(-0.13, 0.36, 0);
      group.add(legL);
      const legR = legL.clone();
      legR.position.set(0.13, 0.36, 0);
      group.add(legR);

      const flatShoeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
      const flatL = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.06, 0.2), flatShoeMat);
      flatL.position.set(-0.13, 0.03, 0.02);
      group.add(flatL);
      const flatR = flatL.clone();
      flatR.position.set(0.13, 0.03, 0.02);
      group.add(flatR);
    }

    // 3. Articulated Arms & Hands
    const armMat = skinMat;
    const armRadius = isChild ? 0.055 : 0.065;

    // Right Arm (Waving friendly greeting)
    const rightArmGroup = new THREE.Group();
    rightArmGroup.name = 'wavingArm';
    const rUpper = new THREE.Mesh(new THREE.CylinderGeometry(armRadius, armRadius, 0.32, 10), armMat);
    rUpper.position.y = -0.16;
    rightArmGroup.add(rUpper);

    const rHand = new THREE.Mesh(new THREE.SphereGeometry(armRadius * 1.15, 8, 8), armMat);
    rHand.position.y = -0.34;
    rightArmGroup.add(rHand);

    rightArmGroup.position.set(0.38, 1.25, 0);
    rightArmGroup.rotation.z = -0.35;
    group.add(rightArmGroup);

    // Left Arm (Relaxed at side)
    const leftArmGroup = new THREE.Group();
    const lUpper = new THREE.Mesh(new THREE.CylinderGeometry(armRadius, armRadius, 0.34, 10), armMat);
    lUpper.position.y = -0.17;
    leftArmGroup.add(lUpper);

    const lHand = new THREE.Mesh(new THREE.SphereGeometry(armRadius * 1.15, 8, 8), armMat);
    lHand.position.y = -0.36;
    leftArmGroup.add(lHand);

    leftArmGroup.position.set(-0.38, 1.25, 0);
    leftArmGroup.rotation.z = 0.15;
    group.add(leftArmGroup);

    return group;
  };

  // ----------------------------------------------------
  // Scene Builder: Dough Station (Stasiun Cetak Adonan)
  // ----------------------------------------------------
  const buildDoughScene = (group: THREE.Group) => {
    // Stainless Steel Table
    const tableGeo = new THREE.BoxGeometry(3.5, 0.9, 2.2);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 0.4 });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.set(0, 0.45, 0);
    table.receiveShadow = true;
    group.add(table);

    // Wooden cutting board / dusting surface
    const boardGeo = new THREE.BoxGeometry(2.4, 0.06, 1.5);
    const boardMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7 });
    const board = new THREE.Mesh(boardGeo, boardMat);
    board.position.set(0, 0.93, 0);
    board.receiveShadow = true;
    group.add(board);

    // Large flattened rolled potato dough sheet (Adonan Kentang Kalis)
    const doughGeo = new THREE.BoxGeometry(1.8, 0.08, 1.1);
    const doughMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.8 });
    const doughSheet = new THREE.Mesh(doughGeo, doughMat);
    doughSheet.position.set(0, 0.98, 0);
    group.add(doughSheet);

    // Wooden Rolling Pin (Kayu Penggilas Adonan)
    const pinGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.4, 16);
    const pinMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 });
    const pin = new THREE.Mesh(pinGeo, pinMat);
    pin.rotation.z = Math.PI / 2;
    pin.position.set(0, 1.06, -0.65);
    group.add(pin);

    // Indonesian Flour sack / Karung Tepung Terigu Segitiga
    const sackGeo = new THREE.CylinderGeometry(0.35, 0.4, 0.7, 12);
    const sackMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.9 });
    const sack = new THREE.Mesh(sackGeo, sackMat);
    sack.position.set(-1.3, 0.35, 0.4);
    group.add(sack);
  };

  // ----------------------------------------------------
  // Scene Builder: Fry Station (Kuali Wajan Penggorengan Cekung Khas Kaki Lima)
  // ----------------------------------------------------
  const buildFryScene = (group: THREE.Group) => {
    // Heavy Cast Iron Wajan (Kuali Wajan Baja Hitam - Cekung Mengarah Ke Atas)
    // SphereGeometry hemisphere opens upwards naturally: theta from PI/2 to PI
    const wajanGeo = new THREE.SphereGeometry(1.4, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    const wajanMat = new THREE.MeshStandardMaterial({
      color: 0x1c1917,
      roughness: 0.5,
      metalness: 0.65,
      side: THREE.DoubleSide
    });
    const wajan = new THREE.Mesh(wajanGeo, wajanMat);
    wajan.scale.set(1.0, 0.42, 1.0);
    wajan.position.set(-0.4, 1.15, 0);
    wajan.rotation.set(0, 0, 0); // Open upwards to hold oil!
    group.add(wajan);

    // Bibir Wajan (Thick Rolled Metal Lip along the rim)
    const lipGeo = new THREE.TorusGeometry(1.4, 0.035, 12, 36);
    const lip = new THREE.Mesh(lipGeo, wajanMat);
    lip.rotation.x = Math.PI / 2;
    lip.position.set(-0.4, 1.15, 0);
    group.add(lip);

    // Dua Kuping Wajan Baja (Sturdy Ear Handles on Left & Right)
    const handleGeo = new THREE.TorusGeometry(0.18, 0.032, 8, 16, Math.PI);
    const handleLeft = new THREE.Mesh(handleGeo, wajanMat);
    handleLeft.position.set(-0.4 - 1.46, 1.15, 0);
    handleLeft.rotation.z = Math.PI / 2;
    handleLeft.rotation.x = Math.PI / 2;
    group.add(handleLeft);

    const handleRight = new THREE.Mesh(handleGeo, wajanMat);
    handleRight.position.set(-0.4 + 1.46, 1.15, 0);
    handleRight.rotation.z = -Math.PI / 2;
    handleRight.rotation.x = Math.PI / 2;
    group.add(handleRight);

    // Tungku Kompor Gas Mawar Kaki Lima (Heavy Iron Gas Burner Stand underneath)
    const stoveGeo = new THREE.CylinderGeometry(1.15, 1.35, 0.68, 24, 1, true);
    const stoveMat = new THREE.MeshStandardMaterial({
      color: 0x27272a,
      roughness: 0.85,
      metalness: 0.4,
      side: THREE.DoubleSide
    });
    const stove = new THREE.Mesh(stoveGeo, stoveMat);
    stove.position.set(-0.4, 0.48, 0);
    group.add(stove);

    // Api Biru Kompor Gas Mawar (Gas Flame Glow under the wajan)
    const flameLight = new THREE.PointLight(0x3b82f6, 1.5, 2.5);
    flameLight.position.set(-0.4, 0.62, 0);
    group.add(flameLight);

    // Sizzling Golden Hot Cooking Oil (Minyak Goreng Panas Berbusa) inside the wok
    const oilGeo = new THREE.CircleGeometry(1.26, 32);
    const oilMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.12,
      metalness: 0.25,
      transparent: true,
      opacity: 0.9,
    });
    const oil = new THREE.Mesh(oilGeo, oilMat);
    oil.rotation.x = -Math.PI / 2;
    oil.position.set(-0.4, 1.02, 0);
    group.add(oil);

    // Active Bubbles in Oil
    const bubbleCount = 45;
    const bubbleGeo = new THREE.BufferGeometry();
    const bubblePositions = new Float32Array(bubbleCount * 3);
    for (let i = 0; i < bubbleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 0.85;
      bubblePositions[i * 3] = -0.4 + Math.cos(angle) * radius;
      bubblePositions[i * 3 + 1] = 1.04 + Math.random() * 0.03;
      bubblePositions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    bubbleGeo.setAttribute('position', new THREE.BufferAttribute(bubblePositions, 3));
    const bubbleMat = new THREE.PointsMaterial({ color: 0xfef08a, size: 0.045, transparent: true, opacity: 0.85 });
    const bubbles = new THREE.Points(bubbleGeo, bubbleMat);
    group.add(bubbles);
    oilBubblesRef.current = bubbles;

    // Wooden Sumpit Penggoreng (Traditional Indonesian Frying Chopsticks)
    const sumpitGeo = new THREE.CylinderGeometry(0.018, 0.012, 1.2, 8);
    const sumpitMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
    const sumpit1 = new THREE.Mesh(sumpitGeo, sumpitMat);
    sumpit1.rotation.x = Math.PI / 4;
    sumpit1.rotation.z = -Math.PI / 6;
    sumpit1.position.set(0.6, 1.3, 0.2);
    group.add(sumpit1);

    // Wire Drain Rack (Rak Tirisan Donat)
    const rackGeo = new THREE.BoxGeometry(1.2, 0.1, 1.6);
    const rackMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, wireframe: true });
    const rack = new THREE.Mesh(rackGeo, rackMat);
    rack.position.set(1.6, 1.2, 0);
    group.add(rack);

    const donutsFryingGroup = new THREE.Group();
    donutsFryingGroup.name = 'donutsFryingGroup';
    group.add(donutsFryingGroup);
  };

  // ----------------------------------------------------
  // Scene Builder: Topping Station (Meja Putar Topping & Glaze)
  // ----------------------------------------------------
  const buildToppingScene = (group: THREE.Group) => {
    // Wooden Turntable Table
    const tableGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.1, 32);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.set(0, 0.7, 0);
    group.add(table);

    // Banana leaf / Daun Pisang khas pasar
    const paperGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.02, 24);
    const paperMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });
    const paper = new THREE.Mesh(paperGeo, paperMat);
    paper.position.set(0, 0.76, 0);
    group.add(paper);

    // Central 3D Donut on Turntable
    const donutGroup = create3DDonutMesh('klasik');
    donutGroup.position.set(0, 0.95, 0);
    group.add(donutGroup);
    toppingDonutMeshRef.current = donutGroup;

    // Glaze overlay mesh (FIX: FULL 360-degree loop Math.PI * 2)
    const glazeGeo = new THREE.TorusGeometry(0.452, 0.205, 24, 48, Math.PI * 2);
    const glazeMat = new THREE.MeshStandardMaterial({
      color: 0x451a03,
      roughness: 0.16,
      metalness: 0.08,
    });
    const glazeMesh = new THREE.Mesh(glazeGeo, glazeMat);
    glazeMesh.rotation.x = Math.PI / 2;
    glazeMesh.position.set(0, 0.04, 0);
    glazeMesh.scale.set(1.01, 1.01, 0.8);
    glazeMesh.visible = false;
    donutGroup.add(glazeMesh);
    toppingGlazeMeshRef.current = glazeMesh;

    // 3 Indonesian Topping Ingredient Bowls
    const bowlGula = createToppingIngredientBowl(0x451a03, -0.95, 0.35, 'Gula Aren');
    group.add(bowlGula);

    const bowlSeres = createToppingIngredientBowl(0xf43f5e, 0, -0.85, 'Seres Pelangi');
    group.add(bowlSeres);

    const bowlKacang = createToppingIngredientBowl(0xd97706, 0.95, 0.35, 'Coklat Kacang');
    group.add(bowlKacang);
  };

  // Helper: Create Ingredient Bowls
  const createToppingIngredientBowl = (colorHex: number, x: number, z: number, label: string) => {
    const bowlGroup = new THREE.Group();
    const bGeo = new THREE.CylinderGeometry(0.28, 0.18, 0.22, 16);
    const bMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.35 });
    const bowl = new THREE.Mesh(bGeo, bMat);
    bowl.position.set(x, 0.86, z);
    bowlGroup.add(bowl);

    const fillGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.05, 16);
    const fillMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.5 });
    const fill = new THREE.Mesh(fillGeo, fillMat);
    fill.position.set(x, 0.95, z);
    bowlGroup.add(fill);

    return bowlGroup;
  };

  // Helper: Create 3D Donut Mesh
  const create3DDonutMesh = (shape: string): THREE.Group => {
    const group = new THREE.Group();
    let geo: THREE.BufferGeometry;

    if (shape === 'bolong') {
      // Puffy Round Potato Bun
      geo = new THREE.SphereGeometry(0.48, 28, 20);
      geo.scale(1.0, 0.65, 1.0);
    } else if (shape === 'hati') {
      // Heart Ring
      geo = new THREE.TorusGeometry(0.42, 0.22, 20, 36);
      geo.scale(1.2, 0.8, 1);
    } else {
      // Klasik Bolong Ring
      geo = new THREE.TorusGeometry(0.45, 0.22, 20, 36);
    }

    const mat = new THREE.MeshStandardMaterial({
      color: 0xfde68a,
      roughness: 0.55,
      metalness: 0.05,
    });
    const torus = new THREE.Mesh(geo, mat);
    torus.name = 'torusMesh';
    torus.rotation.x = Math.PI / 2;
    torus.castShadow = true;
    torus.receiveShadow = true;
    group.add(torus);

    return group;
  };

  // Helper: Update Topping Particles on Donut
  const updateToppingParticles = (donutGroup: THREE.Group, donut: DonutItem) => {
    const existing = donutGroup.getObjectByName('toppingSprinklesGroup');
    if (existing) donutGroup.remove(existing);

    if (!donut.toppings || donut.toppings.length === 0) return;

    const sprinklesGroup = new THREE.Group();
    sprinklesGroup.name = 'toppingSprinklesGroup';

    // Helper to compute exact surface elevation on the top of the donut
    const getTopY = (x: number, z: number, shape: string) => {
      if (shape === 'bolong') {
        const rSq = x * x + z * z;
        const maxR = 0.48 * 0.48;
        if (rSq < maxR) {
          return 0.65 * Math.sqrt(maxR - rSq) + 0.025;
        }
        return 0.16;
      } else {
        const distFromCenter = Math.sqrt(x * x + z * z);
        const d = Math.abs(distFromCenter - 0.45);
        if (d < 0.22) {
          return Math.sqrt(0.22 * 0.22 - d * d) + 0.038;
        }
        return 0.18;
      }
    };

    donut.toppings.forEach((top) => {
      if (top.type === 'seres_warnawarni') {
        // Vibrant Indonesian rainbow sprinkles
        const rainbowColors = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b, 0xec4899, 0x8b5cf6];
        const count = Math.min(top.positions.length, 120);

        top.positions.slice(0, count).forEach((pos, i) => {
          const sGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.065, 6);
          const sMat = new THREE.MeshStandardMaterial({
            color: rainbowColors[i % rainbowColors.length],
            roughness: 0.3,
          });
          const sprinkle = new THREE.Mesh(sGeo, sMat);
          const y = getTopY(pos.x, pos.z, donut.shape);
          sprinkle.position.set(pos.x, y + 0.012, pos.z);
          sprinkle.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
          sprinklesGroup.add(sprinkle);
        });
      } else if (top.type === 'coklat_kacang') {
        // Chopped roasted peanuts (Kacang sangrai cincang gurih)
        const peanutColors = [0xd97706, 0xb45309, 0xfde68a];
        const count = Math.min(top.positions.length, 80);

        top.positions.slice(0, count).forEach((pos, i) => {
          const sGeo = new THREE.DodecahedronGeometry(0.035);
          const sMat = new THREE.MeshStandardMaterial({
            color: peanutColors[i % peanutColors.length],
            roughness: 0.6,
          });
          const nugget = new THREE.Mesh(sGeo, sMat);
          const y = getTopY(pos.x, pos.z, donut.shape);
          nugget.position.set(pos.x, y + 0.016, pos.z);
          nugget.scale.set(1 + Math.random() * 0.4, 0.75, 1 + Math.random() * 0.4);
          sprinklesGroup.add(nugget);
        });
      } else if (top.type === 'gula_merah_bubuk') {
        // Fine caramelized brown palm sugar grains (Gula Aren Bubuk Khas Nusantara)
        const count = Math.min(top.positions.length, 150);
        top.positions.slice(0, count).forEach((pos) => {
          const sGeo = new THREE.SphereGeometry(0.016, 6, 6);
          const sMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.8 });
          const grain = new THREE.Mesh(sGeo, sMat);
          const y = getTopY(pos.x, pos.z, donut.shape);
          grain.position.set(pos.x, y + 0.008, pos.z);
          sprinklesGroup.add(grain);
        });
      }
    });

    donutGroup.add(sprinklesGroup);
  };

  // Helper: Live burst animation when player clicks topping buttons
  const spawnSprinkleBurst = (donutGroup: THREE.Group, type: string) => {
    const burstGroup = new THREE.Group();
    const count = 18;
    const colors =
      type === 'seres_warnawarni'
        ? [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b, 0xec4899]
        : type === 'coklat_kacang'
        ? [0xd97706, 0xb45309, 0x78350f]
        : [0x451a03, 0x78350f];

    for (let i = 0; i < count; i++) {
      const geo = new THREE.SphereGeometry(0.02, 6, 6);
      const mat = new THREE.MeshBasicMaterial({ color: colors[i % colors.length] });
      const p = new THREE.Mesh(geo, mat);
      p.position.set((Math.random() - 0.5) * 0.6, 0.8 + Math.random() * 0.3, (Math.random() - 0.5) * 0.6);
      burstGroup.add(p);
    }

    donutGroup.add(burstGroup);

    const startTime = Date.now();
    const dropAnim = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      burstGroup.position.y -= 0.04;
      if (elapsed < 0.35) {
        requestAnimationFrame(dropAnim);
      } else {
        donutGroup.remove(burstGroup);
      }
    };
    dropAnim();
  };

  return (
    <div
      ref={mountRef}
      id="three-canvas-container"
      className="w-full h-full min-h-[420px] max-h-[560px] relative overflow-hidden rounded-2xl shadow-inner cursor-grab active:cursor-grabbing border-4 border-amber-900/60 bg-amber-950"
    />
  );
};
