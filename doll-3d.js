import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

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
    camera.position.set(0, 0.37, 1.34);
    camera.lookAt(0, 0.36, 0);

    scene.add(new THREE.HemisphereLight(0xfff8f0, 0xb88e7a, 2.1));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.7);
    keyLight.position.set(-1, 1.6, 2);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xf5cdb9, 1.1);
    fillLight.position.set(1.2, 0.8, -0.8);
    scene.add(fillLight);

    const doll = new THREE.Group();
    scene.add(doll);
    const photoMannequin = new THREE.Group();
    photoMannequin.visible = false;
    scene.add(photoMannequin);
    const clothes = new THREE.Group();
    doll.add(clothes);
    const knitTexturePath = "assets/products/winter-wool-knit-texture.jpg";
    const knitDiffuseTexture = new THREE.TextureLoader().load(knitTexturePath);
    knitDiffuseTexture.colorSpace = THREE.SRGBColorSpace;
    knitDiffuseTexture.wrapS = THREE.RepeatWrapping;
    knitDiffuseTexture.wrapT = THREE.RepeatWrapping;
    knitDiffuseTexture.repeat.set(1.25, 1.6);
    knitDiffuseTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const knitBumpTexture = new THREE.TextureLoader().load(knitTexturePath);
    knitBumpTexture.colorSpace = THREE.NoColorSpace;
    knitBumpTexture.wrapS = THREE.RepeatWrapping;
    knitBumpTexture.wrapT = THREE.RepeatWrapping;
    knitBumpTexture.repeat.set(1.25, 1.6);
    knitBumpTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

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

    function makeKnitTexture(ribbed = false) {
      const diffuse = document.createElement("canvas");
      const relief = document.createElement("canvas");
      diffuse.width = relief.width = 256;
      diffuse.height = relief.height = 256;
      const color = diffuse.getContext("2d");
      const bump = relief.getContext("2d");

      color.fillStyle = "#efeee9";
      color.fillRect(0, 0, 256, 256);
      bump.fillStyle = "#888888";
      bump.fillRect(0, 0, 256, 256);

      if (ribbed) {
        for (let x = 0; x < 256; x += 8) {
          color.beginPath();
          color.moveTo(x + 2, 0);
          color.bezierCurveTo(x - 1, 72, x + 5, 176, x + 2, 256);
          color.strokeStyle = "#d2d0c8";
          color.lineWidth = 2;
          color.stroke();
          color.beginPath();
          color.moveTo(x + 5, 0);
          color.bezierCurveTo(x + 2, 72, x + 8, 176, x + 5, 256);
          color.strokeStyle = "#fffefa";
          color.lineWidth = 2;
          color.stroke();
          bump.beginPath();
          bump.moveTo(x + 2, 0);
          bump.lineTo(x + 2, 256);
          bump.strokeStyle = "#e0e0e0";
          bump.lineWidth = 3;
          bump.stroke();
          bump.beginPath();
          bump.moveTo(x + 6, 0);
          bump.lineTo(x + 6, 256);
          bump.strokeStyle = "#606060";
          bump.lineWidth = 2;
          bump.stroke();
        }
      } else {
        for (let y = 0; y < 256; y += 12) {
          for (let x = 0; x < 256; x += 12) {
            const offset = (Math.floor(y / 12) % 2) * 6;
            color.beginPath();
            color.ellipse(x + offset + 6, y + 6, 4, 5, 0, 0, Math.PI * 2);
            color.fillStyle = "#dbd9d2";
            color.fill();
            color.beginPath();
            color.ellipse(x + offset + 5, y + 5, 3, 4, 0, Math.PI * 1.1, Math.PI * 1.9);
            color.strokeStyle = "#fffefa";
            color.lineWidth = 1.5;
            color.stroke();
            bump.beginPath();
            bump.ellipse(x + offset + 6, y + 6, 4, 5, 0, 0, Math.PI * 2);
            bump.fillStyle = "#bdbdbd";
            bump.fill();
            bump.beginPath();
            bump.ellipse(x + offset + 4, y + 4, 2, 3, 0, 0, Math.PI * 2);
            bump.fillStyle = "#e8e8e8";
            bump.fill();
          }
        }
        for (const x of [38, 112, 186, 250]) {
          color.beginPath();
          color.moveTo(x - 16, 0);
          color.bezierCurveTo(x + 23, 42, x + 23, 50, x - 16, 88);
          color.bezierCurveTo(x - 27, 101, x - 27, 112, x + 16, 160);
          color.bezierCurveTo(x + 28, 176, x + 28, 185, x - 16, 216);
          color.bezierCurveTo(x - 25, 226, x - 25, 238, x + 16, 256);
          color.strokeStyle = "#cbc9c1";
          color.lineWidth = 5;
          color.stroke();
          color.beginPath();
          color.moveTo(x - 9, 0);
          color.bezierCurveTo(x + 28, 42, x + 28, 50, x - 9, 88);
          color.bezierCurveTo(x - 20, 101, x - 20, 112, x + 23, 160);
          color.bezierCurveTo(x + 35, 176, x + 35, 185, x - 9, 216);
          color.bezierCurveTo(x - 18, 226, x - 18, 238, x + 23, 256);
          color.strokeStyle = "#fdfcf8";
          color.lineWidth = 2;
          color.stroke();
          bump.beginPath();
          bump.moveTo(x - 16, 0);
          bump.bezierCurveTo(x + 23, 42, x + 23, 50, x - 16, 88);
          bump.bezierCurveTo(x - 27, 101, x - 27, 112, x + 16, 160);
          bump.bezierCurveTo(x + 28, 176, x + 28, 185, x - 16, 216);
          bump.bezierCurveTo(x - 25, 226, x - 25, 238, x + 16, 256);
          bump.strokeStyle = "#eeeeee";
          bump.lineWidth = 6;
          bump.stroke();
        }
      }

      const texture = new THREE.CanvasTexture(diffuse);
      const bumpMap = new THREE.CanvasTexture(relief);
      texture.colorSpace = THREE.SRGBColorSpace;
      for (const map of [texture, bumpMap]) {
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;
        map.repeat.set(ribbed ? 0.8 : 1.25, ribbed ? 1 : 1.6);
        map.anisotropy = renderer.capabilities.getMaxAnisotropy();
      }
      return { texture, bumpMap };
    }

    function makeCloth(color, knit = false, ribbed = false) {
      const maps = knit && ribbed ? makeKnitTexture(true) : null;
      return new THREE.MeshStandardMaterial({
        color,
        map: knit && !ribbed ? knitDiffuseTexture : maps?.texture ?? null,
        bumpMap: knit && !ribbed ? knitBumpTexture : maps?.bumpMap ?? null,
        bumpScale: knit ? (ribbed ? 0.006 : 0.014) : 0,
        roughness: knit ? 1 : 0.88,
        side: THREE.DoubleSide
      });
    }

    function makeSleeve(material, ribbedMaterial, shoulder, wrist) {
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
        new THREE.CylinderGeometry(0.035, 0.032, 0.04, 24, 4),
        ribbedMaterial
      );
      cuff.position.copy(new THREE.Vector3(...wrist)).add(direction.multiplyScalar(0.02));
      cuff.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
      cuff.castShadow = true;
      clothes.add(cuff);
    }

    function makeTrousers(material, ribbedMaterial) {
      for (const x of [-0.043, 0.043]) {
        const leg = makeRings([
          [0.027, 0.036, 0.037],
          [0.045, 0.04, 0.041],
          [0.13, 0.043, 0.044],
          [0.22, 0.046, 0.047],
          [0.274, 0.049, 0.049]
        ], material);
        leg.position.x = x;
        const cuff = makeRings([
          [0.027, 0.037, 0.038],
          [0.048, 0.041, 0.042]
        ], ribbedMaterial);
        cuff.position.x = x;
      }
      makeRings([
        [0.248, 0.078, 0.065],
        [0.274, 0.08, 0.066],
        [0.3, 0.077, 0.063]
      ], material);
      makeRings([
        [0.29, 0.078, 0.064],
        [0.302, 0.079, 0.065],
        [0.315, 0.078, 0.064]
      ], ribbedMaterial);
    }

    function makeCardigan(product, fabric) {
      const ribbed = makeCloth(product.color || "#dedbd2", true, true);
      const torsoRings = [
        [0.29, 0.08, 0.066],
        [0.305, 0.086, 0.071],
        [0.34, 0.086, 0.071],
        [0.39, 0.084, 0.07],
        [0.435, 0.09, 0.069],
        [0.466, 0.094, 0.064],
        [0.487, 0.076, 0.054],
        [0.498, 0.055, 0.048]
      ];
      makeRings([
        [0.29, 0.081, 0.067],
        [0.305, 0.087, 0.072]
      ], ribbed);
      makeRings(torsoRings, fabric);
      makeSleeve(fabric, ribbed, [-0.083, 0.465, 0], [-0.13, 0.3, 0.005]);
      makeSleeve(fabric, ribbed, [0.083, 0.465, 0], [0.13, 0.3, 0.005]);
      makeTrousers(fabric, ribbed);

      const buttonMaterial = new THREE.MeshStandardMaterial({ color: "#806b4e", roughness: 0.58 });
      for (const [y, z] of [[0.463, 0.078], [0.424, 0.079], [0.385, 0.08], [0.346, 0.08], [0.308, 0.075]]) {
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
      placket.position.set(-0.019, 0.385, 0.075);
      clothes.add(placket);

      const cableMaterial = new THREE.MeshStandardMaterial({
        color: product.color || "#dedbd2",
        roughness: 1,
        map: fabric.map,
        bumpMap: fabric.bumpMap,
        bumpScale: 0.014
      });
      for (const centerX of [-0.052, 0.052]) {
        const cablePoints = [];
        for (let index = 0; index <= 32; index += 1) {
          const t = index / 32;
          const y = 0.326 + t * 0.13;
          const x = centerX + Math.sin(t * Math.PI * 4) * 0.009;
          const ring = torsoRings.reduce((closest, candidate) =>
            Math.abs(candidate[0] - y) < Math.abs(closest[0] - y) ? candidate : closest
          );
          const z = ring[2] * Math.sqrt(Math.max(0, 1 - (x * x) / (ring[1] * ring[1]))) + 0.0025;
          cablePoints.push(new THREE.Vector3(x, y, z));
        }
        const cable = new THREE.Mesh(
          new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cablePoints), 72, 0.003, 8, false),
          cableMaterial
        );
        cable.castShadow = true;
        cable.receiveShadow = true;
        clothes.add(cable);
      }

      const drawstring = new THREE.MeshStandardMaterial({ color: "#c9c3b6", roughness: 0.92 });
      for (const side of [-1, 1]) {
        const cord = new THREE.Mesh(
          new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3([
              new THREE.Vector3(0.006 * side, 0.311, 0.071),
              new THREE.Vector3(0.006 * side, 0.276, 0.076),
              new THREE.Vector3(0.01 * side, 0.255, 0.073)
            ]),
            20,
            0.002,
            6,
            false
          ),
          drawstring
        );
        clothes.add(cord);
      }
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
          if (material.map !== knitDiffuseTexture) material.map?.dispose();
          if (material.bumpMap !== knitBumpTexture) material.bumpMap?.dispose();
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

    new GLTFLoader().load(
      "assets/objects/mini-baby-mannequin.glb",
      (gltf) => {
        const model = gltf.scene;
        const bounds = new THREE.Box3().setFromObject(model);
        const size = bounds.getSize(new THREE.Vector3());
        const center = bounds.getCenter(new THREE.Vector3());
        const scale = 0.72 / size.y;
        model.scale.setScalar(scale);
        model.position.set(-center.x * scale, -bounds.min.y * scale, 0);
        photoMannequin.add(model);
        photoMannequin.visible = true;
        doll.visible = false;
        floor.visible = false;
        window.MINI_BABY_PHOTO_MODEL = true;
        stage.classList.add("webgl-ready", "photo-mannequin");
        stage.setAttribute("aria-label", "صورة المانيكان الأصلي بلباس الطقم، معروضة أماميًا داخل نموذج GLB");
        document.querySelector(".doll-panel").classList.add("photo-mannequin");
        document.querySelector("#doll-title").textContent = "المانيكان الأصلي";
        document.querySelector(".doll-heading .eyebrow").textContent = "الصورة المرجعية";
        document.querySelector("#doll-hint").textContent = "الصورة الأصلية للطقم داخل GLB · عرض أمامي فقط";
        document.querySelector(".try-on-label").textContent = "المانيكان مطابق للصورة المرفقة · ملف GLB بواجهة أمامية وليس مجسمًا قابلًا للدوران";
      },
      undefined,
      (error) => console.error("Could not load the GLB mannequin; showing the 3D fallback.", error)
    );

    let rotationY = -0.22;
    let dragging = false;
    let previousX = 0;

    canvas.addEventListener("pointerdown", (event) => {
      if (photoMannequin.visible) return;
      dragging = true;
      previousX = event.clientX;
      canvas.setPointerCapture(event.pointerId);
    });
    canvas.addEventListener("pointermove", (event) => {
      if (!dragging || photoMannequin.visible) return;
      rotationY += (event.clientX - previousX) * 0.012;
      previousX = event.clientX;
    });
    canvas.addEventListener("pointerup", () => { dragging = false; });
    canvas.addEventListener("pointercancel", () => { dragging = false; });
    stage.querySelectorAll("[data-rotate]").forEach((button) => {
      button.addEventListener("click", () => {
        if (photoMannequin.visible) return;
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
      photoMannequin.rotation.y = 0;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    const initialProduct = window.MINI_BABY?.products?.[0];
    if (initialProduct) dressProduct(initialProduct);
    window.addEventListener("mini-baby:try-on", (event) => dressProduct(event.detail));
    animate();
  } catch (error) {
    console.error("The 3D mannequin could not be initialized; showing the illustrated fallback.", error);
  }
}
