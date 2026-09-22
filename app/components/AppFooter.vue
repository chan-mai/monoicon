<script setup lang="ts">
// 2027年以降は2026-年表記
const yearLabel = computed(() => {
	const year = new Date().getFullYear();
	return year > 2026 ? `2026-${year}` : '2026';
});
</script>

<template>
	<footer class="fixed inset-x-0 bottom-0 z-10 pb-4 pt-2 text-center text-[11px] text-sub">
		Copyright © {{ yearLabel }}
		<NuxtLink to="https://mq1.dev/about" target="_blank" class="underline-offset-2 transition-colors hover:text-ink hover:underline"
			>chan-mai</NuxtLink
		>
		All Rights Reserved.
	</footer>
</template>
