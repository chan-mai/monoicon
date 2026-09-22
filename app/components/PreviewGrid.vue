<script setup lang="ts">
import PreviewMisskeyNote from './preview/MisskeyNote.vue';
import PreviewMisskeyProfile from './preview/MisskeyProfile.vue';
import PreviewTwitterTweet from './preview/TwitterTweet.vue';
import PreviewTwitterProfile from './preview/TwitterProfile.vue';

const { color } = useIcon();

const previews = [
	{ label: 'Misskey/Note', component: PreviewMisskeyNote },
	{ label: 'Misskey/Profile', component: PreviewMisskeyProfile },
	{ label: 'Twitter/Tweet', component: PreviewTwitterTweet },
	{ label: 'Twitter/Profile', component: PreviewTwitterProfile },
];
</script>

<template>
	<div class="space-y-8">
		<div v-for="p in previews" :key="p.label">
			<p class="mb-2 text-[11px] font-medium tracking-[0.2em] text-sub">
				{{ p.label }}
			</p>
			<component :is="p.component" :color="color" />
		</div>
	</div>
</template>
