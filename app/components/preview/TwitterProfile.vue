<script setup lang="ts">
defineProps<{ color: string }>();
</script>

<template>
	<div class="overflow-clip rounded-2xl border border-[#eff3f4] bg-white font-app text-[15px] text-[#0f1419]">
		<div class="aspect-[3/1] bg-[#cfd9de]" />
		<div class="px-4 pb-1">
			<div class="flex items-start justify-between">
				<span
					class="-mt-12 h-24 w-24 rounded-full border-4 border-white sm:-mt-[62px] sm:h-[128px] sm:w-[128px]"
					:style="{ backgroundColor: color }"
				/>
				<button type="button" class="mt-3 rounded-full border border-[#cfd9de] px-4 py-1.5 font-bold">プロフィールを編集</button>
			</div>
			<div class="mt-2">
				<p class="text-xl font-bold leading-6">ものくろ</p>
				<p class="text-[#536471]">@monoicon</p>
			</div>
			<p class="mt-3">単色アイコンを使っています。</p>
			<div class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[#536471]">
				<span class="flex items-center gap-1">
					<svg
						viewBox="0 0 24 24"
						class="h-[18px] w-[18px]"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M9 15l6 -6" />
						<path d="M11 6l.5 -.5a3.5 3.5 0 0 1 5 5l-.5 .5" />
						<path d="M13 18l-.5 .5a3.5 3.5 0 0 1 -5 -5l.5 -.5" />
					</svg>
					<span class="text-[#1d9bf0]">example.com</span>
				</span>
				<span class="flex items-center gap-1">
					<svg
						viewBox="0 0 24 24"
						class="h-[18px] w-[18px]"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<rect x="4" y="5" width="16" height="16" rx="2" />
						<path d="M16 3v4" />
						<path d="M8 3v4" />
						<path d="M4 11h16" />
					</svg>
					yyyy年mm月からTwitterを利用しています
				</span>
			</div>
			<div class="mt-3 flex gap-5 text-sm">
				<span><b class="text-[#0f1419]">96</b> <span class="text-[#536471]">フォロー中</span></span>
				<span><b class="text-[#0f1419]">154</b> <span class="text-[#536471]">フォロワー</span></span>
			</div>
		</div>
		<div class="mt-2 flex border-b border-[#eff3f4] text-[#536471]">
			<span class="relative flex h-[53px] flex-1 items-center justify-center font-bold text-[#0f1419]">
				ポスト
				<span class="absolute bottom-0 h-1 w-14 rounded-full bg-[#1d9bf0]" />
			</span>
			<span class="flex h-[53px] flex-1 items-center justify-center">返信</span>
			<span class="flex h-[53px] flex-1 items-center justify-center">リポスト</span>
			<span class="flex h-[53px] flex-1 items-center justify-center">メディア</span>
		</div>
	</div>
</template>
