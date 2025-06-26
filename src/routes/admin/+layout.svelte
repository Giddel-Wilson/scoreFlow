<script lang="ts">
	import { page } from '$app/stores';
	import { 
		Home, 
		Users, 
		BookOpen, 
		FileBarChart, 
		Settings, 
		LogOut,
		Building2,
		Menu,
		X
	} from 'lucide-svelte';

	let { children } = $props();

	const navigation = [
		{ name: 'Dashboard', href: '/admin', icon: Home },
		{ name: 'Users', href: '/admin/users', icon: Users },
		{ name: 'Courses', href: '/admin/courses', icon: BookOpen },
		{ name: 'Reports', href: '/admin/reports', icon: FileBarChart },
		{ name: 'System', href: '/admin/manage', icon: Settings }
	];

	let mobileMenuOpen = $state(false);

	function isActive(href: string) {
		if (href === '/admin') {
			return $page.url.pathname === '/admin';
		}
		return $page.url.pathname.startsWith(href);
	}
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Navigation -->
	<nav class="bg-white shadow-sm border-b border-gray-200">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between h-16">
				<div class="flex items-center">
					<span class="text-lg font-semibold text-gray-900 md:hidden">Admin Panel</span>
					<!-- Desktop Navigation -->
					<div class="hidden md:flex md:items-baseline md:space-x-4">
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
				
				<!-- Mobile menu button -->
				<div class="md:hidden">
					<button
						type="button"
						class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
						onclick={() => mobileMenuOpen = !mobileMenuOpen}
					>
						<span class="sr-only">Open main menu</span>
						{#if mobileMenuOpen}
							<X class="h-6 w-6" />
						{:else}
							<Menu class="h-6 w-6" />
						{/if}
					</button>
				</div>
			</div>
		</div>

		<!-- Mobile menu -->
		{#if mobileMenuOpen}
			<div class="md:hidden">
				<div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
					{#each navigation as item}
						<a
							href={item.href}
							class={`block px-3 py-2 rounded-md text-base font-medium flex items-center ${
								isActive(item.href)
									? 'bg-blue-100 text-blue-700'
									: 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
							}`}
							onclick={() => mobileMenuOpen = false}
						>
							<svelte:component this={item.icon} class="h-4 w-4 mr-2" />
							{item.name}
						</a>
					{/each}
				</div>
			</div>
		{/if}
	</nav>

	{@render children()}
</div>
