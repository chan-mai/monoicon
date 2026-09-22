import { gsap } from 'gsap';

// data-intro要素のエントランスアニメーション
export function useIntro() {
	onMounted(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		gsap.from('[data-intro]', {
			y: 24,
			autoAlpha: 0,
			duration: 0.8,
			stagger: 0.09,
			ease: 'power3.out',
		});
	});
}
