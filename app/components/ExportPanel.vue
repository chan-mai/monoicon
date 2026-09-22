<script setup lang="ts">
import { Listbox, ListboxButton, ListboxOption, ListboxOptions, RadioGroup, RadioGroupLabel, RadioGroupOption } from '@headlessui/vue';

const { color } = useIcon();
const { formatId, sizeChoice, customSizeInput, currentFormat, sizeError, fileLabel } = useExport();
</script>

<template>
	<div class="space-y-8">
		<div>
			<p class="text-[11px] font-medium tracking-[0.2em] text-sub">FORMAT</p>
			<Listbox v-model="formatId">
				<div class="relative mt-3">
					<ListboxButton
						class="flex w-full items-center justify-between rounded-2xl border border-line bg-white px-5 py-3.5 text-sm font-medium focus:outline-none"
					>
						<span class="flex items-center gap-2">
							{{ currentFormat.label }}
							<span v-if="currentFormat.deprecated" class="rounded-full bg-ink/5 px-2 py-0.5 text-[10px] font-medium text-sub">非推奨</span>
						</span>
						<Icon name="lucide:chevron-down" class="h-4 w-4 text-sub" />
					</ListboxButton>
					<ListboxOptions class="absolute z-10 mt-2 w-full rounded-2xl border border-line bg-white p-1.5 focus:outline-none">
						<ListboxOption v-for="f in FORMATS" :key="f.id" v-slot="{ active, selected }" :value="f.id" as="template">
							<li
								class="flex cursor-pointer items-center justify-between rounded-xl px-4 py-2.5 text-sm"
								:class="[active ? 'bg-paper' : '', selected ? 'font-semibold text-ink' : 'text-sub']"
							>
								<span class="flex items-center gap-2">
									{{ f.label }}
									<span v-if="f.deprecated" class="rounded-full bg-ink/5 px-2 py-0.5 text-[10px] font-medium text-sub">非推奨</span>
								</span>
								<Icon v-if="selected" name="lucide:check" class="h-4 w-4" />
							</li>
						</ListboxOption>
					</ListboxOptions>
				</div>
			</Listbox>
		</div>

		<div>
			<RadioGroup v-model="sizeChoice">
				<RadioGroupLabel class="text-[11px] font-medium tracking-[0.2em] text-sub"> SIZE </RadioGroupLabel>
				<div class="mt-3 flex flex-wrap gap-2">
					<RadioGroupOption v-for="s in SIZE_PRESETS" :key="s" v-slot="{ checked }" :value="s" class="cursor-pointer focus:outline-none">
						<span
							class="inline-block rounded-full border px-4 py-2 text-sm font-medium transition-colors"
							:class="checked ? 'border-ink bg-ink text-white' : 'border-line bg-white text-sub hover:text-ink'"
						>
							{{ s }}
						</span>
					</RadioGroupOption>
					<RadioGroupOption v-slot="{ checked }" value="custom" class="cursor-pointer focus:outline-none">
						<span
							class="inline-block rounded-full border px-4 py-2 text-sm font-medium transition-colors"
							:class="checked ? 'border-ink bg-ink text-white' : 'border-line bg-white text-sub hover:text-ink'"
						>
							カスタム
						</span>
					</RadioGroupOption>
				</div>
			</RadioGroup>
			<div v-if="sizeChoice === 'custom'" class="mt-3 flex items-center gap-2">
				<input
					v-model="customSizeInput"
					type="number"
					min="16"
					max="2048"
					placeholder="512"
					class="w-36 rounded-2xl border border-line bg-white px-4 py-3 text-sm focus:border-ink/30 focus:outline-none"
					aria-label="Custom size"
				/>
				<span class="text-sm text-sub">px</span>
			</div>
			<p v-if="sizeError" class="mt-2 text-xs text-[#c0442e]">
				{{ sizeError }}
			</p>
		</div>

		<div class="flex items-center gap-3 rounded-2xl border border-line bg-white p-5">
			<span class="h-12 w-12 shrink-0 rounded-xl border border-line" :style="{ backgroundColor: color }" />
			<div class="min-w-0">
				<p class="text-[11px] font-medium tracking-[0.2em] text-sub">FILE</p>
				<p class="truncate text-sm">{{ fileLabel }}</p>
			</div>
		</div>
	</div>
</template>
