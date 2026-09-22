<template>
	<div class="relative flex min-h-screen flex-col overflow-x-clip">
		<AppHeader />
		<div class="flex-1">
			<slot />
		</div>
		<AppFooter />
	</div>
</template>
