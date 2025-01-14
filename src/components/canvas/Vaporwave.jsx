import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

const VaporwaveCanvas = () => {
    const mountRef = useRef(null);

    useEffect(() => {
        // Canvas
        const canvas = mountRef.current;

        // Scene
        const scene = new THREE.Scene();
        const fog = new THREE.Fog("#000000", 1, 2.5);
        scene.fog = fog;

        // Textures
        const textureLoader = new THREE.TextureLoader();
        const gridTexture = textureLoader.load("./grid.png");
        const heightTexture = textureLoader.load("./displacement.png");
        const metalnessTexture = textureLoader.load("./metalness.png");

        // Plane
        const parameters = {
            displacementScale: 0.4,
            metalness: 1,
            roughness: 0.23,
        };

        const geometry = new THREE.PlaneGeometry(1, 2, 24, 24);
        const material = new THREE.MeshStandardMaterial({
            map: gridTexture,
            displacementMap: heightTexture,
            displacementScale: parameters.displacementScale,
            metalness: parameters.metalness,
            metalnessMap: metalnessTexture,
            roughness: parameters.roughness,
        });
        const plane = new THREE.Mesh(geometry, material);
        const plane2 = new THREE.Mesh(geometry, material);

        plane.rotation.x = -Math.PI * 0.5;
        plane2.rotation.x = -Math.PI * 0.5;

        plane.position.y = 0.0;
        plane.position.z = 0.15;
        plane2.position.y = 0.0;
        plane2.position.z = -1.85;
        scene.add(plane);
        scene.add(plane2);

        // Lights
        const ambientLight = new THREE.AmbientLight("#ffdd00", 10);
        scene.add(ambientLight);

        const spotlight = new THREE.SpotLight(
            "#00ff91",
            40,
            25,
            Math.PI * 0.1,
            0.25
        );
        spotlight.position.set(0.5, 0.75, 2.1);
        spotlight.target.position.x = -0.25;
        spotlight.target.position.y = 0.25;
        spotlight.target.position.z = 0.25;
        scene.add(spotlight);
        scene.add(spotlight.target);

        const spotlight2 = new THREE.SpotLight(
            "#00ff1e",
            40,
            25,
            Math.PI * 0.1,
            0.25
        );
        spotlight2.position.set(-0.5, 0.75, 2.1);
        spotlight2.target.position.x = 0.25;
        spotlight2.target.position.y = 0.25;
        spotlight2.target.position.z = 0.25;
        scene.add(spotlight2);
        scene.add(spotlight2.target);

        // Sizes
        const sizes = {
            width: window.innerWidth,
            height: window.innerHeight,
        };

        // Base camera
        const camera = new THREE.PerspectiveCamera(
            75,
            sizes.width / sizes.height,
            0.01,
            20
        );
        camera.position.x = 0;
        camera.position.y = 0.12;
        camera.position.z = 1;
        scene.add(camera);

        // Controls
        const controls = new OrbitControls(camera, canvas);
        controls.enableRotate = true;
        controls.enablePan = false;
        controls.enableZoom = false;
        controls.enableDamping = true;
        controls.minPolarAngle = Math.PI * 0.30; // Minimum rotation angle (5 degrees)
        controls.maxPolarAngle = Math.PI * 0.45; // Maximum rotation angle (45 degrees)
        controls.minAzimuthAngle = 0; // Minimum azimuth angle (disable left rotation)
        controls.maxAzimuthAngle = 0; // Minimum azimuth angle (disable right rotation) 

        // Renderer
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
        });
        renderer.setClearColor(0x000000, 0);
        renderer.setSize(sizes.width, sizes.height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Post-processing
        const effectComposer = new EffectComposer(renderer);
        effectComposer.setSize(sizes.width, sizes.height);
        effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        renderer.autoClear = false;
        const renderPass = new RenderPass(scene, camera);
        effectComposer.addPass(renderPass);

        const rgbShiftPass = new ShaderPass(RGBShiftShader);
        rgbShiftPass.uniforms["amount"].value = 0.00582;
        effectComposer.addPass(rgbShiftPass);

        const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
        effectComposer.addPass(gammaCorrectionPass);

        const bloomParams = {
            strength: 2.4,
        };
        const bloomPass = new UnrealBloomPass();
        bloomPass.strength = bloomParams.strength;
        effectComposer.addPass(bloomPass);

        // Resize handler
        window.addEventListener("resize", () => {
            // Update sizes
            sizes.width = window.innerWidth;
            sizes.height = window.innerHeight;

            // Update camera
            camera.aspect = sizes.width / sizes.height;
            camera.updateProjectionMatrix();

            // Update renderer
            renderer.setSize(sizes.width, sizes.height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

            effectComposer.setSize(sizes.width, sizes.height);
            effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        });

        // Animation
        const clock = new THREE.Clock();

        const tick = () => {
            const elapsedTime = clock.getElapsedTime();

            // Update plane position
            plane.position.z = (elapsedTime * 0.15) % 2;
            plane2.position.z = ((elapsedTime * 0.15) % 2) - 2;

            // Update controls
            controls.update();

            // Render
            effectComposer.render();

            // Call tick again on the next frame
            window.requestAnimationFrame(tick);
        };

        tick();
    }, []);

    return (
        <div
            className="canvas-container w-full h-auto absolute inset-0 z-[-1]"
            style={{ overflowX: "hidden", overflowY: "hidden", width: "100%", height: "100%" }}
        >
            <canvas
                className="canvas"
                ref={mountRef}
            ></canvas>
        </div>
    );
};

export default VaporwaveCanvas;
