<script setup lang="ts">
defineProps<{ color: string }>();
</script>

<template>
	<div class="rounded-2xl border border-[#eff3f4] bg-white p-4 font-app text-[15px] text-[#0f1419]">
		<div class="flex gap-3">
			<span class="h-10 w-10 shrink-0 rounded-full" :style="{ backgroundColor: color }" />
			<div class="min-w-0 flex-1">
				<div class="flex items-center gap-1 whitespace-nowrap">
					<span class="truncate font-bold">ものくろ</span>
					<span class="truncate text-[#536471]">@monoicon</span>
					<span class="text-[#536471]">·</span>
					<span class="shrink-0 text-[#536471]">1分</span>
					<svg
						viewBox="0 0 24 24"
						class="ml-auto h-[18px] w-[18px] shrink-0 text-[#536471]"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
					>
						<path d="M5 12h.01" />
						<path d="M12 12h.01" />
						<path d="M19 12h.01" />
					</svg>
				</div>
				<p class="break-words">アイコンを新しくしました。</p>
				<div class="mt-3 flex max-w-md items-center justify-between text-[#536471]">
					<svg
						viewBox="0 0 24 24"
						class="h-[19px] w-[19px]"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M3 20l1.3 -3.9a9 8 0 1 1 3.4 2.9z" />
					</svg>
					<svg
						viewBox="0 0 24 24"
						class="h-[19px] w-[19px]"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M4 12v-3a3 3 0 0 1 3 -3h13" />
						<path d="M17 3l3 3l-3 3" />
						<path d="M20 12v3a3 3 0 0 1 -3 3h-13" />
						<path d="M7 21l-3 -3l3 -3" />
					</svg>
					<svg
						viewBox="0 0 24 24"
						class="h-[19px] w-[19px]"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
					</svg>
					<svg viewBox="0 0 24 24" class="h-[19px] w-[19px]" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
						<path d="M5 20v-7" />
						<path d="M12 20v-13" />
						<path d="M19 20v-9" />
					</svg>
					<span class="flex items-center gap-4">
						<svg
							viewBox="0 0 24 24"
							class="h-[19px] w-[19px]"
							fill="none"
							stroke="currentColor"
							stroke-width="1.8"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M6 4h12v17l-6 -4l-6 4z" />
						</svg>
						<svg
							viewBox="0 0 24 24"
							class="h-[19px] w-[19px]"
							fill="none"
							stroke="currentColor"
							stroke-width="1.8"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M4 13v6a1 1 0 0 0 1 1h14a1 1 0 0 0 1 -1v-6" />
							<path d="M12 3v13" />
							<path d="M8 7l4 -4l4 4" />
						</svg>
					</span>
				</div>
			</div>
		</div>
	</div>
</template>
