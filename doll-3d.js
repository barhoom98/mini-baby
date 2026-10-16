import * as THREE from "three";

const stage = document.querySelector("#doll-stage");
const canvas = document.querySelector("#doll-canvas");

if (stage && canvas) {
  try {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 10);
    camera.position.set(0.48, 0.49, 1.78);
    camera.lookAt(0, 0.38, 0);

    scene.add(new THREE.HemisphereLight(0xfff8f0, 0xb88e7a, 2.1));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.7);
    keyLight.position.set(-1, 1.6, 2);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xf5cdb9, 1.1);
    fillLight.position.set(1.2, 0.8, -0.8);
    scene.add(fillLight);

    const doll = new THREE.Group();
    scene.add(doll);
    const clothes = new THREE.Group();
    doll.add(clothes);

    const skin = new THREE.MeshStandardMaterial({ color: "#f1c9ae", roughness: 0.84 });
    const hair = new THREE.MeshStandardMaterial({ color: "#76564a", roughness: 0.92 });
    const eyes = new THREE.MeshStandardMaterial({ color: "#513d37", roughness: 0.65 });
    const mouth = new THREE.MeshStandardMaterial({ color: "#b97970", roughness: 0.8 });
    const shoeMaterial = new THREE.MeshStandardMaterial({ color: "#e8d0c0", roughness: 0.9 });

    function ellipsoid(material, position, scale, parent = doll) {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), material);
      mesh.position.set(...position);
      mesh.scale.set(...scale);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    }

    function capsule(material, position, radius, length, rotationZ = 0) {
      const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(radius, length, 8, 20), material);
      mesh.position.set(...position);
      mesh.rotation.z = rotationZ;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      doll.add(mesh);
      return mesh;
    }

    function makeRings(points, material, parent = clothes, segments = 40) {
      const positions = [];
      const uvs = [];
      const indices = [];
      points.forEach(([y, rx, rz], ring) => {
        for (let step = 0; step <= segments; step += 1) {
          const angle = (step / segments) * Math.PI * 2;
          positions.push(Math.cos(angle) * rx, y, Math.sin(angle) * rz);
          uvs.push(step / segments, ring / (points.length - 1));
          if (ring > 0 && step > 0) {
            const current = ring * (segments + 1) + step;
            const previous = current - segments - 1;
            indices.push(previous - 1, current - 1, current, previous - 1, current, previous);
          }
        }
      });
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
      geometry.setIndex(indices);
      geometry.computeVertexNormals();
      const mesh = new THREE.Mesh(geometry, material);
      mesh.material.side = THREE.DoubleSide;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    }

    function makeKnitTexture() {
      const tile = document.createElement("canvas");
      tile.width = 128;
      tile.height = 128;
      const context = tile.getContext("2d");
      context.fillStyle = "#f4f1e9";
      context.fillRect(0, 0, tile.width, tile.height);
      context.strokeStyle = "#d9d4c9";
      context.lineWidth = 2.2;
      for (let y = 0; y < 128; y += 12) {
        for (let x = 0; x < 128; x += 8) {
          const offset = (Math.floor(y / 12) % 2) * 4;
          context.beginPath();
          context.moveTo(x + offset + 1, y + 2);
          context.bezierCurveTo(x + offset + 8, y + 2, x + offset + 8, y + 10, x + offset + 1, y + 10);
          context.stroke();
        }
      }
      context.strokeStyle = "#c9c2b6";
      context.lineWidth = 3;
      for (const x of [35, 93]) {
        context.beginPath();
        context.moveTo(x - 11, 0);
        context.bezierCurveTo(x + 16, 28, x + 16, 36, x - 11, 64);
        context.bezierCurveTo(x - 22, 77, x - 22, 87, x + 11, 128);
        context.moveTo(x + 11, 0);
        context.bezierCurveTo(x - 16, 28, x - 16, 36, x + 11, 64);
        context.bezierCurveTo(x + 22, 77, x + 22, 87, x - 11, 128);
        context.stroke();
      }
      const texture = new THREE.CanvasTexture(tile);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(1.5, 2);
      return texture;
    }

    function makeCloth(color, knit = false) {
      return new THREE.MeshStandardMaterial({
        color,
        map: knit ? makeKnitTexture() : null,
        roughness: knit ? 0.96 : 0.88,
        side: THREE.DoubleSide
      });
    }

    function makeSleeve(material, shoulder, wrist) {
      const start = new THREE.Vector3(...wrist);
      const end = new THREE.Vector3(...shoulder);
      const direction = end.clone().sub(start);
      const sleeve = new THREE.Mesh(
        new THREE.CylinderGeometry(0.033, 0.024, direction.length(), 24, 8),
        material
      );
      sleeve.position.copy(start.add(end).multiplyScalar(0.5));
      sleeve.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
      sleeve.castShadow = true;
      sleeve.receiveShadow = true;
      clothes.add(sleeve);

      const cuff = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0245, 0.024, 0.035, 24, 2),
        material
      );
      cuff.position.copy(new THREE.Vector3(...wrist)).add(direction.multiplyScalar(0.015));
      cuff.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
      cuff.castShadow = true;
      clothes.add(cuff);
    }

    function makeTrousers(material) {
      for (const x of [-0.043, 0.043]) {
        const leg = makeRings([
          [0.035, 0.026, 0.027],
          [0.055, 0.031, 0.032],
          [0.17, 0.034, 0.035],
          [0.267, 0.039, 0.04]
        ], material);
        leg.position.x = x;
        const cuff = makeRings([
          [0.047, 0.032, 0.033],
          [0.063, 0.032, 0.033]
        ], material);
        cuff.position.x = x;
      }
      makeRings([
        [0.245, 0.077, 0.06],
        [0.278, 0.078, 0.061],
        [0.292, 0.068, 0.055]
      ], material);
    }

    function makeCardigan(product, fabric) {
      makeRings([
        [0.286, 0.072, 0.057],
        [0.315, 0.079, 0.064],
        [0.37, 0.081, 0.066],
        [0.42, 0.077, 0.064],
        [0.461, 0.088, 0.062],
        [0.487, 0.061, 0.051],
        [0.497, 0.05, 0.046]
      ], fabric);
      makeSleeve(fabric, [-0.076, 0.462, 0], [-0.13, 0.3, 0.005]);
      makeSleeve(fabric, [0.076, 0.462, 0], [0.13, 0.3, 0.005]);
      makeTrousers(fabric);

      const buttonMaterial = new THREE.MeshStandardMaterial({ color: "#806b4e", roughness: 0.58 });
      for (const [y, z] of [[0.463, 0.058], [0.424, 0.066], [0.385, 0.068], [0.346, 0.066], [0.308, 0.061]]) {
        const button = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.004, 20), buttonMaterial);
        button.position.set(-0.019, y, z);
        button.rotation.x = Math.PI / 2;
        button.castShadow = true;
        clothes.add(button);
        for (const offset of [-0.002, 0.002]) {
          ellipsoid(new THREE.MeshStandardMaterial({ color: "#e1d6bd" }), [-0.019 + offset, y, z + 0.003], [0.0008, 0.001, 0.0005], clothes);
        }
      }

      const placket = new THREE.Mesh(
        new THREE.BoxGeometry(0.009, 0.17, 0.003),
        new THREE.MeshStandardMaterial({ color: product.color || "#dedbd2", roughness: 0.96, map: fabric.map })
      );
      placket.position.set(-0.019, 0.385, 0.066);
      clothes.add(placket);
    }

    function makeBow(material) {
      const left = ellipsoid(material, [-0.018, 0.737, 0.011], [0.019, 0.012, 0.009], clothes);
      left.rotation.z = 0.48;
      const right = ellipsoid(material, [0.018, 0.737, 0.011], [0.019, 0.012, 0.009], clothes);
      right.rotation.z = -0.48;
      ellipsoid(material, [0, 0.737, 0.02], [0.008, 0.009, 0.008], clothes);
    }

    function makeBib(material) {
      const shape = new THREE.Shape();
      shape.moveTo(-0.044, 0.493);
      shape.lineTo(0.044, 0.493);
      shape.lineTo(0.057, 0.435);
      shape.quadraticCurveTo(0, 0.407, -0.057, 0.435);
      shape.closePath();
      const bib = new THREE.Mesh(
        new THREE.ShapeGeometry(shape),
        new THREE.MeshStandardMaterial({ color: material.color, roughness: 0.88, side: THREE.DoubleSide })
      );
      bib.position.z = 0.078;
      clothes.add(bib);
      ellipsoid(new THREE.MeshStandardMaterial({ color: "#fff7ef" }), [0, 0.445, 0.080], [0.008, 0.008, 0.003], clothes);
    }

    function dressProduct(product) {
      clothes.traverse((object) => {
        object.geometry?.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.filter(Boolean).forEach((material) => {
          material.map?.dispose();
          material.dispose();
        });
      });
      clothes.clear();
      const winterKnit = product.outfit === "winter-knit-set";
      const fabric = makeCloth(product.color || "#c59389", winterKnit);
      switch (product.outfit) {
        case "winter-knit-set":
          makeCardigan(product, fabric);
          break;
        case "accessory": {
          const band = new THREE.Mesh(
            new THREE.TorusGeometry(0.073, 0.007, 10, 48, Math.PI),
            fabric
          );
          band.position.set(0, 0.715, 0);
          band.rotation.x = Math.PI / 2;
          clothes.add(band);
          makeBow(fabric);
          break;
        }
        case "bib":
          makeBib(fabric);
          break;
        case "dress":
          makeRings([
            [0.292, 0.075, 0.059],
            [0.365, 0.076, 0.061],
            [0.397, 0.068, 0.057],
            [0.455, 0.077, 0.064],
            [0.49, 0.055, 0.05]
          ], fabric);
          makeRings([[0.29, 0.074, 0.058], [0.315, 0.111, 0.075], [0.365, 0.09, 0.065], [0.382, 0.078, 0.061]], fabric);
          break;
        case "set":
          makeRings([[0.395, 0.07, 0.058], [0.44, 0.079, 0.065], [0.49, 0.055, 0.05]], fabric);
          makeRings([[0.16, 0.033, 0.033], [0.29, 0.037, 0.036]], fabric).position.x = -0.041;
          makeRings([[0.16, 0.033, 0.033], [0.29, 0.037, 0.036]], fabric).position.x = 0.041;
          break;
        default:
          makeRings([
            [0.16, 0.033, 0.033],
            [0.29, 0.079, 0.062],
            [0.38, 0.074, 0.061],
            [0.455, 0.079, 0.064],
            [0.49, 0.055, 0.05]
          ], fabric);
      }
    }

    // The mesh uses metres: the design height is 0.75 m, not a fitted-size guarantee.
    capsule(skin, [-0.043, 0.145, 0], 0.031, 0.20, -0.025);
    capsule(skin, [0.043, 0.145, 0], 0.031, 0.20, 0.025);
    ellipsoid(shoeMaterial, [-0.044, 0.018, 0.014], [0.038, 0.018, 0.05]);
    ellipsoid(shoeMaterial, [0.044, 0.018, 0.014], [0.038, 0.018, 0.05]);
    capsule(skin, [-0.105, 0.39, 0], 0.022, 0.17, -0.16);
    capsule(skin, [0.105, 0.39, 0], 0.022, 0.17, 0.16);
    ellipsoid(skin, [-0.13, 0.29, 0.005], [0.025, 0.029, 0.024]);
    ellipsoid(skin, [0.13, 0.29, 0.005], [0.025, 0.029, 0.024]);
    ellipsoid(skin, [0, 0.382, 0], [0.078, 0.119, 0.069]);
    ellipsoid(skin, [0, 0.52, 0], [0.025, 0.028, 0.026]);
    ellipsoid(skin, [0, 0.635, 0], [0.08, 0.087, 0.077]);
    ellipsoid(skin, [-0.079, 0.635, 0], [0.018, 0.023, 0.017]);
    ellipsoid(skin, [0.079, 0.635, 0], [0.018, 0.023, 0.017]);
    ellipsoid(hair, [0, 0.71, -0.009], [0.079, 0.039, 0.076]);
    ellipsoid(hair, [-0.041, 0.685, 0.018], [0.039, 0.029, 0.059]);
    ellipsoid(hair, [0.041, 0.685, 0.018], [0.039, 0.029, 0.059]);
    ellipsoid(eyes, [-0.029, 0.638, 0.071], [0.005, 0.007, 0.003]);
    ellipsoid(eyes, [0.029, 0.638, 0.071], [0.005, 0.007, 0.003]);
    ellipsoid(mouth, [0, 0.611, 0.073], [0.012, 0.003, 0.002]);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(0.38, 48),
      new THREE.MeshBasicMaterial({ color: "#f2e5db" })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0.001;
    scene.add(floor);

    let rotationY = -0.22;
    let dragging = false;
    let previousX = 0;

    canvas.addEventListener("pointerdown", (event) => {
      dragging = true;
      previousX = event.clientX;
      canvas.setPointerCapture(event.pointerId);
    });
    canvas.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      rotationY += (event.clientX - previousX) * 0.012;
      previousX = event.clientX;
    });
    canvas.addEventListener("pointerup", () => { dragging = false; });
    canvas.addEventListener("pointercancel", () => { dragging = false; });
    stage.querySelectorAll("[data-rotate]").forEach((button) => {
      button.addEventListener("click", () => {
        rotationY += Number(button.dataset.rotate);
      });
    });

    const resizeObserver = new ResizeObserver(() => {
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    });
    resizeObserver.observe(stage);

    function animate() {
      doll.rotation.y = rotationY;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    const initialProduct = window.MINI_BABY?.products?.[0];
    if (initialProduct) dressProduct(initialProduct);
    window.addEventListener("mini-baby:try-on", (event) => dressProduct(event.detail));
    stage.classList.add("webgl-ready");
    animate();
  } catch (error) {
    console.error("The 3D mannequin could not be initialized; showing the illustrated fallback.", error);
  }
}
