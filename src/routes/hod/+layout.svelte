<script lang="ts">
	import { page } from '$app/stores';
	import { Home, FileBarChart, LogOut } from 'lucide-svelte';

	let { children } = $props();

	const navigation = [
		{ name: 'Dashboard', href: '/hod', icon: Home },
		{ name: 'Reports', href: '/hod/reports', icon: FileBarChart }
	];

	function isActive(href: string) {
		return $page.url.pathname === href;
	}
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Navigation -->
	<nav class="bg-white shadow-sm border-b border-gray-200">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between h-16">
				<div class="flex items-center">
					<div class="flex-shrink-0">
						<h1 class="text-xl font-bold text-gray-900">ScoreFlow</h1>
						<p class="text-sm text-gray-500">Head of Department</p>
					</div>
					<div class="ml-10 flex items-baseline space-x-4">
						{#each navigation as item}
							<a
								href={item.href}
								class={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
									isActive(item.href)
										? 'bg-blue-100 text-blue-700'
										: 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
								}`}
							>
								<svelte:component this={item.icon} class="h-4 w-4 mr-2" />
								{item.name}
							</a>
						{/each}
					</div>
				</div>
				<div class="flex items-center">
					<form action="/logout" method="post">
						<button
							type="submit"
							class="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium flex items-center"
						>
							<LogOut class="h-4 w-4 mr-2" />
							Logout
						</button>
					</form>
				</div>
			</div>
		</div>
	</nav>

	{@render children()}
</div>
