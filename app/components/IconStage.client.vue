<script setup lang="ts">
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { gsap } from 'gsap';

const props = defineProps<{ color: string; step: number; pulse?: number }>();
const emit = defineEmits<{ ready: [] }>();

const host = ref<HTMLDivElement>();

// ステップごとの全体姿勢
const POSES = [
	{ x: 0.04, y: -0.1 },
	{ x: 0.1, y: -0.5 },
	{ x: 0.03, y: 0.45 },
];

// 選択色から派生させる同一色相の濃淡
function variants(hex: string) {
	const base = new THREE.Color(hex);
	const hsl = { h: 0, s: 0, l: 0 };
	base.getHSL(hsl);
	const mk = (s: number, l: number) => new THREE.Color().setHSL(hsl.h, Math.min(1, Math.max(0, s)), Math.min(0.96, Math.max(0.06, l)));
	return {
		base,
		deep: mk(hsl.s * 0.6, hsl.l * 0.8),
		shade: mk(hsl.s * 0.7, hsl.l * 0.9),
		tint: mk(hsl.s * 0.7, hsl.l + (1 - hsl.l) * 0.45),
		pale: mk(hsl.s * 0.4, hsl.l + (1 - hsl.l) * 0.7),
	};
}

function init(el: HTMLDivElement): () => void {
	const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);
	camera.position.set(0, 0.7, 8.8);
	camera.lookAt(0, 0, 0);

	const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
	renderer.setClearColor(0x000000, 0);
	renderer.outputColorSpace = THREE.SRGBColorSpace;
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 1.05;
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	renderer.domElement.style.width = '100%';
	renderer.domElement.style.height = '100%';
	renderer.domElement.style.display = 'block';
	el.appendChild(renderer.domElement);

	const pmrem = new THREE.PMREMGenerator(renderer);
	scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

	const system = new THREE.Group();
	scene.add(system);

	const geometries: THREE.BufferGeometry[] = [];
	const materials: THREE.Material[] = [];

	function geo<T extends THREE.BufferGeometry>(g: T): T {
		geometries.push(g);
		return g;
	}

	function mat<T extends THREE.Material>(m: T): T {
		materials.push(m);
		return m;
	}

	const tileMat = mat(
		new THREE.MeshPhysicalMaterial({
			roughness: 0.3,
			metalness: 0,
			clearcoat: 0.6,
			clearcoatRoughness: 0.25,
			envMapIntensity: 0.9,
		}),
	);
	const ghostMat = mat(tileMat.clone());
	ghostMat.transparent = true;
	ghostMat.opacity = 0;
	const deepMat = mat(
		new THREE.MeshPhysicalMaterial({
			roughness: 0.3,
			metalness: 0.15,
			envMapIntensity: 0.9,
		}),
	);
	const paleMat = mat(new THREE.MeshStandardMaterial({ roughness: 0.45, metalness: 0.1 }));
	const tintMat = mat(new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0 }));
	const shadeMat = mat(
		new THREE.MeshStandardMaterial({
			roughness: 0.3,
			metalness: 0.2,
			flatShading: true,
		}),
	);
	const dustMat = mat(
		new THREE.MeshStandardMaterial({
			roughness: 0.6,
			transparent: true,
			opacity: 0.5,
		}),
	);

	const colorTargets: {
		m: THREE.Material & { color: THREE.Color };
		v: keyof ReturnType<typeof variants>;
	}[] = [
		{ m: tileMat, v: 'base' },
		{ m: ghostMat, v: 'base' },
		{ m: deepMat, v: 'deep' },
		{ m: paleMat, v: 'pale' },
		{ m: tintMat, v: 'tint' },
		{ m: shadeMat, v: 'shade' },
		{ m: dustMat, v: 'tint' },
	];

	function applyColor(css: string, animate: boolean) {
		// oklch等はsRGB近似で表示
		const vs = variants(cssToDisplayHex(css));
		for (const t of colorTargets) {
			const c = vs[t.v];
			if (animate && !reduce) {
				gsap.to(t.m.color, { r: c.r, g: c.g, b: c.b, duration: 0.5 });
			} else {
				t.m.color.copy(c);
			}
		}
	}

	applyColor(props.color, false);

	// 中心のアイコンタイル
	const tileGroup = new THREE.Group();
	system.add(tileGroup);
	const tileGeo = geo(new RoundedBoxGeometry(2.3, 2.3, 0.42, 6, 0.3));
	const tile = new THREE.Mesh(tileGeo, tileMat);
	tileGroup.add(tile);

	// 書き出しステップのサイズ展開タイル
	const ghosts = [
		{
			mesh: new THREE.Mesh(tileGeo, ghostMat),
			scale: 0.76,
			pos: [0.95, 0.35, -1.2],
		},
		{
			mesh: new THREE.Mesh(tileGeo, ghostMat),
			scale: 0.56,
			pos: [1.8, 0.65, -2.3],
		},
	];
	for (const g of ghosts) {
		g.mesh.scale.setScalar(0.001);
		g.mesh.position.set(g.pos[0]!, g.pos[1]!, g.pos[2]!);
		tileGroup.add(g.mesh);
	}

	// 軌道リングと衛星
	const spinners: { obj: THREE.Object3D; speed: number }[] = [];

	const ringG1 = new THREE.Group();
	ringG1.rotation.set(1.28, 0, 0.3);
	system.add(ringG1);
	ringG1.add(new THREE.Mesh(geo(new THREE.TorusGeometry(2.4, 0.05, 24, 200)), deepMat));

	const sat1 = [
		{ size: 0.17, phase: 0.4, speed: 0.16, m: tintMat },
		{ size: 0.11, phase: 2.5, speed: 0.22, m: paleMat },
	];
	for (const s of sat1) {
		const pivot = new THREE.Group();
		pivot.rotation.z = s.phase;
		const mesh = new THREE.Mesh(geo(new THREE.SphereGeometry(s.size, 32, 16)), s.m);
		mesh.position.x = 2.4;
		pivot.add(mesh);
		ringG1.add(pivot);
		spinners.push({ obj: pivot, speed: s.speed });
	}
	{
		const pivot = new THREE.Group();
		pivot.rotation.z = 4.6;
		const ico = new THREE.Mesh(geo(new THREE.IcosahedronGeometry(0.2, 0)), shadeMat);
		ico.position.x = 2.4;
		ico.rotation.set(0.5, 0.9, 0);
		pivot.add(ico);
		ringG1.add(pivot);
		spinners.push({ obj: pivot, speed: 0.12 });
	}

	const ringG2 = new THREE.Group();
	ringG2.rotation.set(1.9, 0.2, -0.55);
	system.add(ringG2);
	ringG2.add(new THREE.Mesh(geo(new THREE.TorusGeometry(2.95, 0.035, 24, 220)), paleMat));
	{
		const pivot = new THREE.Group();
		pivot.rotation.z = 1.3;
		const knot = new THREE.Mesh(geo(new THREE.TorusKnotGeometry(0.19, 0.065, 120, 16)), deepMat);
		knot.position.x = 2.95;
		knot.rotation.set(1, 0.4, 0);
		pivot.add(knot);
		ringG2.add(pivot);
		spinners.push({ obj: pivot, speed: -0.1 });
	}
	{
		const pivot = new THREE.Group();
		pivot.rotation.z = 4.2;
		const mesh = new THREE.Mesh(geo(new THREE.SphereGeometry(0.13, 32, 16)), shadeMat);
		mesh.position.x = 2.95;
		pivot.add(mesh);
		ringG2.add(pivot);
		spinners.push({ obj: pivot, speed: -0.18 });
	}

	// 浮遊する微細粒子
	const dustGeo = geo(new THREE.SphereGeometry(1, 8, 8));
	const dust = new THREE.InstancedMesh(dustGeo, dustMat, 70);
	{
		const m4 = new THREE.Matrix4();
		for (let i = 0; i < 70; i++) {
			const r = 2.4 + Math.random() * 1.9;
			const a = Math.random() * Math.PI * 2;
			const y = (Math.random() - 0.5) * 3.4;
			const s = 0.015 + Math.random() * 0.03;
			m4.makeScale(s, s, s);
			m4.setPosition(Math.cos(a) * r, y, Math.sin(a) * r * 0.6);
			dust.setMatrixAt(i, m4);
		}
	}
	system.add(dust);

	const dir = new THREE.DirectionalLight(0xffffff, 0.9);
	dir.position.set(2.5, 6, 3.5);
	scene.add(dir);

	const pose = { ...POSES[0]! };
	const tilt = { x: 0, y: 0 };
	const tiltTarget = { x: 0, y: 0 };

	function applyStep(step: number, animate: boolean) {
		const target = POSES[step] ?? POSES[0]!;
		const showGhosts = step === 2;
		if (animate && !reduce) {
			gsap.to(pose, { ...target, duration: 0.9, ease: 'power3.out' });
			for (const g of ghosts) {
				gsap.to(g.mesh.scale, {
					x: showGhosts ? g.scale : 0.001,
					y: showGhosts ? g.scale : 0.001,
					z: showGhosts ? g.scale : 0.001,
					duration: 0.7,
					ease: 'power3.out',
				});
			}
			gsap.to(ghostMat, { opacity: showGhosts ? 0.4 : 0, duration: 0.6 });
		} else {
			Object.assign(pose, target);
			for (const g of ghosts) g.mesh.scale.setScalar(showGhosts ? g.scale : 0.001);
			ghostMat.opacity = showGhosts ? 0.4 : 0;
		}
	}

	applyStep(props.step, false);

	const stopStep = watch(
		() => props.step,
		(s) => applyStep(s, true),
	);
	const stopColor = watch(
		() => props.color,
		(hex) => applyColor(hex, true),
	);
	// ダウンロード完了時のバウンス
	const stopPulse = watch(
		() => props.pulse,
		() => {
			if (reduce) return;
			gsap.fromTo(tile.scale, { x: 0.85, y: 0.85, z: 0.85 }, { x: 1, y: 1, z: 1, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
		},
	);

	function onPointerMove(e: PointerEvent) {
		const rect = el.getBoundingClientRect();
		tiltTarget.y = ((e.clientX - rect.left) / rect.width - 0.5) * 0.3;
		tiltTarget.x = ((e.clientY - rect.top) / rect.height - 0.5) * 0.18;
	}

	function onPointerLeave() {
		tiltTarget.x = 0;
		tiltTarget.y = 0;
	}

	if (!reduce) {
		el.addEventListener('pointermove', onPointerMove);
		el.addEventListener('pointerleave', onPointerLeave);
	}

	function resize() {
		const w = el.clientWidth;
		const h = el.clientHeight;
		if (w === 0 || h === 0) return;
		renderer.setSize(w, h, false);
		camera.aspect = w / h;
		camera.updateProjectionMatrix();
	}

	const ro = new ResizeObserver(resize);
	ro.observe(el);
	resize();

	let disposed = false;
	let rafId = 0;
	const clock = new THREE.Clock();
	let last = 0;

	function loop() {
		if (disposed) return;
		rafId = requestAnimationFrame(loop);
		const t = clock.getElapsedTime();
		const dt = t - last;
		last = t;
		if (!reduce) {
			for (const s of spinners) s.obj.rotation.z += dt * s.speed;
			ringG1.rotation.y = Math.sin(t * 0.13) * 0.16;
			ringG2.rotation.y = -Math.sin(t * 0.11 + 1) * 0.13;
			tilt.x += (tiltTarget.x - tilt.x) * 0.06;
			tilt.y += (tiltTarget.y - tilt.y) * 0.06;
			tileGroup.rotation.y = Math.sin(t * 0.4) * 0.06;
			tileGroup.position.y = Math.sin(t * 0.9) * 0.06;
			system.rotation.x = pose.x + tilt.x;
			system.rotation.y = pose.y + tilt.y;
		} else {
			system.rotation.x = pose.x;
			system.rotation.y = pose.y;
		}
		renderer.render(scene, camera);
	}

	loop();
	emit('ready');

	return () => {
		disposed = true;
		cancelAnimationFrame(rafId);
		stopStep();
		stopColor();
		stopPulse();
		ro.disconnect();
		el.removeEventListener('pointermove', onPointerMove);
		el.removeEventListener('pointerleave', onPointerLeave);
		dust.dispose();
		for (const g of geometries) g.dispose();
		for (const m of materials) m.dispose();
		pmrem.dispose();
		renderer.dispose();
		renderer.domElement.remove();
	};
}

// clientコンポーネントはマウント時にrefが未設定の場合があるためwatchで初期化
let cleanup: (() => void) | null = null;
const stopWait = watch(
	host,
	(el) => {
		if (el && !cleanup) cleanup = init(el);
	},
	{ immediate: true, flush: 'post' },
);

onUnmounted(() => {
	stopWait();
	cleanup?.();
	cleanup = null;
});
</script>

<template>
	<div ref="host" class="relative" aria-hidden="true" />
</template>
