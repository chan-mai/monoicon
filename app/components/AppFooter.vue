<script setup lang="ts">
// 2027年以降は2026-年表記
const yearLabel = computed(() => {
	const year = new Date().getFullYear();
	return year > 2026 ? `2026-${year}` : '2026';
});
</script>

<template>
	<footer class="flex flex-col items-center gap-2 pb-6 pt-10 text-[11px] text-sub">
		<NuxtLink to="https://github.com/chan-mai/monoicon" target="_blank" aria-label="GitHub" class="transition-colors hover:text-ink">
			<Icon name="lucide:github" class="h-4 w-4" />
		</NuxtLink>
		<p>
			Copyright © {{ yearLabel }}
			<NuxtLink to="https://mq1.dev/about" target="_blank" class="underline-offset-2 transition-colors hover:text-ink hover:underline"
				>chan-mai</NuxtLink
			>
			All Rights Reserved.
		</p>

		<p class="mt-2 max-w-md px-5 text-center text-[10px] leading-5">
			このサイトでは、アクセス解析のため、Google
			Analyticsを使用しています。データは個人と紐付かない形で収集されており、個人を特定するものではありません。
		</p>
	</footer>
</template>
