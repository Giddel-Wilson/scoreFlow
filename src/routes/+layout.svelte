<script lang="ts">
	import '../app.css';
	import type { LayoutData } from './$types';
	import { page } from '$app/stores';
	import { LogOut, User, BookOpen, FileText, Settings, Menu, X } from 'lucide-svelte';

	let { children, data }: { children: any; data: LayoutData } = $props();

	const user = $derived(data.user);
	const isAuthenticated = $derived(!!user);
	const isLoginPage = $derived($page.url.pathname === '/login');
	
	let mobileMenuOpen = $state(false);
</script>

<div class="min-h-screen bg-gray-50">
	{#if isAuthenticated && !isLoginPage}
		<nav class="bg-white shadow-sm border-b border-gray-200">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="flex justify-between h-16">
					<div class="flex items-center">
						<div class="flex-shrink-0 flex items-center">
							<BookOpen class="h-8 w-8 text-blue-600" />
							<span class="ml-2 text-xl font-semibold text-gray-900">ScoreFlow</span>
						</div>
						<!-- Desktop Navigation -->
						<div class="hidden md:ml-10 md:flex md:space-x-8">
							<a
								href="/dashboard"
								class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
								class:!border-blue-500={$page.url.pathname === '/dashboard'}
								class:!text-blue-600={$page.url.pathname === '/dashboard'}
							>
								Dashboard
							</a>
							{#if user?.role === 'LECTURER'}
								<a
									href="/lecturer/courses"
									class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
									class:!border-blue-500={$page.url.pathname.startsWith('/lecturer')}
									class:!text-blue-600={$page.url.pathname.startsWith('/lecturer')}
								>
									Courses
								</a>
							{/if}
							{#if user?.role === 'HOD'}
								<a
									href="/hod/department"
									class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
									class:!border-blue-500={$page.url.pathname.startsWith('/hod')}
									class:!text-blue-600={$page.url.pathname.startsWith('/hod')}
								>
									Department
								</a>
							{/if}
							{#if user?.role === 'ADMIN'}
								<a
									href="/admin/manage"
									class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
									class:!border-blue-500={$page.url.pathname.startsWith('/admin')}
									class:!text-blue-600={$page.url.pathname.startsWith('/admin')}
								>
									Admin
								</a>
							{/if}
						</div>
					</div>
					
					<!-- Desktop User Menu -->
					<div class="hidden md:flex md:items-center md:space-x-4">
						<div class="flex items-center text-sm text-gray-500">
							<User class="h-4 w-4 mr-2" />
							<span class="font-medium">{user?.name}</span>
							<span class="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs uppercase">
								{user?.role}
							</span>
						</div>
						<form method="POST" action="/logout">
							<button
								type="submit"
								class="flex items-center text-gray-500 hover:text-red-600 transition-colors"
								title="Logout"
							>
								<LogOut class="h-4 w-4" />
							</button>
						</form>
					</div>

					<!-- Mobile menu button -->
					<div class="md:hidden flex items-center space-x-2">
						<!-- Mobile user info - simplified -->
						<div class="flex items-center text-sm text-gray-500">
							<span class="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-xs uppercase">
								{user?.role === 'LECTURER' ? 'LECTURER' : user?.role === 'ADMIN' ? 'ADMIN' : user?.role === 'HOD' ? 'HOD' : user?.role}
							</span>
						</div>
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
						<a
							href="/dashboard"
							class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
							class:!text-blue-600={$page.url.pathname === '/dashboard'}
							class:!bg-blue-50={$page.url.pathname === '/dashboard'}
							onclick={() => mobileMenuOpen = false}
						>
							Dashboard
						</a>
						{#if user?.role === 'LECTURER'}
							<a
								href="/lecturer/courses"
								class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
								class:!text-blue-600={$page.url.pathname.startsWith('/lecturer')}
								class:!bg-blue-50={$page.url.pathname.startsWith('/lecturer')}
								onclick={() => mobileMenuOpen = false}
							>
								My Courses
							</a>
						{/if}
						{#if user?.role === 'HOD'}
							<a
								href="/hod/department"
								class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
								class:!text-blue-600={$page.url.pathname.startsWith('/hod')}
								class:!bg-blue-50={$page.url.pathname.startsWith('/hod')}
								onclick={() => mobileMenuOpen = false}
							>
								Department
							</a>
						{/if}
						{#if user?.role === 'ADMIN'}
							<a
								href="/admin/manage"
								class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
								class:!text-blue-600={$page.url.pathname.startsWith('/admin')}
								class:!bg-blue-50={$page.url.pathname.startsWith('/admin')}
								onclick={() => mobileMenuOpen = false}
							>
								Administration
							</a>
						{/if}
						<div class="border-t border-gray-200 pt-3">
							<form method="POST" action="/logout" class="px-3">
								<button
									type="submit"
									class="flex items-center w-full text-left py-2 text-base font-medium text-gray-700 hover:text-red-600 transition-colors"
								>
									<LogOut class="h-4 w-4 mr-2" />
									Logout
								</button>
							</form>
						</div>
					</div>
				</div>
			{/if}
		</nav>
	{/if}

	<main class="flex-1">
		{@render children()}
	</main>
</div>
