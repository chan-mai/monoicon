<script setup lang="ts">
const route = useRoute();

const menu = [
	{ to: '/', label: 'Home' },
	{ to: '/docs', label: 'API Docs' },
];
</script>

<template>
	<header class="mx-auto flex w-full max-w-6xl items-center justify-between px-5 pt-7 md:px-8" data-intro>
		<NuxtLink to="/" class="flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
			<img src="/img/logo.png" alt="" width="28" height="28" draggable="false" class="h-7 w-7" />
			monoicon
		</NuxtLink>
		<nav class="flex items-center gap-6 font-display text-xs tracking-[0.2em]">
			<NuxtLink
				v-for="item in menu"
				:key="item.to"
				:to="item.to"
				class="transition-colors hover:text-ink uppercase"
				:class="route.path === item.to ? 'text-ink' : 'text-sub'"
			>
				{{ item.label }}
			</NuxtLink>
		</nav>
	</header>
</template>
