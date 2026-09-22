<script setup lang="ts">
defineProps<{ color: string }>();
</script>

<template>
	<article class="rounded-2xl border border-[#e8e8e8] bg-white p-5 font-misskey text-[#676767] sm:p-7">
		<div class="flex gap-3.5">
			<span class="h-[46px] w-[46px] shrink-0 rounded-full sm:h-[58px] sm:w-[58px]" :style="{ backgroundColor: color }" />
			<div class="min-w-0 flex-1">
				<header class="flex items-baseline gap-2 whitespace-nowrap">
					<span class="truncate font-bold">ものくろ</span>
					<span class="truncate text-[#9c9c9c]">@mono@misskey.example.com</span>
					<span class="ml-auto shrink-0 text-sm text-[#9c9c9c]">1分前</span>
				</header>
				<p class="mt-1 break-words">アイコンを新しくしました。</p>
				<footer class="mt-3 flex items-center gap-7 text-[#949494]">
					<Icon name="tabler:arrow-back-up" class="h-[18px] w-[18px]" />
					<Icon name="tabler:repeat" class="h-[18px] w-[18px]" />
					<Icon name="tabler:plus" class="h-[18px] w-[18px]" />
					<Icon name="tabler:dots" class="h-[18px] w-[18px]" />
				</footer>
			</div>
		</div>
	</article>
</template>
