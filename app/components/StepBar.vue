<script setup lang="ts">
defineProps<{ modelValue: number; steps: { label: string }[] }>();
const emit = defineEmits<{ 'update:modelValue': [number] }>();
</script>

<template>
	<ol class="flex items-center gap-2 sm:gap-3">
		<template v-for="(s, i) in steps" :key="s.label">
			<li>
				<button
					type="button"
					class="group flex items-center gap-2 border-none focus:outline-none sm:gap-3"
					@click="emit('update:modelValue', i)"
				>
					<span
						class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors sm:h-9 sm:w-9 sm:text-sm"
						:class="
							i < modelValue
								? 'bg-ink text-white'
								: i === modelValue
									? 'bg-ink text-white'
									: 'border border-line bg-white text-sub group-hover:text-ink'
						"
					>
						<Icon v-if="i < modelValue" name="lucide:check" class="h-4 w-4" />
						<template v-else>{{ i + 1 }}</template>
					</span>
					<span class="text-left">
						<span class="block whitespace-nowrap font-display text-[9px] tracking-[0.15em] text-sub sm:text-[10px] sm:tracking-[0.2em]">
							STEP 0{{ i + 1 }}
						</span>
						<span
							class="block whitespace-nowrap text-xs font-medium transition-colors sm:text-sm"
							:class="i === modelValue ? 'text-ink' : 'text-sub group-hover:text-ink'"
						>
							{{ s.label }}
						</span>
					</span>
				</button>
			</li>
			<li v-if="i < steps.length - 1" class="relative h-px min-w-3 flex-1 overflow-hidden rounded-full bg-line" aria-hidden="true">
				<span
					class="absolute inset-0 origin-left bg-ink transition-transform duration-500 ease-out"
					:style="{ transform: `scaleX(${i < modelValue ? 1 : 0})` }"
				/>
			</li>
		</template>
	</ol>
</template>
