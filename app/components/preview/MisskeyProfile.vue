<script setup lang="ts">
defineProps<{ color: string }>();
</script>

<template>
	<div class="overflow-clip rounded-2xl border border-[#e8e8e8] bg-white font-misskey text-[#676767]">
		<div class="relative">
			<div class="relative h-[130px] bg-[#4c5e6d] sm:h-[150px]">
				<div class="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent" />
				<button type="button" class="absolute right-3 top-3 rounded-full border-none bg-[#86b300] px-4 py-1.5 text-sm text-white">
					フォロー
				</button>
				<div class="absolute bottom-0 left-0 w-full pb-2 pl-[108px] text-white sm:pl-[128px]">
					<p class="text-xl font-bold drop-shadow-[0_0_4px_rgba(0,0,0,0.9)] sm:text-2xl">ものくろ</p>
					<p class="text-sm font-bold opacity-80 drop-shadow-[0_0_4px_rgba(0,0,0,0.9)]">@mono@misskey.example.com</p>
				</div>
			</div>
			<span
				class="absolute left-4 top-[72px] z-[1] h-[76px] w-[76px] rounded-full shadow-[1px_1px_3px_rgba(0,0,0,0.2)] sm:top-[86px] sm:h-[88px] sm:w-[88px]"
				:style="{ backgroundColor: color }"
			/>
			<div class="py-5 pl-[108px] pr-6 text-[15px] sm:pl-[128px]">
				<p>単色アイコンを使っています。</p>
			</div>
			<div class="border-t border-[#e8e8e8] px-6 py-4 text-sm">
				<dl class="flex items-center">
					<dt class="w-[30%] truncate text-center font-bold">Website</dt>
					<dd class="w-[70%] truncate text-[#44a4c1]">https://example.com</dd>
				</dl>
			</div>
			<div class="flex border-t border-[#e8e8e8] px-6 py-4">
				<div class="flex-1 text-center">
					<b class="block leading-4">210</b>
					<span class="text-[70%]">ノート</span>
				</div>
				<div class="flex-1 text-center">
					<b class="block leading-4">96</b>
					<span class="text-[70%]">フォロー中</span>
				</div>
				<div class="flex-1 text-center">
					<b class="block leading-4">154</b>
					<span class="text-[70%]">フォロワー</span>
				</div>
			</div>
		</div>
	</div>
</template>
