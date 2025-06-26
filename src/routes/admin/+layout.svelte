<script lang="ts">
	import { page } from '$app/stores';
	import { 
		Home, 
		Users, 
		BookOpen, 
		FileBarChart, 
		Settings, 
		LogOut,
		Building2
	} from 'lucide-svelte';

	let { children } = $props();

	const navigation = [
		{ name: 'Dashboard', href: '/admin', icon: Home },
		{ name: 'Users', href: '/admin/users', icon: Users },
		{ name: 'Courses', href: '/admin/courses', icon: BookOpen },
		{ name: 'Reports', href: '/admin/reports', icon: FileBarChart },
		{ name: 'System', href: '/admin/manage', icon: Settings }
	];

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
					<div class="flex items-baseline space-x-4">
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
			</div>
		</div>
	</nav>

	{@render children()}
</div>
