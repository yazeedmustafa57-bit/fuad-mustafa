import React, { useEffect, useRef } from 'react';

const Mars3DScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    let cleanup: (() => void) | null = null;

    const loadThree = async () => {
      try {
        const THREE = await import('three');
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, containerRef.current!.clientWidth / containerRef.current!.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(containerRef.current!.clientWidth, containerRef.current!.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        containerRef.current!.appendChild(renderer.domElement);

        // Lights
        const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
        scene.add(ambientLight);
        const sunLight = new THREE.DirectionalLight(0xffaa66, 2);
        sunLight.position.set(10, 20, 5);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 1024;
        sunLight.shadow.mapSize.height = 1024;
        scene.add(sunLight);
        const fillLight = new THREE.DirectionalLight(0x4488ff, 0.6);
        fillLight.position.set(-5, 5, 10);
        scene.add(fillLight);

        // Stars
        const starsGeo = new THREE.BufferGeometry();
        const starPositions = new Float32Array(3000 * 3);
        const starColors = new Float32Array(3000 * 3);
        for (let i = 0; i < 3000; i++) {
          starPositions[i*3] = (Math.random() - 0.5) * 400;
          starPositions[i*3+1] = (Math.random() - 0.5) * 400;
          starPositions[i*3+2] = (Math.random() - 0.5) * 400 - 50;
          const c = 0.5 + Math.random() * 0.5;
          starColors[i*3] = c;
          starColors[i*3+1] = c * (0.7 + Math.random() * 0.3);
          starColors[i*3+2] = c * (0.8 + Math.random() * 0.2);
        }
        starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        starsGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
        const starsMat = new THREE.PointsMaterial({ size: 0.15, vertexColors: true, transparent: true, opacity: 0.8 });
        const stars = new THREE.Points(starsGeo, starsMat);
        scene.add(stars);

        // Mars surface (large sphere with bumpy texture)
        const marsGeo = new THREE.SphereGeometry(5, 64, 64);
        const marsMat = new THREE.MeshStandardMaterial({
          color: 0xc1440e,
          roughness: 0.9,
          metalness: 0.1,
          emissive: 0x441100,
          emissiveIntensity: 0.05,
        });
        const mars = new THREE.Mesh(marsGeo, marsMat);
        mars.position.y = -6;
        mars.castShadow = true;
        mars.receiveShadow = true;
        scene.add(mars);

        // Terrain bumps on Mars surface
        for (let i = 0; i < 200; i++) {
          const bumpGeo = new THREE.SphereGeometry(0.1 + Math.random() * 0.3, 6, 6);
          const bumpMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color().setHSL(0.07 + Math.random() * 0.05, 0.6, 0.3 + Math.random() * 0.2),
            roughness: 0.9,
          });
          const bump = new THREE.Mesh(bumpGeo, bumpMat);
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const r = 5.05 + Math.random() * 0.2;
          bump.position.set(
            r * Math.sin(phi) * Math.cos(theta),
            r * Math.sin(phi) * Math.sin(theta) - 6,
            r * Math.cos(phi)
          );
          bump.castShadow = true;
          scene.add(bump);
        }

        // Astronaut body - geometric style
        const astroGroup = new THREE.Group();

        // Body (torso)
        const bodyGeo = new THREE.CylinderGeometry(0.6, 0.7, 1.0, 8);
        const suitMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.3, metalness: 0.4 });
        const body = new THREE.Mesh(bodyGeo, suitMat);
        body.position.y = 2.2;
        body.castShadow = true;
        astroGroup.add(body);

        // Head (helmet)
        const helmetGeo = new THREE.SphereGeometry(0.45, 12, 12);
        const helmetMat = new THREE.MeshStandardMaterial({
          color: 0xcccccc,
          roughness: 0.1,
          metalness: 0.7,
          transparent: true,
          opacity: 0.9,
        });
        const helmet = new THREE.Mesh(helmetGeo, helmetMat);
        helmet.position.y = 3.1;
        helmet.castShadow = true;
        astroGroup.add(helmet);

        // Visor
        const visorGeo = new THREE.SphereGeometry(0.3, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.4);
        const visorMat = new THREE.MeshStandardMaterial({
          color: 0x44aaff,
          roughness: 0.1,
          metalness: 0.9,
          transparent: true,
          opacity: 0.7,
          side: THREE.DoubleSide,
        });
        const visor = new THREE.Mesh(visorGeo, visorMat);
        visor.position.set(0, 3.1, 0.35);
        visor.rotation.x = -0.1;
        astroGroup.add(visor);

        // Left arm
        const armGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.8, 6);
        const armMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.4, metalness: 0.3 });
        const leftArm = new THREE.Mesh(armGeo, armMat);
        leftArm.position.set(-0.75, 2.4, 0);
        leftArm.rotation.z = 0.3;
        leftArm.rotation.x = 0.2;
        leftArm.castShadow = true;
        astroGroup.add(leftArm);

        // Right arm - waving
        const rightArm = new THREE.Mesh(armGeo, armMat);
        rightArm.position.set(0.75, 2.5, 0);
        rightArm.rotation.z = -0.6;
        rightArm.rotation.x = -0.4;
        rightArm.castShadow = true;
        astroGroup.add(rightArm);

        // Left leg
        const legGeo = new THREE.CylinderGeometry(0.25, 0.3, 0.7, 6);
        const legMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.5, metalness: 0.2 });
        const leftLeg = new THREE.Mesh(legGeo, legMat);
        leftLeg.position.set(-0.3, 1.5, 0);
        leftLeg.rotation.x = 0.1;
        leftLeg.castShadow = true;
        astroGroup.add(leftLeg);

        // Right leg
        const rightLeg = new THREE.Mesh(legGeo, legMat);
        rightLeg.position.set(0.3, 1.5, 0);
        rightLeg.rotation.x = -0.1;
        rightLeg.castShadow = true;
        astroGroup.add(rightLeg);

        // Backpack (life support)
        const packGeo = new THREE.BoxGeometry(0.6, 0.7, 0.3);
        const packMat = new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.6, metalness: 0.3 });
        const pack = new THREE.Mesh(packGeo, packMat);
        pack.position.set(0, 2.3, -0.5);
        pack.castShadow = true;
        astroGroup.add(pack);

        astroGroup.position.set(0, 1.8, 2.5);
        astroGroup.scale.set(0.8, 0.8, 0.8);
        scene.add(astroGroup);

        // Asteroid rocks on ground
        for (let i = 0; i < 30; i++) {
          const rockGeo = new THREE.DodecahedronGeometry(0.05 + Math.random() * 0.15);
          const rockMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color().setHSL(0.07, 0.3, 0.2 + Math.random() * 0.3),
            roughness: 0.9,
          });
          const rock = new THREE.Mesh(rockGeo, rockMat);
          rock.position.set(
            (Math.random() - 0.5) * 8,
            -1.5 + Math.random() * 0.5,
            (Math.random() - 0.5) * 8 + 1
          );
          rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
          rock.castShadow = true;
          rock.receiveShadow = true;
          scene.add(rock);
        }

        // Flag
        const flagGroup = new THREE.Group();
        const poleGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.5);
        const poleMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.2 });
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.y = 0.75;
        flagGroup.add(pole);

        // Kurdistan flag
        const flagGeo = new THREE.PlaneGeometry(0.8, 0.5);
        const canvas = document.createElement('canvas');
        canvas.width = 80;
        canvas.height = 50;
        const ctx = canvas.getContext('2d')!;
        // Red stripe
        ctx.fillStyle = '#CE1126';
        ctx.fillRect(0, 0, 80, 17);
        // White stripe
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 17, 80, 16);
        // Green stripe
        ctx.fillStyle = '#007A3D';
        ctx.fillRect(0, 33, 80, 17);
        // Yellow sun
        ctx.fillStyle = '#FCD116';
        const cx = 40, cy = 24, r = 7;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        // Rays
        for (let i = 0; i < 21; i++) {
          const angle = (i / 21) * Math.PI * 2 - Math.PI / 2;
          ctx.fillStyle = '#FCD116';
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, 10, angle - 0.08, angle + 0.08);
          ctx.fill();
        }
        const flagTexture = new THREE.CanvasTexture(canvas);
        const flagMat2 = new THREE.MeshStandardMaterial({ map: flagTexture, side: THREE.DoubleSide });
        const flagMesh = new THREE.Mesh(flagGeo, flagMat2);
        flagMesh.position.set(0, 1.4, 0);
        flagMesh.rotation.x = -0.1;
        flagGroup.add(flagMesh);

        flagGroup.position.set(-1.5, -1.8, 2);
        flagGroup.rotation.y = 0.3;
        scene.add(flagGroup);

        camera.position.set(3, 3, 6);
        camera.lookAt(0, 1, 2);

        // Animation loop
        let time = 0;
        const animate = () => {
          if (!mounted) return;
          requestAnimationFrame(animate);
          time += 0.005;

          // Slow rotation of Mars
          mars.rotation.y += 0.0005;

          // Astronaut gentle float/bob
          astroGroup.position.y = 1.8 + Math.sin(time * 1.5) * 0.05;
          astroGroup.rotation.x = Math.sin(time * 0.8) * 0.02;
          astroGroup.rotation.z = Math.sin(time * 0.6) * 0.02;

          // Waving arm
          rightArm.rotation.x = -0.4 + Math.sin(time * 2) * 0.15;

          // Stars slowly rotate
          stars.rotation.y += 0.0001;

          // Camera slight orbit
          const camAngle = time * 0.1;
          camera.position.x = 3 * Math.cos(camAngle * 0.05);
          camera.position.z = 6 + Math.sin(camAngle * 0.03) * 0.5;
          camera.lookAt(0, 1.5, 1.5);

          renderer.render(scene, camera);
        };
        animate();

        // Handle resize
        const handleResize = () => {
          if (!containerRef.current) return;
          const w = containerRef.current.clientWidth;
          const h = containerRef.current.clientHeight;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        };
        window.addEventListener('resize', handleResize);

        cleanup = () => {
          window.removeEventListener('resize', handleResize);
          renderer.dispose();
          if (containerRef.current?.contains(renderer.domElement)) {
            containerRef.current.removeChild(renderer.domElement);
          }
        };
      } catch (e) {
        console.error('Three.js load error:', e);
      }
    };

    loadThree();

    return () => {
      mounted = false;
      if (cleanup) cleanup();
    };
  }, []);

  return (
    <section className="mars-3d-section">
      <div ref={containerRef} className="mars-3d-container" />
      <div className="mars-3d-overlay">
        <div className="mars-3d-content">
          <div className="mars-badge">✦ 3D Experience</div>
          <h2 className="mars-title">Fuad Mustafa</h2>
          <p className="mars-subtitle">Stream & Watch Movies & TV Series</p>
        </div>
      </div>
    </section>
  );
};

export default Mars3DScene;
